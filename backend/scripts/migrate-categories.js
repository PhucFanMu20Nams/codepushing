/**
 * Category Data Migration Script
 * Initializes category configurations from existing product data
 */

const mongoose = require('mongoose');
const CategoryConfig = require('../models/CategoryConfig');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codepushing', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB for category migration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Extract unique values from existing products
async function extractCategoryData() {
  console.log('📊 Analyzing existing product data...');
  
  try {
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products to analyze`);
    
    const categoryData = {
      Clothes: { brands: new Set(), types: new Set(), colors: new Set() },
      Footwear: { brands: new Set(), types: new Set(), colors: new Set() },
      Accessories: { brands: new Set(), types: new Set(), colors: new Set() }
    };
    
    // Extract data from each product
    products.forEach(product => {
      const category = product.category;
      
      // Skip if category doesn't match our main categories
      if (!categoryData[category]) {
        console.log(`⚠️  Skipping product with unknown category: ${category}`);
        return;
      }
      
      // Extract brand
      if (product.brand && product.brand.trim()) {
        categoryData[category].brands.add(product.brand.trim());
      }
      
      // Extract type
      if (product.type && product.type.trim()) {
        categoryData[category].types.add(product.type.trim());
      }
      
      // Extract color
      if (product.color && product.color.trim()) {
        categoryData[category].colors.add(product.color.trim());
      }
    });
    
    // Convert Sets to Arrays and sort
    const result = {};
    Object.keys(categoryData).forEach(category => {
      result[category] = {
        brands: Array.from(categoryData[category].brands).sort(),
        types: Array.from(categoryData[category].types).sort(),
        colors: Array.from(categoryData[category].colors).sort()
      };
      
      console.log(`📈 ${category}:`, {
        brands: result[category].brands.length,
        types: result[category].types.length,
        colors: result[category].colors.length
      });
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error extracting category data:', error);
    throw error;
  }
}

// Create or update category configurations
async function createCategoryConfigs(categoryData) {
  console.log('🏗️  Creating category configurations...');
  
  const results = [];
  
  for (const [categoryName, data] of Object.entries(categoryData)) {
    try {
      // Check if category config already exists
      let categoryConfig = await CategoryConfig.findOne({ categoryName: categoryName });
      
      if (categoryConfig) {
        console.log(`📝 Updating existing configuration for ${categoryName}`);
        
        // Merge existing options with new ones (avoid duplicates)
        const mergedBrands = [...new Set([...categoryConfig.availableFields.brands, ...data.brands])];
        const mergedTypes = [...new Set([...categoryConfig.availableFields.types, ...data.types])];
        const mergedColors = [...new Set([...categoryConfig.availableFields.colors, ...data.colors])];
        
        categoryConfig.availableFields = {
          brands: mergedBrands.sort(),
          types: mergedTypes.sort(),
          colors: mergedColors.sort()
        };
        
        categoryConfig.updatedAt = new Date();
        await categoryConfig.save();
      } else {
        console.log(`✨ Creating new configuration for ${categoryName}`);
        
        categoryConfig = new CategoryConfig({
          categoryName: categoryName,
          isActive: true,
          availableFields: {
            brands: data.brands,
            types: data.types,
            colors: data.colors
          }
        });
        
        await categoryConfig.save();
      }
      
      results.push({
        category: categoryName,
        brands: categoryConfig.availableFields.brands.length,
        types: categoryConfig.availableFields.types.length,
        colors: categoryConfig.availableFields.colors.length,
        status: categoryConfig ? 'updated' : 'created'
      });
      
      console.log(`✅ ${categoryName} configuration saved successfully`);
      
    } catch (error) {
      console.error(`❌ Error creating config for ${categoryName}:`, error);
      results.push({
        category: categoryName,
        error: error.message,
        status: 'failed'
      });
    }
  }
  
  return results;
}

// Main migration function
async function migrateCategories() {
  console.log('🚀 Starting category data migration...\n');
  
  try {
    await connectDB();
    
    // Extract data from existing products
    const categoryData = await extractCategoryData();
    
    // Create category configurations
    const results = await createCategoryConfigs(categoryData);
    
    // Print summary
    console.log('\n📊 Migration Summary:');
    console.log('=' .repeat(50));
    
    results.forEach(result => {
      if (result.error) {
        console.log(`❌ ${result.category}: ${result.error}`);
      } else {
        console.log(`✅ ${result.category}: ${result.brands} brands, ${result.types} types, ${result.colors} colors (${result.status})`);
      }
    });
    
    const successful = results.filter(r => !r.error).length;
    const failed = results.filter(r => r.error).length;
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migration completed: ${successful} successful, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 All categories migrated successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCategories()
    .then(() => {
      console.log('🏁 Migration process completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = {
  migrateCategories,
  extractCategoryData,
  createCategoryConfigs
};
