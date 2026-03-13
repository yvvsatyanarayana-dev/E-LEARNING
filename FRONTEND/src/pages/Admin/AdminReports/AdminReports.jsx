import React from 'react';
import './AdminReports.css';

function AdminReports() {
  // Sample report data
  const reports = [
    { id: 1, title: "Platform Usage", summary: "1200 users, 87% active" },
    { id: 2, title: "Department Analytics", summary: "CSE: 400, ECE: 300, ME: 200" },
    { id: 3, title: "Popular Courses", summary: "AI Fundamentals, Web Development, Data Structures" },
    { id: 4, title: "Placement Trends", summary: "75% placed in 2025" },
  ];
  return (
    <div className="admin-reports">
      <h2>Admin Reports</h2>
      <ul>
        {reports.map(report => (
          <li key={report.id}>
            <strong>{report.title}:</strong> {report.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminReports;
