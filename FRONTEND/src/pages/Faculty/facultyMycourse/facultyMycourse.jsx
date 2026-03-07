// facultyMycourse.jsx
import { useState, useEffect } from "react";
import "./facultyMycourse.css";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoBook    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoClock   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoFile    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoVideo   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IcoPen     = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoChevR   = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoChevL   = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoChevUp  = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoChevDn  = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoMinus   = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoBar     = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoUpload  = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcoAlert   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoSearch  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoDownload= (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoClose   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoCal     = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoBrain   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;
const IcoPlay    = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IcoLock    = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

// ─── COURSE DATA ─────────────────────────────────────────────────
// ✅ FIX: renamed inner "students" array → "studentList" to avoid
//    overwriting the numeric "students" count field in each course object
const COURSES = [
  {
    id: "cs501",
    name: "Operating Systems",
    code: "CS501",
    sem: "Sem 5",
    section: "A & B",
    students: 112,           // ✅ numeric count — no longer overwritten
    lectures: { done: 33, total: 42 },
    avgAttendance: 81,
    avgScore: 74,
    color: "var(--indigo-l)",
    colorRgb: "91,78,248",
    badgeStyle: { background: "rgba(91,78,248,.12)", color: "var(--indigo-ll)" },
    pctColor: "var(--indigo-ll)",
    pendingGrade: 8,
    description: "Core concepts of OS: process management, memory, file systems, and scheduling algorithms.",
    lastUpdated: "2 hours ago",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    assignments: [
      { id:1, title:"Process Scheduling Simulation",  type:"Lab",     due:"Today",     submissions:98,  total:112, avgScore:72,   status:"grading"  },
      { id:2, title:"Memory Allocation Algorithms",   type:"Theory",  due:"3 days",    submissions:0,   total:112, avgScore:null, status:"upcoming" },
      { id:3, title:"File System Implementation",     type:"Project", due:"10 days",   submissions:0,   total:112, avgScore:null, status:"upcoming" },
      { id:4, title:"Deadlock Detection Report",      type:"Theory",  due:"Completed", submissions:112, total:112, avgScore:68,   status:"done"     },
      { id:5, title:"CPU Scheduling Algorithms",      type:"Coding",  due:"Completed", submissions:109, total:112, avgScore:81,   status:"done"     },
    ],
    quizzes: [
      { id:1, title:"Unit I – Process Management",  questions:20, avgScore:74, highest:98,  lowest:32, submitted:108, total:112, date:"Week 9",  status:"closed"    },
      { id:2, title:"Unit II – Memory Management",  questions:15, avgScore:0,  highest:0,   lowest:0,  submitted:0,   total:112, date:"Week 12", status:"scheduled" },
      { id:3, title:"Unit III – File Systems",      questions:20, avgScore:68, highest:94,  lowest:24, submitted:112, total:112, date:"Week 7",  status:"closed"    },
    ],
    lectureList: [   // ✅ renamed from "lectures" array to avoid conflict with lectures:{done,total}
      { id:1,  title:"Introduction to OS Concepts",           duration:"48m", views:112, week:"W1",  type:"Recorded" },
      { id:2,  title:"Process States & PCB",                  duration:"52m", views:110, week:"W2",  type:"Recorded" },
      { id:3,  title:"CPU Scheduling – FCFS & SJF",           duration:"55m", views:109, week:"W3",  type:"Recorded" },
      { id:4,  title:"CPU Scheduling – RR & Priority",        duration:"47m", views:108, week:"W4",  type:"Recorded" },
      { id:5,  title:"Process Synchronization",               duration:"61m", views:105, week:"W5",  type:"Recorded" },
      { id:6,  title:"Deadlock – Detection & Prevention",     duration:"58m", views:98,  week:"W6",  type:"Recorded" },
      { id:7,  title:"Memory Management – Paging",            duration:"53m", views:102, week:"W7",  type:"Recorded" },
      { id:8,  title:"Memory Management – Segmentation",      duration:"49m", views:99,  week:"W8",  type:"Recorded" },
      { id:9,  title:"Virtual Memory & Page Replacement",     duration:"64m", views:96,  week:"W9",  type:"Recorded" },
      { id:10, title:"File Systems – Structure & Operations", duration:"56m", views:94,  week:"W10", type:"Recorded" },
    ],
    studentList: [   // ✅ FIXED: was "students" array — renamed to "studentList"
      { roll:"21CS047", name:"Arjun Reddy",  attendance:92, score:88, grade:"A",  trend:"up",  status:"top"  },
      { roll:"21CS031", name:"Priya Nair",   attendance:88, score:82, grade:"A",  trend:"up",  status:"good" },
      { roll:"21CS019", name:"Rohan Mehta",  attendance:85, score:76, grade:"B+", trend:"up",  status:"good" },
      { roll:"21CS062", name:"Sneha Sharma", attendance:94, score:78, grade:"B+", trend:"neu", status:"good" },
      { roll:"21CS008", name:"Dev Iyer",     attendance:72, score:58, grade:"C",  trend:"dn",  status:"risk" },
      { roll:"21CS015", name:"Aisha Khan",   attendance:90, score:84, grade:"A",  trend:"up",  status:"good" },
      { roll:"21CS033", name:"Kiran Rao",    attendance:65, score:44, grade:"D",  trend:"dn",  status:"risk" },
      { roll:"21CS055", name:"Meena Pillai", attendance:78, score:66, grade:"B",  trend:"neu", status:"good" },
      { roll:"21CS071", name:"Rahul Singh",  attendance:88, score:72, grade:"B+", trend:"up",  status:"good" },
      { roll:"21CS042", name:"Zara Patel",   attendance:82, score:80, grade:"A−", trend:"up",  status:"good" },
    ],
    weakTopics: [
      { topic:"Deadlock Detection Algorithms", students:34, pct:30, color:"var(--rose)"  },
      { topic:"Page Replacement Algorithms",   students:28, pct:25, color:"var(--amber)" },
      { topic:"Semaphore Implementation",      students:22, pct:20, color:"var(--amber)" },
    ],
  },
  {
    id: "cs502",
    name: "Database Management Systems",
    code: "CS502",
    sem: "Sem 5",
    section: "A",
    students: 108,           // ✅ numeric count
    lectures: { done: 23, total: 38 },
    avgAttendance: 76,
    avgScore: 68,
    color: "var(--teal)",
    colorRgb: "39,201,176",
    badgeStyle: { background: "rgba(39,201,176,.1)", color: "var(--teal)" },
    pctColor: "var(--teal)",
    pendingGrade: 14,
    description: "Relational model, SQL, normalization, transactions, indexing, and database design.",
    lastUpdated: "1 day ago",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    assignments: [
      { id:1, title:"ER Diagram Design",             type:"Theory", due:"Completed", submissions:108, total:108, avgScore:75,   status:"done"     },
      { id:2, title:"SQL Query Optimization",        type:"Coding", due:"Tomorrow",  submissions:72,  total:108, avgScore:null, status:"grading"  },
      { id:3, title:"Normalization to 3NF",          type:"Theory", due:"5 days",    submissions:0,   total:108, avgScore:null, status:"upcoming" },
      { id:4, title:"Transaction Management Report", type:"Theory", due:"8 days",    submissions:0,   total:108, avgScore:null, status:"upcoming" },
    ],
    quizzes: [
      { id:1, title:"Unit I – ER Model & SQL",   questions:20, avgScore:68, highest:95, lowest:28, submitted:102, total:108, date:"Week 8",  status:"closed"    },
      { id:2, title:"Unit II – Normalization",   questions:15, avgScore:0,  highest:0,  lowest:0,  submitted:0,   total:108, date:"Week 11", status:"scheduled" },
    ],
    lectureList: [
      { id:1, title:"Introduction to DBMS",           duration:"44m", views:108, week:"W1", type:"Recorded" },
      { id:2, title:"Entity Relationship Model",      duration:"58m", views:105, week:"W2", type:"Recorded" },
      { id:3, title:"Relational Model & Keys",        duration:"51m", views:103, week:"W3", type:"Recorded" },
      { id:4, title:"SQL – DDL & DML",                duration:"62m", views:102, week:"W4", type:"Recorded" },
      { id:5, title:"SQL – Joins & Subqueries",       duration:"55m", views:99,  week:"W5", type:"Recorded" },
      { id:6, title:"Normalization – 1NF to 3NF",     duration:"67m", views:97,  week:"W6", type:"Recorded" },
      { id:7, title:"Transactions & ACID Properties", duration:"53m", views:94,  week:"W7", type:"Recorded" },
    ],
    studentList: [   // ✅ FIXED
      { roll:"21CS031", name:"Priya Nair",   attendance:88, score:80, grade:"A−", trend:"up",  status:"top"  },
      { roll:"21CS047", name:"Arjun Reddy",  attendance:85, score:76, grade:"B+", trend:"up",  status:"good" },
      { roll:"21CS008", name:"Dev Iyer",     attendance:68, score:50, grade:"D+", trend:"dn",  status:"risk" },
      { roll:"21CS055", name:"Meena Pillai", attendance:74, score:62, grade:"B",  trend:"neu", status:"good" },
      { roll:"21CS019", name:"Rohan Mehta",  attendance:80, score:71, grade:"B+", trend:"up",  status:"good" },
    ],
    weakTopics: [
      { topic:"Transaction Isolation Levels", students:41, pct:38, color:"var(--rose)"  },
      { topic:"B+ Tree Indexing",             students:22, pct:20, color:"var(--amber)" },
    ],
  },
  {
    id: "cs503",
    name: "Computer Architecture",
    code: "CS503",
    sem: "Sem 3",
    section: "B",
    students: 96,            // ✅ numeric count
    lectures: { done: 28, total: 36 },
    avgAttendance: 88,
    avgScore: 79,
    color: "var(--violet)",
    colorRgb: "159,122,234",
    badgeStyle: { background: "rgba(159,122,234,.12)", color: "var(--violet)" },
    pctColor: "var(--violet)",
    pendingGrade: 3,
    description: "Von Neumann architecture, ISA, pipelining, cache memory, and parallel processing.",
    lastUpdated: "3 days ago",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
    assignments: [
      { id:1, title:"Pipeline Hazard Analysis", type:"Theory",  due:"Completed", submissions:96, total:96, avgScore:82,   status:"done"     },
      { id:2, title:"Cache Coherence Report",   type:"Theory",  due:"4 days",    submissions:21, total:96, avgScore:null, status:"grading"  },
      { id:3, title:"ISA Design Project",       type:"Project", due:"12 days",   submissions:0,  total:96, avgScore:null, status:"upcoming" },
    ],
    quizzes: [
      { id:1, title:"Unit I – ISA & Data Path", questions:20, avgScore:79, highest:100, lowest:44, submitted:94, total:96, date:"Week 8",  status:"closed"    },
      { id:2, title:"Unit II – Pipelining",     questions:20, avgScore:0,  highest:0,   lowest:0,  submitted:0,  total:96, date:"Week 12", status:"scheduled" },
    ],
    lectureList: [
      { id:1, title:"Von Neumann Architecture",      duration:"46m", views:96, week:"W1", type:"Recorded" },
      { id:2, title:"Instruction Set Architecture",  duration:"54m", views:94, week:"W2", type:"Recorded" },
      { id:3, title:"ALU Design & Data Path",        duration:"58m", views:93, week:"W3", type:"Recorded" },
      { id:4, title:"Control Unit Design",           duration:"52m", views:92, week:"W4", type:"Recorded" },
      { id:5, title:"Pipelining – Fundamentals",     duration:"60m", views:91, week:"W5", type:"Recorded" },
      { id:6, title:"Pipeline Hazards & Solutions",  duration:"55m", views:89, week:"W6", type:"Recorded" },
      { id:7, title:"Cache Memory Hierarchy",        duration:"63m", views:88, week:"W7", type:"Recorded" },
      { id:8, title:"Cache Replacement Policies",    duration:"48m", views:86, week:"W8", type:"Recorded" },
    ],
    studentList: [   // ✅ FIXED
      { roll:"20CS012", name:"Sneha Sharma", attendance:94, score:90, grade:"A+", trend:"up",  status:"top"  },
      { roll:"20CS028", name:"Arun Kumar",   attendance:91, score:85, grade:"A",  trend:"up",  status:"good" },
      { roll:"20CS044", name:"Priya Das",    attendance:86, score:80, grade:"A−", trend:"up",  status:"good" },
      { roll:"20CS007", name:"Raj Verma",    attendance:80, score:74, grade:"B+", trend:"neu", status:"good" },
      { roll:"20CS066", name:"Neha Joshi",   attendance:78, score:68, grade:"B",  trend:"neu", status:"good" },
    ],
    weakTopics: [
      { topic:"Cache Coherence Protocols", students:19, pct:20, color:"var(--rose)" },
    ],
  },
];

// ─── COURSE DETAIL TABS ──────────────────────────────────────────
const DETAIL_TABS = [
  { id:"overview",     label:"Overview",     icon:<IcoBar    width={13} height={13}/> },
  { id:"lectures",     label:"Lectures",     icon:<IcoVideo  width={13} height={13}/> },
  { id:"assignments",  label:"Assignments",  icon:<IcoFile   width={13} height={13}/> },
  { id:"quizzes",      label:"Quizzes",      icon:<IcoClock  width={13} height={13}/> },
  { id:"students",     label:"Students",     icon:<IcoUsers  width={13} height={13}/> },
];

// ─── ANIMATED PROGRESS BAR ───────────────────────────────────────
function AnimBar({ pct, color, height = 4, delay = 400 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3, transition: "width 1.1s cubic-bezier(.16,1,.3,1)" }} />
    </div>
  );
}

// ─── DONUT ───────────────────────────────────────────────────────
function Donut({ pct, color, size = 80, stroke = 11 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [p, setP] = useState(0);
  useEffect(() => { const t = setTimeout(() => setP(pct), 500); return () => clearTimeout(t); }, [pct]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${(p/100)*circ} ${circ-(p/100)*circ}`}
        strokeLinecap="round" style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.16,1,.3,1)" }}/>
    </svg>
  );
}

// ─── SPARKLINE ───────────────────────────────────────────────────
function SparkLine({ values, color, width = 60, height = 22 }) {
  const min = Math.min(...values), max = Math.max(...values);
  const cx = (i) => (i / (values.length - 1)) * (width - 6) + 3;
  const cy = (v) => height - 4 - ((v - min) / (max - min || 1)) * (height - 8);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={cx(values.length-1)} cy={cy(values[values.length-1])} r="2.5" fill={color}/>
    </svg>
  );
}

// ─── COURSE CARD ─────────────────────────────────────────────────
function CourseCard({ course, onOpen }) {
  const lectPct = Math.round((course.lectures.done / course.lectures.total) * 100);
  return (
    <div className="fcc-card" onClick={() => onOpen(course)}>
      <div className="fcc-card-accent" style={{ background: `rgba(${course.colorRgb},.08)`, borderColor: `rgba(${course.colorRgb},.18)` }}/>
      <div className="fcc-card-hd">
        <div className="fcc-card-badge" style={course.badgeStyle}>{course.icon}</div>
        <div className="fcc-card-meta">
          <div className="fcc-card-code">{course.code} · {course.sem} · Sec {course.section}</div>
          <div className="fcc-card-name">{course.name}</div>
        </div>
        {course.pendingGrade > 0 && (
          <div className="fcc-card-pending">
            <IcoAlert width={9} height={9}/> {course.pendingGrade} pending
          </div>
        )}
      </div>
      <div className="fcc-card-stats">
        <div className="fcc-stat">
          <span className="fcc-stat-val" style={{ color: course.pctColor }}>{course.students}</span>
          <span className="fcc-stat-lbl">Students</span>
        </div>
        <div className="fcc-stat-sep"/>
        <div className="fcc-stat">
          <span className="fcc-stat-val" style={{ color: course.avgAttendance>=85?"var(--teal)":course.avgAttendance>=75?"var(--amber)":"var(--rose)" }}>
            {course.avgAttendance}%
          </span>
          <span className="fcc-stat-lbl">Avg Attend.</span>
        </div>
        <div className="fcc-stat-sep"/>
        <div className="fcc-stat">
          <span className="fcc-stat-val" style={{ color: "var(--violet)" }}>{course.avgScore}%</span>
          <span className="fcc-stat-lbl">Avg Score</span>
        </div>
        <div className="fcc-stat-sep"/>
        <div className="fcc-stat">
          <span className="fcc-stat-val" style={{ color: course.pctColor }}>{lectPct}%</span>
          <span className="fcc-stat-lbl">Progress</span>
        </div>
      </div>
      <div className="fcc-card-prog">
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontSize:9.5, color:"var(--text3)" }}>Lecture Progress</span>
          <span style={{ fontSize:9.5, color:course.pctColor, fontWeight:600 }}>{course.lectures.done}/{course.lectures.total} lectures</span>
        </div>
        <AnimBar pct={lectPct} color={course.color} height={4}/>
      </div>
      {course.weakTopics.length > 0 && (
        <div className="fcc-card-weak">
          <IcoAlert width={10} height={10} style={{ color:"var(--amber)" }}/>
          <span>{course.weakTopics[0].topic}</span>
          <span className="fcc-card-weak-count">{course.weakTopics[0].students} students struggling</span>
        </div>
      )}
      <div className="fcc-card-footer">
        <span className="fcc-card-updated">Updated {course.lastUpdated}</span>
        <div className="fcc-card-actions" onClick={e => e.stopPropagation()}>
          <button className="fcc-action-btn" title="Upload lecture"><IcoUpload/></button>
          <button className="fcc-action-btn" title="Grade submissions"><IcoPen/></button>
          <button className="fcc-action-btn fcc-action-primary" style={{ color:course.pctColor, borderColor:`rgba(${course.colorRgb},.3)`, background:`rgba(${course.colorRgb},.08)` }}>
            Open Course <IcoChevR/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL: OVERVIEW TAB ────────────────────────────────────────
function OverviewTab({ course }) {
  const lectPct = Math.round((course.lectures.done / course.lectures.total) * 100);
  const doneAsgmt = course.assignments.filter(a => a.status === "done").length;
  const gradingAsgmt = course.assignments.filter(a => a.status === "grading").length;

  return (
    <div className="fcd-tab-content">
      <div className="fcd-kpi-grid">
        {[
          { lbl:"Enrolled Students", val:course.students,               color:course.pctColor,                                               icon:<IcoUsers width={15} height={15}/> },
          { lbl:"Avg Attendance",    val:`${course.avgAttendance}%`,    color:course.avgAttendance>=80?"var(--teal)":"var(--amber)",          icon:<IcoCal   width={15} height={15}/> },
          { lbl:"Avg Quiz Score",    val:`${course.avgScore}%`,         color:"var(--violet)",                                               icon:<IcoTrend width={15} height={15}/> },
          { lbl:"Lecture Progress",  val:`${course.lectures.done}/${course.lectures.total}`, color:course.pctColor,                          icon:<IcoVideo width={15} height={15}/> },
          { lbl:"Assignments Done",  val:`${doneAsgmt}/${course.assignments.length}`,        color:"var(--teal)",                            icon:<IcoFile  width={15} height={15}/> },
          { lbl:"Pending to Grade",  val:course.pendingGrade,           color:course.pendingGrade>0?"var(--rose)":"var(--teal)",              icon:<IcoAlert width={15} height={15}/> },
        ].map((k, i) => (
          <div key={i} className="fcd-kpi-card" style={{ animationDelay:`${i*0.06}s` }}>
            <div className="fcd-kpi-ic" style={{ color:k.color, background:`rgba(${k.color.includes("teal")?"39,201,176":k.color.includes("violet")?"159,122,234":k.color.includes("rose")?"242,68,92":k.color.includes("amber")?"244,165,53":"91,78,248"},.1)` }}>
              {k.icon}
            </div>
            <div className="fcd-kpi-val" style={{ color:k.color }}>{k.val}</div>
            <div className="fcd-kpi-lbl">{k.lbl}</div>
          </div>
        ))}
      </div>

      <div className="fcd-overview-grid">
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl"><IcoBar width={13} height={13} style={{ color:"var(--indigo-ll)" }}/> Course Completion</div>
          </div>
          <div className="panel-body">
            <div className="fcd-donut-row">
              <div className="fcd-donut-item">
                <div className="fcd-donut-wrap">
                  <Donut pct={lectPct} color={course.color} size={88} stroke={11}/>
                  <div className="fcd-donut-label">
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:course.pctColor }}>{lectPct}%</div>
                    <div style={{ fontSize:8.5, color:"var(--text3)", marginTop:2 }}>Lectures</div>
                  </div>
                </div>
                <div className="fcd-donut-info">
                  <div className="fcd-donut-stat"><span style={{ color:course.pctColor }}>{course.lectures.done}</span> Done</div>
                  <div className="fcd-donut-stat"><span style={{ color:"var(--text3)" }}>{course.lectures.total - course.lectures.done}</span> Left</div>
                </div>
              </div>
              <div className="fcd-donut-item">
                <div className="fcd-donut-wrap">
                  <Donut pct={Math.round((doneAsgmt/course.assignments.length)*100)} color="var(--teal)" size={88} stroke={11}/>
                  <div className="fcd-donut-label">
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:"var(--teal)" }}>{doneAsgmt}/{course.assignments.length}</div>
                    <div style={{ fontSize:8.5, color:"var(--text3)", marginTop:2 }}>Assignments</div>
                  </div>
                </div>
                <div className="fcd-donut-info">
                  <div className="fcd-donut-stat"><span style={{ color:"var(--teal)" }}>{doneAsgmt}</span> Graded</div>
                  <div className="fcd-donut-stat"><span style={{ color:"var(--amber)" }}>{gradingAsgmt}</span> Grading</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl"><IcoAlert width={13} height={13} style={{ color:"var(--amber)" }}/> Weak Topics Detected</div>
            <button className="fcd-link-btn"><IcoBrain width={11} height={11}/> AI Remedial</button>
          </div>
          <div className="panel-body">
            {course.weakTopics.length === 0 ? (
              <div className="fcd-empty">✅ No critical weak topics detected</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {course.weakTopics.map((w, i) => (
                  <div key={i} className="fcd-weak-item">
                    <div className="fcd-weak-top">
                      <span className="fcd-weak-name">{w.topic}</span>
                      <span className="fcd-weak-count" style={{ color:w.color }}>{w.students} students</span>
                    </div>
                    <AnimBar pct={w.pct} color={w.color} height={4} delay={500 + i*100}/>
                    <div className="fcd-weak-hint">Below 40% — needs attention</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl"><IcoClock width={13} height={13} style={{ color:"var(--indigo-ll)" }}/> Quiz Performance</div>
          </div>
          <div className="panel-body">
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {course.quizzes.filter(q=>q.status==="closed").map((q,i) => (
                <div key={i} className="fcd-quiz-mini">
                  <div className="fcd-qm-top">
                    <span className="fcd-qm-name">{q.title}</span>
                    <span className="fcd-qm-avg" style={{ color:q.avgScore>=75?"var(--teal)":q.avgScore>=60?"var(--amber)":"var(--rose)" }}>{q.avgScore}%</span>
                  </div>
                  <AnimBar pct={q.avgScore} color={q.avgScore>=75?"var(--teal)":q.avgScore>=60?"var(--amber)":"var(--rose)"} height={3} delay={500+i*100}/>
                  <div className="fcd-qm-meta">{q.submitted}/{q.total} submitted · {q.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL: LECTURES TAB ────────────────────────────────────────
// ✅ Uses course.lectureList instead of course.lectures (which is the {done,total} object)
function LecturesTab({ course }) {
  return (
    <div className="fcd-tab-content">
      <div className="fcd-tab-hd">
        <div className="fcd-search-wrap">
          <IcoSearch style={{ color:"var(--text3)" }}/>
          <input placeholder="Search lectures…" className="fcd-search-input"/>
        </div>
        <button className="fcc-action-btn fcc-action-primary" style={{ color:course.pctColor, borderColor:`rgba(${course.colorRgb},.3)`, background:`rgba(${course.colorRgb},.08)`, gap:6 }}>
          <IcoUpload width={11} height={11}/> Upload Lecture
        </button>
      </div>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl"><IcoVideo width={13} height={13} style={{ color:"var(--indigo-ll)"}}/> All Lectures <span>{course.lectures.done} uploaded</span></div>
        </div>
        <div className="fcd-lec-table">
          <div className="fcd-lec-head">
            <span>#</span><span>Title</span><span>Week</span><span>Duration</span><span>Views</span><span>Status</span><span/>
          </div>
          {course.lectureList.map((lec) => (
            <div key={lec.id} className="fcd-lec-row">
              <span className="fcd-lec-num">{lec.id}</span>
              <span className="fcd-lec-title">
                <div className="fcd-lec-play-btn"><IcoPlay/></div>
                {lec.title}
              </span>
              <span className="fcd-lec-badge" style={{ background:`rgba(${course.colorRgb},.08)`, color:course.pctColor }}>{lec.week}</span>
              <span className="fcd-lec-dur">{lec.duration}</span>
              <span className="fcd-lec-views">
                <SparkLine values={[lec.views-8, lec.views-5, lec.views-3, lec.views-1, lec.views]} color={course.color} width={44} height={18}/>
                <span style={{ color:course.pctColor }}>{lec.views}</span>
              </span>
              <span className="fcd-lec-status done"><IcoCheck/> Live</span>
              <div className="fcd-row-actions">
                <button className="fcd-row-btn" title="Edit"><IcoPen width={11} height={11}/></button>
                <button className="fcd-row-btn" title="Download"><IcoDownload width={11} height={11}/></button>
              </div>
            </div>
          ))}
          {Array.from({ length: course.lectures.total - course.lectures.done }).map((_, i) => (
            <div key={`upcoming-${i}`} className="fcd-lec-row fcd-lec-locked">
              <span className="fcd-lec-num">{course.lectures.done + i + 1}</span>
              <span className="fcd-lec-title" style={{ color:"var(--text3)" }}>
                <div className="fcd-lec-play-btn locked"><IcoLock/></div>
                Lecture {course.lectures.done + i + 1} — Not uploaded yet
              </span>
              <span className="fcd-lec-badge" style={{ background:"var(--surface3)", color:"var(--text3)" }}>—</span>
              <span className="fcd-lec-dur" style={{ color:"var(--text3)" }}>—</span>
              <span className="fcd-lec-views" style={{ color:"var(--text3)" }}>—</span>
              <span className="fcd-lec-status upcoming"><IcoPlus width={9} height={9}/> Upload</span>
              <div className="fcd-row-actions">
                <button className="fcd-row-btn fcd-row-btn-primary" style={{ color:course.pctColor, borderColor:`rgba(${course.colorRgb},.3)` }} title="Upload"><IcoUpload width={11} height={11}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL: ASSIGNMENTS TAB ─────────────────────────────────────
function AssignmentsTab({ course }) {
  const STATUS_META = {
    done:     { label:"Graded",   color:"var(--teal)",  bg:"rgba(39,201,176,.1)", icon:<IcoCheck width={10} height={10}/> },
    grading:  { label:"Grading",  color:"var(--amber)", bg:"rgba(244,165,53,.1)", icon:<IcoPen   width={10} height={10}/> },
    upcoming: { label:"Upcoming", color:"var(--text3)", bg:"var(--surface3)",     icon:<IcoCal   width={10} height={10}/> },
  };
  const TYPE_COLOR = { Lab:"var(--indigo-l)", Theory:"var(--teal)", Project:"var(--violet)", Coding:"var(--amber)" };
  const TYPE_BG    = { Lab:"rgba(91,78,248,.1)", Theory:"rgba(39,201,176,.1)", Project:"rgba(159,122,234,.1)", Coding:"rgba(244,165,53,.1)" };

  return (
    <div className="fcd-tab-content">
      <div className="fcd-tab-hd">
        <div className="fcd-search-wrap">
          <IcoSearch style={{ color:"var(--text3)" }}/>
          <input placeholder="Search assignments…" className="fcd-search-input"/>
        </div>
        <button className="fcc-action-btn fcc-action-primary" style={{ color:course.pctColor, borderColor:`rgba(${course.colorRgb},.3)`, background:`rgba(${course.colorRgb},.08)`, gap:6 }}>
          <IcoPlus width={11} height={11}/> New Assignment
        </button>
      </div>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl"><IcoFile width={13} height={13} style={{ color:"var(--indigo-ll)" }}/> All Assignments <span>{course.assignments.length} total</span></div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {course.assignments.map((asgmt, i) => {
            const sm = STATUS_META[asgmt.status];
            return (
              <div key={asgmt.id} className="fcd-asgmt-row">
                <div className="fcd-asgmt-main">
                  <span className="fcd-asgmt-type" style={{ background:TYPE_BG[asgmt.type], color:TYPE_COLOR[asgmt.type] }}>{asgmt.type}</span>
                  <div className="fcd-asgmt-info">
                    <div className="fcd-asgmt-title">{asgmt.title}</div>
                    <div className="fcd-asgmt-meta">
                      {asgmt.status !== "upcoming" && <span>{asgmt.submissions}/{asgmt.total} submitted</span>}
                      <span>{asgmt.status === "upcoming" ? `Due in ${asgmt.due}` : asgmt.due}</span>
                    </div>
                  </div>
                </div>
                <div className="fcd-asgmt-right">
                  {asgmt.avgScore !== null && (
                    <div className="fcd-asgmt-score">
                      <span style={{ fontFamily:"'Fraunces',serif", fontSize:16, color:asgmt.avgScore>=75?"var(--teal)":asgmt.avgScore>=60?"var(--amber)":"var(--rose)" }}>{asgmt.avgScore}%</span>
                      <span style={{ fontSize:9, color:"var(--text3)" }}>class avg</span>
                    </div>
                  )}
                  {asgmt.status !== "upcoming" && (
                    <div className="fcd-asgmt-subprog">
                      <AnimBar pct={Math.round((asgmt.submissions/asgmt.total)*100)} color={sm.color} height={3} delay={400+i*80}/>
                    </div>
                  )}
                  <span className="fcd-status-badge" style={{ background:sm.bg, color:sm.color }}>
                    {sm.icon} {sm.label}
                  </span>
                  <div className="fcd-row-actions">
                    {asgmt.status === "grading" && (
                      <button className="fcd-row-btn fcd-row-btn-primary" style={{ color:course.pctColor, borderColor:`rgba(${course.colorRgb},.3)` }} title="Grade now"><IcoPen width={11} height={11}/></button>
                    )}
                    <button className="fcd-row-btn" title="Edit"><IcoPen width={11} height={11}/></button>
                    <button className="fcd-row-btn" title="Download"><IcoDownload width={11} height={11}/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL: QUIZZES TAB ─────────────────────────────────────────
function QuizzesTab({ course }) {
  return (
    <div className="fcd-tab-content">
      <div className="fcd-tab-hd">
        <div className="fcd-search-wrap">
          <IcoSearch style={{ color:"var(--text3)" }}/>
          <input placeholder="Search quizzes…" className="fcd-search-input"/>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button className="fcc-action-btn" style={{ gap:5 }}>
            <IcoBrain width={11} height={11}/> AI Generate
          </button>
          <button className="fcc-action-btn fcc-action-primary" style={{ color:course.pctColor, borderColor:`rgba(${course.colorRgb},.3)`, background:`rgba(${course.colorRgb},.08)`, gap:6 }}>
            <IcoPlus width={11} height={11}/> New Quiz
          </button>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {course.quizzes.map((q, i) => {
          const isClosed = q.status === "closed";
          const isScheduled = q.status === "scheduled";
          return (
            <div key={q.id} className="panel">
              <div className="panel-hd">
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span className={`fcd-quiz-status-badge ${q.status}`}>
                    {isClosed ? "✅ Closed" : isScheduled ? "🕐 Scheduled" : "🔴 Live"}
                  </span>
                  <div className="panel-ttl">{q.title} <span>{q.questions} questions · {q.date}</span></div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <button className="fcc-action-btn" style={{ fontSize:11 }}><IcoBar width={11} height={11}/> Results</button>
                  <button className="fcc-action-btn" style={{ fontSize:11 }}><IcoPen width={11} height={11}/> Edit</button>
                </div>
              </div>
              <div className="panel-body">
                {isClosed ? (
                  <div className="fcd-quiz-results">
                    <div className="fcd-qr-stats">
                      {[
                        { lbl:"Submitted", val:`${q.submitted}/${q.total}`, color:"var(--text)" },
                        { lbl:"Class Avg", val:`${q.avgScore}%`, color:q.avgScore>=75?"var(--teal)":"var(--amber)" },
                        { lbl:"Highest",   val:`${q.highest}%`,  color:"var(--teal)" },
                        { lbl:"Lowest",    val:`${q.lowest}%`,   color:"var(--rose)" },
                      ].map((s,si) => (
                        <div key={si} className="fcd-qr-stat">
                          <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:s.color }}>{s.val}</div>
                          <div style={{ fontSize:10, color:"var(--text3)", marginTop:3 }}>{s.lbl}</div>
                        </div>
                      ))}
                    </div>
                    <div className="fcd-qr-bars">
                      {[
                        { lbl:"Avg",  pct:q.avgScore, color:q.avgScore>=75?"var(--teal)":"var(--amber)" },
                        { lbl:"High", pct:q.highest,  color:"var(--teal)" },
                        { lbl:"Low",  pct:q.lowest,   color:"var(--rose)" },
                        { lbl:"Sub",  pct:Math.round((q.submitted/q.total)*100), color:"var(--indigo-l)" },
                      ].map((b, bi) => (
                        <div key={bi} className="fcd-qr-bar-row">
                          <span className="fcd-qr-bar-lbl">{b.lbl}</span>
                          <div style={{ flex:1 }}><AnimBar pct={b.pct} color={b.color} height={5} delay={400+i*100+bi*100}/></div>
                          <span className="fcd-qr-bar-val" style={{ color:b.color }}>{b.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="fcd-quiz-scheduled">
                    <div className="fcd-qs-icon">🗓️</div>
                    <div className="fcd-qs-text">
                      <div className="fcd-qs-title">Scheduled for {q.date}</div>
                      <div className="fcd-qs-sub">{q.questions} questions · {q.total} students will be notified</div>
                    </div>
                    <button className="fcc-action-btn fcc-action-primary" style={{ color:course.pctColor, borderColor:`rgba(${course.colorRgb},.3)`, background:`rgba(${course.colorRgb},.08)` }}>
                      Edit Quiz <IcoChevR/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DETAIL: STUDENTS TAB ────────────────────────────────────────
// ✅ Uses course.studentList instead of course.students
function StudentsTab({ course }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = course.studentList.filter(s => {   // ✅ FIXED: studentList
    const q = search.toLowerCase();
    const matchQ = s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q);
    const matchF = filter === "all" || s.status === filter;
    return matchQ && matchF;
  });

  const GRADE_COLOR = { "A+":"var(--teal)","A":"var(--teal)","A−":"var(--teal)","B+":"var(--indigo-ll)","B":"var(--indigo-ll)","C":"var(--amber)","D":"var(--rose)","D+":"var(--amber)" };

  return (
    <div className="fcd-tab-content">
      <div className="fcd-tab-hd">
        <div className="fcd-search-wrap">
          <IcoSearch style={{ color:"var(--text3)" }}/>
          <input placeholder="Search by name or roll…" className="fcd-search-input" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="fcd-filter-pills">
          {[["all","All"],["top","Top"],["good","On Track"],["risk","At Risk"]].map(([val,lbl]) => (
            <button key={val} className={`fcd-filter-pill ${filter===val?"active":""}`}
              style={filter===val?{borderColor:`rgba(${course.colorRgb},.4)`,color:course.pctColor,background:`rgba(${course.colorRgb},.08)`}:{}}
              onClick={() => setFilter(val)}>{lbl}</button>
          ))}
        </div>
        <button className="fcc-action-btn" style={{ gap:5 }}><IcoDownload width={11} height={11}/> Export</button>
      </div>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl"><IcoUsers width={13} height={13} style={{ color:"var(--indigo-ll)" }}/> Student List <span>{filtered.length} students</span></div>
        </div>
        <div className="fcd-stu-table">
          <div className="fcd-stu-head">
            <span>Student</span><span>Attendance</span><span>Quiz Score</span><span>Grade</span><span>Trend</span><span>Status</span>
          </div>
          {filtered.length === 0 ? (
            <div className="fcd-empty" style={{ padding:"30px 20px" }}>No students match your search.</div>
          ) : filtered.map((s, i) => (
            <div key={i} className="fcd-stu-row">
              <div className="fcd-stu-id">
                <div className="fcd-stu-avatar">{s.name.split(" ").map(x=>x[0]).join("")}</div>
                <div>
                  <div className="fcd-stu-name">{s.name}</div>
                  <div className="fcd-stu-roll">{s.roll}</div>
                </div>
              </div>
              <div className="fcd-stu-attend">
                <AnimBar pct={s.attendance} color={s.attendance>=85?"var(--teal)":s.attendance>=75?"var(--amber)":"var(--rose)"} height={3} delay={400+i*60}/>
                <span style={{ fontSize:10.5, fontWeight:600, color:s.attendance>=85?"var(--teal)":s.attendance>=75?"var(--amber)":"var(--rose)" }}>{s.attendance}%</span>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:s.score>=80?"var(--teal)":s.score>=65?"var(--indigo-ll)":s.score>=50?"var(--amber)":"var(--rose)" }}>{s.score}%</span>
              <span className="fcd-grade-badge" style={{ color:GRADE_COLOR[s.grade]||"var(--text2)", background:`${GRADE_COLOR[s.grade]||"var(--text2)"}18` }}>{s.grade}</span>
              <span className={`fcd-trend-badge ${s.trend}`}>
                {s.trend==="up"?<IcoChevUp/>:s.trend==="dn"?<IcoChevDn/>:<IcoMinus/>}
                {s.trend==="up"?"Rising":s.trend==="dn"?"Falling":"Stable"}
              </span>
              <span className={`fcd-status-badge ${s.status}`}>
                {s.status==="top"?"⭐ Top":s.status==="good"?"✅ Good":"⚠️ At Risk"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COURSE DETAIL VIEW ──────────────────────────────────────────
function CourseDetail({ course, onBack }) {
  const [tab, setTab] = useState("overview");
  const lectPct = Math.round((course.lectures.done / course.lectures.total) * 100);

  return (
    <div className="fcd-root">
      <div className="fcd-nav">
        <button className="fcd-back-btn" onClick={onBack}><IcoChevL/> Courses</button>
        <div className="fcd-breadcrumb">
          <span>Courses</span>
          <IcoChevR style={{ color:"var(--text3)" }}/>
          <span style={{ color:"var(--text2)" }}>{course.code}</span>
          <IcoChevR style={{ color:"var(--text3)" }}/>
          <span style={{ color:course.pctColor }}>{course.name}</span>
        </div>
      </div>

      <div className="fcd-hero" style={{ background:`linear-gradient(135deg, rgba(${course.colorRgb},.09), rgba(${course.colorRgb},.03))`, borderColor:`rgba(${course.colorRgb},.2)` }}>
        <div className="fcd-hero-badge" style={course.badgeStyle}>{course.icon}</div>
        <div className="fcd-hero-info">
          <div className="fcd-hero-tag">
            <span style={{ color:course.pctColor, background:`rgba(${course.colorRgb},.1)`, padding:"3px 10px", borderRadius:99, fontSize:10, fontWeight:700 }}>{course.code}</span>
            <span style={{ fontSize:10, color:"var(--text3)" }}>{course.sem} · Section {course.section}</span>
            {course.pendingGrade > 0 && (
              <span className="fcd-card-pending"><IcoAlert width={9} height={9}/> {course.pendingGrade} pending</span>
            )}
          </div>
          <h2 className="fcd-hero-title">{course.name}</h2>
          <p className="fcd-hero-desc">{course.description}</p>
        </div>
        <div className="fcd-hero-stats">
          {[
            { val:course.students,    color:course.pctColor,                                          lbl:"Students"   },
            { val:`${course.avgAttendance}%`, color:course.avgAttendance>=80?"var(--teal)":"var(--amber)", lbl:"Attendance" },
            { val:`${course.avgScore}%`,      color:"var(--violet)",                                  lbl:"Avg Score"  },
            { val:`${lectPct}%`,              color:course.pctColor,                                  lbl:"Progress"   },
          ].map((s, i) => (
            <div key={i} className="fcd-hs-item" style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              {i > 0 && <div className="fcd-hs-sep" style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)" }}/>}
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:9.5, color:"var(--text3)", marginTop:3 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fcd-tabs">
        {DETAIL_TABS.map(t => (
          <button key={t.id} className={`fcd-tab ${tab===t.id?"active":""}`}
            style={tab===t.id?{ borderBottomColor:course.color, color:course.pctColor }:{}}
            onClick={() => setTab(t.id)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "overview"    && <OverviewTab    course={course}/>}
      {tab === "lectures"    && <LecturesTab    course={course}/>}
      {tab === "assignments" && <AssignmentsTab course={course}/>}
      {tab === "quizzes"     && <QuizzesTab     course={course}/>}
      {tab === "students"    && <StudentsTab    course={course}/>}
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────
export default function FacultyCourses({ onBack }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const filtered = COURSES
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name")       return a.name.localeCompare(b.name);
      if (sortBy === "students")   return b.students - a.students;
      if (sortBy === "attendance") return b.avgAttendance - a.avgAttendance;
      if (sortBy === "pending")    return b.pendingGrade - a.pendingGrade;
      return 0;
    });

  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)}/>;
  }

  return (
    <div className="fcc-root">
      <div className="fcc-page-hd">
        <div className="fcc-back-row">
          <button className="fcd-back-btn" onClick={onBack}><IcoChevL/> Dashboard</button>
          <div className="fcd-breadcrumb">
            <span>Dashboard</span>
            <IcoChevR style={{ color:"var(--text3)" }}/>
            <span style={{ color:"var(--text2)" }}>Courses</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginTop:10 }}>
          <div>
            <div className="greet-tag" style={{ marginBottom:8 }}>
              <div className="greet-pip"/>
              <span className="greet-pip-txt">Semester 5 · Week 11 · 3 Active Courses</span>
            </div>
            <h1 className="greet-title"><em>Courses</em></h1>
            <p className="greet-sub">Manage lectures, assignments, quizzes, and track student performance.</p>
          </div>
          <div className="fcc-hd-actions">
            <div className="fcc-search-bar">
              <IcoSearch style={{ color:"var(--text3)", flexShrink:0 }}/>
              <input placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <div className="fcc-sort-pills">
              {[["name","Name"],["students","Students"],["attendance","Attendance"],["pending","Pending"]].map(([val,lbl]) => (
                <button key={val} className={`fcc-sort-pill ${sortBy===val?"active":""}`} onClick={() => setSortBy(val)}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fcc-summary-strip">
        {[
          { val:COURSES.reduce((a,c)=>a+c.students,0),                                                    lbl:"Total Students",   color:"var(--teal)"      },
          { val:`${Math.round(COURSES.reduce((a,c)=>a+c.avgAttendance,0)/COURSES.length)}%`,               lbl:"Avg Attendance",   color:"var(--indigo-ll)" },
          { val:`${Math.round(COURSES.reduce((a,c)=>a+c.avgScore,0)/COURSES.length)}%`,                    lbl:"Avg Score",        color:"var(--violet)"    },
          { val:COURSES.reduce((a,c)=>a+c.pendingGrade,0),                                                 lbl:"Pending to Grade", color:"var(--rose)"      },
        ].map((s,i) => (
          <div key={i} className="fcc-summary-item">
            <div className="fcc-sum-val" style={{ color:s.color }}>{s.val}</div>
            <div className="fcc-sum-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="fcd-empty" style={{ padding:"60px 20px", textAlign:"center" }}>
          No courses match "<strong>{search}</strong>"
        </div>
      ) : (
        <div className="fcc-course-grid">
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} onOpen={setSelectedCourse}/>
          ))}
        </div>
      )}
    </div>
  );
}