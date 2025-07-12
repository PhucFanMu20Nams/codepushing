import React, { useEffect, useState } from 'react';
import Toolbar from './Toolbar';
import './Products.css';
import apiService from '../utils/apiService.js';

function AddProductModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    brand: '',
    price: '',
    category: '',
    images: []
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    if (!open) {
      setForm({ id: '', name: '', brand: '', price: '', category: '', images: [] });
      setErrors({});
      setPreview([]);
    }
  }, [open]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = e => {
    const files = Array.from(e.target.files);
    setForm({ ...form, images: files });
    setPreview(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = e => {
    e.preventDefault();
    let newErrors = {};
    if (!form.id) newErrors.id = true;
    if (!form.name) newErrors.name = true;
    if (!form.brand) newErrors.brand = true;
    if (!form.price) newErrors.price = true;
    if (!form.category) newErrors.category = true;
    if (!form.images || form.images.length < 2) newErrors.images = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Thêm sản phẩm mới</h3>
        <form onSubmit={handleSubmit} className="add-product-form">
          <input name="id" placeholder="ID" value={form.id} onChange={handleChange} />
          {errors.id && <div className="form-error">thiếu ID</div>}
          <input name="name" placeholder="Tên" value={form.name} onChange={handleChange} />
          {errors.name && <div className="form-error">thiếu Tên</div>}
          <input name="brand" placeholder="Thương hiệu" value={form.brand} onChange={handleChange} />
          {errors.brand && <div className="form-error">thiếu Thương hiệu</div>}
          <input name="price" placeholder="Giá" type="number" value={form.price} onChange={handleChange} />
          {errors.price && <div className="form-error">thiếu Giá</div>}
          <input name="category" placeholder="Danh mục" value={form.category} onChange={handleChange} />
          {errors.category && <div className="form-error">thiếu Danh Mục</div>}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImages}
            style={{ marginTop: 8 }}
          />
          {errors.images && <div className="form-error">thiếu ít nhất 2 ảnh</div>}
          <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
            {preview.map((src, idx) => (
              <img key={idx} src={src} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
            ))}
          </div>
          <button type="submit" className="products-action-btn" style={{ width: '100%' }}>Submit</button>
          <button type="button" className="products-action-btn" style={{ width: '100%', marginTop: 8, background: '#ccc', color: '#222' }} onClick={onClose}>Đóng</button>
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
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Fetch products using cached API service
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

    fetchProducts();
  }, [showAdd, successMsg]);

  const getImageUrl = (imagePath) => {
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

      // Get token from localStorage (assuming it's stored there)
      const token = localStorage.getItem('admin_token');
      
      await apiService.uploadProductWithImages(formData, token);
      
      setShowAdd(false);
      setSuccessMsg('Add product successful');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (error) {
      console.error('Error adding product:', error);
      setSuccessMsg('Có lỗi xảy ra!');
    }
  };

  return (
    <div className="dashboard-root">
      <Toolbar />
      <main className="dashboard-content">
        <div className="products-page">
          <div className="products-action-container">
            <input
              className="products-search"
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="products-action-btn">Add Category</button>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                        {search ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Chưa có sản phẩm nào'}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => {
                      // Get all images from gallery or fallback to single image
                      const allImages = p.gallery && Array.isArray(p.gallery) ? p.gallery : [p.image || p.imageUrl];
                      
                      return (
                        <tr key={p.id || p._id}>
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
      </main>
    </div>
  );
}

export default Products;