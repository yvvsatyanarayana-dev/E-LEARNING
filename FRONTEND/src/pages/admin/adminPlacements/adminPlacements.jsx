// AdminPlacements.jsx — Smart Campus Admin
import { useState, useEffect } from "react";
import "./adminPlacements.css";

const IcoChevL   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoBriefcase=(p)=> <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoCal     = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoUp      = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;

const DRIVES = [
  {company:"Google",        logo:"G",  logoC:"var(--teal)",     logoBg:"rgba(39,201,176,.12)",  date:"15 Mar 2025",role:"SWE Intern",        offers:4,  eligible:28,  pkg:"28 LPA",  status:"completed",  dept:"CS,DS"},
  {company:"Microsoft",     logo:"Ms", logoC:"var(--indigo-ll)",logoBg:"rgba(91,78,248,.12)",   date:"10 Mar 2025",role:"Software Engineer",  offers:6,  eligible:42,  pkg:"22 LPA",  status:"completed",  dept:"CS,IT"},
  {company:"Amazon",        logo:"A",  logoC:"var(--amber)",    logoBg:"rgba(244,165,53,.12)",  date:"5 Mar 2025", role:"SDE-1",              offers:9,  eligible:55,  pkg:"18 LPA",  status:"completed",  dept:"CS,ECE"},
  {company:"Infosys",       logo:"In", logoC:"var(--violet)",   logoBg:"rgba(159,122,234,.12)", date:"28 Feb 2025",role:"Systems Engineer",   offers:28, eligible:120, pkg:"4.5 LPA", status:"completed",  dept:"All"},
  {company:"TCS",           logo:"Tc", logoC:"var(--indigo-l)", logoBg:"rgba(123,111,250,.12)", date:"22 Feb 2025",role:"Graduate Trainee",   offers:35, eligible:180, pkg:"3.8 LPA", status:"completed",  dept:"All"},
  {company:"Wipro",         logo:"Wi", logoC:"var(--rose)",     logoBg:"rgba(242,68,92,.12)",   date:"25 Mar 2025",role:"Project Engineer",   offers:0,  eligible:90,  pkg:"3.5 LPA", status:"upcoming",   dept:"CS,IT,ECE"},
  {company:"Deloitte",      logo:"De", logoC:"var(--teal)",     logoBg:"rgba(39,201,176,.12)",  date:"30 Mar 2025",role:"Analyst",            offers:0,  eligible:60,  pkg:"6.5 LPA", status:"upcoming",   dept:"DS,CS,IT"},
  {company:"Accenture",     logo:"Ac", logoC:"var(--amber)",    logoBg:"rgba(244,165,53,.12)",  date:"2 Apr 2025", role:"Assoc. Developer",   offers:0,  eligible:100, pkg:"4.2 LPA", status:"upcoming",   dept:"All"},
];

const PLACED_STUDENTS = [
  {name:"Arjun Reddy",   dept:"CS", company:"Google",    pkg:"28 LPA", avatar:"AR",c:"var(--teal)"},
  {name:"Sneha Joshi",   dept:"CS", company:"Microsoft", pkg:"22 LPA", avatar:"SJ",c:"var(--indigo-ll)"},
  {name:"Vikram Iyer",   dept:"CS", company:"Amazon",    pkg:"18 LPA", avatar:"VI",c:"var(--amber)"},
  {name:"Priya Nair",    dept:"DS", company:"Google",    pkg:"26 LPA", avatar:"PN",c:"var(--teal)"},
  {name:"Rahul Sharma",  dept:"IT", company:"Microsoft", pkg:"20 LPA", avatar:"RS",c:"var(--indigo-ll)"},
  {name:"Aman Verma",    dept:"CS", company:"Infosys",   pkg:"4.5 LPA",avatar:"AV",c:"var(--violet)"},
  {name:"Lakshmi Reddy", dept:"DS", company:"Amazon",    pkg:"17 LPA", avatar:"LR",c:"var(--amber)"},
  {name:"Riya Kapoor",   dept:"ECE",company:"TCS",       pkg:"3.8 LPA",avatar:"RK",c:"var(--indigo-l)"},
];

const DEPT_PLACEMENT = [
  {dept:"CS",  pct:91, color:"var(--indigo-l)"},
  {dept:"DS",  pct:94, color:"var(--indigo-ll)"},
  {dept:"IT",  pct:88, color:"var(--violet)"},
  {dept:"ECE", pct:85, color:"var(--teal)"},
  {dept:"ME",  pct:78, color:"var(--amber)"},
  {dept:"CE",  pct:74, color:"var(--rose)"},
];

function AnimBar({pct,color,delay=400}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),delay);return()=>clearTimeout(t);},[pct,delay]);
  return <div style={{height:5,background:"var(--surface3)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${w}%`,background:color,borderRadius:3,transition:"width 1s ease"}}/></div>;
}

function DonutChart({pct,color}){
  const [anim,setAnim]=useState(0);
  const r=40,circ=2*Math.PI*r,size=100,sw=10;
  useEffect(()=>{const t=setTimeout(()=>setAnim(pct),600);return()=>clearTimeout(t);},[pct]);
  return(
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={sw}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={circ*(1-anim/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1)"}}/>
    </svg>
  );
}

export default function AdminPlacements({onBack}){
  const [filter,setFilter]=useState("All");
  const FILTERS=["All","completed","upcoming"];
  const filtered=DRIVES.filter(d=>filter==="All"||d.status===filter);
  const totalOffers=DRIVES.reduce((a,d)=>a+d.offers,0);
  const completedDrives=DRIVES.filter(d=>d.status==="completed").length;
  const upcomingDrives=DRIVES.filter(d=>d.status==="upcoming").length;

  return(
    <div className="pl-page">
      {/* HEADER */}
      <div className="pl-header">
        <div className="pl-header-left">
          <button className="pl-back" onClick={onBack}><IcoChevL/> Dashboard</button>
          <div>
            <div className="pl-breadcrumb">Admin / Placements</div>
            <h1 className="pl-title">Placement Dashboard</h1>
          </div>
        </div>
        <button className="pl-btn-primary"><IcoPlus/> Schedule Drive</button>
      </div>

      {/* KPI ROW */}
      <div className="pl-kpi-row">
        {[
          {label:"Overall Placement Rate",  val:"83%",      c:"var(--amber)",     bg:"rgba(244,165,53,.1)"},
          {label:"Total Offers",             val:totalOffers,c:"var(--teal)",      bg:"rgba(39,201,176,.1)"},
          {label:"Drives Completed",         val:completedDrives,c:"var(--indigo-ll)",bg:"rgba(91,78,248,.1)"},
          {label:"Upcoming Drives",          val:upcomingDrives,c:"var(--violet)",   bg:"rgba(159,122,234,.1)"},
          {label:"Highest Package",          val:"28 LPA",   c:"var(--amber)",     bg:"rgba(244,165,53,.1)"},
          {label:"Avg Package",              val:"7.2 LPA",  c:"var(--teal)",      bg:"rgba(39,201,176,.1)"},
        ].map(({label,val,c,bg})=>(
          <div key={label} className="pl-kpi">
            <div className="pl-kpi-val" style={{color:c}}>{val}</div>
            <div className="pl-kpi-lbl">{label}</div>
          </div>
        ))}
      </div>

      <div className="pl-layout">
        {/* LEFT: DRIVES */}
        <div className="pl-left">
          <div className="pl-section-hd">
            <div className="pl-section-ttl"><IcoBriefcase style={{color:"var(--amber)"}}/> Placement Drives</div>
            <div className="pl-tabs">
              {FILTERS.map(f=><button key={f} className={`pl-tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f==="All"?"All":f.charAt(0).toUpperCase()+f.slice(1)}</button>)}
            </div>
          </div>
          <div className="pl-drives-list">
            {filtered.map((d,i)=>(
              <div key={i} className="pl-drive-card" style={{animationDelay:`${i*0.06}s`}}>
                <div className="pl-drive-logo" style={{background:d.logoBg,color:d.logoC}}>{d.logo}</div>
                <div className="pl-drive-info">
                  <div className="pl-drive-company">{d.company}</div>
                  <div className="pl-drive-role">{d.role} · {d.dept}</div>
                  <div className="pl-drive-meta"><IcoCal style={{opacity:.5}}/> {d.date}</div>
                </div>
                <div className="pl-drive-right">
                  <div className="pl-drive-pkg" style={{color:d.logoC}}>{d.pkg}</div>
                  {d.status==="completed"
                    ? <div className="pl-drive-offers">{d.offers} offers / {d.eligible} eligible</div>
                    : <div className="pl-drive-offers">{d.eligible} eligible</div>
                  }
                  <div className={`pl-drive-status ${d.status}`}>{d.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="pl-right">
          {/* OVERALL DONUT */}
          <div className="pl-panel">
            <div className="pl-panel-hd"><IcoTrend style={{color:"var(--amber)"}}/> Overall Placement Rate</div>
            <div className="pl-donut-wrap">
              <DonutChart pct={83} color="var(--amber)"/>
              <div className="pl-donut-label">
                <div style={{fontFamily:"'Fraunces',serif",fontSize:22,color:"var(--amber)",lineHeight:1}}>83%</div>
                <div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>placed</div>
              </div>
            </div>
            <div className="pl-donut-meta">
              <div className="pl-donut-stat"><div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:"var(--teal)",lineHeight:1}}>{totalOffers}</div><div style={{fontSize:9,color:"var(--text3)"}}>offers</div></div>
              <div className="pl-donut-divider"/>
              <div className="pl-donut-stat"><div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:"var(--amber)",lineHeight:1}}>28 LPA</div><div style={{fontSize:9,color:"var(--text3)"}}>highest</div></div>
              <div className="pl-donut-divider"/>
              <div className="pl-donut-stat"><div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:"var(--indigo-ll)",lineHeight:1}}>7.2 LPA</div><div style={{fontSize:9,color:"var(--text3)"}}>average</div></div>
            </div>
          </div>

          {/* DEPT BREAKDOWN */}
          <div className="pl-panel">
            <div className="pl-panel-hd"><IcoUsers style={{color:"var(--teal)"}}/> By Department</div>
            <div className="pl-dept-list">
              {DEPT_PLACEMENT.map((d,i)=>(
                <div key={i} className="pl-dept-row">
                  <div className="pl-dept-badge" style={{background:d.color+"22",color:d.color}}>{d.dept}</div>
                  <div style={{flex:1}}><AnimBar pct={d.pct} color={d.color} delay={400+i*70}/></div>
                  <div style={{fontSize:12,fontWeight:700,color:d.color,width:36,textAlign:"right"}}>{d.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* TOP PLACED */}
          <div className="pl-panel">
            <div className="pl-panel-hd"><IcoUsers style={{color:"var(--indigo-ll)"}}/> Top Placed Students</div>
            <div className="pl-students-list">
              {PLACED_STUDENTS.slice(0,6).map((s,i)=>(
                <div key={i} className="pl-student-row">
                  <div className="pl-student-av" style={{background:s.c+"22",color:s.c}}>{s.avatar}</div>
                  <div className="pl-student-info">
                    <div className="pl-student-name">{s.name}</div>
                    <div className="pl-student-meta">{s.dept} · {s.company}</div>
                  </div>
                  <div className="pl-student-pkg" style={{color:s.c}}>{s.pkg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}