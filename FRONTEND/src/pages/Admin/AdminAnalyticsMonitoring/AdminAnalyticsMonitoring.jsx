// AdminAnalyticsMonitoring.jsx — SMART CAMPUS Analytics & Monitoring
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminAnalyticsMonitoring.css";

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const icons = {
  grid:       <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  users:      <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  book:       <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
  bar:        <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  settings:   <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  bell:       <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  search:     <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  logout:     <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  menu:       <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  x:          <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  plus:       <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  edit:       <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:      <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></>,
  shield:     <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  zap:        <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  cpu:        <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></>,
  db:         <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
  wifi:       <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  award:      <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
  trend:      <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  trendUp:    <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  layers:     <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  globe:      <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  chevronR:   <><polyline points="9 18 15 12 9 6"/></>,
  chevronL:   <><polyline points="15 18 9 12 15 6"/></>,
  userPlus:   <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
  download:   <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  refresh:    <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  briefcase:  <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  activity:   <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  calendar:   <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  pieChart:   <><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></>,
  eye:        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  clock:      <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  check:      <><polyline points="20 6 9 17 4 12"/></>,
  alertTri:   <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  info:       <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  filter:     <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  target:     <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  hash:       <><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></>,
};
const I = ({ n, size = 16 }) => <Icon size={size} d={icons[n]} />;

/* ─────────────────────────────────────────
   NAV (same as AdminDashboard)
───────────────────────────────────────── */
const NAV = [
  { section:"Overview",   items:[
    { id:"dashboard",   label:"Dashboard",       icon:"grid",      routePath:"",               badge:null },
    { id:"analytics",   label:"Analytics",       icon:"bar",       routePath:"adminAnalytics",  badge:null },
  ]},
  { section:"Management", items:[
    { id:"users",       label:"User Management", icon:"users",     routePath:"userManagement",  badge:"1.3k" },
    { id:"courses",     label:"Courses",         icon:"book",      routePath:"courseManagement",badge:"47" },
    { id:"departments", label:"Departments",     icon:"layers",    routePath:"department",      badge:null },
    { id:"placement",   label:"Placement",       icon:"briefcase", routePath:"placement",       badge:"3",   badgeType:"teal" },
  ]},
  { section:"Platform",   items:[
    { id:"reports",     label:"Reports",         icon:"download",  routePath:"adminReports",    badge:null },
    { id:"activity",    label:"Activity Log",    icon:"activity",  routePath:"activitylog",     badge:"12",  badgeType:"rose" },
    { id:"security",    label:"Security",        icon:"shield",    routePath:"security",        badge:null },
    { id:"settings",    label:"Settings",        icon:"settings",  routePath:"settings",        badge:null },
  ]},
];

const getActiveId = (pathname) => {
  for (const sec of NAV) {
    for (const item of sec.items) {
      if (item.routePath === "") {
        if (pathname === "/admindashboard" || pathname === "/admindashboard/") return item.id;
      } else {
        if (pathname.includes(item.routePath)) return item.id;
      }
    }
  }
  return "dashboard";
};

/* ─────────────────────────────────────────
   CHART DATA
───────────────────────────────────────── */
const USER_GROWTH = [
  { month:"Aug", students:820, faculty:58, total:878 },
  { month:"Sep", students:910, faculty:60, total:970 },
  { month:"Oct", students:980, faculty:61, total:1041 },
  { month:"Nov", students:1020, faculty:62, total:1082 },
  { month:"Dec", students:1050, faculty:62, total:1112 },
  { month:"Jan", students:1180, faculty:63, total:1243 },
  { month:"Feb", students:1240, faculty:64, total:1304 },
  { month:"Mar", students:1347, faculty:65, total:1412 },
];

const DAILY_SESSIONS = [
  { day:"Mon", val:62 }, { day:"Tue", val:78 }, { day:"Wed", val:91 },
  { day:"Thu", val:84 }, { day:"Fri", val:95 }, { day:"Sat", val:52 }, { day:"Sun", val:41 },
  { day:"Mon", val:70 }, { day:"Tue", val:85 }, { day:"Wed", val:88 },
  { day:"Thu", val:79 }, { day:"Fri", val:98 }, { day:"Sat", val:55 }, { day:"Sun", val:44 },
];

const DEPT_PERF = [
  { name:"CSE",   engage:88, completion:82, satisfaction:91, color:"var(--indigo-l)" },
  { name:"ECE",   engage:74, completion:69, satisfaction:78, color:"var(--violet)" },
  { name:"MECH",  engage:61, completion:55, satisfaction:67, color:"var(--amber)" },
  { name:"CIVIL", engage:44, completion:40, satisfaction:58, color:"var(--teal)" },
  { name:"MBA",   engage:72, completion:65, satisfaction:80, color:"var(--rose)" },
];

const TOP_COURSES = [
  { name:"Data Structures & Algorithms", dept:"CSE",   enrolled:142, completion:76, rating:4.8, trend:"up" },
  { name:"Machine Learning Fundamentals",dept:"CSE",   enrolled:127, completion:83, rating:4.9, trend:"up" },
  { name:"Digital Signal Processing",    dept:"ECE",   enrolled:98,  completion:61, rating:4.5, trend:"up" },
  { name:"Marketing Management",         dept:"MBA",   enrolled:63,  completion:52, rating:4.3, trend:"neu" },
  { name:"Thermodynamics",               dept:"MECH",  enrolled:84,  completion:48, rating:4.1, trend:"neu" },
  { name:"Structural Analysis",          dept:"CIVIL", enrolled:72,  completion:35, rating:3.9, trend:"dn" },
];

const TRAFFIC_SOURCES = [
  { label:"Direct",   pct:38, color:"#7b6ffa" },
  { label:"Mobile App",pct:29, color:"#27c9b0" },
  { label:"Portal",   pct:19, color:"#f4a535" },
  { label:"API",      pct:14, color:"#9f7aea" },
];

const SYSTEM_METRICS = [
  { label:"00:00", cpu:28, mem:55, net:18 },
  { label:"03:00", cpu:22, mem:52, net:12 },
  { label:"06:00", cpu:31, mem:54, net:24 },
  { label:"09:00", cpu:68, mem:61, net:72 },
  { label:"12:00", cpu:74, mem:65, net:85 },
  { label:"15:00", cpu:59, mem:63, net:68 },
  { label:"18:00", cpu:82, mem:68, net:91 },
  { label:"21:00", cpu:45, mem:60, net:52 },
  { label:"Now",   cpu:34, mem:61, net:44 },
];

const ALERTS = [
  { type:"warn",  icon:"alertTri", color:"rgba(244,165,53,.12)", tc:"var(--amber)", msg:"WebRTC latency above 100ms threshold for 32 minutes", time:"32 mins ago" },
  { type:"info",  icon:"info",     color:"rgba(91,78,248,.1)",   tc:"var(--indigo-ll)", msg:"Scheduled backup completed — 2.4 GB archived", time:"6 hrs ago" },
  { type:"error", icon:"alertTri", color:"rgba(242,68,92,.1)",   tc:"var(--rose)", msg:"3 failed login attempts auto-blocked from IP 192.168.1.42", time:"32 mins ago" },
  { type:"ok",    icon:"check",    color:"rgba(39,201,176,.1)",  tc:"var(--teal)", msg:"All placement drive registrations verified successfully", time:"3 hrs ago" },
];

/* ─────────────────────────────────────────
   SVG CHARTS
───────────────────────────────────────── */

// Smooth polyline from data points
function polyline(points, width, height, padX = 30, padY = 20) {
  const maxY = Math.max(...points);
  const minY = Math.min(...points) * 0.9;
  const rangeY = maxY - minY || 1;
  const stepX = (width - padX * 2) / (points.length - 1);
  return points.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - (v - minY) / rangeY) * (height - padY * 2);
    return `${x},${y}`;
  }).join(" ");
};

function areaPath(points, width, height, padX = 30, padY = 20) {
  const maxY = Math.max(...points);
  const minY = Math.min(...points) * 0.9;
  const rangeY = maxY - minY || 1;
  const stepX = (width - padX * 2) / (points.length - 1);
  const base = height - padY;
  const top = points.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - (v - minY) / rangeY) * (height - padY * 2);
    return `${x},${y}`;
  });
  const firstX = padX;
  const lastX = padX + (points.length - 1) * stepX;
  return `M${firstX},${base} L${top.join(" L")} L${lastX},${base} Z`;
}

function LineChart({ datasets, width = 580, height = 160, labels }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="ana-svg">
      <defs>
        {datasets.map((ds, i) => (
          <linearGradient key={i} id={`lgArea${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ds.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={ds.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1={30} y1={20 + f * 120} x2={width - 10} y2={20 + f * 120}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      {/* X labels */}
      {labels.map((l, i) => {
        const x = 30 + i * ((width - 40) / (labels.length - 1));
        return (
          <text key={i} x={x} y={height - 2} textAnchor="middle"
            fill="rgba(150,150,185,0.55)" fontSize="9" fontFamily="Plus Jakarta Sans, sans-serif">
            {l}
          </text>
        );
      })}
      {/* Area fills */}
      {datasets.map((ds, i) => (
        <path key={i} d={areaPath(ds.values, width, height - 14)} fill={`url(#lgArea${i})`} />
      ))}
      {/* Lines */}
      {datasets.map((ds, i) => (
        <polyline key={i} points={polyline(ds.values, width, height - 14)}
          fill="none" stroke={ds.color} strokeWidth="2" strokeLinejoin="round"
          strokeLinecap="round"
          style={{ strokeDasharray: 600, strokeDashoffset: 600, animation: `drawLine 1.4s ${i * 0.2}s ease forwards` }}
        />
      ))}
      {/* Dots on last point */}
      {datasets.map((ds, i) => {
        const pts = polyline(ds.values, width, height - 14).split(" ");
        const last = pts[pts.length - 1].split(",");
        return (
          <g key={i}>
            <circle cx={last[0]} cy={last[1]} r="4" fill={ds.color} opacity="0.9" />
            <circle cx={last[0]} cy={last[1]} r="7" fill="none" stroke={ds.color} strokeWidth="1" opacity="0.3" />
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data, size = 140 }) {
  const r = 46, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const slices = data.map(d => {
    const pct = d.pct / 100;
    const slice = { ...d, dashArray: pct * circumference, dashOffset: -offset * circumference };
    offset += pct;
    return slice;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="16"
          strokeDasharray={`${s.dashArray} ${circumference}`}
          strokeDashoffset={s.dashOffset}
          style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px`,
            transition: `stroke-dasharray 1s ${i * 0.15}s ease` }}
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#ddddf0" fontSize="16"
        fontFamily="Fraunces, serif" fontWeight="400">98%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(150,150,185,.6)" fontSize="8"
        fontFamily="Plus Jakarta Sans, sans-serif">Uptime</text>
    </svg>
  );
}

function SystemChart({ data, width = 420, height = 110 }) {
  const keys = ["cpu", "mem", "net"];
  const colors = ["#7b6ffa", "#9f7aea", "#27c9b0"];
  const labels = data.map(d => d.label);
  const datasets = keys.map((k, i) => ({ values: data.map(d => d[k]), color: colors[i] }));
  return <LineChart datasets={datasets} labels={labels} width={width} height={height} />;
}

/* ─────────────────────────────────────────
   HEATMAP (7 × 24 engagement grid)
───────────────────────────────────────── */
const DAYS_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const generateHeat = () => DAYS_LABELS.map(d =>
  HOURS.map(h => {
    const base = (h >= 9 && h <= 18) ? 0.6 : 0.1;
    const weekend = (d === "Sat" || d === "Sun") ? 0.35 : 1;
    return Math.min(1, (base + Math.random() * 0.4) * weekend);
  })
);
const HEAT_DATA = generateHeat();
const heatColor = (v) => {
  if (v < 0.2) return "rgba(91,78,248,0.06)";
  if (v < 0.4) return "rgba(91,78,248,0.18)";
  if (v < 0.6) return "rgba(91,78,248,0.38)";
  if (v < 0.8) return "rgba(123,111,250,0.6)";
  return "rgba(123,111,250,0.85)";
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function AdminAnalyticsMonitoring() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [sidebarOpen, setSidebar] = useState(false);
  const [range, setRange]         = useState("7d");
  const [chartTab, setChartTab]   = useState("users");
  const cursorRef     = useRef(null);
  const cursorRingRef = useRef(null);

  const active = getActiveId(location.pathname);
  const now    = new Date().toLocaleDateString();

  const handleNavClick = (e, item) => {
    e.preventDefault();
    navigate(item.routePath === "" ? "/admindashboard" : `/admindashboard/${item.routePath}`);
    setSidebar(false);
  };

  // Cursor
  useEffect(() => {
    const cursor = cursorRef.current, ring = cursorRingRef.current;
    if (!cursor || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = e => { mx = e.clientX; my = e.clientY; cursor.style.transform = `translate(${mx}px,${my}px)`; };
    let raf;
    const tick = () => { rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12; ring.style.transform = `translate(${rx}px,${ry}px)`; raf = requestAnimationFrame(tick); };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  // Bar animations
  useEffect(() => {
    const fills = document.querySelectorAll("[data-width]");
    const t = setTimeout(() => { fills.forEach(el => { el.style.width = el.dataset.width; }); }, 300);
    return () => clearTimeout(t);
  }, [range, chartTab]);

  const chartDatasets = {
    users: [
      { values: USER_GROWTH.map(d => d.students), color: "#7b6ffa", label: "Students" },
      { values: USER_GROWTH.map(d => d.faculty),  color: "#27c9b0", label: "Faculty" },
    ],
    total: [
      { values: USER_GROWTH.map(d => d.total), color: "#a89fff", label: "Total Users" },
    ],
    sessions: [
      { values: DAILY_SESSIONS.map(d => d.val), color: "#f4a535", label: "Sessions" },
    ],
  };

  return (
    <>
      <div className="sc-cursor"      ref={cursorRef} />
      <div className="sc-cursor-ring" ref={cursorRingRef} />
      <div className="sc-noise" />

      <div className="app">
        {/* Overlay */}
        <div className={`sb-overlay ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebar(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? "sb-open" : ""}`}>
          <div className="sb-top">
            <a href="/admindashboard" className="sb-brand" onClick={e => { e.preventDefault(); navigate("/admindashboard"); }}>
              <div className="sb-mark">SC</div>
              <span className="sb-name">Smart Campus</span>
            </a>
            <button className="sb-mobile-close" onClick={() => setSidebar(false)}><I n="x" size={14} /></button>
          </div>
          <div className="sb-user">
            <div className="sb-avatar">SA</div>
            <div>
              <div className="sb-uname">Super Admin</div>
              <div className="sb-urole">System Administrator</div>
            </div>
          </div>
          <nav className="sb-nav">
            {NAV.map(sec => (
              <div key={sec.section}>
                <div className="sb-sec-label">{sec.section}</div>
                {sec.items.map(item => (
                  <a key={item.id}
                    href={item.routePath === "" ? "/admindashboard" : `/admindashboard/${item.routePath}`}
                    className={`sb-link ${active === item.id ? "active" : ""}`}
                    onClick={e => handleNavClick(e, item)}
                  >
                    <I n={item.icon} size={15} />
                    {item.label}
                    {item.badge && <span className={`sb-badge ${item.badgeType || ""}`}>{item.badge}</span>}
                  </a>
                ))}
              </div>
            ))}
          </nav>
          <div className="sb-bottom">
            <div className="sb-health">
              <div className="sb-health-lbl">System Health</div>
              {[["Uptime","99.8%"], ["CPU","34%"], ["Memory","61%"]].map(([n, v]) => (
                <div key={n}>
                  <div className="sb-health-row">
                    <span className="sb-health-name">{n}</span>
                    <span className="sb-health-val">{v}</span>
                  </div>
                  <div className="sb-health-bar">
                    <div className="sb-health-fill" data-width={v} style={{ width: 0 }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="sb-logout" onClick={() => navigate("/login")}>
              <I n="logout" size={14} /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">

          {/* ── TOPBAR ── */}
          <header className="topbar">
            <button className="tb-hamburger" onClick={() => setSidebar(true)}><I n="menu" size={16} /></button>
            <span className="tb-page">Analytics & Monitoring</span>
            <div className="tb-sep" />
            <div className="tb-search">
              <I n="search" size={14} />
              <input placeholder="Search metrics, courses…" />
            </div>
            <div className="tb-right">
              <span className="tb-role-tag">Admin</span>
              <span className="tb-date">{now}</span>
              <button className="tb-icon-btn tooltip" data-tip="Refresh"><I n="refresh" size={15} /></button>
              <button className="tb-icon-btn tooltip" data-tip="Notifications">
                <I n="bell" size={15} /><span className="notif-dot" />
              </button>
              <button className="tb-icon-btn tooltip" data-tip="Settings" onClick={() => navigate("/admindashboard/settings")}>
                <I n="settings" size={15} />
              </button>
            </div>
          </header>

          {/* ── CONTENT ── */}
          <main className="content">

            {/* ── PAGE HEADER ── */}
            <div className="ana-page-header">
              <div>
                <div className="greet-tag" style={{ marginBottom:"10px" }}>
                  <div className="greet-pip" />
                  <span className="greet-pip-txt">Live Dashboard</span>
                </div>
                <h1 className="greet-title">Analytics & <em>Monitoring</em></h1>
                <p className="greet-sub">Platform-wide insights — updated in real time &nbsp;·&nbsp; March 2026</p>
              </div>
              <div className="ana-range-picker">
                {["24h","7d","30d","90d"].map(r => (
                  <button key={r} className={`range-btn ${range === r ? "active" : ""}`} onClick={() => setRange(r)}>{r}</button>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ marginLeft:"6px" }}>
                  <I n="download" size={12} /> Export
                </button>
              </div>
            </div>

            {/* ── KPI ROW ── */}
            <div className="stat-grid" style={{ marginBottom:"20px" }}>
              {[
                { accent:"sc-indigo", icon:"users",    val:"1,347", lbl:"Active Users",      delta:"+12%",  dir:"up",  sub:"vs last month",  kpi:"↑ 163 new" },
                { accent:"sc-teal",   icon:"eye",      val:"8,492", lbl:"Daily Sessions",    delta:"+18%",  dir:"up",  sub:"vs last week",   kpi:"peak: 1,102" },
                { accent:"sc-amber",  icon:"clock",    val:"24m",   lbl:"Avg Session Length",delta:"+3m",   dir:"up",  sub:"vs last month",  kpi:"21m baseline" },
                { accent:"sc-rose",   icon:"activity", val:"98%",   lbl:"Platform Uptime",   delta:"-0.2%", dir:"dn",  sub:"SLA: 99.9%",     kpi:"1 degraded svc" },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.accent}`} style={{ animationDelay:`${i * 80}ms` }}>
                  <div className="stat-ic"><I n={s.icon} size={16} /></div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"6px" }}>
                    <span className={`stat-delta delta-${s.dir}`}>
                      {s.dir === "up" ? "↑" : "↓"} {s.delta} <span style={{ fontWeight:300, opacity:.7 }}>{s.sub}</span>
                    </span>
                    <span style={{ fontSize:"9px", color:"var(--text3)" }}>{s.kpi}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── ROW 1: MAIN CHART + DONUT ── */}
            <div className="main-grid-wide" style={{ marginBottom:"0" }}>
              {/* User Growth / Sessions Line Chart */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="trendUp" size={15} /> Growth Trends</div>
                  <div className="tab-row" style={{ borderBottom:"none", margin:0, gap:"3px" }}>
                    {[["users","Users"],["total","Total"],["sessions","Sessions"]].map(([k, lbl]) => (
                      <button key={k} className={`tab-btn ${chartTab === k ? "active" : ""}`}
                        style={{ padding:"5px 11px", fontSize:"10px" }}
                        onClick={() => setChartTab(k)}>{lbl}</button>
                    ))}
                  </div>
                </div>
                <div className="panel-body">
                  {/* Legend */}
                  <div style={{ display:"flex", gap:"14px", marginBottom:"10px" }}>
                    {chartDatasets[chartTab].map((ds, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                        <div style={{ width:22, height:2, background:ds.color, borderRadius:2 }} />
                        <span style={{ fontSize:"10px", color:"var(--text3)" }}>{ds.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ana-chart-wrap">
                    <LineChart
                      key={chartTab}
                      datasets={chartDatasets[chartTab]}
                      labels={chartTab === "sessions" ? DAILY_SESSIONS.map(d => d.day) : USER_GROWTH.map(d => d.month)}
                      width={560} height={155}
                    />
                  </div>
                  {/* Sparkline summary row */}
                  <div className="ana-summary-row">
                    {[
                      { label:"Peak users today",  val:"1,102", color:"var(--indigo-ll)" },
                      { label:"New registrations", val:"+163",  color:"var(--teal)" },
                      { label:"Churned this month",val:"-12",   color:"var(--rose)" },
                      { label:"7-day avg sessions",val:"1,291", color:"var(--amber)" },
                    ].map((s, i) => (
                      <div key={i} className="ana-sum-item">
                        <div className="ana-sum-val" style={{ color:s.color }}>{s.val}</div>
                        <div className="ana-sum-lbl">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Uptime + Traffic Sources */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="pieChart" size={15} /> Traffic Sources</div>
                  <span style={{ fontSize:"9px", color:"var(--text3)" }}>Last {range}</span>
                </div>
                <div className="panel-body">
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:"16px" }}>
                    <DonutChart data={TRAFFIC_SOURCES} size={150} />
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    {TRAFFIC_SOURCES.map((s, i) => (
                      <div key={i}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                            <div style={{ width:8, height:8, borderRadius:2, background:s.color }} />
                            <span style={{ fontSize:"11px", color:"var(--text2)" }}>{s.label}</span>
                          </div>
                          <span style={{ fontSize:"11px", fontWeight:700, color:s.color }}>{s.pct}%</span>
                        </div>
                        <div className="dept-bar">
                          <div className="dept-fill" data-width={`${s.pct}%`}
                            style={{ width:0, background:s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Uptime pill */}
                  <div className="ana-uptime-row">
                    <div className="ana-uptime-pill">
                      <span className="ana-uptime-dot" />
                      <span>All systems checked</span>
                    </div>
                    <span style={{ fontSize:"10px", color:"var(--text3)" }}>2 mins ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW 2: DEPT PERFORMANCE + TOP COURSES ── */}
            <div className="main-grid-wide">
              {/* Department Performance */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="layers" size={15} /> Department Performance</div>
                  <button className="panel-act" onClick={() => navigate("/admindashboard/department")}>
                    Full View <I n="chevronR" size={11} />
                  </button>
                </div>
                <div className="panel-body">
                  {/* Multi-metric header */}
                  <div className="dept-metric-legend">
                    {[["Engagement","var(--indigo-l)"],["Completion","var(--teal)"],["Satisfaction","var(--violet)"]].map(([l,c]) => (
                      <div key={l} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:c }} />
                        <span style={{ fontSize:"9.5px", color:"var(--text3)" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                    {DEPT_PERF.map((d, i) => (
                      <div key={i} className="dept-multi-row">
                        <div className="dept-multi-name">
                          <span style={{ fontSize:"11px", fontWeight:700, color:d.color }}>{d.name}</span>
                        </div>
                        <div className="dept-multi-bars">
                          {[
                            { val:d.engage,       color:"var(--indigo-l)" },
                            { val:d.completion,   color:"var(--teal)" },
                            { val:d.satisfaction, color:"var(--violet)" },
                          ].map((bar, j) => (
                            <div key={j} className="dept-mini-bar-row">
                              <div className="dept-bar" style={{ flex:1 }}>
                                <div className="dept-fill" data-width={`${bar.val}%`}
                                  style={{ width:0, background:bar.color }} />
                              </div>
                              <span style={{ fontSize:"9px", fontWeight:600, color:bar.color, width:"28px", textAlign:"right" }}>
                                {bar.val}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Courses */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="award" size={15} /> Top Courses</div>
                  <button className="panel-act" onClick={() => navigate("/admindashboard/courseManagement")}>
                    All Courses <I n="chevronR" size={11} />
                  </button>
                </div>
                <div className="panel-body" style={{ padding:"0" }}>
                  <table className="user-table" style={{ fontSize:"11px" }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Course</th>
                        <th>Enrolled</th>
                        <th>Done</th>
                        <th>⭐</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TOP_COURSES.map((c, i) => (
                        <tr key={i}>
                          <td style={{ color:"var(--text3)", fontFamily:"Fraunces, serif", fontSize:"14px" }}>{i + 1}</td>
                          <td>
                            <div style={{ fontWeight:600, fontSize:"11px", marginBottom:"2px" }}>{c.name}</div>
                            <div style={{ fontSize:"9.5px", color:"var(--text3)" }}>{c.dept}</div>
                          </td>
                          <td style={{ color:"var(--indigo-ll)", fontWeight:600 }}>{c.enrolled}</td>
                          <td>
                            <span className={`stat-delta delta-${c.trend === "up" ? "up" : c.trend === "dn" ? "dn" : "neu"}`}
                              style={{ fontSize:"9px", padding:"2px 6px" }}>
                              {c.completion}%
                            </span>
                          </td>
                          <td style={{ color:"var(--amber)", fontWeight:700, fontSize:"11px" }}>{c.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── ROW 3: SYSTEM PERFORMANCE + ENGAGEMENT HEATMAP ── */}
            <div className="main-grid-wide">
              {/* System Performance Over Time */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="cpu" size={15} /> System Performance <span>Today</span></div>
                  <div style={{ display:"flex", gap:"10px" }}>
                    {[["CPU","var(--indigo-l)"],["Memory","var(--violet)"],["Network","var(--teal)"]].map(([l,c]) => (
                      <div key={l} style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                        <div style={{ width:14, height:2, background:c, borderRadius:2 }} />
                        <span style={{ fontSize:"9.5px", color:"var(--text3)" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel-body">
                  <SystemChart data={SYSTEM_METRICS} width={480} height={110} />
                  {/* Current metrics */}
                  <div className="sys-current-row">
                    {[
                      { label:"CPU",     val:"34%", pct:34, color:"var(--indigo-l)",  icon:"cpu" },
                      { label:"Memory",  val:"61%", pct:61, color:"var(--violet)",    icon:"db" },
                      { label:"Network", val:"44%", pct:44, color:"var(--teal)",      icon:"wifi" },
                      { label:"Disk",    val:"48%", pct:48, color:"var(--amber)",     icon:"layers" },
                    ].map((m, i) => (
                      <div key={i} className="sys-cur-card">
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
                          <span style={{ fontSize:"10px", color:"var(--text3)" }}>{m.label}</span>
                          <I n={m.icon} size={11} />
                        </div>
                        <div style={{ fontFamily:"Fraunces, serif", fontSize:"20px", color:m.color, lineHeight:1, marginBottom:"6px" }}>{m.val}</div>
                        <div className="dept-bar" style={{ height:"3px" }}>
                          <div className="dept-fill" data-width={`${m.pct}%`}
                            style={{ width:0, background:m.color, transition:"width 1.2s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts & Events */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="alertTri" size={15} /> Alerts & Events</div>
                  <button className="panel-act" onClick={() => navigate("/admindashboard/activitylog")}>
                    View All <I n="chevronR" size={11} />
                  </button>
                </div>
                <div className="panel-body">
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    {ALERTS.map((a, i) => (
                      <div key={i} className="ana-alert-item" style={{ borderColor: a.type === "error" ? "rgba(242,68,92,.18)" : a.type === "warn" ? "rgba(244,165,53,.15)" : "var(--border)" }}>
                        <div className="act-icon" style={{ background:a.color, color:a.tc, width:28, height:28, minWidth:28, borderRadius:"7px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <I n={a.icon} size={12} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"11px", color:"var(--text2)", lineHeight:1.5, marginBottom:"3px" }}>{a.msg}</div>
                          <div style={{ fontSize:"9px", color:"var(--text3)" }}>{a.time}</div>
                        </div>
                        <div className={`ana-alert-type ana-alert-${a.type}`}>
                          {a.type === "ok" ? "OK" : a.type.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* SLA tracker */}
                  <div className="ana-sla-box">
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                      <span style={{ fontSize:"11px", fontWeight:700, color:"var(--text2)" }}>SLA Compliance</span>
                      <span style={{ fontSize:"11px", fontWeight:700, color:"var(--teal)" }}>98.2%</span>
                    </div>
                    {[
                      { label:"Response Time < 200ms", pct:96, color:"var(--teal)" },
                      { label:"Uptime Target 99.9%",   pct:98, color:"var(--indigo-l)" },
                      { label:"Error Rate < 0.1%",     pct:99, color:"var(--violet)" },
                    ].map((sl, i) => (
                      <div key={i} style={{ marginBottom:"8px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                          <span style={{ fontSize:"10px", color:"var(--text3)" }}>{sl.label}</span>
                          <span style={{ fontSize:"10px", fontWeight:600, color:sl.color }}>{sl.pct}%</span>
                        </div>
                        <div className="dept-bar">
                          <div className="dept-fill" data-width={`${sl.pct}%`}
                            style={{ width:0, background:sl.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW 4: ENGAGEMENT HEATMAP ── */}
            <div className="panel">
              <div className="panel-hd">
                <div className="panel-ttl"><I n="hash" size={15} /> Engagement Heatmap <span>Hourly activity — last 7 days</span></div>
                <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                  <span style={{ fontSize:"9px", color:"var(--text3)" }}>Low</span>
                  {["rgba(91,78,248,0.06)","rgba(91,78,248,0.18)","rgba(91,78,248,0.38)","rgba(123,111,250,0.6)","rgba(123,111,250,0.85)"].map((c,i) => (
                    <div key={i} style={{ width:12, height:12, borderRadius:3, background:c }} />
                  ))}
                  <span style={{ fontSize:"9px", color:"var(--text3)" }}>High</span>
                </div>
              </div>
              <div className="panel-body" style={{ overflowX:"auto" }}>
                <div className="heatmap-wrap">
                  {/* Hour labels */}
                  <div className="heatmap-hour-labels">
                    <div style={{ width:36 }} />
                    {HOURS.filter((_, i) => i % 3 === 0).map(h => (
                      <div key={h} className="heatmap-hlbl">{h}:00</div>
                    ))}
                  </div>
                  {/* Rows */}
                  {DAYS_LABELS.map((day, di) => (
                    <div key={day} className="heatmap-row">
                      <span className="heatmap-day">{day}</span>
                      <div className="heatmap-cells">
                        {HEAT_DATA[di].map((v, hi) => (
                          <div key={hi} className="heat-cell" style={{ background:heatColor(v) }}
                            title={`${day} ${hi}:00 — ${Math.round(v * 100)}% activity`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ROW 5: COHORT RETENTION + FUNNEL ── */}
            <div className="main-grid-3">
              {/* Retention */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="target" size={15} /> Retention</div>
                </div>
                <div className="panel-body">
                  <div style={{ textAlign:"center", marginBottom:"14px" }}>
                    <div style={{ fontFamily:"Fraunces, serif", fontSize:"42px", color:"var(--teal)", lineHeight:1 }}>78%</div>
                    <div style={{ fontSize:"11px", color:"var(--text3)", marginTop:"4px" }}>30-day retention rate</div>
                    <div style={{ fontSize:"10px", color:"var(--teal)", marginTop:"2px" }}>↑ +6% vs last cohort</div>
                  </div>
                  {[
                    { label:"Week 1",  pct:98, color:"var(--indigo-l)" },
                    { label:"Week 2",  pct:91, color:"var(--violet)" },
                    { label:"Week 4",  pct:78, color:"var(--teal)" },
                    { label:"Week 8",  pct:63, color:"var(--amber)" },
                    { label:"Week 12", pct:51, color:"var(--rose)" },
                  ].map((r, i) => (
                    <div key={i} style={{ marginBottom:"8px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                        <span style={{ fontSize:"10px", color:"var(--text3)" }}>{r.label}</span>
                        <span style={{ fontSize:"10px", fontWeight:600, color:r.color }}>{r.pct}%</span>
                      </div>
                      <div className="dept-bar">
                        <div className="dept-fill" data-width={`${r.pct}%`} style={{ width:0, background:r.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement Funnel */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="filter" size={15} /> Engagement Funnel</div>
                </div>
                <div className="panel-body">
                  <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginTop:"4px" }}>
                    {[
                      { label:"Registered Users",   n:1347, color:"var(--indigo-l)",  pct:100 },
                      { label:"Logged In (30d)",    n:1108, color:"var(--violet)",    pct:82 },
                      { label:"Enrolled in Course", n:921,  color:"var(--teal)",      pct:68 },
                      { label:"Completed Module",   n:684,  color:"var(--amber)",     pct:51 },
                      { label:"Took Quiz",          n:502,  color:"var(--rose)",      pct:37 },
                      { label:"Earned Badge",       n:291,  color:"var(--indigo-ll)", pct:22 },
                    ].map((f, i) => (
                      <div key={i} className="funnel-stage" style={{ "--funnel-w": `${f.pct}%`, "--funnel-c": f.color }}>
                        <div className="funnel-bar-bg">
                          <div className="funnel-bar-fill" data-width={`${f.pct}%`} style={{ width:0 }} />
                        </div>
                        <div className="funnel-label-row">
                          <span style={{ fontSize:"10.5px", color:"var(--text2)" }}>{f.label}</span>
                          <span style={{ fontSize:"10px", fontWeight:700, color:f.color }}>{f.n.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats: Placement + Content */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="zap" size={15} /> Quick Metrics</div>
                </div>
                <div className="panel-body">
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                    {[
                      { icon:"briefcase", label:"Placement Rate",    val:"73%",   sub:"of eligible students", color:"rgba(244,165,53,.1)",  tc:"var(--amber)" },
                      { icon:"book",      label:"Courses Published", val:"47",    sub:"across 5 departments", color:"rgba(91,78,248,.1)",   tc:"var(--indigo-ll)" },
                      { icon:"zap",       label:"Quizzes Auto-Graded",val:"2,841",sub:"this semester",        color:"rgba(39,201,176,.1)",  tc:"var(--teal)" },
                      { icon:"users",     label:"Faculty Active",    val:"65",    sub:"out of 68 total",      color:"rgba(159,122,234,.1)", tc:"var(--violet)" },
                      { icon:"award",     label:"Avg Course Rating", val:"4.5★",  sub:"out of 5.0",           color:"rgba(244,165,53,.08)", tc:"var(--amber)" },
                      { icon:"shield",    label:"Security Events",   val:"12",    sub:"3 need review",        color:"rgba(242,68,92,.1)",   tc:"var(--rose)" },
                    ].map((q, i) => (
                      <div key={i} className="qm-row" style={{ background:q.color, borderColor:`${q.tc}20` }}>
                        <div style={{ color:q.tc, display:"flex", alignItems:"center" }}>
                          <I n={q.icon} size={13} />
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:"11px", color:"var(--text2)" }}>{q.label}</div>
                          <div style={{ fontSize:"9.5px", color:"var(--text3)" }}>{q.sub}</div>
                        </div>
                        <div style={{ fontFamily:"Fraunces, serif", fontSize:"17px", color:q.tc, lineHeight:1 }}>{q.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}