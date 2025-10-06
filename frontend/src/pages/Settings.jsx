import React, { useState, useEffect } from 'react';
import './Settings.css';

export default function Settings({ user, onBack }) {
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
      // Simulate API call
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
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="settings-back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <h1 className="settings-title">Settings</h1>
        <div className="settings-subtitle">Manage your account preferences and settings</div>
      </div>

      <div className="settings-content">
        {/* Settings Messages */}
        {settingsMessage && (
          <div className="settings-message settings-message-success">
            {settingsMessage}
          </div>
        )}
        
        {settingsError && (
          <div className="settings-message settings-message-error">
            {settingsError}
          </div>
        )}

        <div className="settings-grid">
          {/* Personal Information Card */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">👤</div>
              <h3>Personal Information</h3>
            </div>
            <div className="settings-card-content">
              <div className="settings-form">
                <div className="settings-form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={user?.fullName || ''} 
                    className="settings-input"
                    readOnly
                  />
                </div>
                <div className="settings-form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    className="settings-input"
                    readOnly
                  />
                </div>
                <div className="settings-form-group">
                  <label>Contact Number</label>
                  <input 
                    type="tel" 
                    value={settings.personalInfo.contactNumber} 
                    onChange={(e) => handlePersonalInfoChange('contactNumber', e.target.value)}
                    className="settings-input"
                    placeholder="Enter contact number"
                  />
                </div>
                <button 
                  className="settings-btn"
                  onClick={handleUpdatePersonalInfo}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? 'Updating...' : 'Update Information'}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">🔔</div>
              <h3>Notifications</h3>
            </div>
            <div className="settings-card-content">
              <div className="settings-options">
                <div className="settings-option">
                  <div className="settings-option-info">
                    <label>Email Notifications</label>
                    <span>Receive notifications via email</span>
                  </div>
                  <label className="settings-toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-option">
                  <div className="settings-option-info">
                    <label>Leave Reminders</label>
                    <span>Get reminded about pending leave requests</span>
                  </div>
                  <label className="settings-toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications.leaveReminders}
                      onChange={(e) => handleNotificationChange('leaveReminders', e.target.checked)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-option">
                  <div className="settings-option-info">
                    <label>Approval Updates</label>
                    <span>Notify when leave requests are approved/rejected</span>
                  </div>
                  <label className="settings-toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications.approvalUpdates}
                      onChange={(e) => handleNotificationChange('approvalUpdates', e.target.checked)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-option">
                  <div className="settings-option-info">
                    <label>System Updates</label>
                    <span>Receive system maintenance notifications</span>
                  </div>
                  <label className="settings-toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications.systemUpdates}
                      onChange={(e) => handleNotificationChange('systemUpdates', e.target.checked)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">🎨</div>
              <h3>Preferences</h3>
            </div>
            <div className="settings-card-content">
              <div className="settings-options">
                <div className="settings-option">
                  <div className="settings-option-info">
                    <label>Dark Mode</label>
                    <span>Switch to dark theme</span>
                  </div>
                  <label className="settings-toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.preferences.darkMode}
                      onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-option">
                  <div className="settings-option-info">
                    <label>Language</label>
                    <span>Select your preferred language</span>
                  </div>
                  <select 
                    className="settings-select"
                    value={settings.preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="si">සිංහල</option>
                    <option value="ta">தமிழ்</option>
                  </select>
                </div>
                <div className="settings-option">
                  <div className="settings-option-info">
                    <label>Date Format</label>
                    <span>Choose your preferred date format</span>
                  </div>
                  <select 
                    className="settings-select"
                    value={settings.preferences.dateFormat}
                    onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="settings-option">
                  <div className="settings-option-info">
                    <label>Time Zone</label>
                    <span>Set your local time zone</span>
                  </div>
                  <select 
                    className="settings-select"
                    value={settings.preferences.timeZone}
                    onChange={(e) => handlePreferenceChange('timeZone', e.target.value)}
                  >
                    <option value="Asia/Colombo">Asia/Colombo (UTC+5:30)</option>
                    <option value="UTC">UTC (UTC+0)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">🔒</div>
              <h3>Security</h3>
            </div>
            <div className="settings-card-content">
              <div className="settings-form">
                <div className="settings-form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="settings-input"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="settings-form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="settings-input"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="settings-input"
                    placeholder="Confirm new password"
                  />
                </div>
                <button 
                  className="settings-btn settings-btn-danger"
                  onClick={handleChangePassword}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
              <div className="settings-security-info">
                <div className="settings-security-item">
                  <span className="settings-security-label">Last Login:</span>
                  <span className="settings-security-value">Today at 2:30 PM</span>
                </div>
                <div className="settings-security-item">
                  <span className="settings-security-label">Account Created:</span>
                  <span className="settings-security-value">January 15, 2024</span>
                </div>
                <div className="settings-security-item">
                  <span className="settings-security-label">Two-Factor Auth:</span>
                  <span className="settings-security-value settings-security-disabled">Not Enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Data Card */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">📊</div>
              <h3>Privacy & Data</h3>
            </div>
            <div className="settings-card-content">
              <div className="settings-options">
                <div className="settings-option">
                  <div className="settings-option-info">
                    <label>Data Analytics</label>
                    <span>Allow usage data collection for improvements</span>
                  </div>
                  <label className="settings-toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.privacy.dataAnalytics}
                      onChange={(e) => handlePrivacyChange('dataAnalytics', e.target.checked)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-option">
                  <div className="settings-option-info">
                    <label>Profile Visibility</label>
                    <span>Make profile visible to other users</span>
                  </div>
                  <label className="settings-toggle">
                    <input 
                      type="checkbox" 
                      checked={settings.privacy.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.checked)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="settings-data-actions">
                <button className="settings-btn settings-btn-secondary">
                  Export My Data
                </button>
                <button className="settings-btn settings-btn-danger">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
