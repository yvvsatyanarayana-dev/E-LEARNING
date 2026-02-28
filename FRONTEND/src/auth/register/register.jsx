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

  const roles = [
    { key: "student", name: "Student", desc: "Track my progress" },
    { key: "faculty", name: "Faculty", desc: "Manage courses" },
    { key: "placement", name: "Placement", desc: "Officer access" },
    { key: "admin", name: "Admin", desc: "Institution setup" },
  ];

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
        <h3 className="modal-title">Create your account.</h3>
        <p className="modal-sub">Join your institution on Smart Campus.</p>
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
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className="form-input" type="text" placeholder="Arjun" />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-input" type="text" placeholder="Ravi" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Institutional Email</label>
          <input className="form-input" type="email" placeholder="you@university.edu" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Create a strong password" />
        </div>
        <button
          className="btn btn-solid btn-full ripple-host"
          onClick={addRipple}
          style={{ fontSize: 14, padding: 13 }}
        >
          Create Account
        </button>
        <div className="modal-footer-txt">
          Already have an account? <span onClick={onGoLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}