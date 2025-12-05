import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './HODDashboard.css';

export default function HODDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [approvedThisMonth, setApprovedThisMonth] = useState(0);
  const [rejectedThisMonth, setRejectedThisMonth] = useState(0);
  const [teamMembers, setTeamMembers] = useState(0);
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoadingData(true);
      setError(null);

      // Fetch all leave requests for the HOD's department
      const [checkedLeaves, allLeaves, departmentData] = await Promise.all([
        api.get('/leaves/checked'), // Pending requests awaiting HOD approval
        api.get('/leaves'), // All leaves for metrics
        fetchDepartmentInfo()
      ]);

      // Calculate metrics
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const monthlyLeaves = allLeaves.data.filter(leave => {
        const leaveDate = new Date(leave.startDate);
        return leaveDate >= startOfMonth && leaveDate <= endOfMonth;
      });

      const approvedCount = monthlyLeaves.filter(leave => leave.status === 'approved').length;
      const rejectedCount = monthlyLeaves.filter(leave => leave.status === 'rejected').length;

      // Get team members count from department
      const teamCount = departmentData ? departmentData.memberCount : 0;

      // Process urgent requests (checked leaves awaiting approval)
      const urgentRequestsData = checkedLeaves.data.map(leave => ({
        id: leave._id,
        name: leave.applicant?.fullName || 'Unknown',
        leaveType: leave.leaveType?.name || 'Unknown',
        dateRange: `${leave.startDate} - ${leave.days} day(s)`,
        reason: leave.reason,
        priority: getPriorityFromLeaveType(leave.leaveType?.name)
      }));

      // Update state
      setPendingRequests(checkedLeaves.data.length);
      setApprovedThisMonth(approvedCount);
      setRejectedThisMonth(rejectedCount);
      setTeamMembers(teamCount);
      setUrgentRequests(urgentRequestsData);
      setDepartmentInfo(departmentData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchDepartmentInfo = async () => {
    try {
      // Get user's department info
      const userResponse = await api.get('/user/profile');
      const userDept = userResponse.data.department;
      
      if (userDept) {
        // Get department details and member count
        const deptResponse = await api.get(`/departments/${userDept._id}`);
        const membersResponse = await api.get(`/admin/users/department/${userDept._id}`);
        
        return {
          ...deptResponse.data,
          memberCount: membersResponse.data.length
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching department info:', err);
      return null;
    }
  };

  const getPriorityFromLeaveType = (leaveTypeName) => {
    if (!leaveTypeName) return 'medium';
    
    const urgentTypes = ['Emergency Leave', 'Medical Emergency'];
    const highTypes = ['Sick Leave', 'Personal Leave'];
    
    if (urgentTypes.some(type => leaveTypeName.includes(type))) return 'urgent';
    if (highTypes.some(type => leaveTypeName.includes(type))) return 'high';
    return 'medium';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#3b82f6';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handleRoleSwitch = (newView) => {
    setShowRoleSwitch(false);
    if (newView === 'user') {
      // Navigate to user dashboard
      navigate('/user');
    }
  };

  // Close role switch dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRoleSwitch && !event.target.closest('.hod-role-switch')) {
        setShowRoleSwitch(false);
      }
    };

    if (showRoleSwitch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleSwitch]);

  return (
    <div className="hod-dashboard-container">
      {/* Sidebar */}
      <aside className={`hod-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="hod-sidebar-header">
          <div className="hod-logo-container">
            <img 
              src="/OIP-removebg-preview.png" 
              alt="LeaveLink Logo" 
              className="hod-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hod-logo-fallback" style={{ display: 'none' }}>
              <div className="hod-logo-icon">LL</div>
            </div>
            <div className="hod-logo-text">
              <h1 className="hod-sidebar-title">LeaveLink</h1>
              <h2 className="hod-sidebar-subtitle">Leave Management System</h2>
              <p className="hod-sidebar-description">HOD Panel</p>
            </div>
          </div>
        </div>
          
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
          
          {/* User Profile and Role Switch - Bottom of sidebar */}
          <div className="hod-sidebar-bottom">
            <div className="hod-user-profile">
              <div className="hod-user-avatar">👤</div>
              <div className="hod-user-info">
                <div className="hod-user-name">Head Of Department</div>
                <div className="hod-user-role">Admin</div>
              </div>
            </div>
            
            <div className="hod-role-switch">
              <button
                className="hod-role-switch-btn"
                onClick={() => setShowRoleSwitch(!showRoleSwitch)}
              >
                <span className="hod-role-switch-text">HOD Account</span>
                <span className="hod-role-switch-arrow">▼</span>
              </button>
              {showRoleSwitch && (
                <div className="hod-role-switch-dropdown">
                  <div
                    className="hod-role-option"
                    onClick={() => handleRoleSwitch('user')}
                  >
                    <span className="hod-role-option-icon">👤</span>
                    <span className="hod-role-option-text">User Account</span>
                  </div>
                  <div
                    className="hod-role-option active"
                  >
                    <span className="hod-role-option-icon">👨‍💼</span>
                    <span className="hod-role-option-text">HOD Account</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="hod-main-content">
          {/* Content Header */}
          <div className="hod-content-header">
            <div className="hod-page-title">
              <h2>Leave Approvals</h2>
              <p className="hod-page-subtitle">Review And Manage Leave Rrequests From Your Team</p>
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
                {error && (
                  <div className="hod-error-message">
                    <div className="hod-error-icon">⚠️</div>
                    <div className="hod-error-text">{error}</div>
                    <button 
                      className="hod-retry-btn"
                      onClick={fetchDashboardData}
                    >
                      Retry
                    </button>
                  </div>
                )}
                
                {isLoadingData ? (
                  <div className="hod-loading">
                    <div className="hod-loading-spinner"></div>
                    <div className="hod-loading-text">Loading dashboard data...</div>
                  </div>
                ) : (
                  <>
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
                      <div className="hod-metric-trend neutral">{departmentInfo?.name || 'Department'}</div>
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
                  </>
                )}
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
  );
}