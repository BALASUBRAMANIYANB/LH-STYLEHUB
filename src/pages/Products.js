import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import './Products.css';

const Products = () => {
  const products = [
    {
      id: 1,
      name: 'OVERSIZED DAMN TEE',
      subtitle: 'THE CULTURE GLITCH',
      price: 749,
      originalPrice: 999,
    image: '/images/products/K-1.jpg',
      category: 'THE CULTURE GLITCH'
    },
    {
      id: 2,
      name: 'OVERSIZED I CAN FLY TEE',
      subtitle: 'TRAVIS SCOTT',
      price: 749,
      originalPrice: 999,
    image: '/images/products/T-1.jpg',
      category: 'TRAVIS SCOTT COLLECTION'
    },
    {
      id: 3,
      name: 'OVERSIZED XO HORIZON TEE',
      subtitle: 'THE WEEKND',
      price: 749,
      originalPrice: 999,
    image: '/images/products/W-1.jpg',
      category: 'THE WEEKND'
    },
  ];

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>T-Shirts</h1>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <div className="product-overlay">
                  <Link to={`/product/${product.id}`} className="view-btn">
                    View Product
                  </Link>
                </div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-subtitle">{product.subtitle}</p>
                
                <div className="product-price">
                  <span className="current-price">Rs. {product.price.toFixed(2)}</span>
                  <span className="original-price">Rs. {product.originalPrice.toFixed(2)}</span>
                  <span className="discount">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </div>

                <div className="product-actions">
                  <Link to={`/product/${product.id}`} className="add-to-cart">
                    Add to Cart
                  </Link>
                  <button className="buy-now">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collection Info */}
        <div className="collection-info">
          <div className="info-card">
            <h3>Premium Quality</h3>
            <p>220 GSM premium combed cotton for ultimate comfort and durability</p>
          </div>
          <div className="info-card">
            <h3>Oversized Fit</h3>
            <p>Relaxed oversized fit perfect for streetwear styling</p>
          </div>
          <div className="info-card">
            <h3>DTF Printing</h3>
            <p>High-quality DTF prints that stay vibrant even after multiple washes</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <h2>Ready to Rock the Streetwear Look?</h2>
          <p>Join the LH STYLEHUB movement and express your unique style</p>
          <div className="cta-buttons">
            <Link to="/" className="cta-btn primary">Back to Home</Link>
            <Link to="/story" className="cta-btn secondary">Our Story</Link>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Support Button */}
      <a href="https://wa.me/919080041049" className="whatsapp-support" target="_blank" rel="noopener noreferrer">
        <FaWhatsapp />
      </a>
    </div>
  );
};

export default Products;
