import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./placementOffersPlaced.css";

const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

const offers = [
  { init:"SM", name:"sharan mahendra",  branch:"BCA", company:"Microsoft", role:"SDE-1",             pkg:"28 LPA", date:"Feb 28", type:"Full Time", status:"Accepted" },
  { init:"SA", name:"sara Arjun", branch:"CSE", company:"Google",    role:"SWE L3",             pkg:"32 LPA", date:"Mar 02", type:"Full Time", status:"Accepted" },
  { init:"LS", name:"Lakshmi S",    branch:"CSE", company:"Swiggy",    role:"SDE-1",              pkg:"22 LPA", date:"Mar 04", type:"Full Time", status:"Accepted" },
  { init:"VR", name:"Vikram R",     branch:"IT",  company:"Razorpay",  role:"Backend Engineer",   pkg:"18 LPA", date:"Mar 05", type:"Full Time", status:"Accepted" },
  { init:"RG", name:"Rahul G",      branch:"CSE", company:"Flipkart",  role:"SDE-1",              pkg:"24 LPA", date:"Mar 06", type:"Full Time", status:"Pending"  },
  { init:"PN", name:"Priya Nair",   branch:"CSE", company:"Infosys",   role:"Systems Analyst",    pkg:"6.5 LPA",date:"Mar 07", type:"Full Time", status:"Pending"  },
  { init:"KV", name:"Karthik V",    branch:"IT",  company:"Wipro",     role:"Project Engineer",   pkg:"6 LPA",  date:"Mar 08", type:"Full Time", status:"Accepted" },
  { init:"AP", name:"Aditya Patel", branch:"MECH",company:"L&T",       role:"Graduate Engineer",  pkg:"8 LPA",  date:"Mar 09", type:"Full Time", status:"Accepted" },
];

const statusMap = { "Accepted":"badge-teal", "Pending":"badge-amber", "Declined":"badge-rose" };
const pkgColor = p => parseInt(p) >= 20 ? "var(--teal)" : parseInt(p) >= 10 ? "var(--indigo-ll)" : "var(--amber)";

export default function PlacementOffersPlaced() {
  const [filter, setFilter] = useState("All");
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

  const filtered = filter === "All" ? offers : offers.filter(o => o.status === filter);

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
            <SbLink active to="/placementdashboard/offers-placed" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers & Placed</SbLink>
            <SbLink to="/placementdashboard/internships" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
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
            <span className="tb-page">Offers & Placed</span>
            <div className="tb-sep" />
            <div className="tb-search"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text3)", flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search offers…" /></div>
            <div className="tb-right">
              <span className="tb-date">Tue, 10 Mar</span>
              <button className="btn btn-ghost" style={{ fontSize:10, padding:"8px 14px" }} onClick={() => alert('Offers CSV exported successfully!')}>Export CSV</button>
            </div>
          </header>

          <div className="content">
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">214 Placed · 2024–25</span></div>
              <h1 className="greet-title">Offers & <em>Placed Students</em></h1>
            </div>

            <div className="stat-grid" style={{ marginBottom: 18 }}>
              {[
                { label:"Total Offers", val:"104", color:"teal",   delta:"Across all companies" },
                { label:"Accepted",     val:"86",  color:"indigo", delta:"82.7% acceptance rate" },
                { label:"Pending",      val:"18",  color:"amber",  delta:"Awaiting response" },
                { label:"Highest Pkg",  val:"₹32L",color:"violet", delta:"Google · Arjun Sharma" },
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
                {["All","Accepted","Pending","Declined"].map(f => (
                  <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-hd">
                <div className="panel-ttl"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>Offer Letters<span>{filtered.length} records</span></div>
              </div>
              <div className="panel-body" style={{ padding: "0 0 4px" }}>
                <table className="stu-table">
                  <thead>
                    <tr>{["Student","Branch","Company","Role","Package","Date","Type","Status","Action"].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.map(o => (
                      <tr key={o.name}>
                        <td><div style={{ display:"flex", alignItems:"center", gap:10 }}><div className="stu-av">{o.init}</div><div className="stu-name">{o.name}</div></div></td>
                        <td style={{ color:"var(--text3)" }}>{o.branch}</td>
                        <td style={{ fontWeight:600 }}>{o.company}</td>
                        <td style={{ fontSize:11, color:"var(--text3)" }}>{o.role}</td>
                        <td style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:pkgColor(o.pkg), fontWeight:600 }}>{o.pkg}</td>
                        <td style={{ color:"var(--text3)", fontSize:11 }}>{o.date}</td>
                        <td><span className="skill-chip">{o.type}</span></td>
                        <td><Badge cls={statusMap[o.status]} dot>{o.status}</Badge></td>
                        <td><button className="btn btn-ghost" style={{ fontSize:9, padding:"5px 10px" }} onClick={() => alert('Offer details opened!')}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}