/**
 * Test script for MongoDB product structure
 */

const mongoose = require('mongoose');
const config = require('../config/db.config');

// Connect to MongoDB
async function testMongoProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import the Product model
    const Product = require('../models/Product');
    
    // Test 1: Count all products
    const count = await Product.countDocuments();
    console.log(`\n🔢 Total products: ${count}`);
    
    // Test 2: Get a sample product
    const products = await Product.find().limit(1);
    console.log('\n📋 Sample product structure:');
    const sample = products[0];
    console.log(`Name: ${sample.name}`);
    console.log(`Brand: ${sample.brand}`);
    console.log(`Category: ${sample.category}`);
    console.log(`Type: ${sample.type}`);
    console.log(`Price: $${sample.price}`);
    console.log(`Image URL: ${sample.imageUrl}`);
    console.log(`Details array length: ${sample.details?.length}`);
    console.log(`Gallery array length: ${sample.gallery?.length}`);
    console.log(`Sizes array length: ${sample.sizes?.length}`);
    
    // Test 3: Filter by category = Footwear
    const footwear = await Product.find({ category: 'Footwear' });
    console.log(`\n👟 Footwear products: ${footwear.length}`);
    console.log(footwear.map(p => p.name).join(', '));
    
    // Test 4: Filter by brand = Nike
    const nike = await Product.find({ brand: 'Nike' });
    console.log(`\n✓ Nike products: ${nike.length}`);
    console.log(nike.map(p => p.name).join(', '));
    
    // Test 5: More complex query - Nike Footwear
    const nikeFootwear = await Product.find({ 
      brand: 'Nike',
      category: 'Footwear'
    });
    console.log(`\n👟✓ Nike Footwear products: ${nikeFootwear.length}`);
    console.log(nikeFootwear.map(p => p.name).join(', '));
    
    // Test 6: Test the embedded arrays - find products with specific sizes
    const withSize40 = await Product.find({ 'sizes.size': '40' });
    console.log(`\n📏 Products with size 40: ${withSize40.length}`);
    console.log(withSize40.map(p => p.name).join(', '));
    
    console.log('\n✅ All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📄 Disconnected from MongoDB');
  }
}

// Run the tests
testMongoProducts();
