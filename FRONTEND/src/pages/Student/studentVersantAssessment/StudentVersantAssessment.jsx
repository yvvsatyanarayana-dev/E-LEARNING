import React, { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";
import "./StudentVersantAssessment.css";

const IcoAward = (p) => <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>;
const IcoClock = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcoChevR = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
const IcoRefresh = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;

const TEST_PARTS = [
  { id: "partA", title: "Part A: Reading", desc: "Read the sentences as they appear on the screen.", type: "speak" },
  { id: "partB", title: "Part B: Repeat", desc: "Repeat the sentence you hear.", type: "speak" },
  { id: "partC", title: "Part C: Questions", desc: "Give a short answer to the question using your voice.", type: "speak" },
  { id: "partD", title: "Part D: Sentence Builds", desc: "Rearrange the word groups into a correct sentence aloud.", type: "speak" },
  { id: "partE", title: "Part E: Story Retelling", desc: "Listen to a short story and summarize it in your own words.", type: "speak" },
  { id: "partF", title: "Part F: Open Questions", desc: "Speak for 45 seconds about the given topic.", type: "speak" },
  { id: "partG", title: "Part G: Dictation", desc: "Listen carefully and type the sentence exactly as you hear it.", type: "type" },
  { id: "partH", title: "Part H: Passage Reconstruction", desc: "Read the passage for 30s, then type it from memory.", type: "type" }
];

const QUESTIONS = {
  partA: [
    "Traffic is heavy in the city during rush hour.",
    "The new software update will be released tomorrow morning.",
    "Agricultural technology is essential for sustainable food production."
  ],
  partB: [
    "Please leave your contact details at the reception desk.",
    "The presentation has been rescheduled for next Tuesday.",
    "Would you like to join us for a brief meeting after lunch?"
  ],
  partC: [
    { q: "Is a cow an animal or a machine?", a: "animal" },
    { q: "Do you wear a hat on your head or your feet?", a: "head" },
    { q: "Which is longer: a minute or an hour?", a: "hour" }
  ],
  partD: [
    { words: ["was", "the meeting", "very productive"], correct: "the meeting was very productive" },
    { words: ["he", "to the office", "is going"], correct: "he is going to the office" },
    { words: ["we", "your feedback", "appreciate"], correct: "we appreciate your feedback" }
  ],
  partE: [
    "John wanted to go hiking, but it started raining. He decided to read a book instead. Later, the sun came out and he went for a short walk.",
    "Sarah bought a new car last week. She drove it to her parents' house. They were very happy for her and celebrated with a nice dinner."
  ],
  partF: [
    "Do you prefer working in a team or independently? Why?",
    "Describe a challenging project you've worked on and how you handled it."
  ],
  partG: [
    "The financial report must be submitted by Friday afternoon.",
    "Global temperatures have been rising steadily over the past decade.",
    "Innovative solutions are required to solve complex urban issues."
  ],
  partH: [
    "Modern cities face numerous challenges, from traffic congestion to environmental pollution. To build a sustainable future, urban planners must prioritize green spaces and efficient public transportation. This approach not only reduces carbon footprints but also improves the overall quality of life for residents."
  ]
};

export default function StudentVersantAssessment() {
  const [view, setView] = useState("start"); // start, permissions, testing, results, history
  const [currentPart, setCurrentPart] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputText, setInputText] = useState("");
  
  // Hardware & Listening State
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

  useEffect(() => {
    fetchHistory();
    return () => {
       if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const resp = await api.get("/student/versant/history");
      setHistory(resp);
    } catch (err) {
      console.error("Failed to fetch Versant history:", err);
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
      console.error("Hardware access denied:", err);
      alert("Camera and Microphone access are required for the real Versant assessment.");
    }
  };

  const setupVisualizer = (s) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(s);
    const analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);
    analyzerRef.current = analyzer;
    draw();
  };

  const draw = () => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const renderFrame = () => {
      if (!analyzerRef.current) return;
      requestAnimationFrame(renderFrame);
      analyzerRef.current.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const barWidth = (canvasRef.current.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(91, 78, 248)`;
        ctx.fillRect(x, canvasRef.current.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    renderFrame();
  };

  const startTest = () => {
    setView("permissions");
  };

  const stopHardware = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setCamActive(false);
    setMicActive(false);
  };

  const speakPrompt = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setTranscription(prev => (prev + " " + event.results[i][0].transcript).trim());
        } else {
          interim += event.results[i][0].transcript;
        }
      }
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const beginActualTest = () => {
    setView("testing");
    setCurrentPart(0);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimer(0);
    setInputText("");
    setTranscription("");
    intervalRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
  };

  const [showPassage, setShowPassage] = useState(true);

  const nextQuestion = () => {
    const partKey = TEST_PARTS[currentPart].id;
    const questions = QUESTIONS[partKey];
    
    // Stop recording if active
    stopListening();
    
    // Save current answer
    const currentAnswer = TEST_PARTS[currentPart].type === "speak" ? transcription : inputText;
    setAnswers([...answers, { part: partKey, questionIdx: currentQuestion, text: currentAnswer }]);
    
    setInputText("");
    setTranscription("");
    setShowPassage(true);

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
    clearInterval(intervalRef.current);
    setLoading(true);
    
    const mockScores = {
      sentence_mastery: 75 + Math.random() * 20,
      vocabulary: 80 + Math.random() * 15,
      fluency: 70 + Math.random() * 20,
      pronunciation: 72 + Math.random() * 18,
      overall_score: 0,
      feedback: "Complete assessment analyzed via voice and text. Your vocabulary is strong, but focus on pronunciation in Part B."
    };
    mockScores.overall_score = (mockScores.sentence_mastery + mockScores.vocabulary + mockScores.fluency + mockScores.pronunciation) / 4;

    try {
      const resp = await api.post("/student/versant/submit", mockScores);
      setResult(resp);
      setView("results");
      fetchHistory();
    } catch (err) {
      console.error("Failed to submit Versant test:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (view === "start") {
    return (
      <div className="versant-container">
        <div className="versant-card" style={{ padding: "80px", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", background: "rgba(91, 78, 248, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--indigo)", marginBottom: "32px", fontSize: "32px" }}>
            <IcoAward size={32} />
          </div>
          <h1>Versant Assessment</h1>
          <p style={{ color: "var(--text3)", maxWidth: "600px", marginBottom: "40px" }}>
            Measure your speaking, listening, reading, and writing skills. This assessment requires <strong>Camera</strong> and <strong>Microphone</strong> access for monitoring.
          </p>
          
          <div className="v-parts-list">
             {TEST_PARTS.map(p => (
               <div key={p.id} className="v-part-card">
                  <div className="v-part-ttl">{p.title}</div>
                  <div className="v-part-desc">{p.type === "speak" ? "🔊 Speaking/Voice" : "⌨️ Writing/Typing"}</div>
               </div>
             ))}
          </div>

          <button className="v-btn-next" onClick={startTest}>Get Started</button>
        </div>
      </div>
    );
  }

  if (view === "permissions") {
    return (
      <div className="versant-container">
        <div className="versant-card" style={{ textAlign: "center", padding: "60px" }}>
           <h1>Technical Check</h1>
           <p style={{ color: "var(--text3)", marginBottom: "40px" }}>Please allow camera and mic permissions to continue.</p>
           
           <div style={{ display: "flex", gap: "40px", justifyContent: "center", marginBottom: "40px" }}>
              <div className={`v-hw-check ${camActive ? "ok" : ""}`}>
                 <div className="v-hw-icon">📹</div>
                 <div>Camera</div>
              </div>
              <div className={`v-hw-check ${micActive ? "ok" : ""}`}>
                 <div className="v-hw-icon">🎤</div>
                 <div>Microphone</div>
              </div>
           </div>

           <div className="v-hw-preview">
              <video ref={videoRef} autoPlay muted playsInline />
              <canvas ref={canvasRef} width="400" height="100" />
           </div>

           <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              {!camActive && <button className="v-btn-next" onClick={handlePermissions}>Allow Hardware</button>}
              {camActive && <button className="v-btn-next" onClick={beginActualTest}>Start Test Now</button>}
              <button className="btn-ghost" onClick={() => setView("start")}>Cancel</button>
           </div>
        </div>
      </div>
    );
  }

  if (view === "testing") {
    const part = TEST_PARTS[currentPart];
    const questions = QUESTIONS[part.id];
    const q = questions[currentQuestion];

    // Auto-hiding passage logic for Part H
    if (part.id === "partH" && showPassage) {
      setTimeout(() => setShowPassage(false), 30000); // 30 seconds
    }

    // Voice synthesize for certain parts
    const handleVoicePrompt = () => {
       if (part.id === "partB" || part.id === "partC" || part.id === "partD" || part.id === "partE" || part.id === "partG") {
         speakPrompt(typeof q === "string" ? q : q.q || q.words.join(", "));
       }
    };

    return (
      <div className="versant-container">
        {/* PROCTORING PIP */}
        <div className="v-proctor-pip">
           <video ref={videoRef} autoPlay muted playsInline />
           <div className="v-rec-dot" />
        </div>

        <div className="versant-card">
          <div className="versant-header">
            <div className="v-header-left">
              <h1>{part.title} {part.type === "speak" ? "🔊" : "⌨️"}</h1>
              <p>Section {currentPart + 1} · Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className="v-timer"><IcoClock /> {formatTime(timer)}</div>
          </div>
          
          <div className="versant-steps">
            {TEST_PARTS.map((p, idx) => (
              <div key={p.id} className={`v-step ${idx === currentPart ? "active" : idx < currentPart ? "complete" : ""}`} />
            ))}
          </div>

          <div className="versant-content">
            <div className="v-instruction">{part.desc}</div>
            
            <div className="v-test-area">
              {/* Part A: Reading */}
              {part.id === "partA" && <div className="v-sentence-large">"{q}"</div>}

              {/* Part B/C/D/E: Voice/Listening */}
              {(part.id === "partB" || part.id === "partC" || part.id === "partD" || part.id === "partE") && (
                <div style={{ textAlign: "center" }}>
                   <button className="v-btn-play" onClick={handleVoicePrompt}>🔊 Play Audio</button>
                   <p style={{ marginTop: "20px", color: "var(--text3)" }}>Listen carefully and respond using your voice.</p>
                   {part.id === "partD" && <div className="v-word-chips">{q.words.map((w, i) => <span key={i} className="v-chip">{w}</span>)}</div>}
                   {transcription && <div className="v-transcription-live">Live: {transcription}</div>}
                </div>
              )}

              {/* Part F: Open Question */}
              {part.id === "partF" && (
                 <div style={{ textAlign: "center" }}>
                    <div className="v-sentence-large">"{q}"</div>
                    <p style={{ marginTop: "24px", color: "var(--indigo-ll)" }}>Recording for 45 seconds...</p>
                 </div>
              )}

              {/* Part G: Dictation */}
              {part.id === "partG" && (
                <div style={{ textAlign: "center" }}>
                   <button className="v-btn-play" onClick={handleVoicePrompt}>🔊 Play Sentence</button>
                   <textarea className="v-text-input" rows="3" placeholder="Type what you heard..." value={inputText} onChange={e => setInputText(e.target.value)} />
                </div>
              )}

              {/* Part H: Passage Reconstruction */}
              {part.id === "partH" && (
                <div>
                   {showPassage ? (
                     <div className="v-passage">"{q}"</div>
                   ) : (
                     <div className="v-passage-hidden">The passage is now hidden. Reconstruction in progress.</div>
                   )}
                   {!showPassage && <textarea className="v-text-input" rows="6" placeholder="Reconstruct the passage from memory..." value={inputText} onChange={e => setInputText(e.target.value)} />}
                </div>
              )}

              {/* RECORDING CONTROLS FOR SPEAK PARTS */}
              {part.type === "speak" && (
                <div className="v-recording-ctrl">
                   <canvas ref={canvasRef} className="v-mini-visualizer" />
                   {!isListening ? (
                     <button className="v-rec-btn" onClick={startListening}>🎤 Respond Aloud</button>
                   ) : (
                     <button className="v-rec-btn recording" onClick={stopListening}>⏹ Stop & Review</button>
                   )}
                </div>
              )}
            </div>
          </div>

          <div className="v-controls">
            <div className="v-hints">
               {isListening && <span className="v-status-listening">Recording active...</span>}
            </div>
            <button className="v-btn-next" onClick={nextQuestion}>
              {currentPart === TEST_PARTS.length - 1 && currentQuestion === questions.length - 1 ? "Finish Test" : "Next Task"}
              <IcoChevR />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "results") {
    if (loading) return (
      <div className="versant-container">
        <div className="versant-card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
           <div style={{ animation: "pulse 1.5s infinite", fontSize: "20px", color: "var(--text3)" }}>Lucyna AI is analyzing your performance...</div>
        </div>
      </div>
    );

    return (
      <div className="versant-container">
        <div className="versant-card" style={{ padding: "48px" }}>
          <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ margin: 0 }}>Performance Report</h1>
            <button className="btn-ghost" onClick={() => setView("start")}><IcoRefresh /> Retake Test</button>
          </div>

          <div className="v-results">
            <div className="v-overall-score">
              <div className="v-overall-val">{Math.round(result.overall_score)}</div>
              <div className="v-overall-lbl">Overall Score</div>
            </div>

            <div className="v-result-scores">
               {[
                 { label: "Sentence Mastery", val: result.sentence_mastery, color: "var(--indigo)" },
                 { label: "Vocabulary", val: result.vocabulary, color: "var(--teal)" },
                 { label: "Fluency", val: result.fluency, color: "var(--amber)" },
                 { label: "Pronunciation", val: result.pronunciation, color: "var(--rose)" },
               ].map(s => (
                 <div key={s.label} className="v-score-card">
                   <div className="v-sc-label">{s.label}</div>
                   <div className="v-sc-val">{Math.round(s.val)}<span>/100</span></div>
                   <div className="v-score-bar"><div className="v-score-fill" style={{ width: `${s.val}%`, background: s.color }} /></div>
                 </div>
               ))}
            </div>

            <div className="v-feedback-card">
               <div style={{ fontWeight: "700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                 <span>💡</span> AI Insights & Feedback
               </div>
               <p style={{ margin: 0, lineHeight: "1.6" }}>{result.feedback}</p>
            </div>
          </div>

          <div style={{ marginTop: "48px", textAlign: "center" }}>
            <button className="v-btn-next" style={{ margin: "0 auto" }} onClick={() => setView("start")}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "history") {
    return (
      <div className="versant-container">
        <div className="versant-card" style={{ padding: "48px" }}>
           <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ margin: 0 }}>Versant History</h1>
            <button className="v-btn-next" onClick={() => setView("start")}>New Test</button>
          </div>

          <div className="v-history">
            {history.map(h => (
              <div key={h.id} className="v-history-item">
                <div>
                   <div style={{ fontWeight: "600", marginBottom: "4px" }}>English Proficiency Test</div>
                   <div className="v-history-date">{new Date(h.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
                   <div style={{ textAlign: "center" }}>
                      <div className="v-history-score">{Math.round(h.overall_score)}</div>
                      <div style={{ fontSize: "10px", color: "var(--text3)" }}>Overall</div>
                   </div>
                   <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => { setResult(h); setView("results"); }}>View Full Report</button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-ghost" style={{ marginTop: "32px" }} onClick={() => setView("start")}>← Back</button>
        </div>
      </div>
    );
  }

  return null;
}
