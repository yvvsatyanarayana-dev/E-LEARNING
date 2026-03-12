import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./placementAnalytics.css";

const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

const Panel = ({ title, subtitle, action, children, style, bodyStyle }) => (
  <div className="panel" style={style}>
    <div className="panel-hd">
      <div className="panel-ttl">{title}{subtitle && <span>{subtitle}</span>}</div>
      {action && <button className="panel-act" onClick={() => alert(action + ' clicked!')}>{action} →</button>}
    </div>
    <div className="panel-body" style={bodyStyle}>{children}</div>
  </div>
);

const monthData = [
  { m: "Aug", placed: 12, applied: 40, interviews: 28 },
  { m: "Sep", placed: 18, applied: 55, interviews: 38 },
  { m: "Oct", placed: 25, applied: 70, interviews: 52 },
  { m: "Nov", placed: 34, applied: 88, interviews: 61 },
  { m: "Dec", placed: 42, applied: 95, interviews: 74 },
  { m: "Jan", placed: 58, applied: 110, interviews: 88 },
  { m: "Feb", placed: 71, applied: 118, interviews: 96 },
  { m: "Mar", placed: 85, applied: 125, interviews: 104 },
];

const topCompanies = [
  { name: "Google",    pkg: "32 LPA", placed: 3,  color: "var(--teal)" },
  { name: "Microsoft", pkg: "28 LPA", placed: 5,  color: "var(--indigo-ll)" },
  { name: "Amazon",    pkg: "26 LPA", placed: 8,  color: "var(--amber)" },
  { name: "Swiggy",    pkg: "22 LPA", placed: 6,  color: "var(--violet)" },
  { name: "TCS",       pkg: "7 LPA",  placed: 42, color: "var(--rose)" },
];

const branchStats = [
  { branch: "CSE",  total: 120, placed: 106, pct: 88, color: "var(--teal)" },
  { branch: "IT",   total: 80,  placed: 61,  pct: 76, color: "var(--indigo-l)" },
  { branch: "ECE",  total: 70,  placed: 43,  pct: 61, color: "var(--amber)" },
  { branch: "MECH", total: 46,  placed: 19,  pct: 42, color: "var(--rose)" },
  { branch: "EEE",  total: 30,  placed: 16,  pct: 53, color: "var(--violet)" },
];

const maxVal = Math.max(...monthData.map(d => d.applied));

export default function PlacementAnalytics() {
  const [activeMetric, setActiveMetric] = useState("placed");
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

  const metricColor = { placed: "var(--teal)", applied: "var(--indigo-l)", interviews: "var(--amber)" };

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
            <SbLink active to="/placementdashboard/placementAnalytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>
            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students" badge="316" badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies" badge="5" badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
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
            <span className="tb-page">Placement Analytics</span>
            <div className="tb-sep" />
            <div className="tb-search"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text3)", flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search analytics…" /></div>
            <div className="tb-right">
              <span className="tb-date">Tue, 10 Mar</span>
              <div className="filter-row">
                {["placed","applied","interviews"].map(m => (
                  <button key={m} className={`filter-btn${activeMetric===m?" active":""}`} onClick={() => setActiveMetric(m)} style={{ textTransform: "capitalize" }}>{m}</button>
                ))}
              </div>
              <button className="btn btn-solid" style={{ fontSize:10, padding:"8px 14px" }} onClick={() => alert('Analytics PDF exported successfully!')}>Export PDF</button>
            </div>
          </header>

          <div className="content">
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">AY 2024–25 · Placement Analytics</span></div>
              <h1 className="greet-title">Placement <em>Insights</em></h1>
              <p className="greet-sub">Comprehensive analytics across all branches, drives, and student performance metrics.</p>
            </div>

            {/* KPI Row */}
            <div className="stat-grid" style={{ marginBottom: 18 }}>
              {[
                { label: "Total Placed", value: "214", delta: "▲ 68% rate", type: "up", color: "teal", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
                { label: "Avg Package", value: "₹21.4L", delta: "▲ +3.2L YoY", type: "up", color: "violet", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
                { label: "Highest Pkg", value: "₹32L", delta: "Google · SWE L3", type: "neu", color: "amber", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
                { label: "Companies Visited", value: "18", delta: "▲ +4 vs last year", type: "up", color: "indigo", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
              ].map(s => (
                <div key={s.label} className={`stat-card sc-${s.color}`} style={{ animationDelay: ".05s" }}>
                  <div className="stat-ic">{s.icon}</div>
                  <div className="stat-val" style={s.color !== "indigo" ? { color: `var(--${s.color})` } : {}}>{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                  <span className={`stat-delta delta-${s.type}`}>{s.delta}</span>
                </div>
              ))}
            </div>

            {/* Bar Chart + Companies */}
            <div className="two-col">
              <Panel title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Monthly Placement Trend</>} subtitle="Aug 2024 – Mar 2025" style={{ animationDelay: ".2s" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 180, padding: "0 0 8px" }}>
                  {monthData.map(d => {
                    const val = d[activeMetric];
                    const h = (val / maxVal) * 160;
                    return (
                      <div key={d.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 9, color: "var(--text3)", fontFamily: "'Fraunces',serif" }}>{val}</span>
                        <div style={{ width: "100%", height: h, background: metricColor[activeMetric], borderRadius: "4px 4px 0 0", opacity: .85, transition: "height .5s ease", minHeight: 4 }} />
                        <span style={{ fontSize: 9, color: "var(--text3)" }}>{d.m}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                  {["placed","applied","interviews"].map(m => (
                    <div key={m} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: metricColor[m] }} />
                      <span style={{ fontSize: 10, color: "var(--text3)", textTransform: "capitalize" }}>{m}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>Top Hiring Companies</>} subtitle="By offers given" style={{ animationDelay: ".25s" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {topCompanies.map((c, i) => (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 14, color: "var(--text3)", width: 16 }}>{i + 1}</div>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: `rgba(${c.color === "var(--teal)" ? "39,201,176" : "91,78,248"},.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: c.color }}>{c.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{c.placed} offers · {c.pkg}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 16, color: c.color }}>{c.pkg}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            {/* Branch Analytics */}
            <Panel title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>Branch-wise Analytics</>} subtitle="Placement breakdown per department" style={{ animationDelay: ".3s" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                {branchStats.map(b => (
                  <div key={b.branch} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: 32, color: b.color, lineHeight: 1 }}>{b.pct}%</div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{b.branch}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>{b.placed}/{b.total} placed</div>
                    <div style={{ height: 4, background: "var(--surface3)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                      <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 2, transition: "width 1.2s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Package Distribution */}
            <Panel title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Package Distribution</>} subtitle="Salary range breakdown" style={{ animationDelay: ".35s" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { range: "Above 25 LPA", count: 14, pct: 6.5, color: "var(--teal)" },
                  { range: "15 – 25 LPA", count: 38, pct: 17.8, color: "var(--indigo-ll)" },
                  { range: "10 – 15 LPA", count: 62, pct: 29, color: "var(--violet)" },
                  { range: "7 – 10 LPA", count: 58, pct: 27.1, color: "var(--amber)" },
                  { range: "Below 7 LPA", count: 42, pct: 19.6, color: "var(--rose)" },
                ].map(p => (
                  <div key={p.range} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 120, fontSize: 11, color: "var(--text2)", flexShrink: 0 }}>{p.range}</div>
                    <div style={{ flex: 1, height: 8, background: "var(--surface3)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${p.pct * 2}%`, height: "100%", background: p.color, borderRadius: 4, transition: "width 1.2s ease" }} />
                    </div>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: 14, color: p.color, width: 30, textAlign: "right" }}>{p.count}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", width: 38 }}>{p.pct}%</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}