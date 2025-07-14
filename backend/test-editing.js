/**
 * Test the product editing functionality
 */

async function testProductEditing() {
  console.log('🧪 Testing Product Editing Functionality...\n');

  try {
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Teekayyj',
        password: 'AdminTuanKiet'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful');

    // 2. Get existing products
    console.log('\n2. Fetching existing products...');
    const productsResponse = await fetch('http://localhost:5000/api/products');
    const productsData = await productsResponse.json();
    
    if (!productsData.success || !productsData.data || productsData.data.length === 0) {
      console.log('❌ No products found to edit');
      return;
    }

    const productToEdit = productsData.data[0];
    console.log('✅ Found product to edit:', productToEdit.name);
    console.log('   Original price:', productToEdit.price);
    console.log('   Product ID:', productToEdit._id);

    // 3. Update the product
    console.log('\n3. Updating product...');
    const updateData = {
      name: productToEdit.name + ' (Updated)',
      price: parseFloat(productToEdit.price) + 10,
      description: 'This product has been updated via API test'
    };

    const updateResponse = await fetch(`http://localhost:5000/api/products/${productToEdit._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    
    if (updateResult.success) {
      console.log('✅ Product updated successfully!');
      console.log('   New name:', updateResult.data.name);
      console.log('   New price:', updateResult.data.price);
    } else {
      console.log('❌ Product update failed:', updateResult.message);
      return;
    }

    // 4. Verify the update
    console.log('\n4. Verifying update...');
    const verifyResponse = await fetch(`http://localhost:5000/api/products/${productToEdit._id}`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      console.log('✅ Update verified!');
      console.log('   Verified name:', verifyData.data.name);
      console.log('   Verified price:', verifyData.data.price);
    } else {
      console.log('❌ Verification failed:', verifyData.message);
    }

    console.log('\n🎉 Product editing test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testProductEditing();
