import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch product details
      const productResponse = await fetch(`http://localhost:5000/api/products/${productId}`);
      if (!productResponse.ok) {
        throw new Error('Product not found');
      }
      const productData = await productResponse.json();
      setProduct(productData);

      // Fetch similar products (same category)
      const similarResponse = await fetch(`http://localhost:5000/api/products?category=${productData.category._id}`);
      if (similarResponse.ok) {
        const similarData = await similarResponse.json();
        // Always use an array for filtering
        const similarArray = Array.isArray(similarData)
          ? similarData
          : (similarData && Array.isArray(similarData.products) ? similarData.products : []);
        // Filter out the current product and limit to 4 similar products
        const filteredSimilar = similarArray
          .filter(p => p._id !== productId)
          .slice(0, 4);
        setSimilarProducts(filteredSimilar);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity
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

  const handleBuyNow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to purchase products');
        navigate('/login');
        return;
      }

      // First add to cart
      await handleAddToCart();
      
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

  const handleSimilarProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        <div className="error">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Products
        </button>
      </div>

      <div className="product-detail-content">
        <div className="product-detail-left">
          <div className="product-image-large">
            <img 
              src={`http://localhost:5000/${product.image}`} 
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
              }}
            />
          </div>
        </div>

        <div className="product-detail-right">
          <div className="product-info-detailed">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-category">{product.category?.categoryName}</p>
            <div className="product-price-large">{formatPrice(product.price)}</div>
            <p className="product-description-detailed">{product.description}</p>
            
            <div className="product-actions-detailed">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="add-to-cart-btn-large"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
                <button 
                  className="buy-now-btn-large"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="similar-products-section">
          <h2>Similar Products</h2>
          <div className="products-grid">
            {similarProducts.map((similarProduct) => (
              <div 
                key={similarProduct._id} 
                className="product-card"
                onClick={() => handleSimilarProductClick(similarProduct._id)}
              >
                <div className="product-image">
                  <img 
                    src={`http://localhost:5000/${similarProduct.image}`} 
                    alt={similarProduct.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{similarProduct.name}</h3>
                  <p className="product-category">{similarProduct.category?.categoryName}</p>
                  <div className="product-price">{formatPrice(similarProduct.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 