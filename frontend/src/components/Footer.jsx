import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-content">
      <div className="footer-section about">
        <h3>About Us</h3>
        <p>
          Welcome to our ecommerce platform! We offer a wide range of products and a seamless shopping experience.
        </p>
      </div>
      <div className="footer-section contact">
        <h3>Contact Us</h3>
        <p>Email: support@ecommerce.com</p>
        <p>Phone: +1 234 567 8901</p>
      </div>
      <div className="footer-section social">
        <h3>Follow Us</h3>
        <div className="footer-social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Fb</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">Tw</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Ig</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">In</a>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      &copy; {new Date().getFullYear()} Ecommerce. All rights reserved.
    </div>
  </footer>
);

export default Footer; 