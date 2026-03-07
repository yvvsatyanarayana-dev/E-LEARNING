// facultyMyCourses.jsx
// My Courses module — import into StudentDashboard.jsx
// Uses CSS variables from StudentDashboard.css + facultyMyCourses.css

import { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown,
  BookOpen, PlayCircle, Code2, FileText, HelpCircle,
  Clock, CheckCircle2, Lock, Star, Search, LayoutGrid,
  List, X, Bot, Flame, TrendingUp, AlertTriangle,
  Target, Award, BarChart2, Users, BookMarked, Layers,
  ArrowRight, CircleAlert, Sparkles, CalendarClock, Activity
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────
const COURSES = [
  {
    id: "os",
    code: "CS501",
    name: "Operating Systems",
    short: "OS",
    faculty: "Dr. R. Sharma",
    semester: 5,
    color: "var(--indigo-l)",
    colorRgb: "91,78,248",
    credits: 4,
    progress: 72,
    attendance: 88,
    score: 84,
    rating: 4.8,
    totalLectures: 42,
    watchedLectures: 30,
    totalModules: 8,
    completedModules: 6,
    nextDeadline: { label: "Assignment 3", due: "2 days" },
    tags: ["Theory", "Lab"],
    streak: 5,
    modules: [
      { name: "Introduction & History",       type: "video",  duration: "38m", done: true  },
      { name: "Process Management",           type: "video",  duration: "52m", done: true  },
      { name: "Process Scheduling",           type: "quiz",   duration: "20m", done: true,  score: 92 },
      { name: "Memory Management",            type: "video",  duration: "44m", done: true  },
      { name: "Virtual Memory & Paging",      type: "pdf",    duration: "—",   done: true  },
      { name: "File System Internals",        type: "video",  duration: "48m", done: true  },
      { name: "Deadlocks & Synchronization",  type: "coding", duration: "1h",  done: false },
      { name: "I/O Systems & Drivers",        type: "video",  duration: "40m", done: false, locked: true },
    ],
    recentActivity: [
      { action: "Watched 'File System Internals'",   when: "Today, 10:22 AM" },
      { action: "Scored 92% in Process Scheduling",  when: "Yesterday"       },
      { action: "Downloaded Memory Mgmt notes",      when: "3 days ago"      },
    ],
  },
  {
    id: "dbms",
    code: "CS502",
    name: "Database Management Systems",
    short: "DBMS",
    faculty: "Prof. A. Verma",
    semester: 5,
    color: "var(--teal)",
    colorRgb: "20,184,166",
    credits: 4,
    progress: 58,
    attendance: 76,
    score: 78,
    rating: 4.5,
    totalLectures: 36,
    watchedLectures: 21,
    totalModules: 7,
    completedModules: 4,
    nextDeadline: { label: "Quiz 4 — Transactions", due: "Tomorrow" },
    tags: ["Theory", "Lab"],
    streak: 3,
    modules: [
      { name: "Relational Model & SQL Basics", type: "video",  duration: "45m", done: true  },
      { name: "ER Diagrams",                   type: "video",  duration: "38m", done: true  },
      { name: "Normalization (1NF–BCNF)",      type: "quiz",   duration: "25m", done: true,  score: 85 },
      { name: "Transactions & ACID",           type: "video",  duration: "50m", done: true  },
      { name: "Indexing & Hashing",            type: "pdf",    duration: "—",   done: false },
      { name: "Query Optimization",            type: "coding", duration: "1h",  done: false },
      { name: "NoSQL & MongoDB",               type: "video",  duration: "42m", done: false, locked: true },
    ],
    recentActivity: [
      { action: "Started 'Indexing & Hashing'",     when: "Today, 8:15 AM" },
      { action: "Scored 85% in Normalization quiz", when: "3 days ago"     },
      { action: "Watched 'Transactions & ACID'",    when: "4 days ago"     },
    ],
  },
  {
    id: "ml",
    code: "CS503",
    name: "Machine Learning",
    short: "ML",
    faculty: "Dr. P. Nair",
    semester: 5,
    color: "var(--amber)",
    colorRgb: "245,158,11",
    credits: 3,
    progress: 44,
    attendance: 81,
    score: 68,
    rating: 4.7,
    totalLectures: 30,
    watchedLectures: 13,
    totalModules: 9,
    completedModules: 4,
    nextDeadline: { label: "Project Proposal", due: "5 days" },
    tags: ["Theory", "Project"],
    streak: 1,
    modules: [
      { name: "Intro to ML & Statistics",       type: "video",  duration: "40m",  done: true  },
      { name: "Linear Regression",              type: "video",  duration: "55m",  done: true  },
      { name: "Linear Regression Quiz",         type: "quiz",   duration: "20m",  done: true,  score: 71 },
      { name: "Logistic Regression",            type: "video",  duration: "48m",  done: true  },
      { name: "SVM & Kernels",                  type: "video",  duration: "52m",  done: false },
      { name: "Decision Trees & Random Forest", type: "pdf",    duration: "—",    done: false },
      { name: "Clustering (K-Means, DBSCAN)",   type: "coding", duration: "1.5h", done: false },
      { name: "Neural Network Foundations",     type: "video",  duration: "1h",   done: false, locked: true },
      { name: "Project: End-to-End Pipeline",   type: "coding", duration: "—",    done: false, locked: true },
    ],
    recentActivity: [
      { action: "Watched 'Logistic Regression'",   when: "Yesterday"  },
      { action: "Scored 71% in Linear Regression", when: "1 week ago" },
      { action: "Enrolled in ML",                  when: "Week 1"     },
    ],
  },
  {
    id: "cn",
    code: "CS504",
    name: "Computer Networks",
    short: "CN",
    faculty: "Prof. K. Rao",
    semester: 5,
    color: "var(--violet)",
    colorRgb: "139,92,246",
    credits: 4,
    progress: 81,
    attendance: 84,
    score: 82,
    rating: 4.3,
    totalLectures: 38,
    watchedLectures: 31,
    totalModules: 7,
    completedModules: 6,
    nextDeadline: { label: "Lab Report 4", due: "4 days" },
    tags: ["Theory", "Lab"],
    streak: 7,
    modules: [
      { name: "OSI & TCP/IP Models",            type: "video",  duration: "42m", done: true  },
      { name: "Physical & Data Link Layer",     type: "video",  duration: "50m", done: true  },
      { name: "OSI Layers Quiz",                type: "quiz",   duration: "20m", done: true,  score: 78 },
      { name: "Network Layer & Routing",        type: "video",  duration: "55m", done: true  },
      { name: "Transport Layer",                type: "video",  duration: "48m", done: true  },
      { name: "Application Layer Protocols",    type: "pdf",    duration: "—",   done: true  },
      { name: "Network Security Lab",           type: "coding", duration: "1h",  done: false },
    ],
    recentActivity: [
      { action: "Completed 'Application Layer Protocols'", when: "Today, 9:00 AM" },
      { action: "Watched 'Transport Layer'",               when: "2 days ago"     },
      { action: "Scored 78% in OSI Layers quiz",          when: "1 week ago"     },
    ],
  },
  {
    id: "crypto",
    code: "CS505",
    name: "Cryptography & Network Security",
    short: "Crypto",
    faculty: "Dr. S. Mehta",
    semester: 5,
    color: "var(--rose)",
    colorRgb: "244,63,94",
    credits: 3,
    progress: 33,
    attendance: 71,
    score: 58,
    rating: 4.1,
    totalLectures: 28,
    watchedLectures: 9,
    totalModules: 8,
    completedModules: 2,
    nextDeadline: { label: "Assignment 2 — RSA", due: "3 days" },
    tags: ["Theory"],
    streak: 0,
    modules: [
      { name: "Intro to Cryptography",      type: "video",  duration: "35m", done: true  },
      { name: "Classical Ciphers",          type: "video",  duration: "40m", done: true  },
      { name: "Symmetric Key Systems Quiz", type: "quiz",   duration: "20m", done: false },
      { name: "DES & AES Deep Dive",        type: "video",  duration: "55m", done: false },
      { name: "RSA & Public Key Crypto",    type: "pdf",    duration: "—",   done: false },
      { name: "Hash Functions",             type: "video",  duration: "45m", done: false, locked: true },
      { name: "Digital Signatures",         type: "coding", duration: "1h",  done: false, locked: true },
      { name: "PKI & Certificates",         type: "video",  duration: "40m", done: false, locked: true },
    ],
    recentActivity: [
      { action: "Watched 'Classical Ciphers'",      when: "3 days ago" },
      { action: "Started 'Symmetric Key Quiz'",     when: "5 days ago" },
      { action: "Watched 'Intro to Cryptography'",  when: "1 week ago" },
    ],
  },
];

const UPCOMING_DEADLINES = [
  { course: "DBMS",   label: "Quiz 4 — Transactions",  due: "Tomorrow", color: "var(--teal)",     urgent: true  },
  { course: "Crypto", label: "Assignment 2 — RSA",      due: "3 days",   color: "var(--rose)",     urgent: true  },
  { course: "CN",     label: "Lab Report 4",            due: "4 days",   color: "var(--violet)",   urgent: false },
  { course: "ML",     label: "Project Proposal",        due: "5 days",   color: "var(--amber)",    urgent: false },
  { course: "OS",     label: "Assignment 3",            due: "6 days",   color: "var(--indigo-l)", urgent: false },
];

const FILTER_TABS = ["All Courses", "In Progress", "Completed", "Bookmarked"];

const TYPE_META = {
  video:  { Icon: PlayCircle, label: "Video",    bg: "rgba(91,78,248,.15)",  color: "var(--indigo-ll)" },
  quiz:   { Icon: HelpCircle, label: "Quiz",     bg: "rgba(20,184,166,.15)", color: "var(--teal)"      },
  pdf:    { Icon: FileText,   label: "Material", bg: "rgba(245,158,11,.15)", color: "var(--amber)"     },
  coding: { Icon: Code2,      label: "Lab",      bg: "rgba(139,92,246,.15)", color: "var(--violet)"    },
};

// ─── HELPERS ─────────────────────────────────────────────────────
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

function RadialProgress({ pct, color, size = 52, stroke = 5 }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.16,1,.3,1)" }} />
    </svg>
  );
}

function StarRating({ rating }) {
  return (
    <span className="mc-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={11}
          fill={i <= Math.round(rating) ? "var(--amber)" : "none"}
          stroke={i <= Math.round(rating) ? "var(--amber)" : "var(--surface3)"}
          strokeWidth={1.5}
        />
      ))}
      <span className="mc-rating-val">{rating}</span>
    </span>
  );
}

// ─── COURSE CARD (Grid) ───────────────────────────────────────────
function CourseCard({ course, onOpen }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`mc-card ${hovered ? "mc-card--hover" : ""}`}
      style={{ "--card-color": course.color, "--card-rgb": course.colorRgb }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(course)}
    >
      <div className="mc-card-glow" />

      <div className="mc-card-top">
        <div className="mc-card-badge">
          <span className="mc-card-code">{course.code}</span>
          <span className="mc-card-sem">Sem {course.semester}</span>
        </div>
        <div className="mc-card-radial">
          <RadialProgress pct={course.progress} color={course.color} size={50} stroke={5} />
          <span className="mc-card-radial-val">{course.progress}%</span>
        </div>
      </div>

      <div className="mc-card-short" style={{ color: course.color }}>{course.short}</div>
      <div className="mc-card-name">{course.name}</div>
      <div className="mc-card-faculty">{course.faculty}</div>

      <div className="mc-card-tags">
        {course.tags.map(t => <span key={t} className="mc-tag">{t}</span>)}
        <span className="mc-tag mc-tag--credit">{course.credits} cr</span>
      </div>

      <div className="mc-card-stats">
        <div className="mc-cs-item">
          <span className="mc-cs-val" style={{ color: course.color }}>{course.score}%</span>
          <span className="mc-cs-lbl">Score</span>
        </div>
        <div className="mc-cs-sep" />
        <div className="mc-cs-item">
          <span className="mc-cs-val" style={{ color: course.attendance >= 85 ? "var(--teal)" : course.attendance >= 75 ? "var(--amber)" : "var(--rose)" }}>
            {course.attendance}%
          </span>
          <span className="mc-cs-lbl">Attend.</span>
        </div>
        <div className="mc-cs-sep" />
        <div className="mc-cs-item">
          <span className="mc-cs-val">{course.completedModules}/{course.totalModules}</span>
          <span className="mc-cs-lbl">Modules</span>
        </div>
      </div>

      <div className="mc-card-prog">
        <AnimBar pct={course.progress} color={course.color} height={4} delay={600} />
      </div>

      {course.nextDeadline && (
        <div className="mc-card-deadline">
          <AlertTriangle size={12} style={{ color: "var(--amber)", flexShrink: 0 }} />
          <span>{course.nextDeadline.label} · <em>{course.nextDeadline.due}</em></span>
        </div>
      )}

      {course.streak > 0 && (
        <div className="mc-card-streak">
          <Flame size={12} style={{ color: "var(--amber)" }} />
          <span>{course.streak}-day streak</span>
        </div>
      )}

      <button className="mc-card-cta" style={{ background: course.color }}>
        Continue <ArrowRight size={12} />
      </button>
    </div>
  );
}

// ─── COURSE ROW (List) ────────────────────────────────────────────
function CourseRow({ course, onOpen }) {
  return (
    <div className="mc-row" onClick={() => onOpen(course)}
      style={{ "--card-color": course.color, "--card-rgb": course.colorRgb }}>
      <div className="mc-row-left">
        <div className="mc-row-icon"
          style={{ background: `rgba(${course.colorRgb},.12)`, borderColor: `rgba(${course.colorRgb},.22)` }}>
          <BookOpen size={18} style={{ color: course.color }} />
        </div>
        <div className="mc-row-info">
          <div className="mc-row-name">{course.name}</div>
          <div className="mc-row-meta">
            <span style={{ color: course.color }}>{course.code}</span>
            <span className="mc-row-dot" />
            <span>{course.faculty}</span>
            <span className="mc-row-dot" />
            <span>{course.credits} credits</span>
          </div>
        </div>
      </div>
      <div className="mc-row-stats">
        <div className="mc-row-stat">
          <span className="mc-row-stat-val" style={{ color: course.color }}>{course.progress}%</span>
          <span className="mc-row-stat-lbl">Progress</span>
        </div>
        <div className="mc-row-stat">
          <span className="mc-row-stat-val">{course.score}%</span>
          <span className="mc-row-stat-lbl">Score</span>
        </div>
        <div className="mc-row-stat">
          <span className="mc-row-stat-val"
            style={{ color: course.attendance >= 85 ? "var(--teal)" : course.attendance >= 75 ? "var(--amber)" : "var(--rose)" }}>
            {course.attendance}%
          </span>
          <span className="mc-row-stat-lbl">Attend.</span>
        </div>
        <div className="mc-row-prog">
          <AnimBar pct={course.progress} color={course.color} height={5} delay={300} />
        </div>
      </div>
      <button className="mc-row-btn">Open <ChevronRight size={12} /></button>
    </div>
  );
}

// ─── COURSE DETAIL VIEW ───────────────────────────────────────────
function CourseDetail({ course, onBack }) {
  const [moduleExpanded, setModuleExpanded] = useState(null);
  const completedCount = course.modules.filter(m => m.done).length;

  return (
    <div className="mc-detail">

      {/* ── Header ── */}
      <div className="mcd-header" style={{ "--card-color": course.color, "--card-rgb": course.colorRgb }}>
        <div className="mcd-header-bg" />
        <div className="mcd-header-inner">
          <button className="san-back-btn" onClick={onBack}>
            <ChevronLeft size={13} /> My Courses
          </button>
          <div className="mcd-title-row">
            <div>
              <div className="mcd-code" style={{ color: course.color }}>
                {course.code} · Semester {course.semester}
              </div>
              <h2 className="mcd-title">{course.name}</h2>
              <div className="mcd-faculty">{course.faculty} · {course.credits} Credits</div>
              <StarRating rating={course.rating} />
            </div>
            <div className="mcd-radial-wrap">
              <RadialProgress pct={course.progress} color={course.color} size={90} stroke={8} />
              <div className="mcd-radial-label">
                <span className="mcd-r-pct" style={{ color: course.color }}>{course.progress}%</span>
                <span className="mcd-r-sub">Complete</span>
              </div>
            </div>
          </div>
          <div className="mcd-kpi-strip">
            {[
              { val: `${course.watchedLectures}/${course.totalLectures}`, lbl: "Lectures watched" },
              { val: `${completedCount}/${course.modules.length}`,        lbl: "Modules done"     },
              { val: `${course.score}%`,         lbl: "Current score",  color: course.color },
              { val: `${course.attendance}%`,    lbl: "Attendance",     color: course.attendance >= 75 ? "var(--teal)" : "var(--rose)" },
              { val: course.streak > 0 ? `${course.streak} 🔥` : "—",  lbl: "Day streak" },
            ].map(({ val, lbl, color }) => (
              <div key={lbl} className="mcd-kpi">
                <span className="mcd-kpi-val" style={color ? { color } : {}}>{val}</span>
                <span className="mcd-kpi-lbl">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mcd-body">
        <div className="mcd-main">

          {/* Progress */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-hd">
              <div className="panel-ttl">
                <TrendingUp size={14} style={{ color: "var(--indigo-ll)" }} />
                Overall Progress
              </div>
            </div>
            <div className="panel-body">
              <div style={{ marginBottom: 8 }}>
                <AnimBar pct={course.progress} color={course.color} height={8} delay={300} />
              </div>
              <div className="mcd-prog-labels">
                <span style={{ color: course.color }}>{course.progress}% complete</span>
                <span style={{ color: "var(--text3)" }}>{100 - course.progress}% remaining</span>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="panel">
            <div className="panel-hd">
              <div className="panel-ttl">
                <Layers size={14} style={{ color: "var(--indigo-ll)" }} />
                Course Modules
                <span>{completedCount}/{course.modules.length} completed</span>
              </div>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <div className="mcd-modules">
                {course.modules.map((mod, i) => {
                  const { Icon: ModIcon, label, bg, color: typeColor } = TYPE_META[mod.type];
                  const isExpanded = moduleExpanded === i;
                  return (
                    <div key={i} className={`mcd-mod ${mod.done ? "done" : ""} ${mod.locked ? "locked" : ""}`}>
                      <div className="mcd-mod-row"
                        onClick={() => !mod.locked && setModuleExpanded(isExpanded ? null : i)}>
                        <div className="mcd-mod-status">
                          {mod.done
                            ? <div className="mcd-mod-check" style={{ background: course.color }}>
                                <CheckCircle2 size={13} color="#fff" />
                              </div>
                            : mod.locked
                            ? <div className="mcd-mod-lock"><Lock size={11} style={{ color: "var(--text3)" }} /></div>
                            : <div className="mcd-mod-num">{i + 1}</div>
                          }
                        </div>
                        <div className="mcd-mod-icon" style={{ background: bg }}>
                          <ModIcon size={14} style={{ color: typeColor }} />
                        </div>
                        <div className="mcd-mod-info">
                          <div className="mcd-mod-name">{mod.name}</div>
                          <div className="mcd-mod-meta">
                            <span className="mcd-mod-type" style={{ color: typeColor, background: bg }}>{label}</span>
                            {mod.duration !== "—" && (
                              <span className="mcd-mod-dur"><Clock size={10} />{mod.duration}</span>
                            )}
                            {mod.score !== undefined && (
                              <span className="mcd-mod-score"
                                style={{ color: mod.score >= 80 ? "var(--teal)" : mod.score >= 65 ? "var(--amber)" : "var(--rose)" }}>
                                Score: {mod.score}%
                              </span>
                            )}
                          </div>
                        </div>
                        {!mod.locked
                          ? <ChevronDown size={13} style={{ color: "var(--text3)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .2s ease", flexShrink: 0 }} />
                          : <Lock size={12} style={{ color: "var(--text3)", flexShrink: 0 }} />
                        }
                      </div>
                      {isExpanded && !mod.locked && (
                        <div className="mcd-mod-expand">
                          <div className="mcd-mod-actions">
                            {mod.type === "video"  && <button className="mcd-action-btn primary" style={{ "--btn-color": course.color }}><PlayCircle size={13} />Watch Lecture</button>}
                            {mod.type === "quiz"   && <button className="mcd-action-btn primary" style={{ "--btn-color": course.color }}><HelpCircle size={13} />{mod.done ? "Retake Quiz" : "Start Quiz"}</button>}
                            {mod.type === "pdf"    && <button className="mcd-action-btn primary" style={{ "--btn-color": course.color }}><FileText size={13} />View Material</button>}
                            {mod.type === "coding" && <button className="mcd-action-btn primary" style={{ "--btn-color": course.color }}><Code2 size={13} />Open Lab</button>}
                            <button className="mcd-action-btn secondary"><Bot size={13} />Ask AI Mentor</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ── Detail Sidebar ── */}
        <div className="mcd-sidebar">
          {course.nextDeadline && (
            <div className="panel mcd-deadline-panel" style={{ borderColor: `rgba(${course.colorRgb},.18)` }}>
              <div className="panel-body">
                <div className="mcd-dl-label">
                  <AlertTriangle size={13} style={{ color: "var(--amber)" }} />
                  Upcoming Deadline
                </div>
                <div className="mcd-dl-name">{course.nextDeadline.label}</div>
                <div className="mcd-dl-due" style={{ color: "var(--amber)" }}>Due in {course.nextDeadline.due}</div>
              </div>
            </div>
          )}

          <div className="panel mcd-ai-panel">
            <div className="panel-body">
              <div className="mcd-ai-title">
                <Bot size={15} style={{ color: "var(--indigo-ll)" }} /> AI Mentor
              </div>
              <div className="mcd-ai-sub">Ask questions about this course</div>
              <button className="mcd-ai-btn" style={{ "--btn-color": course.color }}>Open AI Chat</button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-hd">
              <div className="panel-ttl">
                <Activity size={14} style={{ color: "var(--indigo-ll)" }} />
                Recent Activity
              </div>
            </div>
            <div className="panel-body" style={{ paddingTop: 8 }}>
              <div className="mcd-activity">
                {course.recentActivity.map((a, i) => (
                  <div key={i} className="mcd-act-item">
                    <div className="mcd-act-dot" style={{ background: course.color }} />
                    <div>
                      <div className="mcd-act-text">{a.action}</div>
                      <div className="mcd-act-when">{a.when}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUMMARY KPI STRIP ────────────────────────────────────────────
function SummaryStrip() {
  const totalCredits = COURSES.reduce((a, c) => a + c.credits, 0);
  const avgProgress  = Math.round(COURSES.reduce((a, c) => a + c.progress, 0) / COURSES.length);
  const avgScore     = Math.round(COURSES.reduce((a, c) => a + c.score, 0) / COURSES.length);
  const atRisk       = COURSES.filter(c => c.attendance < 75).length;

  return (
    <div className="san-kpi-grid" style={{ marginBottom: 16 }}>
      {[
        { cls: "sc-indigo", val: COURSES.length,    lbl: "Enrolled Courses",  sub: `${totalCredits} total credits`,          Icon: BookMarked  },
        { cls: "sc-teal",   val: `${avgProgress}%`, lbl: "Avg Progress",      sub: "Across all courses",                     Icon: TrendingUp  },
        { cls: "sc-amber",  val: `${avgScore}%`,    lbl: "Avg Quiz Score",    sub: "All assessments",                        Icon: BarChart2   },
        { cls: "sc-violet", val: atRisk,             lbl: "At-Risk Attend.",  sub: atRisk > 0 ? "Below 75%" : "All safe 🎉", Icon: Users       },
      ].map(({ cls, val, lbl, sub, Icon }) => (
        <div key={lbl} className={`san-kpi-card ${cls}`}>
          <div className="mc-kpi-icon">
            <Icon size={13} style={{ opacity: .55 }} />
          </div>
          <div className="san-kpi-val">{val}</div>
          <div className="san-kpi-lbl">{lbl}</div>
          <span className="mc-kpi-sub">{sub}</span>
        </div>
      ))}
    </div>
  );
}

// ─── DEADLINES PANEL ─────────────────────────────────────────────
function DeadlinesPanel() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <div className="panel-ttl">
          <CalendarClock size={14} style={{ color: "var(--amber)" }} />
          Upcoming Deadlines
          <span>{UPCOMING_DEADLINES.length} this week</span>
        </div>
      </div>
      <div className="panel-body" style={{ padding: 0 }}>
        {UPCOMING_DEADLINES.map((d, i) => (
          <div key={i} className={`mc-dl-row ${d.urgent ? "urgent" : ""}`}>
            <div className="mc-dl-dot" style={{ background: d.color }} />
            <div className="mc-dl-info">
              <span className="mc-dl-course" style={{ color: d.color }}>{d.course}</span>
              <span className="mc-dl-label">{d.label}</span>
            </div>
            <span className={`mc-dl-due ${d.urgent ? "urgent" : ""}`}>{d.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────
export default function facultyMyCourses({ onBack }) {
  const [filterTab,  setFilterTab]  = useState("All Courses");
  const [viewMode,   setViewMode]   = useState("grid");
  const [search,     setSearch]     = useState("");
  const [openCourse, setOpenCourse] = useState(null);

  const filtered = COURSES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.code.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filterTab === "In Progress") return c.progress > 0 && c.progress < 100;
    if (filterTab === "Completed")   return c.progress === 100;
    return true;
  });

  if (openCourse) {
    return <CourseDetail course={openCourse} onBack={() => setOpenCourse(null)} />;
  }

  return (
    <div className="mc-root">

      {/* ── Page Header ── */}
      <div className="san-page-hd">
        <div className="san-back-row">
          <button className="san-back-btn" onClick={onBack}>
            <ChevronLeft size={13} /> Dashboard
          </button>
          <div className="san-breadcrumb">
            <span>Dashboard</span>
            <ChevronRight size={11} style={{ color: "var(--text3)" }} />
            <span className="san-bc-active">My Courses</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
          <div>
            <div className="greet-tag" style={{ marginBottom: 8 }}>
              <div className="greet-pip" />
              <span className="greet-pip-txt">Semester 5 · Week 11 · {COURSES.length} Enrolled Courses</span>
            </div>
            <h1 className="greet-title">My <em>Courses</em></h1>
            <p className="greet-sub">Track your enrolled courses, modules, attendance, and upcoming assessments.</p>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <SummaryStrip />

      {/* ── Toolbar ── */}
      <div className="mc-toolbar">
        <div className="mc-filter-tabs">
          {FILTER_TABS.map(t => (
            <button key={t} className={`mc-filter-tab ${filterTab === t ? "active" : ""}`}
              onClick={() => setFilterTab(t)}>{t}</button>
          ))}
        </div>
        <div className="mc-toolbar-right">
          <div className="mc-search-wrap">
            <Search size={13} style={{ color: "var(--text3)", flexShrink: 0 }} />
            <input className="mc-search" placeholder="Search courses…"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button className="mc-search-clear" onClick={() => setSearch("")}>
                <X size={13} />
              </button>
            )}
          </div>
          <div className="mc-view-toggle">
            <button className={`mc-view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
              <LayoutGrid size={13} />
            </button>
            <button className={`mc-view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
              <List size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="mc-main-layout">
        <div className="mc-courses-area">
          {filtered.length === 0 ? (
            <div className="mc-empty">
              <BookOpen size={32} style={{ color: "var(--text3)" }} />
              <p>No courses match your filter.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="mc-grid">
              {filtered.map(c => <CourseCard key={c.id} course={c} onOpen={setOpenCourse} />)}
            </div>
          ) : (
            <div className="mc-list">
              {filtered.map(c => <CourseRow key={c.id} course={c} onOpen={setOpenCourse} />)}
            </div>
          )}
        </div>

        <div className="mc-page-sidebar">
          <DeadlinesPanel />

          <div className="panel">
            <div className="panel-hd">
              <div className="panel-ttl">
                <Sparkles size={14} style={{ color: "var(--indigo-ll)" }} />
                AI Study Suggestions
              </div>
            </div>
            <div className="panel-body">
              <div className="mc-ai-suggestions">
                {[
                  { course: "Crypto", color: "var(--rose)",  tip: "Away 3 days — pick up RSA this session.",              Icon: CircleAlert },
                  { course: "ML",     color: "var(--amber)", tip: "SVM unlocks tomorrow. Review Linear Regression first.", Icon: Target      },
                  { course: "DBMS",   color: "var(--teal)",  tip: "Quiz tomorrow — revise ACID properties tonight.",       Icon: Award       },
                ].map(({ course, color, tip, Icon }, i) => (
                  <div key={i} className="mc-ai-tip">
                    <span className="mc-ai-tip-icon"><Icon size={14} style={{ color }} /></span>
                    <div>
                      <span className="mc-ai-tip-course" style={{ color }}>{course}</span>
                      <p className="mc-ai-tip-text">{tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}