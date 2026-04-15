import React, { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";
import "./StudentVersantAssessment.css";

const IcoAward = (p) => <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>;
const IcoClock = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcoChevR = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
const IcoMic = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IcoX = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const TEST_PARTS = [
  { id: "partA", title: "Part A: Reading", desc: "Read the sentences as they appear on the screen.", type: "speak", count: 8 },
  { id: "partB", title: "Part B: Repeat", desc: "Listen carefully and repeat the sentence exactly.", type: "speak", count: 16 },
  { id: "partC", title: "Part C: Short Answer Questions", desc: "Answer the question with a single word or short phrase.", type: "speak", count: 8 },
  { id: "partD", title: "Part D: Sentence Builds", desc: "Rearrange the spoken phrases into a complete sentence.", type: "speak", count: 8 },
  { id: "partE", title: "Part E: Story Retelling", desc: "Listen to the story and retell it with as much detail as possible.", type: "speak", count: 2 },
  { id: "partF", title: "Part F: Open Questions", desc: "Express your opinion on the topic for 40 seconds.", type: "speak", count: 2 }
];

const QUESTIONS = {
  partA: [
    "Traffic is heavy in the city during rush hour.",
    "The new software update will be released tomorrow morning.",
    "Agricultural technology is essential for sustainable food production.",
    "Please wait for the signal before starting your response.",
    "Global economies are becoming increasingly interconnected.",
    "Innovative solutions are required for urban development.",
    "Scientific research contributes to medical breakthroughs.",
    "The conference has been rescheduled for next month."
  ],
  partB: [
    "Please leave your contact details at the reception desk.",
    "The presentation has been rescheduled for next Tuesday.",
    "Would you like to join us for a brief meeting after lunch?",
    "Can you help me find the nearest exit?",
    "The report must be submitted by the end of the day.",
    "It is important to follow all safety guidelines.",
    "We appreciate your feedback on the new project.",
    "Information technology is a rapidly growing field.",
    "The train is expected to arrive on platform four.",
    "Students should check their emails regularly for updates.",
    "Our team is working hard to meet the deadline.",
    "Environmental protection is a global responsibility.",
    "The library remains open until eight o'clock in the evening.",
    "Please ensure your microphone is working correctly.",
    "Customer satisfaction is our top priority.",
    "The workshop will provide hands-on experience for everyone."
  ],
  partC: [
    { q: "Is a cow an animal or a machine?", a: "animal" },
    { q: "Do you wear a hat on your head or your feet?", a: "head" },
    { q: "Which is longer: a minute or an hour?", a: "hour" },
    { q: "Is ice hot or cold?", a: "cold" },
    { q: "Do you read a book or eat it?", a: "read" },
    { q: "If you are hungry, do you want food or sleep?", a: "food" },
    { q: "Is a circle round or square?", a: "round" },
    { q: "Which is bigger: an ant or an elephant?", a: "elephant" }
  ],
  partD: [
    { words: ["was", "the meeting", "very productive"], correct: "the meeting was very productive" },
    { words: ["he", "to the office", "is going"], correct: "he is going to the office" },
    { words: ["we", "your feedback", "appreciate"], correct: "we appreciate your feedback" },
    { words: ["at the station", "the train", "arrived"], correct: "the train arrived at the station" },
    { words: ["lunch", "we", "had together"], correct: "we had lunch together" },
    { words: ["the report", "finished", "she"], correct: "she finished the report" },
    { words: ["is", "the weather", "sunny"], correct: "the weather is sunny" },
    { words: ["learning", "everyone", "is"], correct: "everyone is learning" }
  ],
  partE: [
    "John wanted to go hiking, but it started raining. He decided to read a book instead. Later, the sun came out and he went for a short walk.",
    "Sarah bought a new car last week. She drove it to her parents' house. They were very happy for her and celebrated with a nice dinner."
  ],
  partF: [
    "Do you prefer working in a team or independently? Why?",
    "Describe a challenging project you've worked on and how you handled it."
  ]
};

export default function StudentVersantAssessment() {
  const [view, setView] = useState("start"); // start, permissions, testing, submitted, history, results
  const [currentPart, setCurrentPart] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [partTimer, setPartTimer] = useState(0); 
  const [replayCount, setReplayCount] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [showReport, setShowReport] = useState(null);
  
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
    fetchHistory();
    return () => {
       if (stream) stream.getTracks().forEach(t => t.stop());
       if (intervalRef.current) clearInterval(intervalRef.current);
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Sync Video stream whenever view or stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [view, stream]);

  useEffect(() => {
    let partInterval;
    if (view === "testing" && TEST_PARTS[currentPart].id === "partF") {
      setPartTimer(40);
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

  // Auto-advance for timed questions (Part F)
  useEffect(() => {
    if (view === "testing" && TEST_PARTS[currentPart].id === "partF" && partTimer === 0 && timer > 0) {
      nextQuestion();
    }
  }, [partTimer]);

  const fetchHistory = async () => {
    try {
      const resp = await api.get("/student/versant/history");
      setHistory(resp);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handlePermissions = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      setCamActive(true);
      setMicActive(true);
      if (videoRef.current) videoRef.current.srcObject = s;
      setupVisualizer(s);
    } catch (err) {
      console.error("Access denied:", err);
      alert("Microphone and Camera access are required.");
    }
  };

  const setupVisualizer = (s) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(s);
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 64;
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      draw();
    } catch (e) {
      console.error("Visualizer failed:", e);
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const analyzer = analyzerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const renderFrame = () => {
      if (!canvasRef.current || !analyzerRef.current) {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyzer.getByteFrequencyData(dataArray);
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = (width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        ctx.fillStyle = `rgba(91, 78, 248, ${0.4 + (barHeight / height)})`;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    renderFrame();
  };

  const startTest = () => setView("permissions");

  const beginActualTest = () => {
    setView("testing");
    setCurrentPart(0);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimer(0);
    setTranscription("");
    intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };

  const stopHardware = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setCamActive(false);
    setMicActive(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const stopAssessment = () => {
    if (window.confirm("Are you sure you want to stop the assessment? All current progress will be lost.")) {
       stopHardware();
       if (intervalRef.current) clearInterval(intervalRef.current);
       setTimer(0);
       setView("start");
    }
  };

  const speakPrompt = (text, onEnd) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  };

  const handleManualPlayback = () => {
    const part = TEST_PARTS[currentPart];
    const q = QUESTIONS[part.id][currentQuestion];
    const text = typeof q === "string" ? q : q.q || q.words.join(", ");

    if (part.id === "partE") {
      setReplayCount(1);
      setPlayCount(prev => prev + 1);
      speakPrompt(text, () => {
        setTimeout(() => {
          speakPrompt(text, () => setReplayCount(0));
        }, 1500);
      });
    } else {
      if (playCount >= 2) return;
      setPlayCount(prev => prev + 1);
      speakPrompt(text);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported.");
    
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

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const nextQuestion = () => {
    const questions = QUESTIONS[TEST_PARTS[currentPart].id];
    stopListening();
    
    setAnswers([...answers, { 
      part: TEST_PARTS[currentPart].id, 
      qIdx: currentQuestion, 
      resp: transcription 
    }]);
    
    setTranscription("");
    setPlayCount(0);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentPart < TEST_PARTS.length - 1) {
      setCurrentPart(currentPart + 1);
      setCurrentQuestion(0);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    stopHardware();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setLoading(true);
    
    const payload = {
      overall_score: 0,
      status: "pending_evaluation",
      details: answers,
      duration: timer
    };

    try {
      await api.post("/student/versant/submit", payload);
      setView("submitted");
      fetchHistory();
    } catch (err) {
      console.error(err);
      setView("submitted");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- RENDERING ---

  if (view === "start") {
    return (
      <div className="versant-wrapper">
        <div className="v-card v-start-card">
          <div className="v-card-header">
            <div className="v-icon-box"><IcoAward size={32} /></div>
            <h1>Versant English Placement Test</h1>
            <p>This automated assessment evaluates your English speaking and listening skills. Your results will be sent to the Training & Placement Officer for evaluation.</p>
          </div>

          <div className="v-rounds-list">
             {TEST_PARTS.map((p, i) => (
                <div key={p.id} className="v-round-item">
                   <div className="v-round-num">{String.fromCharCode(65 + i)}</div>
                   <div className="v-round-info">
                      <h3>{p.title}</h3>
                      <p>{p.count} items • {p.desc}</p>
                   </div>
                </div>
             ))}
          </div>

          <div className="v-card-footer">
            <button className="v-btn v-btn-primary" onClick={startTest}>Get Started</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "permissions") {
    return (
      <div className="versant-wrapper">
        <div className="v-card v-centered-card">
           <h2>Hardware Check</h2>
           <p>Please allow access to your camera and microphone to begin the proctored test.</p>
           
           <div className="v-preview-container">
              <div className="v-video-box">
                 <video ref={videoRef} autoPlay muted playsInline />
                 {!camActive && <div className="v-video-placeholder">Camera Offline</div>}
              </div>
              <div className="v-audio-bar">
                 <canvas ref={canvasRef} width="300" height="40" />
                 <div className="v-mic-status">
                    <IcoMic className={micActive ? "active" : ""} />
                    <span>{micActive ? "Microphone Ready" : "Microphone Offline"}</span>
                 </div>
              </div>
           </div>

           <div className="v-btn-group">
              {!camActive ? (
                <button className="v-btn v-btn-primary" onClick={handlePermissions}>Grant Access</button>
              ) : (
                <button className="v-btn v-btn-primary" onClick={beginActualTest}>Begin Test</button>
              )}
              <button className="v-btn v-btn-outline" onClick={() => setView("start")}>Cancel</button>
           </div>
        </div>
      </div>
    );
  }

  if (view === "testing") {
    const part = TEST_PARTS[currentPart];
    const questions = QUESTIONS[part.id];
    const q = questions[currentQuestion];

    const playPrompt = () => {
      if (part.id === "partA" || part.id === "partF") return;
      speakPrompt(typeof q === "string" ? q : q.q || q.words.join(", "));
    };

    return (
      <div className="versant-wrapper v-testing-mode">
        <div className="v-proctor-pip">
           <video ref={videoRef} autoPlay muted playsInline />
           <div className="v-pip-label">REC • LIVE</div>
        </div>

        <div className="v-card v-test-card">
          <div className="v-test-header">
             <div className="v-part-info">
                <span className="v-badge">{part.title}</span>
                <span className="v-q-count">Item {currentQuestion + 1} of {questions.length}</span>
             </div>
             <div className="v-header-right">
                {part.id === "partF" && partTimer > 0 && (
                   <div className="v-countdown-badge">
                      <IcoClock /> {partTimer}s remaining
                   </div>
                )}
                <div className="v-timer"><IcoClock /> Session: {formatTime(timer)}</div>
                <button className="v-btn-stop" onClick={stopAssessment} title="Stop Assessment">Exit</button>
             </div>
          </div>

          <div className="v-progress-bar">
             <div className="v-progress-fill" style={{ width: `${((currentPart) / TEST_PARTS.length) * 100}%` }} />
          </div>

          <div className="v-test-content">
             <p className="v-inst">{part.desc}</p>
             
             <div className="v-question-area">
                {part.id === "partA" && <h2 className="v-read-text">{q}</h2>}
                
                {part.id === "partB" && (
                   <div className="v-listen-area">
                       <button className="v-btn-play" onClick={handleManualPlayback} disabled={playCount >= 2}>
                          {playCount >= 2 ? "❌ Plays Exhausted" : "▶ Play Audio"}
                       </button>
                   </div>
                )}

                {part.id === "partC" && (
                   <div className="v-listen-area">
                       <button className="v-btn-play" onClick={handleManualPlayback} disabled={playCount >= 2}>
                          {playCount >= 2 ? "❌ Plays Exhausted" : "▶ Play Question"}
                       </button>
                   </div>
                )}

                {part.id === "partD" && (
                   <div className="v-listen-area">
                       <button className="v-btn-play" onClick={handleManualPlayback} disabled={playCount >= 2}>
                          {playCount >= 2 ? "❌ Plays Exhausted" : "▶ Play Phrases"}
                       </button>
                      <div className="v-word-chips">
                         {q.words.map((w, i) => <span key={i} className="v-chip">{w}</span>)}
                      </div>
                   </div>
                )}

                {part.id === "partE" && (
                   <div className="v-listen-area">
                       <button className="v-btn-play" onClick={handleManualPlayback} disabled={playCount >= 1 || replayCount > 0}>
                          {playCount >= 1 ? "❌ Content Played" : "▶ Read Story Twice"}
                       </button>
                   </div>
                )}

                {part.id === "partF" && <h2 className="v-opinion-text">{q}</h2>}
             </div>

             <div className="v-response-area">
                {isListening && <canvas ref={canvasRef} className="v-visualizer-canvas" width="200" height="30" />}
                <div className="v-recording-hud">
                   <div className={`v-rec-dot ${isListening ? "active" : ""}`} />
                   <span>{isListening ? "Listening..." : "Microphone Idle"}</span>
                </div>
                {transcription && <div className="v-transcript">"{transcription}..."</div>}
                <div className="v-controls">
                   {!isListening ? (
                     <button className="v-btn v-btn-mic" onClick={startListening}><IcoMic /> Start Speaking</button>
                   ) : (
                     <button className="v-btn v-btn-mic active" onClick={stopListening}><IcoMic /> Stop Speaking</button>
                   )}
                </div>
             </div>
          </div>

          <div className="v-card-footer">
             <button className="v-btn v-btn-primary" onClick={nextQuestion}>
                {currentPart === TEST_PARTS.length - 1 && currentQuestion === questions.length - 1 ? "Finish Test" : "Next Item"}
                <IcoChevR />
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "submitted") {
    return (
      <div className="versant-wrapper">
         <div className="v-card v-centered-card v-success-card">
            <div className="v-success-icon">✓</div>
            <h2>Assessment Submitted</h2>
            <p>Your placement test has been successfully uploaded.</p>
            <div className="v-notice">
               Your recording and metadata have been forwarded to the <strong>Training & Placement Officer (TPO)</strong>. They will evaluate your performance and publish your marks soon.
            </div>
            <button className="v-btn v-btn-primary" onClick={() => setView("start")}>Finish</button>
         </div>
      </div>
    );
  }

  if (view === "history") {
    return (
      <div className="versant-wrapper">
        <div className="v-card">
          <div className="v-card-header">
             <h2>Test History</h2>
             <button className="v-btn v-btn-outline" onClick={() => setView("start")}>Back</button>
          </div>
          <div className="v-history-list">
             {history.length === 0 ? (
                <p className="v-empty">No tests taken yet.</p>
             ) : (
                history.map(h => (
                   <div key={h.id} className={`v-history-item ${h.status === "graded" ? "clickable" : ""}`} onClick={() => h.status === "graded" && setShowReport(h)}>
                      <div className="v-h-main">
                         <strong>Versant Assessment</strong>
                         <span>{new Date(h.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="v-h-stats">
                         {h.status === "pending_evaluation" ? (
                            <span className="v-badge v-badge-pending">Pending Review</span>
                         ) : (
                            <div className="v-h-graded">
                               <span className="v-score">{Math.round(h.overall_score)}/100</span>
                               <span className="v-label-sml">Click to view report</span>
                            </div>
                         )}
                      </div>
                   </div>
                ))
             )}
          </div>
        </div>

        {/* DETAILED REPORT MODAL */}
        {showReport && (
           <div className="v-modal-overlay" onClick={() => setShowReport(null)}>
              <div className="v-modal-card" onClick={e => e.stopPropagation()}>
                 <div className="v-modal-head">
                    <h3>Performance Report</h3>
                    <button className="v-btn-close" onClick={() => setShowReport(null)}><IcoX /></button>
                 </div>
                 <div className="v-modal-body">
                    <div className="v-overall-circle">
                       <span className="v-oc-val">{Math.round(showReport.overall_score)}</span>
                       <span className="v-oc-lbl">Overall Score</span>
                    </div>
                    
                    <div className="v-metrics-grid">
                       <div className="v-metric">
                          <label>Sentence Mastery</label>
                          <div className="v-m-bar"><div className="v-m-fill" style={{ width: `${showReport.sentence_mastery}%` }} /></div>
                          <span>{showReport.sentence_mastery}</span>
                       </div>
                       <div className="v-metric">
                          <label>Vocabulary</label>
                          <div className="v-m-bar"><div className="v-m-fill" style={{ width: `${showReport.vocabulary}%` }} /></div>
                          <span>{showReport.vocabulary}</span>
                       </div>
                       <div className="v-metric">
                          <label>Fluency</label>
                          <div className="v-m-bar"><div className="v-m-fill" style={{ width: `${showReport.fluency}%` }} /></div>
                          <span>{showReport.fluency}</span>
                       </div>
                       <div className="v-metric">
                          <label>Pronunciation</label>
                          <div className="v-m-bar"><div className="v-m-fill" style={{ width: `${showReport.pronunciation}%` }} /></div>
                          <span>{showReport.pronunciation}</span>
                       </div>
                    </div>

                    <div className="v-feedback-box">
                       <h4>TPO Feedback</h4>
                       <p>{showReport.feedback || "No specific feedback provided."}</p>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  }

  return null;
}
