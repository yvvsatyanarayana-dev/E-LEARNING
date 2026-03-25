// facultyAssignments.jsx
// Matches FacultyDashboard.css design system exactly
// Place at: src/pages/Faculty/facultyAssignments/facultyAssignments.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../../utils/api";
import "./facultyAssignments.css";

// ─── ICONS ────────────────────────────────────────────────────────
const IcoFile = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>;
const IcoPlus = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IcoSearch = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IcoChevR = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
const IcoChevL = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;
const IcoPen = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
const IcoTrash = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const IcoDownload = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const IcoClose = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IcoCheck = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IcoAlert = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const IcoCal = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IcoUsers = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IcoBook = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const IcoClock = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcoBar = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IcoChevUp = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>;
const IcoChevDn = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>;
const IcoMinus = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IcoStar = (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IcoCopy = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
const IcoUpload = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>;
const IcoEye = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IcoBrain = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z" /></svg>;
const IcoLink = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
const IcoGrid = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
const IcoList = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;

// ─── HELPERS ──────────────────────────────────────────────────────
const COLORS = [
  { color: "var(--indigo-l)", rgb: "91,78,248", bg: "rgba(91,78,248,.1)", border: "rgba(91,78,248,.2)" },
  { color: "var(--teal)", rgb: "39,201,176", bg: "rgba(39,201,176,.1)", border: "rgba(39,201,176,.2)" },
  { color: "var(--violet)", rgb: "159,122,234", bg: "rgba(159,122,234,.1)", border: "rgba(159,122,234,.2)" },
  { color: "var(--rose)", rgb: "242,68,92", bg: "rgba(242,68,92,.1)", border: "rgba(242,68,92,.2)" },
  { color: "var(--amber)", rgb: "244,165,53", bg: "rgba(244,165,53,.1)", border: "rgba(244,165,53,.2)" },
];

function getCourseMeta(courseId, courseCode) {
  const idx = String(courseId).length % COLORS.length;
  return {
    ...COLORS[idx],
    code: courseCode || `C${courseId}`,
    total: 100 // Estimate total if missing
  };
}

const TYPE_META = {
  Lab: { color: "var(--indigo-l)", bg: "rgba(91,78,248,.1)", icon: "🧪" },
  Theory: { color: "var(--teal)", bg: "rgba(39,201,176,.1)", icon: "📖" },
  Project: { color: "var(--violet)", bg: "rgba(159,122,234,.1)", icon: "🏗️" },
  Coding: { color: "var(--amber)", bg: "rgba(244,165,53,.1)", icon: "💻" },
  Report: { color: "var(--rose)", bg: "rgba(242,68,92,.1)", icon: "📄" },
};

const STATUS_META = {
  grading: { label: "Grading", color: "var(--amber)", bg: "rgba(244,165,53,.1)", border: "rgba(244,165,53,.2)" },
  upcoming: { label: "Upcoming", color: "var(--text3)", bg: "var(--surface3)", border: "rgba(255,255,255,.06)" },
  done: { label: "Graded", color: "var(--teal)", bg: "rgba(39,201,176,.1)", border: "rgba(39,201,176,.2)" },
  live: { label: "Live", color: "var(--indigo-ll)", bg: "rgba(91,78,248,.1)", border: "rgba(91,78,248,.2)" },
};

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
function CreateModal({ onClose, onCreated, courses = [], editData, groups = [] }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    course_id: courses.length > 0 ? String(courses[0].id) : "",
    type: "Theory",
    target_group: "All",
    week: "W10",
    unit: "",
    dueDate: "",
    marks: 20,
    description: "",
    rubric: [{ item: "", marks: 0 }],
    draft: false,
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        course_id: String(editData.courseId || courses[0]?.id || ""),
        type: editData.type || "Theory",
        target_group: editData.target_group || "All",
        week: editData.week || "W10",
        unit: editData.unit || "",
        dueDate: editData.dueDate ? editData.dueDate.split('T')[0] : (editData.due ? editData.due : ""),
        marks: editData.marks || 20,
        description: editData.description || editData.desc || "",
        rubric: editData.rubric || [{ item: "", marks: 0 }],
        draft: editData.status === "upcoming",
      });
    }
  }, [editData, courses]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const addRow = () => setForm(f => ({ ...f, rubric: [...f.rubric, { item: "", marks: 0 }] }));
  const setRubric = (i, k, v) =>
    setForm(f => { const r = [...f.rubric]; r[i] = { ...r[i], [k]: v }; return { ...f, rubric: r }; });
  const delRubric = (i) =>
    setForm(f => ({ ...f, rubric: f.rubric.filter((_, x) => x !== i) }));

  const totalRubric = form.rubric.reduce((s, r) => s + Number(r.marks || 0), 0);
  const canProceed = form.title.trim() && form.dueDate;
  const cm = getCourseMeta(form.course_id, form.course_id);

  return (
    <div className="as-overlay" onClick={onClose}>
      <div className="as-modal" onClick={e => e.stopPropagation()}>

        <div className="as-modal-hd">
          <div className="as-modal-ico"><IcoFile width={14} height={14} style={{ color: "#fff" }} /></div>
          <span className="as-modal-title">Create Assignment</span>
          <button className="lp-close" onClick={onClose}><IcoClose width={12} height={12} /></button>
        </div>

        <div className="as-steps">
          {["Details", "Rubric", "Publish"].map((s, i) => (
            <div key={s} className={`as-step ${step === i + 1 ? "as-step--active" : ""} ${step > i + 1 ? "as-step--done" : ""}`}>
              <div className="as-step-dot">{step > i + 1 ? <IcoCheck width={8} height={8} /> : i + 1}</div>
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
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="as-input" style={{ flex: 1 }} value={form.course_id} onChange={set("course_id")}>
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
                      {Array.from({ length: 16 }, (_, i) => `W${i + 1}`).map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                  <div className="as-field">
                    <div className="as-field-lbl">Unit / Module</div>
                    <input className="as-input" value={form.unit} placeholder="e.g. Unit III – Memory Management" onChange={set("unit")} />
                  </div>
                </div>
                <div className="as-2col">
                  <div className="as-field">
                    <div className="as-field-lbl">Target Group</div>
                    <select className="as-input" value={form.target_group} onChange={set("target_group")}>
                      {groups.map(g => (
                        <option key={g} value={g}>{g === "All" ? "All Students" : g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="as-field"></div>
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
                  <textarea className="as-input as-textarea" rows={4} value={form.description}
                    placeholder="e.g. Overview of process management and scheduling..."
                    onChange={set("description")} />
                </div>
              </div>
              <div className="as-modal-foot">
                <button className="btn btn-ghost" onClick={onClose}><IcoClose style={{ marginRight: 6 }} width={12} height={12} />Cancel</button>
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
                  <div key={`rubric-row-${i}`} className="as-rubric-row">
                    <span className="as-rubric-idx">{i + 1}</span>
                    <input className="as-input as-rubric-item-inp" value={r.item}
                      placeholder={`Criterion ${i + 1}…`}
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
                <div className="as-field-lbl">Description</div>
                <div className="as-preview-desc">{form.description || "No description provided."}</div>
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
                      <div key={`preview-rubric-${i}`} className="as-preview-rubric-row">
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
                <button className="btn btn-solid as-btn-teal" onClick={() => { onCreated?.(form); onClose(); }}>
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
function DetailDrawer({ assignment, onClose, onEdit, onDuplicate, onDelete }) {
  const [tab, setTab] = useState("overview");
  const [subSearch, setSubSearch] = useState("");
  const [subFilter, setSubFilter] = useState("all");
  const [activeGrader, setActiveGrader] = useState(null);

  if (!assignment) return null;
  const cm = getCourseMeta(assignment.courseId, assignment.course_code);
  const tm = TYPE_META[assignment.type] || TYPE_META.Theory;
  const sm = STATUS_META[assignment.status];
  const subPct = cm ? Math.round((assignment.submissions / cm.total) * 100) : 0;

  const filteredSubs = (assignment.submissions_list || []).filter(s => {
    const q = subSearch.toLowerCase();
    const nameMatch = (s.name || "").toLowerCase().includes(q) || (s.roll || "").toLowerCase().includes(q);
    const statusMatch = subFilter === "all" || s.status === subFilter;
    return nameMatch && statusMatch;
  });

  return (
    <div className="as-overlay as-overlay--drawer" onClick={onClose}>
      <div className="as-drawer" onClick={e => e.stopPropagation()}>

        <div className="as-drawer-hd">
          <button className="as-drawer-back" onClick={onClose}><IcoChevL width={11} height={11} /> Close</button>
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
              <p className="as-drawer-desc">{assignment.description}</p>

              {["grading", "done"].includes(assignment.status) && (
                <div className="as-drawer-stats">
                  {[
                    { lbl: "Submitted", val: `${assignment.submissions}/${cm?.total}`, color: "var(--text)" },
                    {
                      lbl: "Avg Score", val: assignment.avgScore != null ? `${assignment.avgScore}%` : "—",
                      color: assignment.avgScore >= 75 ? "var(--teal)" : assignment.avgScore >= 60 ? "var(--amber)" : "var(--rose)"
                    },
                    { lbl: "Highest", val: assignment.highest != null ? `${assignment.highest}%` : "—", color: "var(--teal)" },
                    { lbl: "Lowest", val: assignment.lowest != null ? `${assignment.lowest}%` : "—", color: "var(--rose)" },
                  ].map((s, i) => (
                    <div key={s.lbl} className="as-ds">
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
                    { lbl: "Avg", pct: assignment.avgScore, color: cm?.color || "var(--indigo-l)" },
                    { lbl: "High", pct: assignment.highest, color: "var(--teal)" },
                    { lbl: "Low", pct: assignment.lowest, color: "var(--rose)" },
                    { lbl: "Sub%", pct: subPct, color: "var(--violet)" },
                  ].map((b, i) => (
                    <div key={b.lbl} className="as-score-row">
                      <span className="as-score-lbl">{b.lbl}</span>
                      <div style={{ flex: 1 }}><AnimBar pct={b.pct} color={b.color} height={5} delay={200 + i * 80} /></div>
                      <span className="as-score-val" style={{ color: b.color }}>{b.pct}%</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="as-drawer-meta-grid">
                <div className="as-meta-item"><IcoCal width={12} height={12} /><span>Due: <strong>{assignment.dueDate || assignment.due}</strong></span></div>
                <div className="as-meta-item"><IcoBook width={12} height={12} /><span>Week: <strong>{assignment.week}</strong></span></div>
                <div className="as-meta-item"><IcoStar width={12} height={12} /><span>Marks: <strong>{assignment.marks}</strong></span></div>
                <div className="as-meta-item"><IcoClock width={12} height={12} /><span>Created: <strong>{assignment.created}</strong></span></div>
              </div>

              <div className="as-drawer-actions">
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", gap: 5, fontSize: 11 }} onClick={() => { onClose(); onEdit(assignment); }}><IcoPen width={11} height={11} /> Edit</button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", gap: 5, fontSize: 11 }} onClick={() => { onDuplicate(assignment); onClose(); }}><IcoCopy width={11} height={11} /> Duplicate</button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", gap: 5, fontSize: 11 }}><IcoLink width={11} height={11} /> Share</button>
              </div>
              <button
                className="as-danger-btn"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this assignment?")) {
                    onDelete(assignment.id);
                    onClose();
                  }
                }}
              >
                <IcoTrash width={11} height={11} /> Delete Assignment
              </button>
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
                  {["all", "graded", "pending", "missing"].map(f => (
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
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 10 }}>No matching submissions</div>
                </div>
              ) : (
                <div className="as-sub-list">
                  {filteredSubs.map((s, i) => (
                    <div key={s.roll || i} className="as-sub-row">
                      <div className="as-sub-avatar">{(s.name || "S").split(" ").map(x => x[0]).join("")}</div>
                      <div className="as-sub-info">
                        <div className="as-sub-name">{s.name}</div>
                        <div className="as-sub-roll">{s.roll} {s.submitted ? `· Submitted ${s.submitted}` : "· Not submitted"}</div>
                      </div>
                      <div className={`as-sub-status as-ss-${s.status}`}>
                        {s.status === "graded" ? <><IcoCheck width={10} height={10} /> Graded</> :
                          s.status === "pending" ? <><IcoClock width={10} height={10} /> Pending</> :
                            <><IcoAlert width={10} height={10} /> Missing</>}
                      </div>
                      <button className="btn btn-solid" style={{ padding: "4px 12px", fontSize: 10, gap: 4 }}
                        onClick={() => setActiveGrader(s)}>
                        <IcoPen width={10} height={10} /> Grade
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeGrader && (
                <div className="as-grader-panel">
                  <div className="as-grader-hd">
                    <span>Grading: <strong style={{ color: cm?.color }}>{activeGrader.name}</strong></span>
                    <button className="as-grader-close" onClick={() => setActiveGrader(null)}><IcoClose width={10} height={10} /></button>
                  </div>
                  {(assignment.rubric || []).map((r, i) => (
                    <div key={`grader-rubric-${i}-${r.item}`} className="as-grader-row">
                      <span className="as-grader-criterion">{r.item || `Criterion ${i + 1}`}</span>
                      <div className="as-grader-input-wrap">
                        <input className="as-grader-input" type="number" min={0} max={r.marks} placeholder="0" />
                        <span>/ {r.marks}</span>
                      </div>
                    </div>
                  ))}
                  <textarea className="as-input as-textarea" rows={2} style={{ marginTop: 10 }} placeholder="Feedback comments (optional)…" />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} onClick={() => setActiveGrader(null)}><IcoClose style={{ marginRight: 6 }} width={12} height={12} />Cancel</button>
                    <button className="btn btn-solid as-btn-teal" style={{ flex: 2, justifyContent: "center", fontSize: 11 }} onClick={() => setActiveGrader(null)}>
                      <IcoCheck width={11} height={11} /> Submit Grade
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "rubric" && (
            <div className="as-rubric-view">
              <div className="as-rv-header"><span>Criterion</span><span>Marks</span></div>
              {(assignment.rubric || []).map((r, i) => (
                <div key={`view-rubric-${i}-${r.item}`} className="as-rv-row">
                  <div className="as-rv-num">{i + 1}</div>
                  <div className="as-rv-name">{r.item}</div>
                  <div className="as-rv-marks" style={{ color: cm?.color }}>
                    {r.marks}<span style={{ color: "var(--text3)", fontWeight: 400, fontSize: 9 }}> m</span>
                  </div>
                  <div style={{ flex: 1, paddingRight: 10 }}>
                    <AnimBar pct={(r.marks / assignment.marks) * 100} color={cm?.color || "var(--indigo-l)"} height={4} delay={200 + i * 80} />
                  </div>
                </div>
              ))}
              <div className="as-rv-total">
                <span>Total</span>
                <span style={{ color: cm?.color, fontWeight: 700 }}>{assignment.marks} marks</span>
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
  const cm = getCourseMeta(assignment.courseId, assignment.course_code);
  const tm = TYPE_META[assignment.type] || TYPE_META.Theory;
  const sm = STATUS_META[assignment.status];
  const subPct = cm ? Math.round((assignment.submissions / cm.total) * 100) : 0;
  const isDraft = assignment.status === "upcoming";

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
      {assignment.unit && <div className="as-card-unit">{assignment.unit || assignment.week}</div>}

      <div className="as-card-due-row">
        <div className="as-card-due-info">
          <IcoCal width={9} height={9} style={{ color: "var(--text3)" }} />
          <span>Due: {assignment.dueDate || assignment.due}</span>
        </div>
        <span className="as-status-badge" style={{ background: sm?.bg, color: sm?.color, borderColor: sm?.border }}>{sm?.label}</span>
      </div>

      {["grading", "done"].includes(assignment.status) && (
        <div style={{ marginTop: 12 }}>
          <div className="as-card-sub-row">
            <span>{assignment.submissions}/{cm?.total} submitted</span>
            <span style={{ color: cm?.color, fontWeight: 700 }}>{subPct}%</span>
          </div>
          <AnimBar pct={subPct} color={cm?.color || "var(--indigo-l)"} height={3} delay={500} />
        </div>
      )}

      {assignment.status === "grading" && (
        <button className="as-card-grade-btn" onClick={e => { e.stopPropagation(); onSelect(assignment); }}>
          <IcoPen width={10} height={10} /> Grade Now
        </button>
      )}
    </div>
  );
}

// ─── LIST ROW ─────────────────────────────────────────────────────
function AssignmentRow({ assignment, idx, onSelect }) {
  const cm = getCourseMeta(assignment.courseId, assignment.course_code);
  const tm = TYPE_META[assignment.type] || TYPE_META.Theory;
  const sm = STATUS_META[assignment.status];
  const subPct = cm ? Math.round((assignment.submissions / cm.total) * 100) : 0;

  return (
    <div className="as-row" onClick={() => onSelect(assignment)}>
      <span className="as-row-num">{idx + 1}</span>
      <div className="as-row-info">
        <div className="as-row-title">{assignment.title}</div>
        <div className="as-row-meta">
          <span style={{ color: cm?.color, fontWeight: 700 }}>{cm?.code}</span>
          <span>·</span><span>{assignment.unit || assignment.week}</span>
          <span>·</span><span>Due {assignment.dueDate || assignment.due}</span>
        </div>
      </div>
      <span className="as-type-badge" style={{ background: tm.bg, color: tm.color, flexShrink: 0 }}>{tm.icon} {assignment.type}</span>
      <span className="as-marks-badge" style={{ flexShrink: 0 }}>{assignment.marks}m</span>
      <div className="as-row-sub-col">
        <AnimBar pct={subPct} color={cm?.color || "var(--indigo-l)"} height={4} delay={300} />
        <span style={{ fontSize: 9.5, color: "var(--text3)", marginTop: 2 }}>{assignment.submissions}/{cm?.total}</span>
      </div>
      <span className="as-status-badge" style={{ background: sm?.bg, color: sm?.color, borderColor: sm?.border, flexShrink: 0 }}>{sm?.label}</span>
      <div className="as-row-acts" onClick={e => e.stopPropagation()}>
        <button className="as-icon-btn"><IcoPen width={11} height={11} /></button>
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
    <div className="as-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="as-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="as-modal-hd">
          <div className="as-modal-ico" style={{ background: "var(--teal)" }}>
            <IcoPlus width={14} height={14} style={{ color: "#fff" }} />
          </div>
          <span className="as-modal-title">Create New Course</span>
          <button className="as-modal-close" onClick={onClose}><IcoClose width={12} height={12} /></button>
        </div>
        <div className="as-modal-body">
          <div className="as-form">
            <div className="as-field">
              <div className="as-field-lbl">Course Title *</div>
              <input className="as-input" value={form.title} placeholder="e.g. Operating Systems" onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
            </div>
            <div className="as-field">
              <div className="as-field-lbl">Semester</div>
              <input className="as-input" value={form.semester} placeholder="e.g. Sem 5" onChange={e => setForm({ ...form, semester: e.target.value })} />
            </div>
            <div className="as-field">
              <div className="as-field-lbl">Description</div>
              <textarea className="as-input as-textarea" rows={2} value={form.description} placeholder="Short description…" onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="as-modal-foot" style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={loading}><IcoClose style={{ marginRight: 6 }} width={12} height={12} />Cancel</button>
            <button className="btn btn-primary" style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }} onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "Create Course"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────
export default function FacultyAssignments({ onBack }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("due");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [toast, setToast] = useState(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  const [courses, setCourses] = useState([]);
  const [metadata, setMetadata] = useState({ departments: [], groups: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignRes, courseRes, metaRes] = await Promise.all([
          api.get("/faculty/assignments"),
          api.get("/faculty/courses"),
          api.get("/faculty/metadata"),
        ]);
        setAssignments(Array.isArray(assignRes) ? assignRes : []);
        const courseList = Array.isArray(courseRes)
          ? courseRes.map(c => ({ id: c.id, name: `${c.code} – ${c.name}` }))
          : [];
        setCourses(courseList);
        setMetadata(metaRes);
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
    setTimeout(() => setToast(null), 2800);
  }, []);

  const handleCreateAssignment = async (formData) => {
    try {
      const cId = parseInt(formData.course_id);
      if (isNaN(cId)) {
        alert("Please select a valid course.");
        return;
      }

      const payload = {
        title: formData.title,
        course_id: cId,
        due_date: formData.dueDate ? formData.dueDate + "T23:59:59Z" : null,
        target_group: formData.target_group,
        description: formData.description,
        rubric: formData.rubric,
        marks: formData.marks,
        type: formData.type,
        week: formData.week,
        unit: formData.unit
      };

      if (editingAssignment && editingAssignment.id) {
        // Update mode
        const res = await api.put(`/faculty/assignments/${editingAssignment.id}`, payload);
        setAssignments(prev => prev.map(a => a.id === res.id ? res : a));
        showToast("✅ Assignment Updated!");
      } else {
        // Create mode (or Duplicate)
        const res = await api.post("/faculty/assignments", { ...payload, status: formData.draft ? "upcoming" : "live" });
        setAssignments(prev => [...prev, res]);
        showToast("✅ Assignment Created!");
      }
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to save assignment:", err);
      alert("Failed to save assignment. Please try again.");
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setShowCreate(true);
  };

  const handleDuplicateAssignment = (assignment) => {
    setEditingAssignment({
      ...assignment,
      id: undefined, // New ID will be generated by backend
      title: `${assignment.title} (Copy)`,
      status: "upcoming" // Reset to draft
    });
    setShowCreate(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await api.delete(`/faculty/assignments/${assignmentId}`);
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      showToast("🗑️ Assignment Deleted");
    } catch (err) {
      console.error("Failed to delete assignment:", err);
      alert("Failed to delete assignment.");
    }
  };

  // AGGREGATE STATS
  const safeAssig = Array.isArray(assignments) ? assignments : [];
  const TOTAL_PENDING_GRADE = safeAssig.filter(a => a.status === "grading").length;
  const TOTAL_LIVE = safeAssig.filter(a => ["live", "grading", "upcoming"].includes(a.status)).length;
  const TOTAL_DONE = safeAssig.filter(a => a.status === "done").length;
  const TOTAL_SUBMISSIONS = safeAssig.reduce((a, x) => a + (x.submissions || 0), 0);

  const filtered = safeAssig.filter(a => {
    const q = search.toLowerCase();
    const titleMatch = (a.title || "").toLowerCase().includes(q) || (a.type || "").toLowerCase().includes(q);
    const courseMatch = activeCourse === "all" || String(a.courseId) === String(activeCourse);
    const statusMatch = activeStatus === "all" || a.status === activeStatus;
    const typeMatch = activeType === "all" || a.type === activeType;
    return titleMatch && courseMatch && statusMatch && typeMatch;
  }).sort((a, b) => {
    if (sortBy === "marks") return b.marks - a.marks;
    if (sortBy === "sub") return (b.submissions || 0) - (a.submissions || 0);
    if (sortBy === "score") return (b.avgScore || 0) - (a.avgScore || 0);
    return 0;
  });

  const grading = filtered.filter(a => a.status === "grading");
  const live = filtered.filter(a => a.status === "live");
  const upcoming = filtered.filter(a => a.status === "upcoming");
  const done = filtered.filter(a => a.status === "done");

  if (loading) return <div className="loading-state">Loading assignments...</div>;

  return (
    <div className="as-root">
      {showCreate && <CreateModal
        onClose={() => { setShowCreate(false); setEditingAssignment(null); }}
        onCreated={handleCreateAssignment}
        courses={courses}
        editData={editingAssignment}
        groups={metadata.groups}
      />}
      {showCreateCourse && (
        <CreateCourseModal
          onClose={() => setShowCreateCourse(false)}
          onCreated={(newCourse) => {
            setCourses(prev => [...prev, { id: newCourse.id, name: `${newCourse.code} – ${newCourse.name}` }]);
          }}
        />
      )}
      {selected && <DetailDrawer
        assignment={selected}
        onClose={() => setSelected(null)}
        onEdit={handleEditAssignment}
        onDuplicate={handleDuplicateAssignment}
        onDelete={handleDeleteAssignment}
      />}
      {toast && <div className="as-toast">{toast}</div>}

      <div className="as-page-hd">
        <div>
          <button className="as-back-btn" onClick={onBack}><IcoChevL width={11} height={11} /> Dashboard</button>
          <div className="greet-tag" style={{ marginBottom: 8, marginTop: 10 }}>
            <div className="greet-pip" />
            <span className="greet-pip-txt">Semester 5 · Week 11 · {TOTAL_PENDING_GRADE} Pending to Grade</span>
          </div>
          <h1 className="greet-title">Assignments <em>&amp; Grading</em></h1>
          <p className="greet-sub">Evaluate submissions and manage curriculum work.</p>
        </div>
        <div className="as-hd-right">
          <button className="btn btn-solid" style={{ gap: 6 }} onClick={() => setShowCreate(true)}>
            <IcoPlus width={12} height={12} /> New Assignment
          </button>
        </div>
      </div>

      <div className="as-stat-strip">
        {[
          { cls: "sc-rose", icon: <IcoPen width={17} height={17} />, val: TOTAL_PENDING_GRADE, lbl: "Pending Grading" },
          { cls: "sc-indigo", icon: <IcoFile width={17} height={17} />, val: TOTAL_LIVE, lbl: "Active/Upcoming" },
          { cls: "sc-teal", icon: <IcoCheck width={17} height={17} />, val: TOTAL_DONE, lbl: "Fully Graded" },
          { cls: "sc-violet", icon: <IcoUsers width={17} height={17} />, val: TOTAL_SUBMISSIONS, lbl: "Total Submitted" },
        ].map((s, i) => (
          <div key={s.lbl} className={`stat-card ${s.cls}`} style={{ cursor: "default" }}>
            <div className="stat-ic">{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="as-course-tabs">
        <button
          key="all"
          className={`as-ctab ${activeCourse === "all" ? "as-ctab--active" : ""}`}
          style={activeCourse === "all" ? { borderColor: "rgba(91,78,248,.2)", color: "var(--indigo-l)", background: "rgba(91,78,248,.1)" } : {}}
          onClick={() => setActiveCourse("all")}>
          <span className="as-ctab-dot" style={{ background: "var(--indigo-l)" }} />
          All Courses
          <span className="as-ctab-count">{safeAssig.length}</span>
        </button>
        {Array.from(new Set(safeAssig.map(a => a.courseId))).map((cid) => {
          const a = safeAssig.find(x => x.courseId === cid);
          const cm = getCourseMeta(cid, a?.course_code);
          return (
            <button key={`ctab-${cid || 'none'}`}
              className={`as-ctab ${activeCourse === cid ? "as-ctab--active" : ""}`}
              style={activeCourse === cid ? { borderColor: cm.border, color: cm.color, background: cm.bg } : {}}
              onClick={() => setActiveCourse(cid)}>
              <span className="as-ctab-dot" style={{ background: cm.color }} />
              {cm.code}
              <span className="as-ctab-count">{safeAssig.filter(x => x.courseId === cid).length}</span>
            </button>
          );
        })}
      </div>

      <div className="as-toolbar">
        <div className="as-search">
          <IcoSearch width={12} height={12} />
          <input className="as-search-inp" value={search} placeholder="Search assignments…" onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="as-toolbar-right">
          <select className="as-select" value={activeStatus} onChange={e => setActiveStatus(e.target.value)}>
            <option value="all">All Status</option>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div className="as-view-toggle">
            <button className={`as-vbtn ${viewMode === "grid" ? "as-vbtn--active" : ""}`} onClick={() => setViewMode("grid")}><IcoGrid width={12} height={12} /></button>
            <button className={`as-vbtn ${viewMode === "list" ? "as-vbtn--active" : ""}`} onClick={() => setViewMode("list")}><IcoList width={12} height={12} /></button>
          </div>
        </div>
      </div>

      <div className="as-results-bar">
        {filtered.length} total assignments found
      </div>

      {viewMode === "grid" && (
        <div className="as-grid">
          {filtered.map(a => <AssignmentCard key={a.id} assignment={a} onSelect={setSelected} />)}
        </div>
      )}

      {viewMode === "list" && (
        <div className="panel as-list-panel">
          {filtered.map((a, i) => <AssignmentRow key={a.id} assignment={a} idx={i} onSelect={setSelected} />)}
        </div>
      )}
    </div>
  );
}