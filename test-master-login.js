// Test Master Login Script
const axios = require('axios');

async function testMasterLogin() {
  try {
    console.log('Testing Master Login...');
    
    const response = await axios.post('http://localhost:7199/api/master/auth/login', {
      email: 'admin@stocker.com',
      password: 'Admin123!'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response:', {
      success: response.data.success,
      token: response.data.data?.token ? 'Token received' : 'No token',
      user: response.data.data?.user
    });
    
    if (response.data.data?.token) {
      console.log('\nToken:', response.data.data.token);
      console.log('\nYou can use this token in the browser console:');
      console.log(`localStorage.setItem('auth_token', '${response.data.data.token}');`);
      console.log(`localStorage.setItem('refresh_token', '${response.data.data.refreshToken || ''}');`);
      console.log(`window.location.reload();`);
    }
    
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testMasterLogin();