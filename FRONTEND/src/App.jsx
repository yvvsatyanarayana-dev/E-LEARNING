import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

/* ─── RIPPLE HOOK ─────────────────────────────────── */
function useRipple() {
  const addRipple = useCallback((e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const x = e.clientX - r.left - size / 2;
    const y = e.clientY - r.top - size / 2;
    const rip = document.createElement("span");
    rip.className = "ripple";
    rip.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    el.appendChild(rip);
    setTimeout(() => rip.remove(), 560);
  }, []);
  return addRipple;
}

/* ─── MODAL COMPONENT ─────────────────────────────── */
function LoginModal({ open, onClose, onGoSignup }) {
  const addRipple = useRipple();
  const [selected, setSelected] = useState("student");

  const roles = [
    { key: "student", name: "Student", desc: "Track your progress" },
    { key: "faculty", name: "Faculty", desc: "Manage courses" },
    { key: "placement", name: "Placement", desc: "Readiness reports" },
    { key: "admin", name: "Admin", desc: "Full control" },
  ];

  return (
    <div className={`modal-overlay${open ? " open" : ""}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close ripple-host" onClick={(e) => { addRipple(e); onClose(); }}>&#x2715;</button>
        <div className="modal-logo">
          <div className="modal-logo-mark">SC</div>
          <div className="modal-logo-txt">Smart Campus</div>
        </div>
        <h3 className="modal-title">Welcome back.</h3>
        <p className="modal-sub">Sign in to your institutional account to continue.</p>
        <div className="role-picker">
          {roles.map((r) => (
            <div
              key={r.key}
              className={`role-opt ripple-host${selected === r.key ? " selected" : ""}`}
              onClick={(e) => { addRipple(e); setSelected(r.key); }}
            >
              <div className="ro-name">{r.name}</div>
              <div className="ro-desc">{r.desc}</div>
            </div>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Institutional Email</label>
          <input className="form-input" type="email" placeholder="you@university.edu" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Enter your password" />
        </div>
        <div className="form-forgot">Forgot password?</div>
        <button className="btn btn-solid btn-full ripple-host" onClick={addRipple} style={{ fontSize: 14, padding: 13 }}>Sign In</button>
        <div className="modal-footer-txt">
          New to Smart Campus? <span onClick={onGoSignup}>Create an account</span>
        </div>
      </div>
    </div>
  );
}

function SignupModal({ open, onClose, onGoLogin }) {
  const addRipple = useRipple();
  const [selected, setSelected] = useState("student");

  const roles = [
    { key: "student", name: "Student", desc: "Track my progress" },
    { key: "faculty", name: "Faculty", desc: "Manage courses" },
    { key: "placement", name: "Placement", desc: "Officer access" },
    { key: "admin", name: "Admin", desc: "Institution setup" },
  ];

  return (
    <div className={`modal-overlay${open ? " open" : ""}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close ripple-host" onClick={(e) => { addRipple(e); onClose(); }}>&#x2715;</button>
        <div className="modal-logo">
          <div className="modal-logo-mark">SC</div>
          <div className="modal-logo-txt">Smart Campus</div>
        </div>
        <h3 className="modal-title">Create your account.</h3>
        <p className="modal-sub">Join your institution on Smart Campus.</p>
        <div className="role-picker">
          {roles.map((r) => (
            <div
              key={r.key}
              className={`role-opt ripple-host${selected === r.key ? " selected" : ""}`}
              onClick={(e) => { addRipple(e); setSelected(r.key); }}
            >
              <div className="ro-name">{r.name}</div>
              <div className="ro-desc">{r.desc}</div>
            </div>
          ))}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className="form-input" type="text" placeholder="Arjun" />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-input" type="text" placeholder="Ravi" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Institutional Email</label>
          <input className="form-input" type="email" placeholder="you@university.edu" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Create a strong password" />
        </div>
        <button className="btn btn-solid btn-full ripple-host" onClick={addRipple} style={{ fontSize: 14, padding: 13 }}>Create Account</button>
        <div className="modal-footer-txt">
          Already have an account? <span onClick={onGoLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────── */
export default function SmartCampus() {
  const rootRef = useRef(null);
  const addRipple = useRipple();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const [cursorState, setCursorState] = useState("");

  const mx = useRef(0), my = useRef(0);
  const tx = useRef(0), ty = useRef(0);
  const rafRef = useRef(null);

  /* cursor animation */
  useEffect(() => {
    const onMove = (e) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    const onDown = () => {
      setCursorState("cursor-click");
      setTimeout(() => setCursorState(""), 160);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);

    const tick = () => {
      tx.current += (mx.current - tx.current) * 0.11;
      ty.current += (my.current - ty.current) * 0.11;
      setRingPos({ x: tx.current, y: ty.current });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("vis"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* modal body scroll lock */
  useEffect(() => {
    document.body.style.overflow = loginOpen || signupOpen ? "hidden" : "";
  }, [loginOpen, signupOpen]);

  const hoverOn = () => setCursorState((s) => s.includes("click") ? s : "cursor-hover");
  const hoverOff = () => setCursorState((s) => s.includes("click") ? s : "");

  const openLogin = () => { setSignupOpen(false); setLoginOpen(true); };
  const openSignup = () => { setLoginOpen(false); setSignupOpen(true); };

  return (
    <div className={`sc-root ${cursorState}`} ref={rootRef}>
      {/* ─── CURSORS ─── */}
      <div className="sc-cursor" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className="sc-cursor-ring" style={{ left: ringPos.x, top: ringPos.y }} />
      <div className="sc-noise" />

      {/* ─── MODALS ─── */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onGoSignup={openSignup}
      />
      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onGoLogin={openLogin}
      />

      {/* ─── NAV ─── */}
      <nav className="sc-nav">
        <a className="nav-brand" href="#">
          <div className="brand-mark">SC</div>
          <span className="brand-name">Smart Campus</span>
        </a>
        <ul className="nav-links">
          {["Why Us", "Tracking", "Lucyna AI", "Features"].map((item, i) => (
            <li key={i}>
              <a href={`#${["why","tracking","lucyna","features"][i]}`}
                onMouseEnter={hoverOn} onMouseLeave={hoverOff}>{item}</a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <button className="btn btn-ghost ripple-host"
            onClick={(e) => { addRipple(e); openLogin(); }}
            onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Sign In</button>
          <button className="btn btn-solid ripple-host"
            onClick={(e) => { addRipple(e); openSignup(); }}
            onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Create Account</button>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="sc-section">
        <div className="hero">
          <div className="hero-bg-grid" />
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />

          <div className="hero-left">
            <div className="eyebrow">
              <div className="eyebrow-pip" />
              <span className="eyebrow-txt">Institutional Intelligence Platform</span>
            </div>
            <h1 className="h-title">
              Track every student.<br />
              <em>Elevate every</em><br />
              outcome.
            </h1>
            <p className="h-body">
              Smart Campus unifies academic tracking, skill development, AI mentorship, and placement readiness into one institutional platform — giving colleges complete visibility into every student's journey.
            </p>
            <div className="hero-actions">
              <button className="btn btn-solid btn-lg ripple-host"
                onClick={(e) => { addRipple(e); openSignup(); }}
                onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Get Started</button>
              <button className="btn btn-outline-lg ripple-host"
                onClick={addRipple} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Schedule a Demo</button>
            </div>
            <div className="hero-stats">
              {[
                { val: "16k+", label: "Students tracked", color: "var(--indigo-l)" },
                null,
                { val: "94%", label: "Placement accuracy", color: "var(--teal)" },
                null,
                { val: "3.78", label: "Avg GPA tracked", color: "var(--amber)" },
                null,
                { val: "99%", label: "Platform uptime", color: "var(--violet)" },
              ].map((item, i) =>
                item === null ? <div key={i} className="hs-div" /> :
                <div key={i} className="hs-item">
                  <div className="hs-val" style={{ color: item.color }}>{item.val}</div>
                  <div className="hs-label">{item.label}</div>
                </div>
              )}
            </div>
          </div>

          {/* MOCKUP */}
          <div className="hero-right">
            <div className="mockup-wrap">
              <div className="mockup-inner">
                <div className="m-bar">
                  <div className="m-dot" style={{ background: "#ff5f57" }} />
                  <div className="m-dot" style={{ background: "#febc2e" }} />
                  <div className="m-dot" style={{ background: "#28c840" }} />
                  <div className="m-url">smart-campus.edu &nbsp;/&nbsp; admin / dashboard</div>
                </div>
                <div className="m-body">
                  <div className="m-stats">
                    <div className="m-stat ms1">
                      <div className="m-sval" style={{ color: "var(--indigo-l)" }}>16,892</div>
                      <div className="m-slbl">Total Students</div>
                      <div className="m-sbadge" style={{ background: "rgba(91,78,248,.1)", color: "var(--indigo-ll)" }}>+4.2% this sem</div>
                    </div>
                    <div className="m-stat ms2">
                      <div className="m-sval" style={{ color: "var(--teal)" }}>3.78</div>
                      <div className="m-slbl">Avg GPA</div>
                      <div className="m-sbadge" style={{ background: "var(--teal-d)", color: "var(--teal)" }}>+0.12 vs last</div>
                    </div>
                    <div className="m-stat ms3">
                      <div className="m-sval" style={{ color: "var(--amber)" }}>87%</div>
                      <div className="m-slbl">Attendance</div>
                      <div className="m-sbadge" style={{ background: "var(--amber-d)", color: "var(--amber)" }}>Above target</div>
                    </div>
                  </div>
                  <div className="m-prog">
                    <div className="m-prog-ttl">Skill Coverage — By Department</div>
                    {[
                      { name: "Computer Sci.", pct: 82, color: "var(--indigo-l)" },
                      { name: "Electronics", pct: 71, color: "var(--teal)" },
                      { name: "Mechanical", pct: 58, color: "var(--amber)" },
                    ].map((d, i) => (
                      <div key={i} className="m-prow">
                        <div className="m-pname">{d.name}</div>
                        <div className="m-ptrack"><div className="m-pfill" style={{ width: `${d.pct}%`, background: d.color }} /></div>
                        <div className="m-ppct" style={{ color: d.color }}>{d.pct}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="m-students">
                    <div className="m-sh">
                      <div className="m-sh-ttl">Top Students This Week</div>
                      <div className="m-sh-lnk">View all</div>
                    </div>
                    {[
                      { av: "AR", name: "Arjun R.", dept: "CS • Sem 6", score: 96, bg: "rgba(91,78,248,.18)", c: "var(--indigo-ll)", sb: "rgba(91,78,248,.12)" },
                      { av: "PM", name: "Priya M.", dept: "ECE • Sem 4", score: 93, bg: "var(--teal-d)", c: "var(--teal)", sb: "var(--teal-d)" },
                      { av: "SK", name: "Siddharth K.", dept: "MECH • Sem 3", score: 89, bg: "var(--amber-d)", c: "var(--amber)", sb: "var(--amber-d)" },
                    ].map((s, i) => (
                      <div key={i} className="m-srow">
                        <div className="m-sav" style={{ background: s.bg, color: s.c }}>{s.av}</div>
                        <div className="m-sname">{s.name}</div>
                        <div className="m-sdept">{s.dept}</div>
                        <div className="m-sscore" style={{ background: s.sb, color: s.c }}>{s.score}</div>
                      </div>
                    ))}
                  </div>
                  <div className="m-ai">
                    <div className="m-ai-orb" />
                    <div>
                      <div className="m-ai-ttl">Lucyna AI</div>
                      <div className="m-ai-sub">5 students flagged for intervention today</div>
                    </div>
                    <div className="m-ai-badge">View Insights</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY SECTION ─── */}
      <section id="why" className="sc-section why-sec">
        <div className="wrap">
          <div className="why-grid">
            <div>
              <div className="s-label">The Problem</div>
              <h2 className="s-title">Colleges lack visibility<br />into <em>student growth.</em></h2>
              <p className="s-body" style={{ maxWidth: 420 }}>
                Most institutions manage academics, skills, and placement through disconnected tools — spreadsheets, legacy LMS systems, and manual reviews. There is no unified picture of a student's journey.
              </p>
              <div className="prob-stack reveal" style={{ marginTop: 28 }}>
                {[
                  {
                    title: "No centralized academic tracking",
                    desc: "Course progress, quiz results, and assignment grades are scattered across different systems with no single view per student.",
                    icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--rose)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                  },
                  {
                    title: "Weak placement readiness signals",
                    desc: "Placement officers have no structured data on which students are truly job-ready, leading to poor matching and missed opportunities.",
                    icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--rose)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"/></svg>
                  },
                  {
                    title: "Manual evaluation processes",
                    desc: "Faculty spend hours on quiz correction and report generation that AI can automate — time better spent on actual teaching.",
                    icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--rose)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.477-3.69M9 20H4v-2a4 4 0 015.477-3.69M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  }
                ].map((p, i) => (
                  <div key={i} className="prob-card" onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                    <div className="prob-ic" style={{ background: "var(--rose-d)" }}>{p.icon}</div>
                    <div>
                      <div className="prob-title">{p.title}</div>
                      <div className="prob-desc">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="s-label">The Solution</div>
              <h2 className="s-title">One platform.<br /><em>Complete intelligence.</em></h2>
              <p className="s-body" style={{ maxWidth: 400 }}>Smart Campus consolidates every data point about every student into one institutional intelligence layer, updated in real time.</p>
              <div className="benefit-stack">
                {[
                  { num: "01", title: "Unified Student Profiles", desc: "Every student carries a living profile — courses, grades, quiz history, skill scores, project submissions, attendance, and placement readiness — updated in real time.", delay: "d1" },
                  { num: "02", title: "Faculty Gets Actionable Data", desc: "Faculty dashboards surface weak-topic detection, class engagement metrics, and individual student risk flags without any manual reporting work.", delay: "d2" },
                  { num: "03", title: "Placement Officers See the Truth", desc: "The Placement Readiness Index gives officers a ranked, evidence-based score per student — built from skill data, mock interview results, and academic performance.", delay: "d3" },
                  { num: "04", title: "Administrators Own the System", desc: "Institution-wide dashboards give admins real-time visibility across departments, course adoption rates, faculty effectiveness, and platform health.", delay: "d4" },
                ].map((b, i) => (
                  <div key={i} className={`ben-card reveal ${b.delay}`} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                    <div className="ben-num">{b.num}</div>
                    <div>
                      <div className="ben-title">{b.title}</div>
                      <div className="ben-desc">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRACKING SECTION ─── */}
      <section id="tracking" className="sc-section track-sec">
        <div className="wrap">
          <div className="track-grid">
            <div className="track-visual reveal">
              <div className="tv-hd">
                <div className="tv-ttl">Student Progress Overview</div>
                <div className="tv-period">Semester 6 • 2024</div>
              </div>
              <div className="sc-list">
                {[
                  { av: "AR", name: "Arjun Ravi", dept: "Computer Science • Sem 6", score: 96, lbl: "PRI Score", bg: "rgba(91,78,248,.15)", c: "var(--indigo-ll)", vc: "var(--indigo-l)" },
                  { av: "PM", name: "Priya Menon", dept: "Electronics • Sem 4", score: 91, lbl: "PRI Score", bg: "var(--teal-d)", c: "var(--teal)", vc: "var(--teal)" },
                  { av: "SK", name: "Siddharth Kumar", dept: "Mechanical • Sem 3", score: 78, lbl: "PRI Score", bg: "var(--amber-d)", c: "var(--amber)", vc: "var(--amber)" },
                  { av: "ND", name: "Nandini Das", dept: "Computer Science • Sem 2", score: 54, lbl: "At Risk", bg: "var(--rose-d)", c: "var(--rose)", vc: "var(--rose)" },
                ].map((s, i) => (
                  <div key={i} className="sc-row" onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                    <div className="sc-av" style={{ background: s.bg, color: s.c }}>{s.av}</div>
                    <div><div className="sc-name">{s.name}</div><div className="sc-dept">{s.dept}</div></div>
                    <div><div className="sc-score-val" style={{ color: s.vc }}>{s.score}</div><div className="sc-score-lbl">{s.lbl}</div></div>
                  </div>
                ))}
              </div>
              <div className="tv-bars" style={{ marginTop: 16 }}>
                <div className="tv-bar-ttl">Average Skill Coverage • All Departments</div>
                {[
                  { name: "Programming", pct: 82, color: "var(--indigo-l)" },
                  { name: "Comm. Skills", pct: 67, color: "var(--teal)" },
                  { name: "Problem Solving", pct: 74, color: "var(--violet)" },
                  { name: "Industry Prep", pct: 59, color: "var(--amber)" },
                ].map((b, i) => (
                  <div key={i} className="tv-brow">
                    <div className="tv-bname">{b.name}</div>
                    <div className="tv-btrack"><div className="tv-bfill" style={{ width: `${b.pct}%`, background: b.color }} /></div>
                    <div className="tv-bpct" style={{ color: b.color }}>{b.pct}%</div>
                  </div>
                ))}
              </div>
              <div className="tv-summary">
                <div className="tv-sum"><div className="tv-sval" style={{ color: "var(--indigo-l)" }}>1,300</div><div className="tv-slbl">Active Now</div></div>
                <div className="tv-sum"><div className="tv-sval" style={{ color: "var(--rose)" }}>248</div><div className="tv-slbl">At Risk</div></div>
                <div className="tv-sum"><div className="tv-sval" style={{ color: "var(--teal)" }}>87%</div><div className="tv-slbl">Attendance</div></div>
              </div>
            </div>

            <div className="track-right">
              <div className="s-label">Student Tracking</div>
              <h2 className="s-title">Know exactly where every student stands — <em>always.</em></h2>
              <p className="s-body">Smart Campus gives faculty and administrators a real-time view of each student's academic journey. From quiz performance to skill development, every data point is captured, structured, and acted upon.</p>
              <div className="tf-list">
                {[
                  {
                    delay: "d1", bg: "var(--indigo-d)", title: "Skill Growth Timeline", desc: "Visualize measurable skill improvement semester-over-semester and identify which departments need intervention before it is too late.",
                    icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--indigo-l)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  },
                  {
                    delay: "d2", bg: "var(--teal-d)", title: "At-Risk Student Flagging", desc: "Lucyna AI automatically identifies students falling behind based on attendance, submission rates, and quiz performance — before problems escalate.",
                    icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--teal)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"/></svg>
                  },
                  {
                    delay: "d3", bg: "var(--amber-d)", title: "Placement Readiness Index", desc: "A composite score per student combining academic performance, mock interview results, skill badges, and internship history for evidence-backed placement decisions.",
                    icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--amber)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                  },
                  {
                    delay: "d4", bg: "rgba(159,122,234,.1)", title: "Role-Based Visibility", desc: "Students see their own progress. Faculty see their class. Placement officers see readiness data. Admins see everything. Each role gets exactly what it needs.",
                    icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--violet)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.477-3.69M9 20H4v-2a4 4 0 015.477-3.69M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  }
                ].map((t, i) => (
                  <div key={i} className={`tf-item reveal ${t.delay}`} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                    <div className="tf-ic" style={{ background: t.bg }}>{t.icon}</div>
                    <div>
                      <div className="tf-title">{t.title}</div>
                      <div className="tf-desc">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LUCYNA SECTION ─── */}
      <section id="lucyna" className="sc-section lucyna-sec">
        <div className="wrap">
          <div className="lucyna-hd reveal">
            <div className="s-label centered">
              <span style={{ width: 18, height: 1, background: "var(--indigo)", display: "block" }} />
              &nbsp;Meet the AI&nbsp;
              <span style={{ width: 18, height: 1, background: "var(--indigo)", display: "block" }} />
            </div>
            <h2 className="s-title" style={{ textAlign: "center" }}>
              Lucyna — the intelligence<br /><em>woven into everything.</em>
            </h2>
            <p className="s-body" style={{ textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
              Lucyna is not a chatbot added on top. It is the analytical core that powers student tracking, adaptive assessments, interview simulation, and institutional reporting across the entire platform.
            </p>
          </div>
          <div className="lucyna-grid">
            <div className="lc-cards">
              {[
                { tag: "Academic", tagBg: "var(--indigo-d)", tagC: "var(--indigo-ll)", title: "Subject Assistant", desc: "Answers student doubts across any enrolled course, explains lab exercises, and clarifies assignment requirements — available at all times, every day of the semester.", delay: "" },
                { tag: "Analytics", tagBg: "var(--teal-d)", tagC: "var(--teal)", title: "Weak-Topic Detection", desc: "Analyses quiz and assessment data to identify exactly which topics are dragging down individual and class-level performance, then surfaces targeted recommendations.", delay: "d1" },
              ].map((c, i) => (
                <div key={i} className={`lc-card reveal ${c.delay}`} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                  <div className="lc-tag" style={{ background: c.tagBg, color: c.tagC }}>{c.tag}</div>
                  <div className="lc-ttl">{c.title}</div>
                  <div className="lc-desc">{c.desc}</div>
                </div>
              ))}
            </div>

            <div className="lucyna-orb-col reveal d2">
              <div className="lo-wrap">
                <div className="lo-ring lo-r1" />
                <div className="lo-ring lo-r2" />
                <div className="lo-ring lo-r3" />
                <div className="lo-core">
                  <div className="lo-name">LUCYNA</div>
                  <div className="lo-sub">AI Core</div>
                </div>
                <div className="lo-live">
                  <div className="lo-live-dot" />
                  Active • v2.4
                </div>
              </div>
            </div>

            <div className="lc-cards">
              {[
                { tag: "Placement", tagBg: "var(--amber-d)", tagC: "var(--amber)", title: "Interview Simulator", desc: "Conducts full mock interviews, scores technical and communication responses, and generates detailed improvement reports linked to each student's PRI score.", delay: "d1" },
                { tag: "Assessment", tagBg: "rgba(159,122,234,.1)", tagC: "var(--violet)", title: "Adaptive Quiz Engine", desc: "Generates AI-calibrated question papers that adjust difficulty based on class performance history, reducing manual paper-setting time for faculty significantly.", delay: "d2" },
              ].map((c, i) => (
                <div key={i} className={`lc-card reveal ${c.delay}`} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                  <div className="lc-tag" style={{ background: c.tagBg, color: c.tagC }}>{c.tag}</div>
                  <div className="lc-ttl">{c.title}</div>
                  <div className="lc-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="sc-section feat-sec">
        <div className="wrap">
          <div className="feat-hd reveal">
            <div className="s-label centered">
              <span style={{ width: 18, height: 1, background: "var(--indigo)", display: "block" }} />
              &nbsp;Platform&nbsp;
              <span style={{ width: 18, height: 1, background: "var(--indigo)", display: "block" }} />
            </div>
            <h2 className="s-title" style={{ textAlign: "center" }}>Built for every role<br /><em>on campus.</em></h2>
            <p className="s-body" style={{ textAlign: "center", maxWidth: 460, margin: "0 auto" }}>
              From students tracking their own growth to administrators monitoring institution-wide outcomes — every role has exactly the tools it needs.
            </p>
          </div>
          <div className="feat-grid">
            {[
              {
                cls: "fc1", badge: "LMS", badgeBg: "var(--indigo-d)", badgeC: "var(--indigo-ll)", title: "Course Management", delay: "",
                desc: "Faculty-structured courses with video lectures, PDF materials, coding modules, and semester-based organisation. Lucyna AI generates transcripts and summaries automatically.",
                dots: [{ pip: "var(--indigo-l)", label: "AI video transcripts" }, { pip: "var(--indigo-l)", label: "Watch-time analytics" }, { pip: "var(--indigo-l)", label: "Per-lecture doubt assistant" }]
              },
              {
                cls: "fc2", badge: "Assessment", badgeBg: "var(--teal-d)", badgeC: "var(--teal)", title: "Intelligent Quiz Engine", delay: "d1",
                desc: "Adaptive MCQs, coding challenges, and descriptive answers with AI-generated question papers, performance heatmaps, and automated weak-topic detection per student.",
                dots: [{ pip: "var(--teal)", label: "Adaptive difficulty" }, { pip: "var(--teal)", label: "Performance heatmaps" }, { pip: "var(--teal)", label: "Auto-graded coding challenges" }]
              },
              {
                cls: "fc3", badge: "Analytics", badgeBg: "rgba(159,122,234,.1)", badgeC: "var(--violet)", title: "Multi-Role Dashboards", delay: "d2",
                desc: "Students see personal growth timelines. Faculty see class-level engagement. Placement officers see PRI rankings. Admins see the complete institutional picture.",
                dots: [{ pip: "var(--violet)", label: "Skill growth timeline" }, { pip: "var(--violet)", label: "Department-level reports" }, { pip: "var(--violet)", label: "Placement trend tracking" }]
              },
              {
                cls: "fc4", badge: "Placement", badgeBg: "var(--amber-d)", badgeC: "var(--amber)", title: "Placement Readiness Engine", delay: "",
                desc: "A structured Placement Readiness Index per student, built from academic scores, mock interviews, skill assessments, and internship records with industry feedback integrated.",
                dots: [{ pip: "var(--amber)", label: "PRI score per student" }, { pip: "var(--amber)", label: "Industry feedback loop" }, { pip: "var(--amber)", label: "Internship performance tracking" }]
              },
              {
                cls: "fc5", badge: "Community", badgeBg: "var(--rose-d)", badgeC: "var(--rose)", title: "Campus Collaboration Hub", delay: "d1",
                desc: "Study groups, faculty-moderated discussion forums, project collaboration rooms, innovation idea submissions, and structured hackathon participation — all in one place.",
                dots: [{ pip: "var(--rose)", label: "Faculty-moderated threads" }, { pip: "var(--rose)", label: "Innovation submissions" }, { pip: "var(--rose)", label: "Real-time collaboration rooms" }]
              },
              {
                cls: "fc6", badge: "Security", badgeBg: "var(--indigo-d)", badgeC: "var(--indigo-ll)", title: "Enterprise-Grade Security", delay: "d2",
                desc: "Role-based access control, JWT authentication, bcrypt password hashing, CSRF protection, rate limiting, and complete audit logging — designed for institutional data protection.",
                dots: [{ pip: "var(--indigo-ll)", label: "Multi-factor authentication" }, { pip: "var(--indigo-ll)", label: "Encrypted data at rest" }, { pip: "var(--indigo-ll)", label: "HTTPS + secure headers" }]
              },
            ].map((f, i) => (
              <div key={i} className={`feat-tile ${f.cls} reveal ${f.delay}`} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                <div className="ft-badge" style={{ background: f.badgeBg, color: f.badgeC }}>{f.badge}</div>
                <div className="ft-title">{f.title}</div>
                <div className="ft-desc">{f.desc}</div>
                <div className="ft-dots">
                  {f.dots.map((d, j) => (
                    <div key={j} className="ft-dot">
                      <div className="ft-dot-pip" style={{ background: d.pip }} />
                      {d.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="sc-section cta-sec">
        <div className="cta-box reveal">
          <h2>Ready to give your college<br />complete student visibility?</h2>
          <p>Smart Campus is designed for institutions that take student outcomes seriously. Get a guided walkthrough with your academic team and see the platform built around your college's needs.</p>
          <div className="cta-btns">
            <button className="btn btn-solid btn-lg ripple-host"
              onClick={(e) => { addRipple(e); openSignup(); }}
              onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Create an Account</button>
            <button className="btn btn-outline-lg ripple-host"
              onClick={addRipple} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Contact Our Team</button>
          </div>
          <div className="cta-note">
            <span>Built for institutional use</span>
            <span className="cta-note-sep" />
            <span>Secure &amp; role-controlled</span>
            <span className="cta-note-sep" />
            <span>Deployable on your infrastructure</span>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="sc-footer">
        <div className="f-brand">
          <div className="brand-mark">SC</div>
          <div>
            <div className="f-brand-name">Smart Campus</div>
            <div className="f-copy">Institutional Learning Intelligence • Powered by Lucyna AI</div>
          </div>
        </div>
        <ul className="f-links">
          {["Platform", "Lucyna AI", "Security", "Documentation", "Contact"].map((l, i) => (
            <li key={i}><a href="#" onMouseEnter={hoverOn} onMouseLeave={hoverOff}>{l}</a></li>
          ))}
        </ul>
      </footer>
    </div>
  );
}