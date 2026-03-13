import React, { useState } from 'react';
import Sidebar from '../adminDashbaord/adminDashboard'; // Sidebar is exported from AdminDashboard
import './AdminCourseManagement.css';

// ─── ICONS ────────────────────────────────────────────────────────
const IcoPlus   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoChevL  = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoStar   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoSearch = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoFilter = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoEye    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEdit   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

// ─── DATA ─────────────────────────────────────────────────────────
const COURSES = [
  { id:"CS501", name:"Introduction to Computer Science", dept:"CS", faculty:"Dr. Meera Pillai", enrolled:142, capacity:150, rating:4.8, completion:92, status:"active", credits:4, lectures:32, assignments:8 },
  { id:"CS502", name:"Advanced Data Structures", dept:"CS", faculty:"Dr. Vikram Singh", enrolled:88, capacity:100, rating:4.6, completion:85, status:"active", credits:4, lectures:28, assignments:6 },
  { id:"ECE201", name:"Digital Logic Design", dept:"ECE", faculty:"Suresh Nair", enrolled:110, capacity:120, rating:4.2, completion:78, status:"active", credits:3, lectures:24, assignments:5 },
  { id:"ME104", name:"Thermodynamics", dept:"ME", faculty:"Rohan Sharma", enrolled:45, capacity:60, rating:4.5, completion:62, status:"draft", credits:3, lectures:18, assignments:4 },
  { id:"CS603", name:"Artificial Intelligence", dept:"CS", faculty:"Dr. Prakash J", enrolled:65, capacity:80, rating:4.9, completion:88, status:"active", credits:4, lectures:30, assignments:7 },
  { id:"IT402", name:"Network Security", dept:"IT", faculty:"Lakshmi Reddy", enrolled:0, capacity:50, rating:0, completion:0, status:"archived", credits:3, lectures:20, assignments:5 },
];

const DEPT_OPTS = ["All", "CS", "ECE", "ME", "IT", "DS"];
const STATUS_OPTS = ["All", "active", "draft", "archived"];

function AnimBar({ pct, color, delay = 0 }) {
  const [w, setW] = useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height: 4, background: "var(--surface3)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${w}%`, height: "100%", background: color, transition: "width 1s ease-out" }} />
    </div>
  );
}

export default function AdminCourseManagement({ onBack }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDept] = useState("All");
  const [statFilter, setStat] = useState("All");
  const [selected, setSelected] = useState(null);
  const adminName = "Admin User";

  const filtered = COURSES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "All" || c.dept === deptFilter;
    const matchesStat = statFilter === "All" || c.status === statFilter;
    return matchesSearch && matchesDept && matchesStat;
  });

  const totalEnrolled = COURSES.reduce((acc, curr) => acc + curr.enrolled, 0);
  const avgRating = (COURSES.reduce((acc, curr) => acc + curr.rating, 0) / COURSES.length).toFixed(1);
  const avgCompletion = Math.round(COURSES.reduce((acc, curr) => acc + curr.completion, 0) / COURSES.length);

  return (
    <div className="cm-page">
      <div className="cm-header">
        <div className="cm-header-left">
          <button className="cm-back" onClick={onBack}><IcoChevL /> Dashboard</button>
          <div>
            <div className="cm-breadcrumb">Admin / Course Management</div>
            <h1 className="cm-title">Course Management</h1>
          </div>
        </div>
        <button className="cm-btn-primary"><IcoPlus /> New Course</button>
      </div>

      {/* KPI STRIP */}
      <div className="cm-kpi-row">
        {[
          { label: "Total Courses", val: COURSES.length, c: "var(--indigo-ll)", bg: "rgba(91,78,248,.1)" },
          { label: "Active Courses", val: COURSES.filter(c => c.status === "active").length, c: "var(--teal)", bg: "rgba(39,201,176,.1)" },
          { label: "Draft Courses", val: COURSES.filter(c => c.status === "draft").length, c: "var(--amber)", bg: "rgba(244,165,53,.1)" },
          { label: "Total Enrolled", val: totalEnrolled.toLocaleString(), c: "var(--violet)", bg: "rgba(159,122,234,.1)" },
          { label: "Avg Rating", val: avgRating + "★", c: "var(--amber)", bg: "rgba(244,165,53,.1)" },
          { label: "Avg Completion", val: avgCompletion + "%", c: "var(--teal)", bg: "rgba(39,201,176,.1)" },
        ].map(({ label, val, c, bg }) => (
          <div key={label} className="cm-kpi">
            <div className="cm-kpi-val" style={{ color: c }}>{val}</div>
            <div className="cm-kpi-lbl">{label}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="cm-toolbar">
        <div className="cm-search">
          <IcoSearch style={{ color: "var(--text3)", flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses by name or code…" />
        </div>
        <div className="cm-filters" style={{display:'flex', gap:'8px'}}>
          <div className="cm-filter-group">
            <IcoFilter style={{ color: "var(--text3)" }} />
            {DEPT_OPTS.map(d => <button key={d} className={`cm-filter-btn ${deptFilter === d ? "active" : ""}`} onClick={() => setDept(d)}>{d}</button>)}
          </div>
          <div className="cm-filter-group">
            {STATUS_OPTS.map(s => <button key={s} className={`cm-filter-btn ${statFilter === s ? "active" : ""}`} onClick={() => setStat(s)}>{s === "All" ? s : s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
          </div>
        </div>
      </div>

      <div className="cm-layout">
        {/* COURSE TABLE */}
        <div className="cm-table-wrap">
          <div className="cm-table-head">
            <span>Code</span><span>Course Name</span><span>Dept</span><span>Faculty</span>
            <span>Enrolled</span><span>Rating</span><span>Completion</span><span>Status</span><span>Actions</span>
          </div>
          {filtered.map((c, i) => (
            <div key={c.id} className={`cm-row ${selected?.id === c.id ? "selected" : ""}`} style={{ animationDelay: `${i * 0.04}s` }} onClick={() => setSelected(c)}>
              <span className="cm-code">{c.id}</span>
              <span className="cm-name">{c.name}</span>
              <span><div className="cm-dept-chip">{c.dept}</div></span>
              <span className="cm-faculty">{c.faculty}</span>
              <span className="cm-enrolled">{c.enrolled > 0 ? `${c.enrolled}/${c.capacity}` : "—"}</span>
              <span className="cm-rating">{c.rating > 0 ? <><IcoStar style={{ color: "var(--amber)" }} /> {c.rating}</> : "—"}</span>
              <span style={{ minWidth: 100 }}>
                {c.completion > 0
                  ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ flex: 1 }}><AnimBar pct={c.completion} color="var(--teal)" delay={300 + i * 40} /></div><span style={{ fontSize: 10, fontWeight: 700, color: "var(--teal)", width: 28 }}>{c.completion}%</span></div>
                  : <span style={{ color: "var(--text3)", fontSize: 11 }}>—</span>
                }
              </span>
              <span><div className={`cm-status-chip ${c.status}`}>{c.status}</div></span>
              <span className="cm-actions" onClick={e => e.stopPropagation()}>
                <button className="cm-act-btn"><IcoEye /></button>
                <button className="cm-act-btn"><IcoEdit /></button>
              </span>
            </div>
          ))}
          {filtered.length === 0 && <div className="cm-empty">No courses match the filters.</div>}
        </div>

        {/* DETAIL PANEL */}
        {selected && (
          <div className="cm-detail">
            <div className="cm-detail-hd">
              <div>
                <div className="cm-detail-code">{selected.id}</div>
                <div className="cm-detail-name">{selected.name}</div>
              </div>
              <button className="cm-detail-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="cm-detail-body">
              <div className="cm-detail-row"><span>Department</span><div className="cm-dept-chip">{selected.dept}</div></div>
              <div className="cm-detail-row"><span>Faculty</span><strong>{selected.faculty}</strong></div>
              <div className="cm-detail-row"><span>Credits</span><strong>{selected.credits}</strong></div>
              <div className="cm-detail-row"><span>Status</span><div className={`cm-status-chip ${selected.status}`}>{selected.status}</div></div>
              <div className="cm-detail-divider" />
              <div className="cm-detail-row"><span>Enrolled</span><strong style={{ color: "var(--teal)" }}>{selected.enrolled} / {selected.capacity}</strong></div>
              <div className="cm-detail-row"><span>Lectures</span><strong>{selected.lectures || "—"}</strong></div>
              <div className="cm-detail-row"><span>Assignments</span><strong>{selected.assignments || "—"}</strong></div>
              <div className="cm-detail-row"><span>Rating</span><strong style={{ color: "var(--amber)" }}>{selected.rating > 0 ? `★ ${selected.rating}` : "—"}</strong></div>
              {selected.completion > 0 && <>
                <div className="cm-detail-divider" />
                <div style={{ marginBottom: 6 }}><span style={{ fontSize: 10, color: "var(--text3)" }}>Completion Rate</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}><AnimBar pct={selected.completion} color="var(--teal)" delay={100} /></div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)" }}>{selected.completion}%</span>
                </div>
                <div style={{ height: 8 }} />
                <div style={{ marginBottom: 6 }}><span style={{ fontSize: 10, color: "var(--text3)" }}>Capacity Used</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}><AnimBar pct={Math.round((selected.enrolled / selected.capacity) * 100)} color="var(--indigo-l)" delay={200} /></div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--indigo-ll)" }}>{Math.round((selected.enrolled / selected.capacity) * 100)}%</span>
                </div>
              </>}
              <div className="cm-detail-divider" />
              <div className="cm-detail-actions">
                <button className="cm-det-btn primary">Edit Course</button>
                <button className="cm-det-btn">View Details</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}