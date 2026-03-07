// studentResume.jsx
import { useState, useEffect } from "react";
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

// Collapsible card
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

export default function StudentResume({ onBack }) {
  // Sections open state
  const [open, setOpen] = useState({ personal:true, education:true, experience:false, projects:true, skills:true, certifications:false, achievements:false });
  const toggle = (k) => setOpen(o => ({...o,[k]:!o[k]}));

  // ATS fill anim
  const [atsW, setAtsW] = useState(0);
  useEffect(() => { const t = setTimeout(()=>setAtsW(78), 500); return ()=>clearTimeout(t); },[]);

  // Experiences
  const [experiences, setExperiences] = useState([
    { id:1, role:"Software Development Intern", company:"TechCorp Solutions", duration:"Jun 2024 – Aug 2024", desc:"Built REST APIs using FastAPI and PostgreSQL. Reduced query response time by 40% via indexing optimisation." },
  ]);
  const addExp = () => setExperiences(e=>[...e,{id:Date.now(),role:"",company:"",duration:"",desc:""}]);
  const delExp = (id) => setExperiences(e=>e.filter(x=>x.id!==id));
  const updExp = (id,key,val) => setExperiences(e=>e.map(x=>x.id===id?{...x,[key]:val}:x));

  // Projects
  const [projects, setProjects] = useState([
    { id:1, name:"SmartDB Query Optimiser", tech:"Python · PostgreSQL · FastAPI", desc:"Built an AI-powered query suggestion engine achieving 60% faster execution on complex joins." },
    { id:2, name:"Distributed Task Scheduler", tech:"Node.js · Redis · Docker", desc:"Designed a fault-tolerant task queue with automatic retry and load balancing for 10k+ concurrent jobs." },
  ]);
  const addProj = () => setProjects(p=>[...p,{id:Date.now(),name:"",tech:"",desc:""}]);
  const delProj = (id) => setProjects(p=>p.filter(x=>x.id!==id));
  const updProj = (id,key,val) => setProjects(p=>p.map(x=>x.id===id?{...x,[key]:val}:x));

  // Skills
  const PRESET = ["Python","C++","JavaScript","React","Node.js","FastAPI","PostgreSQL","MongoDB","Redis","Docker","Git","Linux","Machine Learning","DSA","System Design","REST APIs"];
  const [skills, setSkills]   = useState(["Python","C++","React","FastAPI","PostgreSQL","Docker","DSA","System Design"]);
  const [skillInput, setSkillInput] = useState("");
  const toggleSkill = (s) => setSkills(sk=>sk.includes(s)?sk.filter(x=>x!==s):[...sk,s]);
  const addCustomSkill = () => { if(skillInput.trim()&&!skills.includes(skillInput.trim())){setSkills(sk=>[...sk,skillInput.trim()]);setSkillInput(""); }};

  // Certs
  const [certs, setCerts] = useState([
    { id:1, name:"AWS Solutions Architect – Associate", issuer:"Amazon Web Services", date:"Dec 2024" },
  ]);
  const addCert = () => setCerts(c=>[...c,{id:Date.now(),name:"",issuer:"",date:""}]);
  const delCert = (id) => setCerts(c=>c.filter(x=>x.id!==id));
  const updCert = (id,key,val) => setCerts(c=>c.map(x=>x.id===id?{...x,[key]:val}:x));

  const [template, setTemplate] = useState(0);
  const TEMPLATES = ["Classic","Modern","Minimal","Compact","Bold","Academic"];

  const ATS_CHIPS = [
    {t:"Action verbs",        cls:"good"},{t:"Quantified results", cls:"good"},
    {t:"Keywords match 78%",  cls:"good"},{t:"Missing: GPA",       cls:"warn"},
    {t:"Add LinkedIn",        cls:"warn"},{t:"No photo — ✓",       cls:"good"},
  ];

  return (
    <div className="rv-root">
      {/* Header */}
      <div className="rv-header">
        <button className="rv-back" onClick={onBack}><IcoBack /> Back</button>
        <div className="rv-header-left">
          <div className="rv-breadcrumb">Career · Resume Builder</div>
          <h1 className="rv-title">Resume Builder</h1>
        </div>
        <div className="rv-header-actions">
          <button className="rv-btn-outline"><IcoSparkle /> AI Improve</button>
          <button className="rv-btn-outline"><IcoEye /> Preview</button>
          <button className="rv-btn-solid"><IcoDownload /> Download PDF</button>
        </div>
      </div>

      {/* ATS Score bar */}
      <div className="rv-ats-bar">
        <div className="rv-ats-score">78</div>
        <div className="rv-ats-info">
          <div className="rv-ats-label">ATS Score — Good</div>
          <div className="rv-ats-track"><div className="rv-ats-fill" style={{width:`${atsW}%`}} /></div>
          <div className="rv-ats-sub">Your resume is parsed well by most applicant tracking systems. A few tweaks can push you to 90+.</div>
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
            <Field label="FULL NAME"><input className="rv-input" defaultValue="Arjun Reddy" /></Field>
            <div className="rv-field-row">
              <Field label="EMAIL"><input className="rv-input rv-input-half" defaultValue="arjun.reddy@college.edu" /></Field>
              <Field label="PHONE"><input className="rv-input rv-input-half" defaultValue="+91 98765 43210" /></Field>
            </div>
            <div className="rv-field-row">
              <Field label="LINKEDIN"><input className="rv-input rv-input-half" defaultValue="linkedin.com/in/arjunreddy" /></Field>
              <Field label="GITHUB"><input className="rv-input rv-input-half" defaultValue="github.com/arjunreddy21" /></Field>
            </div>
            <Field label="LOCATION"><input className="rv-input" defaultValue="Hyderabad, India" /></Field>
            <Field label="PROFESSIONAL SUMMARY">
              <textarea className="rv-textarea" defaultValue="CSE student at Amrita University with strong foundations in algorithms, distributed systems, and full-stack development. Seeking SWE internship / full-time roles for 2025." rows={3}/>
            </Field>
          </Card>

          {/* Education */}
          <Card icon={<IcoBook/>} title="Education" open={open.education} onToggle={()=>toggle("education")}>
            <div className="rv-entry">
              <Field label="DEGREE / COURSE"><input className="rv-input" defaultValue="B.Tech — Computer Science Engineering" /></Field>
              <div className="rv-field-row">
                <Field label="INSTITUTION"><input className="rv-input rv-input-half" defaultValue="Amrita Vishwa Vidyapeetham" /></Field>
                <Field label="DURATION"><input className="rv-input rv-input-half" defaultValue="2021 – 2025" /></Field>
              </div>
              <div className="rv-field-row">
                <Field label="CGPA"><input className="rv-input rv-input-half" defaultValue="8.4 / 10" /></Field>
                <Field label="LOCATION"><input className="rv-input rv-input-half" defaultValue="Hyderabad, India" /></Field>
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
                <Field label="DURATION"><input className="rv-input" placeholder="e.g. Jun 2024 – Aug 2024" value={ex.duration} onChange={e=>updExp(ex.id,"duration",e.target.value)} /></Field>
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
          </Card>
        </div>

        {/* Live Preview */}
        <div>
          <div className="rv-preview">
            <div className="rv-preview-hd">
              <span className="rv-preview-ttl">Live Preview</span>
              <span className="rv-preview-tag">Auto-updating</span>
            </div>
            <div className="rv-doc">
              <div className="rv-doc-name">Arjun Reddy</div>
              <div className="rv-doc-meta">+91 98765 43210 · arjun.reddy@college.edu · Hyderabad, India</div>
              <div className="rv-doc-links">
                <span className="rv-doc-link">linkedin.com/in/arjunreddy</span>
                <span className="rv-doc-link">github.com/arjunreddy21</span>
              </div>
              <div className="rv-doc-div"/>
              <div className="rv-doc-sec-title">Education</div>
              <div className="rv-doc-entry">
                <div className="rv-doc-entry-title">B.Tech — Computer Science Engineering</div>
                <div className="rv-doc-entry-meta">Amrita Vishwa Vidyapeetham</div>
                <div className="rv-doc-entry-date">2021 – 2025 · CGPA: 8.4 / 10</div>
              </div>
              {experiences.length>0 && <>
                <div className="rv-doc-div"/>
                <div className="rv-doc-sec-title">Work Experience</div>
                {experiences.filter(e=>e.role||e.company).map(ex=>(
                  <div key={ex.id} className="rv-doc-entry">
                    <div className="rv-doc-entry-title">{ex.role||"Role"}</div>
                    <div className="rv-doc-entry-meta">{ex.company||"Company"}</div>
                    <div className="rv-doc-entry-date">{ex.duration}</div>
                    {ex.desc && <div className="rv-doc-entry-body">{ex.desc}</div>}
                  </div>
                ))}
              </>}
              {projects.length>0 && <>
                <div className="rv-doc-div"/>
                <div className="rv-doc-sec-title">Projects</div>
                {projects.filter(p=>p.name).map(pr=>(
                  <div key={pr.id} className="rv-doc-entry">
                    <div className="rv-doc-entry-title">{pr.name}</div>
                    {pr.tech && <div className="rv-doc-entry-meta">{pr.tech}</div>}
                    {pr.desc && <div className="rv-doc-entry-body">{pr.desc}</div>}
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
              {certs.length>0 && <>
                <div className="rv-doc-div"/>
                <div className="rv-doc-sec-title">Certifications</div>
                {certs.filter(c=>c.name).map(c=>(
                  <div key={c.id} className="rv-doc-entry">
                    <div className="rv-doc-entry-title">{c.name}</div>
                    <div className="rv-doc-entry-date">{c.issuer} {c.date&&`· ${c.date}`}</div>
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
                {TEMPLATES.map((t,i)=>(
                  <div key={t}>
                    <div className={`rv-tpl ${template===i?"active":""}`} onClick={()=>setTemplate(i)}>
                      <div className="rv-tpl-thumb">
                        <span style={{fontSize:18}}>{["📄","🎨","⬜","📐","🖤","🎓"][i]}</span>
                      </div>
                    </div>
                    <div className="rv-tpl-name">{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}