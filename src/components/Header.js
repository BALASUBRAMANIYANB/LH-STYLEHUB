import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = ({ cartCount, onLoginClick, onCartClick }) => {
  const { currentUser, userProfile } = useAuth();
  const isLoggedIn = !!currentUser;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Left Side - Navigation */}
        <nav className="nav-left">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/t-shirts" className="nav-link">T-Shirts</Link>
          <Link to="/polo" className="nav-link">Polo</Link>
          <Link to="/support" className="nav-link">Contact</Link>
        </nav>

        {/* Center - Logo */}
        <Link to="/" className="logo">
          <img src="/images/Logo/LH_Logo_White-01.png" alt="LH STYLEHUB" className="logo-image" />
        </Link>

        {/* Right Side */}
        <div className="header-right">
          {/* Search */}
          <div className="search">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search" className="search-input" />
          </div>

          {/* Cart */}
          <button className="cart-btn" onClick={onCartClick}>
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>

          {/* Profile */}
          <div className="profile">
            {isLoggedIn ? (
              <Link to="/profile" className="profile-link">
                <FaUser />
                <span>{userProfile?.displayName || userProfile?.firstName || 'User'}</span>
              </Link>
            ) : (
              <button className="login-btn" onClick={onLoginClick}>
                <FaUser />
                <span>Log in</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FaBars />
        </button>
      </div>

      {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="mobile-menu">
              <nav className="mobile-nav">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/t-shirts" onClick={() => setIsMenuOpen(false)}>T-Shirts</Link>
                <Link to="/polo" onClick={() => setIsMenuOpen(false)}>Polo</Link>
                <Link to="/support" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              </nav>
            </div>
          )}
    </header>
  );
};

export default Header;
