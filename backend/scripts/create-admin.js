/**
 * Create Admin User Script
 * 
 * This script creates an admin user with the correct password hashing
 */

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const config = require('../config/db.config');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing admin user
    console.log('🗑️ Removing existing admin user...');
    await Admin.deleteMany({ username: 'Teekayyj' });

    // Create new admin user (password will be automatically hashed by the schema)
    console.log('👤 Creating admin user...');
    const admin = new Admin({
      username: 'Teekayyj',
      password: 'AdminTuanKiet', // This will be hashed automatically
      email: 'admin@textura.com',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    
    console.log('\n📋 Login Credentials:');
    console.log('Username: Teekayyj');
    console.log('Password: AdminTuanKiet');
    console.log('Admin Panel: http://localhost:5173/admin/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 MongoDB connection closed');
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createAdmin()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = createAdmin;
