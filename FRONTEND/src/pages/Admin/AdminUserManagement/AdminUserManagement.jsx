// AdminUserManagement.jsx — SMART CAMPUS Admin Panel
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminUserManagement.css";
import "../../../styles/modals.css";

const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const icons = {
  grid:<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  users:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  book:<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
  bar:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  bell:<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  search:<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  menu:<><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  edit:<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></>,
  shield:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  zap:<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  cpu:<><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></>,
  db:<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
  wifi:<><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  award:<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
  trend:<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  layers:<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  globe:<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  check:<><polyline points="20 6 9 17 4 12"/></>,
  info:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  chevronR:<><polyline points="9 18 15 12 9 6"/></>,
  chevronL:<><polyline points="15 18 9 12 15 6"/></>,
  moreH:<><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  userPlus:<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
  download:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  refresh:<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  briefcase:<><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  activity:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
};
const I = ({ n, size = 16 }) => <Icon size={size} d={icons[n]} />;

const NAV = [
  { section:"Overview", items:[
    { id:"dashboard", label:"Dashboard",       icon:"grid",      routePath:"",               badge:null },
    { id:"analytics", label:"Analytics",       icon:"bar",       routePath:"adminAnalytics",  badge:null },
  ]},
  { section:"Management", items:[
    { id:"users",       label:"User Management", icon:"users",     routePath:"userManagement",   badge:"1.3k" },
    { id:"courses",     label:"Courses",         icon:"book",      routePath:"courseManagement", badge:"47" },
    { id:"departments", label:"Departments",     icon:"layers",    routePath:"department",       badge:null },
    { id:"placement",   label:"Placement",       icon:"briefcase", routePath:"placement",        badge:"3", badgeType:"teal" },
  ]},
  { section:"Platform", items:[
    { id:"reports",   label:"Reports",      icon:"download", routePath:"adminReports", badge:null },
    { id:"activity",  label:"Activity Log", icon:"activity", routePath:"activitylog",  badge:"12", badgeType:"rose" },
    { id:"security",  label:"Security",     icon:"shield",   routePath:"security",     badge:null },
    { id:"settings",  label:"Settings",     icon:"settings", routePath:"settings",     badge:null },
  ]},
];

const getActiveId = (pathname) => {
  for (const sec of NAV) {
    for (const item of sec.items) {
      if (item.routePath === "") {
        if (pathname === "/admindashboard" || pathname === "/admindashboard/") return item.id;
      } else { if (pathname.includes(item.routePath)) return item.id; }
    }
  }
  return "dashboard";
};

export default function AdminUserManagement() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [sidebarOpen, setSidebar] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [formData, setFormData] = useState({ name: "", email: "", role: "student", dept: "CSE", status: "active" });
  const [users, setUsers] = useState([
    { id:1,  name:"Aditya Sharma",   email:"aditya@college.edu",  role:"student",   dept:"CSE",   status:"active",   joined:"Jan 2024", av:"AS", avC:"rgba(91,78,248,.2)",   avT:"var(--indigo-ll)" },
    { id:2,  name:"Dr. Meera Nair",  email:"meera@college.edu",   role:"faculty",   dept:"ECE",   status:"active",   joined:"Aug 2022", av:"MN", avC:"rgba(39,201,176,.15)", avT:"var(--teal)" },
    { id:3,  name:"Rohit Verma",     email:"rohit@college.edu",   role:"student",   dept:"MECH",  status:"inactive", joined:"Jan 2024", av:"RV", avC:"rgba(242,68,92,.15)",  avT:"var(--rose)" },
    { id:4,  name:"Priya Krishnan",  email:"priya@college.edu",   role:"placement", dept:"HR",    status:"active",   joined:"Mar 2023", av:"PK", avC:"rgba(244,165,53,.15)", avT:"var(--amber)" },
    { id:5,  name:"Ankit Gupta",     email:"ankit@college.edu",   role:"student",   dept:"CSE",   status:"pending",  joined:"Jan 2025", av:"AG", avC:"rgba(159,122,234,.15)",avT:"var(--violet)" },
    { id:6,  name:"Dr. Suresh Babu", email:"suresh@college.edu",  role:"faculty",   dept:"CIVIL", status:"active",   joined:"Jun 2021", av:"SB", avC:"rgba(39,201,176,.15)", avT:"var(--teal)" },
    { id:7,  name:"Kavitha Rao",     email:"kavitha@college.edu", role:"student",   dept:"MBA",   status:"active",   joined:"Jul 2024", av:"KR", avC:"rgba(91,78,248,.2)",   avT:"var(--indigo-ll)" },
    { id:8,  name:"Vikram Singh",    email:"vikram@college.edu",  role:"student",   dept:"CSE",   status:"active",   joined:"Jan 2024", av:"VS", avC:"rgba(242,68,92,.15)",  avT:"var(--rose)" },
    { id:9,  name:"Dr. Anita Reddy", email:"anita@college.edu",   role:"faculty",   dept:"MBA",   status:"active",   joined:"Jul 2020", av:"AR", avC:"rgba(244,165,53,.15)", avT:"var(--amber)" },
    { id:10, name:"Sanjay Kumar",    email:"sanjay@college.edu",  role:"student",   dept:"ECE",   status:"inactive", joined:"Jul 2023", av:"SK", avC:"rgba(159,122,234,.15)",avT:"var(--violet)" },
  ]);
  
  // Load users from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("schoolUsers");
    if (saved) setUsers(JSON.parse(saved));
  }, []);

  const pageRef       = useRef(null);
  const cursorRef     = useRef(null);
  const cursorRingRef = useRef(null);
  const active = getActiveId(location.pathname);
  const now    = new Date().toLocaleDateString();

  // Filter users based on search and filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || u.role === filterRole.toLowerCase();
    const matchesStatus = filterStatus === "All Status" || u.status === filterStatus.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle add user submission
  const handleAddUser = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Please fill in all fields");
      return;
    }
    
    if (users.some(u => u.email === formData.email)) {
      alert("Email already exists");
      return;
    }

    const initials = formData.name.split(" ").map(n => n[0]).join("").toUpperCase();
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...formData,
      av: initials,
      avC: "rgba(91,78,248,.2)",
      avT: "var(--indigo-ll)",
      joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("schoolUsers", JSON.stringify(updatedUsers));
    
    // Log activity
    const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");
    logs.unshift({
      id: Date.now(),
      action: `Added new user: ${formData.name}`,
      details: `Email: ${formData.email}, Role: ${formData.role}`,
      timestamp: new Date().toLocaleString(),
      category: "user"
    });
    localStorage.setItem("activityLogs", JSON.stringify(logs));

    setAddUserModal(false);
    setFormData({ name: "", email: "", role: "student", dept: "CSE", status: "active" });
  };

  const handleDeleteUser = (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const deletedUser = users.find(u => u.id === id);
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem("schoolUsers", JSON.stringify(updatedUsers));

      const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");
      logs.unshift({
        id: Date.now(),
        action: `Deleted user: ${deletedUser.name}`,
        details: `Email: ${deletedUser.email}`,
        timestamp: new Date().toLocaleString(),
        category: "user"
      });
      localStorage.setItem("activityLogs", JSON.stringify(logs));
    }
  };

  useEffect(() => {
    const cursor = cursorRef.current; const cursorRing = cursorRingRef.current;
    if (!cursor || !cursorRing) return;
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    const onMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; cursor.style.transform = `translate(${mouseX}px,${mouseY}px)`; };
    let raf;
    const animate = () => { ringX += (mouseX - ringX) * 0.12; ringY += (mouseY - ringY) * 0.12; cursorRing.style.transform = `translate(${ringX}px,${ringY}px)`; raf = requestAnimationFrame(animate); };
    window.addEventListener("mousemove", onMove); raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const fills = document.querySelectorAll("[data-width]");
    const timeout = setTimeout(() => { fills.forEach(el => { el.style.width = el.dataset.width; }); }, 300);
    return () => clearTimeout(timeout);
  }, [active]);

  return (
    <>
      <div className="sc-cursor" ref={cursorRef} />
      <div className="sc-cursor-ring" ref={cursorRingRef} />
      <div className="sc-noise" />
      <div className="app" ref={pageRef}>
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
                    {item.badge && <span className={`sb-badge ${item.badgeType || ""}`}>{item.badge}</span>}
                  </a>
                ))}
              </div>
            ))}
          </nav>
          <div className="sb-bottom">
            <div className="sb-health">
              <div className="sb-health-lbl">System Health</div>
              {[["Uptime","99.8%"],["CPU","34%"],["Memory","61%"]].map(([n,v]) => (
                <div key={n}>
                  <div className="sb-health-row"><span className="sb-health-name">{n}</span><span className="sb-health-val">{v}</span></div>
                  <div className="sb-health-bar"><div className="sb-health-fill" data-width={v} style={{ width:0 }} /></div>
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
            <span className="tb-page">User Management</span>
            <div className="tb-sep" />
            <div className="tb-search"><I n="search" size={14} /><input placeholder="Search users, courses…" /></div>
            <div className="tb-right">
              <span className="tb-role-tag">Admin</span>
              <span className="tb-date">{now}</span>
              <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} className="tb-icon-btn tooltip" data-tip="Refresh"><I n="refresh" size={15} /></button>
              <button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")} className="tb-icon-btn tooltip" data-tip="Notifications"><I n="bell" size={15} /><span className="notif-dot" /></button>
              <button className="tb-icon-btn tooltip" data-tip="Settings" onClick={() => navigate("/admindashboard/settings")}><I n="settings" size={15} /></button>
            </div>
          </header>

          <main className="content">
            {/* ── GREETING ── */}
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">User Management</span></div>
              <h1 className="greet-title">Manage <em>Users.</em></h1>
              <p className="greet-sub">1,347 registered users &nbsp;·&nbsp; 3 pending approvals &nbsp;·&nbsp; 2 inactive accounts</p>
              <div className="greet-actions">
                <button onClick={() => setAddUserModal(true)} className="btn btn-solid"><I n="userPlus" size={14} /> Add User</button>
                <button onClick={() => {
                  const csv = [["Name", "Email", "Role", "Department", "Status", "Joined"]].concat(
                    filteredUsers.map(u => [u.name, u.email, u.role, u.dept, u.status, u.joined])
                  ).map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
                  a.click();
                }} className="btn btn-ghost"><I n="download" size={14} /> Export CSV</button>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="stat-grid">
              {[
                { accent:"sc-indigo", icon:"users",   val:"1,347", lbl:"Total Users",       delta:"+12 this week" },
                { accent:"sc-teal",   icon:"check",   val:"1,199", lbl:"Active Users",      delta:"89%" },
                { accent:"sc-amber",  icon:"bell",    val:"3",     lbl:"Pending Approval",  delta:"needs action" },
                { accent:"sc-rose",   icon:"x",       val:"145",   lbl:"Inactive Users",    delta:"11%" },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.accent}`} style={{ animationDelay:`${i * 80}ms`, cursor:"default" }}>
                  <div className="stat-ic"><I n={s.icon} size={16} /></div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                  <span className="stat-delta delta-neu">· {s.delta}</span>
                </div>
              ))}
            </div>

            {/* USER TABLE PANEL */}
            <div className="panel">
              <div className="panel-hd">
                <div className="panel-ttl"><I n="users" size={15} /> All Users <span>{filteredUsers.length} shown</span></div>
                <button onClick={() => setAddUserModal(true)} className="btn btn-solid btn-sm"><I n="userPlus" size={12} /> Add User</button>
              </div>
              <div className="panel-body">
                <div className="filter-row">
                  <div className="tb-search" style={{ flex:"1", height:"32px" }}><I n="search" size={13} /><input placeholder="Search users…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                  {["All","Student","Faculty","Placement","Admin"].map(f => (
                    <button onClick={() => setFilterRole(f)} key={f} className={`filter-chip ${filterRole === f ? "active" : ""}`}>{f}</button>
                  ))}
                  <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option>All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Pending">Pending</option>
                  </select>
                </div>

                <table className="user-table">
                  <thead><tr><th>User</th><th>Role</th><th>Dept</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="ut-user">
                            <div className="ut-av" style={{ background:u.avC, color:u.avT }}>{u.av}</div>
                            <div><div className="ut-name">{u.name}</div><div className="ut-mail">{u.email}</div></div>
                          </div>
                        </td>
                        <td><span className={`role-tag role-${u.role}`}>{u.role}</span></td>
                        <td style={{ color:"var(--text3)", fontSize:"11px" }}>{u.dept}</td>
                        <td>
                          <span className={`status-tag ${u.status === "active" ? "status-active" : u.status === "pending" ? "status-pending" : "status-inactive"}`}>
                            <span className="status-dot" />{u.status}
                          </span>
                        </td>
                        <td style={{ color:"var(--text3)", fontSize:"10px" }}>{u.joined}</td>
                        <td>
                          <div style={{ display:"flex", gap:"5px" }}>
                            <button onClick={() => alert("Edit feature coming soon")} className="ut-action tooltip" data-tip="Edit User"><I n="edit" size={11} /></button>
                            <button onClick={() => alert("Password reset sent to " + u.email)} className="ut-action tooltip" data-tip="Reset Password"><I n="shield" size={11} /></button>
                            <button onClick={() => handleDeleteUser(u.id)} className="ut-action tooltip" data-tip="Remove User"><I n="trash" size={11} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pagination">
                  <button onClick={() => {}} className="pg-btn disabled"><I n="chevronL" size={12} /></button>
                  {[1,2,3].map(p => <button onClick={() => {}} key={p} className={`pg-btn ${p===1?"active":""}`}>{p}</button>)}
                  <button onClick={() => {}} className="pg-btn"><I n="chevronR" size={12} /></button>
                </div>
              </div>
            </div>

            {/* ADD USER MODAL */}
            {addUserModal && (
              <>
                <div className="modal-overlay" onClick={() => setAddUserModal(false)} />
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Add New User</h2>
                    <button className="modal-close" onClick={() => setAddUserModal(false)}>×</button>
                  </div>
                  <div className="modal-body">
                    <div className="form-field">
                      <label htmlFor="name">Full Name <span className="required">*</span></label>
                      <input id="name" name="name" type="text" value={formData.name} onChange={handleFormChange} placeholder="e.g., John Doe" className="form-input" />
                    </div>
                    <div className="form-field">
                      <label htmlFor="email">Email <span className="required">*</span></label>
                      <input id="email" name="email" type="email" value={formData.email} onChange={handleFormChange} placeholder="user@college.edu" className="form-input" />
                    </div>
                    <div className="form-field">
                      <label htmlFor="role">Role <span className="required">*</span></label>
                      <select id="role" name="role" value={formData.role} onChange={handleFormChange} className="form-input">
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="placement">Placement Officer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="dept">Department <span className="required">*</span></label>
                      <select id="dept" name="dept" value={formData.dept} onChange={handleFormChange} className="form-input">
                        <option value="CSE">Computer Science & Engineering</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="MECH">Mechanical Engineering</option>
                        <option value="CIVIL">Civil Engineering</option>
                        <option value="MBA">Master of Business Admin</option>
                        <option value="HR">Human Resources</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="status">Status <span className="required">*</span></label>
                      <select id="status" name="status" value={formData.status} onChange={handleFormChange} className="form-input">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending Approval</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={() => setAddUserModal(false)}>Cancel</button>
                    <button className="btn btn-solid" onClick={handleAddUser}>Add User</button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}