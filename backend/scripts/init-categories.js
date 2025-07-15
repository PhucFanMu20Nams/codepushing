/**
 * Category System Initialization Script
 * Combines migration and seeding for complete category setup
 */

const mongoose = require('mongoose');
const { migrateCategories } = require('./migrate-categories');
const { seedDefaultCategories } = require('./seed-categories');
require('dotenv').config();

// Main initialization function
async function initializeCategorySystem(options = {}) {
  console.log('🎯 Initializing Category Management System...\n');
  
  try {
    if (options.seedOnly) {
      console.log('🌱 Running seed-only mode...');
      await seedDefaultCategories(options);
    } else if (options.migrateOnly) {
      console.log('📦 Running migration-only mode...');
      await migrateCategories();
    } else {
      console.log('🔄 Running full initialization (migration + seeding)...');
      
      // Step 1: Try migration first (from existing product data)
      console.log('\n📊 Step 1: Migrating from existing product data...');
      try {
        await migrateCategories();
        console.log('✅ Migration completed successfully');
      } catch (error) {
        console.log('⚠️  Migration failed or no existing data found');
        console.log('🌱 Falling back to default seeding...');
        
        // Step 2: If migration fails, use default seeding
        await seedDefaultCategories({ force: options.force });
      }
    }
    
    console.log('\n🎉 Category system initialization completed!');
    console.log('💡 Your dynamic category management is ready to use');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    throw error;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  const options = {
    force: args.includes('--force') || args.includes('-f'),
    seedOnly: args.includes('--seed-only'),
    migrateOnly: args.includes('--migrate-only'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  if (options.help) {
    console.log(`
🎯 Category System Initialization

Usage: node init-categories.js [options]

Options:
  --seed-only       Only run seeding (create default categories)
  --migrate-only    Only run migration (extract from existing products)
  --force, -f       Force overwrite existing configurations
  --help, -h        Show this help message

Modes:
  Default           Try migration first, fallback to seeding if needed
  --seed-only       Skip migration, only create default categories
  --migrate-only    Only extract categories from existing products

Examples:
  node init-categories.js                    # Full initialization
  node init-categories.js --seed-only       # Only create defaults
  node init-categories.js --migrate-only    # Only migrate from products
  node init-categories.js --force           # Force overwrite existing data

🔧 This script will set up your dynamic category management system
   with realistic brand, type, and color options for each category.
`);
    process.exit(0);
  }
  
  return options;
}

// Run initialization if this file is executed directly
if (require.main === module) {
  const options = parseArgs();
  
  initializeCategorySystem(options)
    .then(() => {
      console.log('🏁 Category system initialization completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Category system initialization failed:', error);
      process.exit(1);
    });
}

module.exports = {
  initializeCategorySystem
};
