import React, { useState } from 'react';
import Sidebar from '../adminDashbaord/adminDashboard'; // Sidebar and Topbar are exported from AdminDashboard
// If Sidebar and Topbar are not exported, extract them to a shared component file.

const AdminUserManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminName = "Admin User";
  const handleNavigate = () => {};
  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage={"User Management"} onNavigate={handleNavigate} adminName={adminName} />
      <main className="main">
        {/* Topbar can be added here if exported */}
        <div style={{padding:'2rem'}}>
          <h2>Admin User Management</h2>
          {/* Add admin user management UI here */}
        </div>
      </main>
    </div>
  );
};

export default AdminUserManagement;
