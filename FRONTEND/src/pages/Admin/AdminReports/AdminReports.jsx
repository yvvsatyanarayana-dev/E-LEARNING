import { useState } from "react";
import "./AdminReports.css";

const DEPT_DATA = [
  { name:"Computer Science", students:428, courses:24, placed:89, gpa:8.2, color:"var(--indigo-l)" },
  { name:"Electronics",       students:312, courses:18, placed:76, gpa:7.9, color:"var(--teal)" },
  { name:"Mechanical",        students:286, courses:16, placed:71, gpa:7.5, color:"var(--amber)" },
  { name:"Information Tech",  students:198, courses:14, placed:84, gpa:8.0, color:"var(--violet)" },
  { name:"Electrical",        students:224, courses:15, placed:68, gpa:7.6, color:"var(--rose)" },
  { name:"Management",        students:142, courses:10, placed:92, gpa:8.4, color:"#38bdf8" },
];

const PLACEMENT_TREND = [
  { month:"Aug", val:42 },{ month:"Sep", val:58 },{ month:"Oct", val:71 },
  { month:"Nov", val:65 },{ month:"Dec", val:88 },{ month:"Jan", val:94 },
  { month:"Feb", val:107 },{ month:"Mar", val:118 },
];

const REPORTS = [
  { name:"Department Performance Q1 2026", type:"PDF", size:"2.4 MB", date:"Mar 10, 2026", badge:"Latest" },
  { name:"Placement Analysis 2025–26",     type:"XLSX", size:"1.8 MB", date:"Mar 5, 2026",  badge:"" },
  { name:"Course Completion Report",        type:"PDF", size:"3.1 MB", date:"Feb 28, 2026", badge:"" },
  { name:"Student Skill Growth Timeline",   type:"PDF", size:"1.2 MB", date:"Feb 20, 2026", badge:"" },
  { name:"Platform Usage Statistics",       type:"CSV", size:"0.5 MB", date:"Feb 15, 2026", badge:"" },
];

const maxPlacement = Math.max(...PLACEMENT_TREND.map(d=>d.val));

export default function AdminReports() {
  const [period, setPeriod] = useState("7D");
  const [tab, setTab] = useState("overview");

  return (
    <div className="rep-root">
      <div className="um-header">
        <div>
          <div className="um-breadcrumb">Platform → Reports</div>
          <h1 className="um-title">Analytics <em>&amp; Reports</em></h1>
          <p className="um-sub">Platform-wide insights — updated in real time</p>
        </div>
        <div className="um-header-actions">
          <div className="rep-period">
            {["7D","30D","90D","1Y"].map(p=>(
              <button key={p} className={`rep-period-btn ${period===p?"active":""}`} onClick={()=>setPeriod(p)}>{p}</button>
            ))}
          </div>
          <button className="btn btn-solid btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export All
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="rep-kpi-row">
        {[
          { label:"Total Students",   val:"1,590", delta:"+8.2%", up:true,  color:"indigo", icon:"👨‍🎓" },
          { label:"Active Courses",   val:"97",    delta:"+3",    up:true,  color:"teal",   icon:"📚" },
          { label:"Placed This Year", val:"483",   delta:"+12.4%",up:true,  color:"amber",  icon:"🏢" },
          { label:"Avg CGPA",         val:"7.92",  delta:"-0.1",  up:false, color:"violet", icon:"🎯" },
          { label:"Platform Uptime",  val:"99.8%", delta:"stable",up:true,  color:"rose",   icon:"⚡" },
        ].map(k=>(
          <div key={k.label} className={`rep-kpi sc-${k.color}`}>
            <div className="rep-kpi-icon">{k.icon}</div>
            <div className="rep-kpi-val">{k.val}</div>
            <div className="rep-kpi-lbl">{k.label}</div>
            <div className={`stat-delta ${k.up?"delta-up":"delta-dn"}`} style={{marginTop:6}}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-row" style={{marginBottom:16}}>
        {["overview","departments","placement","exports"].map(t=>(
          <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* Placement Trend Chart */}
          <div className="panel" style={{marginBottom:16}}>
            <div className="panel-hd">
              <div className="panel-ttl">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Placement Trend
                <span>Students placed per month</span>
              </div>
            </div>
            <div style={{padding:"20px 24px"}}>
              <div className="rep-chart">
                {PLACEMENT_TREND.map((d,i)=>(
                  <div key={d.month} className="rep-bar-wrap">
                    <div className="rep-bar-val">{d.val}</div>
                    <div className="rep-bar" style={{"--h":`${(d.val/maxPlacement)*100}%`,animationDelay:`${i*0.08}s`}}/>
                    <div className="rep-bar-label">{d.month}</div>
                  </div>
                ))}
              </div>
              <div className="rep-chart-foot">
                <div className="rep-chart-legend">
                  <div className="ul-dot" style={{background:"var(--indigo-l)"}}/>
                  Students Placed
                </div>
                <div style={{fontSize:11,color:"var(--text3)"}}>Total: 643 placed this academic year</div>
              </div>
            </div>
          </div>

          {/* Dept Table */}
          <div className="panel">
            <div className="panel-hd">
              <div className="panel-ttl">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                Department Overview
              </div>
            </div>
            <div className="um-table-wrap">
              <table className="user-table">
                <thead><tr><th>Department</th><th>Students</th><th>Courses</th><th>Placement %</th><th>Avg GPA</th><th>Trend</th></tr></thead>
                <tbody>
                  {DEPT_DATA.map(d=>(
                    <tr key={d.name}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:10,height:10,borderRadius:3,background:d.color,flexShrink:0}}/>
                          <span style={{fontWeight:600,fontSize:12}}>{d.name}</span>
                        </div>
                      </td>
                      <td style={{fontSize:12,fontWeight:600}}>{d.students}</td>
                      <td style={{fontSize:12,color:"var(--text2)"}}>{d.courses}</td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{flex:1,height:5,background:"var(--surface3)",borderRadius:3,overflow:"hidden",maxWidth:80}}>
                            <div style={{height:"100%",width:`${d.placed}%`,background:d.color,borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:11,fontWeight:700,color:d.color}}>{d.placed}%</span>
                        </div>
                      </td>
                      <td style={{fontSize:12,fontWeight:700,color:"var(--amber)"}}>{d.gpa}</td>
                      <td><span className="delta-up stat-delta">↑ good</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "departments" && (
        <div className="rep-dept-grid">
          {DEPT_DATA.map(d=>(
            <div key={d.name} className="rep-dept-card">
              <div className="rep-dept-bar-accent" style={{background:d.color}}/>
              <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{d.name}</div>
              <div style={{fontSize:11,color:"var(--text3)",marginBottom:14}}>{d.courses} courses · {d.students} students</div>
              <div className="rep-dept-stats">
                <div className="rep-mini-stat"><div className="rep-mini-val">{d.students}</div><div className="rep-mini-lbl">Students</div></div>
                <div className="rep-mini-stat"><div className="rep-mini-val">{d.gpa}</div><div className="rep-mini-lbl">Avg GPA</div></div>
                <div className="rep-mini-stat"><div className="rep-mini-val" style={{color:d.color}}>{d.placed}%</div><div className="rep-mini-lbl">Placed</div></div>
              </div>
              <div style={{height:4,background:"var(--surface3)",borderRadius:3,overflow:"hidden",marginTop:14}}>
                <div style={{height:"100%",width:`${d.placed}%`,background:d.color,borderRadius:3,transition:"width 1.2s ease"}}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "placement" && (
        <div className="panel">
          <div className="panel-hd"><div className="panel-ttl">Placement Analysis 2025–26</div></div>
          <div style={{padding:"20px 24px"}}>
            <div className="rep-placement-grid">
              {[
                { label:"Total Students Eligible", val:"892", icon:"👨‍🎓" },
                { label:"Placement Drives Conducted", val:"34", icon:"🏢" },
                { label:"Offers Received", val:"643", icon:"📄" },
                { label:"Avg Package (LPA)", val:"₹7.2L", icon:"💰" },
                { label:"Highest Package", val:"₹42L", icon:"🏆" },
                { label:"Companies Visited", val:"128", icon:"🌐" },
              ].map(s=>(
                <div key={s.label} className="rep-pl-card">
                  <div className="rep-pl-icon">{s.icon}</div>
                  <div className="rep-pl-val">{s.val}</div>
                  <div className="rep-pl-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "exports" && (
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">Generated Reports</div>
            <button className="btn btn-solid btn-sm">Generate New Report</button>
          </div>
          <div style={{padding:"8px 0"}}>
            {REPORTS.map((r,i)=>(
              <div key={i} className="rep-export-item">
                <div className={`rep-file-icon ${r.type.toLowerCase()}`}>{r.type}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:2}}>{r.name}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{r.size} · {r.date}</div>
                </div>
                {r.badge && <span className="role-tag role-student">{r.badge}</span>}
                <button className="btn btn-ghost btn-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}