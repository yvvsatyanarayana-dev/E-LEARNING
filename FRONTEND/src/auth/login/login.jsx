import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

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

const ROLE_REDIRECTS = {
  student:           "/studentdashboard",
  faculty:           "/facultydashboard",
  placement_officer: "/placementdashboard",
  admin:             "/admindashboard",
};

export default function LoginModal({ open, onClose, onGoSignup, onGoForgot }) {
  const addRipple = useRipple();
  const navigate  = useNavigate();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  const roles = [
    // { key: "student",           name: "Student",   desc: "Track your progress" },
    // { key: "faculty",           name: "Faculty",   desc: "Manage courses" },
    // { key: "placement_officer", name: "Placement", desc: "Readiness reports" },
    // { key: "admin",             name: "Admin",     desc: "Full control" },
  ];

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.DEV ? "http://localhost:8000" : (import.meta.env.DEV ? "http://localhost:8000" : "https://e-learning-backend-api.onrender.com")}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Login failed."); return; }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user",  JSON.stringify(data.user));

      onClose();
      navigate(ROLE_REDIRECTS[data.user.role] || "/");

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
        <button className="modal-close ripple-host"
          onClick={(e) => { addRipple(e); onClose(); }}>&#x2715;</button>

        <div className="modal-logo">
          <div className="modal-logo-mark">SC</div>
          <div className="modal-logo-txt">Smart Campus</div>
        </div>

        <h3 className="modal-title">Welcome back.</h3>
        <p className="modal-sub">Sign in to your institutional account to continue.</p>

        <div className="role-picker">
          {roles.map((r) => (
            <div key={r.key}
              className="role-opt ripple-host"
              onClick={(e) => addRipple(e)}>
              <div className="ro-name">{r.name}</div>
              <div className="ro-desc">{r.desc}</div>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Institutional Email</label>
          <input className="form-input" type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-input-wrapper">
            <input className="form-input" type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
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

        {error && <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>{error}</p>}

        <div className="form-forgot" onClick={onGoForgot}>Forgot password?</div>

        <button className="btn btn-solid btn-full ripple-host"
          style={{ fontSize: 14, padding: 13 }}
          onClick={(e) => { addRipple(e); handleLogin(); }}
          disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="modal-footer-txt">
          New to Smart Campus? <span onClick={onGoSignup}>Create an account</span>
        </div>
      </div>
    </div>
  );
}