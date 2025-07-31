import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const cartData = await response.json();
      setCart(cartData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: newQuantity
        })
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart data
        // Trigger cart update event for navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update quantity');
      }
    } catch (err) {
      alert('Error updating quantity: ' + err.message);
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId
        })
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart data
        // Trigger cart update event for navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to remove item');
      }
    } catch (err) {
      alert('Error removing item: ' + err.message);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart data
        // Trigger cart update event for navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to clear cart');
      }
    } catch (err) {
      alert('Error clearing cart: ' + err.message);
    }
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = 10.00;
    const tax = subtotal * 0.08;
    return subtotal + shipping + tax;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some products to your cart to see them here.</p>
          <button onClick={() => navigate('/')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <button onClick={() => navigate('/')} className="back-btn">
          ← Continue Shopping
        </button>
      </div>

      <div className="cart-content">
        <div className="cart-items-section">
          <div className="cart-items-header">
            <h2>Cart Items ({cart.items.length})</h2>
            <button onClick={clearCart} className="clear-cart-btn">
              Clear Cart
            </button>
          </div>

          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.product._id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={`http://localhost:5000/${item.product.image}`} 
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-category">{item.product.category?.categoryName}</p>
                  <p className="item-price">{formatPrice(item.product.price)}</p>
                </div>

                <div className="item-quantity">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  <p className="item-total-price">{formatPrice(item.product.price * item.quantity)}</p>
                </div>

                <div className="item-actions">
                  <button 
                    className="remove-item-btn"
                    onClick={() => removeItem(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary-section">
          <h2>Order Summary</h2>
          
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(calculateSubtotal())}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{formatPrice(10.00)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>{formatPrice(calculateSubtotal() * 0.08)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
          </div>

          <div className="cart-actions">
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 