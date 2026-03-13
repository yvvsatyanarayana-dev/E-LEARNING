import React from 'react';
import './adminSettings.css';

function Settings() {
  // Sample settings data
  const settings = {
    theme: 'Light',
    notifications: 'Enabled',
    backup: 'Daily',
    accessibility: 'On',
  };
  return (
    <div className="admin-settings">
      <h2>Settings</h2>
      <ul>
        <li><strong>Theme:</strong> {settings.theme}</li>
        <li><strong>Notifications:</strong> {settings.notifications}</li>
        <li><strong>Backup:</strong> {settings.backup}</li>
        <li><strong>Accessibility:</strong> {settings.accessibility}</li>
      </ul>
    </div>
  );
}

export default Settings;
