/**
 * placementProfile.jsx
 * SmartCampus — Placement Officer Profile Page
 * API calls wired using the shared api.js utility (same pattern as placementDashboard.jsx)
 *
 * APIs used:
 *   GET  /auth/me                          → load officer profile
 *   PATCH /auth/me                         → update profile info
 *   GET  /placement/dashboard/stats        → glance stats
 *   GET  /placement/internships?limit=5    → recent drives for activity feed
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth } from "../../../utils/auth.js";
import api from "../../../utils/api.js";
import "./placementProfile.css";

/* ═══════════════════════════════════════════════
   FALLBACK / SEED DATA  (shown while loading or on error)
═══════════════════════════════════════════════ */
const DEFAULT_PROFILE = {
  firstName:  "Placement",
  lastName:   "Officer",
  role:       "Placement Officer",
  email:      "",
  phone:      "",
  department: "Training & Placement Cell",
  empId:      "TPC-0001",
  joined:     new Date().toISOString(),
  location:   "",
  bio:        "",
  linkedin:   "",
  twitter:    "",
  avatar:     "",
};

const DEFAULT_SETTINGS = {
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



/* ═══════════════════════════════════════════════
   INLINE SVG ICONS
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
   REUSABLE ATOMS
═══════════════════════════════════════════════ */
const SbLink = ({ to, active, icon, badge, badgeCls, children }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const FInput = ({ label, name, value, onChange, type = "text", placeholder, required, hint, error }) => (
  <div className="pp-field">
    <label className="pp-label" htmlFor={`pp-${name}`}>
      {label}{required && <span className="pp-req"> *</span>}
      {hint && <span className="pp-hint"> — {hint}</span>}
    </label>
    <input
      id={`pp-${name}`}
      className={`pp-input${error ? " pp-input-err" : ""}`}
      type={type} name={name} value={value}
      onChange={onChange} placeholder={placeholder}
    />
    {error && <span className="pp-field-err" role="alert">{I.err} {error}</span>}
  </div>
);

const FSelect = ({ label, name, value, onChange, options }) => (
  <div className="pp-field">
    <label className="pp-label" htmlFor={`pp-${name}`}>{label}</label>
    <select id={`pp-${name}`} className="pp-input pp-select" name={name} value={value} onChange={onChange}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const FTextarea = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
  <div className="pp-field">
    <label className="pp-label" htmlFor={`pp-${name}`}>{label}</label>
    <textarea id={`pp-${name}`} className="pp-input pp-textarea" name={name} value={value}
      onChange={onChange} placeholder={placeholder} rows={rows} />
  </div>
);

const Toggle = ({ id, checked, onChange, label, desc }) => (
  <div className="pp-toggle-row">
    <div className="pp-toggle-text">
      <span className="pp-toggle-label" id={`${id}-lbl`}>{label}</span>
      {desc && <span className="pp-toggle-desc">{desc}</span>}
    </div>
    <button role="switch" type="button" aria-checked={checked}
      className={`pp-toggle${checked ? " on" : ""}`} onClick={() => onChange(!checked)}>
      <span className="pp-toggle-thumb" />
    </button>
  </div>
);

const Panel = ({ title, icon, children, action, delay = 0, className = "" }) => (
  <section className={`pp-panel${className ? ` ${className}` : ""}`} style={{ animationDelay: `${delay}s` }}>
    <div className="pp-panel-hd">
      <h2 className="pp-panel-ttl"><span>{icon}</span>{title}</h2>
      {action && <div className="pp-panel-act">{action}</div>}
    </div>
    <div className="pp-panel-body">{children}</div>
  </section>
);

const Toast = ({ id, icon, title, sub, type = "success", onDismiss }) => {
  useEffect(() => { const t = setTimeout(() => onDismiss(id), 3800); return () => clearTimeout(t); }, [id, onDismiss]);
  return (
    <div className={`pp-toast pp-toast-${type}`} role="status">
      <span className="pp-toast-icon">{icon}</span>
      <div className="pp-toast-body">
        <div className="pp-toast-title">{title}</div>
        {sub && <div className="pp-toast-sub">{sub}</div>}
      </div>
      <button className="pp-toast-x" onClick={() => onDismiss(id)}>×</button>
    </div>
  );
};

const Skeleton = ({ width = "100%", height = 14, style = {} }) => (
  <div style={{ width, height, background: "var(--surface3)", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite", ...style }} />
);

/* ── Change Password Modal ── */
const ChangePasswordModal = ({ onClose, onSuccess }) => {
  const [form,   setForm]   = useState({ cur: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [busy,   setBusy]   = useState(false);
  const [done,   setDone]   = useState(false);
  const [apiErr, setApiErr] = useState(null);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handle = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: null }));
    setApiErr(null);
  };

  const validate = () => {
    const e = {};
    if (!form.cur.trim())           e.cur     = "Current password is required";
    if (form.next.length < 8)       e.next    = "Must be at least 8 characters";
    if (form.next !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setBusy(true);
    setApiErr(null);
    try {
      // POST /auth/change-password
      await api.post("/auth/change-password", {
        current_password: form.cur,
        new_password: form.next,
        confirm_password: form.confirm,
      });
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setApiErr(err.message ?? "Failed to change password. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const strength = (() => {
    const v = form.next; if (!v) return 0;
    return [v.length >= 8, /[A-Z]/.test(v), /\d/.test(v), /[^a-zA-Z0-9]/.test(v)].filter(Boolean).length;
  })();
  const strColor = ["","var(--rose)","var(--amber)","var(--indigo-ll)","var(--teal)"][strength];
  const strLabel = ["","Weak","Fair","Good","Strong"][strength];

  return (
    <div className="pp-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pp-modal pp-modal-sm" onMouseDown={e => e.stopPropagation()}>
        <div className="pp-modal-hd">
          <div className="pp-modal-hd-l">
            <div className="pp-modal-ico pp-modal-ico-rose">{I.lock}</div>
            <div>
              <div className="pp-modal-title">Change Password</div>
              <div className="pp-modal-sub">Update your account credentials</div>
            </div>
          </div>
          <button className="pp-modal-close" onClick={onClose}>{I.x}</button>
        </div>
        <div className="pp-modal-body">
          {done ? (
            <div className="pp-modal-success">
              <div className="pp-modal-success-ring">{I.check}</div>
              <div className="pp-modal-success-title">Password Updated!</div>
              <div className="pp-modal-success-sub">Credentials changed successfully.</div>
            </div>
          ) : (
            <>
              {apiErr && (
                <div className="pp-field-err" style={{ marginBottom: 12, fontSize: 11, background: "rgba(240,83,106,.08)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(240,83,106,.2)" }}>
                  {I.err} {apiErr}
                </div>
              )}
              <div className="pp-field">
                <label className="pp-label">Current Password <span className="pp-req">*</span></label>
                <input className={`pp-input${errors.cur ? " pp-input-err" : ""}`}
                  type="password" name="cur" value={form.cur} onChange={handle} placeholder="Enter current password" />
                {errors.cur && <span className="pp-field-err">{I.err} {errors.cur}</span>}
              </div>
              <div className="pp-field">
                <label className="pp-label">New Password <span className="pp-req">*</span></label>
                <input className={`pp-input${errors.next ? " pp-input-err" : ""}`}
                  type="password" name="next" value={form.next} onChange={handle} placeholder="Minimum 8 characters" />
                {errors.next && <span className="pp-field-err">{I.err} {errors.next}</span>}
              </div>
              {form.next && (
                <div className="pp-pwd-strength">
                  <div className="pp-pwd-bars">
                    {[1,2,3,4].map(n => <div key={n} className="pp-pwd-bar" style={{ background: n <= strength ? strColor : "var(--surface3)" }} />)}
                  </div>
                  <span className="pp-pwd-label" style={{ color: strColor }}>{strLabel}</span>
                </div>
              )}
              <div className="pp-field">
                <label className="pp-label">Confirm Password <span className="pp-req">*</span></label>
                <input className={`pp-input${errors.confirm ? " pp-input-err" : ""}`}
                  type="password" name="confirm" value={form.confirm} onChange={handle} placeholder="Re-enter new password" />
                {errors.confirm && <span className="pp-field-err">{I.err} {errors.confirm}</span>}
              </div>
            </>
          )}
        </div>
        {!done && (
          <div className="pp-modal-ft">
            <button className="pp-btn pp-btn-ghost" onClick={onClose}>Cancel</button>
            <button className="pp-btn pp-btn-solid" onClick={submit} disabled={busy}>
              {busy ? <><span className="pp-spinner" /> Saving…</> : <>{I.save} Update Password</>}
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
  return e;
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function PlacementProfile() {
  const navigate = useNavigate();

  /* ── API data state ── */
  const [loading,       setLoading]       = useState(true);
  const [statsLoading,  setStatsLoading]  = useState(true);
  const [dashStats,     setDashStats]     = useState(null);
  const [recentDrives,  setRecentDrives]  = useState([]);

  /* ── Profile & settings state ── */
  const [profile,       setProfile]       = useState({ ...DEFAULT_PROFILE });
  const [settings,      setSettings]      = useState({ ...DEFAULT_SETTINGS });
  const [profileDraft,  setProfileDraft]  = useState({ ...DEFAULT_PROFILE });
  const [settingsDraft, setSettingsDraft] = useState({ ...DEFAULT_SETTINGS });
  const [fieldErrors,   setFieldErrors]   = useState({});
  const [uploading,     setUploading]     = useState(false);

  /* ── Refs ── */
  const fileInputRef = useRef(null);

  /* ── Toast helpers ── */
  const pushToast = useCallback((icon, title, sub, type = "success") => {
    setToasts(prev => [...prev, { id: Date.now() + Math.random(), icon, title, sub, type }]);
  }, []);
  const dismissToast = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);

  /* ── Handlers ── */
  const handleAvatarUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const uploadRes = await api.upload("/auth/upload", file);
      const photoUrl = uploadRes.url;
      await api.patch("/auth/me", { avatar: photoUrl });
      setProfile(prev => ({ ...prev, avatar: photoUrl }));
      setProfileDraft(prev => ({ ...prev, avatar: photoUrl }));
      pushToast("📸", "Photo Updated", "Profile picture changed successfully.");
    } catch (err) {
      console.error("Photo upload failed", err);
      pushToast("❌", "Upload Failed", "Could not upload photo. Please try again.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [pushToast]);

  /* ── UI state ── */
  const [editing,      setEditing]      = useState(false);
  const [activeTab,    setActiveTab]    = useState("profile");
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [toasts,       setToasts]       = useState([]);
  const [savingInfo,   setSavingInfo]   = useState(false);

  const [savingSet,    setSavingSet]    = useState(false);
  const [searchVal,    setSearchVal]    = useState("");

  /* ── Custom cursor ── */
  const curRef  = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0), rx = useRef(0), ry = useRef(0);


  useEffect(() => {
    const onMove = e => {
      mx.current = e.clientX; my.current = e.clientY;
      if (curRef.current) { curRef.current.style.left = `${e.clientX}px`; curRef.current.style.top = `${e.clientY}px`; }
    };
    const onDown = () => document.body.classList.add("c-click");
    const onUp   = () => document.body.classList.remove("c-click");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);
    let raf;
    const loop = () => {
      rx.current += (mx.current - rx.current) * 0.13;
      ry.current += (my.current - ry.current) * 0.13;
      if (ringRef.current) { ringRef.current.style.left = `${rx.current}px`; ringRef.current.style.top = `${ry.current}px`; }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = showPwdModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showPwdModal]);

  /* ════════════════════════════════════════════
     FETCH — on mount, load profile + stats in parallel
  ════════════════════════════════════════════ */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [meRes, statsRes, drivesRes] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/placement/dashboard/stats"),
          api.get("/placement/internships?limit=5"),
        ]);

        // ── Officer profile from /auth/me ──
        if (meRes.status === "fulfilled") {
          const me = meRes.value;
          const nameParts = (me.full_name || "").split(" ");
          const mapped = {
            firstName:  nameParts[0] || "",
            lastName:   nameParts.slice(1).join(" ") || "",
            role:       me.role_label || "Placement Officer",
            email:      me.email || "",
            phone:      me.phone || "",
            department: me.department || "Training & Placement Cell",
            empId:      me.emp_id || `TPC-${String(me.id).padStart(4,"0")}`,
            joined:     me.created_at || new Date().toISOString(),
            location:   me.settings?.location || "",
            bio:        me.settings?.bio || "",
            linkedin:   me.settings?.linkedin || "",
            twitter:    me.settings?.twitter || "",
            avatar:     me.avatar || "",
          };
          setProfile(mapped);
          setProfileDraft(mapped);

          // Merge officer settings stored in user.settings
          if (me.settings) {
            const merged = { ...DEFAULT_SETTINGS, ...me.settings };
            setSettings(merged);
            setSettingsDraft(merged);
          }
        }

        // ── Dashboard KPI stats ──
        if (statsRes.status === "fulfilled") {
          setDashStats(statsRes.value);
          setStatsLoading(false);
        }

        // ── Recent drives for activity feed ──
        if (drivesRes.status === "fulfilled") {
          const raw = Array.isArray(drivesRes.value) ? drivesRes.value : (drivesRes.value?.items ?? []);
          setRecentDrives(raw);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };
    fetchAll();
  }, []);



  /* ── Computed ── */
  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase() || "PO";
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Placement Officer";

  const placementRate  = dashStats?.placement_rate  ?? 0;
  const totalStudents  = dashStats?.total_students  ?? 0;
  const placedStudents = dashStats?.placed_students ?? 0;
  const avgPri         = dashStats?.avg_pri         ?? 0;

  /* ── Build activity feed from real drive data ── */
  const activityFeed = recentDrives.map(d => ({
    id:   d.id,
    icon: "🏢",
    col:  "var(--indigo-l)",
    text: `${d.company_name} — ${d.role} drive ${d.status === "Completed" ? "completed" : "scheduled"}`,
    time: d.created_at
      ? new Date(d.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      : "Recently",
  }));

  /* ── Profile handlers ── */
  const handleProfileChange = e => {
    const { name, value } = e.target;
    setProfileDraft(d => ({ ...d, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(er => ({ ...er, [name]: null }));
  };

  const startEdit  = () => { setProfileDraft({ ...profile }); setFieldErrors({}); setEditing(true); };
  const cancelEdit = () => { setProfileDraft({ ...profile }); setFieldErrors({}); setEditing(false); };

  const saveProfileInfo = async () => {
    const e = validateProfile(profileDraft);
    if (Object.keys(e).length) { setFieldErrors(e); return; }
    setSavingInfo(true);
    try {
      // PATCH /auth/me — update name, phone, and settings fields
      await api.patch("/auth/me", {
        full_name:  `${profileDraft.firstName} ${profileDraft.lastName}`.trim(),
        phone:      profileDraft.phone,
        department: profileDraft.department,
        settings: {
          location: profileDraft.location,
          bio:      profileDraft.bio,
          linkedin: profileDraft.linkedin,
          twitter:  profileDraft.twitter,
        },
      });
      setProfile({ ...profileDraft });
      setEditing(false);
      pushToast("✅", "Profile Updated", "Your details have been saved.");
    } catch (err) {
      pushToast("❌", "Update Failed", err.message ?? "Please try again.", "error");
    } finally {
      setSavingInfo(false);
    }
  };


  /* ── Settings handlers ── */
  const handleSettingsChange = e => {
    const { name, value } = e.target;
    setSettingsDraft(d => ({ ...d, [name]: value }));
  };
  const handleToggle = key => setSettingsDraft(d => ({ ...d, [key]: !d[key] }));

  const saveSettingsData = async () => {
    setSavingSet(true);
    try {
      // PATCH /auth/me — store settings in user.settings JSON
      await api.patch("/auth/me", { settings: settingsDraft });
      setSettings({ ...settingsDraft });
      pushToast("⚙️", "Settings Saved", "Your preferences have been updated.");
    } catch (err) {
      pushToast("❌", "Save Failed", err.message ?? "Please try again.", "error");
    } finally {
      setSavingSet(false);
    }
  };

  const resetSettingsData = () => {
    setSettingsDraft({ ...DEFAULT_SETTINGS });
    pushToast("🔄", "Settings Reset", "Default preferences restored.", "info");
  };

  /* ── Security actions ── */
  const SECURITY_ITEMS = [
    { icon:"🔑", label:"Change Password",          sub:"Update account credentials",         color:"var(--indigo-ll)", action: () => setShowPwdModal(true),                                                          cta:"Change" },
    { icon:"🛡️", label:"Two-Factor Authentication", sub:"Not enabled — strongly recommended", color:"var(--rose)",      action: () => pushToast("🛡️","2FA Coming Soon","Feature in development.","info"),            cta:"Enable"  },
    { icon:"📱", label:"Active Sessions",           sub:"1 active session — this device",     color:"var(--teal)",      action: () => pushToast("📱","1 Active Session","Only this device is signed in.","info"),    cta:"View"    },
    { icon:"📦", label:"Download My Data",          sub:"Export a copy of your account data", color:"var(--violet)",    action: () => pushToast("📦","Export Queued","You'll receive an email shortly.","info"),     cta:"Export"  },
  ];

  const TABS = [
    { id:"profile",  label:"Profile Info", icon:I.user   },
    { id:"settings", label:"Settings",     icon:I.gear   },
    { id:"security", label:"Security",     icon:I.shield },
    { id:"activity", label:"Activity",     icon:I.pulse  },
  ];

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <>
      <div className="sc-cursor"      ref={curRef}  style={{ zIndex:99999 }} />
      <div className="sc-cursor-ring" ref={ringRef} style={{ zIndex:99999 }} />
      <div className="sc-noise" />

      {showPwdModal && (
        <ChangePasswordModal
          onClose={() => setShowPwdModal(false)}
          onSuccess={() => pushToast("🔐","Password Changed","Your password was updated.")}
        />
      )}

      <div className="pp-toast-stack">
        {toasts.map(t => <Toast key={t.id} {...t} onDismiss={dismissToast} />)}
      </div>

      <div className="app">
        {/* ══ SIDEBAR ══ */}
        <aside className="sidebar">
          <div className="sb-top">
            <Link to="/placementdashboard" className="sb-brand">
              <div className="sb-mark">SC</div>
              <span className="sb-name">SmartCampus</span>
            </Link>
          </div>

          <Link to="/placementdashboard/placementProfile" className="pp-sb-officer" style={{ textDecoration:"none" }}>
            <div className="sb-avatar pp-sb-av">
              {profile.avatar ? (
                <img src={profile.avatar} alt={fullName} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                initials
              )}
            </div>
            <div style={{ minWidth:0 }}>
              <div className="sb-uname">{loading ? "Loading…" : fullName}</div>
              <div className="sb-urole">{profile.role}</div>
            </div>
            <div className="pp-sb-edit-ico">{I.edit}</div>
          </Link>

          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard"              icon={I.grid}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/analytics"    icon={I.bar} badge="New">Analytics</SbLink>
            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students"     icon={I.user}  badge={statsLoading ? "…" : String(totalStudents)} badgeCls="teal">Students</SbLink>
            <SbLink to="/placementdashboard/companies"    icon={I.brief} badge={statsLoading ? "…" : String(dashStats?.total_companies ?? 0)}  badgeCls="amber">Companies</SbLink>
            <SbLink to="/placementdashboard/drives"       icon={I.file}  badge={statsLoading ? "…" : String(dashStats?.total_drives ?? 0)}  badgeCls="rose">Drives</SbLink>

            <SbLink to="/placementdashboard/offers"       icon={I.star}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships"  icon={I.box}>Internships</SbLink>
            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/ai-assistant" icon={I.zap}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports"      icon={I.file}>Reports</SbLink>
            <div className="sb-sec-label">Account</div>
            <SbLink to="/placementdashboard/placementProfile" icon={I.user} active>Profile</SbLink>
          </nav>

          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">{statsLoading ? "…" : `${placementRate}%`}</div>
              <div className="sb-pri-sub">AY {settings.academicYear} · {settings.semester}</div>
              <div className="sb-pri-bar">
                <div className="sb-pri-fill" style={{ width: statsLoading ? "0%" : `${placementRate}%`, transition: "width 1s ease" }} />
              </div>
            </div>
            <button className="sb-logout" onClick={() => { clearAuth(); navigate("/login", { replace: true }); }}>
              {I.logout} Sign Out
            </button>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <div className="main">
          <header className="topbar">
            <span className="tb-page">Profile</span>
            <div className="tb-sep" />
            <nav className="pp-breadcrumb">
              <Link to="/placementdashboard">Dashboard</Link>
              <span>›</span>
              <span>Profile</span>
            </nav>
            <div className="tb-right">
              <span className="tb-date">{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</span>
              <div className="tb-search">
                <span style={{ color:"var(--text3)", flexShrink:0 }}>{I.search}</span>
                <input type="search" placeholder="Search…" value={searchVal} onChange={e => setSearchVal(e.target.value)} style={{ cursor:"none" }} />
              </div>
              <div className="pp-tb-avatar">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={fullName} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  initials
                )}
              </div>
            </div>
          </header>

          <main className="content pp-content">

            {/* ─── HERO ─── */}
            <div className="pp-hero">
              <div className="pp-hero-av-wrap">
                <div className="pp-hero-av">
                  {loading ? "…" : profile.avatar ? (
                    <img src={profile.avatar} alt={fullName} className="pp-hero-av-img" />
                  ) : (
                    initials
                  )}
                  {uploading && <div className="pp-av-uploading"><span className="pp-spinner" /></div>}
                </div>
                <button 
                  className="pp-hero-av-btn" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {I.camera}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/*" 
                  style={{ display: "none" }} 
                />
                <span className="pp-hero-av-online" />
              </div>
              <div className="pp-hero-info">
                <div className="pp-hero-pip"><span className="pp-hero-pip-dot" />Active</div>
                <h1 className="pp-hero-name">{loading ? <Skeleton width={200} height={28} /> : fullName}</h1>
                <p className="pp-hero-sub">{profile.role} · {profile.department}</p>
                <div className="pp-hero-meta">
                  {loading ? <Skeleton width={280} height={12} /> : (<>
                    {profile.email    && <div className="pp-hero-meta-item">{I.mail}  {profile.email}</div>}
                    {profile.phone    && <div className="pp-hero-meta-item">{I.phone} {profile.phone}</div>}
                    {profile.location && <div className="pp-hero-meta-item">{I.pin}   {profile.location}</div>}
                    {profile.empId    && <div className="pp-hero-meta-item">{I.id}    ID: {profile.empId}</div>}
                  </>)}
                </div>
                <div className="pp-hero-actions">
                  <button className="pp-btn pp-btn-solid" onClick={startEdit}>{I.edit}&nbsp;Edit Profile</button>
                  <button className="pp-btn pp-btn-ghost" onClick={() => setShowPwdModal(true)}>{I.lock}&nbsp;Change Password</button>
                  <button className="pp-btn pp-btn-teal"  onClick={() => navigate("/placementdashboard")}>{I.grid}&nbsp;Dashboard</button>
                </div>
              </div>
              <div className="pp-hero-stats">
                {[
                  { val: statsLoading ? "…" : `${placementRate}%`, label:"Rate",         color:"var(--teal)"      },
                  { val: statsLoading ? "…" : placedStudents,       label:"Placed",        color:"var(--teal)"      },
                  { val: statsLoading ? "…" : Math.round(avgPri),   label:"Avg PRI",       color:"var(--indigo-ll)" },
                  { val: statsLoading ? "…" : (dashStats?.total_drives ?? recentDrives.length), label:"Drives",        color:"var(--amber)"     },

                ].map(s => (
                  <div key={s.label} className="pp-hero-stat">
                    <div className="pp-hero-stat-val" style={{ color:s.color }}>{s.val}</div>
                    <div className="pp-hero-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── TABS ─── */}
            <div className="pp-tabs" role="tablist">
              {TABS.map(t => (
                <button key={t.id} role="tab" aria-selected={activeTab === t.id}
                  className={`pp-tab${activeTab === t.id ? " active" : ""}`}
                  onClick={() => setActiveTab(t.id)}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            {/* ═══════════ TAB: PROFILE INFO ═══════════ */}
            {activeTab === "profile" && (
              <div className="pp-tab-content pp-two-col">
                <Panel title={editing ? "Edit Profile Information" : "Profile Information"} icon={I.user} delay={0.05}
                  action={!editing && <button className="pp-btn pp-btn-ghost pp-btn-sm" onClick={startEdit}>{I.edit}&nbsp;Edit</button>}>
                  {loading ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {[1,2,3,4,5].map(i => <Skeleton key={i} height={36} style={{ borderRadius:8 }} />)}
                    </div>
                  ) : editing ? (
                    <form onSubmit={e => { e.preventDefault(); saveProfileInfo(); }} noValidate>
                      <div className="pp-grid-2">
                        <FInput label="First Name" name="firstName" value={profileDraft.firstName} onChange={handleProfileChange} placeholder="First name" required error={fieldErrors.firstName} />
                        <FInput label="Last Name"  name="lastName"  value={profileDraft.lastName}  onChange={handleProfileChange} placeholder="Last name"  required error={fieldErrors.lastName}  />
                      </div>
                      <div className="pp-grid-2">
                        <FInput label="Role / Title" name="role"       value={profileDraft.role}       onChange={handleProfileChange} placeholder="e.g. Placement Officer" />
                        <FInput label="Department"   name="department" value={profileDraft.department} onChange={handleProfileChange} placeholder="Department name" />
                      </div>
                      <div className="pp-grid-2">
                        <FInput label="Email" name="email" value={profileDraft.email} onChange={handleProfileChange} type="email" placeholder="email@institution.edu" required error={fieldErrors.email} />
                        <FInput label="Phone" name="phone" value={profileDraft.phone} onChange={handleProfileChange} type="tel"   placeholder="+91 00000 00000" />
                      </div>
                      <FInput label="Location" name="location" value={profileDraft.location} onChange={handleProfileChange} placeholder="City, State" />
                      <FTextarea label="Bio" name="bio" value={profileDraft.bio} onChange={handleProfileChange} rows={4} placeholder="A short professional bio…" />
                      <div className="pp-grid-2">
                        <FInput label="LinkedIn"   name="linkedin" value={profileDraft.linkedin ?? ""} onChange={handleProfileChange} placeholder="linkedin.com/in/your-name" />
                        <FInput label="Twitter / X" name="twitter"  value={profileDraft.twitter  ?? ""} onChange={handleProfileChange} placeholder="@handle" />
                      </div>
                      <div className="pp-unsaved-warn">{I.warn} Unsaved changes — don't forget to save.</div>
                      <div className="pp-form-actions">
                        <button className="pp-btn pp-btn-ghost" type="button" onClick={cancelEdit}>{I.x}&nbsp;Cancel</button>
                        <button className="pp-btn pp-btn-solid" type="submit" disabled={savingInfo}>
                          {savingInfo ? <><span className="pp-spinner" />&nbsp;Saving…</> : <>{I.save}&nbsp;Save Changes</>}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <dl className="pp-detail-list">
                      {[
                        { term:"Full Name",   def:fullName,           icon:I.user  },
                        { term:"Role",        def:profile.role,       icon:I.id    },
                        { term:"Department",  def:profile.department, icon:I.brief },
                        { term:"Email",       def:profile.email,      icon:I.mail  },
                        { term:"Phone",       def:profile.phone || "—", icon:I.phone },
                        { term:"Employee ID", def:profile.empId,      icon:I.id    },
                        { term:"Joined",      def:new Date(profile.joined).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}), icon:I.cal },
                        { term:"Location",    def:profile.location || "—", icon:I.pin },
                      ].map(r => (
                        <div key={r.term} className="pp-detail-row">
                          <dt className="pp-detail-term"><span>{r.icon}</span>{r.term}</dt>
                          <dd className="pp-detail-def">{r.def}</dd>
                        </div>
                      ))}
                      {profile.bio && (
                        <div className="pp-detail-row pp-detail-bio-row">
                          <dt className="pp-detail-term"><span>{I.user}</span>Bio</dt>
                          <dd className="pp-detail-def pp-bio-text">{profile.bio}</dd>
                        </div>
                      )}
                      {profile.linkedin && (
                        <div className="pp-detail-row">
                          <dt className="pp-detail-term"><span>{I.link}</span>LinkedIn</dt>
                          <dd className="pp-detail-def">
                            <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="pp-social-link">{profile.linkedin}</a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                </Panel>

                <div className="pp-col-stack">


                  <Panel title="This Month" icon={I.bar} delay={0.15}>
                    <div className="pp-month-stats">
                      {[
                        { label:"Drives Added",       val:recentDrives.length,            pct:Math.min(recentDrives.length*20,100), color:"var(--indigo-ll)" },
                        { label:"Students Placed",    val:statsLoading?"…":placedStudents, pct:placementRate, color:"var(--teal)"      },
                        { label:"Avg PRI",            val:statsLoading?"…":Math.round(avgPri), pct:avgPri, color:"var(--amber)"     },
                        { label:"Total Students",     val:statsLoading?"…":totalStudents,  pct:70, color:"var(--violet)"    },
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
              <div className="pp-tab-content">
                <div className="pp-two-col">
                  <Panel title="Academic Configuration" icon={I.cal} delay={0.05}>
                    <div className="pp-settings-sec-label">Academic Period</div>
                    <div className="pp-grid-2">
                      <FSelect label="Academic Year" name="academicYear" value={settingsDraft.academicYear} onChange={handleSettingsChange} options={ACADEMIC_YEARS} />
                      <FSelect label="Semester"      name="semester"     value={settingsDraft.semester}     onChange={handleSettingsChange} options={SEMESTERS}      />
                    </div>
                    <div className="pp-settings-sec-label">Placement Thresholds</div>
                    <div className="pp-grid-2">
                      <FSelect label="Min. CGPA Threshold"   name="minCgpa"      value={settingsDraft.minCgpa}      onChange={handleSettingsChange} options={CGPA_OPTS}      />
                      <FSelect label="Default Export Format" name="exportFormat" value={settingsDraft.exportFormat} onChange={handleSettingsChange} options={EXPORT_FORMATS} />
                    </div>
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

                  <div className="pp-col-stack">
                    <Panel title="Notifications" icon={I.bell} delay={0.1}>
                      <div className="pp-toggle-list">
                        <Toggle id="driveAlerts"   checked={settingsDraft.driveAlerts}   onChange={() => handleToggle("driveAlerts")}   label="Drive Alerts"    desc="When drives are added or updated" />
                        <Toggle id="studentAlerts" checked={settingsDraft.studentAlerts} onChange={() => handleToggle("studentAlerts")} label="Student Alerts"  desc="Placement status changes" />
                        <Toggle id="weeklyDigest"  checked={settingsDraft.weeklyDigest}  onChange={() => handleToggle("weeklyDigest")}  label="Weekly Digest"   desc="Summary email every Monday" />
                        <Toggle id="autoBackup"    checked={settingsDraft.autoBackup}    onChange={() => handleToggle("autoBackup")}    label="Auto Backup"     desc="Automatically back up data" />
                      </div>
                    </Panel>
                    <Panel title="Display" icon={I.grid} delay={0.15}>
                      <div className="pp-toggle-list">
                        <Toggle id="showPriScore"   checked={settingsDraft.showPriScore}   onChange={() => handleToggle("showPriScore")}   label="Show PRI Score"   desc="Display PRI on student cards" />
                        <Toggle id="compactSidebar" checked={settingsDraft.compactSidebar} onChange={() => handleToggle("compactSidebar")} label="Compact Sidebar"  desc="Reduce sidebar width" />
                      </div>
                    </Panel>
                  </div>
                </div>
                <div className="pp-settings-bar">
                  <button className="pp-btn pp-btn-ghost" onClick={resetSettingsData}>{I.x}&nbsp;Reset Defaults</button>
                  <button className="pp-btn pp-btn-teal"  onClick={saveSettingsData} disabled={savingSet}>
                    {savingSet ? <><span className="pp-spinner" />&nbsp;Saving…</> : <>{I.save}&nbsp;Save Settings</>}
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════ TAB: SECURITY ═══════════ */}
            {activeTab === "security" && (
              <div className="pp-tab-content pp-two-col">
                <Panel title="Security Settings" icon={I.shield} delay={0.05}>
                  <ul className="pp-security-list">
                    {SECURITY_ITEMS.map(item => (
                      <li key={item.label} className="pp-security-item">
                        <span className="pp-security-ico">{item.icon}</span>
                        <div className="pp-security-info">
                          <div className="pp-security-label" style={{ color:item.color }}>{item.label}</div>
                          <div className="pp-security-sub">{item.sub}</div>
                        </div>
                        <button className="pp-btn pp-btn-ghost pp-btn-sm" onClick={item.action}>{item.cta}</button>
                      </li>
                    ))}
                  </ul>
                  <div className="pp-danger-zone">
                    <div className="pp-danger-label">Danger Zone</div>
                    <button className="pp-btn pp-btn-rose" onClick={() => { if (window.confirm("Sign out of all devices?")) { clearAuth(); navigate("/login"); } }}>
                      {I.logout}&nbsp;Sign Out All Devices
                    </button>
                  </div>
                </Panel>

                <Panel title="Security Score" icon={I.shield} delay={0.1}>
                  <div className="pp-score-wrap">
                    <div className="pp-score-ring-wrap">
                      <svg viewBox="0 0 100 100" className="pp-score-svg">
                        <circle cx="50" cy="50" r="42" className="pp-score-ring-bg" />
                        <circle cx="50" cy="50" r="42" className="pp-score-ring-fill"
                          strokeDasharray={`${2*Math.PI*42*0.72} ${2*Math.PI*42}`}
                          strokeDashoffset={String(2*Math.PI*42*0.25)} />
                      </svg>
                      <div className="pp-score-inner">
                        <div className="pp-score-num">72</div>
                        <div className="pp-score-grade">Fair</div>
                      </div>
                    </div>
                  </div>
                  <ul className="pp-checklist">
                    {[
                      { label:"Strong password set",     ok:true  },
                      { label:"Two-factor auth enabled", ok:false },
                      { label:"Email verified",          ok:true  },
                      { label:"Recovery email set",      ok:false },
                      { label:"Recent login reviewed",   ok:true  },
                    ].map(c => (
                      <li key={c.label} className={`pp-check-item${c.ok ? " ok" : ""}`}>
                        <span className="pp-check-ico">{c.ok ? I.check : I.x}</span>
                        <span>{c.label}</span>
                        {!c.ok && <span className="pp-check-fix">Fix →</span>}
                      </li>
                    ))}
                  </ul>
                </Panel>
              </div>
            )}

            {/* ═══════════ TAB: ACTIVITY ═══════════ */}
            {activeTab === "activity" && (
              <div className="pp-tab-content pp-two-col">
                <Panel title="Recent Activity" icon={I.pulse} delay={0.05}>
                  {loading ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {[1,2,3,4].map(i => <Skeleton key={i} height={44} style={{ borderRadius:10 }} />)}
                    </div>
                  ) : activityFeed.length > 0 ? (
                    <ol className="pp-activity-list">
                      {activityFeed.map(a => (
                        <li key={a.id} className="pp-activity-item">
                          <div className="pp-activity-dot" style={{ background:a.col }} />
                          <div className="pp-activity-body">
                            <div className="pp-activity-text"><span>{a.icon}</span> {a.text}</div>
                            <time className="pp-activity-time">{a.time}</time>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div style={{ textAlign:"center", padding:"30px 0", color:"var(--text3)", fontSize:12 }}>No recent activity.</div>
                  )}
                </Panel>

                <div className="pp-col-stack">
                  <Panel title="Quick Actions" icon={I.zap} delay={0.1}>
                    <div className="pp-quick-grid">
                      {[
                        { icon:"🏢", label:"Add Drive",       col:"var(--indigo-ll)", to:"/placementdashboard"          },
                        { icon:"📢", label:"Notify Students", col:"var(--teal)",      to:"/placementdashboard"          },
                        { icon:"👥", label:"View Students",   col:"var(--violet)",    to:"/placementdashboard/students" },
                        { icon:"📊", label:"Analytics",       col:"var(--amber)",     to:"/placementdashboard/analytics"},
                      ].map(a => (
                        <button key={a.label} className="pp-quick-btn" onClick={() => navigate(a.to)}>
                          <span className="pp-quick-ico">{a.icon}</span>
                          <span className="pp-quick-label" style={{ color:a.col }}>{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Stats at a Glance" icon={I.bar} delay={0.15}>
                    <div className="pp-glance-grid">
                      {[
                        { label:"Total Students",  val:statsLoading?"…":totalStudents,         color:"var(--teal)"      },
                        { label:"Placed",           val:statsLoading?"…":placedStudents,        color:"var(--teal)"      },
                        { label:"Placement Rate",   val:statsLoading?"…":`${placementRate}%`,  color:"var(--indigo-ll)" },
                        { label:"Avg PRI",          val:statsLoading?"…":Math.round(avgPri),   color:"var(--amber)"     },
                        { label:"Drives",           val:recentDrives.length,                   color:"var(--violet)"    },
                        { label:"PRI Excellent",    val:statsLoading?"…":(dashStats?.pri_distribution?.excellent??0), color:"var(--rose)" },
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

          </main>
        </div>
      </div>
    </>
  );
}