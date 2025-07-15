const express = require('express');
const mongoose = require('mongoose');

// Load the complete backend setup
require('dotenv').config();
const db = require('./models');

async function testHTTPRequest() {
  try {
    // Connect to database
    await db.connectDB();
    console.log('✓ Connected to database');

    // Simulate the exact request that frontend is making
    const categoryController = require('./controllers/categoryController');
    const authMiddleware = require('./middleware/auth.middleware');

    // Get category ID first
    const CategoryConfig = require('./models/CategoryConfig');
    const category = await CategoryConfig.findOne({ categoryName: 'Accessories' });
    const categoryId = category._id.toString();
    
    console.log('✓ Category ID:', categoryId);

    // Create mock request and response objects
    const mockReq = {
      params: { categoryId: categoryId },
      body: { field: 'types', option: 'TestBrand' },
      headers: {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzYyMmIwOWFmYmMwMmI2YmEyZDc1MSIsInVzZXJuYW1lIjoiVGVla2F5eWoiLCJpYXQiOjE3NTI1NzQ5OTQsImV4cCI6MTc1MjY2MTM5NH0.MzxGTqgPVQ6nbPUONaOZJV2X1bdKhsQqrzUob4oL2W4'
      }
    };

    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log('Response status:', this.statusCode);
        console.log('Response data:', JSON.stringify(data, null, 2));
        return this;
      }
    };

    // Test authentication middleware first
    console.log('Testing authentication middleware...');
    
    const mockNext = () => {
      console.log('✓ Authentication passed');
      
      // Now test the controller
      console.log('Testing addOptionToCategory controller...');
      categoryController.addOptionToCategory(mockReq, mockRes);
    };

    authMiddleware.authenticateAdmin(mockReq, mockRes, mockNext);

  } catch (error) {
    console.log('✗ Test failed:', error.message);
    console.log('Stack:', error.stack);
  }
}

testHTTPRequest();
