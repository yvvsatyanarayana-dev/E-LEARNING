// facultyVideoLectures.jsx
// Matches FacultyDashboard.css design system exactly
// Place at: src/pages/Faculty/facultyVideoLectures/facultyVideoLectures.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../../utils/api";
import "./facultyVideoLectures.css";

// ─── ICONS (same style as FacultyDashboard) ───────────────────────
const IcoVideo    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IcoPlay     = (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IcoUpload   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcoSearch   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoChevR    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoChevL    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoClock    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoEye      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoPen      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoTrash    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoDownload = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoLink     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IcoClose    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoCheck    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoPlus     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoGrid     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IcoList     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IcoLock     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoStar     = (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoAlert    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoBar      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoYT       = (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>;
const IcoBook     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoTrend    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoRefresh  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

// ─── DATA ─────────────────────────────────────────────────────────
const COURSES = [
  { id: "all",   code: "All",   name: "All Courses",
    color: "var(--indigo-l)", bg: "rgba(91,78,248,.1)", border: "rgba(91,78,248,.2)" },
  { id: "cs501", code: "CS501", name: "Operating Systems",
    color: "var(--indigo-l)", bg: "rgba(91,78,248,.1)", border: "rgba(91,78,248,.2)" },
  { id: "cs502", code: "CS502", name: "Database Management Systems",
    color: "var(--teal)",     bg: "rgba(39,201,176,.1)", border: "rgba(39,201,176,.2)" },
  { id: "cs503", code: "CS503", name: "Computer Architecture",
    color: "var(--violet)",   bg: "rgba(159,122,234,.1)", border: "rgba(159,122,234,.2)" },
];
// thumbnail gradient per course
const THUMB = {
  cs501: { grad: "linear-gradient(135deg,#130f2e,#2d1b69)", emoji: "🖥️" },
  cs502: { grad: "linear-gradient(135deg,#0a2828,#0d4a42)", emoji: "🗄️" },
  cs503: { grad: "linear-gradient(135deg,#1a0a32,#3c1a6e)", emoji: "⚙️" },
};

// ─── SHARED HELPERS ───────────────────────────────────────────────
function AnimBar({ pct, color, height = 4, delay = 300 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height, background: "var(--surface3)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${w}%`,
        background: color, borderRadius: 2,
        transition: "width 1.1s ease"
      }} />
    </div>
  );
}

function Stars({ rating }) {
  return (
    <span className="vl-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <IcoStar key={i} width={10} height={10}
          style={{ color: i <= Math.round(rating) ? "var(--amber)" : "var(--surface3)" }} />
      ))}
      <span className="vl-rating-num">{rating > 0 ? rating.toFixed(1) : "—"}</span>
    </span>
  );
}

// ─── THUMBNAIL ────────────────────────────────────────────────────
function Thumb({ lecture, size = "card" }) {
  const cfg    = THUMB[lecture.courseId] || THUMB.cs501;
  const course = COURSES.find(c => c.id === lecture.courseId);
  const live   = lecture.status === "live";
  return (
    <div className={`vl-thumb vl-thumb--${size}`} style={{ background: cfg.grad }}>
      <div className="vl-thumb-noise" />
      {/* course badge top-left */}
      <span className="vl-thumb-code" style={{ background: course?.bg, color: course?.color, borderColor: course?.border }}>
        {course?.code}
      </span>
      {/* week top-right */}
      <span className="vl-thumb-week">{lecture.week}</span>
      {/* center emoji */}
      <span className="vl-thumb-emoji">{cfg.emoji}</span>
      {/* play / lock overlay */}
      {live
        ? <div className="vl-thumb-play"><IcoPlay width={13} height={13} style={{ color: "#fff", marginLeft: 2 }} /></div>
        : <div className="vl-thumb-lock"><IcoLock width={12} height={12} style={{ color: "var(--text3)" }} /></div>
      }
      {/* duration pill bottom-left */}
      {live && (
        <div className="vl-thumb-dur">
          <IcoClock width={8} height={8} /> {lecture.dur}
        </div>
      )}
    </div>
  );
}

// ─── UPLOAD MODAL ─────────────────────────────────────────────────
function UploadModal({ onClose }) {
  const [step, setStep]         = useState(1);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone]         = useState(false);
  const [form, setForm]         = useState({
    title: "", course: "cs501", week: "W12", unit: "Unit V", desc: "", tags: "",
  });

  const simulateUpload = () => {
    if (done) return;
    setProgress(0); setDone(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 14 + 6;
      if (p >= 100) { p = 100; clearInterval(iv); setDone(true); }
      setProgress(Math.min(p, 100));
    }, 180);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="vl-overlay" onClick={onClose}>
      <div className="vl-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="vl-modal-hd">
          <div className="vl-modal-ico">
            <IcoUpload width={14} height={14} style={{ color: "#fff" }} />
          </div>
          <span className="vl-modal-title">Upload New Lecture</span>
          <button className="vl-modal-close" onClick={onClose}><IcoClose width={12} height={12} /></button>
        </div>

        {/* Step indicators */}
        <div className="vl-steps">
          {["Upload File", "Add Details", "Publish"].map((s, i) => (
            <div key={i} className={`vl-step ${step === i + 1 ? "vl-step--active" : ""} ${step > i + 1 ? "vl-step--done" : ""}`}>
              <div className="vl-step-dot">
                {step > i + 1 ? <IcoCheck width={8} height={8} /> : i + 1}
              </div>
              <span>{s}</span>
              {i < 2 && <div className="vl-step-line" />}
            </div>
          ))}
        </div>

        <div className="vl-modal-body">

          {/* ── STEP 1: File upload ── */}
          {step === 1 && (
            <>
              <div
                className={`vl-dropzone ${dragging ? "vl-dropzone--over" : ""} ${done ? "vl-dropzone--done" : ""}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); simulateUpload(); }}
                onClick={simulateUpload}
              >
                {progress === 0 && !done && (
                  <>
                    <IcoVideo width={28} height={28} style={{ color: "var(--indigo-ll)", marginBottom: 8 }} />
                    <div className="vl-dz-title">Drop your video file here</div>
                    <div className="vl-dz-sub">MP4, MOV, AVI · Max 4 GB · Click to browse</div>
                  </>
                )}
                {progress > 0 && !done && (
                  <div className="vl-dz-prog-wrap">
                    <div className="vl-dz-prog-lbl">Uploading… {Math.round(progress)}%</div>
                    <div className="vl-dz-prog-track">
                      <div className="vl-dz-prog-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                {done && (
                  <div className="vl-dz-success">
                    <div className="vl-dz-check"><IcoCheck width={18} height={18} /></div>
                    <div className="vl-dz-title" style={{ color: "var(--teal)" }}>Upload Complete!</div>
                    <div className="vl-dz-sub">lecture_video.mp4 · 842 MB</div>
                  </div>
                )}
              </div>

              {/* URL paste row */}
              <div style={{ marginTop: 14 }}>
                <div className="vl-field-lbl">Or paste a link</div>
                <div className="vl-link-row">
                  <IcoYT width={15} height={15} style={{ color: "var(--rose)", flexShrink: 0 }} />
                  <input className="vl-link-input" placeholder="YouTube / Drive / OneDrive URL…" />
                  <button className="vl-link-add"><IcoPlus width={12} height={12} /></button>
                </div>
              </div>

              <div className="vl-modal-foot">
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button className="btn btn-solid" onClick={() => setStep(2)}
                  style={{ opacity: done ? 1 : 0.45, pointerEvents: done ? "all" : "none" }}>
                  Continue <IcoChevR width={10} height={10} />
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Details form ── */}
          {step === 2 && (
            <>
              <div className="vl-form">
                <div className="vl-field">
                  <div className="vl-field-lbl">Lecture Title *</div>
                  <input className="vl-input" value={form.title} placeholder="e.g. Disk Scheduling & RAID Algorithms"
                    onChange={set("title")} />
                </div>
                <div className="vl-2col">
                  <div className="vl-field">
                    <div className="vl-field-lbl">Course *</div>
                    <select className="vl-input" value={form.course} onChange={set("course")}>
                      <option value="cs501">CS501 – Operating Systems</option>
                      <option value="cs502">CS502 – Database Management</option>
                      <option value="cs503">CS503 – Computer Architecture</option>
                    </select>
                  </div>
                  <div className="vl-field">
                    <div className="vl-field-lbl">Week</div>
                    <select className="vl-input" value={form.week} onChange={set("week")}>
                      {Array.from({ length: 15 }, (_, i) => `W${i + 1}`).map(w => (
                        <option key={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="vl-field">
                  <div className="vl-field-lbl">Unit / Module</div>
                  <input className="vl-input" value={form.unit} placeholder="e.g. Unit V – Storage Management"
                    onChange={set("unit")} />
                </div>
                <div className="vl-field">
                  <div className="vl-field-lbl">Description</div>
                  <textarea className="vl-input vl-textarea" rows={3} value={form.desc}
                    placeholder="Brief description of what this lecture covers…"
                    onChange={set("desc")} />
                </div>
                <div className="vl-field">
                  <div className="vl-field-lbl">Tags <span style={{ color: "var(--text3)", fontWeight: 400 }}>(comma separated)</span></div>
                  <input className="vl-input" value={form.tags} placeholder="Disk, RAID, Scheduling…"
                    onChange={set("tags")} />
                </div>
              </div>
              <div className="vl-modal-foot">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-solid" onClick={() => setStep(3)}>
                  Preview <IcoChevR width={10} height={10} />
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Publish ── */}
          {step === 3 && (
            <>
              {/* Preview card */}
              <div className="vl-preview-card">
                <div className="vl-preview-thumb" style={{ background: THUMB[form.course]?.grad || THUMB.cs501.grad }}>
                  <span style={{ fontSize: 26 }}>{THUMB[form.course]?.emoji || "🖥️"}</span>
                </div>
                <div className="vl-preview-info">
                  <div className="vl-preview-meta">{form.course.toUpperCase()} · {form.week} · {form.unit}</div>
                  <div className="vl-preview-title">{form.title || "Untitled Lecture"}</div>
                  <div className="vl-preview-desc">{form.desc || "No description provided."}</div>
                  <div className="vl-preview-tags">
                    {(form.tags || "").split(",").filter(Boolean).map((t, i) => (
                      <span key={i} className="vl-tag">{t.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Publish options */}
              <div className="vl-pub-opts">
                <div className="vl-pub-opt vl-pub-opt--active">
                  <div className="vl-pub-radio vl-pub-radio--active" />
                  <div>
                    <div className="vl-pub-lbl">Publish Now</div>
                    <div className="vl-pub-sub">Students can access immediately</div>
                  </div>
                </div>
                <div className="vl-pub-opt">
                  <div className="vl-pub-radio" />
                  <div>
                    <div className="vl-pub-lbl">Schedule</div>
                    <div className="vl-pub-sub">Set a future publish date</div>
                  </div>
                </div>
              </div>

              <div className="vl-modal-foot">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-solid vl-btn-teal" onClick={onClose}>
                  <IcoCheck width={12} height={12} /> Publish Lecture
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
function Drawer({ lecture, onClose }) {
  if (!lecture) return null;
  const course = COURSES.find(c => c.id === lecture.courseId);
  const live   = lecture.status === "live";

  return (
    <div className="vl-overlay" onClick={onClose}>
      <div className="vl-drawer" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="vl-drawer-hd">
          <button className="vl-drawer-back" onClick={onClose}>
            <IcoChevL width={11} height={11} /> Close
          </button>
          <div className="vl-drawer-course" style={{ color: course?.color }}>
            {course?.code} · {lecture.week} · {lecture.unit}
          </div>
          <div className="vl-drawer-title">{lecture.title}</div>
          <div className="vl-drawer-tags">
            {lecture.tags.map(t => <span key={t} className="vl-tag">{t}</span>)}
          </div>
        </div>

        {/* Thumb */}
        <Thumb lecture={lecture} size="drawer" />

        {/* Body */}
        <div className="vl-drawer-body">
          <p className="vl-drawer-desc">{lecture.desc}</p>

          {live && (
            <>
              {/* Stats row */}
              <div className="vl-drawer-stats">
                <div className="vl-ds"><IcoClock width={12} height={12} style={{ color: "var(--text3)" }} /><span>{lecture.dur}</span></div>
                <div className="vl-ds"><IcoEye   width={12} height={12} style={{ color: "var(--text3)" }} /><span>{lecture.views} views</span></div>
                <div className="vl-ds"><IcoBar   width={12} height={12} style={{ color: "var(--text3)" }} /><span>{lecture.watchPct}% watched</span></div>
                <div className="vl-ds"><IcoStar  width={12} height={12} style={{ color: "var(--amber)" }} /><span>{lecture.rating}</span></div>
              </div>

              {/* Watch completion */}
              <div className="vl-drawer-sec">Watch Completion</div>
              <AnimBar pct={lecture.watchPct} color={course?.color || "var(--indigo-l)"} height={6} delay={100} />
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 5 }}>
                {lecture.watchPct}% of enrolled students watched this lecture
              </div>

              {/* Actions */}
              <div className="vl-drawer-actions">
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", gap: 5, fontSize: 11 }}>
                  <IcoPen width={11} height={11} /> Edit
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", gap: 5, fontSize: 11 }}>
                  <IcoDownload width={11} height={11} /> Download
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", gap: 5, fontSize: 11 }}>
                  <IcoLink width={11} height={11} /> Copy Link
                </button>
              </div>

              <button className="vl-danger-btn">
                <IcoTrash width={11} height={11} /> Delete Lecture
              </button>
            </>
          )}

          {!live && (
            <button className="btn btn-solid" style={{ width: "100%", justifyContent: "center", gap: 7, marginTop: 8 }}>
              <IcoUpload width={13} height={13} /> Upload This Lecture
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GRID CARD ────────────────────────────────────────────────────
function Card({ lecture, onSelect }) {
  const course  = COURSES.find(c => c.id === lecture.courseId);
  const pending = lecture.status === "pending";
  return (
    <div className={`vl-card ${pending ? "vl-card--dim" : ""}`} onClick={() => onSelect(lecture)}>
      <Thumb lecture={lecture} size="card" />
      <div className="vl-card-body">
        <div className="vl-card-top">
          <span className="vl-card-unit">{lecture.unit}</span>
          <span className="vl-week-chip" style={{ color: course?.color, background: course?.bg, borderColor: course?.border }}>
            {lecture.week}
          </span>
        </div>
        <div className="vl-card-title">{lecture.title}</div>
        {!pending
          ? <>
              <div className="vl-card-stats">
                <span><IcoEye width={10} height={10} /> {lecture.views}</span>
                <span><IcoClock width={10} height={10} /> {lecture.dur}</span>
                <Stars rating={lecture.rating} />
              </div>
              <AnimBar pct={lecture.watchPct} color={course?.color || "var(--indigo-l)"} height={3} delay={500} />
              <div className="vl-card-watch">{lecture.watchPct}% avg watch</div>
            </>
          : <div className="vl-card-pending-hint">
              <IcoAlert width={11} height={11} style={{ color: "var(--amber)" }} /> Not uploaded yet
            </div>
        }
      </div>
    </div>
  );
}

// ─── LIST ROW ─────────────────────────────────────────────────────
function Row({ lecture, idx, onSelect }) {
  const course  = COURSES.find(c => c.id === lecture.courseId);
  const pending = lecture.status === "pending";
  return (
    <div className={`vl-row ${pending ? "vl-row--dim" : ""}`} onClick={() => onSelect(lecture)}>
      <span className="vl-row-num">{idx + 1}</span>
      <div className="vl-row-thumb"><Thumb lecture={lecture} size="row" /></div>
      <div className="vl-row-info">
        <div className="vl-row-title">{lecture.title}</div>
        <div className="vl-row-meta">
          <span style={{ color: course?.color }}>{course?.code}</span>
          <span>·</span>
          <span>{lecture.unit}</span>
          {!pending && <><span>·</span><span>Uploaded {lecture.date}</span></>}
        </div>
        <div className="vl-row-tags">
          {lecture.tags.slice(0, 2).map(t => <span key={t} className="vl-tag-sm">{t}</span>)}
        </div>
      </div>
      <span className="vl-week-chip" style={{ color: course?.color, background: course?.bg, borderColor: course?.border }}>
        {lecture.week}
      </span>
      {!pending
        ? <>
            <span className="vl-row-cell"><IcoClock width={10} height={10} style={{ color: "var(--text3)" }} /> {lecture.dur}</span>
            <span className="vl-row-cell"><IcoEye   width={10} height={10} style={{ color: "var(--text3)" }} /> {lecture.views}</span>
            <div className="vl-row-watch-col">
              <AnimBar pct={lecture.watchPct} color={course?.color || "var(--indigo-l)"} height={4} delay={300} />
              <span style={{ color: course?.color, fontSize: 9.5, fontWeight: 700 }}>{lecture.watchPct}%</span>
            </div>
            <div className="vl-row-rating"><Stars rating={lecture.rating} /></div>
            <div className="vl-row-acts" onClick={e => e.stopPropagation()}>
              <button className="vl-icon-btn" title="Edit"><IcoPen width={11} height={11} /></button>
              <button className="vl-icon-btn" title="Download"><IcoDownload width={11} height={11} /></button>
            </div>
          </>
        : <div className="vl-row-pending-cell" style={{ gridColumn: "span 5" }}>
            <IcoAlert width={11} height={11} style={{ color: "var(--amber)" }} />
            <span>Pending Upload</span>
            <button className="btn btn-solid" style={{ padding: "4px 12px", fontSize: 10, gap: 5 }}
              onClick={e => e.stopPropagation()}>
              <IcoUpload width={10} height={10} /> Upload
            </button>
          </div>
      }
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────
export default function FacultyVideoLectures({ onBack }) {
  const [activeCourse, setActiveCourse] = useState("all");
  const [viewMode, setViewMode]         = useState("grid");
  const [search, setSearch]             = useState("");
  const [sortBy, setSortBy]             = useState("week");
  const [filterUnit, setFilterUnit]     = useState("all");
  const [showUpload, setShowUpload]     = useState(false);
  const [selected, setSelected]         = useState(null);
  
  const [lectures, setLectures]         = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await api.get("/faculty/lectures");
        const safeData = Array.isArray(res.data) ? res.data : [];
        setLectures(safeData);
      } catch (err) {
        console.error("Failed to fetch lectures:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  // available units for filter
  const units = ["all", ...new Set(
    lectures
      .filter(l => activeCourse === "all" || l.courseId === activeCourse)
      .map(l => l.unit)
  )];

  // apply filters + sort
  const filtered = lectures
    .filter(l => activeCourse === "all" || l.courseId === activeCourse)
    .filter(l => filterUnit === "all" || l.unit === filterUnit)
    .filter(l =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.tags && l.tags.join(" ").toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) =>
      sortBy === "week"   ? a.id - b.id :
      sortBy === "views"  ? b.views  - a.views  :
      sortBy === "rating" ? b.rating - a.rating :
                            b.watchPct - a.watchPct
    );

  const live    = filtered.filter(l => l.status === "live");
  const pending = filtered.filter(l => l.status === "pending");
  const activeCourseObj = COURSES.find(c => c.id === activeCourse) || COURSES[0];

  const TOTAL_LIVE    = lectures.filter(l => l.status === "live").length;
  const TOTAL_PENDING = lectures.filter(l => l.status === "pending").length;
  const TOTAL_VIEWS   = lectures.reduce((a, l) => a + (l.views || 0), 0);
  const ratedLectures = lectures.filter(l => l.rating > 0);
  const AVG_RATING    = ratedLectures.length ? (ratedLectures.reduce((a, l) => a + l.rating, 0) / ratedLectures.length).toFixed(1) : 0;

  // close overlays on Escape
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") { setShowUpload(false); setSelected(null); }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  return (
    <div className="vl-root">
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {selected   && <Drawer lecture={selected} onClose={() => setSelected(null)} />}

      {/* ── PAGE HEADER ── */}
      <div className="vl-page-hd">
        <div>
          <button className="vl-back-btn" onClick={onBack}>
            <IcoChevL width={11} height={11} /> Dashboard
          </button>
          <div className="greet-tag" style={{ marginBottom: 8, marginTop: 10 }}>
            <div className="greet-pip" />
            <span className="greet-pip-txt">Semester 5 · Week 11 · {TOTAL_LIVE} Lectures Live</span>
          </div>
          <h1 className="greet-title">Video <em>Lectures</em></h1>
          <p className="greet-sub">Upload, manage, and track engagement across all your course lectures.</p>
        </div>
        <div className="vl-hd-right">
          <button className="btn btn-ghost" style={{ gap: 6, fontSize: 11 }}>
            <IcoDownload width={12} height={12} /> Export
          </button>
          <button className="btn btn-solid" style={{ gap: 6 }} onClick={() => setShowUpload(true)}>
            <IcoUpload width={13} height={13} /> Upload Lecture
          </button>
        </div>
      </div>

      {/* ── STAT STRIP (matches stat-card style from FacultyDashboard) ── */}
      <div className="vl-stat-strip">
        {[
          { cls: "sc-teal",   icon: <IcoVideo  width={17} height={17} />, val: TOTAL_LIVE,                    lbl: "Live Lectures" },
          { cls: "sc-indigo", icon: <IcoClock  width={17} height={17} />, val: "742m",                       lbl: "Total Duration" },
          { cls: "sc-violet", icon: <IcoEye    width={17} height={17} />, val: TOTAL_VIEWS.toLocaleString(),  lbl: "Total Views" },
          { cls: "sc-amber",  icon: <IcoStar   width={17} height={17} />, val: AVG_RATING,                   lbl: "Avg Rating" },
          { cls: "sc-rose",   icon: <IcoAlert  width={17} height={17} />, val: TOTAL_PENDING,                lbl: "Pending Upload" },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.cls}`} style={{ cursor: "default" }}>
            <div className="stat-ic">{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── COURSE TABS ── */}
      <div className="vl-course-tabs">
        {COURSES.map(c => (
          <button key={c.id}
            className={`vl-ctab ${activeCourse === c.id ? "vl-ctab--active" : ""}`}
            style={activeCourse === c.id
              ? { borderColor: c.border, color: c.color, background: c.bg }
              : {}}
            onClick={() => { setActiveCourse(c.id); setFilterUnit("all"); }}>
            <span className="vl-ctab-dot" style={{ background: c.id === "all" ? "var(--indigo-l)" : c.color }} />
            {c.code}
            <span className="vl-ctab-count">
              {c.id === "all"
                ? lectures.filter(l => l.status === "live").length
                : lectures.filter(l => l.courseId === c.id && l.status === "live").length}
            </span>
          </button>
        ))}
      </div>

      {/* ── TOOLBAR ── */}
      <div className="vl-toolbar">
        {/* Search */}
        <div className="vl-search">
          <IcoSearch width={12} height={12} style={{ color: "var(--text3)", flexShrink: 0 }} />
          <input className="vl-search-inp" value={search}
            placeholder="Search lectures, topics, tags…"
            onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="vl-search-clear" onClick={() => setSearch("")}>
              <IcoClose width={9} height={9} />
            </button>
          )}
        </div>

        <div className="vl-toolbar-right">
          {/* Unit filter */}
          <select className="vl-select" value={filterUnit} onChange={e => setFilterUnit(e.target.value)}>
            {units.map(u => <option key={u} value={u}>{u === "all" ? "All Units" : u}</option>)}
          </select>

          {/* Sort */}
          <select className="vl-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="week">Week ↑</option>
            <option value="views">Views ↓</option>
            <option value="rating">Rating ↓</option>
            <option value="watch">Watch % ↓</option>
          </select>

          {/* View toggle */}
          <div className="vl-view-toggle">
            <button className={`vl-vbtn ${viewMode === "grid" ? "vl-vbtn--active" : ""}`} onClick={() => setViewMode("grid")} title="Grid view">
              <IcoGrid width={12} height={12} />
            </button>
            <button className={`vl-vbtn ${viewMode === "list" ? "vl-vbtn--active" : ""}`} onClick={() => setViewMode("list")} title="List view">
              <IcoList width={12} height={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── RESULTS BAR ── */}
      <div className="vl-results-bar">
        <span style={{ color: "var(--teal)", fontWeight: 700 }}>{live.length}</span> live
        {pending.length > 0 && (
          <> · <span style={{ color: "var(--rose)", fontWeight: 700 }}>{pending.length}</span> pending</>
        )}
        {" "}· {filtered.length} total
        {activeCourse !== "all" && (
          <span style={{ color: activeCourseObj.color }}> · {activeCourseObj.code} – {activeCourseObj.name}</span>
        )}
      </div>

      {/* ── EMPTY STATE ── */}
      {filtered.length === 0 && (
        <div className="vl-empty">
          <div style={{ fontSize: 44 }}>🎬</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 14 }}>No lectures found</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>Try a different search term or filter</div>
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {viewMode === "grid" && filtered.length > 0 && (
        <>
          {live.length > 0 && (
            <>
              <div className="vl-section-lbl">
                <IcoVideo width={13} height={13} style={{ color: "var(--teal)" }} /> Live Lectures
              </div>
              <div className="vl-grid">
                {live.map(l => <Card key={l.id} lecture={l} onSelect={setSelected} />)}
              </div>
            </>
          )}
          {pending.length > 0 && (
            <>
              <div className="vl-section-lbl" style={{ marginTop: 22 }}>
                <IcoAlert width={13} height={13} style={{ color: "var(--amber)" }} /> Pending Upload
              </div>
              <div className="vl-grid">
                {pending.map(l => <Card key={l.id} lecture={l} onSelect={setSelected} />)}
              </div>
            </>
          )}
        </>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === "list" && filtered.length > 0 && (
        <div className="panel vl-list-panel">
          <div className="vl-list-head">
            <span>#</span>
            <span></span>
            <span>Lecture</span>
            <span>Week</span>
            <span>Duration</span>
            <span>Views</span>
            <span>Watch %</span>
            <span>Rating</span>
            <span></span>
          </div>
          {filtered.map((l, i) => (
            <Row key={l.id} lecture={l} idx={i} onSelect={setSelected} />
          ))}
        </div>
      )}

      {/* ── PENDING CTA BANNER ── */}
      {TOTAL_PENDING > 0 && (
        <div className="vl-cta-banner">
          <IcoAlert width={16} height={16} style={{ color: "var(--amber)", flexShrink: 0 }} />
          <div>
            <div className="vl-cta-title">
              {TOTAL_PENDING} lecture{TOTAL_PENDING > 1 ? "s" : ""} still need to be uploaded
            </div>
            <div className="vl-cta-sub">Students are waiting — keep your course on schedule.</div>
          </div>
          <button className="btn btn-solid" style={{ marginLeft: "auto", flexShrink: 0, gap: 6 }}
            onClick={() => setShowUpload(true)}>
            <IcoUpload width={12} height={12} /> Upload Now
          </button>
        </div>
      )}
    </div>
  );
}