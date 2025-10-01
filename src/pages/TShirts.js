import React from 'react';
import { Link } from 'react-router-dom';
import './TShirts.css';

const tshirts = [
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

const TShirts = () => (
  <div className="tshirts-page">
    <div className="container">
      <div className="page-header">
        <h1>T-Shirts</h1>
      </div>
      <div className="tshirts-grid">
        {tshirts.map((product) => (
          <div key={product.id} className="tshirt-card">
            <div className="tshirt-image">
              <img src={product.image} alt={product.name} />
              <div className="tshirt-overlay">
                <Link to={`/product/${product.id}`} className="view-btn">
                  View Product
                </Link>
              </div>
            </div>
            <div className="tshirt-info">
              <h3 className="tshirt-name">{product.name}</h3>
              <p className="tshirt-subtitle">{product.subtitle}</p>
              <div className="tshirt-price">
                <span className="current-price">Rs. {product.price}</span>
                <span className="original-price">Rs. {product.originalPrice}</span>
                <span className="discount">{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default TShirts;
