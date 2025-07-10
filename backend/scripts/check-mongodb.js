const mongoose = require('mongoose');
const config = require('../config/db.config');

async function checkMongoDBConnection() {
  try {
    console.log('🔍 Checking MongoDB connection...');
    console.log('📍 URI:', config.MONGODB_URI);
    
    await mongoose.connect(config.MONGODB_URI);
    
    console.log('✅ MongoDB connection established successfully!');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Check if we have any data
    const productCount = await mongoose.connection.db.collection('products').countDocuments();
    const adminCount = await mongoose.connection.db.collection('admins').countDocuments();
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Admins: ${adminCount}`);
    
    if (productCount === 0) {
      console.log('\n⚠️  No products found. Run migration script:');
      console.log('   npm run migrate');
    }
    
    if (adminCount === 0) {
      console.log('\n⚠️  No admin users found. Run migration script:');
      console.log('   npm run migrate');
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Check your connection string in the .env file');
    console.log('3. Verify MongoDB service is running on the correct port');
    console.log('4. For Windows: Start MongoDB service or run mongod.exe');
    console.log('5. For macOS: brew services start mongodb/brew/mongodb-community');
    console.log('6. For Linux: sudo systemctl start mongod');
    return false;
  } finally {
    await mongoose.disconnect();
  }
}

checkMongoDBConnection();
