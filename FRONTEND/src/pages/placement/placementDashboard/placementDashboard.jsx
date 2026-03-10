import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./PlacementDashboard.css";

/* ── DATA ── */
const students = [
  { name:"Arjun Sharma",  init:"AS", branch:"CSE", cgpa:9.1, pri:87, skills:["React","Python","DSA"],   interviews:3, company:"Google",    pkg:"32 LPA", status:"Placed"     },
  { name:"Priya Nair",    init:"PN", branch:"CSE", cgpa:8.7, pri:79, skills:["Java","Spring","SQL"],    interviews:5, company:"Infosys",   pkg:"—",      status:"In Process"  },
  { name:"Rohan Mehta",   init:"RM", branch:"ECE", cgpa:7.9, pri:61, skills:["C++","Embedded"],         interviews:1, company:"—",         pkg:"—",      status:"Applied"     },
  { name:"Sneha Reddy",   init:"SR", branch:"CSE", cgpa:9.4, pri:93, skills:["ML","Python","TF"],       interviews:2, company:"Microsoft", pkg:"28 LPA", status:"Placed"     },
  { name:"Karthik V",     init:"KV", branch:"IT",  cgpa:8.2, pri:72, skills:["Node.js","MongoDB"],      interviews:4, company:"Wipro",     pkg:"—",      status:"In Process"  },
  { name:"Divya Menon",   init:"DM", branch:"CSE", cgpa:7.1, pri:55, skills:["HTML","CSS"],             interviews:0, company:"—",         pkg:"—",      status:"Not Ready"   },
  { name:"Aditya Patel",  init:"AP", branch:"MECH",cgpa:8.0, pri:68, skills:["AutoCAD","MATLAB"],       interviews:2, company:"L&T",       pkg:"—",      status:"Applied"     },
  { name:"Lakshmi S",     init:"LS", branch:"CSE", cgpa:8.9, pri:84, skills:["Flutter","Firebase"],     interviews:3, company:"Swiggy",    pkg:"22 LPA", status:"Placed"     },
];

const drives = [
  { logo:"A", name:"Amazon",   role:"SDE-1 · Full Time",     pkg:"26 LPA",  date:"Mar 15", applied:31, eligible:48,  pct:65,  color:"var(--indigo-l)", status:"Upcoming"  },
  { logo:"T", name:"TCS",      role:"System Engineer",        pkg:"7 LPA",   date:"Mar 18", applied:98, eligible:120, pct:82,  color:"var(--amber)",    status:"Upcoming"  },
  { logo:"Z", name:"Zoho",     role:"Software Developer",     pkg:"12 LPA",  date:"Mar 22", applied:52, eligible:65,  pct:80,  color:"var(--teal)",     status:"Upcoming"  },
  { logo:"I", name:"Infosys",  role:"Systems Analyst",        pkg:"6.5 LPA", date:"Mar 08", applied:84, eligible:110, pct:100, color:"var(--teal)",     status:"Completed" },
  { logo:"G", name:"Google",   role:"SWE · L3",               pkg:"32 LPA",  date:"Feb 28", applied:9,  eligible:12,  pct:100, color:"var(--teal)",     status:"Completed" },
];

const statusMap = {
  "Placed":     "badge-teal",
  "In Process": "badge-indigo",
  "Applied":    "badge-amber",
  "Not Ready":  "badge-rose",
  "Upcoming":   "badge-indigo",
  "Completed":  "badge-teal",
};

const priColor = s => s>=85 ? "var(--teal)" : s>=70 ? "var(--indigo-ll)" : s>=55 ? "var(--amber)" : "var(--rose)";
const cgpaColor = c => c>=9 ? "var(--teal)" : c>=8 ? "var(--indigo-ll)" : "var(--amber)";

/* ── ICONS ── */
const Icon = ({ d, size=14, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    {Array.isArray(d) ? d.map((el,i) => <path key={i} d={el} />) : <path d={d} />}
  </svg>
);

/* ── BADGE ── */
const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>
    {dot && <span className="badge-dot" />}
    {children}
  </span>
);

/* ── STAT CARD ── */
const StatCard = ({ color, icon, value, label, delta, deltaType, delay }) => (
  <div className={`stat-card sc-${color}`} style={{ animationDelay: delay }}>
    <div className="stat-ic">{icon}</div>
    <div className="stat-val" style={color !== "indigo" ? { color: `var(--${color})` } : {}}>{value}</div>
    <div className="stat-lbl">{label}</div>
    <span className={`stat-delta delta-${deltaType}`}>{delta}</span>
  </div>
);

/* ── SIDEBAR NAV LINK ── */
const SbLink = ({ active, badge, badgeCls, icon, children }) => (
  <>
    {children === "Analytics" ? (
      <Link to="/placementdashboard/placementAnalytics" className={`sb-link${active ? " active" : ""}`}>
        {icon}
        {children}
        {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
      </Link>
    ) : children === "Students" ? (
      <Link to="/placementdashboard/students" className={`sb-link${active ? " active" : ""}`}>
        {icon}
        {children}
        {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
      </Link>
    ) : children === "Companies" ? (
      <Link to="/placementdashboard/companies" className={`sb-link${active ? " active" : ""}`}>
        {icon}
        {children}
        {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
      </Link>
    ) : children === "Drives" ? (
      <Link to="/placementdashboard/drives" className={`sb-link${active ? " active" : ""}`}>
        {icon}
        {children}
        {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
      </Link>
    ) : children === "Offers & Placed" ? (
      <Link to="/placementdashboard/offers-placed" className={`sb-link${active ? " active" : ""}`}>
        {icon}
        {children}
        {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
      </Link>
    ) : children === "Internships" ? (
      <Link to="/placementdashboard/internships" className={`sb-link${active ? " active" : ""}`}>
        {icon}
        {children}
        {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
      </Link>
    ) : children === "AI Assistant" ? (
      <Link to="/placementdashboard/ai-assistant" className={`sb-link${active ? " active" : ""}`}>
        {icon}
        {children}
        {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
      </Link>
    ) : children === "Reports" ? (
      <Link to="/placementdashboard/reports" className={`sb-link${active ? " active" : ""}`}>
        {icon}
        {children}
        {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
      </Link>
    ) : (
      <a href="#" className={`sb-link${active ? " active" : ""}`}>
        {icon}
        {children}
        {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
      </a>
    )}
  </>
);

/* ── PANEL ── */
const Panel = ({ title, subtitle, action, children, style, bodyStyle }) => (
  <div className="panel" style={style}>
    <div className="panel-hd">
      <div className="panel-ttl">
        {title}
        {subtitle && <span>{subtitle}</span>}
      </div>
      {action && <button className="panel-act">{action} →</button>}
    </div>
    <div className="panel-body" style={bodyStyle}>{children}</div>
  </div>
);

/* ── MAIN COMPONENT ── */
export default function PlacementDashboard() {
  const [filter, setFilter] = useState("All");
  const curRef  = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0);
  const rx = useRef(0), ry = useRef(0);

  /* Custom cursor */
  useEffect(() => {
    const onMove = e => {
      mx.current = e.clientX; my.current = e.clientY;
      curRef.current.style.left  = e.clientX + "px";
      curRef.current.style.top   = e.clientY + "px";
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
      ringRef.current.style.left = rx.current + "px";
      ringRef.current.style.top  = ry.current + "px";
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

  const addHover  = e => { e.currentTarget.closest("body") && document.body.classList.add("c-hover"); };
  const rmHover   = ()  => document.body.classList.remove("c-hover");
  const hoverProps = { onMouseEnter: addHover, onMouseLeave: rmHover };

  const filteredStudents = filter === "All" ? students : students.filter(s => s.status === filter);

  return (
    <>
      {/* Cursor */}
      <div className="sc-cursor"      ref={curRef}  />
      <div className="sc-cursor-ring" ref={ringRef} />
      <div className="sc-noise" />

      <div className="app">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-top">
            <a className="sb-brand" href="#">
              <div className="sb-mark">SC</div>
              <span className="sb-name">SmartCampus</span>
            </a>
          </div>

          <div className="sb-user">
            <div className="sb-avatar">KR</div>
            <div>
              <div className="sb-uname">Ms. Kavitha R</div>
              <div className="sb-urole">Placement Officer</div>
            </div>
          </div>

          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink active icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>

            <div className="sb-sec-label">Placement</div>
            <SbLink badge="316" badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}>Students</SbLink>
            <SbLink badge="5" badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink badge="3" badgeCls="rose" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
            <SbLink icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers & Placed</SbLink>
            <SbLink icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>

            <div className="sb-sec-label">Tools</div>
            <SbLink icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}>Reports</SbLink>
          </nav>

          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">68%</div>
              <div className="sb-pri-sub">+6% vs last year · AY 2024–25</div>
              <div className="sb-pri-bar"><div className="sb-pri-fill" style={{ width: "68%" }} /></div>
            </div>
            <button className="sb-logout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">

          {/* TOPBAR */}
          <header className="topbar">
            <span className="tb-page">Placement Dashboard</span>
            <div className="tb-sep" />
            <div className="tb-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:"var(--text3)", flexShrink:0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search students, companies, drives…" />
            </div>
            <div className="tb-right">
              <span className="tb-date">Tue, 10 Mar</span>
              <button className="tb-icon-btn" {...hoverProps}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="notif-dot" />
              </button>
              <button className="tb-icon-btn" {...hoverProps}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
              <button className="btn btn-solid" style={{ fontSize:10, padding:"8px 14px" }} {...hoverProps}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Quick Actions
              </button>
            </div>
          </header>

          {/* CONTENT */}
          <div className="content">

            {/* GREETING */}
            <div className="greet-row">
              <div className="greet-tag">
                <div className="greet-pip" />
                <span className="greet-pip-txt">Academic Year 2024–25 · Semester 5 · Week 11</span>
              </div>
              <h1 className="greet-title">Good morning, <em>Ms. Kavitha</em></h1>
              <p className="greet-sub">
                You have <strong>4 companies</strong> scheduled this month and{" "}
                <span className="rose">12 students</span> need placement readiness attention.
              </p>
              <div className="greet-actions">
                <button className="btn btn-solid" {...hoverProps}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Drive
                </button>
                <button className="btn btn-teal" {...hoverProps}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Notify Students
                </button>
                <button className="btn btn-ghost" {...hoverProps}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Report
                </button>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="stat-grid">
              <StatCard color="indigo" delay=".05s" value="316" label="Total Students" delta="▲ +12 this semester" deltaType="up"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
              <StatCard color="teal" delay=".1s" value="214" label="Placed Students" delta="▲ 68% placement rate" deltaType="up"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>} />
              <StatCard color="amber" delay=".15s" value="72" label="Avg PRI Score" delta="Target: 85 for excellent" deltaType="neu"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} />
              <StatCard color="violet" delay=".2s" value="21.4L" label="Avg Package" delta="▲ +3.2L vs last year" deltaType="up"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
            </div>

            {/* PLACEMENT DRIVES */}
            <Panel
              style={{ animationDelay:".25s" }}
              title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>Placement Drives</>}
              subtitle="3 upcoming · 2 completed"
              action="Manage all"
            >
              <div className="drive-grid">
                {drives.map(d => (
                  <div key={d.name} className="drive-card" {...hoverProps}>
                    <div className="dc-top">
                      <div className="dc-logo">{d.logo}</div>
                      <Badge cls={statusMap[d.status]} dot>{d.status}</Badge>
                    </div>
                    <div className="drive-name">{d.name}</div>
                    <div className="drive-role">{d.role}</div>
                    <div className="drive-pkg">{d.pkg}</div>
                    <div className="drive-meta">{d.date} · {d.applied}/{d.eligible} applied</div>
                    <div className="mini-bar">
                      <div className="mini-fill" style={{ width:`${d.pct}%`, background:d.color }} />
                    </div>
                  </div>
                ))}
                <div className="drive-card" style={{ display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8, borderStyle:"dashed", borderColor:"rgba(91,78,248,.2)", opacity:.7 }}>
                  <div style={{ width:34, height:34, borderRadius:8, border:"1.5px dashed rgba(91,78,248,.4)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--indigo-ll)", fontSize:18 }}>+</div>
                  <span style={{ fontSize:11, color:"var(--text3)" }}>Add New Drive</span>
                </div>
              </div>
            </Panel>

            {/* FUNNEL + PRI */}
            <div className="two-col">

              {/* FUNNEL */}
              <Panel
                style={{ animationDelay:".3s" }}
                title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>Placement Funnel</>}
                subtitle="AY 2024–25"
                action="Full report"
              >
                <div className="funnel-row">
                  {[
                    { label:"Total Eligible",          count:"316", pct:100, color:"var(--muted)"    },
                    { label:"PRI ≥ 70 (Drive Ready)",  count:"237", pct:75,  color:"var(--indigo-l)" },
                    { label:"Applied to Companies",     count:"196", pct:62,  color:"var(--violet)"   },
                    { label:"Interview Cleared",        count:"158", pct:50,  color:"var(--amber)"    },
                    { label:"Offer Received",           count:"214", pct:68,  color:"var(--teal)"     },
                  ].map(f => (
                    <div key={f.label} className="funnel-item">
                      <div className="fi-header">
                        <span className="fi-label">{f.label}</span>
                        <span className="fi-count" style={{ color:f.color }}>{f.count} <small style={{ fontSize:10, color:"var(--text3)" }}>({f.pct}%)</small></span>
                      </div>
                      <div className="fi-bar"><div className="fi-fill" style={{ width:`${f.pct}%`, background:f.color }} /></div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:20, borderTop:"1px solid var(--border)", paddingTop:16 }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text3)", marginBottom:12 }}>Branch-wise Placement</div>
                  {[
                    { branch:"CSE",  pct:88, color:"var(--teal)"     },
                    { branch:"IT",   pct:76, color:"var(--indigo-l)" },
                    { branch:"ECE",  pct:61, color:"var(--amber)"    },
                    { branch:"MECH", pct:42, color:"var(--rose)"     },
                  ].map(b => (
                    <div key={b.branch} style={{ marginBottom:8 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:11 }}>
                        <span style={{ color:"var(--text2)" }}>{b.branch}</span>
                        <span style={{ color:b.color, fontWeight:600 }}>{b.pct}%</span>
                      </div>
                      <div style={{ height:4, background:"var(--surface3)", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ width:`${b.pct}%`, height:"100%", background:b.color, borderRadius:2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* PRI DISTRIBUTION */}
              <Panel
                style={{ animationDelay:".35s" }}
                title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>PRI Distribution</>}
                subtitle="Placement Readiness Index"
              >
                <div className="pri-boxes">
                  {[
                    { val:86,  label:"Excellent",  range:"PRI 85–100", bg:"rgba(39,201,176,.07)",  border:"rgba(39,201,176,.15)",  color:"var(--teal)"     },
                    { val:142, label:"Good",        range:"PRI 70–84",  bg:"rgba(91,78,248,.08)",   border:"rgba(91,78,248,.15)",   color:"var(--indigo-ll)" },
                    { val:64,  label:"Fair",        range:"PRI 55–69",  bg:"rgba(244,165,53,.07)",  border:"rgba(244,165,53,.15)",  color:"var(--amber)"    },
                    { val:24,  label:"Needs Work",  range:"PRI 0–54",   bg:"rgba(242,68,92,.07)",   border:"rgba(242,68,92,.15)",   color:"var(--rose)"     },
                  ].map(p => (
                    <div key={p.label} className="pri-box" style={{ background:p.bg, border:`1px solid ${p.border}` }}>
                      <div className="pb-val" style={{ color:p.color }}>{p.val}</div>
                      <div className="pb-lbl" style={{ color:p.color }}>{p.label}</div>
                      <div className="pb-range">{p.range}</div>
                    </div>
                  ))}
                </div>
                <div className="pri-summary">
                  <div className="ps-lbl">Department Avg PRI</div>
                  <div className="ps-val">72 <span style={{ fontSize:12, color:"var(--text3)", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>/100</span></div>
                  <div className="ps-sub">Target 85 for excellent tier · +4 pts vs last sem</div>
                </div>
                <div style={{ marginTop:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text3)", marginBottom:10 }}>Top Skills in Demand</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {["Data Structures","System Design","Python","React","SQL","Communication","Java","Docker"].map(sk => (
                      <span key={sk} className="skill-chip">{sk}</span>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>

            {/* STUDENT TABLE */}
            <Panel
              style={{ animationDelay:".4s" }}
              bodyStyle={{ padding:"0 0 4px" }}
              title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Student Placement Tracker</>}
              subtitle={`${filteredStudents.length} students shown`}
              action={
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div className="filter-row">
                    {["All","Placed","In Process","Applied","Not Ready"].map(f => (
                      <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={() => setFilter(f)} {...hoverProps}>{f}</button>
                    ))}
                  </div>
                  <span style={{ fontSize:11, color:"var(--indigo-ll)", cursor:"none" }}>Export →</span>
                </div>
              }
            >
              <table className="stu-table">
                <thead>
                  <tr>
                    {["Student","Branch","CGPA","PRI Score","Skills","Interviews","Company","Package","Status"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr key={s.name} {...hoverProps}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div className="stu-av">{s.init}</div>
                          <div className="stu-name">{s.name}</div>
                        </div>
                      </td>
                      <td style={{ color:"var(--text3)" }}>{s.branch}</td>
                      <td style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:cgpaColor(s.cgpa) }}>{s.cgpa}</td>
                      <td>
                        <span className="pri-text" style={{ color:priColor(s.pri) }}>{s.pri}</span>{" "}
                        <span style={{ fontSize:9, color:"var(--text3)" }}>/100</span>
                      </td>
                      <td>{s.skills.map(sk => <span key={sk} className="skill-chip">{sk}</span>)}</td>
                      <td style={{ textAlign:"center", color:"var(--text2)", fontFamily:"'Fraunces',serif", fontSize:14 }}>{s.interviews}</td>
                      <td style={{ color:s.company!=="—"?"var(--text)":"var(--text3)", fontWeight:s.company!=="—"?600:400 }}>{s.company}</td>
                      <td style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:s.pkg!=="—"?"var(--teal)":"var(--text3)", fontWeight:600 }}>{s.pkg}</td>
                      <td><Badge cls={statusMap[s.status]} dot>{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            {/* BOTTOM ROW */}
            <div className="three-col">

              {/* SCHEDULE */}
              <Panel
                style={{ animationDelay:".45s" }}
                title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Today's Schedule</>}
                subtitle="Tue, 10 Mar"
                action="Full week"
              >
                <div className="sched-list">
                  {[
                    { from:"09:00", to:"10:00", name:"Amazon Pre-Placement Talk", room:"Seminar Hall · A Block", tag:"Drive Prep", tagColor:"var(--indigo-ll)", tagBg:"rgba(91,78,248,.1)", divColor:"var(--indigo-l)" },
                    { from:"11:00", to:"12:00", name:"Resume Review — CSE Batch", room:"Placement Office",         tag:"Review",    tagColor:"var(--teal)",     tagBg:"rgba(39,201,176,.1)", divColor:"var(--teal)"     },
                    { from:"14:00", to:"15:30", name:"Mock Interviews — Round 2", room:"Lab 3 · B Block",          tag:"Interview", tagColor:"var(--amber)",    tagBg:"rgba(244,165,53,.1)", divColor:"var(--amber)"    },
                    { from:"16:00", to:"17:00", name:"Industry Connect — Webinar",room:"Online · Google Meet",     tag:"Online",    tagColor:"var(--violet)",   tagBg:"rgba(159,122,234,.1)",divColor:"var(--violet)"   },
                  ].map(s => (
                    <div key={s.from} className="sched-item" {...hoverProps}>
                      <div className="sched-time"><div className="st-from">{s.from}</div><div className="st-to">{s.to}</div></div>
                      <div className="sched-div" style={{ background:s.divColor }} />
                      <div className="sched-info">
                        <div className="si-name">{s.name}</div>
                        <div className="si-room">{s.room}</div>
                        <span className="si-tag" style={{ background:s.tagBg, color:s.tagColor }}>{s.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* PENDING TASKS */}
              <Panel
                style={{ animationDelay:".5s" }}
                title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>Pending Tasks</>}
                subtitle="5 remaining"
                action="All tasks"
              >
                <div className="task-list">
                  {[
                    { txt:"Update Amazon drive eligibility list",   sub:"CS Dept · 48 students",   due:"Today",    dueCls:"due-today" },
                    { txt:"Send offer letter reminders — Infosys",  sub:"22 students pending",      due:"Today",    dueCls:"due-today" },
                    { txt:"Review 14 student resumes",              sub:"Pre-Amazon drive",         due:"Tomorrow", dueCls:"due-soon"  },
                    { txt:"Upload Zoho JD & eligibility criteria",  sub:"Mar 22 Drive",             due:"2 days",   dueCls:"due-soon"  },
                    { txt:"Generate Q4 Placement Analytics Report", sub:"All departments",          due:"5 days",   dueCls:"due-ok"    },
                  ].map(t => (
                    <div key={t.txt} className="task-item" {...hoverProps}>
                      <div className="task-check" />
                      <div>
                        <div className="task-txt">{t.txt}</div>
                        <div className="task-course">{t.sub}</div>
                      </div>
                      <span className={`task-due ${t.dueCls}`}>{t.due}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* TOP PERFORMERS */}
              <Panel
                style={{ animationDelay:".55s" }}
                title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>Top Performers</>}
                subtitle="By PRI Score"
                action="View all"
              >
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {[
                    { rank:1,  rankColor:"var(--amber)",    init:"SR", name:"Sneha Reddy",  meta:"CSE · Microsoft", pri:93, priColor:"var(--teal)",     badge:"28 LPA", badgeCls:"badge-teal"   },
                    { rank:2,  rankColor:"var(--text3)",    init:"AS", name:"Arjun Sharma", meta:"CSE · Google",    pri:87, priColor:"var(--teal)",     badge:"32 LPA", badgeCls:"badge-teal"   },
                    { rank:3,  rankColor:"var(--text3)",    init:"LS", name:"Lakshmi S",    meta:"CSE · Swiggy",    pri:84, priColor:"var(--indigo-ll)",badge:"22 LPA", badgeCls:"badge-indigo" },
                    { rank:4,  rankColor:"var(--text3)",    init:"PN", name:"Priya Nair",   meta:"CSE · In Process",pri:79, priColor:"var(--amber)",    badge:"Infosys",badgeCls:"badge-amber"  },
                  ].map(p => (
                    <div key={p.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"var(--surface2)", border:"1px solid var(--border)" }} {...hoverProps}>
                      <div style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:p.rankColor, width:16 }}>{p.rank}</div>
                      <div className="stu-av">{p.init}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600 }}>{p.name}</div>
                        <div style={{ fontSize:"9.5px", color:"var(--text3)", marginTop:1 }}>{p.meta}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, color:p.priColor }}>{p.pri}</div>
                        <Badge cls={`${p.badgeCls}`} style={{ fontSize:"8.5px", padding:"1px 6px" }}>{p.badge}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

            </div>
          </div>{/* /content */}
        </div>{/* /main */}
      </div>{/* /app */}
    </>
  );
}