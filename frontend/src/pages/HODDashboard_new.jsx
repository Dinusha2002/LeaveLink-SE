import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HODDashboard.css';
import api from '../api';

export default function HODDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(8);
  const [approvedThisMonth, setApprovedThisMonth] = useState(24);
  const [rejectedThisMonth, setRejectedThisMonth] = useState(3);
  const [teamMembers, setTeamMembers] = useState(15);
  const [urgentRequests, setUrgentRequests] = useState([
    {
      id: 1,
      name: 'Prof. Michael Chen',
      leaveType: 'Emergency Leave',
      dateRange: '2024-08-20 - 1 day(s)',
      reason: 'Family emergency - urgent medical situation',
      priority: 'urgent'
    },
    {
      id: 2,
      name: 'Dr. Emily Davis',
      leaveType: 'Sick Leave',
      dateRange: '2024-08-21 - 2 day(s)',
      reason: 'Medical appointment and recovery',
      priority: 'high'
    }
  ]);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [flash, setFlash] = useState(location.state?.flash || '');

  useEffect(() => {
    if (flash) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [flash, navigate, location.pathname]);

  if (!user || (user.role !== 'hod' && user.role !== 'admin')) {
    return <div style={{ padding: 32, fontSize: 24 }}>Access denied.</div>;
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#3b82f6';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="hod-dashboard-container">
      {/* Header */}
      <header className="hod-header">
        <div className="hod-header-left">
          <h1 className="hod-main-title">Leave Management</h1>
          <p className="hod-main-subtitle">Head of Department</p>
        </div>
        <div className="hod-header-right">
          <div className="hod-user-profile">
            <div className="hod-user-avatar">👤</div>
            <div className="hod-user-info">
              <div className="hod-user-name">Dr. Sarah Johnson</div>
              <div className="hod-user-role">Computer Science HOD</div>
            </div>
            </div>
            <button className="hod-logout-btn" onClick={onLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="hod-main-layout">
        {/* Sidebar */}
        <aside className={`hod-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="hod-sidebar-nav">
            <div className="hod-nav-group">
              <h3 className="hod-nav-group-title">Leave Management</h3>
              <ul className="hod-nav-list">
                <li 
                  className={`hod-nav-item ${activeSection === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveSection('overview')}
                >
                  <span className="hod-nav-icon">⊞</span>
                  <span className="hod-nav-text">Overview</span>
                </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveSection('pending')}
                >
                  <span className="hod-nav-icon">⏰</span>
                  <span className="hod-nav-text">Pending Requests</span>
                </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveSection('history')}
                >
                  <span className="hod-nav-icon">🔄</span>
                  <span className="hod-nav-text">Approval History</span>
                </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'team' ? 'active' : ''}`}
                  onClick={() => setActiveSection('team')}
                >
                  <span className="hod-nav-icon">👥</span>
                  <span className="hod-nav-text">Team Overview</span>
                </li>
              </ul>
            </div>
            
            <div className="hod-nav-group">
              <h3 className="hod-nav-group-title">My Account</h3>
              <ul className="hod-nav-list">
                <li 
                  className={`hod-nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveSection('settings')}
                >
                  <span className="hod-nav-icon">⚙️</span>
                  <span className="hod-nav-text">Settings</span>
                </li>
                <li 
                  className="hod-nav-item"
                  onClick={onLogout}
                >
                  <span className="hod-nav-icon">↩️</span>
                  <span className="hod-nav-text">Log out</span>
                </li>
              </ul>
            </div>
          </nav>
      </aside>

        {/* Main Content Area */}
        <main className="hod-main-content">
          {/* Content Header */}
          <div className="hod-content-header">
            <div className="hod-page-title">
              <h2>Leave Approvals</h2>
              <p className="hod-page-subtitle">Review and manage leave requests from your team</p>
            </div>
            
            <div className="hod-tabs">
              <button 
                className={`hod-tab ${activeSection === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveSection('overview')}
              >
                Overview
              </button>
              <button 
                className={`hod-tab ${activeSection === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveSection('pending')}
              >
                Pending Requests
              </button>
              <button 
                className={`hod-tab ${activeSection === 'history' ? 'active' : ''}`}
                onClick={() => setActiveSection('history')}
              >
                Approval History
              </button>
              <button 
                className={`hod-tab ${activeSection === 'team' ? 'active' : ''}`}
                onClick={() => setActiveSection('team')}
              >
                Team Overview
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="hod-content">
            {activeSection === 'overview' && (
              <div className="hod-overview">
                {/* Key Metrics */}
                <div className="hod-metrics-grid">
                  <div className="hod-metric-card">
                    <div className="hod-metric-icon">⏰</div>
                    <div className="hod-metric-content">
                      <div className="hod-metric-value">{pendingRequests}</div>
                      <div className="hod-metric-label">Pending Requests</div>
                      <div className="hod-metric-trend positive">+2 today</div>
            </div>
          </div>

                  <div className="hod-metric-card">
                    <div className="hod-metric-icon">✅</div>
                    <div className="hod-metric-content">
                      <div className="hod-metric-value">{approvedThisMonth}</div>
                      <div className="hod-metric-label">Approved This Month</div>
                      <div className="hod-metric-trend positive">+18%</div>
            </div>
            </div>
                  
                  <div className="hod-metric-card">
                    <div className="hod-metric-icon">❌</div>
                    <div className="hod-metric-content">
                      <div className="hod-metric-value">{rejectedThisMonth}</div>
                      <div className="hod-metric-label">Rejected This Month</div>
                      <div className="hod-metric-trend negative">-25%</div>
            </div>
            </div>

                  <div className="hod-metric-card">
                    <div className="hod-metric-icon">👥</div>
                    <div className="hod-metric-content">
                      <div className="hod-metric-value">{teamMembers}</div>
                      <div className="hod-metric-label">Team Members</div>
                      <div className="hod-metric-trend neutral">Computer Science</div>
                      </div>
                      </div>
                    </div>

                {/* Main Content Row */}
                <div className="hod-main-row">
                  {/* Quick Actions */}
                  <div className="hod-quick-actions">
                    <h3 className="hod-section-title">Quick Actions</h3>
                    <div className="hod-action-list">
                      <div className="hod-action-item">
                        <div className="hod-action-icon">⏰</div>
                        <div className="hod-action-content">
                          <div className="hod-action-title">Review Pending Requests</div>
                          <div className="hod-action-subtitle">8 requests awaiting your approval</div>
                      </div>
                    </div>

                      <div className="hod-action-item">
                        <div className="hod-action-icon">👥</div>
                        <div className="hod-action-content">
                          <div className="hod-action-title">Team Overview</div>
                          <div className="hod-action-subtitle">View team leave status and balances</div>
                      </div>
                    </div>

                      <div className="hod-action-item">
                        <div className="hod-action-icon">✅</div>
                        <div className="hod-action-content">
                          <div className="hod-action-title">Approval History</div>
                          <div className="hod-action-subtitle">Review past approval decisions</div>
                      </div>
                    </div>
                      </div>
                    </div>

                  {/* Urgent Requests */}
                  <div className="hod-urgent-requests">
                    <h3 className="hod-section-title">
                      <span className="hod-section-icon">⏰</span>
                      Urgent Requests
                    </h3>
                    <div className="hod-requests-list">
                      {urgentRequests.map(request => (
                        <div key={request.id} className="hod-request-card">
                          <div className="hod-request-header">
                            <div className="hod-request-staff">{request.name}</div>
                            <span 
                              className="hod-priority-tag"
                              style={{ backgroundColor: getPriorityColor(request.priority) }}
                            >
                              {request.priority}
                            </span>
                        </div>
                          <div className="hod-request-details">
                            <div className="hod-request-info">
                              <span className="hod-request-type">{request.leaveType}</span>
                              <span className="hod-request-dates">{request.dateRange}</span>
                      </div>
                            <div className="hod-request-reason">{request.reason}</div>
                      </div>
                    </div>
                      ))}
                  </div>
                </div>
                </div>
              </div>
            )}

            {activeSection === 'pending' && (
              <div className="hod-pending-requests">
                <h2>Pending Leave Requests</h2>
                <p>Review and approve pending leave requests from your team members.</p>
                {/* Add pending requests content here */}
              </div>
            )}

            {activeSection === 'history' && (
              <div className="hod-approval-history">
                <h2>Approval History</h2>
                <p>View all past leave request approvals and rejections.</p>
                {/* Add approval history content here */}
              </div>
            )}

            {activeSection === 'team' && (
              <div className="hod-team-overview">
                <h2>Team Overview</h2>
                <p>Monitor your team's leave status and balances.</p>
                {/* Add team overview content here */}
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="hod-settings">
                <h2>Settings</h2>
                <p>Configure your account and notification preferences.</p>
                {/* Add settings content here */}
              </div>
            )}
        </div>
      </main>
      </div>
    </div>
  );
}