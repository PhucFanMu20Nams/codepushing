const {
  getAllCategoriesService,
  getCategoryConfigService,
  createOrUpdateCategoryService,
  updateCategoryConfigService,
  addOptionToCategoryService,
  removeOptionFromCategoryService,
  toggleCategoryStatusService,
  getFieldOptionsService,
  initializeDefaultCategoriesService
} = require('../services/categoryServices');

/**
 * Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const result = await getAllCategoriesService();
    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

/**
 * Get specific category by name
 */
exports.getCategoryByName = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { field } = req.params;
    
    if (field) {
      // Get specific field options
      const result = await getFieldOptionsService(categoryName, field);
      res.json(result);
    } else {
      // Get full category config
      console.log('Debug: getCategoryByName called for:', categoryName);
      const result = await getCategoryConfigService(categoryName);
      console.log('Debug: getCategoryConfigService result:', JSON.stringify(result, null, 2));
      res.json(result);
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(404).json({
      success: false,
      message: 'Category not found',
      error: error.message
    });
  }
};

/**
 * Create or update category configuration
 */
exports.createOrUpdateCategory = async (req, res) => {
  try {
    const { categoryName, isActive, availableFields } = req.body;
    
    // Validation
    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    const validCategories = ['Clothes', 'Footwear', 'Accessories'];
    if (!validCategories.includes(categoryName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid categories: ${validCategories.join(', ')}`
      });
    }
    
    const configData = {
      isActive: isActive !== undefined ? isActive : true,
      availableFields: availableFields || { brands: [], types: [], colors: [] }
    };
    
    const result = await createOrUpdateCategoryService(categoryName, configData);
    res.status(result.data.isNew ? 201 : 200).json(result);
  } catch (error) {
    console.error('Error creating/updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create/update category',
      error: error.message
    });
  }
};

/**
 * Update category options
 */
exports.updateCategoryOptions = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const updates = req.body;
    
    const result = await updateCategoryConfigService(categoryName, updates);
    res.json(result);
  } catch (error) {
    console.error('Error updating category options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category options',
      error: error.message
    });
  }
};

/**
 * Add option to specific category field
 */
exports.addOptionToCategory = async (req, res) => {
  try {
    console.log('=== ADD OPTION DEBUG ===');
    console.log('req.params:', req.params);
    console.log('req.body:', req.body);
    console.log('req.headers.authorization:', req.headers.authorization ? 'Present' : 'Missing');
    
    const { categoryName, categoryId, field } = req.params;
    const { option, field: bodyField } = req.body;
    
    console.log('Extracted params:', { categoryName, categoryId, field });
    console.log('Extracted body:', { option, bodyField });
    
    // Determine if this is ID-based or name-based request
    const identifier = categoryId || categoryName;
    const fieldName = bodyField || field;
    const optionValue = option;
    
    console.log('Final values:', { identifier, fieldName, optionValue });
    
    if (!optionValue || typeof optionValue !== 'string') {
      console.log('❌ Validation failed: option value');
      return res.status(400).json({
        success: false,
        message: 'Option value is required and must be a string'
      });
    }
    
    if (!fieldName) {
      console.log('❌ Validation failed: field name');
      return res.status(400).json({
        success: false,
        message: 'Field name is required'
      });
    }
    
    console.log('✅ Validation passed, calling service...');
    const result = await addOptionToCategoryService(identifier, fieldName, optionValue.trim());
    console.log('✅ Service call successful:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ ERROR in addOptionToCategory:', error);
    console.error('Error stack:', error.stack);
    
    // Handle duplicate option error
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: 'Option already exists',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add option to category',
      error: error.message
    });
  }
};

/**
 * Remove option from specific category field
 */
exports.removeOptionFromCategory = async (req, res) => {
  try {
    const { categoryName, categoryId, field, option } = req.params;
    const { field: bodyField, option: bodyOption } = req.body;
    
    // Determine if this is ID-based or name-based request
    const identifier = categoryId || categoryName;
    const fieldName = bodyField || field;
    const optionValue = bodyOption || option;
    
    if (!fieldName) {
      return res.status(400).json({
        success: false,
        message: 'Field name is required'
      });
    }
    
    if (!optionValue) {
      return res.status(400).json({
        success: false,
        message: 'Option value is required'
      });
    }
    
    const result = await removeOptionFromCategoryService(identifier, fieldName, optionValue);
    res.json(result);
  } catch (error) {
    console.error('Error removing option from category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove option from category',
      error: error.message
    });
  }
};

/**
 * Toggle category active status
 */
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    const result = await toggleCategoryStatusService(categoryName);
    res.json(result);
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle category status',
      error: error.message
    });
  }
};

/**
 * Initialize default categories
 */
exports.initializeDefaultCategories = async (req, res) => {
  try {
    const result = await initializeDefaultCategoriesService();
    res.json(result);
  } catch (error) {
    console.error('Error initializing default categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize default categories',
      error: error.message
    });
  }
};
