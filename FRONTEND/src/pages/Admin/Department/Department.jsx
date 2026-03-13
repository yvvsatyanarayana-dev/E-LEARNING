import React from 'react';
import './Department.css';

function Department() {
  // Sample department data
  const departments = [
    { id: 1, name: 'Computer Science', students: 400 },
    { id: 2, name: 'Electronics', students: 300 },
    { id: 3, name: 'Mechanical', students: 200 },
  ];
  return (
    <div className="admin-department">
      <h2>Departments</h2>
      <ul>
        {departments.map(dept => (
          <li key={dept.id}>{dept.name} - {dept.students} students</li>
        ))}
      </ul>
    </div>
  );
}

export default Department;
