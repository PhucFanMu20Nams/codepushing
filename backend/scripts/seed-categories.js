/**
 * Category Configuration Seeding Script
 * Creates default category configurations with realistic options
 */

const mongoose = require('mongoose');
const CategoryConfig = require('../models/CategoryConfig');
require('dotenv').config();

// Default category configurations
const DEFAULT_CATEGORIES = {
  Clothes: {
    categoryName: 'Clothes',
    isActive: true,
    availableFields: {
      brands: [
        'Nike', 'Adidas', 'Uniqlo', 'Zara', 'H&M', 
        'Supreme', 'Off-White', 'Balenciaga', 'Gucci', 
        'Levi\'s', 'Calvin Klein', 'Tommy Hilfiger', 'Ralph Lauren'
      ],
      types: [
        'T-Shirt', 'Shirt', 'Polo Shirt', 'Tank Top',
        'Hoodie', 'Sweatshirt', 'Cardigan', 'Blazer',
        'Jeans', 'Trousers', 'Shorts', 'Joggers',
        'Dress', 'Skirt', 'Jacket', 'Coat'
      ],
      colors: [
        'Black', 'White', 'Gray', 'Navy', 'Blue',
        'Red', 'Green', 'Yellow', 'Pink', 'Purple',
        'Brown', 'Beige', 'Orange', 'Khaki', 'Olive'
      ]
    }
  },
  
  Footwear: {
    categoryName: 'Footwear',
    isActive: true,
    availableFields: {
      brands: [
        'Nike', 'Adidas', 'Converse', 'Vans', 'Puma',
        'New Balance', 'Jordan', 'Yeezy', 'Balenciaga',
        'Golden Goose', 'Common Projects', 'Dr. Martens',
        'Clarks', 'Timberland', 'Birkenstock'
      ],
      types: [
        'Sneakers', 'Running Shoes', 'Basketball Shoes',
        'Casual Shoes', 'Dress Shoes', 'Loafers',
        'Boots', 'Sandals', 'Flip Flops', 'Slides',
        'High Tops', 'Low Tops', 'Slip-On', 'Oxfords'
      ],
      colors: [
        'Black', 'White', 'Gray', 'Brown', 'Tan',
        'Navy', 'Blue', 'Red', 'Green', 'Yellow',
        'Pink', 'Purple', 'Orange', 'Multi-Color'
      ]
    }
  },
  
  Accessories: {
    categoryName: 'Accessories',
    isActive: true,
    availableFields: {
      brands: [
        'Louis Vuitton', 'Gucci', 'Hermès', 'Chanel',
        'Coach', 'Michael Kors', 'Kate Spade', 'Prada',
        'Ray-Ban', 'Oakley', 'Rolex', 'Apple',
        'Samsung', 'Fossil', 'Casio', 'Nixon'
      ],
      types: [
        'Handbag', 'Backpack', 'Wallet', 'Belt',
        'Watch', 'Sunglasses', 'Hat', 'Cap',
        'Scarf', 'Jewelry', 'Ring', 'Necklace',
        'Bracelet', 'Earrings', 'Phone Case', 'Keychain'
      ],
      colors: [
        'Black', 'Brown', 'Tan', 'White', 'Gray',
        'Navy', 'Blue', 'Red', 'Green', 'Pink',
        'Gold', 'Silver', 'Rose Gold', 'Multi-Color'
      ]
    }
  }
};

// Connect to MongoDB
async function connectDB() {
  try {
    // Remove deprecated options - they're no longer needed in Mongoose 6+
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/textura_db');
    console.log('✅ Connected to MongoDB for category seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Clear existing category configurations
async function clearExistingCategories(force = false) {
  console.log('🧹 Checking for existing category configurations...');
  
  const existingCount = await CategoryConfig.countDocuments();
  
  if (existingCount > 0) {
    console.log(`📊 Found ${existingCount} existing category configurations`);
    
    if (force) {
      console.log('🗑️  Force mode: Clearing existing configurations...');
      await CategoryConfig.deleteMany({});
      console.log('✅ Existing configurations cleared');
    } else {
      console.log('⚠️  Existing configurations found. Use --force to overwrite');
      return false;
    }
  } else {
    console.log('📝 No existing configurations found');
  }
  
  return true;
}

// Seed category configurations
async function seedCategories(options = {}) {
  console.log('🌱 Seeding default category configurations...');
  
  const results = [];
  
  for (const [categoryName, config] of Object.entries(DEFAULT_CATEGORIES)) {
    try {
      console.log(`🔧 Creating configuration for ${categoryName}...`);
      
      // Create new category configuration
      const categoryConfig = new CategoryConfig({
        categoryName: config.categoryName,
        isActive: config.isActive,
        availableFields: {
          brands: config.availableFields.brands.sort(),
          types: config.availableFields.types.sort(),
          colors: config.availableFields.colors.sort()
        }
      });
      
      await categoryConfig.save();
      
      results.push({
        category: categoryName,
        brands: categoryConfig.availableFields.brands.length,
        types: categoryConfig.availableFields.types.length,
        colors: categoryConfig.availableFields.colors.length,
        status: 'created'
      });
      
      console.log(`✅ ${categoryName}: ${categoryConfig.availableFields.brands.length} brands, ${categoryConfig.availableFields.types.length} types, ${categoryConfig.availableFields.colors.length} colors`);
      
    } catch (error) {
      console.error(`❌ Error seeding ${categoryName}:`, error);
      results.push({
        category: categoryName,
        error: error.message,
        status: 'failed'
      });
    }
  }
  
  return results;
}

// Validate seeded data
async function validateSeededData() {
  console.log('🔍 Validating seeded category data...');
  
  const categories = await CategoryConfig.find({}).lean();
  
  const validation = {
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.isActive).length,
    totalOptions: 0,
    categoryDetails: []
  };
  
  categories.forEach(category => {
    const brands = category.availableFields.brands.length;
    const types = category.availableFields.types.length;
    const colors = category.availableFields.colors.length;
    const total = brands + types + colors;
    
    validation.totalOptions += total;
    validation.categoryDetails.push({
      name: category.name,
      isActive: category.isActive,
      brands,
      types,
      colors,
      total
    });
  });
  
  return validation;
}

// Main seeding function
async function seedDefaultCategories(options = {}) {
  console.log('🚀 Starting category configuration seeding...\n');
  
  try {
    await connectDB();
    
    // Clear existing data if requested
    const canProceed = await clearExistingCategories(options.force);
    if (!canProceed && !options.force) {
      console.log('❌ Seeding cancelled. Use --force to overwrite existing data');
      return;
    }
    
    // Seed categories
    const results = await seedCategories(options);
    
    // Validate seeded data
    const validation = await validateSeededData();
    
    // Print summary
    console.log('\n📊 Seeding Summary:');
    console.log('='.repeat(60));
    
    results.forEach(result => {
      if (result.error) {
        console.log(`❌ ${result.category}: ${result.error}`);
      } else {
        console.log(`✅ ${result.category}: ${result.brands} brands, ${result.types} types, ${result.colors} colors`);
      }
    });
    
    console.log('\n📈 Validation Results:');
    console.log('='.repeat(60));
    console.log(`📦 Total Categories: ${validation.totalCategories}`);
    console.log(`🟢 Active Categories: ${validation.activeCategories}`);
    console.log(`🎯 Total Options: ${validation.totalOptions}`);
    
    console.log('\n📋 Category Breakdown:');
    validation.categoryDetails.forEach(cat => {
      const status = cat.isActive ? '🟢' : '🔴';
      console.log(`${status} ${cat.name}: ${cat.brands}B + ${cat.types}T + ${cat.colors}C = ${cat.total} total`);
    });
    
    const successful = results.filter(r => !r.error).length;
    const failed = results.filter(r => r.error).length;
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Seeding completed: ${successful} successful, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 All categories seeded successfully!');
      console.log('💡 Your category management system is ready to use');
    }
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
}

// Command line interface
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const options = {
    force: args.includes('--force') || args.includes('-f'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  if (options.help) {
    console.log(`
📚 Category Seeding Script Usage:

node seed-categories.js [options]

Options:
  --force, -f    Force overwrite existing category configurations
  --help,  -h    Show this help message

Examples:
  node seed-categories.js                    # Seed only if no existing data
  node seed-categories.js --force           # Force overwrite existing data
  node seed-categories.js --help            # Show help

📝 This script will create default category configurations for:
   • Clothes (${DEFAULT_CATEGORIES.Clothes.availableFields.brands.length} brands, ${DEFAULT_CATEGORIES.Clothes.availableFields.types.length} types, ${DEFAULT_CATEGORIES.Clothes.availableFields.colors.length} colors)
   • Footwear (${DEFAULT_CATEGORIES.Footwear.availableFields.brands.length} brands, ${DEFAULT_CATEGORIES.Footwear.availableFields.types.length} types, ${DEFAULT_CATEGORIES.Footwear.availableFields.colors.length} colors)
   • Accessories (${DEFAULT_CATEGORIES.Accessories.availableFields.brands.length} brands, ${DEFAULT_CATEGORIES.Accessories.availableFields.types.length} types, ${DEFAULT_CATEGORIES.Accessories.availableFields.colors.length} colors)
`);
    process.exit(0);
  }
  
  return options;
}

// Run seeding if this file is executed directly
if (require.main === module) {
  const options = parseCommandLineArgs();
  
  seedDefaultCategories(options)
    .then(() => {
      console.log('🏁 Seeding process completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDefaultCategories,
  DEFAULT_CATEGORIES,
  clearExistingCategories,
  seedCategories,
  validateSeededData
};
