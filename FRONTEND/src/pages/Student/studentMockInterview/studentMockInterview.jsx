// studentMockInterviews.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import "./studentMockInterview.css";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoBack    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoMic     = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IcoCode    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const IcoBrain   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.84A2.5 2.5 0 0 1 9.5 2"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.84A2.5 2.5 0 0 0 14.5 2"/></svg>;
const IcoLayout  = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>;
const IcoStar    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoPlay    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoChevR   = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoClose   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoSend    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="#fff" stroke="none"/></svg>;
const IcoZap     = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoCal     = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoBook    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;

// ─── DATA ────────────────────────────────────────────────────────
const SESSION_HISTORY = [
  {
    id: 1, company: "Flipkart", type: "DSA Round", date: "Mar 07", time: "03:00 PM",
    score: 84, logo: "F", logoBg: "rgba(244,165,53,.15)", logoColor: "var(--amber)",
    duration: "45 min", questions: 3, solved: 3,
    feedback: { problemSolving: 88, codeQuality: 82, timeManagement: 76, communication: 71 },
    summary: "Strong approach on all three problems. Clean transitions from brute-force to optimal. Talk through edge cases before coding.",
    tags: ["Arrays", "Two Pointer", "Hash Map"],
  },
  {
    id: 2, company: "Amazon", type: "System Design", date: "Mar 10", time: "11:00 AM",
    score: 78, logo: "A", logoBg: "rgba(255,153,0,.15)", logoColor: "#FF9900",
    duration: "60 min", questions: 2, solved: 2,
    feedback: { problemSolving: 80, codeQuality: 74, timeManagement: 82, communication: 68 },
    summary: "Good grasp of scalability concepts. Improve on deep-dives into trade-offs, especially CAP theorem applications.",
    tags: ["System Design", "Scalability", "CAP Theorem"],
  },
  {
    id: 3, company: "Razorpay", type: "Behavioural Round", date: "Feb 28", time: "02:00 PM",
    score: 71, logo: "R", logoBg: "rgba(39,201,176,.12)", logoColor: "var(--teal)",
    duration: "30 min", questions: 5, solved: 5,
    feedback: { problemSolving: 70, codeQuality: 65, timeManagement: 78, communication: 80 },
    summary: "Good storytelling. Use the STAR framework more consistently — especially for conflict resolution scenarios.",
    tags: ["HR", "Behavioural", "STAR Method"],
  },
];

const ROUND_TYPES = [
  { id: "technical",    label: "Technical DSA",   icon: <IcoCode />,   color: "var(--teal)",     desc: "Data structures, algorithms, and problem solving. Adaptive difficulty based on your current skill level.", duration: "45–60 min", rounds: 3 },
  { id: "system",       label: "System Design",    icon: <IcoLayout />, color: "var(--violet)",   desc: "Design scalable systems — URL shorteners, social feeds, payment gateways. Real interview scenarios.", duration: "60 min", rounds: 2 },
  { id: "behavioural",  label: "Behavioural / HR", icon: <IcoMic />,    color: "var(--amber)",    desc: "STAR-format questions on teamwork, conflict, leadership, and past projects. AI evaluates clarity and structure.", duration: "30 min", rounds: 5 },
  { id: "aptitude",     label: "Aptitude & Logic", icon: <IcoBrain />,  color: "var(--indigo-l)", desc: "Quantitative, logical reasoning, and verbal ability. Common in tier-1 mass recruiters like TCS, Infosys.", duration: "40 min", rounds: 25 },
];

const QUESTION_BANK_SAMPLE = [
  { id: "q1", topic: "Arrays",         difficulty: "Medium", title: "Two Sum",                    asked: ["Google", "Amazon"],     times: 142 },
  { id: "q2", topic: "Trees",          difficulty: "Hard",   title: "Serialize & Deserialize BST", asked: ["Microsoft", "Flipkart"], times: 98 },
  { id: "q3", topic: "System Design",  difficulty: "Hard",   title: "Design Twitter Feed",         asked: ["Amazon", "Google"],     times: 87 },
  { id: "q4", topic: "DP",             difficulty: "Hard",   title: "Longest Common Subsequence",  asked: ["Adobe", "Infosys"],     times: 114 },
  { id: "q5", topic: "Behavioural",    difficulty: "Easy",   title: "Tell me about yourself",      asked: ["All Companies"],        times: 300 },
  { id: "q6", topic: "Graphs",         difficulty: "Medium", title: "Number of Islands",           asked: ["Flipkart", "Swiggy"],   times: 76 },
];

const AI_INTERVIEW_MESSAGES = [
  { role: "ai", text: "Hi Arjun! 👋 I'll be your interviewer today for the **Flipkart SDE-1 DSA Round**. We'll cover 2–3 problems over the next 45 minutes. Ready to begin?" },
  { role: "user", text: "Yes, let's go!" },
  { role: "ai", text: "Great! Here's your first problem:\n\n**Problem:** Given an array of integers and a target sum, return the indices of two numbers that add up to the target. Assume exactly one solution exists.\n\nExample: `nums = [2, 7, 11, 15], target = 9` → `[0, 1]`\n\nTake a moment to think aloud before coding." },
];

// ─── BAR COMPONENT ───────────────────────────────────────────────
function Bar({ pct, color, delay = 400, height = 4 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height, background: "var(--surface3)", borderRadius: 3, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3, transition: "width 1.1s cubic-bezier(.16,1,.3,1)" }} />
    </div>
  );
}

// ─── SPIDER / RADAR CHART ─────────────────────────────────────────
function RadarChart({ data }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
  const cx = 110, cy = 110, r = 80;
  const n = data.length;
  const getPoint = (idx, val) => {
    const angle = (idx / n) * 2 * Math.PI - Math.PI / 2;
    const dist = (val / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };
  const getGridPoint = (idx, pct) => {
    const angle = (idx / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + (pct / 100 * r) * Math.cos(angle), y: cy + (pct / 100 * r) * Math.sin(angle) };
  };
  const polyPoints = data.map((d, i) => {
    const pt = getPoint(i, animated ? d.value : 0);
    return `${pt.x},${pt.y}`;
  }).join(" ");

  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      {/* Grid rings */}
      {[25, 50, 75, 100].map(pct => {
        const pts = Array.from({ length: n }, (_, i) => {
          const p = getGridPoint(i, pct);
          return `${p.x},${p.y}`;
        }).join(" ");
        return <polygon key={pct} points={pts} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1" />;
      })}
      {/* Axis lines */}
      {data.map((d, i) => {
        const pt = getGridPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="rgba(255,255,255,.06)" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <polygon
        points={polyPoints}
        fill="rgba(91,78,248,.15)"
        stroke="var(--indigo-l)"
        strokeWidth="2"
        style={{ transition: "all 1.2s cubic-bezier(.16,1,.3,1)" }}
      />
      {/* Dots */}
      {data.map((d, i) => {
        const pt = getPoint(i, animated ? d.value : 0);
        return <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="var(--indigo-ll)" style={{ transition: "all 1.2s cubic-bezier(.16,1,.3,1)" }} />;
      })}
      {/* Labels */}
      {data.map((d, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + (r + 18) * Math.cos(angle);
        const ly = cy + (r + 18) * Math.sin(angle);
        const anchor = lx < cx - 5 ? "end" : lx > cx + 5 ? "start" : "middle";
        return (
          <text key={i} x={lx} y={ly + 3} textAnchor={anchor} fill="var(--text3)" fontSize="9" fontFamily="'Plus Jakarta Sans',sans-serif">{d.label}</text>
        );
      })}
    </svg>
  );
}

// ─── SESSION REVIEW MODAL ────────────────────────────────────────
function SessionReview({ session, onClose }) {
  if (!session) return null;
  const radarData = [
    { label: "Problem Solving",  value: session.feedback.problemSolving },
    { label: "Code Quality",     value: session.feedback.codeQuality },
    { label: "Communication",    value: session.feedback.communication },
    { label: "Time Management",  value: session.feedback.timeManagement },
  ];
  return (
    <>
      <div className="mi-modal-overlay" onClick={onClose} />
      <div className="mi-modal">
        <div className="mi-modal-header">
          <div className="mi-modal-logo" style={{ background: session.logoBg, color: session.logoColor }}>{session.logo}</div>
          <div>
            <div className="mi-modal-company">{session.company} · {session.type}</div>
            <div className="mi-modal-date">{session.date} · {session.time} · {session.duration}</div>
          </div>
          <button className="mi-modal-close" onClick={onClose}><IcoClose /></button>
        </div>

        <div className="mi-modal-body">
          <div className="mi-modal-score-section">
            <div className="mi-modal-score-big">
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 56, color: session.score >= 80 ? "var(--teal)" : session.score >= 70 ? "var(--amber)" : "var(--rose)", lineHeight: 1 }}>{session.score}</span>
              <span style={{ color: "var(--text3)", fontSize: 14, alignSelf: "flex-end", marginBottom: 6 }}>/100</span>
            </div>
            <RadarChart data={radarData} />
          </div>

          <div className="mi-modal-detail">
            <div className="mi-modal-section">
              <div className="mi-modal-section-ttl">Performance Breakdown</div>
              {Object.entries(session.feedback).map(([key, val], i) => {
                const label = key.replace(/([A-Z])/g, ' $1').trim();
                const color = val >= 80 ? "var(--teal)" : val >= 70 ? "var(--indigo-l)" : val >= 60 ? "var(--amber)" : "var(--rose)";
                return (
                  <div key={key} className="mi-fb-row">
                    <span className="mi-fb-lbl">{label}</span>
                    <Bar pct={val} color={color} delay={300 + i * 80} />
                    <span style={{ fontSize: 11, fontWeight: 700, color, width: 28, textAlign: "right", flexShrink: 0 }}>{val}</span>
                  </div>
                );
              })}
            </div>

            <div className="mi-modal-section">
              <div className="mi-modal-section-ttl">AI Feedback Summary</div>
              <div className="mi-modal-summary">{session.summary}</div>
            </div>

            <div className="mi-modal-section">
              <div className="mi-modal-section-ttl">Topics Covered</div>
              <div className="mi-tags-wrap">
                {session.tags.map(t => <span key={t} className="mi-topic-tag">{t}</span>)}
              </div>
            </div>

            <div className="mi-modal-section">
              <div className="mi-modal-section-ttl">Quick Stats</div>
              <div className="mi-modal-quick-stats">
                <div className="mi-qs-item"><span style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "var(--teal)" }}>{session.solved}/{session.questions}</span><span>Questions<br/>Solved</span></div>
                <div className="mi-qs-item"><span style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "var(--indigo-ll)" }}>{session.duration}</span><span>Total<br/>Duration</span></div>
                <div className="mi-qs-item"><span style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "var(--amber)" }}>{session.score >= 80 ? "A" : session.score >= 70 ? "B+" : "B"}</span><span>Grade</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mi-modal-footer">
          <button className="mi-btn-ghost" onClick={onClose}><IcoClose /> Close</button>
          <button className="mi-btn-solid"><IcoPlay /> Retry This Round</button>
        </div>
      </div>
    </>
  );
}

// ─── SIMULATOR SCREEN ────────────────────────────────────────────
function SimulatorScreen({ type, onBack }) {
  const [messages, setMessages] = useState(AI_INTERVIEW_MESSAGES);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [timer, setTimer]       = useState(0);
  const [running] = useState(true);
  const msgRef    = useRef();
  const timerRef  = useRef();

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight;
  }, [messages, typing]);

  const mins = String(Math.floor(timer / 60)).padStart(2, "0");
  const secs = String(timer % 60).padStart(2, "0");

  const AI_REPLIES = [
    "Good thinking! Your approach is correct. Now, can you optimize this from O(n²) to O(n)? What data structure would help here?",
    "Nice! That's the optimal solution. Time complexity is O(n), space is O(n). Well done. Let's move to problem 2.",
    "Interesting approach. Walk me through the edge cases — what happens when the array is empty or has just one element?",
    "That's correct. Your explanation was clear and structured. I'd note — always mention complexity before diving into code during real interviews.",
  ];

  const [replyIdx, setReplyIdx] = useState(0);

  const send = useCallback(() => {
    const val = input.trim();
    if (!val) return;
    setMessages(m => [...m, { role: "user", text: val }]);
    setInput(""); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: "ai", text: AI_REPLIES[replyIdx % AI_REPLIES.length] }]);
      setReplyIdx(i => i + 1);
    }, 1100);
  }, [input, replyIdx]);

  return (
    <div className="mi-simulator">
      {/* Header bar */}
      <div className="mi-sim-bar">
        <button className="mi-sim-exit" onClick={onBack}><IcoBack /> Exit</button>
        <div className="mi-sim-info">
          <span className="mi-sim-company">Flipkart DSA Round</span>
          <span className="mi-sim-live"><span className="mi-sim-pulse" /> Live Session</span>
        </div>
        <div className="mi-sim-timer">{mins}:{secs}</div>
        <div className="mi-sim-progress">
          <span>Q 1/3</span>
          <div className="mi-sim-prog-bar"><div className="mi-sim-prog-fill" style={{ width: "33%" }} /></div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="mi-sim-body">
        {/* Left: conversation */}
        <div className="mi-sim-chat">
          <div className="mi-sim-messages" ref={msgRef}>
            {messages.map((m, i) => (
              <div key={i} className={`mi-sim-msg ${m.role}`}>
                <div className={`mi-sim-av ${m.role === "ai" ? "ai" : "user"}`}>{m.role === "ai" ? "AI" : "AR"}</div>
                <div className={`mi-sim-bubble ${m.role}`}>
                  {m.text.split("\n").map((line, li) => (
                    <span key={li}>
                      {line.split(/\*\*(.*?)\*\*/).map((part, pi) =>
                        pi % 2 === 1
                          ? <strong key={pi} style={{ color: "var(--indigo-ll)" }}>{part}</strong>
                          : <span key={pi}>{part}</span>
                      )}
                      {li < m.text.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {typing && (
              <div className="mi-sim-msg ai">
                <div className="mi-sim-av ai">AI</div>
                <div className="mi-sim-bubble ai">
                  <div className="mi-typing"><span /><span /><span /></div>
                </div>
              </div>
            )}
          </div>
          <div className="mi-sim-input-row">
            <textarea
              className="mi-sim-input"
              value={input}
              placeholder="Type your answer, explain your approach, or paste code…"
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={3}
            />
            <button className="mi-sim-send" onClick={send}><IcoSend /></button>
          </div>
        </div>

        {/* Right: code editor (mock) */}
        <div className="mi-sim-editor">
          <div className="mi-editor-topbar">
            <span className="mi-editor-lang">Python 3</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["JavaScript", "C++", "Java"].map(l => (
                <button key={l} className="mi-lang-btn">{l}</button>
              ))}
            </div>
            <button className="mi-run-btn"><IcoPlay /> Run Code</button>
          </div>
          <div className="mi-editor-area">
            <div className="mi-code-lines">
              {[
                <><span className="k">def</span> <span className="fn">two_sum</span>(nums, target):</>,
                <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="c"># Your solution here</span></>,
                <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="k">seen</span> = {"{}"}</>,
                <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="k">for</span> i, num <span className="k">in</span> <span className="fn">enumerate</span>(nums):</>,
                <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;complement = target - num</>,
                <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="k">if</span> complement <span className="k">in</span> seen:</>,
                <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="k">return</span> [seen[complement], i]</>,
                <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen[num] = i</>,
                <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="k">return</span> []</>,
              ].map((line, i) => (
                <div key={i} className="mi-code-line">
                  <span className="mi-code-lnum">{i + 1}</span>
                  <span className="mi-code-text">{line}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mi-editor-output">
            <div className="mi-output-label">Output</div>
            <div className="mi-output-text" style={{ color: "var(--teal)" }}>✓ Test cases: 3/3 passed · Runtime: 52ms · Memory: 14.2 MB</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function StudentMockInterviews({ onBack }) {
  const [activeTab, setActiveTab]         = useState("home");
  const [simType, setSimType]             = useState(null);
  const [simActive, setSimActive]         = useState(false);
  const [reviewSession, setReviewSession] = useState(null);

  const tabs = [
    { id: "home",     label: "Start Interview",  icon: <IcoPlay /> },
    { id: "history",  label: "Session History",  icon: <IcoCal />,  badge: SESSION_HISTORY.length },
    { id: "bank",     label: "Question Bank",    icon: <IcoBook /> },
    { id: "insights", label: "My Insights",      icon: <IcoTrend /> },
  ];

  const avgScore = Math.round(SESSION_HISTORY.reduce((s, h) => s + h.score, 0) / SESSION_HISTORY.length);

  if (simActive) {
    return <SimulatorScreen type={simType} onBack={() => setSimActive(false)} />;
  }

  return (
    <div className="mi-root">
      <SessionReview session={reviewSession} onClose={() => setReviewSession(null)} />

      {/* ── HEADER ── */}
      <div className="mi-header">
        <div className="mi-header-left">
          <button className="mi-back" onClick={onBack}><IcoBack /> Back</button>
          <div>
            <div className="mi-breadcrumb">Career · Mock Interviews</div>
            <h1 className="mi-title">Interview <em>Simulator</em></h1>
            <p className="mi-subtitle">Practice with AI-powered real-time interviews — adaptive questions, live code evaluation, and honest feedback.</p>
          </div>
        </div>
        <div className="mi-header-stats">
          {[
            { val: SESSION_HISTORY.length, lbl: "Sessions Done",  color: "var(--indigo-ll)" },
            { val: `${avgScore}%`,         lbl: "Avg Score",      color: "var(--teal)" },
            { val: "7",                    lbl: "Streak Days 🔥", color: "var(--amber)" },
            { val: "#14",                  lbl: "Class Rank",     color: "var(--violet)" },
          ].map(s => (
            <div key={s.lbl} className="mi-hs-item">
              <span className="mi-hs-val" style={{ color: s.color }}>{s.val}</span>
              <span className="mi-hs-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="mi-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`mi-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            {t.badge && <span className="mi-tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* ══════ HOME — START ══════ */}
      {activeTab === "home" && (
        <div className="mi-home-layout">
          <div className="mi-round-grid">
            {ROUND_TYPES.map((rt, i) => (
              <div
                key={rt.id}
                className={`mi-round-card ${simType === rt.id ? "selected" : ""}`}
                style={{ animationDelay: `${i * .07}s`, "--card-color": rt.color }}
                onClick={() => setSimType(rt.id)}
              >
                <div className="mi-rc-top">
                  <div className="mi-rc-icon" style={{ color: rt.color, background: rt.color.replace("var(--", "rgba(").replace(")", ",.12)").replace("var(--teal)", "rgba(39,201,176,.12)").replace("var(--violet)", "rgba(159,122,234,.12)").replace("var(--amber)", "rgba(244,165,53,.12)").replace("var(--indigo-l)", "rgba(123,111,250,.12)") }}>
                    {rt.icon}
                  </div>
                  {simType === rt.id && <div className="mi-rc-sel-dot"><IcoCheck /></div>}
                </div>
                <div className="mi-rc-label">{rt.label}</div>
                <div className="mi-rc-desc">{rt.desc}</div>
                <div className="mi-rc-meta">
                  <span><IcoCal style={{ color: "var(--text3)", width: 11, height: 11 }} /> {rt.duration}</span>
                  <span>{rt.rounds} {rt.id === "aptitude" ? "questions" : "problems"}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mi-start-row">
            <div className="mi-company-target">
              <span className="mi-ct-label">Target Company (optional)</span>
              <div className="mi-ct-logos">
                {[
                  { logo: "G", bg: "rgba(66,133,244,.15)", color: "#4285F4" },
                  { logo: "M", bg: "rgba(0,120,212,.15)",  color: "#0078D4" },
                  { logo: "F", bg: "rgba(244,165,53,.15)", color: "var(--amber)" },
                  { logo: "A", bg: "rgba(255,153,0,.15)",  color: "#FF9900" },
                ].map((c, i) => (
                  <div key={i} className="mi-ct-logo" style={{ background: c.bg, color: c.color }}>{c.logo}</div>
                ))}
                <span style={{ fontSize: 11, color: "var(--text3)" }}>Questions tailored to company style</span>
              </div>
            </div>
            <button
              className={`mi-start-btn ${simType ? "ready" : ""}`}
              onClick={() => simType && setSimActive(true)}
              disabled={!simType}
            >
              <IcoPlay /> {simType ? `Start ${ROUND_TYPES.find(r => r.id === simType)?.label}` : "Select a round type above"}
            </button>
          </div>
        </div>
      )}

      {/* ══════ HISTORY ══════ */}
      {activeTab === "history" && (
        <div className="mi-history-layout">
          {SESSION_HISTORY.map((s, i) => (
            <div key={s.id} className="mi-history-card" style={{ animationDelay: `${i * .07}s` }}>
              <div className="mi-hc-left">
                <div className="mi-hc-logo" style={{ background: s.logoBg, color: s.logoColor }}>{s.logo}</div>
                <div>
                  <div className="mi-hc-title">{s.company} · {s.type}</div>
                  <div className="mi-hc-meta">{s.date} · {s.time} · {s.duration} · {s.solved}/{s.questions} solved</div>
                  <div className="mi-hc-tags">
                    {s.tags.map(t => <span key={t} className="mi-topic-tag sm">{t}</span>)}
                  </div>
                </div>
              </div>
              <div className="mi-hc-right">
                <div className="mi-hc-score" style={{ color: s.score >= 80 ? "var(--teal)" : s.score >= 70 ? "var(--amber)" : "var(--rose)" }}>
                  {s.score}<span style={{ fontSize: 12, color: "var(--text3)" }}>/100</span>
                </div>
                <button className="mi-review-btn" onClick={() => setReviewSession(s)}>
                  Review <IcoChevR />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════ QUESTION BANK ══════ */}
      {activeTab === "bank" && (
        <div className="mi-bank-layout">
          <div className="mi-bank-header">
            <div className="mi-bank-count"><span style={{ fontFamily: "'Fraunces',serif", fontSize: 28, color: "var(--teal)" }}>240+</span> <span style={{ color: "var(--text3)", fontSize: 12 }}>curated questions</span></div>
            <div className="mi-bank-filters">
              {["All", "Arrays", "Trees", "DP", "System Design", "Behavioural"].map(f => (
                <button key={f} className="mi-bank-chip">{f}</button>
              ))}
            </div>
          </div>
          <div className="mi-bank-table">
            <div className="mi-bt-header">
              <span>Problem</span><span>Topic</span><span>Difficulty</span><span>Asked By</span><span>Times Asked</span><span></span>
            </div>
            {QUESTION_BANK_SAMPLE.map((q, i) => (
              <div key={q.id} className="mi-bt-row" style={{ animationDelay: `${i * .05}s` }}>
                <span className="mi-bt-title">{q.title}</span>
                <span className="mi-bt-topic">{q.topic}</span>
                <span className={`mi-bt-diff mi-diff-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                <span className="mi-bt-asked">{q.asked.join(", ")}</span>
                <span className="mi-bt-times">{q.times}×</span>
                <button className="mi-bt-btn"><IcoPlay /> Practice</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════ INSIGHTS ══════ */}
      {activeTab === "insights" && (
        <div className="mi-insights-layout">
          {/* Trend chart (visual bars) */}
          <div className="mi-insight-card">
            <div className="mi-ic-hd"><span className="mi-ic-ttl"><IcoTrend style={{ color: "var(--indigo-ll)" }} /> Score Trend</span></div>
            <div className="mi-score-trend">
              {[...SESSION_HISTORY].reverse().concat([{ type: "Next Goal", score: 90, logo: "?", logoBg: "rgba(91,78,248,.1)", logoColor: "var(--indigo-ll)" }]).map((s, i, arr) => (
                <div key={i} className="mi-trend-col">
                  <div className="mi-trend-score" style={{ color: s.score >= 80 ? "var(--teal)" : s.score >= 70 ? "var(--amber)" : "var(--rose)" }}>{s.score}</div>
                  <div className="mi-trend-bar-wrap">
                    <Bar pct={s.score} color={i === arr.length - 1 ? "rgba(91,78,248,.3)" : s.score >= 80 ? "var(--teal)" : "var(--amber)"} delay={300 + i * 120} height={80} />
                  </div>
                  <div className="mi-trend-label">{s.type?.split(" ")[0]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill radar + breakdown */}
          <div className="mi-insight-row">
            <div className="mi-insight-card">
              <div className="mi-ic-hd"><span className="mi-ic-ttl"><IcoStar style={{ color: "var(--amber)" }} /> Skill Radar</span></div>
              <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
                <RadarChart data={[
                  { label: "Problem Solving", value: 79 },
                  { label: "Code Quality",    value: 74 },
                  { label: "Communication",   value: 73 },
                  { label: "Time Mgmt",       value: 79 },
                ]} />
              </div>
            </div>

            <div className="mi-insight-card">
              <div className="mi-ic-hd"><span className="mi-ic-ttl"><IcoBrain style={{ color: "var(--indigo-ll)" }} /> Weak Areas</span></div>
              <div className="mi-weak-list">
                {[
                  { topic: "Dynamic Programming", sessions: 3, avgScore: 52, color: "var(--rose)" },
                  { topic: "System Design",        sessions: 1, avgScore: 62, color: "var(--amber)" },
                  { topic: "Communication Style",  sessions: 4, avgScore: 71, color: "var(--violet)" },
                ].map((w, i) => (
                  <div key={w.topic} className="mi-weak-item">
                    <div className="mi-weak-top">
                      <span className="mi-weak-topic">{w.topic}</span>
                      <span className="mi-weak-score" style={{ color: w.color }}>{w.avgScore}%</span>
                    </div>
                    <Bar pct={w.avgScore} color={w.color} delay={400 + i * 100} />
                    <span style={{ fontSize: 9.5, color: "var(--text3)" }}>{w.sessions} sessions</span>
                  </div>
                ))}
              </div>
              <button className="mi-btn-solid" style={{ margin: "14px 20px 16px", width: "calc(100% - 40px)", justifyContent: "center", fontSize: 11 }}>
                <IcoZap /> AI Practice Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}