import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import "./PlacementVersantEvaluation.css";

const IcoUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoFile = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoMic = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>;

const TEST_PARTS = [
  { id: "partA", title: "Part A: Reading" },
  { id: "partB", title: "Part B: Repeat" },
  { id: "partC", title: "Part C: Short Answer" },
  { id: "partD", title: "Part D: Sentence Builds" },
  { id: "partE", title: "Part E: Story Retelling" },
  { id: "partF", title: "Part F: Open Questions" }
];

export default function PlacementVersantEvaluation() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();

  const [scores, setScores] = useState({
    sentence_mastery: 0,
    vocabulary: 0,
    fluency: 0,
    pronunciation: 0,
    feedback: ""
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const resp = await api.get("/placement/versant/pending");
      setSubmissions(resp || []);
    } catch (err) {
      console.error("Failed to fetch pending submissions:", err);
      setSubmissions([]); // ensure list defaults safely, no mocks
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSub = (sub) => {
    setSelectedSub(sub);
    setScores({
      sentence_mastery: 0,
      vocabulary: 0,
      fluency: 0,
      pronunciation: 0,
      feedback: ""
    });
  };

  const calculateOverall = () => {
    const total = parseFloat(scores.sentence_mastery) + 
                  parseFloat(scores.vocabulary) + 
                  parseFloat(scores.fluency) + 
                  parseFloat(scores.pronunciation);
    return Math.round(total / 4);
  };

  const submitEvaluation = async () => {
    if (!selectedSub) return;
    setPublishing(true);
    const overall = calculateOverall();
    
    const payload = {
      ...scores,
      overall_score: overall,
      status: "graded"
    };

    try {
      await api.post(`/placement/versant/grade/${selectedSub.id}`, payload);
      alert("Evaluation published successfully!");
      setSelectedSub(null);
      fetchSubmissions();
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="p-versant-loading">Loading submissions...</div>;

  return (
    <div className="p-versant-eval">
      <header className="p-eval-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button 
            onClick={() => navigate("/placementdashboard")}
            style={{ 
              background: "none", border: "1px solid var(--border)", 
              color: "var(--text2)", padding: "6px 12px", borderRadius: 6,
              cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6
            }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0 }}>Versant Assessment Evaluation</h1>
            <p style={{ margin: "4px 0 0 0" }}>Review and grade student English proficiency submissions.</p>
          </div>
        </div>
      </header>

      <div className="p-eval-layout">
        {/* SUBMISSIONS LIST */}
        <div className="p-eval-sidebar">
          <div className="p-sidebar-head">Pending ({submissions.length})</div>
          <div className="p-sub-list">
            {submissions.map(s => (
              <div 
                key={s.id} 
                className={`p-sub-card ${selectedSub?.id === s.id ? "active" : ""}`}
                onClick={() => handleSelectSub(s)}
              >
                <div className="p-sub-avatar">{s.student_name[0]}</div>
                <div className="p-sub-info">
                  <strong>{s.student_name}</strong>
                  <span>{s.student_id}</span>
                </div>
                <div className="p-sub-date">{new Date(s.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* EVALUATION WORKSPACE */}
        <div className="p-eval-main">
          {selectedSub ? (
            <div className="p-eval-workspace">
              <div className="p-eval-tabs">
                 <div className="p-tab active">Detailed Responses</div>
              </div>

              <div className="p-responses-grid">
                {TEST_PARTS.map(part => {
                   const ans = selectedSub.details?.find(d => d.part === part.id);
                   return (
                     <div key={part.id} className="p-resp-card">
                        <div className="p-resp-head">
                           <IcoFile />
                           <strong>{part.title}</strong>
                        </div>
                        <div className="p-resp-body">
                           {ans ? (
                             <div className="p-ans-box">
                                <div className="p-ans-txt">"{ans.resp}"</div>
                                <div className="p-ans-meta">Transcription via Web Speech AI</div>
                             </div>
                           ) : (
                             <div className="p-empty-ans">No response recorded for this part.</div>
                           )}
                        </div>
                     </div>
                   );
                })}
              </div>

              <div className="p-grading-panel">
                <h3>Submit Final Grade</h3>
                <div className="p-grade-grid">
                  <div className="p-grade-field">
                    <label>Sentence Mastery (0-100)</label>
                    <input type="number" value={scores.sentence_mastery} onChange={e => setScores({...scores, sentence_mastery: e.target.value})} />
                  </div>
                  <div className="p-grade-field">
                    <label>Vocabulary (0-100)</label>
                    <input type="number" value={scores.vocabulary} onChange={e => setScores({...scores, vocabulary: e.target.value})} />
                  </div>
                  <div className="p-grade-field">
                    <label>Fluency (0-100)</label>
                    <input type="number" value={scores.fluency} onChange={e => setScores({...scores, fluency: e.target.value})} />
                  </div>
                  <div className="p-grade-field">
                    <label>Pronunciation (0-100)</label>
                    <input type="number" value={scores.pronunciation} onChange={e => setScores({...scores, pronunciation: e.target.value})} />
                  </div>
                </div>
                <div className="p-feedback-field">
                  <label>Overall Feedback</label>
                  <textarea rows="3" placeholder="Provide specific feedback..." value={scores.feedback} onChange={e => setScores({...scores, feedback: e.target.value})} />
                </div>

                <div className="p-action-row">
                   <div className="p-overall-preview">
                     <span>Calculated Overall:</span>
                     <strong>{calculateOverall()}</strong>
                   </div>
                   <button className="p-btn-publish" onClick={submitEvaluation} disabled={publishing}>
                     {publishing ? "Publishing..." : <><IcoCheck /> Publish Result</>}
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-eval-placeholder">
               <IcoMic />
               <h2>Select a student to evaluate</h2>
               <p>Choose a submission from the left sidebar to audit their responses and assign scores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
