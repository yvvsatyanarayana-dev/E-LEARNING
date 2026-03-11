// facultyProfile.jsx
import { useState, useEffect } from "react";
import api from "../../../utils/api";
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
const IcoStar    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoPlus    = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoFlask   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6v11l3.4 5.1A2 2 0 0 1 16.7 22H7.3a2 2 0 0 1-1.7-2.9L9 14V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>;
const IcoGlobe   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioEdit, setBioEdit] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/faculty/profile");
        setProfile(res);
        setBioEdit(res.bio || "");
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveBio = async () => {
    try {
      setProfile(p => ({ ...p, bio: bioEdit }));
      setEditing(false);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const initials = profile
    ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const TABS = ["overview", "courses", "achievements"];

  if (loading) return <div className="loading-state">Loading profile...</div>;

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
            <div className="fp-avatar">{initials}</div>
            <button className="fp-avatar-cam"><IcoCamera /></button>
          </div>
          <div className="fp-hero-info">
            <div className="fp-hero-name">{profile.full_name}</div>
            <div className="fp-hero-role">
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} · {profile.department || "Department of Computer Science"}
            </div>
            <div className="fp-hero-meta">
              <span className="fp-meta-chip"><IcoMail /> {profile.email}</span>
              {profile.phone && <span className="fp-meta-chip"><IcoPhone /> {profile.phone}</span>}
            </div>
            <div className="fp-hero-stats">
              <div className="fp-hstat">
                <div className="fp-hstat-val" style={{ color: "var(--teal)" }}>{profile.active_courses}</div>
                <div className="fp-hstat-lbl">Active Courses</div>
              </div>
              <div className="fp-hstat">
                <div className="fp-hstat-val" style={{ color: "var(--indigo-ll)" }}>{profile.total_students}</div>
                <div className="fp-hstat-lbl">Total Students</div>
              </div>
            </div>
          </div>
          <button className="fp-edit-btn" onClick={() => setEditing(e => !e)}>
            <IcoEdit /> Edit Profile
          </button>
        </div>
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
                    <button className="fp-btn fp-btn-ghost" onClick={() => { setBioEdit(profile.bio || ""); setEditing(false); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="fp-bio">{profile.bio || "No bio added yet."}</p>
              )}
            </div>

            {/* SKILLS */}
            <div className="fp-card">
              <div className="fp-card-hd"><span className="fp-card-title"><IcoFlask /> Skills &amp; Expertise</span></div>
              <div className="fp-skills-wrap">
                {(profile.skills || []).map(s => (
                  <span key={s} className="fp-skill-tag">{s}</span>
                ))}
                {(!profile.skills || profile.skills.length === 0) && (
                  <span style={{ fontSize: 12, color: "var(--text3)", padding: "4px 8px" }}>No skills added yet.</span>
                )}
                <span className="fp-skill-tag fp-skill-add"><IcoPlus /> Add</span>
              </div>
            </div>

            {/* CONTACT */}
            <div className="fp-card">
              <div className="fp-card-hd"><span className="fp-card-title"><IcoLink /> Contact &amp; Links</span></div>
              <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: <IcoMail />, label: "Email",   val: profile.email },
                  profile.phone && { icon: <IcoPhone />, label: "Phone",   val: profile.phone },
                ].filter(Boolean).map(r => (
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
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>Avg Rating · {profile.total_students} students</div>
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
                {(profile.courses || []).map(c => (
                  <div key={c.code} className="fp-course-card" style={{ borderColor: c.color + "33" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, fontSize: 11, fontWeight: 800 }}>{c.code.replace("CS", "")}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text3)" }}>{c.code} · {c.semester}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}><span style={{ color: c.color, fontWeight: 700 }}>{c.student_count}</span> students</span>
                    </div>
                  </div>
                ))}
                {(!profile.courses || profile.courses.length === 0) && (
                  <div style={{ fontSize: 13, color: "var(--text3)", padding: 8 }}>No courses assigned yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === "achievements" && (
          <div className="fp-grid">
            <div className="fp-card fp-card-full">
              <div className="fp-card-hd"><span className="fp-card-title"><IcoAward /> Awards &amp; Achievements</span></div>
              <div style={{ padding: "24px 20px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                <IcoTrend style={{ width: 36, height: 36, opacity: 0.2, marginBottom: 10, display: "block", margin: "0 auto 10px" }} />
                Achievements will be shown here once data is available.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}