/**
 * Simple test script to check admin authentication and product operations
 */

console.log('Testing admin authentication and product operations...');

// Test if we can reach the server
fetch('http://localhost:5000/api/products')
  .then(response => {
    console.log('✅ Server is reachable');
    console.log('Products endpoint status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Products data:', data);
    
    // Now test authentication with correct token key
    const token = localStorage.getItem('adminToken'); // Fixed token key
    console.log('Token from localStorage:', token ? 'Found' : 'Not found');
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'None');
    
    if (token) {
      // Test authenticated request
      return fetch('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } else {
      console.log('❌ No token found in localStorage');
      console.log('Available localStorage keys:', Object.keys(localStorage));
      return null;
    }
  })
  .then(response => {
    if (response) {
      console.log('Authenticated request status:', response.status);
      if (response.status === 401) {
        console.log('❌ Token is invalid or expired');
      } else {
        console.log('✅ Token is valid');
      }
    }
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
