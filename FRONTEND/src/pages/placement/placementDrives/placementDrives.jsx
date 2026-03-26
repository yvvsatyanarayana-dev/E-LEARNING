/**
 * placementDrives.jsx — SmartCampus Drives Page
 * API calls wired using the shared api.js utility
 *
 * APIs used:
 *   GET    /auth/me                          → officer name/avatar in sidebar
 *   GET    /placement/dashboard/stats        → sidebar placement rate widget
 *   GET    /placement/drives?limit=50        → list all drives
 *   POST   /placement/drives                 → create new drive (Add modal)
 *   DELETE /placement/drives/:id             → remove drive
 *   POST   /placement/notifications/send     → optional: notify students
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth } from "../../../utils/auth.js";
import api from "../../../utils/api.js";
import "./placementDrives.css";

/* ════════════════════════════════════════════
   DATA MAPPER — API shape → UI card shape
════════════════════════════════════════════ */
function mapApiDrive(d) {
  const stipendRaw  = parseInt(d.stipend) || 0;
  const fmtStipend  = stipendRaw >= 1000 ? `₹${Math.round(stipendRaw/1000)}K/mo` : stipendRaw ? `₹${stipendRaw}/mo` : d.stipend || "—";
  const nameParts   = (d.role || "").split(" ");
  const companyChar = (d.company_name?.[0] ?? "?").toUpperCase();

  return {
    id:         d.id,
    init:       companyChar + (d.company_name?.[1] ?? "").toUpperCase(),
    name:       d.student_name  ?? d.company_name ?? "—",  // internship record may carry student
    company:    d.company_name  ?? "—",
    role:       d.role          ?? "—",
    rollNo:     d.student_roll  ?? "",
    branch:     d.branches?.[0] ?? d.branch ?? "—",
    stipend:    fmtStipend,
    stipendRaw: stipendRaw,
    duration:   d.duration      ?? "3 months",
    start:      d.deadline
      ? new Date(d.deadline).toLocaleDateString("en-IN",{month:"short",year:"numeric"})
      : d.start ?? "—",
    status:     d.status        ?? "Upcoming",
    ppo:        d.ppo           ?? false,
    mode:       d.mode          ?? "On-site",
    location:   d.location      ?? "",
    targetGroup:d.target_group  ?? "All",
    applicationLink: d.application_link || "",
  };
}

/* ════════════════════════════════════════════
   HELPERS & CONSTANTS
════════════════════════════════════════════ */
const BRANCHES   = ["CSE","IT","ECE","EEE","MECH","CIVIL","BCA","MCA"];
const STATUSES   = ["Ongoing","Upcoming","Completed"];
const DURATIONS  = ["1 month","2 months","3 months","6 months","12 months"];
const DRIVE_TYPES= ["Full Time","Internship","Internship + PPO","Part Time","Contract"];

const statusMap = { "Ongoing":"badge-teal","Upcoming":"badge-indigo","Completed":"badge-amber" };

const stipendColor = s => {
  const n = parseInt(s) || 0;
  if (n >= 60000) return "var(--teal)";
  if (n >= 35000) return "var(--indigo-ll)";
  return "var(--amber)";
};
const stipendPct = s => Math.min((parseInt(s)||0) / 100000 * 100, 100);
const fmtStipend = s => { const n=parseInt(s)||0; return n>=1000?`₹${(n/1000).toFixed(0)}K/mo`:`₹${n}/mo`; };
const initials   = n => (n||"ST").trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

/* ════════════════════════════════════════════
   ICONS
════════════════════════════════════════════ */
const CheckIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const ErrIco   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const XIco     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const TrashIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;

const stepIcos = [
  <svg key="a" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  <svg key="b" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  <svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
];

/* ════════════════════════════════════════════
   FORM ATOMS
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

const FInput = ({ label, name, value, onChange, type="text", placeholder, required, hint }) => (
  <div className="af-field">
    <label className="af-label">{label}{required && <span className="af-req"> *</span>}{hint && <span className="af-hint"> {hint}</span>}</label>
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
  <label className="pi-toggle" onMouseDown={e=>e.stopPropagation()}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="pi-toggle-track"><span className="pi-toggle-thumb" /></span>
  </label>
);

const Skeleton = ({ width = "100%", height = 14, style = {} }) => (
  <div style={{ width, height, background:"var(--surface3)", borderRadius:6, animation:"pulse 1.5s ease-in-out infinite", ...style }} />
);

/* ════════════════════════════════════════════
   OVERLAY
════════════════════════════════════════════ */
function Overlay({ onClose, children }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="pi-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div onMouseDown={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* ════════════════════════════════════════════
   ADD INTERNSHIP MODAL  — POST to /placement/internships
════════════════════════════════════════════ */
const defaultForm = {
  company:"", type:"Full Time", role:"", branches:[], stipend:"",
  duration:"3 months", date:"", location:"", description:"", status:"Upcoming",
  ppo: false, mode:"On-site", targetGroup:"All", applicationLink:"",
};

function AddDriveModal({ onClose, onAdd }) {
  const [form,    setForm]    = useState(defaultForm);
  const [step,    setStep]    = useState(1);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiErr,  setApiErr]  = useState(null);
  const [groups,  setGroups]  = useState(["All"]);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/faculty/metadata")
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.groups && setGroups(["All", ...d.groups.filter(g => g !== "All")]))
      .catch(() => {});
  }, []);

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type==="checkbox" ? checked : value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]:null }));
    setApiErr(null);
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.company.trim()) e.company = "Company name is required";
      if (!form.role.trim())    e.role    = "Role is required";
    }
    if (step === 2) {
      if (!form.stipend)        e.stipend  = "Stipend is required";
      else if (isNaN(parseInt(form.stipend))) e.stipend = "Enter a valid number";
      if (!form.date)           e.date     = "Start date is required";
    }
    return e;
  };

  const next = () => { const e=validate(); if(Object.keys(e).length){setErrors(e);return;} setStep(s=>s+1); };
  const prev = () => { setErrors({}); setStep(s=>s-1); };

  const submit = async () => {
    setApiErr(null);
    setSaving(true);
    try {
      // POST to /placement/drives
      const created = await api.post("/placement/drives", {
        company_name:   form.company,
        role:           `${form.role} · ${form.type}`,
        deadline:       form.date || null,
        stipend:        form.stipend ? String(parseInt(form.stipend)) : null,
        duration:       form.duration,
        location:       form.location || null,
        description:    form.description || null,
        status:         form.status,
        ppo:            form.ppo,
        mode:           form.mode,
        branches:       form.branches,
        target_group:   form.targetGroup,
        application_link: form.applicationLink || null,
      });

      const card = mapApiDrive(created);
      setSuccess(true);
      setTimeout(() => { onAdd(card); onClose(); }, 1500);
    } catch (err) {
      setApiErr(err.message ?? "Failed to create drive. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const STEP_LABELS = ["Company & Role","Details & Schedule","Status & Review"];

  return (
    <Overlay onClose={onClose}>
      <div className="pi-panel">
        {/* HEADER */}
        <div className="pi-header">
          <div className="pi-header-left">
            <div className="pi-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <div>
              <div className="pi-modal-title">Add Drive</div>
              <div className="pi-modal-sub">Register a new company drive</div>
            </div>
          </div>
          <button className="pi-close" onClick={onClose}><XIco /></button>
        </div>

        {/* STEPS */}
        <div className="pi-steps">
          {STEP_LABELS.map((label, i) => {
            const n=i+1; const done=step>n; const act=step===n;
            return (
              <div key={label} className="pi-step-item">
                <div className={`pi-step-circle${act?" act":""}${done?" done":""}`}>{done?<CheckIco/>:stepIcos[i]}</div>
                <span className={`pi-step-label${act?" act":""}${done?" done":""}`}>{label}</span>
                {i<STEP_LABELS.length-1 && <div className={`pi-step-line${done?" done":""}`} />}
              </div>
            );
          })}
        </div>

        {/* BODY */}
        {success ? (
          <div className="pi-success">
            <div className="pi-success-ring"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div className="pi-success-title">Drive Added!</div>
            <div className="pi-success-sub">{form.company} — {form.role} has been registered.</div>
          </div>
        ) : (
          <div className="pi-body">
            {apiErr && (
              <div className="af-error" style={{ marginBottom:12, padding:"8px 12px", background:"rgba(240,83,106,.08)", borderRadius:8, border:"1px solid rgba(240,83,106,.2)" }}>
                <ErrIco /> {apiErr}
              </div>
            )}

            {/* STEP 1 — Company & Role */}
            {step === 1 && (
              <div>
                <p className="af-section-desc">Enter the company and role details for this drive.</p>
                <div className="af-grid-2">
                  <FInput label="Company Name" name="company" value={form.company} onChange={handle} placeholder="e.g. Google" required />
                  <FSelect label="Drive Type"  name="type"    value={form.type}    onChange={handle} options={DRIVE_TYPES} />
                </div>
                {errors.company && <div className="af-error"><ErrIco />{errors.company}</div>}
                <FInput label="Role / Job Title" name="role" value={form.role} onChange={handle} placeholder="e.g. Software Engineering Intern" required />
                {errors.role && <div className="af-error"><ErrIco />{errors.role}</div>}
                <div className="af-grid-2">
                  <FInput label="Location" name="location" value={form.location} onChange={handle} placeholder="e.g. Bangalore / Remote" hint="(optional)" />
                  <div className="af-field">
                    <label className="af-label">Mode</label>
                    <div className="af-radio-row">
                      {["On-site","Remote","Hybrid"].map(v => (
                        <label key={v} className={`af-radio-btn${form.mode===v?" active":""}`}>
                          <input type="radio" name="mode" value={v} checked={form.mode===v} onChange={handle} style={{display:"none"}}/>{v}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="af-field">
                  <FSelect label="Target Group" name="targetGroup" value={form.targetGroup} onChange={handle} options={groups} />
                </div>
                {form.company && (
                  <div className="af-live-preview">
                    <div className="af-lp-label">Preview</div>
                    <div className="af-lp-row">
                      <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,rgba(91,78,248,.3),rgba(159,122,234,.2))",border:"1.5px solid rgba(91,78,248,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"var(--indigo-ll)",flexShrink:0}}>
                        {form.company[0]?.toUpperCase()||"?"}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{form.company}</div>
                        <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{form.role||"Role"} · {form.type}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Stipend & Schedule */}
            {step === 2 && (
              <div>
                <p className="af-section-desc">Set stipend, duration, and drive schedule.</p>
                <div className="af-grid-2">
                  <div className="af-field">
                    <label className="af-label">Monthly Stipend <span className="af-req">*</span> <span className="af-hint">in ₹</span></label>
                    <input className="af-input" type="number" name="stipend" value={form.stipend} onChange={handle} placeholder="e.g. 60000" min="0" step="1000" />
                    {errors.stipend && <div className="af-error-inline">{errors.stipend}</div>}
                    {form.stipend && (
                      <div className="af-micro-bar">
                        <div className="af-micro-fill" style={{width:`${stipendPct(form.stipend)}%`, background:stipendColor(form.stipend)}} />
                      </div>
                    )}
                  </div>
                  <FSelect label="Duration" name="duration" value={form.duration} onChange={handle} options={DURATIONS} />
                </div>
                <div className="af-grid-2">
                  <div className="af-field">
                    <label className="af-label">Application Link <span className="af-hint">(optional)</span></label>
                    <input className="af-input" type="url" name="applicationLink" value={form.applicationLink} onChange={handle} placeholder="https://..." />
                  </div>
                  <div className="af-field">
                    <label className="af-label">Start / Deadline Date <span className="af-req">*</span></label>
                    <input className="af-input" type="date" name="date" value={form.date} onChange={handle} />
                    {errors.date && <div className="af-error-inline">{errors.date}</div>}
                  </div>
                </div>
                <div className="af-grid-2">
                  <FSelect label="Status" name="status" value={form.status} onChange={handle} options={STATUSES} />
                  <div className="af-field" />
                </div>
                <div className="af-field">
                  <label className="af-label">Description <span className="af-hint">(optional)</span></label>
                  <textarea className="af-input" name="description" value={form.description} onChange={handle}
                    placeholder="Roles, responsibilities, requirements…" rows={3} style={{resize:"vertical",lineHeight:1.5}} />
                </div>
                {(form.company || form.stipend) && (
                  <div className="af-live-preview">
                    <div className="af-lp-label">Offer Preview</div>
                    <div className="af-lp-row">
                      {form.company && (
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:28,height:28,borderRadius:6,background:"rgba(91,78,248,.1)",border:"1px solid rgba(91,78,248,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"var(--indigo-ll)"}}>
                            {form.company[0]?.toUpperCase()||"?"}
                          </div>
                          <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{form.company}</div>
                        </div>
                      )}
                      {form.stipend && (
                        <div className="af-lp-stat" style={{borderColor:stipendColor(form.stipend)}}>
                          <div className="af-lp-val" style={{color:stipendColor(form.stipend)}}>{fmtStipend(form.stipend)}</div>
                          <div className="af-lp-lbl">Stipend</div>
                        </div>
                      )}
                      {form.duration && (
                        <div className="af-lp-stat" style={{borderColor:"var(--amber)"}}>
                          <div className="af-lp-val" style={{color:"var(--amber)",fontSize:13}}>{form.duration}</div>
                          <div className="af-lp-lbl">Duration</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 — Status & Review */}
            {step === 3 && (
              <div>
                <p className="af-section-desc">Confirm details and set eligibility options.</p>
                <FSelect label="Drive Status" name="status" value={form.status} onChange={handle} options={STATUSES} required />
                <div className={`af-status-hint status-${form.status.toLowerCase()}`}>
                  <span className="af-status-hint-icon">
                    {form.status==="Ongoing"?"🟢":form.status==="Upcoming"?"📅":"✅"}
                  </span>
                  <span>
                    {form.status==="Ongoing"   ? "Drive is currently active." :
                     form.status==="Upcoming"  ? "Drive is scheduled to begin soon." :
                     "Drive has been completed."}
                  </span>
                </div>

                {/* PPO Toggle */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:10,marginBottom:14}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>★ PPO Eligible</div>
                    <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>Pre-Placement Offer — student may receive a full-time offer</div>
                  </div>
                  <Toggle checked={form.ppo} onChange={() => setForm(f => ({...f, ppo:!f.ppo}))} />
                </div>

                {/* Summary card */}
                <div className="af-summary-card">
                  <div className="af-summary-hd">Summary</div>
                  <div className="af-summary-top">
                    <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,rgba(91,78,248,.25),rgba(159,122,234,.2))",border:"1.5px solid rgba(91,78,248,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"var(--indigo-ll)",flexShrink:0}}>
                      {form.company[0]?.toUpperCase()||"?"}
                    </div>
                    <div className="af-summary-info">
                      <div className="af-summary-name">{form.company || "Company"}</div>
                      <div className="af-summary-meta">{form.role || "Role"} · {form.type}</div>
                      {form.location && <div className="af-summary-meta">📍 {form.location}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <Badge cls={statusMap[form.status]} dot>{form.status}</Badge>
                      {form.ppo && <span className="badge-ppo">★ PPO</span>}
                    </div>
                  </div>
                  <div className="af-summary-stats">
                    {[
                      {val:form.stipend?fmtStipend(form.stipend):"—", color:form.stipend?stipendColor(form.stipend):"var(--text3)", lbl:"Stipend"},
                      {val:form.duration||"—", color:"var(--amber)",    lbl:"Duration"},
                      {val:form.date||"—",     color:"var(--indigo-ll)",lbl:"Date"},
                      {val:form.mode||"—",     color:"var(--text2)",    lbl:"Mode"},
                    ].map(m => (
                      <div key={m.lbl} className="af-summary-stat">
                        <div className="af-summary-stat-val" style={{color:m.color,fontSize:11}}>{m.val}</div>
                        <div className="af-summary-stat-lbl">{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        {!success && (
          <div className="pi-footer">
            <div className="pi-footer-left">
              <div className="pi-dots">{[1,2,3].map(n=><div key={n} className={`pi-dot${step===n?" act":step>n?" done":""}`}/>)}</div>
              <span className="pi-step-count">Step {step} of 3</span>
            </div>
            <div className="pi-footer-right">
              <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 18px"}} onClick={step===1?onClose:prev}>{step===1?"Cancel":"← Back"}</button>
              {step < 3
                ? <button className="btn btn-solid" style={{fontSize:11,padding:"9px 22px"}} onClick={next}>Continue →</button>
                : <button className="btn btn-teal"  style={{fontSize:11,padding:"9px 22px"}} onClick={submit} disabled={saving}>
                    {saving ? <><div className="pd-spinner" />&nbsp;Saving…</> : <><CheckIco />Add Drive</>}
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
   DELETE CONFIRM — DELETE /placement/internships/:id
════════════════════════════════════════════ */
function DeleteConfirm({ intern, onConfirm, onCancel, deleting }) {
  return (
    <Overlay onClose={onCancel}>
      <div className="pi-panel pi-panel-delete">
        <div className="pi-delete-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </div>
        <div className="pi-delete-title">Remove Drive?</div>
        <div className="pi-delete-sub">
          This will permanently remove the <strong style={{color:"var(--text)"}}>{intern.company}</strong> — {intern.role} drive.
        </div>
        <div className="pi-delete-actions">
          <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 20px"}} onClick={onCancel}>Cancel</button>
          <button className="btn" style={{fontSize:11,padding:"9px 20px",background:"rgba(240,83,106,.12)",color:"var(--rose)",border:"1px solid rgba(240,83,106,.25)"}} onClick={onConfirm} disabled={deleting}>
            {deleting ? <><div className="pd-spinner" />&nbsp;Removing…</> : <><TrashIco/>&nbsp;Yes, Remove</>}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   ATTENDANCE MODAL — GET /placement/drives/:id/attendance AND POST
════════════════════════════════════════════ */
function AttendanceModal({ drive, onClose }) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [apiErr, setApiErr] = useState(null);

  useEffect(() => {
    const fetchA = async () => {
      try {
        const res = await api.get(`/placement/drives/${drive.id}/attendance`);
        setStudents(res || []);
      } catch (err) {
        setApiErr("Failed to load attendance list.");
      } finally {
        setLoading(false);
      }
    };
    fetchA();
  }, [drive.id]);

  const markStatus = async (studentId, st) => {
    try {
      await api.post(`/placement/drives/${drive.id}/attendance`, { student_id: studentId, status: st });
      setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, status: st } : s));
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="pi-panel" style={{ width: 500, maxWidth: "90vw", padding: 0 }}>
        <div className="pi-header" style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div className="pi-modal-title">Attendance</div>
            <div className="pi-modal-sub">{drive.company} — {drive.role}</div>
          </div>
          <button className="pi-close" onClick={onClose}><XIco /></button>
        </div>
        <div className="pi-body" style={{ padding: "16px 24px", maxHeight: "60vh", overflowY: "auto" }}>
          {apiErr && <div className="af-error"><ErrIco />{apiErr}</div>}
          {loading ? (
             <div style={{ textAlign: "center", padding: "40px" }}><div className="pd-spinner" style={{ borderColor: "var(--indigo-ll)", borderTopColor: "transparent" }} /></div>
          ) : students.length === 0 ? (
             <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text3)", fontSize: 13 }}>No students have registered yet.</div>
          ) : (
             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
               {students.map(s => (
                 <div key={s.student_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 16px", borderRadius: 10 }}>
                   <div>
                     <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.student_name || "Student"}</div>
                     <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{s.student_roll || "—"} · {s.department || "—"}</div>
                   </div>
                   <div style={{ display: "flex", gap: 6 }}>
                     <button
                       onClick={() => markStatus(s.student_id, "Present")}
                       style={{ fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: s.status === "Present" ? "var(--teal)" : "var(--surface2)", color: s.status === "Present" ? "#fff" : "var(--text2)", cursor: "pointer" }}
                     >
                       Present
                     </button>
                     <button
                       onClick={() => markStatus(s.student_id, "Absent")}
                       style={{ fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: s.status === "Absent" ? "var(--rose)" : "var(--surface2)", color: s.status === "Absent" ? "#fff" : "var(--text2)", cursor: "pointer" }}
                     >
                       Absent
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function PlacementDrives() {
  const navigate = useNavigate();

  /* ── API data ── */
  const [loading,      setLoading]     = useState(true);
  const [drives,       setDrives]      = useState([]);
  const [dashStats,    setDashStats]   = useState(null);
  const [officerName,  setOfficerName] = useState("Placement Officer");
  const [mailUnread,   setMailUnread]  = useState(0);

  /* ── UI state ── */
  const [filter,       setFilter]      = useState("All");
  const [search,       setSearch]      = useState("");
  const [showAdd,      setShowAdd]     = useState(false);
  const [deleteTarget, setDeleteTarget]= useState(null);
  const [deleting,     setDeleting]    = useState(false);
  const [attendanceTarget, setAttendanceTarget] = useState(null);

  useEffect(() => {
    document.body.style.overflow = (showAdd || !!deleteTarget || !!attendanceTarget) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  },[showAdd, deleteTarget, attendanceTarget]);

  /* ════════════════════════════════════════════
     FETCH — on mount
  ════════════════════════════════════════════ */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/placement/dashboard/stats"),
          api.get("/placement/drives?limit=50"),
          api.get("/mail/unread/count"),
        ]);
        
        const meRes = results[0];
        const statsRes = results[1];
        const internshipsRes = results[2];

        if (meRes.status === "fulfilled") {
          setOfficerName(meRes.value.full_name ?? meRes.value.email ?? "Placement Officer");
        }

        if (statsRes.status === "fulfilled") {
          setDashStats(statsRes.value);
        }

        if (internshipsRes.status === "fulfilled") {
          const raw = Array.isArray(internshipsRes.value) ? internshipsRes.value : (internshipsRes.value?.items ?? []);
          setDrives(raw.map(mapApiDrive));
        }

        if (results[3]?.status === "fulfilled") {
          setMailUnread(results[3].value.count || 0);
        }
      } catch (err) {
        console.error("Internships fetch error:", err);
      } finally {
        setLoading(false);
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

  /* Re-fetch when search/filter changes */
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ limit:"50" });
        if (filter !== "All") params.set("status", filter);
        const raw = await api.get(`/placement/drives?${params}`);
        const arr = Array.isArray(raw) ? raw : (raw?.items ?? []);
        setDrives(arr.map(mapApiDrive));
      } catch (err) {
        console.error("Drives filter error:", err);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [filter]);

  /* ── HANDLERS ── */
  const handleAdd = useCallback((card) => {
    setDrives(prev => [card, ...prev]);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/placement/drives/${deleteTarget.id}`);
      setDrives(prev => prev.filter(i => i.id !== deleteTarget.id));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  /* ── COMPUTED ── */
  const filtered = drives.filter(i => {
    const mf = filter === "All" || i.status === filter;
    const mq = !search ||
      i.company.toLowerCase().includes(search.toLowerCase()) ||
      i.role.toLowerCase().includes(search.toLowerCase()) ||
      i.branch.toLowerCase().includes(search.toLowerCase());
    return mf && mq;
  });

  const ongoingCount = drives.filter(i => i.status === "Ongoing").length;
  const ppoCount     = drives.filter(i => i.ppo).length;
  const avgStipend   = drives.length
    ? Math.round(drives.reduce((s,i) => s + (i.stipendRaw||0), 0) / drives.length)
    : 0;


  const placementRate = dashStats?.placement_rate ?? 0;
  const initials_officer = officerName.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) || "PO";

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <>

      <div className="sc-noise" />

      {showAdd      && <AddDriveModal onClose={()=>setShowAdd(false)} onAdd={handleAdd} />}
      {deleteTarget && <DeleteConfirm intern={deleteTarget} onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} deleting={deleting} />}
      {attendanceTarget && <AttendanceModal drive={attendanceTarget} onClose={()=>setAttendanceTarget(null)} />}

      <div className="app">
        {/* ══ SIDEBAR ══ */}
        <aside className="sidebar">
          <div className="sb-top">
            <Link to="/placementdashboard" className="sb-brand">
              <div className="sb-mark">SC</div>
              <span className="sb-name">SmartCampus</span>
            </Link>
          </div>
          <Link to="/placementdashboard/placementProfile" className="sb-user" style={{textDecoration:"none"}}>
            <div className="sb-avatar">{initials_officer}</div>
            <div>
              <div className="sb-uname">{loading?"Loading…":officerName}</div>
              <div className="sb-urole">Placement Officer</div>
            </div>
          </Link>
          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard"                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/analytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>
            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students"     badge={loading?"…":String(dashStats?.total_students??"")} badgeCls="teal"  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies"    badge={loading?"…":String(dashStats?.total_companies??"")}  badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink active to="/placementdashboard/drives"       badge={loading?"…":String(dashStats?.upcoming_drives??"")} badgeCls="rose" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>

            <SbLink to="/placementdashboard/offers-placed"              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships"         icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/placementMail" badge={mailUnread > 0 ? mailUnread : null} badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>Mail System</SbLink>
            <SbLink to="/placementdashboard/meetings" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>Virtual Meeting</SbLink>
            <SbLink to="/placementdashboard/ai-assistant"  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports"       icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>
          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">PPO Eligible</div>
              <div className="sb-pri-val">{loading ? "…" : ppoCount}</div>
              <div className="sb-pri-sub">AY {dashStats?.academic_year ?? "2024-25"} · {loading?"…":`${drives.length} total`}</div>

              <div className="sb-pri-bar">
                <div className="sb-pri-fill" style={{ width: loading?"0%":`${drives.length ? Math.round(ppoCount/drives.length*100) : 0}%`, transition:"width 1s ease" }} />
              </div>
            </div>
            <button className="sb-logout" onClick={() => { clearAuth(); navigate("/login",{replace:true}); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <div className="main">
          <header className="topbar">
            <span className="tb-page">Drives</span>
            <div className="tb-sep" />
            <div className="tb-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--text3)",flexShrink:0}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search company, role, branch…" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <div className="tb-right">
              <span className="tb-date">{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</span>
              <button className="btn btn-solid" style={{fontSize:10,padding:"8px 14px"}} onClick={()=>setShowAdd(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Drive
              </button>
            </div>
          </header>

          <div className="content">
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip"/><span className="greet-pip-txt">{loading?"Loading…":`${drives.length} Drives · AY ${dashStats?.academic_year ?? "2024-25"}`}</span></div>

              <h1 className="greet-title">Placement <em>Drives</em></h1>
              <p className="greet-sub">
                {loading ? "Loading drive data…" : `${ongoingCount} ongoing, ${ppoCount} PPO eligible, avg stipend ₹${Math.round(avgStipend/1000)}K/mo.`}
              </p>
            </div>

            {/* STAT CARDS — from real API */}
            <div className="stat-grid" style={{marginBottom:18}}>
              {loading ? (
                [1,2,3,4].map(i=><div key={i} className="stat-card sc-indigo"><Skeleton height={30} style={{marginBottom:6}}/><Skeleton height={12} width="60%"/></div>)
              ) : [
                {label:"Total Drives", val:drives.length,               color:"indigo", delta:"This academic year"},
                {label:"Ongoing",            val:ongoingCount,                     color:"teal",   delta:"Currently active"},
                {label:"PPO Eligible",       val:ppoCount,                         color:"amber",  delta:"Pre-Placement Offers"},
                {label:"Avg Stipend",        val:`₹${Math.round(avgStipend/1000)}K`, color:"violet", delta:"Per month average"},
              ].map(s => (
                <div key={s.label} className={`stat-card sc-${s.color}`}>
                  <div className="stat-val" style={s.color!=="indigo"?{color:`var(--${s.color})`}:{}}>{s.val}</div>
                  <div className="stat-lbl">{s.label}</div>
                  <span className="stat-delta delta-up">{s.delta}</span>
                </div>
              ))}
            </div>

            {/* PPO BANNER */}
            {!loading && ppoCount > 0 && (
              <div className="ppo-banner">
                <div className="ppo-banner-icon">⭐</div>
                <div className="ppo-banner-info">
                  <div className="ppo-banner-title">PPO Eligible Drives</div>
                  <div className="ppo-banner-sub">These drives may result in Pre-Placement Offers upon completion.</div>
                </div>
                <div className="ppo-banner-count">{ppoCount}</div>
              </div>
            )}

            {/* FILTERS */}
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <div className="filter-row">
                {["All","Ongoing","Upcoming","Completed"].map(f => (
                  <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{f}</button>
                ))}
              </div>
              <span style={{marginLeft:"auto",fontSize:11,color:"var(--text3)"}}>{filtered.length} drive{filtered.length!==1?"s":""}</span>
            </div>

            {/* CARDS GRID */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:16}}>
              {loading ? (
                [1,2,3,4].map(i => (
                  <div key={i} className="panel" style={{margin:0,padding:"18px 20px"}}>
                    <Skeleton height={40} style={{marginBottom:12}}/>
                    <Skeleton height={12} width="60%" style={{marginBottom:8}}/>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                      {[1,2,3].map(j=><Skeleton key={j} height={48} style={{borderRadius:8}}/>)}
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px 20px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14}}>
                  <div style={{fontSize:32,marginBottom:12}}>🔍</div>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:"var(--text2)",marginBottom:6}}>No drives found</div>
                  <div style={{fontSize:12,color:"var(--text3)"}}>Try adjusting your search or filters, or add a new drive.</div>
                  <button className="btn btn-solid" style={{marginTop:16,fontSize:11,padding:"10px 20px"}} onClick={()=>setShowAdd(true)}>+ Add Drive</button>
                </div>
              ) : filtered.map(i => (
                <div key={i.id} className="panel" style={{margin:0,transition:"border-color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(91,78,248,.3)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=""}>
                  <div style={{padding:"18px 20px"}}>
                    {/* CARD TOP */}
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,rgba(91,78,248,.25),rgba(159,122,234,.2))",border:"1.5px solid rgba(91,78,248,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"var(--indigo-ll)",flexShrink:0}}>
                          {i.company[0]?.toUpperCase()||"?"}
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{i.company}</div>
                          <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{i.role}</div>
                          {i.branch && i.branch !== "—" && <div style={{fontSize:9,color:"var(--text3)",marginTop:1}}>{i.branch}</div>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
                        <Badge cls={statusMap[i.status] ?? "badge-indigo"} dot>{i.status}</Badge>
                        {i.ppo && <span className="badge-ppo">★ PPO</span>}
                        <div style={{display:"flex",gap:8,marginTop:4}}>
                          <button style={{fontSize:10,padding:"4px 8px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:6,color:"var(--text2)",cursor:"pointer"}} onClick={() => setAttendanceTarget(i)}>Attendance</button>
                          <button className="pi-card-del" onClick={()=>setDeleteTarget(i)} title="Remove">
                            <TrashIco />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* MINI STATS */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                      {[
                        {val:i.stipend,   color:stipendColor(i.stipendRaw), lbl:"Stipend", bar:true },
                        {val:i.duration,  color:"var(--amber)",              lbl:"Duration"},
                        {val:i.start,     color:"var(--indigo-ll)",          lbl:"Start"},
                      ].map(s => (
                        <div key={s.lbl} style={{background:"var(--surface2)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:13,color:s.color}}>{s.val}</div>
                          <div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>{s.lbl}</div>
                          {s.bar && (
                            <div className="stipend-bar">
                              <div className="stipend-fill" style={{width:`${stipendPct(i.stipendRaw)}%`}} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* CARD FOOTER */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:10,borderTop:"1px solid var(--border)"}}>
                      <div style={{fontSize:11,color:"var(--text3)"}}>
                        {i.location && <span>📍 {i.location}</span>}
                      </div>
                      {i.mode && (
                        <span style={{fontSize:9,color:"var(--text3)",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:5,padding:"2px 7px"}}>
                          {i.mode==="Remote"?"🌐":i.mode==="Hybrid"?"⚡":"📍"} {i.mode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}