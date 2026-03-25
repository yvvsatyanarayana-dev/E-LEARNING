// aiAssistant.jsx  —  place at: src/pages/Faculty/aiAssistant/aiAssistant.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import api from "../../../utils/api";
import "./facultyAiAssistence.css";

const IcoChevL  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoSend   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none"/></svg>;
const IcoClose  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoBrain  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;
const IcoZap    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoTrash  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>;

let replyIdx = 0;

export default function AiAssistant({ onBack }) {
  const [messages, setMessages] = useState([
    { role:"ai", html:"Hello Dr. Prakash! 👋 I'm <strong style='color:var(--indigo-ll)'>Lucyna</strong>, your AI teaching assistant.<br/><br/>I can help you analyze student performance, generate quizzes and question papers, track attendance trends, identify at-risk students, and much more.<br/><br/>What would you like to work on today?" },
  ]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const [aiReplies, setAiReplies] = useState(["I'm processing that..."]);
  const [suggestions, setSuggestions] = useState([
    { icon: "📊", label: "Analyze student performance", prompt: "Analyze the current student performance and identify students who need attention." },
    { icon: "⚠️", label: "Find at-risk students", prompt: "Which students are at risk based on attendance and grades?" },
    { icon: "📝", label: "Generate quiz questions", prompt: "Generate 5 multiple choice quiz questions for the current course topic." },
  ]);
  const msgRef = useRef();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.get("/faculty/metadata");
        if (res.ai_replies?.length > 0) setAiReplies(res.ai_replies);
        if (res.ai_suggestions?.length > 0) setSuggestions(res.ai_suggestions);
      } catch (err) {
        console.error("Failed to load AI metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight;
  }, [messages, typing]);

  const send = useCallback(async (text) => {
    const val = (text || input).trim();
    if (!val) return;
    
    // Add user message to UI
    setMessages(m => [...m, { role:"user", html: val }]);
    setInput(""); 
    setTyping(true);

    try {
      // Build history for Groq. We map "ai" -> "assistant"
      const history = messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.html
      }));
      // Add the new user message to history
      history.push({ role: "user", content: val });

      const resp = await api.post("/faculty/ai/chat", { 
        message: val,
        messages: history
      });
      
      setTyping(false);
      setMessages(m => [...m, { role:"ai", html: resp.reply }]);
    } catch (err) {
      setTyping(false);
      setMessages(m => [...m, { role:"ai", html: "Sorry, I'm having trouble connecting to the network right now." }]);
    }
  }, [input, messages]);

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
            {suggestions.map((s, idx) => (
              <button key={idx} className="ai-sugg-btn" onClick={()=>send(s.prompt)}>
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