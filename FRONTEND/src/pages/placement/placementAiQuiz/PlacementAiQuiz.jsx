import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import "./PlacementAiQuiz.css";

// ── Icons ────────────────────────────────────────────────────────────────────
const IcoBack    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoBrain   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;
const IcoSend    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/></svg>;
const IcoCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoTrash   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoQuiz    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4 17v-1a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0z"/><path d="M6 22v-3"/></svg>;

const DIFF_OPTS  = ["Easy", "Medium", "Hard"];
const CAT_OPTS   = ["Technical", "Aptitude", "Communication", "Core Engineering", "General Placement"];
const COUNT_OPTS = [5, 8, 10, 15, 20];
const LETTERS    = ["A", "B", "C", "D"];

// ── Main Component ────────────────────────────────────────────────────────────
export default function PlacementAiQuiz({ onBack }) {
  const navigate = useNavigate();
  const goBack   = onBack ?? (() => navigate("/placementdashboard"));

  // Generator form state
  const [topic,      setTopic]      = useState("");
  const [category,   setCategory]   = useState("Technical");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count,      setCount]      = useState(10);
  const [generating, setGenerating] = useState(false);

  // Preview state (after generation)
  const [preview,    setPreview]    = useState(null);   // { topic, difficulty, questions: [] }
  const [quizTitle,  setQuizTitle]  = useState("");
  const [duration,   setDuration]   = useState(15);
  const [publishing, setPublishing] = useState(false);

  // Existing quizzes list
  const [quizzes,    setQuizzes]    = useState([]);
  const [loadingQs,  setLoadingQs]  = useState(true);
  const [viewResultsQuiz, setViewResultsQuiz] = useState(null);
  const [activeAttempt,    setActiveAttempt]    = useState(null);
  const [toast,      setToast]      = useState("");

  // ── Load existing quizzes ──────────────────────────────────────────────────
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get("/placement/ai/quiz");
      setQuizzes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setLoadingQs(false);
    }
  };

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!topic.trim()) return alert("Please enter a quiz topic.");
    setGenerating(true);
    setPreview(null);
    try {
      const res = await api.post("/placement/ai/quiz/generate", { topic, category, difficulty, count });
      setPreview(res);
      setQuizTitle(`${topic} – ${difficulty} Quiz`);
    } catch (err) {
      alert("AI generation failed: " + (err?.response?.data?.detail || err.message));
    } finally {
      setGenerating(false);
    }
  };

  // ── Publish ────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!preview) return;
    setPublishing(true);
    try {
      const payload = {
        title:        quizTitle || preview.topic,
        topic:        preview.topic,
        difficulty:   preview.difficulty,
        duration,
        questions:    preview.questions,
        target_group: "All",
      };
      const saved = await api.post("/placement/ai/quiz", payload);
      setQuizzes(prev => [saved, ...prev]);
      setPreview(null);
      setTopic("");
      showToast("✅ Quiz published! Students can now take it.");
    } catch (err) {
      alert("Failed to publish: " + (err?.response?.data?.detail || err.message));
    } finally {
      setPublishing(false);
    }
  };

  // ── Delete quiz ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this quiz?")) return;
    try {
      await api.delete(`/placement/ai/quiz/${id}`);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      showToast("Quiz deactivated.");
    } catch (err) {
      alert("Failed to delete quiz.");
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="paq-root">
      {/* HEADER */}
      <div className="paq-header">
        <div className="paq-title-block">
          <div className="paq-badge">
            <span className="paq-badge-dot"/>
            <IcoBrain/> AI-Powered
          </div>
          <h1 className="paq-h1">Placement Quiz Generator</h1>
          <p className="paq-sub">Generate AI quizzes instantly from a topic prompt and publish them to all students.</p>
        </div>
        <button className="paq-back-btn" onClick={goBack}><IcoBack/> Dashboard</button>
      </div>

      <div className="paq-layout">
        {/* ── LEFT: Generator Panel ── */}
        <div>
          <div className="paq-gen-panel">
            <div className="paq-gen-title"><IcoBrain/> Generate Quiz</div>

            <div className="paq-field">
              <div className="paq-label">Topic / Prompt</div>
              <textarea
                className="paq-textarea"
                value={topic}
                placeholder="e.g. Data Structures – Arrays and Linked Lists at placement level, DBMS SQL queries, Java OOP concepts, Aptitude – Time & Work..."
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleGenerate(); }}
              />
            </div>

            <div className="paq-row">
              <div className="paq-field">
                <div className="paq-label">Difficulty</div>
                <select className="paq-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  {DIFF_OPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="paq-field">
                <div className="paq-label">Category / Stream</div>
                <select className="paq-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {CAT_OPTS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="paq-row">
              <div className="paq-field">
                <div className="paq-label">No. of Questions</div>
                <select className="paq-select" value={count} onChange={e => setCount(+e.target.value)}>
                  {COUNT_OPTS.map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
            </div>

            <button className="paq-gen-btn" onClick={handleGenerate} disabled={generating}>
              {generating
                ? <><span className="paq-spinner"/>&nbsp;Generating…</>
                : <><IcoSend/> Generate Quiz (Ctrl+Enter)</>}
            </button>
          </div>

          {/* Existing Quizzes */}
          <div className="paq-existing">
            <div className="paq-existing-title">Published Quizzes ({quizzes.filter(q => q.is_active).length} active)</div>
            {loadingQs
              ? <div style={{ color: "var(--text3)", fontSize: 12 }}>Loading…</div>
              : quizzes.length === 0
                ? <div style={{ color: "var(--text3)", fontSize: 12 }}>No quizzes yet. Generate one above!</div>
                : quizzes.map(q => (
                  <div key={q.id} className="paq-quiz-card">
                    <div className="paq-quiz-card-row">
                      <div>
                        <div className="paq-quiz-name">{q.title}</div>
                        <div className="paq-quiz-meta">{q.difficulty} · {q.question_count} Qs · {q.duration}min · {new Date(q.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="paq-quiz-stats">
                        <button className="paq-stat-btn" onClick={() => setViewResultsQuiz(q)}>
                          <span className="paq-stat-chip clickable">{q.attempt_count} attempts</span>
                        </button>
                        {q.avg_score != null && <span className="paq-stat-chip green">{q.avg_score}% avg</span>}
                        <button className="paq-del-btn" title="Deactivate" onClick={() => handleDelete(q.id)}><IcoTrash/></button>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* ── RIGHT: Preview Panel ── */}
        <div className="paq-preview-panel">
          {!preview && !generating && (
            <div className="paq-empty">
              <div className="paq-empty-ico">🤖</div>
              <div className="paq-empty-txt">AI Quiz Preview</div>
              <div className="paq-empty-sub">Enter a topic and click Generate to see AI-created questions here before publishing.</div>
            </div>
          )}

          {generating && (
            <div className="paq-empty">
              <div className="paq-empty-ico">⚡</div>
              <div className="paq-empty-txt">Generating questions…</div>
              <div className="paq-empty-sub" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10 }}>
                <span className="paq-spinner" style={{ borderColor: "rgba(91,78,248,.3)", borderTopColor: "var(--indigo-l)" }}/>
                AI is crafting {count} {difficulty} questions on "{topic}"
              </div>
            </div>
          )}

          {preview && (
            <>
              {/* Preview Header */}
              <div className="paq-preview-head">
                <div>
                  <div className="paq-preview-ttl">{preview.questions.length} Questions Generated</div>
                  <div className="paq-preview-info">Topic: {preview.topic} · {preview.difficulty}</div>
                </div>
                <button className="paq-publish-btn" onClick={handlePublish} disabled={publishing}>
                  {publishing ? <><span className="paq-spinner"/>&nbsp;Publishing…</> : <><IcoCheck/> Publish to Students</>}
                </button>
              </div>

              {/* Quiz Settings */}
              <div className="paq-settings-bar">
                <div className="paq-setting-field">
                  <div className="paq-setting-lbl">Quiz Title</div>
                  <input className="paq-setting-input" style={{ width: 260 }} value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="Quiz title…"/>
                </div>
                <div className="paq-setting-field">
                  <div className="paq-setting-lbl">Duration (min)</div>
                  <input className="paq-setting-input" type="number" value={duration} min={5} max={60} onChange={e => setDuration(+e.target.value)}/>
                </div>
              </div>

              {/* Questions */}
              <div className="paq-questions">
                {preview.questions.map((q, qi) => (
                  <div key={qi} className="paq-q-card">
                    <div className="paq-q-num">Question {qi + 1}</div>
                    <div className="paq-q-text">{q.question}</div>
                    <div className="paq-options">
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} className={`paq-opt ${opt === q.answer ? "correct" : ""}`}>
                          <span className="paq-opt-letter">{LETTERS[oi]}</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="paq-explanation">💡 {q.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="paq-toast"><IcoCheck/> {toast}</div>}

      {/* MODALS */}
      {viewResultsQuiz && (
        <QuizResultsModal
          quiz={viewResultsQuiz}
          onClose={() => setViewResultsQuiz(null)}
          onViewAttempt={setActiveAttempt}
        />
      )}
      {activeAttempt && (
        <QuizAttemptDetailModal
          attemptId={activeAttempt.id}
          onClose={() => setActiveAttempt(null)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   QUIZ RESULTS MODAL
════════════════════════════════════════════ */
function QuizResultsModal({ quiz, onClose, onViewAttempt }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/placement/ai/quiz/${quiz.id}/attempts`);
        setAttempts(res || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [quiz.id]);

  return (
    <div className="paq-modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="paq-modal results-modal" onClick={e => e.stopPropagation()} style={{ width: 520 }}>
        <div className="paq-modal-head">
          <div>
            <div className="paq-modal-title">Quiz Results: {quiz.title}</div>
            <div className="paq-modal-sub">{attempts.length} total attempts · Average Score: {quiz.avg_score ?? 0}%</div>
          </div>
          <button className="paq-modal-close" onClick={onClose}><IcoClose/></button>
        </div>
        <div className="paq-modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {loading ? (
            <div style={{ color: "var(--text3)", padding: 40, textAlign: "center" }}>Loading attempts…</div>
          ) : attempts.length === 0 ? (
            <div style={{ color: "var(--text3)", padding: 40, textAlign: "center" }}>No attempts recorded yet.</div>
          ) : (
            <div className="paq-results-list" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {attempts.map(a => (
                <div key={a.id} className="paq-result-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <div className="paq-res-info">
                    <div className="paq-res-name" style={{ fontSize: 13, fontWeight: 700, color: "var(--text1)" }}>{a.student_name}</div>
                    <div className="paq-res-roll" style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{a.student_roll || "No ID"} · {new Date(a.attempted_at).toLocaleDateString()}</div>
                  </div>
                  <div className="paq-res-score" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right" }}>
                      <div className={`paq-res-pct ${a.score >= 70 ? "green" : a.score >= 40 ? "amber" : "rose"}`} style={{ fontSize: 14, fontWeight: 800 }}>{a.score}%</div>
                      <div className="paq-res-fraction" style={{ fontSize: 9, color: "var(--text3)" }}>{a.correct_q}/{a.total_q} Correct</div>
                    </div>
                    <button className="paq-res-btn" style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text2)", fontSize: 10, cursor: "pointer" }} onClick={() => onViewAttempt(a)}>Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   QUIZ ATTEMPT DETAIL MODAL
════════════════════════════════════════════ */
function QuizAttemptDetailModal({ attemptId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/placement/ai/quiz/attempts/${attemptId}`);
        setDetail(res);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [attemptId]);

  return (
    <div className="paq-modal-overlay" onClick={onClose} style={{ zIndex: 3001 }}>
      <div className="paq-modal review-modal" onClick={e => e.stopPropagation()} style={{ width: 680, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div className="paq-modal-head">
          <div>
            <div className="paq-modal-title">Performance Details</div>
            {detail && <div className="paq-modal-sub">{detail.quiz_title} · Attempt Score: {detail.score}%</div>}
          </div>
          <button className="paq-modal-close" onClick={onClose}><IcoClose/></button>
        </div>
        <div className="paq-modal-body detail-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>Loading breakdown…</div>
          ) : !detail ? (
            <div style={{ padding: 40, textAlign: "center" }}>Failed to load.</div>
          ) : (
            <div className="paq-qa-list" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {detail.questions.map((q, idx) => {
                const isCorrect = q.student_answer === q.correct_answer;
                return (
                  <div key={idx} className="paq-qa-card" style={{ padding: 18, background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 14 }}>
                    <div className="paq-qa-num" style={{ fontSize: 10, fontWeight: 700, color: "var(--indigo-l)", marginBottom: 8, textTransform: "uppercase" }}>Question {idx + 1}</div>
                    <div className="paq-qa-text" style={{ fontSize: 14, fontWeight: 700, color: "var(--text1)", marginBottom: 14, lineHeight: 1.6 }}>{q.question_text}</div>
                    <div className="paq-qa-opts" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {q.options.map((opt, oi) => {
                        const isAns = opt === q.correct_answer;
                        const isStudent = opt === q.student_answer;
                        let borderCls = "var(--border)";
                        let bgCls = "var(--bg2)";
                        let textCls = "var(--text1)";
                        
                        if (isAns) { borderCls = "var(--teal)"; bgCls = "rgba(0,210,130,.06)"; textCls = "var(--teal)"; }
                        else if (isStudent) { borderCls = "var(--rose)"; bgCls = "rgba(239,68,68,.06)"; textCls = "var(--rose)"; }

                        return (
                          <div key={oi} className="paq-qa-opt" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: `1px solid ${borderCls}`, background: bgCls, color: textCls, fontSize: 13, position: "relative" }}>
                            <span className="paq-qa-letter" style={{ width: 22, height: 22, borderRadius: "50%", background: isAns ? "var(--teal)" : isStudent ? "var(--rose)" : "var(--border)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{LETTERS[oi]}</span>
                            {opt}
                            {isAns && <span className="paq-qa-tag" style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Correct</span>}
                            {isStudent && !isAns && <span className="paq-qa-tag error" style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Student Choice</span>}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && <div className="paq-qa-expl" style={{ marginTop: 12, padding: 12, background: "rgba(91,78,248,.05)", borderRadius: 10, fontSize: 11, color: "var(--text3)", borderLeft: "3px solid var(--indigo-l)" }}>💡 {q.explanation}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const IcoClose = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
