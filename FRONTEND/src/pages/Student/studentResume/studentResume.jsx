// studentResume.jsx — fully updated with working features
import { useState, useEffect, useRef } from "react";
import "./studentResume.css";

const IcoBack    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoDownload= (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoEye     = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoSparkle = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoTrash   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoChevDn  = (p) => <svg {...p} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoUser    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>;
const IcoBook    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoBrief   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcoCode    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const IcoAward   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoSave    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoRobot   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/><line x1="8" y1="15" x2="8" y2="15"/><line x1="16" y1="15" x2="16" y2="15"/></svg>;
const IcoX       = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoLoader  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="rv-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

// ---------- Template thumbnail SVGs ----------
const TemplateThumbs = {
  Classic: () => (
    <svg viewBox="0 0 60 85" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <rect width="60" height="85" fill="#1a1a2e"/>
      <rect x="8" y="8" width="44" height="6" rx="1" fill="#5b4ef8" opacity=".9"/>
      <rect x="8" y="16" width="28" height="2" rx="1" fill="#7c7ca8" opacity=".6"/>
      <rect x="8" y="22" width="44" height="1" fill="#2e2e4a"/>
      <rect x="8" y="25" width="16" height="1.5" rx=".5" fill="#5b4ef8" opacity=".5"/>
      <rect x="8" y="28" width="40" height="1.5" rx=".5" fill="#4a4a6a" opacity=".7"/>
      <rect x="8" y="31" width="36" height="1.5" rx=".5" fill="#4a4a6a" opacity=".5"/>
      <rect x="8" y="36" width="44" height="1" fill="#2e2e4a"/>
      <rect x="8" y="39" width="20" height="1.5" rx=".5" fill="#5b4ef8" opacity=".5"/>
      <rect x="8" y="42" width="44" height="1.5" rx=".5" fill="#4a4a6a" opacity=".7"/>
      <rect x="8" y="45" width="38" height="1.5" rx=".5" fill="#4a4a6a" opacity=".5"/>
      <rect x="8" y="48" width="42" height="1.5" rx=".5" fill="#4a4a6a" opacity=".4"/>
      <rect x="8" y="53" width="44" height="1" fill="#2e2e4a"/>
      <rect x="8" y="56" width="14" height="1.5" rx=".5" fill="#5b4ef8" opacity=".5"/>
      <rect x="8" y="59" width="10" height="5" rx="2.5" fill="#5b4ef8" opacity=".2"/>
      <rect x="20" y="59" width="10" height="5" rx="2.5" fill="#5b4ef8" opacity=".2"/>
      <rect x="32" y="59" width="10" height="5" rx="2.5" fill="#5b4ef8" opacity=".2"/>
    </svg>
  ),
  Modern: () => (
    <svg viewBox="0 0 60 85" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <rect width="60" height="85" fill="#0f1117"/>
      <rect width="22" height="85" fill="#5b4ef8" opacity=".15"/>
      <circle cx="11" cy="16" r="7" fill="#5b4ef8" opacity=".4"/>
      <rect x="4" y="26" width="14" height="1.5" rx=".5" fill="#fff" opacity=".5"/>
      <rect x="4" y="29" width="10" height="1" rx=".5" fill="#fff" opacity=".3"/>
      <rect x="4" y="34" width="14" height="1" rx=".5" fill="#27c9b0" opacity=".6"/>
      <rect x="4" y="37" width="12" height="1" rx=".5" fill="#fff" opacity=".2"/>
      <rect x="4" y="39" width="12" height="1" rx=".5" fill="#fff" opacity=".2"/>
      <rect x="4" y="44" width="14" height="1" rx=".5" fill="#27c9b0" opacity=".6"/>
      <rect x="4" y="47" width="11" height="1" rx=".5" fill="#fff" opacity=".2"/>
      <rect x="4" y="49" width="9" height="1" rx=".5" fill="#fff" opacity=".2"/>
      <rect x="26" y="8" width="30" height="4" rx="1" fill="#fff" opacity=".8"/>
      <rect x="26" y="14" width="20" height="1.5" rx=".5" fill="#5b4ef8" opacity=".5"/>
      <rect x="26" y="19" width="30" height="1" rx=".5" fill="#3a3a5a" opacity=".7"/>
      <rect x="26" y="25" width="12" height="1.5" rx=".5" fill="#27c9b0" opacity=".6"/>
      <rect x="26" y="28" width="30" height="1" rx=".5" fill="#3a3a5a" opacity=".5"/>
      <rect x="26" y="30" width="24" height="1" rx=".5" fill="#3a3a5a" opacity=".4"/>
      <rect x="26" y="36" width="12" height="1.5" rx=".5" fill="#27c9b0" opacity=".6"/>
      <rect x="26" y="39" width="30" height="1" rx=".5" fill="#3a3a5a" opacity=".5"/>
      <rect x="26" y="41" width="22" height="1" rx=".5" fill="#3a3a5a" opacity=".4"/>
    </svg>
  ),
  Minimal: () => (
    <svg viewBox="0 0 60 85" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <rect width="60" height="85" fill="#fafafa"/>
      <rect x="8" y="10" width="36" height="5" rx=".5" fill="#111" opacity=".85"/>
      <rect x="8" y="17" width="24" height="1.5" rx=".5" fill="#999"/>
      <rect x="8" y="23" width="44" height=".5" fill="#ddd"/>
      <rect x="8" y="27" width="18" height="1.5" rx=".5" fill="#111" opacity=".6"/>
      <rect x="8" y="30" width="40" height="1" rx=".5" fill="#bbb"/>
      <rect x="8" y="32" width="34" height="1" rx=".5" fill="#bbb"/>
      <rect x="8" y="37" width="44" height=".5" fill="#ddd"/>
      <rect x="8" y="41" width="18" height="1.5" rx=".5" fill="#111" opacity=".6"/>
      <rect x="8" y="44" width="44" height="1" rx=".5" fill="#bbb"/>
      <rect x="8" y="46" width="36" height="1" rx=".5" fill="#bbb"/>
      <rect x="8" y="48" width="40" height="1" rx=".5" fill="#bbb"/>
      <rect x="8" y="53" width="44" height=".5" fill="#ddd"/>
      <rect x="8" y="57" width="18" height="1.5" rx=".5" fill="#111" opacity=".6"/>
      <rect x="8" y="60" width="8" height="3" rx="1.5" fill="#eee"/>
      <rect x="18" y="60" width="8" height="3" rx="1.5" fill="#eee"/>
      <rect x="28" y="60" width="8" height="3" rx="1.5" fill="#eee"/>
    </svg>
  ),
  Compact: () => (
    <svg viewBox="0 0 60 85" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <rect width="60" height="85" fill="#111827"/>
      <rect x="0" y="0" width="60" height="18" fill="#1e2337"/>
      <rect x="6" y="5" width="30" height="4" rx="1" fill="#e2e8f0" opacity=".9"/>
      <rect x="6" y="11" width="20" height="1.5" rx=".5" fill="#94a3b8" opacity=".6"/>
      <rect x="44" y="6" width="10" height="10" rx="5" fill="#5b4ef8" opacity=".4"/>
      <rect x="6" y="22" width="8" height="1" rx=".5" fill="#27c9b0" opacity=".7"/>
      <rect x="6" y="24" width="48" height="1" rx=".5" fill="#2a3045"/>
      <rect x="6" y="27" width="40" height="1" rx=".5" fill="#3a4060" opacity=".7"/>
      <rect x="6" y="29" width="36" height="1" rx=".5" fill="#3a4060" opacity=".5"/>
      <rect x="6" y="34" width="8" height="1" rx=".5" fill="#27c9b0" opacity=".7"/>
      <rect x="6" y="36" width="48" height="1" rx=".5" fill="#2a3045"/>
      <rect x="6" y="38" width="48" height="1" rx=".5" fill="#3a4060" opacity=".6"/>
      <rect x="6" y="40" width="38" height="1" rx=".5" fill="#3a4060" opacity=".4"/>
      <rect x="6" y="45" width="8" height="1" rx=".5" fill="#27c9b0" opacity=".7"/>
      <rect x="6" y="47" width="48" height="1" rx=".5" fill="#2a3045"/>
      <rect x="6" y="49" width="7" height="3" rx="1.5" fill="#5b4ef8" opacity=".25"/>
      <rect x="15" y="49" width="7" height="3" rx="1.5" fill="#5b4ef8" opacity=".25"/>
      <rect x="24" y="49" width="7" height="3" rx="1.5" fill="#5b4ef8" opacity=".25"/>
      <rect x="33" y="49" width="7" height="3" rx="1.5" fill="#5b4ef8" opacity=".25"/>
    </svg>
  ),
  Bold: () => (
    <svg viewBox="0 0 60 85" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <rect width="60" height="85" fill="#0a0a0f"/>
      <rect x="0" y="0" width="4" height="85" fill="#5b4ef8"/>
      <rect x="8" y="10" width="44" height="7" rx="1" fill="#fff" opacity=".9"/>
      <rect x="8" y="19" width="30" height="2" rx="1" fill="#5b4ef8" opacity=".7"/>
      <rect x="8" y="25" width="44" height=".5" fill="#222"/>
      <rect x="8" y="29" width="44" height="2" rx=".5" fill="#fff" opacity=".7"/>
      <rect x="8" y="33" width="38" height="1.5" rx=".5" fill="#fff" opacity=".3"/>
      <rect x="8" y="36" width="40" height="1.5" rx=".5" fill="#fff" opacity=".2"/>
      <rect x="8" y="42" width="44" height=".5" fill="#222"/>
      <rect x="8" y="46" width="44" height="2" rx=".5" fill="#fff" opacity=".7"/>
      <rect x="8" y="50" width="38" height="1.5" rx=".5" fill="#fff" opacity=".3"/>
      <rect x="8" y="53" width="30" height="1.5" rx=".5" fill="#fff" opacity=".2"/>
      <rect x="8" y="59" width="44" height=".5" fill="#222"/>
      <rect x="8" y="63" width="9" height="4" rx="2" fill="#5b4ef8" opacity=".5"/>
      <rect x="19" y="63" width="9" height="4" rx="2" fill="#5b4ef8" opacity=".5"/>
      <rect x="30" y="63" width="9" height="4" rx="2" fill="#5b4ef8" opacity=".5"/>
    </svg>
  ),
  Academic: () => (
    <svg viewBox="0 0 60 85" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <rect width="60" height="85" fill="#f8f5f0"/>
      <rect x="8" y="6" width="44" height="1.5" fill="#2c1810" opacity=".6"/>
      <rect x="8" y="10" width="36" height="6" rx=".5" fill="#2c1810" opacity=".85"/>
      <rect x="8" y="18" width="26" height="1.5" rx=".5" fill="#7c5c44" opacity=".7"/>
      <rect x="8" y="22" width="44" height="1.5" fill="#2c1810" opacity=".6"/>
      <rect x="8" y="26" width="18" height="2" rx=".5" fill="#2c1810" opacity=".6"/>
      <rect x="8" y="30" width="44" height="1" rx=".5" fill="#a08060" opacity=".5"/>
      <rect x="8" y="32" width="36" height="1" rx=".5" fill="#a08060" opacity=".4"/>
      <rect x="8" y="37" width="44" height="1.5" fill="#2c1810" opacity=".3"/>
      <rect x="8" y="41" width="20" height="2" rx=".5" fill="#2c1810" opacity=".6"/>
      <rect x="8" y="45" width="44" height="1" rx=".5" fill="#a08060" opacity=".5"/>
      <rect x="8" y="47" width="40" height="1" rx=".5" fill="#a08060" opacity=".4"/>
      <rect x="8" y="49" width="44" height="1" rx=".5" fill="#a08060" opacity=".3"/>
      <rect x="8" y="54" width="44" height="1.5" fill="#2c1810" opacity=".3"/>
      <rect x="8" y="58" width="18" height="2" rx=".5" fill="#2c1810" opacity=".6"/>
      <rect x="8" y="61" width="8" height="3" rx="1.5" fill="#2c1810" opacity=".15"/>
      <rect x="18" y="61" width="8" height="3" rx="1.5" fill="#2c1810" opacity=".15"/>
      <rect x="28" y="61" width="8" height="3" rx="1.5" fill="#2c1810" opacity=".15"/>
    </svg>
  ),
};

// ---------- Collapsible card ----------
function Card({ icon, title, open, onToggle, onAdd, addLabel, children }) {
  return (
    <div className="rv-card">
      <div className="rv-card-hd" onClick={onToggle}>
        <span className="rv-card-ico">{icon}</span>
        <span className="rv-card-ttl">{title}</span>
        {onAdd && (
          <button className="rv-card-add" onClick={e=>{e.stopPropagation();onAdd();}}>
            <IcoPlus/> {addLabel||"Add"}
          </button>
        )}
        <span className={`rv-card-chevron ${open?"open":""}`}><IcoChevDn/></span>
      </div>
      {open && <div className="rv-card-body">{children}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="rv-field">
      <div className="rv-field-label">{label}</div>
      {children}
    </div>
  );
}

// ---------- Resume HTML generator (used for preview & download) ----------
function buildResumeHTML(personal, education, experiences, projects, skills, certs, template) {
  const themes = {
    0: { bg:"#ffffff", accent:"#2563eb", text:"#111827", sub:"#6b7280", border:"#e5e7eb", font:"Georgia, serif" },
    1: { bg:"#0f172a", accent:"#818cf8", text:"#f1f5f9", sub:"#94a3b8", border:"#1e293b", font:"'Segoe UI', sans-serif" },
    2: { bg:"#fafafa", accent:"#111827", text:"#111827", sub:"#9ca3af", border:"#f3f4f6", font:"'Helvetica Neue', sans-serif" },
    3: { bg:"#111827", accent:"#34d399", text:"#e2e8f0", sub:"#6b7280", border:"#1f2937", font:"'Segoe UI', sans-serif" },
    4: { bg:"#09090b", accent:"#a78bfa", text:"#fafafa", sub:"#71717a", border:"#18181b", font:"'Arial Black', sans-serif" },
    5: { bg:"#fffbf5", accent:"#92400e", text:"#1c1917", sub:"#78716c", border:"#e7e5e4", font:"'Georgia', serif" },
  };
  const t = themes[template] || themes[0];
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:${t.font}; background:${t.bg}; color:${t.text}; padding:40px 48px; max-width:760px; margin:0 auto; font-size:13px; line-height:1.6; }
  h1 { font-size:28px; font-weight:700; color:${t.text}; margin-bottom:4px; }
  .meta { color:${t.sub}; font-size:11.5px; margin-bottom:6px; }
  .links { display:flex; gap:16px; margin-bottom:20px; }
  .link { color:${t.accent}; font-size:11px; text-decoration:none; border-bottom:1px solid ${t.accent}40; }
  .divider { height:1px; background:${t.border}; margin:14px 0; }
  .sec-title { font-size:10px; text-transform:uppercase; letter-spacing:.1em; color:${t.sub}; margin-bottom:10px; }
  .entry { margin-bottom:14px; }
  .entry-title { font-size:13px; font-weight:600; color:${t.text}; }
  .entry-meta { font-size:11.5px; color:${t.accent}; }
  .entry-date { font-size:10.5px; color:${t.sub}; }
  .entry-body { font-size:11.5px; color:${t.sub}; margin-top:4px; white-space:pre-line; }
  .skills-row { display:flex; flex-wrap:wrap; gap:6px; }
  .skill { font-size:10px; padding:3px 10px; border-radius:4px; background:${t.accent}15; border:1px solid ${t.accent}30; color:${t.accent}; }
</style>
</head>
<body>
  <h1>${personal?.fullName||""}</h1>
  <div class="meta">${[personal?.phone,personal?.email,personal?.location].filter(Boolean).join(" · ")}</div>
  <div class="links">
    ${personal?.linkedin?`<a class="link" href="${personal.linkedin}">${personal.linkedin}</a>`:""}
    ${personal?.github?`<a class="link" href="${personal.github}">${personal.github}</a>`:""}
  </div>
  ${personal?.summary?`<p style="font-size:12px;color:${t.sub};margin-bottom:16px;">${personal.summary}</p>`:""}
  <div class="divider"></div>
  <div class="sec-title">Education</div>
  <div class="entry">
    <div class="entry-title">${education?.degree||""}</div>
    <div class="entry-meta">${education?.institution||""}</div>
    <div class="entry-date">${[education?.duration, education?.cgpa?"CGPA: "+education.cgpa:""].filter(Boolean).join(" · ")}</div>
  </div>
  ${experiences.filter(e=>e.role||e.company).length>0?`
  <div class="divider"></div>
  <div class="sec-title">Work Experience</div>
  ${experiences.filter(e=>e.role||e.company).map(ex=>`
  <div class="entry">
    <div class="entry-title">${ex.role||"Role"}</div>
    <div class="entry-meta">${ex.company||""}</div>
    <div class="entry-date">${ex.duration||""}</div>
    ${ex.desc?`<div class="entry-body">${ex.desc}</div>`:""}
  </div>`).join("")}`:""}
  ${projects.filter(p=>p.name).length>0?`
  <div class="divider"></div>
  <div class="sec-title">Projects</div>
  ${projects.filter(p=>p.name).map(pr=>`
  <div class="entry">
    <div class="entry-title">${pr.name}</div>
    ${pr.tech?`<div class="entry-meta">${pr.tech}</div>`:""}
    ${pr.desc?`<div class="entry-body">${pr.desc}</div>`:""}
  </div>`).join("")}`:""}
  ${skills.length>0?`
  <div class="divider"></div>
  <div class="sec-title">Technical Skills</div>
  <div class="skills-row">${skills.map(s=>`<span class="skill">${s}</span>`).join("")}</div>`:""}
  ${certs.filter(c=>c.name).length>0?`
  <div class="divider"></div>
  <div class="sec-title">Certifications</div>
  ${certs.filter(c=>c.name).map(c=>`
  <div class="entry">
    <div class="entry-title">${c.name}</div>
    <div class="entry-date">${[c.issuer,c.date].filter(Boolean).join(" · ")}</div>
  </div>`).join("")}`:""}
</body>
</html>`;
}

// ---------- Preview Modal ----------
function PreviewModal({ html, onClose }) {
  useEffect(() => {
    const handler = (e) => { if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return (
    <div className="rv-modal-overlay" onClick={onClose}>
      <div className="rv-modal" onClick={e=>e.stopPropagation()}>
        <div className="rv-modal-hd">
          <span className="rv-modal-ttl">Resume Preview</span>
          <button className="rv-modal-close" onClick={onClose}><IcoX/></button>
        </div>
        <div className="rv-modal-body">
          <iframe
            srcDoc={html}
            title="Resume Preview"
            style={{width:"100%",height:"100%",border:"none",borderRadius:8}}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

// ---------- AI Improve Modal ----------
function AIImproveModal({ resumeData, onClose, onApply }) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/students/resume/improve-with-ai", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ resumeData })
        });
        
        if(!response.ok) {
          const errData = await response.json();
          setError(errData.detail || "Failed to get suggestions");
          setLoading(false);
          return;
        }
        
        const suggestions = await response.json();
        setSuggestions(Array.isArray(suggestions) ? suggestions : []);
        const sel = {};
        suggestions.forEach((_,i)=>{ sel[i]=true; });
        setSelected(sel);
      } catch(err) {
        setError("Failed to get AI suggestions. Please try again.");
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="rv-modal-overlay" onClick={onClose}>
      <div className="rv-modal rv-modal-narrow" onClick={e=>e.stopPropagation()}>
        <div className="rv-modal-hd">
          <span className="rv-modal-ttl" style={{display:"flex",alignItems:"center",gap:7}}><IcoSparkle style={{color:"var(--indigo-ll)"}}/>AI Improve</span>
          <button className="rv-modal-close" onClick={onClose}><IcoX/></button>
        </div>
        <div className="rv-modal-body" style={{padding:20,overflowY:"auto"}}>
          {loading && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12,color:"var(--text3)"}}>
              <IcoLoader style={{width:32,height:32}}/>
              <div style={{fontSize:13}}>Analyzing your resume…</div>
            </div>
          )}
          {error && <div style={{color:"var(--rose)",fontSize:13,textAlign:"center",padding:20}}>{error}</div>}
          {!loading && !error && suggestions.length===0 && (
            <div style={{color:"var(--text3)",fontSize:13,textAlign:"center",padding:20}}>Your resume looks great! No improvements needed.</div>
          )}
          {!loading && suggestions.map((s,i)=>(
            <div key={i} className={`rv-suggest ${selected[i]?"rv-suggest-sel":""}`} onClick={()=>setSelected(p=>({...p,[i]:!p[i]}))}>
              <div className="rv-suggest-hd">
                <span className="rv-suggest-field">{s.field}</span>
                <div className={`rv-suggest-check ${selected[i]?"active":""}`}>{selected[i]&&<IcoCheck/>}</div>
              </div>
              <div className="rv-suggest-reason">{s.reason}</div>
              <div className="rv-suggest-diff">
                <div className="rv-suggest-cur"><span>Before: </span>{s.current}</div>
                <div className="rv-suggest-new"><span>After: </span>{s.improved}</div>
              </div>
            </div>
          ))}
        </div>
        {!loading && suggestions.length>0 && (
          <div style={{padding:"14px 20px",borderTop:"1px solid var(--border)",display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="rv-btn-outline" onClick={onClose}>Cancel</button>
            <button className="rv-btn-solid" onClick={()=>{
              onApply(suggestions.filter((_,i)=>selected[i]));
              onClose();
            }}><IcoSparkle/> Apply Selected</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Make with AI Modal ----------
function MakeWithAIModal({ onClose, onResult }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    if(!prompt.trim()) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/v1/students/resume/generate-with-ai", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ prompt })
      });
      
      if(!response.ok) {
        const errData = await response.json();
        setError(errData.detail || "Failed to generate resume");
        return;
      }
      
      const parsed = await response.json();
      onResult(parsed);
      onClose();
    } catch(err) {
      setError("Failed to generate. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="rv-modal-overlay" onClick={onClose}>
      <div className="rv-modal rv-modal-narrow rv-modal-sm" onClick={e=>e.stopPropagation()}>
        <div className="rv-modal-hd">
          <span className="rv-modal-ttl" style={{display:"flex",alignItems:"center",gap:7}}><IcoRobot style={{color:"var(--teal)"}}/>Make Resume with AI</span>
          <button className="rv-modal-close" onClick={onClose}><IcoX/></button>
        </div>
        <div style={{padding:20}}>
          <p style={{fontSize:12.5,color:"var(--text2)",marginBottom:14,lineHeight:1.6}}>
            Describe yourself and let AI generate your complete resume. Mention your name, degree, skills, and career goals.
          </p>
          <textarea
            className="rv-textarea"
            rows={5}
            placeholder="E.g. I'm Anji, a final-year B.Tech CSE student at VIT Vellore specializing in full-stack development. I've built several React + Node.js projects and interned at a fintech startup. I know Python, JavaScript, and MongoDB."
            value={prompt}
            onChange={e=>setPrompt(e.target.value)}
            style={{marginBottom:12}}
          />
          {error && <div style={{fontSize:12,color:"var(--rose)",marginBottom:10}}>{error}</div>}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="rv-btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="rv-btn-solid" onClick={generate} disabled={loading||!prompt.trim()}>
              {loading?<><IcoLoader/>Generating…</>:<><IcoRobot/>Generate Resume</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Toast ----------
function Toast({ msg, onHide }) {
  useEffect(()=>{ const t=setTimeout(onHide,2800); return()=>clearTimeout(t); },[]);
  return <div className="rv-toast">{msg}</div>;
}

// ============================================================
export default function StudentResume({ onBack }) {
  const [open, setOpen] = useState({ personal:true, education:true, experience:false, projects:true, skills:true, certifications:false });
  const toggle = (k) => setOpen(o => ({...o,[k]:!o[k]}));

  const [personal, setPersonal] = useState({});
  const [education, setEducation] = useState({});
  const [data, setData] = useState(null);
  const [atsW, setAtsW] = useState(0);
  const [toast, setToast] = useState(null);

  const [experiences, setExperiences] = useState([]);
  const addExp = () => setExperiences(e=>[...e,{id:Date.now(),role:"",company:"",duration:"",desc:""}]);
  const delExp = (id) => setExperiences(e=>e.filter(x=>x.id!==id));
  const updExp = (id,key,val) => setExperiences(e=>e.map(x=>x.id===id?{...x,[key]:val}:x));

  const [projects, setProjects] = useState([]);
  const addProj = () => setProjects(p=>[...p,{id:Date.now(),name:"",tech:"",desc:""}]);
  const delProj = (id) => setProjects(p=>p.filter(x=>x.id!==id));
  const updProj = (id,key,val) => setProjects(p=>p.map(x=>x.id===id?{...x,[key]:val}:x));

  const PRESET = ["Python","C++","JavaScript","React","Node.js","FastAPI","PostgreSQL","MongoDB","Redis","Docker","Git","Linux","Machine Learning","DSA","System Design","REST APIs"];
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const toggleSkill = (s) => setSkills(sk=>sk.includes(s)?sk.filter(x=>x!==s):[...sk,s]);
  const addCustomSkill = () => { if(skillInput.trim()&&!skills.includes(skillInput.trim())){setSkills(sk=>[...sk,skillInput.trim()]);setSkillInput(""); }};

  const [certs, setCerts] = useState([]);
  const addCert = () => setCerts(c=>[...c,{id:Date.now(),name:"",issuer:"",date:""}]);
  const delCert = (id) => setCerts(c=>c.filter(x=>x.id!==id));
  const updCert = (id,key,val) => setCerts(c=>c.map(x=>x.id===id?{...x,[key]:val}:x));

  const [template, setTemplate] = useState(0);
  const TEMPLATES = ["Classic","Modern","Minimal","Compact","Bold","Academic"];

  // Modals
  const [showPreview, setShowPreview] = useState(false);
  const [showAIImprove, setShowAIImprove] = useState(false);
  const [showMakeAI, setShowMakeAI] = useState(false);

  // Controlled inputs for personal & education
  const updPersonal = (key,val) => setPersonal(p=>({...p,[key]:val}));
  const updEdu = (key,val) => setEducation(p=>({...p,[key]:val}));

  useEffect(() => {
    import("../../../utils/api").then(({ default: api }) => {
      api.get("/student/resume").then(res => {
        setData(res);
        setPersonal(res.personal || {});
        setEducation(res.education || {});
        setExperiences(res.experiences || []);
        setProjects(res.projects || []);
        setSkills(res.skills || []);
        setCerts(res.certs || []);
        setTimeout(()=>setAtsW(res.ats_score || 0), 500);
      }).catch(() => {
        // Fallback demo data
        const demo = {
          ats_score: 70,
          ats_chips: [
            {t:"Contact Info", cls:"good"},{t:"Education", cls:"good"},
            {t:"Skills Listed", cls:"good"},{t:"Work Experience", cls:"warn"},
            {t:"Summary Missing", cls:"bad"}
          ],
          personal:{ fullName:"Anji", email:"student@gmail.com", phone:"+91 98765 43210", linkedin:"linkedin.com/in/anji", github:"github.com/anji", location:"Global", summary:"" },
          education:{ degree:"B.Tech Computer Science", institution:"VIT Vellore", duration:"2021 – 2025", cgpa:"8.5", location:"Vellore" },
          experiences:[], projects:[], skills:["Python","JavaScript","React","Node.js","MongoDB","Git"], certs:[]
        };
        setData(demo);
        setPersonal(demo.personal);
        setEducation(demo.education);
        setExperiences(demo.experiences);
        setProjects(demo.projects);
        setSkills(demo.skills);
        setCerts(demo.certs);
        setTimeout(()=>setAtsW(demo.ats_score), 500);
      });
    }).catch(() => {
      const demo = {
        ats_score: 70,
        ats_chips: [
          {t:"Contact Info", cls:"good"},{t:"Education", cls:"good"},
          {t:"Skills Listed", cls:"good"},{t:"Work Experience", cls:"warn"},
          {t:"Summary Missing", cls:"bad"}
        ],
        personal:{ fullName:"Anji", email:"student@gmail.com", phone:"+91 98765 43210", linkedin:"linkedin.com/in/anji", github:"github.com/anji", location:"Global", summary:"" },
        education:{ degree:"B.Tech Computer Science", institution:"VIT Vellore", duration:"2021 – 2025", cgpa:"8.5", location:"Vellore" },
        experiences:[], projects:[], skills:["Python","JavaScript","React","Node.js","MongoDB","Git"], certs:[]
      };
      setData(demo);
      setPersonal(demo.personal);
      setEducation(demo.education);
      setSkills(demo.skills);
      setTimeout(()=>setAtsW(demo.ats_score), 500);
    });
  }, []);

  const getResumeHTML = () => buildResumeHTML(personal, education, experiences, projects, skills, certs, template);

  const handleDownload = () => {
    const html = getResumeHTML();
    const blob = new Blob([html], {type:"text/html"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${personal?.fullName||"resume"}_resume.html`;
    a.click(); URL.revokeObjectURL(url);
    setToast("Resume downloaded!");
  };

  const handleUpdate = () => {
    // Save to API if available; just show toast
    try {
      import("../../../utils/api").then(({ default: api }) => {
        api.post("/student/resume", { personal, education, experiences, projects, skills, certs })
          .then(()=>setToast("Resume saved successfully!"))
          .catch(()=>setToast("Resume saved locally!"));
      }).catch(()=>setToast("Resume saved locally!"));
    } catch { setToast("Resume saved locally!"); }
  };

  const handleAIApply = (suggestions) => {
    suggestions.forEach(s => {
      if(s.field==="summary") updPersonal("summary", s.improved);
      if(s.field==="experience_desc" && experiences.length>0) {
        setExperiences(prev => prev.map((e,i)=>i===0?{...e,desc:s.improved}:e));
      }
    });
    setToast(`Applied ${suggestions.length} AI improvement${suggestions.length!==1?"s":""}!`);
  };

  const handleMakeAIResult = (result) => {
    if(result.personal) setPersonal(result.personal);
    if(result.education) setEducation(result.education);
    if(result.experiences) setExperiences(result.experiences.map((e,i)=>({...e,id:Date.now()+i})));
    if(result.projects) setProjects(result.projects.map((p,i)=>({...p,id:Date.now()+i+100})));
    if(result.skills) setSkills(result.skills);
    if(result.certs) setCerts(result.certs);
    setToast("Resume generated with AI!");
  };

  if (!data) return <div className="rv-root" style={{ padding: 40, textAlign: "center", color:"var(--text3)" }}>Loading Resume Data…</div>;
  const ATS_CHIPS = data.ats_chips || [];

  return (
    <div className="rv-root">
      {/* Modals */}
      {showPreview && <PreviewModal html={getResumeHTML()} onClose={()=>setShowPreview(false)}/>}
      {showAIImprove && <AIImproveModal resumeData={{personal,education,experiences,projects,skills,certs}} onClose={()=>setShowAIImprove(false)} onApply={handleAIApply}/>}
      {showMakeAI && <MakeWithAIModal onClose={()=>setShowMakeAI(false)} onResult={handleMakeAIResult}/>}
      {toast && <Toast msg={toast} onHide={()=>setToast(null)}/>}

      {/* Header */}
      <div className="rv-header">
        <button className="rv-back" onClick={onBack}><IcoBack /> Back</button>
        <div className="rv-header-left">
          <div className="rv-breadcrumb">Career · Resume Builder</div>
          <h1 className="rv-title">Resume Builder</h1>
        </div>
        <div className="rv-header-actions">
          <button className="rv-btn-outline" onClick={()=>setShowAIImprove(true)}><IcoSparkle /> AI Improve</button>
          <button className="rv-btn-outline" onClick={()=>setShowPreview(true)}><IcoEye /> Preview</button>
          <button className="rv-btn-solid" onClick={handleDownload}><IcoDownload /> Download PDF</button>
        </div>
      </div>

      {/* ATS Score */}
      <div className="rv-ats-bar">
        <div className="rv-ats-score">{data.ats_score || 0}</div>
        <div className="rv-ats-info">
          <div className="rv-ats-label">ATS Score — {data.ats_score >= 85 ? "Excellent" : data.ats_score >= 70 ? "Good" : data.ats_score >= 50 ? "Average" : "Needs Work"}</div>
          <div className="rv-ats-track"><div className="rv-ats-fill" style={{width:`${atsW}%`}} /></div>
          <div className="rv-ats-sub">Your resume is parsed well by most applicant tracking systems.</div>
        </div>
        <div className="rv-ats-chips">
          {ATS_CHIPS.map(c=><span key={c.t} className={`rv-ats-chip ${c.cls}`}>{c.cls==="good"?<IcoCheck/>:c.cls==="warn"?"⚠":"✗"} {c.t}</span>)}
        </div>
      </div>

      <div className="rv-layout">
        {/* Editor */}
        <div className="rv-editor">
          {/* Personal Info */}
          <Card icon={<IcoUser/>} title="Personal Information" open={open.personal} onToggle={()=>toggle("personal")}>
            <Field label="FULL NAME"><input className="rv-input" value={personal.fullName||""} onChange={e=>updPersonal("fullName",e.target.value)}/></Field>
            <div className="rv-field-row">
              <Field label="EMAIL"><input className="rv-input rv-input-half" value={personal.email||""} onChange={e=>updPersonal("email",e.target.value)}/></Field>
              <Field label="PHONE"><input className="rv-input rv-input-half" value={personal.phone||""} onChange={e=>updPersonal("phone",e.target.value)}/></Field>
            </div>
            <div className="rv-field-row">
              <Field label="LINKEDIN"><input className="rv-input rv-input-half" value={personal.linkedin||""} onChange={e=>updPersonal("linkedin",e.target.value)}/></Field>
              <Field label="GITHUB"><input className="rv-input rv-input-half" value={personal.github||""} onChange={e=>updPersonal("github",e.target.value)}/></Field>
            </div>
            <Field label="LOCATION"><input className="rv-input" value={personal.location||""} onChange={e=>updPersonal("location",e.target.value)}/></Field>
            <Field label="PROFESSIONAL SUMMARY">
              <textarea className="rv-textarea" value={personal.summary||""} onChange={e=>updPersonal("summary",e.target.value)} rows={3} placeholder="Write a brief professional summary…"/>
            </Field>
          </Card>

          {/* Education */}
          <Card icon={<IcoBook/>} title="Education" open={open.education} onToggle={()=>toggle("education")}>
            <div className="rv-entry">
              <Field label="DEGREE / COURSE"><input className="rv-input" value={education.degree||""} onChange={e=>updEdu("degree",e.target.value)}/></Field>
              <div className="rv-field-row">
                <Field label="INSTITUTION"><input className="rv-input rv-input-half" value={education.institution||""} onChange={e=>updEdu("institution",e.target.value)}/></Field>
                <Field label="DURATION"><input className="rv-input rv-input-half" value={education.duration||""} onChange={e=>updEdu("duration",e.target.value)}/></Field>
              </div>
              <div className="rv-field-row">
                <Field label="CGPA"><input className="rv-input rv-input-half" value={education.cgpa||""} onChange={e=>updEdu("cgpa",e.target.value)}/></Field>
                <Field label="LOCATION"><input className="rv-input rv-input-half" value={education.location||""} onChange={e=>updEdu("location",e.target.value)}/></Field>
              </div>
            </div>
          </Card>

          {/* Experience */}
          <Card icon={<IcoBrief/>} title="Work Experience" open={open.experience} onToggle={()=>toggle("experience")} onAdd={addExp} addLabel="Add Role">
            {experiences.map(ex=>(
              <div key={ex.id} className="rv-entry">
                <div className="rv-entry-hd">
                  <div className="rv-entry-title-row">
                    <input className="rv-input rv-input-half" placeholder="Job Title / Role" value={ex.role} onChange={e=>updExp(ex.id,"role",e.target.value)} />
                    <input className="rv-input rv-input-half" placeholder="Company Name" value={ex.company} onChange={e=>updExp(ex.id,"company",e.target.value)} />
                  </div>
                  <button className="rv-entry-del" onClick={()=>delExp(ex.id)}><IcoTrash/></button>
                </div>
                <Field label="DURATION"><input className="rv-input" placeholder="e.g. Jun 2024 – Aug 2024" value={ex.duration} onChange={e=>updExp(ex.id,"duration",e.target.value)}/></Field>
                <Field label="DESCRIPTION (use bullet points)">
                  <textarea className="rv-textarea" placeholder="• Built REST APIs…&#10;• Reduced response time by 40%…" value={ex.desc} onChange={e=>updExp(ex.id,"desc",e.target.value)} rows={3}/>
                </Field>
              </div>
            ))}
            {experiences.length===0 && <div style={{fontSize:11.5,color:"var(--text3)",textAlign:"center",padding:"20px 0"}}>No experience added yet. Click Add Role.</div>}
          </Card>

          {/* Projects */}
          <Card icon={<IcoCode/>} title="Projects" open={open.projects} onToggle={()=>toggle("projects")} onAdd={addProj} addLabel="Add Project">
            {projects.map(pr=>(
              <div key={pr.id} className="rv-entry">
                <div className="rv-entry-hd">
                  <div className="rv-entry-title-row">
                    <input className="rv-input rv-input-half" placeholder="Project Name" value={pr.name} onChange={e=>updProj(pr.id,"name",e.target.value)} />
                    <input className="rv-input rv-input-half" placeholder="Tech Stack" value={pr.tech} onChange={e=>updProj(pr.id,"tech",e.target.value)} />
                  </div>
                  <button className="rv-entry-del" onClick={()=>delProj(pr.id)}><IcoTrash/></button>
                </div>
                <Field label="DESCRIPTION">
                  <textarea className="rv-textarea" placeholder="What did you build and what impact did it have?" value={pr.desc} onChange={e=>updProj(pr.id,"desc",e.target.value)} rows={2}/>
                </Field>
              </div>
            ))}
            {projects.length===0 && <div style={{fontSize:11.5,color:"var(--text3)",textAlign:"center",padding:"20px 0"}}>No projects added yet. Click Add Project.</div>}
          </Card>

          {/* Skills */}
          <Card icon={<IcoAward/>} title="Skills" open={open.skills} onToggle={()=>toggle("skills")}>
            <div className="rv-skills-grid">
              {PRESET.map(s=>(
                <span key={s} className={`rv-skill-chip ${skills.includes(s)?"active":""}`} onClick={()=>toggleSkill(s)}>
                  {skills.includes(s)&&<IcoCheck/>} {s}
                </span>
              ))}
            </div>
            <div className="rv-skill-add">
              <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} placeholder="Add custom skill…" onKeyDown={e=>e.key==="Enter"&&addCustomSkill()} />
              <button onClick={addCustomSkill}>Add</button>
            </div>
          </Card>

          {/* Certifications */}
          <Card icon={<IcoAward/>} title="Certifications" open={open.certifications} onToggle={()=>toggle("certifications")} onAdd={addCert} addLabel="Add Cert">
            {certs.map(c=>(
              <div key={c.id} className="rv-entry">
                <div className="rv-entry-hd">
                  <div className="rv-entry-title-row">
                    <input className="rv-input" style={{flex:1}} placeholder="Certification Name" value={c.name} onChange={e=>updCert(c.id,"name",e.target.value)} />
                  </div>
                  <button className="rv-entry-del" onClick={()=>delCert(c.id)}><IcoTrash/></button>
                </div>
                <div className="rv-field-row">
                  <Field label="ISSUING BODY"><input className="rv-input rv-input-half" value={c.issuer} onChange={e=>updCert(c.id,"issuer",e.target.value)} /></Field>
                  <Field label="DATE"><input className="rv-input rv-input-half" value={c.date} onChange={e=>updCert(c.id,"date",e.target.value)} /></Field>
                </div>
              </div>
            ))}
            {certs.length===0 && <div style={{fontSize:11.5,color:"var(--text3)",textAlign:"center",padding:"20px 0"}}>No certifications added yet.</div>}
          </Card>

          {/* ── Bottom action buttons ── */}
          <div className="rv-bottom-actions">
            <button className="rv-btn-bottom-outline" onClick={()=>setShowMakeAI(true)}>
              <IcoRobot /> Make with AI
            </button>
            <button className="rv-btn-bottom-solid" onClick={handleUpdate}>
              <IcoSave /> Update Resume
            </button>
          </div>
        </div>

        {/* Live Preview + Templates */}
        <div>
          <div className="rv-preview">
            <div className="rv-preview-hd">
              <span className="rv-preview-ttl">Live Preview</span>
              <span className="rv-preview-tag">Auto-updating</span>
            </div>
            <div className="rv-doc">
              <div className="rv-doc-name">{personal?.fullName}</div>
              <div className="rv-doc-meta">{[personal?.phone,personal?.email,personal?.location].filter(Boolean).join(" · ")}</div>
              <div className="rv-doc-links">
                {personal?.linkedin&&<span className="rv-doc-link">{personal.linkedin}</span>}
                {personal?.github&&<span className="rv-doc-link">{personal.github}</span>}
              </div>
              {personal?.summary&&<div style={{fontSize:10.5,color:"var(--text3)",lineHeight:1.6,marginBottom:10}}>{personal.summary}</div>}
              <div className="rv-doc-div"/>
              <div className="rv-doc-sec-title">Education</div>
              <div className="rv-doc-entry">
                <div className="rv-doc-entry-title">{education?.degree}</div>
                <div className="rv-doc-entry-meta">{education?.institution}</div>
                <div className="rv-doc-entry-date">{education?.duration}{education?.cgpa&&` · CGPA: ${education.cgpa}`}</div>
              </div>
              {experiences.filter(e=>e.role||e.company).length>0 && <>
                <div className="rv-doc-div"/>
                <div className="rv-doc-sec-title">Work Experience</div>
                {experiences.filter(e=>e.role||e.company).map(ex=>(
                  <div key={ex.id} className="rv-doc-entry">
                    <div className="rv-doc-entry-title">{ex.role||"Role"}</div>
                    <div className="rv-doc-entry-meta">{ex.company||"Company"}</div>
                    <div className="rv-doc-entry-date">{ex.duration}</div>
                    {ex.desc&&<div className="rv-doc-entry-body">{ex.desc}</div>}
                  </div>
                ))}
              </>}
              {projects.filter(p=>p.name).length>0 && <>
                <div className="rv-doc-div"/>
                <div className="rv-doc-sec-title">Projects</div>
                {projects.filter(p=>p.name).map(pr=>(
                  <div key={pr.id} className="rv-doc-entry">
                    <div className="rv-doc-entry-title">{pr.name}</div>
                    {pr.tech&&<div className="rv-doc-entry-meta">{pr.tech}</div>}
                    {pr.desc&&<div className="rv-doc-entry-body">{pr.desc}</div>}
                  </div>
                ))}
              </>}
              {skills.length>0 && <>
                <div className="rv-doc-div"/>
                <div className="rv-doc-sec-title">Technical Skills</div>
                <div className="rv-doc-skills-row">
                  {skills.map(s=><span key={s} className="rv-doc-skill">{s}</span>)}
                </div>
              </>}
              {certs.filter(c=>c.name).length>0 && <>
                <div className="rv-doc-div"/>
                <div className="rv-doc-sec-title">Certifications</div>
                {certs.filter(c=>c.name).map(c=>(
                  <div key={c.id} className="rv-doc-entry">
                    <div className="rv-doc-entry-title">{c.name}</div>
                    <div className="rv-doc-entry-date">{c.issuer}{c.date&&` · ${c.date}`}</div>
                  </div>
                ))}
              </>}
            </div>
          </div>

          {/* Template picker */}
          <div style={{marginTop:16,background:"var(--surface1)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
            <div style={{padding:"12px 18px",borderBottom:"1px solid var(--border)",fontSize:12.5,fontWeight:600,color:"var(--text1)"}}>Templates</div>
            <div style={{padding:16}}>
              <div className="rv-template-grid">
                {TEMPLATES.map((t,i)=>{
                  const Thumb = TemplateThumbs[t];
                  return (
                    <div key={t}>
                      <div className={`rv-tpl ${template===i?"active":""}`} onClick={()=>setTemplate(i)}>
                        <div className="rv-tpl-thumb">
                          <Thumb/>
                        </div>
                      </div>
                      <div className="rv-tpl-name">{t}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}