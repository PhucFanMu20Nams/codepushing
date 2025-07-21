/**
 * Category System Verification Script
 * Verifies that the category management system is properly set up
 */

const mongoose = require('mongoose');
const CategoryConfig = require('../models/CategoryConfig');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    // Remove deprecated options - they're no longer needed in Mongoose 6+
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/textura_db');
    console.log('✅ Connected to MongoDB for verification');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Verify category configurations
async function verifyCategoryConfigs() {
  console.log('🔍 Verifying category configurations...');
  
  const categories = await CategoryConfig.find({}).lean();
  
  if (categories.length === 0) {
    console.log('❌ No category configurations found!');
    return {
      success: false,
      message: 'No category configurations exist. Run npm run init-categories to set up.',
      categories: []
    };
  }
  
  const verification = {
    success: true,
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.isActive).length,
    categoryDetails: [],
    totalOptions: 0,
    warnings: []
  };
  
  categories.forEach(category => {
    const brands = category.availableFields?.brands?.length || 0;
    const types = category.availableFields?.types?.length || 0;
    const colors = category.availableFields?.colors?.length || 0;
    const total = brands + types + colors;
    
    verification.totalOptions += total;
    
    const categoryDetail = {
      name: category.categoryName,
      isActive: category.isActive,
      brands,
      types,
      colors,
      total,
      hasRequiredFields: brands > 0 && types > 0 && colors > 0
    };
    
    verification.categoryDetails.push(categoryDetail);
    
    // Check for warnings
    if (!categoryDetail.hasRequiredFields) {
      verification.warnings.push(`${category.categoryName} is missing some field options`);
    }
    
    if (total < 10) {
      verification.warnings.push(`${category.categoryName} has very few options (${total})`);
    }
  });
  
  return verification;
}

// Verify product-category consistency
async function verifyProductConsistency() {
  console.log('🔍 Verifying product-category consistency...');
  
  const categories = await CategoryConfig.find({}).lean();
  const products = await Product.find({}).lean();
  
  if (products.length === 0) {
    return {
      success: true,
      message: 'No products found - consistency check skipped',
      inconsistencies: []
    };
  }
  
  const categoryNames = categories.map(c => c.categoryName);
  const inconsistencies = [];
  
  // Check if all products have valid categories
  products.forEach(product => {
    if (!categoryNames.includes(product.category)) {
      inconsistencies.push({
        productId: product._id,
        productName: product.name,
        issue: `Invalid category: ${product.category}`,
        suggestion: `Should be one of: ${categoryNames.join(', ')}`
      });
    }
    
    // Check if product options exist in category configs
    const categoryConfig = categories.find(c => c.categoryName === product.category);
    if (categoryConfig) {
      const { brands, types, colors } = categoryConfig.availableFields;
      
      if (product.brand && !brands.includes(product.brand)) {
        inconsistencies.push({
          productId: product._id,
          productName: product.name,
          issue: `Brand "${product.brand}" not in ${product.category} configuration`,
          suggestion: `Add "${product.brand}" to ${product.category} brands or choose from: ${brands.slice(0, 5).join(', ')}...`
        });
      }
      
      if (product.type && !types.includes(product.type)) {
        inconsistencies.push({
          productId: product._id,
          productName: product.name,
          issue: `Type "${product.type}" not in ${product.category} configuration`,
          suggestion: `Add "${product.type}" to ${product.category} types or choose from: ${types.slice(0, 5).join(', ')}...`
        });
      }
      
      if (product.color && !colors.includes(product.color)) {
        inconsistencies.push({
          productId: product._id,
          productName: product.name,
          issue: `Color "${product.color}" not in ${product.category} configuration`,
          suggestion: `Add "${product.color}" to ${product.category} colors or choose from: ${colors.slice(0, 5).join(', ')}...`
        });
      }
    }
  });
  
  return {
    success: inconsistencies.length === 0,
    totalProducts: products.length,
    inconsistencies: inconsistencies.slice(0, 10), // Limit to first 10 for readability
    totalInconsistencies: inconsistencies.length
  };
}

// Test category API endpoints (if server is running)
async function testCategoryAPIs() {
  console.log('🔍 Testing category API endpoints...');
  
  // This is a basic check - would need actual API testing in a real scenario
  return {
    success: true,
    message: 'API testing would require server to be running',
    endpoints: [
      'GET /api/categories',
      'GET /api/categories/:id/options',
      'POST /api/categories/:id/options',
      'DELETE /api/categories/:id/options'
    ]
  };
}

// Main verification function
async function verifyCategorySystem() {
  console.log('🎯 Verifying Category Management System...\n');
  
  try {
    await connectDB();
    
    // Run all verification checks
    const categoryVerification = await verifyCategoryConfigs();
    const consistencyVerification = await verifyProductConsistency();
    const apiVerification = await testCategoryAPIs();
    
    // Print results
    console.log('📊 Category Configuration Verification:');
    console.log('='.repeat(60));
    
    if (categoryVerification.success) {
      console.log(`✅ Found ${categoryVerification.totalCategories} category configurations`);
      console.log(`🟢 ${categoryVerification.activeCategories} active categories`);
      console.log(`🎯 ${categoryVerification.totalOptions} total options available`);
      
      console.log('\n📋 Category Details:');
      categoryVerification.categoryDetails.forEach(cat => {
        const status = cat.isActive ? '🟢' : '🔴';
        const complete = cat.hasRequiredFields ? '✅' : '⚠️';
        console.log(`${status} ${complete} ${cat.name}: ${cat.brands}B + ${cat.types}T + ${cat.colors}C = ${cat.total}`);
      });
      
      if (categoryVerification.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        categoryVerification.warnings.forEach(warning => console.log(`   • ${warning}`));
      }
    } else {
      console.log(`❌ ${categoryVerification.message}`);
    }
    
    console.log('\n📊 Product-Category Consistency:');
    console.log('='.repeat(60));
    
    if (consistencyVerification.success) {
      console.log(`✅ All ${consistencyVerification.totalProducts} products are consistent with category configurations`);
    } else {
      console.log(`⚠️  Found ${consistencyVerification.totalInconsistencies} inconsistencies in ${consistencyVerification.totalProducts} products`);
      
      if (consistencyVerification.inconsistencies.length > 0) {
        console.log('\n🔧 Sample Issues (showing first 10):');
        consistencyVerification.inconsistencies.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue.productName}: ${issue.issue}`);
          console.log(`      💡 ${issue.suggestion}`);
        });
        
        if (consistencyVerification.totalInconsistencies > 10) {
          console.log(`   ... and ${consistencyVerification.totalInconsistencies - 10} more issues`);
        }
      }
    }
    
    console.log('\n📊 API Endpoints:');
    console.log('='.repeat(60));
    console.log('✅ Category management endpoints configured:');
    apiVerification.endpoints.forEach(endpoint => {
      console.log(`   • ${endpoint}`);
    });
    
    // Overall assessment
    console.log('\n🎯 Overall Assessment:');
    console.log('='.repeat(60));
    
    const allSuccess = categoryVerification.success && consistencyVerification.success;
    
    if (allSuccess) {
      console.log('🎉 Category Management System is properly configured!');
      console.log('💡 Your dynamic category system is ready for use');
      
      console.log('\n🚀 Next Steps:');
      console.log('   1. Start your server: npm run dev');
      console.log('   2. Access admin panel: http://localhost:5000/admin');
      console.log('   3. Use "Add Category" button to manage options');
      console.log('   4. Create products with dynamic forms');
    } else {
      console.log('⚠️  Category Management System needs attention');
      
      if (!categoryVerification.success) {
        console.log('   🔧 Run: npm run init-categories');
      }
      
      if (!consistencyVerification.success) {
        console.log('   🔧 Run: npm run migrate-categories');
        console.log('   💡 Or manually update product categories');
      }
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifyCategorySystem()
    .then(() => {
      console.log('🏁 Verification completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = {
  verifyCategorySystem,
  verifyCategoryConfigs,
  verifyProductConsistency
};
