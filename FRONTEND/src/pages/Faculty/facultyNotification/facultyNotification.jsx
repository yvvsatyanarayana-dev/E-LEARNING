// NotificationsPopup.jsx
import { useState, useEffect, useRef } from "react";
import "./NotificationsPopup.css";

// ─── ICONS ───────────────────────────────────────────────────────
const IcoClose   = (p) => <svg {...p} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoBell    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoPen     = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoClock   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoAlert   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoBrain   = (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/></svg>;
const IcoCheck   = (p) => <svg {...p} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoCheckAll= (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/><polyline points="20 6 9 17 4 12" transform="translate(4,0)"/></svg>;

// ─── DATA ────────────────────────────────────────────────────────
const INITIAL_NOTIFS = [
  {
    id: 1,
    type: "submission",
    icon: <IcoPen />,
    color: "var(--rose)",
    bg: "rgba(242,68,92,.12)",
    title: "14 new OS assignment submissions",
    body: "Students from Sem 5 A submitted Assignment #4 — awaiting your review.",
    time: "5m ago",
    unread: true,
    urgent: true,
  },
  {
    id: 2,
    type: "quiz",
    icon: <IcoClock />,
    color: "var(--indigo-ll)",
    bg: "rgba(91,78,248,.12)",
    title: "DBMS Quiz results are ready",
    body: "All 102 students have submitted. Average score: 68%.",
    time: "23m ago",
    unread: true,
    urgent: false,
  },
  {
    id: 3,
    type: "ai",
    icon: <IcoBrain />,
    color: "var(--teal)",
    bg: "rgba(39,201,176,.1)",
    title: "Lucyna AI detected weak topic",
    body: "34 students scored below 40% on Deadlock Detection. Remedial quiz suggested.",
    time: "1h ago",
    unread: true,
    urgent: false,
  },
  {
    id: 4,
    type: "attendance",
    icon: <IcoAlert />,
    color: "var(--amber)",
    bg: "rgba(244,165,53,.1)",
    title: "Attendance not marked for CA Lecture",
    body: "Computer Architecture — Lecture 29 (Room 102) attendance is pending.",
    time: "2h ago",
    unread: true,
    urgent: true,
  },
  {
    id: 5,
    type: "student",
    icon: <IcoUsers />,
    color: "var(--violet)",
    bg: "rgba(159,122,234,.1)",
    title: "Dev Iyer flagged as at-risk",
    body: "Attendance dropped to 79% and last quiz score was 41%.",
    time: "3h ago",
    unread: false,
    urgent: false,
  },
  {
    id: 6,
    type: "submission",
    icon: <IcoPen />,
    color: "var(--teal)",
    bg: "rgba(39,201,176,.1)",
    title: "6 project proposals approved",
    body: "Students from CS503 submitted final project proposals for your review.",
    time: "Yesterday",
    unread: false,
    urgent: false,
  },
];

const TABS = ["All", "Unread", "Urgent"];

// ─── COMPONENT ───────────────────────────────────────────────────
export default function NotificationsPopup({ open, onClose, anchorRef, onBack, isPage }) {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
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

  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, unread: false } : x));
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));
  const dismiss = (id) => setNotifs(n => n.filter(x => x.id !== id));

  const unreadCount = notifs.filter(n => n.unread).length;

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
          <button className="np-hclose" onClick={handleClose}><IcoClose /></button>
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
              onClick={() => markRead(n.id)}
            >
              <div className="np-item-ic" style={{ background: n.bg, color: n.color }}>
                {n.icon}
                {n.urgent && <div className="np-item-urgent-dot" />}
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
                  <button className="np-item-btn" title="Mark as read" onClick={(e) => { e.stopPropagation(); markRead(n.id); }}>
                    <IcoCheck />
                  </button>
                )}
                <button className="np-item-btn dismiss" title="Dismiss" onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}>
                  <IcoClose />
                </button>
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