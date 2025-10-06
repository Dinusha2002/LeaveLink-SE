import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = ({ user, onBack }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    personalInfo: {},
    employmentInfo: {},
    contactInfo: {},
    preferences: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState('');

  // Initialize profile data
  useEffect(() => {
    const initializeProfile = async () => {
      setIsLoading(true);
      
      try {
        // Fetch actual user data from database
        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          
          // Use actual data from database
          const profileData = {
            personalInfo: {
              fullName: userData.fullName || userData.name || '',
              email: userData.email || '',
              employeeId: userData.employeeId || userData.serviceNumber || '',
              dateOfBirth: userData.dateOfBirth || '',
              gender: userData.gender || '',
              maritalStatus: userData.maritalStatus || '',
              nationality: userData.nationality || '',
              nic: userData.nic || '',
              address: userData.address || '',
              phone: userData.phone || ''
            },
            employmentInfo: {
              position: userData.position || userData.role || '',
              department: userData.department?.name || userData.department || '',
              appointmentDate: userData.appointmentDate || '',
              employmentType: userData.employmentType || 'Permanent',
              reportingManager: userData.reportingManager || '',
              workLocation: userData.workLocation || '',
              office: userData.office || '',
              extension: userData.extension || ''
            },
            contactInfo: {
              emergencyContact: userData.emergencyContact || '',
              emergencyPhone: userData.emergencyPhone || '',
              emergencyRelation: userData.emergencyRelation || '',
              personalEmail: userData.personalEmail || '',
              linkedin: userData.linkedin || '',
              website: userData.website || ''
            },
            preferences: {
              language: userData.language || 'English',
              timezone: userData.timezone || 'Asia/Colombo',
              dateFormat: userData.dateFormat || 'DD/MM/YYYY',
              notifications: {
                email: userData.notifications?.email || true,
                sms: userData.notifications?.sms || false,
                push: userData.notifications?.push || true,
                leaveReminders: userData.notifications?.leaveReminders || true,
                approvalNotifications: userData.notifications?.approvalNotifications || true
              }
            }
          };
          
          setProfileData(profileData);
          setEditForm(profileData);
        } else {
          // Fallback to user prop data if API fails
          const fallbackData = {
            personalInfo: {
              fullName: user?.fullName || user?.name || '',
              email: user?.email || '',
              employeeId: user?.employeeId || user?.serviceNumber || '',
              dateOfBirth: '',
              gender: '',
              maritalStatus: '',
              nationality: '',
              nic: '',
              address: '',
              phone: ''
            },
            employmentInfo: {
              position: user?.position || user?.role || '',
              department: user?.department?.name || user?.department || '',
              appointmentDate: user?.appointmentDate || '',
              employmentType: 'Permanent',
              reportingManager: '',
              workLocation: '',
              office: '',
              extension: ''
            },
            contactInfo: {
              emergencyContact: '',
              emergencyPhone: '',
              emergencyRelation: '',
              personalEmail: '',
              linkedin: '',
              website: ''
            },
            preferences: {
              language: 'English',
              timezone: 'Asia/Colombo',
              dateFormat: 'DD/MM/YYYY',
              notifications: {
                email: true,
                sms: false,
                push: true,
                leaveReminders: true,
                approvalNotifications: true
              }
            }
          };
          
          setProfileData(fallbackData);
          setEditForm(fallbackData);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setMessage('Error loading profile data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [user]);

  const handleInputChange = (section, field, value) => {
    setEditForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setMessage('Saving profile...');
      
      // Save to database
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        setProfileData(editForm);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Error updating profile. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error updating profile. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm(profileData);
    setIsEditing(false);
    setMessage('');
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
      case 'user':
        return (
          <svg {...iconProps}>
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'briefcase':
        return (
          <svg {...iconProps}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'phone':
        return (
          <svg {...iconProps}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'settings':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'edit':
        return (
          <svg {...iconProps}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'save':
        return (
          <svg {...iconProps}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2"/>
            <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2"/>
            <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'x':
        return (
          <svg {...iconProps}>
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-header">
          <button 
            className="user-profile-back-btn"
            onClick={onBack || (() => navigate('/user'))}
          >
            ← Back to Dashboard
          </button>
          <h1>My Profile</h1>
          <p>Manage your personal and professional information</p>
        </div>
        <div className="user-profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <button 
          className="user-profile-back-btn"
          onClick={onBack || (() => navigate('/user'))}
        >
          ← Back to Dashboard
        </button>
        <h1>My Profile</h1>
        <p>Manage your personal and professional information</p>
        
        {message && (
          <div className={`user-profile-message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="user-profile-content">

        {/* Employment Information */}
        <div className="profile-section">
          <div className="profile-section-header">
            <div className="profile-section-title">
              <div className="profile-section-icon">
                {renderIcon('briefcase', 24)}
              </div>
              <h2>Employment Information</h2>
            </div>
          </div>
          
          <div className="profile-section-content">
            <div className="profile-grid">
              <div className="profile-field">
                <label>Position</label>
                <span className="profile-value">{profileData.employmentInfo?.position}</span>
              </div>
              
              <div className="profile-field">
                <label>Department</label>
                <span className="profile-value">{profileData.employmentInfo?.department}</span>
              </div>
              
              <div className="profile-field">
                <label>Appointment Date</label>
                <span className="profile-value">{profileData.employmentInfo?.appointmentDate}</span>
              </div>
              
              <div className="profile-field">
                <label>Employment Type</label>
                <span className="profile-value">{profileData.employmentInfo?.employmentType}</span>
              </div>
              
              <div className="profile-field">
                <label>Reporting Manager</label>
                <span className="profile-value">{profileData.employmentInfo?.reportingManager}</span>
              </div>
              
              <div className="profile-field">
                <label>Office</label>
                <span className="profile-value">{profileData.employmentInfo?.office}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="profile-section">
          <div className="profile-section-header">
            <div className="profile-section-title">
              <div className="profile-section-icon">
                {renderIcon('phone', 24)}
              </div>
              <h2>Contact Information</h2>
            </div>
          </div>
          
          <div className="profile-section-content">
            <div className="profile-grid">
              <div className="profile-field">
                <label>Emergency Contact</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.contactInfo?.emergencyContact || ''}
                    onChange={(e) => handleInputChange('contactInfo', 'emergencyContact', e.target.value)}
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">{profileData.contactInfo?.emergencyContact}</span>
                )}
              </div>
              
              <div className="profile-field">
                <label>Emergency Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.contactInfo?.emergencyPhone || ''}
                    onChange={(e) => handleInputChange('contactInfo', 'emergencyPhone', e.target.value)}
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">{profileData.contactInfo?.emergencyPhone}</span>
                )}
              </div>
              
              <div className="profile-field">
                <label>Emergency Relation</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.contactInfo?.emergencyRelation || ''}
                    onChange={(e) => handleInputChange('contactInfo', 'emergencyRelation', e.target.value)}
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">{profileData.contactInfo?.emergencyRelation}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="profile-section">
          <div className="profile-section-header">
            <div className="profile-section-title">
              <div className="profile-section-icon">
                {renderIcon('settings', 24)}
              </div>
              <h2>Preferences</h2>
            </div>
          </div>
          
          <div className="profile-section-content">
            <div className="profile-grid">
              <div className="profile-field">
                <label>Language</label>
                {isEditing ? (
                  <select
                    value={editForm.preferences?.language || ''}
                    onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                    className="profile-input"
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                ) : (
                  <span className="profile-value">{profileData.preferences?.language}</span>
                )}
              </div>
              
              <div className="profile-field">
                <label>Timezone</label>
                <span className="profile-value">{profileData.preferences?.timezone}</span>
              </div>
              
              <div className="profile-field">
                <label>Date Format</label>
                {isEditing ? (
                  <select
                    value={editForm.preferences?.dateFormat || ''}
                    onChange={(e) => handleInputChange('preferences', 'dateFormat', e.target.value)}
                    className="profile-input"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                ) : (
                  <span className="profile-value">{profileData.preferences?.dateFormat}</span>
                )}
              </div>
            </div>
            
            <div className="profile-notifications">
              <h3>Notification Preferences</h3>
              <div className="notification-grid">
                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={profileData.preferences?.notifications?.email || false}
                      onChange={(e) => handleInputChange('preferences', 'notifications', {
                        ...editForm.preferences?.notifications,
                        email: e.target.checked
                      })}
                      disabled={!isEditing}
                    />
                    Email Notifications
                  </label>
                </div>
                
                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={profileData.preferences?.notifications?.sms || false}
                      onChange={(e) => handleInputChange('preferences', 'notifications', {
                        ...editForm.preferences?.notifications,
                        sms: e.target.checked
                      })}
                      disabled={!isEditing}
                    />
                    SMS Notifications
                  </label>
                </div>
                
                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={profileData.preferences?.notifications?.push || false}
                      onChange={(e) => handleInputChange('preferences', 'notifications', {
                        ...editForm.preferences?.notifications,
                        push: e.target.checked
                      })}
                      disabled={!isEditing}
                    />
                    Push Notifications
                  </label>
                </div>
                
                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={profileData.preferences?.notifications?.leaveReminders || false}
                      onChange={(e) => handleInputChange('preferences', 'notifications', {
                        ...editForm.preferences?.notifications,
                        leaveReminders: e.target.checked
                      })}
                      disabled={!isEditing}
                    />
                    Leave Reminders
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="profile-actions">
            <button 
              className="profile-save-btn"
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {renderIcon('save', 16)}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button 
              className="profile-cancel-btn"
              onClick={handleCancelEdit}
            >
              {renderIcon('x', 16)}
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
