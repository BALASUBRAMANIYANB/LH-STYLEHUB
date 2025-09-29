import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaHeart } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product, addToCart }) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    addToCart(product, selectedSize);
    setIsAddingToCart(false);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const formatPrice = (price) => {
    return `Rs. ${price.toFixed(2)}`;
  };

  return (
    <div className="product-card card">
      {/* Product Image */}
      <div className="product-image">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} />
        </Link>
        
        {/* Wishlist Button */}
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={toggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FaHeart />
        </button>
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="discount-badge">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <div className="product-category">
          {product.category}
        </div>
        
        <Link to={`/product/${product.id}`} className="product-name">
          <h3>{product.name}</h3>
        </Link>
        
        <p className="product-subtitle">{product.subtitle}</p>
        
        {/* Price Section */}
        <div className="product-price">
          {product.discountPrice ? (
            <>
              <span className="current-price">{formatPrice(product.discountPrice)}</span>
              <span className="original-price">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="current-price">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Size Selection */}
        <div className="size-selection">
          <div className="size-label">Size:</div>
          <div className="size-buttons">
            {sizes.map((size) => (
              <button
                key={size}
                className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          className="btn btn-primary add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <div className="loading-spinner"></div>
              Adding...
            </>
          ) : (
            <>
              <FaShoppingBag />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
