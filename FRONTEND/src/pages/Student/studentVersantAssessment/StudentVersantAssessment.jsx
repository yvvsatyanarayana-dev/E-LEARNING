import React, { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";
import "./StudentVersantAssessment.css";

const IcoAward = (p) => <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>;
const IcoClock = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcoChevR = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
const IcoMic = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IcoX = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoShield = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoType = (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;

export default function StudentVersantAssessment() {
  const [view, setView] = useState("start"); // start, permissions, precheck, testing, submitted, history
  const [testParts, setTestParts] = useState([]);
  const [currentPart, setCurrentPart] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partTimer, setPartTimer] = useState(0); 
  const [showHistory, setShowHistory] = useState(false);
  const [typingInput, setTypingInput] = useState("");
  
  const [stream, setStream] = useState(null);
  const [micActive, setMicActive] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  
  const intervalRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const analyzerRef = useRef();
  const recognitionRef = useRef();
  const animationFrameRef = useRef();

  useEffect(() => {
    fetchData();
    return () => {
       stopHardware();
       if (intervalRef.current) clearInterval(intervalRef.current);
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const parts = await api.get("/student/versant/questions");
      if (parts && parts.length > 0) {
         setTestParts(parts);
      } else {
         console.error("No assessment parts returned");
      }
      const hist = await api.get("/student/versant/history");
      setHistory(hist || []);
    } catch (err) {
      console.error("Failed to fetch assessment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [view, stream]);

  // Timers for specific parts (Open Questions or Passage Reconstruction)
  useEffect(() => {
    let partInterval;
    const part = testParts[currentPart];
    if (view === "testing" && (part?.id === "partF" || part?.id === "partH")) {
      setPartTimer(part.id === "partF" ? 45 : 30);
      partInterval = setInterval(() => {
        setPartTimer(prev => {
          if (prev <= 1) {
            clearInterval(partInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setPartTimer(0);
    }
    return () => clearInterval(partInterval);
  }, [currentPart, currentQuestion, view]);

  useEffect(() => {
    if (view === "testing" && partTimer === 0 && (testParts[currentPart]?.id === "partF" || testParts[currentPart]?.id === "partH") && timer > 0) {
      nextQuestion();
    }
  }, [partTimer]);

  const handlePermissions = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      setCamActive(true);
      setMicActive(true);
      setupVisualizer(s);
      setView("precheck");
    } catch (err) {
      alert("Microphone and Camera access are required for proctoring.");
    }
  };

  const setupVisualizer = (s) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(s);
    const analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = 64;
    source.connect(analyzer);
    analyzerRef.current = analyzer;
    draw();
  };

  const draw = () => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    
    const renderFrame = () => {
      if (!canvasRef.current) return;
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyzerRef.current.getByteFrequencyData(dataArray);
      
      const { width, height } = canvasRef.current;
      ctx.clearRect(0, 0, width, height);
      const barWidth = (width / dataArray.length) * 2;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        ctx.fillStyle = `rgba(91, 78, 248, ${0.4 + (barHeight / height)})`;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    renderFrame();
  };

  const beginTest = () => {
    setView("testing");
    setCurrentPart(0);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimer(1);
    intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };

  const stopHardware = () => {
    if (stream) {
       stream.getTracks().forEach(t => t.stop());
    }
    if (videoRef.current) {
       videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
       cancelAnimationFrame(animationFrameRef.current);
    }
    if (recognitionRef.current) {
       recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
    setStream(null);
    setCamActive(false);
    setMicActive(false);
  };

  const speakPrompt = (text, onEnd) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => {
      let finalStr = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalStr += e.results[i][0].transcript + " ";
      }
      if (finalStr) setTranscription(prev => (prev + " " + finalStr).trim());
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => recognitionRef.current?.stop();

  const nextQuestion = () => {
    const part = testParts[currentPart];
    if (!part) return;
    const finalResp = part.type === "type" ? typingInput : transcription;
    
    stopListening();
    setAnswers([...answers, { part: part.id, qIdx: currentQuestion, resp: finalResp }]);
    setTranscription("");
    setTypingInput("");

    if (currentQuestion < part.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentPart < testParts.length - 1) {
      setCurrentPart(currentPart + 1);
      setCurrentQuestion(0);
    } else {
      finishTest();
    }
  };

  const terminateAssessment = () => {
    if (window.confirm("Are you sure you want to terminate the assessment? All current progress will be lost and hardware will be disconnected.")) {
       stopHardware();
       if (intervalRef.current) clearInterval(intervalRef.current);
       setTimer(0);
       setView("start");
    }
  };

  const finishTest = async () => {
    stopHardware();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setLoading(true);
    try {
      const mappedAnswers = answers.map(a => ({
        part: a.part,
        questionIdx: a.qIdx,
        text: a.resp || ""
      }));
      await api.post("/student/versant/submit", { answers: mappedAnswers });
      setView("submitted");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to submit assessment: " + (err.response?.data?.detail || err.message));
      setView("start"); // Return to start on failure so they can retry
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading && view === "start") return <div className="versant-loading">Initialising Secure Assessment Environment...</div>;

  if (view === "start") {
    return (
      <div className="versant-wrapper">
        <div className="v-hero-card">
          <div className="v-hero-header">
            <div className="v-badge-pro"><IcoShield /> Secure Proctored Environment</div>
            <h1>Professional English Assessment</h1>
            <p>Evaluating proficiency across 8 core linguistic dimensions. Ensure you are in a quiet, well-lit environment.</p>
          </div>
          <div className="v-parts-grid">
            {testParts.map((p, i) => (
              <div key={p.id} className="v-part-card-sml">
                <div className="v-pc-num">{String.fromCharCode(65 + i)}</div>
                <div className="v-pc-info">
                  <h4>{p.title}</h4>
                  <span>{p.type === "type" ? "Typing Assessment" : "Speaking Assessment"}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="v-hero-footer">
            {testParts.length > 0 ? (
               <button className="v-btn v-btn-primary v-btn-lg" onClick={() => setView("permissions")}>Start Assessment</button>
            ) : (
               <div className="v-error-pill">Assessment currently unavailable. <button onClick={fetchData} className="v-retry-link">Retry</button></div>
            )}
            <button className="v-btn v-btn-outline" onClick={() => setShowHistory(true)}>View History</button>
          </div>
        </div>

        {/* History Modal Overlay */}
        {showHistory && (
          <div className="v-modal-overlay" onClick={() => setShowHistory(false)}>
            <div className="v-history-modal" onClick={e => e.stopPropagation()}>
              <div className="v-hm-header">
                <h2>Your Assessment History</h2>
                <button className="v-hm-close" onClick={() => setShowHistory(false)}><IcoX /></button>
              </div>
              <div className="v-hm-body">
                {history.length === 0 ? (
                  <div className="v-hm-empty">
                    <IcoFile />
                    <p>No past assessments found. Take your first test!</p>
                  </div>
                ) : (
                  <div className="v-hm-list">
                    {history.map(item => (
                      <div key={item.id} className="v-hm-item">
                        <div className="v-hm-item-head">
                          <span className="v-hm-date">{new Date(item.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                          <span className={`v-hm-status ${item.overall_score > 0 ? "evaluated" : "pending"}`}>
                            {item.overall_score > 0 ? "Evaluated" : "Pending Review"}
                          </span>
                        </div>
                        {item.overall_score > 0 && (
                          <div className="v-hm-scores">
                            <div className="v-hms-pill"><b>Overall</b>: {item.overall_score.toFixed(1)}</div>
                            <div className="v-hms-pill"><b>Fluency</b>: {item.fluency}</div>
                            <div className="v-hms-pill"><b>Mastery</b>: {item.sentence_mastery}</div>
                            <div className="v-hms-pill"><b>Vocab</b>: {item.vocabulary}</div>
                            <div className="v-hms-pill"><b>Pronunciation</b>: {item.pronunciation}</div>
                          </div>
                        )}
                        <div className="v-hm-feedback">
                          <strong>Feedback:</strong> {item.feedback || "Awaiting placement officer remarks."}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === "permissions" || view === "precheck") {
    return (
      <div className="versant-wrapper">
        <div className="v-card v-centered-card v-check-card">
           <h2>System Readiness Check</h2>
           <p>Verify your hardware status before entering the proctored session.</p>
           <div className="v-precheck-layout">
              <div className="v-preview-pro">
                 <video ref={videoRef} autoPlay muted playsInline />
                 <div className="v-video-overlay"><div className="v-pro-crosshair" /></div>
              </div>
              <div className="v-hardware-stats">
                 <div className={`v-stat-row ${camActive ? "ok" : ""}`}>
                    <div className="v-sr-icon">{camActive ? "✓" : "!"}</div>
                    <div className="v-sr-label">Camera: {camActive ? "Detected & Stable" : "Waiting..."}</div>
                 </div>
                 <div className={`v-stat-row ${micActive ? "ok" : ""}`}>
                    <div className="v-sr-icon">{micActive ? "✓" : "!"}</div>
                    <div className="v-sr-label">Microphone: {micActive ? "Active" : "Waiting..."}</div>
                 </div>
                 <div className="v-visualizer-box">
                    <canvas ref={canvasRef} width="300" height="40" />
                    <span className="v-v-label">Voice Signal Level</span>
                 </div>
              </div>
           </div>
           <div className="v-btn-group">
              {view === "permissions" ? (
                 <button className="v-btn v-btn-primary" onClick={handlePermissions}>Grant Hardware Access</button>
              ) : (
                 <button className="v-btn v-btn-primary" onClick={beginTest}>Enter Assessment Space</button>
              )}
              <button className="v-btn v-btn-outline" onClick={() => setView("start")}>Exit</button>
           </div>
        </div>
      </div>
    );
  }

  if (view === "testing") {
    const part = testParts[currentPart];
    if (!part || !part.questions) return <div className="versant-loading">Configuring Secure Stream...</div>;
    
    const q = part.questions[currentQuestion];
    if (!q) return <div className="versant-loading">Synchronizing Content...</div>;
    
    const isTyping = part.type === "type";

    return (
      <div className="versant-wrapper v-testing-mode">
        <div className="v-proctor-overlay">
           <video ref={videoRef} autoPlay muted playsInline />
           <div className="v-p-status"><div className="v-p-dot" /> RECORDING</div>
        </div>
        <div className="v-test-container">
          <header className="v-test-nav">
             <div className="v-tn-left">
                <div className="v-part-badge">{part.title}</div>
                <div className="v-step-label">Item {currentQuestion + 1} / {part.questions.length}</div>
             </div>
             <div className="v-tn-right">
                {partTimer > 0 && <div className="v-part-countdown">{partTimer}s</div>}
                <div className="v-session-timer"><IcoClock /> {formatTime(timer)}</div>
                <button className="v-btn-terminate-big" onClick={terminateAssessment} title="Terminate Assessment">
                    <IcoX /> Exit
                </button>
             </div>
          </header>
          <div className="v-progress-track"><div className="v-pt-fill" style={{ width: `${((currentPart) / testParts.length) * 100}%` }} /></div>
          <div className="v-question-box">
             <p className="v-instruction-hint">{part.desc}</p>
             <div className="v-q-display">
                {(part.id === "partA" || part.id === "partF") && <h2 className="v-q-text">{q}</h2>}
                {part.id === "partH" && partTimer > 0 && <h2 className="v-q-text">{q}</h2>}
                {part.id === "partH" && partTimer === 0 && <h2 className="v-q-text">Reconstruct the passage from memory...</h2>}
                
                {(part.id === "partB" || part.id === "partC" || part.id === "partE" || part.id === "partG") && (
                   <div className="v-audio-prompt">
                      <button className="v-btn-play-pro" onClick={() => speakPrompt(typeof q === "string" ? q : q.q || q.words.join(", "))}>
                         Play Audio Prompt
                      </button>
                   </div>
                )}
                
                {part.id === "partD" && (
                   <div className="v-build-area">
                      <button className="v-btn-play-pro" onClick={() => speakPrompt(q.words.join(", "))}>Play Word Groups</button>
                      <div className="v-phrase-cloud">
                         {q.words.map((w, i) => <span key={i} className="v-phrase-chip">{w}</span>)}
                      </div>
                   </div>
                )}
             </div>
          </div>
          <div className="v-input-zone">
             {isTyping ? (
                <div className="v-typing-area">
                   <textarea placeholder="Type your response exactly here..." value={typingInput} onChange={e => setTypingInput(e.target.value)} />
                   <div className="v-ta-footer"><span>Words: {typingInput.trim().split(/\s+/).filter(x => x).length}</span></div>
                </div>
             ) : (
                <div className="v-voice-area">
                   <div className={`v-v-visualizer ${isListening ? "active" : ""}`}>
                      <div className="v-vv-bars">{[...Array(12)].map((_, i) => <div key={i} className="v-vv-bar" />)}</div>
                   </div>
                   {transcription && <div className="v-live-transcription">"{transcription}..."</div>}
                   <div className="v-voice-controls">
                      {!isListening ? (
                         <button className="v-btn v-btn-mic-pro" onClick={startListening}><IcoMic /> Open Microphone</button>
                      ) : (
                         <button className="v-btn v-btn-mic-pro active" onClick={stopListening}><IcoMic /> Close Microphone</button>
                      )}
                   </div>
                </div>
             )}
          </div>
          <footer className="v-test-footer">
             <button className="v-btn v-btn-primary" onClick={nextQuestion}>
                {currentPart === testParts.length - 1 && currentQuestion === part.questions.length - 1 ? "Complete Assessment" : "Next Segment"}
                <IcoChevR />
             </button>
          </footer>
        </div>
      </div>
    );
  }

  if (view === "submitted") {
    return (
      <div className="versant-wrapper">
         <div className="v-card v-centered-card v-final-card">
            <div className="v-final-success">✓</div>
            <h2>Assessment Successfully Uploaded</h2>
            <p>Your linguistic profile and proctoring logs have been submitted for evaluation.</p>
            <div className="v-final-steps">
               <p>Our training and placement officers will review your submission soon. You will be notified once your certified scores are available.</p>
            </div>
            <button className="v-btn v-btn-primary" onClick={() => setView("start")}>Return to Dashboard</button>
         </div>
      </div>
    );
  }

  return null;
}
