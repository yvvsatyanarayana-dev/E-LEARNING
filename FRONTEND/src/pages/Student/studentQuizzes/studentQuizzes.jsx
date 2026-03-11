// studentQuizzes.jsx
// Quizzes module — rendered inside StudentDashboard
// Inherits CSS variables from StudentDashboard.css + StudentMyCourses.css + StudentAssignments.css

import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../../utils/api";
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

// ─── QUIZ STATUS & TYPE ───────────────────────────────────────────
const QSTATUS = { UPCOMING:"upcoming", LIVE:"live", COMPLETED:"completed", MISSED:"missed" };
const QTYPE   = { MCQ:"MCQ", CODING:"Coding", DESCRIPTIVE:"Descriptive", MIXED:"Mixed" };

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

const DIFF_FALLBACK   = { color:"var(--text3)",    bg:"rgba(120,120,120,.1)" };
const STATUS_FALLBACK = { label:"Unknown", color:"var(--text3)", bg:"rgba(120,120,120,.1)", Icon: Calendar };
const TYPE_FALLBACK   = { color:"var(--indigo-ll)", bg:"rgba(91,78,248,.1)" };

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
function StatsStrip({ quizzes = [] }) {
  const total     = quizzes.length;
  const completed = quizzes.filter(q=>q.status===QSTATUS.COMPLETED).length;
  const upcoming  = quizzes.filter(q=>q.status===QSTATUS.UPCOMING).length;
  const live      = quizzes.filter(q=>q.status===QSTATUS.LIVE).length;
  const missed    = quizzes.filter(q=>q.status===QSTATUS.MISSED).length;
  const gradedArr = quizzes.filter(q=>q.marks!=null&&q.status===QSTATUS.COMPLETED);
  const avgScore  = gradedArr.length ? Math.round(gradedArr.reduce((s,q)=>s+q.marks,0)/gradedArr.length) : 0;
  const ranks     = quizzes.filter(q=>q.rank).map(q=>q.rank);
  const bestRank  = ranks.length ? Math.min(...ranks) : "—";

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
function CourseSidebar({ activeCourseId, onSelect, courses = [], quizzes = [] }) {
  return (
    <div className="vl-course-sidebar">
      <div className="vl-cs-title">Courses</div>
      <button className={`vl-cs-item${activeCourseId===null?" active":""}`} onClick={()=>onSelect(null)}>
        <div className="vl-cs-icon" style={{background:"rgba(91,78,248,.12)",border:"1px solid rgba(91,78,248,.2)"}}>
          <Layers size={14} style={{color:"var(--indigo-ll)"}}/>
        </div>
        <div className="vl-cs-info">
          <span className="vl-cs-name">All Courses</span>
          <span className="vl-cs-count">{quizzes.length} quizzes</span>
        </div>
      </button>
      {courses.map(c=>{
        const cqs      = quizzes.filter(q=>q.courseId===c.id);
        const live     = cqs.filter(q=>q.status===QSTATUS.LIVE).length;
        const upcoming = cqs.filter(q=>q.status===QSTATUS.UPCOMING).length;
        const badge    = live>0?live:upcoming>0?upcoming:0;
        const badgeBg  = live>0?`rgba(20,184,166,.15)`:`rgba(${c.rgb||'91,78,248'},.15)`;
        const badgeCol = live>0?`var(--teal)`:(c.color||'var(--indigo-ll)');
        return (
          <button key={c.id}
            className={`vl-cs-item${activeCourseId===c.id?" active":""}`}
            style={{"--cs-color":c.color||'var(--indigo-ll)',"--cs-rgb":c.rgb||'91,78,248'}}
            onClick={()=>onSelect(c.id)}>
            <div className="vl-cs-icon" style={{background:`rgba(${c.rgb||'91,78,248'},.12)`,border:`1px solid rgba(${c.rgb||'91,78,248'},.2)`}}>
              <BookOpen size={14} style={{color:c.color||'var(--indigo-ll)'}}/>
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
  const sc  = STATUS_CFG[quiz.status] || STATUS_FALLBACK;
  const tc  = TYPE_CFG[quiz.type]     || TYPE_FALLBACK;
  const dc  = DIFF_CFG[quiz.difficulty] || DIFF_FALLBACK;
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
  const sc = STATUS_CFG[quiz.status] || STATUS_FALLBACK;
  const tc = TYPE_CFG[quiz.type]     || TYPE_FALLBACK;
  const dc = DIFF_CFG[quiz.difficulty] || DIFF_FALLBACK;
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
function QuizAttemptScreen({ quiz, course, onClose, onSubmit, practiceQuestions = [] }) {
  const questions = quiz.id==="q12" ? practiceQuestions : quiz.questions.length > 0 ? quiz.questions : practiceQuestions.slice(0,quiz.totalQuestions||10);
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
function ReviewDrawer({ quiz, course, onClose, onAttempt, practiceQuestions = [] }) {
  const [tab, setTab] = useState("overview"); // overview | questions | analysis
  const sc = STATUS_CFG[quiz.status];
  const tc = TYPE_CFG[quiz.type];
  const ScIcon = sc.Icon;
  const pct  = quiz.marks;
  const col  = pct!=null ? scoreColor(pct) : course.color;
  const qs   = quiz.questions.length>0 ? quiz.questions : (quiz.id==="q12"?practiceQuestions:[]);

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
function LeaderboardCard({ courses = [], quizzes = [] }) {
  const completedWithRanks = quizzes.filter(q=>q.rank&&q.status===QSTATUS.COMPLETED)
    .sort((a,b)=>a.rank-b.rank).slice(0,5);
  return (
    <div className="panel">
      <div className="panel-hd">
        <div className="panel-ttl"><Trophy size={13} style={{color:"var(--amber)"}}/>Best Ranks</div>
      </div>
      <div className="panel-body" style={{padding:"0 0 8px"}}>
        {completedWithRanks.map((q,i)=>{
          const c   = courses.find(x=>x.id===q.courseId) || { color: "var(--text2)", short: "???" };
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
function UpcomingCard({ quizzes = [], courses = [], onAttempt }) {
  const upcoming = (quizzes || []).filter(q=>q.status===QSTATUS.UPCOMING||q.status===QSTATUS.LIVE)
    .sort((a,b)=>new Date(a.scheduledAt)-new Date(b.scheduledAt)).slice(0,4);
  return (
    <div className="panel">
      <div className="panel-hd">
        <div className="panel-ttl"><AlarmClock size={13} style={{color:"var(--indigo-ll)"}}/>Upcoming</div>
      </div>
      <div className="panel-body" style={{padding:"0 0 8px"}}>
        {upcoming.map(q=>{
          const c   = courses.find(x=>x.id===q.courseId) || { color: "var(--text2)", short: "???" };
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


export default function StudentQuizzes({ onBack }) {
  const [coursesState, setCoursesState] = useState([]);
  const [quizzesState, setQuizzesState] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, qData] = await Promise.all([
          api.get("/student/courses").catch(() => []),
          api.get("/student/quizzes?include_questions=true").catch(() => [])
        ]);

        const mappedCourses = (cData || []).map((c, i) => {
          const colors = ["var(--indigo-l)", "var(--teal)", "var(--amber)", "var(--violet)", "var(--rose)"];
          const rgb = ["91,78,248", "20,184,166", "245,158,11", "139,92,246", "244,63,94"];
          return {
            id: c.course_id,                           // API returns course_id
            code: c.code || ("CS" + c.course_id),
            name: c.title,
            short: c.title.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4),
            faculty: c.faculty_name,
            color: colors[i % colors.length],
            rgb: rgb[i % rgb.length],
          };
        });
        setCoursesState(mappedCourses);

        const mappedQuizzes = (qData || []).map(q => ({
          id: q.id,
          courseId: q.course_id,
          title: q.title,
          type: QTYPE.MCQ,
          status: q.attempt_count > 0 ? QSTATUS.COMPLETED : 
                  (new Date(q.created_at) > new Date() ? QSTATUS.UPCOMING : QSTATUS.LIVE),
          scheduledAt: q.created_at ? new Date(q.created_at).toLocaleString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true 
          }).replace(',', ' ·') : "TBD",
          duration: 30,
          totalQuestions: q.question_count,
          attempted: q.attempt_count > 0 ? q.question_count : 0,
          correct: q.best_score != null ? Math.round((q.best_score / 100) * q.question_count) : 0,
          wrong: 0,
          skipped: 0,
          marks: q.best_score,
          maxMarks: 100,
          rank: null,
          totalStudents: 0,
          classAvg: null,
          topScore: null,
          passPercent: null,
          topics: ["Quiz", q.difficulty],
          difficulty: q.difficulty ? (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase()) : "Medium",
          weight: "10%",
          weakAreas: [],
          aiTip: null,
          questions: (q.questions || []).map(quest => ({
            id: quest.id,
            text: quest.question_text,
            options: quest.options,
            correct: 0,
            explanation: "Review the course materials."
          })),
          isLive: q.attempt_count === 0,
        }));
        setQuizzesState(mappedQuizzes);
      } catch (error) {
        console.error("Failed to fetch quizzes data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(()=>{
    const h=()=>{ setShowSortDd(false); setShowTypeDd(false); };
    document.addEventListener("click",h);
    return()=>document.removeEventListener("click",h);
  },[]);

  const activeCourse = coursesState.find(c=>c.id===activeCourseId)||null;

  // Filter
  const filtered = quizzesState.filter(q=>{
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
      const order={[QSTATUS.LIVE]:0,[QSTATUS.UPCOMING]:1,[QSTATUS.COMPLETED]:2,[QSTATUS.MISSED]:3};
      return (order[a.status]||0)-(order[b.status]||0);
    }
    if(sortBy==="Score")      return (b.marks||0)-(a.marks||0);
    if(sortBy==="Course")     return String(a.courseId).localeCompare(String(b.courseId));
    if(sortBy==="Difficulty") {
      const d={Easy:0,Medium:1,Hard:2};
      return (d[a.difficulty]||0)-(d[b.difficulty]||0);
    }
    return 0;
  });

  const liveCount     = quizzesState.filter(q=>q.status===QSTATUS.LIVE).length;
  const upcomingCount = quizzesState.filter(q=>q.status===QSTATUS.UPCOMING).length;

  const handleOpen    = q => setReviewQuiz(q);
  const handleAttempt = q => { setReviewQuiz(null); setAttemptQuiz(q); };
  const handleClose   = () => { setReviewQuiz(null); setAttemptQuiz(null); };

  if (loading) {
    return (
      <div className="mc-loading" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:16}}>
        <div className="mc-loading-spinner"/>
        <p style={{color:"var(--text3)",fontSize:14}}>Loading quizzes...</p>
      </div>
    );
  }

  return (
    <>
      {reviewQuiz&&(()=>{
        const c=coursesState.find(x=>x.id===reviewQuiz.courseId) || { color: "var(--indigo-ll)", rgb: "91,78,248", short: "?", code: "?" };
        return <ReviewDrawer quiz={reviewQuiz} course={c} onClose={handleClose} onAttempt={handleAttempt}/>;
      })()}
      {attemptQuiz&&(()=>{
        const c=coursesState.find(x=>x.id===attemptQuiz.courseId) || { color: "var(--indigo-ll)", rgb: "91,78,248", short: "?", code: "?" };
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
                <span className="greet-pip-txt">Semester 5 · Week 11 · {quizzesState.length} Quizzes · {liveCount} Live</span>
              </div>
              <h1 className="greet-title">My <em>Quizzes</em></h1>
              <p className="greet-sub">Attempt live quizzes, review past results, and track your performance across all subjects.</p>
            </div>
            {liveCount>0&&(
              <div className="qz-live-banner">
                <span className="qz-live-pulse-dot"/><Zap size={13} fill="var(--teal)"/>
                <span><strong>{liveCount}</strong> quiz is live right now!</span>
                <button className="qz-live-go" onClick={()=>handleAttempt(quizzesState.find(q=>q.status===QSTATUS.LIVE))}>
                  Attempt Now →
                </button>
              </div>
            )}
          </div>
        </div>

        <StatsStrip quizzes={quizzesState}/>

        <div className="qz-main-layout">
          <CourseSidebar activeCourseId={activeCourseId} onSelect={setActiveCourseId} courses={coursesState} quizzes={quizzesState}/>

          <div className="as-content-area">
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
                    const all=quizzesState.filter(q=>q.courseId===activeCourse.id);
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
                  const c=coursesState.find(x=>x.id===q.courseId) || { color: "var(--indigo-ll)", rgb: "91,78,248", short: "?" };
                  return <QuizCard key={q.id} quiz={q} course={c} onOpen={handleOpen} onAttempt={handleAttempt}/>;
                })}
              </div>
            ) : (
              <div className="as-list">
                {sorted.map(q=>{
                  const c=coursesState.find(x=>x.id===q.courseId) || { color: "var(--indigo-ll)", rgb: "91,78,248", short: "?" };
                  return <QuizRow key={q.id} quiz={q} course={c} onOpen={handleOpen} onAttempt={handleAttempt}/>;
                })}
              </div>
            )}
          </div>

          <div className="qz-right-sidebar">
            <UpcomingCard quizzes={quizzesState} courses={coursesState} onAttempt={handleAttempt}/>
            <LeaderboardCard courses={coursesState} quizzes={quizzesState}/>
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
