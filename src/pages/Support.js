import React, { useState, useEffect } from 'react';
import { 
  FaWhatsapp, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock, 
  FaRobot, 
  FaTimes, 
  FaPaperPlane,
  FaHeadset,
  FaShieldAlt,
  FaStar
} from 'react-icons/fa';
import './Support.css';

const Support = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedSections, setAnimatedSections] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate sections one by one
    const sections = [0, 1, 2, 3, 4];
    sections.forEach((section, index) => {
      setTimeout(() => {
        setAnimatedSections(prev => [...prev, section]);
      }, index * 300);
    });

    // Initialize chat with welcome message
    setChatMessages([
      {
        id: 1,
        type: 'bot',
        message: 'Hey there! 👋 I\'m your LH STYLEHUB AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Thanks for reaching out! I'll help you with that. Can you provide more details?",
        "I understand your concern. Let me connect you with our human support team for better assistance.",
        "That's a great question! Here's what I can tell you about our policies...",
        "I'm here to help! For immediate assistance, you can also reach us via WhatsApp or email.",
        "Let me check our database for the most accurate information about your query."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const botMessage = {
        id: chatMessages.length + 2,
        type: 'bot',
        message: randomResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className={`support-page ${isVisible ? 'visible' : ''}`}>
      <div className="container">
        {/* Page Header */}
        <div className={`support-page-header ${animatedSections.includes(0) ? 'animate-in' : ''}`}>
          <h1>Support Center</h1>
          <p>We're here to help you with anything you need</p>
        </div>

        {/* Main Support Section */}
        <div className="support-main">
          {/* Contact Methods */}
          <div className={`contact-methods ${animatedSections.includes(1) ? 'animate-in' : ''}`}>
            <h2>Get in Touch</h2>
            <p>Choose your preferred way to reach us</p>
            
            <div className="contact-grid">
              <div className="contact-card whatsapp">
                <div className="contact-icon">
                  <FaWhatsapp />
                </div>
                <h3>WhatsApp Support</h3>
                <p>Quick responses, instant help</p>
                <a 
                  href="https://wa.me/9791999113" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-button"
                >
                  Chat on WhatsApp
                </a>
                <div className="response-time">Response: Within 5 minutes</div>
              </div>

              <div className="contact-card email">
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <h3>Email Support</h3>
                <p>Detailed inquiries & documentation</p>
                <a 
                  href="mailto:lhstylehub@gmail.com" 
                  className="contact-button"
                >
                  Send Email
                </a>
                <div className="response-time">Response: Within 24 hours</div>
              </div>

              <div className="contact-card phone">
                <div className="contact-icon">
                  <FaPhone />
                </div>
                <h3>Phone Support</h3>
                <p>Direct conversation</p>
                <a 
                  href="tel:9791999113" 
                  className="contact-button"
                >
                  Call Now
                </a>
                <div className="response-time">Available: 9 AM - 8 PM IST</div>
              </div>

              <div className="contact-card ai-chat">
                <div className="contact-icon">
                  <FaRobot />
                </div>
                <h3>AI Assistant</h3>
                <p>24/7 instant help</p>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="contact-button"
                >
                  Start Chat
                </button>
                <div className="response-time">Response: Instant</div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={`contact-info-section ${animatedSections.includes(2) ? 'animate-in' : ''}`}>
            <h2>Contact Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <FaPhone className="info-icon" />
                <div className="info-content">
                  <h4>Phone</h4>
                  <p>9791999113</p>
                </div>
              </div>
              
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <div className="info-content">
                  <h4>Email</h4>
                  <p>lhstylehub@gmail.com</p>
                </div>
              </div>
              
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <div className="info-content">
                  <h4>Address</h4>
                  <p>Hopes, Coimbatore</p>
                </div>
              </div>
              
              <div className="info-item">
                <FaClock className="info-icon" />
                <div className="info-content">
                  <h4>Business Hours</h4>
                  <p>Monday - Saturday: 9 AM - 8 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Features */}
          <div className={`support-features ${animatedSections.includes(3) ? 'animate-in' : ''}`}>
            <h2>Why Choose Our Support?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <FaHeadset className="feature-icon" />
                <h3>24/7 Availability</h3>
                <p>Our AI assistant is always ready to help, even outside business hours.</p>
              </div>
              
              <div className="feature-card">
                <FaShieldAlt className="feature-icon" />
                <h3>Secure & Private</h3>
                <p>Your information is protected with industry-standard security measures.</p>
              </div>
              
              <div className="feature-card">
                <FaStar className="feature-icon" />
                <h3>Premium Service</h3>
                <p>We treat every customer like family, with personalized attention.</p>
              </div>
            </div>
          </div>

          {/* Quick Help */}
          <div className={`quick-help ${animatedSections.includes(4) ? 'animate-in' : ''}`}>
            <h2>Quick Help</h2>
            <p>Find answers to common questions</p>
            <div className="help-links">
              <a href="/faq" className="help-link">FAQ</a>
              <a href="/products" className="help-link">Size Guide</a>
              <a href="/tracking" className="help-link">Track Order</a>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Modal */}
      {isChatOpen && (
        <div className="chat-modal-overlay" onClick={() => setIsChatOpen(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <div className="chat-title">
                <FaRobot />
                <span>LH STYLEHUB AI Assistant</span>
              </div>
              <button 
                className="close-chat"
                onClick={() => setIsChatOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="chat-messages">
              {chatMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`chat-message ${message.type}`}
                >
                  <div className="message-content">
                    {message.message}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message bot typing">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <form className="chat-input-form" onSubmit={handleChatSubmit}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                className="chat-input"
              />
              <button type="submit" className="send-button">
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
