// FacultyDashboard.jsx  — updated with all new page routes
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FacultyDashboard.css";
import FacultyAnalytics from "../facultyAnalytics/facultyAnalytics";
import FacultyMyCourses from "../facultyMycourse/facultyMycourse";
import FacultyVideoLectures from "../facultyVideoLectures/facultyVideoLectures";
import FacultyAssignments from "../facultyAssignments/facultyAssignments";
import FacultyQuizzes from "../facultyQuizzes/facultyQuizzes";
import AllStudents from "../facultyAllStudents/Allstudents";
import Attendance from "../attendance/attendance";
import GradeBook from "../facultyGradeBook/facultyGradeBook";
import QuestionBank from "../facultyQuetionBank/facultyQuestionBank";
import AiAssistant from "../facultyAiAssistence/facultyAiAssistence";
import Reports from "../facultyReport/facultyReport";
import FacultyProfile from "../facultyProfile/facultyProfile";
import FacultySettings from "../facultySettings/facultySettings";
import FacultyQuickaction from "../facultyQuickaction/facultyQuickaction";
import FacultyNotification from "../facultyNotification/facultyNotification";
import FacultyMeeting from "../facultyMeeting/facultyMeeting";
import api from "../../../utils/api";
import lucynaJpg from "../../../assets/Cyberpunk 2077.jpg";
import MailSystem from "../../shared/MailSystem/MailSystem";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoDashboard = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
const IcoBar = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IcoBook = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const IcoVideo = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>;
const IcoFile = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
const IcoClock = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcoUsers = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IcoCal = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IcoAward = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>;
const IcoPen = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
const IcoSettings = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 1 0 0 14.14" /><path d="M19.07 4.93L16 8" /></svg>;
const IcoBell = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const IcoUser = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></svg>;
const IcoSearch = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IcoChevR = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
const IcoChevUp = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>;
const IcoChevDn = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>;
const IcoMinus = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IcoPlus = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IcoClose = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IcoSend = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" fill="#fff" stroke="none" /></svg>;
const IcoBrain = (p) => <svg {...p} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z" /></svg>;
const IcoTrend = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>;
const IcoAlert = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const IcoCheck = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IcoUpload = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>;
const IcoFlash = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const IcoHamburger = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const IcoLogout = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;

// ─── ROUTE KEYS ──────────────────────────────────────────────────
const ROUTES = {
  DASHBOARD: "Dashboard",
  ANALYTICS: "Analytics",
  MY_COURSES: "My Courses",
  VIDEO_LECTURES: "Video Lectures",
  ASSIGNMENTS: "Assignments",
  QUIZZES: "Quiz Manager",
  MEETINGS: "Meetings",
  ALL_STUDENTS: "All Students",
  ATTENDANCE: "Attendance",
  GRADE_BOOK: "Grade Book",
  QUESTION_BANK: "Question Bank",
  AI_ASSISTANT: "AI Assistant",
  REPORTS: "Reports",
  PROFILE: "Profile",
  SETTINGS: "Settings",
  QUICKACTIONS: "Quick Actions",
  NOTIFICATIONS: "Notifications",
  MAIL: "Mail System",
};

const PAGE_PARAM_MAP = {
  "facultyanalytics": ROUTES.ANALYTICS,
  "facultymycourse": ROUTES.MY_COURSES,
  "facultyassignments": ROUTES.ASSIGNMENTS,
  "facultyquizzes": ROUTES.QUIZZES,
  "facultyvideolectures": ROUTES.VIDEO_LECTURES,
  "meetings": ROUTES.MEETINGS,
  "allstudents": ROUTES.ALL_STUDENTS,
  "attendance": ROUTES.ATTENDANCE,
  "gradebook": ROUTES.GRADE_BOOK,
  "questionbank": ROUTES.QUESTION_BANK,
  "aiassistant": ROUTES.AI_ASSISTANT,
  "reports": ROUTES.REPORTS,
  "profile": ROUTES.PROFILE,
  "settings": ROUTES.SETTINGS,
  "quickactions": ROUTES.QUICKACTIONS,
  "notifications": ROUTES.NOTIFICATIONS,
  "facultymail": ROUTES.MAIL,
};

const ROUTE_TO_URL = {
  [ROUTES.DASHBOARD]: "/facultydashboard",
  [ROUTES.ANALYTICS]: "/facultydashboard/facultyAnalytics",
  [ROUTES.MY_COURSES]: "/facultydashboard/facultyMycourse",
  [ROUTES.VIDEO_LECTURES]: "/facultydashboard/facultyVideoLectures",
  [ROUTES.ASSIGNMENTS]: "/facultydashboard/facultyAssignments",
  [ROUTES.QUIZZES]: "/facultydashboard/facultyQuizzes",
  [ROUTES.MEETINGS]: "/facultydashboard/meetings",
  [ROUTES.ALL_STUDENTS]: "/facultydashboard/allStudents",
  [ROUTES.ATTENDANCE]: "/facultydashboard/attendance",
  [ROUTES.GRADE_BOOK]: "/facultydashboard/gradeBook",
  [ROUTES.QUESTION_BANK]: "/facultydashboard/questionBank",
  [ROUTES.AI_ASSISTANT]: "/facultydashboard/aiAssistant",
  [ROUTES.REPORTS]: "/facultydashboard/reports",
  [ROUTES.PROFILE]: "/facultydashboard/profile",
  [ROUTES.SETTINGS]: "/facultydashboard/settings",
  [ROUTES.QUICKACTIONS]: "/facultydashboard/quickactions",
  [ROUTES.NOTIFICATIONS]: "/facultydashboard/notifications",
  [ROUTES.MAIL]: "/facultydashboard/facultyMail",
};

// Constants removed as they are fetched from API

// Constants removed as they are fetched from API

const NAV_ITEMS = [
  {
    section: "Overview", links: [
      { label: ROUTES.DASHBOARD, icon: <IcoDashboard /> },
      { label: ROUTES.ANALYTICS, icon: <IcoBar />, badge: "New" },
    ]
  },
  {
    section: "Teaching", links: [
      { label: ROUTES.MY_COURSES, icon: <IcoBook /> },
      { label: ROUTES.VIDEO_LECTURES, icon: <IcoVideo /> },
      { label: ROUTES.ASSIGNMENTS, icon: <IcoFile /> },
      { label: ROUTES.QUIZZES, icon: <IcoClock /> },
      { label: ROUTES.MEETINGS, icon: <IcoVideo />, badge: "Live" },
    ]
  },
  {
    section: "Students", links: [
      { label: ROUTES.ALL_STUDENTS, icon: <IcoUsers /> },
      { label: ROUTES.ATTENDANCE, icon: <IcoCal /> },
      { label: ROUTES.GRADE_BOOK, icon: <IcoPen /> },
    ]
  },
  {
    section: "Tools", links: [
      { label: ROUTES.QUESTION_BANK, icon: <IcoAward /> },
      { label: ROUTES.AI_ASSISTANT, icon: <IcoBrain width={16} height={16} /> },
      { label: ROUTES.REPORTS, icon: <IcoTrend /> },
    ]
  },
  {
    section: "Communication", links: [
      { label: ROUTES.MAIL, icon: <IcoBell /> },
    ]
  },
  {
    section: "Account", links: [
      { label: ROUTES.SETTINGS, icon: <IcoSettings /> },
    ]
  },
];

// ─── MAPPERS ─────────────────────────────────────────────────────
const mapApiCourse = (c) => ({
  ...c,
  lectures: { done: c.lectures_done, total: c.lectures_total },
  badgeStyle: { background: "rgba(91,78,248,.12)", color: "var(--indigo-ll)" }, // Default styles
  pctColor: c.color || "var(--indigo-ll)",
  pendingGrade: c.pending_grades,
  icon: <IcoBook width={18} height={18} />
});

const mapApiSchedule = (s) => ({
  from: s.from_time,
  to: s.to_time,
  name: s.name,
  room: s.room,
  tag: s.tag,
  color: s.color,
  tagStyle: { background: "rgba(39,201,176,.1)", color: s.color }
});

const mapApiTask = (t) => ({
  label: t.label,
  course: t.course,
  due: t.due,
  urgent: t.urgent,
  type: t.type
});

const mapApiQuiz = (q) => ({
  name: q.name,
  avg: q.avg_score,
  highest: q.highest_score,
  lowest: q.lowest_score,
  submitted: q.submitted_count,
  total: q.total_count,
  color: q.color
});

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
    const onMove = e => { mx = e.clientX; my = e.clientY; };
    const tick = () => { cur.style.left = mx + "px"; cur.style.top = my + "px"; rx += (mx - rx) * .12; ry += (my - ry) * .12; ring.style.left = rx + "px"; ring.style.top = ry + "px"; rafId = requestAnimationFrame(tick); };
    const onDown = () => document.body.classList.add("c-click");
    const onUp = () => document.body.classList.remove("c-click");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    rafId = requestAnimationFrame(tick);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mousedown", onDown); document.removeEventListener("mouseup", onUp); cancelAnimationFrame(rafId); };
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
    <button ref={ref} className={`btn ${className}`} style={style} onMouseEnter={enter} onMouseLeave={leave}
      onClick={e => { addRipple(e, ref.current); onClick?.(e); }}>
      {children}
    </button>
  );
}

function AnimatedProgressBar({ pct, color, height = 3, delay = 500 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height, background: "var(--surface3)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 2, transition: "width 1.1s ease" }} />
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────
function Sidebar({ open, onClose, activePage, onNavigate, userName, userAvatar, stats, tasks, mailUnread }) {
  const logoutNavigate = useNavigate();
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); logoutNavigate("/login", { replace: true }); };

  const ROUTABLE = new Set(Object.values(ROUTES));

  return (
    <>
      <div className={`sb-overlay ${open ? "visible" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "sb-open" : ""}`}>
        <div className="sb-top">
          <a href="#" className="sb-brand">
            <div className="sb-mark">SC</div>
            <span className="sb-name">SmartCampus</span>
          </a>
          <button className="sb-mobile-close" onClick={onClose} aria-label="Close menu"><IcoClose /></button>
        </div>
        <div className="sb-user">
          <div className="sb-avatar">
            {userAvatar ? (
              <img src={userAvatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} />
            ) : (
              userName ? userName.split(" ").map(x => x[0]).join("") : "FP"
            )}
          </div>
          <div>
            <div className="sb-uname">{userName || "Faculty Member"}</div>
            <div className="sb-urole">Faculty · {stats.active_courses} Courses</div>
          </div>
        </div>
        <div className="sb-scrollable">
          <nav className="sb-nav">
            {NAV_ITEMS.map(({ section, links }) => (
              <div key={section}>
                <div className="sb-sec-label">{section}</div>
                {links.map((link) => {
                  const { label, icon, badgeClass, badge } = link;
                  const isActive = activePage === label;
                  let finalBadge = badge;
                  if (label === ROUTES.MY_COURSES && stats?.active_courses != null) {
                    finalBadge = stats.active_courses > 0 ? stats.active_courses : null;
                  }
                  if (label === ROUTES.MAIL && mailUnread > 0) {
                    finalBadge = mailUnread;
                  }
                  
                  return (
                    <a key={label} href="#" className={`sb-link ${isActive ? "active" : ""}`}
                      onClick={e => { e.preventDefault(); if (ROUTABLE.has(label)) { onNavigate(label); onClose(); } }}>
                      {icon}{label}
                      {finalBadge && <span className={`sb-badge ${badgeClass || ""}`}>{finalBadge}</span>}
                    </a>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
        <div className="sb-bottom-fixed">
          <div className="sb-stat-row">
            <div className="sb-mini-stat">
              <div className="sb-mini-val teal">{stats.total_students}</div>
              <div className="sb-mini-lbl">Students</div>
            </div>
            <div className="sb-mini-sep" />
            <div className="sb-mini-stat">
              <div className="sb-mini-val indigo">{stats.avg_attendance}%</div>
              <div className="sb-mini-lbl">Avg Attendance</div>
            </div>
            <div className="sb-mini-sep" />
            <div className="sb-mini-stat">
              <div className="sb-mini-val amber">{tasks.length}</div>
              <div className="sb-mini-lbl">Pending</div>
            </div>
          </div>
          <button className="sb-logout" onClick={handleLogout}><IcoLogout /> Sign Out</button>
        </div>
      </aside>
    </>
  );
}

// ─── TOPBAR ──────────────────────────────────────────────────────
function Topbar({ onHamburger, onQuickActions, onNotifications, onProfile, notifAnchorRef, notifOpen, onNotifClose, notifications, userAvatar }) {
  const date = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="topbar">
      <button className="tb-hamburger" onClick={onHamburger} aria-label="Toggle menu"><IcoHamburger /></button>
      <span className="tb-page">Faculty Dashboard</span>
      <div className="tb-sep" />
      <div className="tb-search">
        <IcoSearch style={{ color: "var(--text3)", flexShrink: 0 }} />
        <input type="text" placeholder="Search students, courses, topics…" />
      </div>
      <div className="tb-right">
        <span className="tb-date">{date}</span>
        <div className="tb-icon-btn" onClick={onNotifications} ref={notifAnchorRef}><IcoBell /><div className="notif-dot" /></div>
        <div className="tb-icon-btn" onClick={onProfile}>
          {userAvatar ? (
            <img src={userAvatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <IcoUser />
          )}
        </div>
        <Btn className="btn-solid" style={{ padding: "7px 16px", fontSize: 11, gap: 5 }} onClick={onQuickActions}><IcoFlash /> Quick Actions</Btn>

        <FacultyNotification 
          open={notifOpen} 
          onClose={onNotifClose} 
          anchorRef={notifAnchorRef}
          notifications={notifications}
        />
      </div>
    </div>
  );
}

// ─── AI PANEL ────────────────────────────────────────────────────
function AiPanel({ open, onClose, insights = [] }) {
  const [messages, setMessages] = useState([
    { role: "ai", html: "Hello! 👋 I've analyzed your courses. You have some pending submissions to grade." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [aiIdx, setAiIdx] = useState(0);

  useEffect(() => {
    if (insights.length > 0 && messages.length === 1) {
      setMessages([{ role: "ai", html: insights[0] }]);
    }
  }, [insights]);

  const msgRef = useRef();
  useEffect(() => { if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight; }, [messages, typing]);
  const send = useCallback((text) => {
    const val = text || input.trim(); if (!val) return;
    setMessages(m => [...m, { role: "user", html: val }]);
    setInput(""); setShowChips(false); setTyping(true);
    
    // Choose next insight or generic response
    const nextHtml = insights.length > 0 
      ? insights[(aiIdx + 1) % insights.length]
      : "I'm here to help with your course management.";

    setTimeout(() => { 
      setTyping(false); 
      setMessages(m => [...m, { role: "ai", html: nextHtml }]); 
      setAiIdx(i => i + 1); 
    }, 950);
  }, [input, aiIdx, insights]);
  return (
    <div className={`lucyna-panel ${open ? "open" : ""}`}>
      <div className="lp-header">
        <div className="lp-orb"><div className="lp-orb-ring" /><IcoBrain width={17} height={17} /></div>
        <div><div className="lp-name">Lucyna AI Assistant</div><div className="lp-status"><div className="lp-dot" />Faculty Mode · Always on</div></div>
        <button className="lp-close" onClick={onClose}><IcoClose /></button>
      </div>
      <div className="lp-messages" ref={msgRef}>
        {messages.map((m, i) => (
          <div key={i} className={`lp-msg ${m.role === "user" ? "user" : ""}`}>
            <div className={`msg-av ${m.role === "ai" ? "ai-av" : "usr-av"}`}>{m.role === "ai" ? "L" : "P"}</div>
            <div className={`msg-bubble ${m.role}`} dangerouslySetInnerHTML={{ __html: m.html }} />
          </div>
        ))}
        {typing && (<div className="lp-msg"><div className="msg-av ai-av">L</div><div className="msg-bubble ai"><div className="typing-dots"><span /><span /><span /></div></div></div>)}
      </div>
      {showChips && (<div className="lp-suggestions">{["Generate Quiz", "Weak topics", "Attendance report", "Grade submissions"].map(c => (<span key={c} className="lp-chip" onClick={() => send(c)}>{c}</span>))}</div>)}
      <div className="lp-input-row">
        <div className="lp-input-wrap">
          <input className="lp-input" value={input} placeholder="Ask about students, grades, analytics…" onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
          {input && <button className="lp-clear" onClick={() => setInput("")} aria-label="Clear input"><IcoClose width={10} height={10} /></button>}
        </div>
        <label className="lp-attach" title="Attach file"><input type="file" style={{ display: "none" }} /><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg></label>
        <button className="lp-send" onClick={() => send()} aria-label="Send message"><IcoSend /></button>
      </div>
    </div>
  );
}

function AiFab({ onClick }) {
  return (
    <button className="lucyna-fab" onClick={onClick} aria-label="Open Lucyna AI">
      <div className="lucyna-fab-ring"/><div className="lucyna-fab-dot"/>
      <img src={lucynaJpg} alt="Lucyna" className="lucyna-fab-img"/>
      <span className="lucyna-fab-tip">Ask Lucyna AI</span>
    </button>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────
export default function FacultyDashboard() {
  const navigateRouter = useNavigate();
  const { page } = useParams();
  const [activePage, setActivePage] = useState(() => { if (!page) return ROUTES.DASHBOARD; return PAGE_PARAM_MAP[page.toLowerCase()] || ROUTES.DASHBOARD; });
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifAnchorRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [stats, setStats] = useState({ total_students: 0, active_courses: 0, avg_attendance: 0, avg_class_score: 0 });
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [quizStats, setQuizStats] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
   const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [academicMeta, setAcademicMeta] = useState({ year: "2024–25", semester: "5", week: "11", today: "" });
  const [mailUnread, setMailUnread] = useState(0);

  useEffect(() => {
    const fetchMailCount = async () => {
      try {
        const res = await api.get("/mail/unread/count");
        setMailUnread(res.count || 0);
      } catch (err) {
        console.error("Failed to poll mail count", err);
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const [meData, dashData, mailData] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/faculty/dashboard"),
          api.get("/mail/unread/count"),
        ]);
        if (meData.status === "fulfilled") {
          setUserName(meData.value.full_name || meData.value.email || "");
          setUserAvatar(meData.value.avatar || "");
        }
        if (dashData.status === "fulfilled") {
          const d = dashData.value;
          if (d.stats) setStats(d.stats);
          if (d.courses) setCourses(d.courses.map(mapApiCourse));
          if (d.tasks) setTasks(d.tasks.map(mapApiTask));
          if (d.schedule) setSchedule(d.schedule.map(mapApiSchedule));
          if (d.quiz_stats) setQuizStats(d.quiz_stats.map(mapApiQuiz));
          if (d.weak_topics) setWeakTopics(d.weak_topics);
          if (d.top_students) setTopStudents(d.top_students);
          if (d.ai_insights) setAiInsights(d.ai_insights);
          if (d.notifications) setNotifications(d.notifications);
          if (d.recent_activity) setRecentActivity(d.recent_activity);
          if (d.academic_meta) setAcademicMeta(d.academic_meta);
        }
        if (mailData.status === "fulfilled") {
          setMailUnread(mailData.value.count || 0);
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        setError("Could not load dashboard data.");
      } finally { setLoading(false); }
    };
    fetchData();
    const interval = setInterval(fetchMailCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useCursor();

  useEffect(() => {
    if (!page) { setActivePage(ROUTES.DASHBOARD); }
    else { const mapped = PAGE_PARAM_MAP[page.toLowerCase()]; if (mapped && mapped !== activePage) setActivePage(mapped); }
  }, [page]);

  const navigate = useCallback((targetPage) => {
    setActivePage(targetPage);
    const url = ROUTE_TO_URL[targetPage] || "/facultydashboard";
    navigateRouter(url);
  }, [navigateRouter]);

  // Quick Actions Modal state
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") { setAiOpen(false); setSidebarOpen(false); } };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const toggleTask = i => setCheckedTasks(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const renderContent = () => {
    switch (activePage) {
      case ROUTES.ANALYTICS: return <FacultyAnalytics onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.MY_COURSES: return <FacultyMyCourses onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.VIDEO_LECTURES: return <FacultyVideoLectures onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.ASSIGNMENTS: return <FacultyAssignments onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.QUIZZES: return <FacultyQuizzes onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.MEETINGS: return <FacultyMeeting onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.ALL_STUDENTS: return <AllStudents onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.ATTENDANCE: return <Attendance onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.GRADE_BOOK: return <GradeBook onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.QUESTION_BANK: return <QuestionBank onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.AI_ASSISTANT: return <AiAssistant onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.REPORTS: return <Reports onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.SETTINGS: return <FacultySettings onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.PROFILE: return <FacultyProfile onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.MAIL: return <MailSystem onBack={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.QUICKACTIONS: return (
        <FacultyQuickaction 
          onBack={() => navigate(ROUTES.DASHBOARD)} 
          stats={stats}
          recentActivity={recentActivity}
          weakTopics={weakTopics}
        />
      );
      default: return null; // falls through to dashboard content below
    }
  };

  const isDashboard = activePage === ROUTES.DASHBOARD;

  return (
    <>
      <div className="fc-cursor" id="fc-cursor" />
      <div className="fc-cursor-ring" id="fc-cursor-ring" />
      <div className="sc-noise" />
      <AiFab onClick={() => setAiOpen(o => !o)} />
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} insights={aiInsights} />
      {/* Remove modal, use routing instead */}
      <div className="app">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onNavigate={navigate}
          userName={userName}
          userAvatar={userAvatar}
          stats={stats}
          tasks={tasks}
          mailUnread={mailUnread}
        />
        <main className="main">
          <Topbar
            onHamburger={() => setSidebarOpen(o => !o)}
            onQuickActions={() => navigate(ROUTES.QUICKACTIONS)}
            onNotifications={() => setNotifOpen(o => !o)}
            onProfile={() => navigate(ROUTES.PROFILE)}
            notifAnchorRef={notifAnchorRef}
            notifOpen={notifOpen}
            onNotifClose={() => setNotifOpen(false)}
            notifications={notifications}
            userAvatar={userAvatar}
          />

          {!isDashboard && renderContent()}

          {isDashboard && (
            <div className="content">
              {/* GREETING */}
              <div className="greet-row">
                <div className="greet-tag">
                  <div className="greet-pip" />
                  <span className="greet-pip-txt">Academic Year {academicMeta.year} · Semester {academicMeta.semester} · Week {academicMeta.week}</span>
                </div>
                <h1 className="greet-title">Good morning, <em>{userName ? userName.split(" ")[0] : "Faculty"}</em></h1>
                <p className="greet-sub">You have {tasks.length} pending submissions to grade. Let's get ahead.</p>
                <div className="greet-actions">
                  <Btn className="btn-solid"><IcoPen /> Grade Submissions</Btn>
                  <Btn className="btn-ghost"><IcoPlus /> Create Quiz</Btn>
                  <Btn className="btn-ghost"><IcoUpload /> Upload Lecture</Btn>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="stat-grid">
                {[
                  { cls: "sc-teal", icon: <IcoUsers width={18} height={18} />, val: stats.total_students.toString(), lbl: "Total Students", delta: <><IcoChevUp />+12 this semester</>, dc: "delta-up" },
                  { cls: "sc-indigo", icon: <IcoBook width={18} height={18} />, val: stats.active_courses.toString(), lbl: "Active Courses", delta: <><IcoMinus />Same as last sem</>, dc: "delta-neu" },
                  { cls: "sc-amber", icon: <IcoCal width={18} height={18} />, val: `${Math.round(stats.avg_attendance)}%`, lbl: "Avg Attendance", delta: <><IcoChevDn />−3% vs last week</>, dc: "delta-dn" },
                  { cls: "sc-violet", icon: <IcoTrend width={18} height={18} />, val: `${Math.round(stats.avg_class_score)}%`, lbl: "Avg Class Score", delta: <><IcoChevUp />+2% vs last quiz</>, dc: "delta-up" },
                ].map(({ cls, icon, val, lbl, delta, dc }, i) => (
                  <Hoverable key={lbl} className={`stat-card ${cls}`} style={{ animationDelay: `${(i + 1) * .07}s` }}>
                    <div className="stat-ic">{icon}</div>
                    <div className="stat-val">{val}</div>
                    <div className="stat-lbl">{lbl}</div>
                    <span className={`stat-delta ${dc}`}>{delta}</span>
                  </Hoverable>
                ))}
              </div>

              {/* MY COURSES */}
              <div className="panel" style={{ animationDelay: "0.07s" }}>
                <div className="panel-hd">
                  <div className="panel-ttl"><IcoBook width={14} height={14} style={{ color: "var(--indigo-ll)" }} /> My Courses <span>{courses.length} active this semester</span></div>
                  <a href="#" className="panel-act" onClick={e => { e.preventDefault(); navigate(ROUTES.MY_COURSES); }}>Manage <IcoChevR /></a>
                </div>
                <div className="panel-body">
                  <div className="course-faculty-grid">
                    {courses.map((c, i) => (
                      <Hoverable key={c.id || c.name || i} className="course-faculty-card">
                        <div className="cfc-top">
                          <div className="ci-badge" style={c.badgeStyle}>{c.icon}</div>
                          <div className="cfc-meta"><div className="cfc-code">{c.code} · {c.sem}</div><div className="cfc-name">{c.name}</div></div>
                          {c.pendingGrade > 0 && <div className="cfc-pending">{c.pendingGrade} to grade</div>}
                        </div>
                        <div className="cfc-stats">
                          <div className="cfc-stat-item">
                            <div className="cfc-stat-val" style={{ color: c.pctColor }}>{c.student_count}</div>
                            <div className="cfc-stat-lbl">Students</div>
                          </div>
                          <div className="cfc-stat-sep" />
                          <div className="cfc-stat-item">
                            <div className="cfc-stat-val" style={{ color: c.avg_attendance >= 85 ? "var(--teal)" : c.avg_attendance >= 75 ? "var(--amber)" : "var(--rose)" }}>{c.avg_attendance}%</div>
                            <div className="cfc-stat-lbl">Attendance</div>
                          </div>
                          <div className="cfc-stat-sep" />
                          <div className="cfc-stat-item">
                            <div className="cfc-stat-val" style={{ color: "var(--violet)" }}>{c.avg_score}%</div>
                            <div className="cfc-stat-lbl">Avg Score</div>
                          </div>
                        </div>
                        <div className="cfc-progress">
                          <div className="cfc-prog-lbl"><span style={{ color: "var(--text3)", fontSize: 10 }}>Lecture Progress</span><span style={{ color: c.pctColor, fontSize: 10, fontWeight: 600 }}>{c.lectures.done}/{c.lectures.total}</span></div>
                          <AnimatedProgressBar pct={Math.round((c.lectures.done / c.lectures.total) * 100)} color={c.color} height={4} delay={600} />
                        </div>
                        <div className="cfc-actions">
                          <Btn className="btn-ghost" style={{ fontSize: 10, padding: "5px 10px", gap: 4 }} onClick={() => navigate(ROUTES.GRADE_BOOK)}><IcoPen width={10} height={10} />Grade</Btn>
                          <Btn className="btn-ghost" style={{ fontSize: 10, padding: "5px 10px", gap: 4 }} onClick={() => navigate(ROUTES.VIDEO_LECTURES)}><IcoUpload width={10} height={10} />Upload</Btn>
                          <Btn className="btn-solid" onClick={() => navigate(ROUTES.ANALYTICS)} style={{ fontSize: 10, padding: "5px 10px", gap: 4, marginLeft: "auto" }}><IcoBar width={10} height={10} />Analytics</Btn>
                        </div>
                      </Hoverable>
                    ))}
                  </div>
                </div>
              </div>

              {/* SCHEDULE + PENDING */}
              <div className="two-col-grid">
                <div className="panel">
                  <div className="panel-hd"><div className="panel-ttl"><IcoCal width={14} height={14} style={{ color: "var(--indigo-ll)" }} /> Today's Schedule <span>{academicMeta.today || "..."}</span></div><a href="#" className="panel-act" onClick={e => { e.preventDefault(); navigate(ROUTES.ATTENDANCE); }}>Full week <IcoChevR /></a></div>
                  <div className="panel-body">
                    <div className="sched-list">
                      {schedule.length === 0 ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                          No classes scheduled for today
                        </div>
                      ) : (
                        schedule.map((s) => (
                          <Hoverable key={s.from} className="sched-item">
                            <div className="sched-time"><div className="st-from" style={{ color: s.color }}>{s.from}</div><div className="st-to">{s.to}</div></div>
                            <div className="sched-div" style={{ background: s.color }} />
                            <div className="sched-info"><div className="si-name">{s.name}</div><div className="si-room">{s.room}</div><span className="si-tag" style={s.tagStyle}>{s.tag}</span></div>
                          </Hoverable>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-hd"><div className="panel-ttl"><IcoAlert width={14} height={14} style={{ color: "var(--rose)" }} /> Pending Tasks <span style={{ color: "var(--rose)" }}>{tasks.length - checkedTasks.length} remaining</span></div><a href="#" className="panel-act" onClick={e => { e.preventDefault(); navigate(ROUTES.ASSIGNMENTS); }}>All tasks <IcoChevR /></a></div>
                  <div className="panel-body">
                    <div className="task-list">
                      {tasks.length === 0 ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                          You have no pending tasks, great job!
                        </div>
                      ) : (
                        tasks.map((t, i) => (
                          <Hoverable key={`task-${t.label}-${i}`} className={`task-item ${checkedTasks.includes(i) ? "done" : ""}`} onClick={() => toggleTask(i)}>
                            <div className={`task-check ${checkedTasks.includes(i) ? "checked" : ""}`}>{checkedTasks.includes(i) && <IcoCheck />}</div>
                            <div className="task-body"><div className="task-label">{t.label}</div><div className="task-sub">{t.course}</div></div>
                            <div className={`task-due ${t.urgent ? "urgent" : ""}`}>{t.due}</div>
                          </Hoverable>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* QUIZ + WEAK + STUDENTS */}
              <div className="three-col-grid">
                <div className="panel">
                  <div className="panel-hd"><div className="panel-ttl"><IcoClock width={14} height={14} style={{ color: "var(--indigo-ll)" }} /> Quiz Analytics <span>Recent</span></div><a href="#" className="panel-act" onClick={e => { e.preventDefault(); navigate(ROUTES.QUIZZES); }}>All quizzes <IcoChevR /></a></div>
                  <div className="panel-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {quizStats.length === 0 ? (
                        <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                          No recent quizzes available for analysis.
                        </div>
                      ) : (
                        quizStats.map((q) => (
                          <Hoverable key={q.name} className="quiz-faculty-item">
                            <div className="qfi-top"><span className="qfi-name">{q.name}</span><span className="qfi-sub">{q.submitted}/{q.total} submitted</span></div>
                            <div className="qfi-bars">
                              {[["Avg", q.avg, q.color], ["High", q.highest, "var(--teal)"], ["Low", q.lowest, "var(--rose)"]].map(([lbl, val, col], ji) => (
                                <div key={lbl} className="qfi-bar-row">
                                  <span className="qfi-bar-lbl">{lbl}</span>
                                  <div className="qfi-bar-track"><AnimatedProgressBar pct={val} color={col} height={4} delay={700 + ji * 100} /></div>
                                  <span className="qfi-bar-val" style={{ color: col }}>{val}%</span>
                                </div>
                              ))}
                            </div>
                          </Hoverable>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-hd"><div className="panel-ttl"><IcoAlert width={14} height={14} style={{ color: "var(--amber)" }} /> Weak Topics Detected</div><a href="#" className="panel-act" onClick={e => { e.preventDefault(); navigate(ROUTES.QUESTION_BANK); }}>Generate remedials <IcoChevR /></a></div>
                  <div className="panel-body">
                    <div className="weak-list">
                      {weakTopics.length === 0 ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                          No weak topics detected across your courses.
                        </div>
                      ) : (
                        weakTopics.map((w, i) => (
                          <Hoverable key={`weak-${w.topic}-${i}`} className="weak-item">
                            <div className="wi-top">
                              <span className="wi-course" style={{ color: w.color }}>{w.course}</span>
                              <span className="wi-name">{w.topic}</span>
                              <span className="wi-count">{w.student_count} students</span>
                            </div>
                            <AnimatedProgressBar pct={w.percentage} color={w.color} height={3} delay={700 + i * 100} />
                            <div className="wi-hint">Below 40% — needs attention</div>
                          </Hoverable>
                        ))
                      )}
                    </div>
                    <div className="weak-footer">
                      <Btn className="btn-solid" onClick={() => navigate(ROUTES.AI_ASSISTANT)} style={{ width: "100%", justifyContent: "center", fontSize: 11, padding: "8px 12px" }}>
                        <IcoBrain width={12} height={12} style={{ stroke: "#fff" }} /> Auto-generate Remedial Quiz
                      </Btn>
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-hd"><div className="panel-ttl"><IcoUsers width={14} height={14} style={{ color: "var(--indigo-ll)" }} /> Student Spotlight</div><a href="#" className="panel-act" onClick={e => { e.preventDefault(); navigate(ROUTES.ALL_STUDENTS); }}>All students <IcoChevR /></a></div>
                  <div className="panel-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {topStudents.length === 0 ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                          No students qualifying for spotlight yet.
                        </div>
                      ) : (
                        topStudents.map((s, i) => (
                          <Hoverable key={s.roll || i} className="student-item">
                            <div className="sti-rank">{i + 1}</div>
                            <div className="sti-avatar">{s.name ? s.name.split(" ").map(x => x[0]).join("") : "S"}</div>
                            <div className="sti-info"><div className="sti-name">{s.name}</div><div className="sti-roll">{s.roll} · {s.course}</div></div>
                            <div className="sti-right"><div className="sti-cgpa">{s.cgpa}</div><span className="sti-badge" style={{ background: s.badge_color ? `rgba(${s.badge_color.replace('var(--', '').replace(')', '')},.1)` : "rgba(39,201,176,.1)", color: s.badge_color || "var(--teal)" }}>{s.badge}</span></div>
                          </Hoverable>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}