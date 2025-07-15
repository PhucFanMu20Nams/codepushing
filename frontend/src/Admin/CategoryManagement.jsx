import React, { useState, useEffect } from 'react';
import { useFilter } from '../context/FilterContext';
import apiService from '../utils/apiService';
import './CategoryManagement.css';

const CategoryManagement = ({ onClose }) => {
  const { refreshFilters, addOptionToFilter, removeOptionFromFilter } = useFilter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [newOption, setNewOption] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async () => {
    if (!selectedCategory || !selectedField || !newOption.trim()) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      await apiService.addCategoryOption(selectedCategory._id, selectedField, newOption.trim(), token);
      
      // Real-time filter update
      addOptionToFilter(selectedCategory.categoryName, selectedField, newOption.trim());
      
      setNewOption('');
      await loadCategories();
      await refreshFilters(); // Sync with filter context
      
      // Update selected category with fresh data
      const updatedCategory = categories.find(cat => cat._id === selectedCategory._id);
      setSelectedCategory(updatedCategory);
    } catch (error) {
      console.error('Error adding option:', error);
      alert('Failed to add option');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveOption = async (option) => {
    if (!selectedCategory || !selectedField) return;

    if (!confirm(`Remove "${option}" from ${selectedField}?`)) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      await apiService.removeCategoryOption(selectedCategory._id, selectedField, option, token);
      
      // Real-time filter update
      removeOptionFromFilter(selectedCategory.categoryName, selectedField, option);
      
      await loadCategories();
      await refreshFilters(); // Sync with filter context
      
      // Update selected category with fresh data
      const updatedCategory = categories.find(cat => cat._id === selectedCategory._id);
      setSelectedCategory(updatedCategory);
    } catch (error) {
      console.error('Error removing option:', error);
      alert('Failed to remove option');
    } finally {
      setUpdating(false);
    }
  };

  const getFieldOptions = () => {
    if (!selectedCategory || !selectedField) return [];
    return selectedCategory.availableFields[selectedField] || [];
  };

  if (loading) {
    return (
      <div className="category-management-overlay">
        <div className="category-management-modal">
          <div className="loading-spinner">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-management-overlay">
      <div className="category-management-modal">
        <div className="modal-header">
          <h3>Category Management</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="management-grid">
            {/* Categories List */}
            <div className="section">
              <h4>Categories</h4>
              <div className="category-list">
                {categories.map(category => (
                  <div
                    key={category._id}
                    className={`category-item ${selectedCategory?._id === category._id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedField(null);
                    }}
                  >
                    <div className="category-name">{category.name}</div>
                    <div className="category-count">
                      {Object.keys(category.availableFields).length} fields
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fields List */}
            {selectedCategory && (
              <div className="section">
                <h4>Fields for {selectedCategory.name}</h4>
                <div className="field-list">
                  {Object.keys(selectedCategory.availableFields).map(field => (
                    <div
                      key={field}
                      className={`field-item ${selectedField === field ? 'active' : ''}`}
                      onClick={() => setSelectedField(field)}
                    >
                      <div className="field-name">{field}</div>
                      <div className="field-count">
                        {selectedCategory.availableFields[field]?.length || 0} options
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options Management */}
            {selectedCategory && selectedField && (
              <div className="section">
                <h4>Options for {selectedField}</h4>
                
                <div className="add-option-form">
                  <div className="form-group">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder={`Add new ${selectedField.slice(0, -1)}`}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                    />
                    <button
                      onClick={handleAddOption}
                      disabled={!newOption.trim() || updating}
                      className="btn-primary"
                    >
                      {updating ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>

                <div className="options-list">
                  {getFieldOptions().map((option, index) => (
                    <div key={index} className="option-item">
                      <span className="option-name">{option}</span>
                      <button
                        onClick={() => handleRemoveOption(option)}
                        disabled={updating}
                        className="remove-btn"
                        title="Remove option"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {getFieldOptions().length === 0 && (
                    <div className="no-options">No options available</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
