import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeaveBalanceSummary.css';

const LeaveBalanceSummary = ({ user, onBack }) => {
  const navigate = useNavigate();
  const [balanceData, setBalanceData] = useState({
    appointmentDate: '',
    leaveTypes: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leave balance summary data
  useEffect(() => {
    const fetchBalanceSummary = async () => {
      try {
        setIsLoading(true);
        
        // Fetch actual leave balance data from database
        const response = await fetch('http://localhost:5000/api/user/leave-balance', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBalanceData(data);
        } else {
          // Fallback to user prop data if API fails
          const fallbackData = {
            appointmentDate: user?.appointmentDate ? formatDate(user.appointmentDate) : 'Not available',
            leaveTypes: [
              {
                name: 'Casual Leave',
                percentage: 100,
                description: 'Personal and emergency leave',
                total: 9,
                used: 0,
                remaining: 9,
                color: '#10b981'
              },
              {
                name: 'Vacation Leave',
                percentage: 0,
                description: 'Annual vacation time',
                total: 0,
                used: 0,
                remaining: 0,
                color: '#3b82f6'
              },
              {
                name: 'Other Leaves',
                percentage: 100,
                description: 'Duty, lieu, block leave',
                total: 'Unlimited',
                used: 0,
                remaining: 'Unlimited',
                color: '#8b5cf6'
              },
              {
                name: 'Maternity Leave',
                percentage: 0,
                description: 'Maternity and family leave',
                total: 365,
                used: 0,
                remaining: 365,
                color: '#f59e0b'
              }
            ]
          };
          setBalanceData(fallbackData);
        }
        
      } catch (error) {
        console.error('Error fetching balance summary:', error);
        // Fallback to basic data structure
        const fallbackData = {
          appointmentDate: user?.appointmentDate ? formatDate(user.appointmentDate) : 'Not available',
          leaveTypes: []
        };
        setBalanceData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalanceSummary();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

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
      case 'home':
        return (
          <svg {...iconProps}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="balance-summary-container">
        <div className="balance-summary-header">
          <button 
            className="balance-summary-back-btn"
            onClick={onBack || (() => navigate('/user'))}
          >
            ← Back to Dashboard
          </button>
          <h1>Leave Balance Summary</h1>
        </div>
        <div className="balance-summary-loading">
          <div className="loading-spinner"></div>
          <p>Loading your leave balance summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="balance-summary-container">
      <div className="balance-summary-header">
        <button 
          className="balance-summary-back-btn"
          onClick={onBack || (() => navigate('/user'))}
        >
          ← Back to Dashboard
        </button>
        <h1>Leave Balance Summary</h1>
      </div>

      <div className="balance-summary-content">
        {balanceData.leaveTypes.map((leaveType, index) => (
          <div key={index} className="leave-type-card">
            <div className="leave-type-header">
              <div className="leave-type-title">
                <h3>{leaveType.name}</h3>
                <div className="leave-type-percentage" style={{ color: leaveType.color }}>
                  {leaveType.percentage}%
                </div>
              </div>
              <div className="leave-type-description">
                {leaveType.description}
              </div>
            </div>
            
            <div className="leave-type-details">
              <div className="detail-row">
                <span className="detail-label">Total:</span>
                <span className="detail-value">{leaveType.total} days</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Used:</span>
                <span className="detail-value">{leaveType.used} days</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Remaining:</span>
                <span className="detail-value">{leaveType.remaining} days</span>
              </div>
            </div>
            
            {typeof leaveType.total === 'number' && leaveType.total > 0 && (
              <div className="leave-type-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${leaveType.percentage}%`,
                      backgroundColor: leaveType.color
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  {leaveType.used} of {leaveType.total} days used
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="balance-summary-footer">
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-icon">
              {renderIcon('calendar', 24)}
            </div>
            <div className="stat-content">
              <div className="stat-value">{balanceData.leaveTypes.reduce((sum, type) => sum + (typeof type.remaining === 'number' ? type.remaining : 0), 0)}</div>
              <div className="stat-label">Total Days Available</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              {renderIcon('check', 24)}
            </div>
            <div className="stat-content">
              <div className="stat-value">{balanceData.leaveTypes.reduce((sum, type) => sum + type.used, 0)}</div>
              <div className="stat-label">Days Used</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              {renderIcon('clock', 24)}
            </div>
            <div className="stat-content">
              <div className="stat-value">{balanceData.leaveTypes.filter(type => type.percentage > 0).length}</div>
              <div className="stat-label">Active Leave Types</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceSummary;
