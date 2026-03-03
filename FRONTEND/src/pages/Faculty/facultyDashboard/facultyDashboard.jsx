// FacultyDashboard.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FacultyDashboard.css";
import FacultyAnalytics from "../facultyAnalytics/facultyAnalytics";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoDashboard = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoBar     = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoBook    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoVideo   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IcoFile    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>;
const IcoClock   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoCal     = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoAward   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoPen     = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoSettings= (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 1 0 0 14.14"/><path d="M19.07 4.93L16 8"/></svg>;
const IcoBell    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoUser    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>;
const IcoSearch  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoChevR   = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoChevUp  = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoChevDn  = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoMinus   = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoClose   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoSend    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="#fff" stroke="none"/></svg>;
const IcoBrain   = (p) => <svg {...p} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoAlert   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoUpload  = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcoFlash   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoHamburger = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
// ── NEW: Logout icon ──
const IcoLogout  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

// ─── ROUTE KEYS ──────────────────────────────────────────────────
const ROUTES = {
  DASHBOARD: "Dashboard",
  ANALYTICS: "Analytics",
};

// ─── DATA ────────────────────────────────────────────────────────
const MY_COURSES = [
  {
    name: "Operating Systems", code: "CS501", sem: "Sem 5", students: 112,
    lectures: { done: 33, total: 42 }, avgAttendance: 81, avgScore: 74,
    color: "var(--indigo-l)", badgeStyle: { background: "rgba(91,78,248,.12)", color: "var(--indigo-ll)" },
    pctColor: "var(--indigo-ll)", pendingGrade: 8,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  },
  {
    name: "Database Management Systems", code: "CS502", sem: "Sem 5", students: 108,
    lectures: { done: 23, total: 38 }, avgAttendance: 76, avgScore: 68,
    color: "var(--teal)", badgeStyle: { background: "rgba(39,201,176,.1)", color: "var(--teal)" },
    pctColor: "var(--teal)", pendingGrade: 14,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  },
  {
    name: "Computer Architecture", code: "CS503", sem: "Sem 3", students: 96,
    lectures: { done: 28, total: 36 }, avgAttendance: 88, avgScore: 79,
    color: "var(--violet)", badgeStyle: { background: "rgba(159,122,234,.12)", color: "var(--violet)" },
    pctColor: "var(--violet)", pendingGrade: 3,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  },
];

const WEAK_TOPICS = [
  { course: "OS", topic: "Deadlock Detection", students: 34, pct: 30, color: "var(--rose)", bar: "var(--rose)" },
  { course: "DBMS", topic: "Transaction Isolation Levels", students: 41, pct: 38, color: "var(--amber)", bar: "var(--amber)" },
  { course: "OS", topic: "Page Replacement Algorithms", students: 28, pct: 25, color: "var(--rose)", bar: "var(--rose)" },
  { course: "DBMS", topic: "B+ Tree Indexing", students: 22, pct: 20, color: "var(--amber)", bar: "var(--amber)" },
  { course: "CA", topic: "Cache Coherence Protocols", students: 19, pct: 20, color: "var(--violet)", bar: "var(--violet)" },
];

const PENDING_TASKS = [
  { label: "Grade OS Assignment #4", course: "CS501", due: "Today",   urgent: true,  type: "grade" },
  { label: "Upload DBMS Lecture 24 Notes", course: "CS502", due: "Today",   urgent: true,  type: "upload" },
  { label: "Review 14 DBMS Quiz Submissions", course: "CS502", due: "Tomorrow", urgent: false, type: "quiz" },
  { label: "Generate Unit IV Question Paper",  course: "CS501", due: "3 days",  urgent: false, type: "qpaper" },
  { label: "Approve 6 Student Projects",       course: "CS503", due: "4 days",  urgent: false, type: "approve" },
];

const SCHEDULE = [
  { from: "09:00", to: "10:00", name: "Operating Systems — Lecture 34", room: "Room 301 · Sem 5 A", tag: "Lecture", color: "var(--teal)",      tagStyle: { background: "rgba(39,201,176,.1)", color: "var(--teal)" } },
  { from: "10:30", to: "11:30", name: "OS Quiz Evaluation Review",      room: "Faculty Office",      tag: "Review",  color: "var(--amber)",     tagStyle: { background: "rgba(244,165,53,.12)", color: "var(--amber)" } },
  { from: "13:00", to: "14:30", name: "DBMS Lab — Batch B",             room: "Lab 2",               tag: "Lab",     color: "var(--indigo-l)",  tagStyle: { background: "rgba(91,78,248,.1)", color: "var(--indigo-ll)" } },
  { from: "15:00", to: "16:00", name: "Computer Architecture — Lecture 29", room: "Room 102 · Sem 3",tag: "Lecture", color: "var(--violet)",    tagStyle: { background: "rgba(159,122,234,.1)", color: "var(--violet)" } },
  { from: "16:30", to: "17:00", name: "Department Faculty Meeting",      room: "Conference Room A",   tag: "Meeting", color: "var(--rose)",      tagStyle: { background: "rgba(242,68,92,.1)", color: "var(--rose)" } },
];

const TOP_STUDENTS = [
  { name: "Arjun Reddy",   roll: "21CS047", cgpa: 8.9, attendance: 92, course: "OS",   badge: "Top Performer", badgeStyle: { background: "rgba(39,201,176,.1)", color: "var(--teal)" } },
  { name: "Priya Nair",    roll: "21CS031", cgpa: 8.7, attendance: 88, course: "DBMS", badge: "Consistent",    badgeStyle: { background: "rgba(91,78,248,.1)",  color: "var(--indigo-ll)" } },
  { name: "Rohan Mehta",   roll: "21CS019", cgpa: 8.5, attendance: 85, course: "CA",   badge: "Improving",     badgeStyle: { background: "rgba(244,165,53,.1)", color: "var(--amber)" } },
  { name: "Sneha Sharma",  roll: "21CS062", cgpa: 8.3, attendance: 94, course: "OS",   badge: "Top Attendance", badgeStyle: { background: "rgba(159,122,234,.1)", color: "var(--violet)" } },
  { name: "Dev Iyer",      roll: "21CS008", cgpa: 8.1, attendance: 79, course: "DBMS", badge: "At Risk",        badgeStyle: { background: "rgba(242,68,92,.1)", color: "var(--rose)" } },
];

const QUIZ_STATS = [
  { name: "OS – Process Scheduling",  avg: 74, highest: 98, lowest: 32, submitted: 108, total: 112, color: "var(--indigo-l)" },
  { name: "DBMS – Normalization",     avg: 68, highest: 95, lowest: 28, submitted: 102, total: 108, color: "var(--teal)" },
  { name: "CA – Instruction Set",     avg: 79, highest: 100, lowest: 44, submitted: 94,  total: 96,  color: "var(--violet)" },
];

const AI_RESPONSES_FAC = [
  "Based on quiz results, <strong style='color:var(--rose)'>34 students</strong> scored below 40% on Deadlock Detection. Want me to generate a remedial quiz set? 🎯",
  "Average attendance in DBMS dropped by <strong style='color:var(--amber)'>6%</strong> this week. Students with &lt;75% include Ravi Kumar, Meena S., and 3 others.",
  "I've analyzed 108 OS assignment submissions. Common error: <strong style='color:var(--teal)'>incorrect Round Robin queue simulation</strong>. Want detailed feedback per student?",
  "Generating a 20-question Unit IV paper on <strong style='color:var(--indigo-ll)'>Memory Management</strong> with difficulty distribution: 40% easy, 40% medium, 20% hard. Ready in 10 seconds.",
  "Your course completion rate is <strong style='color:var(--teal)'>ahead by 2 lectures</strong> compared to the semester plan. Great pacing, Dr. Prakash! ✨",
];

const NAV_ITEMS = [
  { section: "Overview", links: [
    { label: "Dashboard",       icon: <IcoDashboard/>, active: true },
    { label: "Analytics",       icon: <IcoBar/>,       badge: "New" },
  ]},
  { section: "Teaching", links: [
    { label: "My Courses",      icon: <IcoBook/>,  badge: "3" },
    { label: "Video Lectures",  icon: <IcoVideo/> },
    { label: "Assignments",     icon: <IcoFile/>,  badge: "22", badgeClass: "rose" },
    { label: "Quiz Manager",    icon: <IcoClock/> },
  ]},
  { section: "Students", links: [
    { label: "All Students",    icon: <IcoUsers/> },
    { label: "Attendance",      icon: <IcoCal/> },
    { label: "Grade Book",      icon: <IcoPen/>,   badge: "25", badgeClass: "rose" },
  ]},
  { section: "Tools", links: [
    { label: "Question Bank",   icon: <IcoAward/> },
    { label: "AI Assistant",    icon: <IcoBrain width={16} height={16}/> },
    { label: "Reports",         icon: <IcoTrend/> },
  ]},
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
    const cur = document.getElementById("fc-cursor");
    const ring = document.getElementById("fc-cursor-ring");
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
    const t = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height, background: "var(--surface3)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 2, transition: "width 1.1s ease" }} />
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────
function Sidebar({ open, onClose, activePage, onNavigate }) {
  const logoutNavigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logoutNavigate("/login", { replace: true });
  };

  return (
    <>
      <div className={`sb-overlay ${open ? "visible" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "sb-open" : ""}`}>
        <div className="sb-top">
          <a href="#" className="sb-brand">
            <div className="sb-mark">SC</div>
            <span className="sb-name">SmartCampus</span>
          </a>
          <button className="sb-mobile-close" onClick={onClose} aria-label="Close menu">
            <IcoClose />
          </button>
        </div>
        <div className="sb-user">
          <div className="sb-avatar">SP</div>
          <div>
            <div className="sb-uname">Dr. S. Prakash</div>
            <div className="sb-urole">Faculty · CSE Dept · 3 Courses</div>
          </div>
        </div>
        <nav className="sb-nav">
          {NAV_ITEMS.map(({ section, links }) => (
            <div key={section}>
              <div className="sb-sec-label">{section}</div>
              {links.map(({ label, icon, badge, badgeClass }) => {
                const isActive = activePage === label;
                const isRoutable = label === ROUTES.DASHBOARD || label === ROUTES.ANALYTICS;
                return (
                  <a key={label} href="#" className={`sb-link ${isActive ? "active" : ""}`}
                    onClick={e => {
                      e.preventDefault();
                      if (isRoutable) { onNavigate(label); onClose(); }
                    }}>
                    {icon}{label}
                    {badge && <span className={`sb-badge ${badgeClass || ""}`}>{badge}</span>}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sb-bottom">
          <div className="sb-stat-row">
            <div className="sb-mini-stat">
              <div className="sb-mini-val teal">316</div>
              <div className="sb-mini-lbl">Students</div>
            </div>
            <div className="sb-mini-sep" />
            <div className="sb-mini-stat">
              <div className="sb-mini-val indigo">82%</div>
              <div className="sb-mini-lbl">Avg Attendance</div>
            </div>
            <div className="sb-mini-sep" />
            <div className="sb-mini-stat">
              <div className="sb-mini-val amber">25</div>
              <div className="sb-mini-lbl">Pending</div>
            </div>
          </div>
          <a href="#" className="sb-link" onClick={e => e.preventDefault()}>
            <IcoSettings /> Settings
          </a>
          {/* ── LOGOUT ── */}
          <button className="sb-logout" onClick={handleLogout}>
            <IcoLogout /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── TOPBAR ──────────────────────────────────────────────────────
function Topbar({ onHamburger }) {
  const date = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="topbar">
      <button className="tb-hamburger" onClick={onHamburger} aria-label="Toggle menu">
        <IcoHamburger />
      </button>
      <span className="tb-page">Faculty Dashboard</span>
      <div className="tb-sep" />
      <div className="tb-search">
        <IcoSearch style={{ color: "var(--text3)", flexShrink: 0 }} />
        <input type="text" placeholder="Search students, courses, topics…" />
      </div>
      <div className="tb-right">
        <span className="tb-date">{date}</span>
        <div className="tb-icon-btn">
          <IcoBell /><div className="notif-dot" />
        </div>
        <div className="tb-icon-btn"><IcoUser /></div>
        <Btn className="btn-solid" style={{ padding: "7px 16px", fontSize: 11, gap: 5 }}>
          <IcoFlash /> Quick Actions
        </Btn>
      </div>
    </div>
  );
}

// ─── AI ASSISTANT PANEL ──────────────────────────────────────────
function AiPanel({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role: "ai",   html: "Hello Dr. Prakash! 👋 You have <strong style='color:var(--rose)'>22 ungraded submissions</strong> and an OS lecture at 9 AM today." },
    { role: "user", html: "Give me a summary of OS quiz performance." },
    { role: "ai",   html: "OS Quiz — Process Scheduling results:<br/><br/>📊 Class avg: <strong style='color:var(--teal)'>74%</strong> · Highest: 98% · Lowest: 32%<br/>⚠️ <strong style='color:var(--rose)'>18 students below 50%</strong> — mostly struggling with Round Robin & Priority inversion.<br/><br/>Want me to flag these students or generate targeted practice questions?" },
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
    setMessages(m => [...m, { role: "user", html: val }]);
    setInput(""); setShowChips(false); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: "ai", html: AI_RESPONSES_FAC[aiIdx % AI_RESPONSES_FAC.length] }]);
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
          <div className="lp-name">Lucyna AI Assistant</div>
          <div className="lp-status"><div className="lp-dot" />Faculty Mode · Always on</div>
        </div>
        <button className="lp-close" onClick={onClose}><IcoClose /></button>
      </div>
      <div className="lp-messages" ref={msgRef}>
        {messages.map((m, i) => (
          <div key={i} className={`lp-msg ${m.role === "user" ? "user" : ""}`}>
            <div className={`msg-av ${m.role === "ai" ? "ai-av" : "usr-av"}`}>{m.role === "ai" ? "L" : "P"}</div>
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
          {["Generate Quiz", "Weak topics", "Attendance report", "Grade submissions"].map(c => (
            <span key={c} className="lp-chip" onClick={() => send(c)}>{c}</span>
          ))}
        </div>
      )}
      <div className="lp-input-row">
        <div className="lp-input-wrap">
          <input className="lp-input" value={input} placeholder="Ask about students, grades, analytics…"
            onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
          {input && (
            <button className="lp-clear" onClick={() => setInput("")} aria-label="Clear input">
              <IcoClose width={10} height={10} />
            </button>
          )}
        </div>
        <label className="lp-attach" title="Attach file" aria-label="Upload attachment">
          <input type="file" style={{ display: "none" }} />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16"/>
            <line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
        </label>
        <button className="lp-send" onClick={() => send()} aria-label="Send message">
          <IcoSend />
        </button>
      </div>
    </div>
  );
}

function AiFab({ onClick }) {
  return (
    <button className="lucyna-fab" onClick={onClick} aria-label="Open AI Assistant">
      <div className="lucyna-fab-ring" />
      <div className="lucyna-fab-dot" />
      <IcoBrain />
      <span className="lucyna-fab-tip">AI Assistant</span>
    </button>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────
export default function FacultyDashboard() {
  const navigateRouter = useNavigate();
  const { page } = useParams();

  const [activePage, setActivePage] = useState(() =>
    page && page.toLowerCase() === "analytics" ? ROUTES.ANALYTICS : ROUTES.DASHBOARD
  );
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState([]);

  useCursor();

  const navigate = (p) => {
    setActivePage(p);
    if (p === ROUTES.ANALYTICS) {
      navigateRouter("/facultydashboard/facultyAnalytics");
    } else {
      navigateRouter("/facultydashboard");
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") { setAiOpen(false); setSidebarOpen(false); }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const toggleTask = (i) => {
    setCheckedTasks(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  return (
    <>
      <div className="fc-cursor" id="fc-cursor" />
      <div className="fc-cursor-ring" id="fc-cursor-ring" />
      <div className="sc-noise" />

      <AiFab onClick={() => setAiOpen(o => !o)} />
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />

      <div className="app">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onNavigate={navigate}
        />
        <main className="main">
          <Topbar onHamburger={() => setSidebarOpen(o => !o)} />
          {activePage === ROUTES.DASHBOARD && (
            <div className="content">

              {/* ── GREETING ── */}
              <div className="greet-row">
                <div className="greet-tag">
                  <div className="greet-pip" />
                  <span className="greet-pip-txt">Academic Year 2024–25 · Semester 5 · Week 11</span>
                </div>
                <h1 className="greet-title">Good morning, <em>Dr. Prakash</em></h1>
                <p className="greet-sub">You have 22 pending submissions to grade and an OS lecture at 9:00 AM today.</p>
                <div className="greet-actions">
                  <Btn className="btn-solid"><IcoPen /> Grade Submissions</Btn>
                  <Btn className="btn-ghost"><IcoPlus /> Create Quiz</Btn>
                  <Btn className="btn-ghost"><IcoUpload /> Upload Lecture</Btn>
                </div>
              </div>

              {/* ── STAT CARDS ── */}
              <div className="stat-grid">
                {[
                  { cls: "sc-teal",   icon: <IcoUsers width={18} height={18}/>,  val: "316",  lbl: "Total Students",     delta: <><IcoChevUp/>+12 this semester</>,  dc: "delta-up" },
                  { cls: "sc-indigo", icon: <IcoBook width={18} height={18}/>,   val: "3",    lbl: "Active Courses",     delta: <><IcoMinus/>Same as last sem</>,    dc: "delta-neu" },
                  { cls: "sc-amber",  icon: <IcoCal width={18} height={18}/>,    val: "82%",  lbl: "Avg Attendance",     delta: <><IcoChevDn/>−3% vs last week</>,   dc: "delta-dn" },
                  { cls: "sc-violet", icon: <IcoTrend width={18} height={18}/>,  val: "73%",  lbl: "Avg Class Score",    delta: <><IcoChevUp/>+2% vs last quiz</>,   dc: "delta-up" },
                ].map(({ cls, icon, val, lbl, delta, dc }, i) => (
                  <Hoverable key={lbl} className={`stat-card ${cls}`} style={{ animationDelay: `${(i + 1) * 0.07}s` }}>
                    <div className="stat-ic">{icon}</div>
                    <div className="stat-val">{val}</div>
                    <div className="stat-lbl">{lbl}</div>
                    <span className={`stat-delta ${dc}`}>{delta}</span>
                  </Hoverable>
                ))}
              </div>

              {/* ── MY COURSES ── */}
              <div className="panel" style={{ animationDelay: "0.07s" }}>
                <div className="panel-hd">
                  <div className="panel-ttl">
                    <IcoBook width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
                    My Courses <span>3 active this semester</span>
                  </div>
                  <a href="#" className="panel-act" onClick={e => e.preventDefault()}>Manage <IcoChevR /></a>
                </div>
                <div className="panel-body">
                  <div className="course-faculty-grid">
                    {MY_COURSES.map((c) => (
                      <Hoverable key={c.name} className="course-faculty-card">
                        <div className="cfc-top">
                          <div className="ci-badge" style={c.badgeStyle}>{c.icon}</div>
                          <div className="cfc-meta">
                            <div className="cfc-code">{c.code} · {c.sem}</div>
                            <div className="cfc-name">{c.name}</div>
                          </div>
                          {c.pendingGrade > 0 && (
                            <div className="cfc-pending">{c.pendingGrade} to grade</div>
                          )}
                        </div>
                        <div className="cfc-stats">
                          <div className="cfc-stat-item">
                            <div className="cfc-stat-val" style={{ color: c.pctColor }}>{c.students}</div>
                            <div className="cfc-stat-lbl">Students</div>
                          </div>
                          <div className="cfc-stat-sep" />
                          <div className="cfc-stat-item">
                            <div className="cfc-stat-val" style={{ color: c.avgAttendance >= 85 ? "var(--teal)" : c.avgAttendance >= 75 ? "var(--amber)" : "var(--rose)" }}>{c.avgAttendance}%</div>
                            <div className="cfc-stat-lbl">Attendance</div>
                          </div>
                          <div className="cfc-stat-sep" />
                          <div className="cfc-stat-item">
                            <div className="cfc-stat-val" style={{ color: "var(--violet)" }}>{c.avgScore}%</div>
                            <div className="cfc-stat-lbl">Avg Score</div>
                          </div>
                        </div>
                        <div className="cfc-progress">
                          <div className="cfc-prog-lbl">
                            <span style={{ color: "var(--text3)", fontSize: 10 }}>Lecture Progress</span>
                            <span style={{ color: c.pctColor, fontSize: 10, fontWeight: 600 }}>{c.lectures.done}/{c.lectures.total}</span>
                          </div>
                          <AnimatedProgressBar pct={Math.round((c.lectures.done / c.lectures.total) * 100)} color={c.color} height={4} delay={600} />
                        </div>
                        <div className="cfc-actions">
                          <Btn className="btn-ghost" style={{ fontSize: 10, padding: "5px 10px", gap: 4 }}><IcoPen width={10} height={10} />Grade</Btn>
                          <Btn className="btn-ghost" style={{ fontSize: 10, padding: "5px 10px", gap: 4 }}><IcoUpload width={10} height={10} />Upload</Btn>
                          <Btn className="btn-solid" onClick={() => navigate(ROUTES.ANALYTICS)} style={{ fontSize: 10, padding: "5px 10px", gap: 4, marginLeft: "auto" }}><IcoBar width={10} height={10} />Analytics</Btn>
                        </div>
                      </Hoverable>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── BOTTOM ROW 1: SCHEDULE + PENDING ── */}
              <div className="two-col-grid">
                <div className="panel" style={{ animationDelay: "0.07s" }}>
                  <div className="panel-hd">
                    <div className="panel-ttl">
                      <IcoCal width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
                      Today's Schedule <span>Fri, 28 Feb</span>
                    </div>
                    <a href="#" className="panel-act" onClick={e => e.preventDefault()}>Full week <IcoChevR /></a>
                  </div>
                  <div className="panel-body">
                    <div className="sched-list">
                      {SCHEDULE.map((s) => (
                        <Hoverable key={s.from} className="sched-item">
                          <div className="sched-time">
                            <div className="st-from" style={{ color: s.color }}>{s.from}</div>
                            <div className="st-to">{s.to}</div>
                          </div>
                          <div className="sched-div" style={{ background: s.color }} />
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

                <div className="panel" style={{ animationDelay: "0.12s" }}>
                  <div className="panel-hd">
                    <div className="panel-ttl">
                      <IcoAlert width={14} height={14} style={{ color: "var(--rose)" }} />
                      Pending Tasks
                      <span style={{ color: "var(--rose)" }}>{PENDING_TASKS.length - checkedTasks.length} remaining</span>
                    </div>
                    <a href="#" className="panel-act" onClick={e => e.preventDefault()}>All tasks <IcoChevR /></a>
                  </div>
                  <div className="panel-body">
                    <div className="task-list">
                      {PENDING_TASKS.map((t, i) => (
                        <Hoverable key={i} className={`task-item ${checkedTasks.includes(i) ? "done" : ""}`}
                          onClick={() => toggleTask(i)}>
                          <div className={`task-check ${checkedTasks.includes(i) ? "checked" : ""}`}>
                            {checkedTasks.includes(i) && <IcoCheck />}
                          </div>
                          <div className="task-body">
                            <div className="task-label">{t.label}</div>
                            <div className="task-sub">{t.course}</div>
                          </div>
                          <div className={`task-due ${t.urgent ? "urgent" : ""}`}>{t.due}</div>
                        </Hoverable>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BOTTOM ROW 2: QUIZ STATS + WEAK TOPICS + STUDENTS ── */}
              <div className="three-col-grid">
                <div className="panel" style={{ animationDelay: "0.07s" }}>
                  <div className="panel-hd">
                    <div className="panel-ttl">
                      <IcoClock width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
                      Quiz Analytics <span>Recent</span>
                    </div>
                    <a href="#" className="panel-act" onClick={e => e.preventDefault()}>All quizzes <IcoChevR /></a>
                  </div>
                  <div className="panel-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {QUIZ_STATS.map((q) => (
                        <Hoverable key={q.name} className="quiz-faculty-item">
                          <div className="qfi-top">
                            <span className="qfi-name">{q.name}</span>
                            <span className="qfi-sub">{q.submitted}/{q.total} submitted</span>
                          </div>
                          <div className="qfi-bars">
                            <div className="qfi-bar-row">
                              <span className="qfi-bar-lbl">Avg</span>
                              <div className="qfi-bar-track"><AnimatedProgressBar pct={q.avg} color={q.color} height={4} delay={700} /></div>
                              <span className="qfi-bar-val" style={{ color: q.color }}>{q.avg}%</span>
                            </div>
                            <div className="qfi-bar-row">
                              <span className="qfi-bar-lbl">High</span>
                              <div className="qfi-bar-track"><AnimatedProgressBar pct={q.highest} color="var(--teal)" height={4} delay={800} /></div>
                              <span className="qfi-bar-val" style={{ color: "var(--teal)" }}>{q.highest}%</span>
                            </div>
                            <div className="qfi-bar-row">
                              <span className="qfi-bar-lbl">Low</span>
                              <div className="qfi-bar-track"><AnimatedProgressBar pct={q.lowest} color="var(--rose)" height={4} delay={900} /></div>
                              <span className="qfi-bar-val" style={{ color: "var(--rose)" }}>{q.lowest}%</span>
                            </div>
                          </div>
                        </Hoverable>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="panel" style={{ animationDelay: "0.12s" }}>
                  <div className="panel-hd">
                    <div className="panel-ttl">
                      <IcoAlert width={14} height={14} style={{ color: "var(--amber)" }} />
                      Weak Topics Detected
                    </div>
                    <a href="#" className="panel-act" onClick={e => e.preventDefault()}>Generate remedials <IcoChevR /></a>
                  </div>
                  <div className="panel-body">
                    <div className="weak-list">
                      {WEAK_TOPICS.map((w, i) => (
                        <Hoverable key={i} className="weak-item">
                          <div className="wi-top">
                            <span className="wi-course" style={{ color: w.color }}>{w.course}</span>
                            <span className="wi-name">{w.topic}</span>
                            <span className="wi-count">{w.students} students</span>
                          </div>
                          <AnimatedProgressBar pct={w.pct} color={w.bar} height={3} delay={700 + i * 100} />
                          <div className="wi-hint">Below 40% — needs attention</div>
                        </Hoverable>
                      ))}
                    </div>
                    <div className="weak-footer">
                      <Btn className="btn-solid" style={{ width: "100%", justifyContent: "center", fontSize: 11, padding: "8px 12px" }}>
                        <IcoBrain width={12} height={12} style={{ stroke: "#fff" }} />
                        Auto-generate Remedial Quiz
                      </Btn>
                    </div>
                  </div>
                </div>

                <div className="panel" style={{ animationDelay: "0.18s" }}>
                  <div className="panel-hd">
                    <div className="panel-ttl">
                      <IcoUsers width={14} height={14} style={{ color: "var(--indigo-ll)" }} />
                      Student Spotlight
                    </div>
                    <a href="#" className="panel-act" onClick={e => e.preventDefault()}>All students <IcoChevR /></a>
                  </div>
                  <div className="panel-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {TOP_STUDENTS.map((s, i) => (
                        <Hoverable key={i} className="student-item">
                          <div className="sti-rank">{i + 1}</div>
                          <div className="sti-avatar">{s.name.split(" ").map(x => x[0]).join("")}</div>
                          <div className="sti-info">
                            <div className="sti-name">{s.name}</div>
                            <div className="sti-roll">{s.roll} · {s.course}</div>
                          </div>
                          <div className="sti-right">
                            <div className="sti-cgpa">{s.cgpa}</div>
                            <span className="sti-badge" style={s.badgeStyle}>{s.badge}</span>
                          </div>
                        </Hoverable>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
          {activePage === ROUTES.ANALYTICS && (
            <FacultyAnalytics onBack={() => navigate(ROUTES.DASHBOARD)} />
          )}
        </main>
      </div>
    </>
  );
}