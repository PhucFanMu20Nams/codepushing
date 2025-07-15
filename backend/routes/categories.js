const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryByName,
  createOrUpdateCategory,
  updateCategoryOptions,
  addOptionToCategory,
  removeOptionFromCategory,
  toggleCategoryStatus,
  initializeDefaultCategories
} = require('../controllers/categoryController');
const { authenticateAdmin } = require('../middleware/auth.middleware');

// Get all categories
router.get('/', getAllCategories);

// Get specific category with options
router.get('/:categoryName', getCategoryByName);

// Get specific category field options
router.get('/:categoryName/options/:field', getCategoryByName);

// Create or update category configuration (Admin only)
router.post('/', authenticateAdmin, createOrUpdateCategory);

// Update category options (Admin only)
router.put('/:categoryName', authenticateAdmin, updateCategoryOptions);

// Add option to specific category field (Admin only) - ID-based
router.post('/:categoryId/options', authenticateAdmin, addOptionToCategory);

// Remove option from specific category field (Admin only) - ID-based  
router.delete('/:categoryId/options', authenticateAdmin, removeOptionFromCategory);

// Add option to specific category field (Admin only) - Name-based (legacy)
router.post('/:categoryName/options/:field', authenticateAdmin, addOptionToCategory);

// Remove option from specific category field (Admin only) - Name-based (legacy)
router.delete('/:categoryName/options/:field/:option', authenticateAdmin, removeOptionFromCategory);

// Toggle category active status (Admin only)
router.patch('/:categoryName/toggle', authenticateAdmin, toggleCategoryStatus);

// Initialize default categories (Admin only)
router.post('/initialize', authenticateAdmin, initializeDefaultCategories);

module.exports = router;
