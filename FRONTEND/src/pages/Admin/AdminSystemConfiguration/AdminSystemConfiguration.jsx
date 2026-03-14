import { useState } from "react";
import "./Department.css";

const DEPARTMENTS = [
  {
    id:1, code:"CSE", name:"Computer Science & Engineering", hod:"Dr. Meena Iyer",
    students:428, faculty:24, courses:24, placed:89, avgGpa:8.2, color:"var(--indigo-l)",
    icon:"💻", established:"1998", status:"active",
    specializations:["AI/ML","Web Dev","Cybersecurity","Data Science"],
  },
  {
    id:2, code:"ECE", name:"Electronics & Communication Eng.", hod:"Prof. Vikram Singh",
    students:312, faculty:18, courses:18, placed:76, avgGpa:7.9, color:"var(--teal)",
    icon:"📡", established:"1998", status:"active",
    specializations:["VLSI","Embedded Systems","Signal Processing"],
  },
  {
    id:3, code:"MECH", name:"Mechanical Engineering", hod:"Dr. Rajan Nair",
    students:286, faculty:20, courses:16, placed:71, avgGpa:7.5, color:"var(--amber)",
    icon:"⚙️", established:"1998", status:"active",
    specializations:["Thermal","Manufacturing","Robotics"],
  },
  {
    id:4, code:"EEE", name:"Electrical & Electronics Eng.", hod:"Dr. Aruna K",
    students:224, faculty:16, courses:15, placed:68, avgGpa:7.6, color:"var(--rose)",
    icon:"⚡", established:"2001", status:"active",
    specializations:["Power Systems","Control Systems"],
  },
  {
    id:5, code:"IT", name:"Information Technology", hod:"Prof. Suresh M",
    students:198, faculty:14, courses:14, placed:84, avgGpa:8.0, color:"var(--violet)",
    icon:"🌐", established:"2003", status:"active",
    specializations:["Cloud","DevOps","Full Stack"],
  },
  {
    id:6, code:"MBA", name:"Business Administration", hod:"Prof. Kavita Sharma",
    students:142, faculty:12, courses:10, placed:92, avgGpa:8.4, color:"#38bdf8",
    icon:"📈", established:"2008", status:"active",
    specializations:["Finance","Marketing","HR","Analytics"],
  },
];

export default function Department() {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const totalStudents = DEPARTMENTS.reduce((a,d)=>a+d.students,0);

  return (
    <div className="dept-root">
      <div className="um-header">
        <div>
          <div className="um-breadcrumb">Management → Departments</div>
          <h1 className="um-title">Department <em>Management</em></h1>
          <p className="um-sub">Manage academic departments, HODs, and institutional structure</p>
        </div>
        <div className="um-header-actions">
          <button className="btn btn-solid btn-sm" onClick={()=>setShowAdd(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Department
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="dept-overview">
        {[
          { label:"Total Departments", val:DEPARTMENTS.length, color:"indigo" },
          { label:"Total Students",    val:totalStudents, color:"teal" },
          { label:"Total Faculty",     val:DEPARTMENTS.reduce((a,d)=>a+d.faculty,0), color:"violet" },
          { label:"Avg Placement",     val:`${Math.round(DEPARTMENTS.reduce((a,d)=>a+d.placed,0)/DEPARTMENTS.length)}%`, color:"amber" },
        ].map(s=>(
          <div key={s.label} className={`dept-ov-card sc-${s.color}`}>
            <div className="dept-ov-val">{s.val}</div>
            <div className="dept-ov-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Department Cards */}
      <div className="dept-cards-grid">
        {DEPARTMENTS.map((dept,i) => (
          <div key={dept.id} className={`dept-card ${selected===dept.id?"dept-card-selected":""}`}
            onClick={()=>setSelected(selected===dept.id?null:dept.id)}
            style={{"--dc":dept.color, animationDelay:`${i*0.06}s`}}>
            <div className="dept-card-accent" style={{background:dept.color}}/>
            <div className="dept-card-top">
              <div className="dept-card-icon">{dept.icon}</div>
              <div style={{flex:1}}>
                <div className="dept-card-code">{dept.code}</div>
                <div className="dept-card-name">{dept.name}</div>
              </div>
              <span className="status-tag status-active"><span className="status-dot"/>active</span>
            </div>
            <div className="dept-card-hod">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              HOD: {dept.hod}
            </div>
            <div className="dept-card-stats">
              <div className="dept-stat-item"><div className="dept-stat-val">{dept.students}</div><div className="dept-stat-lbl">Students</div></div>
              <div className="dept-stat-item"><div className="dept-stat-val">{dept.faculty}</div><div className="dept-stat-lbl">Faculty</div></div>
              <div className="dept-stat-item"><div className="dept-stat-val">{dept.courses}</div><div className="dept-stat-lbl">Courses</div></div>
              <div className="dept-stat-item"><div className="dept-stat-val" style={{color:dept.color}}>{dept.placed}%</div><div className="dept-stat-lbl">Placed</div></div>
            </div>
            <div className="dept-card-bar">
              <div className="dept-bar-fill" style={{width:`${dept.placed}%`,background:dept.color}}/>
            </div>
            {selected===dept.id && (
              <div className="dept-card-expanded">
                <div className="dept-exp-label">Specializations</div>
                <div className="dept-spec-tags">
                  {dept.specializations.map(s=><span key={s} className="dept-spec-tag">{s}</span>)}
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button className="btn btn-ghost btn-sm" style={{flex:1}} onClick={e=>e.stopPropagation()}>Edit</button>
                  <button className="btn btn-solid btn-sm" style={{flex:1}} onClick={e=>e.stopPropagation()}>View Details</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="um-modal-bg" onClick={()=>setShowAdd(false)}>
          <div className="um-modal" style={{width:480}} onClick={e=>e.stopPropagation()}>
            <div className="um-modal-hd" style={{borderBottom:"1px solid var(--border)"}}>
              <div style={{fontWeight:700,fontSize:15}}>Add New Department</div>
              <button className="um-modal-close" onClick={()=>setShowAdd(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="um-modal-body">
              <div className="um-form-row">
                <div className="um-form-group" style={{flex:"0 0 80px"}}><label>Code</label><input className="filter-input" style={{width:"100%"}} placeholder="CSE"/></div>
                <div className="um-form-group" style={{flex:1}}><label>Department Name</label><input className="filter-input" style={{width:"100%"}} placeholder="Computer Science & Eng."/></div>
              </div>
              <div className="um-form-group"><label>Head of Department</label><input className="filter-input" style={{width:"100%"}} placeholder="Search faculty..."/></div>
              <div className="um-form-row">
                <div className="um-form-group" style={{flex:1}}><label>Established</label><input className="filter-input" style={{width:"100%"}} placeholder="2024"/></div>
                <div className="um-form-group" style={{flex:1}}><label>Max Students</label><input className="filter-input" style={{width:"100%"}} placeholder="500"/></div>
              </div>
            </div>
            <div className="um-modal-ft">
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-solid btn-sm" onClick={()=>setShowAdd(false)}>Create Department</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}