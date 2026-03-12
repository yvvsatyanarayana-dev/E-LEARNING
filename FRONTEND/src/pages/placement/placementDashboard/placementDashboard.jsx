import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth } from "../../utils/auth";
import "./placementDashboard.css";

/* ════════════════════════════════════════════
   PDF EXPORT UTILITY  (no external lib needed)
════════════════════════════════════════════ */
function generatePDF(data, format = "Full Report") {
  const { students, drives, settings, placementRate, placedStudents } = data;
  const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const placedList = students.filter(s => s.status === "Placed");
  const inProcess  = students.filter(s => s.status === "In Process");
  const notReady   = students.filter(s => s.status === "Not Ready");

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>SmartCampus Placement Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Plus Jakarta Sans',sans-serif;color:#1a1a2e;background:#fff;padding:40px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #5b4ef8;margin-bottom:28px;}
  .brand{display:flex;align-items:center;gap:12px;}
  .brand-mark{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#5b4ef8,#9f7aea);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;}
  .brand-name{font-size:20px;font-weight:800;color:#1a1a2e;letter-spacing:.04em;}
  .brand-sub{font-size:11px;color:#6b6b80;margin-top:2px;}
  .report-meta{text-align:right;}
  .report-title{font-size:13px;font-weight:700;color:#5b4ef8;}
  .report-date{font-size:11px;color:#6b6b80;margin-top:4px;}
  .report-ay{font-size:10px;color:#9898b8;margin-top:2px;}
  h2{font-size:15px;font-weight:800;color:#1a1a2e;margin:24px 0 14px;display:flex;align-items:center;gap:8px;}
  h2::before{content:'';display:inline-block;width:4px;height:16px;background:#5b4ef8;border-radius:2px;}
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
  .stat-box{border-radius:10px;padding:16px;text-align:center;border:1px solid #e8e8f0;}
  .stat-box.indigo{border-color:#5b4ef8;background:#f4f3ff;}
  .stat-box.teal  {border-color:#27c9b0;background:#f0fdfb;}
  .stat-box.amber {border-color:#f4a535;background:#fffbf0;}
  .stat-box.violet{border-color:#9f7aea;background:#f9f7ff;}
  .stat-num{font-size:28px;font-weight:800;line-height:1;margin-bottom:4px;}
  .stat-box.indigo .stat-num{color:#5b4ef8;}
  .stat-box.teal   .stat-num{color:#27c9b0;}
  .stat-box.amber  .stat-num{color:#f4a535;}
  .stat-box.violet .stat-num{color:#9f7aea;}
  .stat-lbl{font-size:10px;color:#6b6b80;font-weight:600;text-transform:uppercase;letter-spacing:.06em;}
  table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:11px;}
  th{background:#f4f3ff;padding:8px 10px;text-align:left;font-weight:700;color:#5b4ef8;font-size:9px;letter-spacing:.08em;text-transform:uppercase;border-bottom:2px solid #5b4ef8;}
  td{padding:8px 10px;border-bottom:1px solid #e8e8f0;color:#3a3a5c;vertical-align:middle;}
  tr:nth-child(even) td{background:#fafafa;}
  .pill{display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;}
  .pill-teal  {background:#e0fdf8;color:#27c9b0;}
  .pill-indigo{background:#ede9ff;color:#5b4ef8;}
  .pill-amber {background:#fff8e6;color:#f4a535;}
  .pill-rose  {background:#fff0f2;color:#f2445c;}
  .drives-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px;}
  .drive-box{border:1px solid #e8e8f0;border-radius:10px;padding:14px;}
  .drive-box-name{font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:2px;}
  .drive-box-role{font-size:10px;color:#6b6b80;margin-bottom:8px;}
  .drive-box-pkg{font-size:18px;font-weight:800;color:#27c9b0;margin-bottom:4px;}
  .drive-box-meta{font-size:9px;color:#9898b8;}
  .bar-wrap{height:4px;background:#e8e8f0;border-radius:2px;margin-top:8px;overflow:hidden;}
  .bar-fill{height:100%;border-radius:2px;background:#5b4ef8;}
  .funnel-row{display:flex;align-items:center;margin-bottom:10px;gap:12px;}
  .funnel-label{font-size:11px;color:#3a3a5c;width:200px;flex-shrink:0;}
  .funnel-bar-bg{flex:1;height:8px;background:#e8e8f0;border-radius:4px;overflow:hidden;}
  .funnel-bar-fill{height:100%;border-radius:4px;}
  .funnel-count{font-size:11px;font-weight:700;width:60px;text-align:right;flex-shrink:0;}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e8e8f0;display:flex;justify-content:space-between;font-size:9px;color:#9898b8;}
  .page-break{page-break-before:always;}
</style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-mark">SC</div>
      <div>
        <div class="brand-name">SmartCampus</div>
        <div class="brand-sub">Placement Management System</div>
      </div>
    </div>
    <div class="report-meta">
      <div class="report-title">📊 ${format}</div>
      <div class="report-date">Generated: ${now}</div>
      <div class="report-ay">AY ${settings.academicYear} · ${settings.semester}</div>
      <div class="report-ay">Officer: ${settings.officerName}</div>
    </div>
  </div>

  <h2>Placement Summary</h2>
  <div class="stats-grid">
    <div class="stat-box indigo">
      <div class="stat-num">${students.length}</div>
      <div class="stat-lbl">Total Students</div>
    </div>
    <div class="stat-box teal">
      <div class="stat-num">${placedStudents}</div>
      <div class="stat-lbl">Placed Students</div>
    </div>
    <div class="stat-box amber">
      <div class="stat-num">${placementRate}%</div>
      <div class="stat-lbl">Placement Rate</div>
    </div>
    <div class="stat-box violet">
      <div class="stat-num">21.4L</div>
      <div class="stat-lbl">Avg Package</div>
    </div>
  </div>

  <h2>Placement Funnel</h2>
  <div style="margin-bottom:24px;">
    ${[
      {label:"Total Eligible",pct:100,count:316,color:"#9898b8"},
      {label:"PRI ≥ 70 (Drive Ready)",pct:75,count:237,color:"#7b6ffa"},
      {label:"Applied to Companies",pct:62,count:196,color:"#9f7aea"},
      {label:"Interview Cleared",pct:50,count:158,color:"#f4a535"},
      {label:"Offer Received",pct:68,count:placedStudents,color:"#27c9b0"},
    ].map(f => `
    <div class="funnel-row">
      <div class="funnel-label">${f.label}</div>
      <div class="funnel-bar-bg"><div class="funnel-bar-fill" style="width:${f.pct}%;background:${f.color}"></div></div>
      <div class="funnel-count" style="color:${f.color}">${f.count}</div>
    </div>`).join("")}
  </div>

  <h2>Placement Drives</h2>
  <div class="drives-grid">
    ${drives.map(d => `
    <div class="drive-box">
      <div class="drive-box-name">${d.name}</div>
      <div class="drive-box-role">${d.role}</div>
      <div class="drive-box-pkg">${d.pkg}</div>
      <div class="drive-box-meta">${d.date} · ${d.applied}/${d.eligible} applied</div>
      <span class="pill ${d.status === "Completed" ? "pill-teal" : d.status === "Upcoming" ? "pill-indigo" : "pill-amber"}">${d.status}</span>
      <div class="bar-wrap"><div class="bar-fill" style="width:${d.pct}%"></div></div>
    </div>`).join("")}
  </div>

  <div class="page-break"></div>
  <h2>Student Placement Tracker</h2>
  <table>
    <thead>
      <tr>
        <th>Student Name</th><th>Branch</th><th>CGPA</th><th>PRI</th>
        <th>Company</th><th>Package</th><th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${students.map(s => `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>${s.branch}</td>
        <td>${s.cgpa}</td>
        <td>${s.pri}/100</td>
        <td>${s.company}</td>
        <td>${s.pkg}</td>
        <td><span class="pill ${
          s.status === "Placed" ? "pill-teal" :
          s.status === "In Process" ? "pill-indigo" :
          s.status === "Applied" ? "pill-amber" : "pill-rose"
        }">${s.status}</span></td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>Branch-wise Placement</h2>
  <table>
    <thead><tr><th>Branch</th><th>Placement %</th><th>Status</th></tr></thead>
    <tbody>
      ${[
        {branch:"CSE",pct:88,color:"#27c9b0"},
        {branch:"IT",pct:76,color:"#7b6ffa"},
        {branch:"ECE",pct:61,color:"#f4a535"},
        {branch:"MECH",pct:42,color:"#f2445c"},
      ].map(b => `
      <tr>
        <td><strong>${b.branch}</strong></td>
        <td><div style="display:flex;align-items:center;gap:8px;">
          <div style="width:120px;height:6px;background:#e8e8f0;border-radius:3px;overflow:hidden;">
            <div style="width:${b.pct}%;height:100%;background:${b.color};border-radius:3px;"></div>
          </div>
          <span style="color:${b.color};font-weight:700;">${b.pct}%</span>
        </div></td>
        <td><span class="pill ${b.pct>=70?"pill-teal":b.pct>=50?"pill-amber":"pill-rose"}">${b.pct>=70?"On Track":b.pct>=50?"Moderate":"Needs Attention"}</span></td>
      </tr>`).join("")}
    </tbody>
  </table>

  <div class="footer">
    <div>SmartCampus Placement Management System — Confidential</div>
    <div>${settings.officerName} · ${settings.officerDept} · ${now}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank");
  if (win) {
    setTimeout(() => { win.print(); }, 800);
  } else {
    const a = document.createElement("a");
    a.href = url; a.download = `SmartCampus_PlacementReport_${Date.now()}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* CSV export */
function exportCSV(students) {
  const header = "Name,Branch,CGPA,PRI,Skills,Interviews,Company,Package,Status\n";
  const rows = students.map(s =>
    `"${s.name}","${s.branch}",${s.cgpa},${s.pri},"${s.skills.join("/")}",${s.interviews},"${s.company}","${s.pkg}","${s.status}"`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `PlacementData_${Date.now()}.csv`;
  a.click();
}

/* Excel-like TSV export */
function exportExcel(students) {
  const header = "Name\tBranch\tCGPA\tPRI\tSkills\tInterviews\tCompany\tPackage\tStatus\n";
  const rows = students.map(s =>
    `${s.name}\t${s.branch}\t${s.cgpa}\t${s.pri}\t${s.skills.join("/")}\t${s.interviews}\t${s.company}\t${s.pkg}\t${s.status}`
  ).join("\n");
  const blob = new Blob(["\ufeff" + header + rows], { type: "application/vnd.ms-excel" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `PlacementData_${Date.now()}.xls`;
  a.click();
}

/* ════════════════════════════════════════════
   INITIAL DATA
════════════════════════════════════════════ */
const initialDrives = [
  { id:1, logo:"A", name:"Amazon",  role:"SDE-1 · Full Time",    pkg:"26 LPA",  date:"Mar 15", applied:31, eligible:48,  pct:65,  color:"var(--indigo-l)", status:"Upcoming"  },
  { id:2, logo:"T", name:"TCS",     role:"System Engineer",       pkg:"7 LPA",   date:"Mar 18", applied:98, eligible:120, pct:82,  color:"var(--amber)",    status:"Upcoming"  },
  { id:3, logo:"Z", name:"Zoho",    role:"Software Developer",    pkg:"12 LPA",  date:"Mar 22", applied:52, eligible:65,  pct:80,  color:"var(--teal)",     status:"Upcoming"  },
  { id:4, logo:"I", name:"Infosys", role:"Systems Analyst",       pkg:"6.5 LPA", date:"Mar 08", applied:84, eligible:110, pct:100, color:"var(--teal)",     status:"Completed" },
  { id:5, logo:"G", name:"Google",  role:"SWE · L3",              pkg:"32 LPA",  date:"Feb 28", applied:9,  eligible:12,  pct:100, color:"var(--teal)",     status:"Completed" },
];

const initialStudents = [
  { name:"Arjun Sharma",  init:"AS", branch:"CSE", cgpa:9.1, pri:87, skills:["React","Python","DSA"],   interviews:3, company:"Google",    pkg:"32 LPA", status:"Placed"     },
  { name:"Priya Nair",    init:"PN", branch:"CSE", cgpa:8.7, pri:79, skills:["Java","Spring","SQL"],    interviews:5, company:"Infosys",   pkg:"—",      status:"In Process"  },
  { name:"Rohan Mehta",   init:"RM", branch:"ECE", cgpa:7.9, pri:61, skills:["C++","Embedded"],         interviews:1, company:"—",         pkg:"—",      status:"Applied"     },
  { name:"Sneha Reddy",   init:"SR", branch:"CSE", cgpa:9.4, pri:93, skills:["ML","Python","TF"],       interviews:2, company:"Microsoft", pkg:"28 LPA", status:"Placed"     },
  { name:"Karthik V",     init:"KV", branch:"IT",  cgpa:8.2, pri:72, skills:["Node.js","MongoDB"],      interviews:4, company:"Wipro",     pkg:"—",      status:"In Process"  },
  { name:"Divya Menon",   init:"DM", branch:"CSE", cgpa:7.1, pri:55, skills:["HTML","CSS"],             interviews:0, company:"—",         pkg:"—",      status:"Not Ready"   },
  { name:"Aditya Patel",  init:"AP", branch:"MECH",cgpa:8.0, pri:68, skills:["AutoCAD","MATLAB"],       interviews:2, company:"L&T",       pkg:"—",      status:"Applied"     },
  { name:"Lakshmi S",     init:"LS", branch:"CSE", cgpa:8.9, pri:84, skills:["Flutter","Firebase"],     interviews:3, company:"Swiggy",    pkg:"22 LPA", status:"Placed"     },
];

const initialTasks = [
  { id:1, txt:"Update Amazon drive eligibility list",  sub:"CS Dept · 48 students",  due:"Today",    dueCls:"due-today", done:false },
  { id:2, txt:"Send offer letter reminders — Infosys", sub:"22 students pending",     due:"Today",    dueCls:"due-today", done:false },
  { id:3, txt:"Review 14 student resumes",             sub:"Pre-Amazon drive",        due:"Tomorrow", dueCls:"due-soon",  done:false },
  { id:4, txt:"Upload Zoho JD & eligibility criteria", sub:"Mar 22 Drive",            due:"2 days",   dueCls:"due-soon",  done:false },
  { id:5, txt:"Generate Q4 Placement Analytics Report",sub:"All departments",         due:"5 days",   dueCls:"due-ok",    done:false },
];

const initialNotifications = [
  { id:1, icon:"🏢", title:"Amazon Drive",      msg:"31 students have applied for the SDE-1 role.",      time:"2m ago",  unread:true  },
  { id:2, icon:"⭐", title:"Placement Milestone",msg:"214 students placed — 68% rate achieved!",          time:"1h ago",  unread:true  },
  { id:3, icon:"📋", title:"Resume Reviews Due", msg:"14 student resumes pending review before Mar 15.",  time:"3h ago",  unread:true  },
  { id:4, icon:"📢", title:"Zoho JD Uploaded",  msg:"Job description and criteria uploaded by Zoho HR.", time:"Yesterday",unread:false },
  { id:5, icon:"✅", title:"Infosys Drive Done", msg:"84 students appeared, offers sent to 22.",          time:"2d ago",  unread:false },
];

const BRANCHES   = ["CSE","IT","ECE","EEE","MECH","CIVIL","BCA","MCA"];
const STATUSES_D = ["Upcoming","Ongoing","Completed","Cancelled"];
const DRIVE_TYPES= ["Full Time","Internship","Internship + PPO","Part Time","Contract"];

const statusMap = {
  "Placed":     "badge-teal",  "In Process": "badge-indigo",
  "Applied":    "badge-amber", "Not Ready":  "badge-rose",
  "Upcoming":   "badge-indigo","Ongoing":    "badge-teal",
  "Completed":  "badge-teal",  "Cancelled":  "badge-rose",
};

const priColor  = s => s>=85?"var(--teal)":s>=70?"var(--indigo-ll)":s>=55?"var(--amber)":"var(--rose)";
const cgpaColor = c => c>=9?"var(--teal)":c>=8?"var(--indigo-ll)":"var(--amber)";
const pkgColor  = p => { const n=parseFloat(p)||0; return n>=20?"var(--teal)":n>=10?"var(--indigo-ll)":"var(--amber)"; };
const driveBarColor = s => s==="Completed"?"var(--teal)":s==="Upcoming"?"var(--indigo-l)":s==="Ongoing"?"var(--amber)":"var(--rose)";

/* ════════════════════════════════════════════
   MICRO COMPONENTS
════════════════════════════════════════════ */
const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot"/>}{children}</span>
);

/* ════════════════════════════════════════════
   ICONS
════════════════════════════════════════════ */
const XIco     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const TrashIco = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const ErrIco   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const stepIcos = [
  <svg key="a" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  <svg key="b" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  <svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
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
    <div className="pd-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div onMouseDown={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* ════════════════════════════════════════════
   FORM ATOMS
════════════════════════════════════════════ */
const FInput  = ({ label, name, value, onChange, type="text", placeholder, required, hint }) => (
  <div className="pd-field">
    <label className="pd-label">{label}{required && <span className="pd-req"> *</span>}{hint && <span className="pd-hint"> {hint}</span>}</label>
    <input className="pd-input" type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}/>
  </div>
);
const FSelect = ({ label, name, value, onChange, options, required }) => (
  <div className="pd-field">
    <label className="pd-label">{label}{required && <span className="pd-req"> *</span>}</label>
    <select className="pd-input pd-select" name={name} value={value} onChange={onChange}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
const Toggle = ({ checked, onChange }) => (
  <label className="pd-toggle">
    <input type="checkbox" checked={checked} onChange={onChange}/>
    <span className="pd-toggle-track"><span className="pd-toggle-thumb"/></span>
  </label>
);

/* ════════════════════════════════════════════
   BRANCH PICKER
════════════════════════════════════════════ */
function BranchPicker({ selected, onChange }) {
  return (
    <div className="pd-field">
      <label className="pd-label">Eligible Branches <span className="pd-req">*</span></label>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:2 }}>
        {BRANCHES.map(b => (
          <label key={b} className={`pd-radio-btn${selected.includes(b) ? " active" : ""}`}>
            <input type="checkbox" checked={selected.includes(b)}
              onChange={() => onChange(selected.includes(b) ? selected.filter(x => x !== b) : [...selected, b])}
              style={{ display:"none" }}/>
            {b}
          </label>
        ))}
      </div>
      {selected.length === 0 && <div style={{ fontSize:10, color:"var(--rose)", marginTop:4 }}>Select at least one branch</div>}
    </div>
  );
}

/* ════════════════════════════════════════════
   ADD DRIVE MODAL
════════════════════════════════════════════ */
const defaultDriveForm = {
  name:"", type:"Full Time", role:"", branches:[], pkg:"", minCgpa:"",
  eligible:"", date:"", location:"", description:"", status:"Upcoming",
  contactName:"", contactEmail:"",
};

function AddDriveModal({ onClose, onAdd }) {
  const [form, setForm]       = useState(defaultDriveForm);
  const [step, setStep]       = useState(1);
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState(false);

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = "Company name required";
      if (!form.role.trim()) e.role = "Role required";
      if (form.branches.length === 0) e.branches = "Select branches";
    }
    if (step === 2) {
      if (!form.pkg.trim()) e.pkg = "Package required";
      if (!form.date)       e.date = "Drive date required";
      if (!form.eligible)   e.eligible = "Eligible count required";
    }
    return e;
  };

  const next   = () => { const e = validate(); if (Object.keys(e).length) { setErrors(e); return; } setStep(s => s + 1); };
  const prev   = () => { setErrors({}); setStep(s => s - 1); };
  const submit = () => {
    const drive = {
      id: Date.now(), logo: form.name[0]?.toUpperCase() || "?",
      name: form.name, role: `${form.role} · ${form.type}`,
      pkg: form.pkg, date: form.date ? new Date(form.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) : "TBD",
      applied: 0, eligible: parseInt(form.eligible) || 0, pct: 0,
      color: driveBarColor(form.status), status: form.status,
    };
    setSuccess(true);
    setTimeout(() => { onAdd(drive); onClose(); }, 1500);
  };

  const LABELS = ["Company & Role", "Package & Schedule", "Status & Review"];

  return (
    <Overlay onClose={onClose}>
      <div className="pd-panel">
        <div className="pd-header">
          <div className="pd-header-left">
            <div className="pd-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <div><div className="pd-modal-title">Add Placement Drive</div><div className="pd-modal-sub">Register a new company drive</div></div>
          </div>
          <button className="pd-close" onClick={onClose}><XIco/></button>
        </div>

        <div className="pd-steps">
          {LABELS.map((label, i) => {
            const n = i + 1; const done = step > n; const act = step === n;
            return (
              <div key={label} className="pd-step-item">
                <div className={`pd-step-circle${act ? " act" : ""}${done ? " done" : ""}`}>
                  {done ? <CheckIco/> : stepIcos[i]}
                </div>
                <span className={`pd-step-label${act ? " act" : ""}${done ? " done" : ""}`}>{label}</span>
                {i < LABELS.length - 1 && <div className={`pd-step-line${done ? " done" : ""}`}/>}
              </div>
            );
          })}
        </div>

        {success ? (
          <div className="pd-success">
            <div className="pd-success-ring"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div className="pd-success-title">Drive Added!</div>
            <div className="pd-success-sub">{form.name} drive has been scheduled successfully.</div>
          </div>
        ) : (
          <div className="pd-body">
            {step === 1 && (
              <div>
                <p className="pd-section-desc">Enter company and role details for this drive.</p>
                <div className="pd-grid-2">
                  <FInput label="Company Name" name="name" value={form.name} onChange={handle} placeholder="e.g. Amazon" required/>
                  <FSelect label="Drive Type" name="type" value={form.type} onChange={handle} options={DRIVE_TYPES}/>
                </div>
                {errors.name && <div className="pd-err"><ErrIco/>{errors.name}</div>}
                <FInput label="Role / Job Title" name="role" value={form.role} onChange={handle} placeholder="e.g. Software Development Engineer" required/>
                {errors.role && <div className="pd-err"><ErrIco/>{errors.role}</div>}
                <FInput label="Job Location" name="location" value={form.location} onChange={handle} placeholder="e.g. Bangalore / Remote" hint="(optional)"/>
                <BranchPicker selected={form.branches} onChange={v => setForm(f => ({ ...f, branches: v }))}/>
                {errors.branches && <div className="pd-err"><ErrIco/>{errors.branches}</div>}
                {form.name && (
                  <div className="pd-live-preview">
                    <div className="pd-lp-label">Preview</div>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,rgba(91,78,248,.25),rgba(159,122,234,.2))", border:"1.5px solid rgba(91,78,248,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"var(--indigo-ll)", flexShrink:0 }}>
                        {form.name[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{form.name}</div>
                        <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{form.role || "Role TBD"} · {form.type}</div>
                        {form.branches.length > 0 && <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>{form.branches.map(b => <span key={b} className="skill-chip">{b}</span>)}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {step === 2 && (
              <div>
                <p className="pd-section-desc">Set package, eligibility criteria, and schedule.</p>
                <div className="pd-grid-2">
                  <div className="pd-field">
                    <label className="pd-label">Package (CTC) <span className="pd-req">*</span></label>
                    <input className="pd-input" name="pkg" value={form.pkg} onChange={handle} placeholder="e.g. 12 LPA"/>
                    {errors.pkg && <div style={{ fontSize:10, color:"var(--rose)", marginTop:3 }}>{errors.pkg}</div>}
                  </div>
                  <FInput label="Min CGPA" name="minCgpa" value={form.minCgpa} onChange={handle} placeholder="e.g. 7.5" hint="(optional)"/>
                </div>
                <div className="pd-grid-2">
                  <div className="pd-field">
                    <label className="pd-label">Drive Date <span className="pd-req">*</span></label>
                    <input className="pd-input" type="date" name="date" value={form.date} onChange={handle}/>
                    {errors.date && <div style={{ fontSize:10, color:"var(--rose)", marginTop:3 }}>{errors.date}</div>}
                  </div>
                  <div className="pd-field">
                    <label className="pd-label">Eligible Students <span className="pd-req">*</span></label>
                    <input className="pd-input" type="number" name="eligible" value={form.eligible} onChange={handle} placeholder="e.g. 64" min="1"/>
                    {errors.eligible && <div style={{ fontSize:10, color:"var(--rose)", marginTop:3 }}>{errors.eligible}</div>}
                  </div>
                </div>
                <div className="pd-field">
                  <label className="pd-label">Drive Description <span className="pd-hint">(optional)</span></label>
                  <textarea className="pd-input" name="description" value={form.description} onChange={handle} placeholder="Roles, responsibilities, requirements…" rows={3} style={{ resize:"vertical", lineHeight:1.5 }}/>
                </div>
                {(form.pkg || form.eligible) && (
                  <div className="pd-live-preview">
                    <div className="pd-lp-label">Drive Preview</div>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      {form.pkg && <div className="pd-lp-stat" style={{ borderColor: pkgColor(form.pkg) }}><div style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:pkgColor(form.pkg), lineHeight:1 }}>{form.pkg}</div><div style={{ fontSize:9, color:"var(--text3)", marginTop:3 }}>Package</div></div>}
                      {form.eligible && <div className="pd-lp-stat" style={{ borderColor:"var(--indigo-ll)" }}><div style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:"var(--indigo-ll)", lineHeight:1 }}>{form.eligible}</div><div style={{ fontSize:9, color:"var(--text3)", marginTop:3 }}>Eligible</div></div>}
                      {form.minCgpa && <div className="pd-lp-stat" style={{ borderColor:"var(--amber)" }}><div style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:"var(--amber)", lineHeight:1 }}>{form.minCgpa}</div><div style={{ fontSize:9, color:"var(--text3)", marginTop:3 }}>Min CGPA</div></div>}
                    </div>
                  </div>
                )}
              </div>
            )}
            {step === 3 && (
              <div>
                <p className="pd-section-desc">Set drive status and add contact information.</p>
                <FSelect label="Drive Status" name="status" value={form.status} onChange={handle} options={STATUSES_D} required/>
                <div className="pd-grid-2">
                  <FInput label="Contact Name" name="contactName" value={form.contactName} onChange={handle} placeholder="HR / Recruiter name" hint="(optional)"/>
                  <FInput label="Contact Email" name="contactEmail" value={form.contactEmail} onChange={handle} type="email" placeholder="hr@company.com" hint="(optional)"/>
                </div>
                <div className="pd-summary-card">
                  <div className="pd-summary-hd">Drive Summary</div>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:"linear-gradient(135deg,rgba(91,78,248,.25),rgba(159,122,234,.2))", border:"1.5px solid rgba(91,78,248,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"var(--indigo-ll)", flexShrink:0 }}>
                      {form.name[0]?.toUpperCase() || "?"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>{form.name || "Company"}</div>
                      <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{form.role || "Role"} · {form.type}</div>
                      {form.location && <div style={{ fontSize:10, color:"var(--text3)", marginTop:1 }}>📍 {form.location}</div>}
                    </div>
                    <Badge cls={statusMap[form.status]} dot>{form.status}</Badge>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:10 }}>
                    {[
                      { val:form.pkg||"—", color:form.pkg?pkgColor(form.pkg):"var(--text3)", lbl:"Package" },
                      { val:form.eligible||"—", color:"var(--indigo-ll)", lbl:"Eligible" },
                      { val:form.minCgpa||"—", color:"var(--amber)", lbl:"Min CGPA" },
                      { val:form.date||"—", color:"var(--text2)", lbl:"Date" },
                    ].map(m => (
                      <div key={m.lbl} style={{ background:"var(--surface)", borderRadius:8, padding:"8px", textAlign:"center", border:"1px solid var(--border)" }}>
                        <div style={{ fontFamily:"'Fraunces',serif", fontSize:12, color:m.color, lineHeight:1, wordBreak:"break-all" }}>{m.val}</div>
                        <div style={{ fontSize:9, color:"var(--text3)", marginTop:2 }}>{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {form.branches.length > 0 && <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{form.branches.map(b => <span key={b} className="skill-chip">{b}</span>)}</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {!success && (
          <div className="pd-footer">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", gap:5 }}>
                {[1,2,3].map(n => <div key={n} style={{ width:n===step?14:6, height:6, borderRadius:99, background:step>n?"var(--teal)":step===n?"var(--indigo)":"var(--border2)", transition:"all .2s" }}/>)}
              </div>
              <span style={{ fontSize:10, color:"var(--text3)" }}>Step {step} of 3</span>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 18px" }} onClick={step === 1 ? onClose : prev}>{step === 1 ? "Cancel" : "← Back"}</button>
              {step < 3
                ? <button className="btn btn-solid" style={{ fontSize:11, padding:"9px 22px" }} onClick={next}>Continue →</button>
                : <button className="btn btn-teal"  style={{ fontSize:11, padding:"9px 22px" }} onClick={submit}><CheckIco/>Add Drive</button>}
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   EXPORT MODAL  — real download
════════════════════════════════════════════ */
function ExportModal({ onClose, exportData }) {
  const [fmt, setFmt]         = useState("PDF");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const formats = [
    { id:"PDF",   icon:"📄", label:"PDF Report",  sub:"Print-ready report" },
    { id:"CSV",   icon:"📊", label:"CSV Data",     sub:"Spreadsheet-compatible" },
    { id:"Excel", icon:"📋", label:"Excel (XLS)",  sub:"Microsoft Excel format" },
  ];

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      if (fmt === "PDF")   generatePDF(exportData, "Full Placement Report");
      if (fmt === "CSV")   exportCSV(exportData.students);
      if (fmt === "Excel") exportExcel(exportData.students);
      setLoading(false); setDone(true);
      setTimeout(onClose, 1800);
    }, 900);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="pd-panel pd-panel-sm">
        <div className="pd-header">
          <div className="pd-header-left">
            <div className="pd-modal-icon" style={{ background:"rgba(39,201,176,.1)", borderColor:"rgba(39,201,176,.2)", color:"var(--teal)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div><div className="pd-modal-title">Export Report</div><div className="pd-modal-sub">Choose format and download</div></div>
          </div>
          <button className="pd-close" onClick={onClose}><XIco/></button>
        </div>
        <div className="pd-body">
          {done ? (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:"var(--teal)", marginBottom:6 }}>Download Started!</div>
              <div style={{ fontSize:11, color:"var(--text3)" }}>Your {fmt} file is being downloaded.</div>
            </div>
          ) : (
            <>
              <p className="pd-section-desc">Select your preferred export format. The report includes all student data, drives, and placement analytics.</p>
              <div className="export-format-grid">
                {formats.map(f => (
                  <button key={f.id} className={`export-fmt-btn${fmt === f.id ? " active" : ""}`} onClick={() => setFmt(f.id)}>
                    <span className="efmt-icon">{f.icon}</span>
                    <span className="efmt-label">{f.label}</span>
                    <span className="efmt-sub">{f.sub}</span>
                  </button>
                ))}
              </div>
              <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:10, padding:"12px 14px", fontSize:11, color:"var(--text3)", lineHeight:1.6 }}>
                <strong style={{ color:"var(--text2)" }}>Includes:</strong> Student tracker, placement drives, funnel analytics, branch-wise stats, PRI distribution & officer details.
              </div>
            </>
          )}
        </div>
        {!done && (
          <div className="pd-footer">
            <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 18px" }} onClick={onClose}>Cancel</button>
            <button className="btn btn-teal" style={{ fontSize:11, padding:"9px 22px", minWidth:120 }} onClick={handleExport} disabled={loading}>
              {loading ? <><div className="pd-spinner"/>&nbsp;Preparing…</> : <><CheckIco/>&nbsp;Download {fmt}</>}
            </button>
          </div>
        )}
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   NOTIFY STUDENTS MODAL
════════════════════════════════════════════ */
function NotifyModal({ onClose, students, onNotifSent }) {
  const [subject,    setSubject]    = useState("");
  const [message,    setMessage]    = useState("");
  const [selected,   setSelected]   = useState(students.map(s => s.name));
  const [type,       setType]       = useState("General");
  const [loading,    setLoading]    = useState(false);
  const [sent,       setSent]       = useState(false);

  const toggleAll = () => setSelected(selected.length === students.length ? [] : students.map(s => s.name));
  const toggle    = name => setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const send = () => {
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false); setSent(true);
      onNotifSent({ subject, type, count: selected.length });
      setTimeout(onClose, 2000);
    }, 1200);
  };

  const types = ["General","Drive Alert","Resume Deadline","Offer Letter","Interview Call","Congratulations"];

  return (
    <Overlay onClose={onClose}>
      <div className="pd-panel pd-panel-notify">
        <div className="pd-header">
          <div className="pd-header-left">
            <div className="pd-modal-icon" style={{ background:"rgba(39,201,176,.1)", borderColor:"rgba(39,201,176,.2)", color:"var(--teal)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div><div className="pd-modal-title">Notify Students</div><div className="pd-modal-sub">Send bulk notification to selected students</div></div>
          </div>
          <button className="pd-close" onClick={onClose}><XIco/></button>
        </div>
        <div className="pd-body">
          {sent ? (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📨</div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:"var(--teal)", marginBottom:6 }}>Notification Sent!</div>
              <div style={{ fontSize:11, color:"var(--text3)" }}>Sent to {selected.length} students successfully.</div>
            </div>
          ) : (
            <>
              <div className="pd-field">
                <label className="pd-label">Notification Type</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:2 }}>
                  {types.map(t => (
                    <button key={t} className={`pd-radio-btn${type === t ? " active" : ""}`} onClick={() => setType(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <FInput label="Subject" name="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Amazon Drive Reminder — Action Required" required/>
              <div className="pd-field">
                <label className="pd-label">Message <span className="pd-req">*</span></label>
                <textarea className="pd-input" value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Dear student, this is to inform you…" rows={4} style={{ resize:"vertical", lineHeight:1.6 }}/>
              </div>
              <div className="pd-field">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <label className="pd-label">Recipients ({selected.length}/{students.length})</label>
                  <button className="panel-act" onClick={toggleAll}>{selected.length === students.length ? "Deselect all" : "Select all"}</button>
                </div>
                <div className="notify-recipient-list">
                  {students.map(s => (
                    <div key={s.name} className="notify-recipient">
                      <input type="checkbox" checked={selected.includes(s.name)} onChange={() => toggle(s.name)}/>
                      <div className="stu-av" style={{ width:22, height:22, fontSize:8 }}>{s.init}</div>
                      <span style={{ flex:1 }}>{s.name}</span>
                      <Badge cls={statusMap[s.status]}>{s.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        {!sent && (
          <div className="pd-footer">
            <span style={{ fontSize:10, color:"var(--text3)" }}>{selected.length} recipient{selected.length !== 1 ? "s" : ""} selected</span>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 18px" }} onClick={onClose}>Cancel</button>
              <button className="btn btn-teal" style={{ fontSize:11, padding:"9px 22px", minWidth:110 }}
                onClick={send} disabled={loading || !subject.trim() || !message.trim() || selected.length === 0}>
                {loading ? <><div className="pd-spinner"/>&nbsp;Sending…</> : <>📨&nbsp;Send</>}
              </button>
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
const defaultSettings = {
  officerName:"Ms. Kavitha R", officerDept:"Placement Officer",
  academicYear:"2024-25", semester:"Semester 5",
  showStats:true, showFunnel:true, showSchedule:true,
  driveAlerts:true, studentAlerts:true, weeklyEmail:false,
  exportFormat:"PDF",
};

function SettingsModal({ onClose, settings, onSave }) {
  const [tab,   setTab]   = useState("general");
  const [local, setLocal] = useState({ ...settings });
  const toggle = k => setLocal(s => ({ ...s, [k]: !s[k] }));
  const setVal = (k, v) => setLocal(s => ({ ...s, [k]: v }));

  return (
    <Overlay onClose={onClose}>
      <div className="pd-panel pd-panel-sm">
        <div className="pd-header">
          <div className="pd-header-left">
            <div className="pd-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div><div className="pd-modal-title">Dashboard Settings</div><div className="pd-modal-sub">Customize your placement dashboard</div></div>
          </div>
          <button className="pd-close" onClick={onClose}><XIco/></button>
        </div>
        <div className="pd-tabs">
          {["general","display","notifications","data"].map(t => (
            <button key={t} className={`pd-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="pd-body">
          {tab === "general" && (
            <div>
              <div className="pd-section-label">Profile</div>
              <div className="pd-grid-2">
                <FInput label="Officer Name" name="officerName" value={local.officerName} onChange={e => setVal("officerName", e.target.value)} placeholder="Name"/>
                <FInput label="Role" name="officerDept" value={local.officerDept} onChange={e => setVal("officerDept", e.target.value)} placeholder="Role"/>
              </div>
              <div className="pd-section-label" style={{ marginTop:16 }}>Academic</div>
              <div className="pd-grid-2">
                <div className="pd-field">
                  <label className="pd-label">Academic Year</label>
                  <select className="pd-input pd-select" value={local.academicYear} onChange={e => setVal("academicYear", e.target.value)}>
                    {["2022-23","2023-24","2024-25","2025-26"].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className="pd-field">
                  <label className="pd-label">Semester</label>
                  <select className="pd-input pd-select" value={local.semester} onChange={e => setVal("semester", e.target.value)}>
                    {["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
          {tab === "display" && (
            <div>
              <div className="pd-section-label">Widgets</div>
              {[
                { k:"showStats",    l:"Show Stat Cards",       d:"Summary numbers at top of page" },
                { k:"showFunnel",   l:"Show Placement Funnel", d:"Funnel and branch breakdown" },
                { k:"showSchedule", l:"Show Today's Schedule", d:"Daily schedule in bottom row" },
              ].map(r => (
                <div key={r.k} className="pd-row">
                  <div><div className="pd-row-label">{r.l}</div><div className="pd-row-desc">{r.d}</div></div>
                  <Toggle checked={local[r.k]} onChange={() => toggle(r.k)}/>
                </div>
              ))}
            </div>
          )}
          {tab === "notifications" && (
            <div>
              <div className="pd-section-label">Alerts</div>
              {[
                { k:"driveAlerts",   l:"Drive Alerts",    d:"When new drives are added or updated" },
                { k:"studentAlerts", l:"Student Alerts",  d:"Student placement status changes" },
                { k:"weeklyEmail",   l:"Weekly Digest",   d:"Summary email every Monday" },
              ].map(r => (
                <div key={r.k} className="pd-row">
                  <div><div className="pd-row-label">{r.l}</div><div className="pd-row-desc">{r.d}</div></div>
                  <Toggle checked={local[r.k]} onChange={() => toggle(r.k)}/>
                </div>
              ))}
            </div>
          )}
          {tab === "data" && (
            <div>
              <div className="pd-section-label">Export</div>
              <div className="pd-row">
                <div><div className="pd-row-label">Default Export Format</div><div className="pd-row-desc">Format for reports</div></div>
                <select className="pd-select-sm" value={local.exportFormat} onChange={e => setVal("exportFormat", e.target.value)}>
                  {["PDF","CSV","Excel"].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="pd-footer">
          <span style={{ fontSize:11, color:"var(--text3)" }}>Changes saved on confirm</span>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 18px" }} onClick={onClose}>Cancel</button>
            <button className="btn btn-teal"  style={{ fontSize:11, padding:"9px 22px" }} onClick={() => { onSave(local); onClose(); }}><CheckIco/>Save</button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   NOTIFICATIONS PANEL
════════════════════════════════════════════ */
function NotificationsPanel({ items, onClose, onClearAll }) {
  return (
    <Overlay onClose={onClose}>
      <div className="pd-panel pd-panel-notif">
        <div className="pd-header">
          <div className="pd-header-left">
            <div className="pd-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div><div className="pd-modal-title">Notifications</div><div className="pd-modal-sub">{items.filter(n => n.unread).length} unread</div></div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button className="btn btn-ghost" style={{ fontSize:10, padding:"5px 12px" }} onClick={onClearAll}>Mark all read</button>
            <button className="pd-close" onClick={onClose}><XIco/></button>
          </div>
        </div>
        <div className="pd-body" style={{ padding:"10px 14px" }}>
          {items.map(n => (
            <div key={n.id} className="pd-notif-item" style={{ background:n.unread ? "rgba(91,78,248,.04)" : undefined }}>
              <div className="pd-notif-icon">{n.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{n.title}</span>
                  {n.unread && <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--indigo)", flexShrink:0, display:"inline-block" }}/>}
                </div>
                <div style={{ fontSize:11, color:"var(--text3)", lineHeight:1.4 }}>{n.msg}</div>
                <div style={{ fontSize:9, color:"var(--text3)", marginTop:4 }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   QUICK ACTIONS PANEL
════════════════════════════════════════════ */
function QuickActionsPanel({ onClose, onAddDrive, onNotify, onExport }) {
  const actions = [
    { icon:"🏢", label:"Add Drive",        sub:"Schedule a new placement drive",   color:"var(--indigo-ll)", action: () => { onClose(); onAddDrive(); } },
    { icon:"📢", label:"Notify Students",  sub:"Send bulk notification",           color:"var(--teal)",      action: () => { onClose(); onNotify(); } },
    { icon:"📄", label:"Export Report",    sub:"Download placement analytics",     color:"var(--amber)",     action: () => { onClose(); onExport(); } },
    { icon:"👤", label:"View Profile",     sub:"Officer profile & activity",       color:"var(--violet)",    action: () => { onClose(); window.location.hash = "#/placementdashboard/profile"; } },
    { icon:"📊", label:"Analytics",        sub:"Open the analytics dashboard",     color:"var(--indigo-l)",  action: () => onClose() },
    { icon:"📋", label:"Resume Reviews",   sub:"Open pending resume review queue", color:"var(--rose)",      action: () => onClose() },
  ];
  return (
    <Overlay onClose={onClose}>
      <div className="pd-panel pd-panel-sm">
        <div className="pd-header">
          <div className="pd-header-left">
            <div className="pd-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div><div className="pd-modal-title">Quick Actions</div><div className="pd-modal-sub">Common placement tasks</div></div>
          </div>
          <button className="pd-close" onClick={onClose}><XIco/></button>
        </div>
        <div className="pd-body" style={{ padding:"14px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {actions.map(a => (
              <button key={a.label} className="pd-qa-btn" onClick={a.action}>
                <div className="pd-qa-icon">{a.icon}</div>
                <div className="pd-qa-label" style={{ color: a.color }}>{a.label}</div>
                <div className="pd-qa-sub">{a.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   DELETE DRIVE CONFIRM
════════════════════════════════════════════ */
function DeleteDriveConfirm({ drive, onConfirm, onCancel }) {
  return (
    <Overlay onClose={onCancel}>
      <div className="pd-panel pd-panel-delete">
        <div style={{ width:50, height:50, borderRadius:"50%", background:"rgba(240,83,106,.1)", border:"1px solid rgba(240,83,106,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--rose)", margin:"28px auto 16px" }}>
          <TrashIco/>
        </div>
        <div style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:"var(--text)", textAlign:"center", marginBottom:8 }}>Remove Drive?</div>
        <div style={{ fontSize:12, color:"var(--text3)", textAlign:"center", lineHeight:1.6, marginBottom:22, padding:"0 20px" }}>
          This will remove the <strong style={{ color:"var(--text)" }}>{drive.name}</strong> placement drive permanently.
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", paddingBottom:28 }}>
          <button className="btn btn-ghost" style={{ fontSize:11, padding:"9px 20px" }} onClick={onCancel}>Cancel</button>
          <button className="btn btn-rose"  style={{ fontSize:11, padding:"9px 20px" }} onClick={onConfirm}><TrashIco/>&nbsp;Yes, Remove</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   TOAST
════════════════════════════════════════════ */
function Toast({ icon, title, sub, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className="pd-export-toast">
      <div style={{ fontSize:20 }}>{icon}</div>
      <div>
        <div style={{ fontSize:12, fontWeight:700, color:"var(--text)" }}>{title}</div>
        <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{sub}</div>
      </div>
      <button onClick={onDone} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"none", marginLeft:4, fontSize:16 }}>×</button>
    </div>
  );
}

/* ════════════════════════════════════════════
   SIDEBAR NAV LINK
════════════════════════════════════════════ */
function SbLink({ active, badge, badgeCls, icon, children, to, onClick }) {
  return (
    <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`} onClick={onClick}>
      {icon}{children}
      {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
    </Link>
  );
}

/* ════════════════════════════════════════════
   PANEL WRAPPER
════════════════════════════════════════════ */
const Panel = ({ title, subtitle, action, children, style, bodyStyle }) => (
  <div className="panel" style={style}>
    <div className="panel-hd">
      <div className="panel-ttl">{title}{subtitle && <span>{subtitle}</span>}</div>
      {action}
    </div>
    <div className="panel-body" style={bodyStyle}>{children}</div>
  </div>
);

/* ════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════ */
export default function PlacementDashboard() {
  const navigate = useNavigate();

  const [drives,        setDrives]       = useState(initialDrives);
  const [students]                       = useState(initialStudents);
  const [tasks,         setTasks]        = useState(initialTasks);
  const [filter,        setFilter]       = useState("All");
  const [search,        setSearch]       = useState("");
  const [notifs,        setNotifs]       = useState(initialNotifications);
  const [settings,      setSettings]     = useState(defaultSettings);

  const [showAddDrive,  setShowAddDrive] = useState(false);
  const [showSettings,  setShowSettings] = useState(false);
  const [showNotif,     setShowNotif]    = useState(false);
  const [showQuickAct,  setShowQuickAct] = useState(false);
  const [showExport,    setShowExport]   = useState(false);
  const [showNotify,    setShowNotify]   = useState(false);
  const [deleteTarget,  setDeleteTarget] = useState(null);
  const [toast,         setToast]        = useState(null);

  /* ── CURSOR ── */
  const curRef = useRef(null), ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0), rx = useRef(0), ry = useRef(0);

  useEffect(() => {
    const onMove = e => {
      mx.current = e.clientX; my.current = e.clientY;
      if (curRef.current) { curRef.current.style.left = e.clientX + "px"; curRef.current.style.top = e.clientY + "px"; }
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
      if (ringRef.current) { ringRef.current.style.left = rx.current + "px"; ringRef.current.style.top = ry.current + "px"; }
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

  /* ── BODY SCROLL LOCK ── */
  const anyModal = showAddDrive || showSettings || showNotif || showQuickAct || showExport || showNotify || !!deleteTarget;
  useEffect(() => { document.body.style.overflow = anyModal ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [anyModal]);

  /* ── COMPUTED ── */
  const unreadCount    = notifs.filter(n => n.unread).length;
  const upcomingDrives = drives.filter(d => d.status === "Upcoming").length;
  const placedStudents = students.filter(s => s.status === "Placed").length;
  const placementRate  = Math.round(placedStudents / students.length * 100);
  const pendingTasks   = tasks.filter(t => !t.done).length;

  const filteredStudents = students.filter(s => {
    const mf = filter === "All" || s.status === filter;
    const mq = s.name.toLowerCase().includes(search.toLowerCase()) || s.branch.toLowerCase().includes(search.toLowerCase());
    return mf && mq;
  });

  const exportData = { students, drives, settings, placementRate, placedStudents };

  /* ── HANDLERS ── */
  const handleAddDrive = d => {
    setDrives(prev => [d, ...prev]);
    setNotifs(prev => [{ id: Date.now(), icon:"🏢", title:`Drive Added: ${d.name}`, msg:`${d.name} drive scheduled for ${d.date}.`, time:"Just now", unread:true }, ...prev]);
    setToast({ icon:"🏢", title:"Drive Added!", sub:`${d.name} has been added to the schedule.` });
  };

  const handleDeleteDrive = () => {
    const name = deleteTarget.name;
    setDrives(prev => prev.filter(d => d.id !== deleteTarget.id));
    setDeleteTarget(null);
    setToast({ icon:"🗑️", title:"Drive Removed", sub:`${name} has been removed.` });
  };

  const handleClearNotifs = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));

  const handleToggleTask = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const handleNotifSent = ({ subject, type, count }) => {
    setNotifs(prev => [{ id: Date.now(), icon:"📢", title:`Notification Sent: ${type}`, msg:`"${subject}" sent to ${count} students.`, time:"Just now", unread:true }, ...prev]);
    setToast({ icon:"📨", title:"Notification Sent!", sub:`Sent to ${count} students.` });
  };

  const handleSignOut = () => {
    if (window.confirm("Sign out of SmartCampus?")) {
      // clear stored token & user then redirect to login
      clearAuth();
      setToast({ icon:"👋", title:"Signed Out", sub:"You have been signed out successfully." });
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    }
  };

  /* ── ICON SVGS ── */
  const GridIco   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
  const BarIco    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  const UserIco   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  const BriefIco  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
  const FileIco   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
  const StarIco   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
  const BoxIco    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
  const ZapIco    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  const LogoutIco = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  const CalIco    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  const CheckListIco = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
  const FilterIco = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
  const BellIco   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
  const GearIco   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
  const SearchIco = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:"var(--text3)", flexShrink:0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

  return (
    <>
      {/* CURSOR */}
      <div className="sc-cursor"      ref={curRef}  style={{ zIndex:99999 }}/>
      <div className="sc-cursor-ring" ref={ringRef} style={{ zIndex:99999 }}/>
      <div className="sc-noise"/>

      {/* MODALS */}
      {showAddDrive && <AddDriveModal       onClose={() => setShowAddDrive(false)} onAdd={handleAddDrive}/>}
      {showSettings && <SettingsModal       onClose={() => setShowSettings(false)} settings={settings} onSave={setSettings}/>}
      {showNotif    && <NotificationsPanel  onClose={() => setShowNotif(false)}    items={notifs} onClearAll={handleClearNotifs}/>}
      {showQuickAct && <QuickActionsPanel   onClose={() => setShowQuickAct(false)} onAddDrive={() => setShowAddDrive(true)} onNotify={() => setShowNotify(true)} onExport={() => setShowExport(true)}/>}
      {showExport   && <ExportModal         onClose={() => setShowExport(false)}   exportData={exportData}/>}
      {showNotify   && <NotifyModal         onClose={() => setShowNotify(false)}   students={students} onNotifSent={handleNotifSent}/>}
      {deleteTarget && <DeleteDriveConfirm  drive={deleteTarget} onConfirm={handleDeleteDrive} onCancel={() => setDeleteTarget(null)}/>}
      {toast        && <Toast icon={toast.icon} title={toast.title} sub={toast.sub} onDone={() => setToast(null)}/>}

      <div className="app">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-top">
            <Link to="/placementdashboard" className="sb-brand">
              <div className="sb-mark">SC</div>
              <span className="sb-name">SmartCampus</span>
            </Link>
          </div>

          {/* clickable profile area */}
          <Link to="/placementdashboard/placementProfile" className="sb-user" style={{ textDecoration:"none" }}>
            <div className="sb-avatar">{settings.officerName.trim().split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
            <div>
              <div className="sb-uname">{settings.officerName}</div>
              <div className="sb-urole">{settings.officerDept}</div>
            </div>
          </Link>

          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink active to="/placementdashboard" icon={<GridIco/>}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/placementAnalytics" badge="New" icon={<BarIco/>}>Analytics</SbLink>

            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students"        badge="316" badgeCls="teal"  icon={<UserIco/>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies"       badge="8"   badgeCls="amber" icon={<BriefIco/>}>Companies</SbLink>
            <SbLink to="/placementdashboard/drives"          badge={String(upcomingDrives)} badgeCls="rose" icon={<FileIco/>}>Drives</SbLink>
            <SbLink to="/placementdashboard/offers-placed"   icon={<StarIco/>}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships"     icon={<BoxIco/>}>Internships</SbLink>

            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/ai-assistant"    icon={<ZapIco/>}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports"         icon={<FileIco/>}>Reports</SbLink>

            <div className="sb-sec-label">Account</div>
            <SbLink to="/placementdashboard/placementProfile" icon={<UserIco/>}>My Profile</SbLink>
          </nav>

          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">{placementRate}%</div>
              <div className="sb-pri-sub">AY {settings.academicYear} · {settings.semester}</div>
              <div className="sb-pri-bar"><div className="sb-pri-fill" style={{ width:`${placementRate}%` }}/></div>
            </div>
            <button className="sb-logout" onClick={handleSignOut}>
              <LogoutIco/>Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <header className="topbar">
            <span className="tb-page">Placement Dashboard</span>
            <div className="tb-sep"/>
            <div className="tb-search">
              <SearchIco/>
              <input type="text" placeholder="Search students, companies, drives…" value={search} onChange={e => setSearch(e.target.value)} style={{ cursor:"none" }}/>
            </div>
            <div className="tb-right">
              <span className="tb-date">Thu, 12 Mar</span>
              <button className="tb-icon-btn" onClick={() => setShowNotif(true)} title="Notifications">
                <BellIco/>
                {unreadCount > 0 && <span className="notif-dot"/>}
              </button>
              <button className="tb-icon-btn" onClick={() => setShowSettings(true)} title="Settings"><GearIco/></button>
              <Link to="/placementdashboard/placementProfile" className="tb-icon-btn" title="Profile">
                <div style={{ width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,rgba(39,201,176,.4),rgba(91,78,248,.3))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"var(--teal)" }}>
                  {settings.officerName.trim().split(" ").map(w => w[0]).join("").slice(0,2)}
                </div>
              </Link>
              <button className="btn btn-solid" style={{ fontSize:10, padding:"8px 14px" }} onClick={() => setShowQuickAct(true)}>
                <ZapIco/>Quick Actions
              </button>
            </div>
          </header>

          <div className="content">
            {/* GREETING */}
            <div className="greet-row">
              <div className="greet-tag">
                <div className="greet-pip"/>
                <span className="greet-pip-txt">AY {settings.academicYear} · {settings.semester}</span>
              </div>
              <h1 className="greet-title">Good morning, <em>{settings.officerName.split(" ").slice(0,2).join(" ")}</em></h1>
              <p className="greet-sub">
                You have <strong>{upcomingDrives} drives</strong> scheduled and{" "}
                <span className="rose">{students.filter(s => s.status === "Not Ready").length} students</span> need placement readiness attention.
              </p>
              <div className="greet-actions">
                <button className="btn btn-solid" onClick={() => setShowAddDrive(true)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Drive
                </button>
                <button className="btn btn-teal" onClick={() => setShowNotify(true)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Notify Students
                </button>
                <button className="btn btn-ghost" onClick={() => setShowExport(true)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Report
                </button>
              </div>
            </div>

            {/* STAT CARDS */}
            {settings.showStats && (
              <div className="stat-grid">
                {[
                  { color:"indigo", val:students.length,  label:"Total Students",  delta:"▲ +12 this semester", deltaType:"up",  icon:<UserIco/> },
                  { color:"teal",   val:placedStudents,    label:"Placed Students", delta:`▲ ${placementRate}% rate`, deltaType:"up", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
                  { color:"amber",  val:72,                label:"Avg PRI Score",   delta:"Target: 85 for excellent", deltaType:"neu", icon:<BarIco/> },
                  { color:"violet", val:"21.4L",           label:"Avg Package",     delta:"▲ +3.2L vs last year", deltaType:"up",  icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
                ].map(s => (
                  <div key={s.label} className={`stat-card sc-${s.color}`}>
                    <div className="stat-ic">{s.icon}</div>
                    <div className="stat-val" style={s.color !== "indigo" ? { color:`var(--${s.color})` } : {}}>{s.val}</div>
                    <div className="stat-lbl">{s.label}</div>
                    <span className={`stat-delta delta-${s.deltaType}`}>{s.delta}</span>
                  </div>
                ))}
              </div>
            )}

            {/* PLACEMENT DRIVES */}
            <Panel
              style={{ animationDelay:".25s" }}
              title={<><BriefIco/>Placement Drives</>}
              subtitle={`${drives.filter(d => d.status === "Upcoming" || d.status === "Ongoing").length} upcoming · ${drives.filter(d => d.status === "Completed").length} completed`}
              action={<Link to="/placementdashboard/drives" className="panel-act">Manage all →</Link>}
            >
              <div className="drive-grid">
                {drives.map(d => (
                  <div key={d.id} className="drive-card" style={{ position:"relative" }}>
                    <button className="pd-drive-del" onClick={() => setDeleteTarget(d)} title="Remove drive"><TrashIco/></button>
                    <div className="dc-top">
                      <div className="dc-logo">{d.logo}</div>
                      <Badge cls={statusMap[d.status]} dot>{d.status}</Badge>
                    </div>
                    <div className="drive-name">{d.name}</div>
                    <div className="drive-role">{d.role}</div>
                    <div className="drive-pkg">{d.pkg}</div>
                    <div className="drive-meta">{d.date} · {d.applied}/{d.eligible} applied</div>
                    <div className="mini-bar"><div className="mini-fill" style={{ width:`${d.pct}%`, background:d.color }}/></div>
                  </div>
                ))}
                <div className="drive-card" style={{ display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8, borderStyle:"dashed", borderColor:"rgba(91,78,248,.2)", opacity:.7, cursor:"none" }}
                  onClick={() => setShowAddDrive(true)}>
                  <div style={{ width:34, height:34, borderRadius:8, border:"1.5px dashed rgba(91,78,248,.4)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--indigo-ll)", fontSize:18 }}>+</div>
                  <span style={{ fontSize:11, color:"var(--text3)" }}>Add New Drive</span>
                </div>
              </div>
            </Panel>

            {/* FUNNEL + PRI */}
            {settings.showFunnel && (
              <div className="two-col">
                <Panel
                  style={{ animationDelay:".3s" }}
                  title={<><FilterIco/>Placement Funnel</>}
                  subtitle={`AY ${settings.academicYear}`}
                  action={<button className="panel-act" onClick={() => setShowExport(true)}>Export →</button>}
                >
                  <div className="funnel-row">
                    {[
                      { label:"Total Eligible",          count:"316", pct:100, color:"var(--muted)" },
                      { label:"PRI ≥ 70 (Drive Ready)",  count:"237", pct:75,  color:"var(--indigo-l)" },
                      { label:"Applied to Companies",     count:"196", pct:62,  color:"var(--violet)" },
                      { label:"Interview Cleared",        count:"158", pct:50,  color:"var(--amber)" },
                      { label:"Offer Received",           count:String(placedStudents), pct:placementRate, color:"var(--teal)" },
                    ].map(f => (
                      <div key={f.label} className="funnel-item">
                        <div className="fi-header">
                          <span className="fi-label">{f.label}</span>
                          <span className="fi-count" style={{ color:f.color }}>{f.count} <small style={{ fontSize:10, color:"var(--text3)" }}>({f.pct}%)</small></span>
                        </div>
                        <div className="fi-bar"><div className="fi-fill" style={{ width:`${f.pct}%`, background:f.color }}/></div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:20, borderTop:"1px solid var(--border)", paddingTop:16 }}>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text3)", marginBottom:12 }}>Branch-wise Placement</div>
                    {[
                      { branch:"CSE", pct:88, color:"var(--teal)" },
                      { branch:"IT",  pct:76, color:"var(--indigo-l)" },
                      { branch:"ECE", pct:61, color:"var(--amber)" },
                      { branch:"MECH",pct:42, color:"var(--rose)" },
                    ].map(b => (
                      <div key={b.branch} style={{ marginBottom:8 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:11 }}>
                          <span style={{ color:"var(--text2)" }}>{b.branch}</span>
                          <span style={{ color:b.color, fontWeight:600 }}>{b.pct}%</span>
                        </div>
                        <div style={{ height:4, background:"var(--surface3)", borderRadius:2, overflow:"hidden" }}>
                          <div style={{ width:`${b.pct}%`, height:"100%", background:b.color, borderRadius:2 }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel
                  style={{ animationDelay:".35s" }}
                  title={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>PRI Distribution</>}
                  subtitle="Placement Readiness Index"
                >
                  <div className="pri-boxes">
                    {[
                      { val:86,  label:"Excellent",  range:"PRI 85–100", bg:"rgba(39,201,176,.07)",  border:"rgba(39,201,176,.15)",  color:"var(--teal)" },
                      { val:142, label:"Good",        range:"PRI 70–84",  bg:"rgba(91,78,248,.08)",   border:"rgba(91,78,248,.15)",   color:"var(--indigo-ll)" },
                      { val:64,  label:"Fair",        range:"PRI 55–69",  bg:"rgba(244,165,53,.07)",  border:"rgba(244,165,53,.15)",  color:"var(--amber)" },
                      { val:24,  label:"Needs Work",  range:"PRI 0–54",   bg:"rgba(242,68,92,.07)",   border:"rgba(242,68,92,.15)",   color:"var(--rose)" },
                    ].map(p => (
                      <div key={p.label} className="pri-box" style={{ background:p.bg, border:`1px solid ${p.border}` }}>
                        <div className="pb-val" style={{ color:p.color }}>{p.val}</div>
                        <div className="pb-lbl" style={{ color:p.color }}>{p.label}</div>
                        <div className="pb-range">{p.range}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pri-summary">
                    <div className="ps-lbl">Department Avg PRI</div>
                    <div className="ps-val">72 <span style={{ fontSize:12, color:"var(--text3)", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>/100</span></div>
                    <div className="ps-sub">Target 85 for excellent tier · +4 pts vs last sem</div>
                  </div>
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text3)", marginBottom:10 }}>Top Skills in Demand</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {["Data Structures","System Design","Python","React","SQL","Communication","Java","Docker"].map(sk => (
                        <span key={sk} className="skill-chip">{sk}</span>
                      ))}
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {/* STUDENT TABLE */}
            <Panel
              style={{ animationDelay:".4s" }}
              bodyStyle={{ padding:"0 0 4px" }}
              title={<><UserIco/>Student Placement Tracker</>}
              subtitle={`${filteredStudents.length} students shown`}
              action={
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <div className="filter-row">
                    {["All","Placed","In Process","Applied","Not Ready"].map(f => (
                      <button key={f} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                    ))}
                  </div>
                </div>
              }
            >
              <table className="stu-table">
                <thead>
                  <tr>{["Student","Branch","CGPA","PRI Score","Skills","Interviews","Company","Package","Status"].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr key={s.name}>
                      <td><div style={{ display:"flex", alignItems:"center", gap:10 }}><div className="stu-av">{s.init}</div><div className="stu-name">{s.name}</div></div></td>
                      <td style={{ color:"var(--text3)" }}>{s.branch}</td>
                      <td style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:cgpaColor(s.cgpa) }}>{s.cgpa}</td>
                      <td><span style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:priColor(s.pri) }}>{s.pri}</span> <span style={{ fontSize:9, color:"var(--text3)" }}>/100</span></td>
                      <td>{s.skills.map(sk => <span key={sk} className="skill-chip">{sk}</span>)}</td>
                      <td style={{ textAlign:"center", color:"var(--text2)", fontFamily:"'Fraunces',serif", fontSize:14 }}>{s.interviews}</td>
                      <td style={{ color:s.company !== "—" ? "var(--text)" : "var(--text3)", fontWeight:s.company !== "—" ? 600 : 400 }}>{s.company}</td>
                      <td style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:s.pkg !== "—" ? "var(--teal)" : "var(--text3)", fontWeight:600 }}>{s.pkg}</td>
                      <td><Badge cls={statusMap[s.status]} dot>{s.status}</Badge></td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign:"center", padding:"40px", color:"var(--text3)", fontSize:12 }}>No students match the current filter.</td></tr>
                  )}
                </tbody>
              </table>
            </Panel>

            {/* BOTTOM ROW */}
            <div className="three-col">
              {settings.showSchedule && (
                <Panel
                  style={{ animationDelay:".45s" }}
                  title={<><CalIco/>Today's Schedule</>}
                  subtitle="Thu, 12 Mar"
                  action={<button className="panel-act">Full week →</button>}
                >
                  <div className="sched-list">
                    {[
                      { from:"09:00", to:"10:00", name:"Amazon Pre-Placement Talk", room:"Seminar Hall · A Block",  tag:"Drive Prep", tagColor:"var(--indigo-ll)", tagBg:"rgba(91,78,248,.1)",    divColor:"var(--indigo-l)" },
                      { from:"11:00", to:"12:00", name:"Resume Review — CSE Batch", room:"Placement Office",        tag:"Review",     tagColor:"var(--teal)",      tagBg:"rgba(39,201,176,.1)",   divColor:"var(--teal)" },
                      { from:"14:00", to:"15:30", name:"Mock Interviews — Round 2", room:"Lab 3 · B Block",         tag:"Interview",  tagColor:"var(--amber)",     tagBg:"rgba(244,165,53,.1)",   divColor:"var(--amber)" },
                      { from:"16:00", to:"17:00", name:"Industry Connect — Webinar",room:"Online · Google Meet",    tag:"Online",     tagColor:"var(--violet)",    tagBg:"rgba(159,122,234,.1)",  divColor:"var(--violet)" },
                    ].map(s => (
                      <div key={s.from} className="sched-item">
                        <div className="sched-time"><div className="st-from">{s.from}</div><div className="st-to">{s.to}</div></div>
                        <div className="sched-div" style={{ background:s.divColor }}/>
                        <div className="sched-info">
                          <div className="si-name">{s.name}</div>
                          <div className="si-room">{s.room}</div>
                          <span className="si-tag" style={{ background:s.tagBg, color:s.tagColor }}>{s.tag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              <Panel
                style={{ animationDelay:".5s" }}
                title={<><CheckListIco/>Pending Tasks</>}
                subtitle={`${pendingTasks} remaining`}
                action={<button className="panel-act">All tasks →</button>}
              >
                <div className="task-list">
                  {tasks.map(t => (
                    <div key={t.id} className="task-item" style={{ opacity:t.done ? .5 : 1, transition:"opacity .2s" }}>
                      <div
                        className="task-check"
                        style={{ background:t.done ? "var(--teal)" : undefined, borderColor:t.done ? "var(--teal)" : undefined, display:"flex", alignItems:"center", justifyContent:"center", cursor:"none" }}
                        onClick={() => handleToggleTask(t.id)}
                      >
                        {t.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div className="task-txt" style={{ textDecoration:t.done ? "line-through" : undefined }}>{t.txt}</div>
                        <div className="task-course">{t.sub}</div>
                      </div>
                      {!t.done && <span className={`task-due ${t.dueCls}`}>{t.due}</span>}
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel
                style={{ animationDelay:".55s" }}
                title={<><StarIco/>Top Performers</>}
                subtitle="By PRI Score"
                action={<Link to="/placementdashboard/students" className="panel-act">View all →</Link>}
              >
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {[...students].sort((a,b) => b.pri - a.pri).slice(0,4).map((p,i) => (
                    <div key={p.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"var(--surface2)", border:"1px solid var(--border)" }}>
                      <div style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:i===0?"var(--amber)":"var(--text3)", width:16 }}>{i+1}</div>
                      <div className="stu-av">{p.init}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600 }}>{p.name}</div>
                        <div style={{ fontSize:"9.5px", color:"var(--text3)", marginTop:1 }}>{p.branch} · {p.company !== "—" ? p.company : "Seeking"}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, color:priColor(p.pri) }}>{p.pri}</div>
                        {p.pkg !== "—" && <Badge cls="badge-teal">{p.pkg}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}