// StudentInnovationHub.jsx
// Innovation Hub module — import into StudentDashboard.jsx
// Uses CSS variables from StudentDashboard.css + StudentInnovationHub.css

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Lightbulb, Rocket, Trophy, Users,
  Star, Heart, MessageSquare, Share2, Plus, Search, Filter,
  Grid, List, Clock, Calendar, Tag, Award, Flame, TrendingUp,
  Code2, BookOpen, Zap, Globe, GitBranch, Microscope, Cpu,
  X, Upload, Send, Eye, ThumbsUp, Bookmark, ExternalLink,
  CheckCircle, AlertCircle, Lock, BarChart2, Target, Sparkles,
  ChevronDown, ArrowRight, Play, FileText, Link, Download
} from "lucide-react";

// ─── PALETTE ────────────────────────────────────────────────────
const CAT_COLOR = {
  Hackathon:    { bg: "var(--c-teal)",   light: "#0d3d3a" },
  Patent:       { bg: "var(--c-purple)", light: "#2d1f4e" },
  Research:     { bg: "var(--c-blue)",   light: "#0d2040" },
  Startup:      { bg: "var(--c-amber)",  light: "#3d2800" },
  OpenSource:   { bg: "var(--c-green)",  light: "#0d3020" },
  Competition:  { bg: "#e05c8a",         light: "#3d0d24" },
};

const STATUS_META = {
  Active:     { color: "var(--c-teal)",   icon: <Flame size={11} /> },
  Completed:  { color: "var(--c-green)",  icon: <CheckCircle size={11} /> },
  Ideation:   { color: "var(--c-amber)",  icon: <Lightbulb size={11} /> },
  Review:     { color: "var(--c-blue)",   icon: <Eye size={11} /> },
  Won:        { color: "#f5c842",         icon: <Trophy size={11} /> },
  Missed:     { color: "#666",            icon: <AlertCircle size={11} /> },
};

// ─── MOCK DATA ───────────────────────────────────────────────────
const INNOVATIONS = [
  {
    id: 1,
    title: "AgriBot: AI-Powered Crop Disease Detection",
    category: "Hackathon",
    status: "Won",
    event: "Smart India Hackathon 2024",
    team: ["Arjun Reddy", "Priya Nair", "Ravi Kumar"],
    teamSize: 4,
    tags: ["AI/ML", "IoT", "Agriculture", "Computer Vision"],
    desc: "Real-time crop disease detection using CNN models deployed on edge devices. Achieved 94.2% accuracy on the PlantVillage dataset with a custom MobileNetV3 backbone.",
    likes: 142,
    comments: 28,
    views: 1240,
    bookmarked: true,
    myEntry: true,
    prize: "₹1,00,000",
    deadline: "2024-12-15",
    completedOn: "2024-12-15",
    progress: 100,
    techStack: ["Python", "TensorFlow", "Raspberry Pi", "Flutter", "Firebase"],
    links: [
      { label: "GitHub", url: "#", icon: <GitBranch size={13} /> },
      { label: "Demo", url: "#", icon: <Play size={13} /> },
      { label: "Report", url: "#", icon: <FileText size={13} /> },
    ],
    timeline: [
      { phase: "Ideation", done: true, date: "Oct 10" },
      { phase: "Prototype", done: true, date: "Nov 5" },
      { phase: "Submission", done: true, date: "Dec 1" },
      { phase: "Finals", done: true, date: "Dec 15" },
    ],
    mentors: ["Dr. K. Raghavan"],
    achievements: ["National Winner", "Best Innovation Award", "Patent Filed"],
    feedback: "Outstanding integration of edge AI with agricultural use cases. The team demonstrated exceptional depth in model optimization.",
  },
  {
    id: 2,
    title: "CampusNav: Indoor Navigation for Differently-Abled",
    category: "Research",
    status: "Active",
    event: "IEEE Student Research Grant 2025",
    team: ["Arjun Reddy", "Sneha Patel"],
    teamSize: 3,
    tags: ["Accessibility", "BLE", "Navigation", "Assistive Tech"],
    desc: "BLE beacon-based indoor navigation system with haptic feedback for visually impaired students. Currently conducting pilot trials across 3 campus buildings.",
    likes: 87,
    comments: 15,
    views: 634,
    bookmarked: false,
    myEntry: true,
    prize: null,
    deadline: "2025-03-30",
    completedOn: null,
    progress: 65,
    techStack: ["BLE 5.0", "Android", "Kotlin", "Raspberry Pi", "Flask"],
    links: [
      { label: "GitHub", url: "#", icon: <GitBranch size={13} /> },
      { label: "Paper Draft", url: "#", icon: <FileText size={13} /> },
    ],
    timeline: [
      { phase: "Literature Review", done: true, date: "Jan 5" },
      { phase: "System Design", done: true, date: "Jan 20" },
      { phase: "Pilot Trial", done: false, date: "Mar 1" },
      { phase: "Submission", done: false, date: "Mar 30" },
    ],
    mentors: ["Dr. S. Lakshmanan", "Prof. M. Divya"],
    achievements: [],
    feedback: null,
  },
  {
    id: 3,
    title: "SecureVault: Decentralized Academic Certificate Verification",
    category: "Startup",
    status: "Ideation",
    event: "NASSCOM Startup Challenge",
    team: ["Arjun Reddy", "Karthik M.", "Divya S.", "Ankit R."],
    teamSize: 4,
    tags: ["Blockchain", "Web3", "EdTech", "Solidity"],
    desc: "Tamper-proof academic credentials on Ethereum L2. Enables instant verification for employers without relying on central institutions. Targeting B2B SaaS model.",
    likes: 56,
    comments: 9,
    views: 412,
    bookmarked: true,
    myEntry: true,
    prize: null,
    deadline: "2025-04-15",
    completedOn: null,
    progress: 30,
    techStack: ["Solidity", "React", "Hardhat", "IPFS", "Node.js"],
    links: [
      { label: "Pitch Deck", url: "#", icon: <FileText size={13} /> },
    ],
    timeline: [
      { phase: "Market Research", done: true, date: "Feb 1" },
      { phase: "MVP Build", done: false, date: "Mar 10" },
      { phase: "Pitch Round", done: false, date: "Apr 1" },
      { phase: "Finals", done: false, date: "Apr 15" },
    ],
    mentors: ["Prof. R. Venkat"],
    achievements: [],
    feedback: null,
  },
  {
    id: 4,
    title: "EduAssist: Adaptive Learning Platform using RL",
    category: "OpenSource",
    status: "Active",
    event: "Google Summer of Code 2025",
    team: ["Arjun Reddy"],
    teamSize: 1,
    tags: ["Reinforcement Learning", "EdTech", "Python", "React"],
    desc: "Open-source adaptive quiz engine that uses multi-armed bandit algorithms to personalize question difficulty in real-time. Accepted into GSoC 2025 cohort.",
    likes: 203,
    comments: 41,
    views: 1890,
    bookmarked: false,
    myEntry: true,
    prize: "$3,000 stipend",
    deadline: "2025-08-20",
    completedOn: null,
    progress: 45,
    techStack: ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
    links: [
      { label: "GitHub", url: "#", icon: <GitBranch size={13} /> },
      { label: "Live Demo", url: "#", icon: <Globe size={13} /> },
      { label: "Proposal", url: "#", icon: <FileText size={13} /> },
    ],
    timeline: [
      { phase: "Community Bonding", done: true, date: "May 1" },
      { phase: "Phase 1 Coding", done: true, date: "Jun 30" },
      { phase: "Phase 2 Coding", done: false, date: "Jul 31" },
      { phase: "Final Eval", done: false, date: "Aug 20" },
    ],
    mentors: ["GSoC Mentor: Alex T."],
    achievements: ["GSoC 2025 Accepted", "150+ Stars on GitHub"],
    feedback: null,
  },
  {
    id: 5,
    title: "SmartGrid Monitor: Real-Time Power Analytics",
    category: "Competition",
    status: "Missed",
    event: "IIT Bombay Techfest 2024",
    team: ["Priya Nair", "Rahul S.", "Arjun Reddy"],
    teamSize: 3,
    tags: ["IoT", "Power Systems", "MQTT", "Dashboard"],
    desc: "Real-time electrical grid monitoring with anomaly detection using streaming ML. Dashboard for campus energy management. Could not submit final version due to hardware failure.",
    likes: 34,
    comments: 5,
    views: 198,
    bookmarked: false,
    myEntry: true,
    prize: null,
    deadline: "2024-10-20",
    completedOn: "2024-10-20",
    progress: 70,
    techStack: ["ESP32", "MQTT", "InfluxDB", "Grafana", "Python"],
    links: [
      { label: "GitHub", url: "#", icon: <GitBranch size={13} /> },
    ],
    timeline: [
      { phase: "Design", done: true, date: "Sep 10" },
      { phase: "Build", done: true, date: "Oct 5" },
      { phase: "Testing", done: false, date: "Oct 15" },
      { phase: "Submit", done: false, date: "Oct 20" },
    ],
    mentors: [],
    achievements: [],
    feedback: "Promising concept — hardware reliability needs improvement for future submissions.",
  },
  {
    id: 6,
    title: "PathoScan: Pathology Slide Analysis with Vision Transformers",
    category: "Patent",
    status: "Review",
    event: "Patent Application IN202441023456",
    team: ["Dr. K. Raghavan", "Arjun Reddy", "Meena R."],
    teamSize: 3,
    tags: ["Computer Vision", "Healthcare", "ViT", "Medical AI"],
    desc: "Vision Transformer model for automated pathology slide annotation. Patent filed for novel attention-based multi-scale feature extraction method achieving 97.1% specificity.",
    likes: 118,
    comments: 22,
    views: 876,
    bookmarked: true,
    myEntry: true,
    prize: null,
    deadline: "2025-06-01",
    completedOn: null,
    progress: 80,
    techStack: ["PyTorch", "ViT", "OpenSlide", "FastAPI", "CUDA"],
    links: [
      { label: "Pre-print", url: "#", icon: <FileText size={13} /> },
      { label: "Patent Doc", url: "#", icon: <Lock size={13} /> },
    ],
    timeline: [
      { phase: "Research", done: true, date: "Aug 1" },
      { phase: "Experiments", done: true, date: "Oct 30" },
      { phase: "Patent Draft", done: true, date: "Jan 10" },
      { phase: "Grant Review", done: false, date: "Jun 1" },
    ],
    mentors: ["Dr. K. Raghavan"],
    achievements: ["Patent Filed", "Paper Under Review at Nature MI"],
    feedback: null,
  },
  {
    id: 7,
    title: "CodePeer: Real-Time Collaborative Code Review Platform",
    category: "OpenSource",
    status: "Active",
    event: "MLH Open Source Fellowship",
    team: ["Karthik M.", "Sneha Patel", "Ravi Kumar"],
    teamSize: 3,
    tags: ["WebSockets", "React", "Monaco Editor", "Node.js"],
    desc: "Collaborative code editor with AI-powered review suggestions, inline comments, and real-time cursor sharing. Currently in beta with 200+ active users from 12 colleges.",
    likes: 176,
    comments: 33,
    views: 2100,
    bookmarked: false,
    myEntry: false,
    prize: null,
    deadline: "2025-05-01",
    completedOn: null,
    progress: 70,
    techStack: ["React", "Node.js", "Socket.io", "Monaco", "Redis"],
    links: [
      { label: "GitHub", url: "#", icon: <GitBranch size={13} /> },
      { label: "Beta", url: "#", icon: <Globe size={13} /> },
    ],
    timeline: [
      { phase: "MVP", done: true, date: "Jan 1" },
      { phase: "Beta Launch", done: true, date: "Feb 15" },
      { phase: "v1.0", done: false, date: "May 1" },
    ],
    mentors: [],
    achievements: ["200+ Beta Users", "Featured in MLH Blog"],
    feedback: null,
  },
  {
    id: 8,
    title: "UrbanAir: Low-Cost PM2.5 Monitoring Network",
    category: "Research",
    status: "Completed",
    event: "DST Student Research Award",
    team: ["Divya S.", "Ankit R.", "Priya Nair"],
    teamSize: 3,
    tags: ["Environmental", "IoT", "Data Science", "Cloud"],
    desc: "Dense network of low-cost PM2.5 sensors with ML calibration using reference-grade co-location. Published findings on pollution hotspots across 5 city zones.",
    likes: 92,
    comments: 17,
    views: 745,
    bookmarked: false,
    myEntry: false,
    prize: "₹75,000",
    deadline: "2024-11-30",
    completedOn: "2024-11-30",
    progress: 100,
    techStack: ["Arduino", "AWS IoT", "Python", "Tableau", "PostgreSQL"],
    links: [
      { label: "Paper", url: "#", icon: <FileText size={13} /> },
      { label: "Dataset", url: "#", icon: <Download size={13} /> },
    ],
    timeline: [
      { phase: "Setup", done: true, date: "Jul 1" },
      { phase: "Data Collection", done: true, date: "Sep 30" },
      { phase: "Analysis", done: true, date: "Oct 30" },
      { phase: "Publication", done: true, date: "Nov 30" },
    ],
    mentors: ["Prof. E. Ramesh"],
    achievements: ["Published in Nature Sci. Reports", "DST Award Winner"],
    feedback: "Exceptional rigor in sensor calibration methodology. Strong real-world impact.",
  },
];

const CATEGORIES = [
  { key: "All",        label: "All",         icon: <Sparkles size={14} />, count: INNOVATIONS.length },
  { key: "Hackathon",  label: "Hackathon",   icon: <Zap size={14} />,         count: INNOVATIONS.filter(i => i.category === "Hackathon").length },
  { key: "Research",   label: "Research",    icon: <Microscope size={14} />,  count: INNOVATIONS.filter(i => i.category === "Research").length },
  { key: "Startup",    label: "Startup",     icon: <Rocket size={14} />,      count: INNOVATIONS.filter(i => i.category === "Startup").length },
  { key: "OpenSource", label: "Open Source", icon: <GitBranch size={14} />,   count: INNOVATIONS.filter(i => i.category === "OpenSource").length },
  { key: "Patent",     label: "Patent",      icon: <BookOpen size={14} />,    count: INNOVATIONS.filter(i => i.category === "Patent").length },
  { key: "Competition",label: "Competition", icon: <Trophy size={14} />,      count: INNOVATIONS.filter(i => i.category === "Competition").length },
];

const LEADERBOARD = [
  { rank: 1, name: "Priya Nair",   roll: "21CS041", points: 980, badge: "🏆", wins: 3 },
  { rank: 2, name: "Arjun Reddy",  roll: "21CS047", points: 870, badge: "🥈", wins: 2 },
  { rank: 3, name: "Karthik M.",   roll: "21CS029", points: 760, badge: "🥉", wins: 2 },
  { rank: 4, name: "Sneha Patel",  roll: "21CS055", points: 640, badge: "",   wins: 1 },
  { rank: 5, name: "Ravi Kumar",   roll: "21CS038", points: 510, badge: "",   wins: 1 },
];

const UPCOMING_EVENTS = [
  { name: "Smart India Hackathon 2025", date: "Mar 15", category: "Hackathon", slots: 120, registered: true },
  { name: "Google Summer of Code Phase 2", date: "Mar 28", category: "OpenSource", slots: null, registered: true },
  { name: "NASSCOM Startup Pitch Day", date: "Apr 5",  category: "Startup",   slots: 50, registered: false },
  { name: "IEEE Innovation Challenge",   date: "Apr 20", category: "Competition", slots: 80, registered: false },
  { name: "DRDO Technology Contest",     date: "May 3",  category: "Competition", slots: 60, registered: false },
];

// ─── SUBMIT IDEA MODAL ──────────────────────────────────────────
function SubmitModal({ onClose }) {
  const [form, setForm] = useState({
    title: "", category: "Hackathon", event: "", desc: "",
    tags: "", techStack: "", teamMembers: "", links: "",
  });
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(onClose, 2000);
  }

  if (submitted) return (
    <div className="ih-modal-overlay" onClick={onClose}>
      <div className="ih-modal ih-modal--success" onClick={e => e.stopPropagation()}>
        <div className="ih-success-anim">
          <CheckCircle size={48} color="var(--c-teal)" />
          <h3>Idea Submitted!</h3>
          <p>Your innovation has been added to the hub.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ih-modal-overlay" onClick={onClose}>
      <div className="ih-modal" onClick={e => e.stopPropagation()}>
        <div className="ih-modal-header">
          <div className="ih-modal-title">
            <Lightbulb size={18} color="var(--c-amber)" />
            <span>Submit Your Innovation</span>
          </div>
          <div className="ih-modal-steps">
            <span className={step >= 1 ? "ih-step ih-step--active" : "ih-step"}>1 Details</span>
            <ChevronRight size={12} />
            <span className={step >= 2 ? "ih-step ih-step--active" : "ih-step"}>2 Tech</span>
            <ChevronRight size={12} />
            <span className={step >= 3 ? "ih-step ih-step--active" : "ih-step"}>3 Team</span>
          </div>
          <button className="ih-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="ih-modal-body">
          {step === 1 && (
            <div className="ih-form-section">
              <div className="ih-field">
                <label>Innovation Title *</label>
                <input placeholder="e.g. AI-powered crop disease detection" value={form.title} onChange={e => set("title", e.target.value)} />
              </div>
              <div className="ih-field-row">
                <div className="ih-field">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => set("category", e.target.value)}>
                    {Object.keys(CAT_COLOR).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="ih-field">
                  <label>Event / Program</label>
                  <input placeholder="e.g. SIH 2025, GSoC, Patent" value={form.event} onChange={e => set("event", e.target.value)} />
                </div>
              </div>
              <div className="ih-field">
                <label>Description *</label>
                <textarea rows={4} placeholder="Describe your innovation, its problem statement and impact..." value={form.desc} onChange={e => set("desc", e.target.value)} />
              </div>
              <div className="ih-field">
                <label>Tags <span className="ih-hint">(comma separated)</span></label>
                <input placeholder="AI/ML, IoT, Healthcare..." value={form.tags} onChange={e => set("tags", e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="ih-form-section">
              <div className="ih-field">
                <label>Tech Stack <span className="ih-hint">(comma separated)</span></label>
                <input placeholder="Python, React, TensorFlow..." value={form.techStack} onChange={e => set("techStack", e.target.value)} />
              </div>
              <div className="ih-field">
                <label>Project Links</label>
                <input placeholder="GitHub URL, Demo URL, Pitch Deck URL..." value={form.links} onChange={e => set("links", e.target.value)} />
              </div>
              <div className="ih-field">
                <label>Upload Files <span className="ih-hint">(optional)</span></label>
                <div className="ih-dropzone">
                  <Upload size={24} color="var(--text-dim)" />
                  <p>Drag & drop or click to upload<br /><small>PDF, PPT, ZIP — max 20 MB</small></p>
                </div>
              </div>
              <div className="ih-ai-tip">
                <Sparkles size={13} color="var(--c-purple)" />
                <span><strong>Lucyna AI:</strong> A clear GitHub link increases your project visibility by 3×. Add a README with screenshots!</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="ih-form-section">
              <div className="ih-field">
                <label>Team Members <span className="ih-hint">(comma separated roll numbers)</span></label>
                <input placeholder="21CS047, 21CS041, 21CS029..." value={form.teamMembers} onChange={e => set("teamMembers", e.target.value)} />
              </div>
              <div className="ih-field">
                <label>Faculty Mentor <span className="ih-hint">(optional)</span></label>
                <input placeholder="Prof. / Dr. name..." />
              </div>
              <div className="ih-ai-tip ih-ai-tip--green">
                <Sparkles size={13} color="var(--c-teal)" />
                <span><strong>Lucyna AI:</strong> Projects with faculty mentors have a 2.4× higher chance of winning institutional support grants.</span>
              </div>
            </div>
          )}
        </div>

        <div className="ih-modal-footer">
          {step > 1 && <button className="ih-btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>}
          {step < 3
            ? <button className="ih-btn-primary" onClick={() => setStep(s => s + 1)} disabled={step === 1 && (!form.title || !form.desc)}>Continue →</button>
            : <button className="ih-btn-primary" onClick={handleSubmit}><Send size={14} /> Submit Innovation</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL DRAWER ──────────────────────────────────────────────
function DetailDrawer({ item, onClose }) {
  const [tab, setTab] = useState("overview");
  const col = CAT_COLOR[item.category] || CAT_COLOR.Hackathon;
  const sMeta = STATUS_META[item.status] || STATUS_META.Active;
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(item.bookmarked);

  return (
    <div className="ih-drawer-overlay" onClick={onClose}>
      <div className="ih-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ih-drawer-header" style={{ borderTop: `3px solid ${col.bg}` }}>
          <div className="ih-drawer-cat" style={{ background: col.light, color: col.bg }}>
            {item.category}
          </div>
          <button className="ih-drawer-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Title + actions */}
        <div className="ih-drawer-title-row">
          <h2 className="ih-drawer-title">{item.title}</h2>
          <div className="ih-drawer-actions">
            <button className={`ih-act-btn ${liked ? "ih-act-btn--active" : ""}`} onClick={() => setLiked(l => !l)}>
              <Heart size={14} /> {item.likes + (liked ? 1 : 0)}
            </button>
            <button className={`ih-act-btn ${bookmarked ? "ih-act-btn--active" : ""}`} onClick={() => setBookmarked(b => !b)}>
              <Bookmark size={14} />
            </button>
            <button className="ih-act-btn"><Share2 size={14} /></button>
          </div>
        </div>

        <div className="ih-drawer-event">{item.event}</div>

        {/* Status + stats */}
        <div className="ih-drawer-stats">
          <span className="ih-status-pill" style={{ background: sMeta.color + "22", color: sMeta.color, borderColor: sMeta.color + "44" }}>
            {sMeta.icon} {item.status}
          </span>
          <span className="ih-drawer-stat"><Eye size={12} /> {item.views}</span>
          <span className="ih-drawer-stat"><MessageSquare size={12} /> {item.comments}</span>
          {item.prize && <span className="ih-prize-pill"><Trophy size={11} /> {item.prize}</span>}
        </div>

        {/* Tabs */}
        <div className="ih-drawer-tabs">
          {["overview", "timeline", "team", "links"].map(t => (
            <button key={t} className={`ih-dtab ${tab === t ? "ih-dtab--active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="ih-drawer-body">
          {/* Overview Tab */}
          {tab === "overview" && (
            <div className="ih-tab-content">
              <p className="ih-drawer-desc">{item.desc}</p>

              {/* Progress */}
              <div className="ih-detail-section">
                <div className="ih-detail-label"><BarChart2 size={12} /> Progress</div>
                <div className="ih-prog-bar-wrap">
                  <div className="ih-prog-bar">
                    <div className="ih-prog-fill" style={{ width: item.progress + "%", background: col.bg }} />
                  </div>
                  <span className="ih-prog-pct">{item.progress}%</span>
                </div>
              </div>

              {/* Tags */}
              <div className="ih-detail-section">
                <div className="ih-detail-label"><Tag size={12} /> Tags</div>
                <div className="ih-tags-wrap">
                  {item.tags.map(t => <span key={t} className="ih-tag">{t}</span>)}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="ih-detail-section">
                <div className="ih-detail-label"><Cpu size={12} /> Tech Stack</div>
                <div className="ih-tags-wrap">
                  {item.techStack.map(t => <span key={t} className="ih-tech-tag">{t}</span>)}
                </div>
              </div>

              {/* Achievements */}
              {item.achievements.length > 0 && (
                <div className="ih-detail-section">
                  <div className="ih-detail-label"><Award size={12} /> Achievements</div>
                  <div className="ih-achievements">
                    {item.achievements.map(a => (
                      <div key={a} className="ih-achievement-pill">
                        <Star size={11} color="#f5c842" /> {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Faculty feedback */}
              {item.feedback && (
                <div className="ih-feedback-box">
                  <div className="ih-feedback-label"><MessageSquare size={12} /> Faculty / Judge Feedback</div>
                  <p className="ih-feedback-text">"{item.feedback}"</p>
                </div>
              )}

              {/* Lucyna AI tip */}
              <div className="ih-ai-tip ih-ai-tip--purple">
                <Sparkles size={13} color="var(--c-purple)" />
                <span><strong>Lucyna AI:</strong> {item.status === "Active"
                  ? "You're on track! Consider preparing a 2-min demo video to boost visibility."
                  : item.status === "Won"
                  ? "Excellent work! Consider writing a case study blog to maximize your profile impact."
                  : "Document your learnings to build a strong portfolio entry even without a win."}</span>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {tab === "timeline" && (
            <div className="ih-tab-content">
              <div className="ih-timeline">
                {item.timeline.map((phase, i) => (
                  <div key={phase.phase} className={`ih-tl-step ${phase.done ? "ih-tl-step--done" : ""}`}>
                    <div className="ih-tl-dot" style={{ background: phase.done ? col.bg : "var(--bg-card)" }} />
                    {i < item.timeline.length - 1 && (
                      <div className="ih-tl-line" style={{ background: phase.done ? col.bg + "55" : "var(--border)" }} />
                    )}
                    <div className="ih-tl-content">
                      <span className="ih-tl-phase">{phase.phase}</span>
                      <span className="ih-tl-date">{phase.date}</span>
                      {phase.done && <CheckCircle size={12} color={col.bg} />}
                    </div>
                  </div>
                ))}
              </div>
              {item.deadline && (
                <div className="ih-deadline-box">
                  <Calendar size={13} color="var(--c-amber)" />
                  <span>Final Deadline: <strong>{item.deadline}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Team Tab */}
          {tab === "team" && (
            <div className="ih-tab-content">
              <div className="ih-team-list">
                {item.team.map((member, i) => (
                  <div key={member} className="ih-team-member">
                    <div className="ih-member-avatar" style={{ background: Object.values(CAT_COLOR)[i % 6].bg }}>
                      {member.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="ih-member-info">
                      <div className="ih-member-name">{member}</div>
                      <div className="ih-member-role">{i === 0 ? "Team Lead" : "Member"}</div>
                    </div>
                    {i === 0 && <span className="ih-lead-badge">Lead</span>}
                  </div>
                ))}
              </div>
              {item.mentors.length > 0 && (
                <div className="ih-mentors-section">
                  <div className="ih-detail-label"><Award size={12} /> Faculty Mentors</div>
                  {item.mentors.map(m => (
                    <div key={m} className="ih-mentor-row">
                      <div className="ih-mentor-dot" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Links Tab */}
          {tab === "links" && (
            <div className="ih-tab-content">
              {item.links.length > 0 ? item.links.map(link => (
                <a key={link.label} href={link.url} className="ih-link-row" target="_blank" rel="noreferrer">
                  <span className="ih-link-icon">{link.icon}</span>
                  <span className="ih-link-label">{link.label}</span>
                  <ExternalLink size={12} className="ih-link-ext" />
                </a>
              )) : <p className="ih-empty-msg">No links added yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── INNOVATION CARD (GRID) ──────────────────────────────────────
function InnovationCard({ item, onClick }) {
  const col = CAT_COLOR[item.category] || CAT_COLOR.Hackathon;
  const sMeta = STATUS_META[item.status] || STATUS_META.Active;
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(item.bookmarked);

  return (
    <div className={`ih-card ${item.myEntry ? "ih-card--mine" : ""}`} onClick={onClick}
      style={{ "--card-accent": col.bg }}>
      {/* Top ribbon */}
      <div className="ih-card-top" style={{ background: col.light }}>
        <span className="ih-card-cat" style={{ color: col.bg }}>{item.category}</span>
        <span className="ih-card-status" style={{ color: sMeta.color }}>
          {sMeta.icon} {item.status}
        </span>
      </div>

      <div className="ih-card-body">
        <h4 className="ih-card-title">{item.title}</h4>
        <p className="ih-card-event">{item.event}</p>
        <p className="ih-card-desc">{item.desc.slice(0, 100)}…</p>

        {/* Progress */}
        <div className="ih-card-progress">
          <div className="ih-cprog-bar">
            <div className="ih-cprog-fill" style={{ width: item.progress + "%", background: col.bg }} />
          </div>
          <span className="ih-cprog-pct">{item.progress}%</span>
        </div>

        {/* Tags */}
        <div className="ih-card-tags">
          {item.tags.slice(0, 3).map(t => <span key={t} className="ih-tag">{t}</span>)}
          {item.tags.length > 3 && <span className="ih-tag ih-tag--more">+{item.tags.length - 3}</span>}
        </div>

        {/* Team avatars */}
        <div className="ih-card-footer">
          <div className="ih-card-avatars">
            {item.team.slice(0, 3).map((m, i) => (
              <div key={m} className="ih-mini-avatar"
                style={{ background: Object.values(CAT_COLOR)[i % 6].bg, zIndex: 10 - i }}>
                {m[0]}
              </div>
            ))}
            {item.teamSize > 3 && <div className="ih-mini-avatar ih-mini-avatar--more">+{item.teamSize - 3}</div>}
          </div>
          <div className="ih-card-actions" onClick={e => e.stopPropagation()}>
            <button className={`ih-icon-btn ${liked ? "ih-icon-btn--liked" : ""}`}
              onClick={() => setLiked(l => !l)}>
              <Heart size={13} /> {item.likes + (liked ? 1 : 0)}
            </button>
            <button className="ih-icon-btn"><MessageSquare size={13} /> {item.comments}</button>
            <button className={`ih-icon-btn ${bookmarked ? "ih-icon-btn--saved" : ""}`}
              onClick={() => setBookmarked(b => !b)}>
              <Bookmark size={13} />
            </button>
          </div>
        </div>

        {item.prize && (
          <div className="ih-prize-strip" style={{ background: col.light, borderColor: col.bg + "44" }}>
            <Trophy size={12} color="#f5c842" /> <span>{item.prize}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── INNOVATION ROW (LIST) ──────────────────────────────────────
function InnovationRow({ item, onClick }) {
  const col = CAT_COLOR[item.category] || CAT_COLOR.Hackathon;
  const sMeta = STATUS_META[item.status] || STATUS_META.Active;
  const [liked, setLiked] = useState(false);

  return (
    <div className="ih-row" onClick={onClick} style={{ "--card-accent": col.bg }}>
      <div className="ih-row-stripe" style={{ background: col.bg }} />
      <div className="ih-row-body">
        <div className="ih-row-left">
          <div className="ih-row-title-line">
            <h4 className="ih-row-title">{item.title}</h4>
            {item.myEntry && <span className="ih-mine-badge">Mine</span>}
            {item.prize && <span className="ih-prize-badge"><Trophy size={10} /> {item.prize}</span>}
          </div>
          <p className="ih-row-event">{item.event}</p>
          <div className="ih-row-tags">
            {item.tags.slice(0, 4).map(t => <span key={t} className="ih-tag">{t}</span>)}
          </div>
        </div>
        <div className="ih-row-right">
          <span className="ih-card-status" style={{ color: sMeta.color }}>{sMeta.icon} {item.status}</span>
          <div className="ih-row-prog">
            <div className="ih-cprog-bar">
              <div className="ih-cprog-fill" style={{ width: item.progress + "%", background: col.bg }} />
            </div>
            <span className="ih-cprog-pct">{item.progress}%</span>
          </div>
          <div className="ih-row-stats" onClick={e => e.stopPropagation()}>
            <button className={`ih-icon-btn ${liked ? "ih-icon-btn--liked" : ""}`}
              onClick={() => setLiked(l => !l)}>
              <Heart size={12} /> {item.likes + (liked ? 1 : 0)}
            </button>
            <span className="ih-icon-btn"><Eye size={12} /> {item.views}</span>
            <span className="ih-icon-btn"><MessageSquare size={12} /> {item.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function StudentInnovationHub({ onBack }) {
  const [activeCat, setActiveCat] = useState("All");
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Recent");
  const [viewMode, setViewMode] = useState("grid");
  const [showSubmit, setShowSubmit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef(null);

  const TABS = ["All", "Active", "Completed", "Won", "Mine"];
  const SORTS = ["Recent", "Most Liked", "Most Viewed", "Progress"];

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSortMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = INNOVATIONS.filter(item => {
    const catMatch = activeCat === "All" || item.category === activeCat;
    const tabMatch = activeTab === "All"
      ? true
      : activeTab === "Mine"
      ? item.myEntry
      : activeTab === "Won"
      ? item.status === "Won"
      : activeTab === "Completed"
      ? item.status === "Completed" || item.status === "Won"
      : item.status === "Active" || item.status === "Ideation" || item.status === "Review";
    const searchMatch = !search
      || item.title.toLowerCase().includes(search.toLowerCase())
      || item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      || item.event.toLowerCase().includes(search.toLowerCase());
    return catMatch && tabMatch && searchMatch;
  }).sort((a, b) => {
    if (sort === "Most Liked")  return b.likes - a.likes;
    if (sort === "Most Viewed") return b.views - a.views;
    if (sort === "Progress")    return b.progress - a.progress;
    return b.id - a.id;
  });

  // KPI stats
  const totalProjects = INNOVATIONS.filter(i => i.myEntry).length;
  const active  = INNOVATIONS.filter(i => i.myEntry && (i.status === "Active" || i.status === "Ideation" || i.status === "Review")).length;
  const won     = INNOVATIONS.filter(i => i.myEntry && i.status === "Won").length;
  const totalLikes = INNOVATIONS.filter(i => i.myEntry).reduce((s, i) => s + i.likes, 0);

  return (
    <div className="ih-root">
      {/* Back */}
      <button className="san-back-btn" onClick={onBack}>
        <ChevronLeft size={14} /> Back to Dashboard
      </button>

      {/* Page header */}
      <div className="ih-page-header">
        <div className="ih-header-left">
          <div className="ih-header-icon"><Rocket size={20} color="var(--c-purple)" /></div>
          <div>
            <h1 className="ih-page-title">Innovation Hub</h1>
            <p className="ih-page-sub">Your projects, hackathons, patents & research — all in one place</p>
          </div>
        </div>
        <button className="ih-submit-btn" onClick={() => setShowSubmit(true)}>
          <Plus size={15} /> Submit Innovation
        </button>
      </div>

      {/* KPI strip */}
      <div className="san-kpi-grid ih-kpi-grid">
        <div className="san-kpi-card">
          <div className="san-kpi-top"><span className="san-kpi-label">My Projects</span><Rocket size={14} className="san-kpi-icon" /></div>
          <div className="san-kpi-val">{totalProjects}</div>
          <div className="san-kpi-sub">submitted innovations</div>
        </div>
        <div className="san-kpi-card">
          <div className="san-kpi-top"><span className="san-kpi-label">Active</span><Flame size={14} className="san-kpi-icon" style={{ color: "var(--c-teal)" }} /></div>
          <div className="san-kpi-val" style={{ color: "var(--c-teal)" }}>{active}</div>
          <div className="san-kpi-sub">in progress right now</div>
        </div>
        <div className="san-kpi-card">
          <div className="san-kpi-top"><span className="san-kpi-label">Won / Recognised</span><Trophy size={14} className="san-kpi-icon" style={{ color: "#f5c842" }} /></div>
          <div className="san-kpi-val" style={{ color: "#f5c842" }}>{won}</div>
          <div className="san-kpi-sub">awards & recognitions</div>
        </div>
        <div className="san-kpi-card">
          <div className="san-kpi-top"><span className="san-kpi-label">Total Likes</span><Heart size={14} className="san-kpi-icon" style={{ color: "#e05c8a" }} /></div>
          <div className="san-kpi-val" style={{ color: "#e05c8a" }}>{totalLikes}</div>
          <div className="san-kpi-sub">across all projects</div>
        </div>
      </div>

      {/* Main layout */}
      <div className="ih-layout">
        {/* Sidebar */}
        <aside className="ih-sidebar">
          <div className="ih-sidebar-section">
            <div className="ih-sidebar-heading">Categories</div>
            {CATEGORIES.map(cat => (
              <button key={cat.key}
                className={`ih-cat-item ${activeCat === cat.key ? "ih-cat-item--active" : ""}`}
                onClick={() => setActiveCat(cat.key)}>
                <span className="ih-cat-icon">{cat.icon}</span>
                <span className="ih-cat-label">{cat.label}</span>
                <span className="ih-cat-count">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Upcoming Events */}
          <div className="ih-sidebar-section">
            <div className="ih-sidebar-heading">Upcoming Events</div>
            {UPCOMING_EVENTS.map(ev => {
              const col = CAT_COLOR[ev.category] || CAT_COLOR.Hackathon;
              return (
                <div key={ev.name} className="ih-event-item">
                  <div className="ih-event-dot" style={{ background: col.bg }} />
                  <div className="ih-event-info">
                    <div className="ih-event-name">{ev.name}</div>
                    <div className="ih-event-meta">
                      <Calendar size={10} /> {ev.date}
                      {ev.registered && <span className="ih-reg-badge">Registered</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leaderboard */}
          <div className="ih-sidebar-section">
            <div className="ih-sidebar-heading"><Trophy size={12} /> Innovators Board</div>
            {LEADERBOARD.map(user => (
              <div key={user.rank} className={`ih-lb-row ${user.name === "Arjun Reddy" ? "ih-lb-row--me" : ""}`}>
                <span className="ih-lb-rank">{user.badge || `#${user.rank}`}</span>
                <div className="ih-lb-info">
                  <div className="ih-lb-name">{user.name}</div>
                  <div className="ih-lb-pts">{user.points} pts · {user.wins} wins</div>
                </div>
              </div>
            ))}
          </div>

          {/* Lucyna AI tip */}
          <div className="ih-lucyna-card">
            <div className="ih-lucyna-header"><Sparkles size={14} color="var(--c-purple)" /> Lucyna AI</div>
            <p className="ih-lucyna-tip">You're ranked <strong>#2</strong> in your department! Completing <strong>CampusNav</strong> could push you to the top spot. 🚀</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="ih-main">
          {/* Toolbar */}
          <div className="mc-toolbar ih-toolbar">
            <div className="mc-filter-tabs">
              {TABS.map(t => (
                <button key={t}
                  className={`mc-filter-tab ${activeTab === t ? "mc-filter-tab--active" : ""}`}
                  onClick={() => setActiveTab(t)}>
                  {t}
                  {t === "Active" && <span className="mc-tab-badge" style={{ background: "var(--c-teal)" }}>{active}</span>}
                  {t === "Mine" && <span className="mc-tab-badge" style={{ background: "var(--c-purple)" }}>{totalProjects}</span>}
                </button>
              ))}
            </div>
            <div className="mc-toolbar-right">
              <div className="mc-search-wrap">
                <Search size={13} />
                <input className="mc-search" placeholder="Search innovations…"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="ih-sort-wrap" ref={sortRef}>
                <button className="ih-sort-btn" onClick={() => setShowSortMenu(s => !s)}>
                  <Filter size={13} /> {sort} <ChevronDown size={11} />
                </button>
                {showSortMenu && (
                  <div className="ih-sort-menu">
                    {SORTS.map(s => (
                      <button key={s} className={`ih-sort-item ${sort === s ? "ih-sort-item--active" : ""}`}
                        onClick={() => { setSort(s); setShowSortMenu(false); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mc-view-toggle">
                <button className={`mc-view-btn ${viewMode === "grid" ? "mc-view-btn--active" : ""}`}
                  onClick={() => setViewMode("grid")}><Grid size={14} /></button>
                <button className={`mc-view-btn ${viewMode === "list" ? "mc-view-btn--active" : ""}`}
                  onClick={() => setViewMode("list")}><List size={14} /></button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="ih-results-count">
            {filtered.length} innovation{filtered.length !== 1 ? "s" : ""} found
          </div>

          {/* Grid or List */}
          {viewMode === "grid" ? (
            <div className="ih-grid">
              {filtered.map(item => (
                <InnovationCard key={item.id} item={item} onClick={() => setSelected(item)} />
              ))}
            </div>
          ) : (
            <div className="ih-list">
              {filtered.map(item => (
                <InnovationRow key={item.id} item={item} onClick={() => setSelected(item)} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="ih-empty">
              <Lightbulb size={40} color="var(--text-dim)" />
              <p>No innovations match your filters.</p>
              <button className="ih-btn-primary" onClick={() => setShowSubmit(true)}>
                <Plus size={14} /> Submit Your First Innovation
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} />}
      {selected && <DetailDrawer item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}