// StudentDashboard.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import "./StudentDashboard.css";

// ─── ICONS ───────────────────────────────────────────────────────
const Icon = ({ d, size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IcoDashboard = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoBar    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoBook   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoVideo  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IcoFile   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>;
const IcoClock  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoSun    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>;
const IcoUsers  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoCal    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoAward  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoBrief  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcoPen    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoSettings=(p)=><svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 1 0 0 14.14"/><path d="M19.07 4.93L16 8"/></svg>;
const IcoBell   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoUser   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>;
const IcoSearch = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoChevR  = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoChevUp = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoChevDn = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoMinus  = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoPlus   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoPlay   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IcoSend   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="#fff" stroke="none"/></svg>;
const IcoClose  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoBrain  = (p) => <svg {...p} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;

// ─── DATA ────────────────────────────────────────────────────────
const COURSES = [
  { name:"Operating Systems", meta:"Dr. S. Prakash · 42 lectures", pct:78, color:"var(--indigo-l)", grade:"A", gradeStyle:{background:"rgba(39,201,176,.1)",color:"var(--teal)"}, due:"Quiz · Today",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    badgeStyle:{background:"rgba(91,78,248,.12)",color:"var(--indigo-ll)"}, pctColor:"var(--indigo-ll)", next:"Next: Memory Mgmt" },
  { name:"Database Management Systems", meta:"Prof. R. Nair · 38 lectures", pct:61, color:"var(--teal)", grade:"A−", gradeStyle:{background:"rgba(91,78,248,.1)",color:"var(--indigo-ll)"}, due:"Asgmt · 2 days",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    badgeStyle:{background:"rgba(39,201,176,.1)",color:"var(--teal)"}, pctColor:"var(--teal)", next:"Next: Transactions" },
  { name:"Machine Learning Fundamentals", meta:"Dr. A. Kumar · 36 lectures", pct:44, color:"var(--amber)", grade:"B+", gradeStyle:{background:"rgba(244,165,53,.1)",color:"var(--amber)"}, due:"Project · 5 days",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    badgeStyle:{background:"rgba(244,165,53,.1)",color:"var(--amber)"}, pctColor:"var(--amber)", next:"Next: SVM Classifiers" },
  { name:"Computer Networks", meta:"Prof. T. Mehta · 40 lectures", pct:55, color:"var(--violet)", grade:"A", gradeStyle:{background:"rgba(159,122,234,.1)",color:"var(--violet)"}, due:"Lab · Tomorrow",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
    badgeStyle:{background:"rgba(159,122,234,.1)",color:"var(--violet)"}, pctColor:"var(--violet)", next:"Next: TCP/IP Stack" },
  { name:"Cryptography & Network Security", meta:"Dr. P. Sharma · 34 lectures", pct:32, color:"var(--rose)", grade:"B", gradeStyle:{background:"rgba(242,68,92,.1)",color:"var(--rose)"}, due:"Asgmt · Today",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    badgeStyle:{background:"rgba(242,68,92,.1)",color:"var(--rose)"}, pctColor:"var(--rose)", next:"Next: RSA Algorithm" },
];

const SCHEDULE = [
  { from:"09:00", to:"10:00", name:"Operating Systems", room:"Room 301 · Dr. Prakash", tag:"Lecture", color:"var(--teal)", tagStyle:{background:"rgba(39,201,176,.1)",color:"var(--teal)"} },
  { from:"10:30", to:"11:30", name:"OS Quiz — Unit III", room:"Exam Hall B", tag:"Quiz Today", color:"var(--amber)", tagStyle:{background:"rgba(244,165,53,.12)",color:"var(--amber)"} },
  { from:"13:00", to:"14:30", name:"DBMS Lab", room:"Lab 2 · Prof. Nair", tag:"Lab", color:"var(--indigo-l)", tagStyle:{background:"rgba(91,78,248,.1)",color:"var(--indigo-ll)"} },
  { from:"15:00", to:"16:00", name:"ML — SVM Classifiers", room:"Room 204 · Dr. Kumar", tag:"Lecture", color:"var(--violet)", tagStyle:{background:"rgba(159,122,234,.1)",color:"var(--violet)"} },
  { from:"16:30", to:"17:00", name:"Mock Interview Session", room:"Placement Cell · AI Sim", tag:"Career", color:"var(--rose)", tagStyle:{background:"rgba(242,68,92,.1)",color:"var(--rose)"} },
];

const QUIZZES = [
  { name:"OS – Process Scheduling",   score:"92%", pct:92, scoreStyle:{background:"rgba(39,201,176,.1)",color:"var(--teal)"},      bar:"var(--teal)",     answered:"20/20 answered", rank:"Rank 3rd / 112" },
  { name:"DBMS – Normalization",      score:"85%", pct:85, scoreStyle:{background:"rgba(91,78,248,.1)",color:"var(--indigo-ll)"},   bar:"var(--indigo-l)", answered:"17/20 answered", rank:"Rank 8th / 112" },
  { name:"CN – OSI Layers",           score:"78%", pct:78, scoreStyle:{background:"rgba(159,122,234,.1)",color:"var(--violet)"},   bar:"var(--violet)",   answered:"15/20 answered", rank:"Rank 14th / 112" },
  { name:"ML – Linear Regression",    score:"71%", pct:71, scoreStyle:{background:"rgba(244,165,53,.1)",color:"var(--amber)"},     bar:"var(--amber)",    answered:"14/20 answered", rank:"Rank 22nd / 112" },
  { name:"Crypto – Symmetric Keys",   score:"58%", pct:58, scoreStyle:{background:"rgba(242,68,92,.1)",color:"var(--rose)"},       bar:"var(--rose)",     answered:"11/20 answered", rank:"Rank 51st / 112" },
];

const SKILLS = [
  { label:"DSA",             pct:82, color:"var(--teal)",     pctColor:"var(--teal)" },
  { label:"Python",          pct:74, color:"var(--indigo-l)", pctColor:"var(--indigo-ll)" },
  { label:"SQL",             pct:68, color:"var(--violet)",   pctColor:"var(--violet)" },
  { label:"Machine Learning",pct:55, color:"var(--amber)",    pctColor:"var(--amber)" },
  { label:"System Design",   pct:41, color:"var(--rose)",     pctColor:"var(--rose)" },
  { label:"Communication",   pct:77, color:"linear-gradient(90deg,var(--indigo),var(--teal))", pctColor:"var(--indigo-ll)" },
];

const NAV_ITEMS = [
  { section:"Overview", links:[
    { label:"Dashboard",    icon:<IcoDashboard/>, active:true },
    { label:"Analytics",    icon:<IcoBar/>,      badge:"New" },
  ]},
  { section:"Learning", links:[
    { label:"My Courses",   icon:<IcoBook/>,  badge:"6" },
    { label:"Video Lectures",icon:<IcoVideo/> },
    { label:"Assignments",  icon:<IcoFile/>,  badge:"3", badgeClass:"rose" },
    { label:"Quizzes",      icon:<IcoClock/> },
  ]},
  { section:"Campus", links:[
    { label:"Innovation Hub",icon:<IcoSun/>   },
    { label:"Study Groups",  icon:<IcoUsers/> },
    { label:"Schedule",      icon:<IcoCal/>   },
  ]},
  { section:"Career", links:[
    { label:"Placement Prep",icon:<IcoAward/> },
    { label:"Internships",   icon:<IcoBrief/> },
    { label:"Mock Interviews",icon:<IcoPen/>  },
  ]},
];

const AI_RESPONSES = [
  "Great question! Process scheduling determines which process gets CPU time and for how long. 🎓",
  "Based on your history, your <strong style='color:var(--rose)'>weakest area</strong> is Cryptography at 58%. Want a focused drill?",
  "For <strong style='color:var(--teal)'>deadlock detection</strong>, remember: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.",
  "I've prepared 5 MCQs on Round Robin. Your predicted score: <strong style='color:var(--amber)'>76–84%</strong> based on past patterns. Ready? ✨",
  "Your CGPA of 8.4 puts you in the <strong style='color:var(--teal)'>top 15%</strong>. Improving Crypto would push you to the top 10%.",
];

// ─── HELPERS ─────────────────────────────────────────────────────
function addRipple(e, el) {
  const r = document.createElement("span");
  r.className = "ripple";
  const rect = el.getBoundingClientRect();
  const s = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - rect.left - s / 2}px;top:${e.clientY - rect.top - s / 2}px`;
  el.appendChild(r);
  r.addEventListener("animationend", () => r.remove());
}

function useCursor() {
  useEffect(() => {
    const cur = document.getElementById("sc-cursor");
    const ring = document.getElementById("sc-cursor-ring");
    if (!cur || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0, rafId;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      cur.style.left = mx + "px"; cur.style.top = my + "px";
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      rafId = requestAnimationFrame(tick);
    };
    const onDown = () => document.body.classList.add("c-click");
    const onUp   = () => document.body.classList.remove("c-click");

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    rafId = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(rafId);
    };
  }, []);
}

function Hoverable({ children, className = "", style, ...rest }) {
  const enter = () => document.body.classList.add("c-hover");
  const leave = () => document.body.classList.remove("c-hover");
  return <div className={className} style={style} onMouseEnter={enter} onMouseLeave={leave} {...rest}>{children}</div>;
}

function Btn({ children, className = "", onClick, style }) {
  const ref = useRef();
  const enter = () => document.body.classList.add("c-hover");
  const leave = () => document.body.classList.remove("c-hover");

  return (
    <button ref={ref} className={`btn ${className}`} style={style}
      onMouseEnter={enter} onMouseLeave={leave}
      onClick={(e) => { addRipple(e, ref.current); onClick?.(e); }}>
      {children}
    </button>
  );
}

function AnimatedProgressBar({ pct, color, height = 3, delay = 500 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div style={{ height, background:"var(--surface3)", borderRadius:2, overflow:"hidden" }}>
      <div style={{
        height: "100%",
        width: `${width}%`,
        background: color,
        borderRadius: 2,
        transition: "width 1.1s ease"
      }} />
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────
function Sidebar() {
  const [priW, setPriW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPriW(72), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sb-top">
        <a href="#" className="sb-brand">
          <div className="sb-mark">SC</div>
          <span className="sb-name">SmartCampus</span>
        </a>
      </div>
      <div className="sb-user">
        <div className="sb-avatar">AR</div>
        <div>
          <div className="sb-uname">Arjun Reddy</div>
          <div className="sb-urole">CSE · Sem 5 · Roll 21CS047</div>
        </div>
      </div>
      <nav className="sb-nav">
        {NAV_ITEMS.map(({ section, links }) => (
          <div key={section}>
            <div className="sb-sec-label">{section}</div>
            {links.map(({ label, icon, active, badge, badgeClass }) => (
              <a key={label} href="#" className={`sb-link ${active ? "active" : ""}`}
                onClick={e => e.preventDefault()}>
                {icon}
                {label}
                {badge && <span className={`sb-badge ${badgeClass || ""}`}>{badge}</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="sb-bottom">
        <div className="sb-pri">
          <div className="sb-pri-lbl">Placement Readiness Index</div>
          <div className="sb-pri-val">72</div>
          <div className="sb-pri-sub">Good · 13 pts to Excellent</div>
          <div className="sb-pri-bar">
            <div className="sb-pri-fill" style={{ width: `${priW}%` }} />
          </div>
        </div>
        <a href="#" className="sb-link" onClick={e => e.preventDefault()}>
          <IcoSettings /> Settings
        </a>
      </div>
    </aside>
  );
}

// ─── TOPBAR ──────────────────────────────────────────────────────
function Topbar() {
  const date = new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" });
  return (
    <div className="topbar">
      <span className="tb-page">Dashboard</span>
      <div className="tb-sep" />
      <div className="tb-search">
        <IcoSearch style={{ color:"var(--text3)", flexShrink:0 }} />
        <input type="text" placeholder="Search courses, topics, people…" />
      </div>
      <div className="tb-right">
        <span className="tb-date">{date}</span>
        <div className="tb-icon-btn">
          <IcoBell /> <div className="notif-dot" />
        </div>
        <div className="tb-icon-btn">
          <IcoUser />
        </div>
        <Btn className="btn-solid" style={{ padding:"7px 16px", fontSize:11, gap:5 }}>
          <IcoPlus /> Resume
        </Btn>
      </div>
    </div>
  );
}

// ─── LUCYNA PANEL ────────────────────────────────────────────────
function LucynaPanel({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role:"ai",  html:"Hey Arjun! 👋 You have an <strong style='color:var(--indigo-ll)'>OS quiz</strong> today. Want a quick recap on <strong style='color:var(--teal)'>Process Scheduling</strong>?" },
    { role:"user",html:"Yes! Especially Round Robin and Priority Scheduling." },
    { role:"ai",  html:"<strong style='color:var(--teal)'>Round Robin</strong> uses a fixed time quantum (10–20ms). Each process gets equal CPU time — no starvation, but higher avg turnaround for long jobs.<br/><br/>Your quiz has 3 questions on this. Want a practice set? 🎯" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [aiIdx, setAiIdx] = useState(0);
  const msgRef = useRef();

  useEffect(() => {
    if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight;
  }, [messages, typing]);

  const send = useCallback((text) => {
    const val = text || input.trim();
    if (!val) return;
    setMessages(m => [...m, { role:"user", html:val }]);
    setInput("");
    setShowChips(false);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role:"ai", html:AI_RESPONSES[aiIdx % AI_RESPONSES.length] }]);
      setAiIdx(i => i + 1);
    }, 950);
  }, [input, aiIdx]);

  return (
    <div className={`lucyna-panel ${open ? "open" : ""}`}>
      <div className="lp-header">
        <div className="lp-orb">
          <div className="lp-orb-ring" />
          <IcoBrain width={17} height={17} />
        </div>
        <div>
          <div className="lp-name">Lucyna AI Mentor</div>
          <div className="lp-status"><div className="lp-dot" />Online · Always available</div>
        </div>
        <button className="lp-close" onClick={onClose}>
          <IcoClose />
        </button>
      </div>

      <div className="lp-messages" ref={msgRef}>
        {messages.map((m, i) => (
          <div key={i} className={`lp-msg ${m.role === "user" ? "user" : ""}`}>
            <div className={`msg-av ${m.role === "ai" ? "ai-av" : "usr-av"}`}>{m.role === "ai" ? "L" : "A"}</div>
            <div className={`msg-bubble ${m.role}`} dangerouslySetInnerHTML={{ __html: m.html }} />
          </div>
        ))}
        {typing && (
          <div className="lp-msg">
            <div className="msg-av ai-av">L</div>
            <div className="msg-bubble ai"><div className="typing-dots"><span/><span/><span/></div></div>
          </div>
        )}
      </div>

      {showChips && (
        <div className="lp-suggestions">
          {["Practice MCQs","Explain Deadlock","My weak topics","Quick summary"].map(c => (
            <span key={c} className="lp-chip" onClick={() => send(c)}>{c}</span>
          ))}
        </div>
      )}

      <div className="lp-input-row">
        <input className="lp-input" value={input} placeholder="Ask anything about your coursework…"
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()} />
        <button className="lp-send" onClick={() => send()}>
          <IcoSend />
        </button>
      </div>
    </div>
  );
}

// ─── LUCYNA FAB ──────────────────────────────────────────────────
function LucynaFab({ onClick }) {
  return (
    <button className="lucyna-fab" onClick={onClick} aria-label="Open Lucyna AI">
      <div className="lucyna-fab-ring" />
      <div className="lucyna-fab-dot" />
      <IcoBrain />
      <span className="lucyna-fab-tip">Ask Lucyna AI</span>
    </button>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function StudentDashboard() {
  const [aiOpen, setAiOpen] = useState(false);

  useCursor();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setAiOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <div className="sc-cursor" id="sc-cursor" />
      <div className="sc-cursor-ring" id="sc-cursor-ring" />
      <div className="sc-noise" />

      <LucynaFab onClick={() => setAiOpen(o => !o)} />
      <LucynaPanel open={aiOpen} onClose={() => setAiOpen(false)} />

      <div className="app">
        <Sidebar />
        <main className="main">
          <Topbar />
          <div className="content">

            <div className="greet-row">
              <div className="greet-tag">
                <div className="greet-pip" />
                <span className="greet-pip-txt">Semester 5 · Week 11</span>
              </div>
              <h1 className="greet-title">Good morning, <em>Arjun</em></h1>
              <p className="greet-sub">You have 3 pending assignments and 1 quiz due today. Let's get ahead.</p>
              <div className="greet-actions">
                <Btn className="btn-solid"><IcoPlay /> Continue Learning</Btn>
                <Btn className="btn-ghost"><IcoCal /> View Schedule</Btn>
              </div>
            </div>

            <div className="stat-grid">
              {[
                { cls:"sc-indigo", icon:<IcoBook width={18} height={18}/>, val:"6",   lbl:"Active Courses",      delta:<><IcoChevUp/>2 this semester</>,   dc:"delta-up" },
                { cls:"sc-teal",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, val:"8.4", lbl:"Current CGPA", delta:<><IcoChevUp/>+0.2 vs last sem</>, dc:"delta-up" },
                { cls:"sc-amber",  icon:<IcoUsers width={18} height={18}/>, val:"83%",lbl:"Attendance Rate",      delta:<><IcoChevDn/>Min 75% required</>,  dc:"delta-dn" },
                { cls:"sc-violet", icon:<IcoAward width={18} height={18}/>, val:"72", lbl:"Placement Readiness",  delta:<><IcoMinus/>Improving steadily</>, dc:"delta-neu" },
              ].map(({ cls, icon, val, lbl, delta, dc }, i) => (
                <Hoverable key={lbl} className={`stat-card ${cls}`} style={{ animationDelay:`${(i+1)*0.07}s` }}>
                  <div className="stat-ic">{icon}</div>
                  <div className="stat-val">{val}</div>
                  <div className="stat-lbl">{lbl}</div>
                  <span className={`stat-delta ${dc}`}>{delta}</span>
                </Hoverable>
              ))}
            </div>

            <div className="panel" style={{ animationDelay:"0.07s" }}>
              <div className="panel-hd">
                <div className="panel-ttl">
                  <IcoBook width={14} height={14} style={{ color:"var(--indigo-ll)" }} />
                  Active Courses <span>6 enrolled</span>
                </div>
                <a href="#" className="panel-act" onClick={e => e.preventDefault()}>
                  View all <IcoChevR />
                </a>
              </div>
              <div className="panel-body">
                <div className="course-list">
                  {COURSES.map((c) => (
                    <Hoverable key={c.name} className="course-item">
                      <div className="ci-badge" style={c.badgeStyle}>{c.icon}</div>
                      <div className="ci-info">
                        <div className="ci-name">{c.name}</div>
                        <div className="ci-meta">{c.meta}</div>
                        <div className="ci-prog">
                          <AnimatedProgressBar pct={c.pct} color={c.color} />
                          <div className="ci-prog-lbl">
                            <span className="ci-prog-pct" style={{ color:c.pctColor }}>{c.pct}%</span>
                            <span className="ci-prog-next">{c.next}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ci-right">
                        <div className="ci-grade" style={c.gradeStyle}>{c.grade}</div>
                        <div className="ci-due">{c.due}</div>
                      </div>
                    </Hoverable>
                  ))}
                </div>
              </div>
            </div>

            <div className="bottom-grid">

              <div className="panel" style={{ animationDelay:"0.07s" }}>
                <div className="panel-hd">
                  <div className="panel-ttl">
                    <IcoCal width={14} height={14} style={{ color:"var(--indigo-ll)" }} />
                    Today's Schedule <span>Fri, 28 Feb</span>
                  </div>
                  <a href="#" className="panel-act" onClick={e => e.preventDefault()}>Full week <IcoChevR /></a>
                </div>
                <div className="panel-body">
                  <div className="sched-list">
                    {SCHEDULE.map((s) => (
                      <Hoverable key={s.from} className="sched-item">
                        <div className="sched-time">
                          <div className="st-from" style={{ color:s.color }}>{s.from}</div>
                          <div className="st-to">{s.to}</div>
                        </div>
                        <div className="sched-div" style={{ background:s.color }} />
                        <div className="sched-info">
                          <div className="si-name">{s.name}</div>
                          <div className="si-room">{s.room}</div>
                          <span className="si-tag" style={s.tagStyle}>{s.tag}</span>
                        </div>
                      </Hoverable>
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel" style={{ animationDelay:"0.12s" }}>
                <div className="panel-hd">
                  <div className="panel-ttl">
                    <IcoClock width={14} height={14} style={{ color:"var(--indigo-ll)" }} />
                    Quiz Performance <span>Last 30 days</span>
                  </div>
                  <a href="#" className="panel-act" onClick={e => e.preventDefault()}>History <IcoChevR /></a>
                </div>
                <div className="panel-body">
                  <div className="quiz-list">
                    {QUIZZES.map((q) => (
                      <Hoverable key={q.name} className="quiz-item">
                        <div className="qi-top">
                          <span className="qi-name">{q.name}</span>
                          <span className="qi-score" style={q.scoreStyle}>{q.score}</span>
                        </div>
                        <div className="qi-bar">
                          <div className="qi-fill" style={{ width:`${q.pct}%`, background:q.bar }} />
                        </div>
                        <div className="qi-meta">
                          <span>{q.answered}</span><span>{q.rank}</span>
                        </div>
                      </Hoverable>
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel" style={{ animationDelay:"0.18s" }}>
                <div className="panel-hd">
                  <div className="panel-ttl">
                    <IcoBar width={14} height={14} style={{ color:"var(--indigo-ll)" }} />
                    Skill Tracker
                  </div>
                  <a href="#" className="panel-act" onClick={e => e.preventDefault()}>Full report <IcoChevR /></a>
                </div>
                <div className="panel-body">
                  <div className="skill-list">
                    {SKILLS.map((s) => (
                      <Hoverable key={s.label} className="skill-item">
                        <span className="sk-label">{s.label}</span>
                        <AnimatedProgressBar pct={s.pct} color={s.color} height={5} delay={600} />
                        <span className="sk-pct" style={{ color:s.pctColor }}>{s.pct}%</span>
                      </Hoverable>
                    ))}
                  </div>
                  <div className="skill-summary">
                    <div className="ss-ttl">Placement Readiness Index</div>
                    <div className="ss-pri">
                      <div className="ss-pri-val">72</div>
                      <div className="ss-pri-info">
                        <div className="ss-pri-bar">
                          <AnimatedProgressBar pct={72} color="linear-gradient(90deg,var(--indigo),var(--teal))" height={4} delay={700} />
                        </div>
                        <div className="ss-pri-lbl">Good · Target 85 for excellent tier</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}