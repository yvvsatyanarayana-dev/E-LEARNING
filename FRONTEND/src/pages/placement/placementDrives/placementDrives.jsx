// PlacementDrives.jsx — SmartCampus
// Modals use ReactDOM.createPortal — immune to parent re-renders
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "./placementDrives.css";

const INIT_DRIVES = [
  { id:1, logo:"A", name:"Amazon",  role:"SDE-1 · Full Time",  pkg:"26 LPA",  date:"2025-03-15", applied:31, eligible:48,  rounds:["Online Test","Technical","HR"],       branches:["CSE","IT","ECE"],        minCgpa:7.5, status:"Upcoming",  color:"#fbbf24", desc:"Hiring for core SDE roles across AWS and e-commerce teams." },
  { id:2, logo:"T", name:"TCS",     role:"System Engineer",     pkg:"7 LPA",   date:"2025-03-18", applied:98, eligible:120, rounds:["TCS NQT","Technical","HR"],            branches:["CSE","IT","ECE","MECH"], minCgpa:6.0, status:"Upcoming",  color:"#8b5cf6", desc:"Mass hiring drive for System Engineer role." },
  { id:3, logo:"Z", name:"Zoho",    role:"Software Developer",  pkg:"12 LPA",  date:"2025-03-22", applied:52, eligible:65,  rounds:["Aptitude","Coding","Interview"],       branches:["CSE","IT"],             minCgpa:7.0, status:"Upcoming",  color:"#2dd4bf", desc:"Zoho hiring for software dev roles, no bond." },
  { id:4, logo:"W", name:"Wipro",   role:"Project Engineer",    pkg:"6 LPA",   date:"2025-03-28", applied:63, eligible:90,  rounds:["NLTH","Technical","HR"],              branches:["CSE","IT","ECE","MECH"], minCgpa:6.0, status:"Ongoing",   color:"#7b6ffa", desc:"NLTH-based hiring for engineering graduates." },
  { id:5, logo:"I", name:"Infosys", role:"Systems Analyst",     pkg:"6.5 LPA", date:"2025-03-08", applied:84, eligible:110, rounds:["Online Test","Technical","HR"],        branches:["CSE","IT","ECE"],        minCgpa:6.5, status:"Completed", color:"#2dd4bf", desc:"Drive completed. Offers rolling out to selected candidates." },
  { id:6, logo:"G", name:"Google",  role:"SWE · L3",            pkg:"32 LPA",  date:"2025-02-28", applied:9,  eligible:12,  rounds:["DSA","System Design","Googleyness"],  branches:["CSE","IT"],             minCgpa:8.5, status:"Completed", color:"#4ade80", desc:"Completed. 3 offers made to final candidates." },
];

const STATUS_CLS    = { Upcoming:"badge-indigo", Completed:"badge-teal", Ongoing:"badge-amber" };
const ALL_BRANCHES  = ["CSE","IT","ECE","MECH","EEE","CIVIL"];
const LOGO_COLORS   = ["#a59fff","#2dd4bf","#fbbf24","#8b5cf6","#fb7185","#4ade80"];
const FAKE_STUDENTS = [
  { name:"Aarav Sharma",  roll:"21CS001",  cgpa:8.4 },
  { name:"Priya Menon",   roll:"21CS012",  cgpa:7.9 },
  { name:"Rajan Kumar",   roll:"21IT034",  cgpa:8.1 },
  { name:"Sneha Patel",   roll:"21CS047",  cgpa:7.5 },
  { name:"Arjun Nair",    roll:"21ECE018", cgpa:7.8 },
  { name:"Divya Rao",     roll:"21CS055",  cgpa:8.7 },
];

/* ── TOAST HOOK ── */
let _tid = 0;
function useToasts() {
  const [list, setList] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = ++_tid;
    setList(t => [...t, { id, msg, type }]);
    setTimeout(() => setList(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  const remove = useCallback(id => setList(t => t.filter(x => x.id !== id)), []);
  return { list, add, remove };
}

/* ── PORTAL ── */
function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  const el = useRef(null);
  if (!el.current) el.current = document.createElement("div");
  useEffect(() => {
    document.body.appendChild(el.current);
    setMounted(true);
    return () => { document.body.removeChild(el.current); };
  }, []);
  return mounted ? createPortal(children, el.current) : null;
}

/* ── TOGGLE ── */
function Toggle({ on, onChange }) {
  return (
    <button type="button" className={"pd-toggle" + (on ? " on" : "")} onClick={() => onChange(!on)}>
      <span className="pd-tknob" />
    </button>
  );
}

/* ── BADGE ── */
function Badge({ cls, children }) {
  return <span className={"pd-badge " + cls}><span className="pd-bdot" />{children}</span>;
}

/* ── TOASTS ── */
const TICON = { success:"✅", error:"❌", info:"ℹ️", warning:"⚠️" };
function Toasts({ list, remove }) {
  return (
    <div className="pd-toasts">
      {list.map(t => (
        <div key={t.id} className={"pd-toast " + t.type}>
          <span>{TICON[t.type]}</span>
          <span className="pd-tmsg">{t.msg}</span>
          <button type="button" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   DRIVE FORM MODAL
══════════════════════════════════════════════ */
const EMPTY_FORM = {
  name:"", role:"", pkg:"", date:"",
  applied:"", eligible:"", minCgpa:"",
  status:"Upcoming", desc:"",
  branches:[], rounds:["","",""],
  logo:"", color: LOGO_COLORS[0],
};

function DriveFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    initial
      ? { ...initial, rounds:[...initial.rounds], branches:[...initial.branches] }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const upd = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = {...e}; delete n[k]; return n; });
  };

  const toggleBranch = b =>
    upd("branches", form.branches.includes(b)
      ? form.branches.filter(x => x !== b)
      : [...form.branches, b]);

  const setRound = (i, v) => {
    const r = [...form.rounds]; r[i] = v; upd("rounds", r);
  };

  const handleSave = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.role.trim()) errs.role = "Required";
    if (!form.pkg.trim())  errs.pkg  = "Required";
    if (!form.date)        errs.date = "Required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...form,
      id:       initial ? initial.id : Date.now(),
      logo:     form.logo.trim() || form.name[0].toUpperCase(),
      rounds:   form.rounds.filter(r => r.trim()),
      applied:  parseInt(form.applied)   || 0,
      eligible: parseInt(form.eligible)  || 1,
      minCgpa:  parseFloat(form.minCgpa) || 0,
    });
  };

  return (
    <Portal>
      <div className="pd-overlay" onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="pd-modal" onPointerDown={e => e.stopPropagation()}>
          <div className="pd-mhead">
            <span className="pd-mtitle">{initial ? "Edit Drive" : "New Drive"}</span>
            <button type="button" className="pd-mclose" onClick={onClose}>✕</button>
          </div>
          <div className="pd-mbody">
            <div className="pd-fgrid">

              <div className={"pd-field" + (errors.name ? " has-err" : "")}>
                <label className="pd-label">Company Name <span className="req">*</span></label>
                <input className="pd-input" placeholder="e.g. Microsoft" autoFocus
                  value={form.name} onChange={e => upd("name", e.target.value)} />
                {errors.name && <span className="pd-err">{errors.name}</span>}
              </div>

              <div className={"pd-field" + (errors.role ? " has-err" : "")}>
                <label className="pd-label">Role / Position <span className="req">*</span></label>
                <input className="pd-input" placeholder="e.g. SDE-1 · Full Time"
                  value={form.role} onChange={e => upd("role", e.target.value)} />
                {errors.role && <span className="pd-err">{errors.role}</span>}
              </div>

              <div className={"pd-field" + (errors.pkg ? " has-err" : "")}>
                <label className="pd-label">Package <span className="req">*</span></label>
                <input className="pd-input" placeholder="e.g. 18 LPA"
                  value={form.pkg} onChange={e => upd("pkg", e.target.value)} />
                {errors.pkg && <span className="pd-err">{errors.pkg}</span>}
              </div>

              <div className={"pd-field" + (errors.date ? " has-err" : "")}>
                <label className="pd-label">Drive Date <span className="req">*</span></label>
                <input className="pd-input" type="date"
                  value={form.date} onChange={e => upd("date", e.target.value)} />
                {errors.date && <span className="pd-err">{errors.date}</span>}
              </div>

              <div className="pd-field">
                <label className="pd-label">Applications Received</label>
                <input className="pd-input" type="number" min="0" placeholder="e.g. 45"
                  value={form.applied} onChange={e => upd("applied", e.target.value)} />
              </div>

              <div className="pd-field">
                <label className="pd-label">Eligible Students</label>
                <input className="pd-input" type="number" min="1" placeholder="e.g. 60"
                  value={form.eligible} onChange={e => upd("eligible", e.target.value)} />
              </div>

              <div className="pd-field">
                <label className="pd-label">Min CGPA</label>
                <input className="pd-input" type="number" step="0.1" min="0" max="10" placeholder="e.g. 7.0"
                  value={form.minCgpa} onChange={e => upd("minCgpa", e.target.value)} />
              </div>

              <div className="pd-field">
                <label className="pd-label">Status</label>
                <select className="pd-input pd-select"
                  value={form.status} onChange={e => upd("status", e.target.value)}>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="pd-field">
                <label className="pd-label">Logo Letter</label>
                <input className="pd-input" maxLength={2} placeholder="Auto (first letter)"
                  value={form.logo} onChange={e => upd("logo", e.target.value.toUpperCase())} />
              </div>

              <div className="pd-field">
                <label className="pd-label">Logo Colour</label>
                <div className="pd-swatches">
                  {LOGO_COLORS.map(c => (
                    <button key={c} type="button"
                      className={"pd-swatch" + (form.color === c ? " active" : "")}
                      style={{ background: c }}
                      onClick={() => upd("color", c)} />
                  ))}
                </div>
              </div>

              <div className="pd-field pd-full">
                <label className="pd-label">Eligible Branches</label>
                <div className="pd-branches">
                  {ALL_BRANCHES.map(b => (
                    <button key={b} type="button"
                      className={"pd-branch" + (form.branches.includes(b) ? " sel" : "")}
                      onClick={() => toggleBranch(b)}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pd-field pd-full">
                <label className="pd-label">Interview Rounds</label>
                <div className="pd-rounds">
                  {form.rounds.map((r, i) => (
                    <div key={i} className="pd-round-row">
                      <span className="pd-rnum">{i + 1}</span>
                      <input className="pd-input" placeholder={"Round " + (i + 1)}
                        value={r} onChange={e => setRound(i, e.target.value)} />
                      {form.rounds.length > 1 && (
                        <button type="button" className="pd-rdel"
                          onClick={() => upd("rounds", form.rounds.filter((_,j) => j !== i))}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="pd-add-round"
                  onClick={() => upd("rounds", [...form.rounds, ""])}>+ Add Round</button>
              </div>

              <div className="pd-field pd-full">
                <label className="pd-label">About Drive</label>
                <textarea className="pd-input pd-ta"
                  placeholder="Brief description about the drive, job role, and expectations…"
                  value={form.desc} onChange={e => upd("desc", e.target.value)} />
              </div>

            </div>
            <div className="pd-footer">
              <button type="button" className="pd-btn pd-ghost" onClick={onClose}>Cancel</button>
              <button type="button" className="pd-btn pd-solid" onClick={handleSave}>
                {initial ? "Save Changes" : "Add Drive"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ── NOTIFY MODAL ── */
function NotifyModal({ drive, onClose, onSent }) {
  const [msg, setMsg] = useState(
    "Dear Student,\n\nYou are eligible for the " + drive.name + " placement drive on " + drive.date + ".\n\nRole: " + drive.role + "\nPackage: " + drive.pkg + "\nMin CGPA: " + drive.minCgpa + "\n\nPlease register on the placement portal.\n\n— Placement Cell"
  );
  const eligible = FAKE_STUDENTS.filter(s => s.cgpa >= drive.minCgpa);
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <Portal>
      <div className="pd-overlay" onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="pd-modal" style={{maxWidth:480}} onPointerDown={e => e.stopPropagation()}>
          <div className="pd-mhead">
            <span className="pd-mtitle">Notify Students</span>
            <button type="button" className="pd-mclose" onClick={onClose}>✕</button>
          </div>
          <div className="pd-mbody">
            <p className="pd-nsub">
              Sending to <strong style={{color:"#2dd4bf"}}>{eligible.length} eligible</strong> students for <strong>{drive.name}</strong>.
            </p>
            <div className="pd-slist">
              {eligible.map(s => (
                <div key={s.roll} className="pd-srow">
                  <div className="pd-savatar">{s.name[0]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600}}>{s.name}</div>
                    <div style={{fontSize:10,color:"var(--t3)"}}>{s.roll}</div>
                  </div>
                  <span className="pd-chip" style={{color:"#2dd4bf"}}>CGPA {s.cgpa}</span>
                </div>
              ))}
            </div>
            <div className="pd-field" style={{marginTop:14}}>
              <label className="pd-label">Message</label>
              <textarea className="pd-input pd-ta" style={{minHeight:120}} value={msg} onChange={e => setMsg(e.target.value)} />
            </div>
            <div className="pd-footer">
              <button type="button" className="pd-btn pd-ghost" onClick={onClose}>Cancel</button>
              <button type="button" className="pd-btn pd-teal" onClick={() => { onSent(); onClose(); }}>📨 Send Notification</button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ── CONFIRM MODAL ── */
function ConfirmModal({ drive, onConfirm, onClose }) {
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <Portal>
      <div className="pd-overlay" onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="pd-modal pd-confirm" onPointerDown={e => e.stopPropagation()}>
          <div className="pd-mhead">
            <span className="pd-mtitle">Delete Drive</span>
            <button type="button" className="pd-mclose" onClick={onClose}>✕</button>
          </div>
          <div className="pd-mbody" style={{textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>🗑️</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Remove "{drive.name}"?</div>
            <div style={{fontSize:12,color:"var(--t3)",marginBottom:24,lineHeight:1.6}}>
              This action cannot be undone.
            </div>
            <div className="pd-footer" style={{justifyContent:"center"}}>
              <button type="button" className="pd-btn pd-ghost" onClick={onClose}>Cancel</button>
              <button type="button" className="pd-btn pd-rose" onClick={() => { onConfirm(); onClose(); }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ── SETTINGS PANEL ── */
function SettingsPanel({ settings: s, setSettings, onClose }) {
  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  const Row = ({ label, desc, children }) => (
    <div className="pd-srow">
      <div><div className="pd-slabel">{label}</div>{desc && <div className="pd-sdesc">{desc}</div>}</div>
      {children}
    </div>
  );
  return (
    <Portal>
      <div className="pd-soverlay" onClick={onClose} />
      <div className="pd-spanel">
        <div className="pd-shead">
          <span className="pd-stitle">Settings</span>
          <button type="button" className="pd-mclose" onClick={onClose}>✕</button>
        </div>
        <div className="pd-sbody">
          <div className="pd-ssec">
            <div className="pd-ssec-title">Appearance</div>
            <Row label="Custom Cursor" desc="SmartCampus branded cursor"><Toggle on={s.cursor} onChange={v => set("cursor", v)} /></Row>
            <Row label="Noise Overlay" desc="Film grain texture"><Toggle on={s.noise} onChange={v => set("noise", v)} /></Row>
            <Row label="Animations" desc="Reduce for accessibility"><Toggle on={s.animations} onChange={v => set("animations", v)} /></Row>
          </div>
          <div className="pd-ssec">
            <div className="pd-ssec-title">Notifications</div>
            <Row label="Email Alerts" desc="New drive notifications via email"><Toggle on={s.emailAlerts} onChange={v => set("emailAlerts", v)} /></Row>
            <Row label="Student SMS" desc="Send SMS to eligible students"><Toggle on={s.smsAlerts} onChange={v => set("smsAlerts", v)} /></Row>
            <Row label="Drive Reminders" desc="24 hrs before drive"><Toggle on={s.driveReminders} onChange={v => set("driveReminders", v)} /></Row>
          </div>
          <div className="pd-ssec">
            <div className="pd-ssec-title">Display</div>
            <Row label="Show Progress Bar" desc="Application fill rate on cards"><Toggle on={s.showProgress} onChange={v => set("showProgress", v)} /></Row>
            <Row label="Compact View" desc="Smaller card padding"><Toggle on={s.compact} onChange={v => set("compact", v)} /></Row>
            <Row label="Default Filter">
              <select className="pd-sselect" value={s.defaultFilter} onChange={e => set("defaultFilter", e.target.value)}>
                {["All","Upcoming","Ongoing","Completed"].map(f => <option key={f}>{f}</option>)}
              </select>
            </Row>
          </div>
          <div className="pd-ssec">
            <div className="pd-ssec-title">Account</div>
            <Row label="Placement Officer" desc="Ms. Kavitha R">
              <button type="button" className="pd-btn pd-ghost" style={{fontSize:10,padding:"5px 12px"}}>Edit</button>
            </Row>
            <Row label="Academic Year">
              <select className="pd-sselect" value={s.academicYear} onChange={e => set("academicYear", e.target.value)}>
                {["2024-25","2023-24","2022-23"].map(y => <option key={y}>{y}</option>)}
              </select>
            </Row>
          </div>
          <button type="button" className="pd-btn pd-ghost pd-reset" onClick={() => setSettings({ cursor:true,noise:true,animations:true,emailAlerts:true,smsAlerts:false,driveReminders:true,defaultFilter:"All",showProgress:true,compact:false,academicYear:"2024-25" })}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </Portal>
  );
}

/* ── SIDEBAR ── */
function NavLink({ active, to, badge, badgeCls, icon, label, onClick }) {
  return (
    <a href={to || "#"} className={"pd-navlink" + (active ? " active" : "")} onClick={e => { if (onClick) { e.preventDefault(); onClick(); } }}>
      {icon}<span>{label}</span>
      {badge != null && <span className={"pd-nbadge" + (badgeCls ? " " + badgeCls : "")}>{badge}</span>}
    </a>
  );
}

function Sidebar({ drives, toast, onClose }) {
  const up = drives.filter(d => d.status === "Upcoming").length;
  return (
    <aside className="pd-sidebar">
      <div className="pd-sb-top">
        <div className="pd-brand"><div className="pd-mark">SC</div><span className="pd-bname">SmartCampus</span></div>
      </div>
      <div className="pd-sb-user">
        <div className="pd-uavatar">KR</div>
        <div><div className="pd-uname">Ms. Kavitha R</div><div className="pd-urole">Placement Officer</div></div>
      </div>
      <nav className="pd-nav">
        <div className="pd-sec">Overview</div>
        <NavLink to="/placementdashboard" label="Dashboard" onClick={onClose} icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>} />
        <NavLink to="/analytics" label="Analytics" badge="New" onClick={onClose} icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} />
        <div className="pd-sec">Placement</div>
        <NavLink to="/students" label="Students" badge={316} badgeCls="teal" onClick={onClose} icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} />
        <NavLink to="/companies" label="Companies" badge={5} badgeCls="amber" onClick={onClose} icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>} />
        <NavLink active to="/drives" label="Drives" badge={up} badgeCls="rose" onClick={onClose} icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
        <NavLink to="/offers" label="Offers & Placed" onClick={onClose} icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>} />
        <NavLink to="/internships" label="Internships" onClick={onClose} icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>} />
        <div className="pd-sec">Tools</div>
        <NavLink to="/ai" label="AI Assistant" onClick={onClose} icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>} />
        <NavLink to="/reports" label="Reports" onClick={onClose} icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
      </nav>
      <div className="pd-sb-foot">
        <div className="pd-prbox">
          <div className="pd-prlbl">Placement Rate</div>
          <div className="pd-prval">68%</div>
          <div className="pd-prsub">+6% vs last year · AY 2024–25</div>
          <div className="pd-prbar"><div className="pd-prfill" style={{width:"68%"}} /></div>
        </div>
        <button type="button" className="pd-signout" onClick={() => toast("Signing out…","info")}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ── METRIC ── */
function Metric({ val, lbl, color }) {
  return (
    <div className="pd-metric">
      <div className="pd-mval" style={{color}}>{val}</div>
      <div className="pd-mlbl">{lbl}</div>
    </div>
  );
}

/* ── DRIVE CARD ── */
function DriveCard({ drive:d, expanded, onToggle, onEdit, onDelete, onNotify, showProgress, compact }) {
  const pct = d.eligible > 0 ? Math.round((d.applied / d.eligible) * 100) : 0;
  const fmtDate = raw => { try { return new Date(raw).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); } catch { return raw; } };
  return (
    <div className={"pd-card" + (expanded ? " expanded" : "")}>
      <div className={"pd-card-row" + (compact ? " compact" : "")} onClick={onToggle}>
        <div className="pd-clogo" style={{color:d.color}}>{d.logo}</div>
        <div className="pd-cinfo">
          <div className="pd-cname-row">
            <span className="pd-cname">{d.name}</span>
            <Badge cls={STATUS_CLS[d.status]}>{d.status}</Badge>
          </div>
          <div className="pd-crole">{d.role} · {fmtDate(d.date)}</div>
        </div>
        <div className="pd-cmetrics">
          <Metric val={d.pkg}      lbl="Package" color="#2dd4bf" />
          <Metric val={d.applied}  lbl="Applied"  color="#a59fff" />
          <Metric val={d.eligible} lbl="Eligible" color="#fbbf24" />
          {showProgress && (
            <div className="pd-prog">
              <div className="pd-prog-top"><span>Fill</span><span>{pct}%</span></div>
              <div className="pd-pbar"><div className="pd-pfill" style={{width:pct+"%",background:d.color}} /></div>
            </div>
          )}
          <span className={"pd-chev" + (expanded ? " open" : "")}>▼</span>
        </div>
      </div>
      {expanded && (
        <div className="pd-expanded" onClick={e => e.stopPropagation()}>
          <div className="pd-esec">
            <div className="pd-etitle">Interview Rounds</div>
            {d.rounds.map((r, i) => (
              <div key={i} className="pd-eround">
                <span className="pd-rnum">{i + 1}</span><span>{r}</span>
              </div>
            ))}
          </div>
          <div className="pd-esec">
            <div className="pd-etitle">Eligibility</div>
            <div className="pd-chips">{d.branches.map(b => <span key={b} className="pd-chip">{b}</span>)}</div>
            <div className="pd-minc">Min CGPA: <strong style={{color:"#fbbf24"}}>{d.minCgpa}</strong></div>
          </div>
          <div className="pd-esec">
            <div className="pd-etitle">About</div>
            <p className="pd-edesc">{d.desc}</p>
            <div className="pd-eactions">
              <button type="button" className="pd-btn pd-solid" style={{fontSize:10,padding:"7px 13px"}} onClick={onNotify}>📨 Notify Students</button>
              <button type="button" className="pd-btn pd-ghost" style={{fontSize:10,padding:"7px 13px"}} onClick={onEdit}>✏️ Edit Drive</button>
              <button type="button" className="pd-btn pd-rose"  style={{fontSize:10,padding:"7px 13px"}} onClick={onDelete}>🗑 Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
export default function PlacementDrives() {
  const [drives, setDrives]     = useState(INIT_DRIVES);
  const [filter, setFilter]     = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch]     = useState("");
  const [settings, setSettings] = useState({ cursor:true,noise:true,animations:true,emailAlerts:true,smsAlerts:false,driveReminders:true,defaultFilter:"All",showProgress:true,compact:false,academicYear:"2024-25" });
  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [notifyTarget, setNotifyTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mobSidebar, setMobSidebar]     = useState(false);

  const { list: toasts, add: toast, remove: removeToast } = useToasts();

  /* cursor */
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0), rx = useRef(0), ry = useRef(0), raf = useRef(null);

  useEffect(() => {
    if (!settings.cursor) { document.body.style.cursor = "default"; cancelAnimationFrame(raf.current); return; }
    document.body.style.cursor = "none";
    const move = e => { mx.current = e.clientX; my.current = e.clientY; if (dotRef.current) { dotRef.current.style.left = e.clientX+"px"; dotRef.current.style.top = e.clientY+"px"; } };
    const down = () => document.body.classList.add("c-click");
    const up   = () => document.body.classList.remove("c-click");
    const over = e => { e.target.closest("button,a,input,select,textarea,label") ? document.body.classList.add("c-hover") : document.body.classList.remove("c-hover"); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup",   up);
    document.addEventListener("mouseover", over);
    const loop = () => { rx.current += (mx.current - rx.current)*0.14; ry.current += (my.current - ry.current)*0.14; if (ringRef.current) { ringRef.current.style.left = rx.current+"px"; ringRef.current.style.top = ry.current+"px"; } raf.current = requestAnimationFrame(loop); };
    loop();
    return () => { document.removeEventListener("mousemove",move); document.removeEventListener("mousedown",down); document.removeEventListener("mouseup",up); document.removeEventListener("mouseover",over); cancelAnimationFrame(raf.current); document.body.style.cursor=""; document.body.classList.remove("c-hover","c-click"); };
  }, [settings.cursor]);

  const addDrive  = useCallback(form => { setDrives(p => [form, ...p]); setShowAdd(false);   toast('"'+form.name+'" added!', "success"); }, [toast]);
  const saveDrive = useCallback(form => { setDrives(p => p.map(d => d.id===form.id ? form : d)); setEditTarget(null); toast('"'+form.name+'" updated!', "success"); }, [toast]);
  const deleteDrive = useCallback(id => {
    setDrives(p => { const d = p.find(x => x.id===id); toast('"'+(d?.name)+'" removed.', "info"); return p.filter(x => x.id!==id); });
    setExpanded(null);
  }, [toast]);

  const filtered = drives.filter(d => {
    if (filter !== "All" && d.status !== filter) return false;
    const q = search.toLowerCase();
    return !q || d.name.toLowerCase().includes(q) || d.role.toLowerCase().includes(q);
  });

  const upcoming  = drives.filter(d => d.status==="Upcoming").length;
  const ongoing   = drives.filter(d => d.status==="Ongoing").length;
  const completed = drives.filter(d => d.status==="Completed").length;
  const totalApps = drives.reduce((s,d) => s+(d.applied||0), 0);

  return (
    <>
      {settings.cursor && (
        <Portal>
          <div className="pd-cur-dot"  ref={dotRef}  />
          <div className="pd-cur-ring" ref={ringRef} />
        </Portal>
      )}
      {settings.noise && <div className="pd-noise" />}
      <Toasts list={toasts} remove={removeToast} />

      {showAdd      && <DriveFormModal onSave={addDrive} onClose={() => setShowAdd(false)} />}
      {editTarget   && <DriveFormModal initial={editTarget} onSave={saveDrive} onClose={() => setEditTarget(null)} />}
      {notifyTarget && <NotifyModal drive={notifyTarget} onClose={() => setNotifyTarget(null)} onSent={() => toast("Notifications sent for "+notifyTarget.name+"!","success")} />}
      {deleteTarget && <ConfirmModal drive={deleteTarget} onConfirm={() => deleteDrive(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
      {showSettings && <SettingsPanel settings={settings} setSettings={setSettings} onClose={() => { setShowSettings(false); toast("Settings saved.","success"); }} />}

      {mobSidebar && (
        <Portal>
          <div className="pd-mob-bg" onClick={() => setMobSidebar(false)} />
          <div className="pd-mob-side"><Sidebar drives={drives} toast={toast} onClose={() => setMobSidebar(false)} /></div>
        </Portal>
      )}

      <div className="pd-app">
        <div className="pd-desk-side"><Sidebar drives={drives} toast={toast} /></div>
        <div className="pd-main">
          <header className="pd-topbar">
            <button type="button" className="pd-ham" onClick={() => setMobSidebar(true)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <button type="button" className="pd-back" onClick={() => window.history.back()}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              <span>Back</span>
            </button>
            <span className="pd-tbpage">Placement Drives</span>
            <div className="pd-sbox">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search drives…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button type="button" className="pd-sclear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="pd-tbr">
              <button type="button" className="pd-icon-btn" onClick={() => toast("3 upcoming drive reminders.","info")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="pd-ndot" />
              </button>
              <button type="button" className="pd-icon-btn" onClick={() => setShowSettings(true)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <button type="button" className="pd-btn pd-solid pd-newbtn" onClick={() => setShowAdd(true)}>+ New Drive</button>
            </div>
          </header>

          <div className="pd-content">
            <div className="pd-pghead">
              <div className="pd-ptag"><span className="pd-pip" /><span>{drives.length} Drives · {upcoming} Upcoming · {ongoing} Ongoing · {completed} Completed</span></div>
              <h1 className="pd-h1">Placement <em>Drives</em></h1>
              <p className="pd-hsub">Manage all campus recruitment drives, eligibility, and student applications.</p>
            </div>

            <div className="pd-stats">
              {[
                {label:"Total Drives", val:drives.length, color:"#a59fff", delta:"AY 2024–25"},
                {label:"Upcoming",     val:upcoming,      color:"#8b5cf6", delta: upcoming>0 ? "Next: "+drives.find(d=>d.status==="Upcoming")?.date : "None yet"},
                {label:"Applications", val:totalApps,     color:"#fbbf24", delta:"Across all drives"},
                {label:"Ongoing",      val:ongoing,       color:"#2dd4bf", delta:"Active now"},
              ].map((s,i) => (
                <div key={s.label} className="pd-stat" style={{animationDelay:i*0.06+"s"}}>
                  <div className="pd-sval" style={{color:s.color}}>{s.val}</div>
                  <div className="pd-slbl">{s.label}</div>
                  <div className="pd-sdelta">{s.delta}</div>
                </div>
              ))}
            </div>

            <div className="pd-fbar">
              <div className="pd-tabs">
                {["All","Upcoming","Ongoing","Completed"].map(f => (
                  <button key={f} type="button" className={"pd-tab"+(filter===f?" active":"")} onClick={() => setFilter(f)}>
                    {f}<span className="pd-tc">{f==="All"?drives.length:drives.filter(d=>d.status===f).length}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="pd-btn pd-ghost pd-setbtn" onClick={() => setShowSettings(true)}>⚙️ Settings</button>
            </div>

            {filtered.length === 0 ? (
              <div className="pd-empty">
                <div style={{fontSize:40,opacity:.3}}>📋</div>
                <div className="pd-et">No drives found</div>
                <div className="pd-es">{search ? 'No results for "'+search+'"' : "No "+filter.toLowerCase()+" drives yet."}</div>
                <button type="button" className="pd-btn pd-solid" style={{marginTop:12,fontSize:11}} onClick={() => setShowAdd(true)}>+ Add a Drive</button>
              </div>
            ) : (
              <div className="pd-list">
                {filtered.map(d => (
                  <DriveCard key={d.id} drive={d}
                    expanded={expanded===d.id}
                    onToggle={() => setExpanded(expanded===d.id?null:d.id)}
                    onEdit={() => setEditTarget(d)}
                    onDelete={() => setDeleteTarget(d)}
                    onNotify={() => setNotifyTarget(d)}
                    showProgress={settings.showProgress}
                    compact={settings.compact}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}