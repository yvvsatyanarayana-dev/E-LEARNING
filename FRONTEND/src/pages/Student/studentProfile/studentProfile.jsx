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

const COURSES = [
  { name:"Operating Systems",    pct:78, grade:"A",  color:"var(--indigo-l)", gradeStyle:{background:"rgba(39,201,176,.1)",color:"var(--teal)"} },
  { name:"Database Mgmt Sys",    pct:61, grade:"A−", color:"var(--teal)",     gradeStyle:{background:"rgba(91,78,248,.1)",color:"var(--indigo-ll)"} },
  { name:"Machine Learning",     pct:44, grade:"B+", color:"var(--amber)",    gradeStyle:{background:"rgba(244,165,53,.1)",color:"var(--amber)"} },
  { name:"Computer Networks",    pct:55, grade:"A",  color:"var(--violet)",   gradeStyle:{background:"rgba(159,122,234,.1)",color:"var(--violet)"} },
  { name:"Cryptography & NS",    pct:32, grade:"B",  color:"var(--rose)",     gradeStyle:{background:"rgba(242,68,92,.1)",color:"var(--rose)"} },
];

const ACTIVITY = [
  { icon:"📝", color:"rgba(242,68,92,.1)",  title:"Assignment Submitted",  sub:"OS Unit III — 2 hrs before deadline", time:"Today" },
  { icon:"🎯", color:"rgba(39,201,176,.1)", title:"Quiz Completed",        sub:"DBMS Normalisation — Score: 85%",      time:"Yesterday" },
  { icon:"💬", color:"rgba(159,122,234,.1)",title:"Study Group Post",      sub:"Replied in OS Revision Group",         time:"2 days ago" },
  { icon:"🏅", color:"rgba(244,165,53,.1)", title:"Badge Earned",          sub:"Consistency Streak — 7 days",          time:"3 days ago" },
  { icon:"🎓", color:"rgba(91,78,248,.1)",  title:"Lecture Completed",     sub:"ML — Linear Regression (44 min)",      time:"4 days ago" },
];

const BADGES = [
  { ico:"🔥", name:"7-day Streak" }, { ico:"🎯", name:"Quiz Ace" },
  { ico:"🚀", name:"Early Bird"  }, { ico:"🏆", name:"Top 15%" },
  { ico:"⚡", name:"Fast Learner"}, { ico:"💎", name:"Consistent" },
];

export default function StudentProfile({ onBack, onNavigateSettings }) {
  const STATS = [
    { val:"8.4",  lbl:"Current CGPA",        color:"var(--teal)",    delta:<><IcoChevUp style={{color:"var(--teal)"}}/> +0.2 this sem</>, dc:"teal" },
    { val:"87%",  lbl:"Attendance",           color:"var(--amber)",   delta:"Min 75% req",                                              dc:"amber" },
    { val:"72",   lbl:"Placement Readiness",  color:"var(--indigo-ll)",delta:"Good tier",                                              dc:"indigo" },
    { val:"Top 15%",lbl:"Class Rank",         color:"var(--violet)",  delta:"↑ 3 positions",                                           dc:"violet" },
  ];

  return (
    <div className="sp-root">
      {/* Header */}
      <div className="sp-header">
        <button className="sp-back" onClick={onBack}><IcoBack /> Back</button>
      </div>

      {/* Hero */}
      <div className="sp-hero">
        <div className="sp-hero-banner" />
        <div className="sp-hero-body">
          <div className="sp-avatar-wrap">
            <div className="sp-avatar">AR</div>
            <div className="sp-avatar-actions">
              <button className="sp-btn-outline" onClick={onNavigateSettings}><IcoEdit /> Edit Profile</button>
              <button className="sp-btn-outline"><IcoShare /> Share</button>
              <button className="sp-btn-solid"><IcoBrief /> View Resume</button>
            </div>
          </div>
          <div className="sp-name">Arjun Reddy</div>
          <div className="sp-meta">Computer Science Engineering · Semester 5 · Roll 21CS047 · Amrita University</div>
          <div className="sp-bio">CSE student passionate about distributed systems, machine learning, and competitive programming. Aspiring software engineer with strong foundations in algorithms and system design.</div>
          <div className="sp-tags">
            {["Python","C++","React","Node.js","Machine Learning","SQL","DSA","System Design"].map(t => (
              <span key={t} className="sp-tag">{t}</span>
            ))}
          </div>
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
              <button className="sp-panel-act">Full report →</button>
            </div>
            <div className="sp-panel-body">
              {[
                { label:"DSA",           pct:82, color:"var(--teal)",    pctColor:"var(--teal)" },
                { label:"Python",        pct:74, color:"var(--indigo-l)",pctColor:"var(--indigo-ll)" },
                { label:"SQL",           pct:68, color:"var(--violet)",  pctColor:"var(--violet)" },
                { label:"Machine Learning",pct:55,color:"var(--amber)",  pctColor:"var(--amber)" },
                { label:"System Design", pct:41, color:"var(--rose)",    pctColor:"var(--rose)" },
                { label:"Communication", pct:77, color:"linear-gradient(90deg,var(--indigo),var(--teal))",pctColor:"var(--indigo-ll)" },
              ].map(s => <SkillBar key={s.label} {...s} />)}
            </div>
          </div>

          {/* Courses */}
          <div className="sp-panel">
            <div className="sp-panel-hd">
              <span className="sp-panel-ttl"><IcoBook style={{marginRight:6,verticalAlign:"middle",color:"var(--indigo-ll)"}}/>Active Courses</span>
              <button className="sp-panel-act">View all →</button>
            </div>
            <div className="sp-panel-body" style={{padding:"8px 18px"}}>
              {COURSES.map(c => (
                <div key={c.name} className="sp-course-item">
                  <div className="sp-course-dot" style={{ background: c.color }} />
                  <div className="sp-course-info">
                    <div className="sp-course-name">{c.name}</div>
                    <div className="sp-course-prog">{c.pct}% complete</div>
                  </div>
                  <div className="sp-course-grade" style={c.gradeStyle}>{c.grade}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Badges */}
          <div className="sp-panel">
            <div className="sp-panel-hd">
              <span className="sp-panel-ttl"><IcoAward style={{marginRight:6,verticalAlign:"middle",color:"var(--indigo-ll)"}}/>Achievements</span>
              <span style={{fontSize:11,color:"var(--text3)"}}>{BADGES.length} earned</span>
            </div>
            <div className="sp-panel-body">
              <div className="sp-badges">
                {BADGES.map(b => (
                  <div key={b.name} className="sp-badge">
                    <span className="sp-badge-ico">{b.ico}</span>
                    <span className="sp-badge-name">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="sp-panel">
            <div className="sp-panel-hd">
              <span className="sp-panel-ttl">Recent Activity</span>
            </div>
            <div className="sp-panel-body" style={{padding:"6px 18px"}}>
              {ACTIVITY.map((a,i) => (
                <div key={i} className="sp-activity-item">
                  <div className="sp-act-ico" style={{ background: a.color }}>
                    <span style={{fontSize:14}}>{a.icon}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div className="sp-act-title">{a.title}</div>
                    <div className="sp-act-sub">{a.sub}</div>
                  </div>
                  <div className="sp-act-time">{a.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="sp-panel">
            <div className="sp-panel-hd">
              <span className="sp-panel-ttl">Contact & Links</span>
              <button className="sp-panel-act" onClick={onNavigateSettings}>Edit →</button>
            </div>
            <div className="sp-panel-body" style={{padding:"8px 18px"}}>
              {[
                { ico:<IcoMail/>,   val:"arjun.reddy@college.edu" },
                { ico:<IcoPhone/>,  val:"+91 98765 43210" },
                { ico:<IcoLinked/>, val:"linkedin.com/in/arjunreddy" },
                { ico:<IcoGithub/>, val:"github.com/arjunreddy21" },
              ].map((c,i) => (
                <div key={i} className="sp-contact-item">
                  <span className="sp-contact-ico">{c.ico}</span>
                  <span className="sp-contact-val">{c.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}