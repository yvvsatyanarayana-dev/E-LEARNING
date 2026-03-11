// studentProfile.jsx
import { useState, useEffect } from "react";
import "./studentProfile.css";

const IcoBack   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoEdit   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoShare  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IcoMail   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoPhone  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoLinked = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
const IcoGithub = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>;
const IcoBook   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoBar    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoBrief  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcoAward  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoChevUp = (p) => <svg {...p} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;

function SkillBar({ label, pct, color, pctColor }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 300); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="sp-skill-item">
      <div className="sp-skill-row">
        <span className="sp-skill-name">{label}</span>
        <span className="sp-skill-pct" style={{ color: pctColor }}>{pct}%</span>
      </div>
      <div className="sp-skill-bar">
        <div className="sp-skill-fill" style={{ width:`${w}%`, background: color }} />
      </div>
    </div>
  );
}

import api from "../../../utils/api";

const PALETTE = [
  {color:"var(--teal)",    pctColor:"var(--teal)"},
  {color:"var(--indigo-l)",pctColor:"var(--indigo-ll)"},
  {color:"var(--violet)", pctColor:"var(--violet)"},
  {color:"var(--amber)",  pctColor:"var(--amber)"},
  {color:"var(--rose)",   pctColor:"var(--rose)"},
];
const GRADE_STYLES = [
  {background:"rgba(39,201,176,.1)",color:"var(--teal)"},
  {background:"rgba(91,78,248,.1)",color:"var(--indigo-ll)"},
  {background:"rgba(244,165,53,.1)",color:"var(--amber)"},
  {background:"rgba(159,122,234,.1)",color:"var(--violet)"},
  {background:"rgba(242,68,92,.1)",color:"var(--rose)"},
];

export default function StudentProfile({ onBack, onNavigateSettings }) {
  const [user,       setUser]       = useState(null);
  const [skills,     setSkills]     = useState([]);
  const [courses,    setCourses]    = useState([]);
  const [placement,  setPlacement]  = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, dashRes] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/student/dashboard"),
        ]);
        if (meRes.status === "fulfilled") setUser(meRes.value);
        if (dashRes.status === "fulfilled") {
          const d = dashRes.value;
          if (d.skill_scores)    setSkills(d.skill_scores);
          if (d.enrolled_courses) setCourses(d.enrolled_courses);
          if (d.placement)       setPlacement(d.placement);
        }
      } catch (e) { console.error("Profile load failed:", e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const initials = user?.full_name ? user.full_name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) : "??";
  const priScore = placement?.pri_score ?? 0;
  const priLabel = priScore >= 85 ? "Excellent" : priScore >= 70 ? "Good" : priScore >= 50 ? "Average" : "Needs Work";

  const STATS = [
    { val: `${Math.round(priScore)}`, lbl:"Placement Readiness", color:"var(--indigo-ll)", delta: priLabel, dc:"indigo" },
    { val: `${courses.length}`,       lbl:"Enrolled Courses",    color:"var(--teal)",    delta:"Active courses", dc:"teal" },
    { val: `${skills.length}`,        lbl:"Skills Tracked",      color:"var(--violet)",  delta:"In skill tracker", dc:"violet" },
    { val: `${placement?.mock_interviews_done ?? 0}`, lbl:"Mock Interviews", color:"var(--amber)", delta:"Completed", dc:"amber" },
  ];

  return (
    <div className="sp-root">
      {/* Header */}
      <div className="sp-header">
        <button className="sp-back" onClick={onBack}><IcoBack /> Back</button>
      </div>

      {loading ? (
        <div style={{padding:"60px 20px",textAlign:"center",color:"var(--text3)"}}>Loading profile…</div>
      ) : (
        <>
          {/* Hero */}
          <div className="sp-hero">
            <div className="sp-hero-banner" />
            <div className="sp-hero-body">
              <div className="sp-avatar-wrap">
                <div className="sp-avatar">{initials}</div>
                <div className="sp-avatar-actions">
                  <button className="sp-btn-outline" onClick={onNavigateSettings}><IcoEdit /> Edit Profile</button>
                  <button className="sp-btn-outline"><IcoShare /> Share</button>
                  <button className="sp-btn-solid"><IcoBrief /> View Resume</button>
                </div>
              </div>
              <div className="sp-name">{user?.full_name || "Student"}</div>
              <div className="sp-meta">{user?.email || ""}</div>
              <div className="sp-bio">Student at SmartCampus</div>
              {skills.length > 0 && (
                <div className="sp-tags">
                  {skills.slice(0, 8).map(s => (
                    <span key={s.skill_name} className="sp-tag">{s.skill_name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="sp-stats">
            {STATS.map(s => (
              <div key={s.lbl} className="sp-stat">
                <div className="sp-stat-val" style={{ color: s.color }}>{s.val}</div>
                <div className="sp-stat-lbl">{s.lbl}</div>
                <div className="sp-stat-delta" style={{ color: s.color, opacity: .7 }}>{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="sp-grid">
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* Skills */}
              <div className="sp-panel">
                <div className="sp-panel-hd">
                  <span className="sp-panel-ttl"><IcoBar style={{marginRight:6,verticalAlign:"middle",color:"var(--indigo-ll)"}}/>Skill Tracker</span>
                  <span style={{fontSize:11,color:"var(--text3)"}}>{skills.length} skills</span>
                </div>
                <div className="sp-panel-body">
                  {skills.length === 0 ? (
                    <div style={{padding:"20px",textAlign:"center",color:"var(--text3)",fontSize:12}}>No skills tracked yet</div>
                  ) : skills.map((s, i) => {
                    const p = PALETTE[i % PALETTE.length];
                    return <SkillBar key={s.skill_name} label={s.skill_name} pct={Math.round(s.score)} color={p.color} pctColor={p.pctColor} />;
                  })}
                </div>
              </div>

              {/* Courses */}
              <div className="sp-panel">
                <div className="sp-panel-hd">
                  <span className="sp-panel-ttl"><IcoBook style={{marginRight:6,verticalAlign:"middle",color:"var(--indigo-ll)"}}/>Active Courses</span>
                  <button className="sp-panel-act">View all →</button>
                </div>
                <div className="sp-panel-body" style={{padding:"8px 18px"}}>
                  {courses.length === 0 ? (
                    <div style={{padding:"20px",textAlign:"center",color:"var(--text3)",fontSize:12}}>No courses enrolled</div>
                  ) : courses.map((c, i) => {
                    const p = PALETTE[i % PALETTE.length];
                    const g = GRADE_STYLES[i % GRADE_STYLES.length];
                    const grade = c.progress >= 90 ? "A+" : c.progress >= 80 ? "A" : c.progress >= 70 ? "A−" : c.progress >= 60 ? "B+" : "B";
                    return (
                      <div key={c.course_id} className="sp-course-item">
                        <div className="sp-course-dot" style={{ background: p.color }} />
                        <div className="sp-course-info">
                          <div className="sp-course-name">{c.title}</div>
                          <div className="sp-course-prog">{Math.round(c.progress)}% complete</div>
                        </div>
                        <div className="sp-course-grade" style={g}>{grade}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* Contact */}
              <div className="sp-panel">
                <div className="sp-panel-hd">
                  <span className="sp-panel-ttl">Contact & Info</span>
                  <button className="sp-panel-act" onClick={onNavigateSettings}>Edit →</button>
                </div>
                <div className="sp-panel-body" style={{padding:"8px 18px"}}>
                  {[
                    { ico:<IcoMail/>,  val: user?.email || "—" },
                    { ico:<IcoPhone/>, val: "Update in Settings" },
                  ].map((c,i) => (
                    <div key={i} className="sp-contact-item">
                      <span className="sp-contact-ico">{c.ico}</span>
                      <span className="sp-contact-val">{c.val}</span>
                    </div>
                  ))}
                </div>
              </div>


              {/* Placement Summary */}
              {placement && (
                <div className="sp-panel">
                  <div className="sp-panel-hd">
                    <span className="sp-panel-ttl"><IcoBrief style={{marginRight:6,verticalAlign:"middle",color:"var(--indigo-ll)"}}/>Placement Readiness</span>
                  </div>
                  <div className="sp-panel-body" style={{padding:"12px 18px"}}>
                    <div style={{fontSize:32,fontWeight:800,color:"var(--indigo-ll)",marginBottom:4}}>{Math.round(placement.pri_score)}</div>
                    <div style={{fontSize:12,color:"var(--text3)",marginBottom:8}}>PRI Score — {priLabel}</div>
                    <div style={{fontSize:12,color:"var(--text2)"}}>
                      Mock Interviews: <strong>{placement.mock_interviews_done}</strong> done &nbsp;·&nbsp;
                      Skills: <strong>{placement.skills_completed}</strong> completed
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
