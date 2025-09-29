import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaShare, FaHeart, FaTimes, FaChevronLeft, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import './ProductDetails.css';

const ProductDetails = ({ addToCart }) => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);

  // Product data based on the specification
  const products = {
    1: {
      id: 1,
      name: 'OVERSIZED DAMN TEE',
      subtitle: 'THE CULTURE GLITCH',
      price: 749,
      originalPrice: 999,
      images: [
    '/images/products/K-1.jpg',
    '/images/products/K-2.jpg',
    '/images/products/K-3.jpg',
    '/images/products/K-4.jpg',
    '/images/products/K-5.jpg',
    '/images/products/K-6.jpg'
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Black', value: 'black', available: true },
        { name: 'White', value: 'white', available: true }
      ],
      fabric: '220 GSM, 100% Combed Cotton (Single Jersey)',
      fit: 'Relaxed Oversized Fit for streetwear styling',
      finish: 'Bio-Washed & Pre-Shrunk for long-lasting softness',
      neckline: 'Durable Ribbed Crew Neck',
      stitching: 'Double-stitched for extra strength & durability',
      breathability: 'Lightweight yet premium, perfect for Indian weather',
      print: 'High-Quality DTF Print (crack-resistant, vibrant colors, long-lasting even after multiple wash)',
      washCare: [
        'Machine wash cold (30°C) with similar colors',
        'Use mild detergent only',
        'Avoid bleach & fabric softeners (to protect the DTF print)'
      ],
      drying: [
        'Do not tumble dry',
        'Dry in shade to maintain fabric & print quality'
      ],
      ironing: [
        'Iron inside out on low heat',
        'Never iron directly on DTF print'
      ],
      storage: [
        'Fold neatly (avoid stretching)',
        'Store in a cool, dry place'
      ],
      returnPolicy: 'Our tees are a one-way love affair. Once they\'re yours, they stay yours—no returns, no take-backs. Just endless vibes. We put a lot of care into every piece we create. Since each order is made especially for you, we don\'t accept returns or exchanges. Please check the size chart before ordering.',
      reviews: [
        { id: 1, name: 'Rahul S.', rating: 5, comment: 'Perfect fit and amazing quality! The oversized look is exactly what I wanted.', date: '2024-01-15' },
        { id: 2, name: 'Priya M.', rating: 5, comment: 'Love the fabric and the print quality. Highly recommend!', date: '2024-01-10' },
        { id: 3, name: 'Aryan K.', rating: 4, comment: 'Great streetwear vibes. The fit is perfect for my style.', date: '2024-01-08' }
      ]
    },
    2: {
      id: 2,
      name: 'OVERSIZED I CAN FLY TEE',
      subtitle: 'TRAVIS SCOTT',
      price: 749,
      originalPrice: 999,
      images: [
    '/images/products/T-1.jpg',
    '/images/products/T-2.jpg',
    '/images/products/T-3.jpg',
    '/images/products/T-4.jpg',
    '/images/products/T-5.jpg',
    '/images/products/T-6.jpg'
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      fabric: '220 GSM, 100% Combed Cotton (Single Jersey)',
      fit: 'Relaxed Oversized Fit for streetwear styling',
      finish: 'Bio-Washed & Pre-Shrunk for long-lasting softness',
      neckline: 'Durable Ribbed Crew Neck',
      stitching: 'Double-stitched for extra strength & durability',
      breathability: 'Lightweight yet premium, perfect for Indian weather',
      print: 'High-Quality DTF Print (crack-resistant, vibrant colors, long-lasting even after multiple wash)',
      washCare: [
        'Machine wash cold (30°C) with similar colors',
        'Use mild detergent only',
        'Avoid bleach & fabric softeners (to protect the DTF print)'
      ],
      drying: [
        'Do not tumble dry',
        'Dry in shade to maintain fabric & print quality'
      ],
      ironing: [
        'Iron inside out on low heat',
        'Never iron directly on DTF print'
      ],
      storage: [
        'Fold neatly (avoid stretching)',
        'Store in a cool, dry place'
      ],
      returnPolicy: 'Our tees are a one-way love affair. Once they\'re yours, they stay yours—no returns, no take-backs. Just endless vibes. We put a lot of care into every piece we create. Since each order is made especially for you, we don\'t accept returns or exchanges. Please check the size chart before ordering.',
      reviews: [
        { id: 1, name: 'Vikram R.', rating: 5, comment: 'Travis Scott vibes! The quality is top-notch.', date: '2024-01-12' },
        { id: 2, name: 'Neha P.', rating: 5, comment: 'Perfect oversized fit and amazing print quality.', date: '2024-01-09' }
      ]
    },
    3: {
      id: 3,
      name: 'OVERSIZED XO HORIZON TEE',
      subtitle: 'THE WEEKND',
      price: 749,
      originalPrice: 999,
      images: [
    '/images/products/W-1.jpg',
    '/images/products/W-2.jpg',
    '/images/products/W-3.jpg',
    '/images/products/W-4.jpg',
    '/images/products/W-5.jpg',
    '/images/products/W-6.jpg'
      ],
      sizes: ['S','M', 'L', 'XL', 'XXL'],
      fabric: '220 GSM, 100% Combed Cotton (Single Jersey)',
      fit: 'Relaxed Oversized Fit for streetwear styling',
      finish: 'Bio-Washed & Pre-Shrunk for long-lasting softness',
      neckline: 'Durable Ribbed Crew Neck',
      stitching: 'Double-stitched for extra strength & durability',
      breathability: 'Lightweight yet premium, perfect for Indian weather',
      print: 'High-Quality DTF Print (crack-resistant, vibrant colors, long-lasting even after multiple wash)',
      washCare: [
        'Machine wash cold (30°C) with similar colors',
        'Use mild detergent only',
        'Avoid bleach & fabric softeners (to protect the DTF print)'
      ],
      drying: [
        'Do not tumble dry',
        'Dry in shade to maintain fabric & print quality'
      ],
      ironing: [
        'Iron inside out on low heat',
        'Never iron directly on DTF print'
      ],
      storage: [
        'Fold neatly (avoid stretching)',
        'Store in a cool, dry place'
      ],
      returnPolicy: 'Our tees are a one-way love affair. Once they\'re yours, they stay yours—no returns, no take-backs. Just endless vibes. We put a lot of care into every piece we create. Since each order is made especially for you, we don\'t accept returns or exchanges. Please check the size chart before ordering.',
      reviews: [
        { id: 1, name: 'Arjun M.', rating: 5, comment: 'Mr Bean vibes! Love the quirky design.', date: '2024-01-14' },
        { id: 2, name: 'Zara K.', rating: 4, comment: 'Great quality and comfortable fit.', date: '2024-01-11' }
      ]
    },
  };

  const product = products[id];

  if (!product) {
    return (
      <div className="product-details">
        <div className="container">
          <div className="product-not-found">
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist.</p>
            <Link to="/products" className="back-to-products">Back to Products</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart({
      ...product,
      image: product.images[0], // Use first image for cart
      selectedSize,
      quantity
    });
    alert(`${product.name} (Size: ${selectedSize}) added to cart!`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this amazing ${product.name} from LH STYLEHUB!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  

  return (
    <div className="kiivo-product-details">
      <div className="kiivo-page-container">
        {/* Back Button */}
        <Link to="/products" className="back-button">
          <FaArrowLeft />
          <span>Back to Products</span>
        </Link>

        <div className="product-layout">
          {/* Product Images */}
          <div className="product-images">
            <div className="image-carousel">
              <div className="carousel-container">
                <div 
                  className="carousel-track"
                  style={{ transform: `translateX(-${activeImage * 100}%)` }}
                >
                  {product.images.map((image, index) => (
                    <div key={index} className="carousel-slide">
                      <img src={image} alt={`${product.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
                
                {/* Navigation Arrows */}
                <button 
                  className="carousel-nav carousel-prev"
                  onClick={() => setActiveImage(activeImage > 0 ? activeImage - 1 : product.images.length - 1)}
                  disabled={product.images.length <= 1}
                >
                  <FaChevronLeft />
                </button>
                
                <button 
                  className="carousel-nav carousel-next"
                  onClick={() => setActiveImage(activeImage < product.images.length - 1 ? activeImage + 1 : 0)}
                  disabled={product.images.length <= 1}
                >
                  <FaChevronRight />
                </button>
              </div>
              
              {/* Image Counter */}
              <div className="image-counter">
                <span>{activeImage + 1} / {product.images.length}</span>
              </div>
            </div>
            
            {/* Thumbnail Navigation */}
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${index === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-name">{product.name}</h1>
              <p className="product-subtitle">{product.subtitle}</p>
              
              

              {/* Live Viewers */}
              <div className="live-viewers">
                <span className="viewer-icon">👁</span>
                <span className="viewer-count">{Math.floor(Math.random() * 5) + 1}</span>
                <span className="viewer-text">People are viewing this right now</span>
              </div>

              {/* Price */}
              <div className="product-price">
                <span className="current-price">₹{product.price}</span>
                <span className="original-price">₹{product.originalPrice}</span>
                <span className="discount">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </div>
            </div>

            {/* Size Selection */}
            <div className="size-selection">
              <div className="size-header">
                <h3>Select Size</h3>
                <button 
                  className="size-guide-btn"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                >
                  Size Guide
                </button>
              </div>
              
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

              {/* Size Guide Modal */}
              {showSizeGuide && (
                <div className="size-guide-modal">
                  <div className="size-guide-content">
                    <div className="size-guide-header">
                      <h3>Size Guide</h3>
                      <button onClick={() => setShowSizeGuide(false)}>
                        <FaTimes />
                      </button>
                    </div>
                    <div className="size-chart">
                      <table>
                        <thead>
                          <tr>
                            <th>Size</th>
                            <th>Chest (inches)</th>
                            <th>Length (inches)</th>
                            <th>Shoulder (inches)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>S</td>
                            <td>38-40</td>
                            <td>26-27</td>
                            <td>16-17</td>
                          </tr>
                          <tr>
                            <td>M</td>
                            <td>42-44</td>
                            <td>28-29</td>
                            <td>18-19</td>
                          </tr>
                          <tr>
                            <td>L</td>
                            <td>44-46</td>
                            <td>29-30</td>
                            <td>19-20</td>
                          </tr>
                          <tr>
                            <td>XL</td>
                            <td>46-48</td>
                            <td>30-31</td>
                            <td>20-21</td>
                          </tr>
                          <tr>
                            <td>XXL</td>
                            <td>48-50</td>
                            <td>31-32</td>
                            <td>21-22</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && (
              <div className="color-selection">
                <h3>Select Color</h3>
                <div className="color-options">
                  {product.colors.map((color) => (
                    <button
                      key={color.value}
                      className={`color-option ${selectedColor === color.value ? 'selected' : ''} ${!color.available ? 'unavailable' : ''}`}
                      onClick={() => color.available && setSelectedColor(color.value)}
                      disabled={!color.available}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="quantity-selection">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                <FaShoppingCart />
                Add to Cart
              </button>
              
              <button 
                className="buy-now-btn"
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                Buy It Now
              </button>
              
              <button className="wishlist-btn">
                <FaHeart />
              </button>
              
              <button className="share-btn" onClick={handleShare}>
                <FaShare />
              </button>
            </div>

          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-details-tabs">
          <div className="tab-content">
            <div className="tab-section">
              <h3>Product Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Fabric:</strong> {product.fabric}
                </div>
                <div className="detail-item">
                  <strong>Fit:</strong> {product.fit}
                </div>
                <div className="detail-item">
                  <strong>Finish:</strong> {product.finish}
                </div>
                <div className="detail-item">
                  <strong>Neckline:</strong> {product.neckline}
                </div>
                <div className="detail-item">
                  <strong>Stitching:</strong> {product.stitching}
                </div>
                <div className="detail-item">
                  <strong>Breathability:</strong> {product.breathability}
                </div>
                <div className="detail-item">
                  <strong>Print:</strong> {product.print}
                </div>
              </div>
            </div>

            <div className="tab-section">
              <h3>Aftercare Instructions</h3>
              
              <div className="care-section">
                <h4>Wash Care</h4>
                <ul>
                  {product.washCare.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="care-section">
                <h4>Drying</h4>
                <ul>
                  {product.drying.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="care-section">
                <h4>Ironing</h4>
                <ul>
                  {product.ironing.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="care-section">
                <h4>Storage</h4>
                <ul>
                  {product.storage.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            
          </div>
        </div>

        {/* Product Information Accordion */}
        <div className="product-info-accordion">
          <div className="accordion-item">
            <div 
              className="accordion-header"
              onClick={() => toggleAccordion('description')}
            >
              <span className="accordion-title">DESCRIPTION</span>
              <FaChevronDown className={`accordion-icon ${activeAccordion === 'description' ? 'active' : ''}`} />
            </div>
            {activeAccordion === 'description' && (
              <div className="accordion-content">
                <div className="product-description">
                  <p>{product.description}</p>
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>Fabric:</strong> {product.fabric}
                    </div>
                    <div className="detail-item">
                      <strong>Fit:</strong> {product.fit}
                    </div>
                    <div className="detail-item">
                      <strong>Finish:</strong> {product.finish}
                    </div>
                    <div className="detail-item">
                      <strong>Neckline:</strong> {product.neckline}
                    </div>
                    <div className="detail-item">
                      <strong>Stitching:</strong> {product.stitching}
                    </div>
                    <div className="detail-item">
                      <strong>Breathability:</strong> {product.breathability}
                    </div>
                    <div className="detail-item">
                      <strong>Print:</strong> {product.print}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="accordion-item">
            <div 
              className="accordion-header"
              onClick={() => toggleAccordion('shipping')}
            >
              <span className="accordion-title">SHIPPING</span>
              <FaChevronDown className={`accordion-icon ${activeAccordion === 'shipping' ? 'active' : ''}`} />
            </div>
            {activeAccordion === 'shipping' && (
              <div className="accordion-content">
                <div className="shipping-info">
                  <h4>Shipping Information</h4>
                  <ul>
                    <li>Free shipping on orders above ₹999</li>
                    <li>Standard delivery: 3-5 business days</li>
                    <li>Cash on delivery available</li>
                    <li>Track your order with real-time updates</li>
                  </ul>
                  <h4>Aftercare Instructions</h4>
                  <div className="care-section">
                    <h5>Wash Care</h5>
                    <ul>
                      <li>Machine wash cold (30°C max)</li>
                      <li>Use mild detergent</li>
                      <li>Do not bleach</li>
                      <li>Tumble dry low heat</li>
                      <li>Iron on low heat</li>
                    </ul>
                    <h5>Storage</h5>
                    <ul>
                      <li>Store in cool, dry place</li>
                      <li>Fold properly to maintain shape</li>
                      <li>Avoid direct sunlight</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
