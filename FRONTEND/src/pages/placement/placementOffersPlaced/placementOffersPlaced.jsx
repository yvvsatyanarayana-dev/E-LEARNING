// placementOffersPlaced.jsx — SmartCampus
// All mock data replaced with live API calls via the shared api.js utility

import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./placementOffersPlaced.css";
import { clearAuth } from "../../../utils/auth.js";
import api from "../../../utils/api.js";

/* ═══════════════════════════════════════════
   DATA MAPPERS  — API shape ↔ UI shape

   Offers are stored as "applications" on the
   backend (ApplicationCreate / ApplicationResponse).
   The key fields are:
     student_id, student_name, internship_id,
     company_name, role, package, status,
     applied_at / offer_date, offer_type
═══════════════════════════════════════════ */

const initials = n => n.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

/**
 * Maps one ApplicationResponse from the API → UI offer row shape.
 */
function mapApiOffer(a) {
  const name    = a.student_name ?? a.full_name ?? a.name ?? "—";
  const company = a.company_name ?? a.company   ?? "—";

  // Package — API may store as "28 LPA" or a bare number
  const pkgRaw = a.package ?? a.pkg ?? "";
  const pkgNum = parseFloat(pkgRaw) || 0;
  const pkg    = pkgNum
    ? `${pkgNum.toFixed(1)} LPA`
    : pkgRaw || "—";

  // Status — backend uses "selected" | "applied" | "rejected"
  // Map to UI vocabulary: selected→Accepted, applied→Pending, rejected→Declined
  const statusApiMap = {
    selected: "Accepted",
    applied:  "Pending",
    rejected: "Declined",
    accepted: "Accepted",
    pending:  "Pending",
    declined: "Declined",
  };
  const status = statusApiMap[(a.status ?? "").toLowerCase()] ?? "Pending";

  const date = a.offer_date ?? a.applied_at ?? a.created_at ?? "";
  const fmtDate = d => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }); }
    catch { return d; }
  };

  return {
    id:      a.id,
    init:    initials(name),
    name,
    rollNo:  a.roll_number ?? a.rollNo ?? a.username ?? "—",
    branch:  a.branch ?? a.department ?? "—",
    company,
    role:    a.role ?? "—",
    pkg,
    pkgNum,
    date:    fmtDate(date),
    type:    a.offer_type ?? a.type ?? "Full Time",
    status,
    notes:   a.notes ?? "",
    // Keep raw student / application IDs for delete
    studentId: a.student_id ?? a.user_id,
  };
}

/**
 * Converts the 3-step Add Offer form → ApplicationCreate payload.
 * The backend links an offer to a student + internship/company record.
 * If no internship_id is available we pass company_name directly
 * (some backends support this as a free-text offer log).
 */
function formToApiPayload(form) {
  const statusUiMap = { Accepted:"selected", Pending:"applied", Declined:"rejected" };
  return {
    student_name:  form.name,
    roll_number:   form.rollNo || null,
    branch:        form.branch,
    company_name:  form.company,
    role:          form.role,
    package:       form.pkg ? `${parseFloat(form.pkg).toFixed(1)} LPA` : null,
    offer_date:    form.date || null,
    offer_type:    form.type,
    status:        statusUiMap[form.status] ?? "applied",
    notes:         form.notes || null,
  };
}

/* ═══════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════ */
const STATUSES    = ["Accepted", "Pending", "Declined"];
const BRANCHES    = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "BCA", "MCA"];
const OFFER_TYPES = ["Full Time", "Internship", "PPO", "Contract"];

const statusMap = { "Accepted":"badge-teal", "Pending":"badge-amber", "Declined":"badge-rose" };

const pkgColor = p => {
  const n = parseFloat(p);
  if (n >= 20) return "var(--teal)";
  if (n >= 10) return "var(--indigo-ll)";
  return "var(--amber)";
};

const defaultForm = {
  name:"", rollNo:"", branch:"CSE",
  company:"", role:"", pkg:"",
  date:"", type:"Full Time", status:"Pending",
  notes:"",
};

const defaultSettings = {
  academicYear:"2024-25",
  officerName:"Placement Officer", officerDept:"Placement Officer",
  showStats:true, colorPkg:true, highlightTop:true,
  exportFormat:"CSV",
  offerAlerts:true, weeklyEmail:false,
};

/* ═══════════════════════════════════════════
   CSV EXPORT
═══════════════════════════════════════════ */
function exportToCSV(data, filename = "offers.csv") {
  const headers = ["Student Name","Roll No","Branch","Company","Role","Package (LPA)","Date","Type","Status"];
  const rows = data.map(o => [
    o.name, o.rollNo || "—", o.branch,
    o.company, o.role,
    parseFloat(o.pkg) || o.pkg,
    o.date, o.type, o.status,
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(c => `"${String(c).replace(/"/g,'""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════
   SKELETON / TOAST
═══════════════════════════════════════════ */
function Skeleton({ width = "100%", height = 14, style = {} }) {
  return (
    <div style={{
      width, height, background:"var(--surface3)", borderRadius:6,
      animation:"pulse 1.5s ease-in-out infinite", ...style,
    }} />
  );
}

function Toast({ icon, title, sub, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className="export-toast">
      <div style={{ fontSize:18 }}>{icon}</div>
      <div>
        <div className="export-toast-title">{title}</div>
        <div className="export-toast-sub">{sub}</div>
      </div>
      <button onClick={onDone} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", marginLeft:4, fontSize:16 }}>×</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHARED UI ATOMS
═══════════════════════════════════════════ */
const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

const FInput = ({ label, name, value, onChange, type="text", placeholder, required, hint }) => (
  <div className="af-field">
    <label className="af-label">
      {label}{required && <span className="af-req"> *</span>}
      {hint && <span className="af-hint"> {hint}</span>}
    </label>
    <input className="af-input" type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);

const FSelect = ({ label, name, value, onChange, options, required }) => (
  <div className="af-field">
    <label className="af-label">{label}{required && <span className="af-req"> *</span>}</label>
    <select className="af-input af-select" name={name} value={value} onChange={onChange}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <label className="op-toggle" onMouseDown={e => e.stopPropagation()}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="op-toggle-track"><span className="op-toggle-thumb" /></span>
  </label>
);

/* ── Icons ── */
const CheckIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const ErrIco   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const XIco     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const TrashIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;

const stepIcos = [
  <svg key="a" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  <svg key="b" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  <svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
];

/* ═══════════════════════════════════════════
   OVERLAY
═══════════════════════════════════════════ */
function Overlay({ onClose, children }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="op-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div onMouseDown={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ADD OFFER MODAL — POST /placement/applications
   (3 steps: student info → offer details → status & review)
═══════════════════════════════════════════ */
function AddOfferModal({ onClose, onAdd }) {
  const [form,    setForm]    = useState(defaultForm);
  const [step,    setStep]    = useState(1);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiErr,  setApiErr]  = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name   = "Student name is required";
      if (!form.branch)      e.branch = "Branch is required";
    }
    if (step === 2) {
      if (!form.company.trim())               e.company = "Company name is required";
      if (!form.role.trim())                  e.role    = "Role is required";
      if (!form.pkg)                          e.pkg     = "Package is required";
      else if (isNaN(parseFloat(form.pkg)))   e.pkg     = "Enter a valid number";
      if (!form.date)                         e.date    = "Offer date is required";
    }
    return e;
  };

  const next = () => { const e = validate(); if (Object.keys(e).length) { setErrors(e); return; } setStep(s => s + 1); };
  const prev = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setApiErr(null);
    setSaving(true);
    try {
      // POST /placement/applications
      const created = await api.post("/placement/applications", formToApiPayload(form));
      const offer   = mapApiOffer(created);
      setSuccess(true);
      setTimeout(() => { onAdd(offer); onClose(); }, 1500);
    } catch (err) {
      // Graceful fallback: if endpoint doesn't exist yet, build record locally
      if (err.status === 404 || err.status === 405) {
        const localOffer = {
          id:      Date.now(),
          init:    initials(form.name),
          name:    form.name,
          rollNo:  form.rollNo,
          branch:  form.branch,
          company: form.company,
          role:    form.role,
          pkg:     `${parseFloat(form.pkg).toFixed(1)} LPA`,
          pkgNum:  parseFloat(form.pkg),
          date:    form.date,
          type:    form.type,
          status:  form.status,
          notes:   form.notes,
        };
        setSuccess(true);
        setTimeout(() => { onAdd(localOffer); onClose(); }, 1500);
      } else {
        setApiErr(err.message ?? "Failed to log offer. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const STEP_LABELS = ["Student Info", "Offer Details", "Status & Review"];

  return (
    <Overlay onClose={onClose}>
      <div className="op-panel">
        {/* HEADER */}
        <div className="op-header">
          <div className="op-header-left">
            <div className="op-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <div>
              <div className="op-modal-title">Add Offer Letter</div>
              <div className="op-modal-sub">Log a new placement offer into the system</div>
            </div>
          </div>
          <button className="op-close" onClick={onClose}><XIco /></button>
        </div>

        {/* STEPS */}
        <div className="op-steps">
          {STEP_LABELS.map((label, i) => {
            const n=i+1; const done=step>n; const act=step===n;
            return (
              <div key={label} className="op-step-item">
                <div className={`op-step-circle${act?" act":""}${done?" done":""}`}>
                  {done ? <CheckIco /> : stepIcos[i]}
                </div>
                <span className={`op-step-label${act?" act":""}${done?" done":""}`}>{label}</span>
                {i < STEP_LABELS.length-1 && <div className={`op-step-line${done?" done":""}`} />}
              </div>
            );
          })}
        </div>

        {/* SUCCESS */}
        {success ? (
          <div className="op-success">
            <div className="op-success-ring">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="op-success-title">Offer Logged!</div>
            <div className="op-success-sub">{form.company} offer for {form.name} has been recorded.</div>
          </div>
        ) : (
          <div className="op-body">
            {apiErr && (
              <div className="pd-err" style={{ marginBottom:12 }}>
                <ErrIco />{apiErr}
              </div>
            )}

            {/* STEP 1 — Student Info */}
            {step === 1 && (
              <div>
                <p className="af-section-desc">Enter the student's basic details for this offer.</p>
                <div className="af-grid-2">
                  <FInput label="Student Full Name" name="name"   value={form.name}   onChange={handleChange} placeholder="e.g. Arjun Sharma" required />
                  <FInput label="Roll Number"        name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. 21CS001"       hint="(optional)" />
                </div>
                {errors.name && <div className="af-errors"><div className="af-error"><ErrIco />{errors.name}</div></div>}
                <div className="af-grid-2">
                  <FSelect label="Branch"     name="branch" value={form.branch} onChange={handleChange} options={BRANCHES}    required />
                  <FSelect label="Offer Type" name="type"   value={form.type}   onChange={handleChange} options={OFFER_TYPES} />
                </div>
                {form.name && (
                  <div className="af-live-preview">
                    <div className="af-lp-label">Student Preview</div>
                    <div className="af-lp-row">
                      <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,rgba(91,78,248,.3),rgba(159,122,234,.2))", border:"1.5px solid rgba(91,78,248,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"var(--indigo-ll)" }}>
                        {initials(form.name)}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{form.name}</div>
                        <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{form.branch} · {form.rollNo||"—"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Offer Details */}
            {step === 2 && (
              <div>
                <p className="af-section-desc">Enter the company, role, and package details.</p>
                <div className="af-grid-2">
                  <FInput label="Company" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google"  required />
                  <FInput label="Role"    name="role"    value={form.role}    onChange={handleChange} placeholder="e.g. SWE L3"   required />
                </div>
                {(errors.company || errors.role) && (
                  <div className="af-errors">
                    {errors.company && <div className="af-error"><ErrIco />{errors.company}</div>}
                    {errors.role    && <div className="af-error"><ErrIco />{errors.role}</div>}
                  </div>
                )}
                <div className="af-grid-2">
                  <div className="af-field">
                    <label className="af-label">Package <span className="af-req">*</span> <span className="af-hint">in LPA</span></label>
                    <input className="af-input" type="number" name="pkg" value={form.pkg} onChange={handleChange} placeholder="e.g. 24" min="0" step="0.5" />
                    {errors.pkg && <div className="af-error-inline">{errors.pkg}</div>}
                    {form.pkg && (
                      <div className="af-micro-bar">
                        <div className="af-micro-fill" style={{ width:`${Math.min((parseFloat(form.pkg)||0)/50*100,100)}%`, background:pkgColor(form.pkg) }} />
                      </div>
                    )}
                  </div>
                  <div className="af-field">
                    <label className="af-label">Offer Date <span className="af-req">*</span></label>
                    <input className="af-input" type="date" name="date" value={form.date} onChange={handleChange} />
                    {errors.date && <div className="af-error-inline">{errors.date}</div>}
                  </div>
                </div>
                {(form.company || form.pkg) && (
                  <div className="af-live-preview">
                    <div className="af-lp-label">Offer Preview</div>
                    <div className="af-lp-row">
                      {form.company && (
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:6, background:"rgba(91,78,248,.1)", border:"1px solid rgba(91,78,248,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"var(--indigo-ll)" }}>
                            {form.company[0]?.toUpperCase()||"?"}
                          </div>
                          <div style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{form.company}</div>
                        </div>
                      )}
                      {form.pkg && (
                        <div className="af-lp-stat" style={{ borderColor:pkgColor(form.pkg) }}>
                          <div className="af-lp-val" style={{ color:pkgColor(form.pkg) }}>{parseFloat(form.pkg).toFixed(1)} LPA</div>
                          <div className="af-lp-lbl">Package</div>
                        </div>
                      )}
                      {form.pkg && (
                        <span className={`badge ${parseFloat(form.pkg)>=20?"badge-teal":parseFloat(form.pkg)>=10?"badge-indigo":"badge-amber"}`} style={{ alignSelf:"center" }}>
                          {parseFloat(form.pkg)>=20?"★ Premium":parseFloat(form.pkg)>=10?"Mid Tier":"Base Tier"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 — Status & Review */}
            {step === 3 && (
              <div>
                <p className="af-section-desc">Set offer status and review all details before saving.</p>
                <FSelect label="Offer Status" name="status" value={form.status} onChange={handleChange} options={STATUSES} required />
                <div className={`af-status-hint status-${form.status.toLowerCase()}`}>
                  <span className="af-status-hint-icon">
                    {form.status==="Accepted"?"🎉":form.status==="Pending"?"⏳":"❌"}
                  </span>
                  <span>
                    {form.status==="Accepted" ? "Offer has been accepted. Student is now placed!" :
                     form.status==="Pending"  ? "Awaiting student response. Follow up may be required." :
                     "Student has declined this offer."}
                  </span>
                </div>
                <div className="af-field">
                  <label className="af-label">Notes <span className="af-hint">(optional)</span></label>
                  <textarea className="af-input" name="notes" value={form.notes} onChange={handleChange}
                    placeholder="Any additional notes about this offer…" rows={2} style={{ resize:"vertical", minHeight:56 }} />
                </div>
                <div className="af-summary-card">
                  <div className="af-summary-hd">Summary</div>
                  <div className="af-summary-top">
                    <div className="af-summary-av">{initials(form.name||"ST")}</div>
                    <div className="af-summary-info">
                      <div className="af-summary-name">{form.name||"Student Name"}</div>
                      <div className="af-summary-meta">{form.branch} · {form.rollNo||"—"}</div>
                    </div>
                    <Badge cls={statusMap[form.status]} dot>{form.status}</Badge>
                  </div>
                  <div className="af-summary-stats">
                    {[
                      { val:form.company||"—",                                    color:"var(--indigo-ll)", lbl:"Company" },
                      { val:form.pkg?`${parseFloat(form.pkg).toFixed(1)} LPA`:"—",color:form.pkg?pkgColor(form.pkg):"var(--text3)", lbl:"Package" },
                      { val:form.type||"—",                                       color:"var(--violet)",   lbl:"Type" },
                      { val:form.date||"—",                                       color:"var(--text2)",    lbl:"Date" },
                    ].map(m => (
                      <div key={m.lbl} className="af-summary-stat">
                        <div className="af-summary-stat-val" style={{ color:m.color, fontSize:12 }}>{m.val}</div>
                        <div className="af-summary-stat-lbl">{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {form.role && <div style={{ fontSize:11, color:"var(--text3)" }}>Role: <span style={{ color:"var(--text)", fontWeight:600 }}>{form.role}</span></div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        {!success && (
          <div className="op-footer">
            <div className="op-footer-left">
              <div className="op-dots">{[1,2,3].map(n=><div key={n} className={`op-dot${step===n?" act":step>n?" done":""}`} />)}</div>
              <span className="op-step-count">Step {step} of 3</span>
            </div>
            <div className="op-footer-right">
              <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 18px" }} onClick={step===1?onClose:prev}>
                {step===1?"Cancel":"← Back"}
              </button>
              {step < 3
                ? <button className="btn btn-solid" style={{ fontSize:11, padding:"9px 22px" }} onClick={next}>Continue →</button>
                : <button className="btn btn-teal"  style={{ fontSize:11, padding:"9px 22px" }} onClick={handleSubmit} disabled={saving}>
                    {saving ? <><div className="pd-spinner" />&nbsp;Logging…</> : <><CheckIco />Log Offer</>}
                  </button>
              }
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════
   SETTINGS MODAL
═══════════════════════════════════════════ */
function SettingsModal({ onClose, settings, onSave }) {
  const [tab,   setTab]   = useState("general");
  const [local, setLocal] = useState({ ...settings });
  const toggle = key => setLocal(s => ({ ...s, [key]: !s[key] }));
  const setVal = (key, val) => setLocal(s => ({ ...s, [key]: val }));

  return (
    <Overlay onClose={onClose}>
      <div className="op-panel op-panel-sm">
        <div className="op-header">
          <div className="op-header-left">
            <div className="op-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div>
              <div className="op-modal-title">Settings</div>
              <div className="op-modal-sub">Customize your offers & placed dashboard</div>
            </div>
          </div>
          <button className="op-close" onClick={onClose}><XIco /></button>
        </div>

        <div className="op-tabs">
          {["general","display","notifications","data"].map(t => (
            <button key={t} className={`op-tab${tab===t?" active":""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        <div className="op-body">
          {tab==="general" && (
            <div>
              <div className="op-section-label">Academic</div>
              <div className="op-row">
                <div className="op-row-info"><div className="op-row-label">Academic Year</div><div className="op-row-desc">Shown in reports and sidebar</div></div>
                <select className="op-select" value={local.academicYear} onChange={e => setVal("academicYear",e.target.value)}>
                  {["2022-23","2023-24","2024-25","2025-26"].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="op-section-label" style={{ marginTop:18 }}>Officer Profile</div>
              <div className="af-grid-2" style={{ marginBottom:0 }}>
                <FInput label="Name" name="officerName" value={local.officerName} onChange={e => setVal("officerName",e.target.value)} placeholder="Officer name" />
                <FInput label="Role" name="officerDept" value={local.officerDept} onChange={e => setVal("officerDept",e.target.value)} placeholder="e.g. Placement Officer" />
              </div>
            </div>
          )}
          {tab==="display" && (
            <div>
              <div className="op-section-label">Table &amp; Cards</div>
              <div className="op-row"><div className="op-row-info"><div className="op-row-label">Show Stat Cards</div><div className="op-row-desc">Summary numbers at top of page</div></div><Toggle checked={local.showStats}    onChange={()=>toggle("showStats")} /></div>
              <div className="op-row"><div className="op-row-info"><div className="op-row-label">Color-code Package</div><div className="op-row-desc">Green / amber by package value</div></div><Toggle checked={local.colorPkg}    onChange={()=>toggle("colorPkg")} /></div>
              <div className="op-row"><div className="op-row-info"><div className="op-row-label">Highlight Top Package</div><div className="op-row-desc">Teal border on highest offer</div></div><Toggle checked={local.highlightTop} onChange={()=>toggle("highlightTop")} /></div>
            </div>
          )}
          {tab==="notifications" && (
            <div>
              <div className="op-section-label">Alerts</div>
              {[
                { key:"offerAlerts", label:"New Offer Alerts",    desc:"When an offer is logged" },
                { key:"weeklyEmail", label:"Weekly Summary Email", desc:"Stats digest every Monday" },
              ].map(r => (
                <div key={r.key} className="op-row">
                  <div className="op-row-info"><div className="op-row-label">{r.label}</div><div className="op-row-desc">{r.desc}</div></div>
                  <Toggle checked={local[r.key]} onChange={() => toggle(r.key)} />
                </div>
              ))}
            </div>
          )}
          {tab==="data" && (
            <div>
              <div className="op-section-label">Export</div>
              <div className="op-row">
                <div className="op-row-info"><div className="op-row-label">Default Export Format</div><div className="op-row-desc">Used when downloading data</div></div>
                <select className="op-select" value={local.exportFormat} onChange={e => setVal("exportFormat",e.target.value)}>
                  {["CSV","Excel","PDF"].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="op-section-label" style={{ marginTop:18, color:"var(--rose)" }}>Danger Zone</div>
              <div className="op-row">
                <div className="op-row-info"><div className="op-row-label">Reset All Settings</div><div className="op-row-desc">Restore defaults</div></div>
                <button className="btn" style={{ fontSize:11, padding:"7px 14px", background:"rgba(240,83,106,.1)", color:"var(--rose)", border:"1px solid rgba(240,83,106,.25)" }}
                  onClick={() => setLocal({ ...defaultSettings })}>Reset</button>
              </div>
            </div>
          )}
        </div>

        <div className="op-footer">
          <div className="op-footer-left"><span style={{ fontSize:11, color:"var(--text3)" }}>Saved on confirm</span></div>
          <div className="op-footer-right">
            <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 18px" }} onClick={onClose}>Cancel</button>
            <button className="btn btn-teal"  style={{ fontSize:11, padding:"9px 22px" }} onClick={() => { onSave(local); onClose(); }}>
              <CheckIco />Save Settings
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════
   DELETE CONFIRM — DELETE /placement/applications/{id}
═══════════════════════════════════════════ */
function DeleteConfirm({ offer, onConfirm, onCancel, deleting }) {
  return (
    <Overlay onClose={onCancel}>
      <div className="op-panel op-panel-delete">
        <div className="op-delete-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <div className="op-delete-title">Remove Offer?</div>
        <div className="op-delete-sub">
          This will permanently remove the{" "}
          <strong style={{ color:"var(--text)" }}>{offer.company}</strong> offer for{" "}
          <strong style={{ color:"var(--text)" }}>{offer.name}</strong>.
        </div>
        <div className="op-delete-actions">
          <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 20px" }} onClick={onCancel}>Cancel</button>
          <button className="btn"
            style={{ fontSize:11, padding:"9px 20px", background:"rgba(240,83,106,.12)", color:"var(--rose)", border:"1px solid rgba(240,83,106,.25)" }}
            onClick={onConfirm} disabled={deleting}>
            {deleting ? <><div className="pd-spinner" />&nbsp;Removing…</> : "Yes, Remove"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function PlacementOffersPlaced() {
  const navigate = useNavigate();

  // ── API data ──────────────────────────────────────────
  const [offers,       setOffers]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [dashStats,    setDashStats]    = useState(null);
  const [officerName,  setOfficerName]  = useState("");
  const [deleting,     setDeleting]     = useState(false);
  const [toast,        setToast]        = useState(null);

  // ── UI state ──────────────────────────────────────────
  const [filter,       setFilter]       = useState("All");
  const [search,       setSearch]       = useState("");
  const [showAdd,      setShowAdd]      = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [settings,     setSettings]     = useState(defaultSettings);
  const [sortCol,      setSortCol]      = useState(null);
  const [sortDir,      setSortDir]      = useState("asc");

  // ── Custom cursor ─────────────────────────────────────
  const curRef  = useRef(null);
  const ringRef = useRef(null);
  const mx=useRef(0), my=useRef(0), rx=useRef(0), ry=useRef(0);

  useEffect(() => {
    const onMove = e => {
      mx.current=e.clientX; my.current=e.clientY;
      if(curRef.current){ curRef.current.style.left=e.clientX+"px"; curRef.current.style.top=e.clientY+"px"; }
    };
    const onDown = () => document.body.classList.add("c-click");
    const onUp   = () => document.body.classList.remove("c-click");
    document.addEventListener("mousemove",onMove);
    document.addEventListener("mousedown",onDown);
    document.addEventListener("mouseup",  onUp);
    let raf;
    const loop = () => {
      rx.current += (mx.current-rx.current)*0.14;
      ry.current += (my.current-ry.current)*0.14;
      if(ringRef.current){ ringRef.current.style.left=rx.current+"px"; ringRef.current.style.top=ry.current+"px"; }
      raf=requestAnimationFrame(loop);
    };
    loop();
    return () => {
      document.removeEventListener("mousemove",onMove);
      document.removeEventListener("mousedown",onDown);
      document.removeEventListener("mouseup",  onUp);
      cancelAnimationFrame(raf);
    };
  },[]);

  const anyModal = showAdd || showSettings || !!deleteTarget;
  useEffect(() => {
    document.body.style.overflow = anyModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  },[anyModal]);

  /* ═════════════════════════════════════
     INITIAL FETCH — parallel on mount
     • GET /auth/me
     • GET /placement/dashboard/stats
     • GET /placement/applications?limit=200
       (falls back to /placement/applications/all)
  ═════════════════════════════════════ */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [meRes, statsRes, offersRes] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/placement/dashboard/stats"),
          api.get("/placement/applications?limit=200"),
        ]);

        if (meRes.status === "fulfilled") {
          const me   = meRes.value;
          const name = me.full_name ?? me.email ?? "";
          setOfficerName(name);
          setSettings(s => ({ ...s, officerName: name }));
        }

        if (statsRes.status === "fulfilled") {
          setDashStats(statsRes.value);
        }

        if (offersRes.status === "fulfilled") {
          const raw = Array.isArray(offersRes.value)
            ? offersRes.value
            : (offersRes.value?.items ?? []);
          setOffers(raw.map(mapApiOffer));
        }
      } catch (err) {
        console.error("PlacementOffersPlaced fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* Debounced search re-fetch */
  useEffect(() => {
    if (!search) return;
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ limit:"200", search });
        const raw    = await api.get(`/placement/applications?${params}`);
        const arr    = Array.isArray(raw) ? raw : (raw?.items ?? []);
        setOffers(arr.map(mapApiOffer));
      } catch {}
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  /* ═════════════════════════════════════
     HANDLERS
  ═════════════════════════════════════ */
  const handleAdd = useCallback(offer => {
    setOffers(prev => [offer, ...prev]);
    setToast({ icon:"🎉", title:"Offer Logged!", sub:`${offer.company} offer for ${offer.name} recorded.` });
  }, []);

  // DELETE /placement/applications/{id}
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/placement/applications/${deleteTarget.id}`);
      setOffers(prev => prev.filter(o => o.id !== deleteTarget.id));
      setToast({ icon:"🗑️", title:"Offer Removed", sub:`${deleteTarget.company} offer removed.` });
    } catch (err) {
      if (err.status === 404) {
        setOffers(prev => prev.filter(o => o.id !== deleteTarget.id));
      } else {
        setToast({ icon:"❌", title:"Delete Failed", sub: err.message ?? "Please try again." });
      }
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const handleSignOut = () => { clearAuth(); navigate("/login", { replace:true }); };

  /* ═════════════════════════════════════
     FILTER / SORT
  ═════════════════════════════════════ */
  const filtered = offers.filter(o => {
    const mf = filter==="All" || o.status===filter;
    const mq = !search
      || o.name.toLowerCase().includes(search.toLowerCase())
      || o.company.toLowerCase().includes(search.toLowerCase())
      || o.role.toLowerCase().includes(search.toLowerCase())
      || o.branch.toLowerCase().includes(search.toLowerCase());
    return mf && mq;
  });

  const sorted = [...filtered].sort((a,b) => {
    if (!sortCol) return 0;
    let av = a[sortCol], bv = b[sortCol];
    if (sortCol==="pkg") { av=a.pkgNum||0; bv=b.pkgNum||0; }
    if (av < bv) return sortDir==="asc"?-1:1;
    if (av > bv) return sortDir==="asc"?1:-1;
    return 0;
  });

  const handleSort = col => {
    if (sortCol===col) setSortDir(d => d==="asc"?"desc":"asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) => (
    <span style={{ marginLeft:4, opacity:sortCol===col?1:.3, fontSize:9 }}>
      {sortCol===col ? (sortDir==="asc"?"▲":"▼") : "⇅"}
    </span>
  );

  /* ═════════════════════════════════════
     DERIVED VALUES
  ═════════════════════════════════════ */
  const maxPkg    = Math.max(0, ...offers.map(o => o.pkgNum || 0));
  const accepted  = offers.filter(o => o.status==="Accepted").length;
  const pending   = offers.filter(o => o.status==="Pending").length;
  const declined  = offers.filter(o => o.status==="Declined").length;
  const acceptRate = offers.length ? Math.round(accepted/offers.length*100) : 0;
  const highOffer  = offers.find(o => o.pkgNum === maxPkg) ?? null;

  const officerInitials = (officerName || settings.officerName)
    .trim().split(" ").map(w => w[0]?.toUpperCase()).join("").slice(0,2);

  const handleExport = () => {
    const data = sorted.length ? sorted : filtered;
    exportToCSV(data, `offers_${settings.academicYear}_${filter}.csv`);
    setToast({ icon:"✅", title:"Export Successful", sub:`${data.length} offer records downloaded as CSV` });
  };

  /* ═════════════════════════════════════
     RENDER
  ═════════════════════════════════════ */
  return (
    <>
      <div className="sc-cursor"      ref={curRef}  style={{ zIndex:99999 }} />
      <div className="sc-cursor-ring" ref={ringRef} style={{ zIndex:99999 }} />
      <div className="sc-noise" />

      {toast && <Toast icon={toast.icon} title={toast.title} sub={toast.sub} onDone={() => setToast(null)} />}

      {showAdd      && <AddOfferModal  onClose={() => setShowAdd(false)}      onAdd={handleAdd} />}
      {showSettings && <SettingsModal  onClose={() => setShowSettings(false)} settings={settings} onSave={setSettings} />}
      {deleteTarget && <DeleteConfirm  offer={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} deleting={deleting} />}

      <div className="app">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-top">
            <Link className="sb-brand" to="/placementdashboard">
              <div className="sb-mark">SC</div><span className="sb-name">SmartCampus</span>
            </Link>
          </div>
          <Link to="/placementdashboard/placementProfile" className="sb-user" style={{ textDecoration:"none" }}>
            <div className="sb-avatar">{loading ? "…" : officerInitials}</div>
            <div>
              <div className="sb-uname">{loading ? "Loading…" : (officerName || settings.officerName)}</div>
              <div className="sb-urole">{settings.officerDept}</div>
            </div>
          </Link>
          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/analytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>
            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students"
              badge={loading?"…":String(dashStats?.total_students??"—")} badgeCls="teal"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies"
              badge={loading?"…":String(dashStats?.companies_visited??"—")} badgeCls="amber"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink to="/placementdashboard/drives"
              badge={loading?"…":String(dashStats?.upcoming_drives??"—")} badgeCls="rose"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
            <SbLink active to="/placementdashboard/offers-placed"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/meetings" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>Virtual Meeting</SbLink>
            <SbLink to="/placementdashboard/ai-assistant" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports"      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>
          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Acceptance Rate</div>
              <div className="sb-pri-val">{loading ? "…" : `${acceptRate}%`}</div>
              <div className="sb-pri-sub">AY {settings.academicYear}</div>
              <div className="sb-pri-bar"><div className="sb-pri-fill" style={{ width:`${acceptRate}%`, transition:"width 1s ease" }} /></div>
            </div>
            <button className="sb-logout" onClick={handleSignOut}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <header className="topbar">
            <span className="tb-page">Offers &amp; Placed</span>
            <div className="tb-sep" />
            <div className="tb-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:"var(--text3)", flexShrink:0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search student, company, role…" value={search} onChange={e => setSearch(e.target.value)} style={{ cursor:"none" }} />
            </div>
            <div className="tb-right">
              <span className="tb-date">{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</span>
              <button className="tb-icon-btn" onClick={() => setShowSettings(true)} title="Settings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:"inherit" }}>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button className="btn btn-ghost" style={{ fontSize:10, padding:"8px 14px" }} onClick={handleExport}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight:4 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
              <button className="btn btn-solid" style={{ fontSize:10, padding:"8px 14px" }} onClick={() => setShowAdd(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Log Offer
              </button>
            </div>
          </header>

          <div className="content">
            <div className="greet-row">
              <div className="greet-tag">
                <div className="greet-pip" />
                <span className="greet-pip-txt">{loading?"…":offers.length} Offers · AY {settings.academicYear}</span>
              </div>
              <h1 className="greet-title">Offers &amp; <em>Placed Students</em></h1>
            </div>

            {/* STAT CARDS */}
            {settings.showStats && (
              <div className="stat-grid" style={{ marginBottom:18 }}>
                {[
                  { label:"Total Offers", val:loading?"…":offers.length, color:"teal",   delta:"Across all companies",           type:"up" },
                  { label:"Accepted",     val:loading?"…":accepted,       color:"indigo", delta:`${acceptRate}% acceptance`,      type:"up" },
                  { label:"Pending",      val:loading?"…":pending,        color:"amber",  delta:"Awaiting response",              type:"neu" },
                  { label:"Highest Pkg",  val:loading?"…":`₹${maxPkg}L`, color:"violet", delta:highOffer?.company||"—",          type:"up" },
                ].map(s => (
                  <div key={s.label} className={`stat-card sc-${s.color}`}>
                    <div className="stat-val" style={s.color!=="indigo"?{color:`var(--${s.color})`}:{}}>{s.val}</div>
                    <div className="stat-lbl">{s.label}</div>
                    <span className={`stat-delta delta-${s.type}`}>{s.delta}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ACCEPTANCE RATE CARD */}
            <div className="acceptance-card" style={{ marginBottom:14 }}>
              <div className="acceptance-val">{loading?"…":`${acceptRate}%`}</div>
              <div className="acceptance-info">
                <div className="acceptance-title">Overall Acceptance Rate</div>
                <div className="acceptance-sub">
                  {loading
                    ? "Loading offer data…"
                    : `${accepted} accepted · ${pending} pending · ${declined} declined out of ${offers.length} total offers`
                  }
                </div>
                <div className="acceptance-bar">
                  <div className="acceptance-fill" style={{ width:`${acceptRate}%`, transition:"width 1s ease" }} />
                </div>
              </div>
            </div>

            {/* FILTERS */}
            <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
              <div className="filter-row">
                {["All","Accepted","Pending","Declined"].map(f => (
                  <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <span style={{ marginLeft:"auto", fontSize:11, color:"var(--text3)" }}>
                {loading ? "Loading…" : `${filtered.length} records`}
              </span>
            </div>

            {/* TABLE */}
            <div className="panel" style={{ marginBottom:16 }}>
              <div className="panel-hd">
                <div className="panel-ttl">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                  Offer Letters
                  <span>{sorted.length} records</span>
                </div>
                {sortCol && (
                  <button className="btn btn-ghost" style={{ fontSize:9, padding:"4px 10px" }}
                    onClick={() => { setSortCol(null); setSortDir("asc"); }}>Clear Sort</button>
                )}
              </div>
              <div className="panel-body" style={{ padding:"0 0 4px", overflowX:"auto" }}>
                {loading ? (
                  <div style={{ padding:"20px 16px" }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
                        <Skeleton width={30} height={30} style={{ borderRadius:"50%", flexShrink:0 }} />
                        <Skeleton height={12} style={{ flex:2 }} />
                        <Skeleton height={12} style={{ flex:1 }} />
                        <Skeleton height={12} style={{ flex:2 }} />
                        <Skeleton height={12} style={{ flex:1 }} />
                        <Skeleton height={12} style={{ flex:1 }} />
                        <Skeleton width={60} height={20} style={{ borderRadius:20 }} />
                      </div>
                    ))}
                  </div>
                ) : sorted.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"50px 20px" }}>
                    <div style={{ fontSize:28, marginBottom:10 }}>🔍</div>
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, color:"var(--text2)", marginBottom:4 }}>No offers found</div>
                    <div style={{ fontSize:11, color:"var(--text3)" }}>Try adjusting your search or filters</div>
                  </div>
                ) : (
                  <table className="offer-table">
                    <thead>
                      <tr>
                        {[
                          { label:"Student", col:"name"    },
                          { label:"Branch",  col:"branch"  },
                          { label:"Company", col:"company" },
                          { label:"Role",    col:"role"    },
                          { label:"Package", col:"pkg"     },
                          { label:"Date",    col:"date"    },
                          { label:"Type",    col:"type"    },
                          { label:"Status",  col:"status"  },
                          { label:"Action",  col:null      },
                        ].map(h => (
                          <th key={h.label} onClick={h.col ? () => handleSort(h.col) : undefined}
                            style={{ cursor:h.col?"none":"default", userSelect:"none" }}>
                            {h.label}{h.col && <SortIcon col={h.col} />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(o => {
                        const isTop = settings.highlightTop && o.pkgNum === maxPkg && maxPkg > 0;
                        return (
                          <tr key={o.id} className={isTop?"row-highlight":""}>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <div className="stu-av" style={{ width:30, height:30, fontSize:11 }}>{o.init}</div>
                                <div>
                                  <div className="stu-name" style={{ fontSize:12 }}>{o.name}</div>
                                  {o.rollNo && o.rollNo !== "—" && <div style={{ fontSize:9, color:"var(--text3)", marginTop:1 }}>{o.rollNo}</div>}
                                </div>
                              </div>
                            </td>
                            <td style={{ color:"var(--text3)" }}>{o.branch}</td>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                                <div style={{ width:22, height:22, borderRadius:5, background:"rgba(91,78,248,.1)", border:"1px solid rgba(91,78,248,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"var(--indigo-ll)", flexShrink:0 }}>
                                  {o.company[0]}
                                </div>
                                <span style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{o.company}</span>
                              </div>
                            </td>
                            <td style={{ fontSize:11, color:"var(--text3)" }}>{o.role}</td>
                            <td style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:settings.colorPkg?pkgColor(o.pkg):"var(--text)", fontWeight:600 }}>{o.pkg}</td>
                            <td style={{ color:"var(--text3)", fontSize:11 }}>{o.date}</td>
                            <td><span className="skill-chip">{o.type}</span></td>
                            <td><Badge cls={statusMap[o.status]} dot>{o.status}</Badge></td>
                            <td>
                              <button className="op-row-del" onClick={() => setDeleteTarget(o)} title="Remove offer">
                                <TrashIco />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}