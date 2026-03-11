// Attendance.jsx — Dynamic version fetching real data from /faculty/attendance
import { useState, useEffect } from "react";
import api from "../../../utils/api";
import "./attendance.css";

const IcoChevL  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoCheck  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoClose  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoMinus  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoCal    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoDownload=(p)=> <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoAlert  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoSave   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

function ProgressBar({ pct, color="var(--indigo-l)", height=4 }) {
  return (
    <div className="att-prog-track" style={{height}}>
      <div className="att-prog-fill" style={{width:`${Math.min(100,pct)}%`,background:color}}/>
    </div>
  );
}

export default function Attendance({ onBack }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0);
  const [todayStatus, setTodayStatus] = useState({});
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("today");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/faculty/attendance");
        const data = Array.isArray(res.data) ? res.data : [];
        setCourses(data);

        // Initialize today's status for all students
        const init = {};
        data.forEach(course => {
          course.students.forEach(s => {
            // Derive status from attendance percentage
            const pct = course.total > 0 ? (s.present / course.total) * 100 : 0;
            init[s.roll] = pct >= 75 ? "present" : pct >= 60 ? "late" : "absent";
          });
        });
        setTodayStatus(init);
      } catch (err) {
        console.error("Failed to load attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-state">Loading attendance...</div>;
  if (courses.length === 0) return (
    <div className="att-root">
      <div className="att-page-hd">
        <div>
          <button className="att-back-btn" onClick={onBack}><IcoChevL style={{width:13,height:13}}/> Dashboard</button>
          <div className="greet-title" style={{marginBottom:2}}>Attendance</div>
        </div>
      </div>
      <div style={{ padding: 40, textAlign: "center", color: "var(--text3)", fontSize: 14 }}>
        No courses found. Please create courses and enroll students first.
      </div>
    </div>
  );

  const c = courses[selectedCourseIdx];
  const students = c ? (c.students || []) : [];

  const presentToday = students.filter(s => todayStatus[s.roll] === "present").length;
  const absentToday  = students.filter(s => todayStatus[s.roll] === "absent").length;
  const lateToday    = students.filter(s => todayStatus[s.roll] === "late").length;
  const lowAtt       = students.filter(s => c.total > 0 && (s.present/c.total)*100 < 75).length;

  const markAll = (status) => {
    const upd = {...todayStatus};
    students.forEach(s => { upd[s.roll] = status; });
    setTodayStatus(upd);
    setSaved(false);
  };

  const cycleStatus = (roll) => {
    const cur = todayStatus[roll];
    const next = cur === "present" ? "absent" : cur === "absent" ? "late" : "present";
    setTodayStatus(p => ({...p, [roll]: next}));
    setSaved(false);
  };

  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const STATUS_ICON = {
    present: <IcoCheck style={{width:10,height:10}}/>,
    absent:  <IcoClose style={{width:10,height:10}}/>,
    late:    <IcoMinus style={{width:10,height:10}}/>,
  };
  const STATUS_STYLE = {
    present: { color:"var(--teal)",  bg:"rgba(39,201,176,.12)", border:"rgba(39,201,176,.25)" },
    absent:  { color:"var(--rose)",  bg:"rgba(242,68,92,.12)",  border:"rgba(242,68,92,.25)"  },
    late:    { color:"var(--amber)", bg:"rgba(244,165,53,.12)", border:"rgba(244,165,53,.25)" },
  };

  return (
    <div className="att-root">
      <div className="att-page-hd">
        <div>
          <button className="att-back-btn" onClick={onBack}><IcoChevL style={{width:13,height:13}}/> Dashboard</button>
          <div className="greet-title" style={{marginBottom:2}}>Attendance</div>
          <div className="greet-sub">Mark and monitor student attendance across your courses</div>
        </div>
        <div className="att-hd-right">
          <button className="btn btn-ghost" style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}>
            <IcoDownload style={{width:13,height:13}}/> Export Report
          </button>
          <button className={`btn ${saved?"btn-ghost":"btn-primary"}`} style={{display:"flex",alignItems:"center",gap:6,fontSize:12}} onClick={handleSave}>
            {saved ? <IcoCheck style={{width:12,height:12}}/> : <IcoSave style={{width:12,height:12}}/>}
            {saved ? "Saved!" : "Save Attendance"}
          </button>
        </div>
      </div>

      {/* Stat Strip */}
      <div className="att-stat-strip">
        {[
          { label:"Present Today", value:presentToday,    cls:"sc-teal"   },
          { label:"Absent Today",  value:absentToday,     cls:"sc-rose"   },
          { label:"Late Today",    value:lateToday,       cls:"sc-amber"  },
          { label:"Below 75%",     value:lowAtt,          cls:"sc-violet" },
          { label:"Course Total",  value:students.length, cls:"sc-indigo" },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-val">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Course Tabs */}
      <div className="att-course-tabs">
        {courses.map((cm, idx) => (
          <button key={cm.id}
            className={`att-ctab ${selectedCourseIdx===idx?"att-ctab--active":""}`}
            style={selectedCourseIdx===idx?{borderColor:cm.border,color:cm.color,background:cm.bg}:{}}
            onClick={()=>setSelectedCourseIdx(idx)}>
            <span className="att-ctab-dot" style={{background:cm.color}}/>
            {cm.code}
            <span className="att-ctab-count">{cm.students.length}</span>
          </button>
        ))}
      </div>

      {/* View Tabs */}
      <div className="att-tabs">
        {["today","history"].map(t => (
          <button key={t} className={`att-tab ${tab===t?"active":""}`}
            style={tab===t?{color:c.color,borderBottomColor:c.color}:{}}
            onClick={()=>setTab(t)}>
            {t === "today" ? <IcoCal style={{width:12,height:12}}/> : <IcoAlert style={{width:12,height:12}}/>}
            {t === "today" ? "Today's Session" : "Low Attendance"}
          </button>
        ))}
      </div>

      {/* Today's Session */}
      {tab === "today" && (
        <>
          <div className="att-session-hd">
            <div className="att-session-info">
              <span style={{color:c.color,fontWeight:700}}>{c.code}</span>
              <span className="att-dot-sep">·</span>
              <span>Today, {new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</span>
              <span className="att-dot-sep">·</span>
              <span>{students.length} students</span>
            </div>
            <div className="att-session-acts">
              <button className="att-mark-btn att-mark-all" onClick={()=>markAll("present")}>
                <IcoCheck style={{width:10,height:10}}/> All Present
              </button>
              <button className="att-mark-btn att-mark-none" onClick={()=>markAll("absent")}>
                <IcoClose style={{width:10,height:10}}/> All Absent
              </button>
            </div>
          </div>

          <div className="att-session-prog">
            <div className="att-prog-labels">
              <span style={{color:"var(--teal)"}}>{presentToday} Present</span>
              <span style={{color:"var(--amber)"}}>{lateToday} Late</span>
              <span style={{color:"var(--rose)"}}>{absentToday} Absent</span>
            </div>
            <div className="att-prog-bar-multi">
              <div style={{width:`${students.length ? (presentToday/students.length)*100 : 0}%`,background:"var(--teal)",height:"100%"}}/>
              <div style={{width:`${students.length ? (lateToday/students.length)*100 : 0}%`,background:"var(--amber)",height:"100%"}}/>
              <div style={{width:`${students.length ? (absentToday/students.length)*100 : 0}%`,background:"var(--rose)",height:"100%"}}/>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="att-empty">
              <IcoAlert style={{width:36,height:36,opacity:.2,marginBottom:10}}/>
              <div style={{fontSize:14,fontWeight:700}}>No students enrolled in this course</div>
            </div>
          ) : (
            <div className="att-student-list">
              {students.map((s, i) => {
                const st = todayStatus[s.roll] || "present";
                const ss = STATUS_STYLE[st];
                const pct = c.total > 0 ? Math.round((s.present/c.total)*100) : 0;
                return (
                  <div key={s.roll} className="att-student-row" onClick={()=>cycleStatus(s.roll)}>
                    <span className="att-row-num">{i+1}</span>
                    <div className="att-row-avatar" style={{background:c.bg,borderColor:c.border,color:c.color}}>
                      {s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div className="att-row-info">
                      <div className="att-row-name">{s.name}</div>
                      <div className="att-row-roll">{s.roll}</div>
                    </div>
                    <div className="att-row-hist">
                      <span style={{fontSize:10.5,fontWeight:700,color:pct>=75?"var(--teal)":"var(--rose)"}}>{pct}%</span>
                      <ProgressBar pct={pct} color={pct>=75?"var(--teal)":"var(--rose)"} height={3}/>
                      <span style={{fontSize:9,color:"var(--text3)"}}>{s.present}/{c.total}</span>
                    </div>
                    <button className="att-status-btn" style={{color:ss.color,background:ss.bg,borderColor:ss.border}}>
                      {STATUS_ICON[st]} {st.charAt(0).toUpperCase()+st.slice(1)}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Low Attendance */}
      {tab === "history" && (
        <div className="att-low-section">
          <div className="att-low-banner">
            <IcoAlert style={{width:14,height:14,color:"var(--rose)",flexShrink:0}}/>
            <span>Students with attendance below <strong>75%</strong> will be barred from exams.</span>
          </div>
          {students.filter(s => c.total > 0 && (s.present/c.total)*100 < 75).length === 0 ? (
            <div className="att-empty">
              <IcoCheck style={{width:36,height:36,opacity:.2,marginBottom:10}}/>
              <div style={{fontSize:14,fontWeight:700}}>All students above 75%</div>
            </div>
          ) : (
            <div className="att-low-list">
              {students.filter(s => c.total > 0 && (s.present/c.total)*100 < 75).map(s => {
                const pct = Math.round((s.present/c.total)*100);
                return (
                  <div key={s.roll} className="att-low-card">
                    <div className="att-low-avatar" style={{background:c.bg,borderColor:c.border,color:c.color}}>
                      {s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div className="att-low-info">
                      <div className="att-low-name">{s.name}</div>
                      <div className="att-low-roll">{s.roll}</div>
                    </div>
                    <div className="att-low-stats">
                      <div style={{fontSize:18,fontFamily:"'Fraunces',serif",color:"var(--rose)",lineHeight:1}}>{pct}%</div>
                      <div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>{s.present}/{c.total} classes</div>
                      <ProgressBar pct={pct} color="var(--rose)" height={3}/>
                    </div>
                    <span className="att-low-warn">⚠️ At Risk</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}