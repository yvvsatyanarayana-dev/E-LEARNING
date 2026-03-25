// AdminProfile.jsx — SMART CAMPUS Admin Panel
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../utils/api";
import "../adminSettings/adminSettings.css";
import "./AdminProfile.css";

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
  shield:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  zap:<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  layers:<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  check:<><polyline points="20 6 9 17 4 12"/></>,
  refresh:<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  briefcase:<><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  download:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  lock:<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  userPlus:<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
  mail:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  activity:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
};
const I = ({ n, size = 16 }) => <Icon size={size} d={icons[n]} />;

function buildNav(navBadges = {}) {
  return [
    { section:"Overview", items:[
      { id:"dashboard", label:"Dashboard",       icon:"grid",      routePath:"",               badge:null },
      { id:"analytics", label:"Analytics",       icon:"bar",       routePath:"analytics",      badge:null },
    ]},
    { section:"Management", items:[
      { id:"users",       label:"User Management", icon:"users",     routePath:"users",          badge:null },
      { id:"courses",     label:"Courses",         icon:"book",      routePath:"courses",        badge:null },
      { id:"departments", label:"Departments",     icon:"layers",    routePath:"departments",    badge:null },
      { id:"placement",   label:"Placement",       icon:"briefcase", routePath:"placements",     badge:null, badgeType:"teal" },
    ]},
    { section:"Platform", items:[
      { id:"reports",   label:"Reports",      icon:"download", routePath:"reports",   badge:null },
      { id:"activity",  label:"Activity Log", icon:"activity", routePath:"auditlogs", badge:null, badgeType:"rose" },
      { id:"mail",      label:"Mail System",  icon:"mail",     routePath:"mail",      badge:navBadges.mail || 0, badgeType:"teal" },
      { id:"security",  label:"Security",     icon:"shield",   routePath:"security",  badge:null },
      { id:"settings",  label:"Profile",      icon:"user",     routePath:"settings",  badge:null },
    ]},
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

export default function AdminProfile() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [sidebarOpen, setSidebar] = useState(false);
  const [profile, setProfile] = useState({ name:"", email:"", role:"", department:"", phone:"", joined:"" });
  const [form, setForm] = useState({ name:"", email:"", department:"" });
  const [pwdForm, setPwdForm] = useState({ old_password:"", new_password:"", confirm_password:"" });
  const [navBadges, setNavBadges] = useState({});
  const [configStats, setConfigStats] = useState({ uptime:"99.9%", cpu:"0%", memory:"0%" });
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [pwdMsg, setPwdMsg]   = useState("");
  const [savePwdLoading, setSavePwdLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const pageRef       = useRef(null);
  const cursorRef     = useRef(null);
  const cursorRingRef = useRef(null);
  const active = getActiveId(location.pathname);
  const now    = new Date().toLocaleDateString();

  const NAV = buildNav(navBadges);

  const fetchMailCount = async () => {
    try {
      const res = await api.get("/mail/unread/count");
      setNavBadges(prev => ({ ...prev, mail: res.count || 0 }));
    } catch (err) { console.error("Failed to poll mail count", err); }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, nb] = await Promise.all([
        api.get("/admin/profile"),
        api.get("/admin/config/stats"),
        api.get("/admin/config/badges"),
      ]);
      setProfile(pRes);
      setForm({ name: pRes.name, email: pRes.email, department: pRes.department || "" });
      setConfigStats(cRes);
      setNavBadges(nb);
    } catch (err) {
      console.error("Failed to fetch profile data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchMailCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cursor animation
  useEffect(() => {
    const cursor = cursorRef.current; const cursorRing = cursorRingRef.current;
    if (!cursor || !cursorRing) return;
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    const onMove = (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (cursor) { cursor.style.opacity = "1"; cursor.style.transform = `translate(${mouseX}px,${mouseY}px)`; }
      if (cursorRing) { cursorRing.style.opacity = "1"; cursorRing.style.transform = `translate(${mouseX}px,${mouseY}px)`; }
    };
    let raf;
    const animate = () => { ringX += (mouseX - ringX) * 0.12; ringY += (mouseY - ringY) * 0.12; cursorRing.style.transform = `translate(${ringX}px,${ringY}px)`; raf = requestAnimationFrame(animate); };
    window.addEventListener("mousemove", onMove); raf = requestAnimationFrame(animate);
    const handleHover = () => document.querySelector(".admin-profile-page")?.classList.add("c-hover");
    const handleUnhover = () => document.querySelector(".admin-profile-page")?.classList.remove("c-hover");
    const handleClick = () => { const p = document.querySelector(".admin-profile-page"); p?.classList.add("c-click"); setTimeout(() => p?.classList.remove("c-click"), 200); };
    const interactive = document.querySelectorAll("button, a, input, .stat-card");
    interactive.forEach(el => { el.addEventListener("mouseenter", handleHover); el.addEventListener("mouseleave", handleUnhover); });
    window.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf);
      interactive.forEach(el => { el.removeEventListener("mouseenter", handleHover); el.removeEventListener("mouseleave", handleUnhover); });
      window.removeEventListener("mousedown", handleClick);
    };
  }, [loading]);

  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      await api.put("/admin/profile", form);
      setSaveMsg("✓ Profile updated successfully!");
      setProfile(prev => ({ ...prev, name: form.name, email: form.email, department: form.department }));
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg("✗ " + (err?.response?.data?.detail || "Failed to save profile"));
      setTimeout(() => setSaveMsg(""), 4000);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setSavePwdLoading(true);
      await api.post("/admin/profile/password", pwdForm);
      setPwdMsg("✓ Password changed successfully!");
      setPwdForm({ old_password:"", new_password:"", confirm_password:"" });
      setTimeout(() => setPwdMsg(""), 3000);
    } catch (err) {
      setPwdMsg("✗ " + (err?.response?.data?.detail || "Failed to change password"));
      setTimeout(() => setPwdMsg(""), 4000);
    } finally {
      setSavePwdLoading(false);
    }
  };

  const initials = profile.name ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "SA";

  return (
    <>
      <div className="sc-cursor" ref={cursorRef} />
      <div className="sc-cursor-ring" ref={cursorRingRef} />
      <div className="sc-noise" />
      <div className="admin-profile-page app" ref={pageRef}>
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
            <div className="sb-avatar">{initials}</div>
            <div><div className="sb-uname">{profile.name || "Super Admin"}</div><div className="sb-urole">System Administrator</div></div>
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
                { n:"Uptime", v:configStats.uptime },
                { n:"CPU",    v:configStats.cpu },
                { n:"Memory", v:configStats.memory }
              ].map(item => (
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
            <span className="tb-page">Profile</span>
            <div className="tb-sep" />
            <div className="tb-search"><I n="search" size={14} /><input placeholder="Search users, courses…" /></div>
            <div className="tb-right">
              <span className="tb-role-tag">Admin</span>
              <span className="tb-date">{now}</span>
              <button onClick={fetchData} className="tb-icon-btn tooltip" data-tip="Refresh"><I n="refresh" size={15} /></button>
              <button onClick={() => navigate("/admindashboard/notifications")} className="tb-icon-btn tooltip" data-tip="Notifications">
                <I n="bell" size={15} /><span className="notif-dot" />
              </button>
              <button className="tb-icon-btn tooltip" data-tip="Profile" onClick={() => navigate("/admindashboard/settings")}><I n="user" size={15} /></button>
            </div>
          </header>

          <main className="content">
            {/* ── GREETING ── */}
            <div className="greet-row">
              <div className="greet-tag"><div className="greet-pip" /><span className="greet-pip-txt">Admin Profile</span></div>
              <h1 className="greet-title">Your <em>Profile.</em></h1>
              <p className="greet-sub">Manage your personal information and account security</p>
            </div>

            {/* ── PROFILE HERO ── */}
            <div className="profile-hero">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">{initials}</div>
                <div className="profile-avatar-ring" />
              </div>
              <div className="profile-meta">
                <div className="profile-name">{profile.name || "—"}</div>
                <div className="profile-role">System Administrator</div>
                <div className="profile-tags">
                  <span className="profile-tag indigo">{profile.role || "admin"}</span>
                  {profile.department && <span className="profile-tag teal">{profile.department}</span>}
                  <span className="profile-tag amber">Member since {profile.joined}</span>
                </div>
              </div>
              <div className="profile-stats">
                {[
                  { lbl:"Total Users", val:"-", icon:"users" },
                  { lbl:"Joined",      val:profile.joined?.split(" ")[2] || "-", icon:"check" },
                  { lbl:"Status",      val:profile.is_active ? "Active" : "Inactive", icon:"zap" },
                ].map((s,i) => (
                  <div key={i} className="profile-stat">
                    <I n={s.icon} size={15} />
                    <div className="ps-val">{s.val}</div>
                    <div className="ps-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── TWO COLUMNS ── */}
            <div className="profile-grid">

              {/* Edit Info */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="edit" size={15} /> Personal Information</div>
                </div>
                <div className="panel-body">
                  {loading ? (
                    <div style={{ color:"var(--text3)", textAlign:"center", padding:"20px" }}>Loading profile…</div>
                  ) : (
                    <>
                      {[
                        { label:"Full Name",   key:"name",       type:"text",   placeholder:"e.g. Super Admin" },
                        { label:"Email Address",key:"email",     type:"email",  placeholder:"admin@smartcampus.edu" },
                        { label:"Department",  key:"department", type:"text",   placeholder:"e.g. Admin" },
                      ].map(f => (
                        <div key={f.key} className="pf-field">
                          <label className="pf-label">{f.label}</label>
                          <input
                            type={f.type}
                            className="filter-input"
                            style={{ width:"100%" }}
                            value={form[f.key] || ""}
                            placeholder={f.placeholder}
                            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          />
                        </div>
                      ))}
                      {saveMsg && (
                        <div className={`pf-msg ${saveMsg.startsWith("✓") ? "pf-ok" : "pf-err"}`}>{saveMsg}</div>
                      )}
                      <button
                        onClick={handleSaveProfile}
                        disabled={saveLoading}
                        className="btn btn-solid"
                        style={{ width:"100%", marginTop:"8px", justifyContent:"center" }}
                      >
                        {saveLoading ? "Saving…" : <><I n="check" size={14} /> Save Changes</>}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Change Password */}
              <div className="panel">
                <div className="panel-hd">
                  <div className="panel-ttl"><I n="lock" size={15} /> Change Password</div>
                </div>
                <div className="panel-body">
                  {[
                    { label:"Current Password",  key:"old_password",     placeholder:"Enter current password" },
                    { label:"New Password",       key:"new_password",     placeholder:"Min 6 characters" },
                    { label:"Confirm Password",   key:"confirm_password", placeholder:"Re-enter new password" },
                  ].map(f => (
                    <div key={f.key} className="pf-field">
                      <label className="pf-label">{f.label}</label>
                      <input
                        type="password"
                        className="filter-input"
                        style={{ width:"100%" }}
                        value={pwdForm[f.key]}
                        placeholder={f.placeholder}
                        onChange={e => setPwdForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  {pwdMsg && (
                    <div className={`pf-msg ${pwdMsg.startsWith("✓") ? "pf-ok" : "pf-err"}`}>{pwdMsg}</div>
                  )}
                  <div className="pwd-rules">
                    <span>✓ At least 6 characters</span>
                    <span>✓ Both fields must match</span>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={savePwdLoading}
                    className="btn btn-solid"
                    style={{ width:"100%", marginTop:"8px", justifyContent:"center", background:"var(--rose)", boxShadow:"0 0 20px rgba(242,68,92,.3)" }}
                  >
                    {savePwdLoading ? "Updating…" : <><I n="lock" size={14} /> Update Password</>}
                  </button>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}
