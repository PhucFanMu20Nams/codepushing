import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Toolbar.css';

function Toolbar() {
  const navigate = useNavigate();

  return (
    <aside className="toolbar">
      <div className="toolbar-logo">
        TEXTURA
      </div>
      <nav className="toolbar-nav">
        <button className="toolbar-nav-btn" onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
        <button className="toolbar-nav-btn">Order</button>
        <button className="toolbar-nav-btn">Customers</button>
        <button className="toolbar-nav-btn">Admin</button>
        <button className="toolbar-nav-btn" onClick={() => navigate('/admin/products')}>Products</button>
        <button className="toolbar-nav-btn">Analystic</button>
        <button className="toolbar-nav-btn">Setting</button>
      </nav>
    </aside>
  );
}

export default Toolbar;