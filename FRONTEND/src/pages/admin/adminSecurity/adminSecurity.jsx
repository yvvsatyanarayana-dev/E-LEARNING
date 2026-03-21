// adminSecurity.jsx — SMART CAMPUS Admin Panel
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./adminSecurity.css";

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
};
const I = ({ n, size = 16 }) => <Icon size={size} d={icons[n]} />;

const NAV = [
  { section:"Overview", items:[
    { id:"dashboard", label:"Dashboard",       icon:"grid",      routePath:"",               badge:null },
    { id:"analytics", label:"Analytics",       icon:"bar",       routePath:"adminAnalytics",  badge:null },
  ]},
  { section:"Management", items:[
    { id:"users",       label:"User Management", icon:"users",     routePath:"userManagement",   badge:null },
    { id:"courses",     label:"Courses",         icon:"book",      routePath:"courseManagement", badge:null },
    { id:"departments", label:"Departments",     icon:"layers",    routePath:"departments",      badge:null },
    { id:"placement",   label:"Placement",       icon:"briefcase", routePath:"placements",       badge:null, badgeType:"teal" },
  ]},
  { section:"Platform", items:[
    { id:"reports",   label:"Reports",      icon:"download", routePath:"adminReports", badge:null },
    { id:"activity",  label:"Activity Log", icon:"activity", routePath:"auditLogs",     badge:null, badgeType:"rose" },
    { id:"security",  label:"Security",     icon:"shield",   routePath:"security",     badge:null },
    { id:"settings",  label:"Settings",     icon:"settings", routePath:"settings",     badge:null },
  ]},
];

const getActiveId = (pathname) => {
  for (const sec of NAV) {
    for (const item of sec.items) {
      if (item.routePath === "") {
        if (pathname === "/admindashboard" || pathname === "/admindashboard/") return item.id;
      } else { if (pathname.includes(item.routePath)) return item.id; }
    }
  }
  return "dashboard";
};
import api from "../../../utils/api";

export default function AdminSecurity() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [sidebarOpen, setSidebar] = useState(false);
  const [stats, setStats] = useState({ alerts: 0, sessions: 0, rules_active: "0/0", uptime: "0%" });
  const [alerts, setAlerts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [rules, setRules] = useState([]);
  const [navBadges, setNavBadges] = useState({});
  const [configStats, setConfigStats] = useState({ uptime: "99.9%", cpu: "0%", memory: "0%", backup_size: "0GB" });
  const [loading, setLoading] = useState(true);

  const pageRef       = useRef(null);
  const cursorRef     = useRef(null);
  const cursorRingRef = useRef(null);
  const active = getActiveId(location.pathname);
  const now    = new Date().toLocaleDateString();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, aRes, sesRes, rRes, cRes, nb] = await Promise.all([
        api.get("/admin/dashboard/stats"), // Reuse for security stats if needed
        api.get("/admin/security/alerts"),
        api.get("/admin/security/sessions"),
        api.get("/admin/security/rules"),
        api.get("/admin/config/stats"),
        api.get("/admin/config/badges")
      ]);
      setStats(sRes);
      setAlerts(aRes);
      setSessions(sesRes);
      setRules(rRes);
      setConfigStats(cRes);
      setNavBadges(nb);
    } catch (err) {
      console.error("Failed to fetch security data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await api.post(`/admin/notifications/read/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  };

  const handleToggleRule = async (id) => {
    try {
      await api.post(`/admin/security/rules/${id}/toggle`);
      fetchData();
    } catch (err) {
      console.error("Failed to toggle rule", err);
    }
  };

  const handleExportAudit = async () => {
    try {
      const res = await api.post("/admin/reports/generate", { type: "Security Audit" });
      alert(`Audit Report Generated: ${res.filename}`);
      fetchData();
    } catch (err) {
      alert("Failed to generate audit report");
    }
  };

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
  }, [active, configStats]);

  return (
    <>
      <div className="sc-cursor" ref={cursorRef} />
      <div className="sc-cursor-ring" ref={cursorRingRef} />
      <div className="sc-noise" />
      <div className="app" ref={pageRef}>
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
            <span className="tb-page">Security</span>
            <div className="tb-sep" />
            <div className="tb-search"><I n="search" size={14} /><input placeholder="Search users, courses…" /></div>
            <div className="tb-right">
              <span className="tb-role-tag">Admin</span>
              <span className="tb-date">{now}</span>
              <button onClick={() => fetchData()} className="tb-icon-btn tooltip" data-tip="Refresh"><I n="refresh" size={15} /></button>
              <button onClick={() => navigate("/admindashboard/notifications")} className="tb-icon-btn tooltip" data-tip="Notifications"><I n="bell" size={15} /><span className="notif-dot" /></button>
              <button className="tb-icon-btn tooltip" data-tip="Settings" onClick={() => navigate("/admindashboard/settings")}><I n="settings" size={15} /></button>
            </div>
          </header>

          <main className="content">
            {/* ── GREETING ── */}
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">Security Center</span></div>
              <h1 className="greet-title">Security <em>Center.</em></h1>
              <p className="greet-sub">{stats.alerts} unresolved alerts &nbsp;·&nbsp; {stats.sessions} active sessions &nbsp;·&nbsp; Last scan: 6 hours ago</p>
              <div className="greet-actions">
                <button onClick={() => fetchData()} className="btn btn-solid"><I n="shield" size={14} /> Run Scan</button>
                <button onClick={handleExportAudit} className="btn btn-ghost"><I n="download" size={14} /> Export Audit</button>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="stat-grid">
              {[
                { accent:"sc-rose",   icon:"shield",   val:stats.alerts,     lbl:"Active Alerts",          delta:"2 critical" },
                { accent:"sc-amber",  icon:"users",    val:stats.sessions,     lbl:"Active Sessions",         delta:"right now" },
                { accent:"sc-teal",   icon:"check",    val:stats.rules_active,   lbl:"Security Rules Active",  delta:"1 disabled" },
                { accent:"sc-indigo", icon:"activity", val:stats.uptime, lbl:"Platform Uptime",         delta:"last 30 days" },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.accent}`} style={{ animationDelay:`${i * 80}ms`, cursor:"default" }}>
                  <div className="stat-ic"><I n={s.icon} size={16} /></div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                  <span className="stat-delta delta-neu">· {s.delta}</span>
                </div>
              ))}
            </div>

            {/* ALERTS + SESSIONS */}
            <div className="main-grid-wide">
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="shield" size={15} /> Security Alerts <span>{alerts.filter(x=>!x.resolved).length} unresolved</span></div>
                </div>
                <div className="panel-body">
                  {loading ? (
                      <div style={{ padding:"20px", textAlign:"center", color:"var(--text3)" }}>Loading alerts...</div>
                  ) : alerts.length === 0 ? (
                      <div style={{ padding:"20px", textAlign:"center", color:"var(--text3)" }}>No security alerts found.</div>
                  ) : alerts.map((a, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"13px", borderRadius:"10px", border:"1px solid var(--border)", background:"var(--surface2)", marginBottom:"8px", opacity: a.resolved ? .5 : 1, transition:"opacity .2s" }}>
                      <div style={{ width:32, height:32, borderRadius:"8px", background:`${a.color}20`, color:a.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <I n={a.icon} size={14} />
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"12.5px", fontWeight:600, color:"var(--text)", marginBottom:"3px" }}>{a.title}</div>
                        <div style={{ fontSize:"11px", color:"var(--text3)", marginBottom:"3px" }}>{a.detail}</div>
                        <div style={{ fontSize:"9.5px", color:"var(--text3)" }}>{a.time}</div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:"4px", alignItems:"flex-end" }}>
                        <span style={{ fontSize:"9px", fontWeight:700, padding:"2px 8px", borderRadius:"4px", textTransform:"uppercase", background:`${a.color}18`, color:a.color, border:`1px solid ${a.color}30` }}>{a.level}</span>
                        {a.resolved
                          ? <span style={{ fontSize:"9px", color:"var(--teal)", fontWeight:600 }}>Resolved</span>
                          : <button onClick={() => handleResolveAlert(a.id)} className="btn btn-sm btn-ghost" style={{ padding:"4px 10px", fontSize:"9.5px" }}>Resolve</button>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="users" size={15} /> Active Sessions</div>
                  <button onClick={() => {}} className="panel-act"><I n="x" size={12} /> Revoke All</button>
                </div>
                <div className="panel-body">
                  {loading ? (
                    <div style={{ padding:"20px", textAlign:"center", color:"var(--text3)" }}>Loading sessions...</div>
                  ) : sessions.length === 0 ? (
                    <div style={{ padding:"20px", textAlign:"center", color:"var(--text3)" }}>No active sessions found.</div>
                  ) : sessions.map((s, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                      <div className="ut-av" style={{ background:s.avC, color:s.avT, width:32, height:32 }}>{s.av}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"12px", fontWeight:600 }}>{s.user}</div>
                        <div style={{ fontSize:"10px", color:"var(--text3)", marginTop:"2px" }}>{s.ip} · {s.location}</div>
                        <div style={{ fontSize:"9.5px", color:"var(--text3)", marginTop:"2px" }}>{s.time}</div>
                      </div>
                      <button onClick={() => {}} className="ut-action tooltip" data-tip="Revoke Session"><I n="x" size={11} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECURITY RULES */}
            <div className="panel">
              <div className="panel-hd">
                <div className="panel-ttl"><I n="settings" size={15} /> Security Rules <span>{stats.rules_active} active</span></div>
              </div>
              <div className="panel-body">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  {rules.map((r, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", padding:"14px 16px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"10px" }}>
                      <div>
                        <div style={{ fontSize:"12px", fontWeight:600, marginBottom:"3px" }}>{r.name}</div>
                        <div style={{ fontSize:"10.5px", color:"var(--text3)" }}>{r.desc}</div>
                      </div>
                      <div 
                        onClick={() => handleToggleRule(r.id)}
                        style={{ width:38, height:20, borderRadius:10, background: r.on ? "rgba(39,201,176,.25)" : "var(--surface3)", border:`1px solid ${r.on ? "var(--teal)" : "var(--border2)"}`, cursor:"pointer", position:"relative", flexShrink:0 }}>
                        <div style={{ position:"absolute", top:2, left: r.on ? 20 : 2, width:14, height:14, borderRadius:"50%", background: r.on ? "var(--teal)" : "var(--text3)", transition:"left .2s,background .2s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}