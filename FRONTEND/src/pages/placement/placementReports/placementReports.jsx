import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./placementReports.css";

const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

const reports = [
  { icon:"📊", title:"Q4 Placement Analytics Report",   desc:"Full placement stats for Q4 AY 2024–25 across all branches and companies.", date:"Mar 10, 2025", type:"Analytics",  size:"2.4 MB", status:"Ready" },
  { icon:"🏢", title:"Company Engagement Report",        desc:"Summary of all companies visited, drives conducted, and offers made.", date:"Mar 08, 2025", type:"Companies",  size:"1.8 MB", status:"Ready" },
  { icon:"👥", title:"Student Placement Status Report",  desc:"Individual student placement status with PRI score and skill breakdown.", date:"Mar 07, 2025", type:"Students",   size:"3.1 MB", status:"Ready" },
  { icon:"📈", title:"Branch-wise Placement Report",     desc:"Placement rate, average package, and top companies per department.", date:"Mar 05, 2025", type:"Analytics",  size:"1.2 MB", status:"Ready" },
  { icon:"🎯", title:"PRI Score Distribution Report",    desc:"Placement Readiness Index breakdown across all student cohorts.", date:"Mar 03, 2025", type:"Students",   size:"0.9 MB", status:"Ready" },
  { icon:"💼", title:"Internship Conversion Report",     desc:"PPO conversion rates and internship performance metrics.", date:"Feb 28, 2025", type:"Internships",size:"1.5 MB", status:"Ready" },
  { icon:"📋", title:"Semester Summary Report",          desc:"Complete semester overview for AY 2024–25 Sem 5.", date:"Feb 25, 2025", type:"Summary",    size:"4.2 MB", status:"Generating" },
  { icon:"🔍", title:"Skill Gap Analysis Report",        desc:"Analysis of skill gaps vs industry requirements for each branch.", date:"Feb 20, 2025", type:"Analytics",  size:"2.0 MB", status:"Ready" },
];

const typeColors = { "Analytics":"badge-indigo", "Companies":"badge-amber", "Students":"badge-teal", "Internships":"badge-violet", "Summary":"badge-rose" };

export default function PlacementReports() {
  const [filter, setFilter] = useState("All");
  const [generating, setGenerating] = useState(false);
  const curRef = useRef(null); const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0), rx = useRef(0), ry = useRef(0);

  useEffect(() => {
    const onMove = e => { mx.current = e.clientX; my.current = e.clientY; if (curRef.current) { curRef.current.style.left = e.clientX + "px"; curRef.current.style.top = e.clientY + "px"; } };
    const onDown = () => document.body.classList.add("c-click");
    const onUp = () => document.body.classList.remove("c-click");
    document.addEventListener("mousemove", onMove); document.addEventListener("mousedown", onDown); document.addEventListener("mouseup", onUp);
    let raf; const loop = () => { rx.current += (mx.current - rx.current) * 0.14; ry.current += (my.current - ry.current) * 0.14; if (ringRef.current) { ringRef.current.style.left = rx.current + "px"; ringRef.current.style.top = ry.current + "px"; } raf = requestAnimationFrame(loop); }; loop();
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mousedown", onDown); document.removeEventListener("mouseup", onUp); cancelAnimationFrame(raf); };
  }, []);

  const filtered = filter === "All" ? reports : reports.filter(r => r.type === filter);

  return (
    <>
      <div className="sc-cursor" ref={curRef} /><div className="sc-cursor-ring" ref={ringRef} /><div className="sc-noise" />
      <div className="app">
        <aside className="sidebar">
          <div className="sb-top"><a className="sb-brand" href="#"><div className="sb-mark">SC</div><span className="sb-name">SmartCampus</span></a></div>
          <div className="sb-user"><div className="sb-avatar">KR</div><div><div className="sb-uname">Ms. Kavitha R</div><div className="sb-urole">Placement Officer</div></div></div>
          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/placementAnalytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>
            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students" badge="316" badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies" badge="5" badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink to="/placementdashboard/drives" badge="3" badgeCls="rose" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
            <SbLink to="/placementdashboard/offers-placed" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers & Placed</SbLink>
            <SbLink to="/placementdashboard/internships" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/ai-assistant" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink active to="/placementdashboard/reports" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>
          <div className="sb-bottom">
            <div className="sb-pri"><div className="sb-pri-lbl">Placement Rate</div><div className="sb-pri-val">68%</div><div className="sb-pri-sub">+6% vs last year · AY 2024–25</div><div className="sb-pri-bar"><div className="sb-pri-fill" style={{ width: "68%" }} /></div></div>
            <button className="sb-logout" onClick={() => alert('Signing out...')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <span className="tb-page">Reports</span>
            <div className="tb-sep" />
            <div className="tb-search"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text3)", flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search reports…" /></div>
            <div className="tb-right">
              <span className="tb-date">Tue, 10 Mar</span>
              <button className="btn btn-solid" style={{ fontSize:10, padding:"8px 14px" }} onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2500); }}>
                {generating ? "Generating…" : "+ Generate Report"}
              </button>
            </div>
          </header>

          <div className="content">
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">8 Reports · AY 2024–25</span></div>
              <h1 className="greet-title">Placement <em>Reports</em></h1>
              <p className="greet-sub">Download, share, or generate new placement reports for any time period or metric.</p>
            </div>

            <div className="stat-grid" style={{ marginBottom: 18 }}>
              {[
                { label:"Total Reports",  val:"24",  color:"indigo", delta:"This academic year" },
                { label:"Downloaded",     val:"186", color:"teal",   delta:"By officers and HODs" },
                { label:"Shared",         val:"42",  color:"amber",  delta:"With management" },
                { label:"Scheduled",      val:"3",   color:"violet", delta:"Auto-generate enabled" },
              ].map(s => (
                <div key={s.label} className={`stat-card sc-${s.color}`} style={{ animationDelay: ".05s" }}>
                  <div className="stat-val" style={s.color !== "indigo" ? { color: `var(--${s.color})` } : {}}>{s.val}</div>
                  <div className="stat-lbl">{s.label}</div>
                  <span className="stat-delta delta-up">{s.delta}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <div className="filter-row">
                {["All","Analytics","Students","Companies","Internships","Summary"].map(f => (
                  <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {filtered.map(r => (
                <div key={r.title} className="panel" style={{ margin: 0 }}>
                  <div style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>{r.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{r.title}</div>
                        <Badge cls={r.status === "Generating" ? "badge-amber" : "badge-teal"} dot>{r.status}</Badge>
                      </div>
                      <p style={{ fontSize: 11.5, color: "var(--text3)", lineHeight: 1.6, marginBottom: 12 }}>{r.desc}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span className="skill-chip">{r.type}</span>
                          <span style={{ fontSize: 10, color: "var(--text3)" }}>{r.size}</span>
                          <span style={{ fontSize: 10, color: "var(--text3)" }}>· {r.date}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost" style={{ fontSize: 9, padding: "5px 10px" }} onClick={() => alert('Report preview opened!')}>Preview</button>
                          <button className="btn btn-solid" style={{ fontSize: 9, padding: "5px 10px" }} disabled={r.status === "Generating"} onClick={() => alert('Report downloaded successfully!')}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}