import React, { useEffect, useState } from 'react';
import './EditProductModal.css';
import apiService from '../utils/apiService.js';

function EditProductModal({ open, onClose, onSubmit, product }) {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    price: '',
    category: '',
    subcategory: '',
    type: '',
    color: '',
    style: '',
    description: '',
    sizes: [],
    details: [],
    newImages: []
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [fieldOptions, setFieldOptions] = useState({
    brands: [],
    categories: [],
    subcategories: [],
    types: [],
    colors: [],
    styles: []
  });

  // Initialize form when product changes or modal opens
  useEffect(() => {
    if (open && product) {
      console.log('EditProductModal: Initializing with product:', product);
      
      setForm({
        name: product.name || '',
        brand: product.brand || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        type: product.type || '',
        color: product.color || '',
        style: product.style || '',
        description: product.description || '',
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        details: Array.isArray(product.details) ? product.details : [],
        newImages: []
      });
      setErrors({});
      setPreview([]);
      
      // Handle gallery images safely
      let gallery = [];
      if (product.gallery && Array.isArray(product.gallery)) {
        gallery = product.gallery.map(img => {
          if (typeof img === 'string') {
            return { url: img, isPrimary: false };
          }
          return img;
        });
      } else if (product.image || product.imageUrl) {
        gallery = [{ url: product.image || product.imageUrl, isPrimary: true }];
      }
      
      console.log('EditProductModal: Setting gallery images:', gallery);
      setExistingImages(gallery);
    } else if (!open) {
      // Reset form when modal closes
      setForm({
        name: '',
        brand: '',
        price: '',
        category: '',
        subcategory: '',
        type: '',
        color: '',
        style: '',
        description: '',
        sizes: [],
        details: [],
        newImages: []
      });
      setErrors({});
      setPreview([]);
      setExistingImages([]);
    }
  }, [open, product]);

  // Fetch field options when modal opens
  useEffect(() => {
    if (open) {
      fetchFieldOptions();
    }
  }, [open]);

  const fetchFieldOptions = async () => {
    try {
      const options = await apiService.getFieldOptions();
      setFieldOptions(options);
    } catch (error) {
      console.error('Failed to fetch field options:', error);
      // Set default fallback options
      setFieldOptions({
        brands: ['Nike', 'Adidas'],
        categories: ['Footwear', 'Clothing', 'Accessories'],
        subcategories: ['Men', 'Women', 'Kids'],
        types: ['Sneaker', 'Shirt', 'T-Shirt', 'Pants', 'Jacket'],
        colors: ['White', 'Black', 'Red', 'Blue', 'Green', 'Gray'],
        styles: ['Casual', 'Formal', 'Sport', 'Streetwear']
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({ ...prev, newImages: files }));
    
    // Create preview URLs for new images
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreview(newPreviews);
    
    // Clear image error
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: false }));
    }
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    setForm(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index)
    }));
    setPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSizeChange = (index, value) => {
    const newSizes = [...form.sizes];
    newSizes[index] = value;
    setForm(prev => ({ ...prev, sizes: newSizes }));
  };

  const addSize = () => {
    setForm(prev => ({ ...prev, sizes: [...prev.sizes, ''] }));
  };

  const removeSize = (index) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...form.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setForm(prev => ({ ...prev, details: newDetails }));
  };

  const addDetail = () => {
    setForm(prev => ({
      ...prev,
      details: [...prev.details, { label: '', value: '' }]
    }));
  };

  const removeDetail = (index) => {
    setForm(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    // Handle if imagePath is an object (like from gallery)
    if (typeof imagePath === 'object') {
      imagePath = imagePath.url || imagePath.imageUrl || imagePath.image || '';
    }
    
    // Convert to string if it's not already
    imagePath = String(imagePath || '');
    
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    if (imagePath.includes('products/')) {
      return imagePath.startsWith('/') 
        ? `${apiUrl}${imagePath}` 
        : `${apiUrl}/images/${imagePath}`;
    }
    
    if (imagePath.startsWith('/images/')) {
      return `${apiUrl}${imagePath}`;
    }
    
    return `${apiUrl}/images/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validation
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.brand.trim()) newErrors.brand = true;
    if (!form.price.trim()) newErrors.price = true;
    if (!form.category.trim()) newErrors.category = true;

    // Validate price is a number
    if (form.price && isNaN(parseFloat(form.price))) {
      newErrors.price = true;
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        ...form,
        price: parseFloat(form.price),
        existingImages: existingImages
      });
      setLoading(false);
    } catch (error) {
      console.error('Error updating product:', error);
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <div className="edit-modal-header">
          <h2>Edit Product</h2>
          <button 
            className="edit-modal-close" 
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-product-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  disabled={loading}
                />
                {errors.name && <span className="error-msg">Required</span>}
              </div>

              <div className="form-group">
                <label>Brand *</label>
                <select
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className={errors.brand ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select Brand</option>
                  {fieldOptions.brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                {errors.brand && <span className="error-msg">Required</span>}
              </div>

              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className={errors.price ? 'error' : ''}
                  disabled={loading}
                />
                {errors.price && <span className="error-msg">Required and must be a number</span>}
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={errors.category ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select Category</option>
                  {fieldOptions.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <span className="error-msg">Required</span>}
              </div>
            </div>

            {/* Additional Details */}
            <div className="form-section">
              <h3>Additional Details</h3>
              
              <div className="form-group">
                <label>Subcategory</label>
                <select
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select Subcategory</option>
                  {fieldOptions.subcategories.map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select Type</option>
                  {fieldOptions.types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Color</label>
                <select
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select Color</option>
                  {fieldOptions.colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Style</label>
                <select
                  name="style"
                  value={form.style}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select Style</option>
                  {fieldOptions.styles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Existing Images */}
          {existingImages && existingImages.length > 0 && (
            <div className="form-section">
              <h3>Current Images</h3>
              <div className="existing-images-grid">
                {existingImages.map((img, index) => {
                  console.log('Rendering existing image:', img, 'at index:', index);
                  const imageUrl = getImageUrl(img);
                  return (
                    <div key={index} className="existing-image-item">
                      <img
                        src={imageUrl}
                        alt={`Existing ${index + 1}`}
                        className="existing-image-preview"
                        onError={(e) => {
                          console.error('Image failed to load:', imageUrl);
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', imageUrl);
                        }}
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => handleRemoveExistingImage(index)}
                        disabled={loading}
                      >
                        ×
                      </button>
                      {img && typeof img === 'object' && img.isPrimary && (
                        <span className="primary-badge">Primary</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Images */}
          <div className="form-section">
            <h3>Add New Images</h3>
            <div className="form-group">
              <label>Upload New Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleNewImages}
                disabled={loading}
              />
              <small>You can upload multiple images at once</small>
            </div>

            {preview.length > 0 && (
              <div className="new-images-grid">
                {preview.map((src, index) => (
                  <div key={index} className="new-image-item">
                    <img
                      src={src}
                      alt={`New ${index + 1}`}
                      className="new-image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveNewImage(index)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="form-section">
            <h3>Available Sizes</h3>
            <div className="dynamic-list">
              {form.sizes.map((size, index) => (
                <div key={index} className="dynamic-item">
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => handleSizeChange(index, e.target.value)}
                    placeholder="Size (e.g., S, M, L, XL)"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="remove-btn"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSize}
                className="add-btn"
                disabled={loading}
              >
                Add Size
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="form-section">
            <h3>Product Details</h3>
            <div className="dynamic-list">
              {form.details.map((detail, index) => (
                <div key={index} className="dynamic-item detail-item">
                  <input
                    type="text"
                    value={detail.label}
                    onChange={(e) => handleDetailChange(index, 'label', e.target.value)}
                    placeholder="Detail label (e.g., Material)"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    value={detail.value}
                    onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                    placeholder="Detail value (e.g., 100% Cotton)"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => removeDetail(index)}
                    className="remove-btn"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addDetail}
                className="add-btn"
                disabled={loading}
              >
                Add Detail
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
