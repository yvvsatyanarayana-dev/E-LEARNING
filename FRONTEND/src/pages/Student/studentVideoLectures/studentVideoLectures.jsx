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
const COURSES = [];
const LECTURES_BY_COURSE = {};
const FEATURED_IDS = [];

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
function LectureCard({ lecture, course = {}, onPlay }) {
  // provide safe defaults for missing course information
  const [hov,setHov]=useState(false);
  const col = course?.color || "var(--indigo-l)";
  const rgb = course?.colorRgb || "91,78,248";
  return (
    <div className={`vl-card${hov?" vl-card--hov":""}${lecture.locked?" vl-card--locked":""}`}
      style={{"--card-color":col,"--card-rgb":rgb}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>!lecture.locked&&onPlay(lecture,course)}>
      <LectureThumbnail lecture={lecture} course={course}/>
      <div className="vl-card-body">
        <div className="vl-card-meta-top">
          <span className="vl-card-unit" style={{color:col}}>Unit {lecture.unit} · {lecture.unitName}</span>
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
            ? <span className="vl-badge vl-badge--next" style={{background:`rgba(${rgb},.15)`,color:col}}><Play size={10} fill={col}/>Continue</span>
            : <span className="vl-badge vl-badge--new">New</span>
          }
        </div>
        {lecture.watchPct>0&&lecture.watchPct<100&&(
          <div style={{marginTop:8}}>
            <AnimBar pct={lecture.watchPct} color={col} height={3} delay={400}/>
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
          id: "cs" + c.id, code: c.code, name: c.name, short: (c.code || "").split(" ")[0] || c.code || "Course",
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
            watchPct: l.is_completed ? 100 : 0, date: l.created_at ? (l.created_at.split("T")[0]) : "TBD",
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
  // build a flat list of lectures, always attaching a valid course object; drop any orphaned entries
  const lecturesFlat = activeCourseId
    ? (lecturesState[activeCourseId]||[])
        .map(l=>({...l,_course:activeCourse}))
        .filter(l=>l._course)
    : Object.entries(lecturesState).flatMap(([cid,lecs])=>
        lecs
          .map(l=>{
            const courseObj = coursesState.find(c=>c.id===cid) || null;
            return {...l,_course:courseObj};
          })
          .filter(l=>l._course)
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
    const courseObj = l._course || {};
    const key=`${courseObj.id||""}|||${l.unit}|||${l.unitName}`;
    if(!acc[key]) acc[key]={unit:l.unit,unitName:l.unitName,course:courseObj,lectures:[]};
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