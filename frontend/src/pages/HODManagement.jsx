import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HODManagement.css';

export default function HODManagement({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('hod');
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const navigate = useNavigate();

  // Set role switch visibility based on user position
  useEffect(() => {
    if (user) {
      const isHOD = user.position === "HOD" || user.hodRole === "hod" || user.role === "hod";
      setShowRoleSwitch(isHOD);
      if (isHOD) {
        setCurrentRole('hod-management');
      } else {
        setCurrentRole('academic');
      }
    }
  }, [user]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock leave requests
    setLeaveRequests([
      {
        id: 1,
        staffName: 'John Smith',
        department: 'Information Technology',
        leaveType: 'Annual Leave',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        days: 5,
        reason: 'Family vacation',
        status: 'pending',
        submittedDate: '2024-01-15'
      },
      {
        id: 2,
        staffName: 'Sarah Johnson',
        department: 'Information System',
        leaveType: 'Sick Leave',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        days: 3,
        reason: 'Medical appointment',
        status: 'approved',
        submittedDate: '2024-01-18'
      },
      {
        id: 3,
        staffName: 'Mike Wilson',
        department: 'Information Technology',
        leaveType: 'Personal Leave',
        startDate: '2024-02-10',
        endDate: '2024-02-12',
        days: 3,
        reason: 'Personal matters',
        status: 'rejected',
        submittedDate: '2024-01-20'
      }
    ]);

    // Mock users
    setUsers([
      { id: 1, name: 'John Smith', email: 'john@university.edu', department: 'Information Technology', position: 'Lecturer', status: 'active' },
      { id: 2, name: 'Sarah Johnson', email: 'sarah@university.edu', department: 'Information System', position: 'Senior Lecturer', status: 'active' },
      { id: 3, name: 'Mike Wilson', email: 'mike@university.edu', department: 'Information Technology', position: 'Lecturer', status: 'inactive' }
    ]);

    // Mock departments
    setDepartments([
      { id: 1, name: 'Information Technology', hod: 'Dr. John Smith', staffCount: 25 },
      { id: 2, name: 'Information System', hod: 'Dr. Sarah Johnson', staffCount: 18 }
    ]);

    // Mock leave types
    setLeaveTypes([
      { id: 1, name: 'Annual Leave', maxDays: 25, description: 'Annual vacation leave' },
      { id: 2, name: 'Sick Leave', maxDays: 10, description: 'Medical leave' },
      { id: 3, name: 'Personal Leave', maxDays: 5, description: 'Personal matters' },
      { id: 4, name: 'Maternity Leave', maxDays: 90, description: 'Maternity leave' }
    ]);
  }, []);

  const handleApproveRequest = (requestId) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' }
          : req
      )
    );
  };

  const handleRejectRequest = (requestId) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' }
          : req
      )
    );
  };

  const generateReport = () => {
    // Mock report generation
    const report = {
      id: Date.now(),
      title: `Leave Report - ${selectedDateRange.startDate} to ${selectedDateRange.endDate}`,
      department: selectedDepartment,
      staff: selectedStaff,
      generatedDate: new Date().toISOString().split('T')[0],
      data: {
        totalRequests: leaveRequests.length,
        approved: leaveRequests.filter(r => r.status === 'approved').length,
        rejected: leaveRequests.filter(r => r.status === 'rejected').length,
        pending: leaveRequests.filter(r => r.status === 'pending').length
      }
    };
    setReports(prev => [report, ...prev]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
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

  const handleRoleSwitch = (role) => {
    setCurrentRole(role);
    setShowRoleSwitch(false);
    
    if (role === 'academic') {
      // Switch to academic staff dashboard
      navigate('/lecturer');
    } else if (role === 'hod-management') {
      // Stay in HOD management (current page)
      navigate('/hod');
    } else if (role === 'personal-account') {
      // Switch back to personal account
      handlePersonalAccountSwitch();
    }
  };

  const handlePersonalAccountSwitch = async () => {
    try {
      // Get the original user data from localStorage
      const originalUser = localStorage.getItem('originalUser');
      
      if (originalUser) {
        // Log out current HOD account
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Restore original user data
        const userData = JSON.parse(originalUser);
        localStorage.setItem('user', JSON.stringify(userData.user));
        localStorage.setItem('token', userData.token);
        
        // Navigate to user dashboard
        navigate('/lecturer', { 
          state: { 
            flash: `Switched back to personal account: ${userData.user.fullName}`,
            user: userData.user 
          } 
        });
      } else {
        // If no original user data, redirect to login
        navigate('/login', { 
          state: { 
            message: 'Please log in with your personal account credentials' 
          } 
        });
      }
    } catch (error) {
      console.error('Error switching to personal account:', error);
      navigate('/login', { 
        state: { 
          message: 'Error switching accounts. Please log in again.' 
        } 
      });
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'hod-management': return 'HOD Management';
      case 'academic': return 'Academic Staff Account';
      default: return 'HOD Management';
    }
  };

  // Close role switch dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRoleSwitch && !event.target.closest('.hod-role-switch')) {
        setShowRoleSwitch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
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

  const renderDashboard = () => (
    <div className="hod-dashboard">
      <div className="hod-stats-grid">
        <div className="hod-stat-card">
          <div className="hod-stat-icon">📋</div>
          <div className="hod-stat-value">{leaveRequests.length}</div>
          <div className="hod-stat-label">Total Requests</div>
        </div>
        <div className="hod-stat-card">
          <div className="hod-stat-icon">⏳</div>
          <div className="hod-stat-value">{leaveRequests.filter(r => r.status === 'pending').length}</div>
          <div className="hod-stat-label">Pending</div>
        </div>
        <div className="hod-stat-card">
          <div className="hod-stat-icon">✅</div>
          <div className="hod-stat-value">{leaveRequests.filter(r => r.status === 'approved').length}</div>
          <div className="hod-stat-label">Approved</div>
        </div>
        <div className="hod-stat-card">
          <div className="hod-stat-icon">👥</div>
          <div className="hod-stat-value">{users.length}</div>
          <div className="hod-stat-label">Total Staff</div>
        </div>
      </div>

      <div className="hod-recent-requests">
        <h3>Recent Leave Requests</h3>
        <div className="hod-requests-list">
          {leaveRequests.slice(0, 5).map(request => (
            <div key={request.id} className="hod-request-item">
              <div className="hod-request-info">
                <div className="hod-request-staff">{request.staffName}</div>
                <div className="hod-request-details">
                  {request.leaveType} • {request.days} days • {request.department}
                </div>
              </div>
              <div className="hod-request-status">
                <span 
                  className="hod-status-badge"
                  style={{ backgroundColor: getStatusColor(request.status) }}
                >
                  {getStatusIcon(request.status)} {request.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLeaveRequests = () => (
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
            {users.map(user => (
              <option key={user.id} value={user.name}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="hod-requests-table">
        <table>
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
            {leaveRequests.map(request => (
              <tr key={request.id}>
                <td>{request.staffName}</td>
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
                        className="hod-approve-btn"
                        onClick={() => handleApproveRequest(request.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="hod-reject-btn"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="hod-user-management">
      <div className="hod-section-header">
        <h2>User Account Management</h2>
        <button className="hod-add-btn">+ Add New User</button>
      </div>

      <div className="hod-users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.department}</td>
                <td>{user.position}</td>
                <td>
                  <span className={`hod-status-badge ${user.status}`}>
                    {user.status === 'active' ? '✅ Active' : '❌ Inactive'}
                  </span>
                </td>
                <td>
                  <div className="hod-action-buttons">
                    <button className="hod-edit-btn">Edit</button>
                    <button className="hod-deactivate-btn">
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDepartmentManagement = () => (
    <div className="hod-department-management">
      <div className="hod-section-header">
        <h2>Department & Leave Types Management</h2>
        <div className="hod-management-tabs">
          <button 
            className={`hod-tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button 
            className={`hod-tab-btn ${activeTab === 'leave-types' ? 'active' : ''}`}
            onClick={() => setActiveTab('leave-types')}
          >
            Leave Types
          </button>
        </div>
      </div>

      {activeTab === 'departments' ? (
        <div className="hod-departments">
          <div className="hod-add-section">
            <button className="hod-add-btn">+ Add New Department</button>
          </div>
          <div className="hod-departments-grid">
            {departments.map(dept => (
              <div key={dept.id} className="hod-department-card">
                <h3>{dept.name}</h3>
                <p><strong>HOD:</strong> {dept.hod}</p>
                <p><strong>Staff Count:</strong> {dept.staffCount}</p>
                <div className="hod-card-actions">
                  <button className="hod-edit-btn">Edit</button>
                  <button className="hod-delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="hod-leave-types">
          <div className="hod-add-section">
            <button className="hod-add-btn">+ Add New Leave Type</button>
          </div>
          <div className="hod-leave-types-grid">
            {leaveTypes.map(type => (
              <div key={type.id} className="hod-leave-type-card">
                <h3>{type.name}</h3>
                <p><strong>Max Days:</strong> {type.maxDays}</p>
                <p><strong>Description:</strong> {type.description}</p>
                <div className="hod-card-actions">
                  <button className="hod-edit-btn">Edit</button>
                  <button className="hod-delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="hod-reports">
      <div className="hod-section-header">
        <h2>Leave Statistics & Reports</h2>
      </div>

      <div className="hod-report-filters">
        <div className="hod-filter-group">
          <label>Date Range:</label>
          <input 
            type="date" 
            value={selectedDateRange.startDate}
            onChange={(e) => setSelectedDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="hod-date-input"
          />
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
            {users.map(user => (
              <option key={user.id} value={user.name}>{user.name}</option>
            ))}
          </select>
        </div>
        <button className="hod-generate-btn" onClick={generateReport}>
          Generate Report
        </button>
      </div>

      <div className="hod-reports-list">
        <h3>Generated Reports</h3>
        {reports.map(report => (
          <div key={report.id} className="hod-report-item">
            <div className="hod-report-info">
              <h4>{report.title}</h4>
              <p>Department: {report.department} | Staff: {report.staff}</p>
              <p>Generated: {report.generatedDate}</p>
            </div>
            <div className="hod-report-stats">
              <div className="hod-stat">Total: {report.data.totalRequests}</div>
              <div className="hod-stat approved">Approved: {report.data.approved}</div>
              <div className="hod-stat rejected">Rejected: {report.data.rejected}</div>
              <div className="hod-stat pending">Pending: {report.data.pending}</div>
            </div>
            <div className="hod-report-actions">
              <button className="hod-download-btn">Download PDF</button>
              <button className="hod-view-btn">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="hod-management-shell">
      <aside className="hod-sidebar">
        <div className="hod-logo">
          <img src="/OIP-removebg-preview.png" alt="Logo" />
          <div className="hod-brand">LeaveLink</div>
        </div>
        <ul className="hod-nav">
          <li 
            className={`hod-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </li>
          <li 
            className={`hod-nav-item ${activeTab === 'leave-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('leave-requests')}
          >
            📋 Leave Requests
          </li>
          <li 
            className={`hod-nav-item ${activeTab === 'user-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-management')}
          >
            👥 User Management
          </li>
          <li 
            className={`hod-nav-item ${activeTab === 'department-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('department-management')}
          >
            🏢 Department & Leave Types
          </li>
          <li 
            className={`hod-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📈 Reports & Statistics
          </li>
        </ul>
      </aside>

      <main className="hod-main">
        <div className="hod-container">
          <div className="hod-topbar">
            <div className="hod-title">HOD Management Dashboard</div>
            <div className="hod-user-tools">
              <input className="hod-search" type="search" placeholder="Search" />
              {showRoleSwitch && (
                <div className="hod-role-switch">
                  <button 
                    className="hod-role-switch-btn"
                    onClick={() => setShowRoleSwitch(!showRoleSwitch)}
                  >
                    {getRoleDisplayName(currentRole)} ▼
                  </button>
                  {showRoleSwitch && (
                    <div className="hod-role-dropdown">
                      <button 
                        className={`hod-role-option ${currentRole === 'hod-management' ? 'active' : ''}`}
                        onClick={() => handleRoleSwitch('hod-management')}
                      >
                        🏢 HOD Management
                      </button>
                      <button 
                        className={`hod-role-option ${currentRole === 'academic' ? 'active' : ''}`}
                        onClick={() => handleRoleSwitch('academic')}
                      >
                        👨‍🏫 Academic Staff Account
                      </button>
                      <button 
                        className={`hod-role-option ${currentRole === 'personal-account' ? 'active' : ''}`}
                        onClick={() => handleRoleSwitch('personal-account')}
                      >
                        👤 Personal Account
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button className="hod-logout" onClick={onLogout}>Logout</button>
              <img className="hod-avatar" src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" />
            </div>
          </div>

          <div className="hod-content">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'leave-requests' && renderLeaveRequests()}
            {activeTab === 'user-management' && renderUserManagement()}
            {activeTab === 'department-management' && renderDepartmentManagement()}
            {activeTab === 'reports' && renderReports()}
          </div>
        </div>
      </main>
    </div>
  );
}
