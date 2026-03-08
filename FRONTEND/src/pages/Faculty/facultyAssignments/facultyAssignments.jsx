// facultyAssignments.jsx
// Matches FacultyDashboard.css design system exactly
// Place at: src/pages/Faculty/facultyAssignments/facultyAssignments.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import "./facultyAssignments.css";

// ─── ICONS ────────────────────────────────────────────────────────
const IcoFile     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>;
const IcoPlus     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoSearch   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoChevR    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoChevL    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoPen      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoTrash    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoDownload = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoClose    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoCheck    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoAlert    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoCal      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoUsers    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoBook     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoClock    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoBar      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoChevUp   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoChevDn   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoMinus    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoStar     = (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoCopy     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IcoUpload   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcoEye      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoBrain    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;
const IcoLink     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IcoGrid     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IcoList     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;

// ─── LOOKUP TABLES ────────────────────────────────────────────────
const COURSES_META = {
  cs501: { code: "CS501", name: "Operating Systems",           color: "var(--indigo-l)",  rgb: "91,78,248",   bg: "rgba(91,78,248,.1)",   border: "rgba(91,78,248,.2)",   total: 112 },
  cs502: { code: "CS502", name: "Database Management Systems", color: "var(--teal)",      rgb: "39,201,176",  bg: "rgba(39,201,176,.1)",  border: "rgba(39,201,176,.2)",  total: 108 },
  cs503: { code: "CS503", name: "Computer Architecture",       color: "var(--violet)",    rgb: "159,122,234", bg: "rgba(159,122,234,.1)", border: "rgba(159,122,234,.2)", total: 96  },
};

const TYPE_META = {
  Lab:     { color: "var(--indigo-l)",  bg: "rgba(91,78,248,.1)",   icon: "🧪" },
  Theory:  { color: "var(--teal)",      bg: "rgba(39,201,176,.1)",  icon: "📖" },
  Project: { color: "var(--violet)",    bg: "rgba(159,122,234,.1)", icon: "🏗️" },
  Coding:  { color: "var(--amber)",     bg: "rgba(244,165,53,.1)",  icon: "💻" },
  Report:  { color: "var(--rose)",      bg: "rgba(242,68,92,.1)",   icon: "📄" },
};

const STATUS_META = {
  grading:  { label: "Grading",  color: "var(--amber)",     bg: "rgba(244,165,53,.1)",  border: "rgba(244,165,53,.2)"   },
  upcoming: { label: "Upcoming", color: "var(--text3)",     bg: "var(--surface3)",       border: "rgba(255,255,255,.06)" },
  done:     { label: "Graded",   color: "var(--teal)",      bg: "rgba(39,201,176,.1)",  border: "rgba(39,201,176,.2)"   },
  live:     { label: "Live",     color: "var(--indigo-ll)", bg: "rgba(91,78,248,.1)",   border: "rgba(91,78,248,.2)"    },
};

// ─── ASSIGNMENT DATA ──────────────────────────────────────────────
const ASSIGNMENTS_RAW = [
  // ── CS501 Operating Systems ──────────────────────────────────────
  {
    id: 1, courseId: "cs501", title: "Process Scheduling Simulation",
    type: "Lab", due: "Today", dueDate: "Oct 26", marks: 20,
    submissions: 98, avgScore: 72, highest: 95, lowest: 28,
    status: "grading", week: "W9", unit: "Unit II",
    desc: "Simulate FCFS, SJF, Round Robin, and Priority CPU scheduling algorithms using C or Python. Submit source code + Gantt chart output with analysis report.",
    rubric: [
      { item: "FCFS implementation",     marks: 5 },
      { item: "SJF implementation",      marks: 5 },
      { item: "Round Robin & Priority",  marks: 6 },
      { item: "Report & documentation",  marks: 4 },
    ],
    submissions_list: [
      { roll: "21CS047", name: "Arjun Reddy",  score: 95, trend: "up",  submitted: "Oct 24", status: "graded"  },
      { roll: "21CS031", name: "Priya Nair",   score: 88, trend: "up",  submitted: "Oct 25", status: "graded"  },
      { roll: "21CS019", name: "Rohan Mehta",  score: 76, trend: "up",  submitted: "Oct 25", status: "graded"  },
      { roll: "21CS062", name: "Sneha Sharma", score: 0,  trend: "neu", submitted: "Oct 26", status: "pending" },
      { roll: "21CS008", name: "Dev Iyer",     score: 52, trend: "dn",  submitted: "Oct 24", status: "graded"  },
      { roll: "21CS015", name: "Aisha Khan",   score: 82, trend: "up",  submitted: "Oct 25", status: "graded"  },
      { roll: "21CS033", name: "Kiran Rao",    score: 0,  trend: "dn",  submitted: null,     status: "missing" },
    ],
    created: "Oct 20", posted: true,
  },
  {
    id: 2, courseId: "cs501", title: "Memory Allocation Algorithms",
    type: "Theory", due: "3 days", dueDate: "Oct 29", marks: 15,
    submissions: 0, avgScore: null, highest: null, lowest: null,
    status: "live", week: "W10", unit: "Unit III",
    desc: "Write detailed notes comparing First Fit, Best Fit, and Worst Fit memory allocation strategies. Include fragmentation analysis with worked numerical examples.",
    rubric: [
      { item: "First Fit explanation",  marks: 4 },
      { item: "Best Fit explanation",   marks: 4 },
      { item: "Worst Fit explanation",  marks: 4 },
      { item: "Comparative analysis",   marks: 3 },
    ],
    submissions_list: [],
    created: "Oct 23", posted: true,
  },
  {
    id: 3, courseId: "cs501", title: "File System Implementation",
    type: "Project", due: "10 days", dueDate: "Nov 5", marks: 30,
    submissions: 0, avgScore: null, highest: null, lowest: null,
    status: "upcoming", week: "W12", unit: "Unit IV",
    desc: "Design and implement a simple FAT-based file system in C. Must support: create, read, write, delete, and directory listing operations.",
    rubric: [
      { item: "FAT table design",      marks: 8  },
      { item: "CRUD operations",       marks: 10 },
      { item: "Directory management",  marks: 8  },
      { item: "Testing & report",      marks: 4  },
    ],
    submissions_list: [],
    created: "Oct 22", posted: false,
  },
  {
    id: 4, courseId: "cs501", title: "Deadlock Detection Report",
    type: "Theory", due: "Completed", dueDate: "Oct 10", marks: 15,
    submissions: 112, avgScore: 68, highest: 90, lowest: 20,
    status: "done", week: "W6", unit: "Unit II",
    desc: "Write a detailed report on deadlock detection and prevention techniques. Include Banker's algorithm with worked numerical examples.",
    rubric: [
      { item: "Deadlock conditions",  marks: 4 },
      { item: "Detection algorithm",  marks: 5 },
      { item: "Prevention methods",   marks: 4 },
      { item: "Numerical examples",   marks: 2 },
    ],
    submissions_list: [
      { roll: "21CS047", name: "Arjun Reddy", score: 90, trend: "up",  submitted: "Oct 9",  status: "graded" },
      { roll: "21CS031", name: "Priya Nair",  score: 78, trend: "up",  submitted: "Oct 10", status: "graded" },
      { roll: "21CS008", name: "Dev Iyer",    score: 48, trend: "dn",  submitted: "Oct 10", status: "graded" },
    ],
    created: "Oct 3", posted: true,
  },
  {
    id: 5, courseId: "cs501", title: "CPU Scheduling Algorithms",
    type: "Coding", due: "Completed", dueDate: "Sep 28", marks: 20,
    submissions: 109, avgScore: 81, highest: 100, lowest: 40,
    status: "done", week: "W4", unit: "Unit II",
    desc: "Implement all four major CPU scheduling algorithms (FCFS, SJF, RR, Priority) in Python. Include performance comparison charts.",
    rubric: [
      { item: "FCFS & SJF code",    marks: 6 },
      { item: "RR & Priority code", marks: 6 },
      { item: "Output & Gantt",     marks: 5 },
      { item: "Performance report", marks: 3 },
    ],
    submissions_list: [
      { roll: "21CS047", name: "Arjun Reddy", score: 100, trend: "up", submitted: "Sep 27", status: "graded" },
      { roll: "21CS019", name: "Rohan Mehta", score: 82,  trend: "up", submitted: "Sep 28", status: "graded" },
    ],
    created: "Sep 22", posted: true,
  },
  // ── CS502 Database Management Systems ────────────────────────────
  {
    id: 6, courseId: "cs502", title: "ER Diagram Design",
    type: "Theory", due: "Completed", dueDate: "Oct 8", marks: 15,
    submissions: 108, avgScore: 75, highest: 98, lowest: 32,
    status: "done", week: "W3", unit: "Unit I",
    desc: "Design complete ER diagrams for a Hospital Management System. Show all entities, relationships, cardinality, and key constraints.",
    rubric: [
      { item: "Entities & attributes",  marks: 4 },
      { item: "Relationships",          marks: 4 },
      { item: "Cardinality notation",   marks: 4 },
      { item: "Completeness & neatness",marks: 3 },
    ],
    submissions_list: [
      { roll: "21CS031", name: "Priya Nair",  score: 98, trend: "up", submitted: "Oct 7", status: "graded" },
      { roll: "21CS047", name: "Arjun Reddy", score: 85, trend: "up", submitted: "Oct 8", status: "graded" },
    ],
    created: "Oct 1", posted: true,
  },
  {
    id: 7, courseId: "cs502", title: "SQL Query Optimization",
    type: "Coding", due: "Tomorrow", dueDate: "Oct 27", marks: 20,
    submissions: 72, avgScore: null, highest: null, lowest: null,
    status: "grading", week: "W8", unit: "Unit II",
    desc: "Write optimized SQL queries for a provided schema. Focus on joins, subqueries, indexing strategies, and EXPLAIN plan analysis.",
    rubric: [
      { item: "Query correctness", marks: 8 },
      { item: "Optimization use",  marks: 6 },
      { item: "EXPLAIN analysis",  marks: 4 },
      { item: "Documentation",     marks: 2 },
    ],
    submissions_list: [
      { roll: "21CS031", name: "Priya Nair",   score: 0, trend: "up",  submitted: "Oct 26", status: "pending" },
      { roll: "21CS047", name: "Arjun Reddy",  score: 0, trend: "up",  submitted: "Oct 25", status: "pending" },
      { roll: "21CS008", name: "Dev Iyer",     score: 0, trend: "dn",  submitted: "Oct 24", status: "pending" },
      { roll: "21CS055", name: "Meena Pillai", score: 0, trend: "neu", submitted: null,     status: "missing" },
    ],
    created: "Oct 18", posted: true,
  },
  {
    id: 8, courseId: "cs502", title: "Normalization to 3NF",
    type: "Theory", due: "5 days", dueDate: "Oct 31", marks: 15,
    submissions: 0, avgScore: null, highest: null, lowest: null,
    status: "live", week: "W9", unit: "Unit III",
    desc: "Normalize a given un-normalized relation to 3NF. Show all intermediate normal forms with complete functional dependency analysis.",
    rubric: [
      { item: "1NF conversion", marks: 4 },
      { item: "2NF conversion", marks: 4 },
      { item: "3NF conversion", marks: 5 },
      { item: "FD analysis",    marks: 2 },
    ],
    submissions_list: [],
    created: "Oct 22", posted: true,
  },
  {
    id: 9, courseId: "cs502", title: "Transaction Management Report",
    type: "Report", due: "8 days", dueDate: "Nov 3", marks: 15,
    submissions: 0, avgScore: null, highest: null, lowest: null,
    status: "upcoming", week: "W10", unit: "Unit III",
    desc: "Write a comprehensive report on ACID properties, transaction states, and concurrency control mechanisms in DBMS.",
    rubric: [
      { item: "ACID properties",     marks: 4 },
      { item: "Transaction states",  marks: 4 },
      { item: "Concurrency methods", marks: 5 },
      { item: "Real-world examples", marks: 2 },
    ],
    submissions_list: [],
    created: "Oct 22", posted: false,
  },
  // ── CS503 Computer Architecture ──────────────────────────────────
  {
    id: 10, courseId: "cs503", title: "Pipeline Hazard Analysis",
    type: "Theory", due: "Completed", dueDate: "Oct 5", marks: 20,
    submissions: 96, avgScore: 82, highest: 100, lowest: 44,
    status: "done", week: "W5", unit: "Unit III",
    desc: "Analyze data, control, and structural hazards in a 5-stage MIPS pipeline. Propose forwarding paths and stall-based solutions.",
    rubric: [
      { item: "Data hazard analysis",    marks: 5 },
      { item: "Control hazard analysis", marks: 5 },
      { item: "Structural hazards",      marks: 5 },
      { item: "Forwarding & stalls",     marks: 5 },
    ],
    submissions_list: [
      { roll: "20CS012", name: "Sneha Sharma", score: 100, trend: "up",  submitted: "Oct 4", status: "graded" },
      { roll: "20CS028", name: "Arun Kumar",   score: 88,  trend: "up",  submitted: "Oct 5", status: "graded" },
    ],
    created: "Sep 29", posted: true,
  },
  {
    id: 11, courseId: "cs503", title: "Cache Coherence Report",
    type: "Report", due: "4 days", dueDate: "Oct 30", marks: 20,
    submissions: 21, avgScore: null, highest: null, lowest: null,
    status: "grading", week: "W8", unit: "Unit IV",
    desc: "Write an in-depth report on cache coherence protocols: MESI and MOESI. Include timing diagrams and cache state transition examples.",
    rubric: [
      { item: "MESI protocol",     marks: 7 },
      { item: "MOESI protocol",    marks: 7 },
      { item: "Timing diagrams",   marks: 4 },
      { item: "Comparative study", marks: 2 },
    ],
    submissions_list: [
      { roll: "20CS012", name: "Sneha Sharma", score: 0, trend: "up",  submitted: "Oct 26", status: "pending" },
      { roll: "20CS028", name: "Arun Kumar",   score: 0, trend: "up",  submitted: "Oct 25", status: "pending" },
    ],
    created: "Oct 20", posted: true,
  },
  {
    id: 12, courseId: "cs503", title: "ISA Design Project",
    type: "Project", due: "12 days", dueDate: "Nov 7", marks: 30,
    submissions: 0, avgScore: null, highest: null, lowest: null,
    status: "upcoming", week: "W12", unit: "Unit V",
    desc: "Design a minimal ISA for a hypothetical 16-bit RISC processor. Define instruction formats, addressing modes, and write sample assembly programs.",
    rubric: [
      { item: "ISA specification",   marks: 8 },
      { item: "Instruction formats", marks: 8 },
      { item: "Addressing modes",    marks: 7 },
      { item: "Sample programs",     marks: 7 },
    ],
    submissions_list: [],
    created: "Oct 22", posted: false,
  },
];

const TOTAL_PENDING_GRADE = ASSIGNMENTS_RAW.filter(a => a.status === "grading").length;
const TOTAL_LIVE          = ASSIGNMENTS_RAW.filter(a => ["live","grading","upcoming"].includes(a.status)).length;
const TOTAL_DONE          = ASSIGNMENTS_RAW.filter(a => a.status === "done").length;
const TOTAL_SUBMISSIONS   = ASSIGNMENTS_RAW.reduce((a, x) => a + x.submissions, 0);

// ─── ANIMATED BAR ─────────────────────────────────────────────────
function AnimBar({ pct, color, height = 4, delay = 300 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height, background: "var(--surface3)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 2, transition: "width 1.1s ease" }} />
    </div>
  );
}

// ─── CREATE ASSIGNMENT MODAL ──────────────────────────────────────
function CreateModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", courseId: "cs501", type: "Theory",
    week: "W10", unit: "", dueDate: "", marks: 20, desc: "",
    rubric: [{ item: "", marks: 0 }],
    draft: false,
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const addRow = () => setForm(f => ({ ...f, rubric: [...f.rubric, { item: "", marks: 0 }] }));
  const setRubric = (i, k, v) =>
    setForm(f => { const r = [...f.rubric]; r[i] = { ...r[i], [k]: v }; return { ...f, rubric: r }; });
  const delRubric = (i) =>
    setForm(f => ({ ...f, rubric: f.rubric.filter((_, x) => x !== i) }));

  const totalRubric = form.rubric.reduce((s, r) => s + Number(r.marks || 0), 0);
  const canProceed  = form.title.trim() && form.dueDate;
  const cm = COURSES_META[form.courseId];

  return (
    <div className="as-overlay" onClick={onClose}>
      <div className="as-modal" onClick={e => e.stopPropagation()}>

        <div className="as-modal-hd">
          <div className="as-modal-ico"><IcoFile width={14} height={14} style={{ color: "#fff" }} /></div>
          <span className="as-modal-title">Create Assignment</span>
          <button className="as-modal-close" onClick={onClose}><IcoClose width={12} height={12} /></button>
        </div>

        <div className="as-steps">
          {["Details", "Rubric", "Publish"].map((s, i) => (
            <div key={i} className={`as-step ${step === i+1 ? "as-step--active" : ""} ${step > i+1 ? "as-step--done" : ""}`}>
              <div className="as-step-dot">{step > i+1 ? <IcoCheck width={8} height={8}/> : i+1}</div>
              <span>{s}</span>
              {i < 2 && <div className="as-step-line" />}
            </div>
          ))}
        </div>

        <div className="as-modal-body">
          {step === 1 && (
            <>
              <div className="as-form">
                <div className="as-field">
                  <div className="as-field-lbl">Assignment Title *</div>
                  <input className="as-input" value={form.title} placeholder="e.g. Process Scheduling Simulation" onChange={set("title")} />
                </div>
                <div className="as-2col">
                  <div className="as-field">
                    <div className="as-field-lbl">Course *</div>
                    <select className="as-input" value={form.courseId} onChange={set("courseId")}>
                      <option value="cs501">CS501 – Operating Systems</option>
                      <option value="cs502">CS502 – Database Management</option>
                      <option value="cs503">CS503 – Computer Architecture</option>
                    </select>
                  </div>
                  <div className="as-field">
                    <div className="as-field-lbl">Type *</div>
                    <select className="as-input" value={form.type} onChange={set("type")}>
                      {Object.keys(TYPE_META).map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="as-2col">
                  <div className="as-field">
                    <div className="as-field-lbl">Week</div>
                    <select className="as-input" value={form.week} onChange={set("week")}>
                      {Array.from({ length: 16 }, (_, i) => `W${i+1}`).map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                  <div className="as-field">
                    <div className="as-field-lbl">Unit / Module</div>
                    <input className="as-input" value={form.unit} placeholder="e.g. Unit III – Memory Management" onChange={set("unit")} />
                  </div>
                </div>
                <div className="as-2col">
                  <div className="as-field">
                    <div className="as-field-lbl">Due Date *</div>
                    <input className="as-input" type="date" value={form.dueDate} onChange={set("dueDate")} />
                  </div>
                  <div className="as-field">
                    <div className="as-field-lbl">Total Marks</div>
                    <input className="as-input" type="number" value={form.marks} min={5} max={100} onChange={set("marks")} />
                  </div>
                </div>
                <div className="as-field">
                  <div className="as-field-lbl">Description / Instructions</div>
                  <textarea className="as-input as-textarea" rows={4} value={form.desc}
                    placeholder="Describe what students should submit, tools allowed, format requirements…"
                    onChange={set("desc")} />
                </div>
              </div>
              <div className="as-modal-foot">
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button className="btn btn-solid"
                  style={{ opacity: canProceed ? 1 : .45, pointerEvents: canProceed ? "all" : "none" }}
                  onClick={() => setStep(2)}>
                  Next: Rubric <IcoChevR width={10} height={10} />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="as-rubric-info">
                <IcoAlert width={12} height={12} style={{ color: "var(--amber)", flexShrink: 0 }} />
                <span>Rubric total: <strong style={{ color: totalRubric === Number(form.marks) ? "var(--teal)" : "var(--rose)" }}>{totalRubric}</strong> / {form.marks} marks</span>
              </div>
              <div className="as-rubric-list">
                {form.rubric.map((r, i) => (
                  <div key={i} className="as-rubric-row">
                    <span className="as-rubric-idx">{i+1}</span>
                    <input className="as-input as-rubric-item-inp" value={r.item}
                      placeholder={`Criterion ${i+1}…`}
                      onChange={e => setRubric(i, "item", e.target.value)} />
                    <input className="as-input as-rubric-marks-inp" type="number"
                      value={r.marks} min={0} max={100}
                      onChange={e => setRubric(i, "marks", e.target.value)} />
                    <span className="as-rubric-unit">marks</span>
                    {form.rubric.length > 1 && (
                      <button className="as-rubric-del" onClick={() => delRubric(i)}>
                        <IcoClose width={9} height={9} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className="as-add-row-btn" onClick={addRow}>
                <IcoPlus width={11} height={11} /> Add criterion
              </button>
              <div className="as-modal-foot">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-solid" onClick={() => setStep(3)}>
                  Preview <IcoChevR width={10} height={10} />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="as-preview-card" style={{
                borderColor: `rgba(${cm?.rgb},.25)`,
                background: `rgba(${cm?.rgb},.04)`,
              }}>
                <div className="as-preview-top">
                  <div className="as-preview-badges">
                    <span className="as-type-badge" style={{ background: TYPE_META[form.type]?.bg, color: TYPE_META[form.type]?.color }}>
                      {TYPE_META[form.type]?.icon} {form.type}
                    </span>
                    <span className="as-course-chip" style={{ background: cm?.bg, color: cm?.color, borderColor: cm?.border }}>
                      {cm?.code}
                    </span>
                    <span style={{ fontSize: 9.5, color: "var(--text3)", fontWeight: 600 }}>{form.week}{form.unit ? ` · ${form.unit}` : ""}</span>
                  </div>
                  <span className="as-marks-badge">{form.marks} marks</span>
                </div>
                <div className="as-preview-title">{form.title || "Untitled Assignment"}</div>
                <div className="as-preview-desc">{form.desc || "No description provided."}</div>
                <div className="as-preview-meta">
                  <IcoCal width={10} height={10} style={{ color: "var(--text3)" }} />
                  <span>Due: {form.dueDate || "—"}</span>
                  <span>·</span>
                  <IcoUsers width={10} height={10} style={{ color: "var(--text3)" }} />
                  <span>{cm?.total} students</span>
                </div>
                {form.rubric.filter(r => r.item).length > 0 && (
                  <div className="as-preview-rubric">
                    {form.rubric.filter(r => r.item).map((r, i) => (
                      <div key={i} className="as-preview-rubric-row">
                        <span>{r.item}</span>
                        <span style={{ color: cm?.color, fontWeight: 700 }}>{r.marks}m</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="as-notify-row">
                <div className="as-notify-icon"><IcoBrain width={13} height={13} style={{ color: "var(--indigo-ll)" }} /></div>
                <div>
                  <div className="as-notify-lbl">Notify students via AI Mentor</div>
                  <div className="as-notify-sub">Students receive a personalized nudge in their dashboard</div>
                </div>
                <div className="as-toggle as-toggle--on" />
              </div>

              <div className="as-pub-opts">
                <div className={`as-pub-opt ${!form.draft ? "as-pub-opt--active" : ""}`}
                  onClick={() => setForm(f => ({ ...f, draft: false }))}>
                  <div className={`as-pub-radio ${!form.draft ? "as-pub-radio--active" : ""}`} />
                  <div>
                    <div className="as-pub-lbl">Publish Now</div>
                    <div className="as-pub-sub">Visible to all {cm?.total} students immediately</div>
                  </div>
                </div>
                <div className={`as-pub-opt ${form.draft ? "as-pub-opt--active" : ""}`}
                  onClick={() => setForm(f => ({ ...f, draft: true }))}>
                  <div className={`as-pub-radio ${form.draft ? "as-pub-radio--active" : ""}`} />
                  <div>
                    <div className="as-pub-lbl">Save as Draft</div>
                    <div className="as-pub-sub">Not visible to students yet</div>
                  </div>
                </div>
              </div>

              <div className="as-modal-foot">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-solid as-btn-teal" onClick={() => { onCreated?.(); onClose(); }}>
                  <IcoCheck width={12} height={12} /> Create Assignment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL DRAWER ────────────────────────────────────────────────
function DetailDrawer({ assignment, onClose }) {
  const [tab, setTab]           = useState("overview");
  const [subSearch, setSubSearch] = useState("");
  const [subFilter, setSubFilter] = useState("all");
  const [grading, setGrading]   = useState(null);

  if (!assignment) return null;
  const cm = COURSES_META[assignment.courseId];
  const tm = TYPE_META[assignment.type] || TYPE_META.Theory;
  const sm = STATUS_META[assignment.status];
  const subPct = cm ? Math.round((assignment.submissions / cm.total) * 100) : 0;

  const filteredSubs = assignment.submissions_list.filter(s => {
    const q = subSearch.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)) &&
           (subFilter === "all" || s.status === subFilter);
  });

  return (
    <div className="as-overlay as-overlay--drawer" onClick={onClose}>
      <div className="as-drawer" onClick={e => e.stopPropagation()}>

        <div className="as-drawer-hd">
          <button className="as-drawer-back" onClick={onClose}><IcoChevL width={11} height={11}/> Close</button>
          <div className="as-drawer-course" style={{ color: cm?.color }}>{cm?.code} · {assignment.week} · {assignment.unit}</div>
          <div className="as-drawer-title">{assignment.title}</div>
          <div className="as-drawer-badges">
            <span className="as-type-badge" style={{ background: tm.bg, color: tm.color }}>{tm.icon} {assignment.type}</span>
            <span className="as-status-badge" style={{ background: sm?.bg, color: sm?.color, borderColor: sm?.border }}>{sm?.label}</span>
            <span className="as-marks-badge">{assignment.marks} marks</span>
          </div>
        </div>

        <div className="as-drawer-tabs">
          {["overview", "submissions", "rubric"].map(t => (
            <button key={t}
              className={`as-drawer-tab ${tab === t ? "active" : ""}`}
              style={tab === t ? { borderBottomColor: cm?.color, color: cm?.color } : {}}
              onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="as-drawer-body">

          {tab === "overview" && (
            <>
              <p className="as-drawer-desc">{assignment.desc}</p>

              {["grading","done"].includes(assignment.status) && (
                <div className="as-drawer-stats">
                  {[
                    { lbl: "Submitted", val: `${assignment.submissions}/${cm?.total}`, color: "var(--text)" },
                    { lbl: "Avg Score", val: assignment.avgScore != null ? `${assignment.avgScore}%` : "—",
                      color: assignment.avgScore >= 75 ? "var(--teal)" : assignment.avgScore >= 60 ? "var(--amber)" : "var(--rose)" },
                    { lbl: "Highest", val: assignment.highest != null ? `${assignment.highest}%` : "—", color: "var(--teal)" },
                    { lbl: "Lowest",  val: assignment.lowest  != null ? `${assignment.lowest}%`  : "—", color: "var(--rose)" },
                  ].map((s, i) => (
                    <div key={i} className="as-ds">
                      <div className="as-ds-val" style={{ color: s.color }}>{s.val}</div>
                      <div className="as-ds-lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              )}

              {assignment.status !== "upcoming" && (
                <div style={{ marginTop: 14 }}>
                  <div className="as-drawer-sec">Submission Progress</div>
                  <AnimBar pct={subPct} color={cm?.color || "var(--indigo-l)"} height={6} delay={100} />
                  <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 5 }}>
                    {assignment.submissions} of {cm?.total || "?"} submitted ({subPct}%)
                  </div>
                </div>
              )}

              {assignment.avgScore != null && (
                <div style={{ marginTop: 16 }}>
                  <div className="as-drawer-sec">Score Breakdown</div>
                  {[
                    { lbl: "Avg",  pct: assignment.avgScore, color: cm?.color || "var(--indigo-l)" },
                    { lbl: "High", pct: assignment.highest,  color: "var(--teal)"  },
                    { lbl: "Low",  pct: assignment.lowest,   color: "var(--rose)"  },
                    { lbl: "Sub%", pct: subPct,              color: "var(--violet)"},
                  ].map((b, i) => (
                    <div key={i} className="as-score-row">
                      <span className="as-score-lbl">{b.lbl}</span>
                      <div style={{ flex: 1 }}><AnimBar pct={b.pct} color={b.color} height={5} delay={200 + i*80} /></div>
                      <span className="as-score-val" style={{ color: b.color }}>{b.pct}%</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="as-drawer-meta-grid">
                <div className="as-meta-item"><IcoCal  width={12} height={12}/><span>Due: <strong>{assignment.dueDate}</strong></span></div>
                <div className="as-meta-item"><IcoBook width={12} height={12}/><span>Week: <strong>{assignment.week}</strong></span></div>
                <div className="as-meta-item"><IcoStar width={12} height={12}/><span>Marks: <strong>{assignment.marks}</strong></span></div>
                <div className="as-meta-item"><IcoClock width={12} height={12}/><span>Created: <strong>{assignment.created}</strong></span></div>
              </div>

              <div className="as-drawer-actions">
                <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center", gap:5, fontSize:11 }}><IcoPen width={11} height={11}/> Edit</button>
                <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center", gap:5, fontSize:11 }}><IcoCopy width={11} height={11}/> Duplicate</button>
                <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center", gap:5, fontSize:11 }}><IcoLink width={11} height={11}/> Share</button>
              </div>
              <button className="as-danger-btn"><IcoTrash width={11} height={11}/> Delete Assignment</button>
            </>
          )}

          {tab === "submissions" && (
            <>
              <div className="as-sub-toolbar">
                <div className="as-sub-search">
                  <IcoSearch width={11} height={11} style={{ color: "var(--text3)" }} />
                  <input className="as-sub-search-inp" placeholder="Search name or roll…"
                    value={subSearch} onChange={e => setSubSearch(e.target.value)} />
                </div>
                <div className="as-sub-filter-pills">
                  {["all","graded","pending","missing"].map(f => (
                    <button key={f}
                      className={`as-sub-pill ${subFilter === f ? "active" : ""}`}
                      style={subFilter === f ? { borderColor: cm?.border, color: cm?.color, background: cm?.bg } : {}}
                      onClick={() => setSubFilter(f)}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filteredSubs.length === 0 ? (
                <div className="as-empty" style={{ minHeight: 180 }}>
                  <div style={{ fontSize: 34 }}>📭</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 10 }}>No submissions yet</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Due: {assignment.dueDate}</div>
                </div>
              ) : (
                <div className="as-sub-list">
                  {filteredSubs.map((s, i) => (
                    <div key={i} className="as-sub-row">
                      <div className="as-sub-avatar">{s.name.split(" ").map(x=>x[0]).join("")}</div>
                      <div className="as-sub-info">
                        <div className="as-sub-name">{s.name}</div>
                        <div className="as-sub-roll">{s.roll} {s.submitted ? `· Submitted ${s.submitted}` : "· Not submitted"}</div>
                      </div>
                      <div className={`as-sub-status as-ss-${s.status}`}>
                        {s.status === "graded"  ? <><IcoCheck width={10} height={10}/> Graded</> :
                         s.status === "pending" ? <><IcoClock width={10} height={10}/> Pending</> :
                                                  <><IcoAlert width={10} height={10}/> Missing</>}
                      </div>
                      {s.status === "graded" && s.score > 0 ? (
                        <span style={{ fontFamily:"'Fraunces',serif", fontSize:16, color: s.score/assignment.marks>=.8?"var(--teal)":s.score/assignment.marks>=.6?"var(--indigo-ll)":"var(--amber)", fontWeight:700, whiteSpace:"nowrap" }}>
                          {s.score}/{assignment.marks}
                        </span>
                      ) : s.status === "pending" ? (
                        <button className="btn btn-solid" style={{ padding:"4px 12px", fontSize:10, gap:4 }}
                          onClick={() => setGrading(s)}>
                          <IcoPen width={10} height={10}/> Grade
                        </button>
                      ) : (
                        <button className="btn btn-ghost" style={{ padding:"4px 10px", fontSize:10, color:"var(--rose)", borderColor:"rgba(242,68,92,.2)" }}>
                          <IcoAlert width={10} height={10}/> Nudge
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {grading && (
                <div className="as-grader-panel">
                  <div className="as-grader-hd">
                    <span>Grading: <strong style={{ color: cm?.color }}>{grading.name}</strong></span>
                    <button className="as-grader-close" onClick={() => setGrading(null)}><IcoClose width={10} height={10}/></button>
                  </div>
                  {assignment.rubric.map((r, i) => (
                    <div key={i} className="as-grader-row">
                      <span className="as-grader-criterion">{r.item || `Criterion ${i+1}`}</span>
                      <div className="as-grader-input-wrap">
                        <input className="as-grader-input" type="number" min={0} max={r.marks} placeholder="0" />
                        <span>/ {r.marks}</span>
                      </div>
                    </div>
                  ))}
                  <textarea className="as-input as-textarea" rows={2} style={{ marginTop:10 }} placeholder="Feedback comments (optional)…" />
                  <div style={{ display:"flex", gap:8, marginTop:10 }}>
                    <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center", fontSize:11 }} onClick={() => setGrading(null)}>Cancel</button>
                    <button className="btn btn-solid as-btn-teal" style={{ flex:2, justifyContent:"center", fontSize:11 }} onClick={() => setGrading(null)}>
                      <IcoCheck width={11} height={11}/> Submit Grade
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "rubric" && (
            <div className="as-rubric-view">
              <div className="as-rv-header"><span>Criterion</span><span>Marks</span></div>
              {assignment.rubric.map((r, i) => (
                <div key={i} className="as-rv-row">
                  <div className="as-rv-num">{i+1}</div>
                  <div className="as-rv-name">{r.item}</div>
                  <div className="as-rv-marks" style={{ color: cm?.color }}>
                    {r.marks}<span style={{ color:"var(--text3)", fontWeight:400, fontSize:9 }}> m</span>
                  </div>
                  <div style={{ flex:1, paddingRight:10 }}>
                    <AnimBar pct={(r.marks / assignment.marks)*100} color={cm?.color||"var(--indigo-l)"} height={4} delay={200+i*80} />
                  </div>
                </div>
              ))}
              <div className="as-rv-total">
                <span>Total</span>
                <span style={{ color: cm?.color, fontWeight:700 }}>{assignment.marks} marks</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GRID CARD ────────────────────────────────────────────────────
function AssignmentCard({ assignment, onSelect }) {
  const cm = COURSES_META[assignment.courseId];
  const tm = TYPE_META[assignment.type] || TYPE_META.Theory;
  const sm = STATUS_META[assignment.status];
  const subPct = cm ? Math.round((assignment.submissions / cm.total) * 100) : 0;
  const isDraft = assignment.status === "upcoming" && !assignment.posted;

  return (
    <div
      className={`as-card ${assignment.status === "grading" ? "as-card--urgent" : ""} ${isDraft ? "as-card--draft" : ""}`}
      onClick={() => onSelect(assignment)}
    >
      <div className="as-card-accent" style={{ background: cm?.color }} />

      <div className="as-card-hd">
        <div className="as-card-badges">
          <span className="as-type-badge" style={{ background: tm.bg, color: tm.color }}>{tm.icon} {assignment.type}</span>
          {isDraft && <span className="as-draft-badge">Draft</span>}
        </div>
        <span className="as-marks-badge">{assignment.marks}m</span>
      </div>

      <div className="as-card-meta">
        <span className="as-course-chip" style={{ color: cm?.color, background: cm?.bg, borderColor: cm?.border }}>{cm?.code}</span>
        <span className="as-week-chip">{assignment.week}</span>
      </div>

      <div className="as-card-title">{assignment.title}</div>

      {assignment.unit && <div className="as-card-unit">{assignment.unit}</div>}

      <div className="as-card-due-row">
        <div className="as-card-due-info">
          <IcoCal width={9} height={9} style={{ color:"var(--text3)" }} />
          <span>{assignment.status === "done" ? `Due ${assignment.dueDate}` : `Due: ${assignment.due}`}</span>
        </div>
        <span className="as-status-badge" style={{ background:sm?.bg, color:sm?.color, borderColor:sm?.border }}>{sm?.label}</span>
      </div>

      {["grading","done"].includes(assignment.status) && (
        <>
          <div className="as-card-sub-row">
            <span>{assignment.submissions}/{cm?.total} submitted</span>
            <span style={{ color:cm?.color, fontWeight:700 }}>{subPct}%</span>
          </div>
          <AnimBar pct={subPct} color={cm?.color||"var(--indigo-l)"} height={3} delay={500} />
        </>
      )}

      {assignment.status === "live" && (
        <div className="as-card-live-hint">
          <IcoEye width={10} height={10} style={{ color:"var(--indigo-ll)" }} />
          <span>{assignment.submissions > 0 ? `${assignment.submissions} early submissions` : `Open to ${cm?.total} students`}</span>
        </div>
      )}

      {assignment.avgScore != null && (
        <div className="as-card-avg">
          <IcoBar width={10} height={10} style={{ color:"var(--text3)" }} />
          Avg: <span style={{ color: assignment.avgScore>=75?"var(--teal)":assignment.avgScore>=60?"var(--amber)":"var(--rose)", fontWeight:700 }}>
            {assignment.avgScore}%
          </span>
        </div>
      )}

      {assignment.status === "grading" && (
        <button className="as-card-grade-btn" onClick={e => { e.stopPropagation(); onSelect(assignment); }}>
          <IcoPen width={10} height={10} /> Grade Now
          <span className="as-card-grade-count">{cm?.total - assignment.submissions} pending</span>
        </button>
      )}
    </div>
  );
}

// ─── LIST ROW ─────────────────────────────────────────────────────
function AssignmentRow({ assignment, idx, onSelect }) {
  const cm = COURSES_META[assignment.courseId];
  const tm = TYPE_META[assignment.type] || TYPE_META.Theory;
  const sm = STATUS_META[assignment.status];
  const subPct = cm ? Math.round((assignment.submissions / cm.total) * 100) : 0;

  return (
    <div className="as-row" onClick={() => onSelect(assignment)}>
      <span className="as-row-num">{idx+1}</span>
      <div className="as-row-info">
        <div className="as-row-title">{assignment.title}</div>
        <div className="as-row-meta">
          <span style={{ color:cm?.color, fontWeight:700 }}>{cm?.code}</span>
          <span>·</span><span>{assignment.unit || assignment.week}</span>
          <span>·</span><span>Due {assignment.dueDate}</span>
        </div>
      </div>
      <span className="as-type-badge" style={{ background:tm.bg, color:tm.color, flexShrink:0 }}>{tm.icon} {assignment.type}</span>
      <span className="as-marks-badge" style={{ flexShrink:0 }}>{assignment.marks}m</span>
      <div className="as-row-sub-col">
        <AnimBar pct={subPct} color={cm?.color||"var(--indigo-l)"} height={4} delay={300} />
        <span style={{ fontSize:9.5, color:"var(--text3)", marginTop:2 }}>{assignment.submissions}/{cm?.total}</span>
      </div>
      {assignment.avgScore != null
        ? <span className="as-row-avg" style={{ color:assignment.avgScore>=75?"var(--teal)":assignment.avgScore>=60?"var(--amber)":"var(--rose)" }}>{assignment.avgScore}%</span>
        : <span className="as-row-avg" style={{ color:"var(--text3)" }}>—</span>
      }
      <span className="as-status-badge" style={{ background:sm?.bg, color:sm?.color, borderColor:sm?.border, flexShrink:0 }}>{sm?.label}</span>
      <div className="as-row-acts" onClick={e => e.stopPropagation()}>
        <button className="as-icon-btn" title="Edit"><IcoPen width={11} height={11}/></button>
        <button className="as-icon-btn" title="Download"><IcoDownload width={11} height={11}/></button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────
export default function FacultyAssignments({ onBack }) {
  const [activeCourse, setActiveCourse] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeType,   setActiveType]   = useState("all");
  const [viewMode,     setViewMode]     = useState("grid");
  const [search,       setSearch]       = useState("");
  const [sortBy,       setSortBy]       = useState("due");
  const [showCreate,   setShowCreate]   = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [toast,        setToast]        = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const filtered = ASSIGNMENTS_RAW
    .filter(a => activeCourse === "all" || a.courseId === activeCourse)
    .filter(a => activeStatus === "all"  || a.status === activeStatus)
    .filter(a => activeType   === "all"  || a.type   === activeType)
    .filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (COURSES_META[a.courseId]?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "marks") return b.marks - a.marks;
      if (sortBy === "sub")   return b.submissions - a.submissions;
      if (sortBy === "score") return (b.avgScore || 0) - (a.avgScore || 0);
      return a.id - b.id;
    });

  const grading  = filtered.filter(a => a.status === "grading");
  const live     = filtered.filter(a => a.status === "live");
  const upcoming = filtered.filter(a => a.status === "upcoming");
  const done     = filtered.filter(a => a.status === "done");

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") { setShowCreate(false); setSelected(null); } };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  return (
    <div className="as-root">
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={() => showToast("✅ Assignment created successfully!")} />}
      {selected   && <DetailDrawer assignment={selected} onClose={() => setSelected(null)} />}
      {toast      && <div className="as-toast">{toast}</div>}

      {/* PAGE HEADER */}
      <div className="as-page-hd">
        <div>
          <button className="as-back-btn" onClick={onBack}><IcoChevL width={11} height={11}/> Dashboard</button>
          <div className="greet-tag" style={{ marginBottom:8, marginTop:10 }}>
            <div className="greet-pip"/>
            <span className="greet-pip-txt">Semester 5 · Week 11 · {TOTAL_PENDING_GRADE} Pending to Grade</span>
          </div>
          <h1 className="greet-title">Assignments <em>&amp; Grading</em></h1>
          <p className="greet-sub">Create, distribute, and evaluate assignments across all your courses.</p>
        </div>
        <div className="as-hd-right">
          <button className="btn btn-ghost" style={{ gap:6, fontSize:11 }}><IcoDownload width={12} height={12}/> Export</button>
          <button className="btn btn-ghost" style={{ gap:6, fontSize:11 }}><IcoBrain width={12} height={12}/> AI Generate</button>
          <button className="btn btn-solid" style={{ gap:6 }} onClick={() => setShowCreate(true)}>
            <IcoPlus width={12} height={12}/> New Assignment
          </button>
        </div>
      </div>

      {/* STAT STRIP */}
      <div className="as-stat-strip">
        {[
          { cls:"sc-rose",   icon:<IcoPen   width={17} height={17}/>, val:TOTAL_PENDING_GRADE, lbl:"Pending Grading"  },
          { cls:"sc-indigo", icon:<IcoFile  width={17} height={17}/>, val:TOTAL_LIVE,          lbl:"Active/Upcoming"  },
          { cls:"sc-teal",   icon:<IcoCheck width={17} height={17}/>, val:TOTAL_DONE,          lbl:"Fully Graded"     },
          { cls:"sc-violet", icon:<IcoUsers width={17} height={17}/>, val:TOTAL_SUBMISSIONS,   lbl:"Total Submitted"  },
          { cls:"sc-amber",  icon:<IcoBar   width={17} height={17}/>, val:"74%",               lbl:"Avg Class Score"  },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.cls}`} style={{ cursor:"default" }}>
            <div className="stat-ic">{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* COURSE TABS */}
      <div className="as-course-tabs">
        <button
          className={`as-ctab ${activeCourse === "all" ? "as-ctab--active" : ""}`}
          style={activeCourse === "all" ? { borderColor:"rgba(91,78,248,.2)", color:"var(--indigo-l)", background:"rgba(91,78,248,.1)" } : {}}
          onClick={() => setActiveCourse("all")}>
          <span className="as-ctab-dot" style={{ background:"var(--indigo-l)" }}/>
          All Courses
          <span className="as-ctab-count">{ASSIGNMENTS_RAW.length}</span>
        </button>
        {Object.entries(COURSES_META).map(([id, cm]) => (
          <button key={id}
            className={`as-ctab ${activeCourse === id ? "as-ctab--active" : ""}`}
            style={activeCourse === id ? { borderColor:cm.border, color:cm.color, background:cm.bg } : {}}
            onClick={() => setActiveCourse(id)}>
            <span className="as-ctab-dot" style={{ background:cm.color }}/>
            {cm.code}
            <span className="as-ctab-count">{ASSIGNMENTS_RAW.filter(a => a.courseId === id).length}</span>
          </button>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="as-toolbar">
        <div className="as-search">
          <IcoSearch width={12} height={12} style={{ color:"var(--text3)", flexShrink:0 }}/>
          <input className="as-search-inp" value={search} placeholder="Search assignments, type, course…"
            onChange={e => setSearch(e.target.value)} />
          {search && <button className="as-search-clear" onClick={() => setSearch("")}><IcoClose width={9} height={9}/></button>}
        </div>
        <div className="as-toolbar-right">
          <select className="as-select" value={activeStatus} onChange={e => setActiveStatus(e.target.value)}>
            <option value="all">All Status</option>
            {Object.entries(STATUS_META).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="as-select" value={activeType} onChange={e => setActiveType(e.target.value)}>
            <option value="all">All Types</option>
            {Object.keys(TYPE_META).map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="as-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="due">Due Date</option>
            <option value="marks">Marks ↓</option>
            <option value="sub">Submissions ↓</option>
            <option value="score">Avg Score ↓</option>
          </select>
          <div className="as-view-toggle">
            <button className={`as-vbtn ${viewMode==="grid"?"as-vbtn--active":""}`} onClick={() => setViewMode("grid")} title="Grid"><IcoGrid width={12} height={12}/></button>
            <button className={`as-vbtn ${viewMode==="list"?"as-vbtn--active":""}`} onClick={() => setViewMode("list")} title="List"><IcoList width={12} height={12}/></button>
          </div>
        </div>
      </div>

      {/* RESULTS BAR */}
      <div className="as-results-bar">
        <span style={{ color:"var(--rose)", fontWeight:700 }}>{grading.length}</span> grading ·{" "}
        <span style={{ color:"var(--indigo-ll)", fontWeight:700 }}>{live.length + upcoming.length}</span> active ·{" "}
        <span style={{ color:"var(--teal)", fontWeight:700 }}>{done.length}</span> done ·{" "}
        {filtered.length} total
      </div>

      {/* EMPTY */}
      {filtered.length === 0 && (
        <div className="as-empty">
          <div style={{ fontSize:44 }}>📂</div>
          <div style={{ fontSize:16, fontWeight:600, marginTop:14 }}>No assignments found</div>
          <div style={{ fontSize:12, color:"var(--text3)", marginTop:6 }}>Try a different filter or search term</div>
          <button className="btn btn-solid" style={{ marginTop:16, gap:6 }} onClick={() => setShowCreate(true)}>
            <IcoPlus width={12} height={12}/> Create Assignment
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && filtered.length > 0 && (
        <>
          {grading.length > 0 && (
            <>
              <div className="as-section-lbl">
                <IcoPen width={13} height={13} style={{ color:"var(--rose)" }}/> Needs Grading
                <span className="as-sec-count as-sec-count--rose">{grading.length}</span>
              </div>
              <div className="as-grid">{grading.map(a => <AssignmentCard key={a.id} assignment={a} onSelect={setSelected}/>)}</div>
            </>
          )}
          {live.length > 0 && (
            <>
              <div className="as-section-lbl" style={{ marginTop:22 }}>
                <IcoEye width={13} height={13} style={{ color:"var(--indigo-ll)" }}/> Live — Open for Submission
                <span className="as-sec-count">{live.length}</span>
              </div>
              <div className="as-grid">{live.map(a => <AssignmentCard key={a.id} assignment={a} onSelect={setSelected}/>)}</div>
            </>
          )}
          {upcoming.length > 0 && (
            <>
              <div className="as-section-lbl" style={{ marginTop:22 }}>
                <IcoCal width={13} height={13} style={{ color:"var(--amber)" }}/> Upcoming / Draft
                <span className="as-sec-count as-sec-count--amber">{upcoming.length}</span>
              </div>
              <div className="as-grid">{upcoming.map(a => <AssignmentCard key={a.id} assignment={a} onSelect={setSelected}/>)}</div>
            </>
          )}
          {done.length > 0 && (
            <>
              <div className="as-section-lbl" style={{ marginTop:22 }}>
                <IcoCheck width={13} height={13} style={{ color:"var(--teal)" }}/> Completed
                <span className="as-sec-count as-sec-count--teal">{done.length}</span>
              </div>
              <div className="as-grid">{done.map(a => <AssignmentCard key={a.id} assignment={a} onSelect={setSelected}/>)}</div>
            </>
          )}
        </>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && filtered.length > 0 && (
        <div className="panel as-list-panel">
          <div className="as-list-head">
            <span>#</span><span>Assignment</span><span>Type</span>
            <span>Marks</span><span>Submissions</span><span>Avg Score</span>
            <span>Status</span><span></span>
          </div>
          {filtered.map((a, i) => <AssignmentRow key={a.id} assignment={a} idx={i} onSelect={setSelected}/>)}
        </div>
      )}

      {/* CTA BANNER */}
      {TOTAL_PENDING_GRADE > 0 && (
        <div className="as-cta-banner">
          <IcoPen width={16} height={16} style={{ color:"var(--rose)", flexShrink:0 }}/>
          <div>
            <div className="as-cta-title">{TOTAL_PENDING_GRADE} assignment{TOTAL_PENDING_GRADE > 1 ? "s" : ""} are waiting to be graded</div>
            <div className="as-cta-sub">Grade submissions and share feedback with students.</div>
          </div>
          <button className="btn btn-solid" style={{ marginLeft:"auto", flexShrink:0, gap:6, background:"var(--rose)", boxShadow:"0 0 18px rgba(242,68,92,.3)" }}>
            <IcoPen width={12} height={12}/> Grade Now
          </button>
        </div>
      )}
    </div>
  );
}