// AdminNotifications.jsx — Smart Campus Admin
import { useState } from "react";
import "./adminNotifications.css";

const IcoChevL   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoBell    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoTrash   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
const IcoAlert   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoServer  = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
const IcoBook    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;

const NOTIFS_DATA = [
  {id:1, type:"danger",  title:"Failed Login Attempts",       body:"5 failed login attempts from IP 192.168.1.44. Account temporarily locked.",   time:"2m ago",   read:false, cat:"Security"},
  {id:2, type:"warn",    title:"Storage Threshold Reached",   body:"Platform storage is at 82%. Archiving older content recommended.",            time:"45m ago",  read:false, cat:"System"},
  {id:3, type:"warn",    title:"SSL Certificate Expiry",      body:"SSL certificate for sc.edu expires in 7 days. Renew immediately.",            time:"1h ago",   read:false, cat:"System"},
  {id:4, type:"info",    title:"8 New Registrations Pending", body:"8 student accounts are awaiting admin approval in User Management.",          time:"2h ago",   read:false, cat:"Users"},
  {id:5, type:"info",    title:"3 Faculty Requests Pending",  body:"3 faculty accounts are awaiting verification and approval.",                  time:"3h ago",   read:false, cat:"Users"},
  {id:6, type:"success", title:"Placement Drive Completed",   body:"TCS placement drive concluded. 35 offers made to eligible students.",         time:"5h ago",   read:false, cat:"Academic"},
  {id:7, type:"success", title:"Course Published",            body:"Advanced DBMS (CS502) published by Dr. Prakash — now visible to students.",   time:"8h ago",   read:true,  cat:"Academic"},
  {id:8, type:"info",    title:"New Faculty Account Created", body:"Dr. Meera Pillai (CS Dept) account successfully created and activated.",     time:"Yesterday",read:true,  cat:"Users"},
  {id:9, type:"success", title:"Monthly Report Generated",    body:"February 2025 Enrollment Report automatically generated and emailed.",        time:"Yesterday",read:true,  cat:"System"},
  {id:10,type:"warn",    title:"Video CDN Degraded",          body:"Video CDN service showing 71% uptime. Latency elevated to 680ms.",           time:"2 days ago",read:true, cat:"System"},
  {id:11,type:"info",    title:"Google Drive Completed",       body:"Google placement drive concluded. 4 offers — highest package 28 LPA.",       time:"3 days ago",read:true, cat:"Academic"},
  {id:12,type:"success", title:"Semester Results Published",  body:"Semester 5 results successfully published across all departments.",          time:"4 days ago",read:true, cat:"Academic"},
];

const COMPOSE_TARGETS=[
  {id:"all",     label:"All Users",         color:"var(--indigo-ll)"},
  {id:"students",label:"All Students",      color:"var(--teal)"},
  {id:"faculty", label:"All Faculty",       color:"var(--violet)"},
  {id:"cs",      label:"CS Department",     color:"var(--indigo-l)"},
  {id:"ece",     label:"ECE Department",    color:"var(--teal)"},
  {id:"ds",      label:"DS Department",     color:"var(--indigo-ll)"},
];

const CATS=["All","System","Users","Academic","Security"];

const TYPE_ICON = {danger:<IcoAlert/>,warn:<IcoAlert/>,info:<IcoBell/>,success:<IcoCheck/>};
const TYPE_COLOR= {danger:"var(--rose)",warn:"var(--amber)",info:"var(--indigo-ll)",success:"var(--teal)"};
const CAT_ICON  = {System:<IcoServer/>,Users:<IcoUsers/>,Academic:<IcoBook/>,Security:<IcoAlert/>};

export default function AdminNotifications({onBack}){
  const [notifs,setNotifs] = useState(NOTIFS_DATA);
  const [catFilter,setCat] = useState("All");
  const [showUnread,setShowUnread]=useState(false);
  const [compose,setCompose]=useState(false);
  const [composeTarget,setComposeTarget]=useState("all");
  const [composeTitle,setComposeTitle]=useState("");
  const [composeBody,setComposeBody]=useState("");
  const [sent,setSent]=useState(false);

  const filtered=notifs.filter(n=>(catFilter==="All"||n.cat===catFilter)&&(!showUnread||!n.read));
  const unreadCount=notifs.filter(n=>!n.read).length;

  const markRead=id=>setNotifs(ns=>ns.map(n=>n.id===id?{...n,read:true}:n));
  const markAllRead=()=>setNotifs(ns=>ns.map(n=>({...n,read:true})));
  const deleteNotif=id=>setNotifs(ns=>ns.filter(n=>n.id!==id));

  const handleSend=()=>{
    if(!composeTitle.trim()) return;
    setSent(true);
    setTimeout(()=>{ setSent(false);setCompose(false);setComposeTitle("");setComposeBody(""); },2000);
  };

  return(
    <div className="nt-page">
      {/* HEADER */}
      <div className="nt-header">
        <div className="nt-header-left">
          <button className="nt-back" onClick={onBack}><IcoChevL/> Dashboard</button>
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
            {filtered.length===0&&<div className="nt-empty">No notifications in this filter.</div>}
            {filtered.map((n,i)=>(
              <div key={n.id} className={`nt-item ${n.read?"read":""} ${n.type}`} style={{animationDelay:`${i*0.04}s`}}>
                <div className="nt-item-icon" style={{background:TYPE_COLOR[n.type]+"22",color:TYPE_COLOR[n.type]}}>
                  {TYPE_ICON[n.type]}
                </div>
                <div className="nt-item-body" onClick={()=>!n.read&&markRead(n.id)}>
                  <div className="nt-item-top">
                    <div className="nt-item-title">{n.title}{!n.read&&<span className="nt-unread-dot"/>}</div>
                    <div className="nt-item-time">{n.time}</div>
                  </div>
                  <div className="nt-item-text">{n.body}</div>
                  <div className="nt-item-footer">
                    <span className={`nt-type-tag ${n.type}`}>{n.type}</span>
                    <span className="nt-cat-tag">{n.cat}</span>
                  </div>
                </div>
                <div className="nt-item-actions">
                  {!n.read&&<button className="nt-act-btn check" onClick={()=>markRead(n.id)} title="Mark read"><IcoCheck/></button>}
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
                {label:"System",  val:notifs.filter(n=>n.cat==="System").length, c:"var(--teal)"},
                {label:"Users",   val:notifs.filter(n=>n.cat==="Users").length,  c:"var(--indigo-ll)"},
                {label:"Academic",val:notifs.filter(n=>n.cat==="Academic").length,c:"var(--amber)"},
                {label:"Security",val:notifs.filter(n=>n.cat==="Security").length,c:"var(--rose)"},
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
  );
}