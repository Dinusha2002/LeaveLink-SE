import React from 'react';
import UserDashboard from './UserDashboard';

function LecturerDashboard({ user, onLogout }) {
  // Pass the user as-is to preserve HOD detection
  return <UserDashboard user={user} onLogout={onLogout} />;
}

export default LecturerDashboard;