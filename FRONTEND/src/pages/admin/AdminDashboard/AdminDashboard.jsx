// AdminDashboard.jsx — SMART CAMPUS Admin Panel
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../utils/api";
import "./AdminDashboard.css";

/* ─────────────────────────────────────────
   ICONS (inline SVG helpers)
───────────────────────────────────────── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const icons = {
  grid:       <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  users:      <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  book:       <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
  bar:        <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  settings:   <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  bell:       <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  search:     <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  logout:     <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  menu:       <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  x:          <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  plus:       <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  edit:       <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:      <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></>,
  shield:     <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  zap:        <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  cpu:        <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></>,
  db:         <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
  wifi:       <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  award:      <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
  trend:      <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  layers:     <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  globe:      <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  check:      <><polyline points="20 6 9 17 4 12"/></>,
  info:       <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  chevronR:   <><polyline points="9 18 15 12 9 6"/></>,
  chevronL:   <><polyline points="15 18 9 12 15 6"/></>,
  moreH:      <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  userPlus:   <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
  download:   <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  refresh:    <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  briefcase:  <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  activity:   <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
};
const I = ({ n, size = 16 }) => <Icon size={size} d={icons[n]} />;

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
// Data will be fetched from API

/* ─────────────────────────────────────────
   NAV — id maps to route path segment
   Root dashboard  → /admindashboard
   Others          → /admindashboard/<routePath>
───────────────────────────────────────── */
const NAV = [
  { section:"Overview",   items:[
    { id:"dashboard",       label:"Dashboard",       icon:"grid",      routePath:"",               badge:null },
    { id:"analytics",       label:"Analytics",       icon:"bar",       routePath:"adminAnalytics",  badge:null },
  ]},
  { section:"Management", items:[
    { id:"users",           label:"User Management", icon:"users",     routePath:"userManagement",  badge:null },
    { id:"courses",         label:"Courses",         icon:"book",      routePath:"courseManagement",badge:null },
    { id:"departments",     label:"Departments",     icon:"layers",    routePath:"departments",     badge:null },
    { id:"placement",       label:"Placement",       icon:"briefcase", routePath:"placements",      badge:null,   badgeType:"teal" },
  ]},
  { section:"Platform",   items:[
    { id:"reports",         label:"Reports",         icon:"download",  routePath:"adminReports",    badge:null },
    { id:"activity",        label:"Activity Log",    icon:"activity",  routePath:"auditLogs",       badge:null,  badgeType:"rose" },
    { id:"security",        label:"Security",        icon:"shield",    routePath:"security",        badge:null },
    { id:"settings",        label:"Settings",        icon:"settings",  routePath:"settings",        badge:null },
  ]},
];

/* Helper: derive active nav id from current pathname */
const getActiveId = (pathname) => {
  for (const sec of NAV) {
    for (const item of sec.items) {
      if (item.routePath === "") {
        if (pathname === "/admindashboard" || pathname === "/admindashboard/") return item.id;
      } else {
        if (pathname.includes(item.routePath)) return item.id;
      }
    }
  }
  return "dashboard";
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const cursorRef       = useRef(null);
  const cursorRingRef   = useRef(null);
  const pageRef         = useRef(null);
  const [sidebarOpen, setSidebar]   = useState(false);
  const [active, setActive]         = useState(getActiveId(location.pathname));
  const [now, setNow]               = useState(new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }));

  // REAL-TIME DATA STATES
  const [stats, setStats]           = useState({ total_users: "0", active_courses: "0", placement_readiness: "0%", alerts: "0", deltas: {}, latency: "..." });
  const [activities, setActivities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [usageData, setUsageData]   = useState([]);
  const [placementData, setPlacementData] = useState([]);
  const [systemStatus, setSystemStatus]   = useState([]);
  const [resources, setResources]         = useState([]);
  const [users, setUsers]           = useState([]);
  const [courses, setCourses]       = useState([]);
  const [navBadges, setNavBadges]   = useState({});
  const [configStats, setConfigStats] = useState({ uptime: "99.9%", cpu: "0%", memory: "0%", backup_size: "0GB" });
  const [loading, setLoading]       = useState(true);

  // User table filters
  const [userFilter, setUserFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage]     = useState(1);

  // FETCH INITIAL DASHBOARD DATA
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [s, a, d, u, p, sys, res, nb, cs] = await Promise.all([
          api.get("/admin/dashboard/stats"),
          api.get("/admin/dashboard/activity"),
          api.get("/admin/dashboard/departments"),
          api.get("/admin/dashboard/usage"),
          api.get("/admin/dashboard/placement"),
          api.get("/admin/dashboard/system"),
          api.get("/admin/dashboard/resources"),
          api.get("/admin/config/badges"),
          api.get("/admin/config/stats")
        ]);
        setStats(s);
        setActivities(a);
        setDepartments(d);
        setUsageData(u);
        setPlacementData(p);
        setSystemStatus(sys);
        setResources(res);
        setNavBadges(nb);
        setConfigStats(cs);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // FETCH USER AND COURSE DATA (dependent on filters/pagination)
  useEffect(() => {
    const fetchUsersAndCourses = async () => {
      setLoading(true);
      try {
        const [u, c] = await Promise.all([
          api.get(`/admin/users?role=${userFilter}&search=${userSearch}&page=${userPage}`),
          api.get("/admin/courses")
        ]);
        setUsers(u);
        setCourses(c);
      } catch (err) {
        console.error("Failed to fetch user/course data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsersAndCourses();
  }, [userFilter, userSearch, userPage]);


  // Helpers
  const roleBadge   = (role)   => role === "student" ? "badge-student" : role === "faculty" ? "badge-faculty" : role === "placement" ? "badge-placement" : "";
  const statusClass = (status) => status === "active" ? "status-active" : status === "pending" ? "status-pending" : "status-inactive";

  // Navigate helper
  const handleNavClick = (e, item) => {
    e.preventDefault();
    const path = item.routePath === "" ? "/admindashboard" : `/admindashboard/${item.routePath}`;
    navigate(path);
    setActive(item.id); // Update active state
    setSidebar(false);
  };

  // Cursor animation effect
  useEffect(() => {
    const cursor = cursorRef.current; const cursorRing = cursorRingRef.current;
    if (!cursor || !cursorRing) return;
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    const onMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; cursor.style.transform = `translate(${mouseX}px,${mouseY}px)`; };
    let raf;
    const animate = () => { ringX += (mouseX - ringX) * 0.12; ringY += (mouseY - ringY) * 0.12; cursorRing.style.transform = `translate(${ringX}px,${ringY}px)`; raf = requestAnimationFrame(animate); };
    window.addEventListener("mousemove", onMove); raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  // Animate progress bars on mount
  useEffect(() => {
    const fills = document.querySelectorAll("[data-width]");
    const timeout = setTimeout(() => {
      fills.forEach(el => { el.style.width = el.dataset.width; });
    }, 300);
    return () => clearTimeout(timeout);
  }, [loading]); // Trigger animation after data loads

  return (
    <>
      {/* Custom cursor */}
      <div className="sc-cursor" ref={cursorRef} />
      <div className="sc-cursor-ring" ref={cursorRingRef} />
      <div className="sc-noise" />

      <div className="app" ref={pageRef}>

        {/* ── SIDEBAR OVERLAY (mobile) ── */}
        <div
          className={`sb-overlay ${sidebarOpen ? "visible" : ""}`}
          onClick={() => setSidebar(false)}
        />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? "sb-open" : ""}`}>
          <div className="sb-top">
            <a href="/admindashboard" className="sb-brand" onClick={e => { e.preventDefault(); navigate("/admindashboard"); }}>
              <div className="sb-mark">SC</div>
              <span className="sb-name">Smart Campus</span>
            </a>
            <button className="sb-mobile-close" onClick={() => setSidebar(false)}>
              <I n="x" size={14} />
            </button>
          </div>

          <div className="sb-user">
            <div className="sb-avatar">SA</div>
            <div>
              <div className="sb-uname">Super Admin</div>
              <div className="sb-urole">System Administrator</div>
            </div>
          </div>

          <nav className="sb-nav">
            {NAV.map(sec => (
              <div key={sec.section}>
                <div className="sb-sec-label">{sec.section}</div>
                {sec.items.map(item => (
                  <a
                    key={item.id}
                    href={item.routePath === "" ? "/admindashboard" : `/admindashboard/${item.routePath}`}
                    className={`sb-link ${active === item.id ? "active" : ""}`}
                    onClick={e => handleNavClick(e, item)}
                  >
                    <I n={item.icon} size={15} />
                    {item.label}
                    {navBadges[item.id] && <span className={`sb-badge ${item.badgeType || ""}`}>{navBadges[item.id]}</span>}
                  </a>
                ))}
              </div>
            ))}
          </nav>

          <div className="sb-bottom">
            <div className="sb-health">
              <div className="sb-health-lbl">System Health</div>
              {[
                ["Departments", departments.length],
                ["Courses", stats.active_courses || 0],
                ["Users", stats.total_users || 0]
              ].map(([n,v]) => (
                <div key={n}>
                  <div className="sb-health-row"><span className="sb-health-name">{n}</span><span className="sb-health-val">{v}</span></div>
                  <div className="sb-health-bar"><div className="sb-health-fill" data-width="100%" style={{ width:"100%" }} /></div>
                </div>
              ))}
            </div>

            <button
              className="sb-logout"
              onClick={() => {
                // Clear auth tokens here if needed (e.g. localStorage.removeItem("token"))
                navigate("/login");
              }}
            >
              <I n="logout" size={14} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">

          {/* ── TOPBAR ── */}
          <header className="topbar">
            <button className="tb-hamburger" onClick={() => setSidebar(true)}>
              <I n="menu" size={16} />
            </button>
            <span className="tb-page">
              {NAV.flatMap(s => s.items).find(i => i.id === active)?.label || "Dashboard"}
            </span>
            <div className="tb-sep" />
            <div className="tb-search">
              <I n="search" size={14} />
              <input placeholder="Search users, courses…" />
            </div>
            <div className="tb-right">
              <span className="tb-role-tag">Admin</span>
              <span className="tb-date">{now}</span>
              <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} className="tb-icon-btn tooltip" data-tip="Refresh">
                <I n="refresh" size={15} />
              </button>
              <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} className="tb-icon-btn tooltip" data-tip="Notifications">
                <I n="bell" size={15} />
                <span className="notif-dot" />
              </button>
              <button
                className="tb-icon-btn tooltip"
                data-tip="Settings"
                onClick={() => navigate("/admindashboard/settings")}
              >
                <I n="settings" size={15} />
              </button>
            </div>
          </header>

          {/* ── CONTENT ── */}
          <main className="content">

            {/* ── GREETING ── */}
            <div className="greet-row">
              <div className="greet-tag">
                <div className="greet-pip" />
                <span className="greet-pip-txt">Admin Console</span>
              </div>
              <h1 className="greet-title">
                {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}, <em>Admin.</em>
              </h1>
              <p className="greet-sub">
                Platform is running smoothly — {stats.total_users} active users today &nbsp;·&nbsp; {stats.alerts} pending approvals &nbsp;·&nbsp; System latency {stats.latency || "24ms"}
              </p>
              <div className="greet-actions">
                <button
                  className="btn btn-solid"
                  onClick={() => navigate("/admindashboard/userManagement")}
                >
                  <I n="userPlus" size={14} /> Add User
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate("/admindashboard/adminReports")}
                >
                  <I n="download" size={14} /> Export Report
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate("/admindashboard/courseManagement")}
                >
                  <I n="plus" size={14} /> New Course
                </button>
              </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="stat-grid">
              {[
                { accent:"sc-indigo", icon:"users",    val:stats.total_users || 0,     lbl:"Total Users",       delta:stats.deltas?.users || "+12%",  dir:"up",  sub:"vs last month",  route:"userManagement" },
                { accent:"sc-teal",   icon:"book",     val:stats.active_courses || 0,  lbl:"Active Courses",    delta:stats.deltas?.courses || "+3",    dir:"up",  sub:"this semester",  route:"courseManagement" },
                { accent:"sc-amber",  icon:"zap",      val:stats.placement_readiness || "0%", lbl:"Placement Readiness",   delta:stats.deltas?.readiness || "73%",   dir:"up",  sub:"avg PRI score",  route:"placement" },
                { accent:"sc-rose",   icon:"bell",     val:stats.alerts || 0,          lbl:"System Alerts",     delta:stats.deltas?.alerts || "0",     dir:"neu", sub:"require action", route:"activitylog" },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`stat-card ${s.accent}`}
                  style={{ animationDelay:`${i * 80}ms`, cursor:"pointer" }}
                  onClick={() => navigate(`/admindashboard/${s.route}`)}
                >
                  <div className="stat-ic"><I n={s.icon} size={16} /></div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                  <span className={`stat-delta delta-${s.dir}`}>
                    {s.dir === "up" ? "↑" : s.dir === "dn" ? "↓" : "·"} {s.delta}{" "}
                    <span style={{ fontWeight:300, opacity:.7 }}>{s.sub}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="action-grid">
                {[
                  { icon:"userPlus", ttl:"Add User",    sub:`${stats.total_users || 0} users`,  route:"userManagement" },
                  { icon:"plus",     ttl:"New Course",  sub:`${stats.active_courses || 0} active`, route:"courseManagement" },
                  { icon:"briefcase",ttl:"Schedule",    sub:`Upcoming drives`,    route:"placement" },
                  { icon:"download", ttl:"Reports",     sub:"Full reports",    route:"adminReports" },
                ].map((a, i) => (
                <div
                  key={i}
                  className="qa-card"
                  style={{ animationDelay:`${i * 60}ms`, cursor:"pointer" }}
                  onClick={() => navigate(`/admindashboard/${a.route}`)}
                >
                  <div className="qa-icon" style={{ background:a.color, color:a.tc }}>
                    <I n={a.icon} size={17} />
                  </div>
                  <div className="qa-label" style={{ color:a.tc }}>{a.ttl}</div>
                  <div className="qa-count">{a.sub}</div>
                </div>
              ))}
            </div>

            {/* ── ROW: USER TABLE + ACTIVITY ── */}
            <div className="main-grid-wide">

              {/* User Management Panel */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl">
                    <I n="users" size={15} />
                    User Management
                    <span>{users.length} shown</span>
                  </div>
                  <button
                    className="btn btn-solid btn-sm"
                    onClick={() => navigate("/admindashboard/userManagement")}
                  >
                    <I n="userPlus" size={12} /> Add
                  </button>
                </div>
                <div className="panel-body">
                  <div className="filter-row">
                    <div className="tb-search" style={{ flex:"1", height:"32px" }}>
                      <I n="search" size={13} />
                      <input
                        placeholder="Search users…"
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                      />
                    </div>
                    {["all","student","faculty","placement"].map(f => (
                      <button
                        key={f}
                        className={`filter-chip ${userFilter === f ? "active" : ""}`}
                        onClick={() => setUserFilter(f)}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>

                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Dept</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="ut-user">
                              <div className="ut-av" style={{ background:u.avColor, color:u.avText }}>{u.av}</div>
                              <div>
                                <div className="ut-name">{u.name}</div>
                                <div className="ut-mail">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={`role-tag ${roleBadge(u.role)}`}>{u.role}</span></td>
                          <td style={{ color:"var(--text3)", fontSize:"11px" }}>{u.dept}</td>
                          <td>
                            <span className={`status-tag ${statusClass(u.status)}`}>
                              <span className="status-dot" />
                              {u.status}
                            </span>
                          </td>
                          <td style={{ color:"var(--text3)", fontSize:"10px" }}>{u.joined}</td>
                          <td>
                            <div style={{ display:"flex", gap:"5px" }}>
                              <button onClick={() => alert("Edit action triggered!")} className="ut-action tooltip" data-tip="Edit"><I n="edit" size={11} /></button>
                              <button onClick={async () => {
                                if(window.confirm("Delete this user?")) {
                                  await api.delete(`/admin/users/${u.id}`);
                                  setUsers(prev => prev.filter(x => x.id !== u.id));
                                }
                              }} className="ut-action tooltip" data-tip="Remove"><I n="trash" size={11} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="pagination">
                    <button
                      className={`pg-btn ${userPage === 1 ? "disabled" : ""}`}
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    >
                      <I n="chevronL" size={12} />
                    </button>
                    {[1, 2, 3].map(p => (
                      <button
                        key={p}
                        className={`pg-btn ${userPage === p ? "active" : ""}`}
                        onClick={() => setUserPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="pg-btn"
                      onClick={() => setUserPage(p => Math.min(3, p + 1))}
                    >
                      <I n="chevronR" size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="activity" size={15} /> Activity Log <span>Live</span></div>
                  <button
                    className="panel-act"
                    onClick={() => navigate("/admindashboard/activitylog")}
                  >
                    <I n="refresh" size={12} /> View All
                  </button>
                </div>
                <div className="panel-body">
                  <div className="activity-list">
                    {activities.map((a, i) => (
                      <div key={i} className="activity-item">
                        <div className="act-icon" style={{ background:a.color }}>
                          <I n={a.icon} size={14} />
                        </div>
                        <div className="act-body">
                          <div className="act-text">
                            {a.text}
                            {a.badge && (
                              <span className="act-badge" style={{
                                background: a.type === "system"    ? "rgba(242,68,92,.12)"
                                           : a.type === "placement" ? "rgba(159,122,234,.12)"
                                           : "rgba(39,201,176,.1)",
                                color:      a.type === "system"    ? "var(--rose)"
                                           : a.type === "placement" ? "var(--violet)"
                                           : "var(--teal)",
                              }}>
                                {a.badge}
                              </span>
                            )}
                          </div>
                          <div className="act-time">{a.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW: DEPARTMENTS + USAGE + PLACEMENT ── */}
            <div className="main-grid-3">

              {/* Department Analytics */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="layers" size={15} /> Departments</div>
                  <button
                    className="panel-act"
                    onClick={() => navigate("/admindashboard/department")}
                  >
                    View All <I n="chevronR" size={11} />
                  </button>
                </div>
                <div className="panel-body">
                  <div className="mini-stats">
                    <div className="mini-stat">
                      <div className="ms-val" style={{ color:"var(--indigo-ll)" }}>{departments.length}</div>
                      <div className="ms-lbl">Departments</div>
                    </div>
                    <div className="mini-stat">
                      <div className="ms-val" style={{ color:"var(--teal)" }}>{stats.total_users || 0}</div>
                      <div className="ms-lbl">Students</div>
                    </div>
                    <div className="mini-stat">
                      <div className="ms-val" style={{ color:"var(--amber)" }}>{stats.faculty_count || 0}</div>
                      <div className="ms-lbl">Faculty</div>
                    </div>
                  </div>
                  <div className="dept-list">
                    {departments.map((d, i) => (
                      <div key={i} className="dept-item">
                        <div className="dept-top">
                          <span className="dept-name">{d.short}</span>
                          <span className="dept-meta">{d.students} students</span>
                          <span className="dept-pct" style={{ color:d.color }}>{d.pct}%</span>
                        </div>
                        <div className="dept-bar">
                          <div className="dept-fill" data-width={`${d.pct}%`} style={{ width:0, background:d.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Usage */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="trend" size={15} /> Weekly Usage</div>
                  <span style={{ fontSize:"10px", color:"var(--text3)" }}>Active sessions</span>
                </div>
                <div className="panel-body">
                  <div style={{ marginBottom:"14px" }}>
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:"32px", color:"var(--indigo-ll)", lineHeight:1 }}>{stats.active_users_today || 0}</div>
                    <div style={{ fontSize:"11px", color:"var(--text3)", marginTop:"3px" }}>Peak usage today · <span style={{ color:"var(--teal)" }}>Real-time sync</span></div>
                  </div>
                  <div className="usage-chart">
                    {usageData.map((d, i) => (
                      <div key={i} className="uc-bar-wrap">
                        <div
                          className="uc-bar"
                          data-val={`${d.v}%`}
                          style={{
                            height: `${d.v}%`,
                            background: d.v === Math.max(...usageData.map(x => x.v || 0))
                              ? "linear-gradient(180deg,var(--indigo-l),var(--indigo))"
                              : "linear-gradient(180deg,var(--surface3),var(--muted))",
                          }}
                        />
                        <span className="uc-label">{d.l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="usage-legend" style={{ marginTop:"16px" }}>
                    {[
                      { color:"var(--indigo-l)", label:"Students" },
                      { color:"var(--teal)",     label:"Faculty" },
                      { color:"var(--amber)",    label:"Admin" },
                    ].map(l => (
                      <div key={l.label} className="ul-item">
                        <div className="ul-dot" style={{ background:l.color }} />
                        {l.label}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:"16px", borderTop:"1px solid var(--border)", paddingTop:"14px" }}>
                    <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text3)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:"10px" }}>
                      Module Usage
                    </div>
                    {(stats.module_usage || []).map((m, i) => (
                      <div key={i} style={{ marginBottom:"9px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                          <span style={{ fontSize:"11px", color:"var(--text2)" }}>{m.name}</span>
                          <span style={{ fontSize:"10px", fontWeight:600, color:m.color }}>{m.pct}%</span>
                        </div>
                        <div className="dept-bar">
                          <div className="dept-fill" data-width={`${m.pct}%`} style={{ width:0, background:m.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Placement Tracker */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="briefcase" size={15} /> Placement Tracker</div>
                  <button
                    className="panel-act"
                    onClick={() => navigate("/admindashboard/placement")}
                  >
                    Full Report <I n="chevronR" size={11} />
                  </button>
                </div>
                <div className="panel-body">
                  <div className="mini-stats">
                    <div className="mini-stat">
                      <div className="ms-val" style={{ color:"var(--teal)" }}>{stats.placement_readiness || "0%"}</div>
                      <div className="ms-lbl">Avg PRI</div>
                    </div>
                    <div className="mini-stat">
                      <div className="ms-val" style={{ color:"var(--indigo-ll)" }}>{stats.placement_ready_count || 0}</div>
                      <div className="ms-lbl">Placed</div>
                    </div>
                    <div className="mini-stat">
                      <div className="ms-val" style={{ color:"var(--amber)" }}>{placementData.length}</div>
                      <div className="ms-lbl">Drives</div>
                    </div>
                  </div>
                  <div className="funnel-list">
                    {placementData.map((p, i) => (
                      <div key={i} className="funnel-item">
                        <div className="fi-rank">{i + 1}</div>
                        <div className="fi-info">
                          <div className="fi-name">{p.company}</div>
                          <div className="fi-sub">{p.students} students selected</div>
                        </div>
                        <div className="fi-bar">
                          <div className="dept-bar" style={{ height:"5px" }}>
                            <div className="dept-fill" data-width={`${p.pct}%`} style={{ width:0, background:p.color }} />
                          </div>
                        </div>
                        <div className="fi-pct" style={{ color:p.color }}>{p.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW: COURSES + SYSTEM STATUS ── */}
            <div className="main-grid-wide">

              {/* Course Overview */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl">
                    <I n="book" size={15} /> Course Overview
                    <span>{courses.filter(c => c.status === "active").length} active</span>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate("/admindashboard/courseManagement")}
                  >
                    <I n="plus" size={12} /> Add Course
                  </button>
                </div>
                <div className="panel-body">
                  <div className="course-grid">
                    {courses.map((c, i) => (
                      <div key={i} className="cov-item">
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"4px" }}>
                          <div className="cov-name">{c.name}</div>
                          {c.status !== "active" && (
                            <span style={{ fontSize:"9px", background:"rgba(242,68,92,.1)", color:"var(--rose)", padding:"2px 6px", borderRadius:"4px", fontWeight:600, flexShrink:0 }}>
                               {c.status}
                            </span>
                          )}
                        </div>
                        <div className="cov-meta">{c.dept} · {c.enrolled} enrolled</div>
                        <div className="cov-bar">
                          <div className="cov-fill" data-width={`${c.completion}%`} style={{ width:0, background:c.color }} />
                        </div>
                        <div className="cov-stats">
                          <span className="cov-stat"><strong style={{ color:c.color }}>{c.completion}%</strong> complete</span>
                          <span className="cov-stat"><strong>{c.enrolled}</strong> students</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="cpu" size={15} /> System Status</div>
                  <span style={{ fontSize:"10px", padding:"3px 9px", borderRadius:"5px", background:"rgba(39,201,176,.1)", color:"var(--teal)", fontWeight:600 }}>
                    {systemStatus.filter(s => s.status === 'up').length}/{systemStatus.length} Healthy
                  </span>
                </div>
                <div className="panel-body">
                  <div className="sys-list">
                    {systemStatus.map((s, i) => (
                      <div key={i} className="sys-item">
                        <div className="sys-icon" style={{ background:s.color, color:s.text }}>
                          <I n={s.icon} size={14} />
                        </div>
                        <span className="sys-name">{s.name}</span>
                        <span className={`sys-status sys-${s.status}`}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor", display:"inline-block" }} />
                          {s.status === "up" ? "Operational" : s.status === "warn" ? "Degraded" : "Down"}
                        </span>
                        <span className="sys-latency">{s.latency}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop:"16px", padding:"13px 14px", background:"linear-gradient(135deg,rgba(91,78,248,.07),rgba(39,201,176,.03))", border:"1px solid rgba(91,78,248,.14)", borderRadius:"10px" }}>
                    <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text3)", marginBottom:"8px" }}>
                      Resource Monitor
                    </div>
                    {resources.map((r, i) => (
                      <div key={i} style={{ marginBottom:"8px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                          <span style={{ fontSize:"10.5px", color:"var(--text2)" }}>{r.label}</span>
                          <span style={{ fontSize:"10px", fontWeight:700, color:r.color }}>{r.val}</span>
                        </div>
                        <div style={{ height:"3px", background:"var(--surface3)", borderRadius:"2px", overflow:"hidden" }}>
                          <div data-width={`${r.pct}%`} style={{ height:"100%", width:0, background:r.color, borderRadius:"2px", transition:"width 1.2s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}