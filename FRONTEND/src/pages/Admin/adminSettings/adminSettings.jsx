import { useState } from "react";
import "./adminSettings.css";

export default function AdminSettings() {
  const [tab, setTab] = useState("profile");
  const [notifs, setNotifs] = useState({
    securityAlerts:true, newUsers:true, systemErrors:true,
    courseUpdates:false, weeklyReport:true, loginAlerts:true,
  });
  const [appearance, setAppearance] = useState({ theme:"dark", accentColor:"indigo", density:"default" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  };

  const TABS = ["profile","notifications","appearance","platform","advanced"];

  return (
    <div className="set-root">
      <div className="um-header">
        <div>
          <div className="um-breadcrumb">Platform → Settings</div>
          <h1 className="um-title">Platform <em>Settings</em></h1>
          <p className="um-sub">Configure platform behaviour, appearance and preferences</p>
        </div>
        <button className={`btn btn-solid btn-sm ${saved?"btn-saved":""}`} onClick={handleSave}>
          {saved ? (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Saved!</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save Changes</>
          )}
        </button>
      </div>

      <div className="set-layout">
        {/* Sidebar Tabs */}
        <div className="set-sidebar">
          {TABS.map(t=>(
            <button key={t} className={`set-tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
              {t === "profile"       && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              {t === "notifications" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
              {t === "appearance"    && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
              {t === "platform"      && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
              {t === "advanced"      && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>}
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="set-content">
          {tab === "profile" && (
            <div className="set-section">
              <div className="set-section-title">Admin Profile</div>
              <div className="set-avatar-row">
                <div className="set-avatar">SA</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>Super Admin</div>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:8}}>System Administrator</div>
                  <button className="btn btn-ghost btn-sm">Change Avatar</button>
                </div>
              </div>
              <div className="set-form">
                <div className="set-form-row">
                  <div className="um-form-group" style={{flex:1}}>
                    <label>First Name</label>
                    <input className="filter-input set-input" defaultValue="Super"/>
                  </div>
                  <div className="um-form-group" style={{flex:1}}>
                    <label>Last Name</label>
                    <input className="filter-input set-input" defaultValue="Admin"/>
                  </div>
                </div>
                <div className="um-form-group">
                  <label>Email Address</label>
                  <input className="filter-input set-input" defaultValue="admin@smartcampus.edu"/>
                </div>
                <div className="um-form-group">
                  <label>Institution Name</label>
                  <input className="filter-input set-input" defaultValue="SMART CAMPUS University"/>
                </div>
                <div className="set-form-row">
                  <div className="um-form-group" style={{flex:1}}>
                    <label>Phone</label>
                    <input className="filter-input set-input" defaultValue="+91 98765 43210"/>
                  </div>
                  <div className="um-form-group" style={{flex:1}}>
                    <label>Timezone</label>
                    <select className="filter-select set-input"><option>Asia/Kolkata (IST)</option><option>UTC</option></select>
                  </div>
                </div>
              </div>
              <div className="set-divider"/>
              <div className="set-section-title">Change Password</div>
              <div className="set-form">
                <div className="um-form-group"><label>Current Password</label><input className="filter-input set-input" type="password" placeholder="••••••••"/></div>
                <div className="set-form-row">
                  <div className="um-form-group" style={{flex:1}}><label>New Password</label><input className="filter-input set-input" type="password" placeholder="••••••••"/></div>
                  <div className="um-form-group" style={{flex:1}}><label>Confirm Password</label><input className="filter-input set-input" type="password" placeholder="••••••••"/></div>
                </div>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="set-section">
              <div className="set-section-title">Notification Preferences</div>
              <p className="set-section-desc">Control which alerts and updates you receive.</p>
              {Object.entries(notifs).map(([key,val])=>(
                <div key={key} className="set-notif-row">
                  <div>
                    <div className="set-notif-name">{key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}</div>
                    <div className="set-notif-desc">
                      {key==="securityAlerts"   && "Get notified of suspicious activity and threats"}
                      {key==="newUsers"          && "When new user accounts are created or registered"}
                      {key==="systemErrors"      && "Critical errors and system failures"}
                      {key==="courseUpdates"     && "When faculty publish or modify courses"}
                      {key==="weeklyReport"      && "Automated weekly analytics summary"}
                      {key==="loginAlerts"       && "Login from new device or location"}
                    </div>
                  </div>
                  <button className={`sec-toggle ${val?"sec-toggle-on":"sec-toggle-off"}`} onClick={()=>setNotifs(n=>({...n,[key]:!n[key]}))}>
                    <span className="sec-toggle-thumb"/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "appearance" && (
            <div className="set-section">
              <div className="set-section-title">Appearance</div>
              <div className="um-form-group" style={{marginBottom:20}}>
                <label>Theme</label>
                <div className="set-theme-options">
                  {["dark","light","auto"].map(t=>(
                    <button key={t} className={`set-theme-btn ${appearance.theme===t?"active":""}`} onClick={()=>setAppearance(a=>({...a,theme:t}))}>
                      {t==="dark"?"🌙":t==="light"?"☀️":"⚙️"} {t.charAt(0).toUpperCase()+t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="um-form-group" style={{marginBottom:20}}>
                <label>Accent Color</label>
                <div className="set-accent-options">
                  {[
                    {name:"indigo",color:"#7b6ffa"},
                    {name:"teal",color:"#27c9b0"},
                    {name:"rose",color:"#f2445c"},
                    {name:"amber",color:"#f4a535"},
                    {name:"violet",color:"#9f7aea"},
                  ].map(c=>(
                    <button key={c.name} className={`set-accent-btn ${appearance.accentColor===c.name?"active":""}`}
                      style={{"--ac":c.color}} onClick={()=>setAppearance(a=>({...a,accentColor:c.name}))}>
                      <div className="set-accent-swatch" style={{background:c.color}}/>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="um-form-group">
                <label>UI Density</label>
                <div className="set-density-options">
                  {["compact","default","comfortable"].map(d=>(
                    <button key={d} className={`set-density-btn ${appearance.density===d?"active":""}`} onClick={()=>setAppearance(a=>({...a,density:d}))}>
                      {d.charAt(0).toUpperCase()+d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "platform" && (
            <div className="set-section">
              <div className="set-section-title">Platform Configuration</div>
              <div className="set-form">
                <div className="um-form-group">
                  <label>Institution Full Name</label>
                  <input className="filter-input set-input" defaultValue="SMART CAMPUS University of Technology"/>
                </div>
                <div className="set-form-row">
                  <div className="um-form-group" style={{flex:1}}><label>Academic Year</label><input className="filter-input set-input" defaultValue="2025–2026"/></div>
                  <div className="um-form-group" style={{flex:1}}><label>Current Semester</label><select className="filter-select set-input"><option>Semester IV</option><option>Semester V</option></select></div>
                </div>
                <div className="um-form-group"><label>Default Language</label><select className="filter-select set-input"><option>English</option><option>Hindi</option><option>Tamil</option></select></div>
                <div className="um-form-group"><label>Max File Upload Size</label><select className="filter-select set-input"><option>50 MB</option><option>100 MB</option><option>250 MB</option></select></div>
              </div>
              <div className="set-divider"/>
              <div className="set-section-title">Feature Flags</div>
              {[
                { name:"AI Academic Assistant", desc:"Enable Claude-powered Q&A for students", enabled:true },
                { name:"WebRTC Live Sessions",  desc:"Enable real-time video lectures", enabled:true },
                { name:"Placement Module",      desc:"Show placement readiness features", enabled:true },
                { name:"Innovation Hub",        desc:"Enable hackathon and idea submission", enabled:false },
              ].map((f,i)=>(
                <div key={i} className="set-notif-row">
                  <div>
                    <div className="set-notif-name">{f.name}</div>
                    <div className="set-notif-desc">{f.desc}</div>
                  </div>
                  <div className={`sec-toggle ${f.enabled?"sec-toggle-on":"sec-toggle-off"}`}>
                    <span className="sec-toggle-thumb" style={{left:f.enabled?19:3}}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "advanced" && (
            <div className="set-section">
              <div className="set-section-title">Advanced Settings</div>
              <div className="set-danger-zone">
                <div className="set-danger-title">⚠️ Danger Zone</div>
                <div className="set-danger-item">
                  <div>
                    <div style={{fontWeight:600,fontSize:12,marginBottom:3}}>Clear All Sessions</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>Force logout all active users immediately</div>
                  </div>
                  <button className="btn btn-rose btn-sm">Clear Sessions</button>
                </div>
                <div className="set-danger-item">
                  <div>
                    <div style={{fontWeight:600,fontSize:12,marginBottom:3}}>Reset Platform Analytics</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>This will clear all cached analytics data</div>
                  </div>
                  <button className="btn btn-rose btn-sm">Reset Analytics</button>
                </div>
                <div className="set-danger-item">
                  <div>
                    <div style={{fontWeight:600,fontSize:12,marginBottom:3}}>Maintenance Mode</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>Take the platform offline for maintenance</div>
                  </div>
                  <button className="btn btn-rose btn-sm">Enable</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
