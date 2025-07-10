/**
 * MongoDB Seeding Script
 * 
 * This script reads data from JSON files and seeds the MongoDB database.
 * It's a cleaner approach than using SQL files for a MongoDB-based application.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const config = require('../config/db.config');
require('dotenv').config();

async function seedMongoDB() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Admin.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Read product data from JSON file
    const productsPath = path.join(__dirname, '../data/products.json');
    console.log(`📂 Reading products from: ${productsPath}`);
    let productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    // Add unique IDs to products if they don't have one
    productsData = productsData.map((product, index) => {
      if (!product.id) {
        const brandPrefix = product.brand.substring(0, 3).toUpperCase();
        product.id = `${brandPrefix}-${index + 1000}`;
      }
      return product;
    });
    
    // Insert products one by one to avoid bulk write errors
    for (const product of productsData) {
      await Product.create(product);
    }
    console.log(`📦 Inserted ${productsData.length} products`);

    // Read admin data from JSON file
    const adminsPath = path.join(__dirname, '../data/admins.json');
    console.log(`📂 Reading admins from: ${adminsPath}`);
    const adminsData = JSON.parse(fs.readFileSync(adminsPath, 'utf8'));
    
    // Insert admins
    await Admin.insertMany(adminsData);
    console.log(`👤 Inserted ${adminsData.length} admin users`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('Username: Teekayyj');
    console.log('Password: AdminTuanKiet');
    console.log(`\n📊 Database Statistics:`);
    console.log(`   Products: ${productsData.length}`);
    console.log(`   Admins: ${adminsData.length}`);
    console.log(`   Total Documents: ${productsData.length + adminsData.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return false;
  } finally {
    await mongoose.disconnect();
    console.log('📡 MongoDB connection closed');
  }
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedMongoDB()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = seedMongoDB;
