// AdminDepartments.jsx — Smart Campus Admin
import { useState, useEffect } from "react";
import "./adminDepartments.css";

const IcoChevL   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoBuilding= (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/><path d="M3 15h6"/><path d="M15 3v18"/><path d="M15 9h6"/><path d="M15 15h6"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoBook    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoEdit    = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoUp      = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;

const DEPTS = [
  {
    code:"CS", name:"Computer Science", hod:"Dr. Srinivasan Rao", founded:2001,
    students:480, faculty:22, courses:38, labs:6,
    avgScore:76, completion:88, attendance:82, placement:91,
    color:"var(--indigo-l)", bg:"rgba(91,78,248,.1)",
    topCourses:["Advanced DBMS","Operating Systems","Data Structures"],
    recentHires:["Dr. Kavitha Mohan","Prof. Ajay Singh"],
    trend:[70,73,72,76,74,77,75,79,78,81,79,82],
  },
  {
    code:"ECE", name:"Electronics & Comm", hod:"Dr. Ramesh Kumar", founded:1998,
    students:360, faculty:18, courses:28, labs:8,
    avgScore:71, completion:82, attendance:78, placement:85,
    color:"var(--teal)", bg:"rgba(39,201,176,.1)",
    topCourses:["Digital Circuits","Embedded Systems","Signals & Systems"],
    recentHires:["Dr. Priya Nair"],
    trend:[64,67,65,69,68,71,69,73,71,74,73,76],
  },
  {
    code:"ME", name:"Mechanical Engg", hod:"Prof. Vikram Patel", founded:1995,
    students:280, faculty:16, courses:22, labs:5,
    avgScore:69, completion:79, attendance:75, placement:78,
    color:"var(--amber)", bg:"rgba(244,165,53,.1)",
    topCourses:["Thermodynamics II","CAD/CAM","Fluid Mechanics"],
    recentHires:["Prof. Suresh Iyer"],
    trend:[62,65,63,67,65,68,67,70,68,71,70,72],
  },
  {
    code:"CE", name:"Civil Engineering", hod:"Prof. Anand Rao", founded:1997,
    students:220, faculty:14, courses:18, labs:4,
    avgScore:67, completion:74, attendance:73, placement:74,
    color:"var(--rose)", bg:"rgba(242,68,92,.1)",
    topCourses:["Structural Analysis","Concrete Technology","Geotechnical Engg"],
    recentHires:[],
    trend:[61,62,60,64,62,65,64,66,65,67,66,68],
  },
  {
    code:"IT", name:"Information Technology", hod:"Dr. Priya Venkat", founded:2005,
    students:140, faculty:10, courses:12, labs:3,
    avgScore:74, completion:85, attendance:80, placement:88,
    color:"var(--violet)", bg:"rgba(159,122,234,.1)",
    topCourses:["Web Technologies","Cloud Computing","Cybersecurity"],
    recentHires:["Dr. Ravi Sharma"],
    trend:[67,69,68,72,70,73,72,75,74,77,76,79],
  },
  {
    code:"DS", name:"Data Science", hod:"Dr. Meera Pillai", founded:2020,
    students:80, faculty:7, courses:6, labs:2,
    avgScore:81, completion:92, attendance:87, placement:94,
    color:"var(--indigo-ll)", bg:"rgba(168,159,255,.1)",
    topCourses:["Machine Learning","Statistical Learning","Python for DS"],
    recentHires:["Prof. Nair Arun","Dr. Sneha Joshi"],
    trend:[74,76,75,78,77,80,79,82,81,84,83,86],
  },
];

function AnimBar({pct,color,delay=400,height=5}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),delay);return()=>clearTimeout(t);},[pct,delay]);
  return <div style={{height,background:"var(--surface3)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${w}%`,background:color,borderRadius:3,transition:"width 1s ease"}}/></div>;
}

function MiniTrend({data,color}){
  const max=Math.max(...data),min=Math.min(...data),h=32,w=80;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/(max-min||1))*(h-4)-2}`).join(" ");
  return(
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function AdminDepartments({onBack}){
  const [active,setActive]=useState(DEPTS[0]);

  return(
    <div className="dp-page">
      {/* HEADER */}
      <div className="dp-header">
        <div className="dp-header-left">
          <button className="dp-back" onClick={onBack}><IcoChevL/> Dashboard</button>
          <div>
            <div className="dp-breadcrumb">Admin / Departments</div>
            <h1 className="dp-title">Department Overview</h1>
          </div>
        </div>
        <button className="dp-btn-primary"><IcoPlus/> Add Department</button>
      </div>

      {/* SUMMARY KPIs */}
      <div className="dp-kpi-row">
        {[
          {label:"Departments",    val:DEPTS.length,                                             c:"var(--indigo-ll)",  bg:"rgba(91,78,248,.1)"},
          {label:"Total Students", val:DEPTS.reduce((a,d)=>a+d.students,0).toLocaleString(),     c:"var(--teal)",       bg:"rgba(39,201,176,.1)"},
          {label:"Total Faculty",  val:DEPTS.reduce((a,d)=>a+d.faculty,0),                       c:"var(--violet)",     bg:"rgba(159,122,234,.1)"},
          {label:"Total Courses",  val:DEPTS.reduce((a,d)=>a+d.courses,0),                       c:"var(--amber)",      bg:"rgba(244,165,53,.1)"},
          {label:"Platform Avg Score",val:Math.round(DEPTS.reduce((a,d)=>a+d.avgScore,0)/DEPTS.length)+"%", c:"var(--teal)",  bg:"rgba(39,201,176,.1)"},
          {label:"Avg Placement",  val:Math.round(DEPTS.reduce((a,d)=>a+d.placement,0)/DEPTS.length)+"%",   c:"var(--amber)",  bg:"rgba(244,165,53,.1)"},
        ].map(({label,val,c,bg})=>(
          <div key={label} className="dp-kpi">
            <div className="dp-kpi-val" style={{color:c}}>{val}</div>
            <div className="dp-kpi-lbl">{label}</div>
          </div>
        ))}
      </div>

      {/* MAIN LAYOUT */}
      <div className="dp-layout">

        {/* LEFT: DEPT CARDS */}
        <div className="dp-cards-col">
          {DEPTS.map((d,i)=>(
            <div key={d.code} className={`dp-card ${active.code===d.code?"active":""}`}
              style={{borderColor:active.code===d.code?d.color.replace("var(","").replace(")",""):""}} onClick={()=>setActive(d)}>
              <div className="dp-card-top">
                <div className="dp-card-badge" style={{background:d.bg,color:d.color}}>{d.code}</div>
                <div className="dp-card-hd">
                  <div className="dp-card-name">{d.name}</div>
                  <div className="dp-card-hod">HOD: {d.hod}</div>
                </div>
                <div className="dp-card-trend"><MiniTrend data={d.trend} color={d.color}/></div>
              </div>
              <div className="dp-card-stats">
                <div className="dp-card-stat"><div className="dp-stat-val" style={{color:d.color}}>{d.students}</div><div className="dp-stat-lbl">Students</div></div>
                <div className="dp-card-stat"><div className="dp-stat-val" style={{color:d.color}}>{d.faculty}</div><div className="dp-stat-lbl">Faculty</div></div>
                <div className="dp-card-stat"><div className="dp-stat-val" style={{color:d.color}}>{d.courses}</div><div className="dp-stat-lbl">Courses</div></div>
                <div className="dp-card-stat"><div className="dp-stat-val" style={{color:d.color}}>{d.placement}%</div><div className="dp-stat-lbl">Placed</div></div>
              </div>
              <div style={{marginTop:8}}>
                <AnimBar pct={d.completion} color={d.color} delay={400+i*80} height={3}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                <span style={{fontSize:9,color:"var(--text3)"}}>Completion {d.completion}%</span>
                <span style={{fontSize:9,color:"var(--text3)"}}>Avg {d.avgScore}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: DETAIL */}
        <div className="dp-detail">
          <div className="dp-detail-banner" style={{background:active.bg,borderColor:active.color.replace("var(","").replace(")","")+"33"}}>
            <div className="dp-detail-badge" style={{background:active.bg,color:active.color}}>{active.code}</div>
            <div>
              <div className="dp-detail-name">{active.name}</div>
              <div className="dp-detail-meta">Est. {active.founded} · {active.labs} Labs · HOD: {active.hod}</div>
            </div>
            <button className="dp-edit-btn"><IcoEdit/> Edit</button>
          </div>

          {/* METRIC BARS */}
          <div className="dp-metrics-grid">
            {[
              {label:"Avg Score",      val:active.avgScore,  color:active.color},
              {label:"Completion Rate",val:active.completion,color:active.color},
              {label:"Attendance",     val:active.attendance,color:active.color},
              {label:"Placement Rate", val:active.placement, color:active.color},
            ].map(({label,val,color},i)=>(
              <div key={label} className="dp-metric-card">
                <div className="dp-metric-top">
                  <span className="dp-metric-lbl">{label}</span>
                  <span className="dp-metric-val" style={{color}}>{val}%</span>
                </div>
                <AnimBar pct={val} color={color} delay={200+i*80} height={5}/>
              </div>
            ))}
          </div>

          {/* TWO COLUMNS */}
          <div className="dp-detail-cols">
            <div className="dp-detail-panel">
              <div className="dp-panel-ttl"><IcoBook style={{color:"var(--teal)"}}/> Top Courses</div>
              {active.topCourses.map((c,i)=>(
                <div key={i} className="dp-course-row">
                  <div className="dp-course-num" style={{background:active.bg,color:active.color}}>{i+1}</div>
                  <span>{c}</span>
                </div>
              ))}
            </div>
            <div className="dp-detail-panel">
              <div className="dp-panel-ttl"><IcoUsers style={{color:"var(--violet)"}}/> Breakdown</div>
              <div className="dp-breakdown">
                <div className="dp-breakdown-row"><span>Students</span><strong style={{color:active.color}}>{active.students}</strong></div>
                <div className="dp-breakdown-row"><span>Faculty</span><strong style={{color:active.color}}>{active.faculty}</strong></div>
                <div className="dp-breakdown-row"><span>Courses</span><strong style={{color:active.color}}>{active.courses}</strong></div>
                <div className="dp-breakdown-row"><span>Labs</span><strong style={{color:active.color}}>{active.labs}</strong></div>
                <div className="dp-breakdown-row"><span>Est.</span><strong>{active.founded}</strong></div>
              </div>
              {active.recentHires.length>0&&<>
                <div style={{fontSize:10,color:"var(--text3)",fontWeight:600,marginTop:14,marginBottom:6,textTransform:"uppercase",letterSpacing:".08em"}}>Recent Hires</div>
                {active.recentHires.map((h,i)=>(
                  <div key={i} className="dp-hire-row">
                    <div className="dp-hire-av" style={{background:active.bg,color:active.color}}>{h.split(" ").filter((_,j)=>j>0).map(w=>w[0]).join("")}</div>
                    <span>{h}</span>
                  </div>
                ))}
              </>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}