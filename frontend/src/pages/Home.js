import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { authFetch } from '../utils/authFetch';
import Title from '../components/Title';
import '../styles/Home.css';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [userName, setUserName] = useState('');
  const scrollRef = useRef(null);
  const [autoScrollActive, setAutoScrollActive] = useState(true);

  useEffect(() => {
    // Fetch user profile
    authFetch('http://localhost:5000/api/auth/profile', {
      credentials: 'include',
    })
      .then(res => {
        if (!res?.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => {
        setUserName(data?.user?.name || '');
      })
      .catch(() => {
        setUserName('');
      });

    // Fetch products
    authFetch('http://localhost:5000/api/products', {
      credentials: 'include',
    })
      .then(res => {
        if (!res?.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedProducts(data.slice(0, 6));
        } else {
          console.warn('Expected product array but got:', data);
          setFeaturedProducts([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setFeaturedProducts([]);
      });
  }, []);

const scrollProducts = (direction) => {
  if (!scrollRef.current) return;

  const container = scrollRef.current;
  const scrollAmount = 292; // Card width + gap (260 + 32)

  // Calculate the next snap position
  const newScrollLeft = container.scrollLeft + direction * scrollAmount;

  container.scrollTo({
    left: newScrollLeft,
    behavior: 'smooth',
  });
};


  // Auto-scroll carousel
useEffect(() => {
  if (!scrollRef.current) return;

  let intervalId;
  let pauseTimeout;

  const container = scrollRef.current;

  const startAutoScroll = () => {
    if (autoScrollActive) {
      intervalId = setInterval(() => {
        container.scrollBy({ left: 292, behavior: 'smooth' });
      }, 4000);
    }
  };

  const stopAutoScroll = () => {
    clearInterval(intervalId);
    clearTimeout(pauseTimeout);
  };

  const handleUserScroll = () => {
    stopAutoScroll();
    setAutoScrollActive(false);

    // Resume auto-scroll after 6 seconds of inactivity
    pauseTimeout = setTimeout(() => {
      setAutoScrollActive(true);
    }, 6000);
  };

  container.addEventListener('scroll', handleUserScroll);
  startAutoScroll();

  return () => {
    stopAutoScroll();
    container.removeEventListener('scroll', handleUserScroll);
  };
}, [autoScrollActive]);

  return (
    <div className="home-container">
      <Title />
      <section className="hero">
        <div className="hero-content">
          <h2 className="welcome-message">
            {userName ? `Welcome back, ${userName}!` : 'Welcome, guest.'}
          </h2>
          <h1>Discover the Latest in Tech & Style</h1>
          <p>Your one-stop shop for modern essentials.</p>
          <Link to="/products" className="cta-button">Shop Now</Link>
        </div>
      </section>

      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="carousel-wrapper">
          {/* Scroll buttons */}
          <button className="scroll-btn left" onClick={() => scrollProducts(-1)}>&#10094;</button>
          <button className="scroll-btn right" onClick={() => scrollProducts(1)}>&#10095;</button>

          {/* Edge fade overlays */}
          <div className="scroll-fade-left"></div>
          <div className="scroll-fade-right"></div>

          <div
            ref={scrollRef}
            className="product-scroll-container"
            onMouseEnter={() => setAutoScrollActive(false)}
            onMouseLeave={() => setAutoScrollActive(true)}
            onFocus={() => setAutoScrollActive(false)}
            onBlur={() => setAutoScrollActive(true)}
          >
            {(featuredProducts || []).map(product => (
              <div key={product.id} className="product-card">
                <img
                  src={product.image_url || 'https://via.placeholder.com/200x150'}
                  alt={product.name}
                  className="product-image"
                />
                <h3>{product.name}</h3>
                <p>£{parseFloat(product.price).toFixed(2)}</p>
                <Link to={`/products/${product.id}`} className="product-link">View Product</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
