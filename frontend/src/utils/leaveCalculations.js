// Leave Calculation Utilities
// Handles complex leave calculations based on appointment date and staff type

export const calculateLeaveBalance = (user) => {
  if (!user || !user.appointmentDate) {
    return getDefaultLeaveBalance();
  }

  const appointmentDate = new Date(user.appointmentDate);
  const currentDate = new Date();
  const monthsSinceAppointment = getMonthsDifference(appointmentDate, currentDate);
  
  // Determine staff type based on position or role
  const isPermanent = isPermanentStaff(user);
  const isTemporary = isTemporaryStaff(user);
  
  if (isPermanent) {
    return calculatePermanentStaffLeaves(monthsSinceAppointment, appointmentDate, currentDate);
  } else if (isTemporary) {
    return calculateTemporaryStaffLeaves(monthsSinceAppointment);
  } else {
    // Default academic staff (permanent)
    return calculatePermanentStaffLeaves(monthsSinceAppointment, appointmentDate, currentDate);
  }
};

const getMonthsDifference = (startDate, endDate) => {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  return yearDiff * 12 + monthDiff;
};

const isPermanentStaff = (user) => {
  const permanentPositions = [
    'permanent instructor',
    'senior lecturer',
    'lecturer',
    'assistant professor',
    'professor',
    'head of department',
    'hod'
  ];
  
  const position = user.position?.toLowerCase() || '';
  const role = user.role?.toLowerCase() || '';
  
  return permanentPositions.some(pos => 
    position.includes(pos) || role.includes(pos)
  );
};

const isTemporaryStaff = (user) => {
  const temporaryPositions = [
    'temporary instructor',
    'contract instructor',
    'visiting lecturer',
    'part-time lecturer'
  ];
  
  const position = user.position?.toLowerCase() || '';
  const role = user.role?.toLowerCase() || '';
  
  return temporaryPositions.some(pos => 
    position.includes(pos) || role.includes(pos)
  );
};

const calculatePermanentStaffLeaves = (monthsSinceAppointment, appointmentDate, currentDate) => {
  const leaveBalance = {
    casual: { total: 0, used: 0, remaining: 0, percentage: 0 },
    vacation: { total: 0, used: 0, remaining: 0, percentage: 0 },
    other: { total: 0, used: 0, remaining: 0, percentage: 0 },
    maternity: { total: 365, used: 0, remaining: 365, percentage: 0 }
  };

  if (monthsSinceAppointment < 1) {
    // First month - no leave
    return leaveBalance;
  } else if (monthsSinceAppointment < 9) {
    // Months 2-8: 1.5 days per month
    const earnedDays = (monthsSinceAppointment - 1) * 1.5;
    leaveBalance.casual.total = Math.floor(earnedDays);
    leaveBalance.casual.remaining = leaveBalance.casual.total;
    leaveBalance.casual.percentage = 100;
  } else {
    // Month 9+: Calculate based on remaining months in the year
    const remainingMonths = 12 - (monthsSinceAppointment % 12);
    const casualPerMonth = 21 / 12;
    const vacationPerMonth = 24 / 12;
    
    leaveBalance.casual.total = Math.floor(remainingMonths * casualPerMonth);
    leaveBalance.casual.remaining = leaveBalance.casual.total;
    leaveBalance.casual.percentage = 100;
    
    leaveBalance.vacation.total = Math.floor(remainingMonths * vacationPerMonth);
    leaveBalance.vacation.remaining = leaveBalance.vacation.total;
    leaveBalance.vacation.percentage = 100;
  }

  // Other leaves have no count limit
  leaveBalance.other.total = 999; // Unlimited
  leaveBalance.other.remaining = 999;
  leaveBalance.other.percentage = 100;

  return leaveBalance;
};

const calculateTemporaryStaffLeaves = (monthsSinceAppointment) => {
  const leaveBalance = {
    casual: { total: 0, used: 0, remaining: 0, percentage: 0 },
    vacation: { total: 0, used: 0, remaining: 0, percentage: 0 },
    other: { total: 0, used: 0, remaining: 0, percentage: 0 },
    maternity: { total: 0, used: 0, remaining: 0, percentage: 0 }
  };

  if (monthsSinceAppointment < 1) {
    // First month - no leave
    return leaveBalance;
  } else {
    // Months 2-12: 1.5 days per month
    const earnedDays = (monthsSinceAppointment - 1) * 1.5;
    leaveBalance.casual.total = Math.floor(earnedDays);
    leaveBalance.casual.remaining = leaveBalance.casual.total;
    leaveBalance.casual.percentage = 100;
  }

  return leaveBalance;
};

const getDefaultLeaveBalance = () => {
  return {
    casual: { total: 0, used: 0, remaining: 0, percentage: 0 },
    vacation: { total: 0, used: 0, remaining: 0, percentage: 0 },
    other: { total: 0, used: 0, remaining: 0, percentage: 0 },
    maternity: { total: 0, used: 0, remaining: 0, percentage: 0 }
  };
};

export const getLeaveTypesForPosition = (user) => {
  const isPermanent = isPermanentStaff(user);
  const isTemporary = isTemporaryStaff(user);
  
  if (isPermanent) {
    return [
      { id: 'casual', name: 'Casual Leave', description: 'Personal and emergency leave' },
      { id: 'vacation', name: 'Vacation Leave', description: 'Annual vacation time' },
      { id: 'other', name: 'Other Leaves', description: 'Duty, lieu, block leave' },
      { id: 'maternity', name: 'Maternity Leave', description: 'Maternity and family leave' }
    ];
  } else if (isTemporary) {
    return [
      { id: 'casual', name: 'Casual Leave', description: 'Personal and emergency leave' }
    ];
  } else {
    // Default academic staff
    return [
      { id: 'casual', name: 'Casual Leave', description: 'Personal and emergency leave' },
      { id: 'vacation', name: 'Vacation Leave', description: 'Annual vacation time' },
      { id: 'other', name: 'Other Leaves', description: 'Duty, lieu, block leave' },
      { id: 'maternity', name: 'Maternity Leave', description: 'Maternity and family leave' }
    ];
  }
};

export const formatLeaveDisplay = (leaveBalance, leaveTypes) => {
  return leaveTypes.map(leaveType => {
    const balance = leaveBalance[leaveType.id] || { total: 0, used: 0, remaining: 0, percentage: 0 };
    return {
      ...leaveType,
      total: balance.total,
      used: balance.used,
      remaining: balance.remaining,
      percentage: balance.percentage
    };
  });
};
