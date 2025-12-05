# HOD Account Setup Guide

## 🏢 HOD Account Requirements

Based on your requirements, the HOD account includes the following features:

### ✅ **Core HOD Features Implemented:**

#### 1. **📋 Leave Request Management**
- **View Leave Requests**: Complete table with staff details, leave types, dates, and reasons
- **Approve/Reject Requests**: One-click approval or rejection of leave requests
- **Filter by Department**: Filter requests by specific departments
- **Filter by Staff**: Filter requests by individual staff members
- **Status Tracking**: Visual status indicators (Pending ⏳, Approved ✅, Rejected ❌)

#### 2. **👥 User Account Management**
- **View All Users**: Complete user list with contact information and status
- **Add New Users**: Create new staff accounts
- **Edit User Information**: Update existing user details
- **Activate/Deactivate Accounts**: Toggle user account status
- **Department Assignment**: Assign users to specific departments

#### 3. **🏢 Department & Leave Types Management**
- **Department Management**: Add, edit, delete departments
- **Leave Types Configuration**: Set up different types of leave (Annual, Sick, Personal, etc.)
- **Policy Settings**: Configure maximum days for each leave type
- **Description Management**: Add detailed descriptions for leave types

#### 4. **📊 Leave Statistics & Reports**
- **Date Range Filtering**: Generate reports for specific date ranges
- **Department Filtering**: Filter reports by department
- **Individual Staff Reports**: Generate reports for specific staff members
- **Monthly Reports**: Generate reports after every month
- **Download PDF**: Export reports in PDF format
- **Real-time Statistics**: Live stats on total, approved, rejected, and pending requests

## 🔐 HOD Account Credentials

### Test HOD Account
- **Email**: `hod@leavelink.local`
- **Password**: `HOD@12345`
- **Full Name**: Dr. John Smith
- **Position**: HOD (Head of Department)
- **Department**: Information Technology

## 🚀 How to Access HOD Dashboard

### Step 1: Start the Backend Server
```bash
cd leave-link/backend
npm run dev
```

### Step 2: Start the Frontend Server
```bash
cd leave-link/frontend
npm run dev
```

### Step 3: Login as HOD
1. Go to `http://localhost:5173/login`
2. Enter HOD credentials:
   - Email: `hod@leavelink.local`
   - Password: `HOD@12345`
3. Click "Login"
4. You'll be automatically redirected to the HOD Dashboard

## 📱 HOD Dashboard Features

### **Main Dashboard Sections:**

#### 1. **📊 Overview**
- Statistics cards showing total requests, pending, approved, and active staff
- Recent leave requests with quick approve/reject actions
- Visual status indicators and color-coded badges

#### 2. **📋 Leave Requests**
- Complete table of all leave requests
- Filter by department and staff
- One-click approve/reject functionality
- Detailed request information including staff email and department

#### 3. **👥 User Management**
- Complete user account management
- Add, edit, activate/deactivate users
- Department assignment
- EPF number tracking

#### 4. **🏢 Department & Leave Types**
- Department configuration
- Leave type management with color coding
- Policy settings for each leave type
- Maximum days configuration

#### 5. **📈 Reports & Statistics**
- Custom date range reports
- Monthly report generation
- Department and staff filtering
- PDF export functionality
- Comprehensive analytics

## 🎯 Key HOD Capabilities

### **Leave Request Workflow:**
1. **View Requests**: See all pending, approved, and rejected requests
2. **Filter Options**: Filter by department, staff, or date range
3. **Quick Actions**: One-click approve/reject buttons
4. **Status Tracking**: Visual status indicators with colors and icons

### **User Management:**
1. **Complete CRUD**: Create, read, update, delete user accounts
2. **Status Management**: Activate/deactivate accounts
3. **Department Assignment**: Assign users to departments
4. **Bulk Operations**: Manage multiple users efficiently

### **Reporting System:**
1. **Flexible Filtering**: Date range, department, and staff filters
2. **Generate Reports**: Create custom reports with selected criteria
3. **Export Options**: Download reports as PDF
4. **Statistics Display**: Real-time statistics and analytics

## 🔧 Technical Implementation

### **Backend Features:**
- **MongoDB Database**: All data stored securely
- **JWT Authentication**: Secure login and session management
- **RESTful API**: Clean API endpoints for all operations
- **Data Validation**: Comprehensive input validation

### **Frontend Features:**
- **React Components**: Modern, responsive UI components
- **Real-time Updates**: Live data updates without page refresh
- **Form Validation**: Client-side validation for all inputs
- **Error Handling**: Comprehensive error handling and user feedback

## 📋 Sample HOD Workflow

### **Daily Tasks:**
1. **Morning**: Check dashboard for new leave requests
2. **Review**: Filter requests by department or staff
3. **Decide**: Approve or reject requests based on department needs
4. **Update**: Manage staff accounts as needed
5. **Report**: Generate daily/weekly reports

### **Monthly Tasks:**
1. **Generate Monthly Reports**: Create comprehensive monthly leave reports
2. **Review Statistics**: Analyze leave patterns and trends
3. **Update Policies**: Modify leave types or department settings
4. **Staff Management**: Review and update staff information

## 🎨 User Interface Features

### **Dashboard Overview:**
- **Statistics Cards**: Total requests, pending, approved, and staff count
- **Recent Requests**: Quick view of latest leave requests
- **Visual Indicators**: Color-coded status badges and icons
- **Quick Actions**: Direct access to all management features

### **Navigation:**
- **Sidebar Menu**: Easy access to all management sections
- **Search Functionality**: Search across all data
- **Responsive Design**: Works on desktop and mobile devices

## 🔒 Security Features

- **Role-based Access**: Only HODs can access management features
- **Secure Authentication**: JWT-based secure login
- **Data Encryption**: All sensitive data is encrypted
- **Audit Trail**: Complete tracking of all actions

## 📞 Support & Troubleshooting

### **Common Issues:**
1. **Login Issues**: Check credentials and server status
2. **Data Not Loading**: Verify backend server is running
3. **Permission Errors**: Ensure user has HOD role

### **Getting Help:**
- Check the dashboard for system status
- Review the user management section for account issues
- Generate reports for data analysis
- Use the search functionality to find specific information

---

**Note**: This HOD account has full administrative privileges within the leave management system. Use responsibly and ensure all actions comply with institutional policies.

## 🎉 Success!

Your HOD account is now fully set up with all the requested features:
- ✅ View, approve, or reject leave requests
- ✅ Manage user accounts, departments, and leave types
- ✅ Generate leave statistics and reports
- ✅ Generate reports based on date range, department, or individual staff
- ✅ Monthly report generation capability

The HOD Dashboard is ready for use! 🚀
