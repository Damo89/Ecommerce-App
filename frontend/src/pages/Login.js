import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import Title from '../components/Title';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    fetch('/api/auth/profile', { credentials: 'include' })
      .then(res => {
        if (!cancelled && res.ok) {
          navigate('/already-logged-in');
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const mergeLocalCart = async () => {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (localCart.length === 0) return;

    const payload = localCart.map(item => ({
      product_id: item.product_id || item.id,
      quantity: item.quantity
    }));

    try {
      const res = await fetch('/api/carts/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.removeItem('cart');
      } else {
        console.warn('Cart merge failed');
      }
    } catch (err) {
      console.error('Cart merge error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await mergeLocalCart(); // merge guest cart into backend cart

        // Optionally fetch merged backend cart and store in localStorage
        try {
          const cartRes = await fetch('/api/carts/me', {
            credentials: 'include'
          });

          if (cartRes.ok) {
            const cartData = await cartRes.json();
            if (Array.isArray(cartData) && cartData.length > 0) {
              localStorage.setItem('cart', JSON.stringify(cartData));
              window.dispatchEvent(new Event('cart-updated'));
            } else {
              localStorage.removeItem('cart');
            }
          }
        } catch (cartErr) {
          console.error('Failed to restore cart:', cartErr);
        }

        window.dispatchEvent(new Event('auth-updated'));
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Title />
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>

          <div className="social-login">
            <p>Or login with:</p>
            <a href="http://localhost:5000/api/auth/google" className="google-btn">
              <FaGoogle className="icon" />Google
            </a>
            <a href="http://localhost:5000/api/auth/github" className="github-btn">
              <FaGithub className="icon" />GitHub
            </a>
          </div>

          <p style={{ marginTop: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
