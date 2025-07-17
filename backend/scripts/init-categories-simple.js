/**
 * Simplified Category System Initialization Script
 * Sets up default categories for the system
 */

const mongoose = require('mongoose');
const { seedDefaultCategories } = require('./seed-categories');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codepushing');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Main initialization function
async function initializeCategorySystem() {
  console.log('🎯 Initializing Category Management System...\n');
  
  try {
    await connectDB();
    
    console.log('🌱 Seeding default categories...');
    await seedDefaultCategories();
    
    console.log('\n🎉 Category system initialized successfully!');
    console.log('💡 You can now use the dynamic category management features');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeCategorySystem()
    .then(() => {
      console.log('🏁 Initialization completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeCategorySystem };
