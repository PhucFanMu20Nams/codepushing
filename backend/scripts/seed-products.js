const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

// Read environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🌱 Starting product seeding...');
console.log('📍 MongoDB URI:', MONGODB_URI);

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection established');

    // Read products data
    const productsPath = path.join(__dirname, '../data/products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    console.log(`📦 Found ${productsData.length} products to seed`);

    // Clear existing products
    await Product.deleteMany({});
    console.log('🧹 Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(productsData);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products`);

    // Verify the count
    const count = await Product.countDocuments();
    console.log(`📊 Total products in database: ${count}`);

    // Show first few products
    const sampleProducts = await Product.find().limit(3);
    console.log('📝 Sample products:');
    sampleProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.brand}) - ₫${product.price.toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

seedProducts();
