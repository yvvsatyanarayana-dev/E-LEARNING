import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import "./PlacementVersantEvaluation.css";

const IcoUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoFile = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoMic = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>;
const IcoAi = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>;
const IcoStar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoChevR = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;

const TEST_PARTS = [
  { id: "partA", title: "Part A: Reading" },
  { id: "partB", title: "Part B: Repeat" },
  { id: "partC", title: "Part C: Questions" },
  { id: "partD", title: "Part D: Sentence Builds" },
  { id: "partE", title: "Part E: Story Retelling" },
  { id: "partF", title: "Part F: Open Questions" },
  { id: "partG", title: "Part G: Dictation" },
  { id: "partH", title: "Part H: Passage Reconstruction" }
];

export default function PlacementVersantEvaluation() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  const [scores, setScores] = useState({
    sentence_mastery: 0,
    vocabulary: 0,
    fluency: 0,
    pronunciation: 0,
    feedback: ""
  });

  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const resp = await api.get("/placement/versant/pending");
      setSubmissions(resp || []);
    } catch (err) {
      console.error("Failed to fetch pending submissions:", err);
      setSubmissions([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSub = (sub) => {
    setSelectedSub(sub);
    setAiSuggestion(null);
    setScores({
      sentence_mastery: sub.sentence_mastery || 0,
      vocabulary: sub.vocabulary || 0,
      fluency: sub.fluency || 0,
      pronunciation: sub.pronunciation || 0,
      feedback: sub.feedback || ""
    });
  };

  const fetchAiSuggestion = async () => {
    if (!selectedSub) return;
    setAiLoading(true);
    try {
      const resp = await api.get(`/placement/versant/${selectedSub.id}/ai-suggestion`);
      setAiSuggestion(resp);
      // Auto-populate scores based on AI suggestion
      setScores({
        sentence_mastery: resp.sentence_mastery,
        vocabulary: resp.vocabulary,
        fluency: resp.fluency,
        pronunciation: resp.pronunciation,
        feedback: resp.summary_feedback
      });
    } catch (err) {
      alert("AI Evaluation failed. Please score manually.");
    } finally {
      setAiLoading(false);
    }
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

  if (loading) return <div className="p-versant-loading">Initialising Placement Officer Workspace...</div>;

  return (
    <div className="p-versant-eval">
      <header className="p-eval-header">
        <div className="p-eh-left">
          <button className="v-btn-back" onClick={() => navigate("/placementdashboard")}>← Back to Portal</button>
          <h1>Versant Audit Hub</h1>
          <p>Expert review of student English proficiency and communicative competencies.</p>
        </div>
        <div className="p-eh-right">
           <div className="p-stat-chip">Pending: <strong>{submissions.length}</strong></div>
        </div>
      </header>

      <div className="p-eval-layout">
        {/* SIDEBAR LIST */}
        <div className="p-eval-sidebar">
          <div className="p-sidebar-head">Submissions Queue</div>
          <div className="p-sub-list">
            {submissions.map(s => (
              <div 
                key={s.id} 
                className={`p-sub-card ${selectedSub?.id === s.id ? "active" : ""}`}
                onClick={() => handleSelectSub(s)}
              >
                <div className="p-sub-avatar">{s.student_name[0]}</div>
                <div className="p-sub-main">
                  <strong>{s.student_name}</strong>
                  <span>{s.student_id}</span>
                </div>
                <IcoChevR className="p-sub-arrow" />
              </div>
            ))}
          </div>
        </div>

        {/* EVALUATION WORKSPACE */}
        <div className="p-eval-main">
          {selectedSub ? (
            <div className="p-eval-workspace">
              <div className="p-workspace-header">
                 <div className="p-wh-left">
                    <h2>Reviewing: {selectedSub.student_name}</h2>
                    <span>Session Data • {new Date(selectedSub.created_at).toLocaleString()}</span>
                 </div>
                 <button className="p-btn-ai" onClick={fetchAiSuggestion} disabled={aiLoading}>
                    {aiLoading ? "Generating AI Insights..." : <><IcoAi /> Get AI Score Suggestions</>}
                 </button>
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
                                <div className="p-ans-meta">AI-Transcripted Student Response</div>
                             </div>
                           ) : (
                             <div className="p-empty-ans">No response data recorded.</div>
                           )}
                        </div>
                     </div>
                   );
                })}
              </div>

              <div className="p-grading-dashboard">
                <div className="p-gd-left">
                   <h3>Assign Proficiency Scores</h3>
                   <div className="p-score-grid">
                      {[
                        { label: "Sentence Mastery", key: "sentence_mastery" },
                        { label: "Vocabulary", key: "vocabulary" },
                        { label: "Fluency", key: "fluency" },
                        { label: "Pronunciation", key: "pronunciation" },
                      ].map(m => (
                        <div key={m.key} className="p-score-field">
                           <label>{m.label}</label>
                           <div className="p-sf-input-wrap">
                              <input type="number" min="0" max="100" value={scores[m.key]} onChange={e => setScores({...scores, [m.key]: e.target.value})} />
                              <span>/ 100</span>
                           </div>
                           <div className="p-sf-bar"><div className="p-sf-fill" style={{ width: `${scores[m.key]}%` }} /></div>
                        </div>
                      ))}
                   </div>
                   <div className="p-feedback-wrap">
                      <label>Expert Qualitative Feedback</label>
                      <textarea rows="4" placeholder="Enter detailed feedback for the student's PRI report..." value={scores.feedback} onChange={e => setScores({...scores, feedback: e.target.value})} />
                   </div>
                </div>

                <div className="p-gd-right">
                   <div className="p-overall-card">
                      <div className="p-oc-label">Computed Overall Score</div>
                      <div className="p-oc-value">{calculateOverall()}</div>
                      <div className="p-oc-indicator">
                         {calculateOverall() >= 70 ? "Advanced User" : calculateOverall() >= 50 ? "Intermediate User" : "Beginner"}
                      </div>
                   </div>
                   {aiSuggestion && (
                      <div className="p-ai-notice">
                         <IcoStar />
                         <strong>AI Suggestion Applied</strong>
                         <p>Scores have been auto-populated based on AI analysis of the student's transcription patterns.</p>
                      </div>
                   )}
                   <button className="p-btn-publish" onClick={submitEvaluation} disabled={publishing}>
                      {publishing ? "Finalising Result..." : <><IcoCheck /> Publish Audit To Student</>}
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-eval-placeholder">
               <div className="p-ph-pulse"><IcoUser /></div>
               <h2>Select a submission to begin audit</h2>
               <p>The queue shows all students who have completed the Versant Assessment but have not yet been certified.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
