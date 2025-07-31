import React, { useState, useEffect } from 'react';
import AdminCategories from './AdminCategories';
import AdminProducts from './AdminProducts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      // You can add an API call here to verify user role
      // For now, we'll assume the token exists means they're logged in
      setUser({ role: 'admin' }); // This should come from your auth system
    } catch (err) {
      console.error('Error checking user role:', err);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-dashboard-error">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin dashboard.</p>
        <button onClick={() => window.location.href = '/'}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your e-commerce store</p>
      </div>

      <div className="admin-navigation">
        <button 
          className={`nav-tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          📂 Manage Categories
        </button>
        <button 
          className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Manage Products
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'categories' && (
          <div className="tab-content">
            <AdminCategories />
          </div>
        )}
        
        {activeTab === 'products' && (
          <div className="tab-content">
            <AdminProducts />
          </div>
        )}
      </div>

      <div className="admin-footer">
        <button 
          className="back-to-store-btn"
          onClick={() => window.location.href = '/'}
        >
          ← Back to Store
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard; 