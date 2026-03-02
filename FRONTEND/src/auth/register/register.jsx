import { useState, useCallback } from "react";

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
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  const roles = [
    { key: "student",           name: "Student",   desc: "Track your progress" },
    { key: "faculty",           name: "Faculty",   desc: "Manage courses" },
    { key: "placement_officer", name: "Placement", desc: "Readiness reports" },
    { key: "admin",             name: "Admin",     desc: "Full control" },
  ];

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

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          />
        </div>

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