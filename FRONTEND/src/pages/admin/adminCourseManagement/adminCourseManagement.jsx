import React, { useState } from 'react';
import Sidebar from '../adminDashbaord/adminDashboard'; // Sidebar and Topbar are exported from AdminDashboard
// If Sidebar and Topbar are not exported, extract them to a shared component file.

export default function AdminCourseManagement({onBack}){
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminName = "Admin User";
  const handleNavigate = () => {};
  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage={"Course Management"} onNavigate={handleNavigate} adminName={adminName} />
      <main className="main">
        <div style={{padding:'2rem'}}>
          <h2>Admin Course Management</h2>
          {/* Add admin course management UI here */}
        </div>
      </main>
    </div>
  );
}
        <div className="cm-header-left">
          <button className="cm-back" onClick={onBack}><IcoChevL/> Dashboard</button>
          <div>
            <div className="cm-breadcrumb">Admin / Course Management</div>
            <h1 className="cm-title">Course Management</h1>
          </div>
        </div>
        <button className="cm-btn-primary"><IcoPlus/> New Course</button>
      </div>

      {/* KPI STRIP */}
      <div className="cm-kpi-row">
        {[
          {label:"Total Courses",   val:COURSES.length,                                      c:"var(--indigo-ll)", bg:"rgba(91,78,248,.1)"},
          {label:"Active Courses",  val:COURSES.filter(c=>c.status==="active").length,        c:"var(--teal)",      bg:"rgba(39,201,176,.1)"},
          {label:"Draft Courses",   val:COURSES.filter(c=>c.status==="draft").length,         c:"var(--amber)",     bg:"rgba(244,165,53,.1)"},
          {label:"Total Enrolled",  val:totalEnrolled.toLocaleString(),                       c:"var(--violet)",    bg:"rgba(159,122,234,.1)"},
          {label:"Avg Rating",      val:avgRating+"★",                                        c:"var(--amber)",     bg:"rgba(244,165,53,.1)"},
          {label:"Avg Completion",  val:avgCompletion+"%",                                    c:"var(--teal)",      bg:"rgba(39,201,176,.1)"},
        ].map(({label,val,c,bg})=>(
          <div key={label} className="cm-kpi">
            <div className="cm-kpi-val" style={{color:c}}>{val}</div>
            <div className="cm-kpi-lbl">{label}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="cm-toolbar">
        <div className="cm-search">
          <IcoSearch style={{color:"var(--text3)",flexShrink:0}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses by name or code…"/>
        </div>
        <div className="cm-filters">
          <div className="cm-filter-group">
            <IcoFilter style={{color:"var(--text3)"}}/>
            {DEPT_OPTS.map(d=><button key={d} className={`cm-filter-btn ${deptFilter===d?"active":""}`} onClick={()=>setDept(d)}>{d}</button>)}
          </div>
          <div className="cm-filter-group">
            {STATUS_OPTS.map(s=><button key={s} className={`cm-filter-btn ${statFilter===s?"active":""}`} onClick={()=>setStat(s)}>{s==="All"?s:s.charAt(0).toUpperCase()+s.slice(1)}</button>)}
          </div>
        </div>
      </div>

      <div className="cm-layout">
        {/* COURSE TABLE */}
        <div className="cm-table-wrap">
          <div className="cm-table-head">
            <span>Code</span><span>Course Name</span><span>Dept</span><span>Faculty</span>
            <span>Enrolled</span><span>Rating</span><span>Completion</span><span>Status</span><span>Actions</span>
          </div>
          {filtered.map((c,i)=>(
            <div key={c.id} className={`cm-row ${selected?.id===c.id?"selected":""}`} style={{animationDelay:`${i*0.04}s`}} onClick={()=>setSelected(c)}>
              <span className="cm-code">{c.id}</span>
              <span className="cm-name">{c.name}</span>
              <span><div className="cm-dept-chip">{c.dept}</div></span>
              <span className="cm-faculty">{c.faculty}</span>
              <span className="cm-enrolled">{c.enrolled>0?`${c.enrolled}/${c.capacity}`:"—"}</span>
              <span className="cm-rating">{c.rating>0?<><IcoStar style={{color:"var(--amber)"}}/> {c.rating}</>:"—"}</span>
              <span style={{minWidth:100}}>
                {c.completion>0
                  ? <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{flex:1}}><AnimBar pct={c.completion} color="var(--teal)" delay={300+i*40}/></div><span style={{fontSize:10,fontWeight:700,color:"var(--teal)",width:28}}>{c.completion}%</span></div>
                  : <span style={{color:"var(--text3)",fontSize:11}}>—</span>
                }
              </span>
              <span><div className={`cm-status-chip ${c.status}`}>{c.status}</div></span>
              <span className="cm-actions" onClick={e=>e.stopPropagation()}>
                <button className="cm-act-btn"><IcoEye/></button>
                <button className="cm-act-btn"><IcoEdit/></button>
              </span>
            </div>
          ))}
          {filtered.length===0&&<div className="cm-empty">No courses match the filters.</div>}
        </div>

        {/* DETAIL PANEL */}
        {selected&&(
          <div className="cm-detail">
            <div className="cm-detail-hd">
              <div>
                <div className="cm-detail-code">{selected.id}</div>
                <div className="cm-detail-name">{selected.name}</div>
              </div>
              <button className="cm-detail-close" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="cm-detail-body">
              <div className="cm-detail-row"><span>Department</span><div className="cm-dept-chip">{selected.dept}</div></div>
              <div className="cm-detail-row"><span>Faculty</span><strong>{selected.faculty}</strong></div>
              <div className="cm-detail-row"><span>Credits</span><strong>{selected.credits}</strong></div>
              <div className="cm-detail-row"><span>Status</span><div className={`cm-status-chip ${selected.status}`}>{selected.status}</div></div>
              <div className="cm-detail-divider"/>
              <div className="cm-detail-row"><span>Enrolled</span><strong style={{color:"var(--teal)"}}>{selected.enrolled} / {selected.capacity}</strong></div>
              <div className="cm-detail-row"><span>Lectures</span><strong>{selected.lectures || "—"}</strong></div>
              <div className="cm-detail-row"><span>Assignments</span><strong>{selected.assignments || "—"}</strong></div>
              <div className="cm-detail-row"><span>Rating</span><strong style={{color:"var(--amber)"}}>{selected.rating>0?`★ ${selected.rating}`:"—"}</strong></div>
              {selected.completion>0&&<>
                <div className="cm-detail-divider"/>
                <div style={{marginBottom:6}}><span style={{fontSize:10,color:"var(--text3)"}}>Completion Rate</span></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1}}><AnimBar pct={selected.completion} color="var(--teal)" delay={100}/></div>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--teal)"}}>{selected.completion}%</span>
                </div>
                <div style={{height:8}}/>
                <div style={{marginBottom:6}}><span style={{fontSize:10,color:"var(--text3)"}}>Capacity Used</span></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1}}><AnimBar pct={Math.round((selected.enrolled/selected.capacity)*100)} color="var(--indigo-l)" delay={200}/></div>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--indigo-ll)"}}>{Math.round((selected.enrolled/selected.capacity)*100)}%</span>
                </div>
              </>}
              <div className="cm-detail-divider"/>
              <div className="cm-detail-actions">
                <button className="cm-det-btn primary">Edit Course</button>
                <button className="cm-det-btn">View Details</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}