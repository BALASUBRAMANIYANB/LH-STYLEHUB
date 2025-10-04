import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaWhatsapp, FaArrowLeft, FaCheck } from 'react-icons/fa';
import productData from '../data/products';
import './Products.css';

const Products = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Find the product by ID
  const product = productData.find(p => p.id === parseInt(id));

  // If product not found, redirect to T-Shirts page
  React.useEffect(() => {
    if (!product) {
      navigate('/t-shirts');
    }
  }, [product, navigate]);

  if (!product) {
    return null; // or a loading message
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    // Add to cart logic here
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };
  
  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    // Proceed to checkout with selected size and quantity
    navigate('/checkout', {
      state: {
        product: {
          ...product,
          selectedSize,
          quantity
        }
      }
    });
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-button" onClick={() => navigate('/t-shirts')}>
          <FaArrowLeft /> Back to T-Shirts
        </button>
        
        <div className="product-detail-container">
          <div className="product-gallery">
            <div className="main-image">
              <img 
                src={product.image} 
                alt={product.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
            </div>
          </div>
          
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-subtitle">{product.subtitle}</p>
            
            <div className="price-container">
              <span className="current-price">Rs. {product.price}</span>
              <span className="original-price">Rs. {product.originalPrice}</span>
              <span className="discount">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            </div>
            
            <div className="product-description">
              <p>{product.description}</p>
            </div>
            
            <div className="product-options">
              <div className="option-group">
                <label>Select Size</label>
                <div className="size-options">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="option-group">
                <label>Quantity</label>
                <div className="quantity-selector">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
                </div>
              </div>
            </div>
            
            <div className="product-actions">
              <button 
                className={`add-to-cart ${addedToCart ? 'added' : ''}`} 
                onClick={handleAddToCart}
                disabled={addedToCart}
              >
                {addedToCart ? (
                  <>
                    <FaCheck /> Added to Cart
                  </>
                ) : (
                  <>
                    <FaShoppingCart /> Add to Cart
                  </>
                )}
              </button>
              <button 
                className="buy-now" 
                onClick={handleBuyNow}
                disabled={!selectedSize}
              >
                Buy Now
              </button>
            </div>
            
            <div className="product-details">
              <h3>Product Details</h3>
              <ul>
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* WhatsApp Support */}
      <a
        href="https://wa.me/911234567890"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaWhatsapp className="whatsapp-icon" />
      </a>
    </div>
  );
};

export default Products;
