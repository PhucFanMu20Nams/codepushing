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
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Fetch products using cached API service
    const fetchProducts = async () => {
      try {
        const data = await apiService.getProducts({ limit: 1000 });
        setProducts(data.products || data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [showAdd, successMsg]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
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
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Thương hiệu</th>
                  <th>Giá</th>
                  <th>Danh mục</th>
                  <th>Ảnh</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.brand}</td>
                    <td>{p.price.toLocaleString()}₫</td>
                    <td>{p.category}</td>
                    <td>
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                        onError={e => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <AddProductModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAddProduct} />
      </main>
    </div>
  );
}

export default Products;