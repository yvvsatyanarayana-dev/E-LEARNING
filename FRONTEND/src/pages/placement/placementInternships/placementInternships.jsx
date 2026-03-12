import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./placementInternships.css";

/* ══════════════════════════════════════════
   SHARED UI ATOMS
══════════════════════════════════════════ */
const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

/* ══════════════════════════════════════════
   CONSTANTS & HELPERS
══════════════════════════════════════════ */
const BRANCHES   = ["CSE","IT","ECE","EEE","MECH","CIVIL","BCA","MCA"];
const STATUSES   = ["Ongoing","Upcoming","Completed"];
const DURATIONS  = ["1 month","2 months","3 months","6 months","12 months"];

const statusMap = { "Ongoing":"badge-teal","Upcoming":"badge-indigo","Completed":"badge-amber" };

const stipendColor = s => {
  const n = parseInt(s) || 0;
  if (n >= 60000) return "var(--teal)";
  if (n >= 35000) return "var(--indigo-ll)";
  return "var(--amber)";
};

const stipendPct = s => {
  const n = parseInt(s) || 0;
  return Math.min((n / 100000) * 100, 100);
};

const initials = n => n.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

const fmtStipend = s => {
  const n = parseInt(s) || 0;
  if (n >= 1000) return `₹${(n/1000).toFixed(0)}K/mo`;
  return `₹${n}/mo`;
};

const defaultForm = {
  name:"", rollNo:"", branch:"CSE",
  company:"", role:"",
  stipend:"", duration:"3 months", startDate:"",
  status:"Upcoming", ppo:false,
  mode:"On-site", location:"",
};

const defaultSettings = {
  academicYear:"2024-25",
  officerName:"Ms. Kavitha R", officerDept:"Placement Officer",
  showStats:true, showPpoBanner:true, colorStipend:true,
  newInternAlert:true, weeklyEmail:false,
  exportFormat:"CSV",
};

/* ══════════════════════════════════════════
   FORM FIELD COMPONENTS
══════════════════════════════════════════ */
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
  <label className="pi-toggle" onMouseDown={e=>e.stopPropagation()}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="pi-toggle-track"><span className="pi-toggle-thumb" /></span>
  </label>
);

/* ── ICONS ── */
const CheckIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const ErrIco   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const XIco     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const TrashIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;

const stepIcos = [
  <svg key="a" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  <svg key="b" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  <svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
];

/* ─────────────────────────────────────────────
   OVERLAY
───────────────────────────────────────────── */
function Overlay({ onClose, children }) {
  return (
    <div className="pi-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div onMouseDown={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADD INTERNSHIP MODAL  (3 steps)
══════════════════════════════════════════ */
function AddInternshipModal({ onClose, onAdd }) {
  const [form,    setForm]    = useState(defaultForm);
  const [step,    setStep]    = useState(1);
  const [errors,  setErrors]  = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type==="checkbox" ? checked : value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim())   e.name    = "Student name is required";
      if (!form.branch)        e.branch  = "Branch is required";
    }
    if (step === 2) {
      if (!form.company.trim()) e.company = "Company name is required";
      if (!form.role.trim())    e.role    = "Role is required";
      if (!form.stipend)        e.stipend = "Stipend is required";
      else if (isNaN(parseInt(form.stipend))) e.stipend = "Enter a valid number";
      if (!form.startDate)      e.startDate = "Start date is required";
    }
    return e;
  };

  const next = () => { const e=validate(); if(Object.keys(e).length){setErrors(e);return;} setStep(s=>s+1); };
  const prev = () => { setErrors({}); setStep(s=>s-1); };

  const handleSubmit = () => {
    const n = parseInt(form.stipend) || 0;
    const internship = {
      id: Date.now(),
      init: initials(form.name),
      name: form.name,
      rollNo: form.rollNo,
      branch: form.branch,
      company: form.company,
      role: form.role,
      stipend: fmtStipend(n),
      stipendRaw: n,
      duration: form.duration,
      start: form.startDate,
      status: form.status,
      ppo: form.ppo,
      mode: form.mode,
      location: form.location,
    };
    setSuccess(true);
    setTimeout(() => { onAdd(internship); onClose(); }, 1500);
  };

  const STEP_LABELS = ["Student Info","Internship Details","Status & Review"];

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
              <div className="pi-modal-title">Add Internship</div>
              <div className="pi-modal-sub">Register a student internship in the system</div>
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
                <div className={`pi-step-circle${act?" act":""}${done?" done":""}`}>
                  {done ? <CheckIco /> : stepIcos[i]}
                </div>
                <span className={`pi-step-label${act?" act":""}${done?" done":""}`}>{label}</span>
                {i<STEP_LABELS.length-1 && <div className={`pi-step-line${done?" done":""}`} />}
              </div>
            );
          })}
        </div>

        {/* BODY */}
        {success ? (
          <div className="pi-success">
            <div className="pi-success-ring">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="pi-success-title">Internship Added!</div>
            <div className="pi-success-sub">{form.name}'s internship at {form.company} has been logged.</div>
          </div>
        ) : (
          <div className="pi-body">

            {/* STEP 1 — Student Info */}
            {step === 1 && (
              <div>
                <p className="af-section-desc">Enter the student's basic details for this internship.</p>
                <div className="af-grid-2">
                  <FInput label="Student Full Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Riya Singh" required />
                  <FInput label="Roll Number" name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. 21CS045" hint="(optional)" />
                </div>
                {errors.name && <div className="af-errors"><div className="af-error"><ErrIco />{errors.name}</div></div>}
                <FSelect label="Branch" name="branch" value={form.branch} onChange={handleChange} options={BRANCHES} required />

                {/* Live student preview */}
                {form.name && (
                  <div className="af-live-preview">
                    <div className="af-lp-label">Student Preview</div>
                    <div className="af-lp-row">
                      <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,rgba(91,78,248,.3),rgba(159,122,234,.2))",border:"1.5px solid rgba(91,78,248,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"var(--indigo-ll)",flexShrink:0}}>
                        {initials(form.name)}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{form.name}</div>
                        <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{form.branch}{form.rollNo ? ` · ${form.rollNo}` : ""}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Internship Details */}
            {step === 2 && (
              <div>
                <p className="af-section-desc">Enter the company, role, stipend, and schedule details.</p>
                <div className="af-grid-2">
                  <FInput label="Company" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google" required />
                  <FInput label="Role / Title" name="role" value={form.role} onChange={handleChange} placeholder="e.g. SWE Intern" required />
                </div>
                {(errors.company||errors.role) && <div className="af-errors">
                  {errors.company && <div className="af-error"><ErrIco />{errors.company}</div>}
                  {errors.role    && <div className="af-error"><ErrIco />{errors.role}</div>}
                </div>}

                <div className="af-grid-2">
                  <div className="af-field">
                    <label className="af-label">Monthly Stipend <span className="af-req">*</span> <span className="af-hint">in ₹</span></label>
                    <input className="af-input" type="number" name="stipend" value={form.stipend} onChange={handleChange} placeholder="e.g. 60000" min="0" step="1000" />
                    {errors.stipend && <div className="af-error-inline">{errors.stipend}</div>}
                    {form.stipend && (
                      <>
                        <div className="af-micro-bar">
                          <div className="af-micro-fill" style={{width:`${stipendPct(form.stipend)}%`,background:stipendColor(form.stipend)}} />
                        </div>
                      </>
                    )}
                  </div>
                  <FSelect label="Duration" name="duration" value={form.duration} onChange={handleChange} options={DURATIONS} />
                </div>

                <div className="af-grid-2">
                  <div className="af-field">
                    <label className="af-label">Start Date <span className="af-req">*</span></label>
                    <input className="af-input" type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                    {errors.startDate && <div className="af-error-inline">{errors.startDate}</div>}
                  </div>
                  <div className="af-field">
                    <label className="af-label">Mode</label>
                    <div className="af-radio-row">
                      {["On-site","Remote","Hybrid"].map(v=>(
                        <label key={v} className={`af-radio-btn${form.mode===v?" active":""}`}>
                          <input type="radio" name="mode" value={v} checked={form.mode===v} onChange={handleChange} style={{display:"none"}} />{v}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <FInput label="Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore, Karnataka" hint="(optional)" />

                {/* Live stipend preview */}
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
                <p className="af-section-desc">Set the internship status and confirm all details.</p>
                <FSelect label="Internship Status" name="status" value={form.status} onChange={handleChange} options={STATUSES} required />

                <div className={`af-status-hint status-${form.status.toLowerCase()}`}>
                  <span className="af-status-hint-icon">
                    {form.status==="Ongoing"?"🟢":form.status==="Upcoming"?"📅":"✅"}
                  </span>
                  <span>
                    {form.status==="Ongoing"   ? "Internship is currently active. Student is working at the company." :
                     form.status==="Upcoming"  ? "Internship is scheduled to begin soon." :
                     "Internship has been completed successfully."}
                  </span>
                </div>

                {/* PPO Toggle */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:10,marginBottom:14}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>★ PPO Eligible</div>
                    <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>Pre-Placement Offer — student may receive a full-time offer</div>
                  </div>
                  <Toggle checked={form.ppo} onChange={()=>setForm(f=>({...f,ppo:!f.ppo}))} />
                </div>

                {/* Full summary */}
                <div className="af-summary-card">
                  <div className="af-summary-hd">Summary</div>
                  <div className="af-summary-top">
                    <div className="af-summary-av">{initials(form.name||"ST")}</div>
                    <div className="af-summary-info">
                      <div className="af-summary-name">{form.name||"Student Name"}</div>
                      <div className="af-summary-meta">{form.branch}{form.rollNo?` · ${form.rollNo}`:""}</div>
                      <div className="af-summary-meta">{form.role||"Role"} @ {form.company||"Company"}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <Badge cls={statusMap[form.status]} dot>{form.status}</Badge>
                      {form.ppo && <span className="badge-ppo">★ PPO</span>}
                    </div>
                  </div>
                  <div className="af-summary-stats">
                    {[
                      {val:form.stipend?fmtStipend(form.stipend):"—",  color:form.stipend?stipendColor(form.stipend):"var(--text3)", lbl:"Stipend"},
                      {val:form.duration||"—",                           color:"var(--amber)",    lbl:"Duration"},
                      {val:form.startDate||"—",                          color:"var(--indigo-ll)",lbl:"Start"},
                      {val:form.mode||"—",                               color:"var(--text2)",    lbl:"Mode"},
                    ].map(m=>(
                      <div key={m.lbl} className="af-summary-stat">
                        <div className="af-summary-stat-val" style={{color:m.color,fontSize:11}}>{m.val}</div>
                        <div className="af-summary-stat-lbl">{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {form.location && <div style={{fontSize:10,color:"var(--text3)"}}>📍 {form.location}</div>}
                </div>
              </div>
            )}

          </div>
        )}

        {/* FOOTER */}
        {!success && (
          <div className="pi-footer">
            <div className="pi-footer-left">
              <div className="pi-dots">{[1,2,3].map(n=><div key={n} className={`pi-dot${step===n?" act":step>n?" done":""}`} />)}</div>
              <span className="pi-step-count">Step {step} of 3</span>
            </div>
            <div className="pi-footer-right">
              <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 18px"}} onClick={step===1?onClose:prev}>{step===1?"Cancel":"← Back"}</button>
              {step < 3
                ? <button className="btn btn-solid" style={{fontSize:11,padding:"9px 22px"}} onClick={next}>Continue →</button>
                : <button className="btn btn-teal"  style={{fontSize:11,padding:"9px 22px"}} onClick={handleSubmit}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Add Internship
                  </button>
              }
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

/* ══════════════════════════════════════════
   SETTINGS MODAL
══════════════════════════════════════════ */
function SettingsModal({ onClose, settings, onSave }) {
  const [tab,   setTab]   = useState("general");
  const [local, setLocal] = useState({...settings});
  const toggle = key => setLocal(s=>({...s,[key]:!s[key]}));
  const setVal = (key,val) => setLocal(s=>({...s,[key]:val}));

  return (
    <Overlay onClose={onClose}>
      <div className="pi-panel pi-panel-sm">
        <div className="pi-header">
          <div className="pi-header-left">
            <div className="pi-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div>
              <div className="pi-modal-title">Settings</div>
              <div className="pi-modal-sub">Customize your internships dashboard</div>
            </div>
          </div>
          <button className="pi-close" onClick={onClose}><XIco /></button>
        </div>

        <div className="pi-tabs">
          {["general","display","notifications","data"].map(t=>(
            <button key={t} className={`pi-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        <div className="pi-body">
          {tab==="general" && (
            <div>
              <div className="pi-section-label">Academic</div>
              <div className="pi-row">
                <div className="pi-row-info"><div className="pi-row-label">Academic Year</div><div className="pi-row-desc">Shown in reports and sidebar</div></div>
                <select className="pi-select" value={local.academicYear} onChange={e=>setVal("academicYear",e.target.value)}>
                  {["2022-23","2023-24","2024-25","2025-26"].map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="pi-section-label" style={{marginTop:18}}>Officer Profile</div>
              <div className="af-grid-2" style={{marginBottom:0}}>
                <FInput label="Name" name="officerName" value={local.officerName} onChange={e=>setVal("officerName",e.target.value)} placeholder="Officer name" />
                <FInput label="Role" name="officerDept" value={local.officerDept} onChange={e=>setVal("officerDept",e.target.value)} placeholder="e.g. Placement Officer" />
              </div>
            </div>
          )}
          {tab==="display" && (
            <div>
              <div className="pi-section-label">Cards &amp; Layout</div>
              <div className="pi-row"><div className="pi-row-info"><div className="pi-row-label">Show Stat Cards</div><div className="pi-row-desc">Summary numbers at top of page</div></div><Toggle checked={local.showStats}     onChange={()=>toggle("showStats")} /></div>
              <div className="pi-row"><div className="pi-row-info"><div className="pi-row-label">Show PPO Banner</div><div className="pi-row-desc">PPO eligible count highlight</div></div><Toggle checked={local.showPpoBanner} onChange={()=>toggle("showPpoBanner")} /></div>
              <div className="pi-row"><div className="pi-row-info"><div className="pi-row-label">Color-code Stipend</div><div className="pi-row-desc">Green / amber by stipend value</div></div><Toggle checked={local.colorStipend}  onChange={()=>toggle("colorStipend")} /></div>
            </div>
          )}
          {tab==="notifications" && (
            <div>
              <div className="pi-section-label">Alerts</div>
              {[
                {key:"newInternAlert", label:"New Internship Alerts", desc:"When an internship is added"},
                {key:"weeklyEmail",    label:"Weekly Summary Email",  desc:"Stats digest every Monday"},
              ].map(r=>(
                <div key={r.key} className="pi-row">
                  <div className="pi-row-info"><div className="pi-row-label">{r.label}</div><div className="pi-row-desc">{r.desc}</div></div>
                  <Toggle checked={local[r.key]} onChange={()=>toggle(r.key)} />
                </div>
              ))}
            </div>
          )}
          {tab==="data" && (
            <div>
              <div className="pi-section-label">Export</div>
              <div className="pi-row">
                <div className="pi-row-info"><div className="pi-row-label">Default Export Format</div><div className="pi-row-desc">Used when downloading data</div></div>
                <select className="pi-select" value={local.exportFormat} onChange={e=>setVal("exportFormat",e.target.value)}>
                  {["CSV","Excel","PDF"].map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="pi-section-label" style={{marginTop:18,color:"var(--rose)"}}>Danger Zone</div>
              <div className="pi-row">
                <div className="pi-row-info"><div className="pi-row-label">Reset All Settings</div><div className="pi-row-desc">Restore defaults</div></div>
                <button className="btn" style={{fontSize:11,padding:"7px 14px",background:"rgba(240,83,106,.1)",color:"var(--rose)",border:"1px solid rgba(240,83,106,.25)"}} onClick={()=>setLocal({...defaultSettings})}>Reset</button>
              </div>
            </div>
          )}
        </div>

        <div className="pi-footer">
          <div className="pi-footer-left"><span style={{fontSize:11,color:"var(--text3)"}}>Saved on confirm</span></div>
          <div className="pi-footer-right">
            <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 18px"}} onClick={onClose}>Cancel</button>
            <button className="btn btn-teal"  style={{fontSize:11,padding:"9px 22px"}} onClick={()=>{onSave(local);onClose();}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ══════════════════════════════════════════
   DELETE CONFIRM
══════════════════════════════════════════ */
function DeleteConfirm({ intern, onConfirm, onCancel }) {
  return (
    <Overlay onClose={onCancel}>
      <div className="pi-panel pi-panel-delete">
        <div className="pi-delete-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <div className="pi-delete-title">Remove Internship?</div>
        <div className="pi-delete-sub">
          This will permanently remove <strong style={{color:"var(--text)"}}>{intern.name}</strong>'s internship at <strong style={{color:"var(--text)"}}>{intern.company}</strong>.
        </div>
        <div className="pi-delete-actions">
          <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 20px"}} onClick={onCancel}>Cancel</button>
          <button className="btn" style={{fontSize:11,padding:"9px 20px",background:"rgba(240,83,106,.12)",color:"var(--rose)",border:"1px solid rgba(240,83,106,.25)"}} onClick={onConfirm}>Yes, Remove</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ══════════════════════════════════════════
   INITIAL DATA
══════════════════════════════════════════ */
const initialInternships = [
  { id:1,  init:"RS", name:"Riya Singh",    rollNo:"21CS045", branch:"CSE",  company:"Google",    role:"SWE Intern",          stipend:"₹80K/mo", stipendRaw:80000, duration:"3 months", start:"Jan 2025", status:"Ongoing",   ppo:true,  mode:"On-site", location:"Bangalore" },
  { id:2,  init:"AV", name:"Arun V",        rollNo:"21IT012", branch:"IT",   company:"Microsoft", role:"PM Intern",            stipend:"₹70K/mo", stipendRaw:70000, duration:"2 months", start:"Feb 2025", status:"Ongoing",   ppo:false, mode:"Hybrid",  location:"Hyderabad" },
  { id:3,  init:"NS", name:"Nisha S",       rollNo:"21CS031", branch:"CSE",  company:"Amazon",    role:"Data Analyst Intern",  stipend:"₹60K/mo", stipendRaw:60000, duration:"3 months", start:"Apr 2025", status:"Upcoming",  ppo:true,  mode:"On-site", location:"Bangalore" },
  { id:4,  init:"MM", name:"Mohan M",       rollNo:"21EC018", branch:"ECE",  company:"Qualcomm",  role:"Embedded Intern",      stipend:"₹50K/mo", stipendRaw:50000, duration:"6 months", start:"Aug 2024", status:"Completed", ppo:false, mode:"On-site", location:"Chennai" },
  { id:5,  init:"PS", name:"Pavithra S",    rollNo:"21CS022", branch:"CSE",  company:"Swiggy",    role:"Backend Intern",       stipend:"₹55K/mo", stipendRaw:55000, duration:"3 months", start:"Sep 2024", status:"Completed", ppo:true,  mode:"On-site", location:"Bangalore" },
  { id:6,  init:"KP", name:"Kiran P",       rollNo:"21IT008", branch:"IT",   company:"Razorpay",  role:"Frontend Intern",      stipend:"₹45K/mo", stipendRaw:45000, duration:"2 months", start:"Feb 2025", status:"Ongoing",   ppo:false, mode:"Remote",  location:"Remote" },
  { id:7,  init:"DR", name:"Divya R",       rollNo:"21ME014", branch:"MECH", company:"L&T",       role:"Design Intern",        stipend:"₹25K/mo", stipendRaw:25000, duration:"6 months", start:"Jan 2025", status:"Ongoing",   ppo:false, mode:"On-site", location:"Mumbai" },
  { id:8,  init:"SA", name:"Santhosh A",    rollNo:"21CS037", branch:"CSE",  company:"Flipkart",  role:"SDE Intern",           stipend:"₹65K/mo", stipendRaw:65000, duration:"3 months", start:"May 2025", status:"Upcoming",  ppo:true,  mode:"On-site", location:"Bangalore" },
  { id:9,  init:"VK", name:"Vaishnavi K",   rollNo:"21CS019", branch:"CSE",  company:"Zoho",      role:"Software Intern",      stipend:"₹40K/mo", stipendRaw:40000, duration:"3 months", start:"Jun 2025", status:"Upcoming",  ppo:false, mode:"On-site", location:"Chennai" },
  { id:10, init:"RD", name:"Rohit Dubey",   rollNo:"21IT025", branch:"IT",   company:"Wipro",     role:"Cloud Intern",         stipend:"₹30K/mo", stipendRaw:30000, duration:"2 months", start:"Mar 2025", status:"Ongoing",   ppo:false, mode:"Hybrid",  location:"Pune" },
];

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function PlacementInternships() {
  const [internships,    setInternships]    = useState(initialInternships);
  const [filter,         setFilter]         = useState("All");
  const [search,         setSearch]         = useState("");
  const [showAdd,        setShowAdd]        = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState(null);
  const [settings,       setSettings]       = useState(defaultSettings);

  /* ── CUSTOM CURSOR ── */
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

  useEffect(() => {
    const open = showAdd || showSettings || !!deleteTarget;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  },[showAdd,showSettings,deleteTarget]);

  /* ── COMPUTED ── */
  const handleAdd    = i  => setInternships(prev=>[i,...prev]);
  const handleDelete = () => { setInternships(prev=>prev.filter(i=>i.id!==deleteTarget.id)); setDeleteTarget(null); };

  const filtered = internships.filter(i => {
    const mf = filter==="All" || i.status===filter;
    const mq = i.name.toLowerCase().includes(search.toLowerCase()) ||
               i.company.toLowerCase().includes(search.toLowerCase()) ||
               i.role.toLowerCase().includes(search.toLowerCase()) ||
               i.branch.toLowerCase().includes(search.toLowerCase());
    return mf && mq;
  });

  const ongoingCount  = internships.filter(i=>i.status==="Ongoing").length;
  const ppoCount      = internships.filter(i=>i.ppo).length;
  const avgStipend    = internships.length
    ? Math.round(internships.reduce((s,i)=>s+(i.stipendRaw||0),0)/internships.length)
    : 0;

  /* ── SIDEBAR ── */
  const Sidebar = () => (
    <aside className="sidebar">
      <div className="sb-top">
        <a className="sb-brand" href="#"><div className="sb-mark">SC</div><span className="sb-name">SmartCampus</span></a>
      </div>
      <div className="sb-user">
        <div className="sb-avatar">{settings.officerName.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</div>
        <div><div className="sb-uname">{settings.officerName}</div><div className="sb-urole">{settings.officerDept}</div></div>
      </div>
      <nav className="sb-nav">
        <div className="sb-sec-label">Overview</div>
        <SbLink to="/placementdashboard" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
        <SbLink to="/placementdashboard/placementAnalytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>
        <div className="sb-sec-label">Placement</div>
        <SbLink to="/placementdashboard/students"      badge="316" badgeCls="teal"  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
        <SbLink to="/placementdashboard/companies"     badge="8"   badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
        <SbLink to="/placementdashboard/drives"        badge="3"   badgeCls="rose"  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
        <SbLink to="/placementdashboard/offers-placed"              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers &amp; Placed</SbLink>
        <SbLink active to="/placementdashboard/internships"         icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
        <div className="sb-sec-label">Tools</div>
        <SbLink to="/placementdashboard/ai-assistant"  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
        <SbLink to="/placementdashboard/reports"       icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
      </nav>
      <div className="sb-bottom">
        <div className="sb-pri">
          <div className="sb-pri-lbl">PPO Eligible</div>
          <div className="sb-pri-val">{ppoCount}</div>
          <div className="sb-pri-sub">AY {settings.academicYear}</div>
          <div className="sb-pri-bar"><div className="sb-pri-fill" style={{width:`${internships.length?Math.round(ppoCount/internships.length*100):0}%`}} /></div>
        </div>
        <button className="sb-logout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* CURSOR */}
      <div className="sc-cursor"      ref={curRef}  style={{zIndex:99999}} />
      <div className="sc-cursor-ring" ref={ringRef} style={{zIndex:99999}} />
      <div className="sc-noise" />

      {/* MODALS */}
      {showAdd      && <AddInternshipModal onClose={()=>setShowAdd(false)}      onAdd={handleAdd} />}
      {showSettings && <SettingsModal      onClose={()=>setShowSettings(false)} settings={settings} onSave={setSettings} />}
      {deleteTarget && <DeleteConfirm      intern={deleteTarget} onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} />}

      <div className="app">
        <Sidebar />

        <div className="main">
          {/* TOPBAR */}
          <header className="topbar">
            <span className="tb-page">Internships</span>
            <div className="tb-sep" />
            <div className="tb-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--text3)",flexShrink:0}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search student, company, role…" value={search} onChange={e=>setSearch(e.target.value)} style={{cursor:"none"}} />
            </div>
            <div className="tb-right">
              <span className="tb-date">Thu, 12 Mar</span>
              <button className="tb-icon-btn" onClick={()=>setShowSettings(true)} title="Settings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"inherit"}}>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button className="btn btn-solid" style={{fontSize:10,padding:"8px 14px"}} onClick={()=>setShowAdd(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Internship
              </button>
            </div>
          </header>

          <div className="content">
            {/* GREET */}
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">{internships.length} Internships · AY {settings.academicYear}</span></div>
              <h1 className="greet-title">Student <em>Internships</em></h1>
              <p className="greet-sub">Track all student internships, stipends, and PPO conversions.</p>
            </div>

            {/* STAT CARDS */}
            {settings.showStats && (
              <div className="stat-grid" style={{marginBottom:18}}>
                {[
                  {label:"Total Internships", val:internships.length,               color:"indigo", delta:"This academic year",       type:"up"},
                  {label:"Ongoing",            val:ongoingCount,                      color:"teal",   delta:"Currently active",         type:"up"},
                  {label:"PPO Eligible",        val:ppoCount,                          color:"amber",  delta:"Pre-Placement Offers",     type:"up"},
                  {label:"Avg Stipend",          val:`₹${Math.round(avgStipend/1000)}K`,color:"violet", delta:"Per month avg",           type:"neu"},
                ].map(s=>(
                  <div key={s.label} className={`stat-card sc-${s.color}`}>
                    <div className="stat-val" style={s.color!=="indigo"?{color:`var(--${s.color})`}:{}}>{s.val}</div>
                    <div className="stat-lbl">{s.label}</div>
                    <span className={`stat-delta delta-${s.type}`}>{s.delta}</span>
                  </div>
                ))}
              </div>
            )}

            {/* PPO BANNER */}
            {settings.showPpoBanner && ppoCount > 0 && (
              <div className="ppo-banner">
                <div className="ppo-banner-icon">⭐</div>
                <div className="ppo-banner-info">
                  <div className="ppo-banner-title">PPO Eligible Students</div>
                  <div className="ppo-banner-sub">These students may receive Pre-Placement Offers from their host companies upon completing their internships.</div>
                </div>
                <div className="ppo-banner-count">{ppoCount}</div>
              </div>
            )}

            {/* FILTERS */}
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <div className="filter-row">
                {["All","Ongoing","Upcoming","Completed"].map(f=>(
                  <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{f}</button>
                ))}
              </div>
              <span style={{marginLeft:"auto",fontSize:11,color:"var(--text3)"}}>{filtered.length} internships</span>
            </div>

            {/* CARDS GRID */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:16}}>
              {filtered.length === 0 ? (
                <div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px 20px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14}}>
                  <div style={{fontSize:32,marginBottom:12}}>🔍</div>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:"var(--text2)",marginBottom:6}}>No internships found</div>
                  <div style={{fontSize:12,color:"var(--text3)"}}>Try adjusting your search or filters</div>
                </div>
              ) : filtered.map(i => (
                <div key={i.id} className="panel" style={{margin:0,cursor:"none",transition:"border-color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(91,78,248,.3)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=""}>
                  <div style={{padding:"18px 20px"}}>

                    {/* CARD TOP */}
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div className="stu-av" style={{width:40,height:40,fontSize:13}}>{i.init}</div>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{i.name}</div>
                          <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{i.branch} · {i.role}</div>
                          {i.rollNo && <div style={{fontSize:9,color:"var(--text3)",marginTop:1}}>{i.rollNo}</div>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
                        <Badge cls={statusMap[i.status]} dot>{i.status}</Badge>
                        {i.ppo && <span className="badge-ppo">★ PPO</span>}
                        <button className="pi-card-del" onClick={()=>setDeleteTarget(i)} title="Remove">
                          <TrashIco />
                        </button>
                      </div>
                    </div>

                    {/* MINI STATS */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                      <div style={{background:"var(--surface2)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Fraunces',serif",fontSize:13,color:settings.colorStipend?stipendColor(i.stipendRaw):undefined}}>{i.stipend}</div>
                        <div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>Stipend</div>
                        <div className="stipend-bar"><div className="stipend-fill" style={{width:`${stipendPct(i.stipendRaw)}%`}} /></div>
                      </div>
                      <div style={{background:"var(--surface2)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Fraunces',serif",fontSize:13,color:"var(--amber)"}}>{i.duration}</div>
                        <div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>Duration</div>
                      </div>
                      <div style={{background:"var(--surface2)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Fraunces',serif",fontSize:13,color:"var(--indigo-ll)"}}>{i.start}</div>
                        <div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>Start</div>
                      </div>
                    </div>

                    {/* CARD FOOTER */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:10,borderTop:"1px solid var(--border)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:26,height:26,borderRadius:6,background:"rgba(91,78,248,.1)",border:"1px solid rgba(91,78,248,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"var(--indigo-ll)",flexShrink:0}}>
                          {i.company[0]}
                        </div>
                        <span style={{fontSize:12,fontWeight:600,color:"var(--text2)"}}>{i.company}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {i.mode && (
                          <span style={{fontSize:9,color:"var(--text3)",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:5,padding:"2px 7px"}}>
                            {i.mode==="Remote"?"🌐":i.mode==="Hybrid"?"⚡":"📍"} {i.mode}
                          </span>
                        )}
                      </div>
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