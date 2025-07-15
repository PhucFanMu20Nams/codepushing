/**
 * Validation utilities for dynamic category management
 */

export class CategoryValidator {
  static validateCategoryName(name) {
    const errors = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('Category name is required');
    }
    
    if (name && name.length < 2) {
      errors.push('Category name must be at least 2 characters long');
    }
    
    if (name && name.length > 50) {
      errors.push('Category name must be less than 50 characters');
    }
    
    if (name && !/^[a-zA-Z0-9\s\-&]+$/.test(name)) {
      errors.push('Category name contains invalid characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateFieldName(fieldName) {
    const errors = [];
    
    if (!fieldName || fieldName.trim().length === 0) {
      errors.push('Field name is required');
    }
    
    if (fieldName && fieldName.length < 2) {
      errors.push('Field name must be at least 2 characters long');
    }
    
    if (fieldName && fieldName.length > 30) {
      errors.push('Field name must be less than 30 characters');
    }
    
    if (fieldName && !/^[a-zA-Z]+$/.test(fieldName)) {
      errors.push('Field name can only contain letters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateOptionValue(option, existingOptions = []) {
    const errors = [];
    
    if (!option || option.trim().length === 0) {
      errors.push('Option value is required');
    }
    
    if (option && option.length < 1) {
      errors.push('Option value must be at least 1 character long');
    }
    
    if (option && option.length > 100) {
      errors.push('Option value must be less than 100 characters');
    }
    
    if (option && existingOptions.includes(option.trim())) {
      errors.push('This option already exists');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateProductForm(formData, categoryConfig) {
    const errors = {};
    
    // Basic required fields
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'Product name is required';
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Valid price is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    // Category-specific validation
    if (formData.category && categoryConfig) {
      const category = categoryConfig;
      
      // Validate required fields based on category
      Object.keys(category.availableFields || {}).forEach(field => {
        if (category.requiredFields && category.requiredFields.includes(field)) {
          if (!formData[field] || formData[field].trim().length === 0) {
            errors[field] = `${field} is required for ${category.name}`;
          }
        }
      });
    }
    
    // Image validation
    if (!formData.images || formData.images.length === 0) {
      errors.images = 'At least one product image is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[<>\"']/g, ''); // Remove potentially dangerous characters
  }
  
  static formatFieldName(fieldName) {
    return fieldName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }
}

export class FormValidator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static validatePassword(password) {
    const errors = [];
    
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (password && !/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (password && !/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (password && !/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validatePrice(price) {
    const numPrice = parseFloat(price);
    
    if (isNaN(numPrice) || numPrice <= 0) {
      return {
        isValid: false,
        errors: ['Price must be a valid positive number']
      };
    }
    
    if (numPrice > 1000000) {
      return {
        isValid: false,
        errors: ['Price cannot exceed 1,000,000']
      };
    }
    
    return {
      isValid: true,
      errors: []
    };
  }
}

export default {
  CategoryValidator,
  FormValidator
};
