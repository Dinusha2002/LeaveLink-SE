import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminDashboard.css';
import api from '../api';

export default function AdminDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDepartments: 0,
    totalLeaveTypes: 0,
    recentUsers: 0,
    usersByRole: []
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [flash, setFlash] = useState(location.state?.flash || '');
  const [newlyCreatedUserId, setNewlyCreatedUserId] = useState(null);

  // Edit and delete states
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: '',
    position: '',
    department: '',
    contactNumber: '',
    status: 'active'
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Department modal states
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showEditDepartment, setShowEditDepartment] = useState(false);
  const [showDeleteDepartment, setShowDeleteDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    code: '',
    head: '',
    description: ''
  });
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [editDepartmentLoading, setEditDepartmentLoading] = useState(false);
  const [deleteDepartmentLoading, setDeleteDepartmentLoading] = useState(false);
  
  // Report filters states
  const [showReportFilters, setShowReportFilters] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    fromDate: '',
    toDate: '',
    department: 'All Departments'
  });
  const [reportLoading, setReportLoading] = useState(false);
  
  // Settings states
  const [accountSettings, setAccountSettings] = useState({
    fullName: '',
    email: '',
    role: '',
    department: '',
    position: '',
    contactNumber: '',
    lastLogin: '',
    accountCreated: ''
  });
  const [systemPreferences, setSystemPreferences] = useState({
    emailNotifications: true,
    darkMode: false
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [accountRefreshLoading, setAccountRefreshLoading] = useState(false);
  
  // Leave Types states
  const [showAddLeaveType, setShowAddLeaveType] = useState(false);
  const [showEditLeaveType, setShowEditLeaveType] = useState(false);
  const [showDeleteLeaveType, setShowDeleteLeaveType] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState(null);
  const [leaveTypeToDelete, setLeaveTypeToDelete] = useState(null);
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    name: '',
    days: '',
    description: ''
  });
  const [leaveTypeLoading, setLeaveTypeLoading] = useState(false);
  const [editLeaveTypeLoading, setEditLeaveTypeLoading] = useState(false);
  const [deleteLeaveTypeLoading, setDeleteLeaveTypeLoading] = useState(false);
 
  // Function to cache dashboard data
  const cacheDashboardData = (usersData, departmentsData, leaveTypesData, statsData) => {
    const dataToCache = {
      users: usersData,
      departments: departmentsData,
      leaveTypes: leaveTypesData,
      dashboardStats: statsData,
      timestamp: Date.now()
    };
    localStorage.setItem('adminDashboardData', JSON.stringify(dataToCache));
    console.log('💾 Cached dashboard data to localStorage');
  };

  // Function to clear cached data (call this on logout)
  const clearCachedData = () => {
    localStorage.removeItem('adminDashboardData');
    console.log('🗑️ Cleared cached dashboard data');
  };

  // Function to fetch admin user data from database
  const fetchAdminUserData = async () => {
    try {
      console.log('🔄 Fetching fresh admin user data from database...');
      const response = await api.get('/admin/profile');
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        console.log('📊 Fresh admin user data from database:', userData);
        
        // Handle department data properly
        let departmentName = 'Administration';
        if (userData.department) {
          if (typeof userData.department === 'object' && userData.department.name) {
            departmentName = userData.department.name;
          } else if (typeof userData.department === 'string') {
            departmentName = userData.department;
          }
        }
        
        // Always update with fresh database data
        const freshAccountData = {
          fullName: userData.fullName || userData.name || 'System Admin',
          email: userData.email || 'admin@university.edu',
          role: userData.role || 'Administrator',
          department: departmentName,
          position: userData.position || 'System Administrator',
          contactNumber: userData.contactNumber || '',
          lastLogin: userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Unknown',
          accountCreated: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'
        };
        
        setAccountSettings(freshAccountData);
        console.log('✅ Fresh admin user data loaded and updated from database');
        return freshAccountData;
      } else {
        console.warn('⚠️ No user data found in response, using fallback values');
        throw new Error('No user data in response');
      }
    } catch (error) {
      console.error('❌ Error fetching admin user data:', error);
      // Fallback to default values if API fails
      const fallbackData = {
        fullName: 'System Admin',
        email: 'admin@university.edu',
        role: 'Administrator',
        department: 'Administration',
        position: 'System Administrator',
        contactNumber: '',
        lastLogin: 'Unknown',
        accountCreated: 'Unknown'
      };
      setAccountSettings(fallbackData);
      return fallbackData;
    }
  };

  // Function to refresh account settings when settings section is accessed
  const refreshAccountSettings = async () => {
    try {
      setAccountRefreshLoading(true);
      console.log('🔄 Refreshing account settings with fresh database data...');
      const freshData = await fetchAdminUserData();
      console.log('✅ Account settings refreshed with fresh database data:', freshData);
      
      // Show success message
      setSettingsMessage('✅ Account data refreshed with latest database information!');
      setTimeout(() => {
        setSettingsMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ Error refreshing account settings:', error);
      setSettingsMessage('❌ Failed to refresh account data: ' + error.message);
      setTimeout(() => {
        setSettingsMessage('');
      }, 5000);
    } finally {
      setAccountRefreshLoading(false);
    }
  };

  // Edit user functions
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.name || '',
      email: user.email || '',
      role: user.role || '',
      position: user.position || '',
      department: user.department || '',
      contactNumber: user.contactNumber || '',
      status: user.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      console.log('🔄 Updating user in database...', { userId: editingUser.id, data: editForm });
      const response = await api.put(`/admin/users/${editingUser.id}`, editForm);
      
      console.log('✅ User update response:', response.data);
      
      // Check if user was updated successfully
      if (!response.data || !response.data.user) {
        console.error('❌ User update failed - no user data returned:', response.data);
        throw new Error('User update failed - no user data returned');
      }

      console.log('✅ User successfully updated in database');

      // Refresh all data from database to ensure consistency
      console.log('🔄 Refreshing all data from database...');
      await fetchDashboardData();
      
      setShowEditModal(false);
      setEditingUser(null);
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'User Updated',
          message: `Successfully updated user account for ${editForm.fullName}`,
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 1,
          type: 'info',
          title: 'Database Updated',
          message: 'User data synchronized with database',
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 3) // Keep only 5 most recent notifications
      ]);
      
      alert('✅ User updated successfully! Database synchronized.');
      
    } catch (error) {
      console.error('❌ Error updating user:', error);
      alert('❌ Error updating user: ' + (error.response?.data?.message || error.message));
    } finally {
      setEditLoading(false);
    }
  };

  // Delete user functions
  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    setDeleteLoading(true);
    
    try {
      console.log('🔄 Deleting user from database...', { userId: userToDelete.id });
      await api.delete(`/admin/users/${userToDelete.id}`);
      
      console.log('✅ User successfully deleted from database');

      // Refresh all data from database to ensure consistency
      console.log('🔄 Refreshing all data from database...');
      await fetchDashboardData();
      
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'User Deleted',
          message: `Successfully deleted user account for ${userToDelete.name}`,
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 1,
          type: 'info',
          title: 'Database Updated',
          message: 'User data synchronized with database',
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 3) // Keep only 5 most recent notifications
      ]);
      
      alert('✅ User deleted successfully! Database synchronized.');
      
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert('❌ Error deleting user: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Department form handlers
  const handleDepartmentChange = (e) => {
    const { name, value } = e.target;
    setDepartmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setDepartmentLoading(true);
    
    try {
      console.log('🔄 Creating department in database...', departmentForm);
      const response = await api.post('/departments', departmentForm);
      
      console.log('✅ Department creation response:', response.data);
      
      // Check if department was created successfully
      if (!response.data || !response.data._id) {
        console.error('❌ Department creation failed - no department data returned:', response.data);
        throw new Error('Department creation failed - no department data returned');
      }

      console.log('✅ Department successfully created in database');

      // Refresh all data from database to ensure consistency
      console.log('🔄 Refreshing all data from database...');
      await fetchDashboardData();
      
      // Reset form and close modal
      setDepartmentForm({
        name: '',
        code: '',
        head: '',
        description: ''
      });
      setShowAddDepartment(false);
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'Department Created',
          message: `Successfully created department: ${departmentForm.name}`,
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 1,
          type: 'info',
          title: 'Database Updated',
          message: 'Department data synchronized with database',
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 3) // Keep only 5 most recent notifications
      ]);
      
      alert('✅ Department created successfully! Database synchronized.');
      
    } catch (error) {
      console.error('❌ Error adding department:', error);
      alert('❌ Failed to add department: ' + (error.response?.data?.message || error.message));
    } finally {
      setDepartmentLoading(false);
    }
  };

  // Edit department functions
  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      name: department.name || '',
      code: department.code || '',
      head: department.head || '',
      description: department.description || ''
    });
    setShowEditDepartment(true);
  };

  const handleEditDepartmentSubmit = async (e) => {
    e.preventDefault();
    setEditDepartmentLoading(true);
    
    try {
      console.log('🔄 Updating department in database:', editingDepartment._id, departmentForm);
      const response = await api.put(`/departments/${editingDepartment._id}`, departmentForm);
      console.log('✅ Department update response:', response.data);
      
      // Check if department was updated successfully
      if (!response.data || !response.data.department) {
        console.error('❌ Department update failed - no department data returned:', response.data);
        throw new Error('Department update failed - no department data returned');
      }

      console.log('✅ Department successfully updated in database');

      // Refresh all data from database to ensure consistency
      console.log('🔄 Refreshing all data from database...');
      await fetchDashboardData();
      
      setShowEditDepartment(false);
      setEditingDepartment(null);
      setDepartmentForm({
        name: '',
        code: '',
        head: '',
        description: ''
      });
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'Department Updated',
          message: `Successfully updated department: ${departmentForm.name}`,
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 1,
          type: 'info',
          title: 'Database Updated',
          message: 'Department data synchronized with database',
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 3) // Keep only 5 most recent notifications
      ]);
      
      alert('✅ Department updated successfully! Database synchronized.');
      
    } catch (error) {
      console.error('❌ Error updating department:', error);
      alert('❌ Failed to update department: ' + (error.response?.data?.message || error.message));
    } finally {
      setEditDepartmentLoading(false);
    }
  };

  // Refresh departments data
  const refreshDepartments = async () => {
    try {
      console.log('🔄 Refreshing departments data...');
      const response = await api.get('/departments');
      console.log('📋 Fresh departments data:', response.data);
      setDepartments(response.data);
      return response.data;
    } catch (error) {
      console.error('Error refreshing departments:', error);
      return departments; // Return current data if refresh fails
    }
  };

  // Delete department functions
  const handleDeleteDepartment = (department) => {
    setDepartmentToDelete(department);
    setShowDeleteDepartment(true);
  };

  const confirmDeleteDepartment = async () => {
    setDeleteDepartmentLoading(true);
    
    try {
      console.log('🔄 Deleting department from database:', departmentToDelete._id);
      await api.delete(`/departments/${departmentToDelete._id}`);
      
      console.log('✅ Department successfully deleted from database');

      // Refresh all data from database to ensure consistency
      console.log('🔄 Refreshing all data from database...');
      await fetchDashboardData();
      
      setShowDeleteDepartment(false);
      setDepartmentToDelete(null);
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'Department Deleted',
          message: `Successfully deleted department: ${departmentToDelete.name}`,
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 1,
          type: 'info',
          title: 'Database Updated',
          message: 'Department data synchronized with database',
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 3) // Keep only 5 most recent notifications
      ]);
      
      alert('✅ Department deleted successfully! Database synchronized.');
      
    } catch (error) {
      console.error('❌ Error deleting department:', error);
      alert('❌ Failed to delete department: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleteDepartmentLoading(false);
    }
  };

  // Report filter handlers
  const handleReportFilterChange = (e) => {
    const { name, value } = e.target;
    setReportFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Settings handlers
  const handleAccountSettingsChange = (e) => {
    const { name, value } = e.target;
    setAccountSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSystemPreferencesChange = (e) => {
    const { name, checked } = e.target;
    setSystemPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSaveAccountSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMessage('');
    
    try {
      console.log('🔄 Saving account settings to database...', accountSettings);
      
      // Update account settings in database
      const response = await api.put('/admin/profile', {
        fullName: accountSettings.fullName,
        email: accountSettings.email,
        contactNumber: accountSettings.contactNumber
      });
      
      console.log('✅ Account settings saved to database:', response.data);
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'Account Settings Updated',
          message: `Successfully updated account settings for ${accountSettings.fullName}`,
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 1,
          type: 'info',
          title: 'Database Updated',
          message: 'Account settings synchronized with database',
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 3) // Keep only 5 most recent notifications
      ]);
      
      setSettingsMessage('✅ Account settings saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSettingsMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error saving account settings:', error);
      setSettingsMessage('❌ Failed to save account settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSystemPreferences = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMessage('');
    
    try {
      console.log('🔄 Saving system preferences...', systemPreferences);
      
      // Here you would typically make an API call to update system preferences
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('✅ System preferences saved successfully');
      
      // Save to localStorage
      localStorage.setItem('adminSystemPreferences', JSON.stringify(systemPreferences));
      console.log('💾 System preferences saved to localStorage');
      
      // Apply dark mode if enabled
      if (systemPreferences.darkMode) {
        document.body.classList.add('dark-mode');
        console.log('🌙 Dark mode enabled');
      } else {
        document.body.classList.remove('dark-mode');
        console.log('☀️ Dark mode disabled');
      }
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'System Preferences Updated',
          message: `Successfully updated system preferences`,
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 4) // Keep only 5 most recent notifications
      ]);
      
      setSettingsMessage('✅ System preferences saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSettingsMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error saving system preferences:', error);
      setSettingsMessage('❌ Failed to save system preferences. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Leave Types handlers
  const handleLeaveTypeChange = (e) => {
    const { name, value } = e.target;
    setLeaveTypeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddLeaveType = async (e) => {
    e.preventDefault();
    setLeaveTypeLoading(true);
    
    try {
      console.log('🔄 Creating leave type in database...', leaveTypeForm);
      const response = await api.post('/leaveTypes', leaveTypeForm);
      
      console.log('✅ Leave type creation response:', response.data);
      
      // Check if leave type was created successfully
      if (!response.data || !response.data._id) {
        console.error('❌ Leave type creation failed - no leave type data returned:', response.data);
        throw new Error('Leave type creation failed - no leave type data returned');
      }

      console.log('✅ Leave type successfully created in database');

      // Refresh all data from database to ensure consistency
      console.log('🔄 Refreshing all data from database...');
      await fetchDashboardData();
      
      // Reset form and close modal
      setLeaveTypeForm({
        name: '',
        days: '',
        description: ''
      });
      setShowAddLeaveType(false);
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'Leave Type Created',
          message: `Successfully created leave type: ${leaveTypeForm.name}`,
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 1,
          type: 'info',
          title: 'Database Updated',
          message: 'Leave type data synchronized with database',
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 3) // Keep only 5 most recent notifications
      ]);
      
      alert('✅ Leave type created successfully! Database synchronized.');
      
    } catch (error) {
      console.error('❌ Error adding leave type:', error);
      alert('❌ Failed to add leave type: ' + (error.response?.data?.message || error.message));
    } finally {
      setLeaveTypeLoading(false);
    }
  };

  // Edit leave type functions
  const handleEditLeaveType = (leaveType) => {
    setEditingLeaveType(leaveType);
    setLeaveTypeForm({
      name: leaveType.name || '',
      days: leaveType.days || '',
      description: leaveType.description || ''
    });
    setShowEditLeaveType(true);
  };

  const handleEditLeaveTypeSubmit = async (e) => {
    e.preventDefault();
    setEditLeaveTypeLoading(true);
    
    try {
      console.log('🔄 Updating leave type in database:', editingLeaveType._id, leaveTypeForm);
      const response = await api.put(`/leaveTypes/${editingLeaveType._id}`, leaveTypeForm);
      console.log('✅ Leave type update response:', response.data);
      
      // Check if leave type was updated successfully
      if (!response.data || !response.data.leaveType) {
        console.error('❌ Leave type update failed - no leave type data returned:', response.data);
        throw new Error('Leave type update failed - no leave type data returned');
      }

      console.log('✅ Leave type successfully updated in database');

      // Refresh all data from database to ensure consistency
      console.log('🔄 Refreshing all data from database...');
      await fetchDashboardData();
      
      setShowEditLeaveType(false);
      setEditingLeaveType(null);
      setLeaveTypeForm({
        name: '',
        days: '',
        description: ''
      });
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'Leave Type Updated',
          message: `Successfully updated leave type: ${leaveTypeForm.name}`,
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 1,
          type: 'info',
          title: 'Database Updated',
          message: 'Leave type data synchronized with database',
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 3) // Keep only 5 most recent notifications
      ]);
      
      alert('✅ Leave type updated successfully! Database synchronized.');
      
    } catch (error) {
      console.error('❌ Error updating leave type:', error);
      alert('❌ Failed to update leave type: ' + (error.response?.data?.message || error.message));
    } finally {
      setEditLeaveTypeLoading(false);
    }
  };

  // Delete leave type functions
  const handleDeleteLeaveType = (leaveType) => {
    setLeaveTypeToDelete(leaveType);
    setShowDeleteLeaveType(true);
  };

  const confirmDeleteLeaveType = async () => {
    setDeleteLeaveTypeLoading(true);
    
    try {
      console.log('🔄 Deleting leave type from database:', leaveTypeToDelete._id);
      await api.delete(`/leaveTypes/${leaveTypeToDelete._id}`);
      
      console.log('✅ Leave type successfully deleted from database');

      // Refresh all data from database to ensure consistency
      console.log('🔄 Refreshing all data from database...');
      await fetchDashboardData();
      
      setShowDeleteLeaveType(false);
      setLeaveTypeToDelete(null);
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'Leave Type Deleted',
          message: `Successfully deleted leave type: ${leaveTypeToDelete.name}`,
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 1,
          type: 'info',
          title: 'Database Updated',
          message: 'Leave type data synchronized with database',
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 3) // Keep only 5 most recent notifications
      ]);
      
      alert('✅ Leave type deleted successfully! Database synchronized.');
      
    } catch (error) {
      console.error('❌ Error deleting leave type:', error);
      alert('❌ Failed to delete leave type: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleteLeaveTypeLoading(false);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    
    try {
      console.log('🔄 Generating report with filters:', reportFilters);
      
      // Here you would typically make an API call to generate the report
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Report generated successfully');
      
      // Close the filters modal
      setShowReportFilters(false);
      
      // Reset filters
      setReportFilters({
        fromDate: '',
        toDate: '',
        department: 'All Departments'
      });
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'Report Generated',
          message: `Report generated for ${reportFilters.department} from ${reportFilters.fromDate} to ${reportFilters.toDate}`,
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 4) // Keep only 5 most recent notifications
      ]);
      
      alert('✅ Report generated successfully!');
    } catch (error) {
      console.error('❌ Error generating report:', error);
      alert('❌ Failed to generate report: ' + error.message);
    } finally {
      setReportLoading(false);
    }
  };

  // Register form states
  const [registerForm, setRegisterForm] = useState({
    initials: "",
    epf: "",
    nic: "",
    appointment: "",
    gender: "",
    role: "",
    position: "",
    department: "",
    username: "",
    password: "",
    email: "",
    contactNumber: ""
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerErrorMsg, setRegisterErrorMsg] = useState("");
  const [registerFieldErrors, setRegisterFieldErrors] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPassword, setShowPassword] = useState(false);
  const calendarRef = useRef(null);

  // Fetch real data from API
  const fetchDashboardData = async () => {
    try {
      setIsLoadingData(true);
      console.log('🔄 Starting to fetch dashboard data...');
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found');
        throw new Error('No authentication token');
      }
      
      // Fetch all data in parallel
      console.log('🔄 Starting data fetch...');
      const [usersResponse, departmentsResponse, leaveTypesResponse, statsResponse] = await Promise.all([
        api.get('/admin/users').catch(err => { console.error('❌ Users API error:', err); throw err; }),
        api.get('/departments').catch(err => { console.error('❌ Departments API error:', err); throw err; }),
        api.get('/leaveTypes').catch(err => { console.error('❌ LeaveTypes API error:', err); throw err; }),
        api.get('/admin/dashboard-stats').catch(err => { console.error('❌ Stats API error:', err); throw err; })
      ]);
      
      console.log('📊 API Responses received:', {
        users: usersResponse.data?.length || 0,
        departments: departmentsResponse.data?.length || 0,
        leaveTypes: leaveTypesResponse.data?.length || 0,
        stats: statsResponse.data
      });
      
      // Log the actual user data structure
      console.log('👥 Raw users data from API:', usersResponse.data);
      
      let processedUsers = [];
      if (!usersResponse.data || usersResponse.data.length === 0) {
        setUsers([]);
      } else {
        // Process users data
        processedUsers = usersResponse.data.map(user => {
          console.log('👤 Processing user:', user.fullName, 'Department:', user.department);
          
          // Handle department data properly
          let departmentName = 'No Department';
          if (user.department) {
            if (typeof user.department === 'object' && user.department.name) {
              departmentName = user.department.name;
            } else if (typeof user.department === 'string') {
              departmentName = user.department;
            }
          }
          
          return {
            id: user._id,
            name: user.fullName || user.name || 'Unknown User',
            email: user.email || 'No email',
            role: user.role || 'Unknown',
            department: departmentName,
            position: user.position || 'No Position',
            status: user.status || 'active',
            // Removed lastActive field as requested
            createdAt: user.createdAt
          };
        });
        
        setUsers(processedUsers);
        console.log('👥 Processed users set:', processedUsers.length, 'users');
        console.log('👥 Processed users data:', processedUsers);
      }
      setDepartments(departmentsResponse.data);
      setLeaveTypes(leaveTypesResponse.data);
      console.log('📋 Departments set:', departmentsResponse.data?.length || 0);
      console.log('📋 Departments data:', departmentsResponse.data);
      console.log('📝 Leave types set:', leaveTypesResponse.data?.length || 0);
      
      // Set dashboard statistics
      const stats = statsResponse.data;
      const newStats = {
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        totalDepartments: stats.totalDepartments,
        totalLeaveTypes: stats.totalLeaveTypes,
        recentUsers: stats.recentUsers,
        usersByRole: stats.usersByRole
      };
      setDashboardStats(newStats);
      
      // Cache the fetched data
      cacheDashboardData(processedUsers, departmentsResponse.data, leaveTypesResponse.data, newStats);
      
      // Set empty arrays for now (can be implemented later)
      setNotifications([]);
      setLeaveBalance({});
      setLeaveHistory([]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Try to restore from cache as fallback
      const cachedData = localStorage.getItem('adminDashboardData');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          setUsers(parsedData.users || []);
          setDepartments(parsedData.departments || []);
          setLeaveTypes(parsedData.leaveTypes || []);
          setDashboardStats(parsedData.dashboardStats || {
            totalUsers: 0,
            activeUsers: 0,
            totalDepartments: 0,
            totalLeaveTypes: 0,
            recentUsers: 0,
            usersByRole: []
          });
          console.log('📦 Fallback: Restored data from cache after API error');
        } catch (cacheError) {
          console.error('Error parsing cached data as fallback:', cacheError);
          // Set empty data only if cache also fails
          setUsers([]);
          setDepartments([]);
          setLeaveTypes([]);
          setDashboardStats({
            totalUsers: 0,
            activeUsers: 0,
            totalDepartments: 0,
            totalLeaveTypes: 0,
            recentUsers: 0,
            usersByRole: []
          });
        }
      } else {
        // No cache available, set empty data
        setUsers([]);
        setDepartments([]);
        setLeaveTypes([]);
        setDashboardStats({
          totalUsers: 0,
          activeUsers: 0,
          totalDepartments: 0,
          totalLeaveTypes: 0,
          recentUsers: 0,
          usersByRole: []
        });
      }
    } finally {
      setIsLoadingData(false);
    }
    
    // Also refresh admin user data when dashboard data is refreshed
    await fetchAdminUserData();
  };

  // Initialize data on component mount
  useEffect(() => {
    const loadData = async () => {
      // Try to restore cached data first, then fetch fresh data
      const cachedData = localStorage.getItem('adminDashboardData');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          const dataAge = Date.now() - (parsedData.timestamp || 0);
          const maxAge = 10 * 60 * 1000; // 10 minutes in milliseconds
          
          if (dataAge < maxAge) {
            // Data is fresh, use cached data
            setUsers(parsedData.users || []);
            setDepartments(parsedData.departments || []);
            setLeaveTypes(parsedData.leaveTypes || []);
            setDashboardStats(parsedData.dashboardStats || {
              totalUsers: 0,
              activeUsers: 0,
              totalDepartments: 0,
              totalLeaveTypes: 0,
              recentUsers: 0,
              usersByRole: []
            });
            setIsLoadingData(false);
            console.log('📦 Restored cached dashboard data');
            
            // Also fetch fresh data in background to update cache
            setTimeout(() => {
    fetchDashboardData();
            }, 1000);
          } else {
            // Data is stale, fetch fresh data
            console.log('📦 Cached data is stale, fetching fresh data');
            await fetchDashboardData();
          }
        } catch (error) {
          console.error('Error parsing cached data:', error);
          await fetchDashboardData();
        }
      } else {
        // No cached data, fetch fresh data
        console.log('🚀 No cached data, fetching fresh data...');
        await fetchDashboardData();
      }
      
      // Fetch admin user data
      await fetchAdminUserData();
    };
    
    loadData();
  }, []);

  // Load system preferences from localStorage on component mount
  useEffect(() => {
    const loadSystemPreferences = () => {
      try {
        const savedSystemPreferences = localStorage.getItem('adminSystemPreferences');
        
        if (savedSystemPreferences) {
          const parsedSystemPreferences = JSON.parse(savedSystemPreferences);
          setSystemPreferences(prev => ({ ...prev, ...parsedSystemPreferences }));
          console.log('📦 Restored system preferences from localStorage');
          
          // Apply dark mode if it was enabled
          if (parsedSystemPreferences.darkMode) {
            document.body.classList.add('dark-mode');
            console.log('🌙 Dark mode restored from localStorage');
          }
        }
      } catch (error) {
        console.error('Error loading system preferences from localStorage:', error);
      }
    };
    
    loadSystemPreferences();
  }, []);

  useEffect(() => {
    if (flash) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [flash, navigate, location.pathname]);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector('.admin-content');
      if (content) {
        setShowScrollTop(content.scrollTop > 300);
      }
    };

    const content = document.querySelector('.admin-content');
    if (content) {
      content.addEventListener('scroll', handleScroll);
      return () => content.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    const content = document.querySelector('.admin-content');
    if (content) {
      content.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // NIC Validation Functions
  const validateNIC = (nic) => {
    if (!nic) return "NIC number is required";
    
    const cleanNIC = nic.replace(/\s/g, '').toUpperCase();
    
    if (cleanNIC.length < 9 || cleanNIC.length > 12) {
      return "NIC number must be 9-12 digits";
    }
    
    if (!/^\d+$/.test(cleanNIC)) {
      return "NIC number must contain only digits";
    }
    
    return null;
  };

  const validateRegisterField = (name, value) => {
    let error = null;
    
    switch (name) {
      case 'nic':
        error = validateNIC(value);
        break;
      case 'epf':
        if (!value) error = "EPF number is required";
        else if (!/^\d+$/.test(value)) error = "EPF number must contain only digits";
        else if (value.length < 4 || value.length > 10) error = "EPF number must be 4-10 digits";
        break;
      case 'initials':
        if (!value) error = "Name with initials is required";
        else if (value.length < 2) error = "Name must be at least 2 characters";
        else if (!/^[a-zA-Z\s.]+$/.test(value)) error = "Name can only contain letters, spaces, and dots";
        break;
      case 'email':
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        break;
      case 'username':
        if (!value) error = "Username is required";
        else if (value.length < 3) error = "Username must be at least 3 characters";
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = "Username can only contain letters, numbers, and underscores";
        break;
      case 'password':
        if (!value) error = "Password is required";
        else if (value.length < 6) error = "Password must be at least 6 characters";
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) error = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        break;
      case 'appointment':
        if (!value) error = "Appointment date is required";
        else {
          const appointmentDate = new Date(value);
          const today = new Date();
          if (appointmentDate > today) error = "Appointment date cannot be in the future";
        }
        break;
      case 'department':
        if (registerForm.role === "Academic Staff" && !value) {
          error = "Department is required for Academic Staff";
        }
        break;
      case 'gender':
        if (!value) error = "Gender selection is required";
        break;
      case 'position':
        if (!value) error = "Position is required";
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleRegisterChange = e => {
    const { name, value, type } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
    
    if (registerFieldErrors[name]) {
      setRegisterFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRegisterBlur = e => {
    const { name, value } = e.target;
    const error = validateRegisterField(name, value);
    setRegisterFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  // Calendar functionality
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setRegisterForm(prev => ({ ...prev, appointment: formattedDate }));
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleCalendarClick = (e) => {
    e.stopPropagation();
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Calendar component
  const Calendar = () => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = registerForm.appointment === date.toISOString().split('T')[0];
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateSelect(date)}
        >
          {day}
        </div>
      );
    }
    
    const prevMonth = () => {
      setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
    };
    
    const nextMonth = () => {
      setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
    };
    
    return (
      <div className="calendar-popup" onClick={handleCalendarClick}>
        <div className="calendar-header">
          <button onClick={prevMonth} className="calendar-nav-btn">‹</button>
          <h3>{monthNames[currentMonth]} {currentYear}</h3>
          <button onClick={nextMonth} className="calendar-nav-btn">›</button>
        </div>
        <div className="calendar-weekdays">
          <div className="calendar-weekday">Sun</div>
          <div className="calendar-weekday">Mon</div>
          <div className="calendar-weekday">Tue</div>
          <div className="calendar-weekday">Wed</div>
          <div className="calendar-weekday">Thu</div>
          <div className="calendar-weekday">Fri</div>
          <div className="calendar-weekday">Sat</div>
        </div>
        <div className="calendar-days">
          {days}
        </div>
      </div>
    );
  };

  const validateAllRegisterFields = () => {
    const errors = {};
    const fieldsToValidate = ['initials', 'epf', 'nic', 'appointment', 'gender', 'role', 'position', 'email', 'username', 'password'];
    
    if (registerForm.role === "Academic Staff") {
      fieldsToValidate.push('department');
    }
    
    fieldsToValidate.forEach(field => {
      const error = validateRegisterField(field, registerForm[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    setRegisterFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setRegisterErrorMsg("");
    
    if (!validateAllRegisterFields()) {
      setRegisterErrorMsg("Please correct the errors below.");
      return;
    }
    
    setRegisterLoading(true);
    try {
      const userData = {
        fullName: registerForm.initials,
        email: registerForm.email,
        username: registerForm.username,
        password: registerForm.password,
        role: registerForm.role === "Academic Staff" ? "academic" : "non-academic",
        roleType: registerForm.role === "Academic Staff" ? "academic" : "non-academic",
        position: registerForm.position,
        epf: registerForm.epf,
        nic: registerForm.nic,
        appointmentDate: registerForm.appointment,
        gender: registerForm.gender,
        department: registerForm.role === "Academic Staff" ? registerForm.department : undefined,
        serviceNumber: registerForm.epf,
        contactNumber: registerForm.contactNumber || "",
        homeAddress: "",
        sex: registerForm.gender,
      };

      console.log('🔄 Creating user in database...', userData);
      const response = await api.post("/auth/register", userData);
      
      // Debug logging
      console.log('✅ User creation response:', response.data);
      
      // Check if user was created successfully
      if (!response.data || !response.data.user) {
        console.error('❌ User creation failed - no user data returned:', response.data);
        throw new Error('User creation failed - no user data returned');
      }

      console.log('✅ User successfully created in database');

      // Refresh all data from database to ensure consistency
      console.log('🔄 Refreshing all data from database...');
      await fetchDashboardData();
      
      // Set the new user for highlighting
      const newUserId = response.data.user._id;
      setNewlyCreatedUserId(newUserId);
      
      // Clear the highlight after 3 seconds
      setTimeout(() => {
        setNewlyCreatedUserId(null);
      }, 3000);
      
      // Update notifications with user creation
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          title: 'User Account Created',
          message: `Successfully created user account for ${registerForm.initials}`,
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 1,
          type: 'info',
          title: 'Database Updated',
          message: 'User data synchronized with database',
          time: 'Just now',
          read: false
        },
        {
          id: Date.now() + 2,
          type: 'success',
          title: 'Real-time Update Complete',
          message: 'New user is now visible in the table',
          time: 'Just now',
          read: false
        },
        ...prev.slice(0, 2) // Keep only 5 most recent notifications
      ]);
      
      
      // Reset form and close
      setRegisterForm({
        initials: "",
        epf: "",
        nic: "",
        appointment: "",
        gender: "",
        role: "",
        position: "",
        department: "",
        username: "",
        password: "",
        email: "",
        contactNumber: ""
      });
      setShowAddUser(false);
      setRegisterErrorMsg("");
      setRegisterFieldErrors({});
      
      // Show comprehensive success message
      const successMessage = `🎉 USER ACCOUNT CREATED SUCCESSFULLY! 🎉

👤 User Details:
• Name: ${registerForm.initials}
• Email: ${registerForm.email}
• Role: ${registerForm.role}
• Position: ${registerForm.position}
• Department: ${registerForm.department || 'N/A'}

📊 Database Updates:
• ✅ User saved to database
• ✅ All data refreshed from database
• ✅ Dashboard statistics updated
• ✅ User table synchronized
• ✅ Notifications added

🔍 The new user is now visible in the User Management table with a "✨ NEW" indicator!`;
      
      alert(successMessage);
      
    } catch (err) {
      console.error("❌ Account creation error:", err);
      setRegisterErrorMsg(err.response?.data?.message || "Account creation failed. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  };


  if (!user || user.role !== 'admin') {
    console.log('❌ Access denied - User:', user);
    return <div style={{ padding: 32, fontSize: 24 }}>Access denied.</div>;
  }
  
  console.log('✅ Admin access confirmed - User:', user);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#ef4444';
      case 'on-leave': return '#f59e0b';
      case 'Approved': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'Pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '✅';
      case 'inactive': return '❌';
      case 'on-leave': return '⏳';
      case 'Approved': return '✅';
      case 'Rejected': return '❌';
      case 'Pending': return '⏳';
      default: return '❓';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approval': return '✅';
      case 'submission': return '⏰';
      case 'update': return '⚠️';
      case 'rejection': return '❌';
      default: return '📢';
    }
  };

  const filteredUsers = users.filter(user => {
    const departmentMatch = selectedDepartment === 'all' || user.department === selectedDepartment;
    const roleMatch = selectedRole === 'all' || user.role === selectedRole;
    return departmentMatch && roleMatch;
  });
  
  console.log('🔍 User Management Debug:', {
    totalUsers: users.length,
    filteredUsers: filteredUsers.length,
    selectedDepartment,
    selectedRole,
    isLoadingData
  });


  // Debug departments
  console.log('🔍 Departments state:', {
    departmentsCount: departments.length,
    departmentsData: departments,
    departmentsType: typeof departments
  });

  // Monitor departments state changes
  useEffect(() => {
    console.log('📋 Departments state changed:', {
      count: departments.length,
      data: departments
    });
  }, [departments]);

  // Refresh account settings with fresh database data when settings section is accessed
  useEffect(() => {
    if (activeSection === 'settings') {
      console.log('🔄 Settings section accessed - fetching fresh account data from database...');
      refreshAccountSettings();
    }
  }, [activeSection]);

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo-container">
            <img 
              src="/OIP-removebg-preview.png" 
              alt="LeaveLink Logo" 
              className="admin-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="admin-logo-fallback" style={{ display: 'none' }}>
              <div className="admin-logo-icon">LL</div>
            </div>
            <div className="admin-logo-text">
              <h1 className="admin-sidebar-title">LeaveLink</h1>
              <h2 className="admin-sidebar-subtitle">Leave Management System</h2>
              <p className="admin-sidebar-description">Administrator Panel</p>
            </div>
          </div>
        </div>
        
        <nav className="admin-sidebar-nav">
          <ul className="admin-nav-list">
            <li 
              className={`admin-nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <span className="admin-nav-icon">⊞</span>
              <span className="admin-nav-text">Overview</span>
            </li>
            <li 
              className={`admin-nav-item ${activeSection === 'users' ? 'active' : ''}`}
              onClick={() => setActiveSection('users')}
            >
              <span className="admin-nav-icon">👥</span>
              <span className="admin-nav-text">User Management</span>
            </li>
            <li 
              className={`admin-nav-item ${activeSection === 'departments' ? 'active' : ''}`}
              onClick={() => setActiveSection('departments')}
            >
              <span className="admin-nav-icon">🏢</span>
              <span className="admin-nav-text">Departments</span>
            </li>
            <li 
              className={`admin-nav-item ${activeSection === 'leave-types' ? 'active' : ''}`}
              onClick={() => setActiveSection('leave-types')}
            >
              <span className="admin-nav-icon">📋</span>
              <span className="admin-nav-text">Leave Types</span>
            </li>
            <li 
              className={`admin-nav-item ${activeSection === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveSection('statistics')}
            >
              <span className="admin-nav-icon">📊</span>
              <span className="admin-nav-text">Statistics</span>
            </li>
            <li 
              className={`admin-nav-item ${activeSection === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveSection('reports')}
            >
              <span className="admin-nav-icon">📄</span>
              <span className="admin-nav-text">Reports</span>
            </li>
          </ul>
        </nav>
        
        {/* My Account Section */}
        <div className="admin-my-account">
          <h3 className="admin-my-account-title">My Account</h3>
          <ul className="admin-my-account-list">
            <li 
              className={`admin-nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <span className="admin-nav-icon">⚙️</span>
              <span className="admin-nav-text">Settings</span>
            </li>
            <li 
              className="admin-nav-item"
              onClick={onLogout}
            >
              <span className="admin-nav-icon">↩️</span>
              <span className="admin-nav-text">Log out</span>
            </li>
          </ul>
        </div>
        
        <div className="admin-sidebar-footer">
          <div className="admin-user-profile">
            <div className="admin-user-avatar">👤</div>
            <div className="admin-user-info">
              <div className="admin-user-name">{accountSettings.fullName || 'System Administrator'}</div>
              <div className="admin-user-role">{accountSettings.role || 'Admin'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-content">
            <h1 className="admin-main-title">Administrator Dashboard</h1>
            <p className="admin-main-subtitle">Manage Users, Departments, and Leave Requests</p>
            
            <div className="admin-tabs">
              <button 
                className={`admin-tab ${activeSection === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveSection('overview')}
              >
                Overview
              </button>
              <button 
                className={`admin-tab ${activeSection === 'users' ? 'active' : ''}`}
                onClick={() => setActiveSection('users')}
              >
                Users
              </button>
              <button 
                className={`admin-tab ${activeSection === 'departments' ? 'active' : ''}`}
                onClick={() => setActiveSection('departments')}
              >
                Departments
              </button>
              <button 
                className={`admin-tab ${activeSection === 'leave-types' ? 'active' : ''}`}
                onClick={() => setActiveSection('leave-types')}
              >
                Leave Types
              </button>
              <button 
                className={`admin-tab ${activeSection === 'statistics' ? 'active' : ''}`}
                onClick={() => setActiveSection('statistics')}
              >
                Statistics
              </button>
              <button 
                className={`admin-tab ${activeSection === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveSection('reports')}
              >
                Reports
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {activeSection === 'overview' && (
            <div className="admin-overview">
              {isLoadingData ? (
                <div className="admin-loading">
                  <div className="admin-loading-spinner">⏳</div>
                  <p>Loading dashboard data...</p>
                </div>
              ) : (
                <>
              {/* Key Metrics */}
              <div className="admin-metrics-grid">
                <div className="admin-metric-card">
                  <div className="admin-metric-icon">👥</div>
                  <div className="admin-metric-content">
                    <div className="admin-metric-value">{dashboardStats.totalUsers}</div>
                    <div className="admin-metric-label">Total Employees</div>
                    <div className="admin-metric-trend positive">Currently registered</div>
                  </div>
                </div>
                
                <div className="admin-metric-card">
                  <div className="admin-metric-icon">🏢</div>
                  <div className="admin-metric-content">
                    <div className="admin-metric-value">{dashboardStats.totalDepartments}</div>
                    <div className="admin-metric-label">Departments</div>
                    <div className="admin-metric-trend neutral">Active departments</div>
                  </div>
                </div>
                
                <div className="admin-metric-card">
                  <div className="admin-metric-icon">✅</div>
                  <div className="admin-metric-content">
                    <div className="admin-metric-value">{dashboardStats.activeUsers}</div>
                    <div className="admin-metric-label">Active Users</div>
                    <div className="admin-metric-trend positive">Currently active</div>
                  </div>
                </div>
                
                <div className="admin-metric-card">
                  <div className="admin-metric-icon">📋</div>
                  <div className="admin-metric-content">
                    <div className="admin-metric-value">{dashboardStats.totalLeaveTypes}</div>
                    <div className="admin-metric-label">Leave Types</div>
                    <div className="admin-metric-trend neutral">Available types</div>
                  </div>
                </div>
              </div>

                </>
              )}
            </div>
          )}

          {activeSection === 'users' && (
            <div className="admin-users">
              <div className="admin-section-header">
                <h2>User Management</h2>
                <div className="admin-header-actions">
                  <div style={{ fontSize: '0.9rem', color: '#666', marginRight: '1rem' }}>
                    Total Users: {users.length} | Filtered: {filteredUsers.length}
                  </div>
                  <button 
                    className="admin-secondary-btn"
                    onClick={async () => {
                      try {
                        await fetchDashboardData();
                      } catch (error) {
                        console.error('Refresh error:', error);
                        alert('Refresh failed: ' + error.message);
                      }
                    }}
                    disabled={isLoadingData}
                  >
                    {isLoadingData ? '⏳ Loading...' : '🔄 Refresh Data'}
                  </button>
                  <button 
                    className="admin-primary-btn" 
                    onClick={() => setShowAddUser(!showAddUser)}
                  >
                    {showAddUser ? 'Cancel' : 'Add User'}
                  </button>
              </div>
              </div>
              
              {/* Add User Form - Full Register Form */}
              {showAddUser && (
                <div className="admin-register-form-container">
                  <div className="admin-register-form-header">
                    <h3>Create New User Account</h3>
                    <button 
                      className="admin-close-form-btn"
                      onClick={() => setShowAddUser(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <form className="admin-register-form" onSubmit={handleCreateUser}>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label>Name with Initials *</label>
                        <input 
                          type="text" 
                          className={`admin-form-input ${registerFieldErrors.initials ? 'error' : ''}`}
                          name="initials"
                          value={registerForm.initials}
                          onChange={handleRegisterChange}
                          onBlur={handleRegisterBlur}
                          placeholder="Enter Name with Initials"
                        />
                        {registerFieldErrors.initials && <div className="admin-field-error">{registerFieldErrors.initials}</div>}
                      </div>
                      <div className="admin-form-group">
                        <label>EPF Number *</label>
                        <input 
                          type="text" 
                          className={`admin-form-input ${registerFieldErrors.epf ? 'error' : ''}`}
                          name="epf"
                          value={registerForm.epf}
                          onChange={handleRegisterChange}
                          onBlur={handleRegisterBlur}
                          placeholder="Enter EPF Number"
                        />
                        {registerFieldErrors.epf && <div className="admin-field-error">{registerFieldErrors.epf}</div>}
                      </div>
                    </div>
                    
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label>NIC Number *</label>
                        <input 
                          type="text" 
                          className={`admin-form-input ${registerFieldErrors.nic ? 'error' : ''}`}
                          name="nic"
                          value={registerForm.nic}
                          onChange={handleRegisterChange}
                          onBlur={handleRegisterBlur}
                          placeholder="Enter NIC Number"
                        />
                        {registerFieldErrors.nic && <div className="admin-field-error">{registerFieldErrors.nic}</div>}
                      </div>
                      <div className="admin-form-group">
                        <label>Appointment Date *</label>
                        <div className="date-field" ref={calendarRef}>
                          <input 
                            type="date" 
                            className={`admin-form-input date-input ${registerFieldErrors.appointment ? 'error' : ''}`}
                            name="appointment"
                            value={registerForm.appointment}
                            onChange={handleRegisterChange}
                            onBlur={handleRegisterBlur}
                          />
                          <div className="calendar-icon" onClick={toggleCalendar}>📅</div>
                          {showCalendar && <Calendar />}
                        </div>
                        {registerFieldErrors.appointment && <div className="admin-field-error">{registerFieldErrors.appointment}</div>}
                      </div>
                    </div>
                    
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label>Gender *</label>
                        <div className={`admin-gender-selection ${registerFieldErrors.gender ? 'error' : ''}`}>
                          <div className="admin-gender-option">
                            <input
                              type="radio"
                              id="gender-male"
                              name="gender"
                              value="male"
                              checked={registerForm.gender === "male"}
                              onChange={handleRegisterChange}
                              onBlur={handleRegisterBlur}
                              className="admin-gender-radio-hidden"
                            />
                            <label htmlFor="gender-male" className={`admin-gender-card ${registerForm.gender === "male" ? "selected" : ""}`}>
                              <div className="admin-gender-icon">
                                <div className="admin-gender-avatar male-avatar">♂</div>
                              </div>
                              <div className="admin-gender-content">
                                <span className="admin-gender-title">Male</span>
                                <span className="admin-gender-subtitle">Select this option</span>
                              </div>
                              <div className="admin-gender-indicator">
                                <div className="admin-gender-radio-custom"></div>
                              </div>
                            </label>
                          </div>
                          <div className="admin-gender-option">
                            <input
                              type="radio"
                              id="gender-female"
                              name="gender"
                              value="female"
                              checked={registerForm.gender === "female"}
                              onChange={handleRegisterChange}
                              onBlur={handleRegisterBlur}
                              className="admin-gender-radio-hidden"
                            />
                            <label htmlFor="gender-female" className={`admin-gender-card ${registerForm.gender === "female" ? "selected" : ""}`}>
                              <div className="admin-gender-icon">
                                <div className="admin-gender-avatar female-avatar">♀</div>
                              </div>
                              <div className="admin-gender-content">
                                <span className="admin-gender-title">Female</span>
                                <span className="admin-gender-subtitle">Select this option</span>
                              </div>
                              <div className="admin-gender-indicator">
                                <div className="admin-gender-radio-custom"></div>
                              </div>
                            </label>
                          </div>
                        </div>
                        {registerFieldErrors.gender && <div className="admin-field-error">{registerFieldErrors.gender}</div>}
                      </div>
                      <div className="admin-form-group">
                        <label>Role *</label>
                        <select 
                          className={`admin-form-input ${registerFieldErrors.role ? 'error' : ''}`}
                          name="role"
                          value={registerForm.role}
                          onChange={handleRegisterChange}
                          onBlur={handleRegisterBlur}
                        >
                          <option value="">Select Role</option>
                          <option value="Academic Staff">Academic Staff</option>
                          <option value="Non-academic Staff">Non-academic Staff</option>
                        </select>
                        {registerFieldErrors.role && <div className="admin-field-error">{registerFieldErrors.role}</div>}
                      </div>
                    </div>
                    
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label>Position *</label>
                        <select 
                          className={`admin-form-input ${registerFieldErrors.position ? 'error' : ''}`}
                          name="position"
                          value={registerForm.position}
                          onChange={handleRegisterChange}
                          onBlur={handleRegisterBlur}
                        >
                          <option value="">Select Position</option>
                          <option value="Dean">Dean</option>
                          <option value="HOD">HOD</option>
                          <option value="Senior Lecturer 1">Senior Lecturer 1</option>
                          <option value="Senior Lecturer 2">Senior Lecturer 2</option>
                          <option value="Lecturer">Lecturer</option>
                          <option value="Lecturer (Probationary)">Lecturer (Probationary)</option>
                          <option value="Instructor (Permenant)">Instructor (Permenant)</option>
                          <option value="Instructor (Temporary)">Instructor (Temporary)</option>
                        </select>
                        {registerFieldErrors.position && <div className="admin-field-error">{registerFieldErrors.position}</div>}
                      </div>
                      {registerForm.role === "Academic Staff" && (
                        <div className="admin-form-group">
                          <label>Department *</label>
                          <select 
                            className={`admin-form-input ${registerFieldErrors.department ? 'error' : ''}`}
                            name="department"
                            value={registerForm.department}
                            onChange={handleRegisterChange}
                            onBlur={handleRegisterBlur}
                          >
                            <option value="">Select Department</option>
                            {departments.length > 0 ? (
                              departments.filter(dept => dept.name !== 'No Department').map(dept => (
                                <option key={dept._id || dept.id} value={dept.name}>
                                  {dept.name}
                                </option>
                              ))
                            ) : (
                              <option disabled>No departments available</option>
                            )}
                          </select>
                          {registerFieldErrors.department && <div className="admin-field-error">{registerFieldErrors.department}</div>}
                        </div>
                      )}
                    </div>
                    
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label>Email *</label>
                        <input 
                          type="email" 
                          className={`admin-form-input ${registerFieldErrors.email ? 'error' : ''}`}
                          name="email"
                          value={registerForm.email}
                          onChange={handleRegisterChange}
                          onBlur={handleRegisterBlur}
                          placeholder="Enter Email Address"
                        />
                        {registerFieldErrors.email && <div className="admin-field-error">{registerFieldErrors.email}</div>}
                      </div>
                      <div className="admin-form-group">
                        <label>Username *</label>
                        <input 
                          type="text" 
                          className={`admin-form-input ${registerFieldErrors.username ? 'error' : ''}`}
                          name="username"
                          value={registerForm.username}
                          onChange={handleRegisterChange}
                          onBlur={handleRegisterBlur}
                          placeholder="Enter Username"
                        />
                        {registerFieldErrors.username && <div className="admin-field-error">{registerFieldErrors.username}</div>}
                      </div>
                    </div>
                    
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label>Password *</label>
                        <div className="admin-password-field">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            className={`admin-form-input ${registerFieldErrors.password ? 'error' : ''}`}
                            name="password"
                            value={registerForm.password}
                            onChange={handleRegisterChange}
                            onBlur={handleRegisterBlur}
                            placeholder="At least 6 characters with uppercase, lowercase, and number"
                          />
                          <button
                            type="button"
                            className="admin-password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "👁️" : "👁️‍🗨️"}
                          </button>
                        </div>
                        {registerFieldErrors.password && <div className="admin-field-error">{registerFieldErrors.password}</div>}
                      </div>
                      <div className="admin-form-group">
                        <label>Contact Number</label>
                        <input 
                          type="tel" 
                          className="admin-form-input"
                          name="contactNumber"
                          value={registerForm.contactNumber}
                          onChange={handleRegisterChange}
                          placeholder="Enter Contact Number"
                        />
                      </div>
                    </div>
                    
                    {registerErrorMsg && <div className="admin-form-error">{registerErrorMsg}</div>}
                    
                    <div className="admin-form-actions">
                      <button 
                        type="button" 
                        className="admin-secondary-btn"
                        onClick={() => setShowAddUser(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="admin-primary-btn"
                        disabled={registerLoading}
                      >
                        {registerLoading ? "Creating..." : "Create User Account"}
                      </button>
                    </div>
                  </form>
                </div>
                )}
                
              
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            {isLoadingData ? (
                              <div>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                                <div>Loading users...</div>
                              </div>
                            ) : users.length === 0 ? (
                              <div>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥</div>
                                <div>No users found</div>
                                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                  Click "Add User" to create the first user
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                                <div>No users match the current filters</div>
                                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                  Try changing the department or role filters
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(user => (
                      <tr 
                        key={user.id} 
                        className={newlyCreatedUserId === user.id ? 'admin-new-user-row' : ''}
                        style={newlyCreatedUserId === user.id ? {
                          backgroundColor: '#e3f2fd',
                          border: '2px solid #3b82f6',
                          animation: 'pulse 2s ease-in-out'
                        } : {}}
                      >
                        <td>
                          <div className="admin-user-info">
                            <div className="admin-user-name">
                              {user.name}
                              {newlyCreatedUserId === user.id && (
                                <span style={{ 
                                  marginLeft: '0.5rem', 
                                  color: '#3b82f6', 
                                  fontWeight: 'bold',
                                  fontSize: '0.8rem'
                                }}>
                                  ✨ NEW
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.department}</td>
                        <td>{user.position}</td>
                        <td>
                          <span 
                            className="admin-status-badge"
                            style={{ backgroundColor: getStatusColor(user.status) }}
                          >
                            {getStatusIcon(user.status)} {user.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-action-buttons">
                            <button 
                              className="admin-edit-btn" 
                              title="Edit User"
                              onClick={() => handleEditUser(user)}
                            >
                              ✏️
                            </button>
                            <button 
                              className="admin-delete-btn" 
                              title="Delete User"
                              onClick={() => handleDeleteUser(user)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'departments' && (
            <div className="admin-departments">
              <div className="admin-section-header">
                <div className="admin-section-title">
                  <span className="admin-section-icon">🏢</span>
                  <h2>Departments</h2>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button 
                    className="admin-primary-btn"
                    onClick={() => setShowAddDepartment(true)}
                  >
                    + Add Department
                  </button>
                  <button 
                    className="admin-secondary-btn"
                    onClick={refreshDepartments}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
              
              <div className="admin-departments-list">
                {departments.filter(dept => dept.name !== 'No Department').map(dept => (
                  <div key={dept._id || dept.id} className="admin-department-item">
                    <div className="admin-department-content">
                      <div className="admin-department-header">
                        <div className="admin-department-title">
                          <h3>{dept.name}</h3>
                          <span className="admin-department-abbrev">
                            {dept.code || dept.name.split(' ').map(word => word.charAt(0)).join('').substring(0, 4)}
                          </span>
                        </div>
                        <div className="admin-department-actions">
                          <button 
                            className="admin-edit-btn" 
                            title="Edit Department"
                            onClick={() => handleEditDepartment(dept)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="admin-delete-btn" 
                            title="Delete Department"
                            onClick={() => handleDeleteDepartment(dept)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="admin-department-description">
                        {dept.description || `Department of ${dept.name}`}
                      </div>
                      
                      <div className="admin-department-stats">
                        <div className="admin-department-stat">
                          <span className="admin-stat-icon">👥</span>
                          <span className="admin-stat-text">
                            {users.filter(user => user.department === dept.name).length} staff
                          </span>
                        </div>
                        <span className="admin-stat-separator">•</span>
                        <div className="admin-department-stat">
                          <span className="admin-stat-text">
                            {users.filter(user => user.department === dept.name && user.status === 'active').length} active
                          </span>
                        </div>
                      </div>
                      
                      <div className="admin-department-hod">
                        <strong>Head:</strong> {dept.head || 'No Head Assigned'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'leave-types' && (
            <div className="admin-leave-types">
              <div className="admin-section-header">
                <div className="admin-section-title">
                  <span className="admin-section-icon">📋</span>
                  <h2>Leave Types</h2>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button 
                    className="admin-primary-btn"
                    onClick={() => setShowAddLeaveType(true)}
                  >
                    + Add Leave Type
                  </button>
                  <button 
                    className="admin-secondary-btn"
                    onClick={async () => {
                      try {
                        await fetchDashboardData();
                      } catch (error) {
                        console.error('Refresh error:', error);
                        alert('Refresh failed: ' + error.message);
                      }
                    }}
                    disabled={isLoadingData}
                  >
                    {isLoadingData ? '⏳ Loading...' : '🔄 Refresh'}
                  </button>
                </div>
              </div>
              
              <div className="admin-leave-types-list">
                {leaveTypes.length === 0 ? (
                  <div className="admin-empty-state">
                    <div className="admin-empty-icon">📋</div>
                    <h3>No Leave Types Found</h3>
                    <p>Click "Add Leave Type" to create the first leave type</p>
                  </div>
                ) : (
                  leaveTypes.map(leaveType => (
                    <div key={leaveType._id || leaveType.id} className="admin-leave-type-item">
                      <div className="admin-leave-type-content">
                        <div className="admin-leave-type-header">
                          <div className="admin-leave-type-title">
                            <h3>{leaveType.name}</h3>
                            <span className="admin-leave-type-days">
                              {leaveType.days} days
                            </span>
                          </div>
                          <div className="admin-leave-type-actions">
                            <button 
                              className="admin-edit-btn" 
                              title="Edit Leave Type"
                              onClick={() => handleEditLeaveType(leaveType)}
                            >
                              ✏️
                            </button>
                            <button 
                              className="admin-delete-btn" 
                              title="Delete Leave Type"
                              onClick={() => handleDeleteLeaveType(leaveType)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        
                        <div className="admin-leave-type-description">
                          {leaveType.description || `Leave type: ${leaveType.name}`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === 'statistics' && (
             <div className="admin-statistics">
               <h2>Leave Management Analytics</h2>
               
               {/* Key Performance Indicators */}
               <div className="admin-kpi-grid">
                 <div className="admin-kpi-card">
                   <div className="admin-kpi-header">
                     <h3>Total Users</h3>
                     <span className="admin-kpi-trend neutral">Current</span>
                   </div>
                   <div className="admin-kpi-value">{users.length}</div>
                   <div className="admin-kpi-subtitle">registered users</div>
                 </div>
                 
                 <div className="admin-kpi-card">
                   <div className="admin-kpi-header">
                     <h3>Active Users</h3>
                     <span className="admin-kpi-trend neutral">Current</span>
                   </div>
                   <div className="admin-kpi-value">{users.filter(user => user.status === 'active').length}</div>
                   <div className="admin-kpi-subtitle">active users</div>
                 </div>
                 
                 <div className="admin-kpi-card">
                   <div className="admin-kpi-header">
                     <h3>Departments</h3>
                     <span className="admin-kpi-trend neutral">Current</span>
                   </div>
                   <div className="admin-kpi-value">{departments.filter(dept => dept.name !== 'No Department').length}</div>
                   <div className="admin-kpi-subtitle">active departments</div>
                 </div>
                 
                 <div className="admin-kpi-card">
                   <div className="admin-kpi-header">
                     <h3>Leave Types</h3>
                     <span className="admin-kpi-trend neutral">Current</span>
                   </div>
                   <div className="admin-kpi-value">{leaveTypes.length}</div>
                   <div className="admin-kpi-subtitle">configured types</div>
                 </div>
               </div>
               
               {/* Charts Row */}
               <div className="admin-charts-row">
                 <div className="admin-chart-card">
                   <h3>User Distribution by Role</h3>
                   <div className="admin-bar-chart">
                     <div className="admin-chart-bars">
                       {dashboardStats.usersByRole && dashboardStats.usersByRole.length > 0 ? (
                         dashboardStats.usersByRole.map((roleData, index) => (
                           <div key={index} className="admin-chart-bar-group">
                             <div 
                               className="admin-chart-bar approved" 
                               style={{ height: `${Math.max((roleData.count / Math.max(...dashboardStats.usersByRole.map(r => r.count))) * 100, 10)}%` }}
                             ></div>
                             <span className="admin-chart-label">{roleData.role}</span>
                           </div>
                         ))
                       ) : (
                         <div className="admin-no-data">No role data available</div>
                       )}
                     </div>
                     <div className="admin-chart-legend">
                       <div className="admin-legend-item">
                         <span className="admin-legend-color approved"></span>
                         <span>Users by Role</span>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 <div className="admin-chart-card">
                   <h3>Department-wise User Distribution</h3>
                   <div className="admin-pie-chart">
                     <div className="admin-pie-chart-container">
                       {departments.filter(dept => dept.name !== 'No Department').slice(0, 4).map((dept, index) => {
                         const userCount = users.filter(user => user.department === dept.name).length;
                         const totalUsers = users.length;
                         const percentage = totalUsers > 0 ? (userCount / totalUsers) * 100 : 0;
                         const colors = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];
                         
                         return (
                           <div key={dept._id} className="admin-pie-segment" style={{ '--percentage': `${percentage}%`, '--color': colors[index] }}>
                             <span className="admin-pie-label">{dept.name}</span>
                             <span className="admin-pie-value">{userCount}</span>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Department Statistics */}
               <div className="admin-leave-types-breakdown">
                 <h3>Department Statistics</h3>
                 <div className="admin-leave-types-grid">
                   {departments.filter(dept => dept.name !== 'No Department').map((dept, index) => {
                     const userCount = users.filter(user => user.department === dept.name).length;
                     const activeCount = users.filter(user => user.department === dept.name && user.status === 'active').length;
                     const colors = ['blue', 'light-blue', 'green', 'orange'];
                     
                     return (
                       <div key={dept._id} className="admin-leave-type-item">
                         <div className={`admin-leave-type-dot ${colors[index % colors.length]}`}></div>
                         <div className="admin-leave-type-info">
                           <span className="admin-leave-type-name">{dept.name}</span>
                           <span className="admin-leave-type-count">{userCount} users ({activeCount} active)</span>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
               
               {/* System Overview */}
               <div className="admin-leave-types-breakdown">
                 <h3>System Overview</h3>
                 <div className="admin-leave-types-grid">
                   <div className="admin-leave-type-item">
                     <div className="admin-leave-type-dot blue"></div>
                     <div className="admin-leave-type-info">
                       <span className="admin-leave-type-name">Total Users</span>
                       <span className="admin-leave-type-count">{users.length}</span>
                     </div>
                   </div>
                   <div className="admin-leave-type-item">
                     <div className="admin-leave-type-dot light-blue"></div>
                     <div className="admin-leave-type-info">
                       <span className="admin-leave-type-name">Active Users</span>
                       <span className="admin-leave-type-count">{users.filter(user => user.status === 'active').length}</span>
                     </div>
                   </div>
                   <div className="admin-leave-type-item">
                     <div className="admin-leave-type-dot green"></div>
                     <div className="admin-leave-type-info">
                       <span className="admin-leave-type-name">Departments</span>
                       <span className="admin-leave-type-count">{departments.filter(dept => dept.name !== 'No Department').length}</span>
                     </div>
                   </div>
                   <div className="admin-leave-type-item">
                     <div className="admin-leave-type-dot orange"></div>
                     <div className="admin-leave-type-info">
                       <span className="admin-leave-type-name">Leave Types</span>
                       <span className="admin-leave-type-count">{leaveTypes.length}</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}

          {activeSection === 'reports' && (
            <div className="admin-reports">
              <div className="admin-section-header">
                <h2>Reports & Analytics</h2>
                <button 
                  className="admin-primary-btn"
                  onClick={() => setShowReportFilters(true)}
                >
                  Generate Report
                </button>
              </div>
              
              <div className="admin-reports-grid">
                <div className="admin-report-card">
                  <h3>Monthly Summary</h3>
                  <div className="admin-report-stats">
                    <div className="admin-report-stat">
                      <span className="admin-stat-label">Total Users:</span>
                      <span className="admin-stat-value">{users.length}</span>
                    </div>
                    <div className="admin-report-stat">
                      <span className="admin-stat-label">Active Users:</span>
                      <span className="admin-stat-value">{users.filter(u => u.status === 'active').length}</span>
                    </div>
                    <div className="admin-report-stat">
                      <span className="admin-stat-label">Departments:</span>
                      <span className="admin-stat-value">{departments.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="admin-profile">
              <div className="admin-section-header">
                <h2>My Profile</h2>
              </div>
              
              <div className="admin-profile-content">
                <div className="admin-profile-card">
                  <div className="admin-profile-header">
                    <div className="admin-profile-avatar-large">👤</div>
                    <div className="admin-profile-info">
                      <h3>{accountSettings.fullName || 'System Admin'}</h3>
                      <p>{accountSettings.position || 'Administrator'}</p>
                      <span className="admin-profile-status">Active</span>
                    </div>
                  </div>
                  
                  <div className="admin-profile-details">
                    <div className="admin-detail-item">
                      <label>Email</label>
                      <span>{accountSettings.email || 'admin@university.edu'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Department</label>
                      <span>{accountSettings.department || 'Administration'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Role</label>
                      <span>{accountSettings.role || 'Administrator'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Contact Number</label>
                      <span>{accountSettings.contactNumber || 'Not provided'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Last Login</label>
                      <span>{accountSettings.lastLogin || 'Unknown'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Account Created</label>
                      <span>{accountSettings.accountCreated || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="admin-settings">
              <div className="admin-section-header">
                <h2>Settings</h2>
                <div className="admin-header-actions">
                  <button 
                    className="admin-secondary-btn"
                    onClick={refreshAccountSettings}
                    disabled={accountRefreshLoading}
                    title="Refresh account data from database"
                  >
                    {accountRefreshLoading ? '⏳ Refreshing...' : '🔄 Refresh from Database'}
                  </button>
                </div>
                {settingsMessage && (
                  <div className={`admin-settings-message ${settingsMessage.includes('✅') ? 'success' : 'error'}`}>
                    {settingsMessage}
                  </div>
                )}
              </div>
              
              <div className="admin-settings-grid">
                <div className="admin-settings-card">
                  <h3>Account Settings</h3>
                  <form onSubmit={handleSaveAccountSettings} className="admin-settings-form">
                    <div className="admin-form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={accountSettings.fullName}
                        onChange={handleAccountSettingsChange}
                        className="admin-form-input"
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={accountSettings.email}
                        onChange={handleAccountSettingsChange}
                        className="admin-form-input"
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Role</label>
                      <input 
                        type="text" 
                        value={accountSettings.role} 
                        className="admin-form-input"
                        disabled 
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Contact Number</label>
                      <input 
                        type="tel" 
                        name="contactNumber"
                        value={accountSettings.contactNumber}
                        onChange={handleAccountSettingsChange}
                        className="admin-form-input"
                        placeholder="Enter contact number"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="admin-primary-btn"
                      disabled={settingsLoading}
                    >
                      {settingsLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
                
                <div className="admin-settings-card">
                  <h3>System Preferences</h3>
                  <form onSubmit={handleSaveSystemPreferences} className="admin-settings-form">
                    <div className="admin-settings-options">
                      <div className="admin-setting-item">
                        <label htmlFor="emailNotifications">Email Notifications</label>
                        <input 
                          type="checkbox" 
                          id="emailNotifications"
                          name="emailNotifications"
                          checked={systemPreferences.emailNotifications}
                          onChange={handleSystemPreferencesChange}
                          className="admin-checkbox"
                        />
                      </div>
                      <div className="admin-setting-item">
                        <label htmlFor="darkMode">Dark Mode</label>
                        <input 
                          type="checkbox" 
                          id="darkMode"
                          name="darkMode"
                          checked={systemPreferences.darkMode}
                          onChange={handleSystemPreferencesChange}
                          className="admin-checkbox"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="admin-primary-btn"
                      disabled={settingsLoading}
                    >
                      {settingsLoading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Edit User</h3>
              <button 
                className="admin-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="admin-modal-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    required
                    className="admin-form-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                    className="admin-form-input"
                  />
                </div>
              </div>
              
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Role *</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    required
                    className="admin-form-input"
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="academic">Academic Staff</option>
                    <option value="hod">HOD</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="management_assistant">Management Assistant</option>
                    <option value="non-academic">Non-academic Staff</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                    className="admin-form-input"
                  />
                </div>
              </div>
              
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                    className="admin-form-input"
                  >
                    <option value="">Select Department</option>
                    {departments.length > 0 ? (
                      departments.filter(dept => dept.name !== 'No Department').map(dept => (
                        <option key={dept._id || dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No departments available</option>
                    )}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="admin-form-input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    value={editForm.contactNumber}
                    onChange={(e) => setEditForm({...editForm, contactNumber: e.target.value})}
                    className="admin-form-input"
                  />
                </div>
              </div>
              
              <div className="admin-modal-actions">
                <button 
                  type="button" 
                  className="admin-secondary-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-primary-btn"
                  disabled={editLoading}
                >
                  {editLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Delete User</h3>
              <button 
                className="admin-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-content">
              <p>Are you sure you want to delete this user?</p>
              <div className="admin-delete-user-info">
                <strong>Name:</strong> {userToDelete?.name}<br/>
                <strong>Email:</strong> {userToDelete?.email}<br/>
                <strong>Role:</strong> {userToDelete?.role}
              </div>
              <p className="admin-delete-warning">
                ⚠️ This action cannot be undone!
              </p>
            </div>
            <div className="admin-modal-actions">
              <button 
                className="admin-secondary-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="admin-danger-btn"
                onClick={confirmDeleteUser}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Add Department Modal */}
        {showAddDepartment && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3>Add New Department</h3>
                <button 
                  className="admin-modal-close" 
                  onClick={() => setShowAddDepartment(false)}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddDepartment} className="admin-modal-form">
                <div className="admin-form-group">
                  <label>Department Name</label>
                  <input
                    type="text"
                    name="name"
                    value={departmentForm.name}
                    onChange={handleDepartmentChange}
                    placeholder="Enter department name"
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Department Code</label>
                  <input
                    type="text"
                    name="code"
                    value={departmentForm.code}
                    onChange={handleDepartmentChange}
                    placeholder="Enter department code"
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Department Head</label>
                  <input
                    type="text"
                    name="head"
                    value={departmentForm.head}
                    onChange={handleDepartmentChange}
                    placeholder="Enter department head name"
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={departmentForm.description}
                    onChange={handleDepartmentChange}
                    placeholder="Enter department description"
                    className="admin-form-input"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="admin-modal-actions">
                  <button 
                    type="button" 
                    className="admin-secondary-btn" 
                    onClick={() => setShowAddDepartment(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-primary-btn" 
                    disabled={departmentLoading}
                  >
                    {departmentLoading ? 'Adding...' : 'Add Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Department Modal */}
        {showEditDepartment && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3>Edit Department</h3>
                <button 
                  className="admin-modal-close" 
                  onClick={() => setShowEditDepartment(false)}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleEditDepartmentSubmit} className="admin-modal-form">
                <div className="admin-form-group">
                  <label>Department Name</label>
                  <input
                    type="text"
                    name="name"
                    value={departmentForm.name}
                    onChange={handleDepartmentChange}
                    placeholder="Enter department name"
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Department Code</label>
                  <input
                    type="text"
                    name="code"
                    value={departmentForm.code}
                    onChange={handleDepartmentChange}
                    placeholder="Enter department code"
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Department Head</label>
                  <input
                    type="text"
                    name="head"
                    value={departmentForm.head}
                    onChange={handleDepartmentChange}
                    placeholder="Enter department head name"
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={departmentForm.description}
                    onChange={handleDepartmentChange}
                    placeholder="Enter department description"
                    className="admin-form-input"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="admin-modal-actions">
                  <button 
                    type="button" 
                    className="admin-secondary-btn" 
                    onClick={() => setShowEditDepartment(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-primary-btn" 
                    disabled={editDepartmentLoading}
                  >
                    {editDepartmentLoading ? 'Updating...' : 'Update Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Department Confirmation Modal */}
        {showDeleteDepartment && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3>Delete Department</h3>
                <button 
                  className="admin-modal-close" 
                  onClick={() => setShowDeleteDepartment(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="admin-modal-content">
                <p>Are you sure you want to delete this department?</p>
                <div className="admin-delete-department-info">
                  <strong>Name:</strong> {departmentToDelete?.name}<br/>
                  <strong>Code:</strong> {departmentToDelete?.code}<br/>
                  <strong>Head:</strong> {departmentToDelete?.head}
                </div>
                <p className="admin-delete-warning">⚠️ This action cannot be undone!</p>
              </div>
              
              <div className="admin-modal-actions">
                <button 
                  className="admin-secondary-btn" 
                  onClick={() => setShowDeleteDepartment(false)}
                >
                  Cancel
                </button>
                <button 
                  className="admin-danger-btn" 
                  onClick={confirmDeleteDepartment}
                  disabled={deleteDepartmentLoading}
                >
                  {deleteDepartmentLoading ? 'Deleting...' : 'Delete Department'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Filters Modal */}
        {showReportFilters && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <div className="admin-modal-title">
                  <span className="admin-modal-icon">🔍</span>
                  <h3>Report Filters</h3>
                </div>
                <button 
                  className="admin-modal-close" 
                  onClick={() => setShowReportFilters(false)}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleGenerateReport} className="admin-modal-form">
                <div className="admin-form-group">
                  <label>From Date</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={reportFilters.fromDate}
                    onChange={handleReportFilterChange}
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>To Date</label>
                  <input
                    type="date"
                    name="toDate"
                    value={reportFilters.toDate}
                    onChange={handleReportFilterChange}
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={reportFilters.department}
                    onChange={handleReportFilterChange}
                    className="admin-form-input"
                  >
                    <option value="All Departments">All Departments</option>
                    {departments.filter(dept => dept.name !== 'No Department').map(dept => (
                      <option key={dept._id || dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="admin-modal-actions">
                  <button 
                    type="button" 
                    className="admin-secondary-btn" 
                    onClick={() => setShowReportFilters(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-primary-btn" 
                    disabled={reportLoading}
                  >
                    {reportLoading ? 'Generating...' : '📄 Generate Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Leave Type Modal */}
        {showAddLeaveType && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3>Add New Leave Type</h3>
                <button 
                  className="admin-modal-close" 
                  onClick={() => setShowAddLeaveType(false)}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddLeaveType} className="admin-modal-form">
                <div className="admin-form-group">
                  <label>Leave Type Name</label>
                  <input
                    type="text"
                    name="name"
                    value={leaveTypeForm.name}
                    onChange={handleLeaveTypeChange}
                    placeholder="Enter leave type name"
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Number of Days</label>
                  <input
                    type="number"
                    name="days"
                    value={leaveTypeForm.days}
                    onChange={handleLeaveTypeChange}
                    placeholder="Enter number of days"
                    className="admin-form-input"
                    min="1"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={leaveTypeForm.description}
                    onChange={handleLeaveTypeChange}
                    placeholder="Enter leave type description"
                    className="admin-form-input"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="admin-modal-actions">
                  <button 
                    type="button" 
                    className="admin-secondary-btn" 
                    onClick={() => setShowAddLeaveType(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-primary-btn" 
                    disabled={leaveTypeLoading}
                  >
                    {leaveTypeLoading ? 'Adding...' : 'Add Leave Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Leave Type Modal */}
        {showEditLeaveType && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3>Edit Leave Type</h3>
                <button 
                  className="admin-modal-close" 
                  onClick={() => setShowEditLeaveType(false)}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleEditLeaveTypeSubmit} className="admin-modal-form">
                <div className="admin-form-group">
                  <label>Leave Type Name</label>
                  <input
                    type="text"
                    name="name"
                    value={leaveTypeForm.name}
                    onChange={handleLeaveTypeChange}
                    placeholder="Enter leave type name"
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Number of Days</label>
                  <input
                    type="number"
                    name="days"
                    value={leaveTypeForm.days}
                    onChange={handleLeaveTypeChange}
                    placeholder="Enter number of days"
                    className="admin-form-input"
                    min="1"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={leaveTypeForm.description}
                    onChange={handleLeaveTypeChange}
                    placeholder="Enter leave type description"
                    className="admin-form-input"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="admin-modal-actions">
                  <button 
                    type="button" 
                    className="admin-secondary-btn" 
                    onClick={() => setShowEditLeaveType(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-primary-btn" 
                    disabled={editLeaveTypeLoading}
                  >
                    {editLeaveTypeLoading ? 'Updating...' : 'Update Leave Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Leave Type Confirmation Modal */}
        {showDeleteLeaveType && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3>Delete Leave Type</h3>
                <button 
                  className="admin-modal-close" 
                  onClick={() => setShowDeleteLeaveType(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="admin-modal-content">
                <p>Are you sure you want to delete this leave type?</p>
                <div className="admin-delete-leave-type-info">
                  <strong>Name:</strong> {leaveTypeToDelete?.name}<br/>
                  <strong>Days:</strong> {leaveTypeToDelete?.days} days<br/>
                  <strong>Description:</strong> {leaveTypeToDelete?.description}
                </div>
                <p className="admin-delete-warning">⚠️ This action cannot be undone!</p>
              </div>
              
              <div className="admin-modal-actions">
                <button 
                  className="admin-secondary-btn" 
                  onClick={() => setShowDeleteLeaveType(false)}
                >
                  Cancel
                </button>
                <button 
                  className="admin-danger-btn" 
                  onClick={confirmDeleteLeaveType}
                  disabled={deleteLeaveTypeLoading}
                >
                  {deleteLeaveTypeLoading ? 'Deleting...' : 'Delete Leave Type'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scroll to Top Button */}
      <button
        className={`admin-scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
}
