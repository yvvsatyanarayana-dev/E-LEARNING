// PlacementDrives.jsx — SmartCampus
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./placementDrives.css";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const ALL_BRANCHES = ["CSE","IT","ECE","MECH","EEE","CIVIL"];
const LOGO_COLORS  = ["#a59fff","#2dd4bf","#fbbf24","#8b5cf6","#fb7185","#4ade80"];
const STATUSES     = ["Upcoming","Ongoing","Completed"];

const FAKE_STUDENTS = [
  { name:"Aarav Sharma",  roll:"21CS001",  cgpa:8.4 },
  { name:"Priya Menon",   roll:"21CS012",  cgpa:7.9 },
  { name:"Rajan Kumar",   roll:"21IT034",  cgpa:8.1 },
  { name:"Sneha Patel",   roll:"21CS047",  cgpa:7.5 },
  { name:"Arjun Nair",    roll:"21ECE018", cgpa:7.8 },
  { name:"Divya Rao",     roll:"21CS055",  cgpa:8.7 },
];

const statusMap = {
  Upcoming:  "badge-indigo",
  Ongoing:   "badge-amber",
  Completed: "badge-teal",
};

const defaultDriveForm = {
  name:"", role:"", pkg:"", date:"",
  applied:"", eligible:"", minCgpa:"",
  status:"Upcoming", desc:"",
  branches:[], rounds:["","",""],
  logo:"", color: LOGO_COLORS[0],
};

const defaultSettings = {
  academicYear:"2024-25",
  officerName:"Ms. Kavitha R",
  officerDept:"Placement Officer",
  showProgress:true,
  compact:false,
  driveReminders:true,
  studentSms:false,
  emailAlerts:true,
  exportFormat:"CSV",
};

const INIT_DRIVES = [
  { id:1, logo:"A", color:"#fbbf24", name:"Amazon",  role:"SDE-1 · Full Time",  pkg:"26 LPA",  date:"2025-03-15", applied:31, eligible:48,  rounds:["Online Test","Technical","HR"],       branches:["CSE","IT","ECE"],        minCgpa:7.5, status:"Upcoming",  desc:"Hiring for core SDE roles across AWS and e-commerce teams." },
  { id:2, logo:"T", color:"#8b5cf6", name:"TCS",     role:"System Engineer",     pkg:"7 LPA",   date:"2025-03-18", applied:98, eligible:120, rounds:["TCS NQT","Technical","HR"],            branches:["CSE","IT","ECE","MECH"], minCgpa:6.0, status:"Upcoming",  desc:"Mass hiring drive for System Engineer role." },
  { id:3, logo:"Z", color:"#2dd4bf", name:"Zoho",    role:"Software Developer",  pkg:"12 LPA",  date:"2025-03-22", applied:52, eligible:65,  rounds:["Aptitude","Coding","Interview"],       branches:["CSE","IT"],             minCgpa:7.0, status:"Upcoming",  desc:"Zoho hiring for software dev roles, no bond." },
  { id:4, logo:"W", color:"#7b6ffa", name:"Wipro",   role:"Project Engineer",    pkg:"6 LPA",   date:"2025-03-28", applied:63, eligible:90,  rounds:["NLTH","Technical","HR"],              branches:["CSE","IT","ECE","MECH"], minCgpa:6.0, status:"Ongoing",   desc:"NLTH-based hiring for engineering graduates." },
  { id:5, logo:"I", color:"#2dd4bf", name:"Infosys", role:"Systems Analyst",     pkg:"6.5 LPA", date:"2025-03-08", applied:84, eligible:110, rounds:["Online Test","Technical","HR"],        branches:["CSE","IT","ECE"],        minCgpa:6.5, status:"Completed", desc:"Drive completed. Offers rolling out to selected candidates." },
  { id:6, logo:"G", color:"#4ade80", name:"Google",  role:"SWE · L3",            pkg:"32 LPA",  date:"2025-02-28", applied:9,  eligible:12,  rounds:["DSA","System Design","Googleyness"],  branches:["CSE","IT"],             minCgpa:8.5, status:"Completed", desc:"Completed. 3 offers made to final candidates." },
];

/* ─────────────────────────────────────────────
   SMALL HELPERS
───────────────────────────────────────────── */
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
  <label className="pd-toggle" onMouseDown={e => e.stopPropagation()}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="pd-toggle-track"><span className="pd-toggle-thumb" /></span>
  </label>
);

const ErrIco = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const fmtDate = raw => {
  try { return new Date(raw).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); }
  catch { return raw; }
};

/* ─────────────────────────────────────────────
   OVERLAY — clicking backdrop closes,
   clicking inside does NOT close
───────────────────────────────────────────── */
function Overlay({ onClose, children }) {
  return (
    <div
      className="pd-overlay"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div onMouseDown={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADD / EDIT DRIVE MODAL
══════════════════════════════════════════ */
function DriveModal({ initial, onClose, onSave }) {
  const [form,    setForm]    = useState(() =>
    initial
      ? { ...initial, rounds:[...initial.rounds], branches:[...initial.branches] }
      : { ...defaultDriveForm }
  );
  const [errors,  setErrors]  = useState({});
  const [success, setSuccess] = useState(false);
  const isEdit = !!initial;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }));
  };

  const toggleBranch = b =>
    setForm(f => ({
      ...f,
      branches: f.branches.includes(b) ? f.branches.filter(x => x !== b) : [...f.branches, b],
    }));

  const setRound = (i, v) =>
    setForm(f => { const r = [...f.rounds]; r[i] = v; return { ...f, rounds: r }; });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Company name is required";
    if (!form.role.trim()) e.role = "Role is required";
    if (!form.pkg.trim())  e.pkg  = "Package is required";
    if (!form.date)        e.date = "Drive date is required";
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const saved = {
      ...form,
      id:       isEdit ? initial.id : Date.now(),
      logo:     form.logo.trim() || form.name[0].toUpperCase(),
      rounds:   form.rounds.filter(r => r.trim()),
      applied:  parseInt(form.applied)   || 0,
      eligible: parseInt(form.eligible)  || 1,
      minCgpa:  parseFloat(form.minCgpa) || 0,
    };
    setSuccess(true);
    setTimeout(() => { onSave(saved); onClose(); }, 1400);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="pd-panel">

        {/* HEADER */}
        <div className="pd-header">
          <div className="pd-header-left">
            <div className="pd-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <div>
              <div className="pd-modal-title">{isEdit ? "Edit Drive" : "Add New Drive"}</div>
              <div className="pd-modal-sub">{isEdit ? "Update drive details" : "Register a placement drive"}</div>
            </div>
          </div>
          <button className="pd-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* SUCCESS */}
        {success ? (
          <div className="pd-success">
            <div className="pd-success-ring">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="pd-success-title">{isEdit ? "Drive Updated!" : "Drive Added!"}</div>
            <div className="pd-success-sub">{form.name} has been {isEdit ? "updated" : "registered"}.</div>
          </div>
        ) : (
          <>
            <div className="pd-body">
              <p className="af-section-desc">Fill in drive details. Fields marked <span style={{color:"var(--rose)"}}>*</span> are required.</p>

              {/* Row 1 */}
              <div className="af-grid-2">
                <div className="af-field">
                  <label className="af-label">Company Name <span className="af-req">*</span></label>
                  <input className="af-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Microsoft" autoFocus />
                  {errors.name && <div className="af-error-inline">{errors.name}</div>}
                </div>
                <div className="af-field">
                  <label className="af-label">Role / Position <span className="af-req">*</span></label>
                  <input className="af-input" name="role" value={form.role} onChange={handleChange} placeholder="e.g. SDE-1 · Full Time" />
                  {errors.role && <div className="af-error-inline">{errors.role}</div>}
                </div>
              </div>

              {/* Row 2 */}
              <div className="af-grid-2">
                <div className="af-field">
                  <label className="af-label">Package <span className="af-req">*</span></label>
                  <input className="af-input" name="pkg" value={form.pkg} onChange={handleChange} placeholder="e.g. 18 LPA" />
                  {errors.pkg && <div className="af-error-inline">{errors.pkg}</div>}
                </div>
                <div className="af-field">
                  <label className="af-label">Drive Date <span className="af-req">*</span></label>
                  <input className="af-input" type="date" name="date" value={form.date} onChange={handleChange} />
                  {errors.date && <div className="af-error-inline">{errors.date}</div>}
                </div>
              </div>

              {/* Row 3 */}
              <div className="af-grid-2">
                <FInput label="Applications Received" name="applied"  value={form.applied}  onChange={handleChange} type="number" placeholder="e.g. 45" hint="(optional)" />
                <FInput label="Eligible Students"      name="eligible" value={form.eligible} onChange={handleChange} type="number" placeholder="e.g. 60" hint="(optional)" />
              </div>

              {/* Row 4 */}
              <div className="af-grid-2">
                <FInput    label="Min CGPA" name="minCgpa" value={form.minCgpa} onChange={handleChange} type="number" placeholder="e.g. 7.0" hint="(optional)" />
                <FSelect   label="Status"   name="status"  value={form.status}  onChange={handleChange} options={STATUSES} required />
              </div>

              {/* Status hint */}
              <div className={`af-status-hint status-${form.status.toLowerCase()}`}>
                <span className="af-status-hint-icon">
                  {form.status==="Upcoming"?"📅":form.status==="Ongoing"?"⏳":"✅"}
                </span>
                <span>
                  {form.status==="Upcoming"  && "Drive is scheduled. Students can apply."}
                  {form.status==="Ongoing"   && "Drive is currently active. Selection in progress."}
                  {form.status==="Completed" && "Drive concluded. Update offer details where applicable."}
                </span>
              </div>

              {/* Logo */}
              <div className="af-grid-2">
                <FInput label="Logo Letter" name="logo" value={form.logo} onChange={e => handleChange({ target:{ name:"logo", value:e.target.value.toUpperCase().slice(0,2) } })} placeholder="Auto (first letter)" hint="(optional)" />
                <div className="af-field">
                  <label className="af-label">Logo Colour</label>
                  <div className="af-swatches">
                    {LOGO_COLORS.map(c => (
                      <button key={c} type="button"
                        className={`af-swatch${form.color===c?" active":""}`}
                        style={{ background:c }}
                        onClick={() => setForm(f=>({...f,color:c}))} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Branches */}
              <div className="af-field">
                <label className="af-label">Eligible Branches</label>
                <div className="af-branches">
                  {ALL_BRANCHES.map(b => (
                    <button key={b} type="button"
                      className={`af-branch-btn${form.branches.includes(b)?" active":""}`}
                      onClick={() => toggleBranch(b)}>{b}</button>
                  ))}
                </div>
              </div>

              {/* Rounds */}
              <div className="af-field">
                <label className="af-label">Interview Rounds</label>
                <div className="af-rounds">
                  {form.rounds.map((r, i) => (
                    <div key={i} className="af-round-row">
                      <span className="af-round-num">{i+1}</span>
                      <input className="af-input" placeholder={`Round ${i+1}`}
                        value={r} onChange={e => setRound(i, e.target.value)} />
                      {form.rounds.length > 1 && (
                        <button type="button" className="af-round-del"
                          onClick={() => setForm(f=>({...f,rounds:f.rounds.filter((_,j)=>j!==i)}))}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="af-add-round"
                  onClick={() => setForm(f=>({...f,rounds:[...f.rounds,""]}))}>+ Add Round</button>
              </div>

              {/* Description */}
              <div className="af-field">
                <label className="af-label">About Drive</label>
                <textarea className="af-input af-textarea" name="desc" value={form.desc} onChange={handleChange}
                  placeholder="Brief description about the drive, role, and expectations…" />
              </div>

              {/* Summary preview */}
              <div className="af-summary-card">
                <div className="af-summary-hd">Preview</div>
                <div className="af-summary-top">
                  <div className="af-summary-av" style={{color:form.color}}>
                    {form.logo.trim() || (form.name[0]||"?").toUpperCase()}
                  </div>
                  <div className="af-summary-info">
                    <div className="af-summary-name">{form.name||"Company Name"}</div>
                    <div className="af-summary-meta">{form.role||"Role"} · {form.date ? fmtDate(form.date) : "Date"}</div>
                    <div className="af-summary-meta">{form.pkg||"Package"} · Min CGPA {form.minCgpa||"—"}</div>
                  </div>
                  <Badge cls={statusMap[form.status]} dot>{form.status}</Badge>
                </div>
                <div className="af-summary-stats">
                  {[
                    {val:form.pkg||"—",     color:"var(--teal)",      lbl:"Package"},
                    {val:form.applied||"0", color:"var(--indigo-ll)", lbl:"Applied"},
                    {val:form.eligible||"0",color:"var(--amber)",     lbl:"Eligible"},
                  ].map(m=>(
                    <div key={m.lbl} className="af-summary-stat">
                      <div className="af-summary-stat-val" style={{color:m.color}}>{m.val}</div>
                      <div className="af-summary-stat-lbl">{m.lbl}</div>
                    </div>
                  ))}
                </div>
                {form.branches.length > 0 && (
                  <div className="af-summary-chips">
                    {form.branches.map(b=><span key={b} className="skill-chip">{b}</span>)}
                  </div>
                )}
              </div>

            </div>

            {/* FOOTER */}
            <div className="pd-footer">
              <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 18px"}} onClick={onClose}>Cancel</button>
              <button className="btn btn-teal"  style={{fontSize:11,padding:"9px 22px"}} onClick={handleSubmit}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {isEdit ? "Save Changes" : "Add Drive"}
              </button>
            </div>
          </>
        )}
      </div>
    </Overlay>
  );
}

/* ══════════════════════════════════════════
   NOTIFY MODAL
══════════════════════════════════════════ */
function NotifyModal({ drive, onClose, onSent }) {
  const eligible = FAKE_STUDENTS.filter(s => s.cgpa >= drive.minCgpa);
  const [msg, setMsg] = useState(
    `Dear Student,\n\nYou are eligible for the ${drive.name} placement drive on ${fmtDate(drive.date)}.\n\nRole: ${drive.role}\nPackage: ${drive.pkg}\nMin CGPA: ${drive.minCgpa}\n\nPlease register on the placement portal.\n\n— Placement Cell`
  );

  return (
    <Overlay onClose={onClose}>
      <div className="pd-panel pd-panel-sm">
        <div className="pd-header">
          <div className="pd-header-left">
            <div className="pd-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div>
              <div className="pd-modal-title">Notify Students</div>
              <div className="pd-modal-sub">
                <strong style={{color:"var(--teal)"}}>{eligible.length} eligible</strong> students for <strong>{drive.name}</strong>
              </div>
            </div>
          </div>
          <button className="pd-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="pd-body">
          <div className="pd-slist">
            {eligible.map(s => (
              <div key={s.roll} className="pd-srow">
                <div className="pd-savatar">{s.name[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{s.name}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{s.roll}</div>
                </div>
                <span className="skill-chip" style={{color:"var(--teal)"}}>CGPA {s.cgpa}</span>
              </div>
            ))}
          </div>
          <div className="af-field" style={{marginTop:14}}>
            <label className="af-label">Message</label>
            <textarea className="af-input af-textarea" style={{minHeight:120}} value={msg} onChange={e=>setMsg(e.target.value)} />
          </div>
        </div>
        <div className="pd-footer">
          <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 18px"}} onClick={onClose}>Cancel</button>
          <button className="btn btn-teal"  style={{fontSize:11,padding:"9px 22px"}} onClick={() => { onSent(); onClose(); }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Send Notification
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ══════════════════════════════════════════
   DELETE CONFIRM
══════════════════════════════════════════ */
function DeleteConfirm({ drive, onConfirm, onCancel }) {
  return (
    <Overlay onClose={onCancel}>
      <div className="pd-panel pd-panel-delete">
        <div className="pd-delete-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <div className="pd-delete-title">Remove Drive?</div>
        <div className="pd-delete-sub">This will permanently remove <strong style={{color:"var(--text)"}}>{drive.name}</strong> from the placement system.</div>
        <div className="pd-delete-actions">
          <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 20px"}} onClick={onCancel}>Cancel</button>
          <button className="btn" style={{fontSize:11,padding:"9px 20px",background:"rgba(240,83,106,.12)",color:"var(--rose)",border:"1px solid rgba(240,83,106,.25)"}} onClick={onConfirm}>Yes, Remove</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ══════════════════════════════════════════
   SETTINGS PANEL
══════════════════════════════════════════ */
function SettingsPanel({ settings, onSave, onClose }) {
  const [tab,   setTab]   = useState("general");
  const [local, setLocal] = useState({...settings});
  const toggle = key => setLocal(s=>({...s,[key]:!s[key]}));
  const setVal = (key,val) => setLocal(s=>({...s,[key]:val}));

  return (
    <>
      <div className="pd-soverlay" onClick={onClose} />
      <div className="pd-spanel">
        <div className="pd-shead">
          <span className="pd-stitle">Settings</span>
          <button className="pd-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="pd-stabs">
          {["general","display","notifications","data"].map(t=>(
            <button key={t} className={`pd-stab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        <div className="pd-sbody">
          {tab==="general" && (
            <div>
              <div className="pd-ssec-label">Academic</div>
              <div className="pd-srow-item">
                <div className="pd-srow-info"><div className="pd-srow-label">Academic Year</div><div className="pd-srow-desc">Shown in sidebar and reports</div></div>
                <select className="pd-sselect" value={local.academicYear} onChange={e=>setVal("academicYear",e.target.value)}>
                  {["2022-23","2023-24","2024-25","2025-26"].map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="pd-ssec-label" style={{marginTop:18}}>Officer Profile</div>
              <div className="af-grid-2" style={{marginBottom:0}}>
                <FInput label="Name" name="officerName" value={local.officerName} onChange={e=>setVal("officerName",e.target.value)} placeholder="Officer name" />
                <FInput label="Role" name="officerDept" value={local.officerDept} onChange={e=>setVal("officerDept",e.target.value)} placeholder="e.g. Placement Officer" />
              </div>
            </div>
          )}
          {tab==="display" && (
            <div>
              <div className="pd-ssec-label">Cards &amp; Layout</div>
              <div className="pd-srow-item"><div className="pd-srow-info"><div className="pd-srow-label">Show Progress Bar</div><div className="pd-srow-desc">Application fill rate on cards</div></div><Toggle checked={local.showProgress} onChange={()=>toggle("showProgress")} /></div>
              <div className="pd-srow-item"><div className="pd-srow-info"><div className="pd-srow-label">Compact View</div><div className="pd-srow-desc">Smaller card padding</div></div><Toggle checked={local.compact} onChange={()=>toggle("compact")} /></div>
            </div>
          )}
          {tab==="notifications" && (
            <div>
              <div className="pd-ssec-label">Alerts</div>
              {[
                {key:"driveReminders",label:"Drive Reminders",    desc:"Notify before upcoming drives"},
                {key:"studentSms",    label:"Student SMS",        desc:"Send SMS to eligible students"},
                {key:"emailAlerts",   label:"Email Alerts",       desc:"New drive notifications via email"},
              ].map(r=>(
                <div key={r.key} className="pd-srow-item">
                  <div className="pd-srow-info"><div className="pd-srow-label">{r.label}</div><div className="pd-srow-desc">{r.desc}</div></div>
                  <Toggle checked={local[r.key]} onChange={()=>toggle(r.key)} />
                </div>
              ))}
            </div>
          )}
          {tab==="data" && (
            <div>
              <div className="pd-ssec-label">Export</div>
              <div className="pd-srow-item">
                <div className="pd-srow-info"><div className="pd-srow-label">Default Export Format</div><div className="pd-srow-desc">Used when downloading data</div></div>
                <select className="pd-sselect" value={local.exportFormat} onChange={e=>setVal("exportFormat",e.target.value)}>
                  {["CSV","Excel","PDF"].map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="pd-ssec-label" style={{marginTop:18,color:"var(--rose)"}}>Danger Zone</div>
              <div className="pd-srow-item">
                <div className="pd-srow-info"><div className="pd-srow-label">Reset All Settings</div><div className="pd-srow-desc">Restore defaults</div></div>
                <button className="btn" style={{fontSize:11,padding:"7px 14px",background:"rgba(240,83,106,.1)",color:"var(--rose)",border:"1px solid rgba(240,83,106,.25)"}} onClick={()=>setLocal({...defaultSettings})}>Reset</button>
              </div>
            </div>
          )}
        </div>

        <div className="pd-footer">
          <button className="btn btn-ghost" style={{fontSize:11,padding:"9px 18px"}} onClick={onClose}>Cancel</button>
          <button className="btn btn-teal"  style={{fontSize:11,padding:"9px 22px"}} onClick={()=>{ onSave(local); onClose(); }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function PlacementDrives() {
  const [drives,       setDrives]       = useState(INIT_DRIVES);
  const [filter,       setFilter]       = useState("All");
  const [search,       setSearch]       = useState("");
  const [expanded,     setExpanded]     = useState(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [notifyTarget, setNotifyTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings,     setSettings]     = useState(defaultSettings);

  /* ── CUSTOM CURSOR ── */
  const curRef  = useRef(null);
  const ringRef = useRef(null);
  const mx=useRef(0), my=useRef(0), rx=useRef(0), ry=useRef(0);

  useEffect(() => {
    const onMove = e => {
      mx.current=e.clientX; my.current=e.clientY;
      if (curRef.current) { curRef.current.style.left=e.clientX+"px"; curRef.current.style.top=e.clientY+"px"; }
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
      if (ringRef.current) { ringRef.current.style.left=rx.current+"px"; ringRef.current.style.top=ry.current+"px"; }
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
    document.body.style.overflow=(showAdd||editTarget||notifyTarget||deleteTarget||showSettings)?"hidden":"";
    return()=>{ document.body.style.overflow=""; };
  },[showAdd,editTarget,notifyTarget,deleteTarget,showSettings]);

  const handleAdd    = d  => setDrives(p=>[d,...p]);
  const handleSave   = d  => setDrives(p=>p.map(x=>x.id===d.id?d:x));
  const handleDelete = () => { setDrives(p=>p.filter(d=>d.id!==deleteTarget.id)); setDeleteTarget(null); setExpanded(null); };

  const filtered = drives.filter(d => {
    const mf = filter==="All" || d.status===filter;
    const ms = d.name.toLowerCase().includes(search.toLowerCase()) || d.role.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const upcoming  = drives.filter(d=>d.status==="Upcoming").length;
  const ongoing   = drives.filter(d=>d.status==="Ongoing").length;
  const completed = drives.filter(d=>d.status==="Completed").length;
  const totalApps = drives.reduce((s,d)=>s+(d.applied||0),0);

  return (
    <>
      {/* CURSOR */}
      <div className="sc-cursor"      ref={curRef}  style={{zIndex:99999}} />
      <div className="sc-cursor-ring" ref={ringRef} style={{zIndex:99999}} />
      <div className="sc-noise" />

      {/* MODALS */}
      {showAdd      && <DriveModal  onClose={()=>setShowAdd(false)} onSave={d=>{ handleAdd(d); setShowAdd(false); }} />}
      {editTarget   && <DriveModal  initial={editTarget} onClose={()=>setEditTarget(null)} onSave={d=>{ handleSave(d); setEditTarget(null); }} />}
      {notifyTarget && <NotifyModal drive={notifyTarget} onClose={()=>setNotifyTarget(null)} onSent={()=>{}} />}
      {deleteTarget && <DeleteConfirm drive={deleteTarget} onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} />}
      {showSettings && <SettingsPanel settings={settings} onSave={setSettings} onClose={()=>setShowSettings(false)} />}

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
            <SbLink to="/placementdashboard/students" badge="12" badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies" badge="5" badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink active to="/placementdashboard/drives" badge={String(upcoming)} badgeCls="rose" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
            <SbLink to="/placementdashboard/offers-placed" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/ai-assistant" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>
          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">68%</div>
              <div className="sb-pri-sub">AY {settings.academicYear}</div>
              <div className="sb-pri-bar"><div className="sb-pri-fill" style={{width:"68%"}} /></div>
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
            <span className="tb-page">Placement Drives</span>
            <div className="tb-sep" />
            <div className="tb-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--text3)",flexShrink:0}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search drives…" value={search} onChange={e=>setSearch(e.target.value)} style={{cursor:"none"}} />
            </div>
            <div className="tb-right">
              <span className="tb-date">Placement · AY {settings.academicYear}</span>
              <button className="tb-icon-btn" onClick={()=>setShowSettings(true)} title="Settings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"inherit"}}>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button className="btn btn-solid" style={{fontSize:10,padding:"8px 14px"}} onClick={()=>setShowAdd(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Drive
              </button>
            </div>
          </header>

          <div className="content">
            {/* PAGE HEADER */}
            <div className="greet-row">
              <div className="greet-tag">
                <div className="greet-pip" />
                <span className="greet-pip-txt">{drives.length} Drives · {upcoming} Upcoming · AY {settings.academicYear}</span>
              </div>
              <h1 className="greet-title">Placement <em>Drives</em></h1>
            </div>

            {/* STATS */}
            <div className="stat-grid" style={{marginBottom:18}}>
              {[
                {label:"Total Drives",  val:drives.length, color:"indigo", delta:"AY "+settings.academicYear, type:"neu"},
                {label:"Upcoming",      val:upcoming,       color:"violet", delta: upcoming>0?"Next: "+fmtDate(drives.find(d=>d.status==="Upcoming")?.date||""):"None scheduled", type:"up"},
                {label:"Applications",  val:totalApps,      color:"teal",   delta:"Across all drives", type:"up"},
                {label:"Ongoing",       val:ongoing,        color:"rose",   delta:"Active now", type: ongoing>0?"up":"neu"},
              ].map(s=>(
                <div key={s.label} className={`stat-card sc-${s.color}`}>
                  <div className="stat-val" style={s.color!=="indigo"?{color:`var(--${s.color})`}:{}}>{s.val}</div>
                  <div className="stat-lbl">{s.label}</div>
                  <span className={`stat-delta delta-${s.type}`}>{s.delta}</span>
                </div>
              ))}
            </div>

            {/* FILTERS */}
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <div className="filter-row">
                {["All","Upcoming","Ongoing","Completed"].map(f=>(
                  <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={()=>setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
              <span style={{marginLeft:"auto",fontSize:11,color:"var(--text3)"}}>{filtered.length} drives</span>
            </div>

            {/* DRIVE LIST */}
            {filtered.length===0 ? (
              <div className="pd-empty">
                <div style={{fontSize:36,opacity:.3}}>📋</div>
                <div className="pd-et">No drives found</div>
                <div className="pd-es">{search?`No results for "${search}"`:`No ${filter.toLowerCase()} drives yet.`}</div>
                <button className="btn btn-solid" style={{marginTop:12,fontSize:11,padding:"9px 18px"}} onClick={()=>setShowAdd(true)}>+ Add a Drive</button>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                {filtered.map((d,i) => {
                  const pct = d.eligible>0 ? Math.round((d.applied/d.eligible)*100) : 0;
                  const isOpen = expanded===d.id;
                  return (
                    <div key={d.id} className={`pd-card${isOpen?" open":""}`} style={{animationDelay:i*0.04+"s"}}>
                      {/* CARD ROW */}
                      <div
                        className={`pd-card-row${settings.compact?" compact":""}`}
                        onClick={()=>setExpanded(isOpen?null:d.id)}
                        onMouseEnter={e=>e.currentTarget.parentElement.style.borderColor="rgba(91,78,248,.3)"}
                        onMouseLeave={e=>{ if(!isOpen) e.currentTarget.parentElement.style.borderColor=""; }}
                      >
                        <div className="pd-clogo" style={{color:d.color}}>{d.logo}</div>
                        <div className="pd-cinfo">
                          <div className="pd-cname-row">
                            <span className="pd-cname">{d.name}</span>
                            <Badge cls={statusMap[d.status]} dot>{d.status}</Badge>
                          </div>
                          <div className="pd-crole">{d.role} · {fmtDate(d.date)}</div>
                        </div>
                        <div className="pd-cmetrics">
                          <div className="pd-metric"><div className="pd-mval" style={{color:"var(--teal)"}}>{d.pkg}</div><div className="pd-mlbl">Package</div></div>
                          <div className="pd-metric"><div className="pd-mval" style={{color:"var(--indigo-ll)"}}>{d.applied}</div><div className="pd-mlbl">Applied</div></div>
                          <div className="pd-metric"><div className="pd-mval" style={{color:"var(--amber)"}}>{d.eligible}</div><div className="pd-mlbl">Eligible</div></div>
                          {settings.showProgress && (
                            <div className="pd-prog">
                              <div className="pd-prog-top"><span>Fill</span><span>{pct}%</span></div>
                              <div className="pd-pbar"><div className="pd-pfill" style={{width:pct+"%",background:d.color}} /></div>
                            </div>
                          )}
                          <span className={`pd-chev${isOpen?" open":""}`}>▼</span>
                        </div>
                      </div>

                      {/* EXPANDED */}
                      {isOpen && (
                        <div className="pd-expanded" onClick={e=>e.stopPropagation()}>
                          <div>
                            <div className="pd-etitle">Interview Rounds</div>
                            {d.rounds.map((r,i)=>(
                              <div key={i} className="pd-eround">
                                <span className="pd-rnum">{i+1}</span>
                                <span style={{fontSize:12,color:"var(--text2)"}}>{r}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div className="pd-etitle">Eligibility</div>
                            <div className="pd-chips">{d.branches.map(b=><span key={b} className="pd-chip">{b}</span>)}</div>
                            <div className="pd-minc">Min CGPA: <strong style={{color:"var(--amber)"}}>{d.minCgpa}</strong></div>
                          </div>
                          <div>
                            <div className="pd-etitle">About</div>
                            <p className="pd-edesc">{d.desc}</p>
                            <div className="pd-eactions">
                              <button className="btn btn-solid"  style={{fontSize:10,padding:"7px 13px"}} onClick={()=>setNotifyTarget(d)}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                Notify
                              </button>
                              <button className="btn btn-ghost"  style={{fontSize:10,padding:"7px 13px"}} onClick={()=>setEditTarget(d)}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                              </button>
                              <button className="btn" style={{fontSize:10,padding:"7px 13px",background:"rgba(240,83,106,.1)",color:"var(--rose)",border:"1px solid rgba(240,83,106,.2)"}} onClick={()=>setDeleteTarget(d)}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}