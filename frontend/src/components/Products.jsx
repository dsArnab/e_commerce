import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Products.css';

const Products = ({ selectedCategory = null }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(selectedCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 32;

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update selectedCategoryFilter when selectedCategory prop changes
  useEffect(() => {
    console.log('Products component - selectedCategory prop changed:', selectedCategory);
    setSelectedCategoryFilter(selectedCategory);
    setCurrentPage(1); // Reset to first page when category changes
  }, [selectedCategory]);

  useEffect(() => {
    console.log('Products component - fetching products with filter:', selectedCategoryFilter);
    fetchProducts();
  }, [selectedCategoryFilter, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        console.log('Categories fetched:', data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:5000/api/products?page=${currentPage}&limit=${productsPerPage}`;
      
      if (selectedCategoryFilter) {
        url += `&category=${selectedCategoryFilter}`;
      }
      
      if (sortBy === 'price-low') {
        url += '&sort=price-asc';
      } else if (sortBy === 'price-high') {
        url += '&sort=price-desc';
      }
      
      console.log('Fetching products with URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      console.log('Products fetched:', data);
      
      // Handle both array and paginated response formats
      if (data.products && data.totalPages) {
        // Paginated response
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } else {
        // Array response (fallback)
        setProducts(data);
        setTotalPages(Math.ceil(data.length / productsPerPage));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (productId, e) => {
    e.stopPropagation(); // Prevent product card click
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      });

      if (response.ok) {
        alert('Product added to cart successfully!');
        // Refresh cart count in navbar by triggering a custom event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to add to cart');
      }
    } catch (err) {
      alert('Error adding to cart: ' + err.message);
    }
  };

  const handleBuyNow = async (productId, e) => {
    e.stopPropagation(); // Prevent product card click
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to purchase products');
        return;
      }

      // First add to cart
      await handleAddToCart(productId, e);
      
      // Then redirect to checkout
      navigate('/checkout');
    } catch (err) {
      alert('Error processing purchase: ' + err.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.categoryName : 'Category';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="error">Error: {error}</div>
        <button onClick={fetchProducts} className="retry-btn">Retry</button>
      </div>
    );
  }

  const safeProducts = Array.isArray(products) ? products : (products && Array.isArray(products.products) ? products.products : []);

  return (
    <div className="products-container">
      <div className="products-header">
        <h2>
          {selectedCategoryFilter 
            ? `Products in ${getCategoryName(selectedCategoryFilter)}`
            : 'All Products'
          }
        </h2>
        <div className="products-controls">
          <div className="category-filter">
            <label htmlFor="category-select">Filter by Category:</label>
            <select
              id="category-select"
              value={selectedCategoryFilter || ''}
              onChange={(e) => {
                const value = e.target.value || null;
                console.log('Category filter changed to:', value);
                setSelectedCategoryFilter(value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="products-grid">
        {safeProducts.map((product) => (
          <div 
            key={product._id} 
            className="product-card"
            onClick={() => handleProductClick(product._id)}
          >
            <div className="product-image">
              <img 
                src={`http://localhost:5000/${product.image}`} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-category">{product.category?.categoryName}</p>
              <p className="product-description">{product.description}</p>
              <div className="product-price">{formatPrice(product.price)}</div>
            </div>
            <div className="product-actions">
              <button 
                className="buy-now-btn"
                onClick={(e) => handleBuyNow(product._id, e)}
              >
                Buy Now
              </button>
              <button 
                className="add-to-cart-btn"
                onClick={(e) => handleAddToCart(product._id, e)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {renderPagination()}

      {safeProducts.length === 0 && (
        <div className="no-products">
          <p>
            {selectedCategoryFilter 
              ? `No products found in ${getCategoryName(selectedCategoryFilter)}.`
              : 'No products available at the moment.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Products; 