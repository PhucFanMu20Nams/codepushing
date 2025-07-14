/**
 * Script to check existing admin users
 */
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function checkAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/textura_db');
    console.log('✅ Connected to MongoDB');

    // Get all admin users
    const admins = await Admin.find({});
    console.log('\n📋 Admin users in database:');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Username: ${admin.username}`);
        console.log(`   Email: ${admin.email || 'N/A'}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log(`   Last Login: ${admin.lastLogin || 'Never'}`);
        console.log('');
      });
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmins();
