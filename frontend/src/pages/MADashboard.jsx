import React from 'react';
import UserDashboard from './UserDashboard';

function MADashboard({ user, onLogout }) {
  // Set the user role to ma for the UserDashboard
  const userWithRole = user ? { ...user, role: 'ma' } : user;

  return <UserDashboard user={userWithRole} onLogout={onLogout} />;
}

export default MADashboard;