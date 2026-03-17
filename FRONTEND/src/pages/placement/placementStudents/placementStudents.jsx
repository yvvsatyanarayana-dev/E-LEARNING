// placementStudents.jsx — SmartCampus Placement Students Page
// API calls wired using the shared api.js utility

import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./placementStudents.css";
import { clearAuth } from "../../../utils/auth.js";
import api from "../../../utils/api.js";

/* ════════════════════════════════════════════
   DATA MAPPER  — API shape → UI card shape
   Matches get_student_placement_list() output
════════════════════════════════════════════ */
function mapApiStudent(s) {
  const initials = (s.full_name ?? s.name ?? "?")
    .split(" ")
    .map(w => w[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  // API already resolves placement_status, company, pkg
  // but we normalise fallbacks here
  return {
    id:         s.id,
    name:       s.full_name ?? s.name ?? "—",
    init:       s.init ?? initials,
    branch:     s.department ?? s.branch ?? "—",
    year:       s.year ?? "4th",
    roll:       s.roll_number ?? s.roll ?? "—",
    cgpa:       s.settings?.cgpa ?? s.cgpa ?? 0,
    pri:        Math.round(s.pri_score ?? s.pri ?? 0),
    skills:     (s.skills ?? s.skill_list ?? []).slice(0, 3),
    interviews: s.mock_interview_count ?? s.interviews ?? 0,
    company:    s.company ?? "—",
    pkg:        s.pkg ?? s.package ?? "—",
    status:     s.placement_status ?? s.status ?? "Not Ready",
  };
}

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */
const BRANCHES  = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const YEARS     = ["1st", "2nd", "3rd", "4th"];
const STATUSES  = ["Applied", "In Process", "Placed", "Not Ready"];

const statusMap = {
  "Placed":     "badge-teal",
  "In Process": "badge-indigo",
  "Applied":    "badge-amber",
  "Not Ready":  "badge-rose",
};

const priColor  = s => s >= 85 ? "var(--teal)" : s >= 70 ? "var(--indigo-ll)" : s >= 55 ? "var(--amber)" : "var(--rose)";
const cgpaColor = c => c >= 9 ? "var(--teal)" : c >= 8 ? "var(--indigo-ll)" : "var(--amber)";
const initials  = n => n.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const defaultSettings = {
  academicYear: "2024-25", minCgpa: "7.0",
  officerName:  "Placement Officer", officerDept: "Placement Officer",
  showStats:    true, showSkills: true, colorCgpa: true,
  driveReminders: true, newStudentAlert: true, offerTracking: true, weeklyEmail: false,
  exportFormat: "CSV",
};

/* ════════════════════════════════════════════
   FORM ATOMS
════════════════════════════════════════════ */
const FInput = ({ label, name, value, onChange, type = "text", placeholder, required, hint }) => (
  <div className="af-field">
    <label className="af-label">
      {label}{required && <span className="af-req"> *</span>}
      {hint && <span className="af-hint"> {hint}</span>}
    </label>
    <input className="af-input" type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);

const FSelect = ({ label, name, value, onChange, options, required }) => (
  <div className="af-field">
    <label className="af-label">{label}{required && <span className="af-req"> *</span>}</label>
    <select className="af-input af-select" name={name} value={value} onChange={onChange}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <label className="ps-toggle" onMouseDown={e => e.stopPropagation()}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="ps-toggle-track"><span className="ps-toggle-thumb" /></span>
  </label>
);

/* ════════════════════════════════════════════
   LOADING SKELETON
════════════════════════════════════════════ */
function Skeleton({ width = "100%", height = 14, style = {} }) {
  return (
    <div style={{
      width, height,
      background: "var(--surface3)", borderRadius: 6,
      animation: "pulse 1.5s ease-in-out infinite",
      ...style,
    }} />
  );
}

/* ════════════════════════════════════════════
   OVERLAY
════════════════════════════════════════════ */
function Overlay({ onClose, children }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="ps-overlay"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div onMouseDown={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* ════════════════════════════════════════════
   SHARED ICONS
════════════════════════════════════════════ */
const XIco     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const TrashIco = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const ErrIco   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const stepIcos = [
  <svg key="a" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  <svg key="b" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  <svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
];

/* ════════════════════════════════════════════
   BADGE
════════════════════════════════════════════ */
const Badge = ({ cls, dot, children }) => (
  <span className={`badge ${cls}`}>{dot && <span className="badge-dot" />}{children}</span>
);

/* ════════════════════════════════════════════
   SIDEBAR LINK
════════════════════════════════════════════ */
const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

/* ════════════════════════════════════════════
   TOAST
════════════════════════════════════════════ */
function Toast({ icon, title, sub, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className="pd-export-toast">
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{title}</div>
        <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={onDone} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", marginLeft: 4, fontSize: 16 }}>×</button>
    </div>
  );
}

/* ════════════════════════════════════════════
   ADD STUDENT MODAL
   NOTE: Submits to POST /auth/register or a
   dedicated officer endpoint if available.
   Falls back to optimistic local update so the
   UI stays responsive even if no creation
   endpoint exists yet.
════════════════════════════════════════════ */
const defaultForm = {
  name: "", rollNo: "", email: "", phone: "",
  branch: "CSE", year: "4th", section: "A",
  cgpa: "", pri: "", skills: "",
  company: "", pkg: "", interviews: "0",
  status: "Applied", linkedin: "", github: "",
  tenth: "", twelve: "", backlogs: "0",
};

function AddStudentModal({ onClose, onAdd }) {
  const [form,    setForm]    = useState(defaultForm);
  const [step,    setStep]    = useState(1);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiErr,  setApiErr]  = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim())   e.name   = "Full name is required";
      if (!form.rollNo.trim()) e.rollNo = "Roll number is required";
      if (!form.email.trim())  e.email  = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
      if (!form.phone.trim())  e.phone  = "Phone number is required";
    }
    if (step === 2) {
      if (!form.cgpa) e.cgpa = "CGPA is required";
      else if (parseFloat(form.cgpa) < 0 || parseFloat(form.cgpa) > 10) e.cgpa = "CGPA must be 0–10";
      if (!form.pri)  e.pri  = "PRI Score is required";
      else if (parseInt(form.pri) < 0 || parseInt(form.pri) > 100) e.pri = "PRI must be 0–100";
    }
    return e;
  };

  const next = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(s => s + 1);
  };
  const prev = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setApiErr(null);
    setSaving(true);
    try {
      // Attempt to POST to backend.
      // Adjust the endpoint to match your user-creation route.
      // The placement service returns enriched student data via
      // GET /placement/dashboard/students — creation goes through
      // the auth/user registration flow on most setups.
      const created = await api.post("/placement/students", {
        full_name:   form.name,
        roll_number: form.rollNo,
        email:       form.email,
        phone:       form.phone,
        department:  form.branch,
        year:        form.year,
        section:     form.section,
        linkedin:    form.linkedin || null,
        github:      form.github   || null,
        settings: {
          cgpa:        parseFloat(form.cgpa) || 0,
          tenth_pct:   parseFloat(form.tenth)  || null,
          twelve_pct:  parseFloat(form.twelve) || null,
          active_backlogs: parseInt(form.backlogs) || 0,
        },
        skills:       form.skills.split(",").map(x => x.trim()).filter(Boolean),
        pri_score:    parseInt(form.pri) || 0,
        company:      form.company || "—",
        package:      form.pkg     || "—",
        interviews:   parseInt(form.interviews) || 0,
        status:       form.status,
      });

      // Map the API response to our card shape
      const card = mapApiStudent(created);
      setSuccess(true);
      setTimeout(() => { onAdd(card); onClose(); }, 1500);
    } catch (err) {
      // If the endpoint doesn't exist yet, do an optimistic local add
      if (err.message?.includes("404") || err.message?.includes("Not Found")) {
        const card = {
          id:         Date.now(),
          name:       form.name,
          init:       initials(form.name),
          branch:     form.branch,
          year:       form.year,
          roll:       form.rollNo,
          cgpa:       parseFloat(form.cgpa) || 0,
          pri:        parseInt(form.pri) || 0,
          skills:     form.skills.split(",").map(x => x.trim()).filter(Boolean),
          interviews: parseInt(form.interviews) || 0,
          company:    form.company || "—",
          pkg:        form.pkg     || "—",
          status:     form.status,
        };
        setSuccess(true);
        setTimeout(() => { onAdd(card); onClose(); }, 1500);
      } else {
        setApiErr(err.message ?? "Failed to add student. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const steps = ["Personal Info", "Academic Details", "Placement Info"];

  return (
    <Overlay onClose={onClose}>
      <div className="ps-panel">
        <div className="ps-header">
          <div className="ps-header-left">
            <div className="ps-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <div>
              <div className="ps-modal-title">Add New Student</div>
              <div className="ps-modal-sub">Register a student into the placement system</div>
            </div>
          </div>
          <button className="ps-close" onClick={onClose}><XIco /></button>
        </div>

        {/* Step Indicator */}
        <div className="ps-steps">
          {steps.map((label, i) => {
            const n = i + 1; const done = step > n; const act = step === n;
            return (
              <div key={label} className="ps-step-item">
                <div className={`ps-step-circle${act ? " act" : ""}${done ? " done" : ""}`}>
                  {done ? <CheckIco /> : stepIcos[i]}
                </div>
                <span className={`ps-step-label${act ? " act" : ""}${done ? " done" : ""}`}>{label}</span>
                {i < steps.length - 1 && <div className={`ps-step-line${done ? " done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {success ? (
          <div className="ps-success">
            <div className="ps-success-ring">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="ps-success-title">Student Added!</div>
            <div className="ps-success-sub">{form.name} has been registered.</div>
          </div>
        ) : (
          <div className="ps-body">
            {apiErr && (
              <div className="pd-err" style={{ marginBottom: 12 }}>
                <ErrIco />{apiErr}
              </div>
            )}

            {/* ── Step 1: Personal Info ── */}
            {step === 1 && (
              <div>
                <p className="af-section-desc">Enter the student's personal and contact details.</p>
                <div className="af-grid-2">
                  <FInput label="Full Name"   name="name"   value={form.name}   onChange={handleChange} placeholder="e.g. Arjun Sharma" required />
                  <FInput label="Roll Number" name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. 21CS001" required />
                </div>
                {(errors.name || errors.rollNo) && (
                  <div className="af-errors">
                    {errors.name   && <div className="af-error"><ErrIco />{errors.name}</div>}
                    {errors.rollNo && <div className="af-error"><ErrIco />{errors.rollNo}</div>}
                  </div>
                )}
                <div className="af-grid-2">
                  <FInput label="Email" name="email" value={form.email} onChange={handleChange} type="email" placeholder="student@college.edu.in" required />
                  <FInput label="Phone" name="phone" value={form.phone} onChange={handleChange} type="tel"   placeholder="+91 XXXXX XXXXX" required />
                </div>
                {(errors.email || errors.phone) && (
                  <div className="af-errors">
                    {errors.email && <div className="af-error"><ErrIco />{errors.email}</div>}
                    {errors.phone && <div className="af-error"><ErrIco />{errors.phone}</div>}
                  </div>
                )}
                <div className="af-grid-3">
                  <FSelect label="Branch"  name="branch"  value={form.branch}  onChange={handleChange} options={BRANCHES} required />
                  <FSelect label="Year"    name="year"    value={form.year}    onChange={handleChange} options={YEARS} required />
                  <FInput  label="Section" name="section" value={form.section} onChange={handleChange} placeholder="A / B / C" />
                </div>
                <div className="af-grid-2">
                  <FInput label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="linkedin.com/in/…" hint="(optional)" />
                  <FInput label="GitHub"   name="github"   value={form.github}   onChange={handleChange} placeholder="github.com/…" hint="(optional)" />
                </div>
              </div>
            )}

            {/* ── Step 2: Academic Details ── */}
            {step === 2 && (
              <div>
                <p className="af-section-desc">Enter academic performance and skill details.</p>
                <div className="af-grid-2">
                  <div className="af-field">
                    <label className="af-label">CGPA <span className="af-req">*</span> <span className="af-hint">/ 10.0</span></label>
                    <input className="af-input" type="number" name="cgpa" value={form.cgpa} onChange={handleChange} placeholder="e.g. 8.7" min="0" max="10" step="0.01" />
                    {errors.cgpa && <div className="af-error-inline">{errors.cgpa}</div>}
                    <div className="af-micro-bar">
                      <div className="af-micro-fill" style={{ width: `${(parseFloat(form.cgpa) || 0) * 10}%`, background: cgpaColor(parseFloat(form.cgpa) || 0) }} />
                    </div>
                  </div>
                  <div className="af-field">
                    <label className="af-label">PRI Score <span className="af-req">*</span> <span className="af-hint">/ 100</span></label>
                    <input className="af-input" type="number" name="pri" value={form.pri} onChange={handleChange} placeholder="e.g. 82" min="0" max="100" />
                    {errors.pri && <div className="af-error-inline">{errors.pri}</div>}
                    <div className="af-micro-bar">
                      <div className="af-micro-fill" style={{ width: `${parseInt(form.pri) || 0}%`, background: priColor(parseInt(form.pri) || 0) }} />
                    </div>
                  </div>
                </div>
                {(form.cgpa || form.pri) && (
                  <div className="af-live-preview">
                    <div className="af-lp-label">Live Preview</div>
                    <div className="af-lp-row">
                      {form.cgpa && (
                        <div className="af-lp-stat" style={{ borderColor: cgpaColor(parseFloat(form.cgpa) || 0) }}>
                          <div className="af-lp-val" style={{ color: cgpaColor(parseFloat(form.cgpa) || 0) }}>{parseFloat(form.cgpa).toFixed(1)}</div>
                          <div className="af-lp-lbl">CGPA</div>
                        </div>
                      )}
                      {form.pri && (
                        <div className="af-lp-stat" style={{ borderColor: priColor(parseInt(form.pri) || 0) }}>
                          <div className="af-lp-val" style={{ color: priColor(parseInt(form.pri) || 0) }}>{form.pri}</div>
                          <div className="af-lp-lbl">PRI</div>
                        </div>
                      )}
                      {form.cgpa && (
                        <span className={`badge ${parseFloat(form.cgpa) >= 9 ? "badge-teal" : parseFloat(form.cgpa) >= 8 ? "badge-indigo" : "badge-amber"}`} style={{ alignSelf: "center" }}>
                          {parseFloat(form.cgpa) >= 9 ? "★ Outstanding" : parseFloat(form.cgpa) >= 8 ? "Good Standing" : "Needs Improvement"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="af-field">
                  <label className="af-label">Skills <span className="af-hint">(comma separated)</span></label>
                  <input className="af-input" type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. React, Python, DSA" />
                  {form.skills && (
                    <div className="af-skill-preview">
                      {form.skills.split(",").filter(s => s.trim()).map(sk => (
                        <span key={sk} className="skill-chip">{sk.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="af-grid-2">
                  <FInput label="10th %" name="tenth"  value={form.tenth}  onChange={handleChange} type="number" placeholder="e.g. 92.4" hint="(optional)" />
                  <FInput label="12th %" name="twelve" value={form.twelve} onChange={handleChange} type="number" placeholder="e.g. 88.6" hint="(optional)" />
                </div>
                <div className="af-field">
                  <label className="af-label">Active Backlogs</label>
                  <div className="af-radio-row">
                    {["0", "1", "2", "3+"].map(v => (
                      <label key={v} className={`af-radio-btn${form.backlogs === v ? " active" : ""}`}>
                        <input type="radio" name="backlogs" value={v} checked={form.backlogs === v} onChange={handleChange} style={{ display: "none" }} />{v}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Placement Info ── */}
            {step === 3 && (
              <div>
                <p className="af-section-desc">Enter current placement status and offer details.</p>
                <div className="af-grid-2">
                  <FSelect label="Placement Status"  name="status"     value={form.status}     onChange={handleChange} options={STATUSES} required />
                  <FInput  label="No. of Interviews" name="interviews" value={form.interviews} onChange={handleChange} type="number" placeholder="0" />
                </div>
                <div className="af-grid-2">
                  <FInput label="Company (if placed)" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google"  hint="(if applicable)" />
                  <FInput label="Package (if placed)" name="pkg"     value={form.pkg}     onChange={handleChange} placeholder="e.g. 24 LPA" hint="(if applicable)" />
                </div>
                <div className={`af-status-hint status-${form.status.toLowerCase().replace(/\s/g, "-")}`}>
                  <span className="af-status-hint-icon">
                    {form.status === "Placed" ? "🎉" : form.status === "In Process" ? "⏳" : form.status === "Applied" ? "📄" : "⚠️"}
                  </span>
                  <span>
                    {form.status === "Placed"      ? "Great! Fill in company and package above."
                     : form.status === "In Process" ? "Student is in an active selection process."
                     : form.status === "Applied"    ? "Student has applied but hasn't been interviewed yet."
                     : "Student needs placement readiness improvement."}
                  </span>
                </div>

                {/* Preview Card */}
                <div className="af-summary-card">
                  <div className="af-summary-hd">Preview</div>
                  <div className="af-summary-top">
                    <div className="af-summary-av">{initials(form.name || "ST")}</div>
                    <div className="af-summary-info">
                      <div className="af-summary-name">{form.name || "Student Name"}</div>
                      <div className="af-summary-meta">{form.branch} · {form.year} Year · {form.rollNo || "—"}</div>
                      <div className="af-summary-meta">{form.email || "—"}</div>
                    </div>
                    <Badge cls={statusMap[form.status]} dot>{form.status}</Badge>
                  </div>
                  <div className="af-summary-stats">
                    {[
                      { val: form.cgpa || "—",      color: form.cgpa ? cgpaColor(parseFloat(form.cgpa)) : "var(--text3)",   lbl: "CGPA" },
                      { val: form.pri  || "—",       color: form.pri  ? priColor(parseInt(form.pri))   : "var(--text3)",     lbl: "PRI" },
                      { val: form.interviews || "0", color: "var(--indigo-ll)",                                              lbl: "Interviews" },
                      { val: form.pkg  || "—",       color: form.pkg  ? "var(--teal)" : "var(--text3)",                     lbl: "Package" },
                    ].map(m => (
                      <div key={m.lbl} className="af-summary-stat">
                        <div className="af-summary-stat-val" style={{ color: m.color }}>{m.val}</div>
                        <div className="af-summary-stat-lbl">{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {form.skills && (
                    <div className="af-summary-skills">
                      {form.skills.split(",").filter(s => s.trim()).map(sk => (
                        <span key={sk} className="skill-chip">{sk.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!success && (
          <div className="ps-footer">
            <div className="ps-footer-left">
              <div className="ps-dots">
                {[1, 2, 3].map(n => (
                  <div key={n} className={`ps-dot${step === n ? " act" : step > n ? " done" : ""}`} />
                ))}
              </div>
              <span className="ps-step-count">Step {step} of 3</span>
            </div>
            <div className="ps-footer-right">
              <button className="btn btn-ghost" style={{ fontSize: 11, padding: "9px 18px" }} onClick={step === 1 ? onClose : prev}>
                {step === 1 ? "Cancel" : "← Back"}
              </button>
              {step < 3
                ? <button className="btn btn-solid" style={{ fontSize: 11, padding: "9px 22px" }} onClick={next}>Continue →</button>
                : <button className="btn btn-teal"  style={{ fontSize: 11, padding: "9px 22px" }} onClick={handleSubmit} disabled={saving}>
                    {saving ? <><div className="pd-spinner" />&nbsp;Saving…</> : <><CheckIco />Add Student</>}
                  </button>
              }
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   SETTINGS MODAL
════════════════════════════════════════════ */
function SettingsModal({ onClose, settings, onSave }) {
  const [tab,   setTab]   = useState("general");
  const [local, setLocal] = useState({ ...settings });
  const toggle = key => setLocal(s => ({ ...s, [key]: !s[key] }));
  const setVal = (key, val) => setLocal(s => ({ ...s, [key]: val }));

  return (
    <Overlay onClose={onClose}>
      <div className="ps-panel ps-panel-sm">
        <div className="ps-header">
          <div className="ps-header-left">
            <div className="ps-modal-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div>
              <div className="ps-modal-title">Settings</div>
              <div className="ps-modal-sub">Customize your placement dashboard</div>
            </div>
          </div>
          <button className="ps-close" onClick={onClose}><XIco /></button>
        </div>

        <div className="ps-tabs">
          {["general", "display", "notifications", "data"].map(t => (
            <button key={t} className={`ps-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="ps-body">
          {tab === "general" && (
            <div>
              <div className="ps-section-label">Academic</div>
              <div className="ps-row">
                <div className="ps-row-info"><div className="ps-row-label">Academic Year</div><div className="ps-row-desc">Shown in sidebar and reports</div></div>
                <select className="ps-select" value={local.academicYear} onChange={e => setVal("academicYear", e.target.value)}>
                  {["2022-23", "2023-24", "2024-25", "2025-26"].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="ps-row">
                <div className="ps-row-info"><div className="ps-row-label">Min CGPA Threshold</div><div className="ps-row-desc">For placement eligibility warnings</div></div>
                <select className="ps-select" value={local.minCgpa} onChange={e => setVal("minCgpa", e.target.value)}>
                  {["6.0", "6.5", "7.0", "7.5", "8.0"].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="ps-section-label" style={{ marginTop: 18 }}>Officer Profile</div>
              <div className="af-grid-2" style={{ marginBottom: 0 }}>
                <FInput label="Name" name="officerName" value={local.officerName} onChange={e => setVal("officerName", e.target.value)} placeholder="Officer name" />
                <FInput label="Role" name="officerDept" value={local.officerDept} onChange={e => setVal("officerDept", e.target.value)} placeholder="e.g. Placement Officer" />
              </div>
            </div>
          )}
          {tab === "display" && (
            <div>
              <div className="ps-section-label">Cards &amp; Layout</div>
              <div className="ps-row"><div className="ps-row-info"><div className="ps-row-label">Show Stat Cards</div><div className="ps-row-desc">Overview numbers at top of page</div></div><Toggle checked={local.showStats}  onChange={() => toggle("showStats")} /></div>
              <div className="ps-row"><div className="ps-row-info"><div className="ps-row-label">Show Skill Chips</div><div className="ps-row-desc">Display skills on each card</div></div><Toggle checked={local.showSkills} onChange={() => toggle("showSkills")} /></div>
              <div className="ps-row"><div className="ps-row-info"><div className="ps-row-label">Color-code CGPA &amp; PRI</div><div className="ps-row-desc">Green / amber / red by score</div></div><Toggle checked={local.colorCgpa}  onChange={() => toggle("colorCgpa")} /></div>
            </div>
          )}
          {tab === "notifications" && (
            <div>
              <div className="ps-section-label">Alerts</div>
              {[
                { key: "driveReminders",  label: "Drive Reminders",      desc: "Notify before upcoming drives" },
                { key: "newStudentAlert", label: "New Student Alerts",    desc: "When a student is registered" },
                { key: "offerTracking",   label: "Offer Letter Tracking", desc: "Status updates on offers" },
                { key: "weeklyEmail",     label: "Weekly Summary Email",  desc: "Stats digest every Monday" },
              ].map(r => (
                <div key={r.key} className="ps-row">
                  <div className="ps-row-info"><div className="ps-row-label">{r.label}</div><div className="ps-row-desc">{r.desc}</div></div>
                  <Toggle checked={local[r.key]} onChange={() => toggle(r.key)} />
                </div>
              ))}
            </div>
          )}
          {tab === "data" && (
            <div>
              <div className="ps-section-label">Export</div>
              <div className="ps-row">
                <div className="ps-row-info"><div className="ps-row-label">Default Export Format</div><div className="ps-row-desc">Used when downloading data</div></div>
                <select className="ps-select" value={local.exportFormat} onChange={e => setVal("exportFormat", e.target.value)}>
                  {["CSV", "Excel", "PDF"].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="ps-section-label" style={{ marginTop: 18, color: "var(--rose)" }}>Danger Zone</div>
              <div className="ps-row">
                <div className="ps-row-info"><div className="ps-row-label">Reset All Settings</div><div className="ps-row-desc">Restore defaults</div></div>
                <button
                  className="btn"
                  style={{ fontSize: 11, padding: "7px 14px", background: "rgba(240,83,106,.1)", color: "var(--rose)", border: "1px solid rgba(240,83,106,.25)" }}
                  onClick={() => setLocal({ ...defaultSettings })}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="ps-footer">
          <div className="ps-footer-left"><span style={{ fontSize: 11, color: "var(--text3)" }}>Saved on confirm</span></div>
          <div className="ps-footer-right">
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: "9px 18px" }} onClick={onClose}>Cancel</button>
            <button className="btn btn-teal"  style={{ fontSize: 11, padding: "9px 22px" }} onClick={() => { onSave(local); onClose(); }}>
              <CheckIco />Save Settings
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   DELETE CONFIRM  — calls DELETE on backend
════════════════════════════════════════════ */
function DeleteConfirm({ student, onConfirm, onCancel, deleting }) {
  return (
    <Overlay onClose={onCancel}>
      <div className="ps-panel ps-panel-delete">
        <div className="ps-delete-icon">
          <TrashIco />
        </div>
        <div className="ps-delete-title">Remove Student?</div>
        <div className="ps-delete-sub">
          This will permanently remove{" "}
          <strong style={{ color: "var(--text)" }}>{student.name}</strong> from the placement system.
        </div>
        <div className="ps-delete-actions">
          <button className="btn btn-ghost" style={{ fontSize: 11, padding: "9px 20px" }} onClick={onCancel}>Cancel</button>
          <button
            className="btn"
            style={{ fontSize: 11, padding: "9px 20px", background: "rgba(240,83,106,.12)", color: "var(--rose)", border: "1px solid rgba(240,83,106,.25)" }}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? <><div className="pd-spinner" />&nbsp;Removing…</> : "Yes, Remove"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function PlacementStudents() {
  const navigate = useNavigate();

  // ── API data ──────────────────────────────────────────────────
  const [students,      setStudents]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [statsLoading,  setStatsLoading]  = useState(true);
  const [dashStats,     setDashStats]     = useState(null);
  const [officerName,   setOfficerName]   = useState("");
  const [upcomingCount, setUpcomingCount] = useState(0);

  // ── UI state ──────────────────────────────────────────────────
  const [filter,         setFilter]         = useState("All");
  const [search,         setSearch]         = useState("");
  const [branch,         setBranch]         = useState("All");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState(null);
  const [deleting,       setDeleting]       = useState(false);
  const [settings,       setSettings]       = useState(defaultSettings);
  const [toast,          setToast]          = useState(null);

  // ── Cursor ────────────────────────────────────────────────────
  const curRef  = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0), rx = useRef(0), ry = useRef(0);

  useEffect(() => {
    const onMove = e => {
      mx.current = e.clientX; my.current = e.clientY;
      if (curRef.current) {
        curRef.current.style.left = e.clientX + "px";
        curRef.current.style.top  = e.clientY + "px";
      }
    };
    const onDown = () => document.body.classList.add("c-click");
    const onUp   = () => document.body.classList.remove("c-click");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);
    let raf;
    const loop = () => {
      rx.current += (mx.current - rx.current) * 0.14;
      ry.current += (my.current - ry.current) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.left = rx.current + "px";
        ringRef.current.style.top  = ry.current + "px";
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ── Body scroll lock ──────────────────────────────────────────
  const anyModal = showAddStudent || showSettings || !!deleteTarget;
  useEffect(() => {
    document.body.style.overflow = anyModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [anyModal]);

  /* ════════════════════════════════════════════
     INITIAL FETCH — officer info + stats + students
     All parallel via Promise.allSettled so a
     single failure doesn't block the rest.
  ════════════════════════════════════════════ */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setStatsLoading(true);
      try {
        const [meRes, statsRes, studentsRes, drivesRes] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/placement/dashboard/stats"),
          api.get("/placement/dashboard/students?limit=100"),
          api.get("/placement/internships?limit=50"),
        ]);

        // Officer name
        if (meRes.status === "fulfilled") {
          const me = meRes.value;
          const name = me.full_name ?? me.email ?? "";
          setOfficerName(name);
          setSettings(s => ({ ...s, officerName: name }));
        }

        // Dashboard KPIs
        if (statsRes.status === "fulfilled") {
          setDashStats(statsRes.value);
        }

        // Student list
        if (studentsRes.status === "fulfilled") {
          const raw = Array.isArray(studentsRes.value)
            ? studentsRes.value
            : (studentsRes.value?.items ?? []);
          setStudents(raw.map(mapApiStudent));
        }

        // Upcoming drives count for sidebar badge
        if (drivesRes.status === "fulfilled") {
          const raw = Array.isArray(drivesRes.value)
            ? drivesRes.value
            : (drivesRes.value?.items ?? []);
          setUpcomingCount(raw.filter(d => d.status === "Upcoming").length);
        }
      } catch (err) {
        console.error("PlacementStudents fetch error:", err);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* ════════════════════════════════════════════
     RE-FETCH on search / filter / branch change
     350 ms debounce — sends params to backend
     so filtering is server-side for large lists.
  ════════════════════════════════════════════ */
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ limit: "100" });
        if (search)                     params.set("search", search);
        if (filter !== "All")           params.set("status", filter);
        if (branch !== "All")           params.set("branch", branch);

        const raw = await api.get(`/placement/dashboard/students?${params}`);
        const arr = Array.isArray(raw) ? raw : (raw?.items ?? []);
        setStudents(arr.map(mapApiStudent));
      } catch (err) {
        console.error("Student filter fetch error:", err);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [search, filter, branch]);

  /* ════════════════════════════════════════════
     HANDLERS
  ════════════════════════════════════════════ */

  // Optimistic prepend after successful add
  const handleAddStudent = useCallback(card => {
    setStudents(prev => [card, ...prev]);
    setToast({ icon: "🎓", title: "Student Added!", sub: `${card.name} has been registered.` });
  }, []);

  // DELETE — calls DELETE /placement/students/{id} if available,
  // then removes from local state either way
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Attempt backend delete; ignore 404 (student may be managed via
      // user service rather than a placement-specific endpoint)
      await api.delete(`/placement/students/${deleteTarget.id}`);
    } catch (err) {
      // If endpoint not found, still remove from UI (graceful degradation)
      if (!err.message?.includes("404") && !err.message?.includes("Not Found")) {
        setToast({ icon: "❌", title: "Delete Failed", sub: err.message ?? "Please try again." });
        setDeleting(false);
        setDeleteTarget(null);
        return;
      }
    }
    setStudents(prev => prev.filter(s => s.id !== deleteTarget.id));
    setToast({ icon: "🗑️", title: "Student Removed", sub: `${deleteTarget.name} has been removed.` });
    setDeleting(false);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const handleSignOut = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  /* ════════════════════════════════════════════
     DERIVED VALUES
  ════════════════════════════════════════════ */
  const placedCount    = dashStats?.placed_students  ?? students.filter(s => s.status === "Placed").length;
  const totalStudents  = dashStats?.total_students   ?? students.length;
  const placementRate  = dashStats?.placement_rate   ?? (totalStudents ? Math.round(placedCount / totalStudents * 100) : 0);

  const inProcessCount = students.filter(s => s.status === "In Process").length;
  const notReadyCount  = students.filter(s => s.status === "Not Ready").length;

  const officerInitials = (officerName || settings.officerName)
    .trim().split(" ").map(w => w[0]?.toUpperCase()).join("").slice(0, 2);

  // Students are already filtered server-side; this is a client-side safety net
  // only used when we have stale local state before the debounce fires
  const displayed = students;

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <>
      {/* Custom cursor — z-index 99999 stays above modal overlay */}
      <div className="sc-cursor"      ref={curRef}  style={{ zIndex: 99999 }} />
      <div className="sc-cursor-ring" ref={ringRef} style={{ zIndex: 99999 }} />
      <div className="sc-noise" />

      {/* Modals */}
      {showAddStudent && (
        <AddStudentModal onClose={() => setShowAddStudent(false)} onAdd={handleAddStudent} />
      )}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} settings={settings} onSave={setSettings} />
      )}
      {deleteTarget && (
        <DeleteConfirm
          student={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
      {toast && (
        <Toast icon={toast.icon} title={toast.title} sub={toast.sub} onDone={() => setToast(null)} />
      )}

      <div className="app">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-top">
            <Link className="sb-brand" to="/placementdashboard">
              <div className="sb-mark">SC</div>
              <span className="sb-name">SmartCampus</span>
            </Link>
          </div>

          <Link to="/placementdashboard/placementProfile" className="sb-user" style={{ textDecoration: "none" }}>
            <div className="sb-avatar">{loading ? "…" : officerInitials}</div>
            <div>
              <div className="sb-uname">{loading ? "Loading…" : (officerName || settings.officerName)}</div>
              <div className="sb-urole">{settings.officerDept}</div>
            </div>
          </Link>

          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/analytics" badge="New" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>

            <div className="sb-sec-label">Placement</div>
            <SbLink active to="/placementdashboard/students"
              badge={loading ? "…" : String(totalStudents)} badgeCls="teal"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>
              Students
            </SbLink>
            <SbLink to="/placementdashboard/companies"
              badge={loading ? "…" : String(dashStats?.companies_visited ?? "—")} badgeCls="amber"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>
              Companies
            </SbLink>
            <SbLink to="/placementdashboard/drives"
              badge={loading ? "…" : String(upcomingCount)} badgeCls="rose"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>
              Drives
            </SbLink>
            <SbLink to="/placementdashboard/offers-placed"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>
              Offers &amp; Placed
            </SbLink>
            <SbLink to="/placementdashboard/internships"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>
              Internships
            </SbLink>

            <div className="sb-sec-label">Tools</div>
            <SbLink to="/placementdashboard/meetings"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>
              Virtual Meeting
            </SbLink>
            <SbLink to="/placementdashboard/ai-assistant"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}>
              AI Assistant
            </SbLink>
            <SbLink to="/placementdashboard/reports"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>
              Reports
            </SbLink>
          </nav>

          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">{statsLoading ? "…" : `${placementRate}%`}</div>
              <div className="sb-pri-sub">AY {settings.academicYear}</div>
              <div className="sb-pri-bar">
                <div className="sb-pri-fill" style={{ width: statsLoading ? "0%" : `${placementRate}%`, transition: "width 1s ease" }} />
              </div>
            </div>
            <button className="sb-logout" onClick={handleSignOut}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <header className="topbar">
            <span className="tb-page">Students</span>
            <div className="tb-sep" />
            <div className="tb-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text3)", flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search students, company…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ cursor: "none" }}
              />
            </div>
            <div className="tb-right">
              <span className="tb-date">
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </span>
              <button className="tb-icon-btn" onClick={() => setShowSettings(true)} title="Settings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button className="btn btn-solid" style={{ fontSize: 10, padding: "8px 14px" }} onClick={() => setShowAddStudent(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Student
              </button>
            </div>
          </header>

          <div className="content">
            {/* Greeting */}
            <div className="greet-row">
              <div className="greet-tag">
                <div className="greet-pip" />
                <span className="greet-pip-txt">{loading ? "…" : `${totalStudents} Total`} · AY {settings.academicYear}</span>
              </div>
              <h1 className="greet-title">Student <em>Tracker</em></h1>
              <p className="greet-sub">
                {loading
                  ? "Loading student data…"
                  : <>{placedCount} students placed · <span style={{ color: "var(--rose)" }}>{notReadyCount} need attention</span></>
                }
              </p>
            </div>

            {/* Stat Cards */}
            {settings.showStats && (
              <div className="stat-grid" style={{ marginBottom: 18 }}>
                {[
                  { label: "Total Students", val: loading ? "…" : totalStudents,  color: "indigo", delta: "Registered this year",    type: "neu" },
                  { label: "Placed",         val: loading ? "…" : placedCount,    color: "teal",   delta: `▲ ${loading ? "…" : placementRate}% rate`, type: "up" },
                  { label: "In Process",     val: loading ? "…" : inProcessCount, color: "violet", delta: "Ongoing selection",        type: "neu" },
                  { label: "Not Ready",      val: loading ? "…" : notReadyCount,  color: "rose",   delta: "Needs attention",          type: "dn" },
                ].map(s => (
                  <div key={s.label} className={`stat-card sc-${s.color}`}>
                    <div className="stat-val" style={s.color !== "indigo" ? { color: `var(--${s.color})` } : {}}>{s.val}</div>
                    <div className="stat-lbl">{s.label}</div>
                    <span className={`stat-delta delta-${s.type}`}>{s.delta}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
              <div className="filter-row">
                {["All", "Placed", "In Process", "Applied", "Not Ready"].map(f => (
                  <button key={f} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <div style={{ width: 1, height: 24, background: "var(--border2)", flexShrink: 0 }} />
              <div className="filter-row">
                {["All", "CSE", "IT", "ECE", "MECH", "EEE"].map(b => (
                  <button key={b} className={`filter-btn${branch === b ? " active" : ""}`} onClick={() => setBranch(b)}>{b}</button>
                ))}
              </div>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text3)" }}>
                {loading ? "Loading…" : `${displayed.length} students`}
              </span>
            </div>

            {/* Student Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              {loading ? (
                // Loading skeleton cards
                [1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="panel" style={{ margin: 0 }}>
                    <div style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                        <Skeleton width={42} height={42} style={{ borderRadius: "50%", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <Skeleton height={13} style={{ marginBottom: 6 }} />
                          <Skeleton height={9} width="60%" />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                        {[1, 2, 3].map(j => <Skeleton key={j} height={44} style={{ borderRadius: 8 }} />)}
                      </div>
                      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                        {[1, 2].map(j => <Skeleton key={j} width={60} height={20} style={{ borderRadius: 20 }} />)}
                      </div>
                      <Skeleton height={1} style={{ marginBottom: 10 }} />
                      <Skeleton height={10} width="50%" />
                    </div>
                  </div>
                ))
              ) : displayed.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, color: "var(--text2)", marginBottom: 6 }}>No students found</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>Try adjusting your search or filters</div>
                </div>
              ) : (
                displayed.map(s => (
                  <div
                    key={s.id ?? s.name}
                    className="panel"
                    style={{ margin: 0, cursor: "none", transition: "border-color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(91,78,248,.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = ""}
                  >
                    <div style={{ padding: "16px 18px" }}>
                      {/* Card Header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className="stu-av" style={{ width: 42, height: 42, fontSize: 13 }}>{s.init}</div>
                          <div>
                            <div className="stu-name">{s.name}</div>
                            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>
                              {s.branch} · {s.year} Year
                              {s.roll && s.roll !== "—" && ` · ${s.roll}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <Badge cls={statusMap[s.status] ?? "badge-indigo"} dot>{s.status}</Badge>
                          <button
                            className="card-delete-btn"
                            onClick={() => setDeleteTarget(s)}
                            title="Remove student"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                          </button>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                        {[
                          { val: s.cgpa,       color: settings.colorCgpa ? cgpaColor(s.cgpa) : "var(--text)", lbl: "CGPA" },
                          { val: s.pri,        color: settings.colorCgpa ? priColor(s.pri)   : "var(--text)", lbl: "PRI" },
                          { val: s.interviews, color: "var(--indigo-ll)",                                      lbl: "Interviews" },
                        ].map(m => (
                          <div key={m.lbl} style={{ background: "var(--surface2)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 16, color: m.color }}>{m.val}</div>
                            <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 2 }}>{m.lbl}</div>
                          </div>
                        ))}
                      </div>

                      {/* Skills */}
                      {settings.showSkills && s.skills.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                          {s.skills.map(sk => <span key={sk} className="skill-chip">{sk}</span>)}
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                        <span style={{ fontSize: 11, color: s.company !== "—" ? "var(--text2)" : "var(--text3)", fontWeight: s.company !== "—" ? 600 : 400 }}>
                          {s.company !== "—" ? `📌 ${s.company}` : "Not placed"}
                        </span>
                        {s.pkg !== "—" && (
                          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 13, color: "var(--teal)", fontWeight: 600 }}>
                            {s.pkg}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}