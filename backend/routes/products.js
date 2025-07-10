const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public routes only for testing
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
