import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../placementAnalytics/placementAnalytics.css";
import { clearAuth } from "../../../utils/auth.js";
import api from "../../../utils/api.js";
import MailSystem from "../../shared/MailSystem/MailSystem";

const SbLink = ({ active, badge, badgeCls, icon, children, to }) => (
  <Link to={to || "#"} className={`sb-link${active ? " active" : ""}`}>
    {icon}{children}
    {badge && <span className={`sb-badge${badgeCls ? ` ${badgeCls}` : ""}`}>{badge}</span>}
  </Link>
);

export default function PlacementMail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [officerName, setOfficerName] = useState("Placement Officer");
  const [dashStats, setDashStats] = useState(null);
  const [mailUnread, setMailUnread] = useState(0);





  useEffect(() => {
    const fetchBasic = async () => {
      try {
        const [me, stats, unread] = await Promise.all([
          api.get("/auth/me"),
          api.get("/placement/dashboard/stats"),
          api.get("/mail/unread/count")
        ]);
        setOfficerName(me.full_name ?? me.email ?? "Placement Officer");
        setDashStats(stats);
        setMailUnread(unread.count || 0);
      } catch (err) {
        console.error("PlacementMail fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBasic();
    const inv = setInterval(async () => {
      try {
        const res = await api.get("/mail/unread/count");
        setMailUnread(res.count || 0);
      } catch {}
    }, 30000);
    return () => clearInterval(inv);
  }, []);

  const handleLogout = () => { clearAuth(); navigate("/login", { replace: true }); };
  const officerInitials = officerName.trim().split(" ").map(w => w[0]?.toUpperCase()).join("").slice(0, 2);
  const placementRate = dashStats?.placement_rate ?? 0;

  return (
    <>

      <div className="sc-noise" />

      <div className="app">
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
              <div className="sb-uname">{loading ? "Loading…" : officerName}</div>
              <div className="sb-urole">Placement Officer</div>
            </div>
          </Link>

          <nav className="sb-nav">
            <div className="sb-sec-label">Overview</div>
            <SbLink to="/placementdashboard" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}>Dashboard</SbLink>
            <SbLink to="/placementdashboard/analytics" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>Analytics</SbLink>

            <div className="sb-sec-label">Placement</div>
            <SbLink to="/placementdashboard/students" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}>Students</SbLink>
            <SbLink to="/placementdashboard/companies" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>Companies</SbLink>
            <SbLink to="/placementdashboard/drives" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Drives</SbLink>
            <SbLink to="/placementdashboard/offers-placed" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}>Offers &amp; Placed</SbLink>
            <SbLink to="/placementdashboard/internships" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}>Internships</SbLink>

            <div className="sb-sec-label">Tools</div>
            <SbLink active to="/placementdashboard/placementMail" badge={mailUnread > 0 ? mailUnread : null} badgeCls="teal" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>Mail System</SbLink>
            <SbLink to="/placementdashboard/meetings" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}>Virtual Meeting</SbLink>
            <SbLink to="/placementdashboard/ai-assistant" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}>AI Assistant</SbLink>
            <SbLink to="/placementdashboard/reports" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>Reports</SbLink>
          </nav>

          <div className="sb-bottom">
            <div className="sb-pri">
              <div className="sb-pri-lbl">Placement Rate</div>
              <div className="sb-pri-val">{loading ? "…" : `${placementRate}%`}</div>
              <div className="sb-pri-sub">AY {dashStats?.academic_year ?? "2024–25"}</div>
              <div className="sb-pri-bar">
                <div className="sb-pri-fill" style={{ width: loading ? "0%" : `${placementRate}%`, transition: "width 1s ease" }} />
              </div>
            </div>
            <button className="sb-logout" onClick={handleLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <span className="tb-page">Mail System</span>
            <div className="tb-sep" />
            <div className="tb-right">
              <span className="tb-date">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
            </div>
          </header>

          <div className="content" style={{ padding: 0 }}>
            <MailSystem onBack={() => navigate("/placementdashboard")} />
          </div>
        </main>
      </div>
    </>
  );
}
