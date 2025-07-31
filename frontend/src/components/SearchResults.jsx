import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Products.css';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const query = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on new search
  }, [query]);

  useEffect(() => {
    if (query.trim()) {
      fetchProducts(currentPage);
    } else {
      setProducts([]);
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [query, currentPage]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(query)}&page=${page}&limit=32`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []));
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="products-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Search Results for "{query}"</h2>
        <button onClick={handleBackToHome} className="back-btn">Back to Homepage</button>
      </div>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && products.length === 0 && (
        <div className="empty">No products found.</div>
      )}
      <div className="products-grid">
        {products.map(product => (
          <div className="product-card" key={product._id} onClick={() => handleProductClick(product._id)}>
            <div className="product-image">
              <img
                src={`http://localhost:5000/${product.image}`}
                alt={product.name}
                onError={e => { e.target.src = 'https://via.placeholder.com/150x150?text=No+Image'; }}
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-price">${product.price}</p>
              <p className="product-description">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo; Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next &raquo;</button>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 