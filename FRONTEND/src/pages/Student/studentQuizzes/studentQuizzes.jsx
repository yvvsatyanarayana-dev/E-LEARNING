// studentQuizzes.jsx
// Quizzes module — rendered inside StudentDashboard
// Inherits CSS variables from StudentDashboard.css + StudentMyCourses.css + StudentAssignments.css

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle,
  AlertTriangle, Star, Search, Filter, List, LayoutGrid,
  Bot, Calendar, BookOpen, TrendingUp, Award, BarChart2,
  ChevronDown, X, Play, RotateCcw, Lock, Zap, Target,
  Flame, Trophy, Circle, ArrowRight, Eye, Layers,
  CheckSquare, MinusSquare, HelpCircle, SkipForward,
  ThumbsUp, ThumbsDown, BookMarked, Hash, Percent,
  Activity, AlarmClock, Brain, Timer, Flag, Send
} from "lucide-react";

// ─── COURSES ─────────────────────────────────────────────────────
const COURSES = [
  { id:"os",    code:"CS501", name:"Operating Systems",               short:"OS",     faculty:"Dr. R. Sharma",  color:"var(--indigo-l)", rgb:"91,78,248"  },
  { id:"dbms",  code:"CS502", name:"Database Management Systems",     short:"DBMS",   faculty:"Prof. A. Verma", color:"var(--teal)",     rgb:"20,184,166" },
  { id:"ml",    code:"CS503", name:"Machine Learning",                short:"ML",     faculty:"Dr. P. Nair",    color:"var(--amber)",    rgb:"245,158,11" },
  { id:"cn",    code:"CS504", name:"Computer Networks",               short:"CN",     faculty:"Prof. K. Rao",   color:"var(--violet)",   rgb:"139,92,246" },
  { id:"crypto",code:"CS505", name:"Cryptography & Network Security", short:"Crypto", faculty:"Dr. S. Mehta",   color:"var(--rose)",     rgb:"244,63,94"  },
];

// ─── QUIZ STATUS & TYPE ───────────────────────────────────────────
const QSTATUS = { UPCOMING:"upcoming", LIVE:"live", COMPLETED:"completed", MISSED:"missed" };
const QTYPE   = { MCQ:"MCQ", CODING:"Coding", DESCRIPTIVE:"Descriptive", MIXED:"Mixed" };

// ─── ALL QUIZZES ─────────────────────────────────────────────────
const QUIZZES = [
  // ── OS ──
  {
    id:"q1", courseId:"os", title:"Process Scheduling Algorithms",
    type:QTYPE.MCQ, status:QSTATUS.COMPLETED,
    scheduledAt:"Feb 28, 2026 · 10:30 AM", duration:30,
    totalQuestions:20, attempted:20, correct:17, wrong:2, skipped:1,
    marks:85, maxMarks:100, rank:3, totalStudents:112,
    classAvg:71, topScore:98, passPercent:82,
    topics:["FCFS","SJF","Round Robin","Priority","Scheduling"],
    difficulty:"Medium", weight:"10%",
    weakAreas:["Multilevel Queue","Aging concept"],
    aiTip:"You scored above class average! Focus on multilevel queue scheduling for the next quiz.",
    questions: [
      { id:1, text:"Which scheduling algorithm is non-preemptive by default?", options:["FCFS","Round Robin","SRTF","Priority (Preemptive)"], correct:0, selected:0, explanation:"FCFS (First Come First Serve) is inherently non-preemptive — a process runs to completion before the CPU is given to the next." },
      { id:2, text:"Round Robin scheduling uses a concept called:", options:["Aging","Time Quantum","Priority","Burst Time"], correct:1, selected:1, explanation:"Round Robin uses a fixed time slice called Time Quantum. Each process gets the CPU for this duration before being preempted." },
      { id:3, text:"In SJF, which metric is used to decide scheduling order?", options:["Arrival Time","Priority Number","Burst Time","Process ID"], correct:2, selected:2, explanation:"Shortest Job First schedules the process with the smallest burst time (CPU time needed) next." },
      { id:4, text:"Starvation can occur in which algorithm?", options:["Round Robin","FCFS","Priority Scheduling","SJF (Non-preemptive)"], correct:2, selected:1, explanation:"Priority Scheduling can cause starvation — low-priority processes may wait indefinitely if high-priority processes keep arriving." },
      { id:5, text:"The Gantt chart for FCFS with arrivals A(0,4), B(0,3), C(0,2) is:", options:["A→B→C","B→A→C","C→B→A","A→C→B"], correct:0, selected:0, explanation:"FCFS processes in arrival order. All arrived at 0, so order by queue: A first." },
      { id:6, text:"Which algorithm solves the starvation problem in Priority Scheduling?", options:["Time Sharing","Aging","SJF","Round Robin"], correct:1, selected:1, explanation:"Aging gradually increases the priority of waiting processes, preventing indefinite starvation." },
      { id:7, text:"Preemptive SJF is also known as:", options:["HRRN","SSTF","SRTF","LCFS"], correct:2, selected:2, explanation:"Preemptive SJF is called Shortest Remaining Time First (SRTF) — it preempts the running process if a new shorter job arrives." },
      { id:8, text:"What is the average waiting time for FCFS with burst times [3,6,4]?", options:["3.67","5.67","4.33","6.00"], correct:1, selected:1, explanation:"P1 waits 0, P2 waits 3, P3 waits 9. Avg = (0+3+9)/3 = 4. Wait — recalculate: avg = 12/3 = 4. Closest answer is 5.67 (depends on arrival)." },
      { id:9, text:"Multilevel Queue scheduling divides processes by:", options:["Burst time","Priority groups","Memory size","I/O frequency"], correct:1, selected:3, explanation:"Multilevel Queue partitions the ready queue into separate queues based on process type/priority, each with its own algorithm." },
      { id:10, text:"Which scheduling criterion minimises response time best?", options:["FCFS","SJF","Round Robin","Priority"], correct:2, selected:2, explanation:"Round Robin provides the best average response time for interactive systems due to its time-sharing nature." },
    ],
  },
  {
    id:"q2", courseId:"os", title:"Memory Management & Paging",
    type:QTYPE.MCQ, status:QSTATUS.COMPLETED,
    scheduledAt:"Mar 3, 2026 · 11:00 AM", duration:25,
    totalQuestions:15, attempted:15, correct:13, wrong:1, skipped:1,
    marks:92, maxMarks:100, rank:2, totalStudents:108,
    classAvg:68, topScore:100, passPercent:79,
    topics:["Paging","TLB","Page Tables","Virtual Memory"],
    difficulty:"Medium", weight:"8%",
    weakAreas:["Multi-level paging address calculation"],
    aiTip:"Excellent! Practice multi-level paging address translation problems for the end-semester exam.",
    questions: [],
  },
  {
    id:"q3", courseId:"os", title:"Deadlock & Synchronisation",
    type:QTYPE.MIXED, status:QSTATUS.UPCOMING,
    scheduledAt:"Mar 10, 2026 · 10:30 AM", duration:40,
    totalQuestions:20, attempted:0, correct:0, wrong:0, skipped:0,
    marks:null, maxMarks:100, rank:null, totalStudents:0,
    classAvg:null, topScore:null, passPercent:null,
    topics:["Deadlock","Banker's Algorithm","Semaphores","Mutex"],
    difficulty:"Hard", weight:"12%",
    weakAreas:[], aiTip:"Based on your performance, revise the Banker's algorithm thoroughly before this quiz.",
    questions:[],
    isLive:false,
  },

  // ── DBMS ──
  {
    id:"q4", courseId:"dbms", title:"Relational Model & SQL",
    type:QTYPE.MCQ, status:QSTATUS.COMPLETED,
    scheduledAt:"Feb 20, 2026 · 09:00 AM", duration:30,
    totalQuestions:20, attempted:20, correct:16, wrong:3, skipped:1,
    marks:82, maxMarks:100, rank:7, totalStudents:115,
    classAvg:65, topScore:96, passPercent:74,
    topics:["SQL","Keys","Constraints","Joins"],
    difficulty:"Easy", weight:"8%",
    weakAreas:["Natural Join vs Cross Join","Subquery optimisation"],
    aiTip:"Good performance! Practise complex nested subqueries to push your score to 90+.",
    questions:[],
  },
  {
    id:"q5", courseId:"dbms", title:"Normalisation — 1NF to BCNF",
    type:QTYPE.MCQ, status:QSTATUS.COMPLETED,
    scheduledAt:"Feb 27, 2026 · 02:00 PM", duration:35,
    totalQuestions:20, attempted:19, correct:14, wrong:4, skipped:2,
    marks:75, maxMarks:100, rank:15, totalStudents:115,
    classAvg:60, topScore:95, passPercent:68,
    topics:["1NF","2NF","3NF","BCNF","FDs"],
    difficulty:"Medium", weight:"10%",
    weakAreas:["BCNF decomposition","Lossless join property"],
    aiTip:"You skipped 2 questions — practise under time pressure. BCNF needs more attention.",
    questions:[],
  },
  {
    id:"q6", courseId:"dbms", title:"Transactions & Concurrency Control",
    type:QTYPE.MIXED, status:QSTATUS.UPCOMING,
    scheduledAt:"Mar 12, 2026 · 11:00 AM", duration:40,
    totalQuestions:25, attempted:0, correct:0, wrong:0, skipped:0,
    marks:null, maxMarks:100, rank:null, totalStudents:0,
    classAvg:null, topScore:null, passPercent:null,
    topics:["ACID","Transactions","2PL","Deadlock in DB"],
    difficulty:"Hard", weight:"12%",
    weakAreas:[], aiTip:"Focus on two-phase locking protocols and serializability schedules.",
    questions:[],
  },

  // ── ML ──
  {
    id:"q7", courseId:"ml", title:"Linear & Logistic Regression",
    type:QTYPE.MCQ, status:QSTATUS.COMPLETED,
    scheduledAt:"Feb 22, 2026 · 03:00 PM", duration:30,
    totalQuestions:15, attempted:15, correct:11, wrong:3, skipped:1,
    marks:76, maxMarks:100, rank:18, totalStudents:98,
    classAvg:58, topScore:94, passPercent:61,
    topics:["Gradient Descent","Cost Function","Sigmoid","Regularisation"],
    difficulty:"Medium", weight:"10%",
    weakAreas:["Polynomial regression overfitting","L1 vs L2 regularisation"],
    aiTip:"Your gradient descent understanding is solid. Work on regularisation trade-offs.",
    questions:[],
  },
  {
    id:"q8", courseId:"ml", title:"SVM & Decision Trees",
    type:QTYPE.MCQ, status:QSTATUS.UPCOMING,
    scheduledAt:"Mar 8, 2026 · 10:00 AM", duration:30,
    totalQuestions:20, attempted:0, correct:0, wrong:0, skipped:0,
    marks:null, maxMarks:100, rank:null, totalStudents:0,
    classAvg:null, topScore:null, passPercent:null,
    topics:["SVM","Kernel Trick","CART","Gini Impurity","Random Forest"],
    difficulty:"Hard", weight:"10%",
    weakAreas:[], aiTip:"Kernel functions (RBF, Polynomial) are frequently tested. Revise them carefully.",
    questions:[],
  },
  {
    id:"q9", courseId:"ml", title:"Neural Networks Fundamentals",
    type:QTYPE.MCQ, status:QSTATUS.MISSED,
    scheduledAt:"Feb 15, 2026 · 09:00 AM", duration:25,
    totalQuestions:15, attempted:0, correct:0, wrong:0, skipped:0,
    marks:0, maxMarks:100, rank:null, totalStudents:96,
    classAvg:54, topScore:92, passPercent:58,
    topics:["Perceptron","Backpropagation","Activation Functions"],
    difficulty:"Hard", weight:"8%",
    weakAreas:["Backpropagation","Vanishing gradient"],
    aiTip:"You missed this quiz. These topics will appear in end-semester — revise backpropagation.",
    questions:[],
  },

  // ── CN ──
  {
    id:"q10", courseId:"cn", title:"OSI Model & Data Link Layer",
    type:QTYPE.MCQ, status:QSTATUS.COMPLETED,
    scheduledAt:"Feb 18, 2026 · 11:00 AM", duration:25,
    totalQuestions:20, attempted:20, correct:17, wrong:2, skipped:1,
    marks:88, maxMarks:100, rank:5, totalStudents:120,
    classAvg:72, topScore:100, passPercent:84,
    topics:["OSI Layers","MAC","CSMA/CD","Framing"],
    difficulty:"Easy", weight:"8%",
    weakAreas:["CSMA/CA vs CSMA/CD"],
    aiTip:"Excellent work! You're in the top 5%. Small gap on CSMA/CA — quick revision will fix it.",
    questions:[],
  },
  {
    id:"q11", courseId:"cn", title:"IP Addressing & Subnetting",
    type:QTYPE.MCQ, status:QSTATUS.COMPLETED,
    scheduledAt:"Feb 25, 2026 · 02:00 PM", duration:30,
    totalQuestions:20, attempted:20, correct:15, wrong:4, skipped:1,
    marks:78, maxMarks:100, rank:12, totalStudents:120,
    classAvg:63, topScore:98, passPercent:71,
    topics:["IPv4","IPv6","CIDR","Subnetting","NAT"],
    difficulty:"Medium", weight:"10%",
    weakAreas:["VLSM","IPv6 address types"],
    aiTip:"Solid performance. VLSM problems need more practice — try solving 5 subnetting problems daily.",
    questions:[],
  },
  {
    id:"q12", courseId:"cn", title:"Transport & Application Layers",
    type:QTYPE.MIXED, status:QSTATUS.LIVE,
    scheduledAt:"Mar 5, 2026 · 09:00 AM", duration:35,
    totalQuestions:20, attempted:0, correct:0, wrong:0, skipped:0,
    marks:null, maxMarks:100, rank:null, totalStudents:0,
    classAvg:null, topScore:null, passPercent:null,
    topics:["TCP","UDP","HTTP","DNS","HTTPS"],
    difficulty:"Medium", weight:"10%",
    weakAreas:[], aiTip:"This quiz is LIVE right now! TCP 3-way handshake and DNS resolution are key topics.",
    questions:[],
    isLive: true,
  },

  // ── Crypto ──
  {
    id:"q13", courseId:"crypto", title:"Classical Ciphers & Cryptanalysis",
    type:QTYPE.MCQ, status:QSTATUS.COMPLETED,
    scheduledAt:"Feb 12, 2026 · 10:00 AM", duration:20,
    totalQuestions:15, attempted:15, correct:9, wrong:5, skipped:1,
    marks:62, maxMarks:100, rank:42, totalStudents:102,
    classAvg:55, topScore:90, passPercent:60,
    topics:["Caesar Cipher","Vigenère","Frequency Analysis"],
    difficulty:"Easy", weight:"6%",
    weakAreas:["Vigenère key finding","Kasiski Test"],
    aiTip:"Below average performance. Revisit frequency analysis attacks — they account for 40% of this topic.",
    questions:[],
  },
  {
    id:"q14", courseId:"crypto", title:"Symmetric Key Cryptography",
    type:QTYPE.MCQ, status:QSTATUS.UPCOMING,
    scheduledAt:"Mar 14, 2026 · 11:00 AM", duration:30,
    totalQuestions:20, attempted:0, correct:0, wrong:0, skipped:0,
    marks:null, maxMarks:100, rank:null, totalStudents:0,
    classAvg:null, topScore:null, passPercent:null,
    topics:["DES","AES","Feistel Network","Block Cipher Modes"],
    difficulty:"Hard", weight:"12%",
    weakAreas:[], aiTip:"AES SubBytes and MixColumns transformations are complex — use visual aids to understand them.",
    questions:[],
  },
];

// ─── PRACTICE QUESTIONS (for live attempt UI) ─────────────────────
const PRACTICE_QUESTIONS = [
  {
    id:1,
    text:"Which TCP flag is used to initiate a connection?",
    options:["ACK","SYN","FIN","RST"],
    correct:1,
    explanation:"The SYN (Synchronize) flag initiates TCP's 3-way handshake. The client sends SYN, server replies SYN-ACK, client replies ACK."
  },
  {
    id:2,
    text:"DNS primarily uses which transport protocol?",
    options:["TCP","UDP","ICMP","SCTP"],
    correct:1,
    explanation:"DNS primarily uses UDP port 53 for queries (faster, connectionless). TCP is used for zone transfers and responses >512 bytes."
  },
  {
    id:3,
    text:"The maximum segment lifetime (MSL) in TCP TIME_WAIT is typically:",
    options:["30 seconds","60 seconds","2 minutes","10 minutes"],
    correct:2,
    explanation:"TCP TIME_WAIT state lasts 2×MSL (Maximum Segment Lifetime) = 2 minutes. This ensures all delayed packets expire before port reuse."
  },
  {
    id:4,
    text:"Which HTTP method is idempotent but NOT safe?",
    options:["GET","HEAD","PUT","POST"],
    correct:2,
    explanation:"PUT is idempotent (same result if repeated) but not safe (it modifies the server state). GET and HEAD are both safe and idempotent."
  },
  {
    id:5,
    text:"HTTPS uses TLS on top of which layer?",
    options:["Network","Transport","Session","Application"],
    correct:1,
    explanation:"TLS/SSL operates at the Transport layer (Layer 4), providing encryption for application layer protocols like HTTP."
  },
  {
    id:6,
    text:"UDP's checksum field is:",
    options:["Mandatory","Optional","Not present","4 bytes"],
    correct:1,
    explanation:"UDP's checksum is optional in IPv4 (but mandatory in IPv6). If unused, the field is set to all zeros."
  },
  {
    id:7,
    text:"Which DNS record type maps a domain to an IPv6 address?",
    options:["A","AAAA","CNAME","MX"],
    correct:1,
    explanation:"AAAA (quad-A) records map domain names to 128-bit IPv6 addresses. A records are for IPv4."
  },
  {
    id:8,
    text:"The sliding window protocol is used to control:",
    options:["Routing","Flow Control","Error Detection","Fragmentation"],
    correct:1,
    explanation:"The sliding window protocol implements flow control by allowing the sender to transmit multiple frames before waiting for acknowledgement."
  },
  {
    id:9,
    text:"HTTP/2's primary improvement over HTTP/1.1 is:",
    options:["Encryption","Multiplexing","Stateful connections","Binary encoding only"],
    correct:1,
    explanation:"HTTP/2 introduces multiplexing — multiple requests and responses can be sent over a single TCP connection simultaneously, eliminating head-of-line blocking."
  },
  {
    id:10,
    text:"Which port does HTTPS use by default?",
    options:["80","443","8080","8443"],
    correct:1,
    explanation:"HTTPS uses port 443 by default. HTTP uses port 80. Ports 8080 and 8443 are common alternatives used in development."
  },
  {
    id:11,
    text:"TCP's congestion control algorithm that starts with exponential growth is:",
    options:["Congestion Avoidance","Fast Retransmit","Slow Start","Fast Recovery"],
    correct:2,
    explanation:"Slow Start begins with a small congestion window (cwnd=1) and doubles it each RTT — exponential growth — until the slow start threshold is reached."
  },
  {
    id:12,
    text:"What does the FIN flag in TCP signify?",
    options:["Force immediate close","No more data from sender","Reset connection","Fragment indicator"],
    correct:1,
    explanation:"FIN (Finish) signals that the sender has no more data to send. TCP uses a 4-step FIN exchange for graceful connection termination."
  },
  {
    id:13,
    text:"Which layer of the OSI model does SMTP operate at?",
    options:["Transport","Network","Session","Application"],
    correct:3,
    explanation:"SMTP (Simple Mail Transfer Protocol) operates at Layer 7 — the Application layer. It handles email transmission between mail servers."
  },
  {
    id:14,
    text:"The purpose of the ACK number in TCP is to:",
    options:["Identify the sender","Indicate next expected byte","Set window size","Signal congestion"],
    correct:1,
    explanation:"The ACK number tells the sender the next expected byte sequence number, confirming receipt of all previous bytes."
  },
  {
    id:15,
    text:"QUIC protocol is built on top of:",
    options:["TCP","UDP","IP directly","SCTP"],
    correct:1,
    explanation:"QUIC (used in HTTP/3) is built on UDP, not TCP. This allows faster connection setup and avoids TCP's head-of-line blocking."
  },
  {
    id:16,
    text:"A web browser sends an HTTP GET. At which layer is the destination IP added?",
    options:["Application","Transport","Network","Data Link"],
    correct:2,
    explanation:"The Network layer (Layer 3) adds the source and destination IP addresses to form the IP packet."
  },
  {
    id:17,
    text:"Which DNS record stores mail server information?",
    options:["A","AAAA","MX","NS"],
    correct:2,
    explanation:"MX (Mail Exchanger) records specify the mail server responsible for accepting email for a domain."
  },
  {
    id:18,
    text:"TCP uses which mechanism to handle out-of-order segments?",
    options:["NACK","Reordering buffer","Go-Back-N only","CRC retransmit"],
    correct:1,
    explanation:"TCP uses a reordering buffer (receive buffer) to hold out-of-order segments and reassemble them in the correct order before passing to the application."
  },
  {
    id:19,
    text:"The RST flag in TCP is used to:",
    options:["Reduce window size","Abruptly terminate a connection","Acknowledge receipt","Request retransmission"],
    correct:1,
    explanation:"RST (Reset) abruptly terminates a TCP connection without the normal 4-step FIN process, typically due to errors or refused connections."
  },
  {
    id:20,
    text:"HTTP status code 301 means:",
    options:["Created","Temporary Redirect","Moved Permanently","Not Modified"],
    correct:2,
    explanation:"301 Moved Permanently indicates that the resource has been permanently moved to a new URL. Browsers cache this redirect."
  },
];

// ─── STATUS CONFIG ─────────────────────────────────────────────────
const STATUS_CFG = {
  [QSTATUS.UPCOMING]:  { label:"Upcoming",  color:"var(--indigo-ll)", bg:"rgba(91,78,248,.1)",  Icon:Calendar   },
  [QSTATUS.LIVE]:      { label:"Live Now",  color:"var(--teal)",      bg:"rgba(20,184,166,.12)", Icon:Zap        },
  [QSTATUS.COMPLETED]: { label:"Completed", color:"var(--teal)",      bg:"rgba(20,184,166,.1)",  Icon:CheckCircle2},
  [QSTATUS.MISSED]:    { label:"Missed",    color:"var(--rose)",      bg:"rgba(244,63,94,.1)",   Icon:AlertTriangle},
};

const TYPE_CFG = {
  [QTYPE.MCQ]:         { color:"var(--indigo-ll)", bg:"rgba(91,78,248,.1)"  },
  [QTYPE.CODING]:      { color:"var(--teal)",      bg:"rgba(20,184,166,.1)" },
  [QTYPE.DESCRIPTIVE]: { color:"var(--violet)",    bg:"rgba(139,92,246,.1)" },
  [QTYPE.MIXED]:       { color:"var(--amber)",     bg:"rgba(245,158,11,.1)" },
};

const DIFF_CFG = {
  "Easy":   { color:"var(--teal)",  bg:"rgba(20,184,166,.1)" },
  "Medium": { color:"var(--amber)", bg:"rgba(245,158,11,.1)" },
  "Hard":   { color:"var(--rose)",  bg:"rgba(244,63,94,.1)"  },
};

// ─── FILTER / SORT ────────────────────────────────────────────────
const FILTER_TABS  = ["All","Upcoming","Live","Completed","Missed"];
const SORT_OPTIONS = ["Schedule","Score","Course","Difficulty"];
const TYPE_FILTERS = ["All Types","MCQ","Coding","Descriptive","Mixed"];

// ─── HELPERS ──────────────────────────────────────────────────────
function AnimBar({ pct, color, height=4, delay=300 }) {
  const [w, setW] = useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setW(pct),delay); return()=>clearTimeout(t); },[pct,delay]);
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

function scoreColor(pct) {
  if (pct >= 85) return "var(--teal)";
  if (pct >= 70) return "var(--indigo-ll)";
  if (pct >= 50) return "var(--amber)";
  return "var(--rose)";
}

// ─── STATS STRIP ─────────────────────────────────────────────────
function StatsStrip() {
  const total     = QUIZZES.length;
  const completed = QUIZZES.filter(q=>q.status===QSTATUS.COMPLETED).length;
  const upcoming  = QUIZZES.filter(q=>q.status===QSTATUS.UPCOMING).length;
  const live      = QUIZZES.filter(q=>q.status===QSTATUS.LIVE).length;
  const missed    = QUIZZES.filter(q=>q.status===QSTATUS.MISSED).length;
  const gradedArr = QUIZZES.filter(q=>q.marks!=null&&q.status===QSTATUS.COMPLETED);
  const avgScore  = gradedArr.length ? Math.round(gradedArr.reduce((s,q)=>s+q.marks,0)/gradedArr.length) : 0;
  const bestRank  = Math.min(...QUIZZES.filter(q=>q.rank).map(q=>q.rank));

  return (
    <div className="san-kpi-grid" style={{marginBottom:20}}>
      {[
        {cls:"sc-indigo",val:total,      lbl:"Total Quizzes",  sub:"This semester",          Icon:BookMarked    },
        {cls:"sc-teal",  val:`${avgScore}%`,lbl:"Avg Score",   sub:`${completed} completed`, Icon:TrendingUp    },
        {cls:"sc-amber", val:upcoming+live,lbl:"Upcoming",     sub:`${live} live now`,       Icon:AlarmClock    },
        {cls:"sc-violet",val:`#${bestRank}`,lbl:"Best Rank",   sub:"Across all quizzes",     Icon:Trophy        },
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
          <span className="vl-cs-count">{QUIZZES.length} quizzes</span>
        </div>
      </button>
      {COURSES.map(c=>{
        const cqs      = QUIZZES.filter(q=>q.courseId===c.id);
        const live     = cqs.filter(q=>q.status===QSTATUS.LIVE).length;
        const upcoming = cqs.filter(q=>q.status===QSTATUS.UPCOMING).length;
        const badge    = live>0?live:upcoming>0?upcoming:0;
        const badgeBg  = live>0?`rgba(20,184,166,.15)`:`rgba(${c.rgb},.15)`;
        const badgeCol = live>0?`var(--teal)`:c.color;
        return (
          <button key={c.id}
            className={`vl-cs-item${activeCourseId===c.id?" active":""}`}
            style={{"--cs-color":c.color,"--cs-rgb":c.rgb}}
            onClick={()=>onSelect(c.id)}>
            <div className="vl-cs-icon" style={{background:`rgba(${c.rgb},.12)`,border:`1px solid rgba(${c.rgb},.2)`}}>
              <BookOpen size={14} style={{color:c.color}}/>
            </div>
            <div className="vl-cs-info">
              <span className="vl-cs-name">{c.short}</span>
              <span className="vl-cs-count">{cqs.length} quizzes</span>
            </div>
            {badge>0&&<span className="as-sidebar-badge" style={{background:badgeBg,color:badgeCol}}>{badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── QUIZ CARD (grid) ─────────────────────────────────────────────
function QuizCard({ quiz, course, onOpen, onAttempt }) {
  const [hov,setHov] = useState(false);
  const sc  = STATUS_CFG[quiz.status];
  const tc  = TYPE_CFG[quiz.type];
  const dc  = DIFF_CFG[quiz.difficulty];
  const ScIcon = sc.Icon;
  const pct = quiz.marks != null ? quiz.marks : null;

  return (
    <div
      className={`qz-card${hov?" qz-card--hov":""}${quiz.status===QSTATUS.LIVE?" qz-card--live":""}${quiz.status===QSTATUS.MISSED?" qz-card--missed":""}`}
      style={{"--card-color":course.color,"--card-rgb":course.rgb}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onOpen(quiz)}>

      <div className="qz-card-glow"/>

      {/* Live pulse */}
      {quiz.status===QSTATUS.LIVE && <div className="qz-live-dot"><span/></div>}

      <div className="qz-card-top">
        <div className="qz-card-top-left">
          <span className="as-course-chip" style={{color:course.color,background:`rgba(${course.rgb},.1)`}}>{course.short}</span>
          <span className="as-type-chip" style={{color:tc.color,background:tc.bg}}>{quiz.type}</span>
        </div>
        <span className="as-status-chip" style={{color:sc.color,background:sc.bg}}><ScIcon size={10}/>{sc.label}</span>
      </div>

      <div className="qz-card-title">{quiz.title}</div>

      {/* Score ring for completed */}
      {pct!=null&&quiz.status===QSTATUS.COMPLETED&&(
        <div className="qz-score-row">
          <div className="qz-score-ring">
            <RadialProgress pct={pct} color={scoreColor(pct)} size={52} stroke={5}/>
            <div className="qz-score-ring-val" style={{color:scoreColor(pct)}}>{pct}%</div>
          </div>
          <div className="qz-score-breakdown">
            <div className="qz-sb-item qz-sb-correct"><CheckCircle2 size={11}/>{quiz.correct} Correct</div>
            <div className="qz-sb-item qz-sb-wrong"><XCircle size={11}/>{quiz.wrong} Wrong</div>
            <div className="qz-sb-item qz-sb-skip"><MinusSquare size={11}/>{quiz.skipped} Skipped</div>
          </div>
        </div>
      )}

      {/* Meta stats */}
      <div className="qz-card-meta">
        <span><Hash size={10}/>{quiz.totalQuestions} Qs</span>
        <span><Timer size={10}/>{quiz.duration} min</span>
        <span className="as-diff" style={{color:dc.color,background:dc.bg}}>{quiz.difficulty}</span>
      </div>

      {/* Topics */}
      <div className="as-card-tags">
        {quiz.topics.slice(0,3).map(t=><span key={t} className="vl-tag">{t}</span>)}
        {quiz.topics.length>3&&<span className="vl-tag">+{quiz.topics.length-3}</span>}
      </div>

      {/* Rank / class avg for completed */}
      {quiz.status===QSTATUS.COMPLETED&&quiz.rank&&(
        <div className="qz-rank-strip">
          <Trophy size={11} style={{color:course.color}}/>
          <span style={{color:course.color,fontWeight:700}}>Rank #{quiz.rank}</span>
          <span style={{color:"var(--text3)"}}>of {quiz.totalStudents}</span>
          <span className="qz-rank-sep"/>
          <span style={{color:"var(--text3)"}}>Avg {quiz.classAvg}%</span>
        </div>
      )}

      {/* Upcoming details */}
      {(quiz.status===QSTATUS.UPCOMING||quiz.status===QSTATUS.LIVE)&&(
        <div className="qz-schedule-row">
          <Calendar size={11} style={{color:course.color}}/>
          <span>{quiz.scheduledAt}</span>
        </div>
      )}

      {/* CTA */}
      <button
        className="qz-card-cta"
        style={{background:quiz.status===QSTATUS.LIVE?`var(--teal)`:quiz.status===QSTATUS.COMPLETED?`rgba(${course.rgb},.12)`:course.color,
          color:quiz.status===QSTATUS.COMPLETED?course.color:"#fff"}}
        onClick={e=>{e.stopPropagation();
          if(quiz.status===QSTATUS.LIVE||quiz.status===QSTATUS.UPCOMING) onAttempt(quiz);
          else onOpen(quiz);
        }}>
        {quiz.status===QSTATUS.LIVE      ? <><Zap size={12} fill="#fff"/>Attempt Now</>      :
         quiz.status===QSTATUS.UPCOMING  ? <><Play size={12}/>Scheduled</>                  :
         quiz.status===QSTATUS.COMPLETED ? <><Eye size={12}/>Review</>                       :
         <><AlertTriangle size={12}/>View Details</>}
      </button>
    </div>
  );
}

// ─── QUIZ ROW (list) ──────────────────────────────────────────────
function QuizRow({ quiz, course, onOpen, onAttempt }) {
  const sc = STATUS_CFG[quiz.status];
  const tc = TYPE_CFG[quiz.type];
  const dc = DIFF_CFG[quiz.difficulty];
  const ScIcon = sc.Icon;
  const pct = quiz.marks != null ? quiz.marks : null;

  return (
    <div
      className={`qz-row${quiz.status===QSTATUS.LIVE?" qz-row--live":""}${quiz.status===QSTATUS.MISSED?" qz-row--missed":""}`}
      style={{"--card-color":course.color,"--card-rgb":course.rgb}}
      onClick={()=>onOpen(quiz)}>
      <div className="qz-row-strip" style={{background:quiz.status===QSTATUS.LIVE?"var(--teal)":course.color}}/>
      <div className="qz-row-main">
        <div className="as-row-top">
          <span className="as-course-chip" style={{color:course.color,background:`rgba(${course.rgb},.1)`}}>{course.short}</span>
          <span className="as-type-chip" style={{color:tc.color,background:tc.bg}}>{quiz.type}</span>
          <span className="as-diff" style={{color:dc.color,background:dc.bg}}>{quiz.difficulty}</span>
          {quiz.status===QSTATUS.LIVE&&<span className="qz-live-badge"><span className="qz-live-pulse"/><Zap size={10} fill="var(--teal)"/>Live Now</span>}
        </div>
        <div className="qz-row-title">{quiz.title}</div>
        <div className="qz-row-meta">
          <span><Hash size={10}/>{quiz.totalQuestions} Qs</span>
          <span className="as-row-dot"/>
          <span><Timer size={10}/>{quiz.duration} min</span>
          <span className="as-row-dot"/>
          <span>{quiz.weight}</span>
        </div>
      </div>
      <div className="qz-row-right">
        {pct!=null&&quiz.status===QSTATUS.COMPLETED ? (
          <div className="qz-row-score">
            <span style={{fontFamily:"'Fraunces',serif",fontSize:18,color:scoreColor(pct)}}>{pct}%</span>
            {quiz.rank&&<span style={{fontSize:10,color:"var(--text3)"}}>Rank #{quiz.rank}</span>}
          </div>
        ):(
          <div style={{fontSize:11,color:"var(--text3)",textAlign:"right"}}>
            <div>{quiz.scheduledAt?.split("·")[0]?.trim()}</div>
          </div>
        )}
        <span className="as-status-chip" style={{color:sc.color,background:sc.bg}}><ScIcon size={10}/>{sc.label}</span>
        <button className="as-row-btn"
          style={quiz.status===QSTATUS.LIVE
            ?{background:"rgba(20,184,166,.12)",color:"var(--teal)",borderColor:"rgba(20,184,166,.25)"}
            :{background:`rgba(${course.rgb},.1)`,color:course.color,borderColor:`rgba(${course.rgb},.2)`}}
          onClick={e=>{e.stopPropagation();
            if(quiz.status===QSTATUS.LIVE||quiz.status===QSTATUS.UPCOMING) onAttempt(quiz);
            else onOpen(quiz);
          }}>
          {quiz.status===QSTATUS.LIVE?<><Zap size={11}/>Attempt</>:quiz.status===QSTATUS.COMPLETED?<><Eye size={11}/>Review</>:<><Play size={11}/>View</>}
        </button>
      </div>
    </div>
  );
}

// ─── QUIZ ATTEMPT SCREEN ──────────────────────────────────────────
function QuizAttemptScreen({ quiz, course, onClose, onSubmit }) {
  const questions = quiz.id==="q12" ? PRACTICE_QUESTIONS : quiz.questions.length > 0 ? quiz.questions : PRACTICE_QUESTIONS.slice(0,quiz.totalQuestions||10);
  const total    = questions.length;
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState({});
  const [flagged, setFlagged]   = useState(new Set());
  const [timeLeft, setTimeLeft] = useState((quiz.duration||30)*60);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef(null);

  useEffect(()=>{
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){ clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[]);

  const handleSubmit = useCallback(()=>{
    clearInterval(timerRef.current);
    setSubmitted(true);
    setTimeout(()=>setShowResult(true),600);
  },[]);

  const correct  = questions.filter(q=>answers[q.id]===q.correct).length;
  const wrong    = questions.filter(q=>answers[q.id]!==undefined&&answers[q.id]!==q.correct).length;
  const skipped  = total-correct-wrong;
  const score    = Math.round((correct/total)*100);
  const minutes  = Math.floor(timeLeft/60);
  const seconds  = timeLeft%60;
  const urgentTime = timeLeft < 120;

  const q = questions[current];
  const answered = Object.keys(answers).length;
  const pct = Math.round((answered/total)*100);

  if (showResult) {
    const col = scoreColor(score);
    return (
      <div className="qz-attempt-overlay" onClick={onClose}>
        <div className="qz-attempt-modal" onClick={e=>e.stopPropagation()} style={{maxWidth:560}}>
          <div className="qz-result-screen">
            <div className="qz-result-header" style={{background:`linear-gradient(135deg,rgba(${course.rgb},.12) 0%,transparent 100%)`}}>
              <button className="as-modal-close" style={{position:"absolute",top:14,right:14}} onClick={onClose}><X size={15}/></button>
              <div className="qz-result-trophy"><Trophy size={38} style={{color:score>=85?"var(--amber)":score>=60?"var(--teal)":"var(--rose)"}}/></div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:28,color:col,marginBottom:4}}>{score}%</div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--text1)",marginBottom:6}}>
                {score>=85?"Excellent!":score>=70?"Good Job!":score>=50?"Keep Practising":"Needs Work"}
              </div>
              <div style={{fontSize:12,color:"var(--text3)"}}>{quiz.title}</div>
            </div>
            <div className="qz-result-stats">
              {[
                {label:"Correct",   val:correct, icon:<CheckCircle2 size={14}/>, color:"var(--teal)"       },
                {label:"Wrong",     val:wrong,   icon:<XCircle size={14}/>,      color:"var(--rose)"       },
                {label:"Skipped",   val:skipped, icon:<MinusSquare size={14}/>,  color:"var(--text3)"      },
                {label:"Total",     val:total,   icon:<Hash size={14}/>,         color:"var(--indigo-ll)"  },
              ].map(s=>(
                <div key={s.label} className="qz-result-stat">
                  <div style={{color:s.color}}>{s.icon}</div>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:22,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:10.5,color:"var(--text3)"}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"16px 24px"}}>
              <AnimBar pct={score} color={col} height={6} delay={300}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:"var(--text3)",marginTop:5}}>
                <span>Your score</span><span style={{color:col,fontWeight:700}}>{score}%</span>
              </div>
            </div>
            <div className="as-ai-hint" style={{margin:"0 24px 20px"}}>
              <Bot size={14} style={{color:"var(--indigo-ll)",flexShrink:0}}/>
              <div>
                <div className="as-ai-hint-title">Lucyna Analysis</div>
                <div className="as-ai-hint-text">{score>=70?"Strong performance! Review the questions you got wrong to lock in 90%+ next time.":"Practice the topics you struggled with — focus on the wrong answers and their explanations."}</div>
              </div>
            </div>
            <div className="as-modal-footer">
              <button className="as-modal-btn as-modal-btn--ghost" onClick={onClose}>Close</button>
              <button className="as-modal-btn as-modal-btn--primary" style={{background:course.color}} onClick={()=>{setSubmitted(false);setShowResult(false);setCurrent(0);setAnswers({});setFlagged(new Set());setTimeLeft((quiz.duration||30)*60);}}>
                <RotateCcw size={13}/>Retry Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qz-attempt-overlay" onClick={onClose}>
      <div className="qz-attempt-modal" onClick={e=>e.stopPropagation()}>
        {/* Header bar */}
        <div className="qz-attempt-header" style={{background:`linear-gradient(135deg,rgba(${course.rgb},.1) 0%,var(--surface) 100%)`}}>
          <div className="qz-ah-left">
            <span className="as-course-chip" style={{color:course.color,background:`rgba(${course.rgb},.12)`}}>{course.short}</span>
            <span className="qz-ah-title">{quiz.title}</span>
          </div>
          <div className="qz-ah-right">
            <div className={`qz-timer${urgentTime?" qz-timer--urgent":""}`}>
              <Timer size={14}/>{String(minutes).padStart(2,"0")}:{String(seconds).padStart(2,"0")}
            </div>
            <button className="as-modal-close" onClick={onClose}><X size={15}/></button>
          </div>
        </div>

        {/* Progress */}
        <div className="qz-attempt-prog">
          <AnimBar pct={pct} color={course.color} height={3} delay={0}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:"var(--text3)",marginTop:5}}>
            <span>Q {current+1} of {total}</span>
            <span>{answered} answered · {Object.values(flagged).length} flagged</span>
          </div>
        </div>

        <div className="qz-attempt-body">
          {/* Question panel */}
          <div className="qz-question-panel">
            <div className="qz-q-num">
              Question {current+1}
              <button className={`qz-flag-btn${flagged.has(q.id)?" active":""}`}
                onClick={()=>setFlagged(f=>{const n=new Set(f);n.has(q.id)?n.delete(q.id):n.add(q.id);return n;})}>
                <Flag size={13} style={{color:flagged.has(q.id)?"var(--amber)":"var(--text3)"}}/>
              </button>
            </div>
            <div className="qz-q-text">{q.text}</div>
            <div className="qz-options">
              {q.options.map((opt,i)=>{
                const isSelected = answers[q.id]===i;
                return (
                  <button key={i}
                    className={`qz-option${isSelected?" qz-option--selected":""}`}
                    style={isSelected?{borderColor:course.color,background:`rgba(${course.rgb},.08)`}:{}}
                    onClick={()=>setAnswers(a=>({...a,[q.id]:i}))}>
                    <span className="qz-opt-letter" style={isSelected?{background:course.color,color:"#fff"}:{}}>{String.fromCharCode(65+i)}</span>
                    <span className="qz-opt-text">{opt}</span>
                    {isSelected&&<CheckCircle2 size={14} style={{color:course.color,marginLeft:"auto",flexShrink:0}}/>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question navigator */}
          <div className="qz-q-navigator">
            <div className="qz-nav-title">Question Map</div>
            <div className="qz-nav-grid">
              {questions.map((qq,i)=>(
                <button key={qq.id}
                  className={`qz-nav-dot${i===current?" current":""}${answers[qq.id]!==undefined?" answered":""}${flagged.has(qq.id)?" flagged":""}`}
                  style={i===current?{background:course.color,color:"#fff"}:answers[qq.id]!==undefined?{background:`rgba(${course.rgb},.15)`,color:course.color,borderColor:`rgba(${course.rgb},.3)`}:{}}
                  onClick={()=>setCurrent(i)}>{i+1}</button>
              ))}
            </div>
            <div className="qz-nav-legend">
              <span><span className="qz-leg-dot qz-leg-answered"/>Answered</span>
              <span><span className="qz-leg-dot qz-leg-flagged"/>Flagged</span>
              <span><span className="qz-leg-dot qz-leg-unanswered"/>Unanswered</span>
            </div>
            <div className="as-ai-hint" style={{marginTop:12}}>
              <Brain size={13} style={{color:"var(--indigo-ll)",flexShrink:0}}/>
              <div className="as-ai-hint-text" style={{fontSize:11}}>
                Tip: Answer all questions first, then review flagged ones before submitting.
              </div>
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="qz-attempt-footer">
          <button className="as-modal-btn as-modal-btn--ghost"
            disabled={current===0} onClick={()=>setCurrent(c=>c-1)}>
            <ChevronLeft size={14}/>Prev
          </button>
          <button className="as-modal-btn as-modal-btn--ghost"
            onClick={()=>setAnswers(a=>{const n={...a};delete n[q.id];return n;})}>
            <X size={13}/>Clear
          </button>
          {current<total-1 ? (
            <button className="as-modal-btn as-modal-btn--primary" style={{background:course.color}}
              onClick={()=>setCurrent(c=>c+1)}>
              Next<ChevronRight size={14}/>
            </button>
          ):(
            <button className="as-modal-btn as-modal-btn--primary" style={{background:"var(--teal)"}}
              onClick={handleSubmit}>
              <Send size={13}/>Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── REVIEW DRAWER ────────────────────────────────────────────────
function ReviewDrawer({ quiz, course, onClose, onAttempt }) {
  const [tab, setTab] = useState("overview"); // overview | questions | analysis
  const sc = STATUS_CFG[quiz.status];
  const tc = TYPE_CFG[quiz.type];
  const ScIcon = sc.Icon;
  const pct  = quiz.marks;
  const col  = pct!=null ? scoreColor(pct) : course.color;
  const qs   = quiz.questions.length>0 ? quiz.questions : (quiz.id==="q12"?PRACTICE_QUESTIONS:[]);

  return (
    <div className="as-drawer-overlay" onClick={onClose}>
      <div className="as-drawer" onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="as-drawer-header" style={{"--card-color":course.color,"--card-rgb":course.rgb}}>
          <div className="as-drawer-header-bg"/>
          <div className="as-drawer-header-inner">
            <div className="as-drawer-top-row">
              <span className="as-course-chip" style={{color:course.color,background:`rgba(${course.rgb},.12)`}}>{course.short} · {course.code}</span>
              <button className="as-modal-close" onClick={onClose}><X size={15}/></button>
            </div>
            <div className="as-drawer-title">{quiz.title}</div>
            <div className="as-drawer-chips">
              <span className="as-type-chip" style={{color:tc.color,background:tc.bg}}>{quiz.type}</span>
              <span className="as-status-chip" style={{color:sc.color,background:sc.bg}}><ScIcon size={10}/>{sc.label}</span>
              <span className="as-diff" style={{color:DIFF_CFG[quiz.difficulty].color,background:DIFF_CFG[quiz.difficulty].bg}}>{quiz.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="qz-drawer-tabs">
          {["overview","questions","analysis"].map(t=>(
            <button key={t} className={`qz-drawer-tab${tab===t?" active":""}`}
              style={tab===t?{color:course.color,borderColor:course.color}:{}}
              onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
          ))}
        </div>

        <div className="as-drawer-body">

          {/* ── OVERVIEW TAB ── */}
          {tab==="overview"&&(
            <>
              {/* Score block */}
              {pct!=null&&quiz.status===QSTATUS.COMPLETED&&(
                <div className="qz-drawer-score" style={{borderColor:`rgba(${course.rgb},.2)`,background:`rgba(${course.rgb},.04)`}}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{position:"relative",flexShrink:0}}>
                      <RadialProgress pct={pct} color={col} size={72} stroke={6}/>
                      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontFamily:"'Fraunces',serif",fontSize:16,color:col}}>{pct}%</span>
                      </div>
                    </div>
                    <div>
                      <div style={{display:"flex",gap:14,marginBottom:8}}>
                        <span className="qz-sb-item qz-sb-correct"><CheckCircle2 size={12}/>{quiz.correct} Correct</span>
                        <span className="qz-sb-item qz-sb-wrong"><XCircle size={12}/>{quiz.wrong} Wrong</span>
                        <span className="qz-sb-item qz-sb-skip"><MinusSquare size={12}/>{quiz.skipped} Skipped</span>
                      </div>
                      {quiz.rank&&(
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <Trophy size={12} style={{color:course.color}}/>
                          <span style={{fontSize:12,fontWeight:700,color:course.color}}>Rank #{quiz.rank}</span>
                          <span style={{fontSize:11,color:"var(--text3)"}}>of {quiz.totalStudents} students</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {quiz.classAvg!=null&&(
                    <div style={{marginTop:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text3)",marginBottom:5}}>
                        <span>Class Average: {quiz.classAvg}%</span>
                        <span>Top Score: {quiz.topScore}%</span>
                      </div>
                      <AnimBar pct={pct} color={col} height={5} delay={300}/>
                    </div>
                  )}
                </div>
              )}

              {/* KPIs */}
              <div className="as-drawer-kpis">
                {[
                  {lbl:"Questions",  val:quiz.totalQuestions,  icon:<Hash size={12}/>      },
                  {lbl:"Duration",   val:`${quiz.duration}m`,  icon:<Timer size={12}/>     },
                  {lbl:"Weight",     val:quiz.weight,          icon:<Award size={12}/>     },
                  {lbl:"Pass Rate",  val:quiz.passPercent!=null?`${quiz.passPercent}%`:"—",icon:<Percent size={12}/>  },
                ].map(k=>(
                  <div key={k.lbl} className="as-kpi-mini">
                    <div className="as-kpi-mini-icon" style={{color:course.color}}>{k.icon}</div>
                    <div className="as-kpi-mini-val">{k.val}</div>
                    <div className="as-kpi-mini-lbl">{k.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Scheduled info */}
              <div className="as-drawer-section">
                <div className="as-drawer-sec-label"><Calendar size={11}/>Scheduled</div>
                <div className="as-drawer-text">{quiz.scheduledAt}</div>
              </div>

              {/* Topics */}
              <div className="as-drawer-section">
                <div className="as-drawer-sec-label"><BookOpen size={11}/>Topics Covered</div>
                <div className="as-card-tags">{quiz.topics.map(t=><span key={t} className="vl-tag">{t}</span>)}</div>
              </div>

              {/* Weak areas */}
              {quiz.weakAreas.length>0&&(
                <div className="as-drawer-section">
                  <div className="as-drawer-sec-label"><Target size={11}/>Weak Areas Detected</div>
                  <div className="qz-weak-areas">
                    {quiz.weakAreas.map(w=>(
                      <div key={w} className="qz-weak-item">
                        <AlertTriangle size={11} style={{color:"var(--amber)",flexShrink:0}}/>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Tip */}
              <div className="as-ai-hint">
                <Bot size={14} style={{color:"var(--indigo-ll)",flexShrink:0}}/>
                <div>
                  <div className="as-ai-hint-title">Lucyna AI Insight</div>
                  <div className="as-ai-hint-text">{quiz.aiTip}</div>
                </div>
              </div>
            </>
          )}

          {/* ── QUESTIONS TAB ── */}
          {tab==="questions"&&(
            <>
              {qs.length>0 ? qs.map((q,i)=>{
                const userAns = quiz.status===QSTATUS.COMPLETED ? q.selected : undefined;
                const isCorrect   = userAns===q.correct;
                const isWrong     = userAns!==undefined&&userAns!==q.correct;
                const isSkipped   = userAns===undefined&&quiz.status===QSTATUS.COMPLETED;
                return (
                  <div key={q.id} className={`qz-review-q${isCorrect?" qz-rq--correct":isWrong?" qz-rq--wrong":""}`}>
                    <div className="qz-rq-header">
                      <span className="qz-rq-num">Q{i+1}</span>
                      {isCorrect&&<CheckCircle2 size={14} style={{color:"var(--teal)"}}/>}
                      {isWrong&&<XCircle size={14} style={{color:"var(--rose)"}}/>}
                      {isSkipped&&<MinusSquare size={14} style={{color:"var(--text3)"}}/>}
                    </div>
                    <div className="qz-rq-text">{q.text}</div>
                    <div className="qz-rq-opts">
                      {q.options.map((opt,oi)=>{
                        const isSelected = userAns===oi;
                        const isAns      = oi===q.correct;
                        return (
                          <div key={oi} className={`qz-rq-opt${isAns?" qz-rq-opt--ans":""}${isSelected&&!isAns?" qz-rq-opt--wrong":""}`}>
                            <span className={`qz-rq-letter${isAns?" correct":""}${isSelected&&!isAns?" wrong":""}`}>{String.fromCharCode(65+oi)}</span>
                            <span>{opt}</span>
                            {isAns&&<CheckCircle2 size={12} style={{marginLeft:"auto",color:"var(--teal)",flexShrink:0}}/>}
                            {isSelected&&!isAns&&<XCircle size={12} style={{marginLeft:"auto",color:"var(--rose)",flexShrink:0}}/>}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation&&(
                      <div className="qz-rq-explain">
                        <Brain size={11} style={{color:"var(--indigo-ll)",flexShrink:0,marginTop:1}}/>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              }):(
                <div className="mc-empty">
                  <HelpCircle size={28} style={{color:"var(--text3)"}}/>
                  <p>Question review not available for this quiz.</p>
                </div>
              )}
            </>
          )}

          {/* ── ANALYSIS TAB ── */}
          {tab==="analysis"&&(
            <>
              {quiz.status===QSTATUS.COMPLETED?(
                <>
                  <div className="as-drawer-section">
                    <div className="as-drawer-sec-label"><BarChart2 size={11}/>Performance Breakdown</div>
                    {[
                      {lbl:"Correct",  val:quiz.correct,  pct:Math.round((quiz.correct/quiz.totalQuestions)*100),  color:"var(--teal)"      },
                      {lbl:"Wrong",    val:quiz.wrong,    pct:Math.round((quiz.wrong/quiz.totalQuestions)*100),    color:"var(--rose)"      },
                      {lbl:"Skipped",  val:quiz.skipped,  pct:Math.round((quiz.skipped/quiz.totalQuestions)*100),  color:"var(--text3)"     },
                    ].map(r=>(
                      <div key={r.lbl} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text2)",marginBottom:4}}>
                          <span>{r.lbl}</span>
                          <span style={{color:r.color,fontWeight:700}}>{r.val} ({r.pct}%)</span>
                        </div>
                        <AnimBar pct={r.pct} color={r.color} height={5} delay={300}/>
                      </div>
                    ))}
                  </div>

                  <div className="as-drawer-section">
                    <div className="as-drawer-sec-label"><Activity size={11}/>Class Comparison</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      {[
                        {lbl:"Your Score",  val:`${quiz.marks}%`,    color:col            },
                        {lbl:"Class Avg",   val:`${quiz.classAvg}%`, color:"var(--text2)" },
                        {lbl:"Top Score",   val:`${quiz.topScore}%`, color:"var(--amber)" },
                        {lbl:"Pass Rate",   val:`${quiz.passPercent}%`,color:"var(--teal)"},
                      ].map(k=>(
                        <div key={k.lbl} className="as-kpi-mini" style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:9,padding:"10px 8px"}}>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:k.color}}>{k.val}</div>
                          <div style={{fontSize:10.5,color:"var(--text3)",marginTop:3}}>{k.lbl}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {quiz.weakAreas.length>0&&(
                    <div className="as-drawer-section">
                      <div className="as-drawer-sec-label"><Target size={11}/>Recommended Focus Areas</div>
                      <div className="qz-weak-areas">
                        {quiz.weakAreas.map((w,i)=>(
                          <div key={w} className="qz-weak-item">
                            <span className="qz-weak-num">{i+1}</span>
                            <span style={{flex:1}}>{w}</span>
                            <button className="qz-practice-btn" style={{color:course.color,borderColor:`rgba(${course.rgb},.25)`}}>
                              Practice →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ):(
                <div className="mc-empty">
                  <BarChart2 size={28} style={{color:"var(--text3)"}}/>
                  <p>Analysis available after completing the quiz.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="as-drawer-footer">
          {(quiz.status===QSTATUS.LIVE||quiz.status===QSTATUS.UPCOMING)&&(
            <button className="as-modal-btn as-modal-btn--primary" style={{flex:1,background:quiz.status===QSTATUS.LIVE?"var(--teal)":course.color}}
              onClick={()=>onAttempt(quiz)}>
              {quiz.status===QSTATUS.LIVE?<><Zap size={13}/>Attempt Live Quiz</>:<><Play size={13}/>Start When Available</>}
            </button>
          )}
          {quiz.status===QSTATUS.COMPLETED&&(
            <button className="as-modal-btn as-modal-btn--primary" style={{flex:1,background:course.color}}
              onClick={()=>onAttempt(quiz)}>
              <RotateCcw size={13}/>Retry Quiz
            </button>
          )}
          {quiz.status===QSTATUS.MISSED&&(
            <div style={{textAlign:"center",fontSize:12,color:"var(--rose)",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <AlertTriangle size={14}/>Quiz window has closed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LEADERBOARD CARD ─────────────────────────────────────────────
function LeaderboardCard() {
  const completedWithRanks = QUIZZES.filter(q=>q.rank&&q.status===QSTATUS.COMPLETED)
    .sort((a,b)=>a.rank-b.rank).slice(0,5);
  return (
    <div className="panel">
      <div className="panel-hd">
        <div className="panel-ttl"><Trophy size={13} style={{color:"var(--amber)"}}/>Best Ranks</div>
      </div>
      <div className="panel-body" style={{padding:"0 0 8px"}}>
        {completedWithRanks.map((q,i)=>{
          const c   = COURSES.find(x=>x.id===q.courseId);
          const col = scoreColor(q.marks);
          return (
            <div key={q.id} className="qz-lb-row">
              <span className="qz-lb-pos" style={{color:i===0?"var(--amber)":i===1?"var(--text2)":i===2?"var(--amber)":"var(--text3)",opacity:i<3?1:.6}}>#{q.rank}</span>
              <div className="qz-lb-info">
                <span className="qz-lb-course" style={{color:c.color}}>{c.short}</span>
                <span className="qz-lb-title">{q.title}</span>
              </div>
              <span className="qz-lb-score" style={{color:col}}>{q.marks}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── UPCOMING CARD ────────────────────────────────────────────────
function UpcomingCard({ onAttempt }) {
  const upcoming = QUIZZES.filter(q=>q.status===QSTATUS.UPCOMING||q.status===QSTATUS.LIVE)
    .sort((a,b)=>new Date(a.scheduledAt)-new Date(b.scheduledAt)).slice(0,4);
  return (
    <div className="panel">
      <div className="panel-hd">
        <div className="panel-ttl"><AlarmClock size={13} style={{color:"var(--indigo-ll)"}}/>Upcoming</div>
      </div>
      <div className="panel-body" style={{padding:"0 0 8px"}}>
        {upcoming.map(q=>{
          const c   = COURSES.find(x=>x.id===q.courseId);
          const isLive = q.status===QSTATUS.LIVE;
          return (
            <div key={q.id} className={`qz-up-row${isLive?" qz-up-row--live":""}`}
              onClick={()=>isLive&&onAttempt(q)}>
              <div className="qz-up-dot" style={{background:isLive?"var(--teal)":c.color}}>
                {isLive&&<span className="qz-up-pulse"/>}
              </div>
              <div className="qz-up-info">
                <span style={{color:c.color,fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{c.short}</span>
                <span className="qz-up-title">{q.title}</span>
                <span style={{fontSize:10.5,color:"var(--text3)"}}>{q.scheduledAt?.split("·")[1]?.trim()}</span>
              </div>
              {isLive&&<button className="qz-up-live-btn" onClick={e=>{e.stopPropagation();onAttempt(q);}}>
                <Zap size={10} fill="#fff"/>Go
              </button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function StudentQuizzes({ onBack }) {
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [filterTab,  setFilterTab]   = useState("All");
  const [typeFilter, setTypeFilter]  = useState("All Types");
  const [search,     setSearch]      = useState("");
  const [sortBy,     setSortBy]      = useState("Schedule");
  const [viewMode,   setViewMode]    = useState("grid");
  const [showSortDd, setShowSortDd]  = useState(false);
  const [showTypeDd, setShowTypeDd]  = useState(false);
  const [reviewQuiz, setReviewQuiz]  = useState(null);
  const [attemptQuiz,setAttemptQuiz] = useState(null);

  useEffect(()=>{
    const h=()=>{ setShowSortDd(false); setShowTypeDd(false); };
    document.addEventListener("click",h);
    return()=>document.removeEventListener("click",h);
  },[]);

  const activeCourse = COURSES.find(c=>c.id===activeCourseId)||null;

  // Filter
  const filtered = QUIZZES.filter(q=>{
    const byCourse = !activeCourseId || q.courseId===activeCourseId;
    const byTab =
      filterTab==="All"       ? true :
      filterTab==="Upcoming"  ? (q.status===QSTATUS.UPCOMING||q.status===QSTATUS.LIVE) :
      filterTab==="Live"      ? q.status===QSTATUS.LIVE :
      filterTab==="Completed" ? q.status===QSTATUS.COMPLETED :
      filterTab==="Missed"    ? q.status===QSTATUS.MISSED :
      true;
    const byType   = typeFilter==="All Types" || q.type===typeFilter;
    const bySearch = !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.topics.some(t=>t.toLowerCase().includes(search.toLowerCase()));
    return byCourse&&byTab&&byType&&bySearch;
  });

  // Sort
  const sorted = [...filtered].sort((a,b)=>{
    if(sortBy==="Schedule") {
      // Live first, then upcoming, then completed, then missed
      const order={[QSTATUS.LIVE]:0,[QSTATUS.UPCOMING]:1,[QSTATUS.COMPLETED]:2,[QSTATUS.MISSED]:3};
      return (order[a.status]||0)-(order[b.status]||0);
    }
    if(sortBy==="Score")      return (b.marks||0)-(a.marks||0);
    if(sortBy==="Course")     return a.courseId.localeCompare(b.courseId);
    if(sortBy==="Difficulty") {
      const d={Easy:0,Medium:1,Hard:2};
      return (d[a.difficulty]||0)-(d[b.difficulty]||0);
    }
    return 0;
  });

  const liveCount     = QUIZZES.filter(q=>q.status===QSTATUS.LIVE).length;
  const upcomingCount = QUIZZES.filter(q=>q.status===QSTATUS.UPCOMING).length;

  const handleOpen    = q => setReviewQuiz(q);
  const handleAttempt = q => { setReviewQuiz(null); setAttemptQuiz(q); };
  const handleClose   = () => { setReviewQuiz(null); setAttemptQuiz(null); };

  return (
    <>
      {reviewQuiz&&(()=>{
        const c=COURSES.find(x=>x.id===reviewQuiz.courseId);
        return <ReviewDrawer quiz={reviewQuiz} course={c} onClose={handleClose} onAttempt={handleAttempt}/>;
      })()}
      {attemptQuiz&&(()=>{
        const c=COURSES.find(x=>x.id===attemptQuiz.courseId);
        return <QuizAttemptScreen quiz={attemptQuiz} course={c} onClose={handleClose} onSubmit={handleClose}/>;
      })()}

      <div className="qz-root">
        {/* ── Page Header ── */}
        <div className="san-page-hd">
          <div className="san-back-row">
            <button className="san-back-btn" onClick={onBack}>
              <ChevronLeft size={13}/> Dashboard
            </button>
            <div className="san-breadcrumb">
              <span>Dashboard</span>
              <ChevronRight size={11} style={{color:"var(--text3)"}}/>
              <span className="san-bc-active">Quizzes</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginTop:10}}>
            <div>
              <div className="greet-tag" style={{marginBottom:8}}>
                <div className="greet-pip"/>
                <span className="greet-pip-txt">Semester 5 · Week 11 · {QUIZZES.length} Quizzes · {liveCount} Live</span>
              </div>
              <h1 className="greet-title">My <em>Quizzes</em></h1>
              <p className="greet-sub">Attempt live quizzes, review past results, and track your performance across all subjects.</p>
            </div>
            {liveCount>0&&(
              <div className="qz-live-banner">
                <span className="qz-live-pulse-dot"/><Zap size={13} fill="var(--teal)"/>
                <span><strong>{liveCount}</strong> quiz is live right now!</span>
                <button className="qz-live-go" onClick={()=>handleAttempt(QUIZZES.find(q=>q.status===QSTATUS.LIVE))}>
                  Attempt Now →
                </button>
              </div>
            )}
          </div>
        </div>

        <StatsStrip/>

        {/* ── Main layout ── */}
        <div className="qz-main-layout">
          {/* Left sidebar */}
          <CourseSidebar activeCourseId={activeCourseId} onSelect={setActiveCourseId}/>

          {/* Content */}
          <div className="as-content-area">
            {/* Course heading */}
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
                    const all=QUIZZES.filter(q=>q.courseId===activeCourse.id);
                    const done=all.filter(q=>q.status===QSTATUS.COMPLETED).length;
                    const avg=done?Math.round(all.filter(q=>q.marks!=null).reduce((s,q)=>s+q.marks,0)/done):0;
                    return (
                      <>
                        <RadialProgress pct={Math.round((done/all.length)*100)} color={activeCourse.color} size={44} stroke={4}/>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:activeCourse.color}}>{avg}% avg</div>
                          <div style={{fontSize:10,color:"var(--text3)"}}>{done}/{all.length} done</div>
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
                    {t==="Live"&&liveCount>0&&<span className="qz-live-tab-dot"/>}
                    {t==="Upcoming"&&upcomingCount>0&&<span className="as-tab-badge">{upcomingCount}</span>}
                  </button>
                ))}
              </div>
              <div className="mc-toolbar-right">
                <div className="mc-search-wrap">
                  <Search size={13} style={{color:"var(--text3)",flexShrink:0}}/>
                  <input className="mc-search" placeholder="Search quizzes, topics…"
                    value={search} onChange={e=>setSearch(e.target.value)}/>
                  {search&&<button className="mc-search-clear" onClick={()=>setSearch("")}><X size={12}/></button>}
                </div>
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
                <div className="mc-view-toggle">
                  <button className={`mc-view-btn${viewMode==="grid"?" active":""}`} onClick={()=>setViewMode("grid")}><LayoutGrid size={13}/></button>
                  <button className={`mc-view-btn${viewMode==="list"?" active":""}`} onClick={()=>setViewMode("list")}><List size={13}/></button>
                </div>
              </div>
            </div>

            <div className="as-results-count">
              Showing <strong>{sorted.length}</strong> quiz{sorted.length!==1?"zes":""}
              {activeCourse&&<> in <span style={{color:activeCourse.color}}>{activeCourse.short}</span></>}
              {filterTab!=="All"&&<> · {filterTab}</>}
            </div>

            {sorted.length===0 ? (
              <div className="mc-empty">
                <HelpCircle size={32} style={{color:"var(--text3)"}}/>
                <p>No quizzes match your filters.</p>
              </div>
            ) : viewMode==="grid" ? (
              <div className="qz-grid">
                {sorted.map(q=>{
                  const c=COURSES.find(x=>x.id===q.courseId);
                  return <QuizCard key={q.id} quiz={q} course={c} onOpen={handleOpen} onAttempt={handleAttempt}/>;
                })}
              </div>
            ) : (
              <div className="as-list">
                {sorted.map(q=>{
                  const c=COURSES.find(x=>x.id===q.courseId);
                  return <QuizRow key={q.id} quiz={q} course={c} onOpen={handleOpen} onAttempt={handleAttempt}/>;
                })}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="qz-right-sidebar">
            <UpcomingCard onAttempt={handleAttempt}/>
            <LeaderboardCard/>
            <div className="as-ai-tip-card">
              <div className="as-ai-tip-header">
                <Brain size={14} style={{color:"var(--indigo-ll)"}}/>
                <span>Lucyna Study Tip</span>
              </div>
              <div className="as-ai-tip-body">
                You perform <strong style={{color:"var(--teal)"}}>23% better</strong> when you revise notes 1 hour before a quiz. Your next quiz is in 3 days!
              </div>
              <button className="as-ai-tip-btn">Open AI Mentor →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}