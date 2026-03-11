// facultyQuizzes.jsx
// Matches FacultyDashboard.css design system exactly
// Place at: src/pages/Faculty/facultyQuizzes/facultyQuizzes.jsx

import { useState, useEffect, useCallback } from "react";
import api from "../../../utils/api";
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

// ─── HELPERS ──────────────────────────────────────────────────────
const COLORS = [
  { color: "var(--indigo-l)",  rgb: "91,78,248",   bg: "rgba(91,78,248,.1)",   border: "rgba(91,78,248,.2)" },
  { color: "var(--teal)",      rgb: "39,201,176",  bg: "rgba(39,201,176,.1)",  border: "rgba(39,201,176,.2)" },
  { color: "var(--violet)",    rgb: "159,122,234", bg: "rgba(159,122,234,.1)", border: "rgba(159,122,234,.2)" },
  { color: "var(--rose)",      rgb: "242,68,92",   bg: "rgba(242,68,92,.1)",   border: "rgba(242,68,92,.2)" },
  { color: "var(--amber)",     rgb: "244,165,53",  bg: "rgba(244,165,53,.1)",  border: "rgba(244,165,53,.2)" },
];

function getCourseMeta(courseId, courseCode) {
  const idx = String(courseId).length % COLORS.length;
  return {
    ...COLORS[idx],
    code: courseCode || `C${courseId}`,
    total: 100
  };
}

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
function CourseChip({ quiz }) {
  const c = getCourseMeta(quiz.courseId, quiz.course_code);
  return (
    <span className="qz-course-chip" style={{ color: c.color, background: c.bg, borderColor: c.border }}>
      {c.code}
    </span>
  );
}

// ─── QUIZ CARD ────────────────────────────────────────────────────
function QuizCard({ quiz, onClick }) {
  const c = getCourseMeta(quiz.courseId, quiz.course_code);
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
          <CourseChip quiz={quiz} />
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
    </div>
  );
}

// ─── QUIZ ROW (list view) ─────────────────────────────────────────
function QuizRow({ quiz, idx, onClick }) {
  const c = getCourseMeta(quiz.courseId, quiz.course_code);
  const subPct = quiz.attempts > 0 ? Math.round((quiz.attempts / c.total) * 100) : 0;
  return (
    <div className="qz-row" onClick={onClick}>
      <span className="qz-row-num">{idx + 1}</span>
      <div className="qz-row-info">
        <div className="qz-row-title">{quiz.title}</div>
        <div className="qz-row-meta">
          <CourseChip quiz={quiz} />
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
        <button className="qz-icon-btn" onClick={e => e.stopPropagation()}><IcoPen style={{width:11,height:11}} /></button>
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

function CreateModal({ onClose, onCreated, courses = [] }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", 
    course_id: courses.length > 0 ? String(courses[0].id) : "", 
    type: "MCQ", 
    target_group: "All",
    duration: 20, 
    marks: 10, 
    week: "W1", 
    unit: "Unit I",
    startDate: "", 
    startTime: "10:00",
    shuffle: true, 
    showResult: true, 
    negMark: false,
  });
  const [questions, setQuestions] = useState([BLANK_QUESTION("MCQ")]);
  const [pubMode, setPubMode] = useState("now");


  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addQ = () => setQuestions(qs => [...qs, BLANK_QUESTION(form.type)]);
  const removeQ = (id) => setQuestions(qs => qs.filter(q => q.id !== id));
  const updateQ = (id, patch) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));
  const updateOpt = (qid, optIdx, val) =>
    setQuestions(qs => qs.map(q =>
      q.id === qid ? { ...q, options: q.options.map((o, i) => i === optIdx ? val : o) } : q
    ));

  const handlePublish = () => {
    onCreated({ ...form, questions });
    onClose();
  };

  return (
    <div className="qz-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="qz-modal">
        <div className="qz-modal-hd">
          <div className="qz-modal-ico"><IcoQuiz style={{width:16,height:16,color:"#fff"}} /></div>
          <div><div className="qz-modal-title">Create New Quiz</div></div>
          <button className="qz-modal-close" onClick={onClose}><IcoClose style={{width:12,height:12}} /></button>
        </div>
        <div className="qz-steps">
          {["Details","Questions","Publish"].map((lbl, i) => (
            <div key={lbl} className={`qz-step ${i+1 === step ? "qz-step--active" : i+1 < step ? "qz-step--done" : ""}`}>
              <div className="qz-step-dot">{i+1 < step ? <IcoCheck style={{width:10,height:10}} /> : i+1}</div>
              <span>{lbl}</span>
              {i < 2 && <div className="qz-step-line" />}
            </div>
          ))}
        </div>
        <div className="qz-modal-body">
          {step === 1 && (
            <div className="qz-form">
              <input className="qz-input" placeholder="Quiz Title *" value={form.title} onChange={e => setF("title", e.target.value)} />
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <div className="qz-field-lbl">Course *</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select className="qz-input" style={{ flex: 1 }} value={form.course_id} onChange={e => setF("course_id", e.target.value)}>
                      {courses.length > 0
                        ? courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                        : <option value="">No courses found</option>
                      }
                    </select>
                    <button 
                      className="btn btn-ghost" 
                      title="Create New Course" 
                      style={{ height: 42, width: 42, padding: 0 }}
                      onClick={() => window.dispatchEvent(new CustomEvent('OPEN_CREATE_COURSE'))}
                    >
                      <IcoPlus width={14} height={14} />
                    </button>
                  </div>
                </div>
                <select className="qz-input" style={{ flex: 1 }} value={form.target_group} onChange={e => setF("target_group", e.target.value)}>
                  <option value="All">All Students</option>
                  <option value="BCA">BCA Only</option>
                  <option value="MCA">MCA Only</option>
                  <option value="BTech">B.Tech Only</option>
                </select>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "var(--text3)", textAlign: "center" }}>
                Step 1 of 3: Enter basic details then click Next to add questions.
              </div>
              <button className="btn btn-primary qz-btn-teal" style={{ height: 48, fontSize: 14, marginTop: 8 }} onClick={() => setStep(2)}>
                Next: Add Quiz Questions <IcoChevR style={{ marginLeft: 8 }} />
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="qz-form">
              <div className="qz-q-list">
                {questions.map((q, idx) => (
                  <div key={q.id} className="qz-q-card">
                    <div className="qz-q-card-hd">
                      <span className="qz-q-num">Q{idx + 1}</span>
                      <select 
                        className="qz-input qz-q-type" 
                        style={{ width: 'auto', flex: 1 }}
                        value={q.type} 
                        onChange={(e) => updateQ(q.id, { type: e.target.value })}
                      >
                        <option value="MCQ">MCQ</option>
                        <option value="TF">True/False</option>
                        <option value="FIB">Fill in Blank</option>
                      </select>
                      <button className="qz-q-del" title="Remove Question" onClick={() => removeQ(q.id)}>
                        <IcoTrash width={12} height={12} />
                      </button>
                    </div>
                    
                    <textarea 
                      className="qz-input qz-textarea" 
                      placeholder="Enter question text..."
                      value={q.q}
                      onChange={(e) => updateQ(q.id, { q: e.target.value })}
                    />

                    {q.type === "MCQ" && (
                      <div className="qz-options">
                        {q.options.map((opt, oIdx) => (
                          <div 
                            key={`opt-${oIdx}`} 
                            className={`qz-option-row ${q.ans === oIdx ? "qz-option-row--correct" : ""}`}
                            onClick={() => updateQ(q.id, { ans: oIdx })}
                          >
                            <div className={`qz-opt-radio ${q.ans === oIdx ? "qz-opt-radio--on" : ""}`} />
                            <input 
                              className="qz-input qz-opt-inp" 
                              placeholder={`Option ${oIdx + 1}`}
                              value={opt}
                              onClick={e => e.stopPropagation()}
                              onChange={(e) => updateOpt(q.id, oIdx, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === "TF" && (
                      <div className="qz-tf-row">
                        <button 
                          className={`qz-tf-btn ${q.ans === true ? "qz-tf-btn--on" : ""}`}
                          onClick={() => updateQ(q.id, { ans: true })}
                        >True</button>
                        <button 
                          className={`qz-tf-btn ${q.ans === false ? "qz-tf-btn--on" : ""}`}
                          onClick={() => updateQ(q.id, { ans: false })}
                        >False</button>
                      </div>
                    )}

                    {q.type === "FIB" && (
                      <input 
                        className="qz-input" 
                        placeholder="Expected Answer..."
                        value={q.ans}
                        onChange={(e) => updateQ(q.id, { ans: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <button className="qz-add-q-btn" onClick={addQ}>
                <IcoPlus width={12} height={12} /> Add Question
              </button>

              <div className="qz-modal-foot">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="qz-form">
              <button className="btn btn-primary qz-btn-teal" onClick={handlePublish}>🚀 Publish Now</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CREATE COURSE MODAL ──────────────────────────────────────────
function CreateCourseModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", semester: "Sem 5" });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.title.trim()) return alert("Please enter course title");
    setLoading(true);
    try {
      const res = await api.post("/faculty/courses", form);
      onCreated(res);
      onClose();
    } catch (err) {
      console.error("Failed to create course:", err);
      alert("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qz-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="qz-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="qz-modal-hd">
          <div className="qz-modal-ico" style={{ background: "var(--teal)" }}>
            <IcoPlus width={14} height={14} style={{ color: "#fff" }} />
          </div>
          <span className="qz-modal-title">Create New Course</span>
          <button className="qz-modal-close" onClick={onClose}><IcoClose width={12} height={12} /></button>
        </div>
        <div className="qz-modal-body">
          <div className="qz-form">
            <div className="qz-field">
              <div className="qz-field-lbl">Course Title *</div>
              <input className="qz-input" value={form.title} placeholder="e.g. Operating Systems" onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
            </div>
            <div className="qz-field">
              <div className="qz-field-lbl">Semester</div>
              <input className="qz-input" value={form.semester} placeholder="e.g. Sem 5" onChange={e => setForm({ ...form, semester: e.target.value })} />
            </div>
            <div className="qz-field">
              <div className="qz-field-lbl">Description</div>
              <textarea className="qz-input qz-textarea" rows={2} value={form.description} placeholder="Short description…" onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="qz-modal-foot" style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-primary qz-btn-teal" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "Create Course"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL DRAWER ────────────────────────────────────────────────
function DetailDrawer({ quiz, onClose }) {
  const [tab, setTab] = useState("overview");
  const c = getCourseMeta(quiz.courseId, quiz.course_code);

  return (
    <div className="qz-overlay qz-overlay--drawer" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="qz-drawer">
        <div className="qz-drawer-hd">
          <button className="qz-drawer-back" onClick={onClose}><IcoChevL style={{width:12,height:12}} /> Close</button>
          <div className="qz-drawer-title">{quiz.title}</div>
        </div>
        <div className="qz-drawer-tabs">
          {["overview", "results", "questions"].map(t => (
            <button key={t} className={`qz-drawer-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <div className="qz-drawer-body">
          {tab === "overview" && <p>{quiz.desc}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function FacultyQuizzes({ onBack }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [courseFilter, setCourse] = useState("All");
  const [statusFilter, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [toast, setToast] = useState("");

  const handleCreateQuiz = async (formData) => {
    try {
      const cId = parseInt(formData.course_id);
      if (isNaN(cId)) {
        alert("Please select a valid course.");
        return;
      }

      const payload = {
        title: formData.title || "New Quiz",
        course_id: cId,
        target_group: formData.target_group,
        difficulty: "Medium",
        is_ai_generated: false,
        questions: formData.questions || []
      };
      
      const res = await api.post("/faculty/quizzes", payload);
      setQuizzes(prev => [...prev, res]);
      showToast("✅ Quiz Created!");
      setCreate(false);
    } catch (err) {
      console.error("Failed to create quiz:", err);
      alert("Failed to create quiz. Please try again.");
    }
  };

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, courseRes] = await Promise.all([
          api.get("/faculty/quizzes"),
          api.get("/faculty/courses"),
        ]);
        setQuizzes(Array.isArray(quizRes) ? quizRes : []);
        const courseList = Array.isArray(courseRes)
          ? courseRes.map(c => ({ id: c.id, name: `${c.code} – ${c.name}` }))
          : [];
        setCourses(courseList);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const fn = () => setShowCreateCourse(true);
    window.addEventListener('OPEN_CREATE_COURSE', fn);
    return () => window.removeEventListener('OPEN_CREATE_COURSE', fn);
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);


  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
  const filtered = safeQuizzes.filter(q => {
    if (courseFilter !== "All" && q.course_code !== courseFilter) return false;
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="loading-state">Loading quizzes...</div>;

  return (
    <div className="qz-root">
      {showCreate && <CreateModal onClose={() => setCreate(false)} onCreated={handleCreateQuiz} courses={courses} />}
      {showCreateCourse && (
        <CreateCourseModal 
          onClose={() => setShowCreateCourse(false)} 
          onCreated={(newCourse) => {
            setCourses(prev => [...prev, { id: newCourse.id, name: `${newCourse.code} – ${newCourse.name}` }]);
          }} 
        />
      )}
      {selected && <DetailDrawer quiz={selected} onClose={() => setSelected(null)} />}
      {toast && <div className="qz-toast">{toast}</div>}

      <div className="qz-page-hd">
        <div>
          <button className="qz-back-btn" onClick={onBack}><IcoChevL style={{width:13,height:13}} /> Dashboard</button>
          <div className="greet-title">Quizzes</div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreate(true)}><IcoPlus style={{width:13,height:13}} /> New Quiz</button>
      </div>

      <div className="qz-course-tabs">
        <button key="All" className={`qz-ctab ${courseFilter === "All" ? "qz-ctab--active" : ""}`} onClick={() => setCourse("All")}>All</button>
        {Array.from(new Set(safeQuizzes.map(q => q.course_code))).filter(Boolean).map(code => (
          <button key={code} className={`qz-ctab ${courseFilter === code ? "qz-ctab--active" : ""}`} onClick={() => setCourse(code)}>{code}</button>
        ))}
      </div>

      <div className="qz-toolbar">
        <div className="qz-search">
          <IcoSearch style={{width:13,height:13}} />
          <input className="qz-search-inp" placeholder="Search quizzes…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="qz-view-toggle">
          <button className={`qz-vbtn ${view === "grid" ? "qz-vbtn--active" : ""}`} onClick={() => setView("grid")}><IcoGrid style={{width:13,height:13}} /></button>
          <button className={`qz-vbtn ${view === "list" ? "qz-vbtn--active" : ""}`} onClick={() => setView("list")}><IcoList style={{width:13,height:13}} /></button>
        </div>
      </div>

      <div className="qz-grid">
        {filtered.map(q => <QuizCard key={q.id} quiz={q} onClick={() => setSelected(q)} />)}
      </div>
    </div>
  );
}