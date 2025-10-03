import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import productData from '../data/products';
import './TShirts.css';

const TShirts = () => {
  const calculateDiscount = (original, current) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div className="tshirts-page">
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1>Premium T-Shirts Collection</h1>
          <p>Discover our exclusive range of high-quality, comfortable t-shirts for every occasion</p>
        </div>

        {/* Product Grid */}
        <div className="tshirts-grid">
          {productData.map((product) => (
            <div key={product.id} className="tshirt-card">
              <div className="tshirt-badge">
                {product.isNew && <span className="new-badge">New</span>}
                {product.originalPrice > product.price && (
                  <span className="discount-badge">
                    {calculateDiscount(product.originalPrice, product.price)}% OFF
                  </span>
                )}
              </div>

              <div className="tshirt-image-container">
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="tshirt-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </Link>
                <div className="tshirt-actions">
                  <button className="quick-view">Quick View</button>
                  <button className="add-to-cart">
                    <FaShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>

              <div className="tshirt-details">
                <h3 className="tshirt-name">
                  <Link to={`/product/${product.id}`}>
                    {product.name}
                  </Link>
                </h3>

                <p className="tshirt-description">
                  {product.description.substring(0, 60)}...
                </p>

                <div className="tshirt-price">
                  <span className="current-price">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice > product.price && (
                    <span className="original-price">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TShirts;
