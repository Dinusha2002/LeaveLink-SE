import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HODDashboard.css';

export default function HODDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddLeaveType, setShowAddLeaveType] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Role switching state
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [isHODUser, setIsHODUser] = useState(false);
  const [currentView, setCurrentView] = useState('hod'); // 'user' or 'hod'
  
  // Enhanced UI state
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [departmentStats, setDepartmentStats] = useState({
    totalStaff: 0,
    pendingRequests: 0,
    onLeave: 0,
    approvedThisMonth: 0,
    totalLeaves: 0,
    averageLeaveDays: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [quickStats, setQuickStats] = useState({
    todayLeaves: 0,
    thisWeekLeaves: 0,
    thisMonthLeaves: 0,
    approvalRate: 0
  });
  
  const navigate = useNavigate();

  // Initialize with comprehensive sample data
  useEffect(() => {
    const sampleLeaveRequests = [
      {
        id: 1,
        staffName: 'John Smith',
        staffEmail: 'john.smith@company.com',
        department: 'Information Technology',
        leaveType: 'Annual Leave',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        days: 5,
        reason: 'Family vacation',
        status: 'pending',
        urgency: 'medium',
        position: 'Senior Developer',
        submittedDate: '2024-01-10',
        priority: 'normal'
      },
      {
        id: 2,
        staffName: 'Sarah Johnson',
        staffEmail: 'sarah.johnson@company.com',
        department: 'Information Technology',
        leaveType: 'Sick Leave',
        startDate: '2024-01-10',
        endDate: '2024-01-12',
        days: 3,
        reason: 'Medical appointment',
        status: 'approved',
        urgency: 'high',
        position: 'Project Manager',
        submittedDate: '2024-01-08',
        priority: 'urgent'
      },
      {
        id: 3,
        staffName: 'Mike Wilson',
        staffEmail: 'mike.wilson@company.com',
        department: 'Information Technology',
        leaveType: 'Personal Leave',
        startDate: '2024-01-25',
        endDate: '2024-01-27',
        days: 3,
        reason: 'Personal matters',
        status: 'pending',
        urgency: 'low',
        position: 'Software Engineer',
        submittedDate: '2024-01-20',
        priority: 'low'
      },
      {
        id: 4,
        staffName: 'Emily Davis',
        staffEmail: 'emily.davis@company.com',
        department: 'Information Technology',
        leaveType: 'Maternity Leave',
        startDate: '2024-02-01',
        endDate: '2024-05-01',
        days: 90,
        reason: 'Maternity leave',
        status: 'approved',
        urgency: 'high',
        position: 'UI/UX Designer',
        submittedDate: '2024-01-15',
        priority: 'urgent'
      },
      {
        id: 5,
        staffName: 'David Brown',
        staffEmail: 'david.brown@company.com',
        department: 'Information Technology',
        leaveType: 'Casual Leave',
        startDate: '2024-01-18',
        endDate: '2024-01-19',
        days: 2,
        reason: 'Personal work',
        status: 'rejected',
        urgency: 'low',
        position: 'Database Administrator',
        submittedDate: '2024-01-16',
        priority: 'normal'
      }
    ];

    const sampleStaff = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@company.com',
        position: 'Senior Developer',
        department: 'Information Technology',
        epf: 'EMP001',
        status: 'active',
        lastActive: '2 hours ago',
        joinDate: '2022-03-15',
        leaveBalance: 15
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        position: 'Project Manager',
        department: 'Information Technology',
        epf: 'EMP002',
        status: 'active',
        lastActive: '1 hour ago',
        joinDate: '2021-08-20',
        leaveBalance: 12
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike.wilson@company.com',
        position: 'Software Engineer',
        department: 'Information Technology',
        epf: 'EMP003',
        status: 'on-leave',
        lastActive: '1 day ago',
        joinDate: '2023-01-10',
        leaveBalance: 18
      },
      {
        id: 4,
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        position: 'UI/UX Designer',
        department: 'Information Technology',
        epf: 'EMP004',
        status: 'active',
        lastActive: '30 minutes ago',
        joinDate: '2022-11-05',
        leaveBalance: 8
      },
      {
        id: 5,
        name: 'David Brown',
        email: 'david.brown@company.com',
        position: 'Database Administrator',
        department: 'Information Technology',
        epf: 'EMP005',
        status: 'active',
        lastActive: '3 hours ago',
        joinDate: '2021-12-01',
        leaveBalance: 22
      }
    ];

    const sampleDepartments = [
      { id: 1, name: 'Information Technology', staffCount: 5 },
      { id: 2, name: 'Human Resources', staffCount: 3 },
      { id: 3, name: 'Finance', staffCount: 4 }
    ];

    const sampleNotifications = [
      {
        id: 1,
        type: 'leave_request',
        title: 'New Leave Request',
        message: 'John Smith submitted a leave request for 5 days',
        time: '2 hours ago',
        read: false,
        priority: 'normal'
      },
      {
        id: 2,
        type: 'approval',
        title: 'Leave Approved',
        message: 'Sarah Johnson\'s leave request has been approved',
        time: '4 hours ago',
        read: true,
        priority: 'normal'
      },
      {
        id: 3,
        type: 'urgent',
        title: 'Urgent Request',
        message: 'Mike Wilson has an urgent leave request',
        time: '6 hours ago',
        read: false,
        priority: 'urgent'
      },
      {
        id: 4,
        type: 'system',
        title: 'System Update',
        message: 'Leave management system will be updated tonight',
        time: '1 day ago',
        read: true,
        priority: 'low'
      }
    ];

    setLeaveRequests(sampleLeaveRequests);
    setStaff(sampleStaff);
    setDepartments(sampleDepartments);
    setNotifications(sampleNotifications);
    
    // Calculate comprehensive stats
    const pendingCount = sampleLeaveRequests.filter(req => req.status === 'pending').length;
    const approvedCount = sampleLeaveRequests.filter(req => req.status === 'approved').length;
    const onLeaveCount = sampleStaff.filter(s => s.status === 'on-leave').length;
    const totalLeaves = sampleLeaveRequests.length;
    const averageDays = Math.round(sampleLeaveRequests.reduce((sum, r) => sum + r.days, 0) / totalLeaves);
    
    setPendingApprovals(sampleLeaveRequests.filter(req => req.status === 'pending'));
    setDepartmentStats({
      totalStaff: sampleStaff.length,
      pendingRequests: pendingCount,
      onLeave: onLeaveCount,
      approvedThisMonth: approvedCount,
      totalLeaves: totalLeaves,
      averageLeaveDays: averageDays
    });
    
    setRecentActivity(sampleLeaveRequests.slice(0, 5));
    setUpcomingLeaves(sampleLeaveRequests.filter(req => req.status === 'approved').slice(0, 3));
    setUrgentRequests(sampleLeaveRequests.filter(req => req.urgency === 'high'));
    
    // Calculate quick stats
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() + 7);
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() + 1);
    
    setQuickStats({
      todayLeaves: sampleLeaveRequests.filter(req => req.startDate === today).length,
      thisWeekLeaves: sampleLeaveRequests.filter(req => new Date(req.startDate) <= thisWeek).length,
      thisMonthLeaves: sampleLeaveRequests.filter(req => new Date(req.startDate) <= thisMonth).length,
      approvalRate: Math.round((approvedCount / totalLeaves) * 100) || 0
    });
  }, []);

  // Check for HOD access and set up role switching
  useEffect(() => {
    if (user) {
      // Check if user has HOD access (either hasHODAccess flag or HOD role/position)
      const isHOD = user.hasHODAccess || (
        user.role && (
          user.role.toLowerCase().includes('hod') || 
          user.role.toLowerCase().includes('head of department') ||
          user.position?.toLowerCase().includes('hod') ||
          user.position?.toLowerCase().includes('head of department')
        )
      );
      
      setIsHODUser(isHOD);
      setShowRoleSwitch(false); // Hide dropdown by default, show on click
      setCurrentView('hod'); // Default to HOD view when in HOD dashboard
    }
  }, [user]);

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

  // Role switching functions
  const handleRoleSwitch = (newView) => {
    setCurrentView(newView);
    setShowRoleSwitch(false);
    
    if (newView === 'user') {
      navigate('/user'); // Navigate to user dashboard
    } else if (newView === 'hod') {
      setCurrentView('hod'); // Stay in current HOD dashboard
    }
  };

  const getRoleDisplayName = (view) => {
    switch (view) {
      case 'user':
        return 'User Account';
      case 'hod':
        return 'HOD Account';
      default:
        return 'HOD Account';
    }
  };

  const handleApproveRequest = (requestId) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' }
          : req
      )
    );
    setPendingApprovals(prev => prev.filter(req => req.id !== requestId));
    setDepartmentStats(prev => ({
      ...prev,
      pendingRequests: prev.pendingRequests - 1,
      approvedThisMonth: prev.approvedThisMonth + 1
    }));
  };

  const handleRejectRequest = (requestId) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' }
          : req
      )
    );
    setPendingApprovals(prev => prev.filter(req => req.id !== requestId));
    setDepartmentStats(prev => ({
      ...prev,
      pendingRequests: prev.pendingRequests - 1
    }));
  };

  const handleUrgentRequest = (requestId) => {
    setUrgentRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const generateMonthlyReport = () => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const report = {
      id: Date.now(),
      title: `Monthly Leave Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      department: selectedDepartment,
      staff: selectedStaff,
      generatedDate: new Date().toISOString().split('T')[0],
      data: {
        totalRequests: leaveRequests.length,
        approved: leaveRequests.filter(r => r.status === 'approved').length,
        rejected: leaveRequests.filter(r => r.status === 'rejected').length,
        pending: leaveRequests.filter(r => r.status === 'pending').length,
        totalDays: leaveRequests.reduce((sum, r) => sum + r.days, 0),
        averageDays: Math.round(leaveRequests.reduce((sum, r) => sum + r.days, 0) / leaveRequests.length) || 0
      }
    };
    setReports(prev => [report, ...prev]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const filteredLeaveRequests = leaveRequests.filter(request => {
    const departmentMatch = selectedDepartment === 'all' || request.department === selectedDepartment;
    const staffMatch = selectedStaff === 'all' || request.staffName === selectedStaff;
    return departmentMatch && staffMatch;
  });

  return (
    <div className="hod-dashboard-container">
      {/* Top Navigation Bar */}
      <header className="hod-top-nav">
        <div className="hod-nav-left">
            <button 
              className="hod-menu-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          <div className="hod-logo-section">
            <img src="/OIP-removebg-preview.png" alt="LeaveLink" className="hod-logo-img" />
            <div className="hod-brand-info">
              <h1 className="hod-brand-name">LeaveLink</h1>
              <span className="hod-brand-subtitle">HOD Management Portal</span>
            </div>
          </div>
        </div>
        
        <div className="hod-nav-center">
          <div className="hod-search-container">
            <input 
              type="search" 
              placeholder="Search staff, requests, departments..." 
              className="hod-global-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="hod-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="hod-nav-right">
          {/* Role Switch */}
          {isHODUser && (
            <div className="hod-role-switch">
              <button 
                className="hod-role-switch-btn"
                onClick={() => setShowRoleSwitch(!showRoleSwitch)}
              >
                {getRoleDisplayName(currentView)} ▼
              </button>
              {showRoleSwitch && (
                <div className="hod-role-dropdown">
                  <button 
                    className={`hod-role-option ${currentView === 'user' ? 'active' : ''}`}
                    onClick={() => handleRoleSwitch('user')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    User Account
                  </button>
                  <button 
                    className={`hod-role-option ${currentView === 'hod' ? 'active' : ''}`}
                    onClick={() => handleRoleSwitch('hod')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 22V4C6 3.46957 6.21071 2.96086 6.58579 2.58579C6.96086 2.21071 7.46957 2 8 2H16C16.5304 2 17.0391 2.21071 17.4142 2.58579C17.7893 2.96086 18 3.46957 18 4V22L14 20L10 22L6 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 14H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    HOD Account
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button 
            className="hod-notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="hod-notification-badge">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          
          <div className="hod-user-profile">
            <div className="hod-user-details">
              <span className="hod-user-name">{user?.fullName || 'HOD'}</span>
              <span className="hod-user-role">Head of Department</span>
            </div>
            <button className="hod-logout-btn" onClick={onLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="hod-main-content">
        {/* Welcome Section */}
        <div className="hod-welcome-section">
          <div className="hod-welcome-content">
            <h2 className="hod-welcome-title">
              Welcome back, Dr. {user?.fullName || 'HOD'}
            </h2>
            <p className="hod-welcome-subtitle">
              Manage your department's leave requests and staff efficiently
            </p>
          </div>
          <div className="hod-welcome-actions">
            <button className="hod-quick-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quick Approve
            </button>
            <button className="hod-quick-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Generate Report
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="hod-dashboard-grid">
          {/* Stats Cards */}
          <div className="hod-stats-section">
            <div className="hod-stat-card">
              <div className="hod-stat-icon pending">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="hod-stat-content">
                <h3 className="hod-stat-number">{pendingApprovals.length}</h3>
                <p className="hod-stat-label">Pending Approvals</p>
              </div>
            </div>

            <div className="hod-stat-card">
              <div className="hod-stat-icon approved">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="hod-stat-content">
                <h3 className="hod-stat-number">{leaveRequests.filter(r => r.status === 'approved').length}</h3>
                <p className="hod-stat-label">Approved This Month</p>
              </div>
            </div>

            <div className="hod-stat-card">
              <div className="hod-stat-icon staff">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="hod-stat-content">
                <h3 className="hod-stat-number">24</h3>
                <p className="hod-stat-label">Department Staff</p>
              </div>
            </div>

            <div className="hod-stat-card">
              <div className="hod-stat-icon leave">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="hod-stat-content">
                <h3 className="hod-stat-number">{leaveRequests.length}</h3>
                <p className="hod-stat-label">Total Requests</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="hod-content-grid">
            {/* Recent Requests */}
            <div className="hod-content-card">
              <div className="hod-card-header">
                <h3 className="hod-card-title">Recent Leave Requests</h3>
                <button className="hod-card-action">View All</button>
              </div>
              <div className="hod-card-content">
                <div className="hod-requests-list">
                  {leaveRequests.slice(0, 5).map((request, index) => (
                    <div key={index} className="hod-request-item">
                      <div className="hod-request-info">
                        <h4 className="hod-request-staff">{request.staffName}</h4>
                        <p className="hod-request-details">
                          {request.leaveType} • {request.startDate} - {request.endDate}
                        </p>
                      </div>
                      <div className="hod-request-status">
                        <span 
                          className={`hod-status-badge ${request.status}`}
                          style={{ backgroundColor: getStatusColor(request.status) }}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hod-content-card">
              <div className="hod-card-header">
                <h3 className="hod-card-title">Quick Actions</h3>
              </div>
              <div className="hod-card-content">
                <div className="hod-quick-actions">
                  <button 
                    className="hod-action-btn"
                    onClick={() => setActiveSection('approve-reject')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Approve/Reject Requests
                  </button>
                  
                  <button 
                    className="hod-action-btn"
                    onClick={() => setActiveSection('leave-calendar')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    View Leave Calendar
                  </button>
                  
                  <button 
                    className="hod-action-btn"
                    onClick={() => setActiveSection('staff-directory')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Manage Staff
                  </button>
                  
                  <button 
                    className="hod-action-btn"
                    onClick={() => setActiveSection('reports')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Generate Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Sidebar */}
        <aside className={`hod-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="hod-sidebar-nav">
            <div className="hod-nav-group">
              <h3 className="hod-nav-group-title">Overview</h3>
              <ul className="hod-nav-list">
          <li 
                  className={`hod-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveSection('dashboard')}
          >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Dashboard</span>
          </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'pending-approvals' ? 'active' : ''}`}
                  onClick={() => setActiveSection('pending-approvals')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Pending Approvals</span>
                  {pendingApprovals.length > 0 && (
                    <span className="hod-nav-badge">
                      {pendingApprovals.length}
                    </span>
                  )}
                </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'department-overview' ? 'active' : ''}`}
                  onClick={() => setActiveSection('department-overview')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Department Overview</span>
                </li>
              </ul>
            </div>
            
            <div className="hod-nav-group">
              <h3 className="hod-nav-group-title">Leave Management</h3>
              <ul className="hod-nav-list">
          <li 
            className={`hod-nav-item ${activeSection === 'leave-requests' ? 'active' : ''}`}
            onClick={() => setActiveSection('leave-requests')}
          >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">All Leave Requests</span>
                  {leaveRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="hod-nav-badge">
                      {leaveRequests.filter(r => r.status === 'pending').length}
                    </span>
                  )}
                </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'approve-reject' ? 'active' : ''}`}
                  onClick={() => setActiveSection('approve-reject')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Approve/Reject</span>
                  {pendingApprovals.length > 0 && (
                    <span className="hod-nav-badge">
                      {pendingApprovals.length}
                    </span>
                  )}
                </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'leave-calendar' ? 'active' : ''}`}
                  onClick={() => setActiveSection('leave-calendar')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Leave Calendar</span>
          </li>
          <li 
                  className={`hod-nav-item ${activeSection === 'leave-balances' ? 'active' : ''}`}
                  onClick={() => setActiveSection('leave-balances')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Leave Balances</span>
                </li>
              </ul>
            </div>
            
            <div className="hod-nav-group">
              <h3 className="hod-nav-group-title">Staff Management</h3>
              <ul className="hod-nav-list">
                <li 
                  className={`hod-nav-item ${activeSection === 'staff-directory' ? 'active' : ''}`}
                  onClick={() => setActiveSection('staff-directory')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Staff Directory</span>
          </li>
          <li 
                  className={`hod-nav-item ${activeSection === 'lecturers' ? 'active' : ''}`}
                  onClick={() => setActiveSection('lecturers')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Lecturers</span>
          </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'role-management' ? 'active' : ''}`}
                  onClick={() => setActiveSection('role-management')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5166 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.87653 17.3663 4.02405 17.1457 4.21 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01062 9.77251C4.27925 9.5799 4.48278 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.77588C6.63368 3.87653 6.85425 4.02405 7.04 4.21L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Role Management</span>
                </li>
              </ul>
            </div>
            
            <div className="hod-nav-group">
              <h3 className="hod-nav-group-title">Reports & Analytics</h3>
              <ul className="hod-nav-list">
          <li 
                  className={`hod-nav-item ${activeSection === 'monthly-reports' ? 'active' : ''}`}
                  onClick={() => setActiveSection('monthly-reports')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Monthly Reports</span>
                </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'leave-statistics' ? 'active' : ''}`}
                  onClick={() => setActiveSection('leave-statistics')}
          >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Leave Statistics</span>
                </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'department-reports' ? 'active' : ''}`}
                  onClick={() => setActiveSection('department-reports')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 9L12 6L16 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Department Reports</span>
                </li>
                <li 
                  className={`hod-nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveSection('analytics')}
                >
                  <span className="hod-nav-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5166 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.87653 17.3663 4.02405 17.1457 4.21 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01062 9.77251C4.27925 9.5799 4.48278 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.77588C6.63368 3.87653 6.85425 4.02405 7.04 4.21L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="hod-nav-text">Analytics</span>
          </li>
        </ul>
            </div>
          </nav>
      </aside>

        {/* Main Content Area */}
        <main className="hod-main-content">
          {/* Modern Header */}
          <div className="hod-modern-header">
            <div className="hod-header-content">
              <div className="hod-header-left">
                <h1 className="hod-main-title">
                {activeSection === 'overview' && 'Dashboard Overview'}
                {activeSection === 'analytics' && 'Analytics & Insights'}
                  {activeSection === 'leave-requests' && 'Leave Management'}
                {activeSection === 'leave-calendar' && 'Leave Calendar'}
                {activeSection === 'leave-policies' && 'Leave Policies'}
                {activeSection === 'staff-directory' && 'Staff Directory'}
                {activeSection === 'attendance' && 'Attendance Management'}
                {activeSection === 'performance' && 'Performance Tracking'}
                {activeSection === 'reports' && 'Reports & Statistics'}
                {activeSection === 'settings' && 'System Settings'}
                </h1>
                <p className="hod-header-subtitle">
                {activeSection === 'overview' && 'Monitor department activities and key metrics'}
                {activeSection === 'analytics' && 'Analyze trends and performance data'}
                {activeSection === 'leave-requests' && 'Review and manage staff leave requests'}
                {activeSection === 'leave-calendar' && 'View leave schedule and availability'}
                {activeSection === 'leave-policies' && 'Configure leave policies and rules'}
                {activeSection === 'staff-directory' && 'Manage staff information and accounts'}
                {activeSection === 'attendance' && 'Track staff attendance and punctuality'}
                {activeSection === 'performance' && 'Monitor staff performance metrics'}
                {activeSection === 'reports' && 'Generate and view detailed reports'}
                {activeSection === 'settings' && 'Configure system settings and preferences'}
              </p>
            </div>
            
            <div className="hod-header-actions">
              {activeSection === 'leave-requests' && (
                <div className="hod-filter-controls">
                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="hod-filter-select"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                  <select 
                    value={selectedStaff} 
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="hod-filter-select"
                  >
                    <option value="all">All Staff</option>
                    {staff.map(staffMember => (
                      <option key={staffMember.id} value={staffMember.name}>{staffMember.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <button className="hod-primary-btn">
                {activeSection === 'leave-requests' && '📋 New Request'}
                {activeSection === 'staff-directory' && '👤 Add Staff'}
                {activeSection === 'reports' && '📊 Generate Report'}
                {activeSection === 'settings' && '💾 Save Changes'}
                {!['leave-requests', 'staff-directory', 'reports', 'settings'].includes(activeSection) && '➕ Quick Action'}
              </button>
              </div>
            </div>
          </div>

          <div className="hod-content">
            {/* Welcome Section */}
            <div className="hod-welcome-section">
              <div className="hod-welcome-content">
                <div className="hod-welcome-text">
                  <h2>Welcome back, {user?.fullName || user?.username || 'HOD'}!</h2>
                  <p>
                    <span className="hod-role-badge">Head of Department</span>
                    <span className="hod-dept-info">• {user?.department?.name || 'Information Technology'}</span>
                    {isHODUser && (
                      <span className="hod-role-indicator">
                        • Currently viewing: <strong>{getRoleDisplayName(currentView)}</strong>
                      </span>
                    )}
                  </p>
                </div>
                <div className="hod-welcome-stats">
                  <div className="hod-quick-stat">
                    <span className="hod-stat-number">{departmentStats.pendingRequests}</span>
                    <span className="hod-stat-label">Pending</span>
                  </div>
                  <div className="hod-quick-stat">
                    <span className="hod-stat-number">{departmentStats.totalStaff}</span>
                    <span className="hod-stat-label">Staff</span>
                  </div>
                  <div className="hod-quick-stat">
                    <span className="hod-stat-number">{quickStats.approvalRate}%</span>
                    <span className="hod-stat-label">Approval Rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Overview Section */}
            {activeSection === 'overview' && (
              <div className="hod-modern-overview">
                {/* Key Metrics Cards */}
                <div className="hod-metrics-grid">
                  <div className="hod-metric-card primary">
                    <div className="hod-metric-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="hod-metric-content">
                      <div className="hod-metric-value">{departmentStats.pendingRequests}</div>
                      <div className="hod-metric-label">Pending Approvals</div>
                      <div className="hod-metric-change positive">+2 from yesterday</div>
                </div>
                    </div>
                  
                  <div className="hod-metric-card success">
                    <div className="hod-metric-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                </div>
                    <div className="hod-metric-content">
                      <div className="hod-metric-value">{departmentStats.totalStaff}</div>
                      <div className="hod-metric-label">Total Staff</div>
                      <div className="hod-metric-change neutral">All active</div>
                    </div>
                </div>
                  
                  <div className="hod-metric-card warning">
                    <div className="hod-metric-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="hod-metric-content">
                      <div className="hod-metric-value">{departmentStats.onLeave}</div>
                      <div className="hod-metric-label">Currently on Leave</div>
                      <div className="hod-metric-change neutral">This week</div>
                </div>
              </div>

                  <div className="hod-metric-card info">
                    <div className="hod-metric-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="hod-metric-content">
                      <div className="hod-metric-value">{quickStats.approvalRate}%</div>
                      <div className="hod-metric-label">Approval Rate</div>
                      <div className="hod-metric-change positive">+5% this month</div>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="hod-content-grid">
                  {/* Recent Activity */}
                  <div className="hod-activity-section">
                    <div className="hod-section-header">
                      <h3>Recent Activity</h3>
                      <button className="hod-view-all-btn">View All</button>
                    </div>
                    <div className="hod-activity-list">
                      {recentActivity.map((activity, index) => (
                        <div key={activity.id} className="hod-activity-item">
                          <div className="hod-activity-icon">
                            {activity.status === 'pending' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            {activity.status === 'approved' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            {activity.status === 'rejected' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="hod-activity-content">
                            <div className="hod-activity-title">
                              {activity.staffName} - {activity.leaveType}
                            </div>
                            <div className="hod-activity-details">
                              {activity.days} days • {activity.startDate} - {activity.endDate}
                            </div>
                          </div>
                          <div className="hod-activity-status">
                        <span 
                              className={`hod-status-badge ${activity.status}`}
                              style={{ backgroundColor: getStatusColor(activity.status) }}
                        >
                              {activity.status}
                        </span>
                      </div>
                        </div>
                      ))}
                        </div>
                      </div>

                  {/* Quick Actions */}
                  <div className="hod-quick-actions-section">
                    <div className="hod-section-header">
                      <h3>Quick Actions</h3>
                    </div>
                    <div className="hod-quick-actions-grid">
                          <button 
                        className="hod-quick-action-card"
                        onClick={() => setActiveSection('leave-requests')}
                      >
                        <div className="hod-quick-action-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="hod-quick-action-content">
                          <div className="hod-quick-action-title">Review Requests</div>
                          <div className="hod-quick-action-desc">{departmentStats.pendingRequests} pending</div>
                        </div>
                          </button>
                      
                          <button 
                        className="hod-quick-action-card"
                        onClick={() => setActiveSection('staff-directory')}
                      >
                        <div className="hod-quick-action-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="hod-quick-action-content">
                          <div className="hod-quick-action-title">Staff Directory</div>
                          <div className="hod-quick-action-desc">{departmentStats.totalStaff} members</div>
                        </div>
                          </button>
                      
                      <button 
                        className="hod-quick-action-card"
                        onClick={() => setActiveSection('reports')}
                      >
                        <div className="hod-quick-action-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="hod-quick-action-content">
                          <div className="hod-quick-action-title">Generate Report</div>
                          <div className="hod-quick-action-desc">Monthly analytics</div>
                    </div>
                      </button>
                      
                      <button 
                        className="hod-quick-action-card"
                        onClick={() => setActiveSection('analytics')}
                      >
                        <div className="hod-quick-action-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 9L12 6L16 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                </div>
                        <div className="hod-quick-action-content">
                          <div className="hod-quick-action-title">Analytics</div>
                          <div className="hod-quick-action-desc">View insights</div>
              </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Urgent Requests Alert */}
                {urgentRequests.length > 0 && (
                  <div className="hod-urgent-alert">
                    <div className="hod-alert-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.29 3.86L1.82 18C1.64547 18.3024 1.5729 18.6453 1.60217 18.9875C1.63144 19.3297 1.76126 19.6577 1.97631 19.9255C2.19135 20.1933 2.48318 20.3892 2.81463 20.4879C3.14607 20.5866 3.50334 20.5841 3.833 20.48L12 18L20.167 20.48C20.4967 20.5841 20.8539 20.5866 21.1854 20.4879C21.5168 20.3892 21.8087 20.1933 22.0237 19.9255C22.2387 19.6577 22.3686 19.3297 22.3978 18.9875C22.4271 18.6453 22.3545 18.3024 22.18 18L13.71 3.86C13.5318 3.56631 13.2807 3.32312 12.9812 3.15447C12.6817 2.98582 12.3438 2.89725 12 2.89725C11.6562 2.89725 11.3183 2.98582 11.0188 3.15447C10.7193 3.32312 10.4682 3.56631 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="hod-alert-content">
                      <div className="hod-alert-title">Urgent Leave Requests</div>
                      <div className="hod-alert-message">
                        You have {urgentRequests.length} urgent leave request{urgentRequests.length > 1 ? 's' : ''} that require immediate attention.
                      </div>
                    </div>
                    <button 
                      className="hod-alert-action"
                      onClick={() => setActiveSection('leave-requests')}
                    >
                      Review Now
                    </button>
                  </div>
                )}
            </div>
            )}

            {/* Leave Requests Management */}
            {activeSection === 'leave-requests' && (
              <div className="hod-leave-requests">
                <div className="hod-section-header">
                  <h2>Leave Requests Management</h2>
                  <div className="hod-filters">
                    <select 
                      value={selectedDepartment} 
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="hod-filter-select"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                    <select 
                      value={selectedStaff} 
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      className="hod-filter-select"
                    >
                      <option value="all">All Staff</option>
                      {staff.map(staffMember => (
                        <option key={staffMember.id} value={staffMember.name}>{staffMember.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredLeaveRequests.length === 0 ? (
                  <div className="hod-empty-state">
                    <div className="hod-empty-icon">📋</div>
                    <h3>No Leave Requests</h3>
                    <p>No leave requests found. Staff members can submit leave requests through their dashboard.</p>
                  </div>
                ) : (
                  <div className="hod-table-container">
                    <table className="hod-table">
                      <thead>
                        <tr>
                          <th>Staff Name</th>
                          <th>Department</th>
                          <th>Leave Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Days</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeaveRequests.map(request => (
                        <tr key={request.id}>
                          <td>
                            <div className="hod-staff-info">
                              <div className="hod-staff-name">{request.staffName}</div>
                              <div className="hod-staff-email">{request.staffEmail}</div>
                            </div>
                          </td>
                          <td>{request.department}</td>
                          <td>{request.leaveType}</td>
                          <td>{request.startDate}</td>
                          <td>{request.endDate}</td>
                          <td>{request.days}</td>
                          <td>{request.reason}</td>
                          <td>
                            <span 
                              className="hod-status-badge"
                              style={{ backgroundColor: getStatusColor(request.status) }}
                            >
                              {getStatusIcon(request.status)} {request.status}
                            </span>
                          </td>
                          <td>
                            {request.status === 'pending' && (
                              <div className="hod-action-buttons">
                                <button 
                                  className="hod-approve-btn-small"
                                  onClick={() => handleApproveRequest(request.id)}
                                  title="Approve Request"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                                <button 
                                  className="hod-reject-btn-small"
                                  onClick={() => handleRejectRequest(request.id)}
                                  title="Reject Request"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Staff Directory */}
            {activeSection === 'staff-directory' && (
              <div className="hod-staff-directory">
                <div className="hod-directory-header">
                  <h3>Staff Directory</h3>
                  <button className="hod-primary-btn">👤 Add New Staff</button>
                </div>
                {staff.length === 0 ? (
                  <div className="hod-empty-state">
                    <div className="hod-empty-icon">👥</div>
                    <h3>No Staff Members</h3>
                    <p>No staff members found in your department. Add staff members to get started.</p>
                  </div>
                ) : (
                  <div className="hod-table-container">
                    <table className="hod-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Position</th>
                          <th>Department</th>
                          <th>Email</th>
                          <th>EPF</th>
                          <th>Status</th>
                          <th>Last Active</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.map(staffMember => (
                        <tr key={staffMember.id}>
                          <td>
                            <div className="hod-staff-info">
                              <div className="hod-staff-name">{staffMember.name}</div>
                              <div className="hod-staff-email">{staffMember.email}</div>
                            </div>
                          </td>
                          <td>{staffMember.position}</td>
                          <td>{staffMember.department}</td>
                          <td>{staffMember.email}</td>
                          <td>{staffMember.epf}</td>
                          <td>
                            <span className={`hod-status-badge ${staffMember.status === 'active' ? 'active' : 'inactive'}`}>
                              {staffMember.status === 'active' ? (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Active
                                </>
                              ) : (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Inactive
                                </>
                              )}
                            </span>
                          </td>
                          <td>{staffMember.lastActive}</td>
                          <td>
                            <div className="hod-action-buttons">
                              <button className="hod-edit-btn" title="Edit Staff">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <button className="hod-delete-btn" title="Delete Staff">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Reports */}
            {activeSection === 'reports' && (
              <div className="hod-reports">
                <div className="hod-section-header">
                  <h2>Reports & Statistics</h2>
                  <button className="hod-generate-btn" onClick={generateMonthlyReport}>
                    📊 Generate Monthly Report
                  </button>
                </div>

                <div className="hod-report-filters">
                  <div className="hod-filter-group">
                    <label>Start Date:</label>
                    <input 
                      type="date" 
                      value={selectedDateRange.startDate}
                      onChange={(e) => setSelectedDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="hod-date-input"
                    />
                  </div>
                  <div className="hod-filter-group">
                    <label>End Date:</label>
                    <input 
                      type="date" 
                      value={selectedDateRange.endDate}
                      onChange={(e) => setSelectedDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="hod-date-input"
                    />
                  </div>
                  <div className="hod-filter-group">
                    <label>Department:</label>
                    <select 
                      value={selectedDepartment} 
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="hod-filter-select"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="hod-filter-group">
                    <label>Staff:</label>
                    <select 
                      value={selectedStaff} 
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      className="hod-filter-select"
                    >
                      <option value="all">All Staff</option>
                      {staff.map(staffMember => (
                        <option key={staffMember.id} value={staffMember.name}>{staffMember.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="hod-reports-list">
                  <h3>Generated Reports</h3>
                  {reports.map(report => (
                    <div key={report.id} className="hod-report-card">
                      <div className="hod-report-header">
                        <h4>{report.title}</h4>
                        <span className="hod-report-date">{report.generatedDate}</span>
                      </div>
                      <div className="hod-report-stats">
                        <div className="hod-report-stat">
                          <span className="hod-stat-label">Total Requests:</span>
                          <span className="hod-stat-value">{report.data.totalRequests}</span>
                        </div>
                        <div className="hod-report-stat">
                          <span className="hod-stat-label">Approved:</span>
                          <span className="hod-stat-value approved">{report.data.approved}</span>
                        </div>
                        <div className="hod-report-stat">
                          <span className="hod-stat-label">Rejected:</span>
                          <span className="hod-stat-value rejected">{report.data.rejected}</span>
                        </div>
                        <div className="hod-report-stat">
                          <span className="hod-stat-label">Pending:</span>
                          <span className="hod-stat-value pending">{report.data.pending}</span>
                        </div>
                        <div className="hod-report-stat">
                          <span className="hod-stat-label">Total Days:</span>
                          <span className="hod-stat-value">{report.data.totalDays}</span>
                        </div>
                        <div className="hod-report-stat">
                          <span className="hod-stat-label">Average Days:</span>
                          <span className="hod-stat-value">{report.data.averageDays}</span>
                        </div>
                      </div>
                      <div className="hod-report-actions">
                        <button className="hod-download-btn">📥 Download PDF</button>
                        <button className="hod-view-btn">👁️ View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Panel */}
            {showNotifications && (
              <div className="hod-notifications-panel">
                <div className="hod-notifications-header">
                  <h3>Notifications</h3>
                  <button 
                    className="hod-close-btn"
                    onClick={() => setShowNotifications(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="hod-notifications-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`hod-notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <div className="hod-notification-icon">
                        {notification.type === 'leave_request' && '📋'}
                        {notification.type === 'approval' && '✅'}
                        {notification.type === 'urgent' && '🚨'}
                        {notification.type === 'system' && '⚙️'}
                        {notification.type === 'reminder' && '⏰'}
                      </div>
                      <div className="hod-notification-content">
                        <div className="hod-notification-title">{notification.title}</div>
                        <div className="hod-notification-message">{notification.message}</div>
                        <div className="hod-notification-time">{notification.time}</div>
                      </div>
                      {!notification.read && <div className="hod-notification-dot"></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        </div>
    </div>
  );
}
