import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../utils/apiService';

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [categoryFilters, setCategoryFilters] = useState({
    Clothes: { brands: [], types: [], colors: [] },
    Footwear: { brands: [], types: [], colors: [] },
    Accessories: { brands: [], types: [], colors: [] }
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load category filters from API
  const loadCategoryFilters = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Clear cache if force refresh is requested
      if (forceRefresh && window.apiService && window.apiService.cacheManager) {
        window.apiService.cacheManager.invalidate('categories');
      }
      
      const response = await apiService.getCategories();
      
      console.log('FilterContext: Loading category filters...', response);
      
      if (response.success && response.data) {
        const newFilters = {};
        
        response.data.forEach(category => {
          newFilters[category.categoryName] = {
            brands: category.availableFields?.brands || [],
            types: category.availableFields?.types || [],
            colors: category.availableFields?.colors || []
          };
        });
        
        console.log('FilterContext: New filters loaded:', newFilters);
        setCategoryFilters(newFilters);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading category filters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh filters (called after category management updates)
  const refreshFilters = async (forceRefresh = true) => {
    console.log('FilterContext: Refreshing filters...', { forceRefresh });
    await loadCategoryFilters(forceRefresh);
  };

  // Get filters for a specific category
  const getFiltersForCategory = (categoryName) => {
    return categoryFilters[categoryName] || { brands: [], types: [], colors: [] };
  };

  // Check if a specific option exists in a category field
  const hasOption = (categoryName, field, option) => {
    const filters = getFiltersForCategory(categoryName);
    return filters[field]?.includes(option) || false;
  };

  // Get all unique options across all categories for a field
  const getAllOptionsForField = (field) => {
    const allOptions = new Set();
    Object.values(categoryFilters).forEach(filters => {
      filters[field]?.forEach(option => allOptions.add(option));
    });
    return Array.from(allOptions).sort();
  };

  // Update filters for a specific category (optimistic update)
  const updateCategoryFilters = (categoryName, newFilters) => {
    setCategoryFilters(prev => ({
      ...prev,
      [categoryName]: {
        ...prev[categoryName],
        ...newFilters
      }
    }));
    setLastUpdated(new Date());
  };

  // Add option to category filter (optimistic update)
  const addOptionToFilter = (categoryName, field, option) => {
    setCategoryFilters(prev => {
      const currentFilters = prev[categoryName] || { brands: [], types: [], colors: [] };
      const currentFieldOptions = currentFilters[field] || [];
      
      if (!currentFieldOptions.includes(option)) {
        return {
          ...prev,
          [categoryName]: {
            ...currentFilters,
            [field]: [...currentFieldOptions, option].sort()
          }
        };
      }
      
      return prev;
    });
    setLastUpdated(new Date());
  };

  // Remove option from category filter (optimistic update)
  const removeOptionFromFilter = (categoryName, field, option) => {
    setCategoryFilters(prev => {
      const currentFilters = prev[categoryName] || { brands: [], types: [], colors: [] };
      const currentFieldOptions = currentFilters[field] || [];
      
      return {
        ...prev,
        [categoryName]: {
          ...currentFilters,
          [field]: currentFieldOptions.filter(opt => opt !== option)
        }
      };
    });
    setLastUpdated(new Date());
  };

  // Load filters on mount
  useEffect(() => {
    loadCategoryFilters();
    
    // Listen for category updates from admin panel
    const handleCategoryUpdate = (event) => {
      console.log('FilterContext: Received category update event', event.detail);
      refreshFilters(true);
    };
    
    window.addEventListener('categoryUpdated', handleCategoryUpdate);
    
    return () => {
      window.removeEventListener('categoryUpdated', handleCategoryUpdate);
    };
  }, []);

  // Set up periodic refresh to catch external changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh every 30 seconds if not recently updated
      const now = new Date();
      if (!lastUpdated || (now - lastUpdated) > 30000) {
        loadCategoryFilters();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const value = {
    categoryFilters,
    loading,
    lastUpdated,
    loadCategoryFilters,
    refreshFilters,
    getFiltersForCategory,
    hasOption,
    getAllOptionsForField,
    updateCategoryFilters,
    addOptionToFilter,
    removeOptionFromFilter
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;
