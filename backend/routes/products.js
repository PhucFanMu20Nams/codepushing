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

// Admin route for uploading products with images
router.post('/upload', authenticateAdmin, upload.array('images', 10), productController.uploadProductWithImages);

module.exports = router;
