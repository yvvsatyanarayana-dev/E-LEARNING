import { useState, useCallback, useEffect } from "react";

function useRipple() {
  const addRipple = useCallback((e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const x = e.clientX - r.left - size / 2;
    const y = e.clientY - r.top - size / 2;
    const rip = document.createElement("span");
    rip.className = "ripple";
    rip.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    el.appendChild(rip);
    setTimeout(() => rip.remove(), 560);
  }, []);
  return addRipple;
}

export default function RegisterModal({ open, onClose, onGoLogin }) {
  const addRipple = useRipple();
  const [selected, setSelected] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [dept, setDept]         = useState("Computer Science");
  const [targetGroup, setTargetGroup] = useState("BCA");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [metadata, setMetadata] = useState({ departments: [], groups: [] });

  useEffect(() => {
    if (open) {
      const fetchMeta = async () => {
        try {
          const res = await fetch("http://localhost:8000/api/v1/auth/metadata");
          if (res.ok) {
            const data = await res.json();
            setMetadata(data);
            if (data.departments?.length > 0) setDept(data.departments[0]);
            if (data.groups?.length > 0) setTargetGroup(data.groups[0]);
          }
        } catch (err) {
          console.error("Failed to fetch metadata:", err);
        }
      };
      fetchMeta();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      // Reset form on close
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirm("");
      setError("");
      setSuccess("");
    }
  }, [open]);

  const roles = [
    { key: "student",           name: "Student",   desc: "Track your progress" },
    { key: "faculty",           name: "Faculty",   desc: "Manage courses" },
    { key: "placement_officer", name: "Placement", desc: "Readiness reports" },
    { key: "admin",             name: "Admin",     desc: "Full control" },
  ];

  const departments = metadata.departments.map(d => ({ id: d, name: d }));

  const groups = metadata.groups.map(g => ({ id: g, name: g === "All" ? "All Students" : g }));

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!fullName || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role: selected,
          department: dept,
          target_group: targetGroup,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Registration failed.");
        return;
      }

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => {
        onGoLogin();
      }, 1500);

    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`modal-overlay${open ? " open" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <button
          className="modal-close ripple-host"
          onClick={(e) => { addRipple(e); onClose(); }}
        >
          &#x2715;
        </button>

        <div className="modal-logo">
          <div className="modal-logo-mark">SC</div>
          <div className="modal-logo-txt">Smart Campus</div>
        </div>

        <h3 className="modal-title">Create an account.</h3>
        <p className="modal-sub">Join your institution's smart campus platform.</p>

        {/* Role Picker */}
        <div className="role-picker">
          {roles.map((r) => (
            <div
              key={r.key}
              className={`role-opt ripple-host${selected === r.key ? " selected" : ""}`}
              onClick={(e) => { addRipple(e); setSelected(r.key); }}
            >
              <div className="ro-name">{r.name}</div>
              <div className="ro-desc">{r.desc}</div>
            </div>
          ))}
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Institutional Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Fields Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753M9.001 9.001l3 3m-6-3l6 6m0-3l3 3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm</label>
            <div className="password-input-wrapper">
              <input
                className="form-input"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                title={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753M9.001 9.001l3 3m-6-3l6 6m0-3l3 3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Student Specific: Dept & Group selection */}
        {selected === "student" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select 
                className="form-input" 
                value={dept} 
                onChange={(e) => setDept(e.target.value)}
                style={{ appearance: "auto" }}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Group</label>
              <select 
                className="form-input" 
                value={targetGroup} 
                onChange={(e) => setTargetGroup(e.target.value)}
                style={{ appearance: "auto" }}
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Error / Success */}
        {error   && <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>{error}</p>}
        {success && <p style={{ color: "#22c55e", fontSize: 12, marginBottom: 8 }}>{success}</p>}

        <button
          className="btn btn-solid btn-full ripple-host"
          style={{ fontSize: 14, padding: 13 }}
          onClick={(e) => { addRipple(e); handleRegister(); }}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div className="modal-footer-txt">
          Already have an account? <span onClick={onGoLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}