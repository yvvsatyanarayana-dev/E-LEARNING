import { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";
import "./StudentPlacementQuizzes.css";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoBack   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoCheck  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoPlay   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IcoClock  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoClose  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const LETTERS   = ["A", "B", "C", "D"];
const DIFF_COLOR = { Easy: "easy", Medium: "medium", Hard: "hard" };

// ── Timer Hook ─────────────────────────────────────────────────────────────────
function useTimer(totalSeconds, onExpire) {
  const [left, setLeft] = useState(totalSeconds);
  const ref = useRef();
  useEffect(() => {
    ref.current = setInterval(() => {
      setLeft(s => {
        if (s <= 1) { clearInterval(ref.current); onExpire(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);
  return left;
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── Quiz Modal ─────────────────────────────────────────────────────────────────
function QuizModal({ quiz, onClose, onComplete }) {
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState(quiz.answers || {}); // Use existing answers if reviewed
  const [submitted, setSubmitted] = useState(!!quiz.attempted);
  const [result,    setResult]    = useState(quiz.attempted ? { score: quiz.my_score, total: quiz.question_count, correct: Math.round(quiz.my_score * quiz.question_count / 100) } : null);
  const [submitting,setSubmitting] = useState(false);
  const [reviewing, setReviewing]  = useState(!!quiz.attempted);
  const startTime = useRef(Date.now());

  const questions = quiz.questions || [];
  const totalSec  = (quiz.duration || 15) * 60;

  const timeLeft = useTimer(totalSec, () => { if (!submitted) handleSubmit(); });

  const q = questions[current];

  const pickAnswer = (opt) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [q.id]: opt }));
  };

  const handleSubmit = async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    try {
      const res = await api.post(`/student/placement/quizzes/${quiz.id}/submit`, {
        answers,
        time_taken: timeTaken,
      });
      setResult(res);
      setSubmitted(true);
      onComplete(quiz.id, res.score);
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message;
      alert("Submit failed: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const answered   = Object.keys(answers).length;
  const progress   = ((current + 1) / questions.length) * 100;

  // ── Result Screen ─────────────────────────────────────────────────────────
  if (submitted && result) {
    const score   = result.score ?? 0;
    const pctDeg  = `${Math.round(score * 3.6)}deg`;
    const grade   = score >= 80 ? "Excellent! 🎉" : score >= 60 ? "Good effort! 👍" : "Keep practicing! 💪";
    const mm      = Math.floor((result.time_taken || 0) / 60);
    const ss      = (result.time_taken || 0) % 60;
    return (
      <div className="spq-overlay" onClick={onClose}>
        <div className="spq-modal" onClick={e => e.stopPropagation()}>
          <div className="spq-modal-head">
            <div>
              <div className="spq-modal-title">Quiz Complete!</div>
              <div className="spq-modal-meta">{quiz.title}</div>
            </div>
            <button className="spq-close-btn" onClick={onClose}><IcoClose/></button>
          </div>
          <div className="spq-result">
            <div className="spq-result-ring" style={{ "--pct": `${score * 3.6}deg` }}>
              <div className="spq-result-pct">{score}%</div>
              <div className="spq-result-label">Score</div>
            </div>
            <div className="spq-result-title">{grade}</div>
            <div className="spq-result-sub">{result.message}</div>
            <div className="spq-result-stats">
              <div className="spq-rs"><div className="spq-rs-val" style={{ color: "var(--teal)" }}>{result.correct}</div><div className="spq-rs-lbl">Correct</div></div>
              <div className="spq-rs"><div className="spq-rs-val" style={{ color: "var(--rose)" }}>{result.total - result.correct}</div><div className="spq-rs-lbl">Wrong</div></div>
              <div className="spq-rs"><div className="spq-rs-val">{result.total}</div><div className="spq-rs-lbl">Total</div></div>
              <div className="spq-rs"><div className="spq-rs-val">{mm}m {ss}s</div><div className="spq-rs-lbl">Time</div></div>
            </div>
            <div className="spq-result-actions">
              <button className="spq-result-done-btn secondary" onClick={() => setReviewing(true)}>Review Answers</button>
              <button className="spq-result-done-btn" onClick={onClose}>Done</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Review Screen ─────────────────────────────────────────────────────────
  if (submitted && reviewing && result) {
    return (
      <div className="spq-overlay" onClick={onClose}>
        <div className="spq-modal review-mode" onClick={e => e.stopPropagation()}>
          <div className="spq-modal-head">
            <div>
              <div className="spq-modal-title">Review: {quiz.title}</div>
              <div className="spq-modal-meta">Detailed Breakdown & Explanations</div>
            </div>
            <button className="spq-close-btn" onClick={onClose}><IcoClose/></button>
          </div>
          <div className="spq-modal-body review-list">
            {questions.map((q, idx) => {
              const studentChoice = answers[q.id];
              return (
                <div key={q.id} className="spq-review-card">
                  <div className="spq-q-num">Question {idx + 1}</div>
                  <div className="spq-q-text">{q.question_text}</div>
                  <div className="spq-opts">
                    {(q.options || []).map((opt, oi) => {
                      const isCorrect = opt === q.correct_answer;
                      const isSelected = studentChoice === opt;
                      let status = "";
                      if (isCorrect) status = "correct";
                      else if (isSelected) status = "wrong";

                      return (
                        <div key={oi} className={`spq-opt-preview ${status}`}>
                          <span className="spq-opt-letter">{LETTERS[oi]}</span>
                          {opt}
                          {isCorrect && <span className="spq-opt-tag">Correct Answer</span>}
                          {isSelected && !isCorrect && <span className="spq-opt-tag error">Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="spq-explanation">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="spq-modal-foot">
            <button className="spq-nav-btn" onClick={() => setReviewing(false)}>← Back to Summary</button>
            <button className="spq-result-done-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────────────────
  return (
    <div className="spq-overlay" onClick={e => e.stopPropagation()}>
      <div className="spq-modal" onClick={e => e.stopPropagation()}>
        {/* Head */}
        <div className="spq-modal-head">
          <div>
            <div className="spq-modal-title">{quiz.title}</div>
            <div className="spq-modal-meta">{quiz.question_count} Questions · {quiz.difficulty}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`spq-timer ${timeLeft <= 60 ? "warning" : ""}`}>
              <IcoClock/> {fmtTime(timeLeft)}
            </span>
            <button className="spq-close-btn" onClick={onClose}><IcoClose/></button>
          </div>
        </div>

        {/* Progress */}
        <div className="spq-progress-bar">
          <div className="spq-progress-fill" style={{ width: `${progress}%` }}/>
        </div>

        {/* Question */}
        <div className="spq-modal-body">
          {q && (
            <>
              <div className="spq-q-num">Question {current + 1} of {questions.length}</div>
              <div className="spq-q-text">{q.question_text}</div>
              <div className="spq-opts">
                {(q.options || []).map((opt, oi) => {
                  const sel = answers[q.id] === opt;
                  return (
                    <button
                      key={oi}
                      className={`spq-opt-btn ${sel ? "selected" : ""}`}
                      onClick={() => pickAnswer(opt)}
                    >
                      <span className="spq-opt-letter">{LETTERS[oi]}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="spq-modal-foot">
          <button className="spq-nav-btn" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>
            ← Prev
          </button>
          <span className="spq-q-counter">
            {answered}/{questions.length} answered
          </span>
          {current < questions.length - 1 ? (
            <button className="spq-nav-btn" onClick={() => setCurrent(c => c + 1)}>
              Next →
            </button>
          ) : (
            <button
              className="spq-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : <><IcoCheck/> Submit Quiz</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function StudentPlacementQuizzes({ onBack }) {
  const [quizzes, setQuizzes]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [active,  setActive]      = useState(null);   // quiz being taken

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get("/student/placement/quizzes");
      setQuizzes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (quizId, score) => {
    setQuizzes(prev => prev.map(q =>
      q.id === quizId ? { ...q, attempted: true, my_score: score } : q
    ));
    setActive(null);
  };

  const attempted = quizzes.filter(q => q.attempted).length;
  const pending   = quizzes.filter(q => !q.attempted).length;
  const avgScore  = attempted > 0
    ? Math.round(quizzes.filter(q => q.attempted && q.my_score != null)
        .reduce((sum, q) => sum + q.my_score, 0) / attempted)
    : null;

  return (
    <div className="spq-root">
      {/* HEADER */}
      <div className="spq-header">
        <div>
          <div className="spq-badge">🎯 Placement Prep</div>
          <h1 className="spq-h1">Placement Quizzes</h1>
          <p className="spq-sub">AI-generated quizzes from your Placement Officer to sharpen your skills.</p>
        </div>
        {onBack && (
          <button className="spq-back-btn" onClick={onBack}><IcoBack/> Dashboard</button>
        )}
      </div>

      {/* STATS */}
      {!loading && quizzes.length > 0 && (
        <div className="spq-stats">
          <div className="spq-stat">
            <div className="spq-stat-val" style={{ color: "var(--indigo-l)" }}>{quizzes.length}</div>
            <div className="spq-stat-lbl">Total Quizzes</div>
          </div>
          <div className="spq-stat">
            <div className="spq-stat-val" style={{ color: "var(--teal)" }}>{attempted}</div>
            <div className="spq-stat-lbl">Completed</div>
          </div>
          <div className="spq-stat">
            <div className="spq-stat-val" style={{ color: "var(--amber)" }}>
              {avgScore != null ? `${avgScore}%` : "—"}
            </div>
            <div className="spq-stat-lbl">Avg Score</div>
          </div>
        </div>
      )}

      {/* QUIZ LIST */}
      {loading ? (
        <div style={{ color: "var(--text3)", fontSize: 13, padding: 24 }}>Loading quizzes…</div>
      ) : quizzes.length === 0 ? (
        <div className="spq-empty">
          <div className="spq-empty-ico">📋</div>
          <div className="spq-empty-txt">No quizzes yet</div>
          <div className="spq-empty-sub">Your Placement Officer hasn't published any quizzes yet. Check back soon!</div>
        </div>
      ) : (
        <div className="spq-list">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="spq-card">
              <div className="spq-card-body">
                <div className="spq-card-icon">🧠</div>
                <div className="spq-card-info">
                  <div className="spq-card-title">{quiz.title}</div>
                  <div className="spq-card-meta">
                    <span className={`spq-chip ${DIFF_COLOR[quiz.difficulty] || ""}`}>{quiz.difficulty}</span>
                    <span className="spq-chip"><IcoClock/> {quiz.duration} min</span>
                    <span className="spq-chip">📝 {quiz.question_count} Qs</span>
                    {quiz.attempted && <span className="spq-chip done">✓ Completed</span>}
                  </div>
                </div>
                <div className="spq-card-actions">
                  {quiz.attempted ? (
                    <>
                      <div className="spq-score-badge">{quiz.my_score ?? 0}%</div>
                      <button className="spq-take-btn secondary" onClick={() => setActive(quiz)}>
                        Review
                      </button>
                    </>
                  ) : (
                    <button className="spq-take-btn" onClick={() => setActive(quiz)}>
                      <IcoPlay/> Take Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {active && (
        <QuizModal
          quiz={active}
          onClose={() => setActive(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
