/**
 * placementProfile.jsx
 * SmartCampus — Placement Officer Profile Page
 * Route: /placementdashboard/profile  (RoleRoute: placement_officer, admin)
 *
 * Mirrors structure of placementDashboard.jsx / placementStudents.jsx:
 *   - Same sidebar, topbar, custom cursor, noise overlay, CSS-variable tokens
 *   - Reuses SbLink, Panel, FInput, FSelect, Toggle, Badge atoms
 *   - No external deps beyond react-router-dom (already in project)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./placementProfile.css";

/* ═══════════════════════════════════════════════
   SEED / STATIC DATA
═══════════════════════════════════════════════ */
const SEED_PROFILE = {
  firstName:  "Kavitha",
  lastName:   "Ramachandran",
  role:       "Placement Officer",
  email:      "kavitha.r@smartcampus.edu",
  phone:      "+91 98765 43210",
  department: "Training & Placement Cell",
  empId:      "TPC-2019-047",
  joined:     "2019-07-15",
  location:   "Bangalore, Karnataka",
  bio:        "Dedicated placement professional with 5+ years managing campus recruitment, industry partnerships, and student career development. Passionate about bridging the gap between students and top-tier companies.",
  linkedin:   "linkedin.com/in/kavitha-r",
  twitter:    "@kavitha_tpc",
};

const SEED_SETTINGS = {
  academicYear:   "2024-25",
  semester:       "Semester 5",
  minCgpa:        "6.5",
  exportFormat:   "PDF",
  driveAlerts:    true,
  studentAlerts:  true,
  weeklyDigest:   false,
  autoBackup:     true,
  showPriScore:   true,
  compactSidebar: false,
};

const ACADEMIC_YEARS = ["2022-23","2023-24","2024-25","2025-26"];
const SEMESTERS      = ["Semester 1","Semester 2","Semester 3","Semester 4",
                        "Semester 5","Semester 6","Semester 7","Semester 8"];
const EXPORT_FORMATS = ["PDF","CSV","Excel","JSON"];
const CGPA_OPTS      = ["5.0","5.5","6.0","6.5","7.0","7.5","8.0","8.5"];

const ACTIVITY = [
  { id:1, icon:"🏢", col:"var(--indigo-l)", text:"Added Amazon SDE-1 drive for March 15",           time:"2h ago"     },
  { id:2, icon:"📢", col:"var(--teal)",     text:"Notified 48 CSE students about drive deadline",   time:"4h ago"     },
  { id:3, icon:"✅", col:"var(--teal)",     text:"Marked Infosys drive Completed — 22 offers",      time:"Yesterday"  },
  { id:4, icon:"📋", col:"var(--amber)",    text:"Completed review of 14 student resumes",          time:"Yesterday"  },
  { id:5, icon:"🤝", col:"var(--indigo-l)", text:"Onboarded Google as new placement partner",       time:"3 days ago" },
  { id:6, icon:"📊", col:"var(--violet)",   text:"Generated Q3 Placement Analytics Report",         time:"5 days ago" },
  { id:7, icon:"🎯", col:"var(--teal)",     text:"Achieved 68 % placement rate milestone",          time:"1 week ago" },
];

const ACHIEVEMENTS = [
  { icon:"🏆", label:"Best Placement Officer", sub:"AY 2023-24 Award",  color:"var(--amber)"    },
  { icon:"🎯", label:"68% Placement Rate",      sub:"Current AY record", color:"var(--teal)"     },
  { icon:"🤝", label:"32 Company Partners",     sub:"Active this year",  color:"var(--indigo-ll)"},
  { icon:"⭐", label:"4.9 / 5 Rating",          sub:"Student feedback",  color:"var(--violet)"   },
];

/* ═══════════════════════════════════════════════
   INLINE SVG ICONS  (zero extra dependencies)
═══════════════════════════════════════════════ */
const I = {
  grid:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  bar:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  user:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  brief:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  file:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  star:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  box:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  zap:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  bell:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  gear:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  edit:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  save:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  x:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  camera: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  shield: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  lock:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  check:  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  search: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  pulse:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  link:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  mail:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.62 4.47 2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.38-.38a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z"/></svg>,
  pin:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  cal:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  id:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  warn:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  err:    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

/* ═══════════════════════════════════════════════
   REUSABLE ATOM COMPONENTS
═══════════════════════════════════════════════ */

/** Sidebar navigation link — mirrors sb-link from dashboard */
const SbLink = ({ to, active, icon, badge, badgeCls, children }) => (
  <Link
    to={to || "#"}
    className={`sb-link${active ? " active" : ""}`}
    aria-current={active ? "page" : undefined}
  >
    {icon}
    {children}
    {badge && (
      <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>
    )}
  </Link>
);

/** Labeled text input */
const FInput = ({ label, name, value, onChange, type = "text",
                  placeholder, required, hint, error, autoComplete }) => (
  <div className="pp-field">
    <label className="pp-label" htmlFor={`pp-${name}`}>
      {label}
      {required && <span className="pp-req" aria-hidden="true"> *</span>}
      {hint    && <span className="pp-hint"> — {hint}</span>}
    </label>
    <input
      id={`pp-${name}`}
      className={`pp-input${error ? " pp-input-err" : ""}`}
      type={type} name={name} value={value}
      onChange={onChange} placeholder={placeholder}
      required={required} autoComplete={autoComplete}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={error ? `pp-${name}-err` : undefined}
    />
    {error && (
      <span className="pp-field-err" id={`pp-${name}-err`} role="alert">
        {I.err} {error}
      </span>
    )}
  </div>
);

/** Labeled select */
const FSelect = ({ label, name, value, onChange, options, required, hint }) => (
  <div className="pp-field">
    <label className="pp-label" htmlFor={`pp-${name}`}>
      {label}
      {required && <span className="pp-req" aria-hidden="true"> *</span>}
      {hint    && <span className="pp-hint"> — {hint}</span>}
    </label>
    <select
      id={`pp-${name}`}
      className="pp-input pp-select"
      name={name} value={value}
      onChange={onChange} required={required}
    >
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  </div>
);

/** Labeled textarea */
const FTextarea = ({ label, name, value, onChange, placeholder, hint, rows = 3 }) => (
  <div className="pp-field">
    <label className="pp-label" htmlFor={`pp-${name}`}>
      {label}{hint && <span className="pp-hint"> — {hint}</span>}
    </label>
    <textarea
      id={`pp-${name}`}
      className="pp-input pp-textarea"
      name={name} value={value}
      onChange={onChange} placeholder={placeholder} rows={rows}
    />
  </div>
);

/** Accessible toggle switch */
const Toggle = ({ id, checked, onChange, label, desc }) => (
  <div className="pp-toggle-row">
    <div className="pp-toggle-text">
      <span className="pp-toggle-label" id={`${id}-lbl`}>{label}</span>
      {desc && <span className="pp-toggle-desc">{desc}</span>}
    </div>
    <button
      role="switch" type="button"
      aria-checked={checked} aria-labelledby={`${id}-lbl`}
      className={`pp-toggle${checked ? " on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="pp-toggle-thumb" aria-hidden="true" />
    </button>
  </div>
);

/** Content panel */
const Panel = ({ title, icon, children, action, delay = 0, className = "" }) => (
  <section
    className={`pp-panel${className ? ` ${className}` : ""}`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="pp-panel-hd">
      <h2 className="pp-panel-ttl">
        <span aria-hidden="true">{icon}</span>{title}
      </h2>
      {action && <div className="pp-panel-act">{action}</div>}
    </div>
    <div className="pp-panel-body">{children}</div>
  </section>
);

/** Auto-dismissing toast */
const Toast = ({ id, icon, title, sub, type = "success", onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 3800);
    return () => clearTimeout(t);
  }, [id, onDismiss]);
  return (
    <div className={`pp-toast pp-toast-${type}`} role="status" aria-live="polite">
      <span className="pp-toast-icon" aria-hidden="true">{icon}</span>
      <div className="pp-toast-body">
        <div className="pp-toast-title">{title}</div>
        {sub && <div className="pp-toast-sub">{sub}</div>}
      </div>
      <button className="pp-toast-x" onClick={() => onDismiss(id)} aria-label="Dismiss">×</button>
    </div>
  );
};

/* ── Change-password modal ── */
const ChangePasswordModal = ({ onClose, onSuccess }) => {
  const [form,   setForm]   = useState({ cur: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [busy,   setBusy]   = useState(false);
  const [done,   setDone]   = useState(false);
  const firstRef = useRef(null);

  // focus trap
  useEffect(() => { firstRef.current?.focus(); }, []);

  // ESC to close
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handle = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.cur.trim())            e.cur     = "Current password is required";
    if (form.next.length < 8)        e.next    = "Must be at least 8 characters";
    if (form.next !== form.confirm)  e.confirm = "Passwords do not match";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setBusy(true);
    setTimeout(() => {
      setBusy(false); setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    }, 900);
  };

  // password strength: 0-4
  const strength = (() => {
    const v = form.next; if (!v) return 0;
    return [v.length >= 8, /[A-Z]/.test(v), /\d/.test(v), /[^a-zA-Z0-9]/.test(v)]
      .filter(Boolean).length;
  })();
  const strColor = ["","var(--rose)","var(--amber)","var(--indigo-ll)","var(--teal)"][strength];
  const strLabel = ["","Weak","Fair","Good","Strong"][strength];

  return (
    <div
      className="pp-overlay"
      role="dialog" aria-modal="true" aria-labelledby="pwd-dlg-title"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="pp-modal pp-modal-sm" onMouseDown={e => e.stopPropagation()}>
        {/* header */}
        <div className="pp-modal-hd">
          <div className="pp-modal-hd-l">
            <div className="pp-modal-ico pp-modal-ico-rose" aria-hidden="true">{I.lock}</div>
            <div>
              <div className="pp-modal-title" id="pwd-dlg-title">Change Password</div>
              <div className="pp-modal-sub">Update your account credentials</div>
            </div>
          </div>
          <button className="pp-modal-close" onClick={onClose} aria-label="Close dialog">
            {I.x}
          </button>
        </div>

        {/* body */}
        <div className="pp-modal-body">
          {done ? (
            <div className="pp-modal-success">
              <div className="pp-modal-success-ring" aria-hidden="true">
                {I.check}
              </div>
              <div className="pp-modal-success-title">Password Updated!</div>
              <div className="pp-modal-success-sub">Credentials changed successfully.</div>
            </div>
          ) : (
            <>
              <div className="pp-field">
                <label className="pp-label" htmlFor="pwd-cur">
                  Current Password <span className="pp-req" aria-hidden="true">*</span>
                </label>
                <input
                  ref={firstRef}
                  id="pwd-cur" className={`pp-input${errors.cur ? " pp-input-err" : ""}`}
                  type="password" name="cur" value={form.cur} onChange={handle}
                  placeholder="Enter current password" autoComplete="current-password"
                  aria-invalid={errors.cur ? "true" : undefined}
                />
                {errors.cur && <span className="pp-field-err" role="alert">{I.err} {errors.cur}</span>}
              </div>

              <div className="pp-field">
                <label className="pp-label" htmlFor="pwd-next">
                  New Password <span className="pp-req" aria-hidden="true">*</span>
                </label>
                <input
                  id="pwd-next" className={`pp-input${errors.next ? " pp-input-err" : ""}`}
                  type="password" name="next" value={form.next} onChange={handle}
                  placeholder="Minimum 8 characters" autoComplete="new-password"
                  aria-invalid={errors.next ? "true" : undefined}
                />
                {errors.next && <span className="pp-field-err" role="alert">{I.err} {errors.next}</span>}
              </div>

              {/* strength meter */}
              {form.next && (
                <div className="pp-pwd-strength" aria-label={`Password strength: ${strLabel}`}>
                  <div className="pp-pwd-bars" aria-hidden="true">
                    {[1,2,3,4].map(n => (
                      <div
                        key={n}
                        className="pp-pwd-bar"
                        style={{ background: n <= strength ? strColor : "var(--surface3)" }}
                      />
                    ))}
                  </div>
                  <span className="pp-pwd-label" style={{ color: strColor }}>{strLabel}</span>
                </div>
              )}

              <div className="pp-field">
                <label className="pp-label" htmlFor="pwd-confirm">
                  Confirm Password <span className="pp-req" aria-hidden="true">*</span>
                </label>
                <input
                  id="pwd-confirm" className={`pp-input${errors.confirm ? " pp-input-err" : ""}`}
                  type="password" name="confirm" value={form.confirm} onChange={handle}
                  placeholder="Re-enter new password" autoComplete="new-password"
                  aria-invalid={errors.confirm ? "true" : undefined}
                />
                {errors.confirm && <span className="pp-field-err" role="alert">{I.err} {errors.confirm}</span>}
              </div>
            </>
          )}
        </div>

        {/* footer */}
        {!done && (
          <div className="pp-modal-ft">
            <button className="pp-btn pp-btn-ghost" type="button" onClick={onClose}>Cancel</button>
            <button
              className="pp-btn pp-btn-solid" type="button"
              onClick={submit} disabled={busy}
            >
              {busy
                ? <><span className="pp-spinner" aria-hidden="true" /> Saving…</>
                : <>{I.save} Update Password</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════════ */
const validateProfile = f => {
  const e = {};
  if (!f.firstName.trim()) e.firstName = "First name is required";
  if (!f.lastName.trim())  e.lastName  = "Last name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address";
  if (f.phone && !/^[+\d\s\-(). ]{7,}$/.test(f.phone)) e.phone = "Enter a valid phone number";
  return e;
};

/* ═══════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════ */
export default function PlacementProfile() {
  const navigate = useNavigate();

  /* ── state ── */
  const [profile,       setProfile]       = useState({ ...SEED_PROFILE });
  const [settings,      setSettings]      = useState({ ...SEED_SETTINGS });
  const [profileDraft,  setProfileDraft]  = useState({ ...SEED_PROFILE });
  const [settingsDraft, setSettingsDraft] = useState({ ...SEED_SETTINGS });
  const [fieldErrors,   setFieldErrors]   = useState({});
  const [editing,       setEditing]       = useState(false);
  const [activeTab,     setActiveTab]     = useState("profile");
  const [showPwdModal,  setShowPwdModal]  = useState(false);
  const [toasts,        setToasts]        = useState([]);
  const [savingInfo,    setSavingInfo]    = useState(false);
  const [savingSet,     setSavingSet]     = useState(false);
  const [searchVal,     setSearchVal]     = useState("");

  /* ── custom cursor ── */
  const curRef  = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0);
  const rx = useRef(0), ry = useRef(0);

  useEffect(() => {
    const onMove = e => {
      mx.current = e.clientX; my.current = e.clientY;
      if (curRef.current) {
        curRef.current.style.left = `${e.clientX}px`;
        curRef.current.style.top  = `${e.clientY}px`;
      }
    };
    const onDown  = () => document.body.classList.add("c-click");
    const onUp    = () => document.body.classList.remove("c-click");
    const onEnter = () => document.body.classList.add("c-hover");
    const onLeave = () => document.body.classList.remove("c-hover");

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);

    const selectors = "a,button,input,select,textarea,label,[tabindex]";
    const nodes = Array.from(document.querySelectorAll(selectors));
    nodes.forEach(n => { n.addEventListener("mouseenter", onEnter); n.addEventListener("mouseleave", onLeave); });

    let raf;
    const loop = () => {
      rx.current += (mx.current - rx.current) * 0.13;
      ry.current += (my.current - ry.current) * 0.13;
      if (ringRef.current) {
        ringRef.current.style.left = `${rx.current}px`;
        ringRef.current.style.top  = `${ry.current}px`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      nodes.forEach(n => { n.removeEventListener("mouseenter", onEnter); n.removeEventListener("mouseleave", onLeave); });
      cancelAnimationFrame(raf);
    };
  }, []);

  /* scroll lock when modal open */
  useEffect(() => {
    document.body.style.overflow = showPwdModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showPwdModal]);

  /* ── toast helpers ── */
  const pushToast = useCallback((icon, title, sub, type = "success") => {
    setToasts(prev => [...prev, { id: Date.now() + Math.random(), icon, title, sub, type }]);
  }, []);

  const dismissToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /* ── computed ── */
  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  /* ── profile-info handlers ── */
  const handleProfileChange = e => {
    const { name, value } = e.target;
    setProfileDraft(d => ({ ...d, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(er => ({ ...er, [name]: null }));
  };

  const startEdit = () => {
    setProfileDraft({ ...profile });
    setFieldErrors({});
    setEditing(true);
  };

  const cancelEdit = () => {
    setProfileDraft({ ...profile });
    setFieldErrors({});
    setEditing(false);
  };

  const saveProfileInfo = () => {
    const e = validateProfile(profileDraft);
    if (Object.keys(e).length) { setFieldErrors(e); return; }
    setSavingInfo(true);
    setTimeout(() => {
      setProfile({ ...profileDraft });
      setEditing(false);
      setSavingInfo(false);
      pushToast("✅", "Profile Updated", "Your details have been saved.");
    }, 900);
  };

  /* ── settings handlers ── */
  const handleSettingsChange = e => {
    const { name, value } = e.target;
    setSettingsDraft(d => ({ ...d, [name]: value }));
  };

  const handleToggle = key => setSettingsDraft(d => ({ ...d, [key]: !d[key] }));

  const saveSettingsData = () => {
    setSavingSet(true);
    setTimeout(() => {
      setSettings({ ...settingsDraft });
      setSavingSet(false);
      pushToast("⚙️", "Settings Saved", "Your preferences have been updated.");
    }, 700);
  };

  const resetSettingsData = () => {
    setSettingsDraft({ ...SEED_SETTINGS });
    pushToast("🔄", "Settings Reset", "Default preferences restored.", "info");
  };

  /* ── security actions ── */
  const SECURITY_ITEMS = [
    {
      icon:"🔑", label:"Change Password",
      sub:"Last changed 3 months ago", color:"var(--indigo-ll)",
      action: () => setShowPwdModal(true), cta:"Change",
    },
    {
      icon:"🛡️", label:"Two-Factor Authentication",
      sub:"Not enabled — strongly recommended", color:"var(--rose)",
      action: () => pushToast("🛡️","2FA Coming Soon","Feature in development.","info"), cta:"Enable",
    },
    {
      icon:"📱", label:"Active Sessions",
      sub:"1 active session — this device", color:"var(--teal)",
      action: () => pushToast("📱","1 Active Session","Only this device is signed in.","info"), cta:"View",
    },
    {
      icon:"📦", label:"Download My Data",
      sub:"Export a copy of all your account data", color:"var(--violet)",
      action: () => pushToast("📦","Export Queued","You'll receive an email shortly.","info"), cta:"Export",
    },
  ];

  /* ── tab config ── */
  const TABS = [
    { id:"profile",  label:"Profile Info",  icon:I.user   },
    { id:"settings", label:"Settings",      icon:I.gear   },
    { id:"security", label:"Security",      icon:I.shield },
    { id:"activity", label:"Activity",      icon:I.pulse  },
  ];

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <>
      {/* ── custom cursor ─────────────────────── */}
      <div className="sc-cursor"      ref={curRef}  style={{ zIndex:99999 }} aria-hidden="true" />
      <div className="sc-cursor-ring" ref={ringRef} style={{ zIndex:99999 }} aria-hidden="true" />

      {/* ── noise texture ─────────────────────── */}
      <div className="sc-noise" aria-hidden="true" />

      {/* ── password dialog ───────────────────── */}
      {showPwdModal && (
        <ChangePasswordModal
          onClose={() => setShowPwdModal(false)}
          onSuccess={() => pushToast("🔐","Password Changed","Your password was updated.")}
        />
      )}

      {/* ── toast stack ───────────────────────── */}
      <div className="pp-toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map(t => (
          <Toast key={t.id} {...t} onDismiss={dismissToast} />
        ))}
      </div>

      {/* ════════════════ APP SHELL ═════════════ */}
      <div className="app">

        {/* ══ SIDEBAR ══════════════════════════ */}
        <aside className="sidebar" aria-label="Main navigation">
          {/* brand */}
          <div className="sb-top">
            <Link to="/placementdashboard" className="sb-brand" aria-label="SmartCampus home">
              <div className="sb-mark" aria-hidden="true">SC</div>
              <span className="sb-name">SmartCampus</span>
            </Link>
          </div>

          {/* officer card */}
          <Link to="/placementdashboard/profile" className="pp-sb-officer" aria-label="My profile">
            <div className="sb-avatar pp-sb-av" aria-hidden="true">{initials}</div>
            <div style={{ minWidth:0 }}>
              <div className="sb-uname">{fullName}</div>
              <div className="sb-urole">{profile.role}</div>
            </div>
            <div className="pp-sb-edit-ico" aria-hidden="true">{I.edit}</div>
          </Link>

          {/* nav links */}
          <nav className="sb-nav" aria-label="Placement navigation">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard"              icon={I.grid}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/analytics"    icon={I.bar}  badge="New">Analytics</SbLink>

            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students"     icon={I.user}  badge="316" badgeCls="teal">Students</SbLink>
            <SbLink to="/placementdashboard/companies"    icon={I.brief} badge="8"   badgeCls="amber">Companies</SbLink>
            <SbLink to="/placementdashboard/drives"       icon={I.file}  badge="3"   badgeCls="rose">Drives</SbLink>
            <SbLink to="/placementdashboard/offers"       icon={I.star}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships"  icon={I.box}>Internships</SbLink>

            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/ai-assistant" icon={I.zap}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports"      icon={I.file}>Reports</SbLink>

            <div className="sb-sec-label">Account</div>
            <SbLink to="/placementdashboard/profile" icon={I.user} active>Profile</SbLink>
          </nav>

          {/* placement-rate widget + sign-out */}
          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">68%</div>
              <div className="sb-pri-sub">AY {settings.academicYear} · {settings.semester}</div>
              <div className="sb-pri-bar">
                <div className="sb-pri-fill" style={{ width:"68%" }} />
              </div>
            </div>
            <button
              className="sb-logout" type="button"
              onClick={() => { if (window.confirm("Sign out of SmartCampus?")) navigate("/"); }}
            >
              {I.logout} Sign Out
            </button>
          </div>
        </aside>

        {/* ══ MAIN ═════════════════════════════ */}
        <div className="main">

          {/* topbar */}
          <header className="topbar">
            <span className="tb-page">Profile</span>
            <div className="tb-sep" aria-hidden="true" />

            {/* breadcrumb */}
            <nav aria-label="Breadcrumb" className="pp-breadcrumb">
              <Link to="/placementdashboard">Dashboard</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Profile</span>
            </nav>

            <div className="tb-right">
              <span className="tb-date">Thu, 12 Mar</span>

              {/* search */}
              <div className="tb-search">
                <span aria-hidden="true" style={{ color:"var(--text3)", flexShrink:0 }}>{I.search}</span>
                <input
                  type="search"
                  placeholder="Search…"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  aria-label="Search"
                  style={{ cursor:"none" }}
                />
              </div>

              <button className="tb-icon-btn" aria-label="Notifications" onClick={() => navigate("/placementdashboard")}>
                {I.bell}
                <span className="notif-dot" aria-hidden="true" />
              </button>
              <button className="tb-icon-btn" aria-label="Settings" onClick={() => navigate("/placementdashboard")}>
                {I.gear}
              </button>

              {/* avatar chip */}
              <div className="pp-tb-avatar" aria-hidden="true">{initials}</div>
            </div>
          </header>

          {/* ── CONTENT ──────────────────────── */}
          <main className="content pp-content" id="main-content">

            {/* ─── HERO ─── */}
            <div className="pp-hero" aria-label="Profile hero">
              {/* avatar */}
              <div className="pp-hero-av-wrap">
                <div className="pp-hero-av" aria-label={`Initials: ${initials}`}>{initials}</div>
                <button
                  className="pp-hero-av-btn" type="button" aria-label="Change avatar photo"
                  onClick={() => pushToast("📷","Coming Soon","Avatar upload is in development.","info")}
                >
                  {I.camera}
                </button>
                <span className="pp-hero-av-online" aria-hidden="true" />
              </div>

              {/* info */}
              <div className="pp-hero-info">
                <div className="pp-hero-pip" aria-hidden="true">
                  <span className="pp-hero-pip-dot" />Active
                </div>
                <h1 className="pp-hero-name">{fullName}</h1>
                <p className="pp-hero-sub">{profile.role} · {profile.department}</p>

                <div className="pp-hero-meta" role="list">
                  {[
                    { icon:I.mail,  val:profile.email },
                    { icon:I.phone, val:profile.phone },
                    { icon:I.pin,   val:profile.location },
                    { icon:I.id,    val:`ID: ${profile.empId}` },
                  ].map(m => (
                    <div key={m.val} className="pp-hero-meta-item" role="listitem">
                      <span aria-hidden="true">{m.icon}</span>{m.val}
                    </div>
                  ))}
                </div>

                <div className="pp-hero-actions">
                  <button className="pp-btn pp-btn-solid" type="button" onClick={startEdit} aria-label="Edit profile">
                    {I.edit}&nbsp;Edit Profile
                  </button>
                  <button className="pp-btn pp-btn-ghost" type="button" onClick={() => setShowPwdModal(true)}>
                    {I.lock}&nbsp;Change Password
                  </button>
                  <button className="pp-btn pp-btn-teal" type="button" onClick={() => navigate("/placementdashboard")}>
                    {I.grid}&nbsp;Dashboard
                  </button>
                </div>
              </div>

              {/* hero stat chips */}
              <div className="pp-hero-stats" aria-label="Profile stats">
                {[
                  { val:"5+",  label:"Years Exp.",  color:"var(--teal)"      },
                  { val:"32",  label:"Partners",    color:"var(--indigo-ll)" },
                  { val:"214", label:"Placed",      color:"var(--teal)"      },
                  { val:"4.9", label:"Rating",      color:"var(--amber)"     },
                ].map(s => (
                  <div key={s.label} className="pp-hero-stat">
                    <div className="pp-hero-stat-val" style={{ color:s.color }}>{s.val}</div>
                    <div className="pp-hero-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>{/* /hero */}

            {/* ─── TABS ─── */}
            <div className="pp-tabs" role="tablist" aria-label="Profile sections">
              {TABS.map(t => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={activeTab === t.id}
                  aria-controls={`pp-tabpanel-${t.id}`}
                  id={`pp-tabbtn-${t.id}`}
                  className={`pp-tab${activeTab === t.id ? " active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <span aria-hidden="true">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            {/* ═══════════ TAB: PROFILE INFO ═══════════ */}
            {activeTab === "profile" && (
              <div
                id="pp-tabpanel-profile"
                role="tabpanel"
                aria-labelledby="pp-tabbtn-profile"
                className="pp-tab-content pp-two-col"
              >
                {/* LEFT — detail form / view */}
                <Panel
                  title={editing ? "Edit Profile Information" : "Profile Information"}
                  icon={I.user}
                  delay={0.05}
                  action={!editing && (
                    <button className="pp-btn pp-btn-ghost pp-btn-sm" type="button" onClick={startEdit}>
                      {I.edit}&nbsp;Edit
                    </button>
                  )}
                >
                  {editing ? (
                    <form onSubmit={e => { e.preventDefault(); saveProfileInfo(); }} noValidate>
                      <div className="pp-grid-2">
                        <FInput label="First Name" name="firstName" value={profileDraft.firstName}
                          onChange={handleProfileChange} placeholder="First name"
                          required error={fieldErrors.firstName} autoComplete="given-name" />
                        <FInput label="Last Name" name="lastName" value={profileDraft.lastName}
                          onChange={handleProfileChange} placeholder="Last name"
                          required error={fieldErrors.lastName} autoComplete="family-name" />
                      </div>
                      <div className="pp-grid-2">
                        <FInput label="Role / Title" name="role" value={profileDraft.role}
                          onChange={handleProfileChange} placeholder="e.g. Placement Officer" />
                        <FInput label="Department" name="department" value={profileDraft.department}
                          onChange={handleProfileChange} placeholder="Department name" />
                      </div>
                      <div className="pp-grid-2">
                        <FInput label="Email" name="email" value={profileDraft.email}
                          onChange={handleProfileChange} type="email" placeholder="email@institution.edu"
                          required error={fieldErrors.email} autoComplete="email" />
                        <FInput label="Phone" name="phone" value={profileDraft.phone}
                          onChange={handleProfileChange} type="tel" placeholder="+91 00000 00000"
                          error={fieldErrors.phone} autoComplete="tel" />
                      </div>
                      <div className="pp-grid-2">
                        <FInput label="Employee ID" name="empId" value={profileDraft.empId}
                          onChange={handleProfileChange} hint="read-only" />
                        <FInput label="Location" name="location" value={profileDraft.location}
                          onChange={handleProfileChange} placeholder="City, State" autoComplete="address-level2" />
                      </div>
                      <FTextarea label="Bio" name="bio" value={profileDraft.bio}
                        onChange={handleProfileChange} rows={4}
                        placeholder="A short professional bio…" hint="max 280 chars" />
                      <div className="pp-grid-2">
                        <FInput label="LinkedIn" name="linkedin" value={profileDraft.linkedin ?? ""}
                          onChange={handleProfileChange} placeholder="linkedin.com/in/your-name" />
                        <FInput label="Twitter / X" name="twitter" value={profileDraft.twitter ?? ""}
                          onChange={handleProfileChange} placeholder="@handle" />
                      </div>

                      {/* unsaved warning */}
                      <div className="pp-unsaved-warn" role="status" aria-live="polite">
                        <span aria-hidden="true">{I.warn}</span> Unsaved changes — don't forget to save.
                      </div>

                      <div className="pp-form-actions">
                        <button className="pp-btn pp-btn-ghost" type="button" onClick={cancelEdit}>
                          {I.x}&nbsp;Cancel
                        </button>
                        <button className="pp-btn pp-btn-solid" type="submit" disabled={savingInfo}>
                          {savingInfo
                            ? <><span className="pp-spinner" aria-hidden="true" />&nbsp;Saving…</>
                            : <>{I.save}&nbsp;Save Changes</>}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* VIEW MODE */
                    <dl className="pp-detail-list">
                      {[
                        { term:"Full Name",  def:fullName,          icon:I.user  },
                        { term:"Role",       def:profile.role,      icon:I.id    },
                        { term:"Department", def:profile.department,icon:I.brief },
                        { term:"Email",      def:profile.email,     icon:I.mail  },
                        { term:"Phone",      def:profile.phone,     icon:I.phone },
                        { term:"Employee ID",def:profile.empId,     icon:I.id    },
                        { term:"Joined",
                          def:new Date(profile.joined).toLocaleDateString("en-IN",
                            { day:"2-digit", month:"long", year:"numeric" }),
                          icon:I.cal },
                        { term:"Location",   def:profile.location,  icon:I.pin   },
                      ].map(r => (
                        <div key={r.term} className="pp-detail-row">
                          <dt className="pp-detail-term">
                            <span aria-hidden="true">{r.icon}</span>{r.term}
                          </dt>
                          <dd className="pp-detail-def">{r.def}</dd>
                        </div>
                      ))}

                      {/* bio */}
                      <div className="pp-detail-row pp-detail-bio-row">
                        <dt className="pp-detail-term"><span aria-hidden="true">{I.user}</span>Bio</dt>
                        <dd className="pp-detail-def pp-bio-text">{profile.bio}</dd>
                      </div>

                      {/* social links */}
                      {profile.linkedin && (
                        <div className="pp-detail-row">
                          <dt className="pp-detail-term"><span aria-hidden="true">{I.link}</span>LinkedIn</dt>
                          <dd className="pp-detail-def">
                            <a
                              href={`https://${profile.linkedin}`}
                              target="_blank" rel="noopener noreferrer"
                              className="pp-social-link"
                            >
                              {profile.linkedin}
                            </a>
                          </dd>
                        </div>
                      )}
                      {profile.twitter && (
                        <div className="pp-detail-row">
                          <dt className="pp-detail-term">
                            <span aria-hidden="true">{I.link}</span>Twitter
                          </dt>
                          <dd className="pp-detail-def">
                            <a
                              href={`https://twitter.com/${profile.twitter.replace("@","")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="pp-social-link"
                            >
                              {profile.twitter}
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                </Panel>

                {/* RIGHT — achievements + monthly stats */}
                <div className="pp-col-stack">
                  <Panel title="Achievements" icon={I.star} delay={0.1}>
                    <ul className="pp-achievements" aria-label="Achievements">
                      {ACHIEVEMENTS.map(a => (
                        <li key={a.label} className="pp-achievement-item">
                          <span className="pp-achievement-ico" aria-hidden="true">{a.icon}</span>
                          <div>
                            <div className="pp-achievement-label" style={{ color:a.color }}>{a.label}</div>
                            <div className="pp-achievement-sub">{a.sub}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Panel>

                  <Panel title="This Month" icon={I.bar} delay={0.15}>
                    <div className="pp-month-stats">
                      {[
                        { label:"Drives Managed",     val:3,  pct:60, color:"var(--indigo-ll)" },
                        { label:"Students Placed",    val:12, pct:45, color:"var(--teal)"      },
                        { label:"Resumes Reviewed",   val:28, pct:70, color:"var(--amber)"     },
                        { label:"Notifications Sent", val:14, pct:35, color:"var(--violet)"    },
                      ].map(s => (
                        <div key={s.label} className="pp-month-row">
                          <div className="pp-month-hd">
                            <span className="pp-month-label">{s.label}</span>
                            <span className="pp-month-val" style={{ color:s.color }}>{s.val}</span>
                          </div>
                          <div className="pp-month-bar-bg">
                            <div className="pp-month-bar-fill" style={{ width:`${s.pct}%`, background:s.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
            )}

            {/* ═══════════ TAB: SETTINGS ═══════════ */}
            {activeTab === "settings" && (
              <div
                id="pp-tabpanel-settings"
                role="tabpanel"
                aria-labelledby="pp-tabbtn-settings"
                className="pp-tab-content"
              >
                <div className="pp-two-col">
                  {/* LEFT */}
                  <Panel title="Academic Configuration" icon={I.cal} delay={0.05}>
                    <div className="pp-settings-sec-label">Academic Period</div>
                    <div className="pp-grid-2">
                      <FSelect label="Academic Year" name="academicYear"
                        value={settingsDraft.academicYear} onChange={handleSettingsChange}
                        options={ACADEMIC_YEARS} />
                      <FSelect label="Semester" name="semester"
                        value={settingsDraft.semester} onChange={handleSettingsChange}
                        options={SEMESTERS} />
                    </div>

                    <div className="pp-settings-sec-label">Placement Thresholds</div>
                    <div className="pp-grid-2">
                      <FSelect label="Min. CGPA Threshold" name="minCgpa"
                        value={settingsDraft.minCgpa} onChange={handleSettingsChange}
                        options={CGPA_OPTS} hint="drive eligibility" />
                      <FSelect label="Default Export Format" name="exportFormat"
                        value={settingsDraft.exportFormat} onChange={handleSettingsChange}
                        options={EXPORT_FORMATS} />
                    </div>

                    {/* live config preview */}
                    <div className="pp-config-preview">
                      <div className="pp-config-preview-label">Current Configuration</div>
                      <div className="pp-config-chips">
                        <span className="pp-chip pp-chip-teal">AY {settingsDraft.academicYear}</span>
                        <span className="pp-chip pp-chip-indigo">{settingsDraft.semester}</span>
                        <span className="pp-chip pp-chip-amber">CGPA ≥ {settingsDraft.minCgpa}</span>
                        <span className="pp-chip pp-chip-violet">{settingsDraft.exportFormat}</span>
                      </div>
                    </div>
                  </Panel>

                  {/* RIGHT */}
                  <div className="pp-col-stack">
                    <Panel title="Notifications" icon={I.bell} delay={0.1}>
                      <div className="pp-toggle-list">
                        <Toggle id="driveAlerts"   checked={settingsDraft.driveAlerts}
                          onChange={() => handleToggle("driveAlerts")}
                          label="Drive Alerts"   desc="When drives are added or updated" />
                        <Toggle id="studentAlerts" checked={settingsDraft.studentAlerts}
                          onChange={() => handleToggle("studentAlerts")}
                          label="Student Alerts" desc="Placement status changes" />
                        <Toggle id="weeklyDigest" checked={settingsDraft.weeklyDigest}
                          onChange={() => handleToggle("weeklyDigest")}
                          label="Weekly Digest"  desc="Summary email every Monday" />
                        <Toggle id="autoBackup"   checked={settingsDraft.autoBackup}
                          onChange={() => handleToggle("autoBackup")}
                          label="Auto Backup"    desc="Automatically back up data" />
                      </div>
                    </Panel>

                    <Panel title="Display" icon={I.grid} delay={0.15}>
                      <div className="pp-toggle-list">
                        <Toggle id="showPriScore" checked={settingsDraft.showPriScore}
                          onChange={() => handleToggle("showPriScore")}
                          label="Show PRI Score" desc="Display Placement Readiness Index on student cards" />
                        <Toggle id="compactSidebar" checked={settingsDraft.compactSidebar}
                          onChange={() => handleToggle("compactSidebar")}
                          label="Compact Sidebar" desc="Reduce sidebar width" />
                      </div>
                    </Panel>
                  </div>
                </div>

                {/* save / reset bar */}
                <div className="pp-settings-bar">
                  <button className="pp-btn pp-btn-ghost" type="button" onClick={resetSettingsData}>
                    {I.x}&nbsp;Reset Defaults
                  </button>
                  <button className="pp-btn pp-btn-teal" type="button" onClick={saveSettingsData} disabled={savingSet}>
                    {savingSet
                      ? <><span className="pp-spinner" aria-hidden="true" />&nbsp;Saving…</>
                      : <>{I.save}&nbsp;Save Settings</>}
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════ TAB: SECURITY ═══════════ */}
            {activeTab === "security" && (
              <div
                id="pp-tabpanel-security"
                role="tabpanel"
                aria-labelledby="pp-tabbtn-security"
                className="pp-tab-content pp-two-col"
              >
                <Panel title="Security Settings" icon={I.shield} delay={0.05}>
                  <ul className="pp-security-list" aria-label="Security options">
                    {SECURITY_ITEMS.map(item => (
                      <li key={item.label} className="pp-security-item">
                        <span className="pp-security-ico" aria-hidden="true">{item.icon}</span>
                        <div className="pp-security-info">
                          <div className="pp-security-label" style={{ color:item.color }}>{item.label}</div>
                          <div className="pp-security-sub">{item.sub}</div>
                        </div>
                        <button className="pp-btn pp-btn-ghost pp-btn-sm" type="button"
                          onClick={item.action} aria-label={`${item.cta} — ${item.label}`}>
                          {item.cta}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="pp-danger-zone">
                    <div className="pp-danger-label">Danger Zone</div>
                    <button
                      className="pp-btn pp-btn-rose" type="button"
                      onClick={() => {
                        if (window.confirm("Sign out of all devices?")) {
                          pushToast("👋","Signed Out","All sessions terminated.","info");
                          setTimeout(() => navigate("/"), 1500);
                        }
                      }}
                    >
                      {I.logout}&nbsp;Sign Out All Devices
                    </button>
                  </div>
                </Panel>

                {/* security score card */}
                <Panel title="Security Score" icon={I.shield} delay={0.1}>
                  {/* SVG ring */}
                  <div className="pp-score-wrap">
                    <div className="pp-score-ring-wrap" aria-label="Security score: 72 out of 100, Fair">
                      <svg viewBox="0 0 100 100" className="pp-score-svg" aria-hidden="true">
                        <circle cx="50" cy="50" r="42" className="pp-score-ring-bg" />
                        <circle
                          cx="50" cy="50" r="42"
                          className="pp-score-ring-fill"
                          strokeDasharray={`${2 * Math.PI * 42 * 0.72} ${2 * Math.PI * 42}`}
                          strokeDashoffset={String(2 * Math.PI * 42 * 0.25)}
                        />
                      </svg>
                      <div className="pp-score-inner">
                        <div className="pp-score-num">72</div>
                        <div className="pp-score-grade">Fair</div>
                      </div>
                    </div>
                  </div>

                  <ul className="pp-checklist" aria-label="Security checklist">
                    {[
                      { label:"Strong password set",     ok:true  },
                      { label:"Two-factor auth enabled", ok:false },
                      { label:"Email verified",          ok:true  },
                      { label:"Recovery email set",      ok:false },
                      { label:"Recent login reviewed",   ok:true  },
                    ].map(c => (
                      <li key={c.label} className={`pp-check-item${c.ok ? " ok" : ""}`}>
                        <span className="pp-check-ico" aria-hidden="true">{c.ok ? I.check : I.x}</span>
                        <span>{c.label}</span>
                        {!c.ok && <span className="pp-check-fix" aria-hidden="true">Fix →</span>}
                      </li>
                    ))}
                  </ul>
                </Panel>
              </div>
            )}

            {/* ═══════════ TAB: ACTIVITY ═══════════ */}
            {activeTab === "activity" && (
              <div
                id="pp-tabpanel-activity"
                role="tabpanel"
                aria-labelledby="pp-tabbtn-activity"
                className="pp-tab-content pp-two-col"
              >
                <Panel title="Recent Activity" icon={I.pulse} delay={0.05}>
                  <ol className="pp-activity-list" aria-label="Recent actions">
                    {ACTIVITY.map(a => (
                      <li key={a.id} className="pp-activity-item">
                        <div className="pp-activity-dot" style={{ background:a.col }} aria-hidden="true" />
                        <div className="pp-activity-body">
                          <div className="pp-activity-text">
                            <span aria-hidden="true">{a.icon}</span> {a.text}
                          </div>
                          <time className="pp-activity-time">{a.time}</time>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Panel>

                <div className="pp-col-stack">
                  {/* quick actions */}
                  <Panel title="Quick Actions" icon={I.zap} delay={0.1}>
                    <div className="pp-quick-grid">
                      {[
                        { icon:"🏢", label:"Add Drive",       col:"var(--indigo-ll)", to:"/placementdashboard"          },
                        { icon:"📢", label:"Notify Students", col:"var(--teal)",      to:"/placementdashboard"          },
                        { icon:"👥", label:"View Students",   col:"var(--violet)",    to:"/placementdashboard/students" },
                        { icon:"📊", label:"Analytics",       col:"var(--amber)",     to:"/placementdashboard/analytics"},
                      ].map(a => (
                        <button
                          key={a.label}
                          className="pp-quick-btn" type="button"
                          onClick={() => navigate(a.to)}
                          aria-label={a.label}
                        >
                          <span className="pp-quick-ico" aria-hidden="true">{a.icon}</span>
                          <span className="pp-quick-label" style={{ color:a.col }}>{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </Panel>

                  {/* glance stats */}
                  <Panel title="Stats at a Glance" icon={I.bar} delay={0.15}>
                    <div className="pp-glance-grid">
                      {[
                        { label:"Total Students",  val:"316", color:"var(--teal)"      },
                        { label:"Placed",           val:"214", color:"var(--teal)"      },
                        { label:"Placement Rate",   val:"68%", color:"var(--indigo-ll)" },
                        { label:"Avg. Package",     val:"21.4L",color:"var(--amber)"   },
                        { label:"Active Companies", val:"32",  color:"var(--violet)"   },
                        { label:"Upcoming Drives",  val:"3",   color:"var(--rose)"     },
                      ].map(s => (
                        <div key={s.label} className="pp-glance-item">
                          <div className="pp-glance-val" style={{ color:s.color }}>{s.val}</div>
                          <div className="pp-glance-lbl">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
            )}

          </main>{/* /content */}
        </div>{/* /main */}
      </div>{/* /app */}
    </>
  );
}