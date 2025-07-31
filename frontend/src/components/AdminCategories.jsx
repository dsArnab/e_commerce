import React, { useState, useEffect } from 'react';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    image: null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
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
      formDataToSend.append('categoryName', formData.categoryName);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingCategory 
        ? `http://localhost:5000/api/categories/${editingCategory._id}`
        : 'http://localhost:5000/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      // Reset form and refresh categories
      setFormData({ categoryName: '', description: '', image: null });
      setEditingCategory(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      categoryName: category.categoryName,
      description: category.description || '',
      image: null
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setFormData({ categoryName: '', description: '', image: null });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="admin-categories-loading">Loading...</div>;
  }

  return (
    <div className="admin-categories-container">
      <div className="admin-categories-header">
        <h2>Manage Categories</h2>
        <button 
          className="add-category-btn"
          onClick={() => setShowForm(true)}
        >
          Add New Category
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="category-form-overlay">
          <div className="category-form">
            <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name:</label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Image:</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                  required={!editingCategory}
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
                <button type="button" className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="categories-list">
        {categories.map((category) => (
          <div key={category._id} className="category-item">
            <div className="category-image">
              <img 
                src={`http://localhost:5000/${category.image}`} 
                alt={category.categoryName}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                }}
              />
            </div>
            <div className="category-details">
              <h4>{category.categoryName}</h4>
              {category.description && <p>{category.description}</p>}
            </div>
            <div className="category-actions">
              <button 
                className="edit-btn"
                onClick={() => handleEdit(category)}
              >
                Edit
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDelete(category._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="no-categories">
          <p>No categories available. Add your first category!</p>
        </div>
      )}
    </div>
  );
};

export default AdminCategories; 