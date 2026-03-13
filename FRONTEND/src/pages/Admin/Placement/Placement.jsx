import React from 'react';
import './Placement.css';

function Placement() {
  // Sample placement data
  const placements = [
    { id: 1, company: 'Google', students: 10 },
    { id: 2, company: 'Microsoft', students: 8 },
    { id: 3, company: 'Amazon', students: 7 },
  ];
  return (
    <div className="admin-placement">
      <h2>Placements</h2>
      <ul>
        {placements.map(item => (
          <li key={item.id}>{item.company} - {item.students} students placed</li>
        ))}
      </ul>
    </div>
  );
}

export default Placement;
