import React, { useState, useEffect } from 'react';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: null
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : 'http://localhost:5000/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      // Reset form and refresh products
      setFormData({ name: '', price: '', description: '', category: '', image: null });
      setEditingProduct(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category._id,
      image: null
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', price: '', description: '', category: '', image: null });
    setEditingProduct(null);
    setShowForm(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return <div className="admin-products-loading">Loading...</div>;
  }

  const safeProducts = Array.isArray(products) ? products : (products && Array.isArray(products.products) ? products.products : []);

  return (
    <div className="admin-products-container">
      <div className="admin-products-header">
        <h2>Manage Products</h2>
        <button 
          className="add-product-btn"
          onClick={() => setShowForm(true)}
        >
          Add New Product
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="product-form-overlay">
          <div className="product-form">
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Category:</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Image:</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                  required={!editingProduct}
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
                <button type="button" className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-list">
        {safeProducts.map((product) => (
          <div key={product._id} className="product-item">
            <div className="product-image">
              <img 
                src={`http://localhost:5000/${product.image}`} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                }}
              />
            </div>
            <div className="product-details">
              <h4>{product.name}</h4>
              <p className="product-category">{product.category?.categoryName}</p>
              <p className="product-description">{product.description}</p>
              <p className="product-price">{formatPrice(product.price)}</p>
            </div>
            <div className="product-actions">
              <button 
                className="edit-btn"
                onClick={() => handleEdit(product)}
              >
                Edit
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDelete(product._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {safeProducts.length === 0 && (
        <div className="no-products">
          <p>No products available. Add your first product!</p>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 