import React, { useState } from 'react';
import {
  FaTimes, FaEye, FaEyeSlash, FaUser,
  FaEnvelope, FaLock, FaPhone, FaGoogle
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './LoginModal.css';

// Country codes data
const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' }
];

const LoginModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: '+91'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, signup, signInWithGoogle } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        setSuccess('Login successful!');
        setTimeout(() => {
          onClose();
          setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', countryCode: '+91' });
        }, 1000);
      } else {
        await signup(formData.email, formData.password, formData.firstName, formData.lastName, formData.countryCode + formData.phone);
        setSuccess('Account created successfully!');
        setTimeout(() => {
          onClose();
          setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', countryCode: '+91' });
        }, 1000);
      }
    } catch (error) {
      console.error('Auth error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters long.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password authentication is not enabled.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        case 'PERMISSION_DENIED':
          setError('Database access denied.');
          break;
        default:
          setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = await signInWithGoogle();
      setSuccess(`Welcome, ${user.displayName}`);
      setTimeout(() => {
        onClose();
        setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', countryCode: '+91' });
      }, 1000);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError("Google sign-in failed. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', countryCode: '+91' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="modal-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to your account' : 'Join us and start shopping'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          type="button"
          className="google-signin-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FaGoogle className="google-icon" />
          Continue with Google
        </button>

        <div className="divider">or</div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">
                    <FaUser /> First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">
                    <FaUser /> Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone">
                  <FaPhone /> Phone Number
                </label>
                <div className="phone-input-container">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="country-code-select"
                    required={!isLogin}
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code} ({country.country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Enter your phone number"
                    className="phone-number-input"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock /> Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="toggle-mode-btn" onClick={toggleMode}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
