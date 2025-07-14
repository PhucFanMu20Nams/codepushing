/**
 * Test script for the new admin product management API endpoints
 * Run this after starting the server to verify all endpoints work correctly
 */

const fetch = require('node-fetch'); // You may need to install: npm install node-fetch@2

const API_BASE = 'http://localhost:5000/api';

// Test admin credentials (make sure these exist in your database)
const TEST_ADMIN = {
  username: 'admin', // Replace with your actual admin username
  password: 'admin123' // Replace with your actual admin password
};

let authToken = '';

async function testLogin() {
  console.log('🔐 Testing admin login...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_ADMIN)
    });

    const data = await response.json();
    
    if (data.success) {
      authToken = data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testCreateProduct() {
  console.log('\n📦 Testing product creation...');
  try {
    const testProduct = {
      id: 'test-product-' + Date.now(),
      name: 'Test Product',
      brand: 'Test Brand',
      price: 99.99,
      category: 'Test Category',
      description: 'This is a test product created via API'
    };

    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testProduct)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Product created successfully');
      console.log('Product ID:', data.data._id);
      return data.data._id;
    } else {
      console.log('❌ Product creation failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Product creation error:', error.message);
    return null;
  }
}

async function testUpdateProduct(productId) {
  console.log('\n✏️ Testing product update...');
  try {
    const updateData = {
      name: 'Updated Test Product',
      price: 149.99,
      description: 'This product has been updated via API'
    };

    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Product updated successfully');
      return true;
    } else {
      console.log('❌ Product update failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Product update error:', error.message);
    return false;
  }
}

async function testGetProduct(productId) {
  console.log('\n🔍 Testing product retrieval...');
  try {
    const response = await fetch(`${API_BASE}/products/${productId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Product retrieved successfully');
      console.log('Product name:', data.data.name);
      console.log('Product price:', data.data.price);
      return true;
    } else {
      console.log('❌ Product retrieval failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Product retrieval error:', error.message);
    return false;
  }
}

async function testDeleteProduct(productId) {
  console.log('\n🗑️ Testing product deletion...');
  try {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Product deleted successfully');
      return true;
    } else {
      console.log('❌ Product deletion failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Product deletion error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  // Test authentication
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication. Please check your admin credentials.');
    return;
  }

  // Test CRUD operations
  const productId = await testCreateProduct();
  if (!productId) {
    console.log('\n❌ Cannot proceed without creating a product.');
    return;
  }

  await testGetProduct(productId);
  await testUpdateProduct(productId);
  await testGetProduct(productId); // Get again to see updates
  await testDeleteProduct(productId);

  console.log('\n🎉 All tests completed!');
}

// Export for manual testing
module.exports = {
  testLogin,
  testCreateProduct,
  testUpdateProduct,
  testGetProduct,
  testDeleteProduct,
  runTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}
