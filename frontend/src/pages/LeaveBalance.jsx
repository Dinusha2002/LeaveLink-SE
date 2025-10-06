import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeaveBalance.css';

const LeaveBalance = ({ user, onBack }) => {
  const navigate = useNavigate();
  const [balanceData, setBalanceData] = useState({
    totalAvailable: 0,
    usedThisYear: 0,
    pendingApproval: 0
  });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [monthlyUsage, setMonthlyUsage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leave balance data
  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user's leave requests
        const response = await fetch('/api/leave-requests/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const leaveRequests = await response.json();
          
          // Calculate balance data
          const currentYear = new Date().getFullYear();
          const totalAvailable = 29; // This would come from user's leave allocation
          const usedThisYear = leaveRequests.filter(req => 
            req.status === 'approved' && 
            new Date(req.startDate).getFullYear() === currentYear
          ).reduce((total, req) => total + (req.days || 0), 0);
          
          const pendingApproval = leaveRequests.filter(req => 
            req.status === 'pending'
          ).reduce((total, req) => total + (req.days || 0), 0);
          
          setBalanceData({
            totalAvailable,
            usedThisYear,
            pendingApproval
          });
          
          // Mock leave types data - in real app, this would come from API
          setLeaveTypes([
            {
              name: 'Annual Leave',
              description: 'Yearly vacation leave allocation',
              used: 3,
              remaining: 16,
              total: 21,
              pending: 2,
              percentage: 76
            },
            {
              name: 'Sick Leave',
              description: 'Medical leave for illness',
              used: 2,
              remaining: 8,
              total: 10,
              pending: 0,
              percentage: 80
            },
            {
              name: 'Personal Leave',
              description: 'Personal matters and appointments',
              used: 2,
              remaining: 3,
              total: 5,
              pending: 0,
              percentage: 60
            },
            {
              name: 'Emergency Leave',
              description: 'Unexpected urgent situations',
              used: 1,
              remaining: 2,
              total: 3,
              pending: 0,
              percentage: 67
            }
          ]);
          
          // Mock monthly usage data
          setMonthlyUsage([
            { month: 'January', leaveType: 'Annual Leave', daysUsed: 0 },
            { month: 'February', leaveType: 'Sick Leave', daysUsed: 2 },
            { month: 'March', leaveType: 'Personal Leave', daysUsed: 1 },
            { month: 'April', leaveType: 'Emergency Leave', daysUsed: 1 },
            { month: 'May', leaveType: 'Annual Leave', daysUsed: 2 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching balance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalanceData();
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
      case 'calendar':
        return (
          <svg {...iconProps}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'clock':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'refresh':
        return (
          <svg {...iconProps}>
            <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="1 20 1 14 7 14" stroke="currentColor" strokeWidth="2"/>
            <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'trending-up':
        return (
          <svg {...iconProps}>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="2"/>
            <polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="leave-balance-container">
        <div className="leave-balance-header">
          <button 
            className="leave-balance-back-btn"
            onClick={onBack || (() => navigate('/user'))}
          >
            ← Back to Dashboard
          </button>
          <h1>Leave Balance</h1>
          <p>Your current leave allocation and usage summary</p>
        </div>
        <div className="leave-balance-loading">
          <div className="loading-spinner"></div>
          <p>Loading your leave balance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-balance-container">
      <div className="leave-balance-header">
        <button 
          className="leave-balance-back-btn"
          onClick={onBack || (() => navigate('/user'))}
        >
          ← Back to Dashboard
        </button>
        <h1>Leave Balance</h1>
        <p>Your current leave allocation and usage summary</p>
      </div>

      {/* Summary Cards */}
      <div className="balance-summary">
        <div className="balance-card">
          <div className="balance-card-header">
            <h3>Total Available</h3>
            <div className="balance-card-icon">
              {renderIcon('calendar', 20)}
            </div>
          </div>
          <div className="balance-card-value">{balanceData.totalAvailable}</div>
          <div className="balance-card-label">Days remaining</div>
        </div>

        <div className="balance-card">
          <div className="balance-card-header">
            <h3>Used This Year</h3>
            <div className="balance-card-icon">
              {renderIcon('clock', 20)}
            </div>
          </div>
          <div className="balance-card-value">{balanceData.usedThisYear}</div>
          <div className="balance-card-label">Days taken</div>
        </div>

        <div className="balance-card">
          <div className="balance-card-header">
            <h3>Pending Approval</h3>
            <div className="balance-card-icon">
              {renderIcon('refresh', 20)}
            </div>
          </div>
          <div className="balance-card-value">{balanceData.pendingApproval}</div>
          <div className="balance-card-label">Days awaiting</div>
        </div>
      </div>

      {/* Leave Type Breakdown */}
      <div className="leave-breakdown">
        <h2>Leave Type Breakdown</h2>
        <div className="leave-types-list">
          {leaveTypes.map((leaveType, index) => (
            <div key={index} className="leave-type-item">
              <div className="leave-type-header">
                <div className="leave-type-info">
                  <h3>{leaveType.name}</h3>
                  <p>{leaveType.description}</p>
                </div>
                <div className="leave-type-stats">
                  <div className="leave-type-usage">
                    <span className="usage-label">Used: {leaveType.used}</span>
                    <span className="usage-percentage">{leaveType.percentage}% remaining</span>
                    {leaveType.pending > 0 && (
                      <span className="usage-pending">{leaveType.pending} pending</span>
                    )}
                  </div>
                  <div className="leave-type-total">
                    <div className="total-available">
                      <span className="total-number">{leaveType.remaining}</span>
                      <span className="total-label">of {leaveType.total} available</span>
                    </div>
                    <div className="available-label">Available: {leaveType.remaining}</div>
                  </div>
                </div>
              </div>
              <div className="leave-type-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${100 - leaveType.percentage}%` }}
                  ></div>
                </div>
                {leaveType.pending > 0 && (
                  <div className="pending-info">
                    Pending: {leaveType.pending}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Usage Trend */}
      <div className="monthly-trend">
        <div className="trend-header">
          <h2>Monthly Usage Trend</h2>
          <div className="trend-icon">
            {renderIcon('trending-up', 16)}
          </div>
        </div>
        <div className="trend-list">
          {monthlyUsage.map((month, index) => (
            <div key={index} className="trend-item">
              <div className="trend-bullet"></div>
              <div className="trend-month">{month.month}</div>
              <div className="trend-details">
                <span className="trend-leave-type">{month.leaveType}</span>
                <span className="trend-days">{month.daysUsed} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
