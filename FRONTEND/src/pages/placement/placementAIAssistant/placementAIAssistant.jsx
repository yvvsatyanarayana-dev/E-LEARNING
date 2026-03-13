import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PlacementAIAssistant.css";import { useNavigate } from "react-router-dom";
import { clearAuth } from "../../../utils/auth.js";
const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

const suggestions = [
  "Which students are eligible for Amazon drive?",
  "Show me students with PRI above 85",
  "What is the placement rate for CSE branch?",
  "List students who haven't applied to any company",
  "Generate a placement readiness report",
  "Who are the top performers this semester?",
];

const sampleReplies = {
  "Which students are eligible for Amazon drive?": "Based on Amazon's criteria (CGPA ≥ 7.5, CSE/IT/ECE branches), **31 students** are eligible:\n\n• Sneha Reddy – CSE, 9.4 CGPA, PRI 93\n• Arjun Sharma – CSE, 9.1 CGPA, PRI 87\n• Lakshmi S – CSE, 8.9 CGPA, PRI 84\n• Priya Nair – CSE, 8.7 CGPA, PRI 79\n• Karthik V – IT, 8.2 CGPA, PRI 72\n\n...and 26 more students. Would you like to notify them?",
  "default": "I've analyzed the placement data. Here's what I found based on your query. You can ask me to filter students, generate reports, notify students about drives, or provide detailed analytics on any metric.",
};

export default function PlacementAIAssistant() {
  const navigate = useNavigate();
  const handleLogout = () => { clearAuth(); navigate('/login',{replace:true}); };

  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello Ms. Kavitha! I'm your AI Placement Assistant. I can help you track students, manage drives, generate reports, and answer placement-related queries. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const curRef = useRef(null); const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0), rx = useRef(0), ry = useRef(0);

  useEffect(() => {
    const onMove = e => { mx.current = e.clientX; my.current = e.clientY; if (curRef.current) { curRef.current.style.left = e.clientX + "px"; curRef.current.style.top = e.clientY + "px"; } };
    const onDown = () => document.body.classList.add("c-click");
    const onUp = () => document.body.classList.remove("c-click");
    document.addEventListener("mousemove", onMove); document.addEventListener("mousedown", onDown); document.addEventListener("mouseup", onUp);
    let raf; const loop = () => { rx.current += (mx.current - rx.current) * 0.14; ry.current += (my.current - ry.current) * 0.14; if (ringRef.current) { ringRef.current.style.left = rx.current + "px"; ringRef.current.style.top = ry.current + "px"; } raf = requestAnimationFrame(loop); }; loop();
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mousedown", onDown); document.removeEventListener("mouseup", onUp); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (text) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const reply = sampleReplies[text] || sampleReplies["default"];
      setMessages(m => [...m, { role: "ai", text: reply }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <>
      <div className="sc-cursor" ref={curRef} /><div className="sc-cursor-ring" ref={ringRef} /><div className="sc-noise" />
      <div className="app">
        <aside className="sidebar">
          <div className="sb-top"><a className="sb-brand" href="#"><div className="sb-mark">SC</div><span className="sb-name">SmartCampus</span></a></div>
          <div className="sb-user"><div className="sb-avatar">KR</div><div><div className="sb-uname">Ms. Kavitha R</div><div className="sb-urole">Placement Officer</div></div></div>
          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/placementAnalytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>
            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students" badge="316" badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies" badge="5" badgeCls="amber" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink to="/placementdashboard/drives" badge="3" badgeCls="rose" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
            <SbLink to="/placementdashboard/offers-placed" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers & Placed</SbLink>
            <SbLink to="/placementdashboard/internships" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>
            <div className="sb-sec-label">Tools</div>
            <SbLink active to="/placementdashboard/ai-assistant" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>
          <div className="sb-bottom">
            <div className="sb-pri"><div className="sb-pri-lbl">Placement Rate</div><div className="sb-pri-val">68%</div><div className="sb-pri-sub">+6% vs last year · AY 2024–25</div><div className="sb-pri-bar"><div className="sb-pri-fill" style={{ width: "68%" }} /></div></div>
            <button className="sb-logout" onClick={handleLogout}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <span className="tb-page">AI Assistant</span>
            <div className="tb-sep" />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", animation: "pip-pulse 2.2s infinite" }} />
              <span style={{ fontSize: 11, color: "var(--teal)", fontWeight: 600 }}>Online · Ready</span>
            </div>
            <div className="tb-right">
              <span className="tb-date">Tue, 10 Mar</span>
              <button className="btn btn-ghost" style={{ fontSize:10, padding:"8px 14px" }} onClick={() => setMessages([{ role:"ai", text:"Hello Ms. Kavitha! I'm your AI Placement Assistant. How can I help?" }])}>Clear Chat</button>
            </div>
          </header>

          <div className="content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 58px)", padding: 0 }}>
            {/* Chat messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 30px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 12, justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "msg-in .3s ease both" }}>
                  {m.role === "ai" && (
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,var(--indigo),var(--violet))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                  )}
                  <div style={{ maxWidth: "65%", padding: "12px 16px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "linear-gradient(135deg,var(--indigo),var(--violet))" : "var(--surface2)", border: m.role === "ai" ? "1px solid var(--border)" : "none", fontSize: 13, lineHeight: 1.65, color: "var(--text)", whiteSpace: "pre-line" }}>
                    {m.text}
                  </div>
                  {m.role === "user" && (
                    <div className="sb-avatar">KR</div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,var(--indigo),var(--violet))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                  <div style={{ padding: "12px 16px", borderRadius: "14px 14px 14px 4px", background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", gap: 6, alignItems: "center" }}>
                    {[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--indigo-ll)", animation: `dot-bounce 1.4s ease-in-out ${d*0.16}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div style={{ padding: "0 30px 10px", display: "flex", gap: 7, flexWrap: "wrap" }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => send(s)} style={{ fontSize: 10.5, padding: "6px 12px", borderRadius: 20, background: "rgba(91,78,248,.08)", border: "1px solid rgba(91,78,248,.18)", color: "var(--indigo-ll)", cursor: "none", fontFamily: "inherit", transition: "background .2s" }}>{s}</button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: "10px 30px 24px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 14, padding: "10px 14px", transition: "border-color .2s" }}>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} placeholder="Ask about students, drives, analytics, or placement data…" style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--text)", fontFamily: "inherit", cursor: "text" }} />
                <button onClick={() => send(input)} className="btn btn-solid" style={{ fontSize: 11, padding: "8px 18px", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}