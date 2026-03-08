// studentPlacementPrep.jsx
import { useState, useEffect, useRef } from "react";
import "./studentPlacementPrep.css";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoArrow   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoChevR   = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoStar    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoLock    = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoPlay    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IcoCode    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const IcoMic     = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IcoFile    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoBrain   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.84A2.5 2.5 0 0 1 9.5 2"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.84A2.5 2.5 0 0 0 14.5 2"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoCal     = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoAward   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoBack    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoZap     = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

const ICON_MAP = {
  Code: <IcoCode />,
  Mic: <IcoMic />,
  Brain: <IcoBrain />,
  FileText: <IcoFile />,
  Zap: <IcoZap />,
  TrendingUp: <IcoTrend />
};

// ─── ANIMATED RING ───────────────────────────────────────────────
function PRIRing({ score }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(score), 400); return () => clearTimeout(t); }, [score]);
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;
  const tier = score >= 85 ? { label: "Excellent", color: "var(--teal)" }
             : score >= 70 ? { label: "Good", color: "var(--indigo-ll)" }
             : score >= 50 ? { label: "Average", color: "var(--amber)" }
             : { label: "Needs Work", color: "var(--rose)" };
  return (
    <div className="pri-ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="10"/>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={tier.color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.16,1,.3,1)" }}
          filter="url(#glow)"
        />
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text)" fontSize="26" fontFamily="'Fraunces',serif" fontWeight="400">{animated}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={tier.color} fontSize="10" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="700" letterSpacing="1">{tier.label.toUpperCase()}</text>
        <text x={cx} y={cy + 26} textAnchor="middle" fill="var(--text3)" fontSize="8.5" fontFamily="'Plus Jakarta Sans',sans-serif">/100</text>
      </svg>
    </div>
  );
}

function Bar({ pct, color, delay = 400 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height: 5, background: "var(--surface3)", borderRadius: 3, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3, transition: "width 1.2s cubic-bezier(.16,1,.3,1)" }}/>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function StudentPlacementPrep({ onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    import("../../../utils/api").then(({ default: api }) => {
      api.get("/student/placement").then(res => setData(res)).catch(console.error);
    });
  }, []);

  const tabs = [
    { id: "overview",   label: "Overview",       icon: <IcoTrend /> },
    { id: "companies",  label: "Companies",      icon: <IcoAward /> },
    { id: "interviews", label: "Mock Interviews",icon: <IcoMic /> },
    { id: "dsa",        label: "DSA Tracker",    icon: <IcoCode /> },
    { id: "resume",     label: "Resume Check",   icon: <IcoFile /> },
  ];

  if (!data) return <div className="pp-root" style={{ padding: 40, textAlign: "center" }}>Loading Placement Prep...</div>;

  const pri = data.placement_readiness?.pri_score || 0;
  const resumeDone = data.resume_checklist.filter(r => r.done).length;
  const resumePct  = Math.round((resumeDone / data.resume_checklist.length) * 100);

  return (
    <div className="pp-root">

      {/* ── PAGE HEADER ── */}
      <div className="pp-header">
        <div className="pp-header-left">
          <button className="pp-back" onClick={onBack}><IcoBack /> Back</button>
          <div>
            <div className="pp-breadcrumb">Career · Placement Readiness</div>
            <h1 className="pp-title">Placement Prep <em>Hub</em></h1>
            <p className="pp-subtitle">Your personalised roadmap to placement success — tracked, measured, improved.</p>
          </div>
        </div>
        <div className="pp-header-actions">
          <button className="pp-btn-ghost"><IcoFile /> Download Resume</button>
          <button className="pp-btn-solid"><IcoMic /> Start Mock Interview</button>
        </div>
      </div>

      {/* ── AI TIPS STRIP ── */}
      <div className="pp-tips-strip">
        {data.tips.map((t, i) => (
          <div key={i} className="pp-tip" style={{ animationDelay: `${i * .1}s` }}>
            <span className="pp-tip-ico" style={{ color: t.color }}>{ICON_MAP[t.icon]}</span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="pp-tabs">
        {tabs.map(tab => (
          <button key={tab.id}
            className={`pp-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ════════ OVERVIEW ════════ */}
      {activeTab === "overview" && (
        <div className="pp-grid-overview">

          {/* PRI Card */}
          <div className="pp-card pp-card-pri">
            <div className="pp-card-hd">
              <span className="pp-card-ttl"><IcoAward style={{ color: "var(--teal)" }}/> Placement Readiness Index</span>
            </div>
            <div className="pp-pri-body">
              <PRIRing score={pri} />
              <div className="pp-pri-breakdown">
                {data.pri_breakdown.map((b, i) => (
                  <div key={b.label} className="pp-pri-row">
                    <span className="pp-pri-ico" style={{ color: b.color }}>{ICON_MAP[b.icon]}</span>
                    <span className="pp-pri-lbl">{b.label}</span>
                    <Bar pct={b.score} color={b.color} delay={500 + i * 80}/>
                    <span className="pp-pri-val" style={{ color: b.color }}>{b.score}</span>
                  </div>
                ))}
                <div className="pp-pri-note">
                  <IcoZap style={{ color: "var(--amber)", flexShrink: 0 }}/>
                  Improve <strong style={{ color: "var(--amber)" }}>Resume Quality</strong> & <strong style={{ color: "var(--rose)" }}>Interview Readiness</strong> to reach <strong style={{ color: "var(--teal)" }}>Excellent</strong> tier.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="pp-col-right">
            <div className="pp-stat-row">
              {[
                { val: data.applications_count || "0",  lbl: "Applied",         color: "var(--indigo-ll)", bg: "rgba(91,78,248,.1)" },
                { val: data.shortlisted_count || "0",  lbl: "Shortlisted",      color: "var(--teal)",      bg: "rgba(39,201,176,.08)" },
                { val: data.placement_readiness?.mock_interviews_done || "0",  lbl: "Mocks Done",       color: "var(--violet)",    bg: "rgba(159,122,234,.1)" },
                { val: pri, lbl: "PRI Score",        color: "var(--amber)",     bg: "rgba(244,165,53,.1)" },
              ].map(s => (
                <div key={s.lbl} className="pp-mini-stat" style={{ background: s.bg, borderColor: s.bg.replace(".1)", ".3)").replace(".08)", ".2)") }}>
                  <div className="pp-ms-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="pp-ms-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Upcoming Drives */}
            <div className="pp-card">
              <div className="pp-card-hd">
                <span className="pp-card-ttl"><IcoCal style={{ color: "var(--indigo-ll)" }}/> Upcoming Drives</span>
                <button className="pp-card-act" onClick={() => setActiveTab("companies")}>View all <IcoChevR /></button>
              </div>
              <div className="pp-drives-list">
                {data.companies.filter(c => c.tag === "Open").map(c => (
                  <div key={c.name} className="pp-drive-item">
                    <div className="pp-drive-logo" style={{ background: c.logoBg, color: c.logoColor }}>{c.logo}</div>
                    <div className="pp-drive-info">
                      <div className="pp-drive-name">{c.name} <span>· {c.role}</span></div>
                      <div className="pp-drive-meta">Closes {c.deadline} · {c.ctc}</div>
                    </div>
                    <span className={`pp-tag pp-tag-${c.tagColor}`}>{c.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DSA Snapshot */}
            <div className="pp-card">
              <div className="pp-card-hd">
                <span className="pp-card-ttl"><IcoCode style={{ color: "var(--indigo-ll)" }}/> DSA Progress</span>
                <button className="pp-card-act" onClick={() => setActiveTab("dsa")}>Full tracker <IcoChevR /></button>
              </div>
              <div className="pp-dsa-snap">
                {data.topics.slice(0, 3).map((t, i) => (
                  <div key={t.label} className="pp-dsa-row">
                    <span className="pp-dsa-lbl">{t.label}</span>
                    <Bar pct={Math.round((t.done / t.total) * 100)} color={t.color} delay={600 + i * 100}/>
                    <span className="pp-dsa-cnt" style={{ color: t.color }}>{t.done}/{t.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ COMPANIES ════════ */}
      {activeTab === "companies" && (
        <div className="pp-companies-grid">
          {data.companies.map((c, i) => (
            <div key={c.name} className="pp-company-card" style={{ animationDelay: `${i * .06}s` }}>
              <div className="pp-cc-top">
                <div className="pp-cc-logo" style={{ background: c.logoBg, color: c.logoColor }}>{c.logo}</div>
                <div className="pp-cc-info">
                  <div className="pp-cc-name">{c.name}</div>
                  <div className="pp-cc-role">{c.role}</div>
                </div>
                <span className={`pp-tag pp-tag-${c.tagColor}`}>{c.tag}</span>
              </div>
              <div className="pp-cc-meta">
                <div className="pp-cc-meta-item">
                  <span className="pp-cc-meta-lbl">CTC</span>
                  <span className="pp-cc-meta-val" style={{ color: "var(--teal)" }}>{c.ctc}</span>
                </div>
                <div className="pp-cc-meta-item">
                  <span className="pp-cc-meta-lbl">Difficulty</span>
                  <span className="pp-cc-meta-val" style={{ color: c.difficulty === "Hard" ? "var(--rose)" : c.difficulty === "Medium" ? "var(--amber)" : "var(--teal)" }}>{c.difficulty}</span>
                </div>
                <div className="pp-cc-meta-item">
                  <span className="pp-cc-meta-lbl">Closes</span>
                  <span className="pp-cc-meta-val">{c.deadline}</span>
                </div>
              </div>
              <div className="pp-cc-actions">
                <button className="pp-cc-btn-ghost"><IcoCode /> Prep Now</button>
                <button className="pp-cc-btn-solid"><IcoArrow /> Apply</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════ MOCK INTERVIEWS ════════ */}
      {activeTab === "interviews" && (
        <div className="pp-interviews-layout">
          <div className="pp-interviews-main">

            {/* Simulator CTA */}
            <div className="pp-sim-cta">
              <div className="pp-sim-orb"/>
              <div className="pp-sim-content">
                <div className="pp-sim-tag"><IcoZap style={{ color: "var(--amber)" }}/> AI-Powered</div>
                <h2 className="pp-sim-title">Interview Simulator</h2>
                <p className="pp-sim-desc">Real-time mock interviews with adaptive questioning, live code evaluation, and AI-generated feedback on communication, clarity, and technical accuracy.</p>
                <div className="pp-sim-buttons">
                  <button className="pp-btn-solid"><IcoMic /> Start Technical Round</button>
                  <button className="pp-btn-ghost"><IcoBrain /> Behavioural Round</button>
                </div>
              </div>
            </div>

            {/* Session History */}
            <div className="pp-card">
              <div className="pp-card-hd">
                <span className="pp-card-ttl"><IcoCal style={{ color: "var(--indigo-ll)" }}/> Sessions</span>
              </div>
              <div className="pp-sessions-list">
                {data.mock_sessions.map((s, i) => (
                  <div key={i} className={`pp-session-item ${s.status}`}>
                    <div className="pp-session-left">
                      <div className={`pp-session-dot ${s.status}`}/>
                      <div>
                        <div className="pp-session-title">{s.company} · {s.type}</div>
                        <div className="pp-session-meta">{s.date} · {s.time} · {s.interviewer}</div>
                      </div>
                    </div>
                    <div className="pp-session-right">
                      {s.status === "done"
                        ? <><span className="pp-session-score" style={{ color: s.score >= 80 ? "var(--teal)" : "var(--amber)" }}>{s.score}%</span><button className="pp-session-btn">Review <IcoChevR /></button></>
                        : <button className="pp-btn-solid" style={{ padding: "6px 14px", fontSize: 11 }}><IcoPlay /> Join</button>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Panel */}
          <div className="pp-feedback-panel">
            <div className="pp-card">
              <div className="pp-card-hd">
                <span className="pp-card-ttl"><IcoStar style={{ color: "var(--amber)" }}/> Last Feedback</span>
              </div>
              <div className="pp-feedback-body">
                <div className="pp-fb-session">{data.last_feedback?.session}</div>
                <div className="pp-fb-score-big">
                  <span style={{ fontFamily: "'Fraunces',serif", fontSize: 42, color: "var(--teal)" }}>{data.last_feedback?.score}</span>
                  <span style={{ color: "var(--text3)", fontSize: 12 }}>/100</span>
                </div>
                {(data.last_feedback?.metrics || []).map((f, i) => (
                  <div key={f.label} className="pp-fb-row">
                    <span className="pp-fb-lbl">{f.label}</span>
                    <Bar pct={f.score} color={f.color} delay={400 + i * 80}/>
                    <span style={{ fontSize: 10, fontWeight: 600, color: f.color, width: 28, textAlign: "right" }}>{f.score}</span>
                  </div>
                ))}
                <div className="pp-fb-remark">
                  <strong style={{ color: "var(--teal)" }}>Strength:</strong> {data.last_feedback?.strength}<br/>
                  <strong style={{ color: "var(--amber)" }}>Improve:</strong> {data.last_feedback?.improve}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ DSA TRACKER ════════ */}
      {activeTab === "dsa" && (
        <div className="pp-dsa-layout">
          <div className="pp-dsa-overview">
            <div className="pp-dsa-total">
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 48, color: "var(--teal)", lineHeight: 1 }}>
                {data.topics.reduce((acc, t) => acc + t.done, 0)}
              </span>
              <span style={{ color: "var(--text3)", fontSize: 13 }}>
                / {data.topics.reduce((acc, t) => acc + t.total, 0)} solved
              </span>
            </div>
            <div className="pp-dsa-streak"><IcoZap style={{ color: "var(--amber)" }}/> 7-day streak 🔥</div>
          </div>
          <div className="pp-dsa-topics">
            {data.topics.map((t, i) => {
              const pct = Math.round((t.done / t.total) * 100);
              return (
                <div key={t.label} className="pp-dsa-topic-card" style={{ animationDelay: `${i * .07}s` }}>
                  <div className="pp-dsa-tc-top">
                    <span className="pp-dsa-tc-name">{t.label}</span>
                    <span className="pp-dsa-tc-pct" style={{ color: t.color }}>{pct}%</span>
                  </div>
                  <Bar pct={pct} color={t.color} delay={300 + i * 80}/>
                  <div className="pp-dsa-tc-meta">
                    <span style={{ color: "var(--text3)", fontSize: 10 }}>{t.done} of {t.total} questions</span>
                    <button className="pp-dsa-tc-btn"><IcoPlay /> Practice</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Difficulty heatmap */}
          <div className="pp-card" style={{ marginTop: 16 }}>
            <div className="pp-card-hd">
              <span className="pp-card-ttl"><IcoTrend style={{ color: "var(--indigo-ll)" }}/> Difficulty Breakdown</span>
            </div>
            <div className="pp-diff-grid">
              {(data.difficulty_breakdown || []).map(d => (
                <div key={d.level} className="pp-diff-card">
                  <div className="pp-diff-level" style={{ color: d.color }}>{d.level}</div>
                  <div className="pp-diff-count">
                    <span style={{ fontFamily: "'Fraunces',serif", fontSize: 28, color: d.color }}>{d.solved}</span>
                    <span style={{ color: "var(--text3)", fontSize: 11 }}>/{d.total}</span>
                  </div>
                  <Bar pct={Math.round(d.solved / d.total * 100)} color={d.color} delay={500}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════ RESUME CHECK ════════ */}
      {activeTab === "resume" && (
        <div className="pp-resume-layout">
          <div className="pp-resume-main">
            <div className="pp-card">
              <div className="pp-card-hd">
                <span className="pp-card-ttl"><IcoFile style={{ color: "var(--indigo-ll)" }}/> Resume Completeness — <span style={{ color: resumePct >= 80 ? "var(--teal)" : "var(--amber)" }}>{resumePct}%</span></span>
              </div>
              <div style={{ padding: "0 20px 12px" }}>
                <Bar pct={resumePct} color={resumePct >= 80 ? "var(--teal)" : "var(--amber)"} delay={300}/>
              </div>
              <div className="pp-checklist">
                {data.resume_checklist.map((item, i) => (
                  <div key={item.label} className={`pp-check-item ${item.done ? "done" : "pending"}`} style={{ animationDelay: `${i * .05}s` }}>
                    <div className={`pp-check-ico ${item.done ? "done" : ""}`}>
                      {item.done ? <IcoCheck /> : <IcoLock />}
                    </div>
                    <span className="pp-check-lbl">{item.label}</span>
                    {item.done
                      ? <span className="pp-check-status done">Complete</span>
                      : <button className="pp-check-status pending">Add now</button>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pp-resume-side">
            <div className="pp-card">
              <div className="pp-card-hd">
                <span className="pp-card-ttl"><IcoStar style={{ color: "var(--amber)" }}/> ATS Score</span>
              </div>
              <div className="pp-ats-body">
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 52, color: "var(--amber)", lineHeight: 1 }}>{data.ats_score}</div>
                <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 4 }}>ATS Compatibility Score</div>
                <div className="pp-ats-issues">
                  {(data.ats_issues || []).map(issue => (
                    <div key={issue.issue} className={`pp-ats-issue pp-ats-${issue.severity}`}>
                      <div className={`pp-ats-dot pp-ats-${issue.severity}`}/>
                      {issue.issue}
                    </div>
                  ))}
                </div>
                <button className="pp-btn-solid" style={{ width: "100%", justifyContent: "center", marginTop: 14 }}>
                  <IcoZap /> AI Resume Review
                </button>
              </div>
            </div>

            <div className="pp-card">
              <div className="pp-card-hd">
                <span className="pp-card-ttl"><IcoTrend style={{ color: "var(--indigo-ll)" }}/> Profile Strength</span>
              </div>
              <div className="pp-profile_strength">
                {(data.profile_strength || []).map((p, i) => (
                  <div key={p.label} className="pp-ps-row">
                    <span className="pp-ps-lbl">{p.label}</span>
                    <Bar pct={p.pct} color={p.color} delay={400 + i * 80}/>
                    <span style={{ fontSize: 10, fontWeight: 600, color: p.color, width: 30, textAlign: "right" }}>{p.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}