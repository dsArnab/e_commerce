import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`http://localhost:5000/api/orders?page=${page}&limit=32`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : (Array.isArray(data.orders) ? data.orders : []));
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return <div className="orders-container"><div className="loading">Loading orders...</div></div>;
  }
  if (error) {
    return <div className="orders-container"><div className="error">{error}</div></div>;
  }
  if (!orders.length) {
    return <div className="orders-container"><div className="empty">No orders found.</div></div>;
  }

  return (
    <div className="orders-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Orders</h1>
        <button onClick={handleBackToHome} className="back-btn">Back to Homepage</button>
      </div>
      {orders.map(order => (
        <div className="order-card" key={order._id}>
          <div className="order-header">
            <span><strong>Order ID:</strong> {order._id}</span>
            <span><strong>Status:</strong> <span className={`order-status ${order.status}`}>{order.status}</span></span>
            <span><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="order-address">
            <strong>Shipping Address:</strong><br/>
            {order.address && (
              <span>
                {order.address.addressLine1}, {order.address.street}, {order.address.landmark},<br/>
                {order.address.city}, {order.address.state} - {order.address.pinCode}
              </span>
            )}
          </div>
          <div className="order-items">
            <strong>Items:</strong>
            {order.items.map(item => (
              <div className="order-item" key={item.product._id}>
                <img
                  src={`http://localhost:5000/${item.product.image}`}
                  alt={item.product.name}
                  className="order-item-image"
                  onError={e => { e.target.src = 'https://via.placeholder.com/50x50?text=No+Image'; }}
                />
                <div className="order-item-details">
                  <span>{item.product.name}</span>
                  <span>Qty: {item.quantity}</span>
                  <span>Price: ${item.product.price}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Total:</strong> ${order.total}
          </div>
        </div>
      ))}
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

export default Orders; 