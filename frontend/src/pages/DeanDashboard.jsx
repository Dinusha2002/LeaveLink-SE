import React from 'react';
import UserDashboard from './UserDashboard';

function DeanDashboard({ user, onLogout }) {
  // Set the user role to dean for the UserDashboard
  const userWithRole = user ? { ...user, role: 'dean' } : user;

  return <UserDashboard user={userWithRole} onLogout={onLogout} />;
}

export default DeanDashboard;