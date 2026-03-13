import React from 'react';
import './AdminCourseManagement.css';

function AdminCourseManagement() {
  // Sample course data
  const courses = [
    { id: 1, name: "AI Fundamentals", faculty: "Jane Smith", enrolled: 120 },
    { id: 2, name: "Web Development", faculty: "John Doe", enrolled: 90 },
    { id: 3, name: "Data Structures", faculty: "Admin User", enrolled: 60 },
  ];
  return (
    <div className="admin-course-management">
      <h2>Course Management</h2>
      <table className="course-table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Faculty</th>
            <th>Enrolled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td>{course.name}</td>
              <td>{course.faculty}</td>
              <td>{course.enrolled}</td>
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

export default AdminCourseManagement;
