const fetch = require('node-fetch');

async function testProductCRUD() {
  try {
    // 1. First login to get the authentication token
    console.log('Logging in to get authentication token...');
    
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success || !loginData.data.token) {
      console.log('❌ Login failed, cannot continue testing');
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful! Got authentication token.');
    
    // 2. Create a new product
    console.log('\nTesting product creation...');
    const newProduct = {
      id: "test-product-" + Date.now().toString().slice(-6),
      name: "Test Product",
      brand: "Test Brand",
      price: 999000,
      category: "Men",
      subcategory: "Test",
      type: "Test Type",
      image: "/images/products/test-product.jpg",
      gallery: [
        "/images/products/test-product.jpg",
        "/images/products/test-product-2.jpg"
      ],
      sizes: ["S", "M", "L"],
      details: [
        "This is a test product.",
        "Created for API testing."
      ]
    };
    
    const createResponse = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProduct)
    });
    
    const createData = await createResponse.json();
    console.log('Create product response:', JSON.stringify(createData, null, 2));
    
    if (createData.success || createData.productId) {
      console.log(`✅ Product created successfully with ID: ${newProduct.id}`);
      
      // 3. Get the created product to verify
      console.log('\nTesting product retrieval...');
      
      const getResponse = await fetch(`http://localhost:5000/api/products/${newProduct.id}`);
      const getProduct = await getResponse.json();
      
      console.log('Retrieved product:', JSON.stringify(getProduct, null, 2));
      
      if (getProduct && getProduct.id === newProduct.id) {
        console.log('✅ Product retrieval successful!');
      } else {
        console.log('❌ Product retrieval failed or data mismatch');
      }
      
      // 4. Update the product
      console.log('\nTesting product update...');
      
      const updateResponse = await fetch(`http://localhost:5000/api/products/${newProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "Updated Test Product",
          price: 1099000
        })
      });
      
      const updateData = await updateResponse.json();
      console.log('Update product response:', JSON.stringify(updateData, null, 2));
      
      // 5. Delete the test product
      console.log('\nTesting product deletion...');
      
      const deleteResponse = await fetch(`http://localhost:5000/api/products/${newProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const deleteData = await deleteResponse.json();
      console.log('Delete product response:', JSON.stringify(deleteData, null, 2));
      
      if (deleteData.success) {
        console.log('✅ Product deletion successful!');
      } else {
        console.log('❌ Product deletion failed');
      }
    } else {
      console.log('❌ Product creation failed');
    }
  } catch (error) {
    console.error('Error testing product CRUD:', error);
  }
}

testProductCRUD();
