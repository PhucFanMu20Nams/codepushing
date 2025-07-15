/**
 * Database migration script to initialize default categories
 * Run this script to set up default category configurations
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const CategoryConfig = require('../models/CategoryConfig');
const Product = require('../models/Product');

// Database connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/textura_db';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize default categories
const initializeCategories = async () => {
  try {
    console.log('🔄 Initializing default categories...');

    // Check if categories already exist
    const existingCategories = await CategoryConfig.find();
    
    if (existingCategories.length > 0) {
      console.log('📦 Categories already exist:');
      existingCategories.forEach(cat => {
        const totalOptions = Object.values(cat.availableFields).reduce((sum, arr) => sum + arr.length, 0);
        console.log(`   - ${cat.categoryName}: ${totalOptions} total options`);
      });
      
      const shouldOverwrite = process.argv.includes('--force');
      if (!shouldOverwrite) {
        console.log('⚠️  Use --force flag to overwrite existing categories');
        return;
      } else {
        console.log('🗑️  Removing existing categories...');
        await CategoryConfig.deleteMany({});
      }
    }

    // Get existing products to generate realistic options
    const products = await Product.find();
    console.log(`📊 Found ${products.length} existing products to analyze`);

    // Analyze existing product data to extract realistic options
    const productAnalysis = {
      Clothes: { brands: new Set(), types: new Set(), colors: new Set() },
      Footwear: { brands: new Set(), types: new Set(), colors: new Set() },
      Accessories: { brands: new Set(), types: new Set(), colors: new Set() }
    };

    products.forEach(product => {
      const category = product.category;
      if (productAnalysis[category]) {
        if (product.brand) productAnalysis[category].brands.add(product.brand);
        if (product.type) productAnalysis[category].types.add(product.type);
        if (product.color) productAnalysis[category].colors.add(product.color);
      }
    });

    // Default categories with enhanced options
    const defaultCategories = [
      {
        categoryName: 'Clothes',
        isActive: true,
        availableFields: {
          brands: [...new Set([
            ...Array.from(productAnalysis.Clothes.brands),
            'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levi\'s', 'Calvin Klein'
          ])].sort(),
          types: [...new Set([
            ...Array.from(productAnalysis.Clothes.types),
            'T-Shirt', 'Shirt', 'Button-up', 'Polo', 'Tank Top', 'Pants', 'Jeans', 'Shorts', 
            'Dress', 'Skirt', 'Jacket', 'Hoodie', 'Sweater', 'Blazer'
          ])].sort(),
          colors: [...new Set([
            ...Array.from(productAnalysis.Clothes.colors),
            'Black', 'White', 'Blue', 'Red', 'Green', 'Navy', 'Gray', 'Beige', 
            'Brown', 'Pink', 'Purple', 'Yellow', 'Orange'
          ])].sort()
        }
      },
      {
        categoryName: 'Footwear',
        isActive: true,
        availableFields: {
          brands: [...new Set([
            ...Array.from(productAnalysis.Footwear.brands),
            'Nike', 'Adidas', 'Converse', 'Vans', 'Puma', 'Reebok', 'New Balance', 
            'Dr. Martens', 'Timberland', 'Clarks'
          ])].sort(),
          types: [...new Set([
            ...Array.from(productAnalysis.Footwear.types),
            'Sneakers', 'Running Shoes', 'Basketball Shoes', 'Boots', 'Sandals', 
            'Formal Shoes', 'Loafers', 'High-tops', 'Low-tops', 'Slip-ons'
          ])].sort(),
          colors: [...new Set([
            ...Array.from(productAnalysis.Footwear.colors),
            'Black', 'White', 'Brown', 'Blue', 'Red', 'Gray', 'Navy', 
            'Green', 'Tan', 'Burgundy'
          ])].sort()
        }
      },
      {
        categoryName: 'Accessories',
        isActive: true,
        availableFields: {
          brands: [...new Set([
            ...Array.from(productAnalysis.Accessories.brands),
            'Apple', 'Samsung', 'Ray-Ban', 'Casio', 'Rolex', 'Fossil', 'Michael Kors', 
            'Coach', 'Kate Spade', 'Tiffany & Co.'
          ])].sort(),
          types: [...new Set([
            ...Array.from(productAnalysis.Accessories.types),
            'Watch', 'Smartwatch', 'Sunglasses', 'Eyeglasses', 'Bag', 'Backpack', 
            'Handbag', 'Wallet', 'Belt', 'Hat', 'Cap', 'Scarf', 'Jewelry'
          ])].sort(),
          colors: [...new Set([
            ...Array.from(productAnalysis.Accessories.colors),
            'Black', 'Silver', 'Gold', 'Brown', 'Blue', 'Red', 'White', 
            'Rose Gold', 'Platinum', 'Navy'
          ])].sort()
        }
      }
    ];

    // Create categories
    const createdCategories = [];
    for (const categoryData of defaultCategories) {
      const category = new CategoryConfig(categoryData);
      await category.save();
      createdCategories.push(category);
      
      const totalOptions = Object.values(category.availableFields).reduce((sum, arr) => sum + arr.length, 0);
      console.log(`✅ Created ${category.categoryName} with ${totalOptions} total options:`);
      console.log(`   - ${category.availableFields.brands.length} brands`);
      console.log(`   - ${category.availableFields.types.length} types`);
      console.log(`   - ${category.availableFields.colors.length} colors`);
    }

    console.log(`\n🎉 Successfully initialized ${createdCategories.length} categories!`);
    
    // Verify the creation
    const verifyCategories = await CategoryConfig.find();
    console.log(`\n📋 Verification - Total categories in database: ${verifyCategories.length}`);

    return createdCategories;
  } catch (error) {
    console.error('❌ Error initializing categories:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await initializeCategories();
    console.log('\n✨ Category initialization completed successfully!');
  } catch (error) {
    console.error('💥 Initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { initializeCategories, connectDB };
