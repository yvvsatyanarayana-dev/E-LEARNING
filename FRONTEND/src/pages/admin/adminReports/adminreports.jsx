// AdminReports.jsx — Smart Campus Admin
import { useState, useEffect } from "react";
import "./adminReports.css";

const IcoChevL   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoDownload= (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoFile    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoCalendar= (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoClock   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoUp      = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;

const REPORT_TYPES = [
  {id:"enrollment",   label:"Enrollment Report",    icon:"📊", desc:"Student enrollment, dept-wise breakdown, trends",   color:"var(--indigo-l)"},
  {id:"academic",     label:"Academic Performance",  icon:"📚", desc:"Avg scores, completion rates, course analytics",    color:"var(--teal)"},
  {id:"attendance",   label:"Attendance Summary",    icon:"📅", desc:"Platform-wide and dept-wise attendance data",       color:"var(--amber)"},
  {id:"placement",    label:"Placement Report",      icon:"💼", desc:"Drive results, offer details, company analytics",   color:"var(--amber)"},
  {id:"faculty",      label:"Faculty Activity",      icon:"👥", desc:"Faculty contributions, course management",          color:"var(--violet)"},
  {id:"financial",    label:"Fee & Finance",          icon:"💰", desc:"Fee collection, outstanding, trends",               color:"var(--rose)"},
  {id:"system",       label:"System Usage",           icon:"🖥", desc:"Platform activity, uptime, storage analytics",     color:"var(--teal)"},
  {id:"custom",       label:"Custom Report",          icon:"⚙️", desc:"Define your own parameters and filters",           color:"var(--indigo-ll)"},
];

const RECENT_EXPORTS = [
  {name:"March 2025 Enrollment Report",  type:"enrollment", format:"PDF", size:"1.2 MB", date:"10 Mar 2025", by:"Admin",       c:"var(--indigo-l)"},
  {name:"Q4 Placement Summary",          type:"placement",  format:"XLSX",size:"840 KB", date:"8 Mar 2025",  by:"Admin",       c:"var(--amber)"},
  {name:"Feb Academic Performance",      type:"academic",   format:"PDF", size:"2.1 MB", date:"1 Mar 2025",  by:"Admin",       c:"var(--teal)"},
  {name:"Platform System Usage – Feb",   type:"system",     format:"CSV", size:"340 KB", date:"28 Feb 2025", by:"System",      c:"var(--teal)"},
  {name:"Faculty Activity Q4",           type:"faculty",    format:"PDF", size:"900 KB", date:"25 Feb 2025", by:"Admin",       c:"var(--violet)"},
  {name:"Annual Attendance Summary",     type:"attendance", format:"XLSX",size:"1.4 MB", date:"20 Feb 2025", by:"Admin",       c:"var(--amber)"},
];

const SCHEDULED = [
  {label:"Monthly Enrollment Report",      freq:"Monthly",  next:"1 Apr 2025",  format:"PDF"},
  {label:"Weekly System Usage",             freq:"Weekly",   next:"17 Mar 2025", format:"CSV"},
  {label:"Semester Academic Performance",   freq:"Semester", next:"30 Apr 2025", format:"PDF"},
  {label:"Bi-weekly Attendance Summary",    freq:"Bi-weekly",next:"22 Mar 2025", format:"XLSX"},
];

const METRICS = [
  {label:"Reports Generated",  val:"128",  sub:"this academic year",   c:"var(--indigo-ll)", trend:"+12"},
  {label:"Last Export",         val:"Today",sub:"Enrollment · PDF",     c:"var(--teal)",      trend:null},
  {label:"Scheduled Reports",   val:"4",   sub:"auto-generated",        c:"var(--amber)",     trend:null},
  {label:"Total Export Size",   val:"14 GB",sub:"all time",             c:"var(--violet)",    trend:null},
];

const MONTHS=["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
const REPORTS_PER_MONTH=[6,7,5,9,8,10,9,12,11,13,12,14];

function AnimBar({pct,color,delay=400}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),delay);return()=>clearTimeout(t);},[pct,delay]);
  return <div style={{height:4,background:"var(--surface3)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${w}%`,background:color,borderRadius:2,transition:"width 1s ease"}}/></div>;
}

export default function AdminReports({onBack}){
  const [generating,setGenerating]=useState(null);
  const [generated, setGenerated]=useState(null);

  const handleGenerate=(id)=>{
    setGenerating(id);
    setTimeout(()=>{ setGenerating(null); setGenerated(id); setTimeout(()=>setGenerated(null),3000); },1800);
  };

  return(
    <div className="rp-page">
      {/* HEADER */}
      <div className="rp-header">
        <div className="rp-header-left">
          <button className="rp-back" onClick={onBack}><IcoChevL/> Dashboard</button>
          <div>
            <div className="rp-breadcrumb">Admin / Reports</div>
            <h1 className="rp-title">Reports & Exports</h1>
          </div>
        </div>
        <button className="rp-btn-primary"><IcoPlus/> Custom Report</button>
      </div>

      {/* METRIC STRIP */}
      <div className="rp-metrics">
        {METRICS.map(({label,val,sub,c,trend})=>(
          <div key={label} className="rp-metric-card">
            <div className="rp-metric-val" style={{color:c}}>{val}</div>
            <div className="rp-metric-lbl">{label}</div>
            <div className="rp-metric-sub">{sub}{trend&&<span style={{color:"var(--teal)",fontWeight:700,marginLeft:5}}><IcoUp/> {trend}</span>}</div>
          </div>
        ))}
      </div>

      <div className="rp-layout">
        {/* LEFT */}
        <div className="rp-left">
          {/* REPORT TYPE GRID */}
          <div className="rp-section">
            <div className="rp-section-ttl"><IcoFile style={{color:"var(--indigo-ll)"}}/> Generate Report</div>
            <div className="rp-type-grid">
              {REPORT_TYPES.map((r)=>(
                <div key={r.id} className={`rp-type-card ${generating===r.id?"loading":""} ${generated===r.id?"done":""}`}>
                  <div className="rp-type-emoji">{r.icon}</div>
                  <div className="rp-type-label" style={{color:r.color}}>{r.label}</div>
                  <div className="rp-type-desc">{r.desc}</div>
                  <div className="rp-type-actions">
                    <button className={`rp-gen-btn ${generating===r.id?"loading":""} ${generated===r.id?"done":""}`}
                      onClick={()=>!generating&&handleGenerate(r.id)} disabled={!!generating}>
                      {generating===r.id?"Generating…":generated===r.id?"✓ Ready":"Generate"}
                    </button>
                    <button className="rp-fmt-btn">PDF</button>
                    <button className="rp-fmt-btn">XLSX</button>
                    <button className="rp-fmt-btn">CSV</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVITY CHART */}
          <div className="rp-section">
            <div className="rp-section-ttl"><IcoTrend style={{color:"var(--indigo-ll)"}}/> Report Generation Activity</div>
            <div className="rp-bar-chart-card">
              <div className="rp-bar-chart">
                {REPORTS_PER_MONTH.map((v,i)=>{
                  const max=Math.max(...REPORTS_PER_MONTH);
                  return(
                    <div key={i} className="rp-bar-col">
                      <div className="rp-bar-val">{v}</div>
                      <div className="rp-bar-track">
                        <div className="rp-bar-fill" style={{height:`${(v/max)*100}%`}}/>
                      </div>
                      <div className="rp-bar-month">{MONTHS[i]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="rp-right">
          {/* RECENT EXPORTS */}
          <div className="rp-panel">
            <div className="rp-panel-hd"><IcoDownload style={{color:"var(--teal)"}}/> Recent Exports</div>
            <div className="rp-exports-list">
              {RECENT_EXPORTS.map((e,i)=>(
                <div key={i} className="rp-export-row">
                  <div className="rp-export-icon" style={{background:e.c+"22",color:e.c}}><IcoFile width={12} height={12}/></div>
                  <div className="rp-export-info">
                    <div className="rp-export-name">{e.name}</div>
                    <div className="rp-export-meta">{e.format} · {e.size} · {e.date}</div>
                  </div>
                  <button className="rp-dl-btn"><IcoDownload/></button>
                </div>
              ))}
            </div>
          </div>

          {/* SCHEDULED */}
          <div className="rp-panel">
            <div className="rp-panel-hd"><IcoCalendar style={{color:"var(--amber)"}}/> Scheduled Reports</div>
            <div className="rp-sched-list">
              {SCHEDULED.map((s,i)=>(
                <div key={i} className="rp-sched-row">
                  <div className="rp-sched-info">
                    <div className="rp-sched-label">{s.label}</div>
                    <div className="rp-sched-meta"><IcoClock/> Next: {s.next} · {s.freq}</div>
                  </div>
                  <div className="rp-sched-fmt">{s.format}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}