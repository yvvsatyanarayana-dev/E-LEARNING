import { useState, useEffect, useRef } from "react";
import { useNotifications } from "../../../utils/useNotifications";
import "./NotificationsPopup.css";

// ─── ICONS (react-icons) ───────────────────────────────────────
const IcoClose = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IcoBell = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const IcoCheck = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IcoCheckAll = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;

// ─── DATA ────────────────────────────────────────────────────────
const TABS = ["All", "Unread", "Urgent"];

// ─── COMPONENT ───────────────────────────────────────────────────
export default function NotificationsPopup({ open, onClose, anchorRef, onBack, isPage }) {
  const { notifications: notifs, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState("All");

  const popupRef = useRef();

  // Close on outside click (only for popup mode)
  useEffect(() => {
    if (!open || isPage) return;
    const h = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) onClose?.();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose, anchorRef, isPage]);

  // Escape
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        if (isPage && onBack) onBack();
        else if (open && onClose) onClose();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose, isPage, onBack]);

  const dismiss = (id) => markAsRead((id)); // Simple reuse for dismissal

  const filtered = notifs.filter(n => {
    if (activeTab === "Unread") return n.unread;
    if (activeTab === "Urgent") return n.urgent;
    return true;
  });

  const handleClose = () => {
    if (isPage && onBack) onBack();
    else if (onClose) onClose();
  };

  if (!open && !isPage) return null;

  return (
    <div className={`np-popup ${isPage ? "is-page" : ""}`} ref={popupRef}>
      {/* Arrow */}
      {!isPage && <div className="np-arrow" />}

      {/* Header */}
      <div className="np-header">
        <div className="np-header-left">
          <IcoBell style={{ color: "var(--indigo-ll)" }} />
          <span className="np-title">Notifications</span>
          {unreadCount > 0 && <span className="np-unread-pill">{unreadCount}</span>}
        </div>
        <div className="np-header-right">
          {unreadCount > 0 && (
            <button className="np-mark-all" onClick={markAllRead}>
              <IcoCheckAll /> Mark all read
            </button>
          )}
          <button className="lp-close" onClick={handleClose}><IcoClose /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="np-tabs">
        {TABS.map(t => (
          <button key={t} className={`np-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t}
            {t === "Unread" && unreadCount > 0 && <span className="np-tab-count">{unreadCount}</span>}
            {t === "Urgent" && notifs.filter(n => n.urgent).length > 0 && (
              <span className="np-tab-count urgent">{notifs.filter(n => n.urgent).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="np-list">
        {filtered.length === 0 ? (
          <div className="np-empty">
            <IcoBell style={{ width: 24, height: 24, color: "var(--text3)", marginBottom: 8 }} />
            <div style={{ fontSize: 12, color: "var(--text3)" }}>No {activeTab.toLowerCase()} notifications</div>
          </div>
        ) : (
          filtered.map(n => (
            <div
              key={n.id}
              className={`np-item ${n.unread ? "unread" : ""}`}
              onClick={() => markAsRead(n.id)}
              style={{ position: 'relative' }}
            >
              <div className="np-item-ic" style={{ background: n.bg, color: n.color, position: 'relative' }}>
                {/* Use react-icon or fallback */}
                {n.icon || <IcoBell />}
                {n.urgent && <div className="np-item-urgent-dot" />}
                {/* Always show cancel button in icon area */}
                <button
                  className="np-item-btn dismiss"
                  title="Dismiss"
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                >
                  <IcoClose />
                </button>
              </div>
              <div className="np-item-body">
                <div className="np-item-title">
                  {n.title}
                  {n.unread && <span className="np-item-dot" />}
                </div>
                <div className="np-item-text">{n.body}</div>
                <div className="np-item-time">{n.time}</div>
              </div>
              <div className="np-item-actions">
                {n.unread && (
                  <button className="np-item-btn" title="Mark as read" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}>
                    <IcoCheck />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="np-footer">
        <button className="np-footer-btn" onClick={handleClose}>View all notifications</button>
      </div>
    </div>
  );
}