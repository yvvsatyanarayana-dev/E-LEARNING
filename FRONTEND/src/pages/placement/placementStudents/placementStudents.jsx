import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./placementStudents.css";

const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

const statusMap = { "Placed":"badge-teal","In Process":"badge-indigo","Applied":"badge-amber","Not Ready":"badge-rose" };
const priColor  = s => s>=85?"var(--teal)":s>=70?"var(--indigo-ll)":s>=55?"var(--amber)":"var(--rose)";
const cgpaColor = c => c>=9?"var(--teal)":c>=8?"var(--indigo-ll)":"var(--amber)";
const initials  = n => n.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

const BRANCHES = ["CSE","IT","ECE","EEE","MECH","CIVIL"];
const YEARS    = ["1st","2nd","3rd","4th"];
const STATUSES = ["Applied","In Process","Placed","Not Ready"];

const defaultForm = {
  name:"",rollNo:"",email:"",phone:"",
  branch:"CSE",year:"4th",section:"A",
  cgpa:"",pri:"",skills:"",
  company:"",pkg:"",interviews:"0",
  status:"Applied",linkedin:"",github:"",
  tenth:"",twelve:"",backlogs:"0",
};

const defaultSettings = {
  academicYear:"2024-25",minCgpa:"7.0",
  officerName:"Ms. hasitha",officerDept:"Placement Officer",
  showStats:true,showSkills:true,colorCgpa:true,
  driveReminders:true,newStudentAlert:true,offerTracking:true,weeklyEmail:false,
  exportFormat:"CSV",
};

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
  <label className="ps-toggle" onMouseDown={e=>e.stopPropagation()}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="ps-toggle-track"><span className="ps-toggle-thumb" /></span>
  </label>
);

/* ─────────────────────────────────────────────
   OVERLAY — clicking backdrop closes, clicking
   inside the panel does NOT close
───────────────────────────────────────────── */
function Overlay({ onClose, children }) {
  return (
    <div
      className="ps-overlay"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div onMouseDown={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADD STUDENT MODAL
══════════════════════════════════════════ */
function AddStudentModal({ onClose, onAdd }) {
  const [form,    setForm]    = useState(defaultForm);
  const [step,    setStep]    = useState(1);
  const [errors,  setErrors]  = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (step===1) {
      if (!form.name.trim())   e.name   = "Full name is required";
      if (!form.rollNo.trim()) e.rollNo = "Roll number is required";
      if (!form.email.trim())  e.email  = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
      if (!form.phone.trim())  e.phone  = "Phone number is required";
    }
    if (step===2) {
      if (!form.cgpa) e.cgpa = "CGPA is required";
      else if (parseFloat(form.cgpa)<0||parseFloat(form.cgpa)>10) e.cgpa = "CGPA must be 0–10";
      if (!form.pri)  e.pri  = "PRI Score is required";
      else if (parseInt(form.pri)<0||parseInt(form.pri)>100) e.pri = "PRI must be 0–100";
    }
    return e;
  };

  const next = () => { const e=validate(); if(Object.keys(e).length){setErrors(e);return;} setStep(s=>s+1); };
  const prev = () => { setErrors({}); setStep(s=>s-1); };

  const handleSubmit = () => {
    const s = {
      id:Date.now(), name:form.name, init:initials(form.name),
      branch:form.branch, year:form.year,
      cgpa:parseFloat(form.cgpa)||0, pri:parseInt(form.pri)||0,
      skills:form.skills.split(",").map(x=>x.trim()).filter(Boolean),
      interviews:parseInt(form.interviews)||0,
      company:form.company||"—", pkg:form.pkg||"—", status:form.status,
    };
    setSuccess(true);
    setTimeout(()=>{ onAdd(s); onClose(); }, 1500);
  };

  const steps   = ["Personal Info","Academic Details","Placement Info"];
  const checkIco = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
  const stepIcos = [
    <svg key="a" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    <svg key="b" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    <svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  ];
  const ErrIco = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

  return (
    <Overlay onClose={onClose}>
      <div className="ps-panel">

        <div className="ps-header">
          <div className="ps-header-left">
            <div className="ps-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <div>
              <div className="ps-modal-title">Add New Student</div>
              <div className="ps-modal-sub">Register a student into the placement system</div>
            </div>
          </div>
          <button className="ps-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="ps-steps">
          {steps.map((label,i) => {
            const n=i+1; const done=step>n; const act=step===n;
            return (
              <div key={label} className="ps-step-item">
                <div className={`ps-step-circle${act?" act":""}${done?" done":""}`}>{done?checkIco:stepIcos[i]}</div>
                <span className={`ps-step-label${act?" act":""}${done?" done":""}`}>{label}</span>
                {i<steps.length-1 && <div className={`ps-step-line${done?" done":""}`} />}
              </div>
            );
          })}
        </div>

        {success ? (
          <div className="ps-success">
            <div className="ps-success-ring">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="ps-success-title">Student Added!</div>
            <div className="ps-success-sub">{form.name} has been registered.</div>
          </div>
        ) : (
          <div className="ps-body">

            {step===1 && (
              <div>
                <p className="af-section-desc">Enter the student's personal and contact details.</p>
                <div className="af-grid-2">
                  <FInput label="Full Name"   name="name"   value={form.name}   onChange={handleChange} placeholder="e.g. Arjun Sharma" required />
                  <FInput label="Roll Number" name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. 21CS001" required />
                </div>
                {(errors.name||errors.rollNo) && <div className="af-errors">
                  {errors.name   && <div className="af-error"><ErrIco />{errors.name}</div>}
                  {errors.rollNo && <div className="af-error"><ErrIco />{errors.rollNo}</div>}
                </div>}
                <div className="af-grid-2">
                  <FInput label="Email" name="email" value={form.email} onChange={handleChange} type="email" placeholder="student@college.edu.in" required />
                  <FInput label="Phone" name="phone" value={form.phone} onChange={handleChange} type="tel"   placeholder="+91 XXXXX XXXXX" required />
                </div>
                {(errors.email||errors.phone) && <div className="af-errors">
                  {errors.email && <div className="af-error"><ErrIco />{errors.email}</div>}
                  {errors.phone && <div className="af-error"><ErrIco />{errors.phone}</div>}
                </div>}
                <div className="af-grid-3">
                  <FSelect label="Branch"  name="branch"  value={form.branch}  onChange={handleChange} options={BRANCHES} required />
                  <FSelect label="Year"    name="year"    value={form.year}    onChange={handleChange} options={YEARS} required />
                  <FInput  label="Section" name="section" value={form.section} onChange={handleChange} placeholder="A / B / C" />
                </div>
                <div className="af-grid-2">
                  <FInput label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="linkedin.com/in/…" hint="(optional)" />
                  <FInput label="GitHub"   name="github"   value={form.github}   onChange={handleChange} placeholder="github.com/…" hint="(optional)" />
                </div>
              </div>
            )}

            {step===2 && (
              <div>
                <p className="af-section-desc">Enter academic performance and skill details.</p>
                <div className="af-grid-2">
                  <div className="af-field">
                    <label className="af-label">CGPA <span className="af-req">*</span> <span className="af-hint">/ 10.0</span></label>
                    <input className="af-input" type="number" name="cgpa" value={form.cgpa} onChange={handleChange} placeholder="e.g. 8.7" min="0" max="10" step="0.01" />
                    {errors.cgpa && <div className="af-error-inline">{errors.cgpa}</div>}
                    <div className="af-micro-bar"><div className="af-micro-fill" style={{width:`${(parseFloat(form.cgpa)||0)*10}%`,background:cgpaColor(parseFloat(form.cgpa)||0)}} /></div>
                  </div>
                  <div className="af-field">
                    <label className="af-label">PRI Score <span className="af-req">*</span> <span className="af-hint">/ 100</span></label>
                    <input className="af-input" type="number" name="pri" value={form.pri} onChange={handleChange} placeholder="e.g. 82" min="0" max="100" />
                    {errors.pri && <div className="af-error-inline">{errors.pri}</div>}
                    <div className="af-micro-bar"><div className="af-micro-fill" style={{width:`${parseInt(form.pri)||0}%`,background:priColor(parseInt(form.pri)||0)}} /></div>
                  </div>
                </div>
                {(form.cgpa||form.pri) && (
                  <div className="af-live-preview">
                    <div className="af-lp-label">Live Preview</div>
                    <div className="af-lp-row">
                      {form.cgpa && <div className="af-lp-stat" style={{borderColor:cgpaColor(parseFloat(form.cgpa)||0)}}><div className="af-lp-val" style={{color:cgpaColor(parseFloat(form.cgpa)||0)}}>{parseFloat(form.cgpa).toFixed(1)}</div><div className="af-lp-lbl">CGPA</div></div>}
                      {form.pri  && <div className="af-lp-stat" style={{borderColor:priColor(parseInt(form.pri)||0)}}><div className="af-lp-val" style={{color:priColor(parseInt(form.pri)||0)}}>{form.pri}</div><div className="af-lp-lbl">PRI</div></div>}
                      {form.cgpa && <span className={`badge ${parseFloat(form.cgpa)>=9?"badge-teal":parseFloat(form.cgpa)>=8?"badge-indigo":"badge-amber"}`} style={{alignSelf:"center"}}>{parseFloat(form.cgpa)>=9?"★ Outstanding":parseFloat(form.cgpa)>=8?"Good Standing":"Needs Improvement"}</span>}
                    </div>
                  </div>
                )}
                <div className="af-field">
                  <label className="af-label">Skills <span className="af-hint">(comma separated)</span></label>
                  <input className="af-input" type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. React, Python, DSA" />
                  {form.skills && <div className="af-skill-preview">{form.skills.split(",").filter(s=>s.trim()).map(sk=><span key={sk} className="skill-chip">{sk.trim()}</span>)}</div>}
                </div>
                <div className="af-grid-2">
                  <FInput label="10th %" name="tenth"  value={form.tenth}  onChange={handleChange} type="number" placeholder="e.g. 92.4" hint="(optional)" />
                  <FInput label="12th %" name="twelve" value={form.twelve} onChange={handleChange} type="number" placeholder="e.g. 88.6" hint="(optional)" />
                </div>
                <div className="af-field">
                  <label className="af-label">Active Backlogs</label>
                  <div className="af-radio-row">
                    {["0","1","2","3+"].map(v=>(
                      <label key={v} className={`af-radio-btn${form.backlogs===v?" active":""}`}>
                        <input type="radio" name="backlogs" value={v} checked={form.backlogs===v} onChange={handleChange} style={{display:"none"}} />{v}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step===3 && (
              <div>
                <p className="af-section-desc">Enter current placement status and offer details.</p>
                <div className="af-grid-2">
                  <FSelect label="Placement Status"  name="status"     value={form.status}     onChange={handleChange} options={STATUSES} required />
                  <FInput  label="No. of Interviews" name="interviews" value={form.interviews} onChange={handleChange} type="number" placeholder="0" />
                </div>
                <div className="af-grid-2">
                  <FInput label="Company (if placed)" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google"  hint="(if applicable)" />
                  <FInput label="Package (if placed)" name="pkg"     value={form.pkg}     onChange={handleChange} placeholder="e.g. 24 LPA" hint="(if applicable)" />
                </div>
                <div className={`af-status-hint status-${form.status.toLowerCase().replace(/\s/g,"-")}`}>
                  <span className="af-status-hint-icon">{form.status==="Placed"?"🎉":form.status==="In Process"?"⏳":form.status==="Applied"?"📄":"⚠️"}</span>
                  <span>{form.status==="Placed"?"Great! Fill in company and package above.":form.status==="In Process"?"Student is in an active selection process.":form.status==="Applied"?"Student has applied but hasn't been interviewed yet.":"Student needs placement readiness improvement."}</span>
                </div>
                <div className="af-summary-card">
                  <div className="af-summary-hd">Preview</div>
                  <div className="af-summary-top">
                    <div className="af-summary-av">{initials(form.name||"ST")}</div>
                    <div className="af-summary-info">
                      <div className="af-summary-name">{form.name||"Student Name"}</div>
                      <div className="af-summary-meta">{form.branch} · {form.year} Year · {form.rollNo||"—"}</div>
                      <div className="af-summary-meta">{form.email||"—"}</div>
                    </div>
                    <Badge cls={statusMap[form.status]} dot>{form.status}</Badge>
                  </div>
                  <div className="af-summary-stats">
                    {[
                      {val:form.cgpa||"—",color:form.cgpa?cgpaColor(parseFloat(form.cgpa)):"var(--text3)",lbl:"CGPA"},
                      {val:form.pri||"—", color:form.pri?priColor(parseInt(form.pri)):"var(--text3)",      lbl:"PRI"},
                      {val:form.interviews||"0",color:"var(--indigo-ll)",                                  lbl:"Interviews"},
                      {val:form.pkg||"—", color:form.pkg?"var(--teal)":"var(--text3)",                     lbl:"Package"},
                    ].map(m=>(
                      <div key={m.lbl} className="af-summary-stat">
                        <div className="af-summary-stat-val" style={{color:m.color}}>{m.val}</div>
                        <div className="af-summary-stat-lbl">{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {form.skills && <div className="af-summary-skills">{form.skills.split(",").filter(s=>s.trim()).map(sk=><span key={sk} className="skill-chip">{sk.trim()}</span>)}</div>}
                </div>
              </div>
            )}

          </div>
        )}

        {!success && (
          <div className="ps-footer">
            <div className="ps-footer-left">
              <div className="ps-dots">{[1,2,3].map(n=><div key={n} className={`ps-dot${step===n?" act":step>n?" done":""}`} />)}</div>
              <span className="ps-step-count">Step {step} of 3</span>
            </div>
            <div className="ps-footer-right">
              <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 18px"}} onClick={step===1?onClose:prev}>{step===1?"Cancel":"← Back"}</button>
              {step<3
                ? <button className="btn btn-solid" style={{fontSize:11,padding:"9px 22px"}} onClick={next}>Continue →</button>
                : <button className="btn btn-teal"  style={{fontSize:11,padding:"9px 22px"}} onClick={handleSubmit}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Add Student
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
      <div className="ps-panel ps-panel-sm">
        <div className="ps-header">
          <div className="ps-header-left">
            <div className="ps-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div>
              <div className="ps-modal-title">Settings</div>
              <div className="ps-modal-sub">Customize your placement dashboard</div>
            </div>
          </div>
          <button className="ps-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="ps-tabs">
          {["general","display","notifications","data"].map(t=>(
            <button key={t} className={`ps-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        <div className="ps-body">
          {tab==="general" && (
            <div>
              <div className="ps-section-label">Academic</div>
              <div className="ps-row">
                <div className="ps-row-info"><div className="ps-row-label">Academic Year</div><div className="ps-row-desc">Shown in sidebar and reports</div></div>
                <select className="ps-select" value={local.academicYear} onChange={e=>setVal("academicYear",e.target.value)}>
                  {["2022-23","2023-24","2024-25","2025-26"].map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="ps-row">
                <div className="ps-row-info"><div className="ps-row-label">Min CGPA Threshold</div><div className="ps-row-desc">For placement eligibility warnings</div></div>
                <select className="ps-select" value={local.minCgpa} onChange={e=>setVal("minCgpa",e.target.value)}>
                  {["6.0","6.5","7.0","7.5","8.0"].map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="ps-section-label" style={{marginTop:18}}>Officer Profile</div>
              <div className="af-grid-2" style={{marginBottom:0}}>
                <FInput label="Name" name="officerName" value={local.officerName} onChange={e=>setVal("officerName",e.target.value)} placeholder="Officer name" />
                <FInput label="Role" name="officerDept" value={local.officerDept} onChange={e=>setVal("officerDept",e.target.value)} placeholder="e.g. Placement Officer" />
              </div>
            </div>
          )}
          {tab==="display" && (
            <div>
              <div className="ps-section-label">Cards &amp; Layout</div>
              <div className="ps-row"><div className="ps-row-info"><div className="ps-row-label">Show Stat Cards</div><div className="ps-row-desc">Overview numbers at top of page</div></div><Toggle checked={local.showStats}  onChange={()=>toggle("showStats")} /></div>
              <div className="ps-row"><div className="ps-row-info"><div className="ps-row-label">Show Skill Chips</div><div className="ps-row-desc">Display skills on each card</div></div><Toggle checked={local.showSkills} onChange={()=>toggle("showSkills")} /></div>
              <div className="ps-row"><div className="ps-row-info"><div className="ps-row-label">Color-code CGPA &amp; PRI</div><div className="ps-row-desc">Green / amber / red by score</div></div><Toggle checked={local.colorCgpa}  onChange={()=>toggle("colorCgpa")} /></div>
            </div>
          )}
          {tab==="notifications" && (
            <div>
              <div className="ps-section-label">Alerts</div>
              {[
                {key:"driveReminders",  label:"Drive Reminders",      desc:"Notify before upcoming drives"},
                {key:"newStudentAlert", label:"New Student Alerts",    desc:"When a student is registered"},
                {key:"offerTracking",   label:"Offer Letter Tracking", desc:"Status updates on offers"},
                {key:"weeklyEmail",     label:"Weekly Summary Email",  desc:"Stats digest every Monday"},
              ].map(r=>(
                <div key={r.key} className="ps-row">
                  <div className="ps-row-info"><div className="ps-row-label">{r.label}</div><div className="ps-row-desc">{r.desc}</div></div>
                  <Toggle checked={local[r.key]} onChange={()=>toggle(r.key)} />
                </div>
              ))}
            </div>
          )}
          {tab==="data" && (
            <div>
              <div className="ps-section-label">Export</div>
              <div className="ps-row">
                <div className="ps-row-info"><div className="ps-row-label">Default Export Format</div><div className="ps-row-desc">Used when downloading data</div></div>
                <select className="ps-select" value={local.exportFormat} onChange={e=>setVal("exportFormat",e.target.value)}>
                  {["CSV","Excel","PDF"].map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="ps-section-label" style={{marginTop:18,color:"var(--rose)"}}>Danger Zone</div>
              <div className="ps-row">
                <div className="ps-row-info"><div className="ps-row-label">Reset All Settings</div><div className="ps-row-desc">Restore defaults</div></div>
                <button className="btn" style={{fontSize:11,padding:"7px 14px",background:"rgba(240,83,106,.1)",color:"var(--rose)",border:"1px solid rgba(240,83,106,.25)"}} onClick={()=>setLocal({...defaultSettings})}>Reset</button>
              </div>
            </div>
          )}
        </div>

        <div className="ps-footer">
          <div className="ps-footer-left"><span style={{fontSize:11,color:"var(--text3)"}}>Saved on confirm</span></div>
          <div className="ps-footer-right">
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
function DeleteConfirm({ student, onConfirm, onCancel }) {
  return (
    <Overlay onClose={onCancel}>
      <div className="ps-panel ps-panel-delete">
        <div className="ps-delete-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <div className="ps-delete-title">Remove Student?</div>
        <div className="ps-delete-sub">This will permanently remove <strong style={{color:"var(--text)"}}>{student.name}</strong> from the placement system.</div>
        <div className="ps-delete-actions">
          <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 20px"}} onClick={onCancel}>Cancel</button>
          <button className="btn" style={{fontSize:11,padding:"9px 20px",background:"rgba(240,83,106,.12)",color:"var(--rose)",border:"1px solid rgba(240,83,106,.25)"}} onClick={onConfirm}>Yes, Remove</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function PlacementStudents() {
  const [students, setStudents] = useState([
    {id:1, name:"Arjun Sharma", init:"AS",branch:"CSE", cgpa:9.1,pri:87,skills:["React","Python","DSA"],  interviews:3,company:"Google",   pkg:"32 LPA",status:"Placed",    year:"4th"},
    {id:2, name:"Priya Nair",   init:"PN",branch:"CSE", cgpa:8.7,pri:79,skills:["Java","Spring","SQL"],   interviews:5,company:"Infosys",  pkg:"—",     status:"In Process",year:"4th"},
    {id:3, name:"Rohan Mehta",  init:"RM",branch:"ECE", cgpa:7.9,pri:61,skills:["C++","Embedded"],        interviews:1,company:"—",        pkg:"—",     status:"Applied",   year:"4th"},
    {id:4, name:"Sneha Reddy",  init:"SR",branch:"CSE", cgpa:9.4,pri:93,skills:["ML","Python","TF"],      interviews:2,company:"Microsoft",pkg:"28 LPA",status:"Placed",    year:"4th"},
    {id:5, name:"Karthik V",    init:"KV",branch:"IT",  cgpa:8.2,pri:72,skills:["Node.js","MongoDB"],     interviews:4,company:"Wipro",    pkg:"—",     status:"In Process",year:"4th"},
    {id:6, name:"Divya Menon",  init:"DM",branch:"CSE", cgpa:7.1,pri:55,skills:["HTML","CSS"],            interviews:0,company:"—",        pkg:"—",     status:"Not Ready", year:"4th"},
    {id:7, name:"Aditya Patel", init:"AP",branch:"MECH",cgpa:8.0,pri:68,skills:["AutoCAD","MATLAB"],      interviews:2,company:"L&T",      pkg:"—",     status:"Applied",   year:"4th"},
    {id:8, name:"Lakshmi S",    init:"LS",branch:"CSE", cgpa:8.9,pri:84,skills:["Flutter","Firebase"],    interviews:3,company:"Swiggy",   pkg:"22 LPA",status:"Placed",    year:"4th"},
    {id:9, name:"Vikram R",     init:"VR",branch:"IT",  cgpa:8.4,pri:76,skills:["Python","Django","AWS"], interviews:2,company:"Razorpay", pkg:"18 LPA",status:"Placed",    year:"4th"},
    {id:10,name:"Ananya K",     init:"AK",branch:"ECE", cgpa:7.5,pri:63,skills:["VLSI","Python"],         interviews:1,company:"—",        pkg:"—",     status:"Applied",   year:"4th"},
    {id:11,name:"Rahul G",      init:"RG",branch:"CSE", cgpa:9.0,pri:90,skills:["DSA","Go","Kubernetes"], interviews:4,company:"Flipkart", pkg:"24 LPA",status:"Placed",    year:"4th"},
    {id:12,name:"Pooja M",      init:"PM",branch:"MECH",cgpa:6.9,pri:48,skills:["SolidWorks"],            interviews:0,company:"—",        pkg:"—",     status:"Not Ready", year:"4th"},
  ]);

  const [filter,         setFilter]         = useState("All");
  const [search,         setSearch]         = useState("");
  const [branch,         setBranch]         = useState("All");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState(null);
  const [settings,       setSettings]       = useState(defaultSettings);

  /* ── CUSTOM CURSOR ──
     Uses a single ref that is ALWAYS in the DOM (outside modals).
     The cursor elements are position:fixed so they appear above everything
     including the modal overlay, as long as they have a higher z-index.
  ── */
  const curRef  = useRef(null);
  const ringRef = useRef(null);
  const mx=useRef(0), my=useRef(0), rx=useRef(0), ry=useRef(0);

  useEffect(() => {
    const onMove = e => {
      mx.current=e.clientX; my.current=e.clientY;
      if(curRef.current){
        curRef.current.style.left  = e.clientX+"px";
        curRef.current.style.top   = e.clientY+"px";
      }
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
      if(ringRef.current){
        ringRef.current.style.left = rx.current+"px";
        ringRef.current.style.top  = ry.current+"px";
      }
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
    document.body.style.overflow=(showAddStudent||showSettings||deleteTarget)?"hidden":"";
    return()=>{ document.body.style.overflow=""; };
  },[showAddStudent,showSettings,deleteTarget]);

  const handleAddStudent = s  => setStudents(prev=>[s,...prev]);
  const handleDelete     = () => { setStudents(prev=>prev.filter(s=>s.id!==deleteTarget.id)); setDeleteTarget(null); };

  const filtered = students.filter(s => {
    const mf=filter==="All"||s.status===filter;
    const mb=branch==="All"||s.branch===branch;
    const ms=s.name.toLowerCase().includes(search.toLowerCase())||s.company.toLowerCase().includes(search.toLowerCase());
    return mf&&mb&&ms;
  });

  const placedCount   = students.filter(s=>s.status==="Placed").length;
  const placementRate = Math.round(placedCount/students.length*100);

  return (
    <>
      {/*
        ✅ CURSOR FIX: z-index 99999 puts these ABOVE the modal overlay (z-index 9999).
        They are position:fixed so they always track the mouse regardless of scroll
        or which modal is open.
      */}
      <div className="sc-cursor"      ref={curRef}  style={{zIndex:99999}} />
      <div className="sc-cursor-ring" ref={ringRef} style={{zIndex:99999}} />
      <div className="sc-noise" />

      {showAddStudent && <AddStudentModal onClose={()=>setShowAddStudent(false)} onAdd={handleAddStudent} />}
      {showSettings   && <SettingsModal  onClose={()=>setShowSettings(false)}   settings={settings} onSave={setSettings} />}
      {deleteTarget   && <DeleteConfirm  student={deleteTarget} onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} />}

      <div className="app">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-top"><a className="sb-brand" href="#"><div className="sb-mark">SC</div><span className="sb-name">SmartCampus</span></a></div>
          <div className="sb-user">
            <div className="sb-avatar">{settings.officerName.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}</div>
            <div><div className="sb-uname">{settings.officerName}</div><div className="sb-urole">{settings.officerDept}</div></div>
          </div>
          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/placementAnalytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>
            <div className="sb-sec-label">Placement</div>
            <SbLink active to="/placementdashboard/students" badge={String(students.length)} badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies" badge="5" badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink to="/placementdashboard/drives" badge="3" badgeCls="rose" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
            <SbLink to="/placementdashboard/offers-placed" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/ai-assistant" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>
          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">{placementRate}%</div>
              <div className="sb-pri-sub">AY {settings.academicYear}</div>
              <div className="sb-pri-bar"><div className="sb-pri-fill" style={{width:`${placementRate}%`}} /></div>
            </div>
            <button className="sb-logout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <header className="topbar">
            <span className="tb-page">Students</span>
            <div className="tb-sep" />
            <div className="tb-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--text3)",flexShrink:0}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search students…" value={search} onChange={e=>setSearch(e.target.value)} style={{cursor:"none"}} />
            </div>
            {/*
              ✅ SETTINGS BUTTON FIX: Wrapped tb-right contents explicitly.
              The button uses tb-icon-btn which is defined in our CSS with !important
              overrides to handle any base CSS interference.
            */}
            <div className="tb-right">
              <span className="tb-date">Wed, 11 Mar</span>
              <button className="tb-icon-btn" onClick={()=>setShowSettings(true)} title="Settings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"inherit"}}>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button className="btn btn-solid" style={{fontSize:10,padding:"8px 14px"}} onClick={()=>setShowAddStudent(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Student
              </button>
            </div>
          </header>

          <div className="content">
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">{students.length} Total · AY {settings.academicYear}</span></div>
              <h1 className="greet-title">Student <em>Tracker</em></h1>
            </div>

            {settings.showStats && (
              <div className="stat-grid" style={{marginBottom:18}}>
                {[
                  {label:"Total Students",val:students.length,                                   color:"indigo",delta:"▲ +12 this sem",type:"up"},
                  {label:"Placed",         val:placedCount,                                        color:"teal",  delta:`▲ ${placementRate}% rate`,type:"up"},
                  {label:"In Process",     val:students.filter(s=>s.status==="In Process").length, color:"violet",delta:"Ongoing drives", type:"neu"},
                  {label:"Not Ready",      val:students.filter(s=>s.status==="Not Ready").length,  color:"rose",  delta:"Needs attention",type:"dn"},
                ].map(s=>(
                  <div key={s.label} className={`stat-card sc-${s.color}`}>
                    <div className="stat-val" style={s.color!=="indigo"?{color:`var(--${s.color})`}:{}}>{s.val}</div>
                    <div className="stat-lbl">{s.label}</div>
                    <span className={`stat-delta delta-${s.type}`}>{s.delta}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <div className="filter-row">
                {["All","Placed","In Process","Applied","Not Ready"].map(f=>(
                  <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{f}</button>
                ))}
              </div>
              <div style={{width:1,height:24,background:"var(--border2)",flexShrink:0}} />
              <div className="filter-row">
                {["All","CSE","IT","ECE","MECH","EEE"].map(b=>(
                  <button key={b} className={`filter-btn${branch===b?" active":""}`} onClick={()=>setBranch(b)}>{b}</button>
                ))}
              </div>
              <span style={{marginLeft:"auto",fontSize:11,color:"var(--text3)"}}>{filtered.length} students</span>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
              {filtered.length===0 ? (
                <div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px 20px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14}}>
                  <div style={{fontSize:32,marginBottom:12}}>🔍</div>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:"var(--text2)",marginBottom:6}}>No students found</div>
                  <div style={{fontSize:12,color:"var(--text3)"}}>Try adjusting your search or filters</div>
                </div>
              ) : filtered.map(s=>(
                <div key={s.id} className="panel" style={{margin:0,cursor:"none",transition:"border-color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(91,78,248,.3)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=""}>
                  <div style={{padding:"16px 18px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div className="stu-av" style={{width:42,height:42,fontSize:13}}>{s.init}</div>
                        <div>
                          <div className="stu-name">{s.name}</div>
                          <div style={{fontSize:10,color:"var(--text3)",marginTop:3}}>{s.branch} · {s.year} Year</div>
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                        <Badge cls={statusMap[s.status]} dot>{s.status}</Badge>
                        <button className="card-delete-btn" onClick={()=>setDeleteTarget(s)} title="Remove">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                      {[
                        {val:s.cgpa,      color:settings.colorCgpa?cgpaColor(s.cgpa):"var(--text)",lbl:"CGPA"},
                        {val:s.pri,       color:settings.colorCgpa?priColor(s.pri):"var(--text)",  lbl:"PRI"},
                        {val:s.interviews,color:"var(--indigo-ll)",                                 lbl:"Interviews"},
                      ].map(m=>(
                        <div key={m.lbl} style={{background:"var(--surface2)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:16,color:m.color}}>{m.val}</div>
                          <div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>{m.lbl}</div>
                        </div>
                      ))}
                    </div>
                    {settings.showSkills && (
                      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
                        {s.skills.map(sk=><span key={sk} className="skill-chip">{sk}</span>)}
                      </div>
                    )}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:"1px solid var(--border)"}}>
                      <span style={{fontSize:11,color:s.company!=="—"?"var(--text2)":"var(--text3)",fontWeight:s.company!=="—"?600:400}}>
                        {s.company!=="—"?`📌 ${s.company}`:"Not placed"}
                      </span>
                      {s.pkg!=="—" && <span style={{fontFamily:"'Fraunces',serif",fontSize:13,color:"var(--teal)",fontWeight:600}}>{s.pkg}</span>}
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