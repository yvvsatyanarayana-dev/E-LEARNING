// AdminNotifications.jsx — Smart Campus Admin
import { useState, useEffect, useRef } from "react";
import "./adminNotifications.css";
import api from "../../../utils/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────
   ICONS (inline SVG helpers)
───────────────────────────────────────── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
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
  layers:     <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  globe:      <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  check:      <><polyline points="20 6 9 17 4 12"/></>,
  info:       <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  chevronR:   <><polyline points="9 18 15 12 9 6"/></>,
  chevronL:   <><polyline points="15 18 9 12 15 6"/></>,
  moreH:      <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  userPlus:   <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
  download:   <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  refresh:    <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  briefcase:  <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  activity:   <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  mail:       <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
};
const I = ({ n, size = 16 }) => <Icon size={size} d={icons[n]} />;

const IcoChevL   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoBell    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoTrash   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
const IcoAlert   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoServer  = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
const IcoBook    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;

const COMPOSE_TARGETS=[
  {id:"all",     label:"All Users",         color:"var(--indigo-ll)"},
  {id:"students",label:"All Students",      color:"var(--teal)"},
  {id:"faculty", label:"All Faculty",       color:"var(--violet)"},
  {id:"cs",      label:"CS Department",     color:"var(--indigo-l)"},
  {id:"ece",     label:"ECE Department",    color:"var(--teal)"},
  {id:"ds",      label:"DS Department",     color:"var(--indigo-ll)"},
];

const CATS=["All","System","Users","Academic","Security"];

const TYPE_ICON = {danger:<IcoAlert/>,warn:<IcoAlert/>,system:<IcoServer/>,user:<IcoUsers/>,academic:<IcoBook/>,security:<IcoAlert/>,info:<IcoBell/>,success:<IcoCheck/>};
const TYPE_COLOR= {danger:"var(--rose)",warn:"var(--amber)",system:"var(--indigo-l)",user:"var(--teal)",academic:"var(--violet)",security:"var(--rose)",info:"var(--indigo-ll)",success:"var(--teal)"};
const CAT_ICON  = {System:<IcoServer/>,Users:<IcoUsers/>,Academic:<IcoBook/>,Security:<IcoAlert/>};

/* ─────────────────────────────────────────
   NAV HELPER — id maps to route path segment
───────────────────────────────────────── */
function buildNav(navBadges = {}) {
  return [
    { section:"Overview", items:[
      { id:"dashboard", label:"Dashboard",       icon:"grid",      routePath:"",               badge:null },
      { id:"analytics", label:"Analytics",       icon:"bar",       routePath:"analytics",      badge:null },
    ]},
    { section:"Management", items:[
      { id:"users",       label:"User Management", icon:"users",     routePath:"users",          badge:null },
      { id:"courses",     label:"Courses",         icon:"book",      routePath:"courses",        badge:null },
      { id:"departments", label:"Departments",     icon:"layers",    routePath:"departments",      badge:null },
      { id:"placement",   label:"Placement",       icon:"briefcase", routePath:"placements",       badge:null, badgeType:"teal" },
    ]},
    { section:"Platform", items:[
      { id:"reports",   label:"Reports",      icon:"download", routePath:"reports",   badge:null },
      { id:"activity",  label:"Activity Log", icon:"activity", routePath:"auditlogs", badge:null, badgeType:"rose" },
      { id:"mail",      label:"Mail System",  icon:"mail",     routePath:"mail",      badge:navBadges.mail || 0, badgeType:"teal" },
      { id:"security",  label:"Security",     icon:"shield",   routePath:"security",  badge:null },
      { id:"settings",  label:"Profile",      icon:"user",     routePath:"settings",  badge:null },
    ]},
  ];
}

const getActiveId = (pathname) => {
  const NAV = buildNav();
  for (const sec of NAV) {
    for (const item of sec.items) {
      if (item.routePath === "") {
        if (pathname === "/admindashboard" || pathname === "/admindashboard/") return item.id;
      } else { if (pathname.includes(`/admindashboard/${item.routePath}`)) return item.id; }
    }
  }
  return "dashboard";
};

export default function AdminNotifications({onBack}){
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebar] = useState(false);
  const [notifs,setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [catFilter,setCat] = useState("All");
  const [showUnread,setShowUnread]=useState(false);
  const [compose,setCompose]=useState(false);
  const [composeTarget, setComposeTarget] = useState("all");
  const [composeTitle, setComposeTitle]   = useState("System Update: New Features Available");
  const [composeBody, setComposeBody]     = useState("Hello Students and Faculty,\n\nWe have successfully implemented several new features in the Smart Campus portal, including enhanced analytics and a standardized administration interface.\n\nBest Regards,\nAdmin Team");
  const [composeEmail, setComposeEmail]   = useState(true);
  const [sent,setSent]=useState(false);
  const [navBadges, setNavBadges] = useState({});
  const [configStats, setConfigStats] = useState({ uptime: "99.9%", cpu: "0%", memory: "0%", backup_size: "0GB" });
  
  const pageRef       = useRef(null);
  const cursorRef     = useRef(null);
  const cursorRingRef = useRef(null);
  const active = getActiveId(location.pathname);
  const now    = new Date().toLocaleDateString();

  const NAV = buildNav(navBadges);

  const fetchMailCount = async () => {
    try {
      const res = await api.get("/mail/unread/count");
      setNavBadges(prev => ({ ...prev, mail: res.count || 0 }));
    } catch (err) {
      console.error("Failed to poll mail count", err);
    }
  };

  useEffect(() => {
    fetchMailCount();
    fetchData();
    const interval = setInterval(fetchMailCount, 30000);
    return () => clearInterval(interval);
  }, [catFilter]);

  useEffect(() => {
    const cursor = cursorRef.current; const cursorRing = cursorRingRef.current;
    if (!cursor || !cursorRing) return;
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    const onMove = (e) => { 
      mouseX = e.clientX; mouseY = e.clientY; 
      if (cursor) {
        cursor.style.opacity = "1";
        cursor.style.transform = `translate(${mouseX}px,${mouseY}px)`; 
      }
      if (cursorRing) {
        cursorRing.style.opacity = "1";
        cursorRing.style.transform = `translate(${mouseX}px,${mouseY}px)`; 
      }
    };
    let raf;
    const animate = () => { ringX += (mouseX - ringX) * 0.12; ringY += (mouseY - ringY) * 0.12; cursorRing.style.transform = `translate(${ringX}px,${ringY}px)`; raf = requestAnimationFrame(animate); };
    window.addEventListener("mousemove", onMove); raf = requestAnimationFrame(animate);

    const handleHover = () => document.querySelector(".admin-notifications-page")?.classList.add("c-hover");
    const handleUnhover = () => document.querySelector(".admin-notifications-page")?.classList.remove("c-hover");
    const handleClick = () => {
      const p = document.querySelector(".admin-notifications-page");
      p?.classList.add("c-click"); setTimeout(() => p?.classList.remove("c-click"), 200);
    };
    const interactive = document.querySelectorAll("button, a, input, .nt-item-body");
    interactive.forEach(el => { el.addEventListener("mouseenter", handleHover); el.addEventListener("mouseleave", handleUnhover); });
    window.addEventListener("mousedown", handleClick);

    return () => { 
      window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); 
      interactive.forEach(el => { el.removeEventListener("mouseenter", handleHover); el.removeEventListener("mouseleave", handleUnhover); });
      window.removeEventListener("mousedown", handleClick);
    };
  }, [loading, notifs]);

  const handleRefresh = () => {
    fetchData();
    fetchMailCount();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [nRes, nb, cs] = await Promise.all([
        api.get(`/admin/notifications?type=${catFilter}`),
        api.get("/admin/config/badges"),
        api.get("/admin/config/stats")
      ]);
      setNotifs(nRes.notifications || []);
      setUnreadCount(nRes.unread || 0);
      setNavBadges(nb);
      setConfigStats(cs);
    } catch (err) {
      console.error("Failed to fetch notifications data", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered=notifs.filter(n=>!showUnread||!n.is_read);

  const markRead = async (id) => {
    try {
      await api.post(`/admin/notifications/read/${id}`);
      setNotifs(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/admin/notifications/read-all");
      setNotifs(ns => ns.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifs(ns => ns.filter(n => n.id !== id));
      const n = notifs.find(x => x.id === id);
      if (n && !n.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const handleSend = async () => {
    if(!composeTitle.trim()) return;
    try {
      await api.post("/admin/notifications/broadcast", {
        type: "broadcast",
        title: composeTitle,
        message: composeBody,
        target: composeTarget,
        send_email: composeEmail
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setComposeTitle("System Update: New Features Available");
        setComposeBody("Hello Students and Faculty,\n\nWe have successfully implemented several new features in the Smart Campus portal, including enhanced analytics and a standardized administration interface.\n\nBest Regards,\nAdmin Team");
        fetchData();
      }, 2000);
    } catch (err) {
      console.error("Failed to send broadcast", err);
    }
  };
  return (
    <>
      <div className="sc-cursor" ref={cursorRef} />
      <div className="sc-cursor-ring" ref={cursorRingRef} />
      <div className="sc-noise" />

      <div className="admin-notifications-page app" ref={pageRef}>
        <div className={`sb-overlay ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebar(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? "sb-open" : ""}`}>
          <div className="sb-top">
            <a href="/admindashboard" className="sb-brand" onClick={e => { e.preventDefault(); navigate("/admindashboard"); }}>
              <div className="sb-mark">SC</div><span className="sb-name">Smart Campus</span>
            </a>
            <button className="sb-mobile-close" onClick={() => setSidebar(false)}><I n="x" size={14} /></button>
          </div>
          <div className="sb-user">
            <div className="sb-avatar">SA</div>
            <div><div className="sb-uname">Super Admin</div><div className="sb-urole">System Administrator</div></div>
          </div>
          <nav className="sb-nav">
            {NAV.map(sec => (
              <div key={sec.section}>
                <div className="sb-sec-label">{sec.section}</div>
                {sec.items.map(item => (
                  <a key={item.id}
                    href={item.routePath === "" ? "/admindashboard" : `/admindashboard/${item.routePath}`}
                    className={`sb-link ${active === item.id ? "active" : ""}`}
                    onClick={e => { e.preventDefault(); navigate(item.routePath === "" ? "/admindashboard" : `/admindashboard/${item.routePath}`); setSidebar(false); }}>
                    <I n={item.icon} size={15} />{item.label}
                    {navBadges[item.id] > 0 && <span className={`sb-badge ${item.badgeType || ""}`}>{navBadges[item.id]}</span>}
                  </a>
                ))}
              </div>
            ))}
          </nav>
          <div className="sb-bottom">
            <div className="sb-health">
              <div className="sb-health-lbl">System Health</div>
              {[
                { n: "Uptime", v: configStats.uptime },
                { n: "CPU",    v: configStats.cpu },
                { n: "Memory", v: configStats.memory }
              ].map((item) => (
                <div key={item.n}>
                  <div className="sb-health-row"><span className="sb-health-name">{item.n}</span><span className="sb-health-val">{item.v}</span></div>
                  <div className="sb-health-bar"><div className="sb-health-fill" style={{ width: item.v.includes("%") ? item.v : "60%" }} /></div>
                </div>
              ))}
            </div>
            <button className="sb-logout" onClick={() => navigate("/login")}><I n="logout" size={14} /> Sign Out</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <header className="topbar">
            <button className="tb-hamburger" onClick={() => setSidebar(true)}><I n="menu" size={16} /></button>
            <span className="tb-page">Notifications</span>
            <div className="tb-sep" />
            <div className="tb-search"><I n="search" size={14} /><input placeholder="Search users, courses…" /></div>
            <div className="tb-right">
              <span className="tb-role-tag">Admin</span>
              <span className="tb-date">{now}</span>
              <button onClick={handleRefresh} className="tb-icon-btn tooltip" data-tip="Refresh"><I n="refresh" size={15} /></button>
              <button onClick={() => navigate("/admindashboard/notifications")} className="tb-icon-btn tooltip" data-tip="Notifications"><I n="bell" size={15} /><span className="notif-dot" /></button>
              <button className="tb-icon-btn tooltip" data-tip="Settings" onClick={() => navigate("/admindashboard/settings")}><I n="settings" size={15} /></button>
            </div>
          </header>

          <main className="content">
            <div className="nt-page">
              {/* HEADER */}
              <div className="nt-header">
                <div className="nt-header-left">
                  <button className="nt-back" onClick={() => navigate("/admindashboard")}><IcoChevL/> Dashboard</button>
                  <div>
                    <div className="nt-breadcrumb">Admin / Notifications</div>
                    <h1 className="nt-title">Notifications <span className="nt-count-badge">{unreadCount}</span></h1>
                  </div>
                </div>
                <div className="nt-header-right">
                  {unreadCount>0&&<button className="nt-mark-all" onClick={markAllRead}><IcoCheck/> Mark All Read</button>}
                  <button className="nt-btn-primary" onClick={()=>setCompose(true)}><IcoPlus/> Send Notification</button>
                </div>
              </div>

              <div className="nt-layout">
                {/* FEED */}
                <div className="nt-feed-col">
                  {/* FILTER BAR */}
                  <div className="nt-filter-bar">
                    <div className="nt-filter-tabs">
                      {CATS.map(c=>(
                        <button key={c} className={`nt-filter-tab ${catFilter===c?"active":""}`} onClick={()=>setCat(c)}>
                          {c!=="All"&&<span style={{marginRight:4}}>{CAT_ICON[c]}</span>}{c}
                        </button>
                      ))}
                    </div>
                    <button className={`nt-unread-toggle ${showUnread?"active":""}`} onClick={()=>setShowUnread(o=>!o)}>
                      Unread only {showUnread&&<span className="nt-toggle-badge">{unreadCount}</span>}
                    </button>
                  </div>

                  {/* NOTIFICATIONS */}
                  <div className="nt-list">
                    {loading ? (
                        <div className="nt-empty">Loading notifications...</div>
                    ) : filtered.length===0 ? (
                        <div className="nt-empty">No notifications in this filter.</div>
                    ) : filtered.map((n,i)=>(
                      <div key={n.id} className={`nt-item ${n.is_read?"read":""} ${n.type}`} style={{animationDelay:`${i*0.04}s`}}>
                        <div className="nt-item-icon" style={{background:TYPE_COLOR[n.type]+"22",color:TYPE_COLOR[n.type]}}>
                          {TYPE_ICON[n.type]}
                        </div>
                        <div className="nt-item-body" onClick={()=>!n.is_read&&markRead(n.id)}>
                          <div className="nt-item-top">
                            <div className="nt-item-title">{n.title}{!n.is_read&&<span className="nt-unread-dot"/>}</div>
                            <div className="nt-item-time">{n.time}</div>
                          </div>
                          <div className="nt-item-text">{n.msg}</div>
                          <div className="nt-item-footer">
                            <span className={`nt-type-tag ${n.type}`}>{n.type}</span>
                            <span className="nt-cat-tag">{n.type.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="nt-item-actions">
                          {!n.is_read&&<button className="nt-act-btn check" onClick={()=>markRead(n.id)} title="Mark read"><IcoCheck/></button>}
                          <button className="nt-act-btn trash" onClick={()=>deleteNotif(n.id)} title="Delete"><IcoTrash/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COMPOSE / STATS PANEL */}
                <div className="nt-right">
                  {/* STATS */}
                  <div className="nt-panel">
                    <div className="nt-panel-hd"><IcoBell style={{color:"var(--indigo-ll)"}}/> Overview</div>
                    <div className="nt-stats-grid">
                      {[
                        {label:"Total",   val:notifs.length,                             c:"var(--text)"},
                        {label:"Unread",  val:unreadCount,                               c:"var(--rose)"},
                        {label:"System",  val:notifs.filter(n=>n.type==="system").length, c:"var(--teal)"},
                        {label:"User",    val:notifs.filter(n=>n.type==="user").length,   c:"var(--indigo-ll)"},
                        {label:"Academic",val:notifs.filter(n=>n.type==="academic").length,c:"var(--amber)"},
                        {label:"Security",val:notifs.filter(n=>n.type==="security").length,c:"var(--rose)"},
                      ].map(({label,val,c})=>(
                        <div key={label} className="nt-stat-item">
                          <div className="nt-stat-val" style={{color:c}}>{val}</div>
                          <div className="nt-stat-lbl">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COMPOSE */}
                  <div className={`nt-panel nt-compose-panel ${compose?"open":""}`}>
                    <div className="nt-panel-hd"><IcoPlus style={{color:"var(--indigo-ll)"}}/> Broadcast Notification</div>
                    <div className="nt-compose-body">
                      <div className="nt-compose-label">Send To</div>
                      <div className="nt-compose-targets">
                        {COMPOSE_TARGETS.map(t=>(
                          <button key={t.id} className={`nt-compose-target ${composeTarget===t.id?"active":""}`}
                            style={composeTarget===t.id?{borderColor:t.color,color:t.color,background:t.color+"18"}:{}}
                            onClick={()=>setComposeTarget(t.id)}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <div className="nt-compose-label">Title</div>
                      <input className="nt-compose-input" value={composeTitle} onChange={e=>setComposeTitle(e.target.value)}
                        placeholder="Notification title…"/>
                      <div className="nt-compose-label">Message</div>
                      <textarea className="nt-compose-ta" value={composeBody} onChange={e=>setComposeBody(e.target.value)}
                        placeholder="Type your message here…" rows={4}/>
                      <div className="nt-form-footer">
                        <label className="nt-email-toggle">
                          <input type="checkbox" checked={composeEmail} onChange={e=>setComposeEmail(e.target.checked)} />
                          <span>Also send as Email</span>
                        </label>
                        <button className={`nt-send-btn ${sent?"sent":""}`} onClick={handleSend} disabled={sent}>
                          {sent?"✓ Sent!":"Send Broadcast"}
                        </button>
                      </div>
                    </div>
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