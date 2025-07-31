import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
import { Dialog } from '@mui/material';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pinCode: ''
  });
  const [checkoutData, setCheckoutData] = useState({
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      const cartData = await response.json();
      setCart(cartData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5000/api/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch addresses');
      const data = await response.json();
      setAddresses(data);
      if (data.length > 0) setSelectedAddressId(data[0]._id);
    } catch (err) {
      // ignore for now
    }
  };

  const handleAddressSelect = (e) => {
    setSelectedAddressId(e.target.value);
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5000/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newAddress)
      });
      if (!response.ok) throw new Error('Failed to add address');
      const added = await response.json();
      setAddresses(prev => [...prev, added]);
      setSelectedAddressId(added._id);
      setShowAddAddress(false);
      setNewAddress({ addressLine1: '', street: '', landmark: '', city: '', state: '', pinCode: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddressId) {
      alert('Please select a shipping address.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      // Place the order by calling the backend
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addressId: selectedAddressId })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to place order');
      }
      // Refresh cart after placing order
      await fetchCart();
      alert('Order placed successfully! Thank you for your purchase.');
      navigate('/orders'); // Redirect to orders page
    } catch (err) {
      alert('Error placing order: ' + err.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading">Loading checkout...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some products to your cart before checkout.</p>
          <button onClick={() => navigate('/')} className="back-btn">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <button onClick={() => navigate('/')} className="back-btn">← Back to Shopping</button>
      </div>
      <div className="checkout-content">
        <div className="checkout-form-section">
          <h2>Shipping Address</h2>
          {addresses.length > 0 ? (
            <div className="address-list">
              {addresses.map(addr => (
                <label key={addr._id} className={`address-option${selectedAddressId === addr._id ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name="selectedAddress"
                    value={addr._id}
                    checked={selectedAddressId === addr._id}
                    onChange={handleAddressSelect}
                  />
                  <span>
                    <strong>{addr.addressLine1}</strong>, {addr.street}, {addr.landmark}, {addr.city}, {addr.state} - {addr.pinCode}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div>No saved addresses found.</div>
          )}
          <button type="button" className="add-address-btn" onClick={() => setShowAddAddress(!showAddAddress)}>
            {showAddAddress ? 'Cancel' : 'Add New Address'}
          </button>
          {showAddAddress && (
            <form className="add-address-form" onSubmit={handleAddNewAddress} style={{ marginTop: 10, marginBottom: 20 }}>
              <input type="text" name="addressLine1" placeholder="Address Line 1" value={newAddress.addressLine1} onChange={handleNewAddressChange} required />
              <input type="text" name="street" placeholder="Street" value={newAddress.street} onChange={handleNewAddressChange} required />
              <input type="text" name="landmark" placeholder="Landmark" value={newAddress.landmark} onChange={handleNewAddressChange} required />
              <input type="text" name="city" placeholder="City" value={newAddress.city} onChange={handleNewAddressChange} required />
              <input type="text" name="state" placeholder="State" value={newAddress.state} onChange={handleNewAddressChange} required />
              <input type="text" name="pinCode" placeholder="PIN Code" value={newAddress.pinCode} onChange={handleNewAddressChange} required />
              <button type="submit" className="save-address-btn">Save Address</button>
            </form>
          )}

          <h2>Payment Information</h2>
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method *</label>
              <select id="paymentMethod" name="paymentMethod" value={checkoutData.paymentMethod} onChange={handleInputChange} required>
                <option value="credit-card">Credit Card</option>
                <option value="debit-card">Debit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number *</label>
              <input type="text" id="cardNumber" name="cardNumber" value={checkoutData.cardNumber} onChange={handleInputChange} placeholder="1234 5678 9012 3456" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cardExpiry">Expiry Date *</label>
                <input type="text" id="cardExpiry" name="cardExpiry" value={checkoutData.cardExpiry} onChange={handleInputChange} placeholder="MM/YY" required />
              </div>
              <div className="form-group">
                <label htmlFor="cardCvv">CVV *</label>
                <input type="text" id="cardCvv" name="cardCvv" value={checkoutData.cardCvv} onChange={handleInputChange} placeholder="123" required />
              </div>
            </div>
            <button type="submit" className="place-order-btn">Place Order</button>
          </form>
        </div>
        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cart.items.map((item) => (
              <div key={item.product._id} className="order-item">
                <div className="item-image">
                  <img 
                    src={`http://localhost:5000/${item.product.image}`} 
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p className="item-price">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>{formatPrice(10.00)}</span>
            </div>
            <div className="total-row">
              <span>Tax:</span>
              <span>{formatPrice(calculateTotal() * 0.08)}</span>
            </div>
            <div className="total-row total-final">
              <span>Total:</span>
              <span>{formatPrice(calculateTotal() + 10.00 + (calculateTotal() * 0.08))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 