// facultyQuetionBank.jsx  —  place at: src/pages/Faculty/facultyQuetionBank/facultyQuetionBank.jsx
import { useState } from "react";
import "./facultyQuestionBank.css";

const IcoChevL  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoPlus   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoSearch = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoClose  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoCopy   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IcoTrash  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoPen    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoZap    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoCheck  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;

const DIFF_META = {
  Easy:   { color:"var(--teal)",  bg:"rgba(39,201,176,.1)",  border:"rgba(39,201,176,.22)" },
  Medium: { color:"var(--amber)", bg:"rgba(244,165,53,.1)",  border:"rgba(244,165,53,.2)"  },
  Hard:   { color:"var(--rose)",  bg:"rgba(242,68,92,.1)",   border:"rgba(242,68,92,.2)"   },
};
const TYPE_META = {
  MCQ:  { color:"var(--indigo-l)", bg:"rgba(91,78,248,.1)", icon:"🔵" },
  TF:   { color:"var(--teal)",     bg:"rgba(39,201,176,.1)",icon:"✅" },
  FIB:  { color:"var(--amber)",    bg:"rgba(244,165,53,.1)",icon:"✏️" },
  Desc: { color:"var(--violet)",   bg:"rgba(159,122,234,.1)",icon:"📝" },
};
const COURSES_META = {
  cs501:{ code:"CS501", name:"Operating Systems",           color:"var(--indigo-l)",  bg:"rgba(91,78,248,.1)",   border:"rgba(91,78,248,.2)"   },
  cs502:{ code:"CS502", name:"Database Management Systems", color:"var(--teal)",      bg:"rgba(39,201,176,.1)",  border:"rgba(39,201,176,.2)"  },
  cs503:{ code:"CS503", name:"Computer Architecture",       color:"var(--violet)",    bg:"rgba(159,122,234,.1)", border:"rgba(159,122,234,.2)" },
};

const QUESTIONS = [
  { id:1,  course:"cs501", unit:"Unit II", type:"MCQ",  diff:"Easy",   marks:1, q:"Which scheduling algorithm is non-preemptive by default?", options:["FCFS","Round Robin","SRTF","Multi-level"], ans:0, used:12 },
  { id:2,  course:"cs501", unit:"Unit II", type:"MCQ",  diff:"Medium", marks:2, q:"Round Robin with very small time quantum resembles which algorithm?", options:["FCFS","SJF","SRTF","Priority"], ans:2, used:7  },
  { id:3,  course:"cs501", unit:"Unit III",type:"TF",   diff:"Easy",   marks:1, q:"Virtual memory allows execution of processes larger than physical memory.", ans:true, used:18 },
  { id:4,  course:"cs501", unit:"Unit III",type:"FIB",  diff:"Medium", marks:2, q:"The technique of loading only needed pages into memory is called ___.", ans:"demand paging", used:5 },
  { id:5,  course:"cs501", unit:"Unit IV", type:"Desc", diff:"Hard",   marks:5, q:"Explain the Banker's algorithm for deadlock avoidance with an example.", ans:"", used:3  },
  { id:6,  course:"cs501", unit:"Unit I",  type:"MCQ",  diff:"Easy",   marks:1, q:"Which of the following is NOT a type of OS kernel?", options:["Monolithic","Micro","Nano","Hybrid"], ans:2, used:9  },
  { id:7,  course:"cs502", unit:"Unit I",  type:"MCQ",  diff:"Medium", marks:2, q:"Which normal form eliminates transitive dependencies?", options:["1NF","2NF","3NF","BCNF"], ans:2, used:14 },
  { id:8,  course:"cs502", unit:"Unit II", type:"FIB",  diff:"Easy",   marks:1, q:"To filter aggregated groups in SQL, use the ___ clause.", ans:"HAVING", used:22 },
  { id:9,  course:"cs502", unit:"Unit III",type:"TF",   diff:"Medium", marks:1, q:"A transaction must follow ACID properties to maintain database consistency.", ans:true, used:16 },
  { id:10, course:"cs502", unit:"Unit II", type:"Desc", diff:"Hard",   marks:6, q:"Compare INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with diagrams.", ans:"", used:4  },
  { id:11, course:"cs503", unit:"Unit I",  type:"MCQ",  diff:"Easy",   marks:1, q:"RISC architecture uses a __ instruction set.", options:["Reduced","Rich","Redundant","Rapid"], ans:0, used:11 },
  { id:12, course:"cs503", unit:"Unit II", type:"MCQ",  diff:"Hard",   marks:3, q:"In a 5-stage MIPS pipeline, a data hazard requiring 2 stall cycles occurs when?", options:["RAW with no forwarding","WAR","WAW","Control hazard"], ans:0, used:6 },
  { id:13, course:"cs503", unit:"II",      type:"TF",   diff:"Easy",   marks:1, q:"Forwarding paths in a pipeline help resolve data hazards without stalls.", ans:true, used:10 },
];

export default function facultyQuestionBank({ onBack }) {
  const [search, setSearch]         = useState("");
  const [courseF, setCourseF]       = useState("all");
  const [diffF,   setDiffF]         = useState("all");
  const [typeF,   setTypeF]         = useState("all");
  const [selected, setSelected]     = useState([]);
  const [toast, setToast]           = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  const filtered = QUESTIONS.filter(q => {
    if (courseF !== "all" && q.course !== courseF) return false;
    if (diffF   !== "all" && q.diff   !== diffF)   return false;
    if (typeF   !== "all" && q.type   !== typeF)    return false;
    if (search && !q.q.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const toggleAll = () => setSelected(s => s.length === filtered.length ? [] : filtered.map(q=>q.id));

  const totals = Object.fromEntries(
    Object.keys(DIFF_META).map(d => [d, QUESTIONS.filter(q=>q.diff===d).length])
  );

  return (
    <div className="qb-root">
      <div className="qb-page-hd">
        <div>
          <button className="qb-back-btn" onClick={onBack}><IcoChevL style={{width:13,height:13}}/> Dashboard</button>
          <div className="greet-title" style={{marginBottom:2}}>Question Bank</div>
          <div className="greet-sub">Manage reusable questions for quizzes and question papers</div>
        </div>
        <div className="qb-hd-right">
          {selected.length > 0 && (
            <button className="btn btn-ghost" style={{display:"flex",alignItems:"center",gap:6,fontSize:12}} onClick={()=>{showToast(`${selected.length} questions added to quiz`);setSelected([]);}}>
              <IcoZap style={{width:12,height:12}}/> Use {selected.length} in Quiz
            </button>
          )}
          <button className="btn btn-primary" style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}>
            <IcoPlus style={{width:13,height:13}}/> Add Question
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="qb-stat-strip">
        {[
          { label:"Total Questions",  value:QUESTIONS.length, cls:"sc-indigo" },
          { label:"Easy",             value:totals.Easy,      cls:"sc-teal"   },
          { label:"Medium",           value:totals.Medium,    cls:"sc-amber"  },
          { label:"Hard",             value:totals.Hard,      cls:"sc-rose"   },
          { label:"Selected",         value:selected.length,  cls:"sc-violet" },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-val">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="qb-toolbar">
        <div className="qb-search">
          <IcoSearch style={{width:13,height:13,flexShrink:0,color:"var(--text3)"}}/>
          <input className="qb-search-inp" placeholder="Search questions…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button className="qb-search-clear" onClick={()=>setSearch("")}><IcoClose style={{width:10,height:10}}/></button>}
        </div>
        <div className="qb-toolbar-right">
          <select className="qb-select" value={courseF} onChange={e=>setCourseF(e.target.value)}>
            <option value="all">All Courses</option>
            {Object.entries(COURSES_META).map(([k,c])=><option key={k} value={k}>{c.code}</option>)}
          </select>
          <select className="qb-select" value={diffF} onChange={e=>setDiffF(e.target.value)}>
            <option value="all">All Difficulty</option>
            {Object.keys(DIFF_META).map(d=><option key={d}>{d}</option>)}
          </select>
          <select className="qb-select" value={typeF} onChange={e=>setTypeF(e.target.value)}>
            <option value="all">All Types</option>
            {Object.keys(TYPE_META).map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="qb-list-hd">
        <label className="qb-check-wrap">
          <input type="checkbox" checked={selected.length===filtered.length && filtered.length>0} onChange={toggleAll}/>
          <span className="qb-check-box">{selected.length===filtered.length && filtered.length>0 && <IcoCheck style={{width:9,height:9}}/>}</span>
        </label>
        <span style={{fontSize:11,color:"var(--text3)"}}>{filtered.length} questions</span>
        {selected.length>0 && <span style={{fontSize:11,fontWeight:700,color:"var(--indigo-ll)",marginLeft:8}}>{selected.length} selected</span>}
      </div>

      <div className="qb-list">
        {filtered.map(q => {
          const dm = DIFF_META[q.diff];
          const tm = TYPE_META[q.type];
          const cm = COURSES_META[q.course];
          const isSel = selected.includes(q.id);
          return (
            <div key={q.id} className={`qb-card ${isSel?"qb-card--sel":""}`} onClick={()=>toggle(q.id)}>
              <label className="qb-check-wrap" onClick={e=>e.stopPropagation()}>
                <input type="checkbox" checked={isSel} onChange={()=>toggle(q.id)}/>
                <span className="qb-check-box">{isSel && <IcoCheck style={{width:9,height:9}}/>}</span>
              </label>
              <div className="qb-card-body">
                <div className="qb-card-top">
                  <div className="qb-card-badges">
                    <span className="qb-course-chip" style={{color:cm.color,background:cm.bg,borderColor:cm.border}}>{cm.code}</span>
                    <span className="qb-unit-chip">{q.unit}</span>
                    <span className="qb-type-badge" style={{color:tm.color,background:tm.bg}}>{tm.icon} {q.type}</span>
                    <span className="qb-diff-badge" style={{color:dm.color,background:dm.bg,borderColor:dm.border}}>{q.diff}</span>
                    <span className="qb-marks-badge">{q.marks} pt{q.marks>1?"s":""}</span>
                  </div>
                  <div className="qb-card-acts" onClick={e=>e.stopPropagation()}>
                    <button className="qb-act-btn" title="Edit"><IcoPen style={{width:11,height:11}}/></button>
                    <button className="qb-act-btn" title="Duplicate"><IcoCopy style={{width:11,height:11}}/></button>
                    <button className="qb-act-btn qb-act-del" title="Delete"><IcoTrash style={{width:11,height:11}}/></button>
                  </div>
                </div>
                <div className="qb-question-text">{q.q}</div>
                {q.options && (
                  <div className="qb-options">
                    {q.options.map((opt,i)=>(
                      <span key={i} className={`qb-opt ${i===q.ans?"qb-opt--correct":""}`}>
                        {String.fromCharCode(65+i)}. {opt}
                        {i===q.ans && <IcoCheck style={{width:8,height:8,marginLeft:3}}/>}
                      </span>
                    ))}
                  </div>
                )}
                {typeof q.ans === "boolean" && (
                  <div className="qb-answer">Answer: <strong style={{color:"var(--teal)"}}>{q.ans?"True":"False"}</strong></div>
                )}
                {typeof q.ans === "string" && q.type === "FIB" && (
                  <div className="qb-answer">Answer: <strong style={{color:"var(--teal)"}}>"{q.ans}"</strong></div>
                )}
                <div className="qb-card-footer">
                  <span className="qb-used">Used {q.used}×</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="qb-empty">
          <div style={{fontSize:36,marginBottom:10,opacity:.2}}>🗂️</div>
          <div style={{fontSize:14,fontWeight:700}}>No questions found</div>
        </div>
      )}

      {toast && <div className="qb-toast">{toast}</div>}
    </div>
  );
}