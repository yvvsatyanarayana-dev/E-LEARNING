// facultySettings.jsx
import { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";
import "./facultySettings.css";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoChevL   = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoBell    = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoLock    = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoEye     = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff  = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoPalette = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125 0-.921.75-1.671 1.672-1.671H16c2.762 0 5-2.239 5-5 0-4.418-4.03-8-9-8z"/></svg>;
const IcoGlobe   = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IcoShield  = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoBrain   = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoSave    = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoTrash   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoMoon    = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IcoSun     = (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;

// ─── TOGGLE ──────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      className={`fs-toggle ${value ? "on" : ""}`}
      onClick={() => onChange(!value)}
      aria-label="Toggle"
    >
      <div className="fs-toggle-knob" />
    </button>
  );
}

// ─── INPUT ───────────────────────────────────────────────────────
function Input({ label, value, onChange, type = "text", hint }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className="fs-field">
      <label className="fs-label">{label}</label>
      <div className="fs-input-wrap">
        <input
          className="fs-input"
          type={isPass && !show ? "password" : "text"}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {isPass && (
          <button className="fs-input-icon" onClick={() => setShow(s => !s)} type="button">
            {show ? <IcoEyeOff /> : <IcoEye />}
          </button>
        )}
      </div>
      {hint && <div className="fs-hint">{hint}</div>}
    </div>
  );
}

// ─── SELECT ──────────────────────────────────────────────────────
function Select({ label, value, onChange, options }) {
  return (
    <div className="fs-field">
      <label className="fs-label">{label}</label>
      <select className="fs-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── SECTION ─────────────────────────────────────────────────────
function Section({ icon, title, color, children }) {
  return (
    <div className="fs-section">
      <div className="fs-section-hd">
        <span className="fs-section-ic" style={{ background: color + "18", color }}>{icon}</span>
        <span className="fs-section-title">{title}</span>
      </div>
      <div className="fs-section-body">{children}</div>
    </div>
  );
}

// ─── ROW ─────────────────────────────────────────────────────────
function Row({ label, desc, children }) {
  return (
    <div className="fs-row">
      <div className="fs-row-info">
        <div className="fs-row-label">{label}</div>
        {desc && <div className="fs-row-desc">{desc}</div>}
      </div>
      <div className="fs-row-ctrl">{children}</div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────
export default function FacultySettings({ onBack }) {
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Unified settings state
  const [notif, setNotif] = useState({
    submissionAlerts: true, attendanceReminders: true, quizResults: true,
    studentMessages: false, weeklyDigest: true, systemUpdates: false,
    emailNotif: true, pushNotif: true, smsNotif: false,
  });

  const [appearance, setAppearance] = useState({
    theme: "dark", accentColor: "indigo", density: "comfortable",
    fontSize: "medium", animations: true, sidebarCollapsed: false,
  });

  const [account, setAccount] = useState({
    displayName: "", email: "", phone: "",
    department: "cse", language: "en", timezone: "asia_kolkata",
  });

  const [security, setSecurity] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
    twoFactor: true, sessionTimeout: "30", loginAlerts: true,
  });

  const [ai, setAi] = useState({
    aiAssistant: true, autoSuggest: true, dataAnalysis: true,
    gradeAssist: false, aiLanguage: "en", aiPersonality: "professional",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/faculty/settings");
        if (res.notifications) setNotif(res.notifications);
        if (res.appearance)    setAppearance(res.appearance);
        if (res.account) {
          setAccount({
            displayName: res.account.displayName || "",
            email: res.account.email || "",
            phone: res.account.phone || "",
            avatar: res.account.avatar || "",
            department: res.account.department || "cse",
            language: res.account.language || "en",
            timezone: res.account.timezone || "asia_kolkata",
          });
        }
        if (res.ai)            setAi(res.ai);
      } catch (err) {
        console.error("Failed to fetch faculty settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const TABS = [
    { id: "account",       icon: <IcoGlobe />,   label: "Account",       color: "var(--teal)"     },
    { id: "notifications", icon: <IcoBell />,    label: "Notifications", color: "var(--rose)"     },
    { id: "appearance",    icon: <IcoPalette />, label: "Appearance",    color: "var(--violet)"   },
    { id: "security",      icon: <IcoLock />,    label: "Security",      color: "var(--amber)"    },
    { id: "ai",            icon: <IcoBrain />,   label: "AI Preferences",color: "var(--indigo-ll)"},
  ];

  const ACCENT_COLORS = [
    { id: "indigo", color: "#5b4ef8" },
    { id: "teal",   color: "#27c9b0" },
    { id: "violet", color: "#9f7aea" },
    { id: "amber",  color: "#f4a535" },
    { id: "rose",   color: "#f2445c" },
  ];

  const handleSave = async () => {
    try {
      const update = { notifications: notif, appearance, account, ai };
      await api.put("/faculty/settings", update);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      console.error("Failed to save faculty settings:", err);
      alert("Failed to save settings. Please try again.");
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Pass the file object directly to api.upload
      const res = await api.upload("/auth/upload", file);
      if (res && res.url) {
        setAccount(prev => ({ ...prev, avatar: res.url }));
        // Automatically save the new avatar to the backend
        const updatedAccount = { ...account, avatar: res.url };
        await api.put("/faculty/settings", { 
          notifications: notif, 
          appearance, 
          ai,
          account: updatedAccount 
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
      }
    } catch (err) {
      console.error("Photo upload failed", err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading settings...</div>;

  return (
    <div className="fs-root">
      {/* ── TOPBAR ── */}
      <div className="fs-topbar">
        <button className="fs-back-btn" onClick={onBack}><IcoChevL /> Back to Dashboard</button>
        <div className="fs-topbar-right">
          {saved && <div className="fs-saved-toast"><IcoCheck /> Saved!</div>}
          <button className="fs-save-btn" onClick={handleSave}><IcoSave /> Save Changes</button>
        </div>
      </div>

      {/* ── HEADER ── */}
      <div className="fs-header">
        <div className="fs-header-icon"><IcoShield style={{ width: 24, height: 24 }} /></div>
        <div>
          <div className="fs-header-title">Settings</div>
          <div className="fs-header-sub">Manage your preferences, notifications, security, and AI behaviour.</div>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="fs-layout">

        {/* Sidebar Tabs */}
        <div className="fs-tab-sidebar">
          {TABS.map(t => (
            <button key={t.id} className={`fs-tab-btn ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
              style={activeTab === t.id ? { "--tab-color": t.color } : {}}>
              <span className="fs-tab-ic" style={{ color: activeTab === t.id ? t.color : "var(--text3)" }}>{t.icon}</span>
              <span className="fs-tab-lbl">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="fs-content">

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="fs-sections">
              <Section icon={<IcoBell />} title="Course Notifications" color="var(--rose)">
                <Row label="Assignment Submissions" desc="Get notified when students submit assignments">
                  <Toggle value={notif.submissionAlerts} onChange={v => setNotif(n => ({ ...n, submissionAlerts: v }))} />
                </Row>
                <Row label="Attendance Reminders" desc="Reminders to mark attendance for your classes">
                  <Toggle value={notif.attendanceReminders} onChange={v => setNotif(n => ({ ...n, attendanceReminders: v }))} />
                </Row>
                <Row label="Quiz Results Ready" desc="Alert when all quiz submissions are in">
                  <Toggle value={notif.quizResults} onChange={v => setNotif(n => ({ ...n, quizResults: v }))} />
                </Row>
                <Row label="Student Messages" desc="Direct messages from students">
                  <Toggle value={notif.studentMessages} onChange={v => setNotif(n => ({ ...n, studentMessages: v }))} />
                </Row>
              </Section>
              <Section icon={<IcoGlobe />} title="Digest & System" color="var(--teal)">
                <Row label="Weekly Digest" desc="Summary of all activity every Monday">
                  <Toggle value={notif.weeklyDigest} onChange={v => setNotif(n => ({ ...n, weeklyDigest: v }))} />
                </Row>
                <Row label="System Updates" desc="Platform maintenance and feature announcements">
                  <Toggle value={notif.systemUpdates} onChange={v => setNotif(n => ({ ...n, systemUpdates: v }))} />
                </Row>
              </Section>
              <Section icon={<IcoShield />} title="Delivery Channels" color="var(--violet)">
                <Row label="Email Notifications" desc="Send alerts to your registered email">
                  <Toggle value={notif.emailNotif} onChange={v => setNotif(n => ({ ...n, emailNotif: v }))} />
                </Row>
                <Row label="Push Notifications" desc="Browser and mobile push alerts">
                  <Toggle value={notif.pushNotif} onChange={v => setNotif(n => ({ ...n, pushNotif: v }))} />
                </Row>
                <Row label="SMS Notifications" desc="Text alerts for urgent items only">
                  <Toggle value={notif.smsNotif} onChange={v => setNotif(n => ({ ...n, smsNotif: v }))} />
                </Row>
              </Section>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="fs-sections">
              <Section icon={<IcoPalette />} title="Theme" color="var(--violet)">
                <Row label="Color Theme" desc="Choose your preferred interface theme">
                  <div className="fs-theme-btns">
                    {[["dark", <IcoMoon />], ["light", <IcoSun />]].map(([id, ico]) => (
                      <button key={id} className={`fs-theme-btn ${appearance.theme === id ? "active" : ""}`}
                        onClick={() => setAppearance(a => ({ ...a, theme: id }))}>
                        {ico} {id.charAt(0).toUpperCase() + id.slice(1)}
                      </button>
                    ))}
                  </div>
                </Row>
                <Row label="Accent Color" desc="Primary color used across the interface">
                  <div className="fs-color-row">
                    {ACCENT_COLORS.map(c => (
                      <button key={c.id} className={`fs-color-dot ${appearance.accentColor === c.id ? "active" : ""}`}
                        style={{ background: c.color, "--dot-color": c.color }}
                        onClick={() => setAppearance(a => ({ ...a, accentColor: c.id }))}>
                        {appearance.accentColor === c.id && <IcoCheck style={{ color: "#fff" }} />}
                      </button>
                    ))}
                  </div>
                </Row>
              </Section>
              <Section icon={<IcoGlobe />} title="Layout & Density" color="var(--teal)">
                <Row label="UI Density">
                  <div className="fs-seg-group">
                    {["compact", "comfortable", "spacious"].map(d => (
                      <button key={d} className={`fs-seg-btn ${appearance.density === d ? "active" : ""}`}
                        onClick={() => setAppearance(a => ({ ...a, density: d }))}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </Row>
                <Row label="Font Size">
                  <div className="fs-seg-group">
                    {["small", "medium", "large"].map(s => (
                      <button key={s} className={`fs-seg-btn ${appearance.fontSize === s ? "active" : ""}`}
                        onClick={() => setAppearance(a => ({ ...a, fontSize: s }))}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </Row>
                <Row label="Animations" desc="Smooth transitions and micro-interactions">
                  <Toggle value={appearance.animations} onChange={v => setAppearance(a => ({ ...a, animations: v }))} />
                </Row>
                <Row label="Collapsed Sidebar" desc="Keep sidebar minimised by default">
                  <Toggle value={appearance.sidebarCollapsed} onChange={v => setAppearance(a => ({ ...a, sidebarCollapsed: v }))} />
                </Row>
              </Section>
            </div>
          )}

          {/* ACCOUNT */}
          {activeTab === "account" && (
            <div className="fs-sections">
              <Section icon={<IcoGlobe />} title="Profile Photo" color="var(--indigo-ll)">
                <div className="fs-profile-photo-row">
                  <div className="fs-avatar-preview">
                    {account.avatar ? (
                      <img src={account.avatar} alt="Avatar" />
                    ) : (
                      <div className="fs-avatar-placeholder">
                        {account.displayName ? account.displayName.split(" ").map(x => x[0]).join("") : "FP"}
                      </div>
                    )}
                  </div>
                  <div className="fs-photo-ctrls">
                    <button 
                      className="fs-btn-solid" 
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Change Photo"}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: "none" }} 
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    <div className="fs-photo-hint">JPG, PNG or GIF.</div>
                  </div>
                </div>
              </Section>
              <Section icon={<IcoGlobe />} title="Personal Information" color="var(--teal)">
                <div className="fs-fields-grid">
                  <Input label="Display Name"    value={account.displayName}  onChange={v => setAccount(a => ({ ...a, displayName: v }))} />
                  <Input label="Email Address"   value={account.email}        onChange={v => setAccount(a => ({ ...a, email: v }))} />
                  <Input label="Phone Number"    value={account.phone}        onChange={v => setAccount(a => ({ ...a, phone: v }))} />
                  <Select label="Department" value={account.department} onChange={v => setAccount(a => ({ ...a, department: v }))}
                    options={[{ value: "cse", label: "Computer Science & Engineering" }, { value: "ece", label: "Electronics & Communication" }, { value: "mech", label: "Mechanical Engineering" }]} />
                </div>
              </Section>
              <Section icon={<IcoGlobe />} title="Locale & Region" color="var(--indigo-ll)">
                <div className="fs-fields-grid">
                  <Select label="Language" value={account.language} onChange={v => setAccount(a => ({ ...a, language: v }))}
                    options={[{ value: "en", label: "English (US)" }, { value: "en-in", label: "English (India)" }, { value: "hi", label: "Hindi" }]} />
                  <Select label="Time Zone" value={account.timezone} onChange={v => setAccount(a => ({ ...a, timezone: v }))}
                    options={[{ value: "asia_kolkata", label: "Asia/Kolkata (IST +5:30)" }, { value: "utc", label: "UTC +0:00" }, { value: "asia_dubai", label: "Asia/Dubai (GST +4:00)" }]} />
                </div>
              </Section>
              <Section icon={<IcoTrash />} title="Danger Zone" color="var(--rose)">
                <Row label="Delete Account" desc="Permanently remove your account and all associated data. This cannot be undone.">
                  <button className="fs-danger-btn"><IcoTrash /> Delete Account</button>
                </Row>
              </Section>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div className="fs-sections">
              <Section icon={<IcoLock />} title="Change Password" color="var(--amber)">
                <div className="fs-fields-col">
                  <Input label="Current Password"  value={security.currentPassword} onChange={v => setSecurity(s => ({ ...s, currentPassword: v }))} type="password" />
                  <Input label="New Password"       value={security.newPassword}     onChange={v => setSecurity(s => ({ ...s, newPassword: v }))}     type="password"
                    hint="Minimum 8 characters with at least one uppercase, one number, and one symbol." />
                  <Input label="Confirm Password"  value={security.confirmPassword} onChange={v => setSecurity(s => ({ ...s, confirmPassword: v }))} type="password" />
                  <button className="fs-btn-solid" onClick={handleSave}><IcoSave /> Update Password</button>
                </div>
              </Section>
              <Section icon={<IcoShield />} title="Two-Factor Authentication" color="var(--teal)">
                <Row label="Enable 2FA" desc="Protect your account with a one-time code sent to your phone.">
                  <Toggle value={security.twoFactor} onChange={v => setSecurity(s => ({ ...s, twoFactor: v }))} />
                </Row>
                <Row label="Login Alerts" desc="Email alert when a new device logs into your account.">
                  <Toggle value={security.loginAlerts} onChange={v => setSecurity(s => ({ ...s, loginAlerts: v }))} />
                </Row>
              </Section>
              <Section icon={<IcoGlobe />} title="Session" color="var(--violet)">
                <Row label="Session Timeout" desc="Automatically log out after inactivity (minutes).">
                  <Select label="" value={security.sessionTimeout} onChange={v => setSecurity(s => ({ ...s, sessionTimeout: v }))}
                    options={[{ value: "15", label: "15 min" }, { value: "30", label: "30 min" }, { value: "60", label: "1 hour" }, { value: "never", label: "Never" }]} />
                </Row>
                <Row label="Active Sessions" desc="You are currently logged in on 1 device.">
                  <button className="fs-danger-btn">Revoke All</button>
                </Row>
              </Section>
            </div>
          )}

          {/* AI */}
          {activeTab === "ai" && (
            <div className="fs-sections">
              <Section icon={<IcoBrain />} title="AI Features" color="var(--indigo-ll)">
                <Row label="AI Assistant" desc="Enable Lucyna AI assistant across your dashboard">
                  <Toggle value={ai.aiAssistant} onChange={v => setAi(a => ({ ...a, aiAssistant: v }))} />
                </Row>
                <Row label="Auto-Suggest Quizzes" desc="AI automatically suggests quiz topics based on weak areas">
                  <Toggle value={ai.autoSuggest} onChange={v => setAi(a => ({ ...a, autoSuggest: v }))} />
                </Row>
                <Row label="Student Data Analysis" desc="AI analyses student performance trends and flags at-risk students">
                  <Toggle value={ai.dataAnalysis} onChange={v => setAi(a => ({ ...a, dataAnalysis: v }))} />
                </Row>
                <Row label="AI Grade Assistance" desc="Get AI-suggested scores for subjective assignments (manual override always available)">
                  <Toggle value={ai.gradeAssist} onChange={v => setAi(a => ({ ...a, gradeAssist: v }))} />
                </Row>
              </Section>
              <Section icon={<IcoGlobe />} title="AI Behaviour" color="var(--teal)">
                <Row label="Response Language">
                  <Select label="" value={ai.aiLanguage} onChange={v => setAi(a => ({ ...a, aiLanguage: v }))}
                    options={[{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }, { value: "te", label: "Telugu" }]} />
                </Row>
                <Row label="Personality Mode" desc="How Lucyna communicates with you">
                  <div className="fs-seg-group">
                    {["concise", "professional", "detailed"].map(m => (
                      <button key={m} className={`fs-seg-btn ${ai.aiPersonality === m ? "active" : ""}`}
                        onClick={() => setAi(a => ({ ...a, aiPersonality: m }))}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                </Row>
              </Section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}