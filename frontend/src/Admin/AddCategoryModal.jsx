import React, { useState, useEffect } from 'react';
import './AddCategoryModal.css';
import apiService from '../utils/apiService';

const AddCategoryModal = ({ open, onClose, onSuccess }) => {
  // State management for multi-step flow
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [newOption, setNewOption] = useState('');
  const [categoryOptions, setCategoryOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Available categories and fields
  const CATEGORIES = ['Clothes', 'Footwear', 'Accessories'];
  const FIELDS = [
    { key: 'brands', label: 'Brand', icon: '🏷️' },
    { key: 'types', label: 'Type', icon: '📦' },
    { key: 'colors', label: 'Colors', icon: '🎨' }
  ];

  // Reset modal state when opened/closed
  useEffect(() => {
    if (!open) {
      resetModal();
    }
  }, [open]);

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedCategory('');
    setSelectedField('');
    setNewOption('');
    setCategoryOptions(null);
    setError('');
    setSuccess('');
    setLoading(false);
  };

  // Fetch category options when category is selected
  const fetchCategoryOptions = async (categoryName, bypassCache = false) => {
    try {
      setLoading(true);
      setError('');
      
      // If bypassCache is true, clear relevant cache first
      if (bypassCache && window.apiService && window.apiService.cacheManager) {
        window.apiService.cacheManager.invalidate('categoryOptions');
      }
      
      const response = await apiService.getCategoryOptions(categoryName);
      
      console.log('Debug: getCategoryOptions response:', response);
      console.log('Debug: response.data:', response.data);
      console.log('Debug: response.data._id:', response.data?._id);
      console.log('Debug: response structure:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('Debug: setting categoryOptions to:', response.data);
        setCategoryOptions(response.data);
        return response.data; // Return the data for immediate use
      } else {
        throw new Error(response.message || 'Failed to fetch category options');
      }
    } catch (err) {
      console.error('Error fetching category options:', err);
      setError(`Failed to load ${categoryName} options: ${err.message}`);
      
      // Don't set fallback data without an ID - this causes the "Unable to get category ID" error
      setCategoryOptions(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = async (category) => {
    console.log('Debug: handleCategorySelect called with:', category);
    setSelectedCategory(category);
    setSelectedField('');
    setNewOption('');
    setError('');
    setSuccess('');
    
    console.log('Debug: About to call fetchCategoryOptions...');
    const categoryData = await fetchCategoryOptions(category);
    console.log('Debug: fetchCategoryOptions returned:', categoryData);
    
    // Update state with the fresh data immediately
    if (categoryData) {
      setCategoryOptions(categoryData);
    }
    
    setCurrentStep(2);
  };

  // Handle field selection
  const handleFieldSelect = (field) => {
    setSelectedField(field);
    setNewOption('');
    setError('');
    setSuccess('');
    setCurrentStep(3);
  };

  // Handle adding new option
  const handleAddOption = async (e) => {
    e.preventDefault();
    
    if (!newOption.trim()) {
      setError('Please enter an option');
      return;
    }

    // Check if the option already exists (case-insensitive)
    const existingOptions = categoryOptions?.availableFields?.[selectedField] || [];
    console.log('Debug: existingOptions for', selectedField, ':', existingOptions);
    console.log('Debug: checking if', newOption.trim(), 'exists in:', existingOptions);
    
    const optionExists = existingOptions.some(
      existing => existing.toLowerCase() === newOption.trim().toLowerCase()
    );
    
    console.log('Debug: optionExists:', optionExists);
    
    if (optionExists) {
      setError(`"${newOption.trim()}" already exists in ${selectedField}. Please choose a different name.`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Always try to get fresh category data to ensure we have the correct ID
      console.log('Debug: Getting fresh category data before adding option...');
      
      // First, try to clear any cached data to ensure fresh fetch
      if (window.apiService?.cacheManager) {
        window.apiService.cacheManager.invalidate('categoryOptions', { category: selectedCategory });
      }
      
      const freshResponse = await apiService.getCategoryOptions(selectedCategory);
      console.log('Debug: Fresh category response:', freshResponse);
      
      let categoryId = null;
      
      if (freshResponse.success && freshResponse.data) {
        // Debug: Log the actual response structure
        console.log('Debug: Full response object:', freshResponse);
        console.log('Debug: Response success:', freshResponse.success);
        console.log('Debug: Response data:', freshResponse.data);
        console.log('Debug: Response data type:', typeof freshResponse.data);
        console.log('Debug: Response data keys:', freshResponse.data ? Object.keys(freshResponse.data) : 'no data');
        console.log('Debug: Response data._id:', freshResponse.data?._id);
        console.log('Debug: Response data.id:', freshResponse.data?.id);
        
        // Check if the data has _id directly or if it's nested
        categoryId = freshResponse.data?._id || freshResponse.data?.id;
        console.log('Debug: Extracted categoryId:', categoryId);
        
        if (categoryId) {
          setCategoryOptions(freshResponse.data); // Update state for consistency
        } else {
          console.error('Debug: No ID found in response data:', freshResponse.data);
        }
      } else {
        console.error('Debug: API response not successful or no data:', freshResponse);
        console.error('Debug: Response success:', freshResponse?.success);
        console.error('Debug: Response data exists:', !!freshResponse?.data);
      }
      
      // Fallback: Try to get ID from current categoryOptions state
      if (!categoryId && categoryOptions?._id) {
        console.log('Debug: Using categoryId from existing state:', categoryOptions._id);
        categoryId = categoryOptions._id;
      }
      
      // Last resort: Try to fetch all categories and find the matching one
      if (!categoryId) {
        console.log('Debug: Last resort - fetching all categories to find ID...');
        try {
          const allCategoriesResponse = await apiService.getCategories();
          if (allCategoriesResponse.success && allCategoriesResponse.data) {
            const category = allCategoriesResponse.data.find(cat => cat.categoryName === selectedCategory);
            if (category) {
              categoryId = category._id;
              console.log('Debug: Found categoryId from all categories:', categoryId);
              setCategoryOptions(category); // Update state
            }
          }
        } catch (fallbackError) {
          console.error('Debug: Fallback category fetch failed:', fallbackError);
        }
      }
      
      // If we still don't have the ID, provide detailed error info
      if (!categoryId) {
        console.error('Debug: Final categoryId check failed');
        console.error('Debug: selectedCategory:', selectedCategory);
        console.error('Debug: API response:', freshResponse);
        throw new Error(`Unable to get category ID for "${selectedCategory}". The category may not exist in the database. Please try refreshing the page or contact support.`);
      }
      
      console.log('Debug: categoryOptions:', categoryOptions);
      console.log('Debug: categoryOptions._id:', categoryOptions?._id);
      console.log('Debug: selectedCategory:', selectedCategory);
      console.log('Debug: using categoryId:', categoryId);
      console.log('Debug: typeof categoryId:', typeof categoryId);

      const response = await apiService.addCategoryOption(
        categoryId, 
        selectedField, 
        newOption.trim(),
        token
      );
      
      if (response.success) {
        setSuccess(`"${newOption}" added to ${selectedField} successfully!`);
        setNewOption('');
        
        // Force refresh category options to ensure real-time update
        await fetchCategoryOptions(selectedCategory, true);
        
        // Dispatch custom event to notify FilterContext about the update
        window.dispatchEvent(new CustomEvent('categoryUpdated', {
          detail: {
            category: selectedCategory,
            field: selectedField,
            option: newOption.trim(),
            action: 'added'
          }
        }));
        
        // Clear all relevant caches to ensure real-time updates across the app
        if (typeof window !== 'undefined') {
          // Clear localStorage cache if any
          const cacheKeys = Object.keys(localStorage).filter(key => 
            key.includes('category') || key.includes('filter') || key.includes('options')
          );
          cacheKeys.forEach(key => localStorage.removeItem(key));
        }
        
        // Notify parent component to refresh its data
        if (onSuccess) {
          onSuccess({
            ...response,
            categoryUpdated: selectedCategory,
            fieldUpdated: selectedField,
            optionAdded: newOption
          });
        }
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to add option');
      }
    } catch (err) {
      console.error('Error adding option:', err);
      
      // Handle specific error types
      if (err.message && err.message.includes('409')) {
        setError(`"${newOption}" already exists in ${selectedField}. Please choose a different name.`);
      } else if (err.message && err.message.includes('already exists')) {
        setError(`"${newOption}" already exists in ${selectedField}. Please choose a different name.`);
      } else {
        setError(err.message || 'Failed to add option');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle removing option
  const handleRemoveOption = async (option) => {
    if (!window.confirm(`Are you sure you want to remove "${option}" from ${selectedField}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Use the category ID from categoryOptions instead of selectedCategory name
      let categoryId = categoryOptions?._id;
      
      // If we don't have the category ID, fetch the category data first
      if (!categoryId) {
        console.log('Debug: No category ID found for remove, fetching category data...');
        const freshResponse = await apiService.getCategoryOptions(selectedCategory);
        console.log('Debug: Fresh category response for remove:', freshResponse);
        if (freshResponse.success && freshResponse.data?._id) {
          categoryId = freshResponse.data._id;
          setCategoryOptions(freshResponse.data); // Update state for consistency
        }
      }
      
      // If we still don't have the ID, there's a problem
      if (!categoryId) {
        throw new Error('Unable to get category ID. Please try refreshing the page.');
      }

      const response = await apiService.removeCategoryOption(
        categoryId, 
        selectedField, 
        option,
        token
      );
      
      if (response.success) {
        setSuccess(`"${option}" removed from ${selectedField} successfully!`);
        
        // Force refresh category options to ensure real-time update
        await fetchCategoryOptions(selectedCategory, true);
        
        // Clear all relevant caches to ensure real-time updates across the app
        if (typeof window !== 'undefined') {
          // Clear localStorage cache if any
          const cacheKeys = Object.keys(localStorage).filter(key => 
            key.includes('category') || key.includes('filter') || key.includes('options')
          );
          cacheKeys.forEach(key => localStorage.removeItem(key));
        }
        
        // Notify parent component to refresh its data
        if (onSuccess) {
          onSuccess({
            ...response,
            categoryUpdated: selectedCategory,
            fieldUpdated: selectedField,
            optionRemoved: option
          });
        }
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to remove option');
      }
    } catch (err) {
      console.error('Error removing option:', err);
      setError(err.message || 'Failed to remove option');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation
  const goBackToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
      setError('');
      setSuccess('');
      
      if (step === 1) {
        setSelectedCategory('');
        setSelectedField('');
        setCategoryOptions(null);
      } else if (step === 2) {
        setSelectedField('');
      }
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content add-category-modal">
        <div className="modal-header">
          <h3>📂 Category Management</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Category</span>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Field</span>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Options</span>
          </div>
        </div>

        <div className="modal-body">
          {/* Error/Success Messages */}
          {error && <div className="error-message">❌ {error}</div>}
          {success && <div className="success-message">✅ {success}</div>}

          {/* Step 1: Category Selection */}
          {currentStep === 1 && (
            <div className="step-content">
              <h4>Which category would you like to configure?</h4>
              <div className="category-grid">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    className={`category-card ${selectedCategory === category ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(category)}
                    disabled={loading}
                  >
                    <div className="category-icon">
                      {category === 'Clothes' && '👕'}
                      {category === 'Footwear' && '👟'}
                      {category === 'Accessories' && '⌚'}
                    </div>
                    <div className="category-name">{category}</div>
                  </button>
                ))}
              </div>
              {loading && <div className="loading-indicator">Loading category options...</div>}
            </div>
          )}

          {/* Step 2: Field Selection */}
          {currentStep === 2 && (
            <div className="step-content">
              <div className="breadcrumb">
                <button className="breadcrumb-link" onClick={() => goBackToStep(1)}>
                  Categories
                </button>
                <span> / </span>
                <span className="current-step">{selectedCategory}</span>
              </div>
              
              <h4>Which field would you like to add options to?</h4>
              <div className="field-grid">
                {FIELDS.map((field) => {
                  const currentOptions = categoryOptions?.availableFields?.[field.key] || [];
                  return (
                    <button
                      key={field.key}
                      className={`field-card ${selectedField === field.key ? 'selected' : ''}`}
                      onClick={() => handleFieldSelect(field.key)}
                    >
                      <div className="field-icon">{field.icon}</div>
                      <div className="field-name">{field.label}</div>
                      <div className="field-count">{currentOptions.length} options</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Option Management */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="breadcrumb">
                <button className="breadcrumb-link" onClick={() => goBackToStep(1)}>
                  Categories
                </button>
                <span> / </span>
                <button className="breadcrumb-link" onClick={() => goBackToStep(2)}>
                  {selectedCategory}
                </button>
                <span> / </span>
                <span className="current-step">
                  {FIELDS.find(f => f.key === selectedField)?.label}
                </span>
              </div>

              <h4>
                Add new {FIELDS.find(f => f.key === selectedField)?.label.toLowerCase()} options for {selectedCategory}:
              </h4>

              {/* Add Option Form */}
              <form onSubmit={handleAddOption} className="add-option-form">
                <div className="input-group">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder={`Enter new ${FIELDS.find(f => f.key === selectedField)?.label.toLowerCase()}...`}
                    disabled={loading}
                    className="option-input"
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !newOption.trim()}
                    className="add-btn"
                  >
                    {loading ? '⏳' : '➕'} Add
                  </button>
                </div>
              </form>

              {/* Current Options */}
              <div className="current-options">
                <h5>Current {FIELDS.find(f => f.key === selectedField)?.label} Options:</h5>
                {/* Debug info */}
                <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
                  Debug: categoryOptions = {categoryOptions ? 'loaded' : 'null'}, 
                  selectedField = {selectedField}, 
                  options count = {categoryOptions?.availableFields?.[selectedField]?.length || 0}
                </div>
                <div className="options-list">
                  {categoryOptions?.availableFields?.[selectedField]?.length > 0 ? (
                    categoryOptions.availableFields[selectedField].map((option, index) => (
                      <div key={index} className="option-item">
                        <span className="option-text">{option}</span>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveOption(option)}
                          disabled={loading}
                          title={`Remove ${option}`}
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-options">
                      No {FIELDS.find(f => f.key === selectedField)?.label.toLowerCase()} options yet. Add some above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {currentStep > 1 && (
            <button 
              className="btn-secondary" 
              onClick={() => goBackToStep(currentStep - 1)}
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
