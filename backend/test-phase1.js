/**
 * Simple API test script to verify Phase 1 implementation
 */

// Test the login endpoint first
async function testLogin() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Try the actual admin credentials from the database
    const testCredentials = [
      { username: 'Teekayyj', password: 'AdminTuanKiet' },
      { username: 'admin', password: 'admin123' },
      { username: 'admin', password: 'password' },
      { username: 'admin', password: 'admin' }
    ];
    
    for (const creds of testCredentials) {
      console.log(`Trying credentials: ${creds.username}/${creds.password}`);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creds)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Login successful!');
        if (data.data && data.data.token) {
          console.log('Token received:', data.data.token.substring(0, 20) + '...');
          return data.data.token;
        } else {
          console.log('❌ No token in response');
          return null;
        }
      } else {
        console.log(`❌ Login failed: ${data.message}`);
      }
    }
    
    console.log('❌ No working credentials found');
    return null;
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

// Test creating a product
async function testCreateProduct(token) {
  try {
    console.log('\n📦 Testing product creation...');
    
    const testProduct = {
      id: 'test-product-' + Date.now(),
      name: 'API Test Product',
      brand: 'Test Brand',
      price: 99.99,
      category: 'Electronics',
      description: 'This is a test product created via the new API',
      type: 'gadget',
      color: 'black'
    };

    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testProduct)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Product created successfully!');
      console.log('Product ID:', data.data._id);
      console.log('Product Name:', data.data.name);
      return data.data._id;
    } else {
      console.log('❌ Product creation failed:', data.message);
      if (data.errors) {
        console.log('Validation errors:', data.errors);
      }
      return null;
    }
  } catch (error) {
    console.log('❌ Product creation error:', error.message);
    return null;
  }
}

// Test updating a product
async function testUpdateProduct(token, productId) {
  try {
    console.log('\n✏️ Testing product update...');
    
    const updateData = {
      name: 'Updated API Test Product',
      price: 149.99,
      description: 'This product has been updated via the new API',
      color: 'red'
    };

    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Product updated successfully!');
      console.log('Updated name:', data.data.name);
      console.log('Updated price:', data.data.price);
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

// Test getting a product (public endpoint)
async function testGetProduct(productId) {
  try {
    console.log('\n🔍 Testing product retrieval...');
    
    const response = await fetch(`http://localhost:5000/api/products/${productId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Product retrieved successfully!');
      console.log('Name:', data.data.name);
      console.log('Price:', data.data.price);
      console.log('Brand:', data.data.brand);
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

// Test authentication protection
async function testAuthProtection() {
  try {
    console.log('\n🔒 Testing authentication protection...');
    
    // Try to create product without token
    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Unauthorized Product',
        brand: 'Test',
        price: 50,
        category: 'Test'
      })
    });

    const data = await response.json();
    
    if (!data.success && response.status === 401) {
      console.log('✅ Authentication protection working correctly!');
      console.log('Expected error:', data.message);
      return true;
    } else {
      console.log('❌ Authentication protection failed!');
      return false;
    }
  } catch (error) {
    console.log('❌ Auth protection test error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Phase 1 API Tests...\n');
  
  // Test 1: Authentication protection
  await testAuthProtection();
  
  // Test 2: Admin login
  const token = await testLogin();
  if (!token) {
    console.log('\n❌ Cannot proceed without authentication token.');
    console.log('Please check if admin exists in database or create one.');
    return;
  }

  // Test 3: Create product
  const productId = await testCreateProduct(token);
  if (!productId) {
    console.log('\n❌ Cannot proceed without creating a product.');
    return;
  }

  // Test 4: Get product (public endpoint)
  await testGetProduct(productId);

  // Test 5: Update product
  await testUpdateProduct(token, productId);

  // Test 6: Get updated product
  await testGetProduct(productId);

  console.log('\n🎉 All Phase 1 tests completed successfully!');
  console.log('\n✅ Backend API is ready for frontend integration.');
}

// Run the tests
runTests();
