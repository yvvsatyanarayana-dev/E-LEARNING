/**
 * placementReports.jsx — SmartCampus Placement Reports Page
 * API calls wired using the shared api.js utility (same pattern as placementDashboard.jsx)
 *
 * APIs used:
 *   GET  /auth/me                       → officer name/avatar in sidebar
 *   GET  /placement/dashboard/stats     → stat cards (total, placed, rate, drives)
 *   GET  /placement/internships?limit=20 → drive list for report generation
 *   GET  /placement/dashboard/students?limit=200 → student data for export
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth } from "../../../utils/auth.js";
import api from "../../../utils/api.js";
import "./placementReports.css";

/* ════════════════════════════════════════════
   DATA MAPPERS — same as placementDashboard
════════════════════════════════════════════ */
function mapApiStudent(s) {
  const placed    = s.placed_application;
  const inProcess = s.in_process_application;
  let status = "Not Ready";
  let company = "—", pkg = "—";
  if (placed)    { status = "Placed";     company = placed.company_name ?? "—";    pkg = placed.package ?? "—"; }
  else if (inProcess) { status = "In Process"; company = inProcess.company_name ?? "—"; }
  else if ((s.pri_score ?? 0) >= 55) status = "Applied";

  return {
    name:    s.full_name ?? s.name ?? "—",
    branch:  s.department ?? "—",
    cgpa:    s.settings?.cgpa ?? s.cgpa ?? 0,
    pri:     Math.round(s.pri_score ?? s.pri ?? 0),
    skills:  (s.skills ?? []).slice(0, 3),
    interviews: s.mock_interview_count ?? 0,
    company, pkg, status,
  };
}

/* ════════════════════════════════════════════
   PDF / CSV / EXCEL EXPORT UTILITIES
   (identical to placementDashboard.jsx)
════════════════════════════════════════════ */
function generatePDF(data, format = "Full Report") {
  const { students, drives, officerName, placementRate, placedStudents } = data;
  const now = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
  const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>SmartCampus Placement Report</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:sans-serif;color:#1a1a2e;background:#fff;padding:40px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #5b4ef8;margin-bottom:28px;}
  h2{font-size:15px;font-weight:800;color:#1a1a2e;margin:24px 0 14px;}
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
  .stat-box{border-radius:10px;padding:16px;text-align:center;border:1px solid #e8e8f0;}
  .stat-num{font-size:28px;font-weight:800;line-height:1;margin-bottom:4px;color:#5b4ef8;}
  .stat-lbl{font-size:10px;color:#6b6b80;font-weight:600;text-transform:uppercase;}
  table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:11px;}
  th{background:#f4f3ff;padding:8px 10px;text-align:left;font-weight:700;color:#5b4ef8;font-size:9px;text-transform:uppercase;border-bottom:2px solid #5b4ef8;}
  td{padding:8px 10px;border-bottom:1px solid #e8e8f0;color:#3a3a5c;}
  tr:nth-child(even) td{background:#fafafa;}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e8e8f0;display:flex;justify-content:space-between;font-size:9px;color:#9898b8;}
</style></head><body>
  <div class="header">
    <div><strong>SC SmartCampus</strong> Placement Management System</div>
    <div style="text-align:right">
      <div style="font-size:13px;font-weight:700;color:#5b4ef8">📊 ${format}</div>
      <div style="font-size:11px;color:#6b6b80;margin-top:4px">Generated: ${now}</div>
      <div style="font-size:10px;color:#9898b8;margin-top:2px">Officer: ${officerName}</div>
    </div>
  </div>
  <h2>Placement Summary</h2>
  <div class="stats-grid">
    <div class="stat-box"><div class="stat-num">${students.length}</div><div class="stat-lbl">Total Students</div></div>
    <div class="stat-box"><div class="stat-num">${placedStudents}</div><div class="stat-lbl">Placed</div></div>
    <div class="stat-box"><div class="stat-num">${placementRate}%</div><div class="stat-lbl">Rate</div></div>
    <div class="stat-box"><div class="stat-num">${drives.length}</div><div class="stat-lbl">Drives</div></div>
  </div>
  <h2>Student Tracker</h2>
  <table>
    <thead><tr><th>Student</th><th>Branch</th><th>CGPA</th><th>PRI</th><th>Company</th><th>Package</th><th>Status</th></tr></thead>
    <tbody>${students.map(s=>`<tr><td><strong>${s.name}</strong></td><td>${s.branch}</td><td>${s.cgpa}</td><td>${s.pri}/100</td><td>${s.company}</td><td>${s.pkg}</td><td>${s.status}</td></tr>`).join("")}</tbody>
  </table>
  <div class="footer">
    <div>SmartCampus Placement Management System — Confidential</div>
    <div>${officerName} · ${now}</div>
  </div>
</body></html>`;
  const blob = new Blob([htmlContent], { type:"text/html" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank");
  if (win) { setTimeout(() => { win.print(); }, 800); }
  else { const a = document.createElement("a"); a.href = url; a.download = `PlacementReport_${Date.now()}.html`; a.click(); }
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function exportCSV(students) {
  const header = "Name,Branch,CGPA,PRI,Skills,Interviews,Company,Package,Status\n";
  const rows = students.map(s =>
    `"${s.name}","${s.branch}",${s.cgpa},${s.pri},"${(s.skills||[]).join("/")}",${s.interviews},"${s.company}","${s.pkg}","${s.status}"`
  ).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([header + rows], { type:"text/csv" }));
  a.download = `PlacementData_${Date.now()}.csv`; a.click();
}

function exportExcel(students) {
  const header = "Name\tBranch\tCGPA\tPRI\tSkills\tInterviews\tCompany\tPackage\tStatus\n";
  const rows = students.map(s =>
    `${s.name}\t${s.branch}\t${s.cgpa}\t${s.pri}\t${(s.skills||[]).join("/")}\t${s.interviews}\t${s.company}\t${s.pkg}\t${s.status}`
  ).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\ufeff" + header + rows], { type:"application/vnd.ms-excel" }));
  a.download = `PlacementData_${Date.now()}.xls`; a.click();
}

/* ════════════════════════════════════════════
   REPORT TYPE CONFIG
════════════════════════════════════════════ */
const REPORT_TYPES = [
  { icon:"📊", title:"Q4 Placement Analytics Report",  desc:"Full placement stats across all branches and companies.", type:"Analytics",  format:"PDF"   },
  { icon:"🏢", title:"Company Engagement Report",       desc:"Summary of all companies visited, drives conducted, and offers made.", type:"Companies", format:"PDF"   },
  { icon:"👥", title:"Student Placement Status Report", desc:"Individual student placement status with PRI score and skill breakdown.", type:"Students",  format:"CSV"   },
  { icon:"📈", title:"Branch-wise Placement Report",    desc:"Placement rate, average package, and top companies per department.", type:"Analytics", format:"Excel" },
  { icon:"🎯", title:"PRI Score Distribution Report",   desc:"Placement Readiness Index breakdown across all student cohorts.", type:"Students",  format:"PDF"   },
  { icon:"💼", title:"Internship Conversion Report",    desc:"PPO conversion rates and internship performance metrics.", type:"Internships", format:"Excel" },
  { icon:"📋", title:"Semester Summary Report",         desc:"Complete semester overview for the current academic year.", type:"Summary",    format:"PDF"   },
  { icon:"🔍", title:"Skill Gap Analysis Report",       desc:"Analysis of skill gaps vs industry requirements for each branch.", type:"Analytics", format:"CSV"   },
];

const typeColors = {
  "Analytics":"badge-indigo","Companies":"badge-amber",
  "Students":"badge-teal","Internships":"badge-violet","Summary":"badge-rose",
};

const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Skeleton = ({ width = "100%", height = 14, style = {} }) => (
  <div style={{ width, height, background:"var(--surface3)", borderRadius:6, animation:"pulse 1.5s ease-in-out infinite", ...style }} />
);

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function PlacementReports() {
  const navigate = useNavigate();

  /* ── API data ── */
  const [loading,       setLoading]      = useState(true);
  const [dashStats,     setDashStats]    = useState(null);
  const [students,      setStudents]     = useState([]);
  const [drives,        setDrives]       = useState([]);
  const [officerName,   setOfficerName]  = useState("Placement Officer");

  /* ── UI state ── */
  const [filter,      setFilter]      = useState("All");
  const [search,      setSearch]      = useState("");
  const [generating,  setGenerating]  = useState(null); // report title being generated
  const [downloading, setDownloading] = useState(null); // report title being downloaded

  /* ── Custom cursor ── */
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
     FETCH — load officer, stats, students, drives
  ════════════════════════════════════════════ */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [meRes, statsRes, studentsRes, drivesRes] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/placement/dashboard/stats"),
          api.get("/placement/dashboard/students?limit=200"),
          api.get("/placement/internships?limit=20"),
        ]);

        if (meRes.status === "fulfilled") {
          setOfficerName(meRes.value.full_name ?? meRes.value.email ?? "Placement Officer");
        }

        if (statsRes.status === "fulfilled") {
          setDashStats(statsRes.value);
        }

        if (studentsRes.status === "fulfilled") {
          const raw = Array.isArray(studentsRes.value) ? studentsRes.value : (studentsRes.value?.items ?? []);
          setStudents(raw.map(mapApiStudent));
        }

        if (drivesRes.status === "fulfilled") {
          const raw = Array.isArray(drivesRes.value) ? drivesRes.value : (drivesRes.value?.items ?? []);
          setDrives(raw);
        }
      } catch (err) {
        console.error("Reports fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* ── Computed ── */
  const placementRate  = dashStats?.placement_rate  ?? (students.length ? Math.round(students.filter(s=>s.status==="Placed").length/students.length*100) : 0);
  const placedStudents = dashStats?.placed_students ?? students.filter(s=>s.status==="Placed").length;

  const exportData = { students, drives, officerName, placementRate, placedStudents };

  /* ── Filter reports list ── */
  const filtered = REPORT_TYPES.filter(r => {
    const mf = filter === "All" || r.type === filter;
    const mq = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase());
    return mf && mq;
  });

  /* ── Download handler — uses real API data ── */
  const handleDownload = (report) => {
    setDownloading(report.title);
    setTimeout(() => {
      if (report.format === "PDF" || report.type === "Analytics" || report.type === "Summary") {
        generatePDF(exportData, report.title);
      } else if (report.format === "CSV" || report.type === "Students") {
        exportCSV(students);
      } else {
        exportExcel(students);
      }
      setDownloading(null);
    }, 800);
  };

  /* ── Generate new report ── */
  const handleGenerate = async () => {
    setGenerating("Generating…");
    try {
      // Refresh student data before generating
      const raw = await api.get("/placement/dashboard/students?limit=200");
      const arr = Array.isArray(raw) ? raw : (raw?.items ?? []);
      setStudents(arr.map(mapApiStudent));
      // Generate PDF with fresh data
      generatePDF({ ...exportData, students: arr.map(mapApiStudent) }, "Fresh Placement Report");
    } catch (err) {
      console.error("Generate error:", err);
      generatePDF(exportData, "Placement Report");
    } finally {
      setGenerating(null);
    }
  };

  const initials = officerName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "PO";

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <>
      <div className="sc-cursor"      ref={curRef}  />
      <div className="sc-cursor-ring" ref={ringRef} />
      <div className="sc-noise" />

      <div className="app">
        {/* ══ SIDEBAR ══ */}
        <aside className="sidebar">
          <div className="sb-top">
            <Link to="/placementdashboard" className="sb-brand">
              <div className="sb-mark">SC</div>
              <span className="sb-name">SmartCampus</span>
            </Link>
          </div>
          <Link to="/placementdashboard/placementProfile" className="sb-user" style={{ textDecoration:"none" }}>
            <div className="sb-avatar">{initials}</div>
            <div>
              <div className="sb-uname">{loading ? "Loading…" : officerName}</div>
              <div className="sb-urole">Placement Officer</div>
            </div>
          </Link>
          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard"                   icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/analytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>
            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students"    badge={loading?"…":String(dashStats?.total_students??"")} badgeCls="teal"  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies"   badge="8"  badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink to="/placementdashboard/drives"      badge={loading?"…":String(drives.filter(d=>d.status==="Upcoming").length)} badgeCls="rose" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
            <SbLink to="/placementdashboard/offers-placed" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships"   icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/meetings" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>Virtual Meeting</SbLink>
            <SbLink to="/placementdashboard/ai-assistant"  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink active to="/placementdashboard/reports" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>
          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">{loading ? "…" : `${placementRate}%`}</div>
              <div className="sb-pri-sub">{loading ? "Loading…" : `${placedStudents} placed · AY 2024-25`}</div>
              <div className="sb-pri-bar">
                <div className="sb-pri-fill" style={{ width: loading ? "0%" : `${placementRate}%`, transition:"width 1s ease" }} />
              </div>
            </div>
            <button className="sb-logout" onClick={() => { clearAuth(); navigate("/login", { replace:true }); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <div className="main">
          <header className="topbar">
            <span className="tb-page">Reports</span>
            <div className="tb-sep" />
            <div className="tb-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:"var(--text3)", flexShrink:0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search reports…" value={search} onChange={e => setSearch(e.target.value)} style={{ cursor:"none" }} />
            </div>
            <div className="tb-right">
              <span className="tb-date">{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</span>
              <button className="btn btn-solid" style={{ fontSize:10, padding:"8px 14px" }} onClick={handleGenerate} disabled={!!generating}>
                {generating ? "Generating…" : "+ Generate Report"}
              </button>
            </div>
          </header>

          <div className="content">
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">{REPORT_TYPES.length} Reports · AY 2024-25</span></div>
              <h1 className="greet-title">Placement <em>Reports</em></h1>
              <p className="greet-sub">
                {loading ? "Loading placement data for reports…" : `Export data for ${dashStats?.total_students ?? students.length} students and ${drives.length} drives.`}
              </p>
            </div>

            {/* STAT CARDS — from real API */}
            <div className="stat-grid" style={{ marginBottom:18 }}>
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="stat-card sc-indigo"><Skeleton height={30} style={{ marginBottom:6 }}/><Skeleton height={12} width="60%"/></div>)
              ) : [
                { label:"Total Students", val:dashStats?.total_students ?? students.length, color:"indigo", delta:"Registered this year" },
                { label:"Placed Students",val:placedStudents,  color:"teal",   delta:`${placementRate}% rate` },
                { label:"Active Drives",  val:drives.filter(d=>d.status==="Upcoming"||d.status==="Ongoing").length, color:"amber", delta:"Upcoming & ongoing" },
                { label:"Avg PRI Score",  val:Math.round(dashStats?.avg_pri ?? 0), color:"violet", delta:"Placement Readiness Index" },
              ].map(s => (
                <div key={s.label} className={`stat-card sc-${s.color}`}>
                  <div className="stat-val" style={s.color !== "indigo" ? { color:`var(--${s.color})` } : {}}>{s.val}</div>
                  <div className="stat-lbl">{s.label}</div>
                  <span className="stat-delta delta-up">{s.delta}</span>
                </div>
              ))}
            </div>

            {/* FILTER TABS */}
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              <div className="filter-row">
                {["All","Analytics","Students","Companies","Internships","Summary"].map(f => (
                  <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <span style={{ marginLeft:"auto", fontSize:11, color:"var(--text3)", alignSelf:"center" }}>
                {filtered.length} report{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* REPORT CARDS GRID */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
              {filtered.map(r => {
                const isDownloading = downloading === r.title;
                return (
                  <div key={r.title} className="panel" style={{ margin:0 }}>
                    <div style={{ padding:"18px 20px", display:"flex", alignItems:"flex-start", gap:14 }}>
                      <div style={{ fontSize:28, flexShrink:0 }}>{r.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                          <div style={{ fontSize:13, fontWeight:700, lineHeight:1.3 }}>{r.title}</div>
                          <Badge cls="badge-teal" dot>Ready</Badge>
                        </div>
                        <p style={{ fontSize:11.5, color:"var(--text3)", lineHeight:1.6, marginBottom:12 }}>{r.desc}</p>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                            <span className="skill-chip">{r.type}</span>
                            <span style={{ fontSize:10, color:"var(--text3)" }}>· {r.format}</span>
                            <span style={{ fontSize:10, color:"var(--text3)" }}>
                              · {loading ? "…" : `${dashStats?.total_students ?? students.length} students`}
                            </span>
                          </div>
                          <div style={{ display:"flex", gap:6 }}>
                            <button className="btn btn-ghost" style={{ fontSize:9, padding:"5px 10px" }}
                              onClick={() => generatePDF(exportData, r.title)}>
                              Preview
                            </button>
                            <button className="btn btn-solid" style={{ fontSize:9, padding:"5px 10px", minWidth:80 }}
                              disabled={isDownloading || loading}
                              onClick={() => handleDownload(r)}>
                              {isDownloading ? (
                                <>
                                  <div className="pd-spinner" style={{ width:8, height:8 }} />
                                  &nbsp;…
                                </>
                              ) : (
                                <>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  Download
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}