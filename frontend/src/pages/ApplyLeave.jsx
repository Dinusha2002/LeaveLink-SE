import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApplyLeave.css';

const ApplyLeave = ({ user, onBack }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || user?.fullName || '',
    designation: user?.position || user?.designation || '',
    department: user?.department?.name || user?.department || '',
    leaveType: '',
    leaveTakenCurrentYear: '',
    appointmentDate: user?.appointmentDate || '',
    dateOfCommencingLeave: '',
    dateOfResumingDuties: '',
    reasonOfLeave: '',
    signatureOfApplicant: ''
  });
  
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [signature, setSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const signatureRef = useRef(null);
  const [showSpecialLeaveForm, setShowSpecialLeaveForm] = useState(false);
  const [specialLeaveData, setSpecialLeaveData] = useState({
    name: user?.name || user?.fullName || '',
    designation: user?.position || user?.designation || '',
    noOfDays: '',
    fromDate: '',
    toDate: '',
    reason: '',
    signature: '',
    appliedDate: new Date().toISOString().split('T')[0]
  });

  // Fetch available leave types
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await fetch('/api/leave-types', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const types = await response.json();
          setLeaveTypes(types);
         } else {
           // Fallback to default leave types
           setLeaveTypes([
             { _id: '1', name: 'Casual Leave', maxDays: 21 },
             { _id: '2', name: 'Vacational Leave', maxDays: 24 },
             { _id: '3', name: 'Lieu Leave', maxDays: 'Unlimited' },
             { _id: '4', name: 'Duty Leave', maxDays: 'Unlimited' },
             { _id: '5', name: 'Block Leave', maxDays: 'Unlimited' },
             { _id: '6', name: 'Maternity Leave', maxDays: 90 }
           ]);
         }e
      } catch (error) {
        console.error('Error fetching leave types:', error);
        // Fallback to default leave types
         setLeaveTypes([
           { _id: '1', name: 'Casual Leave', maxDays: 21 },
           { _id: '2', name: 'Vacational Leave', maxDays: 24 },
           { _id: '3', name: 'Lieu Leave', maxDays: 'Unlimited' },
           { _id: '4', name: 'Duty Leave', maxDays: 'Unlimited' },
           { _id: '5', name: 'Block Leave', maxDays: 'Unlimited' },
           { _id: '6', name: 'Maternity Leave', maxDays: 90 }
         ]);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Check if duty or lieu leave is selected
    if (name === 'leaveType' && (value === '3' || value === '4')) {
      setShowSpecialLeaveForm(true);
    } else if (name === 'leaveType' && value !== '3' && value !== '4') {
      setShowSpecialLeaveForm(false);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSpecialLeaveInputChange = (e) => {
    const { name, value } = e.target;
    setSpecialLeaveData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      // Format appointment date for display
      let formattedAppointmentDate = '';
      if (user.appointmentDate) {
        const date = new Date(user.appointmentDate);
        formattedAppointmentDate = date.toISOString().split('T')[0];
      }
      
      setFormData(prev => ({
        ...prev,
        name: user.name || user.fullName || '',
        designation: user.position || user.designation || '',
        department: user.department?.name || user.department || '',
        appointmentDate: formattedAppointmentDate
      }));
    }
  }, [user]);

  // Digital signature functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      setSignature(dataURL);
      
      if (showSpecialLeaveForm) {
        setSpecialLeaveData(prev => ({
          ...prev,
          signature: dataURL
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          signatureOfApplicant: dataURL
        }));
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignature('');
      
      if (showSpecialLeaveForm) {
        setSpecialLeaveData(prev => ({
          ...prev,
          signature: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          signatureOfApplicant: ''
        }));
      }
    }
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const validateSpecialLeaveForm = () => {
    const newErrors = {};
    
    if (!specialLeaveData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!specialLeaveData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }
    
    if (!specialLeaveData.noOfDays) {
      newErrors.noOfDays = 'Number of days is required';
    }
    
    if (!specialLeaveData.fromDate) {
      newErrors.fromDate = 'From date is required';
    }
    
    if (!specialLeaveData.toDate) {
      newErrors.toDate = 'To date is required';
    }
    
    if (specialLeaveData.fromDate && specialLeaveData.toDate) {
      const start = new Date(specialLeaveData.fromDate);
      const end = new Date(specialLeaveData.toDate);
      
      if (end < start) {
        newErrors.toDate = 'To date cannot be before from date';
      }
      
      if (start < new Date()) {
        newErrors.fromDate = 'From date cannot be in the past';
      }
    }
    
    if (!specialLeaveData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }
    
    if (!specialLeaveData.signature) {
      newErrors.signature = 'Digital signature is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    // If special leave form is shown, validate that instead
    if (showSpecialLeaveForm) {
      return validateSpecialLeaveForm();
    }
    
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.leaveType) {
      newErrors.leaveType = 'Please select a leave type';
    }
    
    if (!formData.leaveTakenCurrentYear) {
      newErrors.leaveTakenCurrentYear = 'Please enter leave taken in current year';
    }
    
    // Appointment date is automatically populated from admin data, no validation needed
    
    if (!formData.dateOfCommencingLeave) {
      newErrors.dateOfCommencingLeave = 'Please select date of commencing leave';
    }
    
    if (!formData.dateOfResumingDuties) {
      newErrors.dateOfResumingDuties = 'Please select date of resuming duties';
    }
    
    if (formData.dateOfCommencingLeave && formData.dateOfResumingDuties) {
      const start = new Date(formData.dateOfCommencingLeave);
      const end = new Date(formData.dateOfResumingDuties);
      
      if (end < start) {
        newErrors.dateOfResumingDuties = 'Date of resuming duties cannot be before date of commencing leave';
      }
      
      if (start < new Date()) {
        newErrors.dateOfCommencingLeave = 'Date of commencing leave cannot be in the past';
      }
    }
    
    if (!formData.reasonOfLeave.trim()) {
      newErrors.reasonOfLeave = 'Please provide a reason for leave';
    }
    
    if (!formData.signatureOfApplicant) {
      newErrors.signatureOfApplicant = 'Please provide your digital signature';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      let leaveData;
      
      if (showSpecialLeaveForm) {
        // Special leave form data
        leaveData = {
          ...specialLeaveData,
          leaveType: formData.leaveType,
          userId: user._id,
          userEmail: user.email,
          department: user.department?.name || user.department,
          days: parseInt(specialLeaveData.noOfDays),
          status: 'pending',
          appliedDate: new Date().toISOString()
        };
      } else {
        // Regular leave form data
        leaveData = {
          ...formData,
          userId: user._id,
          userEmail: user.email,
          days: calculateDays(formData.dateOfCommencingLeave, formData.dateOfResumingDuties),
          status: 'pending',
          appliedDate: new Date().toISOString()
        };
      }
      
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(leaveData)
      });
      
      if (response.ok) {
        setMessage('Leave application submitted successfully!');
         setFormData({
           name: user?.name || user?.fullName || '',
           designation: user?.position || user?.designation || '',
           department: user?.department?.name || user?.department || '',
           leaveType: '',
           leaveTakenCurrentYear: '',
           appointmentDate: user?.appointmentDate || '',
           dateOfCommencingLeave: '',
           dateOfResumingDuties: '',
           reasonOfLeave: '',
           signatureOfApplicant: ''
         });
         setSignature('');
         clearSignature();
        
        // Redirect back to dashboard after 2 seconds
        setTimeout(() => {
          if (onBack) {
            onBack();
          } else {
            navigate('/user');
          }
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to submit leave application');
      }
    } catch (error) {
      console.error('Error submitting leave application:', error);
      setMessage('Failed to submit leave application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

   const selectedLeaveType = leaveTypes.find(type => type._id === formData.leaveType);
   const totalDays = calculateDays(formData.dateOfCommencingLeave, formData.dateOfResumingDuties);

  return (
    <div className="apply-leave-container">
      <div className="apply-leave-header">
        <button 
          className="apply-leave-back-btn"
          onClick={onBack || (() => navigate('/user'))}
        >
          ← Back to Dashboard
        </button>
        <h1>Apply for Leave</h1>
        <p>Submit a new leave request</p>
      </div>

      {message && (
        <div className={`apply-leave-message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

       <form className="apply-leave-form" onSubmit={handleSubmit}>
         <div className="apply-leave-section">
           <h3>Personal Information</h3>
           
           <div className="apply-leave-row">
             <div className="apply-leave-group">
               <label htmlFor="name">Name *</label>
               <input
                 type="text"
                 id="name"
                 name="name"
                 value={formData.name}
                 onChange={handleInputChange}
                 className={errors.name ? 'error' : ''}
                 placeholder="Full name"
               />
               {errors.name && <span className="error-text">{errors.name}</span>}
             </div>

             <div className="apply-leave-group">
               <label htmlFor="designation">Designation *</label>
               <input
                 type="text"
                 id="designation"
                 name="designation"
                 value={formData.designation}
                 onChange={handleInputChange}
                 className={errors.designation ? 'error' : ''}
                 placeholder="Your designation"
               />
               {errors.designation && <span className="error-text">{errors.designation}</span>}
             </div>
           </div>

           <div className="apply-leave-row">
             <div className="apply-leave-group">
               <label htmlFor="department">Department *</label>
               <input
                 type="text"
                 id="department"
                 name="department"
                 value={formData.department}
                 onChange={handleInputChange}
                 className={errors.department ? 'error' : ''}
                 placeholder="Your department"
               />
               {errors.department && <span className="error-text">{errors.department}</span>}
             </div>

             <div className="apply-leave-group">
               <label htmlFor="appointmentDate">Appointment Date *</label>
               <input
                 type="date"
                 id="appointmentDate"
                 name="appointmentDate"
                 value={formData.appointmentDate}
                 readOnly
                 className={`read-only-field ${errors.appointmentDate ? 'error' : ''}`}
               />
               {errors.appointmentDate && <span className="error-text">{errors.appointmentDate}</span>}
             </div>
           </div>
         </div>

         <div className="apply-leave-section">
           <h3>Leave Information</h3>
           
           <div className="apply-leave-row">
             <div className="apply-leave-group">
               <label htmlFor="leaveType">Leave Type *</label>
               <select
                 id="leaveType"
                 name="leaveType"
                 value={formData.leaveType}
                 onChange={handleInputChange}
                 className={errors.leaveType ? 'error' : ''}
               >
                 <option value="">Select Leave Type</option>
                 <optgroup label="Regular Leaves">
                   <option value="1">Casual Leave (Max: 21 days)</option>
                   <option value="2">Vacational Leave (Max: 24 days)</option>
                 </optgroup>
                 <optgroup label="Other Leaves">
                   <option value="3">Lieu Leave (Unlimited)</option>
                   <option value="4">Duty Leave (Unlimited)</option>
                   <option value="5">Block Leave (Unlimited)</option>
                   <option value="6">Maternity Leave (Max: 90 days)</option>
                 </optgroup>
               </select>
               {errors.leaveType && <span className="error-text">{errors.leaveType}</span>}
             </div>

             <div className="apply-leave-group">
               <label htmlFor="leaveTakenCurrentYear">Leave Taken in Current Year *</label>
               <input
                 type="number"
                 id="leaveTakenCurrentYear"
                 name="leaveTakenCurrentYear"
                 value={formData.leaveTakenCurrentYear}
                 onChange={handleInputChange}
                 className={errors.leaveTakenCurrentYear ? 'error' : ''}
                 placeholder="Number of days"
                 min="0"
               />
               {errors.leaveTakenCurrentYear && <span className="error-text">{errors.leaveTakenCurrentYear}</span>}
             </div>
           </div>

           <div className="apply-leave-row">
             <div className="apply-leave-group">
               <label htmlFor="dateOfCommencingLeave">Date of Commencing Leave *</label>
               <input
                 type="date"
                 id="dateOfCommencingLeave"
                 name="dateOfCommencingLeave"
                 value={formData.dateOfCommencingLeave}
                 onChange={handleInputChange}
                 className={errors.dateOfCommencingLeave ? 'error' : ''}
                 min={new Date().toISOString().split('T')[0]}
               />
               {errors.dateOfCommencingLeave && <span className="error-text">{errors.dateOfCommencingLeave}</span>}
             </div>

             <div className="apply-leave-group">
               <label htmlFor="dateOfResumingDuties">Date of Resuming Duties *</label>
               <input
                 type="date"
                 id="dateOfResumingDuties"
                 name="dateOfResumingDuties"
                 value={formData.dateOfResumingDuties}
                 onChange={handleInputChange}
                 className={errors.dateOfResumingDuties ? 'error' : ''}
                 min={formData.dateOfCommencingLeave || new Date().toISOString().split('T')[0]}
               />
               {errors.dateOfResumingDuties && <span className="error-text">{errors.dateOfResumingDuties}</span>}
             </div>
           </div>

           {totalDays > 0 && (
             <div className="apply-leave-summary">
               <p><strong>Total Days:</strong> {totalDays} day{totalDays !== 1 ? 's' : ''}</p>
               {selectedLeaveType && typeof selectedLeaveType.maxDays === 'number' && totalDays > selectedLeaveType.maxDays && (
                 <p className="warning-text">
                   ⚠️ Requested days ({totalDays}) exceed maximum allowed ({selectedLeaveType.maxDays}) for {selectedLeaveType.name}
                 </p>
               )}
             </div>
           )}
         </div>

         <div className="apply-leave-section">
           <h3>Reason for Leave</h3>
           <div className="apply-leave-group">
             <label htmlFor="reasonOfLeave">Reason of Leave *</label>
             <textarea
               id="reasonOfLeave"
               name="reasonOfLeave"
               value={formData.reasonOfLeave}
               onChange={handleInputChange}
               className={errors.reasonOfLeave ? 'error' : ''}
               rows="4"
               placeholder="Please provide a detailed reason for your leave request..."
             />
             {errors.reasonOfLeave && <span className="error-text">{errors.reasonOfLeave}</span>}
           </div>
         </div>

         <div className="apply-leave-section">
           <h3>Digital Signature</h3>
           <div className="apply-leave-group">
             <label>Signature of Applicant *</label>
             <div className={`signature-container ${errors.signatureOfApplicant ? 'error' : ''}`}>
               <canvas
                 ref={canvasRef}
                 width={400}
                 height={150}
                 className="signature-canvas"
                 onMouseDown={startDrawing}
                 onMouseMove={draw}
                 onMouseUp={stopDrawing}
                 onMouseLeave={stopDrawing}
                 onTouchStart={(e) => {
                   e.preventDefault();
                   const touch = e.touches[0];
                   const mouseEvent = new MouseEvent('mousedown', {
                     clientX: touch.clientX,
                     clientY: touch.clientY
                   });
                   startDrawing(mouseEvent);
                 }}
                 onTouchMove={(e) => {
                   e.preventDefault();
                   const touch = e.touches[0];
                   const mouseEvent = new MouseEvent('mousemove', {
                     clientX: touch.clientX,
                     clientY: touch.clientY
                   });
                   draw(mouseEvent);
                 }}
                 onTouchEnd={(e) => {
                   e.preventDefault();
                   stopDrawing();
                 }}
               />
               <div className="signature-actions">
                 <button
                   type="button"
                   className="signature-clear-btn"
                   onClick={clearSignature}
                 >
                   Clear Signature
                 </button>
                 <span className="signature-hint">Draw your signature above</span>
               </div>
               {errors.signatureOfApplicant && <span className="error-text">{errors.signatureOfApplicant}</span>}
             </div>
           </div>
         </div>

        <div className="apply-leave-actions">
          <button
            type="button"
            className="apply-leave-cancel-btn"
            onClick={onBack || (() => navigate('/user'))}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="apply-leave-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </div>
      </form>

      {/* Special Leave Form for Duty and Lieu Leave */}
      {showSpecialLeaveForm && (
        <div className="special-leave-form">
          <div className="special-leave-header">
            <h2>Special Leave Application</h2>
            <p>Complete the form for {formData.leaveType === '3' ? 'Lieu Leave' : 'Duty Leave'}</p>
          </div>

          <form className="apply-leave-form" onSubmit={handleSubmit}>
            <div className="apply-leave-section">
              <h3>Applicant Information</h3>
              
              <div className="apply-leave-row">
                <div className="apply-leave-group">
                  <label htmlFor="specialName">Name of Applicant *</label>
                  <input
                    type="text"
                    id="specialName"
                    name="name"
                    value={specialLeaveData.name}
                    onChange={handleSpecialLeaveInputChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Full name"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="apply-leave-group">
                  <label htmlFor="specialDesignation">Designation *</label>
                  <input
                    type="text"
                    id="specialDesignation"
                    name="designation"
                    value={specialLeaveData.designation}
                    onChange={handleSpecialLeaveInputChange}
                    className={errors.designation ? 'error' : ''}
                    placeholder="Your designation"
                  />
                  {errors.designation && <span className="error-text">{errors.designation}</span>}
                </div>
              </div>
            </div>

            <div className="apply-leave-section">
              <h3>Leave Details</h3>
              
              <div className="apply-leave-row">
                <div className="apply-leave-group">
                  <label htmlFor="specialNoOfDays">No. of Days *</label>
                  <input
                    type="number"
                    id="specialNoOfDays"
                    name="noOfDays"
                    value={specialLeaveData.noOfDays}
                    onChange={handleSpecialLeaveInputChange}
                    className={errors.noOfDays ? 'error' : ''}
                    placeholder="Number of days"
                    min="1"
                  />
                  {errors.noOfDays && <span className="error-text">{errors.noOfDays}</span>}
                </div>

                <div className="apply-leave-group">
                  <label htmlFor="specialAppliedDate">Leave Applied Date *</label>
                  <input
                    type="date"
                    id="specialAppliedDate"
                    name="appliedDate"
                    value={specialLeaveData.appliedDate}
                    onChange={handleSpecialLeaveInputChange}
                    className={errors.appliedDate ? 'error' : ''}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.appliedDate && <span className="error-text">{errors.appliedDate}</span>}
                </div>
              </div>

              <div className="apply-leave-row">
                <div className="apply-leave-group">
                  <label htmlFor="specialFromDate">From Date *</label>
                  <input
                    type="date"
                    id="specialFromDate"
                    name="fromDate"
                    value={specialLeaveData.fromDate}
                    onChange={handleSpecialLeaveInputChange}
                    className={errors.fromDate ? 'error' : ''}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.fromDate && <span className="error-text">{errors.fromDate}</span>}
                </div>

                <div className="apply-leave-group">
                  <label htmlFor="specialToDate">To Date *</label>
                  <input
                    type="date"
                    id="specialToDate"
                    name="toDate"
                    value={specialLeaveData.toDate}
                    onChange={handleSpecialLeaveInputChange}
                    className={errors.toDate ? 'error' : ''}
                    min={specialLeaveData.fromDate || new Date().toISOString().split('T')[0]}
                  />
                  {errors.toDate && <span className="error-text">{errors.toDate}</span>}
                </div>
              </div>
            </div>

            <div className="apply-leave-section">
              <h3>Reason for Leave</h3>
              <div className="apply-leave-group">
                <label htmlFor="specialReason">Reason *</label>
                <textarea
                  id="specialReason"
                  name="reason"
                  value={specialLeaveData.reason}
                  onChange={handleSpecialLeaveInputChange}
                  className={errors.reason ? 'error' : ''}
                  rows="4"
                  placeholder="Please provide a detailed reason for your leave request..."
                />
                {errors.reason && <span className="error-text">{errors.reason}</span>}
              </div>
            </div>

            <div className="apply-leave-section">
              <h3>Digital Signature</h3>
              <div className="apply-leave-group">
                <label>Signature of Applicant *</label>
                <div className={`signature-container ${errors.signature ? 'error' : ''}`}>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="signature-canvas"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const mouseEvent = new MouseEvent('mousedown', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                      });
                      startDrawing(mouseEvent);
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const mouseEvent = new MouseEvent('mousemove', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                      });
                      draw(mouseEvent);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      stopDrawing();
                    }}
                  />
                  <div className="signature-actions">
                    <button
                      type="button"
                      className="signature-clear-btn"
                      onClick={clearSignature}
                    >
                      Clear Signature
                    </button>
                    <span className="signature-hint">Draw your signature above</span>
                  </div>
                  {errors.signature && <span className="error-text">{errors.signature}</span>}
                </div>
              </div>
            </div>

            <div className="apply-leave-actions">
              <button
                type="button"
                className="apply-leave-cancel-btn"
                onClick={() => setShowSpecialLeaveForm(false)}
                disabled={isLoading}
              >
                Back to Regular Form
              </button>
              <button
                type="submit"
                className="apply-leave-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Special Leave Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ApplyLeave;

