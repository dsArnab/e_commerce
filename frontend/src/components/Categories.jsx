import React, { useState, useEffect } from "react";
import "./Categories.css";

const Categories = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(6); // Default visible categories

  useEffect(() => {
    fetchCategories();
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const updateVisibleCount = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setVisibleCount(3); // Mobile: show 3 categories
    } else {
      setVisibleCount(6); // Desktop: show 6 categories
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    console.log("Category clicked:", categoryId);
    if (onCategorySelect) {
      console.log("Calling onCategorySelect with:", categoryId);
      onCategorySelect(categoryId);
    } else {
      console.log("onCategorySelect function not provided");
    }
  };

  const nextCategories = () => {
    setCurrentIndex(prev => Math.min(prev + visibleCount, categories.length - visibleCount));
  };

  const prevCategories = () => {
    setCurrentIndex(prev => Math.max(prev - visibleCount, 0));
  };

  const canGoNext = currentIndex + visibleCount < categories.length;
  const canGoPrev = currentIndex > 0;

  if (loading) {
    return (
      <div className="categories-container">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2>Product Categories</h2>
        <p>Explore our wide range of products by category</p>
      </div>

      <div className="categories-carousel">
        {canGoPrev && (
          <button className="carousel-arrow prev-arrow" onClick={prevCategories}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div className="categories-row">
          {categories.slice(currentIndex, currentIndex + visibleCount).map((category) => (
            <div
              key={category._id}
              className="category-card"
              onClick={() => handleCategoryClick(category._id)}
            >
              <div className="category-image">
                <img
                  src={`http://localhost:5000/${category.image}`}
                  alt={category.categoryName}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
              </div>
              <div className="category-info">
                <h3>{category.categoryName}</h3>
              </div>
            </div>
          ))}
        </div>

        {canGoNext && (
          <button className="carousel-arrow next-arrow" onClick={nextCategories}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {categories.length === 0 && (
        <div className="no-categories">
          <p>No categories available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;
