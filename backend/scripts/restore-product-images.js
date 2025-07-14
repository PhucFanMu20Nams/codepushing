/**
 * Script to restore product images that were lost during updates
 * This script will restore the original image data from the products.json file
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const config = require('../config/db.config');

async function restoreProductImages() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read original product data
    const productsPath = path.join(__dirname, '../data/products.json');
    const originalProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    console.log(`📂 Loaded ${originalProducts.length} original products`);

    // Find products with missing or placeholder images
    const productsInDB = await Product.find({});
    
    let restoredCount = 0;
    
    for (const dbProduct of productsInDB) {
      // Find the corresponding original product
      const originalProduct = originalProducts.find(p => p.id === dbProduct.id);
      
      if (!originalProduct) {
        console.log(`⚠️ No original data found for product: ${dbProduct.id}`);
        continue;
      }
      
      // Check if product has missing or placeholder images
      const hasPlaceholder = dbProduct.imageUrl && dbProduct.imageUrl.includes('placeholder');
      const hasNoImage = !dbProduct.imageUrl || !dbProduct.image;
      const hasEmptyGallery = !dbProduct.gallery || dbProduct.gallery.length === 0;
      
      if (hasPlaceholder || hasNoImage || hasEmptyGallery) {
        console.log(`🔧 Restoring images for product: ${dbProduct.name} (${dbProduct.id})`);
        
        // Restore images from original data
        const updateData = {
          image: originalProduct.image,
          imageUrl: originalProduct.image,
          gallery: originalProduct.gallery || [originalProduct.image],
          updatedAt: new Date()
        };
        
        await Product.findByIdAndUpdate(dbProduct._id, updateData);
        restoredCount++;
        
        console.log(`✅ Restored images for: ${dbProduct.name}`);
        console.log(`   Primary image: ${originalProduct.image}`);
        console.log(`   Gallery: ${originalProduct.gallery ? originalProduct.gallery.length : 1} images`);
      }
    }
    
    console.log(`\n📊 Restoration completed:`);
    console.log(`   Products checked: ${productsInDB.length}`);
    console.log(`   Products restored: ${restoredCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error restoring product images:', error);
    return false;
  } finally {
    await mongoose.disconnect();
    console.log('📡 MongoDB connection closed');
  }
}

// Run the restoration if this script is executed directly
if (require.main === module) {
  restoreProductImages()
    .then(success => {
      process.exit(success ? 0 : 1);
    });
}

module.exports = restoreProductImages;
