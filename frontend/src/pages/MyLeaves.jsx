import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyLeaves.css';

const MyLeaves = ({ user, onBack }) => {
  const navigate = useNavigate();
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch leave applications
  useEffect(() => {
    const fetchLeaveApplications = async () => {
      try {
        setIsLoading(true);
        
        // Mock data - in real app, this would come from API
        // const mockApplications = [
        //   {
        //     id: 1,
        //     leaveType: 'Annual Leave',
        //     startDate: '2024-06-15',
        //     endDate: '2024-06-19',
        //     days: 5,
        //     reason: 'Family vacation',
        //     status: 'approved',
        //     appliedDate: '2024-05-20'
        //   },
        //   {
        //     id: 2,
        //     leaveType: 'Sick Leave',
        //     startDate: '2024-05-10',
        //     endDate: '2024-05-11',
        //     days: 2,
        //     reason: 'Medical appointment',
        //     status: 'approved',
        //     appliedDate: '2024-05-08'
        //   },
        //   {
        //     id: 3,
        //     leaveType: 'Personal Leave',
        //     startDate: '2024-09-02',
        //     endDate: '2024-09-02',
        //     days: 1,
        //     reason: 'Personal appointment',
        //     status: 'pending',
        //     appliedDate: '2024-08-15'
        //   },
        //   {
        //     id: 4,
        //     leaveType: 'Emergency Leave',
        //     startDate: '2024-03-20',
        //     endDate: '2024-03-20',
        //     days: 1,
        //     reason: 'Family emergency',
        //     status: 'approved',
        //     appliedDate: '2024-03-19'
        //   }
        // ];
        
        setLeaveApplications([]);
        
        // In a real application, you would fetch this data from an API
        // const response = await fetch('/api/leave-applications', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // });
        // const data = await response.json();
        // setLeaveApplications(data);
        
      } catch (error) {
        console.error('Error fetching leave applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveApplications();
  }, []);

  const renderIcon = (iconName, size = 20) => {
    const iconProps = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    };

    switch (iconName) {
      case 'file-text':
        return (
          <svg {...iconProps}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
            <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'search':
        return (
          <svg {...iconProps}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'filter':
        return (
          <svg {...iconProps}>
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return null;
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const filteredApplications = leaveApplications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = searchTerm === '' || 
      app.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="my-leaves-container">
        <div className="my-leaves-header">
          <button 
            className="my-leaves-back-btn"
            onClick={onBack || (() => navigate('/user'))}
          >
            ← Back to Dashboard
          </button>
          <h1>My Leave Applications</h1>
          <p>View and manage your leave applications</p>
        </div>
        <div className="my-leaves-loading">
          <div className="loading-spinner"></div>
          <p>Loading your leave applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-leaves-container">
      <div className="my-leaves-header">
        <button 
          className="my-leaves-back-btn"
          onClick={onBack || (() => navigate('/user'))}
        >
          ← Back to Dashboard
        </button>
        <h1>My Leave Applications</h1>
        <p>View and manage your leave applications</p>
      </div>

      {/* Filter and Search */}
      <div className="my-leaves-filters">
        <div className="search-container">
          <div className="search-icon">
            {renderIcon('search', 16)}
          </div>
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications List */}
      <div className="my-leaves-content">
        {filteredApplications.length > 0 && (
          <div className="my-leaves-list">
            {filteredApplications.map((application) => (
              <div key={application.id} className="my-leaves-item">
                <div className="leave-item-header">
                  <div className="leave-type">
                    <div className="leave-type-icon">
                      {renderIcon('file-text', 20)}
                    </div>
                    <span>{application.leaveType}</span>
                  </div>
                  <div 
                    className="leave-status"
                    style={{ color: getStatusColor(application.status) }}
                  >
                    {application.status}
                  </div>
                </div>
                
                <div className="leave-item-details">
                  <div className="leave-dates">
                    <span className="date-label">From:</span>
                    <span className="date-value">{formatDate(application.startDate)}</span>
                    <span className="date-label">To:</span>
                    <span className="date-value">{formatDate(application.endDate)}</span>
                  </div>
                  
                  <div className="leave-info">
                    <div className="leave-days">
                      <span className="days-label">Days:</span>
                      <span className="days-value">{application.days}</span>
                    </div>
                    <div className="leave-applied">
                      <span className="applied-label">Applied:</span>
                      <span className="applied-value">{formatDate(application.appliedDate)}</span>
                    </div>
                  </div>
                  
                  <div className="leave-reason">
                    <span className="reason-label">Reason:</span>
                    <span className="reason-value">{application.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeaves;
