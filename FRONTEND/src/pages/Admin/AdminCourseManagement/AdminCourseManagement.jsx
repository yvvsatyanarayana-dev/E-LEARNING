import { useState } from "react";
import "./AdminCourseManagement.css";

const COURSES = [
  { id:1, code:"CS401", name:"Machine Learning", dept:"CSE", faculty:"Dr. Meena Iyer", students:128, duration:"16w", status:"active", progress:72, type:"Core", rating:4.8, modules:12, icon:"🤖" },
  { id:2, code:"CS302", name:"Data Structures & Algorithms", dept:"CSE", faculty:"Prof. Raj Kumar", students:214, duration:"14w", status:"active", progress:88, type:"Core", rating:4.6, modules:18, icon:"📊" },
  { id:3, code:"EC501", name:"VLSI Design", dept:"ECE", faculty:"Dr. Priya Nair", students:86, duration:"16w", status:"active", progress:45, type:"Core", rating:4.3, modules:10, icon:"⚡" },
  { id:4, code:"CS450", name:"Cloud Computing", dept:"CSE", faculty:"Dr. Meena Iyer", students:96, duration:"12w", status:"active", progress:60, type:"Elective", rating:4.7, modules:9, icon:"☁️" },
  { id:5, code:"ME301", name:"Thermodynamics", dept:"MECH", faculty:"Prof. Arjun Das", students:142, duration:"14w", status:"inactive", progress:100, type:"Core", rating:4.1, modules:15, icon:"🔥" },
  { id:6, code:"IT401", name:"Cyber Security", dept:"IT", faculty:"Dr. Vikram Patel", students:74, duration:"12w", status:"active", progress:30, type:"Elective", rating:4.9, modules:11, icon:"🔐" },
  { id:7, code:"MBA301", name:"Business Analytics", xdept:"MBA", faculty:"Prof. Sneha R", students:62, duration:"10w", status:"draft", progress:0, type:"Core", rating:0, modules:8, icon:"📈" },
  { id:8, code:"EE401", name:"Power Electronics", dept:"EEE", faculty:"Dr. Kiran M", students:98, duration:"16w", status:"active", progress:55, type:"Core", rating:4.4, modules:13, icon:"⚙️" },
];

const STATUS_MAP = { active:"status-active", inactive:"status-inactive", draft:"status-draft" };
const TYPE_COLORS = { Core:"type-core", Elective:"type-elective" };

export default function AdminCourseManagement() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState("all");

  const filtered = COURSES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || c.dept === deptFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchTab = tab === "all" || (tab === "active" && c.status === "active") || (tab === "draft" && c.status === "draft");
    return matchSearch && matchDept && matchStatus && matchTab;
  });

  const totalStudents = COURSES.reduce((a,c)=>a+c.students,0);
  const activeCourses = COURSES.filter(c=>c.status==="active").length;
  const avgRating = (COURSES.filter(c=>c.rating>0).reduce((a,c)=>a+c.rating,0)/COURSES.filter(c=>c.rating>0).length).toFixed(1);

  return (
    <div className="cm-root">
      <div className="cm-header">
        <div>
          <div className="um-breadcrumb">Management → Course Management</div>
          <h1 className="um-title">Course <em>Management</em></h1>
          <p className="um-sub">Create, manage and monitor all academic courses</p>
        </div>
        <div className="um-header-actions">
          <div className="cm-view-toggle">
            <button className={`cm-vbtn ${view==="grid"?"active":""}`} onClick={()=>setView("grid")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button className={`cm-vbtn ${view==="list"?"active":""}`} onClick={()=>setView("list")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
          <button className="btn btn-solid btn-sm" onClick={()=>setShowCreate(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Course
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="cm-stats">
        {[
          { label:"Total Courses", val:COURSES.length, sub:`${activeCourses} active`, color:"indigo" },
          { label:"Total Students", val:totalStudents, sub:"across all courses", color:"teal" },
          { label:"Avg Rating", val:avgRating, sub:"out of 5.0", color:"amber" },
          { label:"Departments", val:6, sub:"offering courses", color:"violet" },
        ].map(s=>(
          <div key={s.label} className={`cm-stat sc-${s.color}`}>
            <div className="cm-stat-val">{s.val}</div>
            <div className="cm-stat-lbl">{s.label}</div>
            <div className="cm-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="panel">
        <div className="panel-hd">
          <div className="tab-row" style={{border:"none",margin:0,padding:0}}>
            {["all","active","draft"].map(t=>(
              <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <div className="filter-search-wrap">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="um-search" placeholder="Search courses..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="filter-select" value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}>
              <option value="all">All Depts</option>
              {["CSE","ECE","MECH","EEE","IT","MBA"].map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {view === "grid" ? (
          <div className="cm-grid">
            {filtered.map((c,i) => (
              <div key={c.id} className="cm-card" style={{animationDelay:`${i*0.05}s`}}>
                <div className="cm-card-top">
                  <div className="cm-card-icon">{c.icon}</div>
                  <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                    <span className={`status-tag ${STATUS_MAP[c.status]}`}><span className="status-dot"/>{c.status}</span>
                    <span className={`role-tag ${TYPE_COLORS[c.type]}`}>{c.type}</span>
                  </div>
                </div>
                <div className="cm-card-code">{c.code} · {c.dept}</div>
                <div className="cm-card-name">{c.name}</div>
                <div className="cm-card-faculty">{c.faculty}</div>
                <div className="cm-card-meta">
                  <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>{c.students}</span>
                  <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{c.duration}</span>
                  <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{c.rating || "—"}</span>
                </div>
                {c.status !== "draft" && (
                  <div className="cm-progress">
                    <div className="cm-prog-top">
                      <span>Progress</span><span>{c.progress}%</span>
                    </div>
                    <div className="cm-prog-bar">
                      <div className="cm-prog-fill" style={{width:`${c.progress}%`,background:c.progress===100?"var(--teal)":c.progress>60?"var(--indigo-l)":"var(--amber)"}}/>
                    </div>
                  </div>
                )}
                <div className="cm-card-actions">
                  <button className="btn btn-ghost btn-sm" style={{flex:1}}>Edit</button>
                  <button className="btn btn-solid btn-sm" style={{flex:1}}>View</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="um-table-wrap">
            <table className="user-table">
              <thead><tr>
                <th>Code</th><th>Course</th><th>Department</th><th>Faculty</th><th>Students</th><th>Status</th><th>Progress</th><th>Rating</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c.id}>
                    <td style={{color:"var(--indigo-ll)",fontWeight:700,fontSize:11}}>{c.code}</td>
                    <td>
                      <div style={{fontWeight:600,fontSize:12}}>{c.name}</div>
                      <div style={{fontSize:10,color:"var(--text3)"}}>{c.modules} modules · {c.duration}</div>
                    </td>
                    <td><span className="role-tag role-faculty" style={{fontSize:9}}>{c.dept}</span></td>
                    <td style={{fontSize:11,color:"var(--text2)"}}>{c.faculty}</td>
                    <td style={{fontSize:12,fontWeight:600}}>{c.students}</td>
                    <td><span className={`status-tag ${STATUS_MAP[c.status]}`}><span className="status-dot"/>{c.status}</span></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,height:4,background:"var(--surface3)",borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${c.progress}%`,background:"var(--indigo-l)",borderRadius:4}}/>
                        </div>
                        <span style={{fontSize:10,color:"var(--text3)",width:28,textAlign:"right"}}>{c.progress}%</span>
                      </div>
                    </td>
                    <td style={{fontSize:12,fontWeight:700,color:"var(--amber)"}}>{c.rating||"—"}</td>
                    <td>
                      <div style={{display:"flex",gap:4}}>
                        <button className="ut-action"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button className="ut-action ut-action-danger"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="um-modal-bg" onClick={()=>setShowCreate(false)}>
          <div className="um-modal" style={{width:500}} onClick={e=>e.stopPropagation()}>
            <div className="um-modal-hd" style={{borderBottom:"1px solid var(--border)"}}>
              <div style={{fontWeight:700,fontSize:15}}>Create New Course</div>
              <button className="um-modal-close" onClick={()=>setShowCreate(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="um-modal-body">
              <div className="um-form-row">
                <div className="um-form-group" style={{flex:1}}><label>Course Code</label><input className="filter-input" style={{width:"100%"}} placeholder="CS401"/></div>
                <div className="um-form-group" style={{flex:2}}><label>Course Name</label><input className="filter-input" style={{width:"100%"}} placeholder="Machine Learning"/></div>
              </div>
              <div className="um-form-row">
                <div className="um-form-group" style={{flex:1}}><label>Department</label>
                  <select className="filter-select" style={{width:"100%"}}><option>CSE</option><option>ECE</option><option>MECH</option><option>EEE</option><option>IT</option><option>MBA</option></select>
                </div>
                <div className="um-form-group" style={{flex:1}}><label>Type</label>
                  <select className="filter-select" style={{width:"100%"}}><option>Core</option><option>Elective</option></select>
                </div>
              </div>
              <div className="um-form-group"><label>Assign Faculty</label><input className="filter-input" style={{width:"100%"}} placeholder="Search faculty..."/></div>
              <div className="um-form-row">
                <div className="um-form-group" style={{flex:1}}><label>Duration</label><input className="filter-input" style={{width:"100%"}} placeholder="16 weeks"/></div>
                <div className="um-form-group" style={{flex:1}}><label>Max Students</label><input className="filter-input" style={{width:"100%"}} placeholder="120"/></div>
              </div>
            </div>
            <div className="um-modal-ft">
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowCreate(false)}>Cancel</button>
              <button className="btn btn-solid btn-sm" onClick={()=>setShowCreate(false)}>Create Course</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}