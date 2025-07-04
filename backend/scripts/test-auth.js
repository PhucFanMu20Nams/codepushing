const fetch = require('node-fetch');

async function testLogin() {
  try {
    // 1. Test login with the admin credentials
    console.log('Testing login with admin credentials...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('Login response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data.token) {
      console.log('✅ Login successful! Authentication system is working.');
      
      // 2. Test profile endpoint with the token
      console.log('\nTesting profile endpoint with token...');
      
      const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const profileData = await profileResponse.json();
      console.log('Profile response:', JSON.stringify(profileData, null, 2));
      
      if (profileData.success) {
        console.log('✅ Profile endpoint working! Full authentication flow is complete.');
      } else {
        console.log('❌ Profile endpoint failed.');
      }
    } else {
      console.log('❌ Login failed. Check server logs for more details.');
    }
  } catch (error) {
    console.error('Error testing authentication:', error);
  }
}

testLogin();
