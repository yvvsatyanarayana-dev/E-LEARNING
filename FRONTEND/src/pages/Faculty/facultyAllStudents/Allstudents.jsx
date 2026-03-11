// allStudents.jsx  —  place at: src/pages/Faculty/allStudents/allStudents.jsx
import { useState, useEffect } from "react";
import api from "../../../utils/api";
import "./allStudents.css";

const IcoChevL  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoSearch = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoClose  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoFilter = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoDownload=(p)=> <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoGrid   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IcoList   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IcoMail   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoChevR  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoAlert  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const COURSES_META = {
  cs501: { code:"CS501", name:"Operating Systems",           color:"var(--indigo-l)",  rgb:"91,78,248",   bg:"rgba(91,78,248,.1)",   border:"rgba(91,78,248,.22)"  },
  cs502: { code:"CS502", name:"Database Management Systems", color:"var(--teal)",      rgb:"39,201,176",  bg:"rgba(39,201,176,.1)",  border:"rgba(39,201,176,.22)" },
  cs503: { code:"CS503", name:"Computer Architecture",       color:"var(--violet)",    rgb:"159,122,234", bg:"rgba(159,122,234,.1)", border:"rgba(159,122,234,.22)"},
};

// STUDENTS data is now fetched from the API

const STATUS_META = {
  good:    { label:"Good",    color:"var(--teal)",  bg:"rgba(39,201,176,.1)",  border:"rgba(39,201,176,.22)" },
  average: { label:"Average", color:"var(--amber)", bg:"rgba(244,165,53,.1)",  border:"rgba(244,165,53,.2)"  },
  "at-risk":{ label:"At Risk",color:"var(--rose)",  bg:"rgba(242,68,92,.1)",   border:"rgba(242,68,92,.2)"   },
};

function ProgressBar({ pct, color = "var(--indigo-l)", height = 4 }) {
  return (
    <div className="stu-prog-track" style={{ height }}>
      <div className="stu-prog-fill" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  );
}

function StudentCard({ s }) {
  const c = COURSES_META[s.course.toLowerCase()] || COURSES_META["cs501"];
  const sm = STATUS_META[s.status];
  const initials = s.name.split(" ").map(n=>n[0]).join("").slice(0,2);
  return (
    <div className="stu-card">
      <div className="stu-card-accent" style={{ background: `rgba(${c.rgb},.5)` }} />
      <div className="stu-card-top">
        <div className="stu-card-avatar" style={{ background: c.bg, borderColor: c.border, color: c.color }}>{initials}</div>
        <div className="stu-card-info">
          <div className="stu-card-name">{s.name}</div>
          <div className="stu-card-roll">{s.roll}</div>
        </div>
        <span className="stu-status-badge" style={{ color: sm.color, background: sm.bg, borderColor: sm.border }}>{sm.label}</span>
      </div>
      <div className="stu-card-chips">
        <span className="stu-course-chip" style={{ color: c.color, background: c.bg, borderColor: c.border }}>{c.code}</span>
        <span className="stu-batch-chip">Batch {s.batch}</span>
        <span className="stu-batch-chip">Sem {s.sem}</span>
      </div>
      <div className="stu-card-stats">
        <div className="stu-stat">
          <div className="stu-stat-val" style={{ color: s.cgpa >= 8 ? "var(--teal)" : s.cgpa >= 7 ? "var(--amber)" : "var(--rose)" }}>{s.cgpa}</div>
          <div className="stu-stat-lbl">CGPA</div>
        </div>
        <div className="stu-stat-sep" />
        <div className="stu-stat">
          <div className="stu-stat-val" style={{ color: s.attendance >= 75 ? "var(--teal)" : "var(--rose)" }}>{s.attendance}%</div>
          <div className="stu-stat-lbl">Attend.</div>
        </div>
        <div className="stu-stat-sep" />
        <div className="stu-stat">
          <div className="stu-stat-val" style={{ color: s.score >= 70 ? "var(--teal)" : s.score >= 50 ? "var(--amber)" : "var(--rose)" }}>{s.score}%</div>
          <div className="stu-stat-lbl">Score</div>
        </div>
      </div>
      <ProgressBar pct={s.attendance} color={`rgba(${c.rgb},1)`} />
      <div className="stu-card-email"><IcoMail style={{width:10,height:10}} />{s.email}</div>
    </div>
  );
}

export default function AllStudents({ onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [course, setCourse]     = useState("all");
  const [status, setStatus]     = useState("all");
  const [sort,   setSort]       = useState("name");
  const [view,   setView]       = useState("grid");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get("/faculty/students");
        setStudents(response);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const safeStudents = Array.isArray(students) ? students : [];
  const filtered = safeStudents.filter(s => {
    if (course !== "all" && s.course.toLowerCase() !== course) return false;
    if (status !== "all" && s.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.roll.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a,b) => {
    if (sort === "name")    return a.name.localeCompare(b.name);
    if (sort === "cgpa")    return b.cgpa - a.cgpa;
    if (sort === "attend")  return b.attendance - a.attendance;
    if (sort === "score")   return b.score - a.score;
    return 0;
  });

  const atRisk = safeStudents.filter(s => s.status === "at-risk").length;
  const avgAtt = safeStudents.length ? Math.round(safeStudents.reduce((a,s)=>a+s.attendance,0)/safeStudents.length) : 0;
  const avgScore = safeStudents.length ? Math.round(safeStudents.reduce((a,s)=>a+s.score,0)/safeStudents.length) : 0;

  return (
    <div className="stu-root">
      <div className="stu-page-hd">
        <div>
          <button className="stu-back-btn" onClick={onBack}><IcoChevL style={{width:13,height:13}}/> Dashboard</button>
          <div className="greet-title" style={{marginBottom:2}}>All Students</div>
          <div className="greet-sub">Manage and monitor student performance across all courses</div>
        </div>
        <div className="stu-hd-right">
          <button className="btn btn-ghost" style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}>
            <IcoDownload style={{width:13,height:13}}/> Export CSV
          </button>
          <button className="btn btn-ghost" style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}>
            <IcoMail style={{width:13,height:13}}/> Bulk Email
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stu-stat-strip">
        {[
          { label:"Total Students", value: safeStudents.length, cls:"sc-teal"   },
          { label:"At Risk",        value: atRisk,           cls:"sc-rose"   },
          { label:"Avg Attendance", value: `${avgAtt}%`,    cls:"sc-amber"  },
          { label:"Avg Score",      value: `${avgScore}%`,  cls:"sc-indigo" },
          { label:"Courses",        value: 3,               cls:"sc-violet" },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-val">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* At-risk banner */}
      {atRisk > 0 && (
        <div className="stu-risk-banner">
          <IcoAlert style={{width:16,height:16,color:"var(--rose)",flexShrink:0}}/>
          <div>
            <span className="stu-risk-title">{atRisk} students are at risk</span>
            <span className="stu-risk-sub"> — attendance below 65% or score below 45%</span>
          </div>
          <button className="btn btn-ghost" style={{marginLeft:"auto",fontSize:11.5,display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            View All <IcoChevR style={{width:10,height:10}}/>
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="stu-toolbar">
        <div className="stu-search">
          <IcoSearch style={{width:13,height:13,flexShrink:0,color:"var(--text3)"}}/>
          <input className="stu-search-inp" placeholder="Search by name, roll, email…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button className="stu-search-clear" onClick={()=>setSearch("")}><IcoClose style={{width:10,height:10}}/></button>}
        </div>
        <div className="stu-toolbar-right">
          <select className="stu-select" value={course} onChange={e=>setCourse(e.target.value)}>
            <option value="all">All Courses</option>
            {Object.entries(COURSES_META).map(([k,c])=><option key={k} value={k}>{c.code}</option>)}
          </select>
          <select className="stu-select" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="at-risk">At Risk</option>
          </select>
          <select className="stu-select" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="name">Name A–Z</option>
            <option value="cgpa">Highest CGPA</option>
            <option value="attend">Attendance</option>
            <option value="score">Avg Score</option>
          </select>
          <div className="stu-view-toggle">
            <button className={`stu-vbtn ${view==="grid"?"stu-vbtn--active":""}`} onClick={()=>setView("grid")}><IcoGrid style={{width:13,height:13}}/></button>
            <button className={`stu-vbtn ${view==="list"?"stu-vbtn--active":""}`} onClick={()=>setView("list")}><IcoList style={{width:13,height:13}}/></button>
          </div>
        </div>
      </div>

      <div className="stu-results-bar">Showing <strong style={{color:"var(--text2)"}}>{filtered.length}</strong> of {safeStudents.length} students</div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="stu-grid">
          {filtered.map(s => <StudentCard key={s.roll} s={s}/>)}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="stu-list-panel panel">
          <div className="stu-list-head">
            <span>#</span><span>Student</span><span>Course</span><span>Batch</span><span>CGPA</span><span>Attendance</span><span>Score</span><span>Status</span>
          </div>
          {filtered.map((s,i) => {
            const c  = COURSES_META[s.course.toLowerCase()] || COURSES_META["cs501"];
            const sm = STATUS_META[s.status];
            const initials = s.name.split(" ").map(n=>n[0]).join("").slice(0,2);
            return (
              <div key={s.roll} className="stu-row">
                <span className="stu-row-num">{i+1}</span>
                <div className="stu-row-name-cell">
                  <div className="stu-row-avatar" style={{background:c.bg,borderColor:c.border,color:c.color}}>{initials}</div>
                  <div><div className="stu-row-name">{s.name}</div><div className="stu-row-roll">{s.roll}</div></div>
                </div>
                <span className="stu-course-chip" style={{color:c.color,background:c.bg,borderColor:c.border}}>{c.code}</span>
                <span className="stu-batch-chip">B-{s.batch}</span>
                <span style={{fontWeight:700,color:s.cgpa>=8?"var(--teal)":s.cgpa>=7?"var(--amber)":"var(--rose)",fontSize:13}}>{s.cgpa}</span>
                <div className="stu-row-att-col">
                  <span style={{fontSize:11,fontWeight:600,color:s.attendance>=75?"var(--teal)":"var(--rose)"}}>{s.attendance}%</span>
                  <ProgressBar pct={s.attendance} color={`rgba(${c.rgb},1)`} height={3}/>
                </div>
                <span style={{fontWeight:700,color:s.score>=70?"var(--teal)":s.score>=50?"var(--amber)":"var(--rose)",fontSize:13}}>{s.score}%</span>
                <span className="stu-status-badge" style={{color:sm.color,background:sm.bg,borderColor:sm.border}}>{sm.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="stu-empty">
          <div style={{fontSize:36,marginBottom:10,opacity:.2}}>👨‍🎓</div>
          <div style={{fontSize:14,fontWeight:700}}>No students found</div>
        </div>
      )}
    </div>
  );
}