const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test admin users endpoint (without auth for now)
    console.log('2. Testing admin users endpoint...');
    try {
      const usersResponse = await axios.get(`${baseURL}/admin/users`);
      console.log('✅ Admin users:', usersResponse.data);
    } catch (error) {
      console.log('❌ Admin users error (expected without auth):', error.response?.status, error.response?.data);
    }
    
    // Test departments endpoint
    console.log('3. Testing departments endpoint...');
    try {
      const deptResponse = await axios.get(`${baseURL}/departments`);
      console.log('✅ Departments:', deptResponse.data);
    } catch (error) {
      console.log('❌ Departments error:', error.response?.status, error.response?.data);
    }
    
    // Test leaveTypes endpoint
    console.log('4. Testing leaveTypes endpoint...');
    try {
      const leaveTypesResponse = await axios.get(`${baseURL}/leaveTypes`);
      console.log('✅ Leave Types:', leaveTypesResponse.data);
    } catch (error) {
      console.log('❌ Leave Types error:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
