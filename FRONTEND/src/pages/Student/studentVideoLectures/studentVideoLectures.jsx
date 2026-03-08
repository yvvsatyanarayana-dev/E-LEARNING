// StudentVideoLectures.jsx
// Video Lectures module — integrated into StudentDashboard.jsx
// Inherits CSS variables from StudentDashboard.css + StudentMyCourses.css

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, PlayCircle, Play, Pause,
  Volume2, VolumeX, Maximize2, BookOpen, Clock, Search,
  X, Bot, Star, Lock, CheckCircle2, Download, BookMarked,
  ThumbsUp, MessageSquare, SkipForward, SkipBack, Settings,
  Subtitles, ChevronDown, Layers, Activity, Filter,
  LayoutGrid, List, Eye, Award
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────
const COURSES = [
  { id:"os",     code:"CS501", name:"Operating Systems",                short:"OS",     faculty:"Dr. R. Sharma",  color:"var(--indigo-l)", colorRgb:"91,78,248",   totalLectures:42, watchedLectures:30 },
  { id:"dbms",   code:"CS502", name:"Database Management Systems",      short:"DBMS",   faculty:"Prof. A. Verma", color:"var(--teal)",     colorRgb:"20,184,166",  totalLectures:36, watchedLectures:21 },
  { id:"ml",     code:"CS503", name:"Machine Learning",                 short:"ML",     faculty:"Dr. P. Nair",    color:"var(--amber)",    colorRgb:"245,158,11",  totalLectures:30, watchedLectures:13 },
  { id:"cn",     code:"CS504", name:"Computer Networks",                short:"CN",     faculty:"Prof. K. Rao",   color:"var(--violet)",   colorRgb:"139,92,246",  totalLectures:38, watchedLectures:31 },
  { id:"crypto", code:"CS505", name:"Cryptography & Network Security",  short:"Crypto", faculty:"Dr. S. Mehta",   color:"var(--rose)",     colorRgb:"244,63,94",   totalLectures:28, watchedLectures:9  },
];

const LECTURES_BY_COURSE = {
  os: [
    { id:"os-1",  unit:1, unitName:"Process Management",   title:"Introduction to Operating Systems",       duration:"38:24", views:1240, likes:98,  watched:true,  watchPct:100, date:"Week 1", thumb:"indigo", description:"Covers OS history, types of OS, kernel architecture, and system calls overview.",                                tags:["Intro","Kernel"]                },
    { id:"os-2",  unit:1, unitName:"Process Management",   title:"Process Lifecycle & PCB",                 duration:"52:10", views:1180, likes:112, watched:true,  watchPct:100, date:"Week 2", thumb:"indigo", description:"Deep dive into process states, Process Control Block structure, context switching.",                            tags:["PCB","Context Switch"]          },
    { id:"os-3",  unit:1, unitName:"Process Management",   title:"CPU Scheduling Algorithms",               duration:"44:55", views:1320, likes:145, watched:true,  watchPct:100, date:"Week 3", thumb:"indigo", description:"FCFS, SJF, Round Robin, Priority Scheduling with Gantt chart examples.",                                      tags:["FCFS","Round Robin"], featured:true },
    { id:"os-4",  unit:2, unitName:"Memory Management",    title:"Memory Management — Paging",              duration:"48:30", views:1100, likes:87,  watched:true,  watchPct:100, date:"Week 4", thumb:"indigo", description:"Virtual memory, paging, page tables, TLB, and address translation.",                                          tags:["Paging","TLB"]                 },
    { id:"os-5",  unit:2, unitName:"Memory Management",    title:"Virtual Memory & Page Replacement",       duration:"41:20", views:980,  likes:76,  watched:true,  watchPct:100, date:"Week 5", thumb:"indigo", description:"Demand paging, page faults, FIFO, LRU, Optimal page replacement algorithms.",                                 tags:["LRU","FIFO"]                   },
    { id:"os-6",  unit:3, unitName:"Synchronization",      title:"Process Synchronization & Semaphores",    duration:"55:00", views:920,  likes:68,  watched:true,  watchPct:100, date:"Week 6", thumb:"indigo", description:"Critical section, mutex, semaphores, Peterson's solution, monitors.",                                          tags:["Semaphore","Mutex"]            },
    { id:"os-7",  unit:3, unitName:"Synchronization",      title:"Deadlocks — Detection & Recovery",        duration:"49:15", views:870,  likes:59,  watched:false, watchPct:62,  date:"Week 7", thumb:"indigo", description:"Deadlock conditions, resource allocation graphs, Banker's algorithm.",                                         tags:["Deadlock","Banker's"], isNext:true },
    { id:"os-8",  unit:4, unitName:"I/O Systems",          title:"File System Internals",                   duration:"46:40", views:720,  likes:44,  watched:false, watchPct:0,   date:"Week 8", thumb:"indigo", description:"File system structure, inodes, FAT, NTFS, directory implementation.",                                         tags:["File System","Inodes"], locked:true },
    { id:"os-9",  unit:4, unitName:"I/O Systems",          title:"I/O Systems & Disk Scheduling",           duration:"40:55", views:680,  likes:38,  watched:false, watchPct:0,   date:"Week 9", thumb:"indigo", description:"I/O hardware, DMA, SSTF, SCAN, C-SCAN disk scheduling algorithms.",                                           tags:["DMA","Disk IO"], locked:true  },
  ],
  dbms: [
    { id:"dbms-1", unit:1, unitName:"Relational Model",    title:"Relational Model & SQL Basics",           duration:"45:00", views:1050, likes:91,  watched:true,  watchPct:100, date:"Week 1", thumb:"teal",   description:"Introduction to RDBMS, tables, keys, constraints, basic SQL queries.",                                          tags:["SQL","Keys"]                   },
    { id:"dbms-2", unit:1, unitName:"Relational Model",    title:"ER Diagrams & Schema Design",             duration:"38:30", views:980,  likes:78,  watched:true,  watchPct:100, date:"Week 2", thumb:"teal",   description:"Entity-Relationship modeling, weak entities, cardinality, schema mapping.",                                    tags:["ER Model","Schema"]            },
    { id:"dbms-3", unit:2, unitName:"Normalization",       title:"Normalization — 1NF to BCNF",             duration:"52:15", views:1200, likes:120, watched:true,  watchPct:100, date:"Week 3", thumb:"teal",   description:"Functional dependencies, 1NF, 2NF, 3NF, BCNF with worked examples.",                                          tags:["BCNF","FDs"], featured:true    },
    { id:"dbms-4", unit:3, unitName:"Transactions",        title:"Transactions & ACID Properties",          duration:"50:40", views:890,  likes:82,  watched:true,  watchPct:100, date:"Week 4", thumb:"teal",   description:"Transaction lifecycle, ACID, commit/rollback, concurrency control.",                                            tags:["ACID","Concurrency"]           },
    { id:"dbms-5", unit:3, unitName:"Transactions",        title:"Indexing & B+ Trees",                     duration:"48:10", views:740,  likes:55,  watched:false, watchPct:35,  date:"Week 5", thumb:"teal",   description:"Clustered vs non-clustered indexes, B-trees, B+ trees, hash indexing.",                                         tags:["B+ Tree","Index"], isNext:true  },
    { id:"dbms-6", unit:4, unitName:"Advanced",            title:"Query Optimization",                      duration:"55:30", views:620,  likes:48,  watched:false, watchPct:0,   date:"Week 6", thumb:"teal",   description:"Query execution plans, cost-based optimization, join algorithms.",                                              tags:["Query Plan","Joins"], locked:true },
    { id:"dbms-7", unit:4, unitName:"Advanced",            title:"NoSQL & MongoDB Fundamentals",            duration:"42:20", views:580,  likes:42,  watched:false, watchPct:0,   date:"Week 7", thumb:"teal",   description:"NoSQL types, document model, MongoDB CRUD, aggregation pipeline.",                                              tags:["NoSQL","MongoDB"], locked:true  },
  ],
  ml: [
    { id:"ml-1",  unit:1, unitName:"Foundations",          title:"Intro to ML & Statistics Review",         duration:"40:00", views:920,  likes:88,  watched:true,  watchPct:100, date:"Week 1", thumb:"amber",  description:"Types of ML, bias-variance tradeoff, probability review, NumPy basics.",                                       tags:["Probability","NumPy"]          },
    { id:"ml-2",  unit:1, unitName:"Foundations",          title:"Linear Regression Deep Dive",             duration:"55:00", views:860,  likes:79,  watched:true,  watchPct:100, date:"Week 2", thumb:"amber",  description:"OLS, gradient descent, cost function, regularization L1 and L2.",                                              tags:["Gradient Descent","OLS"]       },
    { id:"ml-3",  unit:2, unitName:"Classification",       title:"Logistic Regression & Decision Boundaries",duration:"48:30", views:780, likes:65,  watched:true,  watchPct:100, date:"Week 3", thumb:"amber",  description:"Sigmoid, cross-entropy loss, multiclass, precision-recall, ROC curve.",                                        tags:["Sigmoid","ROC"]                },
    { id:"ml-4",  unit:2, unitName:"Classification",       title:"Support Vector Machines & Kernels",       duration:"52:10", views:670,  likes:52,  watched:false, watchPct:20,  date:"Week 4", thumb:"amber",  description:"Maximal margin classifier, soft margin, RBF kernel, kernel trick.",                                            tags:["SVM","Kernel"], isNext:true    },
    { id:"ml-5",  unit:3, unitName:"Tree Methods",         title:"Decision Trees & Random Forests",         duration:"58:00", views:590,  likes:41,  watched:false, watchPct:0,   date:"Week 5", thumb:"amber",  description:"Gini impurity, entropy, pruning, bagging, feature importance.",                                               tags:["CART","Bagging"], locked:true  },
    { id:"ml-6",  unit:3, unitName:"Tree Methods",         title:"Clustering — K-Means & DBSCAN",           duration:"50:45", views:520,  likes:35,  watched:false, watchPct:0,   date:"Week 6", thumb:"amber",  description:"Unsupervised learning, k-means convergence, DBSCAN density-based clustering.",                                 tags:["K-Means","DBSCAN"], locked:true },
  ],
  cn: [
    { id:"cn-1",  unit:1, unitName:"Network Fundamentals", title:"OSI & TCP/IP Models",                     duration:"42:00", views:1100, likes:95,  watched:true,  watchPct:100, date:"Week 1", thumb:"violet", description:"7-layer OSI model, TCP/IP layers, encapsulation, protocol data units.",                                        tags:["OSI","TCP/IP"]                 },
    { id:"cn-2",  unit:1, unitName:"Network Fundamentals", title:"Physical & Data Link Layer",              duration:"50:20", views:980,  likes:82,  watched:true,  watchPct:100, date:"Week 2", thumb:"violet", description:"Signals, encoding, CSMA/CD, MAC addresses, Ethernet, error detection.",                                       tags:["MAC","CSMA/CD"]                },
    { id:"cn-3",  unit:2, unitName:"Network Layer",        title:"Network Layer & IP Addressing",           duration:"55:00", views:920,  likes:78,  watched:true,  watchPct:100, date:"Week 3", thumb:"violet", description:"IPv4, IPv6, subnetting, CIDR, NAT, ARP, ICMP.",                                                               tags:["IPv4","Subnetting"], featured:true },
    { id:"cn-4",  unit:2, unitName:"Network Layer",        title:"Routing Algorithms — RIP, OSPF, BGP",     duration:"48:35", views:840,  likes:67,  watched:true,  watchPct:100, date:"Week 4", thumb:"violet", description:"Distance vector, link state routing, OSPF LSA, BGP path attributes.",                                        tags:["OSPF","BGP"]                   },
    { id:"cn-5",  unit:3, unitName:"Transport Layer",      title:"TCP — Connections, Flow & Congestion",    duration:"58:15", views:770,  likes:61,  watched:true,  watchPct:100, date:"Week 5", thumb:"violet", description:"3-way handshake, sliding window, congestion control, TCP vs UDP.",                                            tags:["TCP","Congestion"]             },
    { id:"cn-6",  unit:3, unitName:"Transport Layer",      title:"Application Layer Protocols",             duration:"44:50", views:710,  likes:54,  watched:true,  watchPct:100, date:"Week 6", thumb:"violet", description:"HTTP/HTTPS, DNS, DHCP, FTP, SMTP, REST vs WebSocket.",                                                        tags:["HTTP","DNS"]                   },
    { id:"cn-7",  unit:4, unitName:"Network Security",     title:"Network Security & Firewalls",            duration:"52:30", views:580,  likes:40,  watched:false, watchPct:0,   date:"Week 7", thumb:"violet", description:"TLS/SSL, firewalls, IDS/IPS, VPN, common attacks and mitigations.",                                           tags:["TLS","Firewall"], isNext:true  },
    { id:"cn-8",  unit:4, unitName:"Network Security",     title:"Wireless & Mobile Networking",            duration:"40:10", views:510,  likes:33,  watched:false, watchPct:0,   date:"Week 8", thumb:"violet", description:"IEEE 802.11, WPA3, cellular networks, 5G, mobile IP.",                                                        tags:["WiFi","5G"], locked:true       },
  ],
  crypto: [
    { id:"cr-1",  unit:1, unitName:"Classical Crypto",     title:"Introduction to Cryptography",            duration:"35:10", views:780,  likes:65,  watched:true,  watchPct:100, date:"Week 1", thumb:"rose",   description:"Goals of cryptography, historical context, threat model, basic definitions.",                                  tags:["History","Threat Model"]       },
    { id:"cr-2",  unit:1, unitName:"Classical Crypto",     title:"Classical Ciphers — Caesar to Vigenère",  duration:"40:30", views:720,  likes:58,  watched:true,  watchPct:100, date:"Week 2", thumb:"rose",   description:"Substitution, transposition, Vigenère cipher, frequency analysis attacks.",                                   tags:["Caesar","Vigenère"]            },
    { id:"cr-3",  unit:2, unitName:"Symmetric Crypto",     title:"DES & AES In Depth",                      duration:"55:20", views:650,  likes:48,  watched:false, watchPct:15,  date:"Week 3", thumb:"rose",   description:"Feistel network, DES rounds, AES SubBytes, ShiftRows, MixColumns.",                                           tags:["DES","AES"], isNext:true       },
    { id:"cr-4",  unit:2, unitName:"Symmetric Crypto",     title:"Block Cipher Modes of Operation",         duration:"44:00", views:540,  likes:37,  watched:false, watchPct:0,   date:"Week 4", thumb:"rose",   description:"ECB, CBC, CTR, GCM modes, IV management, padding oracle attacks.",                                            tags:["CBC","GCM"], locked:true       },
    { id:"cr-5",  unit:3, unitName:"Public Key Crypto",    title:"RSA — Key Generation & Attacks",          duration:"58:00", views:490,  likes:32,  watched:false, watchPct:0,   date:"Week 5", thumb:"rose",   description:"Euler's theorem, RSA keygen, OAEP padding, factoring attacks.",                                               tags:["RSA","OAEP"], locked:true      },
    { id:"cr-6",  unit:3, unitName:"Public Key Crypto",    title:"Elliptic Curve & Diffie-Hellman",         duration:"50:15", views:420,  likes:28,  watched:false, watchPct:0,   date:"Week 6", thumb:"rose",   description:"ECDH, ECDSA, curve25519, key exchange protocols, forward secrecy.",                                            tags:["ECC","ECDH"], locked:true      },
    { id:"cr-7",  unit:4, unitName:"Hash & PKI",           title:"Hash Functions & Digital Signatures",     duration:"46:40", views:380,  likes:24,  watched:false, watchPct:0,   date:"Week 7", thumb:"rose",   description:"SHA-256, SHA-3, HMAC, DSA, certificate chains, PKI trust model.",                                             tags:["SHA","PKI"], locked:true       },
  ],
};

const FEATURED_IDS = [
  { courseId:"os",    lectureId:"os-3"    },
  { courseId:"dbms",  lectureId:"dbms-3"  },
  { courseId:"cn",    lectureId:"cn-3"    },
];

const SORT_OPTIONS = ["Latest","Most Watched","Duration","Progress"];
const FILTER_TABS  = ["All","In Progress","Completed","Locked"];

// ─── HELPERS ──────────────────────────────────────────────────────
function AnimBar({ pct, color, height=4, delay=300 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t=setTimeout(()=>setW(pct),delay); return ()=>clearTimeout(t); }, [pct,delay]);
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

// ─── THUMBNAIL ────────────────────────────────────────────────────
const THUMB_COLORS = {
  indigo: { bg:"rgba(91,78,248,.18)",  accent:"var(--indigo-l)"  },
  teal:   { bg:"rgba(20,184,166,.18)", accent:"var(--teal)"      },
  amber:  { bg:"rgba(245,158,11,.18)", accent:"var(--amber)"     },
  violet: { bg:"rgba(139,92,246,.18)", accent:"var(--violet)"    },
  rose:   { bg:"rgba(244,63,94,.18)",  accent:"var(--rose)"      },
};

function LectureThumbnail({ lecture, course, size="normal" }) {
  const { bg, accent } = THUMB_COLORS[lecture.thumb] || THUMB_COLORS.indigo;
  const sm = size === "small";
  return (
    <div className={`vl-thumb${sm?" vl-thumb--sm":""}`} style={{background:bg,"--thumb-accent":accent}}>
      <div className="vl-thumb-pattern"/>
      <div className="vl-thumb-code">{course?.short||"?"}</div>
      {lecture.locked
        ? <div className="vl-thumb-lock"><Lock size={sm?14:18} style={{color:accent,opacity:.7}}/></div>
        : <div className="vl-thumb-play" style={{background:accent}}><Play size={sm?8:12} fill="#fff" color="#fff"/></div>
      }
      {lecture.watchPct>0 && lecture.watchPct<100 && (
        <div className="vl-thumb-progress">
          <div className="vl-thumb-prog-fill" style={{width:`${lecture.watchPct}%`,background:accent}}/>
        </div>
      )}
      {lecture.watched && <div className="vl-thumb-done"><CheckCircle2 size={12} color="#fff"/></div>}
      {lecture.featured && !lecture.locked && <div className="vl-thumb-featured" style={{background:accent}}><Star size={9} fill="#fff" color="#fff"/></div>}
    </div>
  );
}

// ─── LECTURE CARD ─────────────────────────────────────────────────
function LectureCard({ lecture, course, onPlay }) {
  const [hov,setHov]=useState(false);
  return (
    <div className={`vl-card${hov?" vl-card--hov":""}${lecture.locked?" vl-card--locked":""}`}
      style={{"--card-color":course.color,"--card-rgb":course.colorRgb}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>!lecture.locked&&onPlay(lecture,course)}>
      <LectureThumbnail lecture={lecture} course={course}/>
      <div className="vl-card-body">
        <div className="vl-card-meta-top">
          <span className="vl-card-unit" style={{color:course.color}}>Unit {lecture.unit} · {lecture.unitName}</span>
          <span className="vl-card-dur"><Clock size={10}/>{lecture.duration}</span>
        </div>
        <div className="vl-card-title">{lecture.title}</div>
        <div className="vl-card-desc">{lecture.description}</div>
        <div className="vl-card-tags">
          {lecture.tags.map(t=><span key={t} className="vl-tag">{t}</span>)}
        </div>
        <div className="vl-card-footer">
          <div className="vl-card-stats">
            <span><Eye size={10}/>{lecture.views}</span>
            <span><ThumbsUp size={10}/>{lecture.likes}</span>
          </div>
          {lecture.watched
            ? <span className="vl-badge vl-badge--done"><CheckCircle2 size={10}/>Done</span>
            : lecture.locked
            ? <span className="vl-badge vl-badge--locked"><Lock size={10}/>Locked</span>
            : lecture.isNext
            ? <span className="vl-badge vl-badge--next" style={{background:`rgba(${course.colorRgb},.15)`,color:course.color}}><Play size={10} fill={course.color}/>Continue</span>
            : <span className="vl-badge vl-badge--new">New</span>
          }
        </div>
        {lecture.watchPct>0&&lecture.watchPct<100&&(
          <div style={{marginTop:8}}>
            <AnimBar pct={lecture.watchPct} color={course.color} height={3} delay={400}/>
            <div style={{fontSize:10,color:"var(--text3)",marginTop:3}}>{lecture.watchPct}% watched</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LECTURE ROW ──────────────────────────────────────────────────
function LectureRow({ lecture, course, onPlay, index }) {
  return (
    <div className={`vl-row${lecture.locked?" vl-row--locked":""}`}
      style={{"--card-color":course.color,"--card-rgb":course.colorRgb}}
      onClick={()=>!lecture.locked&&onPlay(lecture,course)}>
      <div className="vl-row-num">
        {lecture.watched ? <CheckCircle2 size={16} style={{color:course.color}}/>
          : lecture.locked ? <Lock size={14} style={{color:"var(--text3)"}}/>
          : <span style={{color:lecture.isNext?course.color:"var(--text3)"}}>{index+1}</span>}
      </div>
      <LectureThumbnail lecture={lecture} course={course} size="small"/>
      <div className="vl-row-info">
        <div className="vl-row-unit" style={{color:course.color}}>Unit {lecture.unit} · {lecture.unitName}</div>
        <div className="vl-row-title">{lecture.title}</div>
        {lecture.watchPct>0&&lecture.watchPct<100&&(
          <div style={{marginTop:5,width:120}}>
            <AnimBar pct={lecture.watchPct} color={course.color} height={3} delay={300}/>
          </div>
        )}
      </div>
      <div className="vl-row-right">
        <span className="vl-row-dur"><Clock size={11}/>{lecture.duration}</span>
        <div className="vl-row-stats">
          <span><Eye size={10}/>{lecture.views}</span>
          <span><ThumbsUp size={10}/>{lecture.likes}</span>
        </div>
      </div>
      <button className="vl-row-btn"
        style={lecture.locked?{}:{background:`rgba(${course.colorRgb},.12)`,color:course.color}}>
        {lecture.locked?<Lock size={12}/>:lecture.watched?<><Play size={11}/>Rewatch</>:lecture.isNext?<><Play size={11}/>Continue</>:<><Play size={11}/>Watch</>}
      </button>
    </div>
  );
}

// ─── VIDEO PLAYER ─────────────────────────────────────────────────
function VideoPlayer({ lecture, course, onClose }) {
  const [playing,setPlaying]   = useState(false);
  const [muted,setMuted]       = useState(false);
  const [progress,setProgress] = useState(lecture.watchPct||0);
  const [showCC,setShowCC]     = useState(false);
  const iRef = useRef(null);

  useEffect(()=>{
    if(playing){ iRef.current=setInterval(()=>setProgress(p=>Math.min(p+0.4,100)),300); }
    else clearInterval(iRef.current);
    return ()=>clearInterval(iRef.current);
  },[playing]);

  const totalSec=(()=>{ const [m,s]=lecture.duration.split(":").map(Number); return m*60+s; })();
  const elapsed=Math.round((progress/100)*totalSec);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="vl-player-overlay" onClick={onClose}>
      <div className="vl-player-modal" onClick={e=>e.stopPropagation()}>
        {/* Screen */}
        <div className="vl-player-screen"
          style={{background:`linear-gradient(135deg,rgba(${course.colorRgb},.15) 0%,rgba(0,0,0,.96) 100%)`}}>
          <div className="vl-player-visual">
            <div className="vl-player-logo" style={{color:course.color}}>{course.short}</div>
            <div className="vl-player-title-overlay">{lecture.title}</div>
          </div>
          {showCC&&<div className="vl-player-cc">[Auto-generated subtitles] {lecture.description}</div>}
          <button className="vl-player-close-x" onClick={onClose}><X size={16}/></button>
          {!playing&&<div className="vl-player-center-play" onClick={()=>setPlaying(true)} style={{borderColor:course.color}}>
            <Play size={28} fill={course.color} color={course.color}/>
          </div>}
        </div>
        {/* Progress */}
        <div className="vl-player-prog-wrap">
          <div className="vl-player-prog-track"
            onClick={e=>{ const r=e.currentTarget.getBoundingClientRect(); setProgress(Math.round(((e.clientX-r.left)/r.width)*100)); }}>
            <div className="vl-player-prog-fill" style={{width:`${progress}%`,background:course.color}}/>
            <div className="vl-player-prog-thumb" style={{left:`${progress}%`,background:course.color}}/>
          </div>
          <div className="vl-player-time"><span>{fmt(elapsed)}</span><span>{lecture.duration}</span></div>
        </div>
        {/* Controls */}
        <div className="vl-player-controls">
          <div className="vl-player-controls-left">
            <button className="vl-ctrl-btn" onClick={()=>setProgress(p=>Math.max(p-5,0))}><SkipBack size={16}/></button>
            <button className="vl-ctrl-btn vl-ctrl-play" style={{background:course.color}} onClick={()=>setPlaying(p=>!p)}>
              {playing?<Pause size={18} fill="#fff"/>:<Play size={18} fill="#fff"/>}
            </button>
            <button className="vl-ctrl-btn" onClick={()=>setProgress(p=>Math.min(p+5,100))}><SkipForward size={16}/></button>
            <button className="vl-ctrl-btn" onClick={()=>setMuted(m=>!m)}>{muted?<VolumeX size={15}/>:<Volume2 size={15}/>}</button>
          </div>
          <div className="vl-player-info-center">
            <span className="vl-player-lec-title">{lecture.title}</span>
            <span className="vl-player-lec-course" style={{color:course.color}}>{course.short} · {course.faculty}</span>
          </div>
          <div className="vl-player-controls-right">
            <button className={`vl-ctrl-btn${showCC?" active":""}`} onClick={()=>setShowCC(c=>!c)}
              style={showCC?{color:course.color}:{}}><Subtitles size={15}/></button>
            <button className="vl-ctrl-btn"><Settings size={15}/></button>
            <button className="vl-ctrl-btn"><Maximize2 size={15}/></button>
            <button className="vl-ctrl-btn vl-ctrl-ai"
              style={{background:`rgba(${course.colorRgb},.15)`,color:course.color}}>
              <Bot size={14}/>Ask AI
            </button>
          </div>
        </div>
        {/* Info strip */}
        <div className="vl-player-bottom">
          <div className="vl-player-bottom-info">
            <div className="vl-player-bottom-title">{lecture.title}</div>
            <div className="vl-player-bottom-desc">{lecture.description}</div>
            <div className="vl-player-bottom-tags">
              {lecture.tags.map(t=>(
                <span key={t} className="vl-tag"
                  style={{background:`rgba(${course.colorRgb},.12)`,color:course.color}}>{t}</span>
              ))}
            </div>
          </div>
          <div className="vl-player-bottom-actions">
            <button className="vl-pb-btn"><ThumbsUp size={13}/>{lecture.likes} Likes</button>
            <button className="vl-pb-btn"><Download size={13}/>Notes</button>
            <button className="vl-pb-btn"><MessageSquare size={13}/>Discuss</button>
            <button className="vl-pb-btn"
              style={{background:`rgba(${course.colorRgb},.15)`,color:course.color,borderColor:`rgba(${course.colorRgb},.25)`}}>
              <Bot size={13}/>Ask AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COURSE SIDEBAR ───────────────────────────────────────────────
function CourseSidebar({ courses, lecturesByCourse, activeCourseId, onSelect }) {
  const allCount = Object.values(lecturesByCourse || {}).flat().length;
  return (
    <div className="vl-course-sidebar">
      <div className="vl-cs-title">Courses</div>
      <button className={`vl-cs-item${activeCourseId===null?" active":""}`} onClick={()=>onSelect(null)}>
        <div className="vl-cs-icon" style={{background:"rgba(91,78,248,.12)",border:"1px solid rgba(91,78,248,.2)"}}>
          <Layers size={14} style={{color:"var(--indigo-ll)"}}/>
        </div>
        <div className="vl-cs-info">
          <span className="vl-cs-name">All Courses</span>
          <span className="vl-cs-count">{allCount} lectures</span>
        </div>
      </button>
      {(courses || []).map(c=>{
        const lecs=lecturesByCourse[c.id]||[];
        const watched=lecs.filter(l=>l.watched).length;
        return (
          <button key={c.id}
            className={`vl-cs-item${activeCourseId===c.id?" active":""}`}
            style={{"--cs-color":c.color,"--cs-rgb":c.colorRgb}}
            onClick={()=>onSelect(c.id)}>
            <div className="vl-cs-icon"
              style={{background:`rgba(${c.colorRgb},.12)`,border:`1px solid rgba(${c.colorRgb},.2)`}}>
              <BookOpen size={14} style={{color:c.color}}/>
            </div>
            <div className="vl-cs-info">
              <span className="vl-cs-name">{c.short}</span>
              <span className="vl-cs-count">{watched}/{lecs.length} done</span>
            </div>
            <div className="vl-cs-radial">
              <RadialProgress pct={Math.round((watched/lecs.length)*100)} color={c.color} size={28} stroke={3}/>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── STATS STRIP ─────────────────────────────────────────────────
function StatsStrip({ lecturesByCourse }) {
  const all=Object.values(lecturesByCourse || {}).flat();
  const total=all.length, watched=all.filter(l=>l.watched).length, inProg=all.filter(l=>l.watchPct>0&&l.watchPct<100).length;
  const totalMin=all.filter(l=>l.watched).reduce((a,l)=>{const[m,s]=l.duration.split(":").map(Number);return a+m+s/60;},0);
  const hrs=Math.floor(totalMin/60), min=Math.round(totalMin%60);
  return (
    <div className="san-kpi-grid" style={{marginBottom:20}}>
      {[
        {cls:"sc-indigo",val:total,      lbl:"Total Lectures",  sub:"Across 5 courses",                       Icon:BookMarked   },
        {cls:"sc-teal",  val:watched,    lbl:"Completed",       sub:`${Math.round((watched/total)*100)}% done`,Icon:CheckCircle2 },
        {cls:"sc-amber", val:inProg,     lbl:"In Progress",     sub:"Partially watched",                      Icon:Activity     },
        {cls:"sc-violet",val:`${hrs}h ${min}m`,lbl:"Watch Time",sub:"Total this semester",                    Icon:Clock        },
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

// ─── FEATURED STRIP ───────────────────────────────────────────────
function FeaturedStrip({ courses, lecturesByCourse, onPlay }) {
  return (
    <div className="vl-featured-strip">
      <div className="panel-ttl" style={{marginBottom:12}}>
        <Star size={14} style={{color:"var(--amber)"}}/>
        Featured Lectures <span>Highly rated this week</span>
      </div>
      <div className="vl-featured-list">
        {FEATURED_IDS.map(({courseId,lectureId})=>{
          const course=(courses || []).find(c=>c.id===courseId);
          const lecture=(lecturesByCourse[courseId]||[]).find(l=>l.id===lectureId);
          if(!course||!lecture) return null;
          return (
            <div key={lectureId} className="vl-featured-card"
              style={{"--card-color":course.color,"--card-rgb":course.colorRgb}}
              onClick={()=>onPlay(lecture,course)}>
              <LectureThumbnail lecture={lecture} course={course} size="small"/>
              <div className="vl-fc-info">
                <span className="vl-fc-course" style={{color:course.color}}>{course.short}</span>
                <div className="vl-fc-title">{lecture.title}</div>
                <div className="vl-fc-meta"><Clock size={10}/>{lecture.duration}<Eye size={10}/>{lecture.views} views</div>
              </div>
              <button className="vl-fc-btn" style={{background:course.color}}><Play size={12} fill="#fff"/></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── UNIT GROUP ───────────────────────────────────────────────────
function UnitGroup({ unitNum, unitName, lectures, course, viewMode, onPlay }) {
  const [open,setOpen]=useState(true);
  const done=lectures.filter(l=>l.watched).length;
  return (
    <div className="vl-unit-group">
      <button className="vl-unit-header" onClick={()=>setOpen(o=>!o)}>
        <div className="vl-unit-left">
          <div className="vl-unit-num" style={{background:`rgba(${course?.colorRgb},.12)`,color:course?.color}}>{unitNum}</div>
          <div>
            <div className="vl-unit-name">{unitName}</div>
            <div className="vl-unit-sub">{done}/{lectures.length} completed</div>
          </div>
        </div>
        <div className="vl-unit-right">
          <div style={{width:80}}>
            <AnimBar pct={Math.round((done/lectures.length)*100)} color={course?.color||"var(--indigo-l)"} height={3} delay={400}/>
          </div>
          <ChevronDown size={14} style={{color:"var(--text3)",flexShrink:0,transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}/>
        </div>
      </button>
      {open&&(
        <div className={viewMode==="grid"?"vl-unit-grid":"vl-unit-list"}>
          {viewMode==="grid"
            ? lectures.map(l=><LectureCard key={l.id} lecture={l} course={course} onPlay={onPlay}/>)
            : lectures.map((l,i)=><LectureRow key={l.id} lecture={l} course={course} onPlay={onPlay} index={i}/>)
          }
        </div>
      )}
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────
export default function StudentVideoLectures({ onBack }) {
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [viewMode,  setViewMode]   = useState("grid");
  const [filterTab, setFilterTab]  = useState("All");
  const [search,    setSearch]     = useState("");
  const [sortBy,    setSortBy]     = useState("Latest");
  const [showSortDd,setShowSortDd] = useState(false);
  const [playingLecture, setPlayingLecture] = useState(null);
  const [playingCourse,  setPlayingCourse]  = useState(null);
  
  const [coursesState, setCoursesState]     = useState(COURSES);
  const [lecturesState, setLecturesState]   = useState(LECTURES_BY_COURSE);

  useEffect(() => {
    import("../../../utils/api").then(({ default: api }) => {
      Promise.all([
        api.get("/student/courses"),
        api.get("/student/lessons")
      ]).then(([coursesData, lessonsData]) => {
        const colors = ["var(--indigo-l)", "var(--teal)", "var(--amber)", "var(--violet)", "var(--rose)"];
        const rgbs = ["91,78,248", "20,184,166", "245,158,11", "139,92,246", "244,63,94"];
        
        const mappedCourses = coursesData.map((c, i) => ({
          id: "cs" + c.id, code: c.code, name: c.name, short: c.code.split(" ")[0] || c.code,
          faculty: c.faculty_name || "Faculty", color: colors[i % colors.length], colorRgb: rgbs[i % rgbs.length],
          totalLectures: c.total_lessons || 10, watchedLectures: Math.floor(c.progress || 0)
        }));
        setCoursesState(mappedCourses);

        const byCourse = {};
        mappedCourses.forEach(c => byCourse[c.id] = []);
        lessonsData.forEach(l => {
          const cid = "cs" + l.course_id;
          if (!byCourse[cid]) byCourse[cid] = [];
          byCourse[cid].push({
            id: "l" + l.id, unit: l.unit_number || 1, unitName: l.unit_name || "General",
            title: l.title, duration: l.duration ? `${l.duration}:00` : "40:00",
            views: parseInt(l.views || 0), likes: 0, watched: l.is_completed,
            watchPct: l.is_completed ? 100 : 0, date: l.created_at ? l.created_at.split("T")[0] : "TBD",
            thumb: ["indigo", "teal", "amber", "violet", "rose"][byCourse[cid].length % 5], 
            description: l.description, tags: ["Lecture"],
            locked: false, isNext: false
          });
        });
        setLecturesState(byCourse);
      }).catch(console.error);
    });
  }, []);

  const activeCourse = coursesState.find(c=>c.id===activeCourseId)||null;

  // Build flat lecture list with _course ref
  const lecturesFlat = activeCourseId
    ? (lecturesState[activeCourseId]||[]).map(l=>({...l,_course:activeCourse}))
    : Object.entries(lecturesState).flatMap(([cid,lecs])=>
        lecs.map(l=>({...l,_course:coursesState.find(c=>c.id===cid)}))
      );

  // Filter
  const filtered = lecturesFlat.filter(l=>{
    const ms = !search||l.title.toLowerCase().includes(search.toLowerCase())||l.tags.some(t=>t.toLowerCase().includes(search.toLowerCase()));
    const mt = filterTab==="All"?true:filterTab==="In Progress"?(l.watchPct>0&&l.watchPct<100):filterTab==="Completed"?l.watched:filterTab==="Locked"?l.locked:true;
    return ms&&mt;
  });

  // Sort
  const sorted=[...filtered].sort((a,b)=>{
    if(sortBy==="Most Watched") return b.views-a.views;
    if(sortBy==="Duration"){const ts=d=>{const[m,s]=d.split(":").map(Number);return m*60+s};return ts(b.duration)-ts(a.duration);}
    if(sortBy==="Progress") return b.watchPct-a.watchPct;
    return 0;
  });

  // Group by unit
  const byUnit=sorted.reduce((acc,l)=>{
    const key=`${l._course?.id}|||${l.unit}|||${l.unitName}`;
    if(!acc[key]) acc[key]={unit:l.unit,unitName:l.unitName,course:l._course,lectures:[]};
    acc[key].lectures.push(l);
    return acc;
  },{});
  const unitGroups=Object.values(byUnit).sort((a,b)=>{
    if(a.course?.id!==b.course?.id) return 0;
    return a.unit-b.unit;
  });

  useEffect(()=>{
    const h=()=>setShowSortDd(false);
    document.addEventListener("click",h);
    return ()=>document.removeEventListener("click",h);
  },[]);

  return (
    <>
      {playingLecture&&playingCourse&&(
        <VideoPlayer lecture={playingLecture} course={playingCourse} onClose={()=>{setPlayingLecture(null);setPlayingCourse(null);}}/>
      )}

      <div className="vl-root">
        {/* ── Page header ── */}
        <div className="san-page-hd">
          <div className="san-back-row">
            <button className="san-back-btn" onClick={onBack}>
              <ChevronLeft size={13}/> Dashboard
            </button>
            <div className="san-breadcrumb">
              <span>Dashboard</span>
              <ChevronRight size={11} style={{color:"var(--text3)"}}/>
              <span className="san-bc-active">Video Lectures</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginTop:10}}>
            <div>
              <div className="greet-tag" style={{marginBottom:8}}>
                <div className="greet-pip"/>
                <span className="greet-pip-txt">Semester 5 · Week 11 · {Object.values(lecturesState).flat().length} Lectures</span>
              </div>
              <h1 className="greet-title">Video <em>Lectures</em></h1>
              <p className="greet-sub">Watch faculty recordings, track your progress, and ask Lucyna AI for help on any topic.</p>
            </div>
          </div>
        </div>

        <StatsStrip lecturesByCourse={lecturesState}/>

        {/* Featured */}
        {!activeCourseId&&filterTab==="All"&&!search&&(
          <div className="panel" style={{marginBottom:20}}>
            <div className="panel-body"><FeaturedStrip courses={coursesState} lecturesByCourse={lecturesState} onPlay={(l,c)=>{setPlayingLecture(l);setPlayingCourse(c);}}/></div>
          </div>
        )}

        {/* Main layout */}
        <div className="vl-main-layout">
          <CourseSidebar courses={coursesState} lecturesByCourse={lecturesState} activeCourseId={activeCourseId} onSelect={setActiveCourseId}/>

          <div className="vl-content-area">
            {/* Toolbar */}
            <div className="mc-toolbar">
              <div className="mc-filter-tabs">
                {FILTER_TABS.map(t=>(
                  <button key={t} className={`mc-filter-tab${filterTab===t?" active":""}`}
                    onClick={()=>setFilterTab(t)}>{t}</button>
                ))}
              </div>
              <div className="mc-toolbar-right">
                <div className="mc-search-wrap">
                  <Search size={13} style={{color:"var(--text3)",flexShrink:0}}/>
                  <input className="mc-search" placeholder="Search lectures, topics…"
                    value={search} onChange={e=>setSearch(e.target.value)}/>
                  {search&&<button className="mc-search-clear" onClick={()=>setSearch("")}><X size={12}/></button>}
                </div>
                {/* Sort */}
                <div className="vl-sort-wrap" onClick={e=>e.stopPropagation()}>
                  <button className="vl-sort-btn" onClick={()=>setShowSortDd(d=>!d)}>
                    <Filter size={12}/>{sortBy}
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

            {/* Course header (when filtered) */}
            {activeCourse&&(
              <div className="vl-course-heading"
                style={{"--card-color":activeCourse.color,"--card-rgb":activeCourse.colorRgb}}>
                <div className="vl-ch-left">
                  <div className="vl-ch-short" style={{color:activeCourse.color}}>{activeCourse.short}</div>
                  <div>
                    <div className="vl-ch-name">{activeCourse.name}</div>
                    <div className="vl-ch-faculty">{activeCourse.faculty} · {activeCourse.code}</div>
                  </div>
                </div>
                <div className="vl-ch-progress">
                  <RadialProgress pct={Math.round((activeCourse.watchedLectures/activeCourse.totalLectures)*100)} color={activeCourse.color} size={44} stroke={4}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:activeCourse.color}}>
                      {Math.round((activeCourse.watchedLectures/activeCourse.totalLectures)*100)}%
                    </div>
                    <div style={{fontSize:10,color:"var(--text3)"}}>{activeCourse.watchedLectures}/{activeCourse.totalLectures} done</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lecture list */}
            {unitGroups.length===0
              ? <div className="mc-empty"><PlayCircle size={32} style={{color:"var(--text3)"}}/><p>No lectures match your filter.</p></div>
              : <div className="vl-units">
                  {!activeCourseId
                    ? (()=>{
                        let lastCid=null;
                        return unitGroups.map(g=>{
                          const cid=g.course?.id;
                          const showHeader=cid!==lastCid;
                          lastCid=cid;
                          return (
                            <div key={`${cid}-${g.unit}-${g.unitName}`}>
                              {showHeader&&(
                                <div className="vl-all-course-header"
                                  style={{"--card-color":g.course?.color,"--card-rgb":g.course?.colorRgb}}>
                                  <BookOpen size={14} style={{color:g.course?.color}}/>
                                  <span style={{color:g.course?.color,fontWeight:700}}>{g.course?.short}</span>
                                  <span>{g.course?.name}</span>
                                  <span className="vl-ach-badge">
                                    {(lecturesState[cid]||[]).filter(l=>l.watched).length}/
                                    {(lecturesState[cid]||[]).length} done
                                  </span>
                                </div>
                              )}
                              <UnitGroup unitNum={g.unit} unitName={g.unitName}
                                lectures={g.lectures} course={g.course}
                                viewMode={viewMode} onPlay={(l,c)=>{setPlayingLecture(l);setPlayingCourse(c);}}/>
                            </div>
                          );
                        });
                      })()
                    : unitGroups.map(g=>(
                        <UnitGroup key={`${g.unit}-${g.unitName}`}
                          unitNum={g.unit} unitName={g.unitName}
                          lectures={g.lectures} course={g.course}
                          viewMode={viewMode} onPlay={(l,c)=>{setPlayingLecture(l);setPlayingCourse(c);}}/>
                      )
                    )
                  }
                </div>
            }
          </div>
        </div>
      </div>
    </>
  );
}