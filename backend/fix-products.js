const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function fixProductCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/textura_db');
    console.log('✅ Connected to MongoDB');
    
    // Update products with 'Clothing' to 'Clothes'
    const result = await Product.updateMany(
      { category: 'Clothing' },
      { category: 'Clothes' }
    );
    
    console.log(`📝 Updated ${result.modifiedCount} products from 'Clothing' to 'Clothes'`);
    
    // Show updated products
    const products = await Product.find({}, 'name category brand type color').lean();
    console.log('\n📊 Current products:');
    products.forEach(p => {
      console.log(`  ${p.name} - ${p.category} - ${p.brand} - ${p.type} - ${p.color}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

fixProductCategories();
