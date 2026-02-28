import { useCallback } from "react";

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

export default function ForgotModal({ open, onClose, onGoLogin }) {
  const addRipple = useRipple();

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
        <h3 className="modal-title">Reset your password.</h3>
        <p className="modal-sub">
          Enter your institutional email and we'll send you a link to reset your password.
        </p>
        <div className="form-group">
          <label className="form-label">Institutional Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@university.edu"
          />
        </div>
        <button
          className="btn btn-solid btn-full ripple-host"
          onClick={addRipple}
          style={{ fontSize: 14, padding: 13 }}
        >
          Send Reset Link
        </button>
        <div className="modal-footer-txt">
          Remembered your password? <span onClick={onGoLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}