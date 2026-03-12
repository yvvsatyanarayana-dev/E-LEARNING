import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./placementInternships.css";

const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

const internships = [
  { init:"RS", name:"Riya Singh",    branch:"CSE", company:"Google",    role:"SWE Intern",         stipend:"80K/mo", duration:"3 months", status:"Ongoing",   ppo:true,  start:"Jan 2025" },
  { init:"AV", name:"Arun V",        branch:"IT",  company:"Microsoft", role:"PM Intern",           stipend:"70K/mo", duration:"2 months", status:"Ongoing",   ppo:false, start:"Feb 2025" },
  { init:"NS", name:"Nisha S",       branch:"CSE", company:"Amazon",    role:"Data Analyst Intern", stipend:"60K/mo", duration:"3 months", status:"Upcoming",  ppo:true,  start:"Apr 2025" },
  { init:"MM", name:"Mohan M",       branch:"ECE", company:"Qualcomm",  role:"Embedded Intern",     stipend:"50K/mo", duration:"6 months", status:"Completed", ppo:false, start:"Aug 2024" },
  { init:"PS", name:"Pavithra S",    branch:"CSE", company:"Swiggy",    role:"Backend Intern",      stipend:"55K/mo", duration:"3 months", status:"Completed", ppo:true,  start:"Sep 2024" },
  { init:"KP", name:"Kiran P",       branch:"IT",  company:"Razorpay",  role:"Frontend Intern",     stipend:"45K/mo", duration:"2 months", status:"Ongoing",   ppo:false, start:"Feb 2025" },
  { init:"DR", name:"Divya R",       branch:"MECH",company:"L&T",       role:"Design Intern",       stipend:"25K/mo", duration:"6 months", status:"Ongoing",   ppo:false, start:"Jan 2025" },
  { init:"SA", name:"Santhosh A",    branch:"CSE", company:"Flipkart",  role:"SDE Intern",          stipend:"65K/mo", duration:"3 months", status:"Upcoming",  ppo:true,  start:"May 2025" },
];

const statusMap = { "Ongoing":"badge-teal", "Upcoming":"badge-indigo", "Completed":"badge-amber" };

export default function PlacementInternships() {
  const [filter, setFilter] = useState("All");
  const [showAddInternship, setShowAddInternship] = useState(false);
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

  const filtered = filter === "All" ? internships : internships.filter(i => i.status === filter);

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
            <SbLink active to="/placementdashboard/internships" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/ai-assistant" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>
          <div className="sb-bottom">
            <div className="sb-pri"><div className="sb-pri-lbl">Placement Rate</div><div className="sb-pri-val">68%</div><div className="sb-pri-sub">+6% vs last year · AY 2024–25</div><div className="sb-pri-bar"><div className="sb-pri-fill" style={{ width: "68%" }} /></div></div>
            <button className="sb-logout" onClick={() => alert('Signing out...')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <span className="tb-page">Internships</span>
            <div className="tb-sep" />
            <div className="tb-search"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text3)", flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search internships…" /></div>
            <div className="tb-right">
              <span className="tb-date">Tue, 10 Mar</span>
              <button className="btn btn-solid" style={{ fontSize:10, padding:"8px 14px" }} onClick={() => {setShowAddInternship(!showAddInternship); if(!showAddInternship) alert('Internship add form opened');}}>+ Add Internship</button>
            </div>
          </header>

          <div className="content">
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">72 Active Internships · AY 2024–25</span></div>
              <h1 className="greet-title">Student <em>Internships</em></h1>
              <p className="greet-sub">Track all student internships, stipends, and PPO conversions.</p>
            </div>

            <div className="stat-grid" style={{ marginBottom: 18 }}>
              {[
                { label:"Total Internships", val:"72",    color:"indigo", delta:"This academic year" },
                { label:"Ongoing",           val:"38",    color:"teal",   delta:"Currently active" },
                { label:"PPO Eligible",      val:"24",    color:"amber",  delta:"Pre-Placement Offers" },
                { label:"Avg Stipend",       val:"₹52K",  color:"violet", delta:"Per month avg" },
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
                {["All","Ongoing","Upcoming","Completed"].map(f => (
                  <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {filtered.map(i => (
                <div key={i.name} className="panel" style={{ margin: 0 }}>
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="stu-av" style={{ width: 40, height: 40 }}>{i.init}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{i.name}</div>
                          <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{i.branch} · {i.role}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                        <Badge cls={statusMap[i.status]} dot>{i.status}</Badge>
                        {i.ppo && <Badge cls="badge-teal">PPO Eligible</Badge>}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                      <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 13, color: "var(--teal)" }}>{i.stipend}</div>
                        <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 2 }}>Stipend</div>
                      </div>
                      <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 13, color: "var(--amber)" }}>{i.duration}</div>
                        <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 2 }}>Duration</div>
                      </div>
                      <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 13, color: "var(--indigo-ll)" }}>{i.start}</div>
                        <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 2 }}>Start</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(91,78,248,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "var(--indigo-ll)" }}>{i.company[0]}</div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{i.company}</span>
                      </div>
                      <button className="btn btn-ghost" style={{ fontSize: 9, padding: "5px 10px" }} onClick={() => alert('Internship details opened!')}>View Details</button>
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