const CategoryConfig = require('../models/CategoryConfig');

/**
 * Get all category configurations
 * @returns {Object} All categories with their configurations
 */
const getAllCategoriesService = async () => {
  try {
    const categories = await CategoryConfig.find().sort({ categoryName: 1 });
    
    return {
      success: true,
      data: categories,
      count: categories.length
    };
  } catch (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
};

/**
 * Get specific category configuration by name
 * @param {string} categoryName - Name of the category
 * @returns {Object} Category configuration
 */
const getCategoryConfigService = async (categoryName) => {
  try {
    const category = await CategoryConfig.findOne({ 
      categoryName: categoryName,
      isActive: true 
    });
    
    if (!category) {
      throw new Error(`Category '${categoryName}' not found or inactive`);
    }
    
    return {
      success: true,
      data: category
    };
  } catch (error) {
    throw new Error(`Failed to fetch category config: ${error.message}`);
  }
};

/**
 * Create or update category configuration
 * @param {string} categoryName - Name of the category
 * @param {Object} configData - Configuration data
 * @returns {Object} Created/updated category
 */
const createOrUpdateCategoryService = async (categoryName, configData) => {
  try {
    const existingCategory = await CategoryConfig.findOne({ categoryName });
    
    if (existingCategory) {
      // Update existing category
      Object.assign(existingCategory, configData);
      await existingCategory.save();
      
      return {
        success: true,
        data: existingCategory,
        message: `Category '${categoryName}' updated successfully`
      };
    } else {
      // Create new category
      const newCategory = new CategoryConfig({
        categoryName,
        ...configData
      });
      
      await newCategory.save();
      
      return {
        success: true,
        data: newCategory,
        message: `Category '${categoryName}' created successfully`
      };
    }
  } catch (error) {
    throw new Error(`Failed to create/update category: ${error.message}`);
  }
};

/**
 * Update category configuration
 * @param {string} categoryName - Name of the category
 * @param {Object} updates - Updates to apply
 * @returns {Object} Updated category
 */
const updateCategoryConfigService = async (categoryName, updates) => {
  try {
    const category = await CategoryConfig.findOne({ categoryName });
    
    if (!category) {
      throw new Error(`Category '${categoryName}' not found`);
    }
    
    Object.assign(category, updates);
    await category.save();
    
    return {
      success: true,
      data: category,
      message: `Category '${categoryName}' updated successfully`
    };
  } catch (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

/**
 * Add option to specific category field
 * @param {string} identifier - Category name or ID
 * @param {string} field - Field name (brands, types, colors)
 * @param {string} option - Option to add
 * @returns {Object} Updated category
 */
const addOptionToCategoryService = async (identifier, field, option) => {
  try {
    console.log('=== SERVICE DEBUG ===');
    console.log('Service inputs:', { identifier, field, option });
    
    const validFields = ['brands', 'types', 'colors'];
    if (!validFields.includes(field)) {
      console.log('❌ Invalid field:', field);
      throw new Error(`Invalid field '${field}'. Valid fields: ${validFields.join(', ')}`);
    }
    
    console.log('✅ Field validation passed');
    
    // Try to find by ID first, then by name
    console.log('🔍 Looking for category by ID...');
    let category = await CategoryConfig.findById(identifier);
    if (!category) {
      console.log('🔍 ID lookup failed, trying by name...');
      category = await CategoryConfig.findOne({ categoryName: identifier });
    }
    
    if (!category) {
      console.log('❌ Category not found:', identifier);
      throw new Error(`Category '${identifier}' not found`);
    }
    
    console.log('✅ Found category:', category.categoryName);
    console.log('Current field options:', category.availableFields[field]);
    
    // Check if option already exists (case-insensitive)
    const existingOptions = category.availableFields[field] || [];
    const optionExists = existingOptions.some(
      existingOption => existingOption.toLowerCase() === option.toLowerCase()
    );
    
    if (optionExists) {
      console.log('❌ Option already exists:', option);
      throw new Error(`Option '${option}' already exists in ${field} for category '${category.categoryName}'`);
    }
    
    console.log('✅ Option is unique, adding...');
    category.addOption(field, option);
    await category.save();
    console.log('✅ Category saved successfully');
    
    return {
      success: true,
      data: category,
      message: `Option '${option}' added to ${field} in category '${category.categoryName}'`
    };
  } catch (error) {
    throw new Error(`Failed to add option: ${error.message}`);
  }
};

/**
 * Remove option from specific category field
 * @param {string} identifier - Category name or ID
 * @param {string} field - Field name (brands, types, colors)
 * @param {string} option - Option to remove
 * @returns {Object} Updated category
 */
const removeOptionFromCategoryService = async (identifier, field, option) => {
  try {
    const validFields = ['brands', 'types', 'colors'];
    if (!validFields.includes(field)) {
      throw new Error(`Invalid field '${field}'. Valid fields: ${validFields.join(', ')}`);
    }
    
    // Try to find by ID first, then by name
    let category = await CategoryConfig.findById(identifier);
    if (!category) {
      category = await CategoryConfig.findOne({ categoryName: identifier });
    }
    
    if (!category) {
      throw new Error(`Category '${identifier}' not found`);
    }
    
    category.removeOption(field, option);
    await category.save();
    
    return {
      success: true,
      data: category,
      message: `Option '${option}' removed from ${field} in category '${category.categoryName}'`
    };
  } catch (error) {
    throw new Error(`Failed to remove option: ${error.message}`);
  }
};

/**
 * Toggle category active status
 * @param {string} categoryName - Name of the category
 * @returns {Object} Updated category
 */
const toggleCategoryStatusService = async (categoryName) => {
  try {
    const category = await CategoryConfig.findOne({ categoryName });
    
    if (!category) {
      throw new Error(`Category '${categoryName}' not found`);
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    return {
      success: true,
      data: category,
      message: `Category '${categoryName}' ${category.isActive ? 'activated' : 'deactivated'}`
    };
  } catch (error) {
    throw new Error(`Failed to toggle category status: ${error.message}`);
  }
};

/**
 * Get field options for a specific category
 * @param {string} categoryName - Name of the category
 * @param {string} field - Field name (brands, types, colors)
 * @returns {Object} Field options
 */
const getFieldOptionsService = async (categoryName, field) => {
  try {
    const validFields = ['brands', 'types', 'colors'];
    if (!validFields.includes(field)) {
      throw new Error(`Invalid field '${field}'. Valid fields: ${validFields.join(', ')}`);
    }
    
    const category = await CategoryConfig.findOne({ 
      categoryName,
      isActive: true 
    });
    
    if (!category) {
      throw new Error(`Category '${categoryName}' not found or inactive`);
    }
    
    const options = category.getFieldOptions(field);
    
    return {
      success: true,
      data: {
        category: categoryName,
        field: field,
        options: options.sort()
      }
    };
  } catch (error) {
    throw new Error(`Failed to get field options: ${error.message}`);
  }
};

/**
 * Initialize default categories if they don't exist
 * @returns {Object} Initialization result
 */
const initializeDefaultCategoriesService = async () => {
  try {
    const defaultCategories = [
      {
        categoryName: 'Clothes',
        availableFields: {
          brands: ['Nike', 'Adidas', 'Zara', 'H&M'],
          types: ['T-Shirt', 'Shirt', 'Pants', 'Dress'],
          colors: ['Black', 'White', 'Blue', 'Red', 'Green']
        }
      },
      {
        categoryName: 'Footwear',
        availableFields: {
          brands: ['Nike', 'Adidas', 'Converse', 'Vans'],
          types: ['Sneakers', 'Boots', 'Sandals', 'Formal'],
          colors: ['Black', 'White', 'Brown', 'Blue', 'Red']
        }
      },
      {
        categoryName: 'Accessories',
        availableFields: {
          brands: ['Apple', 'Samsung', 'Ray-Ban', 'Casio'],
          types: ['Watch', 'Sunglasses', 'Bag', 'Hat'],
          colors: ['Black', 'Silver', 'Gold', 'Brown', 'Blue']
        }
      }
    ];
    
    const results = [];
    
    for (const categoryData of defaultCategories) {
      const existingCategory = await CategoryConfig.findOne({ 
        categoryName: categoryData.categoryName 
      });
      
      if (!existingCategory) {
        const newCategory = new CategoryConfig(categoryData);
        await newCategory.save();
        results.push({
          category: categoryData.categoryName,
          action: 'created'
        });
      } else {
        results.push({
          category: categoryData.categoryName,
          action: 'already exists'
        });
      }
    }
    
    return {
      success: true,
      data: results,
      message: 'Default categories initialization completed'
    };
  } catch (error) {
    throw new Error(`Failed to initialize default categories: ${error.message}`);
  }
};

module.exports = {
  getAllCategoriesService,
  getCategoryConfigService,
  createOrUpdateCategoryService,
  updateCategoryConfigService,
  addOptionToCategoryService,
  removeOptionFromCategoryService,
  toggleCategoryStatusService,
  getFieldOptionsService,
  initializeDefaultCategoriesService
};
