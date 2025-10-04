import React, { useState } from 'react';
import { FaChevronDown, FaWhatsapp } from 'react-icons/fa';
import './FAQ.css';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const faqData = [
    {
      id: 1,
      question: "What makes LH T-shirts special?",
      answer: "Our tees are crafted with 220 GSM premium combed cotton, oversized fit, and high-quality DTF prints—designed for comfort, style, and everyday flex."
    },
    {
      id: 2,
      question: "Are the T-shirts unisex?",
      answer: "Yes! Our oversized fit looks good on everyone—made for men, women, and anyone who loves streetwear vibes."
    },
    {
      id: 3,
      question: "What size should I order?",
      answer: "We recommend checking our size chart before ordering. Since we don't offer returns or exchanges, picking the right size is key to rocking your look."
    },
    {
      id: 4,
      question: "How do I take care of my T-shirt?",
      answer: "• Machine wash cold\n• Do not bleach\n• Tumble dry low\n• Don't iron directly on the print\n\nTreat it with love, and it'll last long."
    },
    {
      id: 5,
      question: "Do you accept returns or exchanges?",
      answer: "No breakups here! Once your tee finds you, it's yours forever. All sales are final, so please double-check your size before checkout."
    },
    {
      id: 6,
      question: "When will my order arrive?",
      answer: "We usually ship within 3–5 business days. Delivery times depend on your location, but we'll keep you updated every step of the way."
    },
    {
      id: 7,
      question: "Do you ship across India?",
      answer: "Yes! We deliver PAN India so you can rep LH no matter where you are."
    },
    {
      id: 8,
      question: "Can I track my order?",
      answer: "Of course! Once your order is shipped, you'll receive a tracking link via email/SMS."
    },
    {
      id: 9,
      question: "Will the print fade after washes?",
      answer: "Nope. We use high-quality DTF printing that stays vibrant and bold even after multiple washes (as long as you follow wash care)."
    },
    {
      id: 10,
      question: "Can I wear LH T-shirts in all seasons?",
      answer: "Absolutely! Our 220 GSM cotton is breathable for summers and cozy enough for layering in winters—perfect all year round."
    }
  ];

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="faq-page">
      <div className="container">
        {/* Page Header */}
        <div className="faq-page-header">
          <h1>FAQ : FAQ'S</h1>
          <p>Everything you need to know about LH STYLEHUB oversized streetwear</p>
        </div>

        {/* FAQ Accordion */}
        <div className="faq-accordion">
          {faqData.map((item) => (
            <div key={item.id} className="faq-item">
              <button
                className={`faq-question ${openItems.has(item.id) ? 'open' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                <span>{item.question}</span>
                <FaChevronDown className="chevron" />
              </button>
              <div className={`faq-answer ${openItems.has(item.id) ? 'open' : ''}`}>
                <div className="answer-content">
                  {item.answer.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help Section */}
        <div className="help-section">
          <div className="help-content">
            <h2>Still Have Questions?</h2>
            <p>We're here to help! Reach out to our support team for personalized assistance.</p>
            
            <div className="help-options">
              <div className="help-option">
                <h3>Email Support</h3>
                <p>lhstylehub@gmail.com</p>
                <p>We'll get back to you within 24 hours</p>
              </div>
              
              <div className="help-option">
                <h3>WhatsApp Support</h3>
                <p>9791999113</p>
                <p>Quick responses during business hours</p>
              </div>
              
              <div className="help-option">
                <h3>AI Chatbox</h3>
                <p>Available 24/7</p>
                <p>Instant answers to common questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Size Guide Reminder */}
        <div className="size-reminder">
          <div className="reminder-content">
            <h3>📏 Size Guide Reminder</h3>
            <p>Since we don't offer returns or exchanges, please check our size chart carefully before ordering. Our oversized fit is designed to be roomy and comfortable!</p>
            <div className="size-tips">
              <div className="tip">
                <strong>S:</strong> Chest 38-40", Length 26-27"
              </div>
              <div className="tip">
                <strong>M:</strong> Chest 42-44", Length 28-29"
              </div>
              <div className="tip">
                <strong>L:</strong> Chest 44-46", Length 29-30"
              </div>
              <div className="tip">
                <strong>XL:</strong> Chest 46-48", Length 30-31"
              </div>
              <div className="tip">
                <strong>XXL:</strong> Chest 48-50", Length 31-32"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Support Button */}
      <a href="https://wa.me/919791999113" className="whatsapp-support" target="_blank" rel="noopener noreferrer">
        <FaWhatsapp />
      </a>
    </div>
  );
};

export default FAQ;
