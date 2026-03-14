import { useState } from "react";
import "./adminSecurity.css";

const THREATS = [
  { id:1, type:"Failed Login", severity:"high",   source:"45.33.12.91",  target:"admin portal",   time:"15m ago", status:"blocked" },
  { id:2, type:"Rate Limit",   severity:"medium",  source:"203.45.x.x",   target:"/api/quiz/",     time:"2h ago",  status:"mitigated" },
  { id:3, type:"SQL Probe",    severity:"critical", source:"134.90.12.44", target:"/api/users/",    time:"6h ago",  status:"blocked" },
  { id:4, type:"Scan",         severity:"low",     source:"185.22.44.11", target:"port scan",      time:"1d ago",  status:"logged" },
];

const RULES = [
  { name:"Multi-Factor Authentication",    desc:"Require MFA for all admin logins",   enabled:true  },
  { name:"Rate Limiting",                  desc:"100 req/min per IP on API endpoints", enabled:true  },
  { name:"Session Timeout",               desc:"Auto-logout after 30 min of inactivity",enabled:true },
  { name:"Geo-Blocking",                  desc:"Block requests from restricted regions",enabled:false },
  { name:"IP Allowlist",                  desc:"Restrict admin access to campus IPs",  enabled:false },
  { name:"Brute Force Protection",        desc:"Lock after 5 failed login attempts",   enabled:true  },
  { name:"CSRF Protection",              desc:"Token validation on all state changes", enabled:true  },
  { name:"Content Security Policy",       desc:"Restrict executable script sources",   enabled:true  },
];

const SEV_MAP = { critical:"sev-critical", high:"sev-high", medium:"sev-medium", low:"sev-low" };
const STATUS_MAP2 = { blocked:"sec-blocked", mitigated:"sec-mitigated", logged:"sec-logged" };

export default function AdminSecurity() {
  const [rules, setRules] = useState(RULES);
  const toggleRule = (i) => setRules(r => r.map((item,idx)=>idx===i?{...item,enabled:!item.enabled}:item));

  const score = Math.round((rules.filter(r=>r.enabled).length/rules.length)*100);

  return (
    <div className="sec-root">
      <div className="um-header">
        <div>
          <div className="um-breadcrumb">Platform → Security</div>
          <h1 className="um-title">Security <em>Center</em></h1>
          <p className="um-sub">Monitor threats, manage access controls and security policies</p>
        </div>
        <div className="um-header-actions">
          <button className="btn btn-ghost btn-sm">Run Security Scan</button>
          <button className="btn btn-rose btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {THREATS.filter(t=>t.severity==="critical"||t.severity==="high").length} Alerts
          </button>
        </div>
      </div>

      {/* Score card + Stats */}
      <div className="sec-top-grid">
        <div className="sec-score-card">
          <div className="sec-score-label">Security Score</div>
          <div className="sec-score-ring">
            <svg viewBox="0 0 100 100" className="sec-ring-svg">
              <circle cx="50" cy="50" r="40" className="sec-ring-bg"/>
              <circle cx="50" cy="50" r="40" className="sec-ring-fill"
                style={{"--pct":`${score*2.51}`}}/>
            </svg>
            <div className="sec-score-num">
              <span>{score}</span>
              <span className="sec-score-pct">/ 100</span>
            </div>
          </div>
          <div className={`sec-score-grade ${score>=80?"grade-good":score>=60?"grade-warn":"grade-bad"}`}>
            {score>=80?"GOOD":score>=60?"FAIR":"POOR"}
          </div>
          <div className="sec-score-sub">{rules.filter(r=>r.enabled).length} of {rules.length} controls active</div>
        </div>

        <div className="sec-quick-stats">
          {[
            { label:"Threats Blocked Today", val:"14",  color:"rose",   icon:"🛡️" },
            { label:"Active Sessions",        val:"83",  color:"teal",   icon:"🔓" },
            { label:"Failed Logins (24h)",    val:"7",   color:"amber",  icon:"⚠️" },
            { label:"API Requests (24h)",     val:"24k", color:"indigo", icon:"⚡" },
          ].map(s=>(
            <div key={s.label} className={`sec-qs sc-${s.color}`}>
              <div className="sec-qs-icon">{s.icon}</div>
              <div>
                <div className="sec-qs-val">{s.val}</div>
                <div className="sec-qs-lbl">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-grid-wide" style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:16}}>
        {/* Security Rules */}
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Security Controls
            </div>
          </div>
          <div className="sec-rules">
            {rules.map((r,i)=>(
              <div key={i} className="sec-rule-item">
                <div className="sec-rule-info">
                  <div className="sec-rule-name">{r.name}</div>
                  <div className="sec-rule-desc">{r.desc}</div>
                </div>
                <button className={`sec-toggle ${r.enabled?"sec-toggle-on":"sec-toggle-off"}`} onClick={()=>toggleRule(i)}>
                  <span className="sec-toggle-thumb"/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Log */}
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-ttl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              Recent Threats
            </div>
          </div>
          <div className="sec-threats">
            {THREATS.map(t=>(
              <div key={t.id} className="sec-threat-item">
                <div className={`sec-sev-dot ${SEV_MAP[t.severity]}`}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:12}}>{t.type}</span>
                    <span className={`sec-sev-badge ${SEV_MAP[t.severity]}`}>{t.severity}</span>
                  </div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>
                    <span style={{fontFamily:"monospace"}}>{t.source}</span> → {t.target}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div className={`status-tag ${STATUS_MAP2[t.status]}`} style={{display:"inline-flex",marginBottom:4}}>{t.status}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{t.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trusted IPs */}
          <div style={{padding:"14px 16px",borderTop:"1px solid var(--border)"}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--text3)",marginBottom:10}}>Trusted IP Ranges</div>
            {["10.0.0.0/8 — Campus LAN","192.168.0.0/16 — Hostel Network","172.16.0.0/12 — Faculty VPN"].map(ip=>(
              <div key={ip} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)",fontSize:11}}>
                <span style={{fontFamily:"monospace",color:"var(--text2)",fontSize:11}}>{ip}</span>
                <span className="status-tag status-active"><span className="status-dot"/>trusted</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
              <button className="btn btn-ghost btn-sm">+ Add IP Range</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}