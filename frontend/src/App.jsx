import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import HODDashboard from './pages/HODDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import DeanDashboard from './pages/DeanDashboard';
import NonAcademicDashboard from './pages/NonAcademicDashboard';
import MADashboard from './pages/MADashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApplyLeave from './pages/ApplyLeave';

function AppInner() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogin = (userData, jwt) => {
    console.log('🔍 Login Debug - User Data:', userData);
    console.log('🔍 Login Debug - Role:', userData.role);
    console.log('🔍 Login Debug - Position:', userData.position);
    console.log('🔍 Login Debug - Email:', userData.email);
    
    setUser(userData);
    if (jwt) {
      setToken(jwt);
      localStorage.setItem('token', jwt);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Check if user has HOD access (either hasHODAccess flag or HOD role/position)
    const isHOD = userData.hasHODAccess || (
      userData.role && (
        userData.role.toLowerCase().includes('hod') || 
        userData.role.toLowerCase().includes('head of department') ||
        userData.position?.toLowerCase().includes('hod') ||
        userData.position?.toLowerCase().includes('head of department')
      )
    );
    
    console.log('🔍 Login Debug - Is HOD:', isHOD);
    
    // Normalize role for comparison
    const normalizedRole = userData.role?.toLowerCase().trim();
    console.log('🔍 Login Debug - Normalized Role:', normalizedRole);
    
    // Special check for HOD email or HOD access
    if (userData.email === 'hod@leavelink.local' || userData.hasHODAccess) {
      console.log('🔍 HOD Email or HOD Access detected - forcing HOD dashboard');
      navigate('/hod');
      return;
    }
    
    switch (normalizedRole) {
      case 'admin': 
        console.log('🔍 Navigating to admin dashboard');
        navigate('/admin'); 
        break;
      case 'hod': 
        console.log('🔍 Navigating to HOD dashboard');
        navigate('/hod'); 
        break;
      case 'lecturer': 
        console.log('🔍 Navigating to lecturer dashboard');
        navigate('/lecturer'); 
        break;
      case 'dean': 
        console.log('🔍 Navigating to dean dashboard');
        navigate('/dean'); 
        break;
      case 'non-academic':
      case 'non_academic_staff': 
        console.log('🔍 Navigating to non-academic dashboard');
        navigate('/nonacademic'); 
        break;
      case 'management assistant':
      case 'management_assistant': 
        console.log('🔍 Navigating to MA dashboard');
        navigate('/ma'); 
        break;
      case 'academic':
      case 'academic staff':
        // Academic staff with HOD access can choose their view
        if (isHOD) {
          console.log('🔍 Academic with HOD access - navigating to user dashboard');
          navigate('/user');
        } else {
          console.log('🔍 Academic without HOD access - navigating to user dashboard');
          navigate('/user');
        }
        break;
      default: 
        console.log('🔍 Default case - navigating to user dashboard');
        navigate('/user');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Clear admin dashboard cached data on logout
    localStorage.removeItem('adminDashboardData');
    navigate('/login');
  };

  const Protected = ({ children }) => (!user ? <Navigate to="/login" replace /> : children);
  const AdminOnly = ({ children }) => (!user || user.role !== 'admin' ? <Navigate to="/login" replace /> : children);
  const HODOnly = ({ children }) => {
    console.log('🔍 HODOnly Protection - User:', user);
    console.log('🔍 HODOnly Protection - User Role:', user?.role);
    if (!user) {
      console.log('🔍 HODOnly Protection - No user, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    // Check if user has HOD role or HOD access
    const userRole = user.role?.toLowerCase().trim();
    const isHOD = userRole === 'hod' || userRole === 'admin' || 
                  userRole?.includes('hod') || 
                  userRole?.includes('head of department') ||
                  user.hasHODAccess ||
                  user.email === 'hod@leavelink.local';
    
    if (!isHOD) {
      console.log('🔍 HODOnly Protection - User role not HOD or admin, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    console.log('🔍 HODOnly Protection - Access granted');
    return children;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLoggedIn={handleLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminOnly><AdminDashboard user={user} onLogout={handleLogout} /></AdminOnly>} />
      <Route path="/user" element={<Protected><UserDashboard user={user} onLogout={handleLogout} /></Protected>} />
      <Route path="/hod" element={<HODOnly><HODDashboard user={user} onLogout={handleLogout} /></HODOnly>} />
      <Route path="/lecturer" element={<Protected><LecturerDashboard user={user} onLogout={handleLogout} /></Protected>} />
      <Route path="/dean" element={<Protected><DeanDashboard user={user} onLogout={handleLogout} /></Protected>} />
      <Route path="/nonacademic" element={<Protected><NonAcademicDashboard user={user} onLogout={handleLogout} /></Protected>} />
      <Route path="/ma" element={<Protected><MADashboard user={user} onLogout={handleLogout} /></Protected>} />
      <Route path="/apply-leave" element={<Protected><ApplyLeave user={user} onLogout={handleLogout} /></Protected>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}