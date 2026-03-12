// AdminAuditLogs.jsx — Smart Campus Admin
import { useState } from "react";
import "./adminAuditLogs.css";

const IcoChevL   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoShield  = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoSearch  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoDownload= (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoFilter  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoAlert   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const LOGS = [
  {id:"EVT001",action:"Admin Login",           actor:"Admin",              ip:"192.168.1.1",  detail:"Successful authentication",                 time:"09:42:18",date:"Today",    type:"info",   cat:"Auth"},
  {id:"EVT002",action:"Bulk CSV Import",        actor:"Admin",              ip:"192.168.1.1",  detail:"312 student records imported from CSV",     time:"09:14:05",date:"Today",    type:"success",cat:"Data"},
  {id:"EVT003",action:"Failed Login ×5",        actor:"Unknown",            ip:"192.168.1.44", detail:"Account locked after 5 failed attempts",    time:"08:52:31",date:"Today",    type:"danger", cat:"Security"},
  {id:"EVT004",action:"Course Published",       actor:"Dr. Prakash",        ip:"10.0.0.24",    detail:"Advanced DBMS (CS502) published",           time:"08:30:14",date:"Today",    type:"success",cat:"Academic"},
  {id:"EVT005",action:"Storage Alert",          actor:"System",             ip:"—",            detail:"Storage threshold exceeded 80%",            time:"06:45:00",date:"Today",    type:"warn",   cat:"System"},
  {id:"EVT006",action:"SSL Cert Warning",       actor:"System",             ip:"—",            detail:"Certificate expiry in 7 days",              time:"07:00:00",date:"Today",    type:"warn",   cat:"System"},
  {id:"EVT007",action:"User Account Created",   actor:"Admin",              ip:"192.168.1.1",  detail:"Faculty: Dr. Meera Pillai (CS)",           time:"17:20:40",date:"Yesterday",type:"success",cat:"Users"},
  {id:"EVT008",action:"Password Reset",         actor:"Prof. Suresh Nair",  ip:"10.0.0.88",    detail:"Self-service password reset completed",     time:"15:10:22",date:"Yesterday",type:"info",   cat:"Auth"},
  {id:"EVT009",action:"Placement Drive Created",actor:"Placement Officer",  ip:"10.0.0.56",    detail:"Infosys drive — 28 Feb 2025 scheduled",    time:"14:55:11",date:"Yesterday",type:"info",   cat:"Academic"},
  {id:"EVT010",action:"Report Exported",        actor:"Admin",              ip:"192.168.1.1",  detail:"February Enrollment Report — PDF",         time:"11:30:00",date:"Yesterday",type:"info",   cat:"Data"},
  {id:"EVT011",action:"Unauthorized API Call",  actor:"Unknown",            ip:"203.0.113.6",  detail:"API key invalid — request rejected",       time:"10:08:44",date:"Yesterday",type:"danger", cat:"Security"},
  {id:"EVT012",action:"Notification Broadcast", actor:"Admin",              ip:"192.168.1.1",  detail:"Sent to All Students: Exam Schedule",      time:"09:05:33",date:"Yesterday",type:"info",   cat:"System"},
  {id:"EVT013",action:"Course Deleted",         actor:"Admin",              ip:"192.168.1.1",  detail:"Archived course ME201 removed",            time:"16:40:12",date:"2 days ago",type:"warn",  cat:"Academic"},
  {id:"EVT014",action:"Admin Login",            actor:"Admin",              ip:"192.168.1.1",  detail:"Successful authentication",                time:"09:00:00",date:"2 days ago",type:"info",  cat:"Auth"},
  {id:"EVT015",action:"Bulk Password Reset",    actor:"Admin",              ip:"192.168.1.1",  detail:"12 accounts had passwords reset",          time:"11:20:00",date:"3 days ago",type:"warn",  cat:"Auth"},
  {id:"EVT016",action:"System Backup",          actor:"System",             ip:"—",            detail:"Scheduled backup completed — 14.2 GB",     time:"02:00:00",date:"3 days ago",type:"success",cat:"System"},
];

const TYPE_COLOR={danger:"var(--rose)",warn:"var(--amber)",info:"var(--indigo-l)",success:"var(--teal)"};
const CATS=["All","Auth","Security","Data","Academic","Users","System"];
const TYPES=["All","danger","warn","info","success"];

export default function AdminAuditLogs({onBack}){
  const [search,setSearch]=useState("");
  const [catFilter,setCat]=useState("All");
  const [typeFilter,setType]=useState("All");
  const [expanded,setExpanded]=useState(null);
  const [dateFilter,setDate]=useState("All");

  const filtered=LOGS.filter(l=>
    (catFilter==="All"||l.cat===catFilter) &&
    (typeFilter==="All"||l.type===typeFilter) &&
    (dateFilter==="All"||l.date===dateFilter) &&
    (l.action.toLowerCase().includes(search.toLowerCase())||l.actor.toLowerCase().includes(search.toLowerCase())||l.ip.includes(search))
  );

  const dates=["All",...[...new Set(LOGS.map(l=>l.date))]];
  const dangerCount=LOGS.filter(l=>l.type==="danger").length;
  const warnCount=LOGS.filter(l=>l.type==="warn").length;
  const todayCount=LOGS.filter(l=>l.date==="Today").length;

  return(
    <div className="al-page">
      {/* HEADER */}
      <div className="al-header">
        <div className="al-header-left">
          <button className="al-back" onClick={onBack}><IcoChevL/> Dashboard</button>
          <div>
            <div className="al-breadcrumb">Admin / Audit Logs</div>
            <h1 className="al-title">Audit Logs</h1>
          </div>
        </div>
        <button className="al-export-btn"><IcoDownload/> Export CSV</button>
      </div>

      {/* SUMMARY */}
      <div className="al-summary">
        {[
          {label:"Total Events", val:LOGS.length,    c:"var(--indigo-ll)"},
          {label:"Today",        val:todayCount,     c:"var(--teal)"},
          {label:"Security",     val:dangerCount,    c:"var(--rose)"},
          {label:"Warnings",     val:warnCount,      c:"var(--amber)"},
          {label:"Unique Actors",val:[...new Set(LOGS.map(l=>l.actor))].length, c:"var(--violet)"},
          {label:"Unique IPs",   val:[...new Set(LOGS.map(l=>l.ip).filter(ip=>ip!=="—"))].length, c:"var(--indigo-l)"},
        ].map(({label,val,c})=>(
          <div key={label} className="al-kpi">
            <div className="al-kpi-val" style={{color:c}}>{val}</div>
            <div className="al-kpi-lbl">{label}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="al-filters">
        <div className="al-search">
          <IcoSearch style={{color:"var(--text3)",flexShrink:0}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by action, actor, or IP…"/>
        </div>
        <div className="al-filter-group">
          <IcoFilter style={{color:"var(--text3)"}} width={12} height={12}/>
          {CATS.map(c=><button key={c} className={`al-filter-btn ${catFilter===c?"active":""}`} onClick={()=>setCat(c)}>{c}</button>)}
        </div>
        <div className="al-filter-group">
          {TYPES.map(t=>(
            <button key={t} className={`al-filter-btn ${typeFilter===t?"active":""}`}
              style={typeFilter===t&&t!=="All"?{background:TYPE_COLOR[t]+"22",color:TYPE_COLOR[t],borderColor:TYPE_COLOR[t]+"44"}:{}}
              onClick={()=>setType(t)}>{t==="All"?"All Types":t}</button>
          ))}
        </div>
        <select className="al-date-select" value={dateFilter} onChange={e=>setDate(e.target.value)}>
          {dates.map(d=><option key={d} value={d}>{d==="All"?"All Dates":d}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="al-table-wrap">
        <div className="al-table-head">
          <span>Event ID</span><span>Action</span><span>Actor</span><span>IP Address</span>
          <span>Detail</span><span>Time</span><span>Date</span><span>Type</span>
        </div>
        {filtered.length===0&&<div className="al-empty">No events match the filters.</div>}
        {filtered.map((l,i)=>(
          <div key={l.id}>
            <div className={`al-row ${expanded===l.id?"expanded":""} ${l.type}`} style={{animationDelay:`${i*0.03}s`}} onClick={()=>setExpanded(expanded===l.id?null:l.id)}>
              <span className="al-id">{l.id}</span>
              <span className="al-action">
                <div className="al-type-pip" style={{background:TYPE_COLOR[l.type]}}/>
                {l.action}
              </span>
              <span className="al-actor">{l.actor}</span>
              <span className="al-ip">{l.ip}</span>
              <span className="al-detail">{l.detail}</span>
              <span className="al-time">{l.time}</span>
              <span className="al-date-badge">{l.date}</span>
              <span><div className={`al-type-chip ${l.type}`}>{l.type}</div></span>
            </div>
            {expanded===l.id&&(
              <div className="al-expand-row">
                <div className="al-expand-grid">
                  <div className="al-exp-item"><span>Event ID</span><strong>{l.id}</strong></div>
                  <div className="al-exp-item"><span>Category</span><strong>{l.cat}</strong></div>
                  <div className="al-exp-item"><span>Actor</span><strong>{l.actor}</strong></div>
                  <div className="al-exp-item"><span>IP Address</span><strong style={{fontFamily:"monospace"}}>{l.ip}</strong></div>
                  <div className="al-exp-item"><span>Timestamp</span><strong>{l.date} · {l.time}</strong></div>
                  <div className="al-exp-item"><span>Severity</span><strong style={{color:TYPE_COLOR[l.type]}}>{l.type}</strong></div>
                  <div className="al-exp-item al-exp-full"><span>Detail</span><strong>{l.detail}</strong></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="al-table-foot">Showing {filtered.length} of {LOGS.length} events · Click a row to expand</div>
    </div>
  );
}