// placementCompanies.jsx — SmartCampus Placement Companies Page
// API calls wired using the shared api.js utility

import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./placementCompanies.css";
import { clearAuth } from "../../../utils/auth.js";
import api from "../../../utils/api.js";

/* ════════════════════════════════════════════
   DATA MAPPERS  — API shape ↔ UI shape
   The backend stores companies as "internships"
   (InternshipCreate / InternshipResponse).
════════════════════════════════════════════ */

/**
 * Maps a single internship record from the API into the card shape
 * the UI expects.  Handles both snake_case API fields and any
 * camelCase fallbacks that may exist on locally-optimistic records.
 */
function mapApiCompany(c) {
  const name    = c.company_name ?? c.name ?? "—";
  const init    = name.trim() ? name.trim()[0].toUpperCase() : "?";

  // The role field on the backend is a free-text string like
  // "Software Development Engineer · Full Time".  We split on " · "
  // to recover the role list, or fall back to splitting on commas.
  const rolesRaw = c.role ?? c.roles_str ?? "";
  const roles    = Array.isArray(c.roles)
    ? c.roles
    : rolesRaw
        .split(/[,·]/)
        .map(r => r.trim())
        .filter(Boolean);

  // status comes from the API as "Upcoming" / "Ongoing" / "Completed" /
  // "Cancelled".  Map "Ongoing" → "Active" for this page's UI vocabulary.
  const rawStatus = c.status ?? "Upcoming";
  const status    = rawStatus === "Ongoing" ? "Active" : rawStatus;

  // package — API stores as a string like "12 LPA" or "12"
  const pkgRaw = c.package ?? c.pkg ?? "";
  const pkg    = pkgRaw
    ? pkgRaw.toString().includes("LPA") ? pkgRaw : `${pkgRaw} LPA`
    : "—";

  // deadline becomes the "next drive" date shown on the card
  const nextDrive = c.deadline
    ? new Date(c.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    : c.next_drive ?? "—";

  return {
    id:           c.id,
    name,
    init,
    sector:       c.sector       ?? c.domain       ?? "Tech",
    desc:         c.description  ?? "",
    roles,
    branches:     Array.isArray(c.branches) ? c.branches : [],
    driveType:    c.drive_type   ?? c.driveType    ?? "On-Campus",
    pkg,
    minCgpa:      c.min_cgpa     ?? c.minCgpa      ?? 0,
    offers:       c.offers_count ?? c.offers       ?? 0,
    students:     c.applied_count?? c.students     ?? 0,
    status,
    nextDrive,
    website:      c.website      ?? "",
    bond:         c.bond         ?? "No",
    contactName:  c.contact_name  ?? c.contactName  ?? "",
    contactEmail: c.contact_email ?? c.contactEmail ?? "",
    contactPhone: c.contact_phone ?? c.contactPhone ?? "",
  };
}

/**
 * Converts the Add Company form state into the shape expected by
 * POST /placement/internships  (InternshipCreate schema).
 */
function formToApiPayload(form) {
  return {
    company_name:   form.name,
    // Encode role + drive type together so the dashboard can parse it
    role:           form.roles || `${form.name} Roles`,
    deadline:       form.nextDrive || null,
    package:        form.pkg ? `${form.pkg} LPA` : null,
    eligible_count: parseInt(form.students) || 0,
    min_cgpa:       parseFloat(form.minCgpa) || null,
    location:       null,
    description:    form.description || null,
    status:         // map "Active" back to API vocabulary "Ongoing"
      form.status === "Active" ? "Ongoing" : form.status,
    branches:       form.branches,
    // Extra fields — stored if the backend schema supports them
    sector:         form.sector,
    website:        form.website || null,
    drive_type:     form.driveType,
    bond:           form.bond !== "No" ? form.bond : null,
    contact_name:   form.contactName  || null,
    contact_email:  form.contactEmail || null,
    contact_phone:  form.contactPhone || null,
  };
}

/* ════════════════════════════════════════════
   CONSTANTS & HELPERS
════════════════════════════════════════════ */
const SECTORS     = ["Tech", "IT Svcs", "SaaS", "Startup", "Finance", "Core", "Consulting", "FMCG"];
const STATUSES    = ["Active", "Upcoming", "Completed", "Paused"];
const BRANCHES    = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const DRIVE_TYPES = ["On-Campus", "Off-Campus", "Pool Campus", "Virtual"];

const statusMap = {
  "Active":    "badge-teal",
  "Upcoming":  "badge-indigo",
  "Completed": "badge-amber",
  "Paused":    "badge-rose",
};

const pkgColor = pkg => {
  const n = parseFloat(pkg);
  if (n >= 25) return "var(--teal)";
  if (n >= 15) return "var(--indigo-ll)";
  if (n >= 8)  return "var(--amber)";
  return "var(--text2)";
};

const cgpaColor = c => c >= 8.5 ? "var(--teal)" : c >= 7.5 ? "var(--indigo-ll)" : "var(--amber)";

const logoColor = init => {
  const map = {
    A:"rgba(39,201,176,.15)",  B:"rgba(91,78,248,.15)",   C:"rgba(244,165,53,.15)",
    D:"rgba(240,83,106,.15)",  E:"rgba(159,122,234,.15)", F:"rgba(39,201,176,.15)",
    G:"rgba(39,201,176,.15)",  H:"rgba(91,78,248,.15)",   I:"rgba(91,78,248,.15)",
    J:"rgba(244,165,53,.15)",  K:"rgba(240,83,106,.15)",  L:"rgba(39,201,176,.15)",
    M:"rgba(91,78,248,.15)",   N:"rgba(244,165,53,.15)",  O:"rgba(159,122,234,.15)",
    P:"rgba(240,83,106,.15)",  Q:"rgba(39,201,176,.15)",  R:"rgba(91,78,248,.15)",
    S:"rgba(39,201,176,.15)",  T:"rgba(159,122,234,.15)", U:"rgba(244,165,53,.15)",
    V:"rgba(91,78,248,.15)",   W:"rgba(244,165,53,.15)",  X:"rgba(240,83,106,.15)",
    Y:"rgba(91,78,248,.15)",   Z:"rgba(240,83,106,.15)",
  };
  return map[init] || "rgba(91,78,248,.15)";
};

const logoTextColor = init => {
  const map = {
    G:"var(--teal)", M:"var(--indigo-ll)", A:"var(--amber)", T:"var(--violet)",
    Z:"var(--rose)", S:"var(--teal)",       I:"var(--indigo-ll)", W:"var(--amber)",
  };
  return map[init] || "var(--indigo-ll)";
};

const defaultForm = {
  name:"", init:"", sector:"Tech", website:"", description:"",
  roles:"", branches:[], driveType:"On-Campus",
  pkg:"", minCgpa:"", students:"0", offers:"0",
  status:"Upcoming", nextDrive:"", ctc:"", bond:"No",
  contactName:"", contactEmail:"", contactPhone:"",
};

const defaultSettings = {
  academicYear:"2024-25",
  showStats:true, showDesc:true, colorPkg:true,
  driveReminders:true, newCompanyAlert:true, offerTracking:true, weeklyEmail:false,
  exportFormat:"CSV",
  officerName:"Placement Officer", officerDept:"Placement Officer",
};

/* ════════════════════════════════════════════
   LOADING SKELETON
════════════════════════════════════════════ */
function Skeleton({ width = "100%", height = 14, style = {} }) {
  return (
    <div style={{
      width, height,
      background: "var(--surface3)", borderRadius: 6,
      animation: "pulse 1.5s ease-in-out infinite",
      ...style,
    }} />
  );
}

/* ════════════════════════════════════════════
   TOAST
════════════════════════════════════════════ */
function Toast({ icon, title, sub, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className="pd-export-toast">
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{title}</div>
        <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={onDone} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", marginLeft:4, fontSize:16 }}>×</button>
    </div>
  );
}

/* ════════════════════════════════════════════
   FORM FIELD COMPONENTS
════════════════════════════════════════════ */
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

const FTextarea = ({ label, name, value, onChange, placeholder, hint, rows = 3 }) => (
  <div className="af-field">
    <label className="af-label">{label}{hint && <span className="af-hint"> {hint}</span>}</label>
    <textarea className="af-input" name={name} value={value} onChange={onChange}
      placeholder={placeholder} rows={rows} style={{ resize:"vertical", minHeight:68 }} />
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <label className="pc-toggle" onMouseDown={e => e.stopPropagation()}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="pc-toggle-track"><span className="pc-toggle-thumb" /></span>
  </label>
);

const BranchPicker = ({ selected, onChange }) => (
  <div className="af-field">
    <label className="af-label">Eligible Branches <span className="af-req">*</span></label>
    <div className="af-radio-row">
      {BRANCHES.map(b => (
        <label key={b} className={`af-radio-btn${selected.includes(b) ? " active" : ""}`}>
          <input type="checkbox" style={{ display:"none" }} checked={selected.includes(b)}
            onChange={() => onChange(selected.includes(b) ? selected.filter(x => x !== b) : [...selected, b])} />
          {b}
        </label>
      ))}
    </div>
  </div>
);

/* ════════════════════════════════════════════
   SHARED COMPONENTS
════════════════════════════════════════════ */
const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

/* ════════════════════════════════════════════
   ICONS
════════════════════════════════════════════ */
const XIco     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const TrashIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const ErrIco   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const stepIcos = [
  <svg key="a" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  <svg key="b" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  <svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
];

/* ════════════════════════════════════════════
   OVERLAY
════════════════════════════════════════════ */
function Overlay({ onClose, children }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="pc-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div onMouseDown={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* ════════════════════════════════════════════
   ADD COMPANY MODAL  — POST /placement/internships
════════════════════════════════════════════ */
function AddCompanyModal({ onClose, onAdd }) {
  const [form,    setForm]    = useState(defaultForm);
  const [step,    setStep]    = useState(1);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiErr,  setApiErr]  = useState(null);

  const autoInit = name => name.trim() ? name.trim()[0].toUpperCase() : "";

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim())        e.name        = "Company name is required";
      if (!form.sector)             e.sector      = "Sector is required";
      if (!form.description.trim()) e.description = "Brief description is required";
    }
    if (step === 2) {
      if (!form.pkg)                                                   e.pkg     = "Package (CTC) is required";
      if (!form.minCgpa)                                               e.minCgpa = "Min CGPA is required";
      else if (parseFloat(form.minCgpa) < 0 || parseFloat(form.minCgpa) > 10) e.minCgpa = "CGPA must be 0–10";
      if (form.branches.length === 0)                                  e.branches = "Select at least one branch";
      if (!form.roles.trim())                                          e.roles   = "Enter at least one role";
    }
    return e;
  };

  const next = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(s => s + 1);
  };
  const prev = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setApiErr(null);
    setSaving(true);
    try {
      // POST to backend — maps to InternshipCreate schema
      const created = await api.post("/placement/internships", formToApiPayload(form));

      // Map response back to UI card shape
      const card = mapApiCompany(created);
      setSuccess(true);
      setTimeout(() => { onAdd(card); onClose(); }, 1500);
    } catch (err) {
      setApiErr(err.message ?? "Failed to add company. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const STEP_LABELS = ["Company Info", "Drive Details", "Contact & Status"];

  return (
    <Overlay onClose={onClose}>
      <div className="pc-panel">

        {/* HEADER */}
        <div className="pc-header">
          <div className="pc-header-left">
            <div className="pc-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <div>
              <div className="pc-modal-title">Add New Company</div>
              <div className="pc-modal-sub">Register a hiring partner in the placement system</div>
            </div>
          </div>
          <button className="pc-close" onClick={onClose}><XIco /></button>
        </div>

        {/* STEP INDICATOR */}
        <div className="pc-steps">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1; const done = step > n; const act = step === n;
            return (
              <div key={label} className="pc-step-item">
                <div className={`pc-step-circle${act ? " act" : ""}${done ? " done" : ""}`}>
                  {done ? <CheckIco /> : stepIcos[i]}
                </div>
                <span className={`pc-step-label${act ? " act" : ""}${done ? " done" : ""}`}>{label}</span>
                {i < STEP_LABELS.length - 1 && <div className={`pc-step-line${done ? " done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {/* SUCCESS STATE */}
        {success ? (
          <div className="pc-success">
            <div className="pc-success-ring">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="pc-success-title">Company Added!</div>
            <div className="pc-success-sub">{form.name} has been registered as a hiring partner.</div>
          </div>
        ) : (
          <div className="pc-body">
            {/* API error banner */}
            {apiErr && (
              <div className="pd-err" style={{ marginBottom: 12 }}>
                <ErrIco />{apiErr}
              </div>
            )}

            {/* ── STEP 1 — Company Info ── */}
            {step === 1 && (
              <div>
                <p className="af-section-desc">Enter the company's basic information and description.</p>
                <div className="af-grid-2">
                  <FInput label="Company Name" name="name" value={form.name}
                    onChange={e => {
                      handleChange(e);
                      setForm(f => ({ ...f, init: autoInit(e.target.value) }));
                    }}
                    placeholder="e.g. Google" required />
                  <FSelect label="Sector" name="sector" value={form.sector} onChange={handleChange} options={SECTORS} required />
                </div>
                {(errors.name || errors.sector) && (
                  <div className="af-errors">
                    {errors.name   && <div className="af-error"><ErrIco />{errors.name}</div>}
                    {errors.sector && <div className="af-error"><ErrIco />{errors.sector}</div>}
                  </div>
                )}
                <FTextarea label="Company Description" name="description" value={form.description}
                  onChange={handleChange} placeholder="Brief overview of what the company does…" />
                {errors.description && <div className="af-errors"><div className="af-error"><ErrIco />{errors.description}</div></div>}
                <FInput label="Website" name="website" value={form.website} onChange={handleChange}
                  placeholder="https://company.com" hint="(optional)" />
                {/* Live logo preview */}
                {form.name && (
                  <div className="af-live-preview">
                    <div className="af-lp-label">Company Card Preview</div>
                    <div className="af-lp-row">
                      <div style={{ width:42, height:42, borderRadius:10, background:logoColor(form.init), border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:logoTextColor(form.init) }}>
                        {form.init || "?"}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{form.name}</div>
                        <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{form.sector}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2 — Drive Details ── */}
            {step === 2 && (
              <div>
                <p className="af-section-desc">Enter placement drive and eligibility details.</p>
                <div className="af-grid-2">
                  <div className="af-field">
                    <label className="af-label">Package (CTC) <span className="af-req">*</span> <span className="af-hint">in LPA</span></label>
                    <input className="af-input" type="number" name="pkg" value={form.pkg} onChange={handleChange} placeholder="e.g. 24" min="0" step="0.5" />
                    {errors.pkg && <div className="af-error-inline">{errors.pkg}</div>}
                    {form.pkg && (
                      <div className="af-micro-bar">
                        <div className="af-micro-fill" style={{ width:`${Math.min((parseFloat(form.pkg)||0)/50*100,100)}%`, background:pkgColor(parseFloat(form.pkg)) }} />
                      </div>
                    )}
                  </div>
                  <div className="af-field">
                    <label className="af-label">Min CGPA <span className="af-req">*</span> <span className="af-hint">/ 10.0</span></label>
                    <input className="af-input" type="number" name="minCgpa" value={form.minCgpa} onChange={handleChange} placeholder="e.g. 7.5" min="0" max="10" step="0.1" />
                    {errors.minCgpa && <div className="af-error-inline">{errors.minCgpa}</div>}
                    {form.minCgpa && (
                      <div className="af-micro-bar">
                        <div className="af-micro-fill" style={{ width:`${(parseFloat(form.minCgpa)||0)*10}%`, background:cgpaColor(parseFloat(form.minCgpa)) }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="af-field">
                  <label className="af-label">Roles Offered <span className="af-req">*</span> <span className="af-hint">(comma separated)</span></label>
                  <input className="af-input" type="text" name="roles" value={form.roles} onChange={handleChange} placeholder="e.g. SWE L3, Data Analyst" />
                  {errors.roles && <div className="af-error-inline">{errors.roles}</div>}
                  {form.roles && (
                    <div className="af-radio-row" style={{ marginTop: 6 }}>
                      {form.roles.split(",").filter(r => r.trim()).map(r => (
                        <span key={r} className="skill-chip">{r.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                <BranchPicker selected={form.branches} onChange={b => setForm(f => ({ ...f, branches: b }))} />
                {errors.branches && <div className="af-errors"><div className="af-error"><ErrIco />{errors.branches}</div></div>}

                <div className="af-grid-2">
                  <FSelect label="Drive Type" name="driveType" value={form.driveType} onChange={handleChange} options={DRIVE_TYPES} />
                  <div className="af-field">
                    <label className="af-label">Service Bond</label>
                    <div className="af-radio-row">
                      {["No", "1 Year", "2 Years", "3 Years"].map(v => (
                        <label key={v} className={`af-radio-btn${form.bond === v ? " active" : ""}`}>
                          <input type="radio" name="bond" value={v} checked={form.bond === v} onChange={handleChange} style={{ display:"none" }} />{v}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {(form.pkg || form.minCgpa) && (
                  <div className="af-live-preview">
                    <div className="af-lp-label">Metrics Preview</div>
                    <div className="af-lp-row">
                      {form.pkg && (
                        <div className="af-lp-stat" style={{ borderColor: pkgColor(parseFloat(form.pkg)) }}>
                          <div className="af-lp-val" style={{ color: pkgColor(parseFloat(form.pkg)) }}>{form.pkg} LPA</div>
                          <div className="af-lp-lbl">Package</div>
                        </div>
                      )}
                      {form.minCgpa && (
                        <div className="af-lp-stat" style={{ borderColor: cgpaColor(parseFloat(form.minCgpa)) }}>
                          <div className="af-lp-val" style={{ color: cgpaColor(parseFloat(form.minCgpa)) }}>{parseFloat(form.minCgpa).toFixed(1)}</div>
                          <div className="af-lp-lbl">Min CGPA</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3 — Contact & Status ── */}
            {step === 3 && (
              <div>
                <p className="af-section-desc">Enter drive status and point-of-contact details.</p>
                <div className="af-grid-2">
                  <FSelect label="Drive Status" name="status" value={form.status} onChange={handleChange} options={STATUSES} required />
                  <FInput label="Next Drive Date" name="nextDrive" value={form.nextDrive} onChange={handleChange} type="date" hint="(if scheduled)" />
                </div>

                <div className={`af-status-hint status-${form.status.toLowerCase()}`}>
                  <span className="af-status-hint-icon">
                    {form.status === "Active" ? "🟢" : form.status === "Upcoming" ? "📅" : form.status === "Completed" ? "✅" : "⏸️"}
                  </span>
                  <span>
                    {form.status === "Active"    ? "Drive is currently in progress. Students can apply now."
                     : form.status === "Upcoming"  ? "Drive is scheduled. Set the drive date above."
                     : form.status === "Completed" ? "Drive is completed. Update offers count if available."
                     : "Drive is paused. No active applications at this time."}
                  </span>
                </div>

                <div className="pc-section-label" style={{ marginBottom: 10 }}>Point of Contact</div>
                <div className="af-grid-3">
                  <FInput label="Contact Name"  name="contactName"  value={form.contactName}  onChange={handleChange} placeholder="e.g. Priya Sharma"  hint="(optional)" />
                  <FInput label="Contact Email" name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="hr@company.com"       hint="(optional)" />
                  <FInput label="Contact Phone" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+91 XXXXX XXXXX"      hint="(optional)" />
                </div>

                {/* Summary card */}
                <div className="af-summary-card">
                  <div className="af-summary-hd">Preview</div>
                  <div className="af-summary-top">
                    <div className="af-summary-av" style={{ background:logoColor(autoInit(form.name)), color:logoTextColor(autoInit(form.name)), width:42, height:42, borderRadius:10 }}>
                      {autoInit(form.name) || "?"}
                    </div>
                    <div className="af-summary-info">
                      <div className="af-summary-name">{form.name || "Company Name"}</div>
                      <div className="af-summary-meta">{form.sector} · {form.driveType}</div>
                      <div className="af-summary-meta">{form.roles || "—"}</div>
                    </div>
                    <Badge cls={statusMap[form.status]} dot>{form.status}</Badge>
                  </div>
                  <div className="af-summary-stats">
                    {[
                      { val: form.pkg ? `${form.pkg} LPA` : "—", color: form.pkg ? pkgColor(parseFloat(form.pkg)) : "var(--text3)",         lbl: "Package"  },
                      { val: form.minCgpa || "—",                 color: form.minCgpa ? cgpaColor(parseFloat(form.minCgpa)) : "var(--text3)", lbl: "Min CGPA" },
                      { val: form.offers || "0",                  color: "var(--indigo-ll)",                                                  lbl: "Offers"   },
                      { val: form.students || "0",                color: "var(--violet)",                                                     lbl: "Students" },
                    ].map(m => (
                      <div key={m.lbl} className="af-summary-stat">
                        <div className="af-summary-stat-val" style={{ color: m.color }}>{m.val}</div>
                        <div className="af-summary-stat-lbl">{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {form.branches.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {form.branches.map(b => <span key={b} className="skill-chip">{b}</span>)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        {!success && (
          <div className="pc-footer">
            <div className="pc-footer-left">
              <div className="pc-dots">
                {[1, 2, 3].map(n => (
                  <div key={n} className={`pc-dot${step === n ? " act" : step > n ? " done" : ""}`} />
                ))}
              </div>
              <span className="pc-step-count">Step {step} of 3</span>
            </div>
            <div className="pc-footer-right">
              <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 18px" }} onClick={step === 1 ? onClose : prev}>
                {step === 1 ? "Cancel" : "← Back"}
              </button>
              {step < 3
                ? <button className="btn btn-solid" style={{ fontSize:11, padding:"9px 22px" }} onClick={next}>Continue →</button>
                : <button className="btn btn-teal"  style={{ fontSize:11, padding:"9px 22px" }} onClick={handleSubmit} disabled={saving}>
                    {saving
                      ? <><div className="pd-spinner" />&nbsp;Saving…</>
                      : <><CheckIco />Add Company</>}
                  </button>
              }
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   SETTINGS MODAL
════════════════════════════════════════════ */
function SettingsModal({ onClose, settings, onSave }) {
  const [tab,   setTab]   = useState("general");
  const [local, setLocal] = useState({ ...settings });
  const toggle = key => setLocal(s => ({ ...s, [key]: !s[key] }));
  const setVal = (key, val) => setLocal(s => ({ ...s, [key]: val }));

  return (
    <Overlay onClose={onClose}>
      <div className="pc-panel pc-panel-sm">
        <div className="pc-header">
          <div className="pc-header-left">
            <div className="pc-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div>
              <div className="pc-modal-title">Settings</div>
              <div className="pc-modal-sub">Customize your companies dashboard</div>
            </div>
          </div>
          <button className="pc-close" onClick={onClose}><XIco /></button>
        </div>

        <div className="pc-tabs">
          {["general", "display", "notifications", "data"].map(t => (
            <button key={t} className={`pc-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="pc-body">
          {tab === "general" && (
            <div>
              <div className="pc-section-label">Academic</div>
              <div className="pc-row">
                <div className="pc-row-info"><div className="pc-row-label">Academic Year</div><div className="pc-row-desc">Shown in reports and sidebar</div></div>
                <select className="pc-select" value={local.academicYear} onChange={e => setVal("academicYear", e.target.value)}>
                  {["2022-23","2023-24","2024-25","2025-26"].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="pc-section-label" style={{ marginTop: 18 }}>Officer Profile</div>
              <div className="af-grid-2" style={{ marginBottom: 0 }}>
                <FInput label="Name" name="officerName" value={local.officerName} onChange={e => setVal("officerName", e.target.value)} placeholder="Officer name" />
                <FInput label="Role" name="officerDept" value={local.officerDept} onChange={e => setVal("officerDept", e.target.value)} placeholder="e.g. Placement Officer" />
              </div>
            </div>
          )}
          {tab === "display" && (
            <div>
              <div className="pc-section-label">Cards &amp; Layout</div>
              <div className="pc-row"><div className="pc-row-info"><div className="pc-row-label">Show Stat Cards</div><div className="pc-row-desc">Overview numbers at top of page</div></div><Toggle checked={local.showStats} onChange={() => toggle("showStats")} /></div>
              <div className="pc-row"><div className="pc-row-info"><div className="pc-row-label">Show Description</div><div className="pc-row-desc">Company blurb on each card</div></div><Toggle checked={local.showDesc}  onChange={() => toggle("showDesc")} /></div>
              <div className="pc-row"><div className="pc-row-info"><div className="pc-row-label">Color-code Package</div><div className="pc-row-desc">Green / amber by package value</div></div><Toggle checked={local.colorPkg}  onChange={() => toggle("colorPkg")} /></div>
            </div>
          )}
          {tab === "notifications" && (
            <div>
              <div className="pc-section-label">Alerts</div>
              {[
                { key:"driveReminders",  label:"Drive Reminders",      desc:"Notify before upcoming drives" },
                { key:"newCompanyAlert", label:"New Company Alerts",    desc:"When a company is registered" },
                { key:"offerTracking",   label:"Offer Letter Tracking", desc:"Status updates on offers" },
                { key:"weeklyEmail",     label:"Weekly Summary Email",  desc:"Stats digest every Monday" },
              ].map(r => (
                <div key={r.key} className="pc-row">
                  <div className="pc-row-info"><div className="pc-row-label">{r.label}</div><div className="pc-row-desc">{r.desc}</div></div>
                  <Toggle checked={local[r.key]} onChange={() => toggle(r.key)} />
                </div>
              ))}
            </div>
          )}
          {tab === "data" && (
            <div>
              <div className="pc-section-label">Export</div>
              <div className="pc-row">
                <div className="pc-row-info"><div className="pc-row-label">Default Export Format</div><div className="pc-row-desc">Used when downloading data</div></div>
                <select className="pc-select" value={local.exportFormat} onChange={e => setVal("exportFormat", e.target.value)}>
                  {["CSV","Excel","PDF"].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="pc-section-label" style={{ marginTop:18, color:"var(--rose)" }}>Danger Zone</div>
              <div className="pc-row">
                <div className="pc-row-info"><div className="pc-row-label">Reset All Settings</div><div className="pc-row-desc">Restore defaults</div></div>
                <button className="btn" style={{ fontSize:11, padding:"7px 14px", background:"rgba(240,83,106,.1)", color:"var(--rose)", border:"1px solid rgba(240,83,106,.25)" }}
                  onClick={() => setLocal({ ...defaultSettings })}>Reset</button>
              </div>
            </div>
          )}
        </div>

        <div className="pc-footer">
          <div className="pc-footer-left"><span style={{ fontSize:11, color:"var(--text3)" }}>Saved on confirm</span></div>
          <div className="pc-footer-right">
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

/* ════════════════════════════════════════════
   DELETE CONFIRM  — DELETE /placement/internships/{id}
════════════════════════════════════════════ */
function DeleteConfirm({ company, onConfirm, onCancel, deleting }) {
  return (
    <Overlay onClose={onCancel}>
      <div className="pc-panel pc-panel-delete">
        <div className="pc-delete-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <div className="pc-delete-title">Remove Company?</div>
        <div className="pc-delete-sub">
          This will permanently remove{" "}
          <strong style={{ color:"var(--text)" }}>{company.name}</strong> from the placement system.
        </div>
        <div className="pc-delete-actions">
          <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 20px" }} onClick={onCancel}>Cancel</button>
          <button
            className="btn"
            style={{ fontSize:11, padding:"9px 20px", background:"rgba(240,83,106,.12)", color:"var(--rose)", border:"1px solid rgba(240,83,106,.25)" }}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? <><div className="pd-spinner" />&nbsp;Removing…</> : "Yes, Remove"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   COMPANY DETAIL SLIDE-OVER
════════════════════════════════════════════ */
function CompanyDetailPanel({ company, onClose, onDelete }) {
  return (
    <>
      <div className="cc-detail-overlay" onMouseDown={onClose} style={{ cursor:"none" }} />
      <div className="cc-detail-panel">
        <div className="cc-detail-header">
          <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>Company Details</span>
          <button className="pc-close" onClick={onClose}><XIco /></button>
        </div>
        <div className="cc-detail-body">
          <div className="cc-detail-logo" style={{ background:logoColor(company.init), color:logoTextColor(company.init) }}>
            {company.init}
          </div>
          <div className="cc-detail-name">{company.name}</div>
          <div className="cc-detail-sector" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span>{company.sector}</span>
            <Badge cls={statusMap[company.status]} dot>{company.status}</Badge>
          </div>

          <div className="cc-detail-section">
            <div className="cc-detail-section-hd">Overview</div>
            <div className="cc-detail-stat-grid">
              {[
                { val: company.pkg,      color: pkgColor(parseFloat(company.pkg)),  lbl: "Package"         },
                { val: company.minCgpa,  color: cgpaColor(company.minCgpa),          lbl: "Min CGPA"        },
                { val: company.offers,   color: "var(--indigo-ll)",                  lbl: "Total Offers"    },
                { val: company.students, color: "var(--violet)",                     lbl: "Students Applied"},
              ].map(m => (
                <div key={m.lbl} className="cc-detail-stat">
                  <div className="cc-detail-stat-val" style={{ color: m.color }}>{m.val}</div>
                  <div className="cc-detail-stat-lbl">{m.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {company.desc && (
            <div className="cc-detail-section">
              <div className="cc-detail-section-hd">About</div>
              <div className="cc-detail-desc">{company.desc}</div>
            </div>
          )}

          <div className="cc-detail-section">
            <div className="cc-detail-section-hd">Roles Offered</div>
            <div className="cc-detail-roles">
              {company.roles.length > 0
                ? company.roles.map(r => <span key={r} className="skill-chip">{r}</span>)
                : <span style={{ fontSize:11, color:"var(--text3)" }}>—</span>}
            </div>
          </div>

          <div className="cc-detail-section">
            <div className="cc-detail-section-hd">Eligible Branches</div>
            <div className="cc-detail-roles">
              {company.branches.length > 0
                ? company.branches.map(b => <span key={b} className="skill-chip">{b}</span>)
                : <span style={{ fontSize:11, color:"var(--text3)" }}>—</span>}
            </div>
          </div>

          {company.nextDrive && company.nextDrive !== "—" && (
            <div className="cc-detail-section">
              <div className="cc-detail-section-hd">Drive Schedule</div>
              <div style={{ fontSize:12, color:"var(--indigo-ll)", fontWeight:600 }}>📅 Next Drive: {company.nextDrive}</div>
              {company.driveType && <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>{company.driveType}</div>}
            </div>
          )}

          {(company.contactName || company.contactEmail || company.contactPhone) && (
            <div className="cc-detail-section">
              <div className="cc-detail-section-hd">Point of Contact</div>
              {company.contactName  && <div style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{company.contactName}</div>}
              {company.contactEmail && <div style={{ fontSize:11, color:"var(--text3)", marginTop:3 }}>{company.contactEmail}</div>}
              {company.contactPhone && <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{company.contactPhone}</div>}
            </div>
          )}

          {company.website && (
            <div className="cc-detail-section">
              <div className="cc-detail-section-hd">Website</div>
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:11, color:"var(--indigo-ll)", wordBreak:"break-all" }}>
                {company.website}
              </a>
            </div>
          )}

          <div style={{ paddingTop:14, borderTop:"1px solid var(--border)", display:"flex", gap:8 }}>
            <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 18px", flex:1 }} onClick={onClose}>Close</button>
            <button className="btn" style={{ fontSize:11, padding:"9px 18px", background:"rgba(240,83,106,.1)", color:"var(--rose)", border:"1px solid rgba(240,83,106,.25)" }}
              onClick={() => { onClose(); onDelete(company); }}>
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function PlacementCompanies() {
  const navigate = useNavigate();

  // ── API data ──────────────────────────────────────────────────
  const [companies,     setCompanies]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [statsLoading,  setStatsLoading]  = useState(true);
  const [dashStats,     setDashStats]     = useState(null);
  const [officerName,   setOfficerName]   = useState("");
  const [mailUnread,    setMailUnread]    = useState(0);

  // ── UI state ──────────────────────────────────────────────────
  const [filter,         setFilter]         = useState("All");
  const [search,         setSearch]         = useState("");
  const [sector,         setSector]         = useState("All");
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState(null);
  const [deleting,       setDeleting]       = useState(false);
  const [detailCompany,  setDetailCompany]  = useState(null);
  const [settings,       setSettings]       = useState(defaultSettings);
  const [toast,          setToast]          = useState(null);

  // ── Cursor ────────────────────────────────────────────────────
  const curRef  = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0), rx = useRef(0), ry = useRef(0);

  useEffect(() => {
    const onMove = e => {
      mx.current = e.clientX; my.current = e.clientY;
      if (curRef.current) {
        curRef.current.style.left = e.clientX + "px";
        curRef.current.style.top  = e.clientY + "px";
      }
    };
    const onDown = () => document.body.classList.add("c-click");
    const onUp   = () => document.body.classList.remove("c-click");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);
    let raf;
    const loop = () => {
      rx.current += (mx.current - rx.current) * 0.14;
      ry.current += (my.current - ry.current) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.left = rx.current + "px";
        ringRef.current.style.top  = ry.current + "px";
      }
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

  // ── Body scroll lock ──────────────────────────────────────────
  const anyModal = showAddCompany || showSettings || !!deleteTarget;
  useEffect(() => {
    document.body.style.overflow = anyModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [anyModal]);

  /* ════════════════════════════════════════════
     INITIAL FETCH — parallel on mount
     • GET /auth/me              → officer name
     • GET /placement/dashboard/stats → KPI cards
     • GET /placement/internships     → company list
  ════════════════════════════════════════════ */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setStatsLoading(true);
      try {
        const [meRes, statsRes, companiesRes] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/placement/dashboard/stats"),
          api.get("/placement/internships?limit=100"),
          api.get("/mail/unread/count"),
        ]);

        // Officer name
        if (meRes.status === "fulfilled") {
          const me   = meRes.value;
          const name = me.full_name ?? me.email ?? "";
          setOfficerName(name);
          setSettings(s => ({ ...s, officerName: name }));
        }

        // Dashboard KPIs
        if (statsRes.status === "fulfilled") {
          setDashStats(statsRes.value);
        }

        // Company / internship list
        if (companiesRes.status === "fulfilled") {
          const raw = Array.isArray(companiesRes.value)
            ? companiesRes.value
            : (companiesRes.value?.items ?? []);
          setCompanies(raw.map(mapApiCompany));
        }

        if (results[3]?.status === "fulfilled") {
          setMailUnread(results[3].value.count || 0);
        }
      } catch (err) {
        console.error("PlacementCompanies fetch error:", err);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    fetchAll();

    const pollUnread = setInterval(async () => {
      try {
        const res = await api.get("/mail/unread/count");
        setMailUnread(res.count || 0);
      } catch {}
    }, 30000);

    return () => clearInterval(pollUnread);
  }, []);

  /* ════════════════════════════════════════════
     DEBOUNCED RE-FETCH on search change
     (status / sector filters are client-side
     since the internships list is small enough)
  ════════════════════════════════════════════ */
  useEffect(() => {
    if (!search) return; // empty search — no extra call needed

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ limit: "100", search });
        const raw    = await api.get(`/placement/internships?${params}`);
        const arr    = Array.isArray(raw) ? raw : (raw?.items ?? []);
        setCompanies(arr.map(mapApiCompany));
      } catch (err) {
        console.error("Company search fetch error:", err);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  /* ════════════════════════════════════════════
     HANDLERS
  ════════════════════════════════════════════ */

  // Optimistic prepend after successful POST
  const handleAddCompany = useCallback(card => {
    setCompanies(prev => [card, ...prev]);
    setToast({ icon:"🏢", title:"Company Added!", sub:`${card.name} has been registered as a hiring partner.` });
  }, []);

  // DELETE — calls DELETE /placement/internships/{id}
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/placement/internships/${deleteTarget.id}`);
      setCompanies(prev => prev.filter(c => c.id !== deleteTarget.id));
      setToast({ icon:"🗑️", title:"Company Removed", sub:`${deleteTarget.name} has been removed.` });
    } catch (err) {
      setToast({ icon:"❌", title:"Delete Failed", sub: err.message ?? "Please try again." });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const handleSignOut = () => { clearAuth(); navigate("/login", { replace: true }); };

  /* ════════════════════════════════════════════
     CLIENT-SIDE FILTER
     (status + sector filtered locally; search
     is also handled server-side but applied
     locally as an immediate visual filter while
     the debounced request is in-flight)
  ════════════════════════════════════════════ */
  const filtered = companies.filter(c => {
    const mf = filter === "All" || c.status === filter;
    const ms = sector === "All" || c.sector === sector;
    const mq = !search
      || c.name.toLowerCase().includes(search.toLowerCase())
      || c.sector.toLowerCase().includes(search.toLowerCase())
      || c.roles.some(r => r.toLowerCase().includes(search.toLowerCase()));
    return mf && ms && mq;
  });

  /* ════════════════════════════════════════════
     DERIVED VALUES
  ════════════════════════════════════════════ */
  const activeCount = companies.filter(c => c.status === "Active" || c.status === "Upcoming").length;
  const totalOffers = companies.reduce((s, c) => s + (c.offers || 0), 0);
  const avgPkg      = companies.length
    ? (companies.reduce((s, c) => s + (parseFloat(c.pkg) || 0), 0) / companies.length).toFixed(1)
    : 0;

  const officerInitials = (officerName || settings.officerName)
    .trim().split(" ").map(w => w[0]?.toUpperCase()).join("").slice(0, 2);

  const allSectors = ["All", ...new Set(companies.map(c => c.sector).filter(Boolean))];

  // Use stats from API if available, fall back to local derivations
  const upcomingCount = dashStats?.upcoming_drives
    ?? companies.filter(c => c.status === "Upcoming").length;

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <>
      <div className="sc-cursor"      ref={curRef}  style={{ zIndex: 99999 }} />
      <div className="sc-cursor-ring" ref={ringRef} style={{ zIndex: 99999 }} />
      <div className="sc-noise" />

      {/* Modals */}
      {showAddCompany && (
        <AddCompanyModal onClose={() => setShowAddCompany(false)} onAdd={handleAddCompany} />
      )}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} settings={settings} onSave={setSettings} />
      )}
      {deleteTarget && (
        <DeleteConfirm
          company={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Detail slide-over — lower z-index; no body scroll lock */}
      {detailCompany && !deleteTarget && (
        <CompanyDetailPanel
          company={detailCompany}
          onClose={() => setDetailCompany(null)}
          onDelete={c => { setDetailCompany(null); setDeleteTarget(c); }}
        />
      )}

      {toast && (
        <Toast icon={toast.icon} title={toast.title} sub={toast.sub} onDone={() => setToast(null)} />
      )}

      <div className="app">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-top">
            <Link className="sb-brand" to="/placementdashboard">
              <div className="sb-mark">SC</div>
              <span className="sb-name">SmartCampus</span>
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
              badge={loading ? "…" : String(dashStats?.total_students ?? "—")} badgeCls="teal"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>
              Students
            </SbLink>
            <SbLink active to="/placementdashboard/companies"
              badge={loading ? "…" : String(dashStats?.total_companies ?? companies.length)} badgeCls="amber"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>
              Companies
            </SbLink>

            <SbLink to="/placementdashboard/drives"
              badge={loading ? "…" : String(dashStats?.total_drives ?? upcomingCount)} badgeCls="rose"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>
              Drives
            </SbLink>

            <SbLink to="/placementdashboard/offers-placed"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>
              Offers &amp; Placed
            </SbLink>
            <SbLink to="/placementdashboard/internships"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>
              Internships
            </SbLink>

            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/placementMail" badge={mailUnread > 0 ? mailUnread : null} badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>Mail System</SbLink>
            <SbLink to="/placementdashboard/meetings"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>
              Virtual Meeting
            </SbLink>
            <SbLink to="/placementdashboard/ai-assistant"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>
              AI Assistant
            </SbLink>
            <SbLink to="/placementdashboard/reports"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>
              Reports
            </SbLink>
          </nav>

          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Avg Package</div>
              <div className="sb-pri-val">{statsLoading ? "…" : `₹${avgPkg}L`}</div>
              <div className="sb-pri-sub">AY {settings.academicYear}</div>
              <div className="sb-pri-bar">
                <div className="sb-pri-fill" style={{ width:`${Math.min((parseFloat(avgPkg)/50)*100,100)}%`, transition:"width 1s ease" }} />
              </div>
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
            <span className="tb-page">Companies</span>
            <div className="tb-sep" />
            <div className="tb-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:"var(--text3)", flexShrink:0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search companies, roles…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ cursor:"none" }}
              />
            </div>
            <div className="tb-right">
              <span className="tb-date">
                {new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" })}
              </span>
              <button className="tb-icon-btn" onClick={() => setShowSettings(true)} title="Settings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:"inherit" }}>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button className="btn btn-solid" style={{ fontSize:10, padding:"8px 14px" }} onClick={() => setShowAddCompany(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Company
              </button>
            </div>
          </header>

          <div className="content">
            {/* Greeting */}
            <div className="greet-row">
              <div className="greet-tag">
                <div className="greet-pip" />
                <span className="greet-pip-txt">
                  {loading ? "…" : `${dashStats?.total_companies ?? companies.length} Companies`} · AY {settings.academicYear}
                </span>

              </div>
              <h1 className="greet-title">Hiring <em>Companies</em></h1>
              <p className="greet-sub">
                {loading
                  ? "Loading company data…"
                  : <>Track all company partnerships, drives, and offers in one place.{" "}
                      <strong>{activeCount}</strong> active or upcoming.</>
                }
              </p>
            </div>

            {/* Stat Cards */}
            {settings.showStats && (
              <div className="stat-grid" style={{ marginBottom:18 }}>
                {[
                  { label:"Total Companies",   val: loading ? "…" : companies.length,                                     color:"indigo", delta:`▲ +${Math.max(1, Math.floor(companies.length * .2))} this year`, type:"up"  },
                  { label:"Active / Upcoming", val: loading ? "…" : activeCount,                                          color:"teal",   delta:`${loading ? "…" : companies.filter(c => c.status === "Upcoming").length} drives upcoming`, type:"up" },
                  { label:"Total Offers",       val: loading ? "…" : totalOffers,                                          color:"amber",  delta:"From all drives",   type:"neu" },
                  { label:"Avg Package",        val: loading ? "…" : `₹${avgPkg}L`,                                       color:"violet", delta:"▲ +2L vs last year", type:"up"  },
                ].map(s => (
                  <div key={s.label} className={`stat-card sc-${s.color}`}>
                    <div className="stat-val" style={s.color !== "indigo" ? { color:`var(--${s.color})` } : {}}>{s.val}</div>
                    <div className="stat-lbl">{s.label}</div>
                    <span className={`stat-delta delta-${s.type}`}>{s.delta}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
              <div className="filter-row">
                {["All", "Active", "Upcoming", "Completed", "Paused"].map(f => (
                  <button key={f} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <div style={{ width:1, height:24, background:"var(--border2)", flexShrink:0 }} />
              <div className="filter-row">
                {allSectors.map(s => (
                  <button key={s} className={`filter-btn${sector === s ? " active" : ""}`} onClick={() => setSector(s)}>{s}</button>
                ))}
              </div>
              <span style={{ marginLeft:"auto", fontSize:11, color:"var(--text3)" }}>
                {loading ? "Loading…" : `${filtered.length} companies`}
              </span>
            </div>

            {/* Cards Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14, marginBottom:16 }}>

              {loading ? (
                // Skeleton cards
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="panel" style={{ margin:0 }}>
                    <div style={{ padding:"18px 20px" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:14 }}>
                        <Skeleton width={46} height={46} style={{ borderRadius:12, flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <Skeleton height={14} style={{ marginBottom:6 }} />
                          <Skeleton height={9} width="60%" />
                        </div>
                      </div>
                      <Skeleton height={40} style={{ marginBottom:14 }} />
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
                        {[1,2,3,4].map(j => <Skeleton key={j} height={44} style={{ borderRadius:8 }} />)}
                      </div>
                      <Skeleton height={1} style={{ marginBottom:12 }} />
                      <div style={{ display:"flex", gap:4 }}>
                        {[1,2,3].map(j => <Skeleton key={j} width={40} height={20} style={{ borderRadius:20 }} />)}
                      </div>
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 20px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14 }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>🏢</div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:"var(--text2)", marginBottom:6 }}>No companies found</div>
                  <div style={{ fontSize:12, color:"var(--text3)" }}>Try adjusting your search or filters</div>
                </div>
              ) : (
                filtered.map(c => (
                  <div key={c.id} className="panel" style={{ margin:0, cursor:"none", transition:"border-color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(91,78,248,.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = ""}>
                    <div style={{ padding:"18px 20px" }}>

                      {/* Card Top */}
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                          <div style={{ width:46, height:46, borderRadius:12, background:logoColor(c.init), display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:800, color:logoTextColor(c.init), border:"1px solid var(--border2)", flexShrink:0 }}>
                            {c.init}
                          </div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>{c.name}</div>
                            <div style={{ fontSize:10, color:"var(--text3)", marginTop:3 }}>
                              {c.sector} · {c.roles.slice(0, 2).join(", ") || "—"}
                              {c.roles.length > 2 && ` +${c.roles.length - 2}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                          <Badge cls={statusMap[c.status] ?? "badge-indigo"} dot>{c.status}</Badge>
                          <button className="cc-delete-btn"
                            onClick={e => { e.stopPropagation(); setDeleteTarget(c); }}
                            title="Remove company">
                            <TrashIco />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {settings.showDesc && c.desc && (
                        <p style={{ fontSize:11.5, color:"var(--text3)", lineHeight:1.6, marginBottom:14 }}>
                          {c.desc.length > 120 ? c.desc.slice(0, 120) + "…" : c.desc}
                        </p>
                      )}

                      {/* Metrics */}
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
                        {[
                          { label:"Package",  val: c.pkg,      color: settings.colorPkg ? pkgColor(parseFloat(c.pkg))  : "var(--text)" },
                          { label:"Min CGPA", val: c.minCgpa,  color: settings.colorPkg ? cgpaColor(c.minCgpa)          : "var(--text)" },
                          { label:"Offers",   val: c.offers,   color: "var(--indigo-ll)" },
                          { label:"Students", val: c.students, color: "var(--violet)"    },
                        ].map(m => (
                          <div key={m.label} style={{ background:"var(--surface2)", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
                            <div style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:m.color }}>{m.val}</div>
                            <div style={{ fontSize:9, color:"var(--text3)", marginTop:2 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid var(--border)" }}>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          {c.branches.map(b => <span key={b} className="skill-chip">{b}</span>)}
                          {c.branches.length === 0 && <span style={{ fontSize:10, color:"var(--text3)" }}>—</span>}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          {c.nextDrive !== "—" && (
                            <span style={{ fontSize:11, color:"var(--indigo-ll)", fontWeight:500 }}>📅 {c.nextDrive}</span>
                          )}
                          <button className="cc-view-btn" onClick={() => setDetailCompany(c)}>Details →</button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))
              )}

              {/* Add Company card */}
              {!loading && (
                <button className="company-card-add" onClick={() => setShowAddCompany(true)}>
                  <div className="company-card-add-icon">+</div>
                  <span className="company-card-add-label">Add New Company</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}