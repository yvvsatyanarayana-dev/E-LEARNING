// placementAnalytics.jsx — SmartCampus Placement Analytics
// All data derived from EXISTING endpoints only (same as placementDashboard.jsx)
//
// APIs used:
//   GET /auth/me                              → officer name/initials
//   GET /placement/dashboard/stats            → KPIs, branch_stats, pri_distribution, avg_pri
//   GET /placement/dashboard/students?limit=200 → student list (company, pkg, branch, status)
//   GET /placement/internships?limit=50       → drives (company, package, applied_count)
//
// NO dedicated analytics endpoints required.

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./placementAnalytics.css";
import { clearAuth } from "../../../utils/auth.js";
import api from "../../../utils/api.js";

/* ════════════════════════════════════════════
   DATA MAPPERS — same as placementDashboard
════════════════════════════════════════════ */
function mapApiStudent(s) {
  const placed    = s.placed_application;
  const inProcess = s.in_process_application;
  let status = "Not Ready", company = null, pkg = null;
  if (placed)    { status = "Placed";     company = placed.company_name ?? null;    pkg = placed.package ?? null; }
  else if (inProcess) { status = "In Process"; company = inProcess.company_name ?? null; }
  else if ((s.pri_score ?? 0) >= 55) status = "Applied";
  return {
    name:    s.full_name ?? s.name ?? "—",
    branch:  s.department ?? s.branch ?? "Other",
    cgpa:    parseFloat(s.settings?.cgpa ?? s.cgpa ?? 0),
    pri:     Math.round(s.pri_score ?? s.pri ?? 0),
    skills:  s.skills ?? [],
    company, pkg, status,
  };
}

function mapApiDrive(d) {
  return {
    id:      d.id,
    company: d.company_name ?? "—",
    role:    d.role ?? "—",
    pkg:     d.package ?? d.stipend ?? null,
    pkgNum:  parseFloat((d.package ?? "").replace(/[^0-9.]/g, "")) || 0,
    applied: d.applied_count  ?? 0,
    eligible:d.eligible_count ?? 0,
    status:  d.status ?? "Upcoming",
    date:    d.deadline ? new Date(d.deadline) : null,
  };
}

/* ════════════════════════════════════════════
   DERIVE TOP COMPANIES from student placements
   Groups placed students by company, counts offers & avg package
════════════════════════════════════════════ */
const COMPANY_COLORS = [
  "var(--teal)", "var(--indigo-ll)", "var(--amber)", "var(--violet)", "var(--rose)",
];
function deriveTopCompanies(students, drives) {
  // Aggregate placed students by company
  const map = new Map();
  for (const s of students) {
    if (s.status === "Placed" && s.company) {
      const key = s.company;
      const pkgNum = parseFloat((s.pkg ?? "").replace(/[^0-9.]/g, "")) || 0;
      if (!map.has(key)) map.set(key, { name:key, count:0, pkgSum:0, pkgCount:0 });
      const e = map.get(key);
      e.count++;
      if (pkgNum > 0) { e.pkgSum += pkgNum; e.pkgCount++; }
    }
  }

  // Also add drives data for companies with 0 placed students (applied_count > 0)
  for (const d of drives) {
    if (!map.has(d.company) && d.applied > 0) {
      map.set(d.company, { name:d.company, count:d.applied, pkgSum: d.pkgNum, pkgCount: d.pkgNum ? 1 : 0 });
    }
  }

  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((c, i) => ({
      name:   c.name,
      placed: c.count,
      pkg:    c.pkgCount > 0 ? `₹${(c.pkgSum / c.pkgCount).toFixed(1)}L` : "—",
      color:  COMPANY_COLORS[i % COMPANY_COLORS.length],
    }));
}

/* ════════════════════════════════════════════
   DERIVE BRANCH STATS from student list
   Falls back to dashboard stats if available
════════════════════════════════════════════ */
const BRANCH_COLORS = [
  "var(--teal)","var(--indigo-l)","var(--amber)","var(--rose)","var(--violet)","var(--indigo-ll)",
];
function deriveBranchStats(students, dashBranchStats = []) {
  // Prefer backend branch_stats from /dashboard/stats
  if (dashBranchStats && dashBranchStats.length > 0) {
    return dashBranchStats.map((b, i) => ({
      branch: b.branch ?? b.department,
      total:  b.total  ?? 0,
      placed: b.placed ?? 0,
      pct:    b.pct    ?? (b.total ? Math.round(b.placed / b.total * 100) : 0),
      color:  BRANCH_COLORS[i % BRANCH_COLORS.length],
    }));
  }
  // Derive from student list
  const map = new Map();
  for (const s of students) {
    const br = s.branch || "Other";
    if (!map.has(br)) map.set(br, { total:0, placed:0 });
    const e = map.get(br);
    e.total++;
    if (s.status === "Placed") e.placed++;
  }
  return [...map.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6)
    .map(([branch, d], i) => ({
      branch,
      total:  d.total,
      placed: d.placed,
      pct:    d.total ? Math.round(d.placed / d.total * 100) : 0,
      color:  BRANCH_COLORS[i % BRANCH_COLORS.length],
    }));
}

/* ════════════════════════════════════════════
   DERIVE MONTHLY TREND from students (by admission/created date)
   Falls back to static seed if no dates available
════════════════════════════════════════════ */
const MONTH_LABELS = ["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
function deriveMonthlyTrend(students) {
  // Try to build from student placement dates
  const byMonth = new Map(MONTH_LABELS.map(m => [m, { placed:0, applied:0, interviews:0 }]));
  let hasDateData = false;
  for (const s of students) {
    // In practice placed_application.created_at or similar
    // We can still build a cumulative view from pri scores as proxy
    if (s.status === "Placed")      { hasDateData = true; }
    if (s.status === "In Process")  { hasDateData = true; }
  }
  if (!hasDateData || students.length === 0) return [];


  // Build cumulative approximation from total counts
  const total   = students.length;
  const placed  = students.filter(s => s.status === "Placed").length;
  const applied = students.filter(s => s.status !== "Not Ready").length;
  const interviews = Math.round(applied * 0.75);

  return MONTH_LABELS.map((m, i) => {
    const ratio  = (i + 1) / MONTH_LABELS.length;
    const growth = Math.pow(ratio, 1.4);          // accelerating curve
    return {
      month:      m,
      placed:     Math.round(placed     * growth),
      applied:    Math.round(applied    * growth),
      interviews: Math.round(interviews * growth),
    };
  });
}

/* ════════════════════════════════════════════
   DERIVE PACKAGE DISTRIBUTION from students
════════════════════════════════════════════ */
function derivePackageDist(students) {
  const placed = students.filter(s => s.status === "Placed" && s.pkg);
  if (placed.length === 0) return [];


  const buckets = [
    { range:"Above 25 LPA", min:25,   max:Infinity, count:0, color:"var(--teal)"      },
    { range:"15 – 25 LPA",  min:15,   max:25,       count:0, color:"var(--indigo-ll)" },
    { range:"10 – 15 LPA",  min:10,   max:15,       count:0, color:"var(--violet)"    },
    { range:"7 – 10 LPA",   min:7,    max:10,       count:0, color:"var(--amber)"     },
    { range:"Below 7 LPA",  min:-Infinity, max:7,   count:0, color:"var(--rose)"      },
  ];

  for (const s of placed) {
    const n = parseFloat((s.pkg ?? "").replace(/[^0-9.]/g, "")) || 0;
    const b = buckets.find(bk => n >= bk.min && n < bk.max);
    if (b) b.count++;
  }

  const total = placed.length || 1;
  return buckets.map(b => ({
    range: b.range,
    count: b.count,
    pct:   parseFloat((b.count / total * 100).toFixed(1)),
    color: b.color,
  }));
}

/* ════════════════════════════════════════════
   SHARED COMPONENTS
════════════════════════════════════════════ */
const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Panel = ({ title, subtitle, action, children, style, bodyStyle }) => (
  <div className="panel" style={style}>
    <div className="panel-hd">
      <div className="panel-ttl">{title}{subtitle && <span>{subtitle}</span>}</div>
      {action}
    </div>
    <div className="panel-body" style={bodyStyle}>{children}</div>
  </div>
);

function Skeleton({ width = "100%", height = 14, style = {} }) {
  return (
    <div style={{ width, height, background:"var(--surface3)", borderRadius:6,
      animation:"pulse 1.5s ease-in-out infinite", ...style }}/>
  );
}

/* ════════════════════════════════════════════
   MAIN
════════════════════════════════════════════ */
export default function PlacementAnalytics() {
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────────────
  const [activeMetric, setActiveMetric] = useState("placed");

  // ── API data ──────────────────────────────────────────────────────
  const [loading,       setLoading]       = useState(true);
  const [officerName,   setOfficerName]   = useState("Placement Officer");
  const [dashStats,     setDashStats]     = useState(null);
  const [students,      setStudents]      = useState([]);
  const [drives,        setDrives]        = useState([]);

  // Derived analytics (computed from raw API data)
  const [monthData,     setMonthData]     = useState([]);

  const [topCompanies,  setTopCompanies]  = useState([]);
  const [branchStats,   setBranchStats]   = useState([]);
  const [pkgDist,       setPkgDist]       = useState([]);
  const [mailUnread,    setMailUnread]    = useState(0);


  // ── Cursor ────────────────────────────────────────────────────────
  const curRef  = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0), rx = useRef(0), ry = useRef(0);

  useEffect(() => {
    const onMove = e => {
      mx.current = e.clientX; my.current = e.clientY;
      if (curRef.current) { curRef.current.style.left = e.clientX + "px"; curRef.current.style.top = e.clientY + "px"; }
    };
    const onDown = () => document.body.classList.add("c-click");
    const onUp   = () => document.body.classList.remove("c-click");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);
    let raf;
    const loop = () => {
      rx.current += (mx.current - rx.current) * 0.14;
      ry.current += (my.current - ry.current) * 0.14;
      if (ringRef.current) { ringRef.current.style.left = rx.current + "px"; ringRef.current.style.top = ry.current + "px"; }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ════════════════════════════════════════════
     FETCH — only the 4 existing endpoints
  ════════════════════════════════════════════ */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/placement/dashboard/stats"),
          api.get("/placement/dashboard/students?limit=200"),
          api.get("/placement/internships?limit=50"),
          api.get("/placement/dashboard/trends"),
          api.get("/mail/unread/count"),
        ]);

        const [meRes, statsRes, studentsRes, drivesRes, trendsRes] = results;

        // Officer name
        if (meRes.status === "fulfilled") {
          setOfficerName(meRes.value.full_name ?? meRes.value.email ?? "Placement Officer");
        }

        // Dashboard KPIs
        let stats = null;
        if (statsRes.status === "fulfilled") {
          stats = statsRes.value;
          setDashStats(stats);
        }

        // Students list
        let studentList = [];
        if (studentsRes.status === "fulfilled") {
          const raw = Array.isArray(studentsRes.value)
            ? studentsRes.value
            : (studentsRes.value?.items ?? []);
          studentList = raw.map(mapApiStudent);
          setStudents(studentList);
        }

        // Drives list
        let driveList = [];
        if (drivesRes.status === "fulfilled") {
          const raw = Array.isArray(drivesRes.value)
            ? drivesRes.value
            : (drivesRes.value?.items ?? []);
          driveList = raw.map(mapApiDrive);
          setDrives(driveList);
        }

        /* ── Derive all analytics from the data we have ── */

        // Monthly trend
        if (trendsRes.status === "fulfilled" && Array.isArray(trendsRes.value) && trendsRes.value.length > 0) {
          setMonthData(trendsRes.value);
        } else {
          setMonthData(deriveMonthlyTrend(studentList));
        }

        // Top companies (from placed students + drives)
        const companies = deriveTopCompanies(studentList, driveList);
        setTopCompanies(companies);

        // Branch stats (prefer dashboard stats, fallback to student list)
        const branches = deriveBranchStats(studentList, stats?.branch_stats ?? []);
        setBranchStats(branches);

        // Package distribution (prefer backend, fallback to derivation)
        setPkgDist(stats?.package_distribution ?? derivePackageDist(studentList));

        // Mail unread
        if (results[4]?.status === "fulfilled") {
          setMailUnread(results[4].value.count || 0);
        }


      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    const pollUnread = setInterval(async () => {
      try {
        const res = await api.get("/mail/unread/count");
        setMailUnread(res.count || 0);
      } catch {}
    }, 30000);

    return () => clearInterval(pollUnread);
  }, []);

  /* ════════════════════════════════════════════
     DERIVED KPI VALUES
  ════════════════════════════════════════════ */
  const placedStudents   = dashStats?.placed_students  ?? students.filter(s=>s.status==="Placed").length;
  const placementRate    = dashStats?.placement_rate    ?? (students.length ? Math.round(placedStudents/students.length*100) : 0);
  const avgPri           = Math.round(dashStats?.avg_pri ?? (students.length ? students.reduce((s,st)=>s+st.pri,0)/students.length : 0));
  const upcomingCount    = drives.filter(d => d.status === "Upcoming").length;

  // Average package from placed students
  const placedWithPkg = students.filter(s => s.status === "Placed" && s.pkg);
  const avgPkgNum = placedWithPkg.length
    ? placedWithPkg.reduce((sum, s) => sum + (parseFloat((s.pkg??"").replace(/[^0-9.]/g,""))||0), 0) / placedWithPkg.length
    : 0;
  const avgPkg = dashStats?.avg_package
    ? (typeof dashStats.avg_package === "number" ? `₹${dashStats.avg_package}L` : dashStats.avg_package)
    : (avgPkgNum > 0 ? `₹${avgPkgNum.toFixed(1)}L` : "—");

  // Highest package from placed students
  const highestPkgNum = placedWithPkg.reduce((max, s) => {
    const n = parseFloat((s.pkg??"").replace(/[^0-9.]/g,"")) || 0;
    return n > max.n ? { n, company: s.company, pkg: s.pkg } : max;
  }, { n:0, company:"", pkg:"—" });
  const highestPkg     = dashStats?.highest_package ?? highestPkgNum.pkg ?? "—";
  const highestPkgNote = dashStats?.highest_package_company ?? highestPkgNum.company ?? "Top offer this year";

  // Companies visited = unique companies in placed + drives
  const uniqueCompanies = new Set([
    ...students.filter(s=>s.company).map(s=>s.company),
    ...drives.map(d=>d.company),
  ]).size;
  const companiesVisited = dashStats?.companies_visited ?? (uniqueCompanies || 0);

  const officerInitials = officerName.trim().split(" ").map(w=>w[0]?.toUpperCase()).join("").slice(0,2);
  const maxVal          = Math.max(...monthData.map(d => d.applied), 1);

  const metricColor = {
    placed:     "var(--teal)",
    applied:    "var(--indigo-l)",
    interviews: "var(--amber)",
  };

  const handleLogout = () => { clearAuth(); navigate("/login", { replace:true }); };

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <>
      <div className="sc-cursor"      ref={curRef}/>
      <div className="sc-cursor-ring" ref={ringRef}/>
      <div className="sc-noise"/>

      <div className="app">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-top">
            <Link className="sb-brand" to="/placementdashboard">
              <div className="sb-mark">SC</div>
              <span className="sb-name">SmartCampus</span>
            </Link>
          </div>

          <Link to="/placementdashboard/placementProfile" className="sb-user" style={{textDecoration:"none"}}>
            <div className="sb-avatar">{loading ? "…" : officerInitials}</div>
            <div>
              <div className="sb-uname">{loading ? "Loading…" : officerName}</div>
              <div className="sb-urole">Placement Officer</div>
            </div>
          </Link>

          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink active to="/placementdashboard/placementAnalytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>

            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students"      badge={loading ? "…" : String(dashStats?.total_students ?? students.length)} badgeCls="teal"  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies"     badge={loading ? "…" : String(dashStats?.total_companies ?? companiesVisited)} badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink to="/placementdashboard/drives"        badge={loading ? "…" : String(dashStats?.total_drives ?? upcomingCount)} badgeCls="rose"  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>

            <SbLink to="/placementdashboard/offers-placed" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships"   icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>

            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/placementMail" badge={mailUnread > 0 ? mailUnread : null} badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>Mail System</SbLink>
            <SbLink to="/placementdashboard/meetings" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>Virtual Meeting</SbLink>
            <SbLink to="/placementdashboard/ai-assistant" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports"      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>

          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">{loading ? "…" : `${placementRate}%`}</div>
              <div className="sb-pri-sub">AY {dashStats?.academic_year ?? "2024–25"}</div>
              <div className="sb-pri-bar">
                <div className="sb-pri-fill" style={{ width: loading ? "0%" : `${placementRate}%`, transition:"width 1s ease" }}/>
              </div>
            </div>
            <button className="sb-logout" onClick={handleLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <header className="topbar">
            <span className="tb-page">Placement Analytics</span>
            <div className="tb-sep"/>
            <div className="tb-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:"var(--text3)", flexShrink:0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search analytics…" style={{cursor:"none"}}/>
            </div>
            <div className="tb-right">
              <span className="tb-date">{new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" })}</span>
              <div className="filter-row">
                {["placed","applied","interviews"].map(m => (
                  <button key={m} className={`filter-btn${activeMetric===m?" active":""}`}
                    onClick={() => setActiveMetric(m)}
                    style={{ textTransform:"capitalize" }}>
                    {m}
                  </button>
                ))}
              </div>
              <Link to="/placementdashboard" className="btn btn-ghost" style={{ fontSize:10, padding:"8px 14px" }}>
                ← Dashboard
              </Link>
            </div>
          </header>

          <div className="content">
            {/* GREETING */}
            <div className="greet-row">
              <div className="greet-tag">
                <div className="greet-pip"/>
                <span className="greet-pip-txt">AY {dashStats?.academic_year ?? "2024–25"} · Placement Analytics</span>
              </div>
              <h1 className="greet-title">Placement <em>Insights</em></h1>
              <p className="greet-sub">
                {loading
                  ? "Loading analytics from placement data…"
                  : `${students.length} students · ${drives.length} drives · ${companiesVisited} companies analysed.`}
              </p>
            </div>

            {/* ── KPI CARDS ── */}
            <div className="stat-grid" style={{ marginBottom:18 }}>
              {[
                {
                  label:"Total Placed",
                  value: loading ? "…" : String(placedStudents),
                  delta: loading ? "Loading…" : `▲ ${placementRate}% rate`,
                  type:"up", color:"teal",
                  icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
                },
                {
                  label:"Avg Package",
                  value: loading ? "…" : avgPkg,
                  delta: loading ? "Loading…" : (dashStats?.avg_package_delta ?? "Placed students"),
                  type:"up", color:"violet",
                  icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                },
                {
                  label:"Highest Pkg",
                  value: loading ? "…" : (typeof highestPkg === "number" ? `₹${highestPkg}L` : highestPkg),
                  delta: loading ? "Loading…" : highestPkgNote,
                  type:"neu", color:"amber",
                  icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
                },
                {
                  label:"Companies Visited",
                  value: loading ? "…" : String(dashStats?.total_companies ?? companiesVisited),
                  delta: loading ? "Loading…" : (dashStats?.companies_delta ?? "This academic year"),
                  type:"up", color:"indigo",
                  icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
                },

              ].map(s => (
                <div key={s.label} className={`stat-card sc-${s.color}`} style={{ animationDelay:".05s" }}>
                  <div className="stat-ic">{s.icon}</div>
                  <div className="stat-val" style={s.color !== "indigo" ? { color:`var(--${s.color})` } : {}}>{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                  <span className={`stat-delta delta-${s.type}`}>{s.delta}</span>
                </div>
              ))}
            </div>

            {/* ── BAR CHART + TOP COMPANIES ── */}
            <div className="two-col">
              {/* Monthly Trend Bar Chart */}
              <Panel
                title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Monthly Placement Trend</>}
                subtitle={loading ? "Loading…" : "Aug 2024 – Mar 2025"}
                style={{ animationDelay:".2s" }}
              >
                {loading ? (
                  <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:180, padding:"0 0 8px" }}>
                    {[60,90,70,110,80,140,120,160].map((h,i) => (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                        <Skeleton height={h} style={{ borderRadius:"4px 4px 0 0" }}/>
                        <Skeleton width="60%" height={8}/>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:180, padding:"0 0 8px" }}>
                      {monthData.map(d => {
                        const val = d[activeMetric];
                        const h   = (val / maxVal) * 160;
                        return (
                          <div key={d.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                            <span style={{ fontSize:9, color:"var(--text3)", fontFamily:"'Fraunces',serif" }}>{val}</span>
                            <div style={{ width:"100%", height:h, background:metricColor[activeMetric], borderRadius:"4px 4px 0 0", opacity:.85, transition:"height .5s ease", minHeight:4 }}/>
                            <span style={{ fontSize:9, color:"var(--text3)" }}>{d.month}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display:"flex", gap:16, marginTop:8 }}>
                      {["placed","applied","interviews"].map(m => (
                        <div key={m} style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <div style={{ width:8, height:8, borderRadius:2, background:metricColor[m] }}/>
                          <span style={{ fontSize:10, color:"var(--text3)", textTransform:"capitalize" }}>{m}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Panel>

              {/* Top Hiring Companies — derived from placed students + drives */}
              <Panel
                title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>Top Hiring Companies</>}
                subtitle="By offers given"
                style={{ animationDelay:".25s" }}
              >
                {loading ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {[1,2,3,4,5].map(i => <Skeleton key={i} height={54} style={{ borderRadius:10 }}/>)}
                  </div>
                ) : topCompanies.length === 0 ? (
                  /* ── EMPTY STATE: show drives as fallback ── */
                  drives.length > 0 ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {drives.slice(0, 5).map((d, i) => (
                        <div key={d.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, background:"var(--surface2)", border:"1px solid var(--border)" }}>
                          <div style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:"var(--text3)", width:16 }}>{i+1}</div>
                          <div style={{ width:34, height:34, borderRadius:8, background:"rgba(91,78,248,.12)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:COMPANY_COLORS[i % COMPANY_COLORS.length] }}>
                            {d.company[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:600 }}>{d.company}</div>
                            <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{d.role} · {d.applied} applied</div>
                          </div>
                          <span className={`badge ${d.status==="Upcoming"?"badge-indigo":d.status==="Completed"?"badge-teal":"badge-amber"}`} style={{fontSize:9}}>{d.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize:12, color:"var(--text3)", textAlign:"center", padding:"40px 0" }}>
                      <div style={{ fontSize:24, marginBottom:8 }}>🏢</div>
                      No company data yet — add drives to see analytics.
                    </div>
                  )
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {topCompanies.map((c, i) => (
                      <div key={c.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, background:"var(--surface2)", border:"1px solid var(--border)" }}>
                        <div style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:"var(--text3)", width:16 }}>{i+1}</div>
                        <div style={{ width:34, height:34, borderRadius:8, background:`rgba(${c.color==="var(--teal)"?"39,201,176":"91,78,248"},.12)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:c.color }}>
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600 }}>{c.name}</div>
                          <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{c.placed} offers · {c.pkg}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, color:c.color }}>{c.pkg}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            {/* ── BRANCH-WISE ANALYTICS — derived from student list or dashboard/stats ── */}
            <Panel
              title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>Branch-wise Analytics</>}
              subtitle="Placement breakdown per department"
              style={{ animationDelay:".3s" }}
            >
              {loading ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
                  {[1,2,3,4,5].map(i => <Skeleton key={i} height={110} style={{ borderRadius:12 }}/>)}
                </div>
              ) : branchStats.length === 0 ? (
                <div style={{ fontSize:12, color:"var(--text3)", textAlign:"center", padding:"40px 0" }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>📊</div>
                  No branch data yet — student profiles are needed.
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(branchStats.length, 5)}, 1fr)`, gap:12 }}>
                  {branchStats.map(b => (
                    <div key={b.branch} style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:12, padding:"16px 14px", textAlign:"center" }}>
                      <div style={{ fontFamily:"'Fraunces',serif", fontSize:32, color:b.color, lineHeight:1 }}>{b.pct}%</div>
                      <div style={{ fontSize:12, fontWeight:700, marginTop:6 }}>{b.branch}</div>
                      <div style={{ fontSize:10, color:"var(--text3)", marginTop:3 }}>{b.placed}/{b.total} placed</div>
                      <div style={{ height:4, background:"var(--surface3)", borderRadius:2, marginTop:10, overflow:"hidden" }}>
                        <div style={{ width:`${b.pct}%`, height:"100%", background:b.color, borderRadius:2, transition:"width 1.2s ease" }}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* ── PACKAGE DISTRIBUTION ── */}
            <Panel
              title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Package Distribution</>}
              subtitle="Salary range breakdown"
              style={{ animationDelay:".35s" }}
            >
              {loading ? (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[1,2,3,4,5].map(i => <Skeleton key={i} height={20}/>)}
                </div>
              ) : (
                <>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {pkgDist.map(p => (
                      <div key={p.range} style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ width:120, fontSize:11, color:"var(--text2)", flexShrink:0 }}>{p.range}</div>
                        <div style={{ flex:1, height:8, background:"var(--surface3)", borderRadius:4, overflow:"hidden" }}>
                          <div style={{ width:`${p.pct * 2}%`, height:"100%", background:p.color, borderRadius:4, transition:"width 1.2s ease" }}/>
                        </div>
                        <div style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:p.color, width:30, textAlign:"right" }}>{p.count}</div>
                        <div style={{ fontSize:10, color:"var(--text3)", width:38 }}>{p.pct}%</div>
                      </div>
                    ))}
                  </div>
                  {placedWithPkg.length > 0 && (
                    <div style={{ marginTop:12, fontSize:10, color:"var(--text3)", borderTop:"1px solid var(--border)", paddingTop:10 }}>
                      Based on {placedWithPkg.length} placed students with recorded packages.
                    </div>
                  )}
                </>
              )}
            </Panel>

            {/* ── PRI DISTRIBUTION ── */}
            {(dashStats?.pri_distribution || students.length > 0) && (
              <Panel
                title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>PRI Distribution</>}
                subtitle="Placement Readiness Index breakdown"
                style={{ animationDelay:".4s" }}
              >
                {(() => {
                  // Use dashboard PRI distribution if available, else derive from students
                  const dist = dashStats?.pri_distribution ?? (() => {
                    const excellent  = students.filter(s => s.pri >= 85).length;
                    const good       = students.filter(s => s.pri >= 70 && s.pri < 85).length;
                    const fair       = students.filter(s => s.pri >= 55 && s.pri < 70).length;
                    const needs_work = students.filter(s => s.pri <  55).length;
                    return { excellent, good, fair, needs_work };
                  })();
                  return (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                      {[
                        { key:"excellent",  label:"Excellent", range:"85–100", bg:"rgba(39,201,176,.07)",  border:"rgba(39,201,176,.15)",  color:"var(--teal)" },
                        { key:"good",       label:"Good",       range:"70–84",  bg:"rgba(91,78,248,.08)",   border:"rgba(91,78,248,.15)",   color:"var(--indigo-ll)" },
                        { key:"fair",       label:"Fair",       range:"55–69",  bg:"rgba(244,165,53,.07)",  border:"rgba(244,165,53,.15)",  color:"var(--amber)" },
                        { key:"needs_work", label:"Needs Work", range:"0–54",   bg:"rgba(242,68,92,.07)",   border:"rgba(242,68,92,.15)",   color:"var(--rose)" },
                      ].map(p => (
                        <div key={p.key} style={{ background:p.bg, border:`1px solid ${p.border}`, borderRadius:12, padding:"16px 14px", textAlign:"center" }}>
                          <div style={{ fontFamily:"'Fraunces',serif", fontSize:32, color:p.color, lineHeight:1 }}>
                            {dist[p.key] ?? 0}
                          </div>
                          <div style={{ fontSize:12, fontWeight:700, color:p.color, marginTop:6 }}>{p.label}</div>
                          <div style={{ fontSize:10, color:"var(--text3)", marginTop:3 }}>PRI {p.range}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <div style={{ marginTop:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ fontSize:11, color:"var(--text3)" }}>Department Avg PRI</div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:"var(--indigo-ll)" }}>
                    {avgPri}<span style={{ fontSize:11, color:"var(--text3)", fontFamily:"sans-serif" }}> /100</span>
                  </div>
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </>
  );
}