import React, { useEffect, useState } from 'react';
import Toolbar from './Toolbar';
import './Products.css';
import apiService from '../utils/apiService.js';
import EditProductModal from './EditProductModal';
import AddCategoryModal from './AddCategoryModal';
import CategoryManagement from './CategoryManagement';
import DynamicProductForm from './DynamicProductForm';
import ErrorBoundary from '../components/ErrorBoundary';

function AddProductModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    brand: '',
    price: '',
    category: '',
    type: '',
    color: '',
    description: '',
    images: []
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    if (!open) {
      setForm({ 
        id: '', 
        name: '', 
        brand: '', 
        price: '', 
        category: '', 
        type: '', 
        color: '', 
        description: '', 
        images: [] 
      });
      setErrors({});
      setPreview([]);
    }
  }, [open]);

  const handleFormChange = (updatedForm) => {
    setForm(updatedForm);
  };

  const handleValidation = (formData, validationErrors = {}) => {
    setErrors(validationErrors);
  };

  const validateForm = (formData) => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.id) newErrors.id = true;
    if (!formData.name) newErrors.name = true;
    if (!formData.price) newErrors.price = true;
    if (!formData.category) newErrors.category = true;
    
    // Image validation
    if (!formData.images || formData.images.length < 2) {
      newErrors.images = true;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImages = e => {
    const files = Array.from(e.target.files);
    const updatedForm = { ...form, images: files };
    setForm(updatedForm);
    setPreview(files.map(file => URL.createObjectURL(file)));
    
    // Clear image error if files are selected
    if (files.length >= 2 && errors.images) {
      setErrors({ ...errors, images: false });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    if (validateForm(form)) {
      onSubmit(form);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content add-product-modal">
        <div className="modal-header">
          <h3>🆕 Add New Product</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="modal-body">
            {/* Dynamic Product Form */}
            <DynamicProductForm
              formData={form}
              onFormChange={handleFormChange}
              errors={errors}
              onValidation={handleValidation}
            />
            
            {/* Image Upload Section */}
            <div className="form-section">
              <h4 className="section-title">Product Images</h4>
              <div className="form-field">
                <label className="form-label">
                  Images <span className="required">*</span>
                  <span className="image-requirement">(minimum 2 images)</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImages}
                  className={`form-input ${errors.images ? 'error' : ''}`}
                />
                {errors.images && (
                  <div className="form-error">
                    Please select at least 2 images
                  </div>
                )}
                
                {/* Image Preview */}
                {preview.length > 0 && (
                  <div className="image-preview">
                    <h5>Preview:</h5>
                    <div className="preview-grid">
                      {preview.map((src, idx) => (
                        <div key={idx} className="preview-item">
                          <img 
                            src={src} 
                            alt={`Preview ${idx + 1}`} 
                            className="preview-image"
                          />
                          <span className="image-label">Image {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={Object.keys(errors).some(key => errors[key])}
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch products function - moved to component level so it can be accessed everywhere
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts({ limit: 1000 });
      console.log('API Response:', data); // Debug log
      // Handle different API response structures
      if (data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Unexpected API response structure:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [showAdd, successMsg]);

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
    
    // Get the API URL from environment, or use a default if not available
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Handle paths from backend that include 'products/'
    if (imagePath.includes('products/')) {
      // Make sure the path is properly formatted with leading slash if needed
      if (imagePath.startsWith('/')) {
        return `${apiUrl}${imagePath}`;
      } else {
        return `${apiUrl}/images/${imagePath}`;
      }
    }
    
    // Handle paths from backend that start with /images/
    if (imagePath.startsWith('/images/')) {
      return `${apiUrl}${imagePath}`;
    }
    
    // Handle frontend public assets (these should be in the public folder)
    if (imagePath.startsWith('/assets/')) {
      return imagePath;
    }
    
    // For any other path, try prepending the API URL and /images/
    return `${apiUrl}/images/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

  // Lọc sản phẩm theo tên hoặc thương hiệu
  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  // Gửi dữ liệu lên backend để lưu vào DB và upload ảnh với cache invalidation
  const handleAddProduct = async (form) => {
    try {
      const formData = new FormData();
      formData.append('id', form.id);
      formData.append('name', form.name);
      formData.append('brand', form.brand);
      formData.append('price', form.price);
      formData.append('category', form.category);
      form.images.forEach((img, idx) => {
        // Đổi tên file: id-1.jpg, id-2.jpg,...
        const ext = img.name.split('.').pop();
        const file = new File([img], `${form.id}-${idx + 1}.${ext}`, { type: img.type });
        formData.append('images', file);
      });

      // Get token from localStorage with correct key
      const token = localStorage.getItem('adminToken');
      
      await apiService.uploadProductWithImages(formData, token);
      
      setShowAdd(false);
      setSuccessMsg('Add product successful');
      
      // Force refresh of product list to show real-time updates
      await fetchProducts();
      
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (error) {
      console.error('Error adding product:', error);
      setSuccessMsg('Có lỗi xảy ra!');
    }
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    console.log('=== HANDLE EDIT PRODUCT ===');
    console.log('Product to edit:', product);
    console.log('Product _id:', product._id);
    console.log('Product id:', product.id);
    console.log('===========================');
    
    setEditingProduct(product);
    setShowEdit(true);
  };

  // Handle update product
  const handleUpdateProduct = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setSuccessMsg('Error: Authentication token not found. Please log in again.');
        setTimeout(() => setSuccessMsg(''), 3000);
        return;
      }

      // Get product ID - prioritize stable custom 'id' over MongoDB '_id'
      const productId = editingProduct.id || editingProduct._id;
      
      if (!productId) {
        console.error('Product ID error:', editingProduct);
        setSuccessMsg('Error: Product ID not found.');
        setTimeout(() => setSuccessMsg(''), 3000);
        return;
      }

      console.log('=== UPDATE PRODUCT DEBUG ===');
      console.log('Editing product object:', editingProduct);
      console.log('Using product ID:', productId);
      console.log('Product ID type:', typeof productId);
      console.log('Form data to update:', formData);
      console.log('============================');
      
      // Create FormData for images if new images are provided
      if (formData.newImages && formData.newImages.length > 0) {
        console.log('=== FRONTEND IMAGE UPLOAD DEBUG ===');
        console.log('Product ID:', productId);
        console.log('Token exists:', !!token);
        console.log('Token length:', token ? token.length : 0);
        console.log('New images count:', formData.newImages.length);
        console.log('New images details:', formData.newImages.map(img => ({
          name: img.name,
          size: img.size,
          type: img.type
        })));
        
        const updateFormData = new FormData();
        
        // Add text fields - ensure proper data types
        const textFields = ['name', 'brand', 'price', 'category', 'subcategory', 'type', 'color', 'style', 'description'];
        textFields.forEach(field => {
          if (formData[field] !== undefined && formData[field] !== '') {
            updateFormData.append(field, formData[field]);
            console.log(`Added field ${field}:`, formData[field]);
          }
        });
        
        // Handle arrays properly
        if (formData.sizes && Array.isArray(formData.sizes)) {
          const sizesJson = JSON.stringify(formData.sizes.filter(size => size.trim()));
          updateFormData.append('sizes', sizesJson);
          console.log('Added sizes:', sizesJson);
        }
        
        if (formData.details && Array.isArray(formData.details)) {
          const detailsJson = JSON.stringify(formData.details.filter(detail => detail.label && detail.value));
          updateFormData.append('details', detailsJson);
          console.log('Added details:', detailsJson);
        }
        
        // Add existing images info
        if (formData.existingImages && Array.isArray(formData.existingImages)) {
          const existingImagesJson = JSON.stringify(formData.existingImages);
          updateFormData.append('existingImages', existingImagesJson);
          console.log('Added existingImages:', existingImagesJson);
        }
        
        // Add new images
        formData.newImages.forEach((img, idx) => {
          updateFormData.append('images', img);
          console.log(`Added image ${idx}:`, img.name, img.size, 'bytes');
        });
        
        console.log('About to call updateProductWithImages API...');
        console.log('=== END FRONTEND DEBUG ===');
        
        await apiService.updateProductWithImages(productId, updateFormData, token);
      } else {
        // Update without images - clean the data
        const updateData = {
          name: formData.name,
          brand: formData.brand,
          price: parseFloat(formData.price),
          category: formData.category
        };
        
        // Add optional fields only if they have values
        if (formData.subcategory) updateData.subcategory = formData.subcategory;
        if (formData.type) updateData.type = formData.type;
        if (formData.color) updateData.color = formData.color;
        if (formData.style) updateData.style = formData.style;
        if (formData.description) updateData.description = formData.description;
        
        // Handle arrays
        if (formData.sizes && Array.isArray(formData.sizes)) {
          updateData.sizes = formData.sizes.filter(size => size.trim());
        }
        
        if (formData.details && Array.isArray(formData.details)) {
          updateData.details = formData.details.filter(detail => detail.label && detail.value);
        }
        
        // Preserve existing gallery if no new images and existing images provided
        if (formData.existingImages && Array.isArray(formData.existingImages) && formData.existingImages.length > 0) {
          updateData.gallery = formData.existingImages.map(img => img.url || img);
        }
        
        console.log('Updating without images:', updateData);
        await apiService.updateProduct(productId, updateData, token);
      }
      
      setShowEdit(false);
      setEditingProduct(null);
      setSuccessMsg('Product updated successfully');
      
      // Force refresh of product list to show real-time updates
      await fetchProducts();
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating product:', error);
      
      // Handle authentication errors specifically
      if (error.message.includes('Access denied') || error.message.includes('Invalid token') || error.message.includes('401')) {
        setSuccessMsg('Error: Authentication failed. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUsername');
          window.location.href = '/admin/login';
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Error updating product!';
        setSuccessMsg(`Error: ${errorMessage}`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      await apiService.deleteProduct(productId, token);
      
      setSuccessMsg('Product deleted successfully');
      
      // Force refresh of product list to show real-time updates
      await fetchProducts();
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setSuccessMsg('Error deleting product!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Handle category modal success
  const handleCategorySuccess = (response) => {
    console.log('Category operation successful:', response);
    setSuccessMsg(response.message || 'Category updated successfully');
    
    // Force refresh of product list to reflect any category changes
    fetchProducts();
    
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="dashboard-root">
      <Toolbar />
      <main className="dashboard-content">
        {successMsg && (
          <div className={successMsg.includes('Error') || successMsg.includes('error') ? 'error-message' : 'success-message'}>
            {successMsg}
          </div>
        )}
        <div className="products-page">
          <div className="products-action-container">
            <input
              className="products-search"
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="products-action-btn" onClick={() => setShowCategoryModal(true)}>
              Add Category
            </button>
            <button className="products-action-btn" onClick={() => setShowCategoryManagement(true)}>
              Manage Categories
            </button>
            <button className="products-action-btn" onClick={() => setShowAdd(true)}>Add Product</button>
          </div>
          {successMsg && <div className="form-success">{successMsg}</div>}
          <h2 className="products-title">Danh sách sản phẩm</h2>
          
          {loading ? (
            <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>
              Loading products...
            </div>
          ) : (
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Thương hiệu</th>
                    <th>Giá</th>
                    <th>Danh mục</th>
                    <th>Ảnh 1</th>
                    <th>Ảnh 2</th>
                    <th>Ảnh 3</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                        {search ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Chưa có sản phẩm nào'}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => {
                      // Get all images from gallery or fallback to single image
                      const allImages = p.gallery && Array.isArray(p.gallery) ? p.gallery : [p.image || p.imageUrl];
                      
                      return (
                        <tr key={p._id || p.id}>
                          <td>{p.id || p._id}</td>
                          <td>{p.name}</td>
                          <td>{p.brand}</td>
                          <td>{typeof p.price === 'number' ? p.price.toLocaleString() : p.price}₫</td>
                          <td>{p.category}</td>
                          {/* Image 1 */}
                          <td>
                            {allImages[0] ? (
                              <img
                                src={getImageUrl(allImages[0])}
                                alt={`${p.name} - Image 1`}
                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
                                onError={e => { 
                                  console.error('Image failed to load:', e.target.src);
                                  e.target.onerror = null; 
                                  e.target.src = '/placeholder-image.jpg'; 
                                }}
                              />
                            ) : (
                              <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
                            )}
                          </td>
                          {/* Image 2 */}
                          <td>
                            {allImages[1] ? (
                              <img
                                src={getImageUrl(allImages[1])}
                                alt={`${p.name} - Image 2`}
                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
                                onError={e => { 
                                  console.error('Image failed to load:', e.target.src);
                                  e.target.onerror = null; 
                                  e.target.src = '/placeholder-image.jpg'; 
                                }}
                              />
                            ) : (
                              <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
                            )}
                          </td>
                          {/* Image 3 */}
                          <td>
                            {allImages[2] ? (
                              <img
                                src={getImageUrl(allImages[2])}
                                alt={`${p.name} - Image 3`}
                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
                                onError={e => { 
                                  console.error('Image failed to load:', e.target.src);
                                  e.target.onerror = null; 
                                  e.target.src = '/placeholder-image.jpg'; 
                                }}
                              />
                            ) : (
                              <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="products-action-btn edit" 
                                onClick={() => handleEditProduct(p)}
                                title="Edit product"
                              >
                                Edit
                              </button>
                              <button 
                                className="products-action-btn delete" 
                                onClick={() => handleDeleteProduct(p.id || p._id)}
                                title="Delete product"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <AddProductModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAddProduct} />
        <AddCategoryModal 
          open={showCategoryModal} 
          onClose={() => setShowCategoryModal(false)} 
          onSuccess={handleCategorySuccess}
        />
        {showCategoryManagement && (
          <CategoryManagement 
            onClose={() => setShowCategoryManagement(false)} 
          />
        )}
        <ErrorBoundary>
          <EditProductModal 
            open={showEdit} 
            onClose={() => {
              setShowEdit(false);
              setEditingProduct(null);
            }} 
            product={editingProduct}
            onSubmit={handleUpdateProduct}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default Products;