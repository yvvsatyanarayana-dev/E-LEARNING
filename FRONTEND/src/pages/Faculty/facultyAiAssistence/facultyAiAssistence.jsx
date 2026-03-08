// aiAssistant.jsx  —  place at: src/pages/Faculty/aiAssistant/aiAssistant.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import "./facultyAiAssistence.css";

const IcoChevL  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoSend   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none"/></svg>;
const IcoClose  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoBrain  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;
const IcoZap    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoTrash  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>;

const SUGGESTIONS = [
  { icon:"📊", label:"Quiz Performance",    prompt:"Give me a summary of quiz performance across all courses this week." },
  { icon:"⚠️", label:"At-Risk Students",    prompt:"Which students are at risk due to low attendance or scores?" },
  { icon:"📝", label:"Generate Quiz",       prompt:"Generate a 10-question MCQ quiz on Memory Management for OS Unit III." },
  { icon:"📅", label:"Today's Schedule",    prompt:"What's on my schedule today and what should I prepare?" },
  { icon:"🎯", label:"Weak Topics",         prompt:"What are the weak topics detected across my classes this semester?" },
  { icon:"📋", label:"Grade Summary",       prompt:"Summarize the grade distribution for all courses this semester." },
  { icon:"🔔", label:"Pending Tasks",       prompt:"What are my pending tasks and deadlines this week?" },
  { icon:"💡", label:"Teaching Tips",       prompt:"Suggest teaching strategies for students struggling with Deadlock concepts in OS." },
];

const AI_REPLIES = [
  "Based on this week's quiz data: <br/><br/>📊 <strong style='color:var(--indigo-ll)'>OS (CS501):</strong> Avg 74% · 18 students below 50%<br/>📊 <strong style='color:var(--teal)'>DBMS (CS502):</strong> Avg 68% · 21 students below 50%<br/>📊 <strong style='color:var(--violet)'>CA (CS503):</strong> Avg 79% · 11 students below 50%<br/><br/>🔴 Common weak areas: <strong>Deadlock Detection</strong> (OS), <strong>Transaction Isolation</strong> (DBMS). Want remedial quizzes generated?",
  "⚠️ Students requiring immediate attention:<br/><br/><strong style='color:var(--rose)'>High Risk:</strong> Dev Iyer (21CS008) — 62% attendance, 48% score<br/><strong style='color:var(--rose)'>High Risk:</strong> Kiran Rao (21CS033) — 58% attendance, 42% score<br/><strong style='color:var(--rose)'>High Risk:</strong> Ajay Shetty (21CS148) — 55% attendance, 38% score<br/><br/>Recommend: Parent notification + remedial sessions. Shall I draft those emails?",
  "✅ Generated 10 MCQ questions on <strong style='color:var(--teal)'>Memory Management (OS Unit III)</strong>:<br/><br/>Q1. Which page replacement algorithm suffers from Belady's anomaly? <em>(FIFO)</em><br/>Q2. In demand paging, a page fault occurs when...? <em>(page not in memory)</em><br/>Q3–Q10 ready. <br/><br/>Difficulty: 40% Easy · 40% Medium · 20% Hard. Add to Question Bank?",
  "📅 Today's schedule (Fri, Oct 26):<br/><br/>🟢 9:00–10:00 · <strong>OS Lecture 34</strong> — Room 301. Topic: File Systems<br/>🟡 10:30–11:30 · <strong>OS Quiz Review</strong> — Faculty Office<br/>🔵 13:00–14:30 · <strong>DBMS Lab Batch B</strong> — Lab 2<br/>🟣 15:00–16:00 · <strong>CA Lecture 29</strong> — Room 102<br/>🔴 16:30 · <strong>Department Meeting</strong><br/><br/>Preparation tip: Review Round Robin examples for the OS quiz discussion.",
  "🎯 Top weak topics detected this semester:<br/><br/><span style='color:var(--rose)'>1. Deadlock Detection</span> — 34 students (OS)<br/><span style='color:var(--amber)'>2. Transaction Isolation Levels</span> — 41 students (DBMS)<br/><span style='color:var(--rose)'>3. Page Replacement Algorithms</span> — 28 students (OS)<br/><span style='color:var(--violet)'>4. Cache Coherence</span> — 19 students (CA)<br/><br/>Want me to auto-generate targeted practice material for each topic?",
];

let replyIdx = 0;

export default function AiAssistant({ onBack }) {
  const [messages, setMessages] = useState([
    { role:"ai", html:"Hello Dr. Prakash! 👋 I'm <strong style='color:var(--indigo-ll)'>Lucyna</strong>, your AI teaching assistant.<br/><br/>I can help you analyze student performance, generate quizzes and question papers, track attendance trends, identify at-risk students, and much more.<br/><br/>What would you like to work on today?" },
  ]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const msgRef = useRef();

  useEffect(() => {
    if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight;
  }, [messages, typing]);

  const send = useCallback((text) => {
    const val = (text || input).trim();
    if (!val) return;
    setMessages(m => [...m, { role:"user", html: val }]);
    setInput(""); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role:"ai", html: AI_REPLIES[replyIdx % AI_REPLIES.length] }]);
      replyIdx++;
    }, 1100);
  }, [input]);

  const clearChat = () => { setMessages([{ role:"ai", html:"Chat cleared. How can I help you, Dr. Prakash?" }]); replyIdx = 0; };

  return (
    <div className="ai-root">
      <div className="ai-page-hd">
        <div>
          <button className="ai-back-btn" onClick={onBack}><IcoChevL style={{width:13,height:13}}/> Dashboard</button>
          <div className="greet-title" style={{marginBottom:2}}>AI Assistant</div>
          <div className="greet-sub">Powered by Lucyna — your intelligent teaching co-pilot</div>
        </div>
        <div className="ai-hd-right">
          <button className="btn btn-ghost" style={{display:"flex",alignItems:"center",gap:6,fontSize:12}} onClick={clearChat}>
            <IcoTrash style={{width:12,height:12}}/> Clear Chat
          </button>
        </div>
      </div>

      <div className="ai-layout">
        {/* Suggestions sidebar */}
        <div className="ai-sidebar">
          <div className="ai-sidebar-title">
            <IcoZap style={{width:12,height:12,color:"var(--amber)"}}/> Quick Actions
          </div>
          <div className="ai-suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s.label} className="ai-sugg-btn" onClick={()=>send(s.prompt)}>
                <span className="ai-sugg-icon">{s.icon}</span>
                <span className="ai-sugg-label">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="ai-capability-list">
            <div className="ai-cap-title">Capabilities</div>
            {["Analyze quiz & grade data","Identify at-risk students","Generate quiz questions","Summarize class performance","Draft parent/student emails","Create question papers","Track attendance trends","Suggest teaching strategies"].map(c=>(
              <div key={c} className="ai-cap-item">✦ {c}</div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="ai-chat-wrap">
          <div className="ai-messages" ref={msgRef}>
            {messages.map((m,i) => (
              <div key={i} className={`ai-msg ${m.role==="user"?"ai-msg--user":""}`}>
                <div className={`ai-msg-avatar ${m.role==="ai"?"ai-av":"usr-av"}`}>
                  {m.role==="ai" ? <IcoBrain style={{width:14,height:14,stroke:"#fff"}}/> : "P"}
                </div>
                <div className={`ai-msg-bubble ai-msg-bubble--${m.role}`} dangerouslySetInnerHTML={{__html:m.html}}/>
              </div>
            ))}
            {typing && (
              <div className="ai-msg">
                <div className="ai-msg-avatar ai-av"><IcoBrain style={{width:14,height:14,stroke:"#fff"}}/></div>
                <div className="ai-msg-bubble ai-msg-bubble--ai">
                  <div className="ai-typing-dots"><span/><span/><span/></div>
                </div>
              </div>
            )}
          </div>

          <div className="ai-input-area">
            <div className="ai-input-wrap">
              <textarea
                className="ai-input"
                value={input}
                placeholder="Ask about students, grades, quizzes, schedules…"
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } }}
                rows={1}
              />
              {input && (
                <button className="ai-clear-btn" onClick={()=>setInput("")}><IcoClose style={{width:10,height:10}}/></button>
              )}
            </div>
            <button className={`ai-send-btn ${input.trim()?"ai-send-btn--active":""}`} onClick={()=>send()} disabled={!input.trim()}>
              <IcoSend style={{width:14,height:14,stroke:"#fff"}}/>
            </button>
          </div>
          <div className="ai-input-hint">Press Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </div>
  );
}