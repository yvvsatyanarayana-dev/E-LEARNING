import { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";
import { useNavigate, useLocation } from "react-router-dom";
import "./Placement.css";
import "../../../styles/modals.css";
import { Modal, FormField, FormSelect, exportToCSV, storage } from "../../../utils/formModals";

const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const icons = {
  grid:<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  users:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  book:<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
  bar:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  bell:<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  search:<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  menu:<><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  edit:<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></>,
  shield:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  zap:<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  cpu:<><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></>,
  db:<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
  wifi:<><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  award:<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
  trend:<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  layers:<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  globe:<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  check:<><polyline points="20 6 9 17 4 12"/></>,
  info:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  chevronR:<><polyline points="9 18 15 12 9 6"/></>,
  chevronL:<><polyline points="15 18 9 12 15 6"/></>,
  moreH:<><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  userPlus:<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
  download:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  refresh:<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  briefcase:<><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  activity:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  mail:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
};
const I = ({ n, size = 16 }) => <Icon size={size} d={icons[n]} />;

function buildNav(navBadges = {}) {
  return [
    { section: "Overview", items: [
      { id: "dashboard", label: "Dashboard",       icon: "grid",      routePath: "",               badge: null },
      { id: "analytics", label: "Analytics",       icon: "bar",       routePath: "analytics",      badge: null },
    ]},
    { section: "Management", items: [
      { id: "users",       label: "User Management", icon: "users",     routePath: "users",          badge: null },
      { id: "courses",     label: "Courses",         icon: "book",      routePath: "courses",        badge: null },
      { id: "departments", label: "Departments",     icon: "layers",    routePath: "departments",    badge: null },
      { id: "placement",   label: "Placement",       icon: "briefcase", routePath: "placements",     badge: null, badgeType: "teal" },
    ]},
    { section: "Platform", items: [
      { id: "reports",   label: "Reports",      icon: "download", routePath: "reports",   badge: null },
      { id: "activity",  label: "Activity Log", icon: "activity", routePath: "auditlogs", badge: null, badgeType: "rose" },
      { id: "mail",      label: "Mail System",  icon: "mail",     routePath: "mail",      badge: navBadges.mail || 0, badgeType: "teal" },
      { id: "security",  label: "Security",     icon: "shield",   routePath: "security",  badge: null },
      { id: "settings",  label: "Profile",      icon: "user",     routePath: "settings",  badge: null },
    ]},
  ];
}

const getActiveId = (pathname) => {
  const NAV = buildNav();
  for (const sec of NAV) {
    for (const item of sec.items) {
      if (item.routePath === "") {
        if (pathname === "/admindashboard" || pathname === "/admindashboard/") return item.id;
      } else { if (pathname.includes(`/admindashboard/${item.routePath}`)) return item.id; }
    }
  }
  return "dashboard";
};

export default function Placement() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [sidebarOpen, setSidebar] = useState(false);
  const [addDriveModal, setAddDriveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [formData, setFormData] = useState({ company: "", date: "", time: "", positions: 0, eligibility: "", status: "upcoming" });
  const [drives, setDrives] = useState([]);
  const [stats, setStats] = useState({ placed_count: 0, companies_visited: 0, avg_pri: 0, highest_pkg: "N/A", drives_count: 0, dept_breakdown: [], pri_distribution: [], total_students: 0 });
  const [navBadges, setNavBadges] = useState({});
  const [configStats, setConfigStats] = useState({ uptime: "99.9%", cpu: "0%", memory: "0%", backup_size: "0GB" });
  const [loading, setLoading] = useState(true);
  const cursorRef     = useRef(null);
  const cursorRingRef = useRef(null);
  const pageRef       = useRef(null);
  const active = getActiveId(location.pathname);
  const now    = new Date().toLocaleDateString();

  const NAV = buildNav(navBadges);

  const fetchMailCount = async () => {
    try {
      const res = await api.get("/mail/unread/count");
      setNavBadges(prev => ({ ...prev, mail: res.count || 0 }));
    } catch (err) {
      console.error("Failed to poll mail count", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [driveData, statData, nb, cs] = await Promise.all([
        api.get("/admin/placement/drives"),
        api.get("/admin/placement/stats"),
        api.get("/admin/config/badges"),
        api.get("/admin/config/stats")
      ]);
      setDrives(driveData);
      setStats(statData);
      setNavBadges(nb);
      setConfigStats(cs);
    } catch (err) {
      console.error("Failed to fetch placement data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load drives and stats from API
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchMailCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cursor animation effect
  useEffect(() => {
    const cursor = cursorRef.current; const cursorRing = cursorRingRef.current;
    if (!cursor || !cursorRing) return;
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    const onMove = (e) => { 
      mouseX = e.clientX; mouseY = e.clientY; 
      if (cursor) {
        cursor.style.opacity = "1";
        cursor.style.transform = `translate(${mouseX}px,${mouseY}px)`; 
      }
      if (cursorRing) {
        cursorRing.style.opacity = "1";
        cursorRing.style.transform = `translate(${mouseX}px,${mouseY}px)`; 
      }
    };
    let raf;
    const animate = () => { ringX += (mouseX - ringX) * 0.12; ringY += (mouseY - ringY) * 0.12; cursorRing.style.transform = `translate(${ringX}px,${ringY}px)`; raf = requestAnimationFrame(animate); };
    window.addEventListener("mousemove", onMove); raf = requestAnimationFrame(animate);

    const handleHover = () => document.querySelector(".admin-placements-page")?.classList.add("c-hover");
    const handleUnhover = () => document.querySelector(".admin-placements-page")?.classList.remove("c-hover");
    const handleClick = () => {
      const p = document.querySelector(".admin-placements-page");
      p?.classList.add("c-click"); setTimeout(() => p?.classList.remove("c-click"), 200);
    };
    const interactive = document.querySelectorAll("button, a, input, .stat-card, .drive-item, .ut-action");
    interactive.forEach(el => { el.addEventListener("mouseenter", handleHover); el.addEventListener("mouseleave", handleUnhover); });
    window.addEventListener("mousedown", handleClick);

    return () => { 
      window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); 
      interactive.forEach(el => { el.removeEventListener("mouseenter", handleHover); el.removeEventListener("mouseleave", handleUnhover); });
      window.removeEventListener("mousedown", handleClick);
    };
  }, [loading, drives]);

  const handleRefresh = () => {
    fetchData();
    fetchMailCount();
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add new placement drive
  const handleAddDrive = async () => {
    if (!formData.company.trim() || !formData.date || !formData.positions) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      await api.post("/admin/placement/drives", formData);
      setFormData({ company: "", date: "", time: "", positions: 0, eligibility: "", status: "upcoming" });
      setAddDriveModal(false);
      const data = await api.get("/admin/placement/drives");
      setDrives(data);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add placement drive");
    }
  };

  // Delete placement drive
  const handleDeleteDrive = async (id, company) => {
    if (confirm(`Are you sure you want to delete this placement drive?`)) {
      try {
        await api.delete(`/admin/placement/drives/${id}`);
        setDrives(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        alert("Failed to delete placement drive");
      }
    }
  };

  // Filter placement drives
  const filteredDrives = drives.filter(d => {
    const matchSearch = d.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "All Status" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

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

  useEffect(() => {
    const fills = document.querySelectorAll("[data-width]");
    const timeout = setTimeout(() => { fills.forEach(el => { el.style.width = el.dataset.width; }); }, 300);
    return () => clearTimeout(timeout);
  }, [active]);

  return (
    <>
      <div className="sc-cursor"      ref={cursorRef} />
      <div className="sc-cursor-ring" ref={cursorRingRef} />
      <div className="sc-noise" />
      <div className="admin-placements-page app" ref={pageRef}>
        <div className={`sb-overlay ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebar(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? "sb-open" : ""}`}>
          <div className="sb-top">
            <a href="/admindashboard" className="sb-brand" onClick={e => { e.preventDefault(); navigate("/admindashboard"); }}>
              <div className="sb-mark">SC</div><span className="sb-name">Smart Campus</span>
            </a>
            <button className="sb-mobile-close" onClick={() => setSidebar(false)}><I n="x" size={14} /></button>
          </div>
          <div className="sb-user">
            <div className="sb-avatar">SA</div>
            <div><div className="sb-uname">Super Admin</div><div className="sb-urole">System Administrator</div></div>
          </div>
          <nav className="sb-nav">
            {NAV.map(sec => (
              <div key={sec.section}>
                <div className="sb-sec-label">{sec.section}</div>
                {sec.items.map(item => (
                  <a key={item.id}
                    href={item.routePath === "" ? "/admindashboard" : `/admindashboard/${item.routePath}`}
                    className={`sb-link ${active === item.id ? "active" : ""}`}
                    onClick={e => { e.preventDefault(); navigate(item.routePath === "" ? "/admindashboard" : `/admindashboard/${item.routePath}`); setSidebar(false); }}>
                    <I n={item.icon} size={15} />{item.label}
                    {navBadges[item.id] > 0 && <span className={`sb-badge ${item.badgeType || ""}`}>{navBadges[item.id]}</span>}
                  </a>
                ))}
              </div>
            ))}
          </nav>
          <div className="sb-bottom">
            <div className="sb-health">
              <div className="sb-health-lbl">System Health</div>
              {[
                { n: "Uptime", v: configStats.uptime },
                { n: "CPU",    v: configStats.cpu },
                { n: "Memory", v: configStats.memory }
              ].map((item) => (
                <div key={item.n}>
                  <div className="sb-health-row"><span className="sb-health-name">{item.n}</span><span className="sb-health-val">{item.v}</span></div>
                  <div className="sb-health-bar"><div className="sb-health-fill" style={{ width: item.v.includes("%") ? item.v : "60%" }} /></div>
                </div>
              ))}
            </div>
            <button className="sb-logout" onClick={() => navigate("/login")}><I n="logout" size={14} /> Sign Out</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <header className="topbar">
            <button className="tb-hamburger" onClick={() => setSidebar(true)}><I n="menu" size={16} /></button>
            <span className="tb-page">Placement</span>
            <div className="tb-sep" />
            <div className="tb-search"><I n="search" size={14} /><input placeholder="Search users, courses…" /></div>
            <div className="tb-right">
              <span className="tb-role-tag">Admin</span>
              <span className="tb-date">{now}</span>
              <button onClick={handleRefresh} className="tb-icon-btn tooltip" data-tip="Refresh"><I n="refresh" size={15} /></button>
              <button onClick={() => navigate("/admindashboard/notifications")} className="tb-icon-btn tooltip" data-tip="Notifications"><I n="bell" size={15} /><span className="notif-dot" /></button>
              <button className="tb-icon-btn tooltip" data-tip="Settings" onClick={() => navigate("/admindashboard/settings")}><I n="settings" size={15} /></button>
            </div>
          </header>

          <main className="content">
            {/* ── GREETING ── */}
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">Placement Hub</span></div>
              <h1 className="greet-title">Placement <em>Hub.</em></h1>
              <p className="greet-sub">{stats.placed_count} students placed &nbsp;·&nbsp; {stats.drives_count} drives scheduled &nbsp;·&nbsp; Highest {stats.highest_pkg} &nbsp;·&nbsp; {stats.avg_pri}% Avg PRI</p>
              <div className="greet-actions">
                <button onClick={() => setAddDriveModal(true)} className="btn btn-solid"><I n="plus" size={14} /> Schedule Drive</button>
                <button onClick={async () => {
                  try {
                    const res = await api.post("/admin/reports/generate", { type: "Placement" });
                    alert(`Placement Report Generated: ${res.filename}`);
                  } catch (err) { alert("Failed to generate report"); }
                }} className="btn btn-ghost"><I n="download" size={14} /> Export Report</button>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="stat-grid">
              {[
                { accent:"sc-teal",   icon:"award",     val:stats.placed_count,    lbl:"Students Placed",    delta:"+24 this month" },
                { accent:"sc-indigo", icon:"briefcase", val:stats.companies_visited, lbl:"Companies Visited",  delta:"this batch" },
                { accent:"sc-amber",  icon:"trend",     val:`${stats.avg_pri}%`,    lbl:"Avg PRI Score",      delta:"+5.2% vs last" },
                { accent:"sc-violet", icon:"zap",       val:stats.highest_pkg, lbl:"Highest Package",    delta:"Recent" },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.accent}`} style={{ animationDelay:`${i * 80}ms`, cursor:"default" }}>
                  <div className="stat-ic"><I n={s.icon} size={16} /></div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                  <span className="stat-delta delta-up">↑ {s.delta}</span>
                </div>
              ))}
            </div>

            {/* TAB ROW */}
            <div className="tab-row">
              {["Company Drives","Student Tracker","Analytics"].map(t => (
                <button key={t} className={`tab-btn ${t === "Company Drives" ? "active" : ""}`}>{t}</button>
              ))}
            </div>

            {/* DRIVE CARDS */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px", marginBottom:"16px" }}>
              {filteredDrives.length > 0 ? filteredDrives.map((c, i) => (
                <div key={i} style={{ background:"var(--surface2)", border:`1px solid ${c.color}20`, borderRadius:"14px", padding:"18px", animationDelay:`${i*60}ms` }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
                    <div style={{ width:42, height:42, borderRadius:"11px", background:`${c.color}18`, color:c.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:800 }}>{c.logo}</div>
                    <span style={{ fontSize:"9px", fontWeight:700, padding:"3px 9px", borderRadius:"5px",
                      background: c.status==="completed" ? "rgba(39,201,176,.1)" : c.status==="scheduled" ? "rgba(91,78,248,.1)" : "rgba(244,165,53,.1)",
                      color:      c.status==="completed" ? "var(--teal)"         : c.status==="scheduled" ? "var(--indigo-ll)"  : "var(--amber)" }}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </div>
                  <div style={{ fontSize:"16px", fontWeight:700, color:"var(--text)", marginBottom:"3px" }}>{c.company}</div>
                  <div style={{ fontSize:"10.5px", color:"var(--text3)", marginBottom:"12px" }}>{c.date} at {c.time}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"12px" }}>
                    {[[c.positions,"Positions","users"],[c.pkg,"Package","award"]].map(([v,l,ic]) => (
                      <div key={l} style={{ background:"var(--surface3)", borderRadius:"8px", padding:"8px 10px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"2px" }}><I n={ic} size={11} /><span style={{ fontSize:"9px", color:"var(--text3)" }}>{l}</span></div>
                        <div style={{ fontSize:"14px", fontWeight:700, color:c.color }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="dept-bar" style={{ height:"4px", marginBottom:"5px" }}>
                    <div className="dept-fill" data-width={`${c.pct}%`} style={{ width:0, background:c.color }} />
                  </div>
                  <div style={{ fontSize:"9.5px", color:"var(--text3)", marginBottom:"12px" }}>{c.pct}% of registered students selected</div>
                  <div style={{ display:"flex", gap:"6px" }}>
                    <button onClick={() => alert("Manage " + c.company)} className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:"center" }}><I n="edit" size={11} /> Manage</button>
                    {c.status === "upcoming" && <button onClick={() => handleDeleteDrive(c.id, c.company)} className="btn btn-solid btn-sm"><I n="trash" size={11} /></button>}
                  </div>
                </div>
              )) : <div style={{ gridColumn:"1/-1", padding:"40px", textAlign:"center", color:"var(--text3)" }}>No placement drives scheduled</div>}
            </div>

            {/* BOTTOM: DEPT BREAKDOWN + PRI SCORES */}
            <div className="main-grid">
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="bar" size={15} /> Placement by Department</div>
                </div>
                <div className="panel-body">
                  {stats.dept_breakdown.map((d, i) => (
                    <div key={i} style={{ marginBottom:"14px" }}>
                      <div className="dept-top">
                        <span className="dept-name">{d.dept}</span>
                        <span className="dept-meta">{d.total} students</span>
                        <span className="dept-pct" style={{ color:d.color }}>{d.pct}%</span>
                      </div>
                      <div className="dept-bar"><div className="dept-fill" data-width={`${d.pct}%`} style={{ width:0, background:d.color }} /></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="trend" size={15} /> PRI Score Distribution</div>
                </div>
                <div className="panel-body">
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:"48px", color:"var(--teal)", textAlign:"center", lineHeight:1, marginBottom:"4px" }}>{stats.avg_pri}%</div>
                  <div style={{ textAlign:"center", fontSize:"11px", color:"var(--text3)", marginBottom:"16px" }}>Average Placement Readiness Index</div>
                  {stats.pri_distribution.map((r, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                      <span style={{ fontSize:"11px", color:"var(--text3)", width:"80px", flexShrink:0 }}>{r.range}</span>
                      <div style={{ flex:1, height:"6px", background:"var(--surface3)", borderRadius:"3px", overflow:"hidden" }}>
                        <div data-width={`${stats.total_students ? (r.count/stats.total_students)*100 : 0}%`} style={{ height:"100%", width:0, background:r.color, borderRadius:"3px", transition:"width 1.2s ease" }} />
                      </div>
                      <span style={{ fontSize:"11px", fontWeight:600, color:r.color, width:"30px", textAlign:"right" }}>{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ADD PLACEMENT DRIVE MODAL */}
            {addDriveModal && (
              <div className="modal-overlay open" onClick={() => setAddDriveModal(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Schedule Placement Drive</h2>
                    <button className="modal-close" onClick={() => setAddDriveModal(false)}><I n="x" size={16} /></button>
                  </div>
                  <div className="modal-body">
                    <FormField label="Company Name" required>
                      <input type="text" className="form-input" value={formData.company} onChange={(e) => handleFormChange("company", e.target.value)} placeholder="e.g., TCS, Google" />
                    </FormField>
                    <FormField label="Date" required>
                      <input type="date" className="form-input" value={formData.date} onChange={(e) => handleFormChange("date", e.target.value)} />
                    </FormField>
                    <FormField label="Time">
                      <input type="time" className="form-input" value={formData.time} onChange={(e) => handleFormChange("time", e.target.value)} />
                    </FormField>
                    <FormField label="Number of Positions" required>
                      <input type="number" className="form-input" value={formData.positions} onChange={(e) => handleFormChange("positions", e.target.value)} min="1" />
                    </FormField>
                    <FormField label="Eligibility Criteria">
                      <textarea className="form-input" value={formData.eligibility} onChange={(e) => handleFormChange("eligibility", e.target.value)} placeholder="e.g., CGPA >= 7.0" style={{ minHeight: "80px", resize: "vertical" }} />
                    </FormField>
                    <FormField label="Status" required>
                      <select className="form-input" value={formData.status} onChange={(e) => handleFormChange("status", e.target.value)}>
                        <option>upcoming</option>
                        <option>scheduled</option>
                        <option>completed</option>
                      </select>
                    </FormField>
                  </div>
                  <div className="modal-footer">
                    <button onClick={() => setAddDriveModal(false)} className="btn btn-ghost">Cancel</button>
                    <button onClick={handleAddDrive} className="btn btn-solid">Schedule Drive</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}