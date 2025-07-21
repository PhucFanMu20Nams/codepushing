import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Toolbar.css';

function Toolbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout, adminUser } = useAuth();

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/admin/login');
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Helper function to determine if a route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="toolbar">
      <div className="toolbar-logo">
        TEXTURA
      </div>
      <nav className="toolbar-nav">
        <button 
          className={`toolbar-nav-btn ${isActive('/admin/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/admin/dashboard')}
        >
          Dashboard
        </button>
        <button className="toolbar-nav-btn disabled" disabled>
          Order
          <span className="coming-soon">Coming Soon</span>
        </button>
        <button className="toolbar-nav-btn disabled" disabled>
          Customers
          <span className="coming-soon">Coming Soon</span>
        </button>
        <button className="toolbar-nav-btn disabled" disabled>
          Admin
          <span className="coming-soon">Coming Soon</span>
        </button>
        <button 
          className={`toolbar-nav-btn ${isActive('/admin/products') ? 'active' : ''}`}
          onClick={() => navigate('/admin/products')}
        >
          Products
        </button>
        <button className="toolbar-nav-btn disabled" disabled>
          Analystic
          <span className="coming-soon">Coming Soon</span>
        </button>
        <button className="toolbar-nav-btn disabled" disabled>
          Setting
          <span className="coming-soon">Coming Soon</span>
        </button>
      </nav>
      
      <div className="toolbar-footer">
        {adminUser?.username && (
          <div className="admin-info">
            <span className="admin-label">Signed in as:</span>
            <span className="admin-username">{adminUser.username}</span>
          </div>
        )}
        <button className="toolbar-logout-btn" onClick={handleLogout}>
          <span className="logout-icon">↩</span>
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout{adminUser?.username ? `, ${adminUser.username}` : ''}?</p>
            <div className="logout-modal-actions">
              <button className="logout-confirm-btn" onClick={confirmLogout}>
                Yes, Logout
              </button>
              <button className="logout-cancel-btn" onClick={cancelLogout}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Toolbar;