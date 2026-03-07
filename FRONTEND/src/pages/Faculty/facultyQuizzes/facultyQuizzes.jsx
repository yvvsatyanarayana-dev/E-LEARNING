// facultyQuizzes.jsx
// Matches FacultyDashboard.css design system exactly
// Place at: src/pages/Faculty/facultyQuizzes/facultyQuizzes.jsx

import { useState, useEffect, useCallback } from "react";
import "./facultyQuizzes.css";

// ─── ICONS ────────────────────────────────────────────────────────
const IcoQuiz     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IcoPlus     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoSearch   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoChevL    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoPen      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoTrash    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoClose    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoCheck    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoClock    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoUsers    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoBar      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoAlert    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoCal      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoEye      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoGrid     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IcoList     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IcoZap      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoCopy     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IcoShare    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IcoShuffle  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
const IcoMcq      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>;
const IcoTf       = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 12l3 3 5-5"/></svg>;
const IcoFib      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;

// ─── LOOKUP TABLES ────────────────────────────────────────────────
const COURSES_META = {
  cs501: { code: "CS501", name: "Operating Systems",           color: "var(--indigo-l)",  rgb: "91,78,248",   bg: "rgba(91,78,248,.1)",   border: "rgba(91,78,248,.2)",   total: 112 },
  cs502: { code: "CS502", name: "Database Management Systems", color: "var(--teal)",      rgb: "39,201,176",  bg: "rgba(39,201,176,.1)",  border: "rgba(39,201,176,.2)",  total: 108 },
  cs503: { code: "CS503", name: "Computer Architecture",       color: "var(--violet)",    rgb: "159,122,234", bg: "rgba(159,122,234,.1)", border: "rgba(159,122,234,.2)", total: 96  },
};

const QTYPE_META = {
  MCQ:   { label: "MCQ",         color: "var(--indigo-l)",  bg: "rgba(91,78,248,.1)",   icon: <IcoMcq  style={{width:10,height:10}}/> },
  TF:    { label: "True/False",  color: "var(--teal)",      bg: "rgba(39,201,176,.1)",  icon: <IcoTf   style={{width:10,height:10}}/> },
  FIB:   { label: "Fill Blank",  color: "var(--amber)",     bg: "rgba(244,165,53,.1)",  icon: <IcoFib  style={{width:10,height:10}}/> },
  Mixed: { label: "Mixed",       color: "var(--violet)",    bg: "rgba(159,122,234,.1)", icon: <IcoZap  style={{width:10,height:10}}/> },
};

const STATUS_META = {
  live:     { label: "Live",      color: "var(--indigo-ll)", bg: "rgba(91,78,248,.1)",   border: "rgba(91,78,248,.25)"   },
  upcoming: { label: "Upcoming",  color: "var(--text3)",     bg: "var(--surface3)",       border: "rgba(255,255,255,.06)" },
  ended:    { label: "Ended",     color: "var(--teal)",      bg: "rgba(39,201,176,.1)",  border: "rgba(39,201,176,.2)"   },
  draft:    { label: "Draft",     color: "var(--amber)",     bg: "rgba(244,165,53,.1)",  border: "rgba(244,165,53,.2)"   },
};

// ─── QUIZ DATA ────────────────────────────────────────────────────
const QUIZZES_RAW = [
  // CS501 — Operating Systems
  {
    id: 1, courseId: "cs501",
    title: "CPU Scheduling Algorithms Quiz",
    type: "MCQ", status: "live",
    questions: 15, marks: 15, duration: 20,
    week: "W9", unit: "Unit II",
    startDate: "Oct 26 10:00 AM", endDate: "Oct 26 10:30 AM",
    attempts: 89, avgScore: 74, highest: 100, lowest: 20,
    passPct: 82,
    desc: "Covers FCFS, SJF, Round Robin, and Priority scheduling. Students are expected to compute waiting times, turnaround times, and Gantt charts.",
    shuffle: true, showResult: true, negMark: false,
    questions_list: [
      { q: "Which scheduling algorithm is non-preemptive by default?", options: ["FCFS","Round Robin","SRTF","Multilevel Queue"], ans: 0, marks: 1 },
      { q: "Round Robin with time quantum Q has context switches that increase when Q is ___?", options: ["Very large","Very small","Equal to burst","None of above"], ans: 1, marks: 1 },
      { q: "What is the average waiting time for FCFS: P1=8ms, P2=4ms, P3=2ms?", options: ["4ms","7ms","8ms","10ms"], ans: 1, marks: 1 },
    ],
    results: [
      { roll: "21CS047", name: "Arjun Reddy",  score: 14, total: 15, time: "18m", status: "submitted" },
      { roll: "21CS031", name: "Priya Nair",   score: 12, total: 15, time: "20m", status: "submitted" },
      { roll: "21CS019", name: "Rohan Mehta",  score: 11, total: 15, time: "17m", status: "submitted" },
      { roll: "21CS062", name: "Sneha Sharma", score: 9,  total: 15, time: "20m", status: "submitted" },
      { roll: "21CS008", name: "Dev Iyer",     score: 6,  total: 15, time: "19m", status: "submitted" },
      { roll: "21CS015", name: "Aisha Khan",   score: 0,  total: 15, time: "—",   status: "absent"    },
    ],
    created: "Oct 24",
  },
  {
    id: 2, courseId: "cs501",
    title: "Memory Management Mid-Check",
    type: "Mixed", status: "upcoming",
    questions: 20, marks: 20, duration: 30,
    week: "W11", unit: "Unit III",
    startDate: "Nov 2 11:00 AM", endDate: "Nov 2 11:30 AM",
    attempts: 0, avgScore: null, highest: null, lowest: null,
    passPct: null,
    desc: "Tests concepts in paging, segmentation, TLB, and virtual memory. Includes MCQs, True/False, and fill-in-the-blank questions.",
    shuffle: true, showResult: false, negMark: true,
    questions_list: [],
    results: [],
    created: "Oct 25",
  },
  {
    id: 3, courseId: "cs501",
    title: "OS Unit I Recap",
    type: "TF", status: "ended",
    questions: 10, marks: 10, duration: 15,
    week: "W3", unit: "Unit I",
    startDate: "Sep 18 9:00 AM", endDate: "Sep 18 9:15 AM",
    attempts: 112, avgScore: 81, highest: 100, lowest: 40,
    passPct: 91,
    desc: "True/False questions on OS fundamentals: process vs thread, kernel types, system calls, and I/O management.",
    shuffle: false, showResult: true, negMark: false,
    questions_list: [
      { q: "A thread shares memory with other threads of the same process.", ans: true,  marks: 1 },
      { q: "Monolithic kernel includes all OS services in kernel space.",     ans: true,  marks: 1 },
      { q: "System calls execute in user mode.",                              ans: false, marks: 1 },
    ],
    results: [
      { roll: "21CS047", name: "Arjun Reddy",  score: 10, total: 10, time: "12m", status: "submitted" },
      { roll: "21CS031", name: "Priya Nair",   score: 9,  total: 10, time: "14m", status: "submitted" },
      { roll: "21CS019", name: "Rohan Mehta",  score: 8,  total: 10, time: "13m", status: "submitted" },
    ],
    created: "Sep 16",
  },
  {
    id: 4, courseId: "cs501",
    title: "Deadlock & Synchronization",
    type: "MCQ", status: "draft",
    questions: 12, marks: 12, duration: 18,
    week: "W13", unit: "Unit IV",
    startDate: "Nov 12 10:00 AM", endDate: "Nov 12 10:20 AM",
    attempts: 0, avgScore: null, highest: null, lowest: null,
    passPct: null,
    desc: "Draft quiz on Banker's algorithm, mutex, semaphores, and deadlock avoidance strategies.",
    shuffle: true, showResult: true, negMark: false,
    questions_list: [],
    results: [],
    created: "Oct 28",
  },

  // CS502 — DBMS
  {
    id: 5, courseId: "cs502",
    title: "SQL Queries & Joins",
    type: "FIB", status: "live",
    questions: 12, marks: 12, duration: 25,
    week: "W8", unit: "Unit II",
    startDate: "Oct 26 2:00 PM", endDate: "Oct 26 2:25 PM",
    attempts: 71, avgScore: 68, highest: 100, lowest: 8,
    passPct: 73,
    desc: "Fill-in-the-blank quiz covering SELECT, WHERE, GROUP BY, HAVING, and all JOIN types. Students must complete SQL fragments accurately.",
    shuffle: true, showResult: true, negMark: false,
    questions_list: [
      { q: "SELECT * FROM Students ___ Grades ON Students.id = Grades.student_id", ans: "INNER JOIN", marks: 1 },
      { q: "To filter groups use the ___ clause.", ans: "HAVING", marks: 1 },
    ],
    results: [
      { roll: "21CS101", name: "Meera Pillai",   score: 11, total: 12, time: "23m", status: "submitted" },
      { roll: "21CS088", name: "Siddharth Jain", score: 9,  total: 12, time: "24m", status: "submitted" },
      { roll: "21CS073", name: "Ananya Das",     score: 7,  total: 12, time: "25m", status: "submitted" },
      { roll: "21CS059", name: "Kartik Malhotra",score: 5,  total: 12, time: "22m", status: "submitted" },
      { roll: "21CS041", name: "Zara Sheikh",    score: 1,  total: 12, time: "25m", status: "submitted" },
    ],
    created: "Oct 23",
  },
  {
    id: 6, courseId: "cs502",
    title: "Normalization & ER Diagrams",
    type: "Mixed", status: "ended",
    questions: 18, marks: 18, duration: 30,
    week: "W5", unit: "Unit I",
    startDate: "Sep 30 10:00 AM", endDate: "Sep 30 10:30 AM",
    attempts: 108, avgScore: 77, highest: 100, lowest: 22,
    passPct: 86,
    desc: "Covers 1NF, 2NF, 3NF, BCNF normalization and ER diagram components: entities, attributes, cardinalities.",
    shuffle: false, showResult: true, negMark: false,
    questions_list: [],
    results: [
      { roll: "21CS101", name: "Meera Pillai",   score: 16, total: 18, time: "28m", status: "submitted" },
      { roll: "21CS088", name: "Siddharth Jain", score: 14, total: 18, time: "30m", status: "submitted" },
    ],
    created: "Sep 28",
  },
  {
    id: 7, courseId: "cs502",
    title: "Transaction & Concurrency Quiz",
    type: "MCQ", status: "upcoming",
    questions: 15, marks: 15, duration: 20,
    week: "W12", unit: "Unit III",
    startDate: "Nov 4 9:00 AM", endDate: "Nov 4 9:20 AM",
    attempts: 0, avgScore: null, highest: null, lowest: null,
    passPct: null,
    desc: "Quiz on ACID properties, serializability, two-phase locking, and timestamp-based concurrency control.",
    shuffle: true, showResult: false, negMark: true,
    questions_list: [],
    results: [],
    created: "Oct 27",
  },

  // CS503 — Computer Architecture
  {
    id: 8, courseId: "cs503",
    title: "Instruction Set Architecture",
    type: "MCQ", status: "ended",
    questions: 15, marks: 15, duration: 20,
    week: "W4", unit: "Unit I",
    startDate: "Sep 22 11:00 AM", endDate: "Sep 22 11:20 AM",
    attempts: 96, avgScore: 71, highest: 100, lowest: 20,
    passPct: 78,
    desc: "MCQs on RISC vs CISC, addressing modes, instruction formats, and assembly-level operations.",
    shuffle: true, showResult: true, negMark: false,
    questions_list: [],
    results: [
      { roll: "21CS201", name: "Vikram Singh",   score: 14, total: 15, time: "18m", status: "submitted" },
      { roll: "21CS185", name: "Deepika Nair",   score: 12, total: 15, time: "19m", status: "submitted" },
      { roll: "21CS172", name: "Ravi Kumar",     score: 10, total: 15, time: "20m", status: "submitted" },
    ],
    created: "Sep 20",
  },
  {
    id: 9, courseId: "cs503",
    title: "Pipelining & Hazards",
    type: "Mixed", status: "live",
    questions: 10, marks: 10, duration: 15,
    week: "W9", unit: "Unit II",
    startDate: "Oct 26 12:00 PM", endDate: "Oct 26 12:20 PM",
    attempts: 52, avgScore: 63, highest: 90, lowest: 20,
    passPct: 67,
    desc: "Covers 5-stage MIPS pipeline, data hazards, control hazards, structural hazards, and forwarding paths.",
    shuffle: false, showResult: true, negMark: false,
    questions_list: [
      { q: "Which hazard occurs when two instructions need the same hardware?", options: ["Data","Control","Structural","None"], ans: 2, marks: 1 },
      { q: "Forwarding eliminates which type of hazard primarily?", options: ["Structural","Data","Control","Branch"], ans: 1, marks: 1 },
    ],
    results: [
      { roll: "21CS201", name: "Vikram Singh",   score: 9,  total: 10, time: "13m", status: "submitted" },
      { roll: "21CS185", name: "Deepika Nair",   score: 7,  total: 10, time: "15m", status: "submitted" },
      { roll: "21CS172", name: "Ravi Kumar",     score: 5,  total: 10, time: "14m", status: "submitted" },
      { roll: "21CS160", name: "Tanvi Menon",    score: 2,  total: 10, time: "15m", status: "submitted" },
      { roll: "21CS148", name: "Ajay Shetty",    score: 0,  total: 10, time: "—",   status: "absent"    },
    ],
    created: "Oct 24",
  },
  {
    id: 10, courseId: "cs503",
    title: "Cache & Memory Hierarchy",
    type: "TF", status: "draft",
    questions: 10, marks: 10, duration: 12,
    week: "W14", unit: "Unit III",
    startDate: "Nov 15 10:00 AM", endDate: "Nov 15 10:15 AM",
    attempts: 0, avgScore: null, highest: null, lowest: null,
    passPct: null,
    desc: "True/False quiz on cache mapping techniques, hit/miss rates, write policies, and memory hierarchy levels.",
    shuffle: false, showResult: false, negMark: false,
    questions_list: [],
    results: [],
    created: "Oct 29",
  },
];

// ─── PROGRESS BAR ─────────────────────────────────────────────────
function ProgressBar({ pct, color = "var(--indigo-l)", height = 4, style = {} }) {
  return (
    <div className="qz-prog-track" style={{ height, ...style }}>
      <div className="qz-prog-fill" style={{ width: `${Math.min(100, pct || 0)}%`, background: color }} />
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────
function StatCard({ label, value, sub, colorClass, icon }) {
  return (
    <div className={`stat-card ${colorClass || ""}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-val">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ─── TYPE BADGE ───────────────────────────────────────────────────
function TypeBadge({ type }) {
  const m = QTYPE_META[type] || QTYPE_META.Mixed;
  return (
    <span className="qz-type-badge" style={{ color: m.color, background: m.bg }}>
      {m.icon} {m.label}
    </span>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.draft;
  return (
    <span className="qz-status-badge" style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      {status === "live" && <span className="qz-live-dot" />}
      {m.label}
    </span>
  );
}

// ─── COURSE CHIP ──────────────────────────────────────────────────
function CourseChip({ courseId }) {
  const c = COURSES_META[courseId];
  if (!c) return null;
  return (
    <span className="qz-course-chip" style={{ color: c.color, background: c.bg, borderColor: c.border }}>
      {c.code}
    </span>
  );
}

// ─── QUIZ CARD ────────────────────────────────────────────────────
function QuizCard({ quiz, onClick }) {
  const c = COURSES_META[quiz.courseId];
  const isLive   = quiz.status === "live";
  const isDraft  = quiz.status === "draft";
  const isEnded  = quiz.status === "ended";
  const subPct   = quiz.attempts > 0 ? Math.round((quiz.attempts / c.total) * 100) : 0;

  return (
    <div
      className={`qz-card ${isLive ? "qz-card--live" : ""} ${isDraft ? "qz-card--draft" : ""}`}
      onClick={onClick}
    >
      <div className="qz-card-accent" style={{ background: `rgba(${c.rgb},.55)` }} />

      <div className="qz-card-hd">
        <div className="qz-card-badges">
          <CourseChip courseId={quiz.courseId} />
          <span className="qz-week-chip">W{quiz.week?.replace("W","")}</span>
        </div>
        <StatusBadge status={quiz.status} />
      </div>

      <div className="qz-card-title">{quiz.title}</div>
      <div className="qz-card-unit">{quiz.unit}</div>

      <div className="qz-card-meta">
        <TypeBadge type={quiz.type} />
        <span className="qz-marks-badge">{quiz.marks} pts</span>
        <span className="qz-dur-badge">
          <IcoClock style={{width:9,height:9,marginRight:3}} />{quiz.duration}m
        </span>
        <span className="qz-q-badge">
          {quiz.questions}Q
        </span>
      </div>

      <div className="qz-card-time-row">
        <IcoCal style={{width:10,height:10,flexShrink:0}} />
        <span>{quiz.startDate}</span>
      </div>

      {(isLive || isEnded) && (
        <div className="qz-card-attempts-row">
          <div className="qz-card-sub-meta">
            <IcoUsers style={{width:9,height:9}} />
            <span>{quiz.attempts}/{c.total}</span>
            <span className="qz-dot-sep">·</span>
            <span>{subPct}%</span>
          </div>
          {quiz.avgScore !== null && (
            <span className="qz-avg-badge" style={{ color: quiz.avgScore >= 70 ? "var(--teal)" : "var(--amber)" }}>
              ⌀ {quiz.avgScore}%
            </span>
          )}
        </div>
      )}

      {(isLive || isEnded) && (
        <ProgressBar pct={subPct} color={`rgba(${c.rgb},1)`} />
      )}

      {isDraft && (
        <div className="qz-draft-note">
          <IcoPen style={{width:9,height:9}} /> Draft — not published yet
        </div>
      )}

      {quiz.status === "upcoming" && (
        <div className="qz-upcoming-note">
          <IcoClock style={{width:9,height:9}} /> Starts {quiz.startDate}
        </div>
      )}

      {isEnded && quiz.passPct !== null && (
        <div className="qz-pass-row">
          <span>Pass rate</span>
          <span style={{ color: quiz.passPct >= 75 ? "var(--teal)" : "var(--amber)", fontWeight: 700 }}>
            {quiz.passPct}%
          </span>
        </div>
      )}
    </div>
  );
}

// ─── QUIZ ROW (list view) ─────────────────────────────────────────
function QuizRow({ quiz, idx, onClick }) {
  const c = COURSES_META[quiz.courseId];
  const subPct = quiz.attempts > 0 ? Math.round((quiz.attempts / c.total) * 100) : 0;
  return (
    <div className="qz-row" onClick={onClick}>
      <span className="qz-row-num">{idx + 1}</span>
      <div className="qz-row-info">
        <div className="qz-row-title">{quiz.title}</div>
        <div className="qz-row-meta">
          <CourseChip courseId={quiz.courseId} />
          <span className="qz-week-chip">{quiz.week}</span>
          <span>{quiz.unit}</span>
        </div>
      </div>
      <TypeBadge type={quiz.type} />
      <div className="qz-row-dur">
        <IcoClock style={{width:9,height:9}} /> {quiz.duration}m
      </div>
      <div className="qz-row-sub-col">
        <span className="qz-row-attempts">{quiz.attempts} / {c.total}</span>
        <ProgressBar pct={subPct} color={`rgba(${c.rgb},1)`} height={3} style={{ marginTop: 3, width: 72 }} />
      </div>
      <div className="qz-row-avg" style={{ color: quiz.avgScore !== null ? (quiz.avgScore >= 70 ? "var(--teal)" : "var(--amber)") : "var(--text3)" }}>
        {quiz.avgScore !== null ? `${quiz.avgScore}%` : "—"}
      </div>
      <StatusBadge status={quiz.status} />
      <div className="qz-row-acts">
        <button className="qz-icon-btn" title="Edit" onClick={e => { e.stopPropagation(); }}>
          <IcoPen style={{width:11,height:11}} />
        </button>
        <button className="qz-icon-btn" title="Duplicate" onClick={e => { e.stopPropagation(); }}>
          <IcoCopy style={{width:11,height:11}} />
        </button>
      </div>
    </div>
  );
}

// ─── CREATE MODAL ─────────────────────────────────────────────────
const BLANK_QUESTION = (type) => ({
  id: Date.now(),
  type,
  q: "",
  options: type === "MCQ" ? ["","","",""] : [],
  ans: type === "TF" ? true : (type === "MCQ" ? 0 : ""),
  marks: 1,
});

function CreateModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", courseId: "cs501", type: "MCQ",
    duration: 20, marks: 10, week: "W1", unit: "Unit I",
    startDate: "", startTime: "10:00",
    shuffle: true, showResult: true, negMark: false,
  });
  const [questions, setQuestions] = useState([BLANK_QUESTION("MCQ")]);
  const [pubMode, setPubMode] = useState("now");

  useEffect(() => {
    const handle = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addQ = () => setQuestions(qs => [...qs, BLANK_QUESTION(form.type)]);
  const removeQ = (id) => setQuestions(qs => qs.filter(q => q.id !== id));
  const updateQ = (id, patch) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));
  const updateOpt = (qid, optIdx, val) =>
    setQuestions(qs => qs.map(q =>
      q.id === qid ? { ...q, options: q.options.map((o, i) => i === optIdx ? val : o) } : q
    ));

  const canNext = step === 1 ? (form.title.trim() && form.courseId && form.type) : true;

  const handlePublish = () => {
    onCreated(form.title || "New Quiz");
    onClose();
  };

  return (
    <div className="qz-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="qz-modal">
        {/* Header */}
        <div className="qz-modal-hd">
          <div className="qz-modal-ico">
            <IcoQuiz style={{width:16,height:16,color:"#fff"}} />
          </div>
          <div>
            <div className="qz-modal-title">Create New Quiz</div>
            <div style={{fontSize:10.5,color:"var(--text3)",marginTop:2}}>Step {step} of 3</div>
          </div>
          <button className="qz-modal-close" onClick={onClose}>
            <IcoClose style={{width:12,height:12}} />
          </button>
        </div>

        {/* Steps */}
        <div className="qz-steps">
          {["Details","Questions","Publish"].map((lbl, i) => {
            const s = i + 1;
            const cls = s < step ? "qz-step--done" : s === step ? "qz-step--active" : "";
            return (
              <div key={lbl} className={`qz-step ${cls}`}>
                <div className="qz-step-dot">{s < step ? <IcoCheck style={{width:10,height:10}} /> : s}</div>
                <span>{lbl}</span>
                {i < 2 && <div className="qz-step-line" />}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="qz-modal-body">

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div className="qz-form">
              <div className="qz-field">
                <label className="qz-field-lbl">Quiz Title *</label>
                <input className="qz-input" placeholder="e.g. CPU Scheduling Algorithms Quiz" value={form.title} onChange={e => setF("title", e.target.value)} />
              </div>
              <div className="qz-2col">
                <div className="qz-field">
                  <label className="qz-field-lbl">Course *</label>
                  <select className="qz-input" value={form.courseId} onChange={e => setF("courseId", e.target.value)}>
                    {Object.entries(COURSES_META).map(([k, c]) => (
                      <option key={k} value={k}>{c.code} – {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="qz-field">
                  <label className="qz-field-lbl">Question Type</label>
                  <select className="qz-input" value={form.type} onChange={e => { setF("type", e.target.value); setQuestions([BLANK_QUESTION(e.target.value)]); }}>
                    {Object.entries(QTYPE_META).map(([k, m]) => (
                      <option key={k} value={k}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="qz-2col">
                <div className="qz-field">
                  <label className="qz-field-lbl">Duration (minutes)</label>
                  <input className="qz-input" type="number" min={5} max={180} value={form.duration} onChange={e => setF("duration", +e.target.value)} />
                </div>
                <div className="qz-field">
                  <label className="qz-field-lbl">Total Marks</label>
                  <input className="qz-input" type="number" min={1} value={form.marks} onChange={e => setF("marks", +e.target.value)} />
                </div>
              </div>
              <div className="qz-2col">
                <div className="qz-field">
                  <label className="qz-field-lbl">Week</label>
                  <select className="qz-input" value={form.week} onChange={e => setF("week", e.target.value)}>
                    {Array.from({length:16},(_,i)=>`W${i+1}`).map(w => <option key={w}>{w}</option>)}
                  </select>
                </div>
                <div className="qz-field">
                  <label className="qz-field-lbl">Unit</label>
                  <select className="qz-input" value={form.unit} onChange={e => setF("unit", e.target.value)}>
                    {["Unit I","Unit II","Unit III","Unit IV","Unit V"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="qz-2col">
                <div className="qz-field">
                  <label className="qz-field-lbl">Start Date</label>
                  <input className="qz-input" type="date" value={form.startDate} onChange={e => setF("startDate", e.target.value)} />
                </div>
                <div className="qz-field">
                  <label className="qz-field-lbl">Start Time</label>
                  <input className="qz-input" type="time" value={form.startTime} onChange={e => setF("startTime", e.target.value)} />
                </div>
              </div>

              {/* Settings toggles */}
              <div className="qz-settings-grid">
                {[
                  { key: "shuffle",    label: "Shuffle Questions",  sub: "Randomize order for each student" },
                  { key: "showResult", label: "Show Result",        sub: "Students see score after submission" },
                  { key: "negMark",    label: "Negative Marking",   sub: "−0.25 per wrong answer" },
                ].map(({ key, label, sub }) => (
                  <div key={key} className="qz-setting-row" onClick={() => setF(key, !form[key])}>
                    <div>
                      <div className="qz-setting-lbl">{label}</div>
                      <div className="qz-setting-sub">{sub}</div>
                    </div>
                    <div className={`qz-toggle ${form[key] ? "qz-toggle--on" : ""}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Questions ── */}
          {step === 2 && (
            <div className="qz-form">
              <div className="qz-q-info">
                <IcoAlert style={{width:14,height:14,color:"var(--amber)",flexShrink:0}} />
                <span>Add questions for this <strong>{form.type}</strong> quiz. Total marks will auto-sum.</span>
              </div>

              <div className="qz-q-list">
                {questions.map((q, qi) => (
                  <div key={q.id} className="qz-q-card">
                    <div className="qz-q-card-hd">
                      <span className="qz-q-num">Q{qi + 1}</span>
                      <TypeBadge type={form.type === "Mixed" ? (qi % 3 === 0 ? "MCQ" : qi % 3 === 1 ? "TF" : "FIB") : form.type} />
                      <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:"auto"}}>
                        <input
                          className="qz-input qz-marks-inp"
                          type="number" min={1} value={q.marks}
                          onChange={e => updateQ(q.id, { marks: +e.target.value })}
                          title="Marks"
                        />
                        <span style={{fontSize:9.5,color:"var(--text3)"}}>pts</span>
                        {questions.length > 1 && (
                          <button className="qz-q-del" onClick={() => removeQ(q.id)}>
                            <IcoTrash style={{width:10,height:10}} />
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      className="qz-input qz-textarea"
                      placeholder={`Question ${qi + 1}…`}
                      value={q.q}
                      onChange={e => updateQ(q.id, { q: e.target.value })}
                    />

                    {/* MCQ options */}
                    {(form.type === "MCQ" || (form.type === "Mixed" && qi % 3 === 0)) && (
                      <div className="qz-options">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className={`qz-option-row ${q.ans === oi ? "qz-option-row--correct" : ""}`}
                            onClick={() => updateQ(q.id, { ans: oi })}>
                            <div className={`qz-opt-radio ${q.ans === oi ? "qz-opt-radio--on" : ""}`} />
                            <input
                              className="qz-input qz-opt-inp"
                              placeholder={`Option ${String.fromCharCode(65+oi)}`}
                              value={opt}
                              onClick={e => e.stopPropagation()}
                              onChange={e => updateOpt(q.id, oi, e.target.value)}
                            />
                            {q.ans === oi && <IcoCheck style={{width:10,height:10,color:"var(--teal)",flexShrink:0}} />}
                          </div>
                        ))}
                        <div style={{fontSize:9.5,color:"var(--text3)",marginTop:2}}>Click an option to mark as correct answer</div>
                      </div>
                    )}

                    {/* True/False */}
                    {(form.type === "TF" || (form.type === "Mixed" && qi % 3 === 1)) && (
                      <div className="qz-tf-row">
                        {[true, false].map(val => (
                          <div key={String(val)} className={`qz-tf-btn ${q.ans === val ? "qz-tf-btn--on" : ""}`}
                            onClick={() => updateQ(q.id, { ans: val })}>
                            {val ? "✓ True" : "✗ False"}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fill in blank */}
                    {(form.type === "FIB" || (form.type === "Mixed" && qi % 3 === 2)) && (
                      <input
                        className="qz-input"
                        placeholder="Correct answer (exact match)"
                        value={q.ans || ""}
                        onChange={e => updateQ(q.id, { ans: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button className="qz-add-q-btn" onClick={addQ}>
                <IcoPlus style={{width:12,height:12}} /> Add Question
              </button>

              <div className="qz-q-summary">
                <span>{questions.length} questions</span>
                <span className="qz-dot-sep">·</span>
                <span>{questions.reduce((a, q) => a + (q.marks || 0), 0)} total marks</span>
              </div>
            </div>
          )}

          {/* ── Step 3: Publish ── */}
          {step === 3 && (
            <div className="qz-form">
              {/* Preview */}
              <div className="qz-preview-card" style={{ borderColor: COURSES_META[form.courseId]?.border || "var(--border)", background: COURSES_META[form.courseId]?.bg || "transparent" }}>
                <div className="qz-preview-top">
                  <div className="qz-preview-badges">
                    <CourseChip courseId={form.courseId} />
                    <TypeBadge type={form.type} />
                    <span className="qz-week-chip">{form.week}</span>
                  </div>
                </div>
                <div className="qz-preview-title">{form.title || "Untitled Quiz"}</div>
                <div className="qz-preview-meta">
                  <IcoClock style={{width:10,height:10}} /> {form.duration} min
                  <span className="qz-dot-sep">·</span>
                  {questions.length} questions
                  <span className="qz-dot-sep">·</span>
                  {questions.reduce((a, q) => a + (q.marks || 0), 0)} pts
                </div>
                <div className="qz-preview-settings">
                  {form.shuffle && <span className="qz-setting-pill"><IcoShuffle style={{width:9,height:9}} /> Shuffle</span>}
                  {form.showResult && <span className="qz-setting-pill"><IcoEye style={{width:9,height:9}} /> Results visible</span>}
                  {form.negMark && <span className="qz-setting-pill qz-setting-pill--rose"><IcoAlert style={{width:9,height:9}} /> Negative marking</span>}
                </div>
              </div>

              {/* Publish options */}
              <div className="qz-pub-opts">
                {[
                  { val: "now",   label: "Publish Now",       sub: "Students can attempt immediately" },
                  { val: "sched", label: "Schedule",          sub: `Starts ${form.startDate || "—"} at ${form.startTime}` },
                  { val: "draft", label: "Save as Draft",     sub: "Complete and publish later" },
                ].map(({ val, label, sub }) => (
                  <div key={val} className={`qz-pub-opt ${pubMode === val ? "qz-pub-opt--active" : ""}`}
                    onClick={() => setPubMode(val)}>
                    <div className={`qz-pub-radio ${pubMode === val ? "qz-pub-radio--active" : ""}`} />
                    <div><div className="qz-pub-lbl">{label}</div><div className="qz-pub-sub">{sub}</div></div>
                  </div>
                ))}
              </div>

              <div className="qz-modal-foot">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button
                  className={`btn btn-primary ${pubMode !== "draft" ? "qz-btn-teal" : ""}`}
                  onClick={handlePublish}
                >
                  {pubMode === "now" ? "🚀 Publish Now" : pubMode === "sched" ? "📅 Schedule Quiz" : "💾 Save Draft"}
                </button>
              </div>
            </div>
          )}

          {/* Navigation footer (steps 1 & 2) */}
          {step < 3 && (
            <div className="qz-modal-foot">
              {step > 1 && <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>}
              <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(s => s + 1)} style={{marginLeft:"auto"}}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL DRAWER ────────────────────────────────────────────────
function DetailDrawer({ quiz, onClose }) {
  const [tab, setTab] = useState("overview");
  const [resultFilter, setResultFilter] = useState("all");
  const [resultSearch, setResultSearch] = useState("");
  const c = COURSES_META[quiz.courseId];

  useEffect(() => {
    const handle = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  const filtered = quiz.results.filter(r => {
    const matchFilter =
      resultFilter === "all" ? true :
      resultFilter === "submitted" ? r.status === "submitted" :
      resultFilter === "absent" ? r.status === "absent" : true;
    const matchSearch = r.name.toLowerCase().includes(resultSearch.toLowerCase()) ||
                        r.roll.toLowerCase().includes(resultSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const scoreRanges = quiz.results.length
    ? [
        { label: "90–100", count: quiz.results.filter(r => r.score / quiz.marks * 100 >= 90).length },
        { label: "70–89",  count: quiz.results.filter(r => { const p = r.score / quiz.marks * 100; return p >= 70 && p < 90; }).length },
        { label: "50–69",  count: quiz.results.filter(r => { const p = r.score / quiz.marks * 100; return p >= 50 && p < 70; }).length },
        { label: "<50",    count: quiz.results.filter(r => r.score / quiz.marks * 100 < 50).length },
      ]
    : [];

  const maxCount = scoreRanges.length ? Math.max(...scoreRanges.map(r => r.count), 1) : 1;

  return (
    <div className="qz-overlay qz-overlay--drawer" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="qz-drawer">
        {/* Header */}
        <div className="qz-drawer-hd">
          <button className="qz-drawer-back" onClick={onClose}>
            <IcoChevL style={{width:12,height:12}} /> Back
          </button>
          <div className="qz-drawer-course" style={{ color: c.color }}>{c.code} · {quiz.unit}</div>
          <div className="qz-drawer-title">{quiz.title}</div>
          <div className="qz-drawer-badges">
            <TypeBadge type={quiz.type} />
            <StatusBadge status={quiz.status} />
            <span className="qz-marks-badge">{quiz.marks} pts</span>
            <span className="qz-dur-badge"><IcoClock style={{width:9,height:9,marginRight:3}} />{quiz.duration}m</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="qz-drawer-tabs">
          {["overview", "results", "questions"].map(t => (
            <button key={t} className={`qz-drawer-tab ${tab === t ? "active" : ""}`}
              style={tab === t ? { color: c.color, borderBottomColor: c.color } : {}}
              onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="qz-drawer-body">

          {/* ── Overview ── */}
          {tab === "overview" && (
            <>
              <p className="qz-drawer-desc">{quiz.desc}</p>

              {/* Stats */}
              {quiz.attempts > 0 && (
                <>
                  <div className="qz-drawer-sec">Performance Summary</div>
                  <div className="qz-drawer-stats">
                    {[
                      { val: quiz.attempts, lbl: "Attempted" },
                      { val: quiz.avgScore !== null ? `${quiz.avgScore}%` : "—", lbl: "Average" },
                      { val: quiz.highest  !== null ? `${quiz.highest}%` : "—",  lbl: "Highest" },
                      { val: quiz.passPct  !== null ? `${quiz.passPct}%` : "—",  lbl: "Pass Rate" },
                    ].map(({ val, lbl }) => (
                      <div key={lbl} className="qz-ds">
                        <div className="qz-ds-val" style={{ color: c.color }}>{val}</div>
                        <div className="qz-ds-lbl">{lbl}</div>
                      </div>
                    ))}
                  </div>

                  {/* Score distribution */}
                  <div className="qz-drawer-sec" style={{ marginTop: 14 }}>Score Distribution</div>
                  <div className="qz-score-dist">
                    {scoreRanges.map(({ label, count }) => (
                      <div key={label} className="qz-score-row">
                        <span className="qz-score-lbl">{label}%</span>
                        <ProgressBar pct={(count / maxCount) * 100} color={c.color} height={6} style={{ flex: 1 }} />
                        <span className="qz-score-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Meta */}
              <div className="qz-drawer-sec" style={{ marginTop: 14 }}>Quiz Info</div>
              <div className="qz-drawer-meta-grid">
                {[
                  { label: "Questions",  value: quiz.questions },
                  { label: "Duration",   value: `${quiz.duration} min` },
                  { label: "Shuffle",    value: quiz.shuffle ? "Yes" : "No" },
                  { label: "Show Result",value: quiz.showResult ? "Yes" : "No" },
                  { label: "Neg. Mark",  value: quiz.negMark ? "−0.25 / wrong" : "No" },
                  { label: "Created",    value: quiz.created },
                ].map(({ label, value }) => (
                  <div key={label} className="qz-meta-item">
                    <span>{label}:</span><strong>{value}</strong>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="qz-drawer-sec" style={{ marginTop: 14 }}>Actions</div>
              <div className="qz-drawer-actions">
                <button className="btn btn-ghost qz-act-btn">
                  <IcoPen style={{width:12,height:12}} /> Edit
                </button>
                <button className="btn btn-ghost qz-act-btn">
                  <IcoCopy style={{width:12,height:12}} /> Duplicate
                </button>
                <button className="btn btn-ghost qz-act-btn">
                  <IcoShare style={{width:12,height:12}} /> Share Link
                </button>
              </div>
              <button className="qz-danger-btn">
                <IcoTrash style={{width:12,height:12}} /> Delete Quiz
              </button>
            </>
          )}

          {/* ── Results ── */}
          {tab === "results" && (
            <>
              {quiz.results.length === 0 ? (
                <div className="qz-empty">
                  <IcoBar style={{width:36,height:36,marginBottom:10,opacity:.25}} />
                  <div style={{fontSize:13,fontWeight:600}}>No results yet</div>
                  <div style={{fontSize:11,marginTop:5}}>Results will appear once students attempt this quiz.</div>
                </div>
              ) : (
                <>
                  <div className="qz-sub-toolbar">
                    <div className="qz-sub-search">
                      <IcoSearch style={{width:11,height:11,flexShrink:0,color:"var(--text3)"}} />
                      <input className="qz-sub-search-inp" placeholder="Search by name or roll…" value={resultSearch} onChange={e => setResultSearch(e.target.value)} />
                    </div>
                    <div className="qz-sub-filter-pills">
                      {["all","submitted","absent"].map(f => (
                        <button key={f} className={`qz-sub-pill ${resultFilter === f ? "active" : ""}`}
                          style={resultFilter === f ? { color: c.color, borderColor: c.border, background: c.bg } : {}}
                          onClick={() => setResultFilter(f)}>
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="qz-result-list">
                    {filtered.map((r, i) => {
                      const pct = r.status === "absent" ? 0 : Math.round((r.score / quiz.marks) * 100);
                      const passed = pct >= 50;
                      return (
                        <div key={i} className="qz-result-row">
                          <div className="qz-result-avatar">
                            {r.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                          </div>
                          <div className="qz-result-info">
                            <div className="qz-result-name">{r.name}</div>
                            <div className="qz-result-roll">{r.roll} · {r.time}</div>
                          </div>
                          {r.status === "submitted" ? (
                            <div className="qz-result-score-col">
                              <div className="qz-result-score" style={{ color: passed ? "var(--teal)" : "var(--rose)" }}>
                                {r.score}/{quiz.marks}
                              </div>
                              <div style={{fontSize:9,color:"var(--text3)"}}>{pct}%</div>
                            </div>
                          ) : (
                            <span className="qz-absent-badge">Absent</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Questions ── */}
          {tab === "questions" && (
            <>
              {quiz.questions_list.length === 0 ? (
                <div className="qz-empty">
                  <IcoQuiz style={{width:36,height:36,marginBottom:10,opacity:.25}} />
                  <div style={{fontSize:13,fontWeight:600}}>No questions added</div>
                  <div style={{fontSize:11,marginTop:5}}>Edit the quiz to add questions.</div>
                </div>
              ) : (
                <div className="qz-q-view-list">
                  {quiz.questions_list.map((q, qi) => (
                    <div key={qi} className="qz-q-view-item">
                      <div className="qz-q-view-hd">
                        <span className="qz-q-num">Q{qi + 1}</span>
                        <span style={{fontSize:10.5,fontWeight:700,color:"var(--text2)",flex:1}}>{q.q}</span>
                        <span className="qz-marks-badge">{q.marks} pt</span>
                      </div>
                      {/* MCQ */}
                      {q.options && (
                        <div className="qz-q-view-opts">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`qz-q-view-opt ${q.ans === oi ? "qz-q-view-opt--correct" : ""}`}>
                              <span className="qz-opt-label">{String.fromCharCode(65+oi)}</span>
                              {opt}
                              {q.ans === oi && <IcoCheck style={{width:9,height:9,marginLeft:"auto",color:"var(--teal)"}} />}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* True/False */}
                      {typeof q.ans === "boolean" && (
                        <div className="qz-tf-answer">
                          Answer: <span style={{color:"var(--teal)",fontWeight:700}}>{q.ans ? "True" : "False"}</span>
                        </div>
                      )}
                      {/* FIB */}
                      {typeof q.ans === "string" && (
                        <div className="qz-fib-answer">
                          Answer: <span style={{color:"var(--teal)",fontWeight:700}}>"{q.ans}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function FacultyQuizzes({ onBack }) {
  const [view, setView]           = useState("grid");
  const [courseFilter, setCourse] = useState("All");
  const [statusFilter, setStatus] = useState("all");
  const [typeFilter,   setType]   = useState("all");
  const [sortBy,       setSort]   = useState("recent");
  const [search,       setSearch] = useState("");
  const [showCreate,   setCreate] = useState(false);
  const [selected,     setSelected]= useState(null);
  const [toast,        setToast]  = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  const handleCreated = useCallback((title) => {
    showToast(`✓ Quiz "${title}" created successfully`);
  }, [showToast]);

  // Filtered + sorted list
  const quizzes = QUIZZES_RAW.filter(q => {
    const c = COURSES_META[q.courseId];
    if (courseFilter !== "All" && c.code !== courseFilter) return false;
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (typeFilter !== "all"   && q.type   !== typeFilter)   return false;
    if (search) {
      const s = search.toLowerCase();
      if (!q.title.toLowerCase().includes(s) && !c.name.toLowerCase().includes(s) && !c.code.toLowerCase().includes(s)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "recent")  return b.id - a.id;
    if (sortBy === "oldest")  return a.id - b.id;
    if (sortBy === "title")   return a.title.localeCompare(b.title);
    if (sortBy === "attempts")return b.attempts - a.attempts;
    if (sortBy === "avg")     return (b.avgScore || 0) - (a.avgScore || 0);
    return 0;
  });

  // Sections for grid view
  const sections = [
    { key: "live",     label: "Live Now",        countClass: "qz-sec-count--indigo", quizzes: quizzes.filter(q => q.status === "live")     },
    { key: "upcoming", label: "Upcoming",         countClass: "qz-sec-count--amber",  quizzes: quizzes.filter(q => q.status === "upcoming")  },
    { key: "draft",    label: "Drafts",           countClass: "qz-sec-count--rose",   quizzes: quizzes.filter(q => q.status === "draft")     },
    { key: "ended",    label: "Ended / Graded",   countClass: "qz-sec-count--teal",   quizzes: quizzes.filter(q => q.status === "ended")     },
  ].filter(s => s.quizzes.length > 0);

  // Stats
  const totalQuizzes   = QUIZZES_RAW.length;
  const liveCount      = QUIZZES_RAW.filter(q => q.status === "live").length;
  const totalAttempts  = QUIZZES_RAW.reduce((a, q) => a + q.attempts, 0);
  const avgAll         = (() => { const w = QUIZZES_RAW.filter(q => q.avgScore !== null); return w.length ? Math.round(w.reduce((a, q) => a + q.avgScore, 0) / w.length) : 0; })();
  const draftCount     = QUIZZES_RAW.filter(q => q.status === "draft").length;

  return (
    <div className="qz-root">

      {/* Page Header */}
      <div className="qz-page-hd">
        <div>
          <button className="qz-back-btn" onClick={onBack}>
            <IcoChevL style={{width:13,height:13}} /> Dashboard
          </button>
          <div className="greet-title" style={{marginBottom:2}}>Quizzes</div>
          <div className="greet-sub">Manage all online quizzes across your courses</div>
        </div>
        <div className="qz-hd-right">
          <button className="btn btn-ghost" style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}>
            <IcoBar style={{width:13,height:13}} /> Analytics
          </button>
          <button className="btn btn-primary" style={{display:"flex",alignItems:"center",gap:6,fontSize:12}} onClick={() => setCreate(true)}>
            <IcoPlus style={{width:13,height:13}} /> New Quiz
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="qz-stat-strip">
        <StatCard label="Total Quizzes"   value={totalQuizzes}    colorClass="sc-indigo" icon={<IcoQuiz  style={{width:14,height:14}}/>} />
        <StatCard label="Live Now"        value={liveCount}       colorClass="sc-teal"   icon={<IcoZap   style={{width:14,height:14}}/>} sub={liveCount > 0 ? "In progress" : "None active"} />
        <StatCard label="Total Attempts"  value={totalAttempts}   colorClass="sc-violet" icon={<IcoUsers style={{width:14,height:14}}/>} />
        <StatCard label="Average Score"   value={`${avgAll}%`}    colorClass="sc-amber"  icon={<IcoBar   style={{width:14,height:14}}/>} />
        <StatCard label="Drafts"          value={draftCount}      colorClass="sc-rose"   icon={<IcoPen   style={{width:14,height:14}}/>} sub={draftCount > 0 ? "Unpublished" : "—"} />
      </div>

      {/* Course Tabs */}
      <div className="qz-course-tabs">
        {["All", "CS501", "CS502", "CS503"].map(code => {
          const count = code === "All" ? QUIZZES_RAW.length
            : QUIZZES_RAW.filter(q => COURSES_META[q.courseId].code === code).length;
          const meta = Object.values(COURSES_META).find(c => c.code === code);
          return (
            <button
              key={code}
              className={`qz-ctab ${courseFilter === code ? "qz-ctab--active" : ""}`}
              style={courseFilter === code && meta ? { borderColor: meta.border, color: meta.color, background: meta.bg } : {}}
              onClick={() => setCourse(code)}
            >
              {meta && <span className="qz-ctab-dot" style={{ background: meta.color }} />}
              {code}
              <span className="qz-ctab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="qz-toolbar">
        <div className="qz-search">
          <IcoSearch style={{width:13,height:13,flexShrink:0,color:"var(--text3)"}} />
          <input
            className="qz-search-inp"
            placeholder="Search quizzes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="qz-search-clear" onClick={() => setSearch("")}>
              <IcoClose style={{width:10,height:10}} />
            </button>
          )}
        </div>
        <div className="qz-toolbar-right">
          <select className="qz-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="live">Live</option>
            <option value="upcoming">Upcoming</option>
            <option value="ended">Ended</option>
            <option value="draft">Draft</option>
          </select>
          <select className="qz-select" value={typeFilter} onChange={e => setType(e.target.value)}>
            <option value="all">All Types</option>
            {Object.entries(QTYPE_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
          <select className="qz-select" value={sortBy} onChange={e => setSort(e.target.value)}>
            <option value="recent">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">A → Z</option>
            <option value="attempts">Most Attempts</option>
            <option value="avg">Highest Avg</option>
          </select>
          <div className="qz-view-toggle">
            <button className={`qz-vbtn ${view === "grid" ? "qz-vbtn--active" : ""}`} onClick={() => setView("grid")} title="Grid view">
              <IcoGrid style={{width:13,height:13}} />
            </button>
            <button className={`qz-vbtn ${view === "list" ? "qz-vbtn--active" : ""}`} onClick={() => setView("list")} title="List view">
              <IcoList style={{width:13,height:13}} />
            </button>
          </div>
        </div>
      </div>

      {/* Results bar */}
      <div className="qz-results-bar">
        Showing <strong style={{color:"var(--text2)"}}>{quizzes.length}</strong> of {QUIZZES_RAW.length} quizzes
        {search && <> matching <strong style={{color:"var(--indigo-ll)"}}>"{search}"</strong></>}
      </div>

      {/* Empty state */}
      {quizzes.length === 0 && (
        <div className="qz-empty">
          <IcoQuiz style={{width:42,height:42,marginBottom:12,opacity:.2}} />
          <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>No quizzes found</div>
          <div style={{fontSize:12}}>Try adjusting your filters or search query.</div>
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {view === "grid" && quizzes.length > 0 && sections.map(sec => {
        const secQuizzes = sec.quizzes.filter(q => quizzes.includes(q));
        if (!secQuizzes.length) return null;
        return (
          <div key={sec.key} style={{ marginBottom: 28 }}>
            <div className="qz-section-lbl">
              {sec.key === "live" && <IcoZap style={{width:12,height:12,color:"var(--indigo-ll)"}} />}
              {sec.key === "upcoming" && <IcoClock style={{width:12,height:12,color:"var(--amber)"}} />}
              {sec.key === "draft" && <IcoPen style={{width:12,height:12,color:"var(--rose)"}} />}
              {sec.key === "ended" && <IcoCheck style={{width:12,height:12,color:"var(--teal)"}} />}
              {sec.label}
              <span className={`qz-sec-count ${sec.countClass}`}>{secQuizzes.length}</span>
            </div>
            <div className="qz-grid">
              {secQuizzes.map(q => (
                <QuizCard key={q.id} quiz={q} onClick={() => setSelected(q)} />
              ))}
            </div>
          </div>
        );
      })}

      {/* ── LIST VIEW ── */}
      {view === "list" && quizzes.length > 0 && (
        <div className="qz-list-panel panel">
          <div className="qz-list-head">
            <span>#</span><span>Quiz</span><span>Type</span>
            <span>Duration</span><span>Attempts</span>
            <span>Avg</span><span>Status</span><span>Actions</span>
          </div>
          {quizzes.map((q, i) => (
            <QuizRow key={q.id} quiz={q} idx={i} onClick={() => setSelected(q)} />
          ))}
        </div>
      )}

      {/* CTA Banner */}
      {QUIZZES_RAW.filter(q => q.status === "draft").length > 0 && (
        <div className="qz-cta-banner">
          <IcoPen style={{width:20,height:20,color:"var(--amber)",flexShrink:0}} />
          <div>
            <div className="qz-cta-title">{draftCount} quiz{draftCount > 1 ? "zes" : ""} saved as draft</div>
            <div className="qz-cta-sub">Complete and publish them to make them available to students.</div>
          </div>
          <button className="btn btn-primary qz-btn-amber" style={{marginLeft:"auto",flexShrink:0,display:"flex",alignItems:"center",gap:6,fontSize:11.5}}>
            <IcoPen style={{width:12,height:12}} /> Manage Drafts
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreate && <CreateModal onClose={() => setCreate(false)} onCreated={handleCreated} />}
      {selected   && <DetailDrawer quiz={selected} onClose={() => setSelected(null)} />}

      {/* Toast */}
      {toast && <div className="qz-toast">{toast}</div>}
    </div>
  );
}