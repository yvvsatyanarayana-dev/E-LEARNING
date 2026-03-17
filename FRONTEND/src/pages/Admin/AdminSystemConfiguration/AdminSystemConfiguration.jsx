// AdminSystemConfiguration.jsx — SMART CAMPUS Admin Panel
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminSystemConfiguration.css";

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
    { id:"users",       label:"User Management", icon:"users",     routePath:"userManagement",   badge:"1.3k" },
    { id:"courses",     label:"Courses",         icon:"book",      routePath:"courseManagement", badge:"47" },
    { id:"departments", label:"Departments",     icon:"layers",    routePath:"department",       badge:null },
    { id:"placement",   label:"Placement",       icon:"briefcase", routePath:"placement",        badge:"3", badgeType:"teal" },
  ]},
  { section:"Platform", items:[
    { id:"reports",   label:"Reports",      icon:"download", routePath:"adminReports", badge:null },
    { id:"activity",  label:"Activity Log", icon:"activity", routePath:"activitylog",  badge:"12", badgeType:"rose" },
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

export default function AdminSystemConfiguration() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [sidebarOpen, setSidebar] = useState(false);
  const pageRef       = useRef(null);
  const cursorRef     = useRef(null);
  const cursorRingRef = useRef(null);
  const active = getActiveId(location.pathname);
  const now    = new Date().toLocaleDateString();

  const handleExportConfig = () => {
    const csvContent = "data:text/csv;charset=utf-8,Config Key,Config Value\nSystem_State,Healthy";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "system_config.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  }, [active]);

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
                    {item.badge && <span className={`sb-badge ${item.badgeType || ""}`}>{item.badge}</span>}
                  </a>
                ))}
              </div>
            ))}
          </nav>
          <div className="sb-bottom">
            <div className="sb-health">
              <div className="sb-health-lbl">System Health</div>
              {[["Uptime","99.8%"],["CPU","34%"],["Memory","61%"]].map(([n,v]) => (
                <div key={n}>
                  <div className="sb-health-row"><span className="sb-health-name">{n}</span><span className="sb-health-val">{v}</span></div>
                  <div className="sb-health-bar"><div className="sb-health-fill" data-width={v} style={{ width:0 }} /></div>
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
            <span className="tb-page">System Configuration</span>
            <div className="tb-sep" />
            <div className="tb-search"><I n="search" size={14} /><input placeholder="Search users, courses…" /></div>
            <div className="tb-right">
              <span className="tb-role-tag">Admin</span>
              <span className="tb-date">{now}</span>
              <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} className="tb-icon-btn tooltip" data-tip="Refresh"><I n="refresh" size={15} /></button>
              <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} className="tb-icon-btn tooltip" data-tip="Notifications"><I n="bell" size={15} /><span className="notif-dot" /></button>
              <button className="tb-icon-btn tooltip" data-tip="Settings" onClick={() => navigate("/admindashboard/settings")}><I n="settings" size={15} /></button>
            </div>
          </header>

          <main className="content">
            {/* ── GREETING ── */}
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">System Config</span></div>
              <h1 className="greet-title">System <em>Configuration.</em></h1>
              <p className="greet-sub">Infrastructure status, resource monitor, and environment variables &nbsp;·&nbsp; 5/6 services healthy</p>
              <div className="greet-actions">
                <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} className="btn btn-solid"><I n="refresh" size={14} /> Restart</button>
                <button onClick={handleExportConfig} className="btn btn-ghost"><I n="download" size={14} /> Export Config</button>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="stat-grid">
              {[
                { accent:"sc-teal",   icon:"activity", val:"99.8%", lbl:"Overall Uptime",       delta:"last 30 days" },
                { accent:"sc-indigo", icon:"cpu",      val:"34%",   lbl:"Avg CPU Usage",        delta:"below threshold" },
                { accent:"sc-amber",  icon:"zap",      val:"1",     lbl:"Degraded Services",    delta:"WebRTC" },
                { accent:"sc-violet", icon:"db",       val:"2.4GB", lbl:"Last Backup Size",     delta:"6 hrs ago" },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.accent}`} style={{ animationDelay:`${i * 80}ms`, cursor:"default" }}>
                  <div className="stat-ic"><I n={s.icon} size={16} /></div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                  <span className="stat-delta delta-neu">· {s.delta}</span>
                </div>
              ))}
            </div>

            {/* SERVICE STATUS + ACTIONS */}
            <div className="main-grid-wide">
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="cpu" size={15} /> Service Status</div>
                  <span style={{ fontSize:"10px", padding:"3px 9px", borderRadius:"5px", background:"rgba(39,201,176,.1)", color:"var(--teal)", fontWeight:600 }}>5/6 Healthy</span>
                </div>
                <div className="panel-body">
                  {[
                    { name:"API Server",    icon:"zap",    status:"up",   latency:"38ms",  cpu:"12%", mem:"340 MB", color:"rgba(91,78,248,.15)",  text:"var(--indigo-ll)" },
                    { name:"Database",      icon:"db",     status:"up",   latency:"12ms",  cpu:"8%",  mem:"1.2 GB", color:"rgba(39,201,176,.12)", text:"var(--teal)" },
                    { name:"WebRTC Server", icon:"wifi",   status:"warn", latency:"110ms", cpu:"42%", mem:"780 MB", color:"rgba(244,165,53,.12)", text:"var(--amber)" },
                    { name:"File Storage",  icon:"layers", status:"up",   latency:"24ms",  cpu:"5%",  mem:"200 MB", color:"rgba(91,78,248,.15)",  text:"var(--indigo-ll)" },
                    { name:"Email Service", icon:"globe",  status:"up",   latency:"66ms",  cpu:"3%",  mem:"110 MB", color:"rgba(39,201,176,.12)", text:"var(--teal)" },
                    { name:"Cache (Redis)", icon:"zap",    status:"up",   latency:"2ms",   cpu:"1%",  mem:"512 MB", color:"rgba(244,165,53,.12)", text:"var(--amber)" },
                  ].map((s, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:s.color, color:s.text, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <I n={s.icon} size={14} />
                      </div>
                      <span style={{ fontSize:"12px", fontWeight:600, flex:1 }}>{s.name}</span>
                      <span style={{ fontSize:"10px", color:"var(--text3)", marginRight:"4px" }}>CPU {s.cpu}</span>
                      <span style={{ fontSize:"10px", color:"var(--text3)", marginRight:"8px" }}>{s.mem}</span>
                      <span style={{ fontSize:"10px", fontWeight:600, padding:"2px 9px", borderRadius:"5px", display:"flex", alignItems:"center", gap:"4px", background: s.status==="up" ? "rgba(39,201,176,.1)" : "rgba(244,165,53,.1)", color: s.status==="up" ? "var(--teal)" : "var(--amber)" }}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor", display:"inline-block" }} />
                        {s.status === "up" ? "Operational" : "Degraded"}
                      </span>
                      <span style={{ fontSize:"9.5px", color:"var(--text3)", marginLeft:"6px", minWidth:"44px", textAlign:"right" }}>{s.latency}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="activity" size={15} /> Quick Actions</div>
                </div>
                <div className="panel-body">
                  {[
                    { label:"Restart API Server",  icon:"refresh", color:"var(--indigo-l)" },
                    { label:"Clear Redis Cache",    icon:"zap",     color:"var(--amber)" },
                    { label:"Force DB Backup",      icon:"db",      color:"var(--teal)" },
                    { label:"Reload Nginx Config",  icon:"globe",   color:"var(--violet)" },
                    { label:"View Error Logs",      icon:"activity",color:"var(--rose)" },
                  ].map((a, i) => (
                    <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} key={i} style={{ display:"flex", alignItems:"center", gap:"10px", width:"100%", padding:"10px 12px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"9px", cursor:"pointer", marginBottom:"6px", transition:"all .18s" }}>
                      <div style={{ width:28, height:28, borderRadius:7, background:`${a.color}18`, color:a.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <I n={a.icon} size={13} />
                      </div>
                      <span style={{ fontSize:"12px", fontWeight:500, color:"var(--text2)", flex:1 }}>{a.label}</span>
                      <I n="chevronR" size={12} />
                    </button>
                  ))}
                </div>
                <div style={{ padding:"0 20px 20px" }}>
                  <div style={{ padding:"13px 14px", background:"linear-gradient(135deg,rgba(91,78,248,.07),rgba(39,201,176,.03))", border:"1px solid rgba(91,78,248,.14)", borderRadius:"10px" }}>
                    <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text3)", marginBottom:"8px" }}>Resource Monitor</div>
                    {[
                      { label:"CPU Usage", val:"34%", pct:34, color:"var(--indigo-l)" },
                      { label:"RAM",       val:"61%", pct:61, color:"var(--violet)" },
                      { label:"Disk",      val:"48%", pct:48, color:"var(--teal)" },
                      { label:"Bandwidth", val:"27%", pct:27, color:"var(--amber)" },
                    ].map((r, i) => (
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

            {/* ENV VARS */}
            <div className="panel">
              <div className="panel-hd">
                <div className="panel-ttl"><I n="settings" size={15} /> Environment Variables</div>
                <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} className="btn btn-ghost btn-sm"><I n="plus" size={12} /> Add Variable</button>
              </div>
              <div className="panel-body">
                <table className="user-table">
                  <thead><tr><th>Key</th><th>Value</th><th>Sensitive</th><th></th></tr></thead>
                  <tbody>
                    {[
                      { key:"NODE_ENV",        value:"production",            sensitive:false },
                      { key:"DB_HOST",         value:"db.campus.local",       sensitive:false },
                      { key:"DB_PORT",         value:"5432",                  sensitive:false },
                      { key:"JWT_SECRET",      value:"••••••••••••",          sensitive:true  },
                      { key:"SMTP_HOST",       value:"smtp.sendgrid.net",     sensitive:false },
                      { key:"REDIS_URL",       value:"redis://cache.campus.local", sensitive:false },
                      { key:"S3_BUCKET",       value:"smart-campus-prod",     sensitive:false },
                      { key:"API_RATE_LIMIT",  value:"1000/hr",               sensitive:false },
                    ].map((v, i) => (
                      <tr key={i}>
                        <td><code style={{ fontFamily:"monospace", fontSize:"11px", color:"var(--indigo-ll)", background:"rgba(91,78,248,.08)", padding:"2px 6px", borderRadius:"4px" }}>{v.key}</code></td>
                        <td style={{ fontSize:"11px", color:"var(--text2)", fontFamily:"monospace" }}>{v.value}</td>
                        <td>{v.sensitive && <span className="status-tag status-pending"><span className="status-dot" />Hidden</span>}</td>
                        <td><div style={{ display:"flex", gap:"5px" }}>
                          <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} className="ut-action tooltip" data-tip="Edit"><I n="edit" size={11} /></button>
                          <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} className="ut-action tooltip" data-tip="Delete"><I n="trash" size={11} /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}