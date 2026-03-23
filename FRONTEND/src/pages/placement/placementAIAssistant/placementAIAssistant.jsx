/**
 * PlacementAIAssistant.jsx — SmartCampus AI Assistant
 * API calls wired using the shared api.js utility (same pattern as placementDashboard.jsx)
 *
 * APIs used:
 *   GET  /auth/me                       → officer name/initials in sidebar & chat
 *   GET  /placement/dashboard/stats     → injected as context into the AI system prompt
 *   GET  /placement/dashboard/students?limit=50 → injected as context into the AI
 *   GET  /placement/internships?limit=10 → injected as context into the AI
 *
 * AI:
 *   Calls Anthropic /v1/messages (claude-sonnet-4-20250514) with real placement data
 *   as context so Claude can answer officer questions about actual students & drives.
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth } from "../../../utils/auth.js";
import api from "../../../utils/api.js";
import "./PlacementAIAssistant.css";

/* ════════════════════════════════════════════
   DATA MAPPERS — same as placementDashboard
════════════════════════════════════════════ */
function mapApiStudent(s) {
  const placed    = s.placed_application;
  const inProcess = s.in_process_application;
  let status = "Not Ready", company = "—", pkg = "—";
  if (placed)         { status = "Placed";     company = placed.company_name ?? "—";    pkg = placed.package ?? "—"; }
  else if (inProcess) { status = "In Process"; company = inProcess.company_name ?? "—"; }
  else if ((s.pri_score ?? 0) >= 55) status = "Applied";

  return {
    name:    s.full_name ?? s.name ?? "—",
    branch:  s.department ?? "—",
    cgpa:    s.settings?.cgpa ?? s.cgpa ?? 0,
    pri:     Math.round(s.pri_score ?? s.pri ?? 0),
    skills:  (s.skills ?? []).slice(0, 3).join(", "),
    company, pkg, status,
  };
}

function mapApiDrive(d) {
  return {
    name:     d.company_name,
    role:     d.role,
    pkg:      d.package ?? "TBD",
    date:     d.deadline ? new Date(d.deadline).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "TBD",
    applied:  d.applied_count  ?? 0,
    eligible: d.eligible_count ?? 0,
    status:   d.status ?? "Upcoming",
  };
}

/* ════════════════════════════════════════════
   SUGGESTION CHIPS
════════════════════════════════════════════ */
const SUGGESTIONS = [
  "Which students are eligible for the next drive?",
  "Show me students with PRI above 85",
  "What is the placement rate for CSE branch?",
  "List students who haven't applied to any company",
  "Who are the top performers this semester?",
  "Summarize the current placement status",
];

/* ════════════════════════════════════════════
   SIDEBAR LINK
════════════════════════════════════════════ */
const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

/* ════════════════════════════════════════════
   MARKDOWN-LITE RENDERER
   Converts **bold**, bullet lists, and line breaks in AI replies
════════════════════════════════════════════ */
function renderMarkdown(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    // Bullet
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return <div key={i} style={{ paddingLeft:12, display:"flex", gap:6, marginTop:2 }}><span style={{ color:"var(--indigo-ll)", flexShrink:0 }}>•</span><span>{parts.slice(1)}</span></div>;
    }
    return <div key={i} style={{ marginTop: line.trim() === "" ? 6 : 0 }}>{parts}</div>;
  });
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function PlacementAIAssistant() {
  const navigate = useNavigate();

  /* ── API data ── */
  const [contextLoading, setContextLoading] = useState(true);
  const [dashStats,      setDashStats]      = useState(null);
  const [drives,         setDrives]         = useState([]);
  const [officerName,    setOfficerName]    = useState("Placement Officer");
  const [mailUnread,     setMailUnread]     = useState(0);

  /* ── Chat state ── */
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [aiLoading,setAiLoading]= useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const curRef         = useRef(null);
  const ringRef        = useRef(null);
  const mx = useRef(0), my = useRef(0), rx = useRef(0), ry = useRef(0);

  /* ── Custom cursor ── */
  useEffect(() => {
    const onMove = e => {
      mx.current = e.clientX; my.current = e.clientY;
      if (curRef.current) { curRef.current.style.left = e.clientX + "px"; curRef.current.style.top = e.clientY + "px"; }
    };
    const onDown = () => document.body.classList.add("c-click");
    const onUp   = () => document.body.classList.remove("c-click");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);
    let raf;
    const loop = () => {
      rx.current += (mx.current - rx.current) * 0.14;
      ry.current += (my.current - ry.current) * 0.14;
      if (ringRef.current) { ringRef.current.style.left = rx.current + "px"; ringRef.current.style.top = ry.current + "px"; }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  /* ════════════════════════════════════════════
     FETCH — load placement context for the AI
  ════════════════════════════════════════════ */
  useEffect(() => {
    const fetchContext = async () => {
      setContextLoading(true);
      try {
        const [meRes, statsRes, studentsRes, drivesRes] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/placement/dashboard/stats"),
          api.get("/placement/dashboard/students?limit=50"),
          api.get("/placement/internships?limit=10"),
          api.get("/mail/unread/count"),
        ]);

        let name = "Placement Officer";
        if (meRes.status === "fulfilled") {
          name = meRes.value.full_name ?? meRes.value.email ?? "Placement Officer";
          setOfficerName(name);
        }

        if (statsRes.status === "fulfilled") {
          setDashStats(statsRes.value);
        }

        if (studentsRes.status === "fulfilled") {
          const raw = Array.isArray(studentsRes.value) ? studentsRes.value : (studentsRes.value?.items ?? []);
          setStudents(raw.map(mapApiStudent));
        }

        if (drivesRes.status === "fulfilled") {
          const raw = Array.isArray(drivesRes.value) ? drivesRes.value : (drivesRes.value?.items ?? []);
          setDrives(raw.map(mapApiDrive));
        }

        if (results[4]?.status === "fulfilled") {
          setMailUnread(results[4].value.count || 0);
        }

        // Welcome message after context is loaded
        setMessages([{
          role: "ai",
          text: `Hello ${name.split(" ")[0]}! I'm your AI Placement Assistant. I've loaded the current placement data — ask me anything about students, drives, PRI scores, or placement analytics.`,
        }]);
      } catch (err) {
        console.error("AI Assistant context fetch error:", err);
        setMessages([{ role:"ai", text:"Hello! I'm your AI Placement Assistant. I'm having trouble loading placement data right now, but you can still ask me general placement questions." }]);
      } finally {
        setContextLoading(false);
      }
    };
    fetchContext();

    const pollUnread = setInterval(async () => {
      try {
        const res = await api.get("/mail/unread/count");
        setMailUnread(res.count || 0);
      } catch {}
    }, 30000);

    return () => clearInterval(pollUnread);
  }, []);

  /* ════════════════════════════════════════════
     BUILD SYSTEM PROMPT with real placement data
  ════════════════════════════════════════════ */
  const buildSystemPrompt = () => {
    const stats = dashStats ? `
Placement Stats:
- Total Students: ${dashStats.total_students}
- Placed Students: ${dashStats.placed_students}
- Placement Rate: ${dashStats.placement_rate}%
- Average PRI Score: ${dashStats.avg_pri}
- PRI Distribution: Excellent(${dashStats.pri_distribution?.excellent??0}), Good(${dashStats.pri_distribution?.good??0}), Fair(${dashStats.pri_distribution?.fair??0}), Needs Work(${dashStats.pri_distribution?.needs_work??0})
${dashStats.branch_stats?.length ? `Branch Stats:\n${dashStats.branch_stats.map(b=>`  ${b.branch}: ${b.placed}/${b.total} placed (${b.pct}%)`).join("\n")}` : ""}
` : "";

    const studentsSummary = students.length > 0 ? `
Student Tracker (first ${students.length} students):
${students.slice(0, 30).map(s => `- ${s.name} | ${s.branch} | CGPA:${s.cgpa} | PRI:${s.pri} | ${s.status} | ${s.company !== "—" ? s.company : "No company"} ${s.pkg !== "—" ? s.pkg : ""}`).join("\n")}
` : "";

    const drivesSummary = drives.length > 0 ? `
Active Drives:
${drives.map(d => `- ${d.name} | ${d.role} | ${d.pkg} | ${d.status} | Date:${d.date} | Applied:${d.applied}/${d.eligible}`).join("\n")}
` : "";

    return `You are an AI Placement Assistant for SmartCampus, a college placement management system. You are talking with ${officerName}, a placement officer.

Your role is to help the placement officer with:
- Analyzing student placement data and PRI scores
- Answering questions about upcoming drives and companies
- Identifying students who need attention or are drive-ready
- Providing placement analytics and insights
- Suggesting strategies to improve placement rates

Current Placement Data:
${stats}${studentsSummary}${drivesSummary}

Always be specific, data-driven, and actionable. When listing students, show their name, branch, CGPA, PRI score and current status. Keep responses concise but complete. Use bullet points (•) for lists.`;
  };

  /* ════════════════════════════════════════════
     SEND MESSAGE → Claude API
  ════════════════════════════════════════════ */
  const send = async (text) => {
    if (!text.trim() || aiLoading) return;
    const userMsg = { role:"user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAiLoading(true);
    inputRef.current?.focus();

    // Build conversation history for the API (all messages except the welcome)
    const history = [...messages.slice(1), userMsg].map(m => ({
      role:    m.role === "ai" ? "assistant" : "user",
      content: m.text,
    }));

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:     buildSystemPrompt(),
          messages:   history,
        }),
      });

      const data = await response.json();

      // Extract text from content blocks
      const reply = data.content
        ?.filter(b => b.type === "text")
        .map(b => b.text)
        .join("\n") || "I couldn't generate a response. Please try again.";

      setMessages(prev => [...prev, { role:"ai", text:reply }]);
    } catch (err) {
      console.error("Claude API error:", err);
      setMessages(prev => [...prev, {
        role: "ai",
        text: "I'm having trouble connecting right now. Please check your connection and try again.",
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const initials = officerName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "PO";
  const placementRate = dashStats?.placement_rate ?? 0;

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <>
      <div className="sc-cursor"      ref={curRef}  />
      <div className="sc-cursor-ring" ref={ringRef} />
      <div className="sc-noise" />

      <div className="app">
        {/* ══ SIDEBAR ══ */}
        <aside className="sidebar">
          <div className="sb-top">
            <Link to="/placementdashboard" className="sb-brand">
              <div className="sb-mark">SC</div>
              <span className="sb-name">SmartCampus</span>
            </Link>
          </div>
          <Link to="/placementdashboard/placementProfile" className="sb-user" style={{ textDecoration:"none" }}>
            <div className="sb-avatar">{initials}</div>
            <div>
              <div className="sb-uname">{contextLoading ? "Loading…" : officerName}</div>
              <div className="sb-urole">Placement Officer</div>
            </div>
          </Link>
          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard"                   icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/analytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>
            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students"    badge={contextLoading?"…":String(dashStats?.total_students??"")} badgeCls="teal"  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies"   badge="8"  badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink to="/placementdashboard/drives"      badge={contextLoading?"…":String(drives.filter(d=>d.status==="Upcoming").length)} badgeCls="rose" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
            <SbLink to="/placementdashboard/offers-placed" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships"   icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/placementMail" badge={mailUnread > 0 ? mailUnread : null} badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>Mail System</SbLink>
            <SbLink active to="/placementdashboard/ai-assistant" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports"             icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>
          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">{contextLoading ? "…" : `${placementRate}%`}</div>
              <div className="sb-pri-sub">{contextLoading ? "Loading data…" : `${dashStats?.placed_students??0} placed · AY 2024-25`}</div>
              <div className="sb-pri-bar">
                <div className="sb-pri-fill" style={{ width: contextLoading ? "0%" : `${placementRate}%`, transition:"width 1s ease" }} />
              </div>
            </div>
            <button className="sb-logout" onClick={() => { clearAuth(); navigate("/login", { replace:true }); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <div className="main">
          <header className="topbar">
            <span className="tb-page">AI Assistant</span>
            <div className="tb-sep" />
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background: contextLoading ? "var(--amber)" : "var(--teal)", animation:"pip-pulse 2.2s infinite" }} />
              <span style={{ fontSize:11, color: contextLoading ? "var(--amber)" : "var(--teal)", fontWeight:600 }}>
                {contextLoading ? "Loading data…" : `Online · ${students.length} students loaded`}
              </span>
            </div>
            <div className="tb-right">
              <span className="tb-date">{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</span>
              <button className="btn btn-ghost" style={{ fontSize:10, padding:"8px 14px" }}
                onClick={() => setMessages([{ role:"ai", text:`Hello ${officerName.split(" ")[0]}! Chat cleared. How can I help?` }])}>
                Clear Chat
              </button>
            </div>
          </header>

          <div className="content" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 58px)", padding:0 }}>

            {/* ── MESSAGES ── */}
            <div style={{ flex:1, overflowY:"auto", padding:"24px 30px 12px", display:"flex", flexDirection:"column", gap:14 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display:"flex", gap:12, justifyContent: m.role==="user"?"flex-end":"flex-start", animation:"msg-in .3s ease both" }}>
                  {m.role === "ai" && (
                    <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,var(--indigo),var(--violet))", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                  )}
                  <div style={{
                    maxWidth:"65%", padding:"12px 16px",
                    borderRadius: m.role==="user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: m.role==="user" ? "linear-gradient(135deg,var(--indigo),var(--violet))" : "var(--surface2)",
                    border: m.role==="ai" ? "1px solid var(--border)" : "none",
                    fontSize:13, lineHeight:1.65, color:"var(--text)",
                  }}>
                    {m.role === "ai" ? renderMarkdown(m.text) : m.text}
                  </div>
                  {m.role === "user" && (
                    <div className="sb-avatar" style={{ flexShrink:0 }}>{initials}</div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {aiLoading && (
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,var(--indigo),var(--violet))", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                  <div style={{ padding:"12px 16px", borderRadius:"14px 14px 14px 4px", background:"var(--surface2)", border:"1px solid var(--border)", display:"flex", gap:6, alignItems:"center" }}>
                    {[0,1,2].map(d => (
                      <div key={d} style={{ width:6, height:6, borderRadius:"50%", background:"var(--indigo-ll)", animation:`dot-bounce 1.4s ease-in-out ${d*0.16}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── SUGGESTION CHIPS ── */}
            {!contextLoading && (
              <div style={{ padding:"0 30px 10px", display:"flex", gap:7, flexWrap:"wrap" }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} disabled={aiLoading}
                    style={{ fontSize:10.5, padding:"6px 12px", borderRadius:20, background:"rgba(91,78,248,.08)", border:"1px solid rgba(91,78,248,.18)", color:"var(--indigo-ll)", cursor:"none", fontFamily:"inherit", transition:"background .2s", opacity: aiLoading ? 0.5 : 1 }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* ── INPUT ── */}
            <div style={{ padding:"10px 30px 24px" }}>
              <div style={{ display:"flex", gap:10, alignItems:"center", background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:14, padding:"10px 14px" }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
                  placeholder={contextLoading ? "Loading placement data…" : "Ask about students, drives, analytics, or placement data…"}
                  disabled={contextLoading || aiLoading}
                  style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:13, color:"var(--text)", fontFamily:"inherit", cursor: contextLoading?"not-allowed":"text" }}
                />
                <button onClick={() => send(input)} className="btn btn-solid"
                  style={{ fontSize:11, padding:"8px 18px", flexShrink:0 }}
                  disabled={!input.trim() || aiLoading || contextLoading}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send
                </button>
              </div>
              <div style={{ fontSize:10, color:"var(--text3)", marginTop:6, paddingLeft:4 }}>
                {contextLoading ? "🔄 Loading your placement data…" : `✅ Context: ${students.length} students, ${drives.length} drives, ${dashStats ? "stats" : "no stats"} loaded`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}