import React, { useState, useRef, useEffect } from "react";
import api from "../api";              // keep if you have backend
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register({ onRegistered }) {
  const [form, setForm] = useState({
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
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPassword, setShowPassword] = useState(false);
  const calendarRef = useRef(null);
  const navigate = useNavigate();

  // NIC Validation Functions (Loosened)
  const validateNIC = (nic) => {
    if (!nic) return "NIC number is required";
    
    // Remove spaces and convert to uppercase
    const cleanNIC = nic.replace(/\s/g, '').toUpperCase();
    
    // Basic length check - allow 9-12 digits
    if (cleanNIC.length < 9 || cleanNIC.length > 12) {
      return "NIC number must be 9-12 digits";
    }
    
    // Check if it contains only digits (basic validation)
    if (!/^\d+$/.test(cleanNIC)) {
      return "NIC number must contain only digits";
    }
    
    return null; // Valid - no strict validation
  };

  const validateField = (name, value) => {
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
        if (form.role === "Academic Staff" && !value) {
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

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  // Calendar functionality
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setForm(prev => ({ ...prev, appointment: formattedDate }));
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
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = form.appointment === date.toISOString().split('T')[0];
      
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

  const validateAllFields = () => {
    const errors = {};
    const fieldsToValidate = ['initials', 'epf', 'nic', 'appointment', 'gender', 'role', 'position', 'email', 'username', 'password'];
    
    // Add department to validation if academic staff
    if (form.role === "Academic Staff") {
      fieldsToValidate.push('department');
    }
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, form[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async e => {
    e.preventDefault();
    setErrorMsg("");
    
    // Validate all fields
    if (!validateAllFields()) {
      setErrorMsg("Please correct the errors below.");
      return;
    }
    
    setLoading(true);
    try {
      // Prepare data for backend API
      const userData = {
        fullName: form.initials,
        email: form.email,
        username: form.username,
        password: form.password,
        role: form.role === "Academic Staff" ? "academic" : "non-academic",
        roleType: form.role === "Academic Staff" ? "academic" : "non-academic",
        position: form.position,
        epf: form.epf,
        nic: form.nic,
        appointmentDate: form.appointment,
        gender: form.gender,
        department: form.role === "Academic Staff" ? form.department : undefined,
        serviceNumber: form.epf, // Using EPF as service number
        contactNumber: form.contactNumber || "",
        homeAddress: "",
        sex: form.gender,
      };

      // Send data to backend API
      const response = await api.post("/auth/register", userData);
      
      console.log("Account created successfully:", response.data);

      onRegistered && onRegistered();
      navigate('/admin', { state: { flash: 'Account created successfully!' } });
    } catch (err) {
      console.error("Account creation error:", err);
      setErrorMsg(err.response?.data?.message || "Account creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-shell">
      <aside className="register-sidebar">
        <div className="register-logo">
          <img src="/OIP-removebg-preview.png" alt="Logo" />
          <div className="register-brand">LeaveLink</div>
        </div>
        <ul className="register-nav">
          <li className="register-nav-item" onClick={() => navigate('/admin')}>📋 Dashboard</li>
          <li className="register-nav-item active">🗓️ Create New Account</li>
          <li className="register-nav-item">👤 View Accounts</li>
          <li className="register-nav-item">📝 Update Account</li>
          <li className="register-nav-item">🚫 Deactivate Account</li>
        </ul>
      </aside>
      <main className="register-main">
        <div className="register-container">
          <h1 className="register-title">Create New Account</h1>
          <form className="register-form" onSubmit={submit}>
            <div className="rf-row">
              <div className="rf-label">Name with Initials:</div>
              <div className="rf-field">
                <input 
                  className={`rf-input ${fieldErrors.initials ? 'error' : ''}`} 
                  name="initials" 
                  value={form.initials} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Your Name with Initials"
                />
                {fieldErrors.initials && <div className="field-error">{fieldErrors.initials}</div>}
              </div>
            </div>
            <div className="rf-row">
              <div className="rf-label">EPF number:</div>
              <div className="rf-field">
                <input 
                  className={`rf-input ${fieldErrors.epf ? 'error' : ''}`} 
                  name="epf" 
                  value={form.epf} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Your EPF Number"
                />
                {fieldErrors.epf && <div className="field-error">{fieldErrors.epf}</div>}
              </div>
            </div>
            <div className="rf-row">
              <div className="rf-label">NIC Number:</div>
              <div className="rf-field">
                <input 
                  className={`rf-input ${fieldErrors.nic ? 'error' : ''}`} 
                  name="nic" 
                  value={form.nic} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Your NIC Number"
                />
                {fieldErrors.nic && <div className="field-error">{fieldErrors.nic}</div>}
              </div>
            </div>
            <div className="rf-row">
              <div className="rf-label">Appointment Date:</div>
              <div className="rf-field date-field" ref={calendarRef}>
                <input 
                  className={`rf-input date-input ${fieldErrors.appointment ? 'error' : ''}`} 
                  type="date" 
                  name="appointment" 
                  value={form.appointment} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <div className="calendar-icon" onClick={toggleCalendar}>📅</div>
                {showCalendar && <Calendar />}
                {fieldErrors.appointment && <div className="field-error">{fieldErrors.appointment}</div>}
              </div>
            </div>
            <div className="rf-row">
              <div className="rf-label">Gender:</div>
              <div className="rf-field">
                <div className={`gender-selection-modern ${fieldErrors.gender ? 'error' : ''}`}>
                  <div className="gender-option-card">
                    <input
                      type="radio"
                      id="gender-male"
                      name="gender"
                      value="male"
                      checked={form.gender === "male"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="gender-radio-hidden"
                    />
                    <label htmlFor="gender-male" className={`gender-card ${form.gender === "male" ? "selected" : ""}`}>
                      <div className="gender-card-icon">
                        <div className="gender-avatar male-avatar">♂</div>
                      </div>
                      <div className="gender-card-content">
                        <span className="gender-card-title">Male</span>
                        <span className="gender-card-subtitle">Select this option</span>
                      </div>
                      <div className="gender-card-indicator">
                        <div className="gender-radio-custom"></div>
                      </div>
                    </label>
                  </div>
                  <div className="gender-option-card">
                    <input
                      type="radio"
                      id="gender-female"
                      name="gender"
                      value="female"
                      checked={form.gender === "female"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="gender-radio-hidden"
                    />
                    <label htmlFor="gender-female" className={`gender-card ${form.gender === "female" ? "selected" : ""}`}>
                      <div className="gender-card-icon">
                        <div className="gender-avatar female-avatar">♀</div>
                      </div>
                      <div className="gender-card-content">
                        <span className="gender-card-title">Female</span>
                        <span className="gender-card-subtitle">Select this option</span>
                      </div>
                      <div className="gender-card-indicator">
                        <div className="gender-radio-custom"></div>
                      </div>
                    </label>
                  </div>
                </div>
                {fieldErrors.gender && <div className="field-error">{fieldErrors.gender}</div>}
              </div>
            </div>
            <div className="rf-row">
              <div className="rf-label">Role:</div>
              <div className="rf-field">
                <select 
                  className={`rf-input ${fieldErrors.role ? 'error' : ''}`} 
                  name="role" 
                  value={form.role} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Select Role</option>
                  <option value="Academic Staff">Academic Staff</option>
                  <option value="Non-academic Staff">Non-academic Staff</option>
                </select>
                {fieldErrors.role && <div className="field-error">{fieldErrors.role}</div>}
              </div>
            </div>
            <div className="rf-row">
              <div className="rf-label">Position:</div>
              <div className="rf-field">
                <select 
                  className={`rf-input ${fieldErrors.position ? 'error' : ''}`} 
                  name="position" 
                  value={form.position} 
                  onChange={handleChange}
                  onBlur={handleBlur}
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
                {fieldErrors.position && <div className="field-error">{fieldErrors.position}</div>}
              </div>
            </div>
            {form.role === "Academic Staff" && (
              <div className="rf-row department-row">
                <div className="rf-label">Department:</div>
                <div className="rf-field">
                  <select 
                    className={`rf-input ${fieldErrors.department ? 'error' : ''}`} 
                    name="department" 
                    value={form.department} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Information System">Information System</option>
                  </select>
                  {fieldErrors.department && <div className="field-error">{fieldErrors.department}</div>}
                </div>
              </div>
            )}
            <div className="rf-row">
              <div className="rf-label">Email:</div>
              <div className="rf-field">
                <input 
                  className={`rf-input ${fieldErrors.email ? 'error' : ''}`} 
                  name="email" 
                  type="email"
                  value={form.email} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Your Email"
                />
                {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
              </div>
            </div>
            <div className="rf-row">
              <div className="rf-label">Username:</div>
              <div className="rf-field">
                <input 
                  className={`rf-input ${fieldErrors.username ? 'error' : ''}`} 
                  name="username" 
                  value={form.username} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Your Username"
                />
                {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}
              </div>
            </div>
            <div className="rf-row">
              <div className="rf-label">Password:</div>
              <div className="rf-field password-field">
                <input 
                  className={`rf-input ${fieldErrors.password ? 'error' : ''}`} 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="At least 6 characters with uppercase, lowercase, and number"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
                {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
              </div>
            </div>

            <button className="register-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>

            {errorMsg && <div className="register-feedback register-error" style={{ marginTop: '0.7vw', fontSize: '0.9vw' }}>{errorMsg}</div>}
          </form>
        </div>
      </main>
    </div>
  );
}