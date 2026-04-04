import React from 'react';
import { useNotifications } from '../../../utils/useNotifications';
import './Toast.css';

const Toast = ({ notif, onRemove }) => {
  return (
    <div className={`sc-toast ${notif.type || 'system'}`} onClick={() => {
        if(notif.link) window.location.href = notif.link;
        onRemove(notif.id);
    }}>
      <div className="sc-toast-icon">🔔</div>
      <div className="sc-toast-content">
        <div className="sc-toast-title">{notif.title}</div>
        <div className="sc-toast-message">{notif.message}</div>
      </div>
      <button className="sc-toast-close" onClick={(e) => { e.stopPropagation(); onRemove(notif.id); }}>×</button>
      <div className="sc-toast-progress"></div>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();

  return (
    <div className="sc-toast-container">
      {toasts.map(t => (
        <Toast key={t.id} notif={t} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
