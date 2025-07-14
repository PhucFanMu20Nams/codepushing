/**
 * Handle validation errors and return formatted response
 * @param {Error} error - Mongoose validation error
 * @returns {Object} Formatted error object
 */
const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    return {
      success: false,
      message: 'Validation error',
      errors: Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {})
    };
  }
  return {
    success: false,
    message: 'Error processing request',
    error: error.message
  };
};

/**
 * Validate required fields for product creation
 * @param {Object} productData - Product data to validate
 * @returns {Object} Validation result
 */
const validateProductCreation = (productData) => {
  const { name, brand, price, category } = productData;
  
  if (!name || !brand || !price || !category) {
    return {
      isValid: false,
      message: 'Missing required fields: name, brand, price, category'
    };
  }
  
  return { isValid: true };
};

/**
 * Validate product upload with images
 * @param {Object} productData - Product data to validate
 * @returns {Object} Validation result
 */
const validateProductUpload = (productData) => {
  const { id, name, brand, price, category } = productData;
  
  if (!id || !name || !brand || !price || !category) {
    return {
      isValid: false,
      message: 'Missing required fields: id, name, brand, price, category'
    };
  }
  
  return { isValid: true };
};

/**
 * Validate search query
 * @param {string} query - Search query
 * @returns {Object} Validation result
 */
const validateSearchQuery = (query) => {
  if (!query) {
    return {
      isValid: false,
      message: 'Search query is required'
    };
  }
  
  return { isValid: true };
};

module.exports = {
  handleValidationError,
  validateProductCreation,
  validateProductUpload,
  validateSearchQuery
};
