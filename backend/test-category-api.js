const express = require('express');
const cors = require('cors');

// Test server to verify the new API endpoints
const app = express();
app.use(cors());
app.use(express.json());

// Import the product controller
const productController = require('./controllers/productController');

// Test routes
app.get('/api/products/field-options', productController.getFieldOptions);
app.get('/api/products/category-options', productController.getAllCategoryOptions);
app.get('/api/products/category-options/:category', productController.getCategorySpecificOptions);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Testing new category-specific API endpoints...');
  
  // Test the endpoints
  setTimeout(async () => {
    try {
      // Test getAllCategoryOptions
      console.log('\n--- Testing getAllCategoryOptions ---');
      const response1 = await fetch('http://localhost:5001/api/products/category-options');
      const result1 = await response1.json();
      console.log('All Category Options:', JSON.stringify(result1, null, 2));
      
      // Test getCategorySpecificOptions for Clothing
      console.log('\n--- Testing getCategorySpecificOptions for Clothing ---');
      const response2 = await fetch('http://localhost:5001/api/products/category-options/Clothing');
      const result2 = await response2.json();
      console.log('Clothing Options:', JSON.stringify(result2, null, 2));
      
      // Test getCategorySpecificOptions for Footwear
      console.log('\n--- Testing getCategorySpecificOptions for Footwear ---');
      const response3 = await fetch('http://localhost:5001/api/products/category-options/Footwear');
      const result3 = await response3.json();
      console.log('Footwear Options:', JSON.stringify(result3, null, 2));
      
    } catch (error) {
      console.error('Test failed:', error);
    }
  }, 1000);
});

module.exports = app;
