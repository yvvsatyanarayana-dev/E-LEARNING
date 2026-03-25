import { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";
import { useNavigate, useLocation } from "react-router-dom";
import "./Department.css";
import "../../../styles/modals.css";
import { Modal, FormField, FormSelect, exportToCSV, storage } from "../../../utils/formModals";

const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  bar: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  menu: <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
  trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
  zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
  cpu: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></>,
  db: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>,
  wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></>,
  award: <><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></>,
  trend: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  check: <><polyline points="20 6 9 17 4 12" /></>,
  info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
  chevronR: <><polyline points="9 18 15 12 9 6" /></>,
  chevronL: <><polyline points="15 18 9 12 15 6" /></>,
  moreH: <><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>,
  userPlus: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
  refresh: <><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>,
  mail:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
};
const I = ({ n, size = 16 }) => <Icon size={size} d={icons[n]} />;

function buildNav(navBadges = {}) {
  return [
    {
      section: "Overview", items: [
        { id: "dashboard", label: "Dashboard", icon: "grid", routePath: "", badge: null },
        { id: "analytics", label: "Analytics", icon: "bar", routePath: "analytics", badge: null },
      ]
    },
    {
      section: "Management", items: [
        { id: "users", label: "User Management", icon: "users", routePath: "users", badge: null },
        { id: "courses", label: "Courses", icon: "book", routePath: "courses", badge: null },
        { id: "departments", label: "Departments", icon: "layers", routePath: "departments", badge: null },
        { id: "placement", label: "Placement", icon: "briefcase", routePath: "placements", badge: null, badgeType: "teal" },
      ]
    },
    {
      section: "Platform", items: [
        { id: "reports", label: "Reports", icon: "download", routePath: "reports", badge: null },
        { id: "activity", label: "Activity Log", icon: "activity", routePath: "auditlogs", badge: null, badgeType: "rose" },
        { id: "mail", label: "Mail System", icon: "mail", routePath: "mail", badge: navBadges.mail || 0, badgeType: "teal" },
        { id: "security", label: "Security", icon: "shield", routePath: "security", badge: null },
        { id: "settings", label: "Profile", icon: "user", routePath: "settings", badge: null },
      ]
    },
  ];
}

const getActiveId = (pathname) => {
  const NAV = buildNav();
  for (const sec of NAV) {
    for (const item of sec.items) {
      if (item.routePath === "") {
        if (pathname === "/admindashboard" || pathname === "/admindashboard/") return item.id;
      } else { if (pathname.includes(`/admindashboard/${item.routePath}`)) return item.id; }
    }
  }
  return "dashboard";
};

export default function Department() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebar] = useState(false);
  const [addDeptModal, setAddDeptModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [formData, setFormData] = useState({ name: "", short: "", students: 0, faculty: 0, hod: "", status: "Active", courses: 0, placement: 0 });
  const [departments, setDepartments] = useState([]);
  const [navBadges, setNavBadges] = useState({});
  const [configStats, setConfigStats] = useState({ uptime: "99.9%", cpu: "0%", memory: "0%", backup_size: "0GB" });
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(null);
  const active = getActiveId(location.pathname);
  const NAV = buildNav(navBadges);
  const now = new Date().toLocaleDateString();

  const fetchMailCount = async () => {
    try {
      const res = await api.get("/mail/unread/count");
      setNavBadges(prev => ({ ...prev, mail: res.count || 0 }));
    } catch (err) {
      console.error("Failed to poll mail count", err);
    }
  };

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const [data, nb, cs] = await Promise.all([
        api.get("/admin/departments"),
        api.get("/admin/config/badges"),
        api.get("/admin/config/stats")
      ]);
      setDepartments(data);
      setNavBadges(nb);
      setConfigStats(cs);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load departments from API
  useEffect(() => {
    fetchDepts();
    const interval = setInterval(fetchMailCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDepts();
    fetchMailCount();
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add new department
  const handleAddDept = async () => {
    if (!formData.name.trim() || !formData.short.trim() || !formData.hod.trim()) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      await api.post("/admin/departments", formData);
      setFormData({ name: "", short: "", students: 0, faculty: 0, hod: "", status: "Active", courses: 0, placement: 0 });
      setAddDeptModal(false);
      const data = await api.get("/admin/departments");
      setDepartments(data);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add department");
    }
  };

  // Delete department
  const handleDeleteDept = async (shortCode) => {
    if (confirm(`Are you sure you want to delete this department?`)) {
      try {
        await api.delete(`/admin/departments/${shortCode}`);
        setDepartments(prev => prev.filter(d => d.short !== shortCode));
      } catch (err) {
        alert("Failed to delete department");
      }
    }
  };

  // Filter departments
  const filteredDepts = departments.filter(d => {
    const matchSearch = (d.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.short || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "All Status" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Summary Stats
  const studentTotal = departments.reduce((acc, d) => acc + (d.students || 0), 0);
  const facultyTotal = departments.reduce((acc, d) => acc + (d.faculty || 0), 0);
  const courseTotal = departments.reduce((acc, d) => acc + (d.courses || 0), 0);
  const avgPlacement = departments.length ? Math.round(departments.reduce((acc, d) => acc + (d.placement || 0), 0) / departments.length) : 0;


  useEffect(() => {
    const fills = document.querySelectorAll("[data-width]");
    const timeout = setTimeout(() => { fills.forEach(el => { el.style.width = el.dataset.width; }); }, 300);
    return () => clearTimeout(timeout);
  }, [active]);

  return (
    <>
      <div className="sc-noise" />
      <div className="admin-departments-page app" ref={pageRef}>
        <div className={`sb-overlay ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebar(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? "sb-open" : ""}`}>
          <div className="sb-top">
            <a href="/admindashboard" className="sb-brand" onClick={e => { e.preventDefault(); navigate("/admindashboard"); }}>
              <div className="sb-mark">SC</div><span className="sb-name">Smart Campus</span>
            </a>
            <button className="sb-mobile-close" onClick={() => setSidebar(false)}><I n="x" size={14} /></button>
          </div>
          <div className="sb-user">
            <div className="sb-avatar">SA</div>
            <div><div className="sb-uname">Super Admin</div><div className="sb-urole">System Administrator</div></div>
          </div>
          <nav className="sb-nav">
            {NAV.map(sec => (
              <div key={sec.section}>
                <div className="sb-sec-label">{sec.section}</div>
                {sec.items.map(item => (
                  <a key={item.id}
                    href={item.routePath === "" ? "/admindashboard" : `/admindashboard/${item.routePath}`}
                    className={`sb-link ${active === item.id ? "active" : ""}`}
                    onClick={e => { e.preventDefault(); navigate(item.routePath === "" ? "/admindashboard" : `/admindashboard/${item.routePath}`); setSidebar(false); }}>
                    <I n={item.icon} size={15} />{item.label}
                    {navBadges[item.id] > 0 && <span className={`sb-badge ${item.badgeType || ""}`}>{navBadges[item.id]}</span>}
                  </a>
                ))}
              </div>
            ))}
          </nav>
          <div className="sb-bottom">
            <div className="sb-health">
              <div className="sb-health-lbl">System Health</div>
              {[
                { n: "Uptime", v: configStats.uptime },
                { n: "CPU", v: configStats.cpu },
                { n: "Memory", v: configStats.memory }
              ].map((item) => (
                <div key={item.n}>
                  <div className="sb-health-row"><span className="sb-health-name">{item.n}</span><span className="sb-health-val">{item.v}</span></div>
                  <div className="sb-health-bar"><div className="sb-health-fill" style={{ width: item.v.includes("%") ? item.v : "60%" }} /></div>
                </div>
              ))}
            </div>
            <button className="sb-logout" onClick={() => navigate("/login")}><I n="logout" size={14} /> Sign Out</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <header className="topbar">
            <button className="tb-hamburger" onClick={() => setSidebar(true)}><I n="menu" size={16} /></button>
            <span className="tb-page">Departments</span>
            <div className="tb-sep" />
            <div className="tb-search"><I n="search" size={14} /><input placeholder="Search users, courses…" /></div>
            <div className="tb-right">
              <span className="tb-role-tag">Admin</span>
              <span className="tb-date">{now}</span>
              <button onClick={handleRefresh} className="tb-icon-btn tooltip" data-tip="Refresh"><I n="refresh" size={15} /></button>
              <button onClick={() => navigate("/admindashboard/notifications")} className="tb-icon-btn tooltip" data-tip="Notifications"><I n="bell" size={15} /><span className="notif-dot" /></button>
              <button className="tb-icon-btn tooltip" data-tip="Settings" onClick={() => navigate("/admindashboard/settings")}><I n="settings" size={15} /></button>
            </div>
          </header>

          <main className="content">
            {/* ── GREETING ── */}
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">Departments</span></div>
              <h1 className="greet-title">Department <em>Overview.</em></h1>
              <p className="greet-sub">{departments.length} departments &nbsp;·&nbsp; {studentTotal.toLocaleString()} students &nbsp;·&nbsp; {facultyTotal.toLocaleString()} faculty &nbsp;·&nbsp; {courseTotal.toLocaleString()} total courses</p>
              <div className="greet-actions">
                <button onClick={() => setAddDeptModal(true)} className="btn btn-solid"><I n="plus" size={14} /> Add Department</button>
                <button onClick={() => exportToCSV(departments, "departments")} className="btn btn-ghost"><I n="download" size={14} /> Export</button>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="stat-grid">
              {[
                { accent: "sc-indigo", icon: "layers", val: departments.length, lbl: "Departments", delta: "total" },
                { accent: "sc-teal", icon: "users", val: studentTotal.toLocaleString(), lbl: "Total Students", delta: "enrolled" },
                { accent: "sc-amber", icon: "book", val: facultyTotal.toLocaleString(), lbl: "Faculty Members", delta: "across all" },
                { accent: "sc-violet", icon: "briefcase", val: `${avgPlacement}%`, lbl: "Avg Placement", delta: "last batch" },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.accent}`} style={{ animationDelay: `${i * 80}ms`, cursor: "default" }}>
                  <div className="stat-ic"><I n={s.icon} size={16} /></div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                  <span className="stat-delta delta-neu">· {s.delta}</span>
                </div>
              ))}
            </div>

            {/* DEPARTMENT CARDS */}
            <div className="panel">
              <div className="panel-hd">
                <div className="panel-ttl"><I n="layers" size={15} /> All Departments ({filteredDepts.length} shown)</div>
                <button onClick={() => setAddDeptModal(true)} className="btn btn-solid btn-sm"><I n="plus" size={12} /> Add Department</button>
              </div>
              <div className="panel-body">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
                  {filteredDepts.length > 0 ? filteredDepts.map((d, i) => (
                    <div key={i} style={{ background: "var(--surface2)", border: `1px solid ${d.color}20`, borderTop: `2px solid ${d.color}`, borderRadius: "14px", padding: "18px", transition: "border-color .2s,transform .2s", animationDelay: `${i * 60}ms` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "7px", background: `${d.color}18`, color: d.color }}>{d.short}</div>
                        <span style={{ fontSize: "10px", color: "var(--text3)" }}>{d.courses} courses</span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1.3, marginBottom: "5px" }}>{d.name}</div>
                      <div style={{ fontSize: "10.5px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "12px" }}><I n="users" size={11} /> {d.hod}</div>
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span style={{ fontSize: "10px", color: "var(--text3)" }}>Engagement</span>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: d.color }}>{d.pct}%</span>
                        </div>
                        <div className="dept-bar" style={{ height: "4px" }}>
                          <div className="dept-fill" data-width={`${d.pct}%`} style={{ width: 0, background: d.color }} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--border)", paddingTop: "10px", marginBottom: "12px" }}>
                        {[[d.students, "Students"], [d.faculty, "Faculty"], [(d.placement || 0) + "%", "Placed"]].map(([v, l]) => (
                          <div key={l} style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: "'Fraunces',serif", fontSize: "18px", color: d.color, lineHeight: 1 }}>{v}</div>
                            <div style={{ fontSize: "9px", color: "var(--text3)", marginTop: "2px" }}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                        {(d.courses_list || ["No courses yet"]).map((c, ci) => (
                          <span key={ci} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: `${d.color}10`, color: d.color, border: `1px solid ${d.color}22` }}>{c}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => alert("Manage " + d.name)} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }}><I n="edit" size={11} /> Manage</button>
                        <button onClick={() => handleDeleteDept(d.short)} className="ut-action tooltip" data-tip="Delete"><I n="trash" size={11} /></button>
                      </div>
                    </div>
                  )) : <div style={{ padding: "40px", textAlign: "center", color: "var(--text3)" }}>No departments found</div>}
                </div>
              </div>
            </div>

            {/* ADD DEPARTMENT MODAL */}
            {addDeptModal && (
              <div className="modal-overlay open" onClick={() => setAddDeptModal(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Add New Department</h2>
                    <button className="modal-close" onClick={() => setAddDeptModal(false)}><I n="x" size={16} /></button>
                  </div>
                  <div className="modal-body">
                    <FormField label="Department Name" required>
                      <input type="text" className="form-input" value={formData.name} onChange={(e) => handleFormChange("name", e.target.value)} placeholder="e.g., Computer Science & Engineering" />
                    </FormField>
                    <FormField label="Department Code" required>
                      <input type="text" className="form-input" value={formData.short} onChange={(e) => handleFormChange("short", e.target.value.toUpperCase())} placeholder="e.g., CSE" />
                    </FormField>
                    <FormField label="Head of Department" required>
                      <input type="text" className="form-input" value={formData.hod} onChange={(e) => handleFormChange("hod", e.target.value)} placeholder="e.g., Dr. Ramesh Kumar" />
                    </FormField>
                    <FormField label="Number of Students">
                      <input type="number" className="form-input" value={formData.students} onChange={(e) => handleFormChange("students", e.target.value)} min="0" />
                    </FormField>
                    <FormField label="Number of Faculty">
                      <input type="number" className="form-input" value={formData.faculty} onChange={(e) => handleFormChange("faculty", e.target.value)} min="0" />
                    </FormField>
                    <FormField label="Total Courses">
                      <input type="number" className="form-input" value={formData.courses} onChange={(e) => handleFormChange("courses", e.target.value)} min="0" />
                    </FormField>
                    <FormField label="Placement %">
                      <input type="number" className="form-input" value={formData.placement} onChange={(e) => handleFormChange("placement", e.target.value)} min="0" max="100" />
                    </FormField>
                    <FormField label="Status" required>
                      <select className="form-input" value={formData.status} onChange={(e) => handleFormChange("status", e.target.value)}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </FormField>
                  </div>
                  <div className="modal-footer">
                    <button onClick={() => setAddDeptModal(false)} className="btn btn-ghost">Cancel</button>
                    <button onClick={handleAddDept} className="btn btn-solid">Add Department</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}