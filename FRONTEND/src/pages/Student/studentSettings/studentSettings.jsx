// studentSettings.jsx
import { useState, useEffect, useRef } from "react";
import "./studentSettings.css";

const IcoBack    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoUser    = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>;
const IcoBell    = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoLock    = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoPalette = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;
const IcoShield  = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoEye     = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff  = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoGlobe   = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IcoTrash   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoLogout  = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

function Toggle({ value, onChange }) {
  return (
    <button className={`st-toggle ${value ? "on" : ""}`} onClick={() => onChange(!value)}>
      <span className="st-toggle-knob" />
    </button>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="st-section">
      <div className="st-section-hd">
        <span className="st-section-ico">{icon}</span>
        <span className="st-section-ttl">{title}</span>
      </div>
      <div className="st-section-body">{children}</div>
    </div>
  );
}

function Row({ label, sub, children, danger }) {
  return (
    <div className={`st-row ${danger ? "danger" : ""}`}>
      <div className="st-row-left">
        <div className="st-row-label">{label}</div>
        {sub && <div className="st-row-sub">{sub}</div>}
      </div>
      <div className="st-row-right">{children}</div>
    </div>
  );
}

export default function StudentSettings({ onBack }) {
  const [user, setUser]         = useState(null);
  const [formData, setFormData] = useState({});
  const [notif, setNotif]       = useState({ assignments: true, quizzes: true, announcements: true, placements: true, studyGroups: false, newsletter: false });
  const [privacy, setPrivacy]   = useState({ profileVisible: true, showCGPA: false, showAttendance: false });
  const [theme, setTheme]       = useState("dark");
  const [accent, setAccent]     = useState("indigo");
  const [fontSize, setFontSize] = useState("medium");
  const [showPass, setShowPass] = useState(false);
  const [twoFa, setTwoFa]       = useState(false);
  const [saved, setSaved]       = useState(false);
  const [passData, setPassData] = useState({ old_password: "", new_password: "", confirm: "" });
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState("account");
  const [sessions, setSessions] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    import("../../../utils/api").then(({ default: api }) => {
      api.get("/auth/me").then(u => {
        setUser(u);
        setFormData({
          full_name: u.full_name || "",
          phone_number: u.phone_number || "",
          bio: u.bio || ""
        });
      }).catch(console.error);

      api.get("/auth/sessions").then(data => {
        setSessions(Array.isArray(data) ? data : []);
      }).catch(() => setSessions([]));
    });
  }, []);

  const SECTIONS = [
    { id: "account",       label: "Account",       icon: <IcoUser /> },
    { id: "notifications", label: "Notifications", icon: <IcoBell /> },
    { id: "privacy",       label: "Privacy",       icon: <IcoShield /> },
    { id: "appearance",    label: "Appearance",    icon: <IcoPalette /> },
    { id: "security",      label: "Security",      icon: <IcoLock /> },
  ];

  const ACCENTS = [
    { id: "indigo", color: "#7b6ffa" }, { id: "teal",   color: "#27c9b0" },
    { id: "rose",   color: "#f2445c" }, { id: "amber",  color: "#f4a535" },
    { id: "violet", color: "#9f7aea" },
  ];

  const handleSave = async () => {
    try {
      const api = (await import("../../../utils/api")).default;
      await api.patch("/student/profile", formData);
      setSaved(true); 
      setTimeout(() => setSaved(false), 2200);
    } catch(err) {
      console.error("Save failed", err);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const api = (await import("../../../utils/api")).default;
      const res = await api.upload("/auth/upload", file);
      
      const avatarUrl = res.url;
      await api.patch("/student/profile", { avatar: avatarUrl });
      
      setUser(prev => ({ ...prev, avatar: avatarUrl }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Photo upload failed", err);
    }
  };

  const handlePasswordUpdate = async () => {
    setPassError("");
    setPassSuccess(false);
    if (!passData.old_password || !passData.new_password) return setPassError("Fill all fields");
    if (passData.new_password !== passData.confirm) return setPassError("Passwords don't match");
    if (passData.new_password.length < 8) return setPassError("Min 8 characters required");

    try {
      const api = (await import("../../../utils/api")).default;
      await api.patch("/auth/change-password", {
        old_password: passData.old_password,
        new_password: passData.new_password
      });
      setPassSuccess(true);
      setPassData({ old_password: "", new_password: "", confirm: "" });
    } catch (err) {
      setPassError(err.response?.data?.detail || "Update failed");
    }
  };

  const initials = user?.full_name ? user.full_name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) : "??";

  return (
    <div className="st-root">
      <div className="st-header">
        <button className="st-back" onClick={onBack}><IcoBack /> Back</button>
        <div>
          <div className="st-breadcrumb">Account · Settings</div>
          <h1 className="st-title">Settings</h1>
        </div>
        <button className={`st-save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
          {saved ? <><IcoCheck /> Saved!</> : "Save Changes"}
        </button>
      </div>

      <div className="st-layout">
        <nav className="st-nav">
          {SECTIONS.map(s => (
            <button key={s.id} className={`st-nav-item ${activeSection === s.id ? "active" : ""}`} onClick={() => setActiveSection(s.id)}>
              <span className="st-nav-ico">{s.icon}</span>{s.label}
            </button>
          ))}
          <div className="st-nav-divider" />
          <button className="st-nav-item danger" onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}>
            <span className="st-nav-ico"><IcoLogout /></span>Sign Out
          </button>
        </nav>

        <div className="st-content">
          {activeSection === "account" && (<>
            <Section icon={<IcoUser />} title="Account Information">
              <div className="st-avatar-row">
                <div className="st-avatar-big">
                  {user?.avatar ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} /> : initials}
                </div>
                <div className="st-avatar-info">
                  <div className="st-avatar-name">{user?.full_name || "Student"}</div>
                  <div className="st-avatar-meta">Student · {user?.email || ""}</div>
                  <button className="st-link-btn" onClick={() => fileInputRef.current?.click()}>Change photo</button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                    accept="image/*" 
                    onChange={handlePhotoChange} 
                  />
                </div>
              </div>
              <Row label="Full Name" sub="Your display name across the platform">
                <input className="st-input" value={formData.full_name || ""} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </Row>
              <Row label="Email Address" sub="Used for login and notifications">
                <input className="st-input" value={user?.email || ""} readOnly style={{ opacity:.5, cursor:"not-allowed" }} />
              </Row>
              <Row label="Phone Number" sub="For placement officer contact">
                <input className="st-input" value={formData.phone_number || ""} onChange={e => setFormData({...formData, phone_number: e.target.value})} placeholder="+91 98765 43210" />
              </Row>
              <Row label="Bio" sub="Shown on your public profile">
                <textarea className="st-textarea" value={formData.bio || ""} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} placeholder="Tell us about yourself..." />
              </Row>
            </Section>
            <Section icon={<IcoGlobe />} title="Language & Region">
              <Row label="Language"><select className="st-select"><option>English</option><option>Hindi</option><option>Telugu</option><option>Tamil</option></select></Row>
              <Row label="Time Zone"><select className="st-select"><option>Asia/Kolkata (IST, UTC+5:30)</option><option>UTC</option></select></Row>
              <Row label="Date Format"><select className="st-select"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></Row>
            </Section>
          </>)}

          {activeSection === "notifications" && (
            <Section icon={<IcoBell />} title="Notification Preferences">
              <div className="st-notif-intro">Choose which alerts you receive. Critical system messages are always delivered.</div>
              {[
                { key:"assignments",   label:"Assignment Deadlines",  sub:"Reminders 24h and 1h before due" },
                { key:"quizzes",       label:"Quiz Alerts",           sub:"New quizzes and upcoming tests" },
                { key:"announcements", label:"Faculty Announcements", sub:"Course updates and notices" },
                { key:"placements",    label:"Placement Drives",      sub:"New company drives and deadlines" },
                { key:"studyGroups",   label:"Study Group Activity",  sub:"New posts in groups you joined" },
                { key:"newsletter",    label:"Weekly Digest",         sub:"Summary of your week's activity" },
              ].map(item => (
                <Row key={item.key} label={item.label} sub={item.sub}>
                  <Toggle value={notif[item.key]} onChange={v => setNotif(n => ({...n,[item.key]:v}))} />
                </Row>
              ))}
            </Section>
          )}

          {activeSection === "privacy" && (
            <Section icon={<IcoShield />} title="Privacy Settings">
              <Row label="Public Profile Visibility" sub="Allow others to view your profile page"><Toggle value={privacy.profileVisible} onChange={v=>setPrivacy(p=>({...p,profileVisible:v}))} /></Row>
              <Row label="Show CGPA on Profile" sub="Visible to placement officers and faculty"><Toggle value={privacy.showCGPA} onChange={v=>setPrivacy(p=>({...p,showCGPA:v}))} /></Row>
              <Row label="Show Attendance" sub="Visible to faculty and admin"><Toggle value={privacy.showAttendance} onChange={v=>setPrivacy(p=>({...p,showAttendance:v}))} /></Row>
              <Row label="Data Usage" sub="Allow anonymised usage data for platform improvement"><Toggle value={true} onChange={()=>{}} /></Row>
              <div className="st-danger-zone">
                <div className="st-dz-title">Danger Zone</div>
                <Row label="Delete Account" sub="Permanently remove all your data. Cannot be undone." danger>
                  <button className="st-danger-btn"><IcoTrash /> Delete Account</button>
                </Row>
              </div>
            </Section>
          )}

          {activeSection === "appearance" && (
            <Section icon={<IcoPalette />} title="Appearance">
              <Row label="Theme" sub="Choose your preferred colour scheme">
                <div className="st-theme-opts">
                  {["dark","light","system"].map(t=>(
                    <button key={t} className={`st-theme-btn ${theme===t?"active":""}`} onClick={()=>setTheme(t)}>
                      {t==="dark"?"🌑":t==="light"?"☀️":"💻"} {t.charAt(0).toUpperCase()+t.slice(1)}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label="Accent Colour" sub="Primary highlight colour used across the UI">
                <div className="st-accent-opts">
                  {ACCENTS.map(a=>(
                    <button key={a.id} className={`st-accent-dot ${accent===a.id?"active":""}`} style={{background:a.color}} onClick={()=>setAccent(a.id)}>
                      {accent===a.id && <IcoCheck />}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label="Font Size" sub="Adjust text size for readability">
                <div className="st-font-opts">
                  {["small","medium","large"].map(f=>(
                    <button key={f} className={`st-font-btn ${fontSize===f?"active":""}`} onClick={()=>setFontSize(f)}>
                      {f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label="Reduced Motion" sub="Disable animations for accessibility"><Toggle value={false} onChange={()=>{}} /></Row>
              <Row label="Compact Sidebar" sub="Show icons only without labels"><Toggle value={false} onChange={()=>{}} /></Row>
            </Section>
          )}

          {activeSection === "security" && (<>
            <Section icon={<IcoLock />} title="Password">
              <Row label="Current Password">
                <div className="st-pass-wrap">
                  <input className="st-input" type={showPass?"text":"password"} value={passData.old_password} onChange={e=>setPassData({...passData, old_password:e.target.value})} placeholder="Master password" />
                  <button className="st-pass-eye" onClick={()=>setShowPass(v=>!v)}>{showPass?<IcoEyeOff/>:<IcoEye/>}</button>
                </div>
              </Row>
              <Row label="New Password"><input className="st-input" type="password" placeholder="Min 8 characters" value={passData.new_password} onChange={e=>setPassData({...passData, new_password:e.target.value})} /></Row>
              <Row label="Confirm New Password"><input className="st-input" type="password" placeholder="Re-enter new password" value={passData.confirm} onChange={e=>setPassData({...passData, confirm:e.target.value})} /></Row>
              
              {passError && <div style={{color:"var(--rose)",fontSize:11,marginLeft:20,marginTop:8}}>⚠️ {passError}</div>}
              {passSuccess && <div style={{color:"var(--teal)",fontSize:11,marginLeft:20,marginTop:8}}>✅ Password updated successfully!</div>}
              
              <div className="st-pass-rules">
                {["At least 8 characters","One uppercase letter","One number or symbol"].map(r=>(
                  <div key={r} className="st-pass-rule"><IcoCheck style={{color:"var(--teal)"}}/> {r}</div>
                ))}
              </div>
              <button className="st-btn-solid" style={{marginTop:14,marginLeft:20}} onClick={handlePasswordUpdate}>Update Password</button>
            </Section>
            <Section icon={<IcoShield />} title="Two-Factor Authentication">
              <Row label="Enable 2FA" sub="Adds a one-time code requirement on login"><Toggle value={twoFa} onChange={setTwoFa} /></Row>
              {twoFa && (
                <div className="st-2fa-hint">
                  Scan the QR code in Google Authenticator or any TOTP app. Each login will require the 6-digit code.
                  <div className="st-qr-mock">QR Code Placeholder</div>
                </div>
              )}
              <Row label="Active Sessions" sub="Devices currently signed in to your account">
                <button className="st-link-btn" style={{color:"var(--rose)"}}>Sign out all</button>
              </Row>
              <div className="st-session-list">
                {sessions.length === 0 && (
                  <div style={{fontSize:12,color:"var(--text3)",padding:"8px 0"}}>No active sessions found.</div>
                )}
                {sessions.map(s=>(
                  <div key={s.id || s.device} className="st-session-item">
                    <div className={`st-session-dot ${s.is_current ? "active" : ""}`} />
                    <div className="st-session-info">
                      <div className="st-session-device">{s.device || "Unknown device"}{s.is_current&&<span className="st-session-badge">This device</span>}</div>
                      <div className="st-session-meta">{s.location || "Unknown location"} · {s.time || s.last_active || "Unknown time"}</div>
                    </div>
                    {!s.is_current&&<button className="st-danger-btn" style={{padding:"4px 10px",fontSize:10}}>Revoke</button>}
                  </div>
                ))}
              </div>
            </Section>
          </>)}
        </div>
      </div>
    </div>
  );
}