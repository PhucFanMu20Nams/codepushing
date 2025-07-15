const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('./config/db.config');

async function testAdminAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get admin user
    const Admin = require('./models/Admin');
    const admin = await Admin.findOne({ username: 'Teekayyj' });
    
    if (!admin) {
      console.log('✗ Admin user not found');
      return;
    }
    
    console.log('✓ Found admin:', admin.username);

    // Generate a token (simulate login)
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username 
      }, 
      config.JWT_SECRET, 
      { expiresIn: config.JWT_EXPIRE }
    );
    
    console.log('✓ Generated token');

    // Test token verification (simulate middleware)
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      console.log('✓ Token verified, user ID:', decoded.id);
      
      // Check if admin still exists (simulate middleware check)
      const adminCheck = await Admin.findById(decoded.id);
      if (adminCheck) {
        console.log('✓ Admin verification successful');
        console.log('Token to use in frontend:', token);
      } else {
        console.log('✗ Admin not found during verification');
      }
    } catch (error) {
      console.log('✗ Token verification failed:', error.message);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.log('✗ Auth test failed:', error.message);
  }
}

testAdminAuth();
