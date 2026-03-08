// facultyGradeBook.jsx  —  place at: src/pages/Faculty/facultyGradeBook/facultyGradeBook.jsx
import { useState } from "react";
import "./facultyGradeBook.css";

const IcoChevL  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoSearch = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoClose  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoPen    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoDownload=(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoBar    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoCheck  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;

const COURSES_META = {
  cs501: { code:"CS501", name:"Operating Systems",           color:"var(--indigo-l)",  rgb:"91,78,248",   bg:"rgba(91,78,248,.1)",   border:"rgba(91,78,248,.22)" },
  cs502: { code:"CS502", name:"Database Management Systems", color:"var(--teal)",      rgb:"39,201,176",  bg:"rgba(39,201,176,.1)",  border:"rgba(39,201,176,.22)"},
  cs503: { code:"CS503", name:"Computer Architecture",       color:"var(--violet)",    rgb:"159,122,234", bg:"rgba(159,122,234,.1)", border:"rgba(159,122,234,.22)"},
};

const GRADE_DATA = {
  cs501: [
    { roll:"21CS001",name:"Aarav Shah",    a1:17, a2:14, q1:12, q2:10, mid:34, end:null  },
    { roll:"21CS008",name:"Dev Iyer",      a1:10, a2:8,  q1:7,  q2:5,  mid:24, end:null  },
    { roll:"21CS015",name:"Aisha Khan",    a1:18, a2:16, q1:14, q2:13, mid:38, end:null  },
    { roll:"21CS031",name:"Priya Nair",    a1:19, a2:17, q1:15, q2:14, mid:40, end:null  },
    { roll:"21CS033",name:"Kiran Rao",     a1:9,  a2:7,  q1:5,  q2:4,  mid:20, end:null  },
    { roll:"21CS047",name:"Arjun Reddy",   a1:20, a2:19, q1:15, q2:15, mid:44, end:null  },
    { roll:"21CS062",name:"Sneha Sharma",  a1:18, a2:16, q1:13, q2:14, mid:41, end:null  },
    { roll:"21CS210",name:"Lakshmi Patel", a1:12, a2:10, q1:8,  q2:7,  mid:26, end:null  },
  ],
  cs502: [
    { roll:"21CS021",name:"Preethi Rajan",  a1:15,a2:13,q1:10,q2:9,  mid:30, end:null },
    { roll:"21CS041",name:"Zara Sheikh",    a1:11,a2:9, q1:7, q2:6,  mid:25, end:null },
    { roll:"21CS059",name:"Kartik Malhotra",a1:13,a2:11,q1:8, q2:8,  mid:28, end:null },
    { roll:"21CS073",name:"Ananya Das",     a1:16,a2:14,q1:12,q2:11, mid:33, end:null },
    { roll:"21CS088",name:"Siddharth Jain", a1:17,a2:15,q1:13,q2:12, mid:36, end:null },
    { roll:"21CS101",name:"Meera Pillai",   a1:18,a2:17,q1:14,q2:13, mid:39, end:null },
  ],
  cs503: [
    { roll:"21CS019",name:"Rohan Mehta",   a1:16,a2:15,q1:12,q2:11, mid:34, end:null },
    { roll:"21CS148",name:"Ajay Shetty",   a1:8, a2:6, q1:4, q2:4,  mid:18, end:null },
    { roll:"21CS160",name:"Tanvi Menon",   a1:14,a2:13,q1:10,q2:9,  mid:30, end:null },
    { roll:"21CS172",name:"Ravi Kumar",    a1:15,a2:14,q1:11,q2:10, mid:32, end:null },
    { roll:"21CS185",name:"Deepika Nair",  a1:17,a2:16,q1:13,q2:12, mid:36, end:null },
    { roll:"21CS201",name:"Vikram Singh",  a1:19,a2:18,q1:15,q2:14, mid:43, end:null },
  ],
};

const MAX = { a1:20, a2:20, q1:15, q2:15, mid:50, end:100 };
const COLS = [
  { key:"a1",  label:"Assign 1", max:20 },
  { key:"a2",  label:"Assign 2", max:20 },
  { key:"q1",  label:"Quiz 1",   max:15 },
  { key:"q2",  label:"Quiz 2",   max:15 },
  { key:"mid", label:"Mid-term", max:50 },
  { key:"end", label:"End-term", max:100 },
];

function calcTotal(r) {
  const internal = (r.a1||0)+(r.a2||0)+(r.q1||0)+(r.q2||0);
  const internalMax = 70;
  const mid = r.mid||0;
  const raw = internal + mid;
  const pct = Math.round((raw / (internalMax + MAX.mid)) * 100);
  return { raw, pct };
}

function getGrade(pct) {
  if (pct >= 90) return { grade:"O",  color:"var(--teal)"   };
  if (pct >= 80) return { grade:"A+", color:"var(--teal)"   };
  if (pct >= 70) return { grade:"A",  color:"var(--indigo-ll)"};
  if (pct >= 60) return { grade:"B+", color:"var(--violet)" };
  if (pct >= 50) return { grade:"B",  color:"var(--amber)"  };
  return                 { grade:"F",  color:"var(--rose)"   };
}

export default function facultyGradeBook({ onBack }) {
  const [selectedCourse, setCourse] = useState("cs501");
  const [search, setSearch]         = useState("");
  const [editing, setEditing]       = useState(null); // {roll, key}
  const [editVal, setEditVal]       = useState("");
  const [overrides, setOverrides]   = useState({});
  const [saved, setSaved]           = useState(false);

  const c = COURSES_META[selectedCourse];
  const baseData = GRADE_DATA[selectedCourse] || [];

  const students = baseData
    .map(s => {
      const row = {...s};
      Object.keys(row).forEach(k => {
        const ov = overrides[`${s.roll}_${k}`];
        if (ov !== undefined) row[k] = ov;
      });
      return row;
    })
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase()));

  const allPcts = students.map(s => calcTotal(s).pct);
  const avgPct  = allPcts.length ? Math.round(allPcts.reduce((a,b)=>a+b,0)/allPcts.length) : 0;
  const passing = students.filter(s => calcTotal(s).pct >= 50).length;
  const toGrade = students.filter(s => s.end === null).length;

  const startEdit = (roll, key, val) => { setEditing({roll,key}); setEditVal(String(val??"")); };
  const commitEdit = () => {
    if (!editing) return;
    const num = parseFloat(editVal);
    const maxVal = MAX[editing.key] || 100;
    if (!isNaN(num) && num >= 0 && num <= maxVal) {
      setOverrides(p => ({...p, [`${editing.roll}_${editing.key}`]: num}));
    }
    setEditing(null);
  };

  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div className="gb-root">
      <div className="gb-page-hd">
        <div>
          <button className="gb-back-btn" onClick={onBack}><IcoChevL style={{width:13,height:13}}/> Dashboard</button>
          <div className="greet-title" style={{marginBottom:2}}>Grade Book</div>
          <div className="greet-sub">View and manage student grades across all assessments</div>
        </div>
        <div className="gb-hd-right">
          <button className="btn btn-ghost" style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}>
            <IcoDownload style={{width:13,height:13}}/> Export Grades
          </button>
          <button className={`btn ${saved?"btn-ghost":"btn-primary"}`} style={{display:"flex",alignItems:"center",gap:6,fontSize:12}} onClick={handleSave}>
            {saved ? <IcoCheck style={{width:12,height:12}}/> : <IcoBar style={{width:12,height:12}}/>}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="gb-stat-strip">
        {[
          { label:"Total Students", value: students.length,     cls:"sc-indigo" },
          { label:"Avg Score",      value: `${avgPct}%`,        cls: avgPct>=70?"sc-teal":"sc-amber" },
          { label:"Passing (≥50%)", value: passing,             cls:"sc-teal"  },
          { label:"End-term Pending",value: toGrade,            cls:"sc-rose"  },
          { label:"Failing",        value: students.length - passing, cls:"sc-violet"},
        ].map(({ label, value, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-val">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Course Tabs */}
      <div className="gb-course-tabs">
        {Object.entries(COURSES_META).map(([k,cm]) => (
          <button key={k}
            className={`gb-ctab ${selectedCourse===k?"gb-ctab--active":""}`}
            style={selectedCourse===k?{borderColor:cm.border,color:cm.color,background:cm.bg}:{}}
            onClick={()=>setCourse(k)}>
            <span className="gb-ctab-dot" style={{background:cm.color}}/>
            {cm.code}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="gb-toolbar">
        <div className="gb-search">
          <IcoSearch style={{width:13,height:13,flexShrink:0,color:"var(--text3)"}}/>
          <input className="gb-search-inp" placeholder="Search by name or roll…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button className="gb-search-clear" onClick={()=>setSearch("")}><IcoClose style={{width:10,height:10}}/></button>}
        </div>
        <div style={{fontSize:11,color:"var(--text3)",marginLeft:8}}>
          <IcoPen style={{width:10,height:10,marginRight:4}}/>Click any cell to edit
        </div>
      </div>

      {/* Grade Table */}
      <div className="gb-table-wrap panel">
        <div className="gb-table-head">
          <span>#</span>
          <span>Student</span>
          {COLS.map(col => <span key={col.key}>{col.label}<br/><span className="gb-max-lbl">/{col.max}</span></span>)}
          <span>Total</span>
          <span>Grade</span>
        </div>
        {students.map((s, i) => {
          const { pct } = calcTotal(s);
          const { grade, color } = getGrade(pct);
          const initials = s.name.split(" ").map(n=>n[0]).join("").slice(0,2);
          return (
            <div key={s.roll} className="gb-table-row">
              <span className="gb-row-num">{i+1}</span>
              <div className="gb-row-student">
                <div className="gb-row-avatar" style={{background:c.bg,borderColor:c.border,color:c.color}}>{initials}</div>
                <div><div className="gb-row-name">{s.name}</div><div className="gb-row-roll">{s.roll}</div></div>
              </div>
              {COLS.map(col => {
                const isEditing = editing && editing.roll === s.roll && editing.key === col.key;
                const val = s[col.key];
                return (
                  <div key={col.key} className={`gb-cell ${val === null ? "gb-cell--empty" : ""}`}
                    onClick={()=>!isEditing && startEdit(s.roll, col.key, val)}>
                    {isEditing ? (
                      <input
                        className="gb-cell-input"
                        value={editVal}
                        autoFocus
                        onChange={e=>setEditVal(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e=>{ if(e.key==="Enter") commitEdit(); if(e.key==="Escape") setEditing(null); }}
                        onClick={e=>e.stopPropagation()}
                      />
                    ) : val === null ? (
                      <span className="gb-pending">—</span>
                    ) : (
                      <span className="gb-cell-val" style={{color: val/col.max >= 0.7 ? "var(--teal)" : val/col.max >= 0.5 ? "var(--text2)" : "var(--rose)"}}>
                        {val}
                      </span>
                    )}
                  </div>
                );
              })}
              <div className="gb-total-cell">
                <span style={{fontFamily:"'Fraunces',serif",fontSize:16,color:pct>=70?"var(--teal)":pct>=50?"var(--amber)":"var(--rose)"}}>{pct}%</span>
              </div>
              <div className="gb-grade-cell">
                <span className="gb-grade-badge" style={{color}}>{grade}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grade distribution */}
      <div className="gb-dist-row">
        {[["O/A+","≥80%","var(--teal)"],["A/B+","60–79%","var(--indigo-ll)"],["B","50–59%","var(--amber)"],["F","<50%","var(--rose)"]].map(([g,range,col])=>{
          const count = students.filter(s=>{ const p=calcTotal(s).pct; return g==="O/A+"?p>=80:g==="A/B+"?p>=60&&p<80:g==="B"?p>=50&&p<60:p<50; }).length;
          return (
            <div key={g} className="gb-dist-card">
              <div className="gb-dist-grade" style={{color:col}}>{g}</div>
              <div className="gb-dist-count" style={{color:col}}>{count}</div>
              <div className="gb-dist-range">{range}</div>
              <div className="gb-dist-bar">
                <div style={{height:"100%",width:`${students.length?count/students.length*100:0}%`,background:col,borderRadius:4,transition:"width .6s"}}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}