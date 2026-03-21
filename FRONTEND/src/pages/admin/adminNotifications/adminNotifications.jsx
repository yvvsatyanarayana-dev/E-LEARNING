// AdminNotifications.jsx — Smart Campus Admin
import { useState, useEffect, useRef } from "react";
import "./adminNotifications.css";
import api from "../../../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

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

const NAV = [
  { section:"Overview", items:[
    { id:"dashboard", label:"Dashboard",       icon:"grid",      routePath:"",               badge:null },
    { id:"analytics", label:"Analytics",       icon:"bar",       routePath:"adminAnalytics",  badge:null },
  ]},
  { section:"Management", items:[
    { id:"users",       label:"User Management", icon:"users",     routePath:"userManagement",   badge:null },
    { id:"courses",     label:"Courses",         icon:"book",      routePath:"courseManagement", badge:null },
    { id:"departments", label:"Departments",     icon:"layers",    routePath:"departments",      badge:null },
    { id:"placement",   label:"Placement",       icon:"briefcase", routePath:"placements",       badge:null, badgeType:"teal" },
  ]},
  { section:"Platform", items:[
    { id:"reports",   label:"Reports",      icon:"download", routePath:"adminReports", badge:null },
    { id:"activity",  label:"Activity Log", icon:"activity", routePath:"auditLogs",     badge:null, badgeType:"rose" },
    { id:"security",  label:"Security",     icon:"shield",   routePath:"security",     badge:null },
    { id:"settings",  label:"Settings",     icon:"settings", routePath:"settings",     badge:null },
  ]},
];

const getActiveId = (pathname) => {
  for (const sec of NAV) {
    for (const item of sec.items) {
      if (item.routePath === "") {
        if (pathname === "/admindashboard" || pathname === "/admindashboard/") return item.id;
      } else { if (pathname.includes(item.routePath)) return item.id; }
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
  const [composeTarget,setComposeTarget]=useState("all");
  const [composeTitle,setComposeTitle]=useState("");
  const [composeBody,setComposeBody]=useState("");
  const [sent,setSent]=useState(false);
  const [navBadges, setNavBadges] = useState({});
  const [configStats, setConfigStats] = useState({ uptime: "99.9%", cpu: "0%", memory: "0%", backup_size: "0GB" });
  
  const pageRef       = useRef(null);
  const cursorRef     = useRef(null);
  const cursorRingRef = useRef(null);
  const active = getActiveId(location.pathname);
  const now    = new Date().toLocaleDateString();

  useEffect(() => {
    fetchData();
  }, [catFilter]);

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
        type: "system", // default for admin broadcast
        title: composeTitle,
        message: composeBody,
        target: composeTarget
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setCompose(false);
        setComposeTitle("");
        setComposeBody("");
        fetchNotifs();
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

      <div className="app" ref={pageRef}>
        <div className={`sb-overlay ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebar(false)} />

        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "sb-open" : ""}`}>
          <div className="sb-logo">
            <div className="sb-logo-icon">SC</div>
            <div className="sb-logo-text">
              <span className="sb-logo-main">SMART CAMPUS</span>
              <span className="sb-logo-sub">ADMIN PORTAL</span>
            </div>
          </div>

          <nav className="sb-nav">
            {NAV.map(sec => (
              <div key={sec.section} className="sb-sec">
                <div className="sb-sec-label">{sec.section}</div>
                {sec.items.map(item => (
                  <button
                    key={item.id}
                    className={`sb-item ${active === item.id ? "active" : ""}`}
                    onClick={() => navigate("/admindashboard" + (item.routePath ? "/" + item.routePath : ""))}
                  >
                    <I n={item.icon} size={18} />
                    <span className="sb-label">{item.label}</span>
                    {navBadges[item.id] && <span className={`sb-badge ${item.badgeType || ""}`}>{navBadges[item.id]}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="sb-health">
            <div className="sb-health-head">
              <span>System Health</span>
              <span className="sb-health-val">{configStats.uptime}</span>
            </div>
            <div className="sb-health-bar"><div className="sb-health-fill" style={{ width: configStats.cpu }}></div></div>
            <div className="sb-health-bar"><div className="sb-health-fill" style={{ width: configStats.memory, background: "var(--violet)" }}></div></div>
          </div>

          <button className="sb-logout" onClick={() => navigate("/")}>
            <I n="logout" size={16} />
            <span>Logout</span>
          </button>
        </aside>

        {/* MAIN */}
        <div className="main">
          <header className="topbar">
            <div className="tb-left">
              <button className="tb-menu" onClick={() => setSidebar(true)}><I n="menu" size={20} /></button>
              <div className="tb-search">
                <I n="search" size={15} />
                <input type="text" placeholder="Search analytics, logs, users..." />
              </div>
            </div>
            <div className="tb-right">
              <div className="tb-clock">{now}</div>
              <button className="tb-icon-btn tooltip" data-tip="System Health"><I n="cpu" size={15} /></button>
              <button className="tb-icon-btn tooltip" data-tip="Notifications" onClick={() => navigate("/admindashboard/notifications")}><I n="bell" size={15} /><span className="notif-dot" /></button>
              <div className="tb-profile">
                <div className="tb-avatar">AD</div>
              </div>
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
                      <button className={`nt-send-btn ${sent?"sent":""}`} onClick={handleSend} disabled={sent}>
                        {sent?"✓ Sent!":"Send Notification"}
                      </button>
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