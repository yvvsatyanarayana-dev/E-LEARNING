// notificationPanel.jsx
import { useState, useEffect, useRef } from "react";
import "./notificationPanel.css";
import { useNotifications } from "../../../utils/useNotifications";

const IcoBell    = (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoFile    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoClock   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoAward   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoBrief   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcoUsers   = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoBook    = (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;

export default function NotificationPanel({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("all");
  const { notifications: notifs, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const TABS = ["all","academic","career","campus"];
  const filtered = activeTab === "all" ? notifs : notifs.filter(n => n.type === activeTab);

  return (
    <>
      <div className="np-overlay" onClick={onClose} />
      <div className="np-panel" ref={ref}>
        <div className="np-header">
          <span className="np-title">Notifications</span>
          {unreadCount > 0 && <span className="np-count">{unreadCount} new</span>}
          <button className="np-mark-all" onClick={markAllAsRead}>Mark all read</button>
        </div>

        <div className="np-tabs">
          {TABS.map(t => (
            <button key={t} className={`np-tab ${activeTab===t?"active":""}`} onClick={()=>setActiveTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        <div className="np-list">
          {filtered.length === 0 ? (
            <div className="np-empty">
              <div className="np-empty-ico">🔔</div>
              <div className="np-empty-txt">No notifications in this category</div>
            </div>
          ) : filtered.map(n => (
            <div key={n.id} className={`np-item ${!n.is_read?"unread":""}`} onClick={()=>markAsRead(n.id)}>
              <div className={`np-ico-wrap ${n.color}`}>{n.icon}</div>
              <div className="np-body">
                <div className="np-notif-title">{n.title}</div>
                <div className="np-notif-sub">{n.message}</div>
                <div className="np-notif-time">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              {!n.is_read && <div className="np-unread-dot" />}
            </div>
          ))}
        </div>

        <div className="np-footer">
          <button className="np-footer-btn">View all notifications →</button>
        </div>
      </div>
    </>
  );
}