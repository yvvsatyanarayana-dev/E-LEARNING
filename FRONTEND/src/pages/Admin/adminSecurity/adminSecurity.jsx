import React from 'react';
import './adminSecurity.css';

function Security() {
  // Sample security data
  const security = {
    rbac: 'Enabled',
    encryption: 'AES-256',
    apiProtection: 'Active',
    monitoring: 'Enabled',
  };
  return (
    <div className="admin-security">
      <h2>Security</h2>
      <ul>
        <li><strong>RBAC:</strong> {security.rbac}</li>
        <li><strong>Encryption:</strong> {security.encryption}</li>
        <li><strong>API Protection:</strong> {security.apiProtection}</li>
        <li><strong>Monitoring:</strong> {security.monitoring}</li>
      </ul>
    </div>
  );
}

export default Security;
