const Product = require('../models/Product');

/**
 * Helper function to invalidate cache entries when products are modified
 * @param {string} productId - ID of the modified product (optional)
 */
const invalidateProductCache = (productId = null) => {
  // Cache invalidation logic can be implemented later if needed
  console.log(`Cache invalidation for product: ${productId || 'all'}`);
};

// Get all products with filtering and search
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      search, 
      brand, 
      type, 
      color, 
      style, 
      category,
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    // Filter by category
    if (category) {
      filter.category = category;
    }
    
    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by brand (handle multiple values)
    if (brand) {
      const brands = brand.split(',').map(b => b.trim());
      filter.brand = { $in: brands };
    }

    // Filter by type
    if (type) {
      const types = type.split(',').map(t => t.trim());
      filter.type = { $in: types };
    }

    // Filter by color
    if (color) {
      const colors = color.split(',').map(c => c.trim());
      filter.color = { $in: colors };
    }

    // Filter by style
    if (style) {
      const styles = style.split(',').map(s => s.trim());
      filter.style = { $in: styles };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;
    
    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
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
    const { query, page = 1, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filter = {
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } }
      ]
    };

    const skip = (page - 1) * limit;
    
    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
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
    // Try to find by MongoDB ObjectId first for backward compatibility
    let product;
    try {
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        // If it looks like an ObjectId, try finding by ID
        product = await Product.findById(req.params.id);
      }
    } catch (err) {
      // Ignore this error and continue with the next query
    }
    
    // If not found by ObjectId, try finding by string ID field
    if (!product) {
      product = await Product.findOne({ id: req.params.id });
    }
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
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
    const product = new Product(req.body);
    await product.save();
    
    invalidateProductCache();
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    invalidateProductCache(req.params.id);

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    invalidateProductCache(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
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
    const brands = await Product.distinct('brand', { isActive: true });
    
    res.json({
      success: true,
      data: brands.sort()
    });
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
    const categories = await Product.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories.sort()
    });
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
    const types = await Product.distinct('type', { isActive: true });
    
    res.json({
      success: true,
      data: types.sort()
    });
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
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalBrands = await Product.distinct('brand', { isActive: true });
    const totalCategories = await Product.distinct('category', { isActive: true });
    
    const priceStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalBrands: totalBrands.length,
        totalCategories: totalCategories.length,
        priceRange: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product statistics',
      error: error.message
    });
  }
};
