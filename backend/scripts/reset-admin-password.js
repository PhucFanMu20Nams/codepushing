const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔑 Resetting admin password...');

async function resetAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection established');

    // Find the admin
    const admin = await Admin.findOne({ username: 'Teekayyj' });
    
    if (!admin) {
      console.log('❌ Admin not found');
      return;
    }

    // Set a simple password for development
    const newPassword = 'admin123';
    
    // Hash the password manually to avoid double hashing
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the admin without triggering the pre-save middleware
    await Admin.updateOne(
      { username: 'Teekayyj' }, 
      { password: hashedPassword }
    );
    
    console.log('✅ Admin password reset successfully');
    console.log('📝 Username: Teekayyj');
    console.log('📝 Password: admin123');
    
    // Test the password
    const updatedAdmin = await Admin.findOne({ username: 'Teekayyj' });
    const isValid = await bcrypt.compare(newPassword, updatedAdmin.password);
    console.log('🔍 Password validation test:', isValid ? 'PASSED' : 'FAILED');

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

resetAdminPassword();
