// AdminSystemConfig.jsx — Smart Campus Admin
import { useState, useEffect } from "react";
import "./adminSystemConfig.css";

const IcoChevL   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoSettings= (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 1 0 0 14.14"/><path d="M19.07 4.93L16 8"/></svg>;
const IcoServer  = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
const IcoShield  = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoBell    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoSave    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoAlert   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoUpload  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcoRefresh = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

const SERVICES=[
  {name:"API Gateway",   uptime:99.9,status:"ok",  latency:"42ms",  lastCheck:"2m ago",color:"var(--teal)",   version:"v3.2.1"},
  {name:"PostgreSQL DB", uptime:99.8,status:"ok",  latency:"12ms",  lastCheck:"1m ago",color:"var(--teal)",   version:"v15.2"},
  {name:"File Storage",  uptime:82.1,status:"warn",latency:"—",     lastCheck:"5m ago",color:"var(--amber)",  version:"v2.1.0"},
  {name:"AI Services",   uptime:97.3,status:"ok",  latency:"180ms", lastCheck:"3m ago",color:"var(--teal)",   version:"v1.5.3"},
  {name:"Video CDN",     uptime:71.4,status:"err", latency:"680ms", lastCheck:"8m ago",color:"var(--rose)",   version:"v4.0.2"},
  {name:"Email SMTP",    uptime:99.1,status:"ok",  latency:"95ms",  lastCheck:"2m ago",color:"var(--teal)",   version:"v1.2.0"},
];

function Toggle({value,onChange}){
  return(
    <button className={`sc-toggle ${value?"on":""}`} onClick={()=>onChange(!value)}>
      <div className="sc-toggle-knob"/>
    </button>
  );
}

function AnimBar({pct,color,delay=400}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),delay);return()=>clearTimeout(t);},[pct,delay]);
  return <div style={{height:4,background:"var(--surface3)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${w}%`,background:color,borderRadius:2,transition:"width 1s ease"}}/></div>;
}

const TABS=["System","Security","Notifications","Storage","Integrations"];

export default function AdminSystemConfig({onBack}){
  const [tab,setTab]=useState("System");
  const [saved,setSaved]=useState(false);

  // System settings state
  const [settings,setSettings]=useState({
    siteName:"SmartCampus",
    siteUrl:"https://sc.edu",
    supportEmail:"admin@sc.edu",
    timezone:"Asia/Kolkata",
    maintenanceMode:false,
    debugMode:false,
    autoBackup:true,
    backupFreq:"Daily",
    sessionTimeout:"30",
  });

  // Security settings
  const [security,setSecurity]=useState({
    twoFactor:true,
    ipWhitelist:false,
    rateLimiting:true,
    maxLoginAttempts:"5",
    passwordExpiry:"90",
    ssoEnabled:false,
    auditLogs:true,
    apiKeyRotation:false,
  });

  // Notification settings
  const [notifSettings,setNotifSettings]=useState({
    emailNotifs:true,
    smsAlerts:false,
    slackIntegration:false,
    securityAlerts:true,
    systemAlerts:true,
    academicAlerts:true,
    placementAlerts:true,
    weeklyDigest:true,
  });

  const handleSave=()=>{
    setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  };

  const setSetting=(key,val)=>setSettings(s=>({...s,[key]:val}));
  const setSecure=(key,val)=>setSecurity(s=>({...s,[key]:val}));
  const setNotif=(key,val)=>setNotifSettings(s=>({...s,[key]:val}));

  return(
    <div className="sc-page">
      {/* HEADER */}
      <div className="sc-header">
        <div className="sc-header-left">
          <button className="sc-back" onClick={onBack}><IcoChevL/> Dashboard</button>
          <div>
            <div className="sc-breadcrumb">Admin / System Config</div>
            <h1 className="sc-title">System Configuration</h1>
          </div>
        </div>
        <button className={`sc-save-btn ${saved?"saved":""}`} onClick={handleSave}>
          <IcoSave/>{saved?"✓ Saved!":"Save Changes"}
        </button>
      </div>

      {/* SERVICE HEALTH STRIP */}
      <div className="sc-services-strip">
        {SERVICES.map((s,i)=>(
          <div key={i} className={`sc-svc-tile ${s.status}`}>
            <div className="sc-svc-top">
              <span className="sc-svc-name">{s.name}</span>
              <div className={`sc-svc-dot ${s.status}`}/>
            </div>
            <div className="sc-svc-uptime" style={{color:s.color}}>{s.uptime}%</div>
            <AnimBar pct={s.uptime} color={s.color} delay={200+i*60}/>
            <div className="sc-svc-meta">{s.latency} · {s.version}</div>
            <div className="sc-svc-check">Checked {s.lastCheck}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="sc-tabs">
        {TABS.map(t=>(
          <button key={t} className={`sc-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t==="System"&&<IcoSettings width={12} height={12}/>}
            {t==="Security"&&<IcoShield width={12} height={12}/>}
            {t==="Notifications"&&<IcoBell width={12} height={12}/>}
            {t==="Storage"&&<IcoUpload width={12} height={12}/>}
            {t==="Integrations"&&<IcoServer width={12} height={12}/>}
            {t}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="sc-tab-content">

        {tab==="System"&&(
          <div className="sc-grid">
            <div className="sc-panel">
              <div className="sc-panel-hd"><IcoSettings style={{color:"var(--indigo-ll)"}}/> General Settings</div>
              <div className="sc-form">
                {[
                  {label:"Site Name",     key:"siteName",    type:"text"},
                  {label:"Site URL",      key:"siteUrl",     type:"text"},
                  {label:"Support Email", key:"supportEmail",type:"email"},
                ].map(({label,key,type})=>(
                  <div key={key} className="sc-field">
                    <label className="sc-label">{label}</label>
                    <input className="sc-input" type={type} value={settings[key]} onChange={e=>setSetting(key,e.target.value)}/>
                  </div>
                ))}
                <div className="sc-field">
                  <label className="sc-label">Timezone</label>
                  <select className="sc-select" value={settings.timezone} onChange={e=>setSetting("timezone",e.target.value)}>
                    <option>Asia/Kolkata</option><option>Asia/Singapore</option><option>UTC</option><option>US/Eastern</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="sc-panel">
              <div className="sc-panel-hd"><IcoServer style={{color:"var(--teal)"}}/> Platform Controls</div>
              <div className="sc-toggles">
                {[
                  {label:"Maintenance Mode",  desc:"Disable platform access for users",key:"maintenanceMode", setter:setSetting, state:settings, warn:true},
                  {label:"Debug Mode",        desc:"Enable verbose error logging",      key:"debugMode",        setter:setSetting, state:settings},
                  {label:"Auto Backup",       desc:"Daily automatic platform backups",  key:"autoBackup",       setter:setSetting, state:settings},
                ].map(({label,desc,key,setter,state,warn})=>(
                  <div key={key} className={`sc-toggle-row ${warn&&state[key]?"active-warn":""}`}>
                    <div className="sc-toggle-info">
                      <div className="sc-toggle-label">{label}{warn&&state[key]&&<span className="sc-warn-tag"><IcoAlert width={9} height={9}/> Active</span>}</div>
                      <div className="sc-toggle-desc">{desc}</div>
                    </div>
                    <Toggle value={state[key]} onChange={v=>setter(key,v)}/>
                  </div>
                ))}
                <div className="sc-field">
                  <label className="sc-label">Backup Frequency</label>
                  <select className="sc-select" value={settings.backupFreq} onChange={e=>setSetting("backupFreq",e.target.value)}>
                    <option>Hourly</option><option>Daily</option><option>Weekly</option>
                  </select>
                </div>
                <div className="sc-field">
                  <label className="sc-label">Session Timeout (mins)</label>
                  <input className="sc-input" type="number" value={settings.sessionTimeout} onChange={e=>setSetting("sessionTimeout",e.target.value)} min="5" max="120"/>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="Security"&&(
          <div className="sc-grid">
            <div className="sc-panel">
              <div className="sc-panel-hd"><IcoShield style={{color:"var(--rose)"}}/> Authentication</div>
              <div className="sc-toggles">
                {[
                  {label:"Two-Factor Authentication",key:"twoFactor",    desc:"Require 2FA for all admin accounts"},
                  {label:"IP Whitelist",              key:"ipWhitelist",  desc:"Restrict admin access to approved IPs"},
                  {label:"Rate Limiting",             key:"rateLimiting", desc:"Block excessive API/login requests"},
                  {label:"SSO Integration",           key:"ssoEnabled",   desc:"Google/Microsoft single sign-on"},
                  {label:"Audit Log Retention",       key:"auditLogs",    desc:"Keep full event logs for compliance"},
                  {label:"API Key Auto-Rotation",     key:"apiKeyRotation",desc:"Rotate API keys every 30 days"},
                ].map(({label,desc,key})=>(
                  <div key={key} className="sc-toggle-row">
                    <div className="sc-toggle-info"><div className="sc-toggle-label">{label}</div><div className="sc-toggle-desc">{desc}</div></div>
                    <Toggle value={security[key]} onChange={v=>setSecure(key,v)}/>
                  </div>
                ))}
              </div>
            </div>
            <div className="sc-panel">
              <div className="sc-panel-hd"><IcoAlert style={{color:"var(--amber)"}}/> Security Limits</div>
              <div className="sc-form">
                <div className="sc-field">
                  <label className="sc-label">Max Login Attempts</label>
                  <input className="sc-input" type="number" value={security.maxLoginAttempts} onChange={e=>setSecure("maxLoginAttempts",e.target.value)} min="3" max="10"/>
                  <div className="sc-field-hint">Account locked after this many failures</div>
                </div>
                <div className="sc-field">
                  <label className="sc-label">Password Expiry (days)</label>
                  <input className="sc-input" type="number" value={security.passwordExpiry} onChange={e=>setSecure("passwordExpiry",e.target.value)} min="30" max="365"/>
                  <div className="sc-field-hint">0 = never expires</div>
                </div>
              </div>
              <div className="sc-danger-zone">
                <div className="sc-dz-title"><IcoAlert style={{color:"var(--rose)"}}/> Danger Zone</div>
                <button className="sc-dz-btn">Force Logout All Users</button>
                <button className="sc-dz-btn">Rotate All API Keys</button>
                <button className="sc-dz-btn">Purge Session Data</button>
              </div>
            </div>
          </div>
        )}

        {tab==="Notifications"&&(
          <div className="sc-grid">
            <div className="sc-panel">
              <div className="sc-panel-hd"><IcoBell style={{color:"var(--amber)"}}/> Delivery Channels</div>
              <div className="sc-toggles">
                {[
                  {label:"Email Notifications", key:"emailNotifs",      desc:"Send via sc.edu SMTP relay"},
                  {label:"SMS Alerts",           key:"smsAlerts",        desc:"Critical system alerts via SMS"},
                  {label:"Slack Integration",    key:"slackIntegration", desc:"Post to #admin-alerts channel"},
                  {label:"Weekly Digest",        key:"weeklyDigest",     desc:"Email summary every Monday"},
                ].map(({label,desc,key})=>(
                  <div key={key} className="sc-toggle-row">
                    <div className="sc-toggle-info"><div className="sc-toggle-label">{label}</div><div className="sc-toggle-desc">{desc}</div></div>
                    <Toggle value={notifSettings[key]} onChange={v=>setNotif(key,v)}/>
                  </div>
                ))}
              </div>
            </div>
            <div className="sc-panel">
              <div className="sc-panel-hd"><IcoBell style={{color:"var(--indigo-ll)"}}/> Alert Categories</div>
              <div className="sc-toggles">
                {[
                  {label:"Security Alerts",   key:"securityAlerts",  desc:"Login failures, threats, IP blocks"},
                  {label:"System Alerts",     key:"systemAlerts",    desc:"Uptime, storage, performance"},
                  {label:"Academic Alerts",   key:"academicAlerts",  desc:"Course, attendance, exam events"},
                  {label:"Placement Alerts",  key:"placementAlerts", desc:"Drive results and offer updates"},
                ].map(({label,desc,key})=>(
                  <div key={key} className="sc-toggle-row">
                    <div className="sc-toggle-info"><div className="sc-toggle-label">{label}</div><div className="sc-toggle-desc">{desc}</div></div>
                    <Toggle value={notifSettings[key]} onChange={v=>setNotif(key,v)}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==="Storage"&&(
          <div className="sc-grid">
            <div className="sc-panel">
              <div className="sc-panel-hd"><IcoUpload style={{color:"var(--amber)"}}/> Storage Overview</div>
              <div style={{display:"flex",flexDirection:"column",gap:14,padding:"4px 0"}}>
                {[
                  {label:"Lecture Videos",       used:8.4,  total:10, color:"var(--rose)"},
                  {label:"Assignment Uploads",   used:2.1,  total:5,  color:"var(--amber)"},
                  {label:"Profile Media",        used:0.8,  total:2,  color:"var(--indigo-l)"},
                  {label:"System Backups",       used:3.2,  total:5,  color:"var(--teal)"},
                  {label:"Document Storage",     used:0.5,  total:2,  color:"var(--violet)"},
                ].map(({label,used,total,color},i)=>(
                  <div key={label} className="sc-storage-row">
                    <div className="sc-storage-top">
                      <span className="sc-storage-label">{label}</span>
                      <span className="sc-storage-val" style={{color}}>{used} GB / {total} GB</span>
                    </div>
                    <AnimBar pct={Math.round((used/total)*100)} color={color} delay={200+i*80}/>
                  </div>
                ))}
              </div>
              <div className="sc-storage-total">
                <div>Total Used: <strong style={{color:"var(--amber)"}}>15.0 GB</strong></div>
                <div>Total Available: <strong>24 GB</strong></div>
                <div style={{color:"var(--rose)",fontWeight:700}}>82% capacity</div>
              </div>
            </div>
            <div className="sc-panel">
              <div className="sc-panel-hd"><IcoRefresh style={{color:"var(--teal)"}}/> Storage Actions</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[
                  {label:"Archive Old Lecture Videos",    desc:"Videos older than 2 semesters",  tag:"Frees ~4.2 GB",   c:"var(--teal)"},
                  {label:"Clear Temp Files",              desc:"Build cache and temp uploads",    tag:"~0.3 GB",         c:"var(--indigo-l)"},
                  {label:"Compress Backup Archives",      desc:"Use LZ4 compression on backups", tag:"~1.1 GB",         c:"var(--amber)"},
                  {label:"Delete Archived Courses",       desc:"Remove fully archived courses",  tag:"~0.6 GB",         c:"var(--rose)"},
                ].map(({label,desc,tag,c},i)=>(
                  <div key={i} className="sc-action-card">
                    <div className="sc-action-info">
                      <div className="sc-action-label">{label}</div>
                      <div className="sc-action-desc">{desc}</div>
                    </div>
                    <div className="sc-action-right">
                      <span className="sc-action-tag" style={{color:c,background:c+"18",border:`1px solid ${c}44`}}>{tag}</span>
                      <button className="sc-action-btn">Run</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==="Integrations"&&(
          <div className="sc-grid sc-grid-3">
            {[
              {name:"Google Workspace",  desc:"SSO and Drive integration",          status:"connected",   icon:"G",  c:"var(--teal)"},
              {name:"Razorpay",          desc:"Fee payment gateway",                status:"connected",   icon:"R",  c:"var(--indigo-l)"},
              {name:"Twilio SMS",        desc:"SMS alert delivery",                 status:"disconnected",icon:"T",  c:"var(--text3)"},
              {name:"Zoom",             desc:"Live session hosting",               status:"connected",   icon:"Z",  c:"var(--teal)"},
              {name:"Slack",            desc:"Admin notifications",                status:"disconnected",icon:"S",  c:"var(--text3)"},
              {name:"AWS S3",           desc:"Cloud media storage bucket",         status:"connected",   icon:"A",  c:"var(--amber)"},
              {name:"Cloudflare CDN",   desc:"Video and asset delivery network",   status:"warn",        icon:"CF", c:"var(--amber)"},
              {name:"OpenAI API",       desc:"AI services and LLM features",       status:"connected",   icon:"AI", c:"var(--violet)"},
              {name:"GitHub Actions",   desc:"CI/CD deployment pipeline",          status:"connected",   icon:"GH", c:"var(--teal)"},
            ].map(({name,desc,status,icon,c},i)=>(
              <div key={i} className={`sc-integration-card ${status}`}>
                <div className="sc-int-logo" style={{background:c+"18",color:c}}>{icon}</div>
                <div className="sc-int-info">
                  <div className="sc-int-name">{name}</div>
                  <div className="sc-int-desc">{desc}</div>
                </div>
                <div className="sc-int-right">
                  <div className={`sc-int-status ${status}`}>{status}</div>
                  <button className="sc-int-btn">{status==="connected"?"Configure":"Connect"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}