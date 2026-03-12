import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PlacementCompanies.css";

const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

const companies = [
  { init:"G", name:"Google",    sector:"Tech",    roles:["SWE L3","SWE L4"],     pkg:"32 LPA", minCgpa:8.5, branches:["CSE","IT"], offers:3, status:"Active", color:"var(--teal)",     nextDrive:"Mar 15", students:12, desc:"Google LLC is an American multinational tech company." },
  { init:"M", name:"Microsoft", sector:"Tech",    roles:["SDE-1","SDE-2"],        pkg:"28 LPA", minCgpa:8.0, branches:["CSE","IT"], offers:5, status:"Active", color:"var(--indigo-ll)",nextDrive:"Apr 02", students:18, desc:"Microsoft Corp develops Windows, Azure, and Office products." },
  { init:"A", name:"Amazon",    sector:"Tech",    roles:["SDE-1"],                pkg:"26 LPA", minCgpa:7.5, branches:["CSE","IT","ECE"], offers:8, status:"Upcoming", color:"var(--amber)", nextDrive:"Mar 15", students:31, desc:"Amazon.com Inc. is a global e-commerce and cloud company." },
  { init:"T", name:"TCS",       sector:"IT Svcs", roles:["System Engineer"],      pkg:"7 LPA",  minCgpa:6.0, branches:["CSE","IT","ECE","MECH"], offers:42, status:"Completed", color:"var(--violet)", nextDrive:"—", students:98, desc:"Tata Consultancy Services is India's largest IT company." },
  { init:"Z", name:"Zoho",      sector:"SaaS",    roles:["Software Developer"],   pkg:"12 LPA", minCgpa:7.0, branches:["CSE","IT"], offers:0, status:"Upcoming", color:"var(--rose)", nextDrive:"Mar 22", students:52, desc:"Zoho Corporation provides business software solutions." },
  { init:"S", name:"Swiggy",    sector:"Startup", roles:["SDE-1","Data Analyst"], pkg:"22 LPA", minCgpa:7.5, branches:["CSE","IT"], offers:6, status:"Completed", color:"var(--teal)", nextDrive:"—", students:24, desc:"Swiggy is India's leading on-demand food delivery platform." },
  { init:"I", name:"Infosys",   sector:"IT Svcs", roles:["Systems Analyst"],      pkg:"6.5 LPA",minCgpa:6.5, branches:["CSE","IT","ECE"], offers:22, status:"Completed", color:"var(--indigo-l)", nextDrive:"—", students:84, desc:"Infosys is a global IT consulting and services company." },
  { init:"W", name:"Wipro",     sector:"IT Svcs", roles:["Project Engineer"],     pkg:"6 LPA",  minCgpa:6.0, branches:["CSE","IT","ECE","MECH"], offers:18, status:"Active", color:"var(--amber)", nextDrive:"Mar 28", students:76, desc:"Wipro Limited provides IT, consulting and BPS services." },
];

const statusMap = { "Active":"badge-teal", "Upcoming":"badge-indigo", "Completed":"badge-amber" };

export default function PlacementCompanies() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
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

  const filtered = filter === "All" ? companies : companies.filter(c => c.status === filter);

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
            <SbLink active to="/placementdashboard/companies" badge="5" badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink to="/placementdashboard/drives" badge="3" badgeCls="rose" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
            <SbLink to="/placementdashboard/offers-placed" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers & Placed</SbLink>
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
            <span className="tb-page">Companies</span>
            <div className="tb-sep" />
            <div className="tb-search"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text3)", flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search companies…" /></div>
            <div className="tb-right">
              <span className="tb-date">Tue, 10 Mar</span>
              <button className="btn btn-solid" style={{ fontSize:10, padding:"8px 14px" }} onClick={() => {setShowAddCompany(!showAddCompany); if(!showAddCompany) alert('Company add form opened!');}}>+ Add Company</button>
            </div>
          </header>

          <div className="content">
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">18 Companies · AY 2024–25</span></div>
              <h1 className="greet-title">Hiring <em>Companies</em></h1>
              <p className="greet-sub">Track all company partnerships, drives, and offers in one place.</p>
            </div>

            <div className="stat-grid" style={{ marginBottom: 18 }}>
              {[
                { label:"Total Companies", val:"18",  color:"indigo", delta:"▲ +4 this year" },
                { label:"Active / Upcoming", val:"5", color:"teal",   delta:"3 drives upcoming" },
                { label:"Total Offers",    val:"104", color:"amber",  delta:"From all drives" },
                { label:"Avg Package",     val:"₹18L",color:"violet", delta:"▲ +2L vs last year" },
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
                {["All","Active","Upcoming","Completed"].map(f => (
                  <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text3)" }}>{filtered.length} companies</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {filtered.map(c => (
                <div key={c.name} className="panel" style={{ margin: 0 }}>
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: `rgba(${c.color === "var(--teal)" ? "39,201,176" : c.color === "var(--amber)" ? "244,165,53" : "91,78,248"},.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: c.color }}>{c.init}</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>{c.sector} · {c.roles.join(", ")}</div>
                        </div>
                      </div>
                      <Badge cls={statusMap[c.status]} dot>{c.status}</Badge>
                    </div>
                    <p style={{ fontSize: 11.5, color: "var(--text3)", lineHeight: 1.6, marginBottom: 14 }}>{c.desc}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
                      {[
                        { label: "Package", val: c.pkg, color: "var(--teal)" },
                        { label: "Min CGPA", val: c.minCgpa, color: "var(--amber)" },
                        { label: "Offers", val: c.offers, color: "var(--indigo-ll)" },
                        { label: "Students", val: c.students, color: "var(--violet)" },
                      ].map(m => (
                        <div key={m.label} style={{ background: "var(--surface2)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 14, color: m.color }}>{m.val}</div>
                          <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 2 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: 5 }}>{c.branches.map(b => <span key={b} className="skill-chip">{b}</span>)}</div>
                      {c.nextDrive !== "—" && <span style={{ fontSize: 11, color: "var(--indigo-ll)" }}>Next drive: {c.nextDrive}</span>}
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