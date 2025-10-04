import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/images/posters/P-1.jpg',
      title: 'OVERSIZED DAMN TEE',
      subtitle: 'KENDRICK LAMAR',
      description: 'Premium streetwear that speaks your language'
    },
    {
      id: 2,
      image: '/images/posters/P-2.jpg',
      title: 'OVERSIZED I CAN FLY TEE',
      subtitle: 'TRAVIS SCOTT COLLECTION',
      description: 'Elevate your style with premium oversized fits'
    }
  ];


  // Auto-slide every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [slides.length]);






  return (
    <div className="home">
      {/* Hero Section - Clean Slideshow */}
      <section className="hero">
        <div className="slideshow-container">

          {/* Slides */}
          <div className="slides-wrapper">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="slide-image">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchpriority={index === 0 ? "high" : "auto"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="product-categories">
        <div className="container">
          <div className="category-item">
            <div className="category-image">
              <img src="/images/products/K-1.jpg" alt="OVERSIZED DAMN TEE" />
            </div>
            <div className="category-link">
              <Link to="/product/1">OVERSIZED DAMN TEE →</Link>
            </div>
          </div>

          <div className="category-item">
            <div className="category-image">
              <img src="/images/products/T-1.jpg" alt="OVERSIZED I CAN FLY TEE" />
            </div>
            <div className="category-link">
              <Link to="/product/2">OVERSIZED I CAN FLY TEE →</Link>
            </div>
          </div>

          <div className="category-item">
            <div className="category-image">
              <img src="/images/products/W-1.jpg" alt="OVERSIZED XO HORIZON TEE" />
            </div>
            <div className="category-link">
              <Link to="/product/3">OVERSIZED XO HORIZON TEE →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid Section */}
      <section className="video-grid">
        <div className="container">
          <div className="video-grid-container">
            <div className="video-grid-item">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="video-element"
              >
                <source src="/videos/video1.MOV" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="video-separator"></div>
            <div className="video-grid-item">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="video-element"
              >
                <source src="/videos/video 2.MP4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="video-separator"></div>
            <div className="video-grid-item">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="video-element"
              >
                <source src="/videos/video3.MP4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="brand-story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>BEHIND LH</h2>
              <p>
                IT ALL STARTED WITH A BOY WHO HAD A DREAM — A DREAM TO CREATE
                SOMETHING OF HIS OWN IN THE WORLD OF FASHION.
              </p>
              <p>
                WHAT BEGAN AS JUST AN IDEA SLOWLY GREW INTO A VISION: TO BUILD A BRAND THAT
                BLENDS PREMIUM QUALITY WITH EVERYDAY STYLE.
              </p>
              <p>
                AFTER YEARS OF PASSION, PERSISTENCE, AND LEARNING, THAT DREAM BECAME LH.
                MORE THAN OVERSIZED TEES, LH IS ABOUT EXPRESSING INDIVIDUALITY, CONFIDENCE, AND
                COMFORT. EVERY DESIGN REFLECTS THE JOURNEY — FROM DREAM TO REALITY.
              </p>
              <p>
                AT LH, WE BELIEVE FASHION SHOULDN'T BE OUT OF REACH. THAT'S WHY WE BRING YOU
                LUXURY YOU CAN FEEL, STYLE YOU CAN TRUST, AND PRICES THAT STAY REAL.
              </p>
              <p>
                FROM ONE DREAM TO MANY WARDROBES — WELCOME TO LH.
              </p>
              <Link to="/products" className="story-btn">
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Support Button */}
      <a href="https://wa.me/919791999113" className="whatsapp-support" target="_blank" rel="noopener noreferrer">
        <FaWhatsapp />
      </a>
    </div>
  );
};

export default Home;
