// studentInternships.jsx
import { useState, useEffect } from "react";
import "./studentInternships.css";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoBack    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoChevR   = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoSearch  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoArrow   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoBrief   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcoPin     = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoClock   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoStar    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoFilter  = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoTrend   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoCode    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const IcoCal     = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoZap     = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoClose   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoExtern  = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const IcoMail    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;

const DOMAINS = ["All", "Backend", "Frontend", "ML / AI", "Cloud", "Full Stack"];
const TAGS    = ["All", "Open", "Closing", "Applied"];

// ─── SUB COMPONENTS ──────────────────────────────────────────────
function ProgressPip({ done }) {
  return (
    <div className={`int-pip ${done ? "done" : done === null ? "active" : ""}`}>
      {done && <IcoCheck />}
    </div>
  );
}

function Bar({ pct, color, delay = 400 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height: 4, background: "var(--surface3)", borderRadius: 3, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3, transition: "width 1.1s cubic-bezier(.16,1,.3,1)" }} />
    </div>
  );
}

// ─── DETAIL DRAWER ───────────────────────────────────────────────
function InternshipDrawer({ item, onClose, onApply }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  if (!item) return null;
  return (
    <>
      <div className="int-drawer-overlay" onClick={onClose} />
      <div className="int-drawer">
        <button className="int-drawer-close" onClick={onClose}><IcoClose /></button>

        <div className="int-drawer-header">
          <div className="int-drawer-logo" style={{ background: item.logo_bg, color: item.logo_color }}>{item.logo}</div>
          <div>
            <div className="int-drawer-company">{item.company_name}</div>
            <div className="int-drawer-role">{item.role}</div>
          </div>
          <span className={`int-tag int-tag-${item.tag_color}`} style={{ marginLeft: "auto" }}>{item.tag}</span>
        </div>

        <div className="int-drawer-meta-row">
          <span><IcoPin style={{ color: "var(--text3)" }} /> {item.location}</span>
          <span><IcoClock style={{ color: "var(--text3)" }} /> {item.duration}</span>
          <span><IcoUsers style={{ color: "var(--text3)" }} /> {item.seats} seats</span>
          <span><IcoCal style={{ color: "var(--text3)" }} /> Closes {item.deadline}</span>
        </div>

        <div className="int-drawer-stipend">
          <span className="int-ds-label">Stipend</span>
          <span className="int-ds-value">{item.stipend}</span>
        </div>

        <div className="int-drawer-section">
          <div className="int-drawer-section-ttl">About the Role</div>
          <p className="int-drawer-desc">{item.description} This is an exceptional opportunity to build real-world experience alongside world-class engineers, contribute to systems used by millions, and add significant weight to your resume.</p>
        </div>

        <div className="int-drawer-section">
          <div className="int-drawer-section-ttl">Skills Required</div>
          <div className="int-skills-wrap">
            {item.skills.map(s => <span key={s} className="int-skill-chip">{s}</span>)}
          </div>
        </div>

        <div className="int-drawer-section">
          <div className="int-drawer-section-ttl">AI Profile Match</div>
          <div className="int-match-row">
            <div className="int-match-val" style={{ color: (item.match || 75) >= 85 ? "var(--teal)" : (item.match || 75) >= 70 ? "var(--amber)" : "var(--rose)" }}>{item.match || 75}%</div>
            <Bar pct={item.match || 75} color={(item.match || 75) >= 85 ? "var(--teal)" : "var(--amber)"} delay={200} />
          </div>
          <p className="int-match-hint">Based on your resume, skills, and CGPA. Add certifications to improve match score.</p>
        </div>

        <div className="int-drawer-actions">
          <button className="int-btn-ghost"><IcoMail /> Save for Later</button>
          <button className="int-btn-solid" onClick={() => onApply(item.id)}>
            <IcoArrow /> Apply Now <IcoExtern />
          </button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function StudentInternships({ onBack }) {
  const [activeTab, setActiveTab]       = useState("browse");
  const [domainFilter, setDomainFilter] = useState("All");
  const [tagFilter, setTagFilter]       = useState("All");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState(null);
  const [data, setData]                 = useState(null);
  const [applying, setApplying]         = useState(false);

  const fetchInternships = () => {
    import("../../../utils/api").then(({ default: api }) => {
      api.get("/student/internships").then(res => setData(res)).catch(console.error);
    });
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleApply = (id) => {
    if (applying) return;
    setApplying(true);
    import("../../../utils/api").then(({ default: api }) => {
      api.post(`/student/internships/${id}/apply`)
        .then(() => {
          alert("Application submitted successfully!");
          fetchInternships();
          setSelected(null);
        })
        .catch(err => {
          console.error(err);
          alert(err.response?.data?.detail || "Failed to apply");
        })
        .finally(() => setApplying(false));
    });
  };

  if (!data) return <div className="int-root" style={{ padding: 40, textAlign: "center" }}>Loading Internships...</div>;
  const { listings, applications, saved, funnel, timeline } = data;

  const tabs = [
    { id: "browse",  label: "Browse Internships", icon: <IcoSearch /> },
    { id: "applied", label: "My Applications",    icon: <IcoBrief />, badge: applications.length },
    { id: "saved",   label: "Saved",               icon: <IcoStar />,  badge: saved.length },
    { id: "track",   label: "Application Tracker", icon: <IcoTrend /> },
  ];

  const filtered = listings.filter(i => {
    const matchDomain = domainFilter === "All" || i.domain === domainFilter;
    const matchTag    = tagFilter === "All"    || i.tag === tagFilter;
    const matchSearch = !search || i.role.toLowerCase().includes(search.toLowerCase()) || (i.company_name || "").toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchTag && matchSearch;
  });

  return (
    <div className="int-root">
      <InternshipDrawer item={selected} onClose={() => setSelected(null)} onApply={handleApply} />

      {/* ── HEADER ── */}
      <div className="int-header">
        <div className="int-header-left">
          <button className="int-back" onClick={onBack}><IcoBack /> Back</button>
          <div>
            <div className="int-breadcrumb">Career · Internships</div>
            <h1 className="int-title">Internship <em>Board</em></h1>
            <p className="int-subtitle">Curated opportunities matched to your profile — apply, track, and land your dream internship.</p>
          </div>
        </div>
        <div className="int-header-right">
          <div className="int-stats-mini">
            {[
              { val: listings.filter(i => i.tag === "Open").length, lbl: "Open", color: "var(--teal)" },
              { val: applications.length, lbl: "Applied", color: "var(--indigo-ll)" },
              { val: applications.filter(i => i.status === "OA Scheduled" || i.status === "Interview").length, lbl: "Active", color: "var(--amber)" },
              { val: saved.length, lbl: "Saved", color: "var(--violet)" },
            ].map(s => (
              <div key={s.lbl} className="int-sm-stat">
                <span className="int-sm-val" style={{ color: s.color }}>{s.val}</span>
                <span className="int-sm-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="int-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`int-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            {t.badge && <span className="int-tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* ══════ BROWSE ══════ */}
      {activeTab === "browse" && (
        <div className="int-browse-layout">
          {/* Filters */}
          <div className="int-filters">
            <div className="int-search-wrap">
              <IcoSearch style={{ color: "var(--text3)", flexShrink: 0 }} />
              <input
                className="int-search-input"
                placeholder="Search by company or role…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="int-search-clear" onClick={() => setSearch("")}><IcoClose width={10} height={10} /></button>}
            </div>
            <div className="int-filter-row">
              <span className="int-filter-lbl"><IcoFilter /> Domain</span>
              <div className="int-filter-chips">
                {DOMAINS.map(d => (
                  <button key={d} className={`int-chip ${domainFilter === d ? "active" : ""}`} onClick={() => setDomainFilter(d)}>{d}</button>
                ))}
              </div>
            </div>
            <div className="int-filter-row">
              <span className="int-filter-lbl"><IcoBrief /> Status</span>
              <div className="int-filter-chips">
                {TAGS.map(t => (
                  <button key={t} className={`int-chip ${tagFilter === t ? "active" : ""}`} onClick={() => setTagFilter(t)}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Listing Grid */}
          <div className="int-results-count">
            {filtered.length} internship{filtered.length !== 1 ? "s" : ""} found
          </div>
          <div className="int-listing-grid">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="int-card"
                style={{ animationDelay: `${i * .06}s` }}
                onClick={() => setSelected(item)}
              >
                <div className="int-card-top">
                  <div className="int-card-logo" style={{ background: item.logo_bg, color: item.logo_color }}>{item.logo}</div>
                  <div className="int-card-info">
                    <div className="int-card-company">{item.company_name}</div>
                    <div className="int-card-role">{item.role}</div>
                  </div>
                  <span className={`int-tag int-tag-${item.tag_color}`}>{item.tag}</span>
                </div>

                <div className="int-card-attrs">
                  <span><IcoPin /> {item.location}</span>
                  <span><IcoClock /> {item.duration}</span>
                  <span><IcoCode /> {item.domain}</span>
                </div>

                <div className="int-card-skills">
                  {item.skills.slice(0, 3).map(s => <span key={s} className="int-skill-chip sm">{s}</span>)}
                </div>

                <div className="int-card-footer">
                  <div className="int-card-stipend">{item.stipend}</div>
                  <div className="int-card-match">
                    <IcoZap style={{ color: (item.match || 75) >= 85 ? "var(--teal)" : "var(--amber)" }} />
                    <span style={{ color: (item.match || 75) >= 85 ? "var(--teal)" : "var(--amber)", fontWeight: 700 }}>{item.match || 75}% match</span>
                  </div>
                </div>

                <div className="int-card-deadline">
                  <IcoCal style={{ color: "var(--text3)" }} /> Closes {item.deadline}
                  <button className="int-card-cta" onClick={e => { e.stopPropagation(); setSelected(item); }}>
                    View Details <IcoChevR />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════ MY APPLICATIONS ══════ */}
      {activeTab === "applied" && (
        <div className="int-applied-layout">
          {applications.map((app, i) => (
            <div key={i} className="int-app-card" style={{ animationDelay: `${i * .07}s` }}>
              <div className="int-app-top">
                <div className="int-app-logo" style={{ background: app.logoBg, color: app.logoColor }}>{app.logo}</div>
                <div className="int-app-info">
                  <div className="int-app-company">{app.company_name || app.company}</div>
                  <div className="int-app-role">{app.role}</div>
                  <div className="int-app-date">Applied {app.appliedOn}</div>
                </div>
                <span className={`int-status-badge int-status-${app.statusColor}`}>{app.status}</span>
              </div>

              {/* Progress stepper */}
              <div className="int-stepper">
                {app.steps.map((step, si) => {
                  const isDone   = app.currentStep === -1 ? false : si < app.currentStep;
                  const isActive = app.currentStep !== -1 && si === app.currentStep - 1;
                  const isFailed = app.currentStep === -1 && si <= 0;
                  return (
                    <div key={step} className="int-step">
                      <div className={`int-step-dot ${isDone ? "done" : isActive ? "active" : isFailed ? "failed" : ""}`}>
                        {isDone && <IcoCheck />}
                        {isFailed && <IcoClose width={8} height={8} />}
                      </div>
                      <div className={`int-step-label ${isDone || isActive ? "done" : "pending"}`}>{step}</div>
                      {si < app.steps.length - 1 && (
                        <div className={`int-step-line ${isDone ? "done" : ""}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="int-app-actions">
                {app.currentStep === 2 && (
                  <button className="int-btn-solid" style={{ padding: "7px 14px", fontSize: 11 }}><IcoCal /> Schedule Interview</button>
                )}
                <button className="int-btn-ghost" style={{ padding: "7px 14px", fontSize: 11 }}><IcoExtern /> View Portal</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════ SAVED ══════ */}
      {activeTab === "saved" && (
        <div className="int-saved-layout">
          {saved.map((s, i) => (
            <div key={i} className="int-saved-card" style={{ animationDelay: `${i * .08}s` }}>
              <div className="int-sc-logo" style={{ background: s.logoBg, color: s.logoColor }}>{s.logo}</div>
              <div className="int-sc-info">
                <div className="int-sc-company">{s.company}</div>
                <div className="int-sc-role">{s.role}</div>
                <div className="int-sc-meta">{s.stipend} · Closes {s.deadline}</div>
              </div>
              <div className="int-sc-actions">
                <button className="int-btn-solid" style={{ padding: "7px 14px", fontSize: 11 }}><IcoArrow /> Apply</button>
                <button className="int-btn-ghost" style={{ padding: "7px 14px", fontSize: 11, color: "var(--rose)", borderColor: "rgba(242,68,92,.2)" }}><IcoClose width={10} height={10} /> Remove</button>
              </div>
            </div>
          ))}
          {saved.length === 0 && (
            <div className="int-empty">
              <div className="int-empty-icon">📌</div>
              <div className="int-empty-ttl">No saved internships</div>
              <div className="int-empty-sub">Bookmark roles while browsing and they'll appear here.</div>
            </div>
          )}
        </div>
      )}

      {/* ══════ TRACKER ══════ */}
      {activeTab === "track" && (
        <div className="int-track-layout">
          {/* Funnel */}
          <div className="int-funnel-card">
            <div className="int-card-hd"><span className="int-card-ttl"><IcoTrend style={{ color: "var(--indigo-ll)" }} /> Application Funnel</span></div>
            <div className="int-funnel-body">
              {funnel.map((f, i) => (
                <div key={f.stage} className="int-funnel-row" style={{ animationDelay: `${i * .08}s` }}>
                  <span className="int-funnel-stage">{f.stage}</span>
                  <div className="int-funnel-bar-wrap">
                    <Bar pct={f.pct} color={f.color} delay={400 + i * 100} />
                  </div>
                  <span className="int-funnel-count" style={{ color: f.color }}>{f.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="int-timeline-card">
            <div className="int-card-hd"><span className="int-card-ttl"><IcoCal style={{ color: "var(--indigo-ll)" }} /> Activity Timeline</span></div>
            <div className="int-timeline-body">
              {timeline.map((e, i) => (
                <div key={i} className="int-tl-item">
                  <div className="int-tl-dot" style={{ background: e.color }} />
                  <div className="int-tl-content">
                    <div className="int-tl-event">{e.event}</div>
                    <div className="int-tl-date">{e.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}