import React from 'react';
import './ActivityLog.css';

function ActivityLog() {
  // Sample activity log data
  const logs = [
    { id: 1, action: 'User John registered', time: '2026-03-12 10:00' },
    { id: 2, action: 'Course AI Fundamentals added', time: '2026-03-12 11:00' },
    { id: 3, action: 'Placement report generated', time: '2026-03-12 12:00' },
  ];
  return (
    <div className="admin-activity-log">
      <h2>Activity Log</h2>
      <ul>
        {logs.map(log => (
          <li key={log.id}>{log.action} <span className="log-time">({log.time})</span></li>
        ))}
      </ul>
    </div>
  );
}

export default ActivityLog;
