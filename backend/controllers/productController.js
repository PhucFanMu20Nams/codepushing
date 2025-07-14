const Product = require('../models/Product');

/**
 * Helper function to invalidate cache entries when products are modified
 * @param {string} productId - ID of the modified product (optional)
 */
const invalidateProductCache = (productId = null) => {
  console.log(`🗑️ Cache invalidation for product: ${productId || 'all'}`);
  // Enhanced cache invalidation logic can be implemented here
  // This ensures real-time updates are reflected immediately
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
  console.log('getProductById called with id:', req.params.id);
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
    const {
      id,
      name,
      brand,
      price,
      category,
      subcategory,
      type,
      color,
      style,
      description,
      imageUrl,
      image,
      gallery,
      sizes,
      details
    } = req.body;

    // Validation
    if (!name || !brand || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, brand, price, category'
      });
    }

    // Check if product with this ID already exists (if ID is provided)
    if (id) {
      const existingProduct = await Product.findOne({ id });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this ID already exists'
        });
      }
    }

    // Create product data
    const productData = {
      ...(id && { id }),
      name,
      brand,
      price: parseFloat(price),
      category,
      subcategory,
      type,
      color,
      style,
      description,
      imageUrl,
      image,
      gallery: gallery || [],
      sizes: sizes || [],
      details: details || [],
      isActive: true
    };

    const product = new Product(productData);
    await product.save();
    
    invalidateProductCache();
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    
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
    console.log('=== UPDATE PRODUCT BACKEND DEBUG ===');
    console.log('Request params ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('====================================');
    
    // Find product by MongoDB ObjectId or custom id field
    let product;
    
    // First try to find by MongoDB ObjectId (24-char hex string)
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        product = await Product.findById(req.params.id);
        console.log('Found product by ObjectId:', product ? 'Yes' : 'No');
      } catch (err) {
        console.log('ObjectId lookup failed:', err.message);
      }
    }
    
    // If not found by ObjectId, try finding by custom id field
    if (!product) {
      try {
        product = await Product.findOne({ id: req.params.id });
        console.log('Found product by custom id field:', product ? 'Yes' : 'No');
      } catch (err) {
        console.log('Custom ID lookup failed:', err.message);
      }
    }
    
    // If still not found, try a broader search
    if (!product) {
      try {
        // Try to find by any id-related field
        product = await Product.findOne({
          $or: [
            { _id: req.params.id },
            { id: req.params.id },
            { 'id': { $regex: new RegExp(req.params.id, 'i') } }
          ]
        });
        console.log('Found product by broader search:', product ? 'Yes' : 'No');
      } catch (err) {
        console.log('Broader search failed:', err.message);
      }
    }

    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      
      // Let's see what products exist for debugging
      const allProducts = await Product.find({}).select('_id id name').limit(5);
      console.log('Available products (first 5):', allProducts);
      
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        debug: {
          searchedId: req.params.id,
          availableProducts: allProducts.map(p => ({ _id: p._id, id: p.id, name: p.name }))
        }
      });
    }

    console.log('Found product:', { _id: product._id, id: product.id, name: product.name });

    // Create update object, preserving existing images if not provided
    const updateData = {
      updatedAt: new Date()
    };

    // Only update fields that are explicitly provided
    const allowedFields = ['name', 'brand', 'price', 'category', 'subcategory', 'type', 'color', 'style', 'description', 'sizes', 'details'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle image fields specially - only update if explicitly provided
    if (req.body.gallery !== undefined) {
      updateData.gallery = req.body.gallery;
    }
    if (req.body.imageUrl !== undefined) {
      updateData.imageUrl = req.body.imageUrl;
      updateData.image = req.body.imageUrl; // Keep both fields in sync
    }
    if (req.body.image !== undefined) {
      updateData.image = req.body.image;
      updateData.imageUrl = req.body.image; // Keep both fields in sync
    }

    console.log('Update data to apply:', updateData);

    // Update product with selective data
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    console.log('Product updated successfully:', updatedProduct.name);

    invalidateProductCache(req.params.id);

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    
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
    // Find product by MongoDB ObjectId or custom id field
    let product;
    try {
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(req.params.id);
      }
    } catch (err) {
      // Continue to next query if ObjectId lookup fails
    }
    
    if (!product) {
      product = await Product.findOne({ id: req.params.id });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by setting isActive to false (recommended for data integrity)
    const deletedProduct = await Product.findByIdAndUpdate(
      product._id,
      { 
        isActive: false,
        updatedAt: new Date()
      },
      { new: true }
    );

    // For hard delete, use this instead:
    // await Product.findByIdAndDelete(product._id);

    invalidateProductCache(req.params.id);

    res.json({
      success: true,
      data: deletedProduct,
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

// Upload product with images (enhanced version)
exports.uploadProductWithImages = async (req, res) => {
  try {
    const {
      id,
      name,
      brand,
      price,
      category,
      subcategory,
      type,
      color,
      style,
      description,
      sizes,
      details
    } = req.body;

    // Validation
    if (!id || !name || !brand || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: id, name, brand, price, category'
      });
    }

    // Check if product with this ID already exists
    const existingProduct = await Product.findOne({ id });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this ID already exists'
      });
    }

    // Process uploaded images
    let imageUrls = [];
    let gallery = [];
    
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const imageUrl = `/images/products/${file.filename}`;
        imageUrls.push(imageUrl);
        gallery.push({
          url: imageUrl,
          alt: `${name} - Image ${index + 1}`,
          isPrimary: index === 0
        });
      });
    }

    // Parse JSON fields if they exist
    let parsedSizes = [];
    let parsedDetails = [];
    
    if (sizes) {
      try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (err) {
        console.warn('Failed to parse sizes:', err);
      }
    }
    
    if (details) {
      try {
        parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
      } catch (err) {
        console.warn('Failed to parse details:', err);
      }
    }

    // Create product
    const productData = {
      id,
      name,
      brand,
      price: parseFloat(price),
      category,
      subcategory,
      type,
      color,
      style,
      description,
      imageUrl: imageUrls[0] || null, // Primary image
      image: imageUrls[0] || null, // Legacy field
      gallery,
      sizes: parsedSizes,
      details: parsedDetails,
      isActive: true
    };

    const product = new Product(productData);
    await product.save();

    invalidateProductCache();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading product:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading product',
      error: error.message
    });
  }
};

// Update product with images (enhanced version)
exports.updateProductWithImages = async (req, res) => {
  try {
    // Find product by MongoDB ObjectId or custom id field
    let product;
    try {
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(req.params.id);
      }
    } catch (err) {
      // Continue to next query if ObjectId lookup fails
    }
    
    if (!product) {
      product = await Product.findOne({ id: req.params.id });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      brand,
      price,
      category,
      subcategory,
      type,
      color,
      style,
      description,
      sizes,
      details,
      existingImages
    } = req.body;

    // Process existing images
    let updatedGallery = [];
    let primaryImageUrl = null;
    
    // Handle existing images if provided
    if (existingImages) {
      try {
        const parsedExistingImages = typeof existingImages === 'string' 
          ? JSON.parse(existingImages) 
          : existingImages;
          
        if (Array.isArray(parsedExistingImages)) {
          updatedGallery = parsedExistingImages.map(img => {
            if (typeof img === 'string') {
              return { url: img, isPrimary: false };
            }
            return img;
          });
          
          // Find primary image from existing
          const primaryImg = updatedGallery.find(img => img.isPrimary);
          if (primaryImg) {
            primaryImageUrl = primaryImg.url;
          } else if (updatedGallery.length > 0) {
            primaryImageUrl = updatedGallery[0].url;
            updatedGallery[0].isPrimary = true;
          }
        }
      } catch (err) {
        console.warn('Failed to parse existing images:', err);
        // Keep current gallery if parsing fails
        updatedGallery = [...(product.gallery || [])];
      }
    } else {
      // Keep current gallery if no existing images provided
      updatedGallery = [...(product.gallery || [])];
      // Keep current primary image
      primaryImageUrl = product.imageUrl || product.image;
    }
    
    // Process new uploaded images if any
    if (req.files && req.files.length > 0) {
      // Add new images to gallery
      req.files.forEach((file, index) => {
        const imageUrl = `/images/products/${file.filename}`;
        updatedGallery.push({
          url: imageUrl,
          alt: `${name || product.name} - Image ${updatedGallery.length + 1}`,
          isPrimary: false
        });
        
        // Set first uploaded image as primary if no primary exists
        if (!primaryImageUrl) {
          primaryImageUrl = imageUrl;
          updatedGallery[updatedGallery.length - 1].isPrimary = true;
        }
      });
    }

    // Parse JSON fields if they exist
    let parsedSizes = product.sizes || [];
    let parsedDetails = product.details || [];
    
    if (sizes !== undefined) {
      try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (err) {
        console.warn('Failed to parse sizes:', err);
      }
    }
    
    if (details !== undefined) {
      try {
        parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
      } catch (err) {
        console.warn('Failed to parse details:', err);
      }
    }

    // Update product data
    const updateData = {
      updatedAt: new Date()
    };

    // Only update provided fields
    if (name !== undefined) updateData.name = name;
    if (brand !== undefined) updateData.brand = brand;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (type !== undefined) updateData.type = type;
    if (color !== undefined) updateData.color = color;
    if (style !== undefined) updateData.style = style;
    if (description !== undefined) updateData.description = description;
    
    // Update image-related fields - ensure both fields are synced
    if (primaryImageUrl) {
      updateData.imageUrl = primaryImageUrl;
      updateData.image = primaryImageUrl;
    }
    updateData.gallery = updatedGallery;
    updateData.sizes = parsedSizes;
    updateData.details = parsedDetails;

    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    invalidateProductCache(req.params.id);

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product with images:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating product with images',
      error: error.message
    });
  }
};

// Get unique values for dropdown options
exports.getFieldOptions = async (req, res) => {
  console.log('getFieldOptions endpoint called');
  try {
    const products = await Product.find({ isActive: true });
    console.log('Found products:', products.length);
    
    const fieldOptions = {
      brands: [...new Set(products.map(p => p.brand).filter(Boolean))].sort(),
      categories: [...new Set(products.map(p => p.category).filter(Boolean))].sort(),
      subcategories: [...new Set(products.map(p => p.subcategory).filter(Boolean))].sort(),
      types: [...new Set(products.map(p => p.type).filter(Boolean))].sort(),
      colors: [...new Set(products.map(p => p.color).filter(Boolean))].sort(),
      styles: [...new Set(products.map(p => p.style).filter(Boolean))].sort()
    };

    console.log('Field options:', fieldOptions);
    res.json(fieldOptions);
  } catch (error) {
    console.error('Error fetching field options:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch field options',
      error: error.message 
    });
  }
};
