// AdminAnalytics.jsx — Smart Campus Admin · Full Analytics Dashboard
import { useState, useEffect, useRef } from "react";
import "./AdminAnalytics.css";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoChevL   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoBook    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoAward   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoActivity= (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IcoBuilding= (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/><path d="M3 15h6"/><path d="M15 3v18"/><path d="M15 9h6"/><path d="M15 15h6"/></svg>;
const IcoBriefcase=(p)=><svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcoDown    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoUp      = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoDn      = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoMinus   = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoStar    = (p) => <svg {...p} width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoCal     = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

// ─── DATA ────────────────────────────────────────────────────────
const MONTHS  = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
const MONTHS_SHORT = ["A","M","J","J","A","S","O","N","D","J","F","M"];
const WEEKS   = ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12","W13","W14","W15","W16"];

const DATA = {
  Year: {
    enrollment:  [820,870,855,920,900,975,950,1040,1010,1120,1080,1180],
    active:      [610,655,640,700,685,740,715,795,770,855,820,900],
    labels:      MONTHS,
    placement:   [72,74,73,76,75,77,76,79,78,81,80,83],
    attendance:  [76,78,77,80,79,81,80,82,81,83,82,84],
    assignments: [1820,1940,1880,2100,2030,2240,2150,2380,2290,2540,2440,2620],
  },
  Quarter: {
    enrollment:  [1010,1040,1080,1120,1080,1180,1160,1200,1180,1220,1200,1240,1220,1260,1240,1280],
    active:      [770,800,840,855,820,870,850,890,870,910,885,920,900,940,915,950],
    labels:      WEEKS,
    placement:   [78,79,79,80,80,81,81,82,82,83,83,83,84,84,84,85],
    attendance:  [80,81,81,82,82,82,83,83,83,84,84,84,85,85,84,85],
    assignments: [580,610,600,640,620,660,640,680,660,700,680,720,700,730,710,740],
  },
  Month: {
    enrollment:  [1140,1150,1145,1160,1165,1170,1162,1175,1180,1178,1182,1185,1183,1187,1185,1190,1188,1192,1190,1195,1193,1196,1194,1198,1197,1199,1198,1200,1199,1200],
    active:      [875,880,878,885,888,890,886,893,900,898,902,905,903,907,905,910,908,912,910,915,913,916,914,918,917,919,918,920,919,920],
    labels:      Array.from({length:30},(_,i)=>`${i+1}`),
    placement:   Array.from({length:30},(_,i)=>82+Math.sin(i/3)*.8),
    attendance:  Array.from({length:30},(_,i)=>83+Math.sin(i/4)*.6),
    assignments: Array.from({length:30},(_,i)=>Math.round(84+Math.sin(i/2)*6)),
  },
};

const DEPT_DATA = [
  {code:"DS",  name:"Data Science",      students:80,  avgScore:81, completion:92, attendance:87, placement:94, color:"var(--indigo-ll)",bg:"rgba(168,159,255,.1)"},
  {code:"CS",  name:"Computer Science",  students:480, avgScore:76, completion:88, attendance:82, placement:91, color:"var(--indigo-l)", bg:"rgba(91,78,248,.1)"},
  {code:"IT",  name:"Info Technology",   students:140, avgScore:74, completion:85, attendance:80, placement:88, color:"var(--violet)",   bg:"rgba(159,122,234,.1)"},
  {code:"ECE", name:"Electronics",       students:360, avgScore:71, completion:82, attendance:78, placement:85, color:"var(--teal)",     bg:"rgba(39,201,176,.1)"},
  {code:"ME",  name:"Mechanical Engg",   students:280, avgScore:69, completion:79, attendance:75, placement:78, color:"var(--amber)",    bg:"rgba(244,165,53,.1)"},
  {code:"CE",  name:"Civil Engineering", students:220, avgScore:67, completion:74, attendance:73, placement:74, color:"var(--rose)",     bg:"rgba(242,68,92,.1)"},
];

const TOP_COURSES = [
  {name:"Advanced DBMS",          dept:"CS",  faculty:"Dr. Prakash",  enrolled:108, capacity:120, rating:4.8, completion:91, trend:[82,85,87,88,90,91]},
  {name:"Machine Learning Basics",dept:"DS",  faculty:"Dr. Meera",    enrolled:76,  capacity:80,  rating:4.7, completion:88, trend:[80,82,84,85,87,88]},
  {name:"Operating Systems",      dept:"CS",  faculty:"Dr. Kavitha",  enrolled:112, capacity:120, rating:4.6, completion:86, trend:[78,80,82,83,85,86]},
  {name:"Computer Architecture",  dept:"CS",  faculty:"Prof. Anand",  enrolled:96,  capacity:100, rating:4.5, completion:84, trend:[76,78,80,81,83,84]},
  {name:"Statistical Learning",   dept:"DS",  faculty:"Dr. Meera",    enrolled:38,  capacity:40,  rating:4.6, completion:89, trend:[80,83,85,86,88,89]},
  {name:"Web Technologies",       dept:"IT",  faculty:"Dr. Priya",    enrolled:42,  capacity:50,  rating:4.5, completion:85, trend:[75,78,80,82,84,85]},
  {name:"Data Structures",        dept:"IT",  faculty:"Prof. Nair",   enrolled:88,  capacity:100, rating:4.4, completion:82, trend:[74,76,78,79,81,82]},
];

const PLACEMENT_BY_DEPT = [
  {company:"Google",    cs:4,  ds:2,  it:0, ece:0, me:0,  ce:0,  pkg:"28 LPA", color:"var(--teal)"},
  {company:"Microsoft", cs:4,  ds:0,  it:2, ece:0, me:0,  ce:0,  pkg:"22 LPA", color:"var(--indigo-ll)"},
  {company:"Amazon",    cs:5,  ds:1,  it:1, ece:2, me:0,  ce:0,  pkg:"18 LPA", color:"var(--amber)"},
  {company:"Infosys",   cs:8,  ds:2,  it:4, ece:6, me:4,  ce:4,  pkg:"4.5 LPA",color:"var(--violet)"},
  {company:"TCS",       cs:10, ds:1,  it:5, ece:8, me:6,  ce:5,  pkg:"3.8 LPA",color:"var(--indigo-l)"},
];

const ACTIVITY_LOG = [
  {action:"1,200+ students completed mid-term assessments",  time:"Today, 09:00",    type:"success"},
  {action:"New batch of 48 students enrolled in DS Dept",    time:"Today, 08:30",    type:"info"},
  {action:"Advanced DBMS crossed 90% completion rate",       time:"Yesterday, 17:00",type:"success"},
  {action:"Placement drive — TCS: 35 offers made",           time:"Yesterday, 14:00",type:"success"},
  {action:"Storage alert: 82% capacity used",                time:"Yesterday, 06:45",type:"warn"},
  {action:"Monthly enrollment report auto-generated",        time:"1 Mar 2025",      type:"info"},
  {action:"Google drive concluded: 4 offers at 28 LPA",      time:"15 Mar 2025",     type:"success"},
  {action:"SSL certificate renewal reminder triggered",      time:"2 days ago",      type:"warn"},
];

const HEATMAP_DATA = (() => {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const weeks = 12;
  return Array.from({length:weeks}, (_,w) =>
    Array.from({length:7}, (_,d) => {
      const base = d < 5 ? 60 + Math.random()*35 : 10 + Math.random()*25;
      return Math.round(base);
    })
  );
})();

// ─── HELPERS ─────────────────────────────────────────────────────
function AnimBar({pct,color,delay=400,h=5}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),delay);return()=>clearTimeout(t);},[pct,delay]);
  return <div style={{height:h,background:"var(--surface3)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${w}%`,background:color,borderRadius:3,transition:"width 1.1s ease"}}/></div>;
}

function DonutChart({pct,color,size=80,sw=8}){
  const [anim,setAnim]=useState(0);
  const r=(size-sw*2)/2, circ=2*Math.PI*r;
  useEffect(()=>{const t=setTimeout(()=>setAnim(pct),500);return()=>clearTimeout(t);},[pct]);
  return(
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={sw}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={circ*(1-anim/100)} strokeLinecap="round"
        style={{transition:"stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1)"}}/>
    </svg>
  );
}

// ─── SVG LINE CHART ──────────────────────────────────────────────
function LineAreaChart({datasets, labels, height=140}){
  const W=500, H=height, padT=12, padB=28, padLR=8;
  const allVals=datasets.flatMap(d=>d.data);
  const max=Math.max(...allVals), min=Math.min(...allVals);
  const toX=i=>padLR+(i/(labels.length-1))*(W-padLR*2);
  const toY=v=>padT+(1-(v-min)/(max-min||1))*(H-padT-padB);
  const [hovered,setHovered]=useState(null);

  return(
    <div className="an-svg-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:"100%",height}}>
        <defs>
          {datasets.map((d,i)=>(
            <linearGradient key={i} id={`lag${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d.color} stopOpacity=".28"/>
              <stop offset="100%" stopColor={d.color} stopOpacity="0"/>
            </linearGradient>
          ))}
        </defs>
        {/* Grid lines */}
        {[0,.25,.5,.75,1].map((t,i)=>{
          const y=padT+(1-t)*(H-padT-padB);
          return <line key={i} x1={padLR} y1={y} x2={W-padLR} y2={y} stroke="rgba(255,255,255,.04)" strokeWidth="1"/>;
        })}
        {/* Areas & Lines */}
        {datasets.map((d,di)=>{
          const pts=d.data.map((v,i)=>`${toX(i)},${toY(v)}`).join(" ");
          const last=d.data.length-1;
          return(
            <g key={di}>
              <polygon points={`${padLR},${H-padB} ${pts} ${toX(last)},${H-padB}`} fill={`url(#lag${di})`}/>
              <polyline points={pts} fill="none" stroke={d.color} strokeWidth={d.strokeWidth||2} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={d.dashed?"6 3":undefined}/>
              {hovered!==null&&<circle cx={toX(hovered)} cy={toY(d.data[hovered])} r="4" fill={d.color} stroke="var(--bg)" strokeWidth="2"/>}
            </g>
          );
        })}
        {/* Invisible hover targets */}
        {labels.map((_,i)=>(
          <rect key={i} x={toX(i)-10} y={0} width={20} height={H} fill="transparent"
            onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)}/>
        ))}
        {/* Tooltip */}
        {hovered!==null&&(
          <g>
            <line x1={toX(hovered)} y1={padT} x2={toX(hovered)} y2={H-padB} stroke="rgba(255,255,255,.12)" strokeWidth="1" strokeDasharray="4 3"/>
            <rect x={Math.min(toX(hovered)-38, W-84)} y={padT} width={76} height={14+datasets.length*14} rx="5"
              fill="var(--surface2)" stroke="var(--border2)"/>
            <text x={Math.min(toX(hovered)-30, W-76)} y={padT+10} fill="var(--text3)" fontSize="8" fontFamily="Plus Jakarta Sans">{labels[hovered]}</text>
            {datasets.map((d,di)=>(
              <text key={di} x={Math.min(toX(hovered)-30, W-76)} y={padT+10+(di+1)*13}
                fill={d.color} fontSize="9" fontFamily="Plus Jakarta Sans" fontWeight="700">
                {d.label}: {Math.round(d.data[hovered]).toLocaleString()}
              </text>
            ))}
          </g>
        )}
        {/* X Labels */}
        {labels.map((l,i)=>{
          const step=Math.ceil(labels.length/12);
          if(i%step!==0&&i!==labels.length-1) return null;
          return <text key={i} x={toX(i)} y={H-padB+14} textAnchor="middle" fill="var(--text3)" fontSize="8.5" fontFamily="Plus Jakarta Sans">{l}</text>;
        })}
      </svg>
    </div>
  );
}

// ─── MINI SPARKLINE ──────────────────────────────────────────────
function Spark({data,color,w=60,h=24}){
  const max=Math.max(...data), min=Math.min(...data);
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/(max-min||1))*(h-4)-2}`).join(" ");
  return(
    <svg width={w} height={h} style={{display:"block",overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts.split(" ").at(-1).split(",")[0]} cy={pts.split(" ").at(-1).split(",")[1]} r="2.5" fill={color}/>
    </svg>
  );
}

// ─── STACKED BAR ─────────────────────────────────────────────────
function StackedBarChart({data,labels}){
  const DEPTS=["cs","ds","it","ece","me","ce"];
  const COLORS={"cs":"var(--indigo-l)","ds":"var(--indigo-ll)","it":"var(--violet)","ece":"var(--teal)","me":"var(--amber)","ce":"var(--rose)"};
  return(
    <div className="an-stacked-chart">
      {data.map((row,i)=>{
        const total=DEPTS.reduce((a,k)=>a+(row[k]||0),0);
        return(
          <div key={i} className="an-stacked-col">
            <div className="an-stacked-bar">
              {DEPTS.map(k=>{
                const pct=((row[k]||0)/total)*100;
                return pct>0?<div key={k} style={{width:`${pct}%`,background:COLORS[k]}} className="an-stacked-seg" title={`${k.toUpperCase()}: ${row[k]}`}/>:null;
              })}
            </div>
            <div className="an-stacked-total">{total}</div>
            <div className="an-stacked-label">{labels[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── HEATMAP ─────────────────────────────────────────────────────
function AttendanceHeatmap({data}){
  const DAYS=["M","T","W","T","F","S","S"];
  const getColor=(v)=>{
    if(v<25) return "rgba(91,78,248,.06)";
    if(v<45) return "rgba(91,78,248,.2)";
    if(v<65) return "rgba(91,78,248,.4)";
    if(v<80) return "rgba(91,78,248,.65)";
    return "var(--indigo-l)";
  };
  return(
    <div className="an-heatmap">
      <div className="an-heatmap-days">{DAYS.map((d,i)=><div key={i} className="an-hm-day">{d}</div>)}</div>
      <div className="an-heatmap-grid">
        {data.map((week,wi)=>(
          <div key={wi} className="an-hm-week">
            {week.map((v,di)=>(
              <div key={di} className="an-hm-cell" style={{background:getColor(v)}} title={`${v}% active`}/>
            ))}
          </div>
        ))}
      </div>
      <div className="an-hm-legend">
        <span>Low</span>
        {[6,20,40,65,95].map(o=><div key={o} style={{width:10,height:10,borderRadius:2,background:`rgba(91,78,248,${o/100})`}}/>)}
        <span>High</span>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────
const TABS = ["Overview","Enrollment","Departments","Courses","Placement","Attendance"];

export default function AdminAnalytics({onBack}){
  const [tab,setTab]       = useState("Overview");
  const [range,setRange]   = useState("Year");
  const [deptMetric,setDeptMetric]=useState("avgScore");
  const d = DATA[range];

  const DEPT_METRIC_OPTS=[
    {key:"avgScore",   label:"Avg Score"},
    {key:"completion", label:"Completion"},
    {key:"attendance", label:"Attendance"},
    {key:"placement",  label:"Placement"},
  ];

  return(
    <div className="an-page">

      {/* ── HEADER ── */}
      <div className="an-header">
        <div className="an-header-left">
          <button className="an-back" onClick={onBack}><IcoChevL/> Dashboard</button>
          <div>
            <div className="an-breadcrumb">Admin / Analytics</div>
            <h1 className="an-title">Platform Analytics</h1>
          </div>
        </div>
        <div className="an-header-right">
          <div className="an-range-group">
            {["Month","Quarter","Year"].map(r=>(
              <button key={r} className={`an-range-btn ${range===r?"active":""}`} onClick={()=>setRange(r)}>{r}</button>
            ))}
          </div>
          <button className="an-export-btn"><IcoDown/> Export</button>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="an-kpi-strip">
        {[
          {label:"Total Users",      val:"1,842",sub:"+48 this month",   c:"var(--indigo-l)", bg:"rgba(91,78,248,.1)",   up:true,  spark:[62,68,64,72,70,78,75,82,80,87,84,90]},
          {label:"Active Students",  val:"1,560",sub:"+36 enrolled",     c:"var(--teal)",     bg:"rgba(39,201,176,.1)",  up:true,  spark:[80,82,80,85,83,87,85,90,88,92,90,94]},
          {label:"Faculty Members",  val:"87",   sub:"+2 this month",    c:"var(--violet)",   bg:"rgba(159,122,234,.1)", up:true,  spark:[80,81,81,82,82,83,83,84,84,85,85,87]},
          {label:"Active Courses",   val:"124",  sub:"+5 across depts",  c:"var(--amber)",    bg:"rgba(244,165,53,.1)",  up:true,  spark:[108,110,112,112,114,116,116,118,119,120,122,124]},
          {label:"Avg Attendance",   val:"79%",  sub:"+1.2% platform",   c:"var(--teal)",     bg:"rgba(39,201,176,.1)",  up:true,  spark:[74,75,73,76,75,77,76,78,77,79,78,79]},
          {label:"Placement Rate",   val:"83%",  sub:"+6% vs last yr",   c:"var(--amber)",    bg:"rgba(244,165,53,.1)",  up:true,  spark:[65,68,67,72,70,74,73,77,76,80,79,83]},
          {label:"Avg Score",        val:"74%",  sub:"−0.5% all courses",c:"var(--rose)",     bg:"rgba(242,68,92,.1)",   up:false, spark:[77,76,76,75,75,74,74,74,74,74,74,74]},
          {label:"Platform Uptime",  val:"99.7%",sub:"Stable 30d",       c:"var(--teal)",     bg:"rgba(39,201,176,.1)",  up:null,  spark:[100,99,100,100,99,100,100,100,99,100,100,100]},
        ].map(({label,val,sub,c,bg,up,spark},i)=>(
          <div key={label} className="an-kpi-card" style={{animationDelay:`${i*0.05}s`}}>
            <div className="an-kpi-top">
              <div className="an-kpi-icon" style={{background:bg,color:c}}>
                {i<3?<IcoUsers width={13} height={13}/>:i<5?<IcoBook width={13} height={13}/>:i<6?<IcoBriefcase width={13} height={13}/>:<IcoActivity width={13} height={13}/>}
              </div>
              <div className={`an-kpi-trend ${up===true?"up":up===false?"dn":""}`}>
                {up===true?<IcoUp/>:up===false?<IcoDn/>:<IcoMinus/>}
              </div>
            </div>
            <div className="an-kpi-val" style={{color:c}}>{val}</div>
            <div className="an-kpi-label">{label}</div>
            <div className="an-kpi-sub">{sub}</div>
            <Spark data={spark} color={c} w={80} h={22}/>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="an-tabs">
        {TABS.map(t=>(
          <button key={t} className={`an-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t==="Overview"&&<IcoActivity width={11} height={11}/>}
            {t==="Enrollment"&&<IcoUsers width={11} height={11}/>}
            {t==="Departments"&&<IcoBuilding width={11} height={11}/>}
            {t==="Courses"&&<IcoBook width={11} height={11}/>}
            {t==="Placement"&&<IcoBriefcase width={11} height={11}/>}
            {t==="Attendance"&&<IcoCal width={11} height={11}/>}
            {t}
          </button>
        ))}
      </div>

      {/* ══════════════ TAB CONTENT ══════════════ */}

      {/* ── OVERVIEW ── */}
      {tab==="Overview"&&(
        <div className="an-tab-body">
          <div className="an-row-main">
            {/* MAIN CHART */}
            <div className="an-panel an-panel-wide">
              <div className="an-panel-hd">
                <div className="an-panel-ttl"><IcoTrend style={{color:"var(--indigo-ll)"}}/> Enrollment vs Active Users <span>{range} View</span></div>
                <div className="an-legend">
                  <div className="an-leg"><div style={{background:"var(--indigo-l)"}} className="an-leg-dot"/>Enrolled</div>
                  <div className="an-leg"><div style={{background:"var(--teal)",opacity:.7}} className="an-leg-dot an-leg-dash"/>Active</div>
                </div>
              </div>
              <div className="an-panel-body">
                <div className="an-chart-headline">
                  <div><div className="an-hl-num" style={{color:"var(--indigo-ll)"}}>{d.enrollment.at(-1).toLocaleString()}</div><div className="an-hl-lbl">Peak enrolled</div></div>
                  <div><div className="an-hl-num" style={{color:"var(--teal)"}}>{d.active.at(-1).toLocaleString()}</div><div className="an-hl-lbl">Peak active</div></div>
                  <div><div className="an-hl-num" style={{color:"var(--violet)"}}>{Math.round((d.active.at(-1)/d.enrollment.at(-1))*100)}%</div><div className="an-hl-lbl">Engagement</div></div>
                </div>
                <LineAreaChart datasets={[
                  {data:d.enrollment,color:"var(--indigo-l)",label:"Enrolled",strokeWidth:2.2},
                  {data:d.active,    color:"var(--teal)",    label:"Active",  strokeWidth:2, dashed:true},
                ]} labels={d.labels} height={150}/>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="an-right-col">
              {/* ACTIVITY LOG */}
              <div className="an-panel" style={{flex:1}}>
                <div className="an-panel-hd">
                  <div className="an-panel-ttl"><IcoActivity style={{color:"var(--teal)"}}/> Platform Activity</div>
                </div>
                <div className="an-panel-body" style={{paddingTop:8}}>
                  {ACTIVITY_LOG.map((a,i)=>(
                    <div key={i} className="an-act-row">
                      <div className={`an-act-pip ${a.type}`}/>
                      <div className="an-act-info">
                        <div className="an-act-label">{a.action}</div>
                        <div className="an-act-time">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM TILES */}
          <div className="an-stat-tiles">
            {[
              {label:"Lectures Delivered",  val:"4,820",  sub:"this semester", c:"var(--indigo-ll)"},
              {label:"Assignments Submitted",val:"23,400", sub:"all courses",   c:"var(--teal)"},
              {label:"Quizzes Conducted",    val:"1,260",  sub:"platform-wide", c:"var(--amber)"},
              {label:"Projects Submitted",   val:"680",    sub:"active batches",c:"var(--violet)"},
              {label:"Live Sessions",        val:"340",    sub:"held this year", c:"var(--rose)"},
              {label:"Study Groups",         val:"92",     sub:"currently active",c:"var(--indigo-l)"},
            ].map(({label,val,sub,c})=>(
              <div key={label} className="an-stat-tile">
                <div className="an-stat-val" style={{color:c}}>{val}</div>
                <div className="an-stat-lbl">{label}</div>
                <div className="an-stat-sub">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ENROLLMENT ── */}
      {tab==="Enrollment"&&(
        <div className="an-tab-body">
          <div className="an-row-main">
            <div className="an-panel an-panel-wide">
              <div className="an-panel-hd">
                <div className="an-panel-ttl"><IcoUsers style={{color:"var(--indigo-ll)"}}/> Enrollment Trend <span>{range}</span></div>
                <div className="an-legend">
                  <div className="an-leg"><div style={{background:"var(--indigo-l)"}} className="an-leg-dot"/>Enrolled</div>
                  <div className="an-leg"><div style={{background:"var(--teal)"}} className="an-leg-dot"/>Active</div>
                  <div className="an-leg"><div style={{background:"var(--amber)"}} className="an-leg-dot"/>Assignments</div>
                </div>
              </div>
              <div className="an-panel-body">
                <div className="an-chart-headline">
                  <div><div className="an-hl-num" style={{color:"var(--indigo-ll)"}}>1,560</div><div className="an-hl-lbl">Total enrolled</div></div>
                  <div><div className="an-hl-num" style={{color:"var(--teal)"}}>+49%</div><div className="an-hl-lbl">YoY growth</div></div>
                  <div><div className="an-hl-num" style={{color:"var(--violet)"}}>6</div><div className="an-hl-lbl">Departments</div></div>
                  <div><div className="an-hl-num" style={{color:"var(--amber)"}}>87%</div><div className="an-hl-lbl">Retention rate</div></div>
                </div>
                <LineAreaChart datasets={[
                  {data:d.enrollment, color:"var(--indigo-l)", label:"Enrolled",    strokeWidth:2.2},
                  {data:d.active,     color:"var(--teal)",     label:"Active",      strokeWidth:2, dashed:true},
                ]} labels={d.labels} height={160}/>
              </div>
            </div>
            <div className="an-right-col">
              <div className="an-panel">
                <div className="an-panel-hd"><div className="an-panel-ttl"><IcoBuilding style={{color:"var(--teal)"}}/> Dept Enrollment</div></div>
                <div className="an-panel-body" style={{paddingTop:10}}>
                  {DEPT_DATA.map((d,i)=>(
                    <div key={d.code} className="an-dept-row" style={{animationDelay:`${0.4+i*0.07}s`}}>
                      <div className="an-dept-badge" style={{background:d.bg,color:d.color}}>{d.code}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:600,marginBottom:4,display:"flex",justifyContent:"space-between"}}>
                          <span>{d.name}</span><span style={{color:d.color,fontFamily:"'Fraunces',serif"}}>{d.students}</span>
                        </div>
                        <AnimBar pct={Math.round((d.students/480)*100)} color={d.color} delay={400+i*70}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Stacked bar */}
          <div className="an-panel" style={{marginTop:16}}>
            <div className="an-panel-hd">
              <div className="an-panel-ttl"><IcoBuilding style={{color:"var(--indigo-ll)"}}/> Dept-wise Monthly Placement Offers</div>
              <div className="an-legend">
                {[{k:"cs",c:"var(--indigo-l)",l:"CS"},{k:"ds",c:"var(--indigo-ll)",l:"DS"},{k:"it",c:"var(--violet)",l:"IT"},{k:"ece",c:"var(--teal)",l:"ECE"},{k:"me",c:"var(--amber)",l:"ME"},{k:"ce",c:"var(--rose)",l:"CE"}].map(x=>(
                  <div key={x.k} className="an-leg"><div style={{background:x.c}} className="an-leg-dot"/>{x.l}</div>
                ))}
              </div>
            </div>
            <div className="an-panel-body">
              <StackedBarChart data={PLACEMENT_BY_DEPT} labels={PLACEMENT_BY_DEPT.map(p=>p.company)}/>
            </div>
          </div>
        </div>
      )}

      {/* ── DEPARTMENTS ── */}
      {tab==="Departments"&&(
        <div className="an-tab-body">
          {/* Metric Selector */}
          <div className="an-metric-selector">
            <span style={{fontSize:11,color:"var(--text3)",fontWeight:600}}>Metric:</span>
            {DEPT_METRIC_OPTS.map(m=>(
              <button key={m.key} className={`an-metric-btn ${deptMetric===m.key?"active":""}`} onClick={()=>setDeptMetric(m.key)}>{m.label}</button>
            ))}
          </div>
          {/* Dept cards */}
          <div className="an-dept-grid">
            {DEPT_DATA.map((dept,i)=>(
              <div key={dept.code} className="an-dept-card" style={{animationDelay:`${i*0.07}s`}}>
                <div className="an-dept-card-top">
                  <div className="an-dept-card-badge" style={{background:dept.bg,color:dept.color}}>{dept.code}</div>
                  <div>
                    <div className="an-dept-card-name">{dept.name}</div>
                    <div className="an-dept-card-meta">{dept.students} students</div>
                  </div>
                  <div style={{marginLeft:"auto"}}>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:26,color:dept.color,lineHeight:1,textAlign:"right"}}>{dept[deptMetric]}%</div>
                    <div style={{fontSize:9,color:"var(--text3)",textAlign:"right"}}>{DEPT_METRIC_OPTS.find(m=>m.key===deptMetric)?.label}</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
                  {DEPT_METRIC_OPTS.map(({key,label},mi)=>(
                    <div key={key}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:9.5,marginBottom:3}}>
                        <span style={{color:"var(--text3)"}}>{label}</span>
                        <span style={{fontWeight:700,color:dept.color}}>{dept[key]}%</span>
                      </div>
                      <AnimBar pct={dept[key]} color={dept.color} delay={300+mi*60+i*30} h={3}/>
                    </div>
                  ))}
                </div>
                <div className="an-dept-card-donut">
                  <DonutChart pct={dept[deptMetric]} color={dept.color} size={64} sw={6}/>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontFamily:"'Fraunces',serif",fontSize:14,color:dept.color}}>{dept[deptMetric]}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Comparison chart */}
          <div className="an-panel" style={{marginTop:16}}>
            <div className="an-panel-hd">
              <div className="an-panel-ttl"><IcoActivity style={{color:"var(--teal)"}}/> Department Comparison — All Metrics</div>
            </div>
            <div className="an-panel-body">
              <div className="an-comparison-table">
                <div className="an-comp-head">
                  <span>Department</span>
                  <span>Avg Score</span><span>Completion</span><span>Attendance</span><span>Placement</span><span>Students</span>
                </div>
                {DEPT_DATA.map((d,i)=>(
                  <div key={d.code} className="an-comp-row" style={{animationDelay:`${i*0.06}s`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className="an-comp-badge" style={{background:d.bg,color:d.color}}>{d.code}</div>
                      <span style={{fontSize:11.5,fontWeight:600}}>{d.name}</span>
                    </div>
                    {[d.avgScore,d.completion,d.attendance,d.placement].map((v,mi)=>(
                      <div key={mi} style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{flex:1}}><AnimBar pct={v} color={d.color} delay={300+mi*40+i*30} h={4}/></div>
                        <span style={{fontSize:11,fontWeight:700,color:d.color,width:30}}>{v}%</span>
                      </div>
                    ))}
                    <span style={{fontFamily:"'Fraunces',serif",fontSize:15,color:d.color}}>{d.students}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COURSES ── */}
      {tab==="Courses"&&(
        <div className="an-tab-body">
          <div className="an-panel">
            <div className="an-panel-hd">
              <div className="an-panel-ttl"><IcoBook style={{color:"var(--teal)"}}/> Top Performing Courses</div>
              <span className="an-badge">{TOP_COURSES.length} courses shown</span>
            </div>
            <div className="an-panel-body">
              <div className="an-courses-table">
                <div className="an-course-head">
                  <span>#</span><span>Course</span><span>Dept</span><span>Faculty</span>
                  <span>Enrolled</span><span>Rating</span><span>Completion</span><span>Trend</span>
                </div>
                {TOP_COURSES.map((c,i)=>(
                  <div key={i} className="an-course-row" style={{animationDelay:`${i*0.06}s`}}>
                    <span className="an-course-rank">{i+1}</span>
                    <span className="an-course-name">{c.name}</span>
                    <span><div className="an-course-dept">{c.dept}</div></span>
                    <span className="an-course-faculty">{c.faculty}</span>
                    <span>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div className="an-enroll-bar" style={{width:`${(c.enrolled/c.capacity)*100}%`}}/>
                        <span style={{fontSize:10,fontWeight:600,color:"var(--teal)"}}>{c.enrolled}/{c.capacity}</span>
                      </div>
                    </span>
                    <span style={{color:"var(--amber)",fontWeight:700,display:"flex",alignItems:"center",gap:3}}><IcoStar style={{color:"var(--amber)"}}/>{c.rating}</span>
                    <span>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{flex:1,minWidth:60}}><AnimBar pct={c.completion} color="var(--teal)" delay={300+i*50} h={5}/></div>
                        <span style={{fontSize:10,fontWeight:700,color:"var(--teal)",width:28}}>{c.completion}%</span>
                      </div>
                    </span>
                    <span><Spark data={c.trend} color="var(--indigo-ll)" w={56} h={22}/></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Course Metrics */}
          <div className="an-two-col" style={{marginTop:16}}>
            <div className="an-panel">
              <div className="an-panel-hd"><div className="an-panel-ttl"><IcoAward style={{color:"var(--amber)"}}/> Dept Avg Scores</div></div>
              <div className="an-panel-body" style={{paddingTop:10}}>
                {DEPT_DATA.map((d,i)=>(
                  <div key={d.code} className="an-dept-score-row" style={{animationDelay:`${0.4+i*0.07}s`}}>
                    <div className="an-dept-score-badge" style={{background:d.bg,color:d.color}}>{d.code}</div>
                    <div style={{flex:1}}><AnimBar pct={d.avgScore} color={d.color} delay={400+i*80} h={5}/></div>
                    <div style={{fontSize:12,fontWeight:700,color:d.color,width:36,textAlign:"right"}}>{d.avgScore}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="an-panel">
              <div className="an-panel-hd"><div className="an-panel-ttl"><IcoActivity style={{color:"var(--indigo-ll)"}}/> Completion Rate</div></div>
              <div className="an-panel-body" style={{paddingTop:10}}>
                {DEPT_DATA.map((d,i)=>(
                  <div key={d.code} className="an-dept-score-row" style={{animationDelay:`${0.4+i*0.07}s`}}>
                    <div className="an-dept-score-badge" style={{background:d.bg,color:d.color}}>{d.code}</div>
                    <div style={{flex:1}}><AnimBar pct={d.completion} color={d.color} delay={400+i*80} h={5}/></div>
                    <div style={{fontSize:12,fontWeight:700,color:d.color,width:36,textAlign:"right"}}>{d.completion}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PLACEMENT ── */}
      {tab==="Placement"&&(
        <div className="an-tab-body">
          <div className="an-row-main">
            <div className="an-panel an-panel-wide">
              <div className="an-panel-hd">
                <div className="an-panel-ttl"><IcoBriefcase style={{color:"var(--amber)"}}/> Placement Rate Trend <span>{range}</span></div>
                <span className="an-badge amber">+6% YoY</span>
              </div>
              <div className="an-panel-body">
                <div className="an-chart-headline">
                  <div><div className="an-hl-num" style={{color:"var(--amber)"}}>83%</div><div className="an-hl-lbl">Current rate AY 2024-25</div></div>
                  <div><div className="an-hl-num" style={{color:"var(--teal)"}}>92</div><div className="an-hl-lbl">Total offers</div></div>
                  <div><div className="an-hl-num" style={{color:"var(--indigo-ll)"}}>28 LPA</div><div className="an-hl-lbl">Highest package</div></div>
                  <div><div className="an-hl-num" style={{color:"var(--violet)"}}>7.2 LPA</div><div className="an-hl-lbl">Avg package</div></div>
                </div>
                <LineAreaChart datasets={[
                  {data:d.placement,color:"var(--amber)",label:"Placement %",strokeWidth:2.5},
                ]} labels={d.labels} height={140}/>
              </div>
            </div>
            <div className="an-right-col">
              <div className="an-panel" style={{flex:1}}>
                <div className="an-panel-hd"><div className="an-panel-ttl"><IcoBuilding style={{color:"var(--amber)"}}/> By Department</div></div>
                <div className="an-panel-body" style={{paddingTop:10}}>
                  {DEPT_DATA.map((d,i)=>(
                    <div key={d.code} className="an-dept-score-row" style={{animationDelay:`${0.3+i*0.07}s`}}>
                      <div className="an-dept-score-badge" style={{background:d.bg,color:d.color}}>{d.code}</div>
                      <div style={{flex:1}}><AnimBar pct={d.placement} color={d.color} delay={300+i*70} h={5}/></div>
                      <div style={{fontSize:12,fontWeight:700,color:d.color,width:36,textAlign:"right"}}>{d.placement}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Company Table */}
          <div className="an-panel" style={{marginTop:16}}>
            <div className="an-panel-hd">
              <div className="an-panel-ttl"><IcoBriefcase style={{color:"var(--teal)"}}/> Company-wise Placement Breakdown</div>
            </div>
            <div className="an-panel-body">
              <div className="an-comp-placement-table">
                <div className="an-cpt-head">
                  <span>Company</span><span>CS</span><span>DS</span><span>IT</span><span>ECE</span><span>ME</span><span>CE</span><span>Total</span><span>Pkg</span>
                </div>
                {PLACEMENT_BY_DEPT.map((p,i)=>{
                  const total=["cs","ds","it","ece","me","ce"].reduce((a,k)=>a+p[k],0);
                  return(
                    <div key={i} className="an-cpt-row" style={{animationDelay:`${i*0.07}s`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                        <span className="an-cpt-company">{p.company}</span>
                      </div>
                      {["cs","ds","it","ece","me","ce"].map(k=>(
                        <span key={k} style={{fontWeight:p[k]>0?700:400,color:p[k]>0?"var(--text)":"var(--text3)"}}>{p[k]||"—"}</span>
                      ))}
                      <span style={{fontFamily:"'Fraunces',serif",fontSize:15,color:p.color,fontWeight:400}}>{total}</span>
                      <span style={{fontSize:11,fontWeight:700,color:p.color}}>{p.pkg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ATTENDANCE ── */}
      {tab==="Attendance"&&(
        <div className="an-tab-body">
          <div className="an-row-main">
            <div className="an-panel an-panel-wide">
              <div className="an-panel-hd">
                <div className="an-panel-ttl"><IcoCal style={{color:"var(--violet)"}}/> Attendance Trend <span>{range}</span></div>
                <span className="an-badge violet">+1.2% avg</span>
              </div>
              <div className="an-panel-body">
                <div className="an-chart-headline">
                  <div><div className="an-hl-num" style={{color:"var(--violet)"}}>79%</div><div className="an-hl-lbl">Current avg attendance</div></div>
                  <div><div className="an-hl-num" style={{color:"var(--teal)"}}>87%</div><div className="an-hl-lbl">DS Dept (highest)</div></div>
                  <div><div className="an-hl-num" style={{color:"var(--rose)"}}>73%</div><div className="an-hl-lbl">CE Dept (lowest)</div></div>
                </div>
                <LineAreaChart datasets={[
                  {data:d.attendance,color:"var(--violet)",label:"Attendance %",strokeWidth:2.5},
                ]} labels={d.labels} height={140}/>
              </div>
            </div>
            <div className="an-right-col">
              <div className="an-panel" style={{flex:1}}>
                <div className="an-panel-hd"><div className="an-panel-ttl"><IcoBuilding style={{color:"var(--violet)"}}/> By Department</div></div>
                <div className="an-panel-body" style={{paddingTop:10}}>
                  {DEPT_DATA.map((d,i)=>(
                    <div key={d.code} className="an-dept-score-row" style={{animationDelay:`${0.3+i*0.07}s`}}>
                      <div className="an-dept-score-badge" style={{background:d.bg,color:d.color}}>{d.code}</div>
                      <div style={{flex:1}}><AnimBar pct={d.attendance} color={d.color} delay={300+i*70} h={5}/></div>
                      <div style={{fontSize:12,fontWeight:700,color:d.color,width:36,textAlign:"right"}}>{d.attendance}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HEATMAP */}
          <div className="an-panel" style={{marginTop:16}}>
            <div className="an-panel-hd">
              <div className="an-panel-ttl"><IcoCal style={{color:"var(--indigo-ll)"}}/> 12-Week Platform Activity Heatmap</div>
              <span style={{fontSize:10,color:"var(--text3)"}}>Daily active user sessions</span>
            </div>
            <div className="an-panel-body">
              <AttendanceHeatmap data={HEATMAP_DATA}/>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}