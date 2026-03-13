import React from 'react';
import './AdminUserManagement.css';

function AdminUserManagement() {
  // Sample user data
  const users = [
    { id: 1, name: "John Doe", role: "Student", email: "john@example.com" },
    { id: 2, name: "Jane Smith", role: "Faculty", email: "jane@example.com" },
    { id: 3, name: "Admin User", role: "Admin", email: "admin@example.com" },
  ];
  return (
    <div className="admin-user-management">
      <h2>User Management</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>{user.email}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUserManagement;
