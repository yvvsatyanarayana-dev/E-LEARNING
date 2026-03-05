// studentinnovationhub.jsx
// Innovation Hub module — imported into StudentDashboard.jsx
// Matches SmartCampus design system: Plus Jakarta Sans + Fraunces, CSS vars, same panel/card patterns

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Lightbulb, Rocket, Users, Trophy,
  Flame, Plus, Search, Filter, ExternalLink, Heart, MessageCircle,
  Bookmark, Share2, Clock, Tag, Star, CheckCircle, Circle,
  Zap, Globe, Code, FlaskConical, Cpu, Palette, TrendingUp,
  ArrowUpRight, Send, X, UploadCloud, Award
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────

const TABS = [
  { id: "feed",       label: "Idea Feed",      Icon: Lightbulb  },
  { id: "projects",   label: "My Projects",    Icon: Rocket     },
  { id: "hackathons", label: "Hackathons",      Icon: Trophy     },
  { id: "collaborate",label: "Collaborate",    Icon: Users      },
];

const CATEGORIES = ["All", "AI/ML", "Web Dev", "IoT", "Sustainability", "HealthTech", "EdTech", "FinTech"];

const DOMAIN_ICONS = {
  "AI/ML":           <Cpu size={13}/>,
  "Web Dev":         <Code size={13}/>,
  "IoT":             <Globe size={13}/>,
  "Sustainability":  <FlaskConical size={13}/>,
  "HealthTech":      <Zap size={13}/>,
  "EdTech":          <Star size={13}/>,
  "FinTech":         <TrendingUp size={13}/>,
};

const DOMAIN_COLORS = {
  "AI/ML":           "var(--teal)",
  "Web Dev":         "var(--indigo-ll)",
  "IoT":             "var(--violet)",
  "Sustainability":  "var(--teal)",
  "HealthTech":      "var(--rose)",
  "EdTech":          "var(--amber)",
  "FinTech":         "var(--indigo-ll)",
};

const IDEAS = [
  {
    id: 1,
    title: "AI-Powered Crop Disease Detector",
    author: "Priya Menon",
    avatar: "PM",
    domain: "AI/ML",
    tags: ["Deep Learning", "Agriculture", "Mobile"],
    desc: "A mobile app that uses CNN models to detect crop diseases from leaf photos, providing farmers with instant diagnosis and treatment recommendations in regional languages.",
    likes: 84,
    comments: 21,
    bookmarks: 15,
    timeAgo: "2h ago",
    stage: "Prototype",
    stageColor: "var(--teal)",
    looking: ["ML Engineer", "Mobile Dev"],
    liked: false,
    bookmarked: false,
    featured: true,
  },
  {
    id: 2,
    title: "Campus Resource Sharing Platform",
    author: "Ravi Shankar",
    avatar: "RS",
    domain: "Web Dev",
    tags: ["React", "FastAPI", "Community"],
    desc: "A peer-to-peer platform where students can lend/borrow textbooks, lab equipment, and study materials, reducing waste and saving costs across campus.",
    likes: 62,
    comments: 14,
    bookmarks: 9,
    timeAgo: "5h ago",
    stage: "Idea",
    stageColor: "var(--amber)",
    looking: ["Backend Dev", "UI Designer"],
    liked: true,
    bookmarked: false,
    featured: false,
  },
  {
    id: 3,
    title: "Smart Campus Energy Monitor",
    author: "Ananya Iyer",
    avatar: "AI",
    domain: "IoT",
    tags: ["Raspberry Pi", "Energy", "Dashboard"],
    desc: "IoT sensors deployed across campus to monitor real-time energy consumption, with an analytics dashboard that helps administration cut power bills by 30%.",
    likes: 97,
    comments: 33,
    bookmarks: 28,
    timeAgo: "1d ago",
    stage: "MVP",
    stageColor: "var(--indigo-ll)",
    looking: ["Hardware Engineer"],
    liked: false,
    bookmarked: true,
    featured: true,
  },
  {
    id: 4,
    title: "Mental Wellness Chatbot for Students",
    author: "Karan Bose",
    avatar: "KB",
    domain: "HealthTech",
    tags: ["NLP", "Counseling", "Anonymity"],
    desc: "An anonymous AI chatbot offering 24/7 emotional support, mood tracking, and escalation to college counselors, reducing stigma around mental health support.",
    likes: 113,
    comments: 47,
    bookmarks: 41,
    timeAgo: "2d ago",
    stage: "Prototype",
    stageColor: "var(--teal)",
    looking: ["Psychologist Advisor", "Backend Dev"],
    liked: false,
    bookmarked: false,
    featured: false,
  },
  {
    id: 5,
    title: "Blockchain-Based Academic Credentials",
    author: "Sneha Rao",
    avatar: "SR",
    domain: "FinTech",
    tags: ["Blockchain", "Verifiability", "Web3"],
    desc: "Tamper-proof digital transcripts and certificates stored on a permissioned blockchain, enabling instant verification by employers without contacting the college.",
    likes: 76,
    comments: 19,
    bookmarks: 22,
    timeAgo: "3d ago",
    stage: "Research",
    stageColor: "var(--violet)",
    looking: ["Smart Contract Dev", "UX Designer"],
    liked: false,
    bookmarked: false,
    featured: false,
  },
];

const MY_PROJECTS = [
  {
    id: "p1",
    title: "SmartAttend — Face Recognition Attendance",
    domain: "AI/ML",
    stage: "MVP",
    stageColor: "var(--indigo-ll)",
    progress: 68,
    color: "var(--indigo-l)",
    colorRgb: "91,78,248",
    team: ["AR", "PM", "KR"],
    nextMilestone: "Deploy on college server",
    dueIn: "5 days",
    stars: 42,
    desc: "Automated attendance using real-time face recognition, replacing manual roll calls and reducing proxy attendance.",
    tasks: [
      { label: "Train face recognition model",     done: true  },
      { label: "Build Flask API endpoints",        done: true  },
      { label: "Integrate React frontend",         done: true  },
      { label: "Test with live webcam feed",       done: false },
      { label: "Deploy & college integration",     done: false },
    ],
    updates: [
      { text: "Achieved 96.4% accuracy on test set", when: "Yesterday" },
      { text: "PR merged: attendance export as CSV",  when: "3 days ago" },
    ],
  },
  {
    id: "p2",
    title: "StudySync — Collaborative Notes Platform",
    domain: "EdTech",
    stage: "Idea",
    stageColor: "var(--amber)",
    progress: 22,
    color: "var(--amber)",
    colorRgb: "244,165,53",
    team: ["AR", "SN"],
    nextMilestone: "Complete wireframes",
    dueIn: "2 days",
    stars: 18,
    desc: "Real-time collaborative note-taking with AI-generated summaries and spaced repetition flashcards.",
    tasks: [
      { label: "Finalize feature scope",           done: true  },
      { label: "Create Figma wireframes",          done: false },
      { label: "Set up monorepo",                  done: false },
      { label: "Build core editor",                done: false },
    ],
    updates: [
      { text: "Feature scope doc approved by mentor", when: "Today" },
    ],
  },
];

const HACKATHONS = [
  {
    id: "h1",
    name: "Smart India Hackathon 2025",
    org: "Government of India",
    prize: "₹1,00,000",
    deadline: "Aug 15, 2025",
    daysLeft: 42,
    mode: "Online + Offline",
    domain: "All Domains",
    registered: true,
    teamSize: "2–6",
    color: "var(--teal)",
    colorRgb: "39,201,176",
    desc: "India's biggest hackathon. Build solutions for real government problem statements across 9 domains.",
    status: "Registered",
    statusColor: "var(--teal)",
  },
  {
    id: "h2",
    name: "HackVision — AI for Good",
    org: "IIT Madras",
    prize: "₹50,000",
    deadline: "Jul 28, 2025",
    daysLeft: 24,
    mode: "Hybrid",
    domain: "AI/ML",
    registered: false,
    teamSize: "3–4",
    color: "var(--indigo-l)",
    colorRgb: "91,78,248",
    desc: "Build AI-powered solutions that tackle social problems. Mentors from Google and Microsoft.",
    status: "Open",
    statusColor: "var(--indigo-ll)",
  },
  {
    id: "h3",
    name: "GreenHack — Sustainability Sprint",
    org: "TechFest BITS Pilani",
    prize: "₹30,000",
    deadline: "Sep 1, 2025",
    daysLeft: 59,
    mode: "Online",
    domain: "Sustainability",
    registered: false,
    teamSize: "2–5",
    color: "var(--amber)",
    colorRgb: "244,165,53",
    desc: "72-hour sprint to build solutions for climate change, waste management, and renewable energy.",
    status: "Open",
    statusColor: "var(--amber)",
  },
  {
    id: "h4",
    name: "HealthHack 2025",
    org: "AIIMS Delhi × Microsoft",
    prize: "₹75,000",
    deadline: "Aug 5, 2025",
    daysLeft: 31,
    mode: "In-Person",
    domain: "HealthTech",
    registered: false,
    teamSize: "3–5",
    color: "var(--rose)",
    colorRgb: "242,68,92",
    desc: "Create the next breakthrough in digital health. Prizes for best mobile app, AI model, and hardware hack.",
    status: "Open",
    statusColor: "var(--rose)",
  },
];

const COLLABORATORS = [
  { name: "Priya Menon",   roll: "21CS031", skills: ["Python", "ML", "TensorFlow"], available: true,  avatar: "PM", match: 94, color: "var(--teal)"    },
  { name: "Karan Bose",    roll: "21CS018", skills: ["React", "Node.js", "UI/UX"],  available: true,  avatar: "KB", match: 88, color: "var(--indigo-l)"},
  { name: "Sneha Rao",     roll: "21CS052", skills: ["Java", "Spring", "Docker"],   available: false, avatar: "SR", match: 81, color: "var(--violet)"  },
  { name: "Rohan Das",     roll: "21CS061", skills: ["Embedded", "Arduino", "C++"], available: true,  avatar: "RD", match: 76, color: "var(--amber)"   },
  { name: "Divya Nair",    roll: "21CS009", skills: ["Data Analysis", "SQL", "R"],  available: false, avatar: "DN", match: 72, color: "var(--rose)"    },
  { name: "Arjun Pillai",  roll: "21CS044", skills: ["Blockchain", "Solidity"],     available: true,  avatar: "AP", match: 69, color: "var(--teal)"    },
];

const TRENDING_TAGS = ["#MachineLearning", "#OpenSource", "#ClimateAction", "#Web3", "#HealthTech", "#MobileFirst"];

// ─── HELPERS ─────────────────────────────────────────────────────

function AnimBar({ pct, color, height = 4, delay = 400 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${w}%`, background: color, borderRadius: 3,
        transition: "width 1.1s cubic-bezier(.16,1,.3,1)"
      }} />
    </div>
  );
}

function RadialProgress({ pct, color, size = 52, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── IDEA CARD ────────────────────────────────────────────────────
function IdeaCard({ idea, onLike, onBookmark }) {
  const domainColor = DOMAIN_COLORS[idea.domain] || "var(--text3)";
  return (
    <div className="ih-idea-card">
      {idea.featured && (
        <div className="ih-featured-badge">
          <Flame size={9} /> Featured
        </div>
      )}
      <div className="ih-card-top">
        <div className="ih-avatar">{idea.avatar}</div>
        <div className="ih-card-meta">
          <span className="ih-author">{idea.author}</span>
          <span className="ih-time">{idea.timeAgo}</span>
        </div>
        <div className="ih-domain-badge" style={{ color: domainColor, borderColor: `${domainColor}33`, background: `${domainColor}11` }}>
          {DOMAIN_ICONS[idea.domain]} {idea.domain}
        </div>
      </div>

      <h3 className="ih-idea-title">{idea.title}</h3>
      <p className="ih-idea-desc">{idea.desc}</p>

      <div className="ih-tags">
        {idea.tags.map(t => (
          <span key={t} className="ih-tag">#{t}</span>
        ))}
      </div>

      <div className="ih-stage-row">
        <span className="ih-stage" style={{ color: idea.stageColor, borderColor: `${idea.stageColor}33`, background: `${idea.stageColor}11` }}>
          <Circle size={6} style={{ fill: idea.stageColor, stroke: idea.stageColor }} /> {idea.stage}
        </span>
        {idea.looking.length > 0 && (
          <span className="ih-looking">
            <Users size={10} /> Looking for: {idea.looking.join(", ")}
          </span>
        )}
      </div>

      <div className="ih-card-actions">
        <button className={`ih-action-btn ${idea.liked ? "active-rose" : ""}`} onClick={() => onLike(idea.id)}>
          <Heart size={13} style={idea.liked ? { fill: "var(--rose)", stroke: "var(--rose)" } : {}} />
          {idea.likes}
        </button>
        <button className="ih-action-btn">
          <MessageCircle size={13} /> {idea.comments}
        </button>
        <button className={`ih-action-btn ${idea.bookmarked ? "active-indigo" : ""}`} onClick={() => onBookmark(idea.id)}>
          <Bookmark size={13} style={idea.bookmarked ? { fill: "var(--indigo-ll)", stroke: "var(--indigo-ll)" } : {}} />
          {idea.bookmarks}
        </button>
        <button className="ih-action-btn ih-action-share">
          <Share2 size={13} />
        </button>
        <button className="ih-join-btn">
          Collaborate <ArrowUpRight size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── SUBMIT IDEA MODAL ────────────────────────────────────────────
function SubmitIdeaModal({ onClose }) {
  const [form, setForm] = useState({ title: "", domain: "AI/ML", desc: "", tags: "", looking: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="ih-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ih-modal">
        <div className="ih-modal-hd">
          <div>
            <div className="ih-modal-title">Submit Your Idea 💡</div>
            <div className="ih-modal-sub">Share it with the campus innovation community</div>
          </div>
          <button className="ih-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="ih-modal-body">
          <div className="ih-field">
            <label>Idea Title *</label>
            <input className="ih-input" placeholder="Give your idea a catchy name…"
              value={form.title} onChange={e => set("title", e.target.value)} />
          </div>
          <div className="ih-field-row">
            <div className="ih-field">
              <label>Domain *</label>
              <select className="ih-input ih-select" value={form.domain} onChange={e => set("domain", e.target.value)}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="ih-field">
              <label>Looking For</label>
              <input className="ih-input" placeholder="e.g. ML Engineer, UI Designer"
                value={form.looking} onChange={e => set("looking", e.target.value)} />
            </div>
          </div>
          <div className="ih-field">
            <label>Description *</label>
            <textarea className="ih-input ih-textarea" rows={4}
              placeholder="Describe your idea, the problem it solves, and your approach…"
              value={form.desc} onChange={e => set("desc", e.target.value)} />
          </div>
          <div className="ih-field">
            <label>Tags</label>
            <input className="ih-input" placeholder="e.g. Python, OpenCV, Healthcare (comma separated)"
              value={form.tags} onChange={e => set("tags", e.target.value)} />
          </div>
        </div>

        <div className="ih-modal-footer">
          <button className="ih-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="ih-modal-submit">
            <UploadCloud size={13} /> Submit Idea
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── IDEA FEED TAB ────────────────────────────────────────────────
function TabFeed() {
  const [ideas, setIdeas] = useState(IDEAS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = ideas.filter(i =>
    (category === "All" || i.domain === category) &&
    (i.title.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleLike     = id => setIdeas(prev => prev.map(i => i.id === id ? { ...i, liked: !i.liked, likes: i.likes + (i.liked ? -1 : 1) } : i));
  const toggleBookmark = id => setIdeas(prev => prev.map(i => i.id === id ? { ...i, bookmarked: !i.bookmarked, bookmarks: i.bookmarks + (i.bookmarked ? -1 : 1) } : i));

  return (
    <div className="ih-tab-content">
      {showModal && <SubmitIdeaModal onClose={() => setShowModal(false)} />}

      {/* Hero banner */}
      <div className="ih-feed-hero">
        <div className="ih-hero-left">
          <div className="greet-tag" style={{ marginBottom: 8 }}>
            <div className="greet-pip" />
            <span className="greet-pip-txt">Campus Innovation Community</span>
          </div>
          <h2 className="ih-hero-title">Turn Ideas into <em>Impact</em></h2>
          <p className="ih-hero-sub">Browse, collaborate on, and submit ideas that solve real campus and societal problems.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button className="ih-btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={13} /> Submit Idea
            </button>
            <button className="ih-btn-ghost">
              <Rocket size={13} /> Browse Projects
            </button>
          </div>
        </div>
        <div className="ih-hero-stats">
          {[
            { val: "124", lbl: "Ideas Shared",   color: "var(--teal)"     },
            { val: "38",  lbl: "Active Projects", color: "var(--indigo-ll)"},
            { val: "6",   lbl: "Hackathons",      color: "var(--amber)"   },
            { val: "312", lbl: "Collaborators",   color: "var(--violet)"  },
          ].map(({ val, lbl, color }) => (
            <div key={lbl} className="ih-hero-stat">
              <div className="ih-hs-val" style={{ color }}>{val}</div>
              <div className="ih-hs-lbl">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending tags */}
      <div className="ih-trending">
        <span className="ih-trending-lbl"><Flame size={11} /> Trending:</span>
        {TRENDING_TAGS.map(t => (
          <span key={t} className="ih-trend-tag">{t}</span>
        ))}
      </div>

      {/* Filters */}
      <div className="ih-filters">
        <div className="ih-search-wrap">
          <Search size={12} style={{ color: "var(--text3)", flexShrink: 0 }} />
          <input className="ih-search" placeholder="Search ideas…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="ih-search-clear" onClick={() => setSearch("")}><X size={10} /></button>}
        </div>
        <div className="ih-cat-pills">
          {CATEGORIES.map(c => (
            <button key={c}
              className={`ih-cat-pill ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="ih-feed-grid">
        {filtered.length === 0 ? (
          <div className="ih-empty">
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <div>No ideas match your search.</div>
          </div>
        ) : (
          filtered.map(idea => (
            <IdeaCard key={idea.id} idea={idea} onLike={toggleLike} onBookmark={toggleBookmark} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── MY PROJECTS TAB ─────────────────────────────────────────────
function TabProjects() {
  const [expanded, setExpanded] = useState("p1");
  return (
    <div className="ih-tab-content">
      <div className="ih-projects-header">
        <div>
          <h2 className="greet-title" style={{ fontSize: 20 }}>My <em>Projects</em></h2>
          <p className="greet-sub">Track progress, manage tasks, and collaborate with your team.</p>
        </div>
        <button className="ih-btn-primary"><Plus size={13} /> New Project</button>
      </div>

      {/* KPI strip */}
      <div className="ih-proj-kpis">
        {[
          { val: "2",    lbl: "Active Projects",  color: "var(--indigo-ll)", cls: "sc-indigo" },
          { val: "68%",  lbl: "Avg Completion",   color: "var(--teal)",      cls: "sc-teal"   },
          { val: "3",    lbl: "Open Milestones",  color: "var(--amber)",     cls: "sc-amber"  },
          { val: "60",   lbl: "Stars Received",   color: "var(--violet)",    cls: "sc-violet" },
        ].map(({ val, lbl, color, cls }) => (
          <div key={lbl} className={`san-kpi-card ${cls}`}>
            <div className="san-kpi-val" style={{ color }}>{val}</div>
            <div className="san-kpi-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Project cards */}
      {MY_PROJECTS.map((proj, pi) => (
        <div key={proj.id} className="ih-proj-card panel" style={{ marginBottom: 14 }}>
          <div className="ih-proj-card-header" onClick={() => setExpanded(expanded === proj.id ? null : proj.id)}>
            <div className="ih-pcl">
              <div className="ih-proj-icon" style={{ background: `rgba(${proj.colorRgb},.12)`, borderColor: `rgba(${proj.colorRgb},.22)`, color: proj.color }}>
                <Rocket size={16} />
              </div>
              <div>
                <div className="ih-proj-title">{proj.title}</div>
                <div className="ih-proj-meta">
                  <span style={{ color: proj.stageColor }}>{proj.stage}</span>
                  <span className="mc-row-dot" />
                  <span>{proj.domain}</span>
                  <span className="mc-row-dot" />
                  <span>Due milestone in <em style={{ color: proj.color }}>{proj.dueIn}</em></span>
                </div>
              </div>
            </div>
            <div className="ih-pcr">
              <div className="ih-proj-team">
                {proj.team.map((m, i) => (
                  <div key={i} className="ih-team-avatar" style={{ background: `rgba(${proj.colorRgb},.15)`, borderColor: `rgba(${proj.colorRgb},.3)`, color: proj.color, zIndex: proj.team.length - i }}>
                    {m}
                  </div>
                ))}
              </div>
              <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
                <RadialProgress pct={proj.progress} color={proj.color} size={52} stroke={5} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 700, color: proj.color }}>{proj.progress}%</div>
              </div>
              <div style={{ color: "var(--text3)", transition: "transform .2s", transform: expanded === proj.id ? "rotate(180deg)" : "none" }}>
                <ChevronRight size={14} style={{ transform: "rotate(90deg)" }} />
              </div>
            </div>
          </div>

          {expanded === proj.id && (
            <div className="ih-proj-expanded">
              <div className="ih-proj-expand-grid">
                {/* Tasks */}
                <div className="panel ih-inner-panel">
                  <div className="panel-hd" style={{ padding: "12px 16px" }}>
                    <div className="panel-ttl"><CheckCircle size={13} style={{ color: "var(--indigo-ll)" }} /> Tasks</div>
                    <span style={{ fontSize: 10, color: "var(--text3)" }}>{proj.tasks.filter(t => t.done).length}/{proj.tasks.length} done</span>
                  </div>
                  <div style={{ padding: "8px 16px 14px" }}>
                    {proj.tasks.map((task, i) => (
                      <div key={i} className="ih-task-item">
                        {task.done
                          ? <CheckCircle size={14} style={{ color: "var(--teal)", flexShrink: 0 }} />
                          : <Circle size={14} style={{ color: "var(--text3)", flexShrink: 0 }} />
                        }
                        <span style={{ fontSize: 12, color: task.done ? "var(--text3)" : "var(--text2)", textDecoration: task.done ? "line-through" : "none" }}>
                          {task.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description + Activity */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="panel ih-inner-panel">
                    <div className="panel-hd" style={{ padding: "12px 16px" }}>
                      <div className="panel-ttl"><Lightbulb size={13} style={{ color: "var(--indigo-ll)" }} /> About</div>
                    </div>
                    <div style={{ padding: "0 16px 14px", fontSize: 12, color: "var(--text2)", lineHeight: 1.65 }}>{proj.desc}</div>
                  </div>
                  <div className="panel ih-inner-panel">
                    <div className="panel-hd" style={{ padding: "12px 16px" }}>
                      <div className="panel-ttl"><Clock size={13} style={{ color: "var(--indigo-ll)" }} /> Recent Activity</div>
                    </div>
                    <div style={{ padding: "0 16px 14px" }}>
                      {proj.updates.map((u, i) => (
                        <div key={i} className="ih-update-item">
                          <div className="ih-upd-dot" style={{ background: proj.color }} />
                          <div>
                            <div style={{ fontSize: 12, color: "var(--text2)" }}>{u.text}</div>
                            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{u.when}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ih-proj-footer">
                <div style={{ fontSize: 11, color: "var(--text3)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Star size={11} style={{ color: "var(--amber)" }} /> {proj.stars} stars from the community
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="ih-btn-ghost" style={{ padding: "7px 14px", fontSize: 11.5 }}><ExternalLink size={11} /> View Full</button>
                  <button className="ih-btn-primary" style={{ padding: "7px 14px", fontSize: 11.5 }}><Users size={11} /> Manage Team</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── HACKATHONS TAB ───────────────────────────────────────────────
function TabHackathons() {
  const [hacks, setHacks] = useState(HACKATHONS);
  const [filterDomain, setFilterDomain] = useState("All");
  const register = id => setHacks(prev => prev.map(h =>
    h.id === id ? { ...h, registered: true, status: "Registered", statusColor: "var(--teal)" } : h
  ));
  const domains = ["All", ...Array.from(new Set(HACKATHONS.map(h => h.domain)))];
  const filtered = hacks.filter(h => filterDomain === "All" || h.domain === filterDomain);

  return (
    <div className="ih-tab-content">

      {/* ── Section bar ── */}
      <div className="ih-section-bar">
        <div>
          <h2 className="ih-section-title">Hackathons &amp; <em>Competitions</em></h2>
          <p className="ih-section-sub">Find your next challenge. Build. Win. Repeat.</p>
        </div>
        <div className="ih-cat-pills">
          {domains.map(d => (
            <button key={d} className={`ih-cat-pill ${filterDomain === d ? "active" : ""}`}
              onClick={() => setFilterDomain(d)}>{d}</button>
          ))}
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="ih-hack-kpi-strip">
        {[
          { val: "1",     lbl: "Registered",    color: "var(--teal)",      icon: <CheckCircle size={14}/> },
          { val: "3",     lbl: "Open to Join",  color: "var(--indigo-ll)", icon: <Trophy size={14}/> },
          { val: "\u20b92.5L", lbl: "Total Prizes",  color: "var(--amber)",     icon: <Award size={14}/> },
          { val: "24",    lbl: "Days Min Left", color: "var(--rose)",      icon: <Clock size={14}/> },
        ].map(({ val, lbl, color, icon }) => (
          <div key={lbl} className="ih-hack-kpi">
            <div className="ih-hack-kpi-icon" style={{ color, background: `${color}14`, borderColor: `${color}28` }}>{icon}</div>
            <div>
              <div className="ih-hs-val" style={{ color, fontSize: 20 }}>{val}</div>
              <div className="ih-hs-lbl">{lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cards grid ── */}
      <div className="ih-hack-grid">
        {filtered.map(h => (
          <div key={h.id} className="ih-hack-card" style={{ "--hack-rgb": h.colorRgb }}>
            <div className="ih-hack-glow" />

            <div className="ih-hack-top">
              <div className="ih-hack-domain"
                style={{ color: h.color, borderColor: `rgba(${h.colorRgb},.25)`, background: `rgba(${h.colorRgb},.09)` }}>
                {h.domain}
              </div>
              <div className="ih-hack-status"
                style={{ color: h.statusColor, borderColor: `${h.statusColor}33`, background: `${h.statusColor}11` }}>
                {h.registered && <CheckCircle size={9} />} {h.status}
              </div>
            </div>

            <div>
              <h3 className="ih-hack-title">{h.name}</h3>
              <div className="ih-hack-org">{h.org}</div>
            </div>

            <p className="ih-hack-desc">{h.desc}</p>

            <div className="ih-hack-details">
              <div className="ih-hd-item">
                <Trophy size={11} style={{ color: "var(--amber)", flexShrink: 0 }} />
                <span style={{ color: "var(--amber)", fontWeight: 600 }}>{h.prize}</span>
              </div>
              <div className="ih-hd-item"><Clock size={11} style={{ color: "var(--text3)", flexShrink: 0 }} /> {h.deadline}</div>
              <div className="ih-hd-item"><Users size={11} style={{ color: "var(--text3)", flexShrink: 0 }} /> Team {h.teamSize}</div>
              <div className="ih-hd-item"><Globe size={11} style={{ color: "var(--text3)", flexShrink: 0 }} /> {h.mode}</div>
            </div>

            <div className="ih-hack-urgency">
              <div className="ih-urgency-bar-wrap">
                <AnimBar pct={Math.max(8, 100 - h.daysLeft)} color={h.daysLeft < 30 ? "var(--rose)" : h.color} height={3} delay={400} />
              </div>
              <span className="ih-urgency-lbl" style={{ color: h.daysLeft < 30 ? "var(--rose)" : "var(--text3)" }}>
                {h.daysLeft}d left
              </span>
            </div>

            <div className="ih-hack-footer">
              {h.registered ? (
                <button className="ih-registered-btn"><CheckCircle size={12} /> Registered</button>
              ) : (
                <button className="ih-register-btn" style={{ background: h.color }} onClick={() => register(h.id)}>
                  Register Now <ArrowUpRight size={11} />
                </button>
              )}
              <button className="ih-btn-ghost" style={{ padding: "7px 12px", fontSize: 11 }}><ExternalLink size={11} /> Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COLLABORATE TAB ──────────────────────────────────────────────
function TabCollaborate() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = COLLABORATORS.filter(c =>
    (filter === "All" || (filter === "Available" ? c.available : !c.available)) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ih-tab-content">
      <div className="ih-projects-header">
        <div>
          <h2 className="greet-title" style={{ fontSize: 20 }}>Find <em>Collaborators</em></h2>
          <p className="greet-sub">Connect with peers whose skills complement yours. Build together.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ih-btn-primary"><Send size={12} /> Post a Need</button>
        </div>
      </div>

      {/* My profile card */}
      <div className="ih-my-profile panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd">
          <div className="panel-ttl"><Award size={13} style={{ color: "var(--indigo-ll)" }} /> Your Collaboration Profile</div>
          <button className="panel-act">Edit <ChevronRight size={11} /></button>
        </div>
        <div style={{ padding: "14px 20px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div className="ih-avatar" style={{ width: 48, height: 48, fontSize: 16 }}>AR</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Arjun Reddy</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>CSE · Sem 5 · Roll 21CS047</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {["Python", "React", "DSA", "FastAPI"].map(s => (
                <span key={s} className="ih-tag" style={{ background: "rgba(91,78,248,.1)", color: "var(--indigo-ll)", borderColor: "rgba(91,78,248,.2)" }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <div style={{ fontSize: 10, color: "var(--text3)" }}>Actively looking for teammates</div>
            <div style={{ display: "flex", gap: 4 }}>
              {["Open to Ideas", "Available"].map(t => (
                <span key={t} className="ih-stage" style={{ color: "var(--teal)", borderColor: "rgba(39,201,176,.25)", background: "rgba(39,201,176,.08)" }}>
                  <Circle size={5} style={{ fill: "var(--teal)", stroke: "var(--teal)" }} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="ih-filters" style={{ marginBottom: 16 }}>
        <div className="ih-search-wrap">
          <Search size={12} style={{ color: "var(--text3)" }} />
          <input className="ih-search" placeholder="Search by name or skill…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="ih-search-clear" onClick={() => setSearch("")}><X size={10} /></button>}
        </div>
        <div className="ih-cat-pills">
          {["All", "Available", "Busy"].map(f => (
            <button key={f} className={`ih-cat-pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {/* Collaborator cards */}
      <div className="ih-collab-grid">
        {filtered.map((c, i) => (
          <div key={i} className="ih-collab-card">
            <div className="ih-collab-top">
              <div className="ih-avatar" style={{ background: `${c.color}22`, borderColor: `${c.color}44`, color: c.color }}>
                {c.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{c.roll}</div>
              </div>
              <div className="ih-match-badge" style={{ color: c.color, borderColor: `${c.color}33`, background: `${c.color}11` }}>
                {c.match}% match
              </div>
            </div>

            <div className="ih-collab-skills">
              {c.skills.map(s => (
                <span key={s} className="ih-tag">{s}</span>
              ))}
            </div>

            <div className="ih-collab-footer">
              <span className={`ih-avail ${c.available ? "avail" : "busy"}`}>
                <Circle size={5} style={{ fill: c.available ? "var(--teal)" : "var(--rose)", stroke: c.available ? "var(--teal)" : "var(--rose)" }} />
                {c.available ? "Available" : "Busy"}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="ih-btn-ghost" style={{ padding: "6px 10px", fontSize: 11 }}><MessageCircle size={10} /> Message</button>
                <button className="ih-btn-primary" style={{ padding: "6px 10px", fontSize: 11 }}><Plus size={10} /> Invite</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────
export default function StudentInnovationHub({ onBack }) {
  const [tab, setTab] = useState("feed");

  return (
    <div className="ih-root">
      {/* ── Page Header ── */}
      <div className="ih-page-header">
        <div className="ih-page-header-inner">
          {/* Breadcrumb row */}
          <div className="ih-breadcrumb-row">
            <button className="ih-back-btn" onClick={onBack}>
              <ChevronLeft size={13} /> Dashboard
            </button>
            <div className="ih-breadcrumb">
              <span>Dashboard</span>
              <ChevronRight size={10} style={{ color: "var(--text3)", flexShrink: 0 }} />
              <span className="ih-bc-active">Innovation Hub</span>
            </div>
          </div>

          {/* Title row */}
          <div className="ih-page-title-row">
            <div className="ih-page-title-left">
              <div className="greet-tag" style={{ marginBottom: 6 }}>
                <div className="greet-pip" />
                <span className="greet-pip-txt">Campus Innovation · Semester 5</span>
              </div>
              <h1 className="greet-title">
                Innovation <em>Hub</em>
              </h1>
              <p className="greet-sub">
                Ideate, build, collaborate, and compete. Your launchpad for campus innovation.
              </p>
            </div>
            <div className="ih-page-title-right">
              <div className="ih-header-stat">
                <div className="ih-hs-val" style={{ color: "var(--teal)" }}>124</div>
                <div className="ih-hs-lbl">Ideas</div>
              </div>
              <div className="ih-header-stat-sep" />
              <div className="ih-header-stat">
                <div className="ih-hs-val" style={{ color: "var(--indigo-ll)" }}>38</div>
                <div className="ih-hs-lbl">Projects</div>
              </div>
              <div className="ih-header-stat-sep" />
              <div className="ih-header-stat">
                <div className="ih-hs-val" style={{ color: "var(--amber)" }}>6</div>
                <div className="ih-hs-lbl">Hackathons</div>
              </div>
              <div className="ih-header-stat-sep" />
              <div className="ih-header-stat">
                <div className="ih-hs-val" style={{ color: "var(--violet)" }}>312</div>
                <div className="ih-hs-lbl">Members</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="ih-tabs-bar">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`ih-tab-btn ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {tab === "feed"        && <TabFeed />}
      {tab === "projects"    && <TabProjects />}
      {tab === "hackathons"  && <TabHackathons />}
      {tab === "collaborate" && <TabCollaborate />}
    </div>
  );
}