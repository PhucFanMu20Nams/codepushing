const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes - No authentication required
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/field-options', productController.getFieldOptions);
router.get('/category-options', productController.getAllCategoryOptions);
router.get('/category-options/:category', productController.getCategorySpecificOptions);
router.get('/brands', productController.getBrands);
router.get('/categories', productController.getCategories);
router.get('/types', productController.getTypes);
router.get('/stats', productController.getProductStats);
router.get('/:id', productController.getProductById);

// Admin-only routes - Authentication required
router.post('/', authenticateAdmin, productController.createProduct);
router.put('/:id', authenticateAdmin, productController.updateProduct);
router.put('/:id/images', authenticateAdmin, upload.array('images', 10), productController.updateProductWithImages);
router.delete('/:id', authenticateAdmin, productController.deleteProduct);

// Debug route for testing image uploads
router.post('/debug/upload-test', authenticateAdmin, upload.array('images', 10), (req, res) => {
  try {
    console.log('Debug upload test - Body:', Object.keys(req.body));
    console.log('Debug upload test - Files:', req.files ? req.files.length : 0);
    console.log('Debug upload test - File details:', req.files ? req.files.map(f => ({
      filename: f.filename,
      originalname: f.originalname,
      size: f.size,
      mimetype: f.mimetype
    })) : 'No files');
    
    res.json({
      success: true,
      message: 'Debug upload test successful',
      body: req.body,
      files: req.files ? req.files.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
        mimetype: f.mimetype
      })) : []
    });
  } catch (error) {
    console.error('Debug upload test error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug upload test failed',
      error: error.message
    });
  }
});

// Admin route for uploading products with images
router.post('/upload', authenticateAdmin, upload.array('images', 10), productController.uploadProductWithImages);

module.exports = router;
