// facultyProfile.jsx
import { useState, useRef, useEffect } from "react";
import "./facultyProfile.css";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoChevL   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoEdit    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoCamera  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoMail    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoPhone   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>;
const IcoLink    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IcoAward   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoBook    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoStar    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoFlask   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6v11l3.4 5.1A2 2 0 0 1 16.7 22H7.3a2 2 0 0 1-1.7-2.9L9 14V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>;
const IcoGlobe   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

// ─── DATA ────────────────────────────────────────────────────────
const COURSES_TAUGHT = [
  { code:"CS501", name:"Operating Systems",           sem:"Sem 5", students:112, year:"2024–25", color:"var(--indigo-ll)", bg:"rgba(91,78,248,.1)" },
  { code:"CS502", name:"Database Management Systems", sem:"Sem 5", students:108, year:"2024–25", color:"var(--teal)",      bg:"rgba(39,201,176,.1)" },
  { code:"CS503", name:"Computer Architecture",       sem:"Sem 3", students:96,  year:"2024–25", color:"var(--violet)",   bg:"rgba(159,122,234,.1)" },
  { code:"CS401", name:"Data Structures & Algorithms",sem:"Sem 4", students:120, year:"2023–24", color:"var(--amber)",    bg:"rgba(244,165,53,.1)" },
];

const PUBLICATIONS = [
  { title:"Adaptive Cache Coherence in Heterogeneous Multi-Core Systems", journal:"IEEE Transactions on Computers", year:2023, citations:42, type:"Journal" },
  { title:"Optimised B+ Tree Indexing for NVM-based Database Systems",   journal:"ACM SIGMOD",                     year:2022, citations:31, type:"Conference" },
  { title:"Towards Deadlock-Free OS Scheduling in Real-Time Environments",journal:"Elsevier JSS",                   year:2021, citations:28, type:"Journal" },
];

const SKILLS = [
  "Operating Systems","Database Design","Computer Architecture","Algorithm Design",
  "RDBMS","C / C++","Python","Linux Kernel","LaTeX","Research Methodology",
];

const ACHIEVEMENTS = [
  { label:"Best Faculty Award",    year:"2023", color:"var(--amber)",  bg:"rgba(244,165,53,.12)"  },
  { label:"Research Excellence",   year:"2022", color:"var(--teal)",   bg:"rgba(39,201,176,.1)"   },
  { label:"100+ Citations",         year:"2023", color:"var(--violet)", bg:"rgba(159,122,234,.1)"  },
  { label:"Top Rated Instructor",  year:"2024", color:"var(--indigo-ll)",bg:"rgba(91,78,248,.1)"  },
];

const STATS = [
  { val:"14+", lbl:"Years Experience", color:"var(--teal)"      },
  { val:"316", lbl:"Current Students", color:"var(--indigo-ll)" },
  { val:"3",   lbl:"Active Courses",   color:"var(--violet)"    },
  { val:"101", lbl:"Total Citations",  color:"var(--amber)"     },
];

// ─── ANIMATED BAR ────────────────────────────────────────────────
function Bar({ pct, color, delay = 400 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height: 4, background: "var(--surface3)", borderRadius: 2, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 2, transition: "width 1s ease" }} />
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function FacultyProfile({ onBack }) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(
    "Assistant Professor at SmartCampus University with 14+ years of experience in teaching Operating Systems, Database Management, and Computer Architecture. Research interests span cache coherence, real-time OS scheduling, and NVM-based storage systems."
  );
  const [bioEdit, setBioEdit] = useState(bio);
  const [activeTab, setActiveTab] = useState("overview");

  const TABS = ["overview", "courses", "publications", "achievements"];

  const saveBio = () => { setBio(bioEdit); setEditing(false); };

  return (
    <div className="fp-root">
      {/* ── BACK ── */}
      <div className="fp-topbar">
        <button className="fp-back-btn" onClick={onBack}>
          <IcoChevL /> Back to Dashboard
        </button>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="fp-hero">
        <div className="fp-hero-bg" />
        <div className="fp-hero-content">
          <div className="fp-avatar-wrap">
            <div className="fp-avatar">SP</div>
            <button className="fp-avatar-cam"><IcoCamera /></button>
          </div>
          <div className="fp-hero-info">
            <div className="fp-hero-name">Dr. S. Prakash</div>
            <div className="fp-hero-role">Assistant Professor · Department of Computer Science & Engineering</div>
            <div className="fp-hero-meta">
              <span className="fp-meta-chip"><IcoMail /> s.prakash@smartcampus.edu.in</span>
              <span className="fp-meta-chip"><IcoPhone /> +91 98765 43210</span>
              <span className="fp-meta-chip"><IcoGlobe /> smartcampus.edu.in/faculty/sprakash</span>
            </div>
            <div className="fp-hero-stats">
              {STATS.map(s => (
                <div key={s.lbl} className="fp-hstat">
                  <div className="fp-hstat-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="fp-hstat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="fp-edit-btn" onClick={() => setEditing(e => !e)}>
            <IcoEdit /> Edit Profile
          </button>
        </div>
      </div>

      {/* ── ACHIEVEMENTS STRIP ── */}
      <div className="fp-achieve-strip">
        {ACHIEVEMENTS.map(a => (
          <div key={a.label} className="fp-achieve-chip" style={{ background: a.bg, borderColor: a.color + "44", color: a.color }}>
            <IcoAward style={{ color: a.color }} /> {a.label} <span style={{ opacity: .55, fontSize: 10 }}>{a.year}</span>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="fp-tabs">
        {TABS.map(t => (
          <button key={t} className={`fp-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="fp-body">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="fp-grid">
            {/* BIO */}
            <div className="fp-card fp-card-full">
              <div className="fp-card-hd">
                <span className="fp-card-title"><IcoBook /> About</span>
                <button className="fp-card-act" onClick={() => setEditing(e => !e)}><IcoEdit /> Edit</button>
              </div>
              {editing ? (
                <div style={{ padding: "14px 20px" }}>
                  <textarea className="fp-textarea" value={bioEdit} onChange={e => setBioEdit(e.target.value)} rows={4} />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="fp-btn fp-btn-solid" onClick={saveBio}><IcoCheck /> Save</button>
                    <button className="fp-btn fp-btn-ghost" onClick={() => { setBioEdit(bio); setEditing(false); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="fp-bio">{bio}</p>
              )}
            </div>

            {/* SKILLS */}
            <div className="fp-card">
              <div className="fp-card-hd"><span className="fp-card-title"><IcoFlask /> Skills & Expertise</span></div>
              <div className="fp-skills-wrap">
                {SKILLS.map(s => (
                  <span key={s} className="fp-skill-tag">{s}</span>
                ))}
                <span className="fp-skill-tag fp-skill-add"><IcoPlus /> Add</span>
              </div>
            </div>

            {/* CONTACT */}
            <div className="fp-card">
              <div className="fp-card-hd"><span className="fp-card-title"><IcoLink /> Contact & Links</span></div>
              <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: <IcoMail />, label: "Email",     val: "s.prakash@smartcampus.edu.in" },
                  { icon: <IcoPhone />, label: "Phone",    val: "+91 98765 43210" },
                  { icon: <IcoGlobe />, label: "Website",  val: "smartcampus.edu.in/faculty/sprakash" },
                  { icon: <IcoLink />,  label: "LinkedIn", val: "linkedin.com/in/sprakash-faculty" },
                ].map(r => (
                  <div key={r.label} className="fp-contact-row">
                    <span className="fp-contact-icon">{r.icon}</span>
                    <div>
                      <div className="fp-contact-lbl">{r.label}</div>
                      <div className="fp-contact-val">{r.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RATINGS */}
            <div className="fp-card fp-card-full">
              <div className="fp-card-hd"><span className="fp-card-title"><IcoStar style={{ color: "var(--amber)" }} /> Student Ratings</span></div>
              <div style={{ padding: "14px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 18 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: 48, lineHeight: 1, color: "var(--amber)" }}>4.7</div>
                    <div style={{ display: "flex", gap: 2, justifyContent: "center", margin: "6px 0" }}>
                      {[1,2,3,4,5].map(i => <IcoStar key={i} style={{ color: i <= 4 ? "var(--amber)" : "var(--border2)", width:14, height:14 }} />)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>Avg Rating · 248 reviews</div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {[["Teaching Clarity", 92, "var(--teal)"], ["Assignment Quality", 86, "var(--indigo-ll)"], ["Availability", 78, "var(--amber)"], ["Course Relevance", 95, "var(--violet)"]].map(([lbl, pct, col]) => (
                      <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, color: "var(--text3)", width: 130, flexShrink: 0 }}>{lbl}</span>
                        <Bar pct={pct} color={col} delay={500} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: col, width: 34, textAlign: "right" }}>{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COURSES */}
        {activeTab === "courses" && (
          <div className="fp-grid">
            <div className="fp-card fp-card-full">
              <div className="fp-card-hd"><span className="fp-card-title"><IcoBook /> Courses Taught</span></div>
              <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
                {COURSES_TAUGHT.map(c => (
                  <div key={c.code} className="fp-course-card" style={{ borderColor: c.color + "33" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, fontSize: 11, fontWeight: 800 }}>{c.code.replace("CS", "")}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text3)" }}>{c.code} · {c.sem}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}><span style={{ color: c.color, fontWeight: 700 }}>{c.students}</span> students</span>
                      <span style={{ fontSize: 10, background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{c.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PUBLICATIONS */}
        {activeTab === "publications" && (
          <div className="fp-grid">
            <div className="fp-card fp-card-full">
              <div className="fp-card-hd"><span className="fp-card-title"><IcoTrend /> Publications</span><span style={{ fontSize: 10, color: "var(--text3)" }}>3 publications · 101 total citations</span></div>
              <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {PUBLICATIONS.map((p, i) => (
                  <div key={i} className="fp-pub-card">
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(91,78,248,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--indigo-ll)", flexShrink: 0, fontSize: 11, fontWeight: 800 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>{p.journal} · {p.year}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(91,78,248,.1)", color: "var(--indigo-ll)", fontWeight: 600 }}>{p.type}</span>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(39,201,176,.08)", color: "var(--teal)", fontWeight: 600 }}>{p.citations} citations</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === "achievements" && (
          <div className="fp-grid">
            <div className="fp-card fp-card-full">
              <div className="fp-card-hd"><span className="fp-card-title"><IcoAward /> Awards & Achievements</span></div>
              <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
                {ACHIEVEMENTS.map(a => (
                  <div key={a.label} className="fp-award-card" style={{ borderColor: a.color + "33", background: a.bg }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: a.bg, border: `1px solid ${a.color}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <IcoAward style={{ color: a.color, width: 20, height: 20 }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: a.color, marginBottom: 4 }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>Awarded in {a.year}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}