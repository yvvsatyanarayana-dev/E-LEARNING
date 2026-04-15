// studentDashboard.jsx — with Settings, Profile, Resume, Notifications
import StudentInternships from "../studentInternships/studentInternships";
import StudentMockInterview from "../studentMockInterview/studentMockInterview";
import StudentPlacementPrep from "../studentPlacementPrep/studentPlacementPrep";
import StudentInnovationHub from "../studentInnovationHub/studentInnovationHub";
import StudentSettings from "../studentSettings/studentSettings";
import StudentDrives from "../studentDrives/studentDrives";
import StudentProfile from "../studentProfile/studentProfile";
import StudentResume from "../studentResume/studentResume";
import StudentVersantAssessment from "../studentVersantAssessment/StudentVersantAssessment";
import StudentPlacementQuizzes from "../studentPlacementQuizzes/StudentPlacementQuizzes";
import NotificationPanel from "../studentNotificationPanel/NotificationPanel";
import StudentMeetings from "../studentMeetings/studentMeetings";
import StudentPlacementMeetings from "../studentPlacementMeetings/studentPlacementMeetings";
import "../studentSettings/studentSettings.css";
import "../studentProfile/studentProfile.css";
import "../studentResume/studentResume.css";
import "../studentNotificationPanel/NotificationPanel.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StudentDashboard.css";
import StudentAnalytics from "../studentAnalytics/studentAnalytics";
import "../studentAnalytics/studentAnalytics.css";
import StudentMyCourses from "../studentMycourse/studentMycourse";
import "../studentMycourse/studentMycourse.css";
import StudentVideoLectures from "../studentVideoLectures/studentVideoLectures";
import "../studentVideoLectures/studentVideoLectures.css";
import StudentAssignments from "../studentAssignments/studentAssignments";
import "../studentAssignments/studentAssignments.css";
import StudentQuizzes from "../studentQuizzes/studentQuizzes";
import "../studentQuizzes/studentQuizzes.css";
import StudentStudyGroups from "../studentStudyGroup/studentStudyGroup";
import "../studentStudyGroup/studentStudyGroup.css";
import StudentSchedule from "../studentSchedules/studentSchedules";
import "../studentSchedules/studentSchedules.css";
import lucynaJpg from "../../../assets/Cyberpunk 2077.jpg";
import api from "../../../utils/api.js";
import MailSystem from "../../shared/MailSystem/MailSystem";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoDashboard = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
const IcoBar = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IcoBook = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const IcoVideo = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>;
const IcoFile = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>;
const IcoClock = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcoSun = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>;
const IcoUsers = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IcoCal = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IcoAward = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>;
const IcoBrief = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>;
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
const IcoPlay = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
const IcoSend = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" fill="#fff" stroke="none" /></svg>;
const IcoClose = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IcoHamburger = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const IcoLogout = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const IcoFileText = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;

// ─── ROUTE KEYS ──────────────────────────────────────────────────
const ROUTES = {
  DASHBOARD:      "Dashboard",
  ANALYTICS:      "Analytics",
  MY_COURSES:     "My Courses",
  VIDEO_LECTURES: "Video Lectures",
  ASSIGNMENTS:    "Assignments",
  QUIZZES:        "Quizzes",
  STUDY_GROUPS:   "Study Groups",
  MEETINGS:       "Meetings",
  SCHEDULE:       "Schedule",
  INNOVATION_HUB: "Innovation Hub",
  PLACEMENT_PREP: "Placement Prep",
  INTERNSHIPS:    "Internships",
  DRIVES:         "Drives",
  MOCK_INTERVIEW: "Mock Interviews",
  SETTINGS:       "Settings",
  PROFILE:        "Profile",
  RESUME:         "Resume",
  PLACEMENT_MEETINGS: "Placement Meetings",
  MAIL:            "Mail",
  VERSANT:         "Versant Assessment",
  PLACEMENT_QUIZZES: "Placement Quizzes",
};

const PAGE_PARAM_MAP = {
  "studentanalytics":     "Analytics",
  "studentmycourses":     "My Courses",
  "studentvideolectures": "Video Lectures",
  "studentassignments":   "Assignments",
  "studentquizzes":       "Quizzes",
  "studentstudygroups":   "Study Groups",
  "studentmeetings":      "Meetings",
  "studentschedule":      "Schedule",
  "studentinnovationhub": "Innovation Hub",
  "studentplacementprep": "Placement Prep",
  "studentinternships":   "Internships",
  "studentdrives":        "Drives",
  "studentmockinterview": "Mock Interviews",
  "studentsettings":      "Settings",
  "studentprofile":       "Profile",
  "studentresume":        "Resume",
  "studentplacementmeetings": "Placement Meetings",
  "studentmail":          "Mail",
  "studentversant":       "Versant Assessment",
  "placementQuizzes":     "Placement Quizzes",
};

const ROUTABLE = new Set(Object.values(ROUTES));

// ─── PALETTE for API courses ──────────────────────────────────────
const PALETTE_COLORS = [
  {color:"var(--indigo-l)",pctColor:"var(--indigo-ll)",badgeStyle:{background:"rgba(91,78,248,.12)",color:"var(--indigo-ll)"}},
  {color:"var(--teal)",    pctColor:"var(--teal)",     badgeStyle:{background:"rgba(39,201,176,.1)",color:"var(--teal)"}},
  {color:"var(--amber)",  pctColor:"var(--amber)",    badgeStyle:{background:"rgba(244,165,53,.1)",color:"var(--amber)"}},
  {color:"var(--violet)", pctColor:"var(--violet)",   badgeStyle:{background:"rgba(159,122,234,.1)",color:"var(--violet)"}},
  {color:"var(--rose)",   pctColor:"var(--rose)",     badgeStyle:{background:"rgba(242,68,92,.1)",color:"var(--rose)"}},
];
const GRADE_STYLES = [
  {background:"rgba(39,201,176,.1)",color:"var(--teal)"},
  {background:"rgba(91,78,248,.1)",color:"var(--indigo-ll)"},
  {background:"rgba(244,165,53,.1)",color:"var(--amber)"},
  {background:"rgba(159,122,234,.1)",color:"var(--violet)"},
  {background:"rgba(242,68,92,.1)",color:"var(--rose)"},
];
function mapApiCourse(c, i) {
  const p = PALETTE_COLORS[i % PALETTE_COLORS.length];
  const g = GRADE_STYLES[i % GRADE_STYLES.length];
  
  return {
    id: c.course_id || c.id || i,
    code: c.code || "CS" + (c.course_id || c.id || i),
    name: c.name || c.title || "Untitled Course",
    instructor: c.faculty || c.faculty_name || "Faculty Name",
    progress: c.progress || 0,
    short: c.short || ((c.name || c.title) ? (c.name || c.title).substring(0,2).toUpperCase() : "CS"),
    color: c.color || p?.color || "var(--indigo-l)",
    rgb: c.rgb || p?.rgb || "91,78,248",
    badgeStyle: g,
    icon: <IcoBook width={18} height={18}/>,
    academic: c.academic || "Sem 5 · 2024",
    totalLectures: c.total_lectures || c.lesson_count || 0,
    completedLectures: c.completed_lectures || 0,
    nextLecture: c.next_lecture || "No upcoming lecture",
    lastAccessed: c.last_accessed || "Never",
    description: c.description || "",
    syllabus: c.syllabus || [],
    resources: c.resources || [],
    enrollment_id: c.enrollment_id,
    meta: `${c.faculty_name || "Faculty"} · ${c.lesson_count || 0} lessons`,
    pct: Math.round(c.progress || 0),
    pctColor: p?.pctColor || "var(--indigo-ll)",
    gradeStyle: g, grade: c.enrollment_id > 0 ? (c.progress >= 90 ? "A+" : c.progress >= 80 ? "A" : c.progress >= 70 ? "A−" : c.progress >= 60 ? "B+" : "B") : "New",
    due: c.enrollment_id > 0 ? (c.assignment_count > 0 ? `${c.assignment_count} assignments` : "No pending") : "Available now",
    next: `${c.quiz_count} quiz${c.quiz_count !== 1 ? "zes" : ""}`,
  };
}
function mapApiSkill(s, i) {
  const p = PALETTE_COLORS[i % PALETTE_COLORS.length];
  return { label: s.skill_name, pct: Math.round(s.score), color: p.color, pctColor: p.pctColor };
}
function mapApiQuiz(a, i) {
  const p = PALETTE_COLORS[i % PALETTE_COLORS.length];
  const pct = Math.round(a.score);
  return {
    id: a.quiz_id || i,
    name: a.title,
    score: `${pct}%`,
    pct,
    scoreStyle: { background: `rgba(${a.status === "excellent" ? "39,201,176" : a.status === "good" ? "91,78,248" : "244,165,53"}, .1)`, color: `var(--${a.status === "excellent" ? "teal" : a.status === "good" ? "indigo-ll" : "amber"})` },
    bar: `var(--${a.status === "excellent" ? "teal" : a.status === "good" ? "indigo-ll" : "amber"})`,
    answered: a.date,
    rank: a.status.charAt(0).toUpperCase() + a.status.slice(1),
  };
}

function mapApiSchedule(s, i) {
  const p = PALETTE_COLORS[i % PALETTE_COLORS.length];
  const start = `${s.startH}:${s.startM.toString().padStart(2, "0")}`;
  const endH = Math.floor((s.startH * 60 + s.startM + s.durationMin) / 60);
  const endM = (s.startH * 60 + s.startM + s.durationMin) % 60;
  const end = `${endH}:${endM.toString().padStart(2, "0")}`;
  
  return {
    id: s.schedule_id || i,
    from: start,
    to: end,
    name: s.subject,
    room: s.room || "Online",
    tag: s.type.toUpperCase(),
    color: p.color,
    tagStyle: p.badgeStyle
  };
}

const AI_RESPONSES = [
  "Great question! Process scheduling determines which process gets CPU time and for how long. 🎓",
  "Based on your history, your <strong style='color:var(--rose)'>weakest area</strong> is Cryptography at 58%. Want a focused drill?",
  "For <strong style='color:var(--teal)'>deadlock detection</strong>, remember: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.",
  "I've prepared 5 MCQs on Round Robin. Your predicted score: <strong style='color:var(--amber)'>76–84%</strong> based on past patterns. Ready? ✨",
  "Your CGPA of 8.4 puts you in the <strong style='color:var(--teal)'>top 15%</strong>. Improving Crypto would push you to the top 10%.",
];

function buildNavItems(hasActivePlacementMeeting, mailUnread) {
  return [
    { section:"Overview", links:[
      {label:ROUTES.DASHBOARD, icon:<IcoDashboard/>},
      {label:ROUTES.ANALYTICS, icon:<IcoBar/>, badge:"New"},
    ]},
    { section:"Learning", links:[
      {label:ROUTES.MY_COURSES,     icon:<IcoBook/>,  badge:"6"},
      {label:ROUTES.VIDEO_LECTURES, icon:<IcoVideo/>},
      {label:ROUTES.ASSIGNMENTS,    icon:<IcoFile/>,  badge:"3", badgeClass:"rose"},
      {label:ROUTES.QUIZZES,        icon:<IcoClock/>, badge:"1"},
      {label:ROUTES.MEETINGS,       icon:<IcoVideo/>, badge: hasActivePlacementMeeting ? "LIVE" : undefined, badgeClass: hasActivePlacementMeeting ? "rose" : undefined},
    ]},
    { section:"Campus", links:[
      {label:ROUTES.INNOVATION_HUB, icon:<IcoSun/>},
      {label:ROUTES.STUDY_GROUPS,   icon:<IcoUsers/>},
      {label:ROUTES.SCHEDULE,       icon:<IcoCal/>},
    ]},
    { section:"Career", links:[
      {label:ROUTES.PLACEMENT_PREP,  icon:<IcoAward/>},
      {label:ROUTES.INTERNSHIPS,     icon:<IcoBrief/>},
      {label:ROUTES.DRIVES,          icon:<IcoFile/>},
      {label:ROUTES.MOCK_INTERVIEW,  icon:<IcoPen/>},
      {label:ROUTES.PLACEMENT_MEETINGS, icon:<IcoVideo/>, badge: hasActivePlacementMeeting ? "LIVE" : undefined, badgeClass: hasActivePlacementMeeting ? "rose" : undefined},
      {label:ROUTES.VERSANT,         icon:<IcoAward/>},
      {label:ROUTES.PLACEMENT_QUIZZES, icon:<IcoClock/>, badge: "AI"},
    ]},
    { section:"Others", links:[
       {label:ROUTES.MAIL, icon:<IcoBell/>, badge: mailUnread > 0 ? mailUnread : null, badgeClass: "teal"},
    ]},
  ];
}

function AnimatedProgressBar({pct,color,height=3,delay=500}){
  const [width,setWidth]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setWidth(pct),delay);return()=>clearTimeout(t);},[pct,delay]);
  return(
    <div style={{height,background:"var(--surface3)",borderRadius:2,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${width}%`,background:color,borderRadius:2,transition:"width 1.1s ease"}}/>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────
function Sidebar({activePage, onNavigate, mobileOpen, onMobileClose, onNavigateSettings, onNavigateProfile, userName, userAvatar, priScore, hasActivePlacementMeeting, mailUnread}){
  const logoutNavigate=useNavigate();
  const [priW,setPriW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setPriW(Math.round(priScore||0)),600);return()=>clearTimeout(t);},[priScore]);
  const NAV_ITEMS = buildNavItems(hasActivePlacementMeeting, mailUnread);

  const handleLogout=()=>{
    localStorage.removeItem("token");localStorage.removeItem("user");
    logoutNavigate("/login",{replace:true});
  };

  const initials = userName ? userName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) : "??";
  const ptsToExcellent = Math.max(0, 85 - Math.round(priScore||0));
  const priLabel = (priScore||0) >= 85 ? "Excellent" : (priScore||0) >= 70 ? "Good" : (priScore||0) >= 50 ? "Average" : "Needs Work";

  return(
    <>
      <div className={`sb-overlay ${mobileOpen?"visible":""}`} onClick={onMobileClose}/>
      <aside className={`sidebar ${mobileOpen?"sb-open":""}`}>
        <div className="sb-top">
          <a href="#" className="sb-brand" onClick={e=>e.preventDefault()}>
            <div className="sb-mark">SC</div><span className="sb-name">SmartCampus</span>
          </a>
          <button className="sb-mobile-close" onClick={onMobileClose}><IcoClose/></button>
        </div>
        {/* Clickable user card → Profile */}
        <div className="sb-user" style={{cursor:"pointer"}} onClick={()=>{onNavigateProfile();onMobileClose();}}>
          <div className="sb-avatar">
            {userAvatar ? <img src={userAvatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} /> : initials}
          </div>
          <div>
            <div className="sb-uname">{userName || "Loading…"}</div>
            <div className="sb-urole">Student</div>
          </div>
        </div>
        <nav className="sb-nav">
          {NAV_ITEMS.map(({section,links})=>(
            <div key={section}>
              <div className="sb-sec-label">{section}</div>
              {links.map(({label,icon,badge,badgeClass})=>(
                <a key={label} href="#"
                  className={`sb-link ${activePage===label?"active":""}`}
                  onClick={e=>{e.preventDefault();if(ROUTABLE.has(label)){onNavigate(label);onMobileClose();}}}>
                  {icon}{label}
                  {badge&&<span className={`sb-badge ${badgeClass||""}`}>{badge}</span>}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-bottom">
          <div className="sb-pri">
            <div className="sb-pri-lbl">Placement Readiness Index</div>
            <div className="sb-pri-val">{Math.round(priScore||0)}</div>
            <div className="sb-pri-sub">{priLabel}{ptsToExcellent>0?` · ${ptsToExcellent} pts to Excellent`:" · Excellent tier!"}</div>
            <div className="sb-pri-bar"><div className="sb-pri-fill" style={{width:`${priW}%`}}/></div>
          </div>
          {/* Settings link */}
          <a href="#" className="sb-link" onClick={e=>{e.preventDefault();onNavigateSettings();onMobileClose();}}>
            <IcoSettings/> Settings
          </a>
          <button className="sb-logout" onClick={handleLogout}><IcoLogout/> Sign Out</button>
        </div>
      </aside>
    </>
  );
}



// ─── TOPBAR ──────────────────────────────────────────────────────
function Topbar({activePage,onHamburger,onNavigateProfile,onNavigateResume,notifCount,onToggleNotif,notifOpen,userAvatar}){
  const date=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
  const PAGE_LABELS={
    [ROUTES.ANALYTICS]:"Analytics",[ROUTES.MY_COURSES]:"My Courses",
    [ROUTES.VIDEO_LECTURES]:"Video Lectures",[ROUTES.ASSIGNMENTS]:"Assignments",
    [ROUTES.QUIZZES]:"Quizzes",[ROUTES.STUDY_GROUPS]:"Study Groups",
    [ROUTES.SCHEDULE]:"Schedule",[ROUTES.PLACEMENT_PREP]:"Placement Prep",
    [ROUTES.INTERNSHIPS]:"Internships",[ROUTES.DRIVES]:"Drives",[ROUTES.MOCK_INTERVIEW]:"Mock Interviews",
    [ROUTES.SETTINGS]:"Settings",[ROUTES.PROFILE]:"My Profile",[ROUTES.RESUME]:"Resume Builder",
    [ROUTES.VERSANT]:"Versant English Test",
  };
  const pageLabel=PAGE_LABELS[activePage]||"Dashboard";

  return(
    <div className="topbar">
      <button className="tb-hamburger" onClick={onHamburger} aria-label="Toggle menu"><IcoHamburger/></button>
      <span className="tb-page">{pageLabel}</span>
      <div className="tb-sep"/>
      <div className="tb-search">
        <IcoSearch style={{color:"var(--text3)",flexShrink:0}}/>
        <input type="text" placeholder="Search courses, topics, people…"/>
      </div>
      <div className="tb-right">
        <span className="tb-date">{date}</span>
        {/* Bell with notification panel */}
        <div className="tb-notif-wrap">
          <div
            className="tb-icon-btn"
            onClick={onToggleNotif}
            style={{cursor:"pointer",position:"relative"}}
          >
            <IcoBell/>
            {notifCount>0 && (
              <div className="notif-dot" style={{position:"absolute",top:2,right:2}}/>
            )}
          </div>
          <NotificationPanel open={notifOpen} onClose={onToggleNotif}/>
        </div>
        {/* Profile icon */}
        <div className="tb-icon-btn" onClick={onNavigateProfile} style={{cursor:"pointer", overflow:"hidden"}} title="My Profile">
          {userAvatar ? <img src={userAvatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : <IcoUser/>}
        </div>
        {/* Resume button */}
        <button className="btn-solid" style={{padding:"7px 16px",fontSize:11,gap:5}} onClick={onNavigateResume}>
          <IcoFileText/> Resume
        </button>
      </div>
    </div>
  );
}

// ─── LUCYNA PANEL ────────────────────────────────────────────────
function LucynaPanel({open,onClose}){
  const [messages,setMessages]=useState([
    {role:"ai",html:"Hey there! 👋 You have an <strong style='color:var(--indigo-ll)'>OS quiz</strong> today and <strong style='color:var(--rose)'>2 assignments</strong> due. Want a quick recap?"},
    {role:"user",html:"Yes! Help me with OS scheduling first."},
    {role:"ai",html:"<strong style='color:var(--teal)'>Round Robin</strong> uses a fixed time quantum (10–20ms). Each process gets equal CPU time — no starvation, but higher avg turnaround for long jobs.<br/><br/>Your quiz has 3 questions on this. Want a practice set? 🎯"},
  ]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [showChips,setShowChips]=useState(true);
  const [aiIdx,setAiIdx]=useState(0);
  const msgRef=useRef();

  useEffect(()=>{if(msgRef.current)msgRef.current.scrollTop=msgRef.current.scrollHeight;},[messages,typing]);

  const send=useCallback(async (text)=>{
    const val=text||input.trim();if(!val)return;
    setMessages(m=>[...m,{role:"user",html:val}]);
    setInput("");setShowChips(false);setTyping(true);
    try {
      const history = messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.html
      }));
      history.push({ role: "user", content: val });

      const resp = await api.post("/student/ai/chat", { 
        message: val,
        messages: history
      });
      setTyping(false);
      setMessages(m=>[...m,{role:"ai",html:resp.reply}]);
    } catch (err) {
      setTyping(false);
      setMessages(m=>[...m,{role:"ai",html: "I'm having trouble connecting to my brain right now. Please try again later!"}]);
    }
  },[input, messages]);

  return(
    <div className={`lucyna-panel ${open?"open":""}`}>
      <div className="lp-header">
        <div className="lp-orb"><div className="lp-orb-ring"/><img src={lucynaJpg} alt="Lucyna" className="lp-orb-img"/></div>
        <div><div className="lp-name">Lucyna AI Mentor</div><div className="lp-status"><div className="lp-dot"/>Online · Always available</div></div>
        <button className="lp-close" onClick={onClose}><IcoClose/></button>
      </div>
      <div className="lp-messages" ref={msgRef}>
        {messages.map((m,i)=>(
          <div key={i} className={`lp-msg ${m.role==="user"?"user":""}`}>
            <div className={`msg-av ${m.role==="ai"?"ai-av":"usr-av"}`}>{m.role==="ai"?"L":"A"}</div>
            <div className={`msg-bubble ${m.role}`} dangerouslySetInnerHTML={{__html:m.html}}/>
          </div>
        ))}
        {typing&&(
          <div className="lp-msg">
            <div className="msg-av ai-av">L</div>
            <div className="msg-bubble ai"><div className="typing-dots"><span/><span/><span/></div></div>
          </div>
        )}
      </div>
      {showChips&&(
        <div className="lp-suggestions">
          {["Practice MCQs","Explain Deadlock","My weak topics","Assignment help"].map(c=>(
            <span key={c} className="lp-chip" onClick={()=>send(c)}>{c}</span>
          ))}
        </div>
      )}
      <div className="lp-input-row">
        <div className="lp-input-wrap">
          <input className="lp-input" value={input} placeholder="Ask anything about your coursework…"
            onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
          {input&&<button className="lp-clear" onClick={()=>setInput("")}><IcoClose width={10} height={10}/></button>}
        </div>
        <label className="lp-attach" title="Attach file">
          <input type="file" style={{display:"none"}}/>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
        </label>
        <button className="lp-send" onClick={()=>send()}><IcoSend/></button>
      </div>
    </div>
  );
}

function LucynaFab({onClick}){
  return(
    <button className="lucyna-fab" onClick={onClick} aria-label="Open Lucyna AI">
      <div className="lucyna-fab-ring"/><div className="lucyna-fab-dot"/>
      <img src={lucynaJpg} alt="Lucyna" className="lucyna-fab-img"/>
      <span className="lucyna-fab-tip">Ask Lucyna AI</span>
    </button>
  );
}

// ─── DASHBOARD CONTENT ──────────────────────────────────────────
function DashboardContent({ stats, courses, schedule, quizzes, skills, activeMeeting, activePlacementMeeting, onNavigateToAnalytics, onNavigateToMyCourses, onNavigateToVideoLectures, onNavigateToAssignments, onNavigateToQuizzes, onNavigateToPlacementMeetings, onNavigateToVersant, userName, onEnroll }) {
  const enrolledCount = courses.filter(c => c.enrollment_id > 0).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = userName ? userName.split(" ")[0] : "…";

  return (
    <div className="content">
      {activeMeeting && (
        <div style={{
          background: "linear-gradient(135deg, var(--rose) 0%, var(--rose-l) 100%)",
          color: "white", padding: "16px 24px", borderRadius: "12px", marginBottom: "12px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 8px 24px rgba(242,68,92,0.25)"
        }}>
          <div>
            <h2 style={{ fontSize: "18px", margin: "0 0 4px 0", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: 8, height: 8, background: "#fff", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
              Live Class Started: {activeMeeting.course_name}
            </h2>
            <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
              {activeMeeting.faculty_name} is hosting a live session for your group ({activeMeeting.group_key}).
            </p>
          </div>
          <a href={activeMeeting.join_url} target="_blank" rel="noopener noreferrer" style={{
            background: "white", color: "var(--rose)", padding: "10px 20px", borderRadius: "8px",
            textDecoration: "none", fontWeight: "600", fontSize: "14px", transition: "all 0.2s"
          }}>
            Join Now
          </a>
        </div>
      )}

      {activePlacementMeeting && (
        <div style={{
          background: "linear-gradient(135deg, var(--teal) 0%, var(--teal-l) 100%)",
          color: "white", padding: "16px 24px", borderRadius: "12px", marginBottom: "24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 8px 24px rgba(39,201,176,0.25)"
        }}>
          <div>
            <h2 style={{ fontSize: "18px", margin: "0 0 4px 0", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: 8, height: 8, background: "#fff", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
              Live Placement Session: {activePlacementMeeting.department}
            </h2>
            <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
              Officer {activePlacementMeeting.officer_name} is hosting a virtual session.
            </p>
          </div>
          <button onClick={() => onNavigateToPlacementMeetings()} style={{
            background: "white", color: "var(--teal)", padding: "10px 20px", borderRadius: "8px",
            border: "none", fontWeight: "600", fontSize: "14px", transition: "all 0.2s", cursor: "pointer"
          }}>
            Join Session
          </button>
        </div>
      )}

      {/* Versant Assessment Prompt */}
      {stats.pri_score < 85 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(91,78,248,0.1) 0%, rgba(39,201,176,0.05) 100%)",
          border: "1px solid var(--surface-border)",
          padding: "20px 24px", borderRadius: "16px", marginBottom: "24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: 48, height: 48, background: "var(--indigo)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
               <IcoAward size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", margin: "0 0 4px 0", color: "var(--text)" }}>Boost Your Placement Readiness</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text3)" }}>
                Take the <strong style={{color:"var(--indigo-ll)"}}>Versant English Test</strong> to improve your communication score and PRI.
              </p>
            </div>
          </div>
          <button onClick={() => onNavigateToVersant()} className="btn-solid" style={{ padding: "8px 20px", fontSize: "12px" }}>
            Take Test
          </button>
        </div>
      )}

      <div className="greet-row">
        <div>
          <div className="greet-tag">
            <div className="greet-pip" />
            <span className="greet-pip-txt">
              Academic Year {stats.year || "2024–25"} · 
              Semester {stats.semester || "5"} · 
              Week {stats.week || "11"} · 
              {stats.today || new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </div>
          <h1 className="greet-title">{greeting}, <em>{firstName}</em></h1>
          <p className="greet-sub">You have {stats.pending_assignments} pending assignments and {stats.upcoming_quizzes} quizzes scheduled this week.</p>
          <div className="greet-actions">
            <div className="btn btn-solid" onClick={onNavigateToVideoLectures} style={{display:"flex",alignItems:"center",gap:8}}><IcoPlay /> Continue Learning</div>
            <div className="btn btn-ghost btn-assignments" onClick={onNavigateToAssignments} style={{display:"flex",alignItems:"center",gap:8}}><IcoFile width={12} height={12} /> Assignments</div>
            <div className="btn btn-ghost btn-quizzes" onClick={onNavigateToQuizzes} style={{display:"flex",alignItems:"center",gap:8}}><IcoClock width={12} height={12} /> Quizzes</div>
            <div className="btn btn-ghost btn-analytics" onClick={onNavigateToAnalytics} style={{display:"flex",alignItems:"center",gap:8}}><IcoBar width={12} height={12} /> Analytics</div>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        {[
          { cls: "sc-indigo", val: stats.active_courses, lbl: "Active Courses", delta: `${enrolledCount} enrolled`, Icon: IcoBook, onClick: onNavigateToMyCourses },
          { cls: "sc-teal", val: stats.completed_lessons, lbl: "Completed", delta: "Total lessons", Icon: IcoVideo, onClick: onNavigateToVideoLectures },
          { cls: "sc-amber", val: stats.pending_assignments, lbl: "Assignments", delta: "Need attention", Icon: IcoFile, onClick: onNavigateToAssignments },
          { cls: "sc-violet", val: stats.upcoming_quizzes, lbl: "Quizzes", delta: "Scheduled", Icon: IcoClock, onClick: onNavigateToQuizzes },
        ].map(({ cls, val, lbl, delta, Icon, onClick }, i) => (
          <div key={lbl} className={`stat-card ${cls}`} onClick={onClick} style={{ animationDelay: `${(i + 1) * .07}s` }}>
            <div className="stat-ic"><Icon width={18} height={18} /></div>
            <div className="stat-val">{val}</div>
            <div className="stat-lbl">{lbl}</div>
            <span className="stat-delta">{delta}</span>
          </div>
        ))}
      </div>

      <div className="panel" style={{ animationDelay: "0.07s" }}>
        <div className="panel-hd">
          <div className="panel-ttl"><IcoBook width={14} height={14} style={{ color: "var(--indigo-ll)" }} /> Courses <span>{enrolledCount} enrolled</span></div>
          <a href="#" className="panel-act" onClick={e => { e.preventDefault(); onNavigateToMyCourses(); }}>View all <IcoChevR /></a>
        </div>
        <div className="panel-body">
          <div className="course-list">
            {courses.map(c => (
              <div key={c.id} className="course-item">
                <div className="ci-badge" style={c.badgeStyle}>{c.icon}</div>
                <div className="ci-info">
                  <div className="ci-name">{c.name}</div>
                  <div className="ci-meta">{c.meta}</div>
                  <div className="ci-prog">
                    {c.enrollment_id > 0 ? (
                      <>
                        <AnimatedProgressBar pct={c.pct} color={c.color} />
                        <div className="ci-prog-lbl">
                          <span className="ci-prog-pct" style={{ color: c.pctColor }}>{c.pct}%</span>
                          <span className="ci-prog-next">{c.next}</span>
                        </div>
                      </>
                    ) : (
                      <button
                        className="btn-enroll-dash"
                        onClick={(e) => { e.preventDefault(); onEnroll(c.id); }}
                        style={{
                          background: "var(--indigo)",
                          color: "#fff",
                          border: "none",
                          padding: "6px 16px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: "pointer",
                          marginTop: "4px"
                        }}
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
                <div className="ci-right">
                  <div className="ci-grade" style={c.gradeStyle}>{c.grade}</div>
                  <div className="ci-due">{c.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="panel" style={{ animationDelay: "0.07s" }}>
          <div className="panel-hd">
            <div className="panel-ttl"><IcoCal width={14} height={14} style={{ color: "var(--indigo-ll)" }} /> Today's Schedule <span>Fri, 28 Feb</span></div>
            <a href="#" className="panel-act" onClick={e => e.preventDefault()}>Full week <IcoChevR /></a>
          </div>
          <div className="panel-body">
            <div className="sched-list">
              {schedule.map((s, idx) => (
                <div key={s.id || idx} className="sched-item">
                  <div className="sched-time"><div className="st-from" style={{ color: s.color }}>{s.from}</div><div className="st-to">{s.to}</div></div>
                  <div className="sched-div" style={{ background: s.color }} />
                  <div className="sched-info">
                    <div className="si-name">{s.name}</div><div className="si-room">{s.room}</div>
                    <span className="si-tag" style={s.tagStyle}>{s.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel" style={{ animationDelay: "0.12s" }}>
          <div className="panel-hd">
            <div className="panel-ttl"><IcoClock width={14} height={14} style={{ color: "var(--indigo-ll)" }} /> Quiz Performance <span>Last 30 days</span></div>
            <a href="#" className="panel-act" onClick={e => { e.preventDefault(); onNavigateToAnalytics(); }}>Full Analytics <IcoChevR /></a>
          </div>
          <div className="panel-body">
            <div className="quiz-list">
              {quizzes.map(q => (
                <div key={q.name} className="quiz-item">
                  <div className="qi-top"><span className="qi-name">{q.name}</span><span className="qi-score" style={q.scoreStyle}>{q.score}</span></div>
                  <div className="qi-bar"><div className="qi-fill" style={{ width: `${q.pct}%`, background: q.bar }} /></div>
                  <div className="qi-meta"><span>{q.answered}</span><span>{q.rank}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel" style={{ animationDelay: "0.18s" }}>
          <div className="panel-hd">
            <div className="panel-ttl"><IcoBar width={14} height={14} style={{ color: "var(--indigo-ll)" }} /> Skill Tracker</div>
            <a href="#" className="panel-act" onClick={e => { e.preventDefault(); onNavigateToAnalytics(); }}>Full report <IcoChevR /></a>
          </div>
          <div className="panel-body">
            <div className="skill-list">
              {skills.map(s => (
                <div key={s.label} className="skill-item">
                  <span className="sk-label">{s.label}</span>
                  <AnimatedProgressBar pct={s.pct} color={s.color} height={5} delay={600} />
                  <span className="sk-pct" style={{ color: s.pctColor }}>{s.pct}%</span>
                </div>
              ))}
            </div>
            <div className="skill-summary">
              <div className="ss-ttl">Placement Readiness Index</div>
              <div className="ss-pri">
                <div className="ss-pri-val">{Math.round(stats.pri_score||0)}</div>
                <div className="ss-pri-info">
                  <div className="ss-pri-bar"><AnimatedProgressBar pct={stats.pri_score||0} color="linear-gradient(90deg,var(--indigo),var(--teal))" height={4} delay={700}/></div>
                  <div className="ss-pri-lbl">
                    {stats.pri_score >= 85 ? "Excellent tier!" : `Target 85 for excellent tier`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigateRouter = useNavigate();
  const location = useLocation();

  const [activePage, setActivePage] = useState(() => {
    // Extract the page from the pathname, e.g. "/studentdashboard/studentMeetings" -> "studentMeetings"
    const pathParts = location.pathname.split("/").filter(Boolean);
    const pageKey = pathParts.length > 1 ? pathParts[1] : null;
    if (!pageKey) return ROUTES.DASHBOARD;
    return PAGE_PARAM_MAP[pageKey.toLowerCase()] || ROUTES.DASHBOARD;
  });

  const [aiOpen,      setAiOpen]      = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [userName,    setUserName]    = useState("");
  const [userAvatar,  setUserAvatar]  = useState("");
  const [stats,       setStats]       = useState({ active_courses:0, completed_lessons:0, pending_assignments:0, upcoming_quizzes:0, pri_score:0 });
  const [courses,     setCourses]     = useState([]);
  const [schedule,    setSchedule]    = useState([]);
  const [quizzes,     setQuizzes]     = useState([]);
  const [skills,      setSkills]      = useState([]);
  const [activeMeeting, setActiveMeeting]= useState(null);
  const [activePlacementMeeting, setActivePlacementMeeting]= useState(null);
  const [mailUnread, setMailUnread] = useState(0);
  const [academicMeta, setAcademicMeta] = useState({ year: "", semester: "", week: "", today: "" });

  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const pageKey = pathParts.length > 1 ? pathParts[1] : null;
    
    if (pageKey) {
      const p = PAGE_PARAM_MAP[pageKey.toLowerCase()];
      if (p) setActivePage(p);
    } else {
      setActivePage(ROUTES.DASHBOARD);
    }
  }, [location.pathname]);



  useEffect(() => {
    const fetchData = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const [meData, dashData, mailData] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/student/dashboard"),
          api.get("/mail/unread/count"),
        ]);
        if (meData.status === "fulfilled") {
          setUserName(meData.value.full_name || meData.value.email || "");
          setUserAvatar(meData.value.avatar || "");
        }
        if (dashData.status === "fulfilled") {
          const d = dashData.value;
          if (d.stats) setStats(d.stats);
          if (d.enrolled_courses) setCourses(d.enrolled_courses.map(mapApiCourse));
          if (d.skill_scores) setSkills(d.skill_scores.map(mapApiSkill));
          if (d.schedule_today) setSchedule(d.schedule_today.map(mapApiSchedule));
          if (d.recent_quizzes) setQuizzes(d.recent_quizzes.map(mapApiQuiz));
          setActiveMeeting(d.active_meeting || null);
          setActivePlacementMeeting(d.active_placement_meeting || null);
          if (d.full_name && !userName) setUserName(d.full_name);
          if (d.academic_meta) setAcademicMeta(d.academic_meta);
          // Merge academic_meta into stats for the greeting component
          if (d.stats && d.academic_meta) {
            setStats(prev => ({ ...prev, ...d.academic_meta }));
          }
        }
        if (mailData.status === "fulfilled") {
          setMailUnread(mailData.value.count || 0);
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        if (isInitial) setError("Could not load dashboard data.");
      } finally { if (isInitial) setLoading(false); }
    };
    fetchData(true);
    // Poll for active meeting updates every 15 seconds
    const pollInterval = setInterval(() => fetchData(false), 15000);
    return () => clearInterval(pollInterval);
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/student/courses/${courseId}/enroll`);
      window.location.reload();
    } catch (err) {
      console.error("Dashboard enrollment failed:", err);
    }
  };

  useEffect(()=>{
    const h=e=>{if(e.key==="Escape"){setAiOpen(false);setMobileOpen(false);setNotifOpen(false);}};
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[]);

  useEffect(()=>{ window.scrollTo({top:0,behavior:"smooth"}); },[activePage]);

  const ROUTE_TO_URL = {
    [ROUTES.ANALYTICS]:       "/studentdashboard/studentAnalytics",
    [ROUTES.MY_COURSES]:      "/studentdashboard/studentMycourses",
    [ROUTES.VIDEO_LECTURES]:  "/studentdashboard/studentVideoLectures",
    [ROUTES.ASSIGNMENTS]:     "/studentdashboard/studentAssignments",
    [ROUTES.QUIZZES]:         "/studentdashboard/studentQuizzes",
    [ROUTES.STUDY_GROUPS]:    "/studentdashboard/studentStudyGroups",
    [ROUTES.MEETINGS]:        "/studentdashboard/studentMeetings",
    [ROUTES.SCHEDULE]:        "/studentdashboard/studentSchedule",
    [ROUTES.INNOVATION_HUB]:  "/studentdashboard/studentInnovationHub",
    [ROUTES.PLACEMENT_PREP]:  "/studentdashboard/studentPlacementPrep",
    [ROUTES.INTERNSHIPS]:     "/studentdashboard/studentInternships",
    [ROUTES.DRIVES]:          "/studentdashboard/studentDrives",
    [ROUTES.MOCK_INTERVIEW]:  "/studentdashboard/studentMockInterview",
    [ROUTES.SETTINGS]:        "/studentdashboard/studentSettings",
    [ROUTES.PROFILE]:         "/studentdashboard/studentProfile",
    [ROUTES.RESUME]:          "/studentdashboard/studentResume",
    [ROUTES.PLACEMENT_MEETINGS]: "/studentdashboard/studentPlacementMeetings",
    [ROUTES.MAIL]:            "/studentdashboard/studentMail",
    [ROUTES.VERSANT]:         "/studentdashboard/studentversant",
    [ROUTES.PLACEMENT_QUIZZES]: "/studentdashboard/placementQuizzes",
  };

  const navigate = (targetPage) => {
    setActivePage(targetPage);
    navigateRouter(ROUTE_TO_URL[targetPage] || "/studentdashboard");
  };

  const KNOWN_PAGES = new Set(Object.values(ROUTES));

  return (
    <>

      <div className="sc-noise"/>

      <LucynaFab onClick={()=>setAiOpen(o=>!o)}/>
      <LucynaPanel open={aiOpen} onClose={()=>setAiOpen(false)}/>

      <div className="app">
        <Sidebar
          activePage={activePage}
          onNavigate={navigate}
          mobileOpen={mobileOpen}
          onMobileClose={()=>setMobileOpen(false)}
          onNavigateSettings={()=>navigate(ROUTES.SETTINGS)}
          onNavigateProfile={() => navigateRouter("/studentdashboard/studentProfile")}
          userName={userName}
          userAvatar={userAvatar}
          priScore={stats.pri_score||0}
          hasActivePlacementMeeting={!!activePlacementMeeting}
          mailUnread={mailUnread}
        />
        <main className="main">
          <Topbar
            activePage={activePage}
            onHamburger={()=>setMobileOpen(o=>!o)}
            onNavigateProfile={()=>navigate(ROUTES.PROFILE)}
            onNavigateResume={()=>navigate(ROUTES.RESUME)}
            notifCount={0}
            onToggleNotif={()=>setNotifOpen(!notifOpen)}
            notifOpen={notifOpen}
            userAvatar={userAvatar}
          />
          {error && (
            <div style={{padding:"10px 20px",background:"rgba(242,68,92,.1)",color:"var(--rose)",fontSize:12,textAlign:"center"}}>
              {error}
            </div>
          )}

          {activePage === ROUTES.DASHBOARD && (
            <DashboardContent
              stats={stats} courses={courses} schedule={schedule} quizzes={quizzes} skills={skills} 
              activeMeeting={activeMeeting} activePlacementMeeting={activePlacementMeeting}
              onNavigateToAnalytics={()=>navigate(ROUTES.ANALYTICS)}
              onNavigateToMyCourses={()=>navigate(ROUTES.MY_COURSES)}
              onNavigateToVideoLectures={()=>navigate(ROUTES.VIDEO_LECTURES)}
              onNavigateToAssignments={()=>navigate(ROUTES.ASSIGNMENTS)}
              onNavigateToQuizzes={()=>navigate(ROUTES.QUIZZES)}
              onNavigateToPlacementMeetings={()=>navigate(ROUTES.PLACEMENT_MEETINGS)}
              onNavigateToVersant={()=>navigate(ROUTES.VERSANT)}
              userName={userName}
              onEnroll={handleEnroll}
            />
          )}
          {activePage === ROUTES.ANALYTICS      && <StudentAnalytics    onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.MY_COURSES     && <StudentMyCourses    onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.VIDEO_LECTURES && <StudentVideoLectures onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.ASSIGNMENTS    && <StudentAssignments  onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.QUIZZES        && <StudentQuizzes      onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.STUDY_GROUPS   && <StudentStudyGroups  onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.MEETINGS       && <StudentMeetings     onBack={()=>navigate(ROUTES.DASHBOARD)} onNavigate={navigate} />}
          {activePage === ROUTES.SCHEDULE       && <StudentSchedule     onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.INNOVATION_HUB && <StudentInnovationHub onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.PLACEMENT_PREP && <StudentPlacementPrep onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.INTERNSHIPS    && <StudentInternships  onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.DRIVES         && <StudentDrives       onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.MOCK_INTERVIEW && <StudentMockInterview onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.PLACEMENT_MEETINGS && <StudentPlacementMeetings onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.MAIL           && <MailSystem           onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.VERSANT        && <StudentVersantAssessment onBack={()=>navigate(ROUTES.DASHBOARD)}/>}
          {activePage === ROUTES.PLACEMENT_QUIZZES && <StudentPlacementQuizzes onBack={()=>navigate(ROUTES.DASHBOARD)}/>}

          {/* ── NEW PAGES ── */}
          {activePage === ROUTES.SETTINGS && (
            <StudentSettings onBack={()=>navigate(ROUTES.DASHBOARD)}/>
          )}
          {activePage === ROUTES.PROFILE && (
            <StudentProfile
              onBack={()=>navigate(ROUTES.DASHBOARD)}
              onNavigateSettings={()=>navigate(ROUTES.SETTINGS)}
            />
          )}
          {activePage === ROUTES.RESUME && (
            <StudentResume onBack={()=>navigate(ROUTES.DASHBOARD)}/>
          )}

          {/* Coming Soon */}
          {!KNOWN_PAGES.has(activePage) && (
            <div className="content">
              <div style={{padding:"60px 20px",textAlign:"center",color:"var(--text3)"}}>
                <div style={{fontSize:32,marginBottom:10}}>🚧</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:22,color:"var(--text2)",marginBottom:8}}>{activePage}</div>
                <div style={{fontSize:12}}>This page is coming soon.</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}