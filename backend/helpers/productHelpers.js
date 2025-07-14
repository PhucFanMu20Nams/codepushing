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

/**
 * Helper function to find product by ID (ObjectId or custom string ID)
 * @param {string} id - Product ID to search for
 * @returns {Object|null} Product document or null if not found
 */
const findProductById = async (id) => {
  let product = null;
  
  // Try to find by MongoDB ObjectId first (24-char hex string)
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      product = await Product.findById(id);
    } catch (err) {
      console.log('ObjectId lookup failed:', err.message);
    }
  }
  
  // If not found by ObjectId, try finding by custom id field
  if (!product) {
    try {
      product = await Product.findOne({ id: id });
    } catch (err) {
      console.log('Custom ID lookup failed:', err.message);
    }
  }
  
  return product;
};

/**
 * Build filter object for product queries
 * @param {Object} queryParams - Request query parameters
 * @returns {Object} MongoDB filter object
 */
const buildProductFilter = (queryParams) => {
  const { search, brand, type, color, style, category, minPrice, maxPrice } = queryParams;
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
  
  return filter;
};

/**
 * Process uploaded images for product
 * @param {Array} files - Uploaded files array
 * @param {string} productName - Product name for alt text
 * @returns {Object} Processed image data
 */
const processUploadedImages = (files, productName) => {
  let imageUrls = [];
  let gallery = [];
  
  if (files && files.length > 0) {
    files.forEach((file, index) => {
      const imageUrl = `/images/products/${file.filename}`;
      imageUrls.push(imageUrl);
      gallery.push({
        url: imageUrl,
        alt: `${productName} - Image ${index + 1}`,
        isPrimary: index === 0
      });
    });
  }
  
  return { imageUrls, gallery };
};

/**
 * Parse JSON fields safely
 * @param {string|Array} field - Field to parse
 * @param {Array} fallback - Fallback value if parsing fails
 * @returns {Array} Parsed array or fallback
 */
const parseJSONField = (field, fallback = []) => {
  if (!field) return fallback;
  
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch (err) {
    console.warn('Failed to parse JSON field:', err);
    return fallback;
  }
};

module.exports = {
  invalidateProductCache,
  findProductById,
  buildProductFilter,
  processUploadedImages,
  parseJSONField
};
