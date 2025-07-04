import React from 'react';
import Toolbar from './Toolbar';
import CacheStats from './CacheStats';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-root">
      <Toolbar />
      <main className="dashboard-content">
        <h1>Admin Dashboard</h1>
        
        {/* Cache Stats - Only visible to admin */}
        <div className="admin-section">
          <h2>System Performance</h2>
          <CacheStats />
        </div>
        
        {/* Other admin dashboard content */}
        <div className="admin-section">
          <h2>Quick Actions</h2>
          <p>Admin dashboard content goes here...</p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;