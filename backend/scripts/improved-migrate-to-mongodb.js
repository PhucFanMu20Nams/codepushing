/**
 * Improved MongoDB Migration Script
 * 
 * This script reads SQL data from data.sql and transforms it into optimized MongoDB documents,
 * embedding related entities (details, gallery, sizes) as nested arrays.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const config = require('../config/db.config');
require('dotenv').config();

// Parse SQL file to extract data (simplified parser for demonstration purposes)
function parseSqlFile(filePath) {
  console.log('📂 Reading SQL file...');
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Extract products - find the INSERT INTO products statement
    const productsSection = sqlContent.match(/INSERT INTO products[^;]+;/);
    if (!productsSection) {
      throw new Error('Could not find products data in SQL file');
    }
    
    // Extract the VALUES part from the INSERT statement
    const productsValues = productsSection[0].match(/VALUES\s+(.+);/s);
    const productsData = productsValues ? productsValues[1] : '';
    
    // Extract product details
    const detailsSection = sqlContent.match(/INSERT INTO product_details[^;]+;/);
    if (!detailsSection) {
      throw new Error('Could not find product details data in SQL file');
    }
    
    const detailsValues = detailsSection[0].match(/VALUES\s+(.+);/s);
    const detailsData = detailsValues ? detailsValues[1] : '';
    
    // Extract product images
    const imagesSection = sqlContent.match(/INSERT INTO product_images[^;]+;/);
    if (!imagesSection) {
      throw new Error('Could not find product images data in SQL file');
    }
    
    const imagesValues = imagesSection[0].match(/VALUES\s+(.+);/s);
    const imagesData = imagesValues ? imagesValues[1] : '';
    
    // Extract product sizes
    const sizesSection = sqlContent.match(/INSERT INTO product_sizes[^;]+;/);
    if (!sizesSection) {
      throw new Error('Could not find product sizes data in SQL file');
    }
    
    const sizesValues = sizesSection[0].match(/VALUES\s+(.+);/s);
    const sizesData = sizesValues ? sizesValues[1] : '';
    
    console.log('✅ Successfully parsed all sections from SQL file');
    
    return {
      productsData,
      detailsData,
      imagesData,
      sizesData
    };
  } catch (error) {
    console.error('❌ Error parsing SQL file:', error);
    throw error;
  }
}

// Parse product values from SQL INSERT statements
function parseProductValues(productsData) {
  try {
    // Split by closing parenthesis followed by comma to separate individual product entries
    const productEntries = productsData.split('),');
    console.log(`Found ${productEntries.length} product entries`);
    
    return productEntries.map((entry, index) => {
      try {
        // Clean up the entry
        let cleanEntry = entry.replace(/^\s*\(|\)$/g, '').trim();
        
        // Extract values using regex to handle quoted strings and arrays properly
        // Format is ('id', 'name', 'brand', price, 'category', 'subcategory', 'type', ARRAY['color1', 'color2'], 'image')
        const regex = /\s*'([^']*)'(?:,|\s*)\s*'([^']*)'(?:,|\s*)\s*'([^']*)'(?:,|\s*)\s*(\d+)(?:,|\s*)\s*'([^']*)'(?:,|\s*)\s*'([^']*)'(?:,|\s*)\s*'([^']*)'(?:,|\s*)\s*ARRAY\[((?:'[^']*'(?:,\s*)?)+)\](?:,|\s*)\s*'([^']*)'/;
        
        const match = cleanEntry.match(regex);
        
        if (!match) {
          console.error(`❌ Failed to parse product entry ${index + 1}:`, cleanEntry);
          return null;
        }
        
        const id = match[1];
        const name = match[2];
        const brand = match[3];
        const price = parseInt(match[4], 10) / 10000; // Convert to USD equivalent
        const category = match[5];
        const subcategory = match[6];
        const type = match[7];
        
        // Parse colors array - format is: 'color1', 'color2'
        const colorsStr = match[8];
        const colorsMatches = colorsStr.match(/'([^']+)'/g);
        const colors = colorsMatches ? colorsMatches.map(c => c.replace(/'/g, '')) : [];
        
        const image = match[9];
        
        return {
          id,
          name,
          brand,
          price,
          category,
          subcategory,
          type,
          colors,
          image
        };
      } catch (err) {
        console.error(`❌ Error parsing product ${index + 1}:`, err);
        return null;
      }
    }).filter(product => product !== null); // Filter out any null products from failed parsing
  } catch (error) {
    console.error('❌ Error parsing product values:', error);
    return [];
  }
}

// Parse product details from SQL INSERT statements
function parseProductDetails(detailsData) {
  try {
    const detailEntries = detailsData.split('),');
    console.log(`Found ${detailEntries.length} product detail entries`);
    
    const details = [];
    
    detailEntries.forEach((entry, index) => {
      try {
        const cleanEntry = entry.replace(/^\s*\(|\)$/g, '').trim();
        
        // Format is ('productId', 'detail')
        const match = cleanEntry.match(/'([^']+)',\s*'([^']+)'/);
        
        if (match) {
          details.push({
            productId: match[1],
            detail: match[2]
          });
        } else {
          console.error(`❌ Failed to parse detail entry ${index + 1}:`, cleanEntry);
        }
      } catch (err) {
        console.error(`❌ Error parsing detail ${index + 1}:`, err);
      }
    });
    
    return details;
  } catch (error) {
    console.error('❌ Error parsing product details:', error);
    return [];
  }
}

// Parse product images from SQL INSERT statements
function parseProductImages(imagesData) {
  try {
    const imageEntries = imagesData.split('),');
    console.log(`Found ${imageEntries.length} product image entries`);
    
    const images = [];
    
    imageEntries.forEach((entry, index) => {
      try {
        const cleanEntry = entry.replace(/^\s*\(|\)$/g, '').trim();
        
        // Format is ('productId', 'imageUrl')
        const match = cleanEntry.match(/'([^']+)',\s*'([^']+)'/);
        
        if (match) {
          images.push({
            productId: match[1],
            imageUrl: match[2]
          });
        } else {
          console.error(`❌ Failed to parse image entry ${index + 1}:`, cleanEntry);
        }
      } catch (err) {
        console.error(`❌ Error parsing image ${index + 1}:`, err);
      }
    });
    
    return images;
  } catch (error) {
    console.error('❌ Error parsing product images:', error);
    return [];
  }
}

// Parse product sizes from SQL INSERT statements
function parseProductSizes(sizesData) {
  try {
    const sizeEntries = sizesData.split('),');
    console.log(`Found ${sizeEntries.length} product size entries`);
    
    const sizes = [];
    
    sizeEntries.forEach((entry, index) => {
      try {
        const cleanEntry = entry.replace(/^\s*\(|\)$/g, '').trim();
        
        // Format is ('productId', 'size')
        const match = cleanEntry.match(/'([^']+)',\s*'([^']+)'/);
        
        if (match) {
          sizes.push({
            productId: match[1],
            size: match[2]
          });
        } else {
          console.error(`❌ Failed to parse size entry ${index + 1}:`, cleanEntry);
        }
      } catch (err) {
        console.error(`❌ Error parsing size ${index + 1}:`, err);
      }
    });
    
    return sizes;
  } catch (error) {
    console.error('❌ Error parsing product sizes:', error);
    return [];
  }
}

// Create MongoDB-optimized documents from parsed SQL data
function createMongodbDocuments(products, details, images, sizes) {
  const productMap = new Map();
  
  // Initialize product documents
  products.forEach(product => {
    const { id, name, brand, price, category, type, colors, image } = product;
    
    productMap.set(id, {
      name,
      description: '', // Will be filled with details
      price,
      brand,
      category: category === 'Clothes' ? 'Clothing' : category, // Fix category name
      type,
      color: colors[0], // Primary color
      style: product.subcategory || 'Classic', // Use subcategory as style or default to 'Classic'
      imageUrl: image,
      details: [],
      gallery: [],
      sizes: []
    });
  });
  
  // Group details by product
  const detailsByProduct = {};
  details.forEach(detail => {
    if (!detailsByProduct[detail.productId]) {
      detailsByProduct[detail.productId] = [];
    }
    detailsByProduct[detail.productId].push(detail.detail);
  });
  
  // Add details to products (combine them into a description)
  for (const [productId, detailsList] of Object.entries(detailsByProduct)) {
    const product = productMap.get(productId);
    if (product) {
      product.description = detailsList.join(' ');
    }
  }
  
  // Add images to products
  images.forEach(img => {
    const product = productMap.get(img.productId);
    if (product) {
      // Check if this is the primary image
      const isPrimary = img.imageUrl === product.imageUrl;
      product.gallery.push({
        imageUrl: img.imageUrl,
        altText: `${product.name} - ${isPrimary ? 'Main' : 'Detail'}`,
        isPrimary
      });
    }
  });
  
  // Group sizes by product
  const sizesByProduct = {};
  sizes.forEach(size => {
    if (!sizesByProduct[size.productId]) {
      sizesByProduct[size.productId] = [];
    }
    sizesByProduct[size.productId].push(size.size);
  });
  
  // Add sizes to products
  for (const [productId, sizesList] of Object.entries(sizesByProduct)) {
    const product = productMap.get(productId);
    if (product) {
      // Add sizes to product.sizes array
      sizesList.forEach(size => {
        product.sizes.push({
          size,
          isAvailable: true
        });
        
        // Also add to details with a random stock amount
        product.details.push({
          size,
          stock: Math.floor(Math.random() * 30) + 10,  // Random stock between 10-40
          sku: `${product.brand.substring(0, 3).toUpperCase()}-${productId.substring(2)}-${size}`
        });
      });
    }
  }
  
  return Array.from(productMap.values());
}

// Save the MongoDB documents
async function saveToMongoDB(documents) {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Product.deleteMany({});
    await Admin.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Insert transformed products
    await Product.insertMany(documents);
    console.log(`📦 Inserted ${documents.length} products with embedded details, gallery and sizes`);
    
    // Save data to JSON file for backup
    fs.writeFileSync(
      path.join(__dirname, '../data/products.json'),
      JSON.stringify(documents, null, 2),
      'utf8'
    );
    console.log('💾 Saved products data to JSON file for backup');
    
    // Create admin user
    const admin = new Admin({
      username: 'Teekayyj',
      password: 'AdminTuanKiet', // Will be hashed by pre-save hook
      email: 'admin@textura.com',
      isActive: true
    });
    await admin.save();
    console.log('👤 Created admin user');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('📋 Admin Credentials:');
    console.log(`\n📊 Database Statistics:`);
    console.log(`   Products: ${documents.length}`);
    console.log(`   Admins: 1`);
    console.log(`   Total Documents: ${documents.length + 1}`);
    console.log(`\n🔍 Products with embedded arrays for:`);
    console.log(`   • Product details: ${documents.reduce((acc, doc) => acc + doc.details.length, 0)} items`);
    console.log(`   • Product images: ${documents.reduce((acc, doc) => acc + doc.gallery.length, 0)} items`);
    console.log(`   • Product sizes: ${documents.reduce((acc, doc) => acc + doc.sizes.length, 0)} items`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📄 Disconnected from MongoDB');
  }
}

// Main function to run the migration
async function migrateFromSqlToMongoDB() {
  console.log('🚀 Starting SQL to MongoDB migration...');
  
  // 1. Parse SQL file
  const sqlPath = path.join(__dirname, '../data/data.sql');
  const sqlData = parseSqlFile(sqlPath);
  
  // 2. Parse individual data sections
  const products = parseProductValues(sqlData.productsData);
  const details = parseProductDetails(sqlData.detailsData);
  const images = parseProductImages(sqlData.imagesData);
  const sizes = parseProductSizes(sqlData.sizesData);
  
  console.log(`🔢 Parsed data: ${products.length} products, ${details.length} details, ${images.length} images, ${sizes.length} sizes`);
  
  // 3. Transform into MongoDB documents
  const mongoDocuments = createMongodbDocuments(products, details, images, sizes);
  console.log(`🧩 Created ${mongoDocuments.length} MongoDB-optimized documents with embedded arrays`);
  
  // 4. Save to MongoDB
  await saveToMongoDB(mongoDocuments);
}

// Run the migration
migrateFromSqlToMongoDB().catch(console.error);
