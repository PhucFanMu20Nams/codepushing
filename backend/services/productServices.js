const Product = require('../models/Product');
const { 
  findProductById, 
  buildProductFilter, 
  processUploadedImages, 
  parseJSONField,
  invalidateProductCache 
} = require('../helpers/productHelpers');

/**
 * Get products with filtering and pagination
 * @param {Object} queryParams - Query parameters
 * @returns {Object} Products and pagination info
 */
const getProductsWithFilters = async (queryParams) => {
  const { page = 1, limit = 10 } = queryParams;
  
  // Build filter using helper function
  const filter = buildProductFilter(queryParams);
  const skip = (page - 1) * limit;
  
  // Execute queries in parallel for better performance
  const [products, total] = await Promise.all([
    Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Product.countDocuments(filter)
  ]);

  return {
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Search products by query
 * @param {Object} searchParams - Search parameters
 * @returns {Object} Search results with pagination
 */
const searchProductsByQuery = async (searchParams) => {
  const { query, page = 1, limit = 10 } = searchParams;
  
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
  
  // Execute queries in parallel
  const [products, total] = await Promise.all([
    Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Product.countDocuments(filter)
  ]);

  return {
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get single product by ID
 * @param {string} productId - Product ID
 * @returns {Object} Product data or error
 */
const getProductByIdService = async (productId) => {
  const product = await findProductById(productId);
  
  if (!product) {
    return {
      success: false,
      message: 'Product not found',
      statusCode: 404
    };
  }

  return {
    success: true,
    data: product
  };
};

/**
 * Create new product
 * @param {Object} productData - Product data
 * @returns {Object} Created product or error
 */
const createProductService = async (productData) => {
  const {
    id, name, brand, price, category, subcategory, type, color, style,
    description, imageUrl, image, gallery, sizes, details
  } = productData;

  // Check if product with this ID already exists (if ID is provided)
  if (id) {
    const existingProduct = await Product.findOne({ id });
    if (existingProduct) {
      return {
        success: false,
        message: 'Product with this ID already exists',
        statusCode: 400
      };
    }
  }

  // Create product data
  const newProductData = {
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

  const product = new Product(newProductData);
  await product.save();
  
  invalidateProductCache();
  
  return {
    success: true,
    data: product,
    message: 'Product created successfully'
  };
};

/**
 * Update existing product
 * @param {string} productId - Product ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated product or error
 */
const updateProductService = async (productId, updateData) => {
  // Find product using helper function
  const product = await findProductById(productId);

  if (!product) {
    // Debug information for troubleshooting
    const allProducts = await Product.find({}).select('_id id name').limit(5);
    
    return {
      success: false,
      message: 'Product not found',
      statusCode: 404,
      debug: {
        searchedId: productId,
        availableProducts: allProducts.map(p => ({ _id: p._id, id: p.id, name: p.name }))
      }
    };
  }

  // Create update object with selective field updates
  const productUpdateData = { updatedAt: new Date() };
  const allowedFields = ['name', 'brand', 'price', 'category', 'subcategory', 'type', 'color', 'style', 'description', 'sizes', 'details'];
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      productUpdateData[field] = updateData[field];
    }
  });

  // Handle image fields specially - sync both imageUrl and image fields
  if (updateData.gallery !== undefined) {
    productUpdateData.gallery = updateData.gallery;
  }
  if (updateData.imageUrl !== undefined) {
    productUpdateData.imageUrl = updateData.imageUrl;
    productUpdateData.image = updateData.imageUrl;
  }
  if (updateData.image !== undefined) {
    productUpdateData.image = updateData.image;
    productUpdateData.imageUrl = updateData.image;
  }

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    product._id,
    productUpdateData,
    { new: true, runValidators: true }
  );

  invalidateProductCache(productId);

  return {
    success: true,
    data: updatedProduct,
    message: 'Product updated successfully'
  };
};

/**
 * Delete product (soft delete)
 * @param {string} productId - Product ID
 * @returns {Object} Deleted product or error
 */
const deleteProductService = async (productId) => {
  const product = await findProductById(productId);

  if (!product) {
    return {
      success: false,
      message: 'Product not found',
      statusCode: 404
    };
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

  invalidateProductCache(productId);

  return {
    success: true,
    data: deletedProduct,
    message: 'Product deleted successfully'
  };
};

/**
 * Get unique brands
 * @returns {Object} List of brands
 */
const getBrandsService = async () => {
  const brands = await Product.distinct('brand', { isActive: true });
  
  return {
    success: true,
    data: brands.sort()
  };
};

/**
 * Get unique categories
 * @returns {Object} List of categories
 */
const getCategoriesService = async () => {
  const categories = await Product.distinct('category', { isActive: true });
  
  return {
    success: true,
    data: categories.sort()
  };
};

/**
 * Get unique types
 * @returns {Object} List of types
 */
const getTypesService = async () => {
  const types = await Product.distinct('type', { isActive: true });
  
  return {
    success: true,
    data: types.sort()
  };
};

/**
 * Get product statistics
 * @returns {Object} Product statistics
 */
const getProductStatsService = async () => {
  const [totalProducts, totalBrands, totalCategories, priceStats] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.distinct('brand', { isActive: true }),
    Product.distinct('category', { isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ])
  ]);

  return {
    success: true,
    data: {
      totalProducts,
      totalBrands: totalBrands.length,
      totalCategories: totalCategories.length,
      priceRange: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
    }
  };
};

/**
 * Upload product with images
 * @param {Object} productData - Product data
 * @param {Array} files - Uploaded files
 * @returns {Object} Created product or error
 */
const uploadProductWithImagesService = async (productData, files) => {
  const {
    id, name, brand, price, category, subcategory, type, color, style,
    description, sizes, details
  } = productData;

  // Check if product with this ID already exists
  const existingProduct = await Product.findOne({ id });
  if (existingProduct) {
    return {
      success: false,
      message: 'Product with this ID already exists',
      statusCode: 400
    };
  }

  // Process uploaded images using helper function
  const { imageUrls, gallery } = processUploadedImages(files, name);

  // Parse JSON fields using helper function
  const parsedSizes = parseJSONField(sizes);
  const parsedDetails = parseJSONField(details);

  // Create product
  const newProductData = {
    id, name, brand,
    price: parseFloat(price),
    category, subcategory, type, color, style, description,
    imageUrl: imageUrls[0] || null, // Primary image
    image: imageUrls[0] || null, // Legacy field
    gallery,
    sizes: parsedSizes,
    details: parsedDetails,
    isActive: true
  };

  const product = new Product(newProductData);
  await product.save();
  invalidateProductCache();

  return {
    success: true,
    data: product,
    message: 'Product uploaded successfully'
  };
};

/**
 * Update product with images
 * @param {string} productId - Product ID
 * @param {Object} updateData - Update data
 * @param {Array} files - Uploaded files
 * @returns {Object} Updated product or error
 */
const updateProductWithImagesService = async (productId, updateData, files) => {
  console.log('=== UPDATE PRODUCT WITH IMAGES SERVICE START ===');
  try {
    console.log('updateProductWithImagesService called with:', {
      productId,
      updateData: Object.keys(updateData),
      filesCount: files ? files.length : 0
    });

    const product = await findProductById(productId);

    if (!product) {
      console.log('Product not found for ID:', productId);
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404
      };
    }

    console.log('Found product:', product.name);

    const {
      name, brand, price, category, subcategory, type, color, style,
      description, sizes, details, existingImages
    } = updateData;

    // Process existing images
    let updatedGallery = [];
    let primaryImageUrl = null;
    
    console.log('Processing existing images...', existingImages ? 'provided' : 'not provided');
    
    // Handle existing images if provided
    if (existingImages) {
      try {
        const parsedExistingImages = parseJSONField(existingImages, []);
        
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
      } catch (existingImagesError) {
        console.error('Error parsing existing images:', existingImagesError);
        console.log('Falling back to current product gallery');
        updatedGallery = [...(product.gallery || [])];
        primaryImageUrl = product.imageUrl || product.image;
      }
    } else {
      // Keep current gallery if no existing images provided
      updatedGallery = [...(product.gallery || [])];
      primaryImageUrl = product.imageUrl || product.image;
    }
    
    console.log('Gallery after existing images processing:', updatedGallery.length, 'images');
    
    // Process new uploaded images if any
    if (files && files.length > 0) {
      console.log('Processing', files.length, 'new uploaded files...');
      const productName = name || product.name;
      
      try {
        const { gallery: newImageGallery } = processUploadedImages(files, productName);
        
        console.log('New images processed:', newImageGallery.length);
        
        // Add new images to gallery
        updatedGallery.push(...newImageGallery);
        
        // Set first uploaded image as primary if no primary exists
        if (!primaryImageUrl && newImageGallery.length > 0) {
          primaryImageUrl = newImageGallery[0].url;
          // Find the first new image in the updated gallery and set it as primary
          const firstNewImageIndex = updatedGallery.length - newImageGallery.length;
          if (firstNewImageIndex >= 0 && firstNewImageIndex < updatedGallery.length) {
            updatedGallery[firstNewImageIndex].isPrimary = true;
          }
        }
      } catch (imageProcessError) {
        console.error('Error processing uploaded images:', imageProcessError);
        throw new Error(`Image processing failed: ${imageProcessError.message}`);
      }
    }

    console.log('Final gallery count:', updatedGallery.length);

    // Parse JSON fields using helper function
    let parsedSizes = product.sizes || [];
    let parsedDetails = product.details || [];
    
    try {
      parsedSizes = sizes !== undefined ? parseJSONField(sizes, product.sizes || []) : product.sizes || [];
    } catch (err) {
      console.warn('Error parsing sizes:', err);
      parsedSizes = product.sizes || [];
    }
    
    try {
      parsedDetails = details !== undefined ? parseJSONField(details, product.details || []) : product.details || [];
    } catch (err) {
      console.warn('Error parsing details:', err);
      parsedDetails = product.details || [];
    }

    console.log('Parsed sizes:', parsedSizes.length, 'details:', parsedDetails.length);

    // Update product data
    const productUpdateData = { updatedAt: new Date() };

    // Only update provided fields
    if (name !== undefined) productUpdateData.name = name;
    if (brand !== undefined) productUpdateData.brand = brand;
    if (price !== undefined) {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice)) {
        console.warn('Invalid price provided:', price, 'using original price');
        productUpdateData.price = product.price;
      } else {
        productUpdateData.price = numericPrice;
      }
    }
    if (category !== undefined) productUpdateData.category = category;
    if (subcategory !== undefined) productUpdateData.subcategory = subcategory;
    if (type !== undefined) productUpdateData.type = type;
    if (color !== undefined) productUpdateData.color = color;
    if (style !== undefined) productUpdateData.style = style;
    if (description !== undefined) productUpdateData.description = description;
    
    // Update image-related fields - ensure both fields are synced
    if (primaryImageUrl) {
      productUpdateData.imageUrl = primaryImageUrl;
      productUpdateData.image = primaryImageUrl;
    }
    productUpdateData.gallery = updatedGallery;
    productUpdateData.sizes = parsedSizes;
    productUpdateData.details = parsedDetails;

    console.log('Updating product with data keys:', Object.keys(productUpdateData));

    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        productUpdateData,
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        console.error('Failed to update product - no product returned');
        throw new Error('Failed to update product in database');
      }

      console.log('Product updated successfully:', updatedProduct.name);

      invalidateProductCache(productId);

      console.log('=== UPDATE PRODUCT WITH IMAGES SERVICE END ===');
      
      return {
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      };
    } catch (dbError) {
      console.error('Database update error:', dbError);
      console.error('Update data that caused error:', productUpdateData);
      throw new Error(`Database update failed: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Error in updateProductWithImagesService:', error);
    console.error('Error stack:', error.stack);
    console.log('=== UPDATE PRODUCT WITH IMAGES SERVICE ERROR END ===');
    throw error; // Re-throw to be handled by the controller
  }
};

/**
 * Get field options for dropdowns
 * @returns {Object} Field options
 */
const getFieldOptionsService = async () => {
  const products = await Product.find({ isActive: true });
  
  const fieldOptions = {
    brands: [...new Set(products.map(p => p.brand).filter(Boolean))].sort(),
    categories: [...new Set(products.map(p => p.category).filter(Boolean))].sort(),
    subcategories: [...new Set(products.map(p => p.subcategory).filter(Boolean))].sort(),
    types: [...new Set(products.map(p => p.type).filter(Boolean))].sort(),
    colors: [...new Set(products.map(p => p.color).filter(Boolean))].sort(),
    styles: [...new Set(products.map(p => p.style).filter(Boolean))].sort()
  };

  return fieldOptions;
};

/**
 * Get category-specific field options for dynamic filtering
 * @param {string} category - Category to filter by
 * @returns {Object} Category-specific field options
 */
const getCategorySpecificOptionsService = async (category) => {
  if (!category) {
    return {
      success: false,
      message: 'Category is required',
      statusCode: 400
    };
  }

  const products = await Product.find({ 
    isActive: true, 
    category: { $regex: new RegExp(`^${category}$`, 'i') }
  });

  if (products.length === 0) {
    return {
      success: true,
      data: {
        category,
        brands: [],
        types: [],
        colors: [],
        styles: [],
        subcategories: []
      }
    };
  }

  const categoryOptions = {
    category,
    brands: [...new Set(products.map(p => p.brand).filter(Boolean))].sort(),
    types: [...new Set(products.map(p => p.type).filter(Boolean))].sort(),
    colors: [...new Set(products.map(p => p.color).filter(Boolean))].sort(),
    styles: [...new Set(products.map(p => p.style).filter(Boolean))].sort(),
    subcategories: [...new Set(products.map(p => p.subcategory).filter(Boolean))].sort()
  };

  return {
    success: true,
    data: categoryOptions
  };
};

/**
 * Get all available categories with their specific options
 * @returns {Object} All categories with their specific filter options
 */
const getAllCategoryOptionsService = async () => {
  const products = await Product.find({ isActive: true });
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  
  const categoryOptionsMap = {};
  
  for (const category of categories) {
    const categoryProducts = products.filter(p => 
      p.category && p.category.toLowerCase() === category.toLowerCase()
    );
    
    categoryOptionsMap[category] = {
      brands: [...new Set(categoryProducts.map(p => p.brand).filter(Boolean))].sort(),
      types: [...new Set(categoryProducts.map(p => p.type).filter(Boolean))].sort(),
      colors: [...new Set(categoryProducts.map(p => p.color).filter(Boolean))].sort(),
      styles: [...new Set(categoryProducts.map(p => p.style).filter(Boolean))].sort(),
      subcategories: [...new Set(categoryProducts.map(p => p.subcategory).filter(Boolean))].sort()
    };
  }

  return {
    success: true,
    data: {
      categories: categories.sort(),
      categoryOptions: categoryOptionsMap
    }
  };
};

module.exports = {
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
};
