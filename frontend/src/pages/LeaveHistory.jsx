import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeaveHistory.css';

const LeaveHistory = ({ user, onBack }) => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  // Fetch leave history data
  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user's leave requests
        const response = await fetch('/api/leave-requests/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const requests = await response.json();
          setLeaveRequests(requests);
          setFilteredRequests(requests);
          
          // Calculate summary statistics
          const stats = {
            total: requests.length,
            approved: requests.filter(req => req.status === 'approved').length,
            pending: requests.filter(req => req.status === 'pending').length,
            rejected: requests.filter(req => req.status === 'rejected').length
          };
          setSummaryStats(stats);
        } else {
          // Fallback to mock data if API fails
          const mockRequests = [
            {
              id: 1,
              type: 'Annual Leave',
              startDate: '2024-06-15',
              endDate: '2024-06-19',
              days: 5,
              reason: 'Family vacation',
              status: 'approved',
              appliedDate: '2024-05-20'
            },
            {
              id: 2,
              type: 'Sick Leave',
              startDate: '2024-05-10',
              endDate: '2024-05-11',
              days: 2,
              reason: 'Medical appointment and recovery',
              status: 'approved',
              appliedDate: '2024-05-08'
            },
            {
              id: 3,
              type: 'Personal Leave',
              startDate: '2024-09-02',
              endDate: '2024-09-02',
              days: 1,
              reason: 'Personal appointment',
              status: 'pending',
              appliedDate: '2024-08-15'
            },
            {
              id: 4,
              type: 'Emergency Leave',
              startDate: '2024-03-20',
              endDate: '2024-03-20',
              days: 1,
              reason: 'Family emergency',
              status: 'approved',
              appliedDate: '2024-03-19'
            },
            {
              id: 5,
              type: 'Annual Leave',
              startDate: '2024-02-14',
              endDate: '2024-02-16',
              days: 3,
              reason: 'Long weekend break',
              status: 'rejected',
              appliedDate: '2024-02-01'
            }
          ];
          
          setLeaveRequests(mockRequests);
          setFilteredRequests(mockRequests);
          
          const stats = {
            total: mockRequests.length,
            approved: mockRequests.filter(req => req.status === 'approved').length,
            pending: mockRequests.filter(req => req.status === 'pending').length,
            rejected: mockRequests.filter(req => req.status === 'rejected').length
          };
          setSummaryStats(stats);
        }
      } catch (error) {
        console.error('Error fetching leave history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveHistory();
  }, []);

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = leaveRequests;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(req => req.type.toLowerCase().includes(typeFilter.toLowerCase()));
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, typeFilter, leaveRequests]);

  const renderIcon = (iconName, size = 20) => {
    const iconProps = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    };

    switch (iconName) {
      case 'calendar':
        return (
          <svg {...iconProps}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'check':
        return (
          <svg {...iconProps}>
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'clock':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'x':
        return (
          <svg {...iconProps}>
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
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
      case 'eye':
        return (
          <svg {...iconProps}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: '#10b981', icon: 'check', text: 'Approved' },
      pending: { color: '#3b82f6', icon: 'clock', text: 'Pending' },
      rejected: { color: '#ef4444', icon: 'x', text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`status-badge status-${status}`}>
        <span className="status-icon">{renderIcon(config.icon, 14)}</span>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="leave-history-container">
        <div className="leave-history-header">
          <button 
            className="leave-history-back-btn"
            onClick={onBack || (() => navigate('/user'))}
          >
            ← Back to Dashboard
          </button>
          <h1>Leave History</h1>
          <p>View all your past and current leave applications</p>
        </div>
        <div className="leave-history-loading">
          <div className="loading-spinner"></div>
          <p>Loading your leave history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-history-container">
      <div className="leave-history-header">
        <button 
          className="leave-history-back-btn"
          onClick={onBack || (() => navigate('/user'))}
        >
          ← Back to Dashboard
        </button>
        <h1>Leave History</h1>
        <p>View all your past and current leave applications</p>
      </div>

      {/* Summary Cards */}
      <div className="history-summary">
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Total Applications</h3>
            <div className="summary-card-icon">
              {renderIcon('calendar', 20)}
            </div>
          </div>
          <div className="summary-card-value">{summaryStats.total}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Approved</h3>
            <div className="summary-card-icon approved">
              {renderIcon('check', 20)}
            </div>
          </div>
          <div className="summary-card-value approved">{summaryStats.approved}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Pending</h3>
            <div className="summary-card-icon pending">
              {renderIcon('clock', 20)}
            </div>
          </div>
          <div className="summary-card-value pending">{summaryStats.pending}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Rejected</h3>
            <div className="summary-card-icon rejected">
              {renderIcon('x', 20)}
            </div>
          </div>
          <div className="summary-card-value rejected">{summaryStats.rejected}</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <h3>Filter Applications</h3>
          <div className="filter-icon">
            {renderIcon('filter', 16)}
          </div>
        </div>
        
        <div className="filter-controls">
          <div className="search-container">
            <div className="search-icon">
              {renderIcon('search', 16)}
            </div>
            <input
              type="text"
              placeholder="Search by reason or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="emergency">Emergency Leave</option>
          </select>
        </div>
      </div>

      {/* Application History Table */}
      <div className="history-table-section">
        <h3>Application History</h3>
        
        {filteredRequests.length === 0 ? (
          <div className="no-results">
            <p>No leave applications found matching your criteria.</p>
          </div>
        ) : (
          <div className="history-table">
            <div className="table-header">
              <div className="table-cell">Type</div>
              <div className="table-cell">Dates</div>
              <div className="table-cell">Days</div>
              <div className="table-cell">Reason</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Applied</div>
              <div className="table-cell">Actions</div>
            </div>
            
            {filteredRequests.map((request) => (
              <div key={request.id} className="table-row">
                <div className="table-cell">
                  <span className="leave-type">{request.type}</span>
                </div>
                <div className="table-cell">
                  <span className="leave-dates">
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </span>
                </div>
                <div className="table-cell">
                  <span className="leave-days">{request.days} days</span>
                </div>
                <div className="table-cell">
                  <span className="leave-reason">{request.reason}</span>
                </div>
                <div className="table-cell">
                  {getStatusBadge(request.status)}
                </div>
                <div className="table-cell">
                  <span className="applied-date">{formatDate(request.appliedDate)}</span>
                </div>
                <div className="table-cell">
                  <button className="view-btn">
                    {renderIcon('eye', 16)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveHistory;
