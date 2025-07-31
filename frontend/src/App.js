import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Categories from './components/Categories';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Profile from './components/Profile';
import LoginSignup from './components/LoginSignup';
import AdminDashboard from './components/AdminDashboard';
import Orders from './components/Orders';
import SearchResults from './components/SearchResults';
import Footer from './components/Footer';

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (categoryId) => {
    console.log('HomePage received category selection:', categoryId); // Debug log
    setSelectedCategory(categoryId);
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Categories onCategorySelect={handleCategorySelect} />
      <div id="products-section">
        <Products selectedCategory={selectedCategory} />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
