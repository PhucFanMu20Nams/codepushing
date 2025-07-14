// Import services, validators, and helpers
const {
  getProductsWithFilters,
  searchProductsByQuery,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  getBrandsService,
  getCategoriesService,
  getTypesService,
  getProductStatsService,
  uploadProductWithImagesService,
  updateProductWithImagesService,
  getFieldOptionsService,
  getCategorySpecificOptionsService,
  getAllCategoryOptionsService
} = require('../services/productServices');

const {
  handleValidationError,
  validateProductCreation,
  validateProductUpload,
  validateSearchQuery
} = require('../validators/productValidators');

// Get all products with filtering and search
exports.getAllProducts = async (req, res) => {
  try {
    const result = await getProductsWithFilters(req.query);
    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    // Validate search query
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const result = await searchProductsByQuery(req.query);
    res.json(result);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    console.log('getProductById called with id:', req.params.id);
    
    const result = await getProductByIdService(req.params.id);
    
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    // Validate required fields
    const validation = validateProductCreation(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const result = await createProductService(req.body);
    
    if (!result.success) {
      return res.status(result.statusCode || 400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating product:', error);
    const errorResponse = handleValidationError(error);
    res.status(400).json(errorResponse);
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    console.log('=== UPDATE PRODUCT BACKEND DEBUG ===');
    console.log('Request params ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('====================================');
    
    const result = await updateProductService(req.params.id, req.body);
    
    if (!result.success) {
      console.log('Product not found with ID:', req.params.id);
      return res.status(result.statusCode || 400).json(result);
    }

    console.log('Product updated successfully:', result.data.name);
    res.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    const errorResponse = handleValidationError(error);
    res.status(400).json(errorResponse);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const result = await deleteProductService(req.params.id);
    
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Get all unique brands
exports.getBrands = async (req, res) => {
  try {
    const result = await getBrandsService();
    res.json(result);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
};

// Get all unique categories
exports.getCategories = async (req, res) => {
  try {
    const result = await getCategoriesService();
    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get all unique types
exports.getTypes = async (req, res) => {
  try {
    const result = await getTypesService();
    res.json(result);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching types',
      error: error.message
    });
  }
};

// Get product statistics
exports.getProductStats = async (req, res) => {
  try {
    const result = await getProductStatsService();
    res.json(result);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product statistics',
      error: error.message
    });
  }
};

// Upload product with images (enhanced version)
exports.uploadProductWithImages = async (req, res) => {
  try {
    // Validate required fields
    const validation = validateProductUpload(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const result = await uploadProductWithImagesService(req.body, req.files);
    
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error uploading product:', error);
    const errorResponse = handleValidationError(error);
    res.status(500).json(errorResponse);
  }
};

// Update product with images (enhanced version)
exports.updateProductWithImages = async (req, res) => {
  try {
    const result = await updateProductWithImagesService(req.params.id, req.body, req.files);
    
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating product with images:', error);
    const errorResponse = handleValidationError(error);
    res.status(500).json(errorResponse);
  }
};

// Get unique values for dropdown options
exports.getFieldOptions = async (req, res) => {
  console.log('getFieldOptions endpoint called');
  try {
    const fieldOptions = await getFieldOptionsService();
    console.log('Field options:', fieldOptions);
    res.json({
      success: true,
      data: fieldOptions
    });
  } catch (error) {
    console.error('Error fetching field options:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch field options',
      error: error.message 
    });
  }
};

// Get category-specific field options for dynamic filtering
exports.getCategorySpecificOptions = async (req, res) => {
  console.log('getCategorySpecificOptions endpoint called with category:', req.params.category);
  try {
    const result = await getCategorySpecificOptionsService(req.params.category);
    
    if (!result.success) {
      return res.status(result.statusCode || 400).json(result);
    }
    
    console.log('Category-specific options:', result.data);
    res.json(result);
  } catch (error) {
    console.error('Error fetching category-specific options:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch category-specific options',
      error: error.message 
    });
  }
};

// Get all categories with their specific options
exports.getAllCategoryOptions = async (req, res) => {
  console.log('getAllCategoryOptions endpoint called');
  try {
    const result = await getAllCategoryOptionsService();
    console.log('All category options fetched successfully');
    res.json(result);
  } catch (error) {
    console.error('Error fetching all category options:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch all category options',
      error: error.message 
    });
  }
};
