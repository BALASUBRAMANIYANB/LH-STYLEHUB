import React from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaGift, FaStar } from 'react-icons/fa';
import './Polo.css';

const Polo = () => {
  const [showNotifyInput, setShowNotifyInput] = React.useState(false);
  const [notifyValue, setNotifyValue] = React.useState("");

  const handleNotifyClick = () => setShowNotifyInput(true);
  const handleNotifyInputChange = (e) => setNotifyValue(e.target.value);
  const handleNotifySubmit = (e) => {
    e.preventDefault();
    // You can add logic here to send notifyValue to backend or show a message
    setShowNotifyInput(false);
    setNotifyValue("");
    alert("Thank you! You'll be notified.");
  };

  return (
    <div className="polo-page">
      <div className="container">
        {/* Hero Section */}
        <section className="polo-hero">
          <div className="hero-content">
            <div className="hero-text">
              
              <h1 className="hero-title">
                PREMIUM POLO COLLECTION
                <span className="highlight">COMING SOON</span>
              </h1>
              
              <p className="hero-description">
                Get ready for the most exclusive polo collection launch. 
    
              </p>


              {/* CTA Buttons */}
              <div className="hero-actions">
                <button className="notify-btn" onClick={handleNotifyClick}>
                  <FaBell />
                  <span>NOTIFY ME</span>
                </button>
                {showNotifyInput && (
                  <form className="notify-input-group" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onSubmit={handleNotifySubmit}>
                    <input
                      type="text"
                      className="notify-input"
                      placeholder="Enter email or phone number"
                      style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
                      value={notifyValue}
                      onChange={handleNotifyInputChange}
                      required
                    />
                    <button type="submit" className="notify-submit-btn" style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', background: '#333', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                      Notify
                    </button>
                  </form>
                )}
                <Link to="/products" className="explore-btn">
                  <FaGift />
                  <span>EXPLORE T-SHIRTS</span>
                </Link>
              </div>
            </div>

            <div className="hero-image">
              <div className="polo-preview">
                <div className="preview-card">
                  <div className="preview-image">
                    <div className="coming-soon-overlay">
                      <FaStar className="star-icon" />
                      <span>COMING SOON</span>
                    </div>
                  </div>
                  <div className="preview-info">
                    <h3>PREMIUM POLO</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="polo-features">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaStar />
              </div>
              <h3>Premium Quality</h3>
              <p>Made with the finest materials and craftsmanship for ultimate comfort and style.</p>
            </div>
            
            
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaGift />
              </div>
              <h3>Exclusive Launch</h3>
              <p>Be the first to experience our premium polo collection with special launch offers.</p>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="newsletter-section">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Get notified when our premium polo collection launches</p>
            
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="email-input"
              />
              <button className="subscribe-btn">
                <FaBell />
                <span>SUBSCRIBE</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Polo;
