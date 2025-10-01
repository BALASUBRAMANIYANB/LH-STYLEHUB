import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes, FaShoppingBag, FaCalendar, FaTruck, FaSignOutAlt } from 'react-icons/fa';
import { getOrderStatusColor, formatCurrency, formatDate } from '../utils/orderUtils';
import './Profile.css';

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile, getUserOrders, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      // Set fallback data from Firebase Auth user
      const fallbackData = {
        firstName: currentUser.displayName?.split(' ')[0] || '',
        lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
        phone: '',
        email: currentUser.email || '',
        createdAt: currentUser.metadata?.creationTime || new Date().toISOString()
      };
      
      // Use userProfile if available, otherwise use fallback
      const profileData = userProfile || fallbackData;
      
      setEditData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || ''
      });
      
      loadOrders();
    }
  }, [currentUser, userProfile]);

  const loadOrders = async () => {
    if (currentUser) {
      try {
        const userOrders = await getUserOrders(currentUser.uid);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setLoading(true);
    setMessage('');

    try {
      const updatedProfile = {
        ...userProfile,
        ...editData,
        displayName: `${editData.firstName} ${editData.lastName}`
      };

      await updateUserProfile(currentUser.uid, updatedProfile);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const fallbackData = {
      firstName: currentUser.displayName?.split(' ')[0] || '',
      lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
      phone: ''
    };
    
    setEditData({
      firstName: userProfile?.firstName || fallbackData.firstName,
      lastName: userProfile?.lastName || fallbackData.lastName,
      phone: userProfile?.phone || fallbackData.phone
    });
    setIsEditing(false);
    setMessage('');
  };



  if (!currentUser) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Please log in to view your profile.</p>
          </div>
          <div className="profile-section">
            <div className="no-orders">
              <FaUser />
              <h3>Not Logged In</h3>
              <p>Please sign in to access your profile information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account information and view order history</p>
          <button 
            className="logout-btn"
            onClick={logout}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '1rem auto 0'
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="profile-sections">
          {/* Personal Information Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              {!isEditing && (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Edit
                </button>
              )}
            </div>

            <div className="profile-info">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">
                        <FaUser /> First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={editData.firstName}
                        onChange={handleInputChange}
                        required
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
                        value={editData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">
                      <FaPhone /> Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">
                      <FaEnvelope /> Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={userProfile?.email || currentUser.email || ''}
                      disabled
                      className="disabled-input"
                    />
                  </div>
                  <div className="edit-actions">
                    <button 
                      className="save-btn"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : <><FaSave /> Save</>}
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="info-display">
                  <div className="info-item">
                    <span className="info-label">
                      <FaUser /> Full Name
                    </span>
                    <span className="info-value">
                      {userProfile?.firstName || currentUser.displayName?.split(' ')[0] || ''} {userProfile?.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || ''}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">
                      <FaEnvelope /> Email
                    </span>
                    <span className="info-value">{userProfile?.email || currentUser.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">
                      <FaPhone /> Phone
                    </span>
                    <span className="info-value">{userProfile?.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">
                      <FaCalendar /> Member Since
                    </span>
                    <span className="info-value">
                      {userProfile?.createdAt ? formatDate(userProfile.createdAt) : (currentUser.metadata?.creationTime ? formatDate(currentUser.metadata.creationTime) : 'N/A')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order History Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Order History</h2>
              <span className="order-count">{orders.length} orders</span>
            </div>

            <div className="orders-container">
              {orders.length === 0 ? (
                <div className="no-orders">
                  <FaShoppingBag />
                  <h3>No orders yet</h3>
                  <p>Start shopping to see your order history here</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-item">
                      <div className="order-header">
                        <div className="order-info">
                          <h4>Order #{order.orderId}</h4>
                          <p className="order-date">
                            <FaCalendar /> {formatDate(order.orderDate)}
                          </p>
                        </div>
                        <div className="order-status">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getOrderStatusColor(order.status) }}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      {order.items && order.items.length > 0 && (
                        <div className="order-items">
                          {order.items.map((item, index) => (
                            <div key={index} className="order-item-detail">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="item-image"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/50x50?text=Image';
                                }}
                              />
                              <div className="item-info">
                                <h5>{item.name}</h5>
                                <p>Size: {item.selectedSize} | Qty: {item.quantity}</p>
                                <p className="item-price">{formatCurrency(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="order-footer">
                        <div className="order-total">
                          <strong>Total: {formatCurrency(order.total || 0)}</strong>
                        </div>
                        <div className="order-tracking">
                          {order.status === 'shipped' && (
                            <span className="tracking-info">
                              <FaTruck /> Shipped
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
