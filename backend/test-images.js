/**
 * Test image upload functionality
 */

const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testImageUpload() {
  try {
    console.log('🖼️ Testing image upload functionality...');
    
    // First, login to get token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Teekayyj',
        password: 'AdminTuanKiet'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed for image test');
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful for image test');

    // Create a simple test image file (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x37, 0x6E, 0xF9, 0x24, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Create form data
    const formData = new FormData();
    formData.append('id', 'image-test-' + Date.now());
    formData.append('name', 'Image Upload Test Product');
    formData.append('brand', 'Test Brand');
    formData.append('price', '199.99');
    formData.append('category', 'Electronics');
    formData.append('description', 'Testing image upload functionality');
    
    // Add test images
    formData.append('images', testImageBuffer, {
      filename: 'test1.png',
      contentType: 'image/png'
    });
    formData.append('images', testImageBuffer, {
      filename: 'test2.png',
      contentType: 'image/png'
    });

    // Upload product with images
    const uploadResponse = await fetch('http://localhost:5000/api/products/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    const uploadData = await uploadResponse.json();
    
    if (uploadData.success) {
      console.log('✅ Image upload successful!');
      console.log('Product with images created:', uploadData.data.name);
      console.log('Gallery items:', uploadData.data.gallery?.length || 0);
      console.log('Primary image:', uploadData.data.imageUrl || 'None');
      return uploadData.data._id;
    } else {
      console.log('❌ Image upload failed:', uploadData.message);
      if (uploadData.errors) {
        console.log('Errors:', uploadData.errors);
      }
      return null;
    }

  } catch (error) {
    console.log('❌ Image upload test error:', error.message);
    return null;
  }
}

// Test updating product with images
async function testUpdateWithImages(productId, token) {
  try {
    console.log('\n🔄 Testing product update with images...');
    
    // Create test image
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x37, 0x6E, 0xF9, 0x24, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const formData = new FormData();
    formData.append('name', 'Updated Product with New Images');
    formData.append('price', '299.99');
    formData.append('description', 'This product has been updated with new images');
    
    // Add new image
    formData.append('images', testImageBuffer, {
      filename: 'updated-test.png',
      contentType: 'image/png'
    });

    const response = await fetch(`http://localhost:5000/api/products/${productId}/images`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Product update with images successful!');
      console.log('Updated name:', data.data.name);
      console.log('Updated price:', data.data.price);
      console.log('Total gallery items:', data.data.gallery?.length || 0);
      return true;
    } else {
      console.log('❌ Update with images failed:', data.message);
      return false;
    }

  } catch (error) {
    console.log('❌ Update with images error:', error.message);
    return false;
  }
}

async function runImageTests() {
  console.log('🖼️ Starting Image Upload Tests...\n');
  
  // Test image upload
  const productId = await testImageUpload();
  
  if (productId) {
    // Get token for update test
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Teekayyj',
        password: 'AdminTuanKiet'
      })
    });

    const loginData = await loginResponse.json();
    if (loginData.success) {
      await testUpdateWithImages(productId, loginData.data.token);
    }
  }
  
  console.log('\n🎉 Image upload tests completed!');
}

runImageTests();
