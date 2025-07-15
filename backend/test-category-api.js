const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('./config/db.config');

async function testCategoryAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get a category to test with
    const CategoryConfig = require('./models/CategoryConfig');
    const category = await CategoryConfig.findOne({ categoryName: 'Accessories' });
    
    if (!category) {
      console.log('✗ Accessories category not found');
      return;
    }
    
    console.log('✓ Found category:', category.categoryName, 'with ID:', category._id);
    console.log('Current types:', category.availableFields.types);

    // Simulate the addOptionToCategoryService function
    const { addOptionToCategoryService } = require('./services/categoryServices');
    
    try {
      const result = await addOptionToCategoryService(category._id, 'types', 'YSL');
      console.log('✓ Successfully added option:', result);
    } catch (error) {
      console.log('✗ Error adding option:', error.message);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    console.log('Stack:', error.stack);
  }
}

testCategoryAPI();
