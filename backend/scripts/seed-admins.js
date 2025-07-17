const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Admin = require('../models/Admin');

// Read environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔐 Starting admin seeding...');
console.log('📍 MongoDB URI:', MONGODB_URI);

async function seedAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection established');

    // Read admins data
    const adminsPath = path.join(__dirname, '../data/admins.json');
    const adminsData = JSON.parse(fs.readFileSync(adminsPath, 'utf8'));
    
    console.log(`👤 Found ${adminsData.length} admins to seed`);

    // Clear existing admins
    await Admin.deleteMany({});
    console.log('🧹 Cleared existing admins');

    // Insert new admins
    const insertedAdmins = await Admin.insertMany(adminsData);
    console.log(`✅ Successfully seeded ${insertedAdmins.length} admins`);

    // Verify the count
    const count = await Admin.countDocuments();
    console.log(`📊 Total admins in database: ${count}`);

    // Show admin info (without password)
    const sampleAdmins = await Admin.find().select('-password');
    console.log('👥 Admin accounts:');
    sampleAdmins.forEach(admin => {
      console.log(`  - ${admin.username} (${admin.email}) - Active: ${admin.isActive}`);
    });

  } catch (error) {
    console.error('❌ Error seeding admins:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

seedAdmins();
