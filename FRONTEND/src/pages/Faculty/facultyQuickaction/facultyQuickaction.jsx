// QuickActionsModal.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./facultyQuickaction.css";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoClose   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoPen     = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoUpload  = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoCal     = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoBook    = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoClock   = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoAward   = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoFlash   = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoSearch  = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoMsg     = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IcoBrain   = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;
const IcoChevR   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;

// ─── ACTION DATA ─────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    section: "Grading & Assessment",
    items: [
      { id: "grade",    label: "Grade Submissions",    desc: "Review & grade pending assignments",   icon: <IcoPen />,   color: "var(--indigo-ll)", bg: "rgba(91,78,248,.12)",   badge: "22 pending", badgeClass: "rose",   route: "GRADE_BOOK"     },
      { id: "quiz",     label: "Create New Quiz",       desc: "Build a quiz with custom questions",  icon: <IcoClock />, color: "var(--teal)",      bg: "rgba(39,201,176,.1)",   badge: null,          badgeClass: "",        route: "QUIZZES"        },
      { id: "qbank",    label: "Generate Question Paper",desc: "AI-assisted paper from question bank",icon:<IcoAward />, color: "var(--violet)",    bg: "rgba(159,122,234,.1)",  badge: null,          badgeClass: "",        route: "QUESTION_BANK"  },
    ],
  },
  {
    section: "Content & Courses",
    items: [
      { id: "upload",   label: "Upload Lecture",        desc: "Add a new video lecture to a course", icon: <IcoUpload />,color: "var(--amber)",     bg: "rgba(244,165,53,.1)",   badge: null,          badgeClass: "",        route: "VIDEO_LECTURES" },
      { id: "course",   label: "Manage Courses",        desc: "Edit course details and materials",   icon: <IcoBook />,  color: "var(--indigo-ll)", bg: "rgba(91,78,248,.1)",    badge: "3 active",    badgeClass: "",        route: "MY_COURSES"     },
      { id: "assign",   label: "New Assignment",        desc: "Create and publish an assignment",    icon: <IcoPlus />,  color: "var(--teal)",      bg: "rgba(39,201,176,.1)",   badge: null,          badgeClass: "",        route: "ASSIGNMENTS"    },
    ],
  },
  {
    section: "Students & Attendance",
    items: [
      { id: "attend",   label: "Mark Attendance",       desc: "Record today's class attendance",     icon: <IcoCal />,   color: "var(--rose)",      bg: "rgba(242,68,92,.1)",    badge: "Today",       badgeClass: "rose",    route: "ATTENDANCE"     },
      { id: "students", label: "View All Students",     desc: "Browse student profiles & progress",  icon: <IcoUsers />, color: "var(--violet)",    bg: "rgba(159,122,234,.1)",  badge: "316 total",   badgeClass: "",        route: "ALL_STUDENTS"  },
      { id: "analytics",label: "Analytics Overview",   desc: "Scores, trends & performance data",   icon: <IcoTrend />, color: "var(--amber)",     bg: "rgba(244,165,53,.1)",   badge: "New",         badgeClass: "",        route: "ANALYTICS"      },
    ],
  },
  {
    section: "AI Tools",
    items: [
      { id: "ai",       label: "Ask Lucyna AI",         desc: "Get AI insights on your courses",     icon: <IcoBrain />, color: "var(--indigo-ll)", bg: "rgba(91,78,248,.12)",   badge: "Online",      badgeClass: "teal",    route: "AI_ASSISTANT"   },
      { id: "remedial", label: "Generate Remedial Quiz",desc: "Auto-detect weak topics & fix them",  icon: <IcoFlash />, color: "var(--teal)",      bg: "rgba(39,201,176,.1)",   badge: "5 weak topics",badgeClass:"rose",    route: "AI_ASSISTANT"   },
      { id: "report",   label: "View Reports",          desc: "Download course & student reports",   icon: <IcoMsg />,   color: "var(--violet)",    bg: "rgba(159,122,234,.1)",  badge: null,          badgeClass: "",        route: "REPORTS"        },
    ],
  },
];

const RECENT = [
  { label: "Graded OS Assignment #3",    time: "2h ago",  color: "var(--teal)"      },
  { label: "Uploaded DBMS Lecture 23",   time: "Yesterday",color:"var(--indigo-ll)" },
  { label: "Created Process Scheduling Quiz", time: "2d ago", color:"var(--violet)" },
];

// ─── COMPONENT ───────────────────────────────────────────────────
export default function QuickActionsPage({ onBack }) {
  const [search, setSearch] = useState("");
  const [recentVisible, setRecentVisible] = useState(true);
  const inputRef = useRef();
  const backdropRef = useRef();
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else navigate("/facultydashboard");
  }, [onBack, navigate]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
    setSearch("");
  }, []);

  // Escape key to go back
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") handleBack(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [handleBack]);

  const handleAction = useCallback((route) => {
    // Route using dashboard navigation logic
    const ROUTE_TO_URL = {
      GRADE_BOOK: "/facultydashboard/gradeBook",
      QUIZZES: "/facultydashboard/facultyQuizzes",
      QUESTION_BANK: "/facultydashboard/questionBank",
      VIDEO_LECTURES: "/facultydashboard/facultyVideoLectures",
      MY_COURSES: "/facultydashboard/facultyMycourse",
      ASSIGNMENTS: "/facultydashboard/facultyAssignments",
      ATTENDANCE: "/facultydashboard/attendance",
      ALL_STUDENTS: "/facultydashboard/allStudents",
      ANALYTICS: "/facultydashboard/facultyAnalytics",
      AI_ASSISTANT: "/facultydashboard/aiAssistant",
      REPORTS: "/facultydashboard/reports",
    };
    if (route && ROUTE_TO_URL[route]) navigate(ROUTE_TO_URL[route]);
  }, [navigate]);

  // Filter
  const filtered = search.trim()
    ? QUICK_ACTIONS.map(s => ({
        ...s,
        items: s.items.filter(
          i => i.label.toLowerCase().includes(search.toLowerCase()) ||
               i.desc.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(s => s.items.length > 0)
    : QUICK_ACTIONS;

  return (
    <div className="qa-backdrop" ref={backdropRef}>
      <div className="qa-modal">
        {/* ── HEADER ── */}
        <div className="qa-header">
          <div className="qa-header-left">
            <div className="qa-header-icon"><IcoFlash style={{ color: "var(--indigo-ll)" }} /></div>
            <div>
              <div className="qa-title">Quick Actions</div>
              <div className="qa-subtitle">Jump to any action instantly</div>
            </div>
          </div>
          <button className="qa-close" onClick={handleBack}><IcoClose /></button>
        </div>

        {/* ── SEARCH ── */}
        <div className="qa-search-wrap">
          <IcoSearch style={{ color: "var(--text3)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="qa-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search actions…"
          />
          {search && (
            <button className="qa-search-clear" onClick={() => setSearch("")}> <IcoClose width={10} height={10} /> </button>
          )}
          <span className="qa-kbd">ESC</span>
        </div>

        <div className="qa-body">
          {/* ── RECENT (only when not searching) ── */}
          {!search && (
            <div className="qa-recent-wrap">
              <div className="qa-recent-hd" onClick={() => setRecentVisible(v => !v)}>
                <span className="qa-sec-label">Recent Activity</span>
                <span className="qa-recent-toggle">{recentVisible ? "hide" : "show"}</span>
              </div>
              {recentVisible && (
                <div className="qa-recent-list">
                  {RECENT.map((r, i) => (
                    <div key={i} className="qa-recent-item">
                      <div className="qa-recent-dot" style={{ background: r.color }} />
                      <span className="qa-recent-label">{r.label}</span>
                      <span className="qa-recent-time">{r.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ACTIONS GRID ── */}
          {filtered.length === 0 ? (
            <div className="qa-empty">
              <IcoSearch style={{ width: 28, height: 28, color: "var(--text3)", marginBottom: 10 }} />
              <div style={{ fontSize: 13, color: "var(--text3)" }}>No actions match "<strong style={{ color: "var(--text2)" }}>{search}</strong>"</div>
            </div>
          ) : (
            filtered.map(({ section, items }) => (
              <div key={section} className="qa-section">
                <div className="qa-sec-label">{section}</div>
                <div className="qa-grid">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className="qa-action-btn"
                      onClick={() => handleAction(item.route)}
                    >
                      <div className="qa-action-ic" style={{ background: item.bg, color: item.color }}>
                        {item.icon}
                      </div>
                      <div className="qa-action-info">
                        <div className="qa-action-label">{item.label}</div>
                        <div className="qa-action-desc">{item.desc}</div>
                      </div>
                      {item.badge && (
                        <span className={`qa-action-badge ${item.badgeClass}`}>{item.badge}</span>
                      )}
                      <IcoChevR className="qa-action-arrow" />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="qa-footer">
          <span className="qa-footer-tip"><kbd>↑↓</kbd> Navigate</span>
          <span className="qa-footer-tip"><kbd>Enter</kbd> Open</span>
          <span className="qa-footer-tip"><kbd>Esc</kbd> Close</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text3)" }}>12 actions available</span>
        </div>
      </div>
    </div>
  );
}