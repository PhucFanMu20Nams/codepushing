import React, { useState, useEffect } from 'react';
import apiService from '../utils/apiService';
import { CategoryValidator, FormValidator } from '../utils/validators';
import './DynamicProductForm.css';

const DynamicProductForm = ({ 
  formData, 
  onFormChange, 
  errors, 
  onValidation 
}) => {
  const [categoryOptions, setCategoryOptions] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Load available categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load category-specific options when category changes
  useEffect(() => {
    if (formData.category) {
      loadCategoryOptions(formData.category);
    } else {
      setCategoryOptions({});
    }
  }, [formData.category]);

  const loadCategories = async () => {
    try {
      const response = await apiService.getAllCategories();
      if (response.success) {
        const activeCategories = response.data.filter(cat => cat.isActive);
        setAvailableCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to default categories
      setAvailableCategories([
        { categoryName: 'Clothes', isActive: true },
        { categoryName: 'Footwear', isActive: true },
        { categoryName: 'Accessories', isActive: true }
      ]);
    }
  };

  const loadCategoryOptions = async (categoryName) => {
    try {
      setLoadingOptions(true);
      const response = await apiService.getCategoryOptions(categoryName);
      
      if (response.success && response.data) {
        setCategoryOptions(response.data.availableFields || {});
      } else {
        setCategoryOptions({});
      }
    } catch (error) {
      console.error(`Error loading options for ${categoryName}:`, error);
      setCategoryOptions({});
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleInputChange = (field, value) => {
    const updatedForm = { ...formData, [field]: value };
    
    // Reset dependent fields when category changes
    if (field === 'category') {
      updatedForm.brand = '';
      updatedForm.type = '';
      updatedForm.color = '';
    }
    
    onFormChange(updatedForm);
    
    // Trigger validation with enhanced real-time validation
    if (onValidation) {
      const newErrors = { ...errors };
      
      // Validate specific field based on type
      switch (field) {
        case 'name':
          if (!value.trim()) {
            newErrors.name = 'Product name is required';
          } else if (value.length < 2) {
            newErrors.name = 'Product name must be at least 2 characters long';
          } else if (value.length > 100) {
            newErrors.name = 'Product name must be less than 100 characters';
          } else {
            delete newErrors.name;
          }
          break;
          
        case 'price':
          const priceValidation = FormValidator.validatePrice(value);
          if (!priceValidation.isValid) {
            newErrors.price = priceValidation.errors[0];
          } else {
            delete newErrors.price;
          }
          break;
          
        case 'category':
          if (!value) {
            newErrors.category = 'Category is required';
          } else {
            delete newErrors.category;
            // Clear category-specific field errors when category changes
            ['brand', 'type', 'color'].forEach(f => delete newErrors[f]);
          }
          break;
          
        case 'description':
          if (value && value.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
          } else {
            delete newErrors.description;
          }
          break;
          
        default:
          // For dynamic fields (brand, type, color), validate if they're required
          if (selectedCategoryConfig && formData.category) {
            const fieldMapping = {
              'brand': 'brands',
              'type': 'types', 
              'color': 'colors'
            };
            
            const configField = fieldMapping[field];
            if (configField && selectedCategoryConfig.availableFields[configField]) {
              if (!value.trim()) {
                newErrors[field] = `${field} is required for ${selectedCategoryConfig.name}`;
              } else {
                delete newErrors[field];
              }
            }
          }
      }
      
      onValidation(updatedForm, newErrors);
    }
  };

  const renderFormField = (fieldName, label, isRequired = true) => {
    const fieldKey = fieldName === 'brand' ? 'brands' : 
                   fieldName === 'type' ? 'types' : 
                   fieldName === 'color' ? 'colors' : fieldName;
    
    const options = categoryOptions[fieldKey] || [];
    const hasOptions = options.length > 0;
    const isDisabled = !formData.category || loadingOptions;

    return (
      <div className="form-field">
        <label className="form-label">
          {label}
          {isRequired && <span className="required">*</span>}
        </label>
        
        {hasOptions ? (
          <select
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            disabled={isDisabled}
            className={`form-select ${errors[fieldName] ? 'error' : ''}`}
          >
            <option value="">
              {loadingOptions ? 'Loading...' : `Select ${label}`}
            </option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={
              !formData.category 
                ? `Select category first to see ${label.toLowerCase()} options`
                : loadingOptions 
                ? 'Loading options...'
                : `Enter ${label.toLowerCase()} or configure options in Category Management`
            }
            disabled={isDisabled}
            className={`form-input ${errors[fieldName] ? 'error' : ''}`}
          />
        )}
        
        {errors[fieldName] && (
          <div className="form-error">
            {label} is required
          </div>
        )}
        
        {!hasOptions && formData.category && !loadingOptions && (
          <div className="form-hint">
            💡 No {label.toLowerCase()} options configured for {formData.category}. 
            Use "Add Category" to add {label.toLowerCase()} options.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dynamic-product-form">
      {/* Basic Product Information */}
      <div className="form-section">
        <h4 className="section-title">Basic Information</h4>
        
        {/* Product ID */}
        <div className="form-field">
          <label className="form-label">
            Product ID <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.id || ''}
            onChange={(e) => handleInputChange('id', e.target.value)}
            placeholder="Enter unique product ID"
            className={`form-input ${errors.id ? 'error' : ''}`}
          />
          {errors.id && <div className="form-error">Product ID is required</div>}
        </div>

        {/* Product Name */}
        <div className="form-field">
          <label className="form-label">
            Product Name <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter product name"
            className={`form-input ${errors.name ? 'error' : ''}`}
          />
          {errors.name && <div className="form-error">Product name is required</div>}
        </div>

        {/* Price */}
        <div className="form-field">
          <label className="form-label">
            Price (₫) <span className="required">*</span>
          </label>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="Enter price"
            min="0"
            step="1000"
            className={`form-input ${errors.price ? 'error' : ''}`}
          />
          {errors.price && <div className="form-error">Price is required</div>}
        </div>
      </div>

      {/* Category Selection */}
      <div className="form-section">
        <h4 className="section-title">Category & Specifications</h4>
        
        <div className="form-field">
          <label className="form-label">
            Category <span className="required">*</span>
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={`form-select ${errors.category ? 'error' : ''}`}
          >
            <option value="">Select Category</option>
            {availableCategories.map((category) => (
              <option key={category._id || category.categoryName} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
          {errors.category && <div className="form-error">Category is required</div>}
          
          {!formData.category && (
            <div className="form-hint">
              📂 Select a category to see available brand, type, and color options
            </div>
          )}
        </div>

        {/* Dynamic Fields Based on Category */}
        {formData.category && (
          <div className="dynamic-fields">
            <div className="fields-info">
              <strong>🎯 One Selection Per Field:</strong> Choose one option from each field below
            </div>
            
            <div className="field-row">
              {renderFormField('brand', 'Brand')}
              {renderFormField('type', 'Type')}
              {renderFormField('color', 'Color')}
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="form-section">
        <h4 className="section-title">Additional Information</h4>
        
        <div className="form-field">
          <label className="form-label">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter product description (optional)"
            rows="3"
            className="form-textarea"
          />
        </div>
      </div>

      {/* Category Options Status */}
      {formData.category && (
        <div className="options-status">
          <h5>Available Options for {formData.category}:</h5>
          <div className="options-summary">
            <div className="option-count">
              <span className="count-label">Brands:</span>
              <span className="count-value">{categoryOptions.brands?.length || 0}</span>
            </div>
            <div className="option-count">
              <span className="count-label">Types:</span>
              <span className="count-value">{categoryOptions.types?.length || 0}</span>
            </div>
            <div className="option-count">
              <span className="count-label">Colors:</span>
              <span className="count-value">{categoryOptions.colors?.length || 0}</span>
            </div>
          </div>
          
          {Object.values(categoryOptions).every(arr => arr?.length === 0) && (
            <div className="no-options-warning">
              ⚠️ No options configured for this category. Use "Add Category" to add options first.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicProductForm;
