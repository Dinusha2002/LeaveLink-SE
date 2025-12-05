import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ApplyLeave from './ApplyLeave';
import LeaveBalance from './LeaveBalance';
import LeaveHistory from './LeaveHistory';
import LeaveBalanceSummary from './LeaveBalanceSummary';
import UserProfile from './UserProfile';
import MyLeaves from './MyLeaves';
import Settings from './Settings';
import './UserDashboard.css';
import { calculateLeaveBalance, getLeaveTypesForPosition, formatLeaveDisplay } from '../utils/leaveCalculations';

// Dashboard configuration for different user roles
const getDashboardConfig = (role, userData) => {
  const baseConfig = {
    title: 'Dashboard',
    role: role,
    user: userData,
    sidebarItems: [
      { id: 'dashboard', label: 'Dashboard', active: true, icon: 'home' },
      { id: 'leaves', label: 'My Leaves', active: false, icon: 'file-text' },
      { id: 'balance', label: 'Leave Balance', active: false, icon: 'dollar-sign' },
      { id: 'balance-summary', label: 'Balance Summary', active: false, icon: 'bar-chart' },
      { id: 'history', label: 'Leave History', active: false, icon: 'clock' },
      { id: 'profile', label: 'Profile', active: false, icon: 'user' },
      { id: 'settings', label: 'Settings', active: false, icon: 'settings' },
    ],
    stats: [],
    tools: [],
    activities: []
  };

  switch (role.toLowerCase()) {
    case 'academic':
    case 'academic staff':
      return {
        ...baseConfig,
        title: 'Academic Staff Dashboard',
        role: 'Academic Staff',
        stats: [
          { icon: 'calendar', value: '25', title: 'Total Leave Days', desc: 'Annual leave allocation' },
          { icon: 'clock', value: '2', title: 'Pending Requests', desc: 'Awaiting approval' },
          { icon: 'check-circle', value: '15', title: 'Approved This Year', desc: 'Successfully approved' },
          { icon: 'trending-up', value: '10', title: 'Remaining Days', desc: 'Available for use' }
        ],
        tools: [
          { icon: 'plus-circle', title: 'Apply for Leave', desc: 'Submit new leave request', action: 'apply-leave' },
          { icon: 'calendar', title: 'View Calendar', desc: 'Check leave calendar', action: 'view-calendar' },
          { icon: 'dollar-sign', title: 'Check Balance', desc: 'View leave balance', action: 'check-balance' },
          { icon: 'bar-chart', title: 'Download Reports', desc: 'Generate leave reports', action: 'download-reports' },
        ],
        activities: [
          { action: 'Leave request submitted', user: userData?.fullName || 'You', date: '2024-01-15', status: 'Pending' },
          { action: 'Leave request approved', user: 'HOD', date: '2024-01-10', status: 'Approved' },
          { action: 'Profile updated', user: userData?.fullName || 'You', date: '2024-01-08', status: 'Completed' }
        ]
      };

    case 'non-academic':
    case 'non-academic staff':
      return {
        ...baseConfig,
        title: 'Non-Academic Staff Dashboard',
        role: 'Non-Academic Staff',
        stats: [
          { icon: 'calendar', value: '20', title: 'Total Leave Days', desc: 'Annual leave allocation' },
          { icon: 'clock', value: '1', title: 'Pending Requests', desc: 'Awaiting approval' },
          { icon: 'check-circle', value: '12', title: 'Approved This Year', desc: 'Successfully approved' },
          { icon: 'trending-up', value: '8', title: 'Remaining Days', desc: 'Available for use' }
        ],
        tools: [
          { icon: 'plus-circle', title: 'Apply for Leave', desc: 'Submit new leave request', action: 'apply-leave' },
          { icon: 'calendar', title: 'View Schedule', desc: 'Check work schedule', action: 'view-schedule' },
          { icon: 'dollar-sign', title: 'Check Balance', desc: 'View leave balance', action: 'check-balance' },
          { icon: 'bar-chart', title: 'View Reports', desc: 'Access leave reports', action: 'view-reports' }
        ],
        activities: [
          { action: 'Leave request submitted', user: userData?.fullName || 'You', date: '2024-01-15', status: 'Pending' },
          { action: 'Leave request approved', user: 'Supervisor', date: '2024-01-10', status: 'Approved' },
          { action: 'Profile updated', user: userData?.fullName || 'You', date: '2024-01-08', status: 'Completed' }
        ]
      };


    case 'dean':
      return {
        ...baseConfig,
        title: 'Dean Dashboard',
        role: 'Dean',
        stats: [
          { icon: 'building', value: '5', title: 'Total Departments', desc: 'Under management' },
          { icon: 'clock', value: '15', title: 'Pending Requests', desc: 'Awaiting approval' },
          { icon: 'check-circle', value: '45', title: 'Approved This Month', desc: 'Successfully approved' },
          { icon: 'star', value: '4.9', title: 'Faculty Rating', desc: 'Overall satisfaction' }
        ],
        tools: [
          { icon: 'check-circle', title: 'Approve Requests', desc: 'Review and approve leaves', action: 'approve-requests' },
          { icon: 'bar-chart', title: 'Faculty Reports', desc: 'Comprehensive analytics', action: 'view-reports' },
          { icon: 'building', title: 'Manage Departments', desc: 'Department oversight', action: 'manage-departments' },
          { icon: 'settings', title: 'Faculty Settings', desc: 'Faculty-wide settings', action: 'settings' }
        ],
        activities: [
          { action: 'Faculty policy updated', user: userData?.fullName || 'You', date: '2024-01-15', status: 'Completed' },
          { action: 'Department report reviewed', user: userData?.fullName || 'You', date: '2024-01-14', status: 'Completed' },
          { action: 'Leave request approved', user: userData?.fullName || 'You', date: '2024-01-13', status: 'Approved' }
        ]
      };

    case 'ma':
    case 'management assistant':
      return {
        ...baseConfig,
        title: 'Management Assistant Dashboard',
        role: 'Management Assistant',
        stats: [
          { icon: 'file-text', value: '120', title: 'Total Requests', desc: 'Processed this month' },
          { icon: 'clock', value: '25', title: 'Pending Tasks', desc: 'Awaiting processing' },
          { icon: 'check-circle', value: '95', title: 'Completed Tasks', desc: 'Successfully processed' },
          { icon: 'trending-up', value: '98%', title: 'Efficiency Rate', desc: 'Task completion rate' }
        ],
        tools: [
          { icon: 'plus-circle', title: 'Process Requests', desc: 'Handle leave requests', action: 'process-requests' },
          { icon: 'bar-chart', title: 'Generate Reports', desc: 'Create management reports', action: 'generate-reports' },
          { icon: 'calendar', title: 'Schedule Management', desc: 'Manage schedules', action: 'manage-schedule' },
          { icon: 'settings', title: 'System Settings', desc: 'Configure system', action: 'settings' }
        ],
        activities: [
          { action: 'Bulk request processed', user: userData?.fullName || 'You', date: '2024-01-15', status: 'Completed' },
          { action: 'Report generated', user: userData?.fullName || 'You', date: '2024-01-14', status: 'Completed' },
          { action: 'Schedule updated', user: userData?.fullName || 'You', date: '2024-01-13', status: 'Completed' }
        ]
      };

    default:
      return baseConfig;
  }
};

export default function UserDashboard({ user, onLogout }) {
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('academic'); // Default to academic role
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [isHODUser, setIsHODUser] = useState(false); // Check if user has HOD role
  const [currentView, setCurrentView] = useState('user'); // 'user' or 'hod'
  const navigate = useNavigate();
  const location = useLocation();
  const [flash, setFlash] = useState(location.state?.flash || '');
  
  // Initialize with empty data - will be populated from database
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [calculatedLeaves, setCalculatedLeaves] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    availableDays: 0,
    pendingRequests: 0,
    approvedThisYear: 0,
    upcomingLeave: 0
  });
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [showApplyLeave, setShowApplyLeave] = useState(false);
  const [showLeaveBalance, setShowLeaveBalance] = useState(false);
  const [showLeaveHistory, setShowLeaveHistory] = useState(false);
  const [showLeaveBalanceSummary, setShowLeaveBalanceSummary] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMyLeaves, setShowMyLeaves] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  // Settings state management
  const [settings, setSettings] = useState({
    personalInfo: {
      contactNumber: user?.contactNumber || '',
    },
    notifications: {
      emailNotifications: true,
      leaveReminders: true,
      approvalUpdates: true,
      systemUpdates: false
    },
    preferences: {
      darkMode: false,
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeZone: 'Asia/Colombo'
    },
    privacy: {
      dataAnalytics: true,
      profileVisibility: true
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Helper function to get department name
  const getDepartmentName = (department) => {
    if (!department) return 'N/A';
    if (typeof department === 'string') return department;
    if (typeof department === 'object' && department.name) return department.name;
    return 'N/A';
  };

  // Settings handlers
  const handlePersonalInfoChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save settings to localStorage and potentially to backend
  const saveSettings = async (settingsType, data) => {
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsMessage('');

    try {
      // Save to localStorage for immediate persistence
      const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      const updatedSettings = {
        ...currentSettings,
        [settingsType]: data
      };
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));

      // Here you would typically make an API call to save to backend
      // await api.put('/user/settings', { [settingsType]: data });

      setSettingsMessage(`${settingsType} settings saved successfully!`);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSettingsMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error saving settings:', error);
      setSettingsError(`Failed to save ${settingsType} settings. Please try again.`);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSettingsError('');
      }, 5000);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Handle personal information update
  const handleUpdatePersonalInfo = async () => {
    await saveSettings('personalInfo', settings.personalInfo);
  };

  // Handle notification settings update
  const handleUpdateNotifications = async () => {
    await saveSettings('notifications', settings.notifications);
  };

  // Handle preferences update
  const handleUpdatePreferences = async () => {
    await saveSettings('preferences', settings.preferences);
    
    // Apply dark mode if enabled
    if (settings.preferences.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Handle privacy settings update
  const handleUpdatePrivacy = async () => {
    await saveSettings('privacy', settings.privacy);
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSettingsError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSettingsError('Password must be at least 6 characters long');
      return;
    }

    setSettingsLoading(true);
    setSettingsError('');
    setSettingsMessage('');

    try {
      // Here you would typically make an API call to change password
      // await api.put('/user/change-password', {
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // });

      // For now, just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSettingsMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setSettingsMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error changing password:', error);
      setSettingsError('Failed to change password. Please check your current password and try again.');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSettingsError('');
      }, 5000);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Handle data export
  const handleExportData = async () => {
    try {
      const userData = {
        personalInfo: user,
        settings: settings,
        leaveBalance: leaveBalance,
        leaveHistory: leaveHistory,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-${user?.fullName?.replace(/\s+/g, '-') || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSettingsMessage('Data exported successfully!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSettingsError('Failed to export data. Please try again.');
      setTimeout(() => setSettingsError(''), 5000);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.'
    );
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'This is your final warning. Your account and all associated data will be permanently deleted. Type "DELETE" to confirm.'
      );
      
      if (doubleConfirmed) {
        // Here you would typically make an API call to delete the account
        // await api.delete('/user/account');
        console.log('Account deletion requested');
        setSettingsMessage('Account deletion request submitted. You will be logged out shortly.');
        setTimeout(() => {
          onLogout();
        }, 3000);
      }
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(prev => ({
            ...prev,
            ...parsedSettings
          }));
          console.log('Settings loaded from localStorage');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Auto-save notification settings when they change
  useEffect(() => {
    const saveNotifications = async () => {
      if (settings.notifications) {
        await saveSettings('notifications', settings.notifications);
      }
    };

    // Only save if settings have been initialized (not the initial load)
    if (settings.notifications && Object.keys(settings.notifications).length > 0) {
      const timeoutId = setTimeout(saveNotifications, 1000); // Debounce for 1 second
      return () => clearTimeout(timeoutId);
    }
  }, [settings.notifications]);

  // Auto-save preference settings when they change
  useEffect(() => {
    const savePreferences = async () => {
      if (settings.preferences) {
        await saveSettings('preferences', settings.preferences);
        
        // Apply dark mode immediately
        if (settings.preferences.darkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }
    };

    // Only save if settings have been initialized (not the initial load)
    if (settings.preferences && Object.keys(settings.preferences).length > 0) {
      const timeoutId = setTimeout(savePreferences, 1000); // Debounce for 1 second
      return () => clearTimeout(timeoutId);
    }
  }, [settings.preferences]);

  // Auto-save privacy settings when they change
  useEffect(() => {
    const savePrivacy = async () => {
      if (settings.privacy) {
        await saveSettings('privacy', settings.privacy);
      }
    };

    // Only save if settings have been initialized (not the initial load)
    if (settings.privacy && Object.keys(settings.privacy).length > 0) {
      const timeoutId = setTimeout(savePrivacy, 1000); // Debounce for 1 second
      return () => clearTimeout(timeoutId);
    }
  }, [settings.privacy]);


  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to calculate days between dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  };

  // Fetch user dashboard data from database
  const fetchUserDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsLoadingData(true);
      
      // Fetch user's leave requests
      const leaveRequestsResponse = await fetch('/api/leave-requests/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (leaveRequestsResponse.ok) {
        const leaveRequests = await leaveRequestsResponse.json();
        
        // Calculate dashboard stats
        const currentYear = new Date().getFullYear();
        const currentDate = new Date();
        
        const availableDays = calculatedLeaves.reduce((total, leave) => total + (leave.remaining || 0), 0);
        const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length;
        const approvedThisYear = leaveRequests.filter(req => 
          req.status === 'approved' && 
          new Date(req.startDate).getFullYear() === currentYear
        ).length;
        
        // Get upcoming approved leaves
        const upcomingLeave = leaveRequests.filter(req => 
          req.status === 'approved' && 
          new Date(req.startDate) > currentDate
        );
        
        setUpcomingLeaves(upcomingLeave.slice(0, 2)); // Show only 2 upcoming leaves
        
        setDashboardStats({
          availableDays,
          pendingRequests,
          approvedThisYear,
          upcomingLeave: upcomingLeave.length
        });
        
        // Set leave history
        setLeaveHistory(leaveRequests);
      }
      
    } catch (error) {
      console.error('Error fetching user dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Debug: Log user data to see department structure
      console.log('User data in UserDashboard:', {
        user,
        department: user.department,
        departmentType: typeof user.department,
        departmentName: user.department?.name
      });
      
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
      setCurrentRole('academic');
      setCurrentView('user'); // Default to user view
      
      // Set initial config only once
      const dashboardConfig = getDashboardConfig(currentRole, user);
      setConfig(dashboardConfig);
      
      // Fetch dashboard data from database
      fetchUserDashboardData();
    }
  }, [user]);

  // Separate useEffect for leave calculations
  useEffect(() => {
    if (user) {
      // Calculate leave balance based on appointment date and position
      const calculatedBalance = calculateLeaveBalance(user);
      setLeaveBalance(calculatedBalance);
      
      // Get leave types for the user's position
      const userLeaveTypes = getLeaveTypesForPosition(user);
      setLeaveTypes(userLeaveTypes);
      
      // Format leave display
      const formattedLeaves = formatLeaveDisplay(calculatedBalance, userLeaveTypes);
      setCalculatedLeaves(formattedLeaves);
    }
  }, [user]);

  useEffect(() => {
    if (flash) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [flash, navigate, location.pathname]);

  // Close role switch dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRoleSwitch && !event.target.closest('.user-role-switch')) {
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

  // Disable cursor blinking
  useEffect(() => {
    const disableCursorBlinking = () => {
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.style.caretColor = 'transparent';
        input.style.animation = 'none';
        input.addEventListener('focus', () => {
          input.style.caretColor = 'transparent';
        });
      });
    };

    // Run immediately and on any DOM changes
    disableCursorBlinking();
    const observer = new MutationObserver(disableCursorBlinking);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  if (!user || !config) {
    return (
      <div className="user-shell">
        <div className="user-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleToolAction = (action) => {
    console.log(`Tool action: ${action}`);
    // Implement specific actions based on the tool clicked
    switch (action) {
      case 'apply-leave':
        handleApplyLeave();
        break;
      case 'view-calendar':
        console.log('Navigate to calendar');
        break;
      case 'check-balance':
        handleCheckBalance();
        break;
      case 'balance-summary':
        console.log('🔍 Balance Summary case triggered');
        handleShowBalanceSummary();
        break;
      case 'view-history':
        handleViewHistory();
        break;
      case 'download-reports':
        console.log('Navigate to reports');
        break;
      case 'approve-requests':
        console.log('Navigate to approval');
        break;
      case 'view-reports':
        console.log('Navigate to reports');
        break;
      case 'manage-staff':
        console.log('Navigate to staff management');
        break;
      default:
        console.log(`Action not implemented: ${action}`);
    }
  };

  const handleSidebarClick = (itemId) => {
    console.log('🔍 Clicking sidebar item:', itemId);
    console.log('🔍 Current config before update:', config);
    setActiveTab(itemId);
    
    // Handle specific sidebar navigation - show as popups
    switch (itemId) {
      case 'balance':
        handleCheckBalance();
        break;
      case 'history':
        handleViewHistory();
        break;
      case 'balance-summary':
        handleShowBalanceSummary();
        break;
      case 'profile':
        handleShowUserProfile();
        break;
      case 'leaves':
        handleShowMyLeaves();
        break;
      case 'settings':
        handleShowSettings();
        break;
      default:
        // For dashboard, just update active state
        break;
    }
    
    // Update sidebar active states
    setConfig(prev => {
      const updatedItems = prev.sidebarItems.map(item => ({
        ...item,
        active: item.id === itemId
      }));
      console.log('🔍 Updated sidebar items:', updatedItems);
      const newConfig = {
        ...prev,
        sidebarItems: updatedItems
      };
      console.log('🔍 New config after update:', newConfig);
      return newConfig;
    });
  };

  const handleRoleSwitch = (newView) => {
    setCurrentView(newView);
    setShowRoleSwitch(false);
    
    if (newView === 'hod') {
      // Navigate to HOD dashboard
      navigate('/hod');
    } else if (newView === 'user') {
      // Stay in current user dashboard
      // No navigation needed, just update the view
      setCurrentView('user');
    }
  };

  const handleApplyLeave = () => {
    setShowApplyLeave(true);
  };

  const handleBackFromApplyLeave = () => {
    setShowApplyLeave(false);
    // Refresh dashboard data after applying for leave
    fetchUserDashboardData();
  };

  const handleCheckBalance = () => {
    setShowLeaveBalance(true);
  };

  const handleBackFromLeaveBalance = () => {
    setShowLeaveBalance(false);
  };

  const handleViewHistory = () => {
    setShowLeaveHistory(true);
  };

  const handleBackFromLeaveHistory = () => {
    setShowLeaveHistory(false);
  };

  const handleShowBalanceSummary = () => {
    console.log('🔍 Opening Leave Balance Summary');
    setShowLeaveBalanceSummary(true);
  };

  const handleBackFromLeaveBalanceSummary = () => {
    setShowLeaveBalanceSummary(false);
  };

  const handleShowUserProfile = () => {
    setShowUserProfile(true);
  };

  const handleBackFromUserProfile = () => {
    setShowUserProfile(false);
  };

  const handleShowMyLeaves = () => {
    setShowMyLeaves(true);
  };

  const handleBackFromMyLeaves = () => {
    setShowMyLeaves(false);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  const handleBackFromSettings = () => {
    setShowSettings(false);
  };




  const getRoleDisplayName = (view) => {
    switch (view) {
      case 'user':
        return 'User Account';
      case 'hod':
        return 'HOD Account';
      default:
        return 'User Account';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'check-circle';
      case 'rejected': return 'x-circle';
      case 'pending': return 'clock';
      default: return 'help-circle';
    }
  };

  // SVG Icon component
  const renderIcon = (iconName, size = 20) => {
    const iconProps = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    };

    switch (iconName) {
      case 'home':
        return (
          <svg {...iconProps}>
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'file-text':
        return (
          <svg {...iconProps}>
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'dollar-sign':
        return (
          <svg {...iconProps}>
            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5S6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5S17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'clock':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'user':
        return (
          <svg {...iconProps}>
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'bar-chart':
        return (
          <svg {...iconProps}>
            <line x1="12" y1="20" x2="12" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="18" y1="20" x2="18" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="6" y1="20" x2="6" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'calendar':
        return (
          <svg {...iconProps}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'check-circle':
        return (
          <svg {...iconProps}>
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'trending-up':
        return (
          <svg {...iconProps}>
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17,6 23,6 23,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'plus-circle':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'bar-chart':
        return (
          <svg {...iconProps}>
            <line x1="12" y1="20" x2="12" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="18" y1="20" x2="18" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="6" y1="20" x2="6" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'building':
        return (
          <svg {...iconProps}>
            <path d="M6 22V4C6 3.46957 6.21071 2.96086 6.58579 2.58579C6.96086 2.21071 7.46957 2 8 2H16C16.5304 2 17.0391 2.21071 17.4142 2.58579C17.7893 2.96086 18 3.46957 18 4V22L14 20L10 22L6 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 14H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'star':
        return (
          <svg {...iconProps}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'settings':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5166 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.87653 17.3663 4.02405 17.1457 4.21 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01062 9.77251C4.27925 9.5799 4.48278 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.77588C6.63368 3.87653 6.85425 4.02405 7.04 4.21L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'x-circle':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'help-circle':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'info':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'refresh-cw':
        return (
          <svg {...iconProps}>
            <polyline points="23,4 23,10 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="1,20 1,14 7,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'settings':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };


  const renderLeaveHistory = () => (
    <div className="user-activity">
      <div className="user-activity-title">Leave Application History</div>
      {leaveHistory.length === 0 ? (
        <div className="user-empty-state">
          <div className="user-empty-icon">
            {renderIcon('bar-chart', 32)}
          </div>
          <h3>No Leave History</h3>
          <p>No leave application history available at the moment.</p>
        </div>
      ) : (
        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Approved By</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.type}</td>
                  <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td>{leave.days}</td>
                  <td>{leave.reason}</td>
                  <td>
                    <span 
                      className="user-status"
                      style={{ 
                        backgroundColor: getStatusColor(leave.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {renderIcon(getStatusIcon(leave.status), 12)} {leave.status}
                    </span>
                  </td>
                  <td>{new Date(leave.appliedDate).toLocaleDateString()}</td>
                  <td>{leave.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="user-shell">
      <aside className="user-sidebar">
        <div className="user-logo">
          <img src="/OIP-removebg-preview.png" alt="Logo" />
          <div className="user-brand-text">
          <div className="user-brand">LeaveLink</div>
            <div className="user-brand-subtitle">Leave Management System</div>
            <div className="user-brand-role">Lecturer Portal</div>
          </div>
        </div>
        <ul className="user-nav">
          {config.sidebarItems.map((item) => (
            <li 
              key={item.id}
              className={`user-nav-item ${item.active ? 'active' : ''}`}
              onClick={() => handleSidebarClick(item.id)}
              style={{
                backgroundColor: item.active ? '#3b82f6' : 'transparent',
                color: item.active ? '#ffffff' : '#64748b',
                fontWeight: item.active ? '600' : '400'
              }}
            >
              <span className="user-nav-icon" style={{ color: item.active ? '#ffffff' : '#64748b' }}>
                {renderIcon(item.icon, 20)}
              </span>
              <span className="user-nav-text">{item.label}</span>
            </li>
          ))}
        </ul>
        
        <div className="user-account-section">
          <div className="user-account-title">MY ACCOUNT</div>
          <div className="user-account-items">
            <div className="user-account-item" onClick={onLogout}>
              <span className="user-account-icon">🚪</span>
              <span className="user-account-text">Log out</span>
            </div>
          </div>
        </div>
        
        <div className="user-profile-section">
          <div className="user-profile-avatar">
            <div className="user-avatar-placeholder">👤</div>
          </div>
          <div className="user-profile-info">
            <div className="user-profile-name">{user.fullName || user.username}</div>
            <div className="user-profile-department">{getDepartmentName(user.department)}</div>
          </div>
        </div>
      </aside>
      
      <main className="user-main">
        <div className="user-container">
          {flash && (
            <div className="user-flash">
              ✅ {flash}
            </div>
          )}
          
          <div className="user-header">
            <div className="user-header-content">
              <h1 className="user-main-title">Lecturer Dashboard</h1>
              <p className="user-main-subtitle">Manage your leave requests and view your balance</p>
            </div>
            
            <div className="user-tabs">
              {config.sidebarItems.map((item) => (
                  <button 
                  key={item.id}
                  className={`user-tab ${item.active ? 'active' : ''}`}
                  onClick={() => handleSidebarClick(item.id)}
                  >
                  {item.label}
                  </button>
              ))}
                    </div>
                </div>

          {/* Conditional content based on active view */}
          {activeView === 'dashboard' ? (
            <>
              {/* Main Stats Cards */}
              <section className="user-main-stats">
                <div className="user-stat-card available">
                  <div className="user-stat-icon">
                    {renderIcon('calendar', 24)}
                </div>
                  <div className="user-stat-content">
                    <div className="user-stat-value">
                      {isLoadingData ? '...' : dashboardStats.availableDays}
              </div>
                    <div className="user-stat-label">Available Leave Days</div>
                    <div className="user-stat-sublabel">Annual Leave</div>
            </div>
          </div>

                <div className="user-stat-card pending">
                  <div className="user-stat-icon">
                    {renderIcon('clock', 24)}
                  </div>
                  <div className="user-stat-content">
                    <div className="user-stat-value">
                      {isLoadingData ? '...' : dashboardStats.pendingRequests}
                    </div>
                    <div className="user-stat-label">Pending Requests</div>
                    <div className="user-stat-sublabel">Awaiting Approval</div>
                  </div>
          </div>

                <div className="user-stat-card approved">
                    <div className="user-stat-icon">
                    {renderIcon('check-circle', 24)}
                    </div>
                  <div className="user-stat-content">
                    <div className="user-stat-value">
                      {isLoadingData ? '...' : dashboardStats.approvedThisYear}
                  </div>
                    <div className="user-stat-label">Approved This Year</div>
                    <div className="user-stat-sublabel">Days Taken</div>
                  </div>
                </div>
                
                <div className="user-stat-card upcoming">
                  <div className="user-stat-icon">
                    {renderIcon('info', 24)}
                  </div>
                  <div className="user-stat-content">
                    <div className="user-stat-value">
                      {isLoadingData ? '...' : dashboardStats.upcomingLeave}
                    </div>
                    <div className="user-stat-label">Upcoming Leave</div>
                    <div className="user-stat-sublabel">Days Scheduled</div>
                  </div>
                </div>
              </section>

              {/* Bottom Row */}
              <section className="user-bottom-row">
                {/* Quick Actions */}
                <div className="user-quick-actions">
                  <h3 className="user-section-title">Quick Actions</h3>
                  <div className="user-action-list">
                    <button className="user-action-item" onClick={() => handleToolAction('apply-leave')}>
                      <div className="user-action-icon">
                        {renderIcon('plus-circle', 20)}
                    </div>
                      <div className="user-action-content">
                        <div className="user-action-title">Apply for Leave</div>
                        <div className="user-action-desc">Submit a new leave request</div>
                      </div>
                    </button>
                    
                    <button className="user-action-item" onClick={() => handleToolAction('check-balance')}>
                      <div className="user-action-icon">
                        {renderIcon('clock', 20)}
                  </div>
                      <div className="user-action-content">
                        <div className="user-action-title">Check Balance</div>
                        <div className="user-action-desc">View your leave balance</div>
                      </div>
                    </button>
                    
                    <button className="user-action-item" onClick={() => {
                      console.log('🔍 Balance Summary button clicked');
                      handleToolAction('balance-summary');
                    }}>
                      <div className="user-action-icon">
                        {renderIcon('file-text', 20)}
                      </div>
                      <div className="user-action-content">
                        <div className="user-action-title">Balance Summary</div>
                        <div className="user-action-desc">Detailed leave balance report</div>
                      </div>
                    </button>
                    
                    <button className="user-action-item" onClick={() => handleToolAction('view-history')}>
                      <div className="user-action-icon">
                        {renderIcon('refresh-cw', 20)}
                      </div>
                      <div className="user-action-content">
                        <div className="user-action-title">View History</div>
                        <div className="user-action-desc">Check past applications</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Upcoming Leave */}
                <div className="user-upcoming-leave">
                  <h3 className="user-section-title">Upcoming Leave</h3>
                  <div className="user-leave-list">
                    {isLoadingData ? (
                      <div className="user-loading-state">
                        <div className="user-loading-spinner"></div>
                        <p>Loading upcoming leave...</p>
                      </div>
                    ) : upcomingLeaves.length === 0 ? (
                      <div className="user-empty-state">
                        <div className="user-empty-icon">
                          {renderIcon('calendar', 24)}
                        </div>
                        <p>No upcoming leave scheduled</p>
                      </div>
                    ) : (
                      upcomingLeaves.map((leave, index) => (
                        <div key={index} className="user-leave-item">
                          <div className="user-leave-type">{leave.leaveType || 'Leave'}</div>
                          <div className="user-leave-dates">
                            {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                          </div>
                          <div className="user-leave-duration">
                            {calculateDays(leave.startDate, leave.endDate)} days
                          </div>
                          <div className={`user-leave-status ${leave.status}`}>
                            {leave.status}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </>
          ) : null}




        </div>
      </main>
      
      {/* Apply Leave Modal/Overlay */}
      {showApplyLeave && (
        <div className="apply-leave-overlay">
          <div className="apply-leave-modal">
            <ApplyLeave 
              user={user} 
              onBack={handleBackFromApplyLeave}
            />
          </div>
        </div>
      )}

      {/* Leave Balance Modal/Overlay */}
      {showLeaveBalance && (
        <div className="apply-leave-overlay">
          <div className="apply-leave-modal">
            <LeaveBalance 
              user={user} 
              onBack={handleBackFromLeaveBalance}
            />
          </div>
        </div>
      )}

      {/* Leave History Modal/Overlay */}
      {showLeaveHistory && (
        <div className="apply-leave-overlay">
          <div className="apply-leave-modal">
            <LeaveHistory 
              user={user} 
              onBack={handleBackFromLeaveHistory}
            />
          </div>
        </div>
      )}

      {/* Leave Balance Summary Modal/Overlay */}
      {showLeaveBalanceSummary && (
        <div className="apply-leave-overlay">
          <div className="apply-leave-modal">
            <LeaveBalanceSummary 
              user={user} 
              onBack={handleBackFromLeaveBalanceSummary}
            />
          </div>
        </div>
      )}

      {/* User Profile Modal/Overlay */}
      {showUserProfile && (
        <div className="apply-leave-overlay">
          <div className="apply-leave-modal">
            <UserProfile 
              user={user} 
              onBack={handleBackFromUserProfile}
            />
          </div>
        </div>
      )}

      {/* My Leaves Modal/Overlay */}
      {showMyLeaves && (
        <div className="apply-leave-overlay">
          <div className="apply-leave-modal">
            <MyLeaves 
              user={user} 
              onBack={handleBackFromMyLeaves}
            />
          </div>
        </div>
      )}

      {/* Settings Modal/Overlay */}
      {showSettings && (
        <div className="apply-leave-overlay">
          <div className="apply-leave-modal">
            <Settings 
              user={user} 
              onBack={handleBackFromSettings}
            />
          </div>
        </div>
      )}

    </div>
  );
}
