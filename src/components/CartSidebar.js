import React from 'react';
import { FaTimes, FaShoppingBag, FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import './CartSidebar.css';

const CartSidebar = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  cartTotal, 
  onCheckout 
}) => {
  const formatPrice = (price) => {
    return `Rs. ${Number(price).toFixed(2)}`;
  };

  const getItemTotal = (item) => {
    const price = item.discountPrice || item.price;
    return price * item.quantity;
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button className="cart-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Cart Items */}
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <FaShoppingBag />
              <h3>Your cart is empty</h3>
              <p>Add some products to get started</p>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${index}`} className="cart-item">
                  {/* Item Image */}
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  {/* Item Details */}
                  <div className="item-details">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-size">Size: {item.selectedSize}</p>
                    <div className="item-price">
                      {item.discountPrice ? (
                        <>
                          <span className="current-price">{formatPrice(item.discountPrice)}</span>
                          <span className="original-price">{formatPrice(item.price)}</span>
                        </>
                      ) : (
                        <span className="current-price">{formatPrice(item.price)}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="item-quantity">
                    <button
                      className="quantity-btn"
                      onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    className="remove-item-btn"
                    onClick={() => onRemoveItem(item.id, item.selectedSize)}
                    aria-label="Remove item"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span className="total-amount">{formatPrice(cartTotal)}</span>
            </div>
            
            <button 
              className="btn btn-primary btn-large checkout-btn"
              onClick={onCheckout}
            >
              Proceed to Checkout
              <FaShoppingBag />
            </button>
            
            <button 
              className="btn btn-secondary continue-shopping-btn"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
