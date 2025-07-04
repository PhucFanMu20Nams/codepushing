const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const uploadMiddleware = require('../middleware/upload.middleware');
const { verifyToken } = require('../controllers/authController');

// Public routes (no authentication needed)
// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/search - Search products
router.get('/search', productController.searchProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// Protected routes (authentication required)
// POST /api/products - Create new product
router.post('/', verifyToken, productController.createProduct);

// POST /api/products/upload - Upload product with images
router.post('/upload', verifyToken, uploadMiddleware.uploadProductImages, productController.uploadProductWithImages);

// PUT /api/products/:id - Update a product
router.put('/:id', verifyToken, productController.updateProduct);

// PATCH /api/products/:id - Partially update a product
router.patch('/:id', verifyToken, productController.partialUpdateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;

/* 
Example using fetch in JavaScript:

fetch('http://localhost:5000/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "id": "casual-oxford-shirt",
    "name": "Casual Oxford Shirt",
    "brand": "Brooks Brothers",
    "price": 450000,
    "category": "Men",
    "subcategory": "Shirt",
    "type": "Casual shirt",
    "image": "/images/products/casual-oxford-shirt.jpg",
    "gallery": [
      "/images/products/casual-oxford-shirt.jpg",
      "/images/products/casual-oxford-shirt-2.jpg"
    ],
    "sizes": ["S", "M", "L", "XL"],
    "details": [
      "Relaxed fit oxford cotton shirt.",
      "Button-down collar with front pocket.",
      "Machine washable."
    ]
  })
})
.then(response => response.json())
.then(data => console.log(data));
*/