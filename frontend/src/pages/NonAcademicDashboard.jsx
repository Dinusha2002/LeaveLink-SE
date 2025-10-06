import React from 'react';
import UserDashboard from './UserDashboard';

function NonAcademicDashboard({ user, onLogout }) {
  // Set the user role to non-academic for the UserDashboard
  const userWithRole = user ? { ...user, role: 'non-academic' } : user;

  return <UserDashboard user={userWithRole} onLogout={onLogout} />;
}

export default NonAcademicDashboard;