import React from 'react';
import './AdminSystemConfiguration.css';

function AdminSystemConfiguration() {
  // Sample config data
  const config = {
    authMethod: "JWT",
    sessionTimeout: "30 min",
    encryption: "AES-256",
    apiRateLimit: "1000 req/min",
  };
  return (
    <div className="admin-system-configuration">
      <h2>System Configuration</h2>
      <ul className="config-list">
        <li><strong>Authentication Method:</strong> {config.authMethod}</li>
        <li><strong>Session Timeout:</strong> {config.sessionTimeout}</li>
        <li><strong>Encryption:</strong> {config.encryption}</li>
        <li><strong>API Rate Limit:</strong> {config.apiRateLimit}</li>
      </ul>
    </div>
  );
}

export default AdminSystemConfiguration;
