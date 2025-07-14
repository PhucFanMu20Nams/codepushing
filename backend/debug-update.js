/**
 * Debug script to test product update functionality
 */

// Try different import methods for fetch
let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  console.log('node-fetch not available, trying with global fetch');
  fetch = global.fetch;
}

const API_BASE = 'http://localhost:5000/api';

// Test admin credentials - using existing users
const TEST_ADMIN = {
  username: 'Teekayyj',
  password: 'AdminTuanKiet'
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
    console.log('Login response:', data);
    
    if (data.success) {
      authToken = data.data.token;
      console.log('✅ Login successful');
      console.log('Token:', authToken.substring(0, 20) + '...');
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

async function testGetProducts() {
  console.log('\n📦 Testing get products...');
  try {
    const response = await fetch(`${API_BASE}/products?limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      console.log('✅ Got products successfully');
      const product = data.data[0];
      console.log('First product:', {
        id: product._id,
        customId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price
      });
      return product;
    } else {
      console.log('❌ No products found');
      return null;
    }
  } catch (error) {
    console.log('❌ Get products error:', error.message);
    return null;
  }
}

async function testUpdateProduct(product) {
  if (!product) {
    console.log('❌ No product to update');
    return false;
  }

  console.log('\n✏️ Testing product update...');
  try {
    const productId = product._id;
    const updateData = {
      name: product.name + ' - UPDATED',
      brand: product.brand,
      price: product.price + 0.01,
      category: product.category
    };

    console.log('Updating product ID:', productId);
    console.log('Update data:', updateData);
    console.log('Auth token:', authToken ? 'Present' : 'Missing');

    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updateData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const data = await response.json();
    console.log('Update response:', data);
    
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

async function runTests() {
  console.log('🚀 Starting product update debug tests...\n');
  
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without login');
    return;
  }

  const product = await testGetProducts();
  if (!product) {
    console.log('❌ Cannot proceed without a product to test');
    return;
  }

  const updateSuccess = await testUpdateProduct(product);
  
  console.log('\n📊 Test Results:');
  console.log('Login:', loginSuccess ? '✅' : '❌');
  console.log('Get Products:', product ? '✅' : '❌');
  console.log('Update Product:', updateSuccess ? '✅' : '❌');
}

runTests().catch(console.error);
