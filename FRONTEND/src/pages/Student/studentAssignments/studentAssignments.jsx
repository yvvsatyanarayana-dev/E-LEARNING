// studentAssignments.jsx
// Assignments module — rendered inside StudentDashboard
// Inherits CSS variables from StudentDashboard.css + StudentMyCourses.css

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, FileText, Clock, CheckCircle2,
  AlertTriangle, Upload, Download, Eye, Star, X, Search,
  Filter, List, LayoutGrid, Bot, Paperclip, Send, Calendar,
  BookOpen, TrendingUp, Award, BarChart2, ChevronDown,
  Circle, XCircle, RefreshCw, MessageSquare, Zap, Flag,
  Lock, Edit3, MoreHorizontal, ArrowUpRight, Layers
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────
const COURSES = [
  { id:"os",    code:"CS501", name:"Operating Systems",               short:"OS",     faculty:"Dr. R. Sharma",  color:"var(--indigo-l)", rgb:"91,78,248"   },
  { id:"dbms",  code:"CS502", name:"Database Management Systems",     short:"DBMS",   faculty:"Prof. A. Verma", color:"var(--teal)",     rgb:"20,184,166"  },
  { id:"ml",    code:"CS503", name:"Machine Learning",                short:"ML",     faculty:"Dr. P. Nair",    color:"var(--amber)",    rgb:"245,158,11"  },
  { id:"cn",    code:"CS504", name:"Computer Networks",               short:"CN",     faculty:"Prof. K. Rao",   color:"var(--violet)",   rgb:"139,92,246"  },
  { id:"crypto",code:"CS505", name:"Cryptography & Network Security", short:"Crypto", faculty:"Dr. S. Mehta",   color:"var(--rose)",     rgb:"244,63,94"   },
];

const STATUS = { PENDING:"pending", SUBMITTED:"submitted", GRADED:"graded", LATE:"late", MISSING:"missing", RESUBMIT:"resubmit" };
const TYPE   = { THEORY:"Theory", CODING:"Coding", LAB:"Lab Report", PROJECT:"Project", CASE:"Case Study", MCQ:"MCQ" };

const ASSIGNMENTS = [
  // ── OS ──
  {
    id:"a1",  courseId:"os",    title:"Process Scheduling Simulation",
    type:TYPE.CODING,  dueDate:"2026-03-05", dueTime:"11:59 PM",
    status:STATUS.PENDING,  marks:null,  maxMarks:50,  weight:"15%",
    desc:"Implement FCFS, SJF, Round Robin and Priority scheduling algorithms in C/Python. Compare turnaround times using Gantt chart visualisations.",
    tags:["C","Scheduling","OS"],  attachments:["problem_statement.pdf","starter_code.zip"],
    submissions:0,  classAvg:null,  difficulty:"Medium",  estimatedHours:6,
    instructions:["Use the provided starter code skeleton","Submit .zip with source + report PDF","Gantt charts are mandatory","Comment every function"],
    rubric:[{item:"Correct Implementation",pts:20},{item:"Gantt Charts",pts:10},{item:"Comparison Report",pts:10},{item:"Code Quality",pts:10}],
    urgent: true,
  },
  {
    id:"a2",  courseId:"os",    title:"Memory Management — Paging Report",
    type:TYPE.THEORY,  dueDate:"2026-03-10", dueTime:"11:59 PM",
    status:STATUS.SUBMITTED, marks:null,  maxMarks:30,  weight:"10%",
    desc:"Write a detailed report on virtual memory, paging mechanisms, TLB functioning, and page replacement algorithms with worked examples.",
    tags:["Virtual Memory","Paging","TLB"],  attachments:["report_template.docx"],
    submissions:1,  classAvg:null,  difficulty:"Easy",  estimatedHours:3,
    submittedFile:"memory_report_arjun.pdf", submittedAt:"Mar 8, 2026 · 10:24 PM",
    instructions:["Min 8 pages with diagrams","Include worked examples for LRU & FIFO","Harvard referencing format"],
    rubric:[{item:"Content Depth",pts:15},{item:"Diagrams",pts:8},{item:"References",pts:7}],
  },
  {
    id:"a3",  courseId:"os",    title:"Deadlock Detection Lab",
    type:TYPE.LAB,  dueDate:"2026-02-20", dueTime:"11:59 PM",
    status:STATUS.GRADED,  marks:44,  maxMarks:50,  weight:"15%",
    desc:"Implement the Banker's algorithm and resource allocation graph to detect and avoid deadlocks.",
    tags:["Deadlock","Banker's Algorithm"],  attachments:["lab_sheet.pdf"],
    submissions:1,  classAvg:38,  difficulty:"Hard",  estimatedHours:8,
    feedback:"Excellent implementation! Minor issue with the circular wait detection. Well-commented code.",
    grade:"A",  submittedFile:"deadlock_lab_arjun.zip", submittedAt:"Feb 19, 2026 · 9:00 PM",
    instructions:["Implement RAG detection","Test with provided input cases","Include screenshots"],
    rubric:[{item:"Algorithm",pts:25},{item:"Testing",pts:15},{item:"Documentation",pts:10}],
  },
  // ── DBMS ──
  {
    id:"a4",  courseId:"dbms",  title:"ER Diagram & Schema Design",
    type:TYPE.THEORY,  dueDate:"2026-03-12", dueTime:"11:59 PM",
    status:STATUS.PENDING,  marks:null,  maxMarks:40,  weight:"12%",
    desc:"Design an ER diagram for a college management system covering students, faculty, courses, enrollments, and examination modules. Convert to relational schema.",
    tags:["ER Diagram","Schema","DBMS"],  attachments:["requirements.pdf"],
    submissions:0,  classAvg:null,  difficulty:"Medium",  estimatedHours:5,
    instructions:["Use crow's foot notation","Include all entity attributes","Show all relationship cardinalities","Convert to 3NF"],
    rubric:[{item:"ER Diagram",pts:20},{item:"Schema Conversion",pts:12},{item:"Normalization",pts:8}],
  },
  {
    id:"a5",  courseId:"dbms",  title:"SQL Advanced Queries",
    type:TYPE.CODING,  dueDate:"2026-03-07", dueTime:"11:59 PM",
    status:STATUS.PENDING,  marks:null,  maxMarks:50,  weight:"15%",
    desc:"Solve 20 advanced SQL problems covering joins, subqueries, window functions, CTEs, and stored procedures on the provided university database.",
    tags:["SQL","Joins","Window Functions"],  attachments:["university_db.sql","questions.pdf"],
    submissions:0,  classAvg:null,  difficulty:"Hard",  estimatedHours:7,
    urgent: true,
    instructions:["Use provided DB schema only","No ORM — raw SQL only","Output screenshots for each query","Explain query logic in comments"],
    rubric:[{item:"Correct Queries (20×2)",pts:40},{item:"Optimisation",pts:10}],
  },
  {
    id:"a6",  courseId:"dbms",  title:"Normalisation Case Study",
    type:TYPE.CASE,  dueDate:"2026-02-14", dueTime:"11:59 PM",
    status:STATUS.GRADED,  marks:31,  maxMarks:40,  weight:"12%",
    desc:"Analyse the given denormalized hospital database. Apply 1NF, 2NF, 3NF and BCNF transformations with justification at each step.",
    tags:["Normalization","BCNF","FD"],  attachments:["hospital_schema.pdf"],
    submissions:1,  classAvg:28,  difficulty:"Medium",  estimatedHours:4,
    feedback:"Good understanding of 3NF. BCNF decomposition needs more explanation around the lossless join property.",
    grade:"B+",  submittedFile:"normalisation_casestudy.pdf", submittedAt:"Feb 13, 2026 · 6:45 PM",
    instructions:["Show FD for each step","Prove lossless decomposition","Use table format"],
    rubric:[{item:"FD Analysis",pts:15},{item:"Normalization Steps",pts:15},{item:"Presentation",pts:10}],
  },
  // ── ML ──
  {
    id:"a7",  courseId:"ml",    title:"Linear Regression from Scratch",
    type:TYPE.CODING,  dueDate:"2026-03-14", dueTime:"11:59 PM",
    status:STATUS.PENDING,  marks:null,  maxMarks:60,  weight:"20%",
    desc:"Implement linear and polynomial regression without sklearn. Use gradient descent, plot cost curves, and evaluate on the provided housing dataset.",
    tags:["Python","Regression","NumPy"],  attachments:["housing_dataset.csv","rubric.pdf"],
    submissions:0,  classAvg:null,  difficulty:"Hard",  estimatedHours:10,
    instructions:["No sklearn for core algorithm","Use NumPy only","Include cost curve plots","Compare with sklearn baseline"],
    rubric:[{item:"Implementation",pts:30},{item:"Plots & Analysis",pts:15},{item:"Report",pts:15}],
  },
  {
    id:"a8",  courseId:"ml",    title:"ML Mid-Semester Project Proposal",
    type:TYPE.PROJECT,  dueDate:"2026-02-28", dueTime:"11:59 PM",
    status:STATUS.RESUBMIT,  marks:null,  maxMarks:20,  weight:"5%",
    desc:"Submit a 2-page project proposal for your ML semester project. Include problem statement, dataset, proposed model, evaluation metrics, and timeline.",
    tags:["Proposal","Project","ML"],  attachments:["proposal_format.pdf"],
    submissions:1,  classAvg:null,  difficulty:"Easy",  estimatedHours:3,
    feedback:"Problem statement is weak. Specify the dataset source and justify model choice. Resubmit by Mar 5.",
    submittedFile:"ml_proposal_v1.pdf", submittedAt:"Feb 27, 2026 · 11:50 PM",
    instructions:["Strictly 2 pages","Include dataset link","Timeline must be Gantt chart"],
    rubric:[{item:"Problem Statement",pts:8},{item:"Methodology",pts:7},{item:"Timeline",pts:5}],
    resubmitDeadline:"2026-03-05",
  },
  // ── CN ──
  {
    id:"a9",  courseId:"cn",    title:"Subnet Design & IP Addressing",
    type:TYPE.THEORY,  dueDate:"2026-03-08", dueTime:"11:59 PM",
    status:STATUS.SUBMITTED,  marks:null,  maxMarks:35,  weight:"10%",
    desc:"Design subnets for a given organisation with 5 departments. Assign IP ranges, subnet masks, broadcast addresses, and CIDR notation for each subnet.",
    tags:["IPv4","Subnetting","CIDR"],  attachments:["org_requirements.pdf"],
    submissions:1,  classAvg:null,  difficulty:"Medium",  estimatedHours:4,
    submittedFile:"subnet_design_arjun.pdf", submittedAt:"Mar 7, 2026 · 8:30 AM",
    instructions:["Show all workings","Use table format","Include network diagram"],
    rubric:[{item:"Subnet Calculation",pts:20},{item:"Diagram",pts:10},{item:"CIDR Notation",pts:5}],
  },
  {
    id:"a10", courseId:"cn",    title:"Socket Programming — Chat App",
    type:TYPE.CODING,  dueDate:"2026-02-25", dueTime:"11:59 PM",
    status:STATUS.GRADED,  marks:47,  maxMarks:50,  weight:"15%",
    desc:"Build a multi-client TCP chat application using Python sockets. Server handles concurrent clients with threading. Implement private messaging and broadcast.",
    tags:["Python","TCP","Sockets"],  attachments:["spec.pdf"],
    submissions:1,  classAvg:41,  difficulty:"Hard",  estimatedHours:9,
    feedback:"Outstanding work! Clean code and well-handled edge cases. Minor: add timeout for idle clients.",
    grade:"A+",  submittedFile:"chat_app_arjun.zip", submittedAt:"Feb 24, 2026 · 4:15 PM",
    instructions:["Server must handle 10+ clients","Implement /broadcast and /pm commands","Include README"],
    rubric:[{item:"TCP Implementation",pts:25},{item:"Threading",pts:15},{item:"Code Quality",pts:10}],
  },
  {
    id:"a11", courseId:"cn",    title:"Wireshark Packet Analysis Report",
    type:TYPE.LAB,  dueDate:"2026-03-02", dueTime:"11:59 PM",
    status:STATUS.LATE,  marks:null,  maxMarks:30,  weight:"8%",
    desc:"Capture and analyse HTTP, DNS, TCP and ARP packets using Wireshark. Document the capture process, filter usage, and packet-level explanations.",
    tags:["Wireshark","Packet Analysis","DNS"],  attachments:["lab_instructions.pdf"],
    submissions:0,  classAvg:null,  difficulty:"Easy",  estimatedHours:4,
    lateNote:"Deadline passed. Late submissions accepted with 20% penalty until Mar 10.",
    instructions:["Capture at least 50 packets per protocol","Annotate screenshots","Show filter syntax used"],
    rubric:[{item:"Captures",pts:15},{item:"Analysis",pts:10},{item:"Report",pts:5}],
  },
  // ── Crypto ──
  {
    id:"a12", courseId:"crypto",title:"Classical Cipher Implementation",
    type:TYPE.CODING,  dueDate:"2026-03-15", dueTime:"11:59 PM",
    status:STATUS.PENDING,  marks:null,  maxMarks:40,  weight:"12%",
    desc:"Implement Caesar, Vigenère, Rail-Fence, and Playfair ciphers in any language. Include both encrypt and decrypt functions. Perform frequency analysis attack.",
    tags:["Python","Cipher","Cryptanalysis"],  attachments:["cipher_specs.pdf"],
    submissions:0,  classAvg:null,  difficulty:"Medium",  estimatedHours:6,
    instructions:["All 4 ciphers required","Include frequency analysis for Caesar crack","Unit tests mandatory"],
    rubric:[{item:"Implementations",pts:24},{item:"Attack",pts:10},{item:"Tests",pts:6}],
  },
];

const FILTER_TABS  = ["All","Pending","Submitted","Graded","Late/Missing"];
const SORT_OPTIONS = ["Due Date","Course","Marks","Status"];
const TYPE_FILTERS = ["All Types","Theory","Coding","Lab Report","Project","Case Study"];

// ─── STATUS CONFIG ─────────────────────────────────────────────────
const STATUS_CFG = {
  [STATUS.PENDING]:   { label:"Pending",   color:"var(--amber)",    rgb:"245,158,11",  bg:"rgba(245,158,11,.1)",  Icon:Clock         },
  [STATUS.SUBMITTED]: { label:"Submitted", color:"var(--indigo-ll)",rgb:"91,78,248",   bg:"rgba(91,78,248,.1)",   Icon:CheckCircle2  },
  [STATUS.GRADED]:    { label:"Graded",    color:"var(--teal)",     rgb:"20,184,166",  bg:"rgba(20,184,166,.1)",  Icon:Star          },
  [STATUS.LATE]:      { label:"Late",      color:"var(--rose)",     rgb:"244,63,94",   bg:"rgba(244,63,94,.1)",   Icon:AlertTriangle },
  [STATUS.MISSING]:   { label:"Missing",   color:"var(--rose)",     rgb:"244,63,94",   bg:"rgba(244,63,94,.1)",   Icon:XCircle       },
  [STATUS.RESUBMIT]:  { label:"Resubmit",  color:"var(--amber)",    rgb:"245,158,11",  bg:"rgba(245,158,11,.1)",  Icon:RefreshCw     },
};

const TYPE_CFG = {
  [TYPE.THEORY]:  { color:"var(--teal)",     bg:"rgba(20,184,166,.1)"  },
  [TYPE.CODING]:  { color:"var(--indigo-ll)",bg:"rgba(91,78,248,.1)"   },
  [TYPE.LAB]:     { color:"var(--violet)",   bg:"rgba(139,92,246,.1)"  },
  [TYPE.PROJECT]: { color:"var(--amber)",    bg:"rgba(245,158,11,.1)"  },
  [TYPE.CASE]:    { color:"var(--rose)",     bg:"rgba(244,63,94,.1)"   },
  [TYPE.MCQ]:     { color:"var(--teal)",     bg:"rgba(20,184,166,.1)"  },
};

// ─── HELPERS ──────────────────────────────────────────────────────
function daysUntil(dateStr) {
  const now  = new Date(); now.setHours(0,0,0,0);
  const due  = new Date(dateStr);
  return Math.ceil((due - now) / 86400000);
}

function dueBadge(asgmt) {
  if (asgmt.status === STATUS.GRADED) return null;
  if (asgmt.status === STATUS.SUBMITTED) return { label:"Awaiting Grade", color:"var(--indigo-ll)", bg:"rgba(91,78,248,.1)" };
  const d = daysUntil(asgmt.dueDate);
  if (d < 0)  return { label:"Overdue",       color:"var(--rose)",   bg:"rgba(244,63,94,.1)"  };
  if (d === 0) return { label:"Due Today",    color:"var(--rose)",   bg:"rgba(244,63,94,.12)" };
  if (d === 1) return { label:"Due Tomorrow", color:"var(--amber)",  bg:"rgba(245,158,11,.1)" };
  if (d <= 3)  return { label:`${d} days left`,color:"var(--amber)", bg:"rgba(245,158,11,.1)" };
  return { label:`${d} days left`, color:"var(--text3)", bg:"var(--surface3)" };
}

function AnimBar({ pct, color, height=4, delay=300 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t=setTimeout(()=>setW(pct),delay); return ()=>clearTimeout(t); },[pct,delay]);
  return (
    <div style={{height,background:"var(--surface3)",borderRadius:3,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${w}%`,background:color,borderRadius:3,transition:"width 1s cubic-bezier(.16,1,.3,1)"}}/>
    </div>
  );
}

function RadialProgress({ pct, color, size=44, stroke=4 }) {
  const r=size/2-stroke/2, circ=2*Math.PI*r, dash=(pct/100)*circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round"
        style={{transition:"stroke-dasharray 1s cubic-bezier(.16,1,.3,1)"}}/>
    </svg>
  );
}

// ─── STATS STRIP ─────────────────────────────────────────────────
function StatsStrip() {
  const total     = ASSIGNMENTS.length;
  const pending   = ASSIGNMENTS.filter(a=>a.status===STATUS.PENDING).length;
  const submitted = ASSIGNMENTS.filter(a=>a.status===STATUS.SUBMITTED).length;
  const graded    = ASSIGNMENTS.filter(a=>a.status===STATUS.GRADED).length;
  const late      = ASSIGNMENTS.filter(a=>a.status===STATUS.LATE||a.status===STATUS.MISSING).length;
  const resubmit  = ASSIGNMENTS.filter(a=>a.status===STATUS.RESUBMIT).length;

  const gradedAsgmts = ASSIGNMENTS.filter(a=>a.status===STATUS.GRADED&&a.marks!=null);
  const avgScore = gradedAsgmts.length
    ? Math.round(gradedAsgmts.reduce((s,a)=>s+(a.marks/a.maxMarks)*100,0)/gradedAsgmts.length)
    : 0;

  return (
    <div className="san-kpi-grid" style={{marginBottom:20}}>
      {[
        {cls:"sc-indigo",val:total,     lbl:"Total",        sub:"This semester",         Icon:FileText     },
        {cls:"sc-amber", val:pending+resubmit,lbl:"Pending",sub:`${resubmit} need resubmit`,Icon:Clock    },
        {cls:"sc-teal",  val:graded,    lbl:"Graded",       sub:`Avg score ${avgScore}%`,Icon:CheckCircle2 },
        {cls:"sc-rose",  val:late,      lbl:"Late/Missing", sub:"Submit ASAP",           Icon:AlertTriangle},
      ].map(({cls,val,lbl,sub,Icon})=>(
        <div key={lbl} className={`san-kpi-card ${cls}`}>
          <div className="mc-kpi-icon"><Icon size={13} style={{opacity:.55}}/></div>
          <div className="san-kpi-val">{val}</div>
          <div className="san-kpi-lbl">{lbl}</div>
          <span className="mc-kpi-sub">{sub}</span>
        </div>
      ))}
    </div>
  );
}

// ─── COURSE SIDEBAR ───────────────────────────────────────────────
function CourseSidebar({ activeCourseId, onSelect }) {
  return (
    <div className="vl-course-sidebar">
      <div className="vl-cs-title">Courses</div>
      <button className={`vl-cs-item${activeCourseId===null?" active":""}`} onClick={()=>onSelect(null)}>
        <div className="vl-cs-icon" style={{background:"rgba(91,78,248,.12)",border:"1px solid rgba(91,78,248,.2)"}}>
          <Layers size={14} style={{color:"var(--indigo-ll)"}}/>
        </div>
        <div className="vl-cs-info">
          <span className="vl-cs-name">All Courses</span>
          <span className="vl-cs-count">{ASSIGNMENTS.length} assignments</span>
        </div>
      </button>
      {COURSES.map(c=>{
        const asgmts  = ASSIGNMENTS.filter(a=>a.courseId===c.id);
        const pending = asgmts.filter(a=>a.status===STATUS.PENDING||a.status===STATUS.RESUBMIT).length;
        return (
          <button key={c.id}
            className={`vl-cs-item${activeCourseId===c.id?" active":""}`}
            style={{"--cs-color":c.color,"--cs-rgb":c.rgb}}
            onClick={()=>onSelect(c.id)}>
            <div className="vl-cs-icon"
              style={{background:`rgba(${c.rgb},.12)`,border:`1px solid rgba(${c.rgb},.2)`}}>
              <BookOpen size={14} style={{color:c.color}}/>
            </div>
            <div className="vl-cs-info">
              <span className="vl-cs-name">{c.short}</span>
              <span className="vl-cs-count">{asgmts.length} total</span>
            </div>
            {pending>0&&(
              <span className="as-sidebar-badge" style={{background:`rgba(${c.rgb},.15)`,color:c.color}}>{pending}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── ASSIGNMENT CARD (grid) ────────────────────────────────────────
function AssignmentCard({ asgmt, course, onOpen }) {
  const [hov, setHov] = useState(false);
  const sc  = STATUS_CFG[asgmt.status];
  const tc  = TYPE_CFG[asgmt.type] || TYPE_CFG[TYPE.THEORY];
  const db  = dueBadge(asgmt);
  const d   = daysUntil(asgmt.dueDate);
  const ScIcon = sc.Icon;

  return (
    <div className={`as-card${hov?" as-card--hov":""}${asgmt.urgent?" as-card--urgent":""}`}
      style={{"--card-color":course.color,"--card-rgb":course.rgb}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onOpen(asgmt)}>

      {/* glow */}
      <div className="as-card-glow"/>

      {/* top row */}
      <div className="as-card-top">
        <div className="as-card-top-left">
          <span className="as-course-chip" style={{color:course.color,background:`rgba(${course.rgb},.1)`}}>
            {course.short} · {course.code}
          </span>
          <span className="as-type-chip" style={{color:tc.color,background:tc.bg}}>{asgmt.type}</span>
        </div>
        <div className="as-status-chip" style={{color:sc.color,background:sc.bg}}>
          <ScIcon size={10}/>{sc.label}
        </div>
      </div>

      {/* title */}
      <div className="as-card-title">{asgmt.title}</div>
      <div className="as-card-desc">{asgmt.desc}</div>

      {/* tags */}
      <div className="as-card-tags">
        {asgmt.tags.map(t=><span key={t} className="vl-tag">{t}</span>)}
      </div>

      {/* stats row */}
      <div className="as-card-stats">
        <span><Award size={10}/>{asgmt.maxMarks} marks · {asgmt.weight}</span>
        <span><Clock size={10}/>~{asgmt.estimatedHours}h</span>
        <span className={`as-diff as-diff--${asgmt.difficulty.toLowerCase()}`}>{asgmt.difficulty}</span>
      </div>

      {/* grade bar if graded */}
      {asgmt.status === STATUS.GRADED && asgmt.marks != null && (
        <div className="as-grade-row">
          <div className="as-grade-val" style={{color:course.color}}>
            {asgmt.marks}/{asgmt.maxMarks}
          </div>
          <div style={{flex:1}}>
            <AnimBar pct={Math.round((asgmt.marks/asgmt.maxMarks)*100)} color={course.color} height={4} delay={400}/>
            {asgmt.classAvg!=null&&(
              <div style={{fontSize:10,color:"var(--text3)",marginTop:3}}>
                Class avg: {asgmt.classAvg}/{asgmt.maxMarks}
              </div>
            )}
          </div>
          {asgmt.grade&&<span className="as-grade-letter" style={{color:course.color}}>{asgmt.grade}</span>}
        </div>
      )}

      {/* footer */}
      <div className="as-card-footer">
        {db&&(
          <span className="as-due-badge" style={{color:db.color,background:db.bg}}>
            <Calendar size={9}/>{db.label}
          </span>
        )}
        <div className="as-footer-right">
          <span className="as-footer-date">
            {new Date(asgmt.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
          </span>
          <button className="as-card-btn" style={{background:course.color}}>
            {asgmt.status===STATUS.GRADED ? <><Eye size={11}/>View</> :
             asgmt.status===STATUS.SUBMITTED ? <><Eye size={11}/>Track</> :
             asgmt.status===STATUS.LATE ? <><Upload size={11}/>Submit</> :
             asgmt.status===STATUS.RESUBMIT ? <><RefreshCw size={11}/>Resubmit</> :
             <><Upload size={11}/>Submit</>}
          </button>
        </div>
      </div>

      {/* urgent ribbon */}
      {asgmt.urgent&&<div className="as-urgent-ribbon"><Zap size={9} fill="#fff"/>Urgent</div>}
    </div>
  );
}

// ─── ASSIGNMENT ROW (list) ─────────────────────────────────────────
function AssignmentRow({ asgmt, course, onOpen }) {
  const sc  = STATUS_CFG[asgmt.status];
  const tc  = TYPE_CFG[asgmt.type] || TYPE_CFG[TYPE.THEORY];
  const db  = dueBadge(asgmt);
  const ScIcon = sc.Icon;

  return (
    <div className={`as-row${asgmt.urgent?" as-row--urgent":""}`}
      style={{"--card-color":course.color,"--card-rgb":course.rgb}}
      onClick={()=>onOpen(asgmt)}>

      {/* left colour strip */}
      <div className="as-row-strip" style={{background:course.color}}/>

      <div className="as-row-main">
        <div className="as-row-top">
          <span className="as-course-chip" style={{color:course.color,background:`rgba(${course.rgb},.1)`}}>
            {course.short}
          </span>
          <span className="as-type-chip" style={{color:tc.color,background:tc.bg}}>{asgmt.type}</span>
          {asgmt.urgent&&<span className="as-urgent-chip"><Zap size={9} fill="var(--amber)"/>Urgent</span>}
        </div>
        <div className="as-row-title">{asgmt.title}</div>
        <div className="as-row-meta">
          <span><Award size={10}/>{asgmt.maxMarks} marks</span>
          <span className="as-row-dot"/>
          <span><Clock size={10}/>~{asgmt.estimatedHours}h est.</span>
          <span className="as-row-dot"/>
          <span className={`as-diff as-diff--${asgmt.difficulty.toLowerCase()}`}>{asgmt.difficulty}</span>
        </div>
      </div>

      <div className="as-row-right">
        {asgmt.status===STATUS.GRADED&&asgmt.marks!=null ? (
          <div className="as-row-score" style={{color:course.color}}>
            <span className="as-row-score-val">{asgmt.marks}/{asgmt.maxMarks}</span>
            {asgmt.grade&&<span className="as-row-grade">{asgmt.grade}</span>}
          </div>
        ):(
          <div className="as-row-due">
            <span className="as-row-due-date">
              {new Date(asgmt.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
            </span>
            {db&&<span className="as-due-badge" style={{color:db.color,background:db.bg}}>{db.label}</span>}
          </div>
        )}
        <div className="as-status-chip" style={{color:sc.color,background:sc.bg,flexShrink:0}}>
          <ScIcon size={10}/>{sc.label}
        </div>
        <button className="as-row-btn" style={{background:`rgba(${course.rgb},.12)`,color:course.color,borderColor:`rgba(${course.rgb},.2)`}}>
          {asgmt.status===STATUS.GRADED   ? <><Eye size={11}/>View</>       :
           asgmt.status===STATUS.SUBMITTED? <><Eye size={11}/>Track</>      :
           asgmt.status===STATUS.RESUBMIT ? <><RefreshCw size={11}/>Redo</> :
           <><Upload size={11}/>Submit</>}
        </button>
      </div>
    </div>
  );
}

// ─── UPLOAD MODAL ─────────────────────────────────────────────────
function UploadModal({ asgmt, course, onClose }) {
  const [dragging, setDragging] = useState(false);
  const [files,    setFiles]    = useState([]);
  const [note,     setNote]     = useState("");
  const [submitted,setSubmitted]= useState(false);

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = [...e.dataTransfer.files];
    setFiles(prev=>[...prev,...f]);
  };

  if (submitted) return (
    <div className="as-modal-overlay" onClick={onClose}>
      <div className="as-modal" onClick={e=>e.stopPropagation()} style={{textAlign:"center",padding:"50px 40px"}}>
        <div className="as-submit-success">
          <CheckCircle2 size={48} style={{color:"var(--teal)",marginBottom:14}}/>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:22,color:"var(--text1)",marginBottom:6}}>Submitted!</div>
          <div style={{fontSize:12,color:"var(--text3)",marginBottom:20}}>Your assignment is under review.</div>
          <button className="as-modal-btn as-modal-btn--primary" style={{background:course.color}} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="as-modal-overlay" onClick={onClose}>
      <div className="as-modal" onClick={e=>e.stopPropagation()}>
        <div className="as-modal-header" style={{"--card-color":course.color,"--card-rgb":course.rgb}}>
          <div className="as-modal-header-bg"/>
          <div className="as-modal-header-inner">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <span className="as-course-chip" style={{color:course.color,background:`rgba(${course.rgb},.12)`}}>{course.short}</span>
              </div>
              <button className="as-modal-close" onClick={onClose}><X size={15}/></button>
            </div>
            <div className="as-modal-title">{asgmt.title}</div>
            <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"var(--text3)"}}><Award size={11}/> {asgmt.maxMarks} marks · {asgmt.weight}</span>
              <span style={{fontSize:11,color:"var(--text3)"}}><Clock size={11}/> Due {new Date(asgmt.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"long"})}</span>
            </div>
          </div>
        </div>

        <div className="as-modal-body">
          {/* Description */}
          <div className="as-modal-section">
            <div className="as-modal-sec-label">Assignment Brief</div>
            <div className="as-modal-desc">{asgmt.desc}</div>
          </div>

          {/* Instructions */}
          <div className="as-modal-section">
            <div className="as-modal-sec-label">Instructions</div>
            <ul className="as-instr-list">
              {asgmt.instructions.map((ins,i)=>(
                <li key={i}><ChevronRight size={11} style={{color:course.color,flexShrink:0,marginTop:1}}/>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Rubric */}
          <div className="as-modal-section">
            <div className="as-modal-sec-label">Marking Rubric</div>
            <div className="as-rubric-table">
              {asgmt.rubric.map((r,i)=>(
                <div key={i} className="as-rubric-row">
                  <span>{r.item}</span>
                  <span style={{color:course.color,fontWeight:700}}>{r.pts} pts</span>
                </div>
              ))}
              <div className="as-rubric-total">
                <span>Total</span>
                <span style={{color:course.color,fontWeight:700}}>{asgmt.maxMarks} pts</span>
              </div>
            </div>
          </div>

          {/* Resources */}
          {asgmt.attachments?.length>0&&(
            <div className="as-modal-section">
              <div className="as-modal-sec-label">Resources</div>
              <div className="as-attach-list">
                {asgmt.attachments.map(f=>(
                  <button key={f} className="as-attach-item">
                    <FileText size={13}/>{f}<Download size={11} style={{marginLeft:"auto",color:"var(--text3)"}}/>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upload zone */}
          <div className="as-modal-section">
            <div className="as-modal-sec-label">Your Submission</div>
            <div
              className={`as-dropzone${dragging?" as-dropzone--drag":""}`}
              style={dragging?{borderColor:course.color,background:`rgba(${course.rgb},.05)`}:{}}
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={onDrop}
              onClick={()=>document.getElementById("as-file-input").click()}>
              <input id="as-file-input" type="file" multiple hidden
                onChange={e=>setFiles(prev=>[...prev,...e.target.files])}/>
              <Upload size={26} style={{color:dragging?course.color:"var(--text3)",marginBottom:8}}/>
              <div className="as-dropzone-label">
                {dragging?"Drop files here":"Drag & drop files, or click to browse"}
              </div>
              <div className="as-dropzone-sub">PDF, ZIP, DOCX, PNG · Max 50MB per file</div>
            </div>

            {files.length>0&&(
              <div className="as-file-list">
                {files.map((f,i)=>(
                  <div key={i} className="as-file-item">
                    <FileText size={13} style={{color:course.color}}/>
                    <span>{f.name}</span>
                    <span className="as-file-size">{(f.size/1024).toFixed(0)} KB</span>
                    <button className="as-file-remove" onClick={e=>{e.stopPropagation();setFiles(prev=>prev.filter((_,j)=>j!==i));}}>
                      <X size={11}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note */}
          <div className="as-modal-section">
            <div className="as-modal-sec-label">Note to Faculty (optional)</div>
            <textarea className="as-note-textarea" rows={3}
              placeholder="Any remarks or queries for your faculty…"
              value={note} onChange={e=>setNote(e.target.value)}/>
          </div>

          {/* AI Hint */}
          <div className="as-ai-hint">
            <Bot size={14} style={{color:"var(--indigo-ll)",flexShrink:0}}/>
            <div>
              <div className="as-ai-hint-title">Lucyna AI Tip</div>
              <div className="as-ai-hint-text">
                Based on past submissions for this course, focus on code comments and edge-case testing — they account for 20% of marks.
              </div>
            </div>
          </div>
        </div>

        <div className="as-modal-footer">
          <button className="as-modal-btn as-modal-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="as-modal-btn as-modal-btn--primary"
            style={{background:course.color,opacity:files.length===0?.5:1}}
            disabled={files.length===0}
            onClick={()=>setSubmitted(true)}>
            <Send size={13}/>Submit Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL DRAWER ────────────────────────────────────────────────
function DetailDrawer({ asgmt, course, onClose, onSubmit }) {
  const sc = STATUS_CFG[asgmt.status];
  const tc = TYPE_CFG[asgmt.type] || TYPE_CFG[TYPE.THEORY];
  const db = dueBadge(asgmt);
  const ScIcon = sc.Icon;

  return (
    <div className="as-drawer-overlay" onClick={onClose}>
      <div className="as-drawer" onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="as-drawer-header" style={{"--card-color":course.color,"--card-rgb":course.rgb}}>
          <div className="as-drawer-header-bg"/>
          <div className="as-drawer-header-inner">
            <div className="as-drawer-top-row">
              <span className="as-course-chip" style={{color:course.color,background:`rgba(${course.rgb},.12)`}}>
                {course.short} · {course.code}
              </span>
              <button className="as-modal-close" onClick={onClose}><X size={15}/></button>
            </div>
            <div className="as-drawer-title">{asgmt.title}</div>
            <div className="as-drawer-chips">
              <span className="as-type-chip" style={{color:tc.color,background:tc.bg}}>{asgmt.type}</span>
              <span className="as-status-chip" style={{color:sc.color,background:sc.bg}}>
                <ScIcon size={10}/>{sc.label}
              </span>
              {db&&<span className="as-due-badge" style={{color:db.color,background:db.bg}}>
                <Calendar size={9}/>{db.label}
              </span>}
            </div>
          </div>
        </div>

        <div className="as-drawer-body">
          {/* KPIs */}
          <div className="as-drawer-kpis">
            {[
              {lbl:"Max Marks",   val:asgmt.maxMarks,          icon:<Award size={12}/>   },
              {lbl:"Weight",      val:asgmt.weight,             icon:<BarChart2 size={12}/>},
              {lbl:"Est. Time",   val:`${asgmt.estimatedHours}h`,icon:<Clock size={12}/>  },
              {lbl:"Difficulty",  val:asgmt.difficulty,         icon:<TrendingUp size={12}/>},
            ].map(k=>(
              <div key={k.lbl} className="as-kpi-mini">
                <div className="as-kpi-mini-icon" style={{color:course.color}}>{k.icon}</div>
                <div className="as-kpi-mini-val">{k.val}</div>
                <div className="as-kpi-mini-lbl">{k.lbl}</div>
              </div>
            ))}
          </div>

          {/* Grade strip (if graded) */}
          {asgmt.status===STATUS.GRADED&&asgmt.marks!=null&&(
            <div className="as-drawer-grade" style={{borderColor:`rgba(${course.rgb},.2)`,background:`rgba(${course.rgb},.05)`}}>
              <div className="as-dg-left">
                <div className="as-dg-score" style={{color:course.color}}>{asgmt.marks}/{asgmt.maxMarks}</div>
                <div className="as-dg-pct">{Math.round((asgmt.marks/asgmt.maxMarks)*100)}%</div>
              </div>
              <div className="as-dg-mid">
                <AnimBar pct={Math.round((asgmt.marks/asgmt.maxMarks)*100)} color={course.color} height={6} delay={300}/>
                {asgmt.classAvg!=null&&<div style={{fontSize:10,color:"var(--text3)",marginTop:4}}>Class avg: {asgmt.classAvg}/{asgmt.maxMarks}</div>}
              </div>
              {asgmt.grade&&(
                <div className="as-dg-grade" style={{color:course.color,borderColor:`rgba(${course.rgb},.25)`}}>
                  {asgmt.grade}
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          {asgmt.feedback&&(
            <div className="as-drawer-section">
              <div className="as-drawer-sec-label"><MessageSquare size={11}/>Faculty Feedback</div>
              <div className="as-feedback-box" style={{borderColor:`rgba(${course.rgb},.2)`,background:`rgba(${course.rgb},.04)`}}>
                "{asgmt.feedback}"
              </div>
            </div>
          )}

          {/* Resubmit notice */}
          {asgmt.status===STATUS.RESUBMIT&&(
            <div className="as-resubmit-notice">
              <RefreshCw size={13} style={{color:"var(--amber)",flexShrink:0}}/>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"var(--amber)"}}>Resubmission Required</div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{asgmt.feedback}</div>
                {asgmt.resubmitDeadline&&<div style={{fontSize:11,color:"var(--amber)",marginTop:4,fontWeight:600}}>
                  Resubmit by: {new Date(asgmt.resubmitDeadline).toLocaleDateString("en-IN",{day:"numeric",month:"long"})}
                </div>}
              </div>
            </div>
          )}

          {/* Late notice */}
          {asgmt.status===STATUS.LATE&&asgmt.lateNote&&(
            <div className="as-late-notice">
              <AlertTriangle size={13} style={{color:"var(--rose)",flexShrink:0}}/>
              <div style={{fontSize:11.5,color:"var(--text2)"}}>{asgmt.lateNote}</div>
            </div>
          )}

          {/* Description */}
          <div className="as-drawer-section">
            <div className="as-drawer-sec-label"><FileText size={11}/>Description</div>
            <div className="as-drawer-text">{asgmt.desc}</div>
          </div>

          {/* Instructions */}
          <div className="as-drawer-section">
            <div className="as-drawer-sec-label"><Flag size={11}/>Instructions</div>
            <ul className="as-instr-list">
              {asgmt.instructions.map((ins,i)=>(
                <li key={i}><ChevronRight size={11} style={{color:course.color,flexShrink:0,marginTop:1}}/>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Rubric */}
          <div className="as-drawer-section">
            <div className="as-drawer-sec-label"><Star size={11}/>Marking Rubric</div>
            <div className="as-rubric-table">
              {asgmt.rubric.map((r,i)=>(
                <div key={i} className="as-rubric-row">
                  <span>{r.item}</span>
                  <div style={{flex:1,margin:"0 12px"}}>
                    <AnimBar pct={Math.round((r.pts/asgmt.maxMarks)*100)} color={course.color} height={3} delay={400+i*80}/>
                  </div>
                  <span style={{color:course.color,fontWeight:700,minWidth:36,textAlign:"right"}}>{r.pts} pts</span>
                </div>
              ))}
              <div className="as-rubric-total">
                <span>Total</span><span/><span style={{color:course.color,fontWeight:700}}>{asgmt.maxMarks} pts</span>
              </div>
            </div>
          </div>

          {/* Resources */}
          {asgmt.attachments?.length>0&&(
            <div className="as-drawer-section">
              <div className="as-drawer-sec-label"><Paperclip size={11}/>Resources</div>
              <div className="as-attach-list">
                {asgmt.attachments.map(f=>(
                  <button key={f} className="as-attach-item">
                    <FileText size={13}/>{f}<Download size={11} style={{marginLeft:"auto"}}/>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submitted file */}
          {asgmt.submittedFile&&(
            <div className="as-drawer-section">
              <div className="as-drawer-sec-label"><Upload size={11}/>Your Submission</div>
              <div className="as-submitted-file" style={{borderColor:`rgba(${course.rgb},.2)`,background:`rgba(${course.rgb},.05)`}}>
                <FileText size={14} style={{color:course.color}}/>
                <div>
                  <div style={{fontSize:12.5,fontWeight:600,color:"var(--text1)"}}>{asgmt.submittedFile}</div>
                  <div style={{fontSize:10.5,color:"var(--text3)",marginTop:2}}>{asgmt.submittedAt}</div>
                </div>
                <button className="as-attach-dl-btn" style={{marginLeft:"auto",color:course.color}}>
                  <Download size={13}/>
                </button>
              </div>
            </div>
          )}

          {/* AI Tip */}
          <div className="as-ai-hint">
            <Bot size={14} style={{color:"var(--indigo-ll)",flexShrink:0}}/>
            <div>
              <div className="as-ai-hint-title">Lucyna AI Suggestion</div>
              <div className="as-ai-hint-text">
                Students who score above 80% on this type of assignment typically spend at least {asgmt.estimatedHours+1} hours and review the rubric 3× before submitting.
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="as-drawer-footer">
          {(asgmt.status===STATUS.PENDING||asgmt.status===STATUS.LATE||asgmt.status===STATUS.RESUBMIT)&&(
            <button className="as-modal-btn as-modal-btn--primary"
              style={{flex:1,background:course.color}} onClick={()=>onSubmit(asgmt)}>
              <Upload size={13}/>
              {asgmt.status===STATUS.RESUBMIT?"Resubmit Assignment":"Submit Assignment"}
            </button>
          )}
          {asgmt.status===STATUS.SUBMITTED&&(
            <div style={{textAlign:"center",color:"var(--text3)",fontSize:12,width:"100%"}}>
              <CheckCircle2 size={14} style={{color:"var(--indigo-ll)"}}/> Submitted — awaiting grading
            </div>
          )}
          {asgmt.status===STATUS.GRADED&&(
            <button className="as-modal-btn as-modal-btn--ghost" style={{flex:1}}>
              <Eye size={13}/>View Full Feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TIMELINE SIDEBAR ─────────────────────────────────────────────
function TimelineSidebar() {
  const upcoming = ASSIGNMENTS
    .filter(a=>a.status===STATUS.PENDING||a.status===STATUS.RESUBMIT||a.status===STATUS.LATE)
    .sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate))
    .slice(0,6);

  return (
    <div className="as-timeline-sidebar">
      {/* Upcoming deadlines */}
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <Calendar size={13} style={{color:"var(--indigo-ll)"}}/>
            Upcoming Deadlines
          </div>
        </div>
        <div className="panel-body" style={{padding:"0 0 8px"}}>
          {upcoming.map(a=>{
            const c   = COURSES.find(c=>c.id===a.courseId);
            const d   = daysUntil(a.dueDate);
            const col = d<0?"var(--rose)":d===0?"var(--rose)":d<=2?"var(--amber)":c.color;
            return (
              <div key={a.id} className="as-tl-row">
                <div className="as-tl-dot" style={{background:col}}/>
                <div className="as-tl-info">
                  <div className="as-tl-course" style={{color:c.color}}>{c.short}</div>
                  <div className="as-tl-name">{a.title}</div>
                </div>
                <div className="as-tl-due" style={{color:col}}>
                  {d<0?`${Math.abs(d)}d late`:d===0?"Today":d===1?"Tomorrow":`${d}d`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score overview */}
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <Award size={13} style={{color:"var(--indigo-ll)"}}/>
            Scores by Course
          </div>
        </div>
        <div className="panel-body">
          {COURSES.map(c=>{
            const graded = ASSIGNMENTS.filter(a=>a.courseId===c.id&&a.status===STATUS.GRADED&&a.marks!=null);
            if(!graded.length) return null;
            const avg = Math.round(graded.reduce((s,a)=>s+(a.marks/a.maxMarks)*100,0)/graded.length);
            return (
              <div key={c.id} className="as-score-row">
                <span className="as-score-course" style={{color:c.color}}>{c.short}</span>
                <div style={{flex:1,margin:"0 10px"}}>
                  <AnimBar pct={avg} color={c.color} height={4} delay={500}/>
                </div>
                <span className="as-score-val" style={{color:c.color}}>{avg}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Reminder */}
      <div className="as-ai-tip-card">
        <div className="as-ai-tip-header">
          <Bot size={14} style={{color:"var(--indigo-ll)"}}/>
          <span>Lucyna Reminder</span>
        </div>
        <div className="as-ai-tip-body">
          You have <strong style={{color:"var(--rose)"}}>2 submissions due today</strong>. OS Scheduling and SQL Queries. Start with the one that has the most marks!
        </div>
        <button className="as-ai-tip-btn">Open AI Mentor →</button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function StudentAssignments({ onBack }) {
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [filterTab,  setFilterTab]   = useState("All");
  const [typeFilter, setTypeFilter]  = useState("All Types");
  const [search,     setSearch]      = useState("");
  const [sortBy,     setSortBy]      = useState("Due Date");
  const [viewMode,   setViewMode]    = useState("grid");
  const [showSortDd, setShowSortDd]  = useState(false);
  const [showTypeDd, setShowTypeDd]  = useState(false);
  const [detailAsgmt, setDetailAsgmt]= useState(null);
  const [uploadAsgmt, setUploadAsgmt]= useState(null);

  // Close dropdowns on outside click
  useEffect(()=>{
    const h=()=>{ setShowSortDd(false); setShowTypeDd(false); };
    document.addEventListener("click",h);
    return ()=>document.removeEventListener("click",h);
  },[]);

  const activeCourse = COURSES.find(c=>c.id===activeCourseId)||null;

  // Filter
  const filtered = ASSIGNMENTS.filter(a=>{
    const byCourse = !activeCourseId || a.courseId===activeCourseId;
    const byTab =
      filterTab==="All"          ? true :
      filterTab==="Pending"      ? (a.status===STATUS.PENDING||a.status===STATUS.RESUBMIT) :
      filterTab==="Submitted"    ? a.status===STATUS.SUBMITTED :
      filterTab==="Graded"       ? a.status===STATUS.GRADED :
      filterTab==="Late/Missing" ? (a.status===STATUS.LATE||a.status===STATUS.MISSING) :
      true;
    const byType   = typeFilter==="All Types" || a.type===typeFilter;
    const bySearch = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t=>t.toLowerCase().includes(search.toLowerCase()));
    return byCourse&&byTab&&byType&&bySearch;
  });

  // Sort
  const sorted = [...filtered].sort((a,b)=>{
    if(sortBy==="Due Date") return new Date(a.dueDate)-new Date(b.dueDate);
    if(sortBy==="Course")   return a.courseId.localeCompare(b.courseId);
    if(sortBy==="Marks")    return b.maxMarks-a.maxMarks;
    if(sortBy==="Status")   return a.status.localeCompare(b.status);
    return 0;
  });

  const handleOpen   = (a) => setDetailAsgmt(a);
  const handleSubmit = (a) => { setDetailAsgmt(null); setUploadAsgmt(a); };
  const handleClose  = ()  => { setDetailAsgmt(null); setUploadAsgmt(null); };

  return (
    <>
      {/* Detail Drawer */}
      {detailAsgmt&&(()=>{
        const c=COURSES.find(x=>x.id===detailAsgmt.courseId);
        return <DetailDrawer asgmt={detailAsgmt} course={c} onClose={handleClose} onSubmit={handleSubmit}/>;
      })()}

      {/* Upload Modal */}
      {uploadAsgmt&&(()=>{
        const c=COURSES.find(x=>x.id===uploadAsgmt.courseId);
        return <UploadModal asgmt={uploadAsgmt} course={c} onClose={handleClose}/>;
      })()}

      <div className="as-root">
        {/* ── Page Header ── */}
        <div className="san-page-hd">
          <div className="san-back-row">
            <button className="san-back-btn" onClick={onBack}>
              <ChevronLeft size={13}/> Dashboard
            </button>
            <div className="san-breadcrumb">
              <span>Dashboard</span>
              <ChevronRight size={11} style={{color:"var(--text3)"}}/>
              <span className="san-bc-active">Assignments</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginTop:10}}>
            <div>
              <div className="greet-tag" style={{marginBottom:8}}>
                <div className="greet-pip"/>
                <span className="greet-pip-txt">Semester 5 · Week 11 · {ASSIGNMENTS.length} Assignments</span>
              </div>
              <h1 className="greet-title">My <em>Assignments</em></h1>
              <p className="greet-sub">Track submissions, deadlines, grades and faculty feedback across all your courses.</p>
            </div>
          </div>
        </div>

        <StatsStrip/>

        {/* ── Main layout ── */}
        <div className="as-main-layout">
          {/* Left sidebar */}
          <CourseSidebar activeCourseId={activeCourseId} onSelect={setActiveCourseId}/>

          {/* Content */}
          <div className="as-content-area">
            {/* Course heading banner */}
            {activeCourse&&(
              <div className="vl-course-heading"
                style={{"--card-color":activeCourse.color,"--card-rgb":activeCourse.rgb}}>
                <div className="vl-ch-left">
                  <div className="vl-ch-short" style={{color:activeCourse.color}}>{activeCourse.short}</div>
                  <div>
                    <div className="vl-ch-name">{activeCourse.name}</div>
                    <div className="vl-ch-faculty">{activeCourse.faculty} · {activeCourse.code}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                  {(()=>{
                    const all=ASSIGNMENTS.filter(a=>a.courseId===activeCourse.id);
                    const done=all.filter(a=>a.status===STATUS.GRADED||a.status===STATUS.SUBMITTED).length;
                    return (
                      <>
                        <RadialProgress pct={Math.round((done/all.length)*100)} color={activeCourse.color} size={44} stroke={4}/>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:activeCourse.color}}>
                            {Math.round((done/all.length)*100)}%
                          </div>
                          <div style={{fontSize:10,color:"var(--text3)"}}>{done}/{all.length} submitted</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="mc-toolbar">
              <div className="mc-filter-tabs">
                {FILTER_TABS.map(t=>(
                  <button key={t} className={`mc-filter-tab${filterTab===t?" active":""}`}
                    onClick={()=>setFilterTab(t)}>
                    {t}
                    {t==="Pending"&&(()=>{const n=ASSIGNMENTS.filter(a=>a.status===STATUS.PENDING||a.status===STATUS.RESUBMIT).length;return n>0?<span className="as-tab-badge">{n}</span>:null;})()}
                    {t==="Late/Missing"&&(()=>{const n=ASSIGNMENTS.filter(a=>a.status===STATUS.LATE||a.status===STATUS.MISSING).length;return n>0?<span className="as-tab-badge as-tab-badge--rose">{n}</span>:null;})()}
                  </button>
                ))}
              </div>

              <div className="mc-toolbar-right">
                {/* Search */}
                <div className="mc-search-wrap">
                  <Search size={13} style={{color:"var(--text3)",flexShrink:0}}/>
                  <input className="mc-search" placeholder="Search assignments…"
                    value={search} onChange={e=>setSearch(e.target.value)}/>
                  {search&&<button className="mc-search-clear" onClick={()=>setSearch("")}><X size={12}/></button>}
                </div>

                {/* Type filter */}
                <div className="vl-sort-wrap" onClick={e=>e.stopPropagation()}>
                  <button className="vl-sort-btn" onClick={()=>setShowTypeDd(d=>!d)}>
                    <Filter size={12}/>{typeFilter}
                    <ChevronDown size={11} style={{transform:showTypeDd?"rotate(180deg)":"none",transition:"transform .18s"}}/>
                  </button>
                  {showTypeDd&&(
                    <div className="vl-sort-dd">
                      {TYPE_FILTERS.map(o=>(
                        <button key={o} className={`vl-sort-opt${typeFilter===o?" active":""}`}
                          onClick={()=>{setTypeFilter(o);setShowTypeDd(false);}}>{o}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort */}
                <div className="vl-sort-wrap" onClick={e=>e.stopPropagation()}>
                  <button className="vl-sort-btn" onClick={()=>setShowSortDd(d=>!d)}>
                    <BarChart2 size={12}/>{sortBy}
                    <ChevronDown size={11} style={{transform:showSortDd?"rotate(180deg)":"none",transition:"transform .18s"}}/>
                  </button>
                  {showSortDd&&(
                    <div className="vl-sort-dd">
                      {SORT_OPTIONS.map(o=>(
                        <button key={o} className={`vl-sort-opt${sortBy===o?" active":""}`}
                          onClick={()=>{setSortBy(o);setShowSortDd(false);}}>{o}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div className="mc-view-toggle">
                  <button className={`mc-view-btn${viewMode==="grid"?" active":""}`} onClick={()=>setViewMode("grid")}><LayoutGrid size={13}/></button>
                  <button className={`mc-view-btn${viewMode==="list"?" active":""}`} onClick={()=>setViewMode("list")}><List size={13}/></button>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="as-results-count">
              Showing <strong>{sorted.length}</strong> assignment{sorted.length!==1?"s":""}
              {activeCourse&&<> in <span style={{color:activeCourse.color}}>{activeCourse.short}</span></>}
              {filterTab!=="All"&&<> · {filterTab}</>}
            </div>

            {/* Assignment list / grid */}
            {sorted.length===0 ? (
              <div className="mc-empty">
                <FileText size={32} style={{color:"var(--text3)"}}/>
                <p>No assignments match your filters.</p>
              </div>
            ) : viewMode==="grid" ? (
              <div className="as-grid">
                {sorted.map(a=>{
                  const c=COURSES.find(x=>x.id===a.courseId);
                  return <AssignmentCard key={a.id} asgmt={a} course={c} onOpen={handleOpen}/>;
                })}
              </div>
            ) : (
              <div className="as-list">
                {sorted.map(a=>{
                  const c=COURSES.find(x=>x.id===a.courseId);
                  return <AssignmentRow key={a.id} asgmt={a} course={c} onOpen={handleOpen}/>;
                })}
              </div>
            )}
          </div>

          {/* Right timeline sidebar */}
          <TimelineSidebar/>
        </div>
      </div>
    </>
  );
}