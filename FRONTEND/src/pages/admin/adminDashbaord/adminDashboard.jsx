// AdminDashboard.jsx — Smart Campus Admin Dashboard (Professional Rebuild)
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminDashboard.css";
import AdminDepartments from "../adminDepartments/adminDepartments";
import AdminPlacements from "../adminPlacements/adminPlacements";
import AdminReports from "../adminReports/adminreports";
import AdminNotifications from "../adminNotifications/adminNotifications";
import AdminAuditLogs from "../adminAuditLogs/adminAuditLogs";
import AdminSystemConfig from "../adminSystemConfig/adminSystemConfig";
import AdminUserManagement from "../adminUserManagement/adminUserManagement";
import AdminCourseManagement from "../adminCourseManagement/adminCourseManagement";

// ─── ICONS ────────────────────────────────────────────────────────
const IcoDashboard = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoBar       = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoUsers     = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoBook      = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoBuilding  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/><path d="M3 15h6"/><path d="M15 3v18"/><path d="M15 9h6"/><path d="M15 15h6"/></svg>;
const IcoBriefcase = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcoTrend     = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoSettings  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 1 0 0 14.14"/><path d="M19.07 4.93L16 8"/></svg>;
const IcoBell      = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoUser      = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>;
const IcoSearch    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoChevR     = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoChevUp    = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoChevDn    = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoMinus     = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoClose     = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoSend      = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="#fff" stroke="none"/></svg>;
const IcoBrain     = (p) => <svg {...p} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;
const IcoAlert     = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoCheck     = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoShield    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoActivity  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IcoHamburger = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoLogout    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoServer    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
const IcoUpload    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcoCal       = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

// ─── ROUTES ──────────────────────────────────────────────────────
const ROUTES = {
  DASHBOARD:"Dashboard", ANALYTICS:"Analytics",
  USER_MANAGEMENT:"User Management", COURSE_MGMT:"Course Management",
  DEPARTMENTS:"Departments", PLACEMENTS:"Placements", REPORTS:"Reports",
  NOTIFICATIONS:"Notifications", AUDIT_LOGS:"Audit Logs", SYSTEM_CONFIG:"System Config",
};
const PAGE_PARAM_MAP = {
  "adminanalytics":ROUTES.ANALYTICS,"usermanagement":ROUTES.USER_MANAGEMENT,
  "coursemanagement":ROUTES.COURSE_MGMT,"departments":ROUTES.DEPARTMENTS,
  "placements":ROUTES.PLACEMENTS,"adminreports":ROUTES.REPORTS,
  "notifications":ROUTES.NOTIFICATIONS,"auditlogs":ROUTES.AUDIT_LOGS,
  "systemconfig":ROUTES.SYSTEM_CONFIG,
};
const ROUTE_TO_URL = {
  [ROUTES.DASHBOARD]:"/admindashboard",[ROUTES.ANALYTICS]:"/admindashboard/adminAnalytics",
  [ROUTES.USER_MANAGEMENT]:"/admindashboard/userManagement",[ROUTES.COURSE_MGMT]:"/admindashboard/courseManagement",
  [ROUTES.DEPARTMENTS]:"/admindashboard/departments",[ROUTES.PLACEMENTS]:"/admindashboard/placements",
  [ROUTES.REPORTS]:"/admindashboard/adminReports",[ROUTES.NOTIFICATIONS]:"/admindashboard/notifications",
  [ROUTES.AUDIT_LOGS]:"/admindashboard/auditLogs",[ROUTES.SYSTEM_CONFIG]:"/admindashboard/systemConfig",
};
const NAV_ITEMS = [
  { section:"Overview", links:[{label:ROUTES.DASHBOARD,icon:<IcoDashboard/>},{label:ROUTES.ANALYTICS,icon:<IcoBar/>,badge:"Live"}]},
  { section:"Management", links:[{label:ROUTES.USER_MANAGEMENT,icon:<IcoUsers/>,badge:"8",badgeClass:"rose"},{label:ROUTES.COURSE_MGMT,icon:<IcoBook/>},{label:ROUTES.DEPARTMENTS,icon:<IcoBuilding/>},{label:ROUTES.PLACEMENTS,icon:<IcoBriefcase/>}]},
  { section:"Reports & Logs", links:[{label:ROUTES.REPORTS,icon:<IcoTrend/>},{label:ROUTES.NOTIFICATIONS,icon:<IcoBell/>,badge:"5",badgeClass:"amber"},{label:ROUTES.AUDIT_LOGS,icon:<IcoActivity/>}]},
  { section:"System", links:[{label:ROUTES.SYSTEM_CONFIG,icon:<IcoSettings/>}]},
];

// ─── DATA ────────────────────────────────────────────────────────
const TREND_DATA = [65,72,68,80,75,88,82,91,86,94,89,97];
const MONTHS     = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];

const DEPT_DATA = [
  {name:"Computer Science",code:"CS", students:480,faculty:22,courses:38,completion:88,color:"var(--indigo-l)",  bg:"rgba(91,78,248,.12)"},
  {name:"Electronics",     code:"ECE",students:360,faculty:18,courses:28,completion:82,color:"var(--teal)",      bg:"rgba(39,201,176,.1)"},
  {name:"Mechanical Engg", code:"ME", students:280,faculty:16,courses:22,completion:79,color:"var(--amber)",     bg:"rgba(244,165,53,.1)"},
  {name:"Civil Engg",      code:"CE", students:220,faculty:14,courses:18,completion:74,color:"var(--rose)",      bg:"rgba(242,68,92,.1)"},
  {name:"Info Technology", code:"IT", students:140,faculty:10,courses:12,completion:85,color:"var(--violet)",    bg:"rgba(159,122,234,.1)"},
  {name:"Data Science",    code:"DS", students:80, faculty:7, courses:6, completion:92,color:"var(--indigo-ll)", bg:"rgba(168,159,255,.1)"},
];

const RECENT_USERS = [
  {name:"Dr. Meera Pillai",  role:"Faculty",  dept:"CS",  time:"2m ago",  status:"active",  avatar:"MP"},
  {name:"Riya Kapoor",       role:"Student",  dept:"ECE", time:"18m ago", status:"active",  avatar:"RK"},
  {name:"Prof. Suresh Nair", role:"Faculty",  dept:"ME",  time:"1h ago",  status:"pending", avatar:"SN"},
  {name:"Aman Verma",        role:"Student",  dept:"CS",  time:"2h ago",  status:"active",  avatar:"AV"},
  {name:"Lakshmi Reddy",     role:"Student",  dept:"DS",  time:"3h ago",  status:"pending", avatar:"LR"},
  {name:"Dr. Vikram Singh",  role:"Faculty",  dept:"CE",  time:"5h ago",  status:"active",  avatar:"VS"},
];

const SYSTEM_SERVICES = [
  {name:"API Gateway",   uptime:99.9,status:"ok",  latency:"42ms",  color:"var(--teal)"},
  {name:"PostgreSQL DB", uptime:99.8,status:"ok",  latency:"12ms",  color:"var(--teal)"},
  {name:"File Storage",  uptime:82.1,status:"warn",latency:"—",     color:"var(--amber)"},
  {name:"AI Services",   uptime:97.3,status:"ok",  latency:"180ms", color:"var(--teal)"},
  {name:"Video CDN",     uptime:71.4,status:"err", latency:"680ms", color:"var(--rose)"},
  {name:"Email SMTP",    uptime:99.1,status:"ok",  latency:"95ms",  color:"var(--teal)"},
];

const AUDIT_FEED = [
  {action:"Bulk CSV import",        actor:"Admin",            detail:"312 student records",       time:"09:14", type:"info"},
  {action:"Failed login ×5",        actor:"Unknown IP",       detail:"192.168.1.44 — blocked",    time:"08:52", type:"danger"},
  {action:"Course published",       actor:"Dr. Prakash",      detail:"Advanced DBMS · CS502",     time:"08:30", type:"success"},
  {action:"SSL cert warning",       actor:"System",           detail:"Expires in 7 days",         time:"07:00", type:"warn"},
  {action:"Storage alert",          actor:"System",           detail:"Disk at 82%",               time:"06:45", type:"warn"},
  {action:"New faculty account",    actor:"Admin",            detail:"Dr. Meera Pillai created",  time:"Yesterday", type:"success"},
  {action:"Placement drive created",actor:"Placement Officer",detail:"Infosys — 28 Feb 2025",    time:"Yesterday", type:"info"},
];

const PLACEMENT_DATA = [
  {company:"Google",    offers:4,  pkg:"28 LPA", color:"var(--teal)"},
  {company:"Microsoft", offers:6,  pkg:"22 LPA", color:"var(--indigo-ll)"},
  {company:"Amazon",    offers:9,  pkg:"18 LPA", color:"var(--amber)"},
  {company:"Infosys",   offers:28, pkg:"4.5 LPA",color:"var(--indigo-l)"},
  {company:"TCS",       offers:35, pkg:"3.8 LPA", color:"var(--violet)"},
];

const PENDING_TASKS = [
  {label:"Approve 8 new student registrations",   cat:"Users",    due:"Today",   urgent:true},
  {label:"Review 3 pending faculty requests",     cat:"Users",    due:"Today",   urgent:true},
  {label:"Renew SSL certificate",                 cat:"System",   due:"7 days",  urgent:true},
  {label:"Publish Sem 6 timetable — DS Dept",    cat:"Academic", due:"Tomorrow",urgent:false},
  {label:"Finalize Infosys placement drive",      cat:"Placement",due:"3 days",  urgent:false},
  {label:"Monthly analytics report export",       cat:"Reports",  due:"5 days",  urgent:false},
];

const AI_RESPONSES = [
  "Platform summary: <strong style='color:var(--teal)'>1,842 users</strong> active. Storage at <strong style='color:var(--amber)'>82%</strong> — archiving old lecture videos recommended. 📊",
  "CS leads with <strong style='color:var(--indigo-ll)'>94% completion rate</strong>. DS Dept has highest avg score at <strong style='color:var(--teal)'>81%</strong>.",
  "Placement rate this year: <strong style='color:var(--teal)'>83%</strong> — up <strong style='color:var(--teal)'>+6%</strong> vs last year. 3 offers above 20 LPA. 🎉",
  "⚠️ Detected <strong style='color:var(--rose)'>5 failed logins</strong> from IP 192.168.1.44. Adding to firewall blocklist recommended.",
  "Enrollment trend is up <strong style='color:var(--teal)'>+49%</strong> YoY. DS and IT depts growing fastest.",
];

// ─── HELPERS ─────────────────────────────────────────────────────
function addRipple(e, el) {
  const r = document.createElement("span"); r.className = "ripple";
  const rect = el.getBoundingClientRect(), s = Math.max(rect.width,rect.height);
  r.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-rect.left-s/2}px;top:${e.clientY-rect.top-s/2}px`;
  el.appendChild(r); r.addEventListener("animationend",()=>r.remove());
}

function useCursor() {
  useEffect(() => {
    const cur=document.getElementById("ac-cursor"), ring=document.getElementById("ac-cursor-ring");
    if(!cur||!ring) return;
    let mx=0,my=0,rx=0,ry=0,rafId;
    const onMove=e=>{mx=e.clientX;my=e.clientY;};
    const tick=()=>{cur.style.left=mx+"px";cur.style.top=my+"px";rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+"px";ring.style.top=ry+"px";rafId=requestAnimationFrame(tick);};
    const onDown=()=>document.body.classList.add("ac-click");
    const onUp=()=>document.body.classList.remove("ac-click");
    document.addEventListener("mousemove",onMove); document.addEventListener("mousedown",onDown); document.addEventListener("mouseup",onUp);
    rafId=requestAnimationFrame(tick);
    return()=>{document.removeEventListener("mousemove",onMove);document.removeEventListener("mousedown",onDown);document.removeEventListener("mouseup",onUp);cancelAnimationFrame(rafId);};
  },[]);
}

function Hoverable({children,className="",style,...rest}){
  return <div className={className} style={style} onMouseEnter={()=>document.body.classList.add("ac-hover")} onMouseLeave={()=>document.body.classList.remove("ac-hover")} {...rest}>{children}</div>;
}

function Btn({children,className="",onClick,style}){
  const ref=useRef();
  return <button ref={ref} className={`btn ${className}`} style={style} onMouseEnter={()=>document.body.classList.add("ac-hover")} onMouseLeave={()=>document.body.classList.remove("ac-hover")} onClick={e=>{addRipple(e,ref.current);onClick?.(e);}}>{children}</button>;
}

function AnimatedBar({pct,color,height=3,delay=400}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),delay);return()=>clearTimeout(t);},[pct,delay]);
  return <div style={{height,background:"var(--surface3)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${w}%`,background:color,borderRadius:2,transition:"width 1.1s ease"}}/></div>;
}

function Sparkline({data,color,id}){
  const max=Math.max(...data),min=Math.min(...data),h=40,w=100;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/(max-min||1))*(h-8)-4}`).join(" ");
  const lastPt=pts.split(" ").at(-1).split(",");
  return (
    <svg width={w} height={h} style={{display:"block",overflow:"visible"}}>
      <defs><linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg-${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={lastPt[0]} cy={lastPt[1]} r="2.5" fill={color}/>
    </svg>
  );
}

function DonutChart({pct,color,size=88,sw=8}){
  const [anim,setAnim]=useState(0);
  const r=(size-sw*2)/2, circ=2*Math.PI*r;
  useEffect(()=>{const t=setTimeout(()=>setAnim(pct),700);return()=>clearTimeout(t);},[pct]);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={sw}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={circ*(1-anim/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1)"}}/>
    </svg>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────
function Sidebar({open,onClose,activePage,onNavigate,adminName}){
  const logoutNav=useNavigate();
  const handleLogout=()=>{localStorage.removeItem("token");localStorage.removeItem("user");logoutNav("/login",{replace:true});};
  const ROUTABLE=new Set(Object.values(ROUTES));
  return(
    <>
      <div className={`sb-overlay ${open?"visible":""}`} onClick={onClose}/>
      <aside className={`sidebar ${open?"sb-open":""}`}>
        <div className="sb-top">
          <a href="#" className="sb-brand">
            <div className="sb-mark">SC</div>
            <span className="sb-name">SmartCampus</span>
          </a>
          <button className="sb-mobile-close" onClick={onClose}><IcoClose/></button>
        </div>
        <div className="sb-user">
          <div className="sb-avatar">{adminName?adminName.split(" ").map(x=>x[0]).join(""):"AD"}</div>
          <div className="sb-user-info">
            <div className="sb-uname">{adminName||"Administrator"}</div>
            <div className="sb-urole"><IcoShield width={9} height={9}/> Super Admin</div>
          </div>
        </div>
        <nav className="sb-nav">
          {NAV_ITEMS.map(({section,links})=>(
            <div key={section}>
              <div className="sb-sec-label">{section}</div>
              {links.map(({label,icon,badge,badgeClass})=>{
                const isActive=activePage===label;
                return(
                  <a key={label} href="#" className={`sb-link ${isActive?"active":""}`} onClick={e=>{e.preventDefault();if(ROUTABLE.has(label)){onNavigate(label);onClose();}}}>
                    {icon}{label}{badge&&<span className={`sb-badge ${badgeClass||""}`}>{badge}</span>}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sb-bottom">
          <div className="sb-health-banner">
            <div className="sb-health-left"><div className="sb-health-dot ok"/><span>4/6 Services OK</span></div>
            <div className="sb-health-right warn">1 Alert</div>
          </div>
          <div className="sb-mini-stat-row">
            <div className="sb-mini-stat"><div className="sb-mini-val teal">1,842</div><div className="sb-mini-lbl">Users</div></div>
            <div className="sb-mini-sep"/>
            <div className="sb-mini-stat"><div className="sb-mini-val indigo">124</div><div className="sb-mini-lbl">Courses</div></div>
            <div className="sb-mini-sep"/>
            <div className="sb-mini-stat"><div className="sb-mini-val amber">99.7%</div><div className="sb-mini-lbl">Uptime</div></div>
          </div>
          <a href="#" className="sb-link" onClick={e=>e.preventDefault()}><IcoSettings/> Settings</a>
          <button className="sb-logout" onClick={handleLogout}><IcoLogout/> Sign Out</button>
        </div>
      </aside>
    </>
  );
}

// ─── TOPBAR ──────────────────────────────────────────────────────
function Topbar({onHamburger,onNavigate}){
  const date=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
  return(
    <div className="topbar">
      <button className="tb-hamburger" onClick={onHamburger}><IcoHamburger/></button>
      <div className="tb-brand-pill"><IcoShield width={11} height={11} style={{color:"var(--indigo-ll)"}}/><span>Admin Console</span></div>
      <div className="tb-sep"/>
      <div className="tb-search">
        <IcoSearch style={{color:"var(--text3)",flexShrink:0}}/>
        <input type="text" placeholder="Search users, courses, departments, logs…"/>
        <span className="tb-kbd">⌘K</span>
      </div>
      <div className="tb-right">
        <div className="tb-status-pill"><div className="tb-status-dot"/><span>Systems OK</span></div>
        <span className="tb-date">{date}</span>
        <div className="tb-icon-btn"><IcoBell/><div className="notif-dot"/></div>
        <div className="tb-icon-btn"><IcoUser/></div>
        <Btn className="btn-solid" style={{padding:"7px 14px",fontSize:11,gap:5}} onClick={()=>onNavigate(ROUTES.USER_MANAGEMENT)}><IcoUsers width={12} height={12}/> Manage Users</Btn>
      </div>
    </div>
  );
}

// ─── AI PANEL ────────────────────────────────────────────────────
function AiPanel({open,onClose}){
  const [messages,setMessages]=useState([
    {role:"ai",html:"Hello, Admin 👋 Platform at <strong style='color:var(--teal)'>99.7% uptime</strong>. <strong style='color:var(--rose)'>2 critical alerts</strong> need attention."},
    {role:"user",html:"Show me today's platform summary."},
    {role:"ai",html:"📊 <strong>Today's snapshot:</strong><br/>• <strong style='color:var(--teal)'>1,842</strong> users · 124 courses active<br/>• <strong style='color:var(--rose)'>8</strong> pending registrations<br/>• Storage at <strong style='color:var(--amber)'>82%</strong> — archive recommended<br/>• Video CDN degraded: <strong style='color:var(--rose)'>71% uptime</strong>"},
  ]);
  const [input,setInput]=useState(""); const [typing,setTyping]=useState(false);
  const [chips,setChips]=useState(true); const [aiIdx,setAiIdx]=useState(0);
  const msgRef=useRef();
  useEffect(()=>{if(msgRef.current)msgRef.current.scrollTop=msgRef.current.scrollHeight;},[messages,typing]);
  const send=useCallback((text)=>{
    const val=text||input.trim();if(!val)return;
    setMessages(m=>[...m,{role:"user",html:val}]);
    setInput("");setChips(false);setTyping(true);
    setTimeout(()=>{setTyping(false);setMessages(m=>[...m,{role:"ai",html:AI_RESPONSES[aiIdx%AI_RESPONSES.length]}]);setAiIdx(i=>i+1);},960);
  },[input,aiIdx]);
  return(
    <div className={`lucyna-panel ${open?"open":""}`}>
      <div className="lp-header">
        <div className="lp-orb"><div className="lp-orb-ring"/><IcoBrain width={17} height={17}/></div>
        <div><div className="lp-name">Lucyna — Admin Mode</div><div className="lp-status"><div className="lp-dot"/>Elevated Access · Real-time</div></div>
        <button className="lp-close" onClick={onClose}><IcoClose/></button>
      </div>
      <div className="lp-messages" ref={msgRef}>
        {messages.map((m,i)=>(
          <div key={i} className={`lp-msg ${m.role==="user"?"user":""}`}>
            <div className={`msg-av ${m.role==="ai"?"ai-av":"usr-av"}`}>{m.role==="ai"?"L":"A"}</div>
            <div className={`msg-bubble ${m.role}`} dangerouslySetInnerHTML={{__html:m.html}}/>
          </div>
        ))}
        {typing&&<div className="lp-msg"><div className="msg-av ai-av">L</div><div className="msg-bubble ai"><div className="typing-dots"><span/><span/><span/></div></div></div>}
      </div>
      {chips&&<div className="lp-suggestions">{["Platform summary","Storage fix","Placement stats","Pending users","System alerts"].map(c=><span key={c} className="lp-chip" onClick={()=>send(c)}>{c}</span>)}</div>}
      <div className="lp-input-row">
        <div className="lp-input-wrap">
          <input className="lp-input" value={input} placeholder="Ask about users, system, analytics…" onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
          {input&&<button className="lp-clear" onClick={()=>setInput("")}><IcoClose width={10} height={10}/></button>}
        </div>
        <label className="lp-attach"><input type="file" style={{display:"none"}}/><IcoUpload/></label>
        <button className="lp-send" onClick={()=>send()}><IcoSend/></button>
      </div>
    </div>
  );
}

function AiFab({onClick}){
  return(
    <button className="lucyna-fab" onClick={onClick}>
      <div className="lucyna-fab-ring"/><div className="lucyna-fab-dot"/>
      <IcoBrain/><span className="lucyna-fab-tip">AI Assistant</span>
    </button>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────
export default function AdminDashboard(){
  const navigateRouter=useNavigate();
  const {page}=useParams();
  const [activePage,setActivePage]=useState(()=>{if(!page)return ROUTES.DASHBOARD;return PAGE_PARAM_MAP[page.toLowerCase()]||ROUTES.DASHBOARD;});
  const [aiOpen,setAiOpen]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [checked,setChecked]=useState([]);
  const [adminName]=useState("Admin User");
  const [activeBar,setActiveBar]=useState(11);

  useCursor();

  useEffect(()=>{if(!page)setActivePage(ROUTES.DASHBOARD);else{const m=PAGE_PARAM_MAP[page.toLowerCase()];if(m&&m!==activePage)setActivePage(m);}},[page]);
  useEffect(()=>{const h=e=>{if(e.key==="Escape"){setAiOpen(false);setSidebarOpen(false);}};document.addEventListener("keydown",h);return()=>document.removeEventListener("keydown",h);},[]);

  const navigate=useCallback((t)=>{setActivePage(t);navigateRouter(ROUTE_TO_URL[t]||"/admindashboard");},[navigateRouter]);
  const toggleTask=i=>setChecked(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i]);

  const renderContent=()=>{
    switch(activePage){
      case ROUTES.ANALYTICS:       return <div style={{padding:'2rem'}}><h2>Analytics Coming Soon</h2></div>;
      case ROUTES.USER_MANAGEMENT: return <AdminUserManagement       onBack={()=>navigate(ROUTES.DASHBOARD)}/>;
      case ROUTES.COURSE_MGMT:     return <AdminCourseManagement    onBack={()=>navigate(ROUTES.DASHBOARD)}/>;
      case ROUTES.DEPARTMENTS:     return <AdminDepartments         onBack={()=>navigate(ROUTES.DASHBOARD)}/>;
      case ROUTES.PLACEMENTS:      return <AdminPlacements         onBack={()=>navigate(ROUTES.DASHBOARD)}/>;
      case ROUTES.REPORTS:         return <AdminReports            onBack={()=>navigate(ROUTES.DASHBOARD)}/>;
      case ROUTES.NOTIFICATIONS:   return <AdminNotifications      onBack={()=>navigate(ROUTES.DASHBOARD)}/>;
      case ROUTES.AUDIT_LOGS:      return <AdminAuditLogs          onBack={()=>navigate(ROUTES.DASHBOARD)}/>;
      case ROUTES.SYSTEM_CONFIG:   return <AdminSystemConfig       onBack={()=>navigate(ROUTES.DASHBOARD)}/>;
      default:return null;
    }
  };
  const isDashboard=activePage===ROUTES.DASHBOARD;

  return(
    <>
      <div className="ac-cursor" id="ac-cursor"/>
      <div className="ac-cursor-ring" id="ac-cursor-ring"/>
      <div className="sc-noise"/>
      <AiFab onClick={()=>setAiOpen(o=>!o)}/>
      <AiPanel open={aiOpen} onClose={()=>setAiOpen(false)}/>
      <div className="app">
        <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} activePage={activePage} onNavigate={navigate} adminName={adminName}/>
        <main className="main">
          <Topbar onHamburger={()=>setSidebarOpen(o=>!o)} onNavigate={navigate}/>
          {!isDashboard&&renderContent()}
          {isDashboard&&(
            <div className="content">

              {/* ── GREETING BAR ── */}
              <div className="admin-greet">
                <div>
                  <div className="greet-tag"><div className="greet-pip"/><span className="greet-pip-txt">AY 2024–25 · Sem 5 · Admin Panel</span></div>
                  <h1 className="greet-title">Good morning, <em>{adminName.split(" ")[0]}</em></h1>
                  <p className="greet-sub">You have <strong style={{color:"var(--rose)"}}>3 urgent</strong> and {PENDING_TASKS.length} total pending actions.</p>
                </div>
                <div className="greet-actions">
                  <Btn className="btn-solid" onClick={()=>navigate(ROUTES.USER_MANAGEMENT)}><IcoUsers width={12} height={12}/> Manage Users</Btn>
                  <Btn className="btn-ghost" onClick={()=>navigate(ROUTES.REPORTS)}><IcoTrend width={12} height={12}/> Generate Report</Btn>
                  <Btn className="btn-ghost" onClick={()=>navigate(ROUTES.SYSTEM_CONFIG)}><IcoSettings width={12} height={12}/> System Config</Btn>
                </div>
              </div>

              {/* ── KPI CARDS ── */}
              <div className="kpi-grid">
                {[
                  {label:"Total Users",    val:"1,842",sub:"+48 this month", icon:<IcoUsers width={18} height={18}/>,     c:"var(--indigo-l)",  bg:"rgba(91,78,248,.1)",   t:"+2.6%",up:true,  id:"u",  spark:[62,68,64,72,70,78,75,82,80,87,84,90]},
                  {label:"Active Courses", val:"124",  sub:"Across 6 depts", icon:<IcoBook width={18} height={18}/>,      c:"var(--teal)",      bg:"rgba(39,201,176,.1)",  t:"+4.1%",up:true,  id:"c",  spark:[80,78,82,80,85,83,87,85,90,88,92,90]},
                  {label:"Placement Rate", val:"83%",  sub:"+6% vs last yr", icon:<IcoBriefcase width={18} height={18}/>, c:"var(--amber)",     bg:"rgba(244,165,53,.1)",  t:"+6%",  up:true,  id:"p",  spark:[65,68,67,72,70,74,73,77,76,80,79,83]},
                  {label:"Platform Uptime",val:"99.7%",sub:"Last 30 days",   icon:<IcoServer width={18} height={18}/>,    c:"var(--teal)",      bg:"rgba(39,201,176,.1)",  t:"stable",up:null, id:"up", spark:[99,100,99,100,100,99,100,99,100,100,99,100]},
                  {label:"Pending Actions",val:"8",    sub:"Needs attention", icon:<IcoAlert width={18} height={18}/>,     c:"var(--rose)",      bg:"rgba(242,68,92,.1)",   t:"−3",   up:false, id:"a",  spark:[14,12,11,10,9,11,10,9,10,9,8,8]},
                  {label:"Avg Attendance", val:"79%",  sub:"Platform-wide",   icon:<IcoCal width={18} height={18}/>,       c:"var(--violet)",    bg:"rgba(159,122,234,.1)", t:"+1.2%",up:true,  id:"at", spark:[74,75,73,76,75,77,76,78,77,79,78,79]},
                ].map(({label,val,sub,icon,c,bg,t,up,id,spark},i)=>(
                  <Hoverable key={label} className="kpi-card" style={{animationDelay:`${i*0.06}s`}}>
                    <div className="kpi-top">
                      <div className="kpi-icon" style={{background:bg,color:c}}>{icon}</div>
                      <div className={`kpi-trend ${up===true?"up":up===false?"dn":""}`}>
                        {up===true?<IcoChevUp/>:up===false?<IcoChevDn/>:<IcoMinus/>}{t}
                      </div>
                    </div>
                    <div className="kpi-val" style={{color:c}}>{val}</div>
                    <div className="kpi-label">{label}</div>
                    <div className="kpi-sub">{sub}</div>
                    <div className="kpi-spark"><Sparkline data={spark} color={c} id={id}/></div>
                  </Hoverable>
                ))}
              </div>

              {/* ── MAIN CHART ROW ── */}
              <div className="chart-row">

                {/* ENROLLMENT BAR CHART */}
                <div className="panel chart-panel-wide">
                  <div className="panel-hd">
                    <div className="panel-ttl"><IcoTrend width={14} height={14} style={{color:"var(--indigo-ll)"}}/> Platform Enrollment <span>AY 2024–25</span></div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span className="panel-badge">+49% YoY</span>
                      <a href="#" className="panel-act" onClick={e=>{e.preventDefault();navigate(ROUTES.ANALYTICS);}}>Full Analytics <IcoChevR/></a>
                    </div>
                  </div>
                  <div className="panel-body">
                    <div className="chart-header-row">
                      <div>
                        <div style={{fontFamily:"'Fraunces',serif",fontSize:36,fontWeight:400,color:"var(--indigo-ll)",lineHeight:1}}>1,560</div>
                        <div style={{fontSize:11,color:"var(--text3)",marginTop:4,fontWeight:300}}>Total enrolled students this year</div>
                      </div>
                      <div className="chart-legend-row">
                        <div className="legend-chip"><div className="legend-dot" style={{background:"var(--indigo-l)"}}/><span>Enrollment %</span></div>
                        <div className="legend-chip active-chip">{MONTHS[activeBar]} · {TREND_DATA[activeBar]}%</div>
                      </div>
                    </div>
                    <div className="bar-chart-container">
                      {TREND_DATA.map((v,i)=>{
                        const pct=(v/Math.max(...TREND_DATA))*100;
                        const isActive=i===activeBar;
                        return(
                          <div key={i} className="bar-col-wrap" onClick={()=>setActiveBar(i)}>
                            {isActive&&<div className="bar-tooltip-above">{v}%</div>}
                            <div className="bar-track">
                              <div className={`bar-fill-el ${isActive?"active":""}`} style={{height:`${pct}%`,background:isActive?"var(--indigo-l)":"rgba(91,78,248,.25)",boxShadow:isActive?"0 0 12px rgba(123,111,250,.6)":"none"}}/>
                            </div>
                            <div className={`bar-month-label ${isActive?"active":""}`}>{MONTHS[i]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* DEPT BREAKDOWN */}
                <div className="panel chart-panel-narrow">
                  <div className="panel-hd">
                    <div className="panel-ttl"><IcoBuilding width={14} height={14} style={{color:"var(--teal)"}}/> Departments <span>6 active</span></div>
                    <a href="#" className="panel-act" onClick={e=>{e.preventDefault();navigate(ROUTES.DEPARTMENTS);}}>Manage <IcoChevR/></a>
                  </div>
                  <div className="panel-body" style={{paddingTop:10}}>
                    {DEPT_DATA.map((d,i)=>(
                      <Hoverable key={d.code} className="dept-row" style={{animationDelay:`${0.4+i*0.07}s`}}>
                        <div className="dept-badge" style={{background:d.bg,color:d.color}}>{d.code}</div>
                        <div className="dept-info">
                          <div className="dept-name">{d.name}</div>
                          <div className="dept-meta">{d.students} · {d.faculty}f · {d.courses}c</div>
                        </div>
                        <div className="dept-completion">
                          <div className="dept-pct" style={{color:d.color}}>{d.completion}%</div>
                          <div className="dept-bar-mini"><AnimatedBar pct={d.completion} color={d.color} height={3} delay={500+i*70}/></div>
                        </div>
                      </Hoverable>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── MIDDLE ROW: USERS + TASKS + AUDIT ── */}
              <div className="middle-row">

                {/* RECENT USERS */}
                <div className="panel">
                  <div className="panel-hd">
                    <div className="panel-ttl"><IcoActivity width={14} height={14} style={{color:"var(--indigo-ll)"}}/> Recent Users</div>
                    <a href="#" className="panel-act" onClick={e=>{e.preventDefault();navigate(ROUTES.USER_MANAGEMENT);}}>All users <IcoChevR/></a>
                  </div>
                  <div className="panel-body" style={{paddingTop:10}}>
                    {RECENT_USERS.map((u,i)=>(
                      <Hoverable key={i} className="user-row">
                        <div className={`user-av ${u.role==="Faculty"?"fac":""}`}>{u.avatar}</div>
                        <div className="user-info">
                          <div className="user-name">{u.name}</div>
                          <div className="user-meta"><span className={`role-chip ${u.role==="Faculty"?"fac":"stu"}`}>{u.role}</span> {u.dept}</div>
                        </div>
                        <div className="user-right">
                          <div className={`status-dot ${u.status}`}/>
                          <div className="user-time">{u.time}</div>
                        </div>
                      </Hoverable>
                    ))}
                    <Btn className="btn-ghost" onClick={()=>navigate(ROUTES.USER_MANAGEMENT)} style={{width:"100%",justifyContent:"center",fontSize:11,padding:"8px",marginTop:10,gap:5}}>
                      <IcoUsers width={11} height={11}/> Manage All Users
                    </Btn>
                  </div>
                </div>

                {/* PENDING APPROVALS */}
                <div className="panel">
                  <div className="panel-hd">
                    <div className="panel-ttl"><IcoAlert width={14} height={14} style={{color:"var(--rose)"}}/> Pending Approvals <span style={{color:"var(--rose)"}}>{PENDING_TASKS.length-checked.length} left</span></div>
                    <a href="#" className="panel-act" onClick={e=>e.preventDefault()}>View all <IcoChevR/></a>
                  </div>
                  <div className="panel-body" style={{paddingTop:10}}>
                    {PENDING_TASKS.map((t,i)=>(
                      <Hoverable key={i} className={`task-item ${checked.includes(i)?"done":""}`} onClick={()=>toggleTask(i)}>
                        <div className={`task-check ${checked.includes(i)?"checked":""}`}>{checked.includes(i)&&<IcoCheck/>}</div>
                        <div className="task-body"><div className="task-label">{t.label}</div><div className="task-sub">{t.cat}</div></div>
                        <div className={`task-due ${t.urgent?"urgent":""}`}>{t.due}</div>
                      </Hoverable>
                    ))}
                  </div>
                </div>

                {/* AUDIT LOG */}
                <div className="panel">
                  <div className="panel-hd">
                    <div className="panel-ttl"><IcoShield width={14} height={14} style={{color:"var(--indigo-ll)"}}/> Audit Log</div>
                    <a href="#" className="panel-act" onClick={e=>{e.preventDefault();navigate(ROUTES.AUDIT_LOGS);}}>Full log <IcoChevR/></a>
                  </div>
                  <div className="panel-body" style={{paddingTop:10}}>
                    {AUDIT_FEED.map((a,i)=>(
                      <Hoverable key={i} className="audit-row">
                        <div className={`audit-pip ${a.type}`}/>
                        <div className="audit-info">
                          <div className="audit-action">{a.action} <span className="audit-by">· {a.actor}</span></div>
                          <div className="audit-detail">{a.detail}</div>
                        </div>
                        <div className="audit-time">{a.time}</div>
                      </Hoverable>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── BOTTOM ROW: SYSTEM HEALTH + PLACEMENT ── */}
              <div className="bottom-row">

                {/* SYSTEM HEALTH */}
                <div className="panel">
                  <div className="panel-hd">
                    <div className="panel-ttl"><IcoServer width={14} height={14} style={{color:"var(--teal)"}}/> System Health <span className="live-badge">Live</span></div>
                    <a href="#" className="panel-act" onClick={e=>{e.preventDefault();navigate(ROUTES.SYSTEM_CONFIG);}}>Configure <IcoChevR/></a>
                  </div>
                  <div className="panel-body">
                    <div className="sys-services-grid">
                      {SYSTEM_SERVICES.map((s,i)=>(
                        <Hoverable key={i} className={`sys-service-card ${s.status}`}>
                          <div className="sys-svc-top">
                            <span className="sys-svc-name">{s.name}</span>
                            <div className={`sys-svc-dot ${s.status}`}/>
                          </div>
                          <div className="sys-svc-uptime" style={{color:s.color}}>{s.uptime}%</div>
                          <AnimatedBar pct={s.uptime} color={s.color} height={4} delay={600+i*70}/>
                          <div className="sys-svc-latency">{s.latency}</div>
                        </Hoverable>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PLACEMENT SNAPSHOT */}
                <div className="panel">
                  <div className="panel-hd">
                    <div className="panel-ttl"><IcoBriefcase width={14} height={14} style={{color:"var(--amber)"}}/> Placement Snapshot <span>AY 2024–25</span></div>
                    <a href="#" className="panel-act" onClick={e=>{e.preventDefault();navigate(ROUTES.PLACEMENTS);}}>Full report <IcoChevR/></a>
                  </div>
                  <div className="panel-body">
                    <div className="placement-layout">
                      <div className="placement-donut-wrap">
                        <DonutChart pct={83} color="var(--amber)" size={96} sw={8}/>
                        <div className="donut-center-label">
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:24,color:"var(--amber)",lineHeight:1}}>83%</div>
                          <div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>placed</div>
                        </div>
                      </div>
                      <div className="placement-kpis">
                        <div className="pkpi"><div className="pkpi-val" style={{color:"var(--teal)"}}>92</div><div className="pkpi-lbl">Total Offers</div></div>
                        <div className="pkpi"><div className="pkpi-val" style={{color:"var(--amber)"}}>28 LPA</div><div className="pkpi-lbl">Highest Pkg</div></div>
                        <div className="pkpi"><div className="pkpi-val" style={{color:"var(--indigo-ll)"}}>7.2 LPA</div><div className="pkpi-lbl">Avg Package</div></div>
                        <div className="pkpi"><div className="pkpi-val" style={{color:"var(--violet)"}}>5</div><div className="pkpi-lbl">Companies</div></div>
                      </div>
                    </div>
                    <div className="pcomp-list">
                      {PLACEMENT_DATA.map((p,i)=>(
                        <Hoverable key={i} className="pcomp-row">
                          <div className="pcomp-left">
                            <div className="pcomp-dot" style={{background:p.color}}/>
                            <span className="pcomp-name">{p.company}</span>
                          </div>
                          <div className="pcomp-bar"><AnimatedBar pct={Math.round((p.offers/35)*100)} color={p.color} height={4} delay={700+i*60}/></div>
                          <div className="pcomp-right">
                            <span className="pcomp-count" style={{color:p.color}}>{p.offers}</span>
                            <span className="pcomp-pkg">{p.pkg}</span>
                          </div>
                        </Hoverable>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </>
  );
}