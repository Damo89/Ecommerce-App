import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { authFetch } from '../utils/authFetch';
import '../styles/Navbar.css';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const location = useLocation();
  const menuRef = useRef();

  console.log("Navbar rendered. isLoggedIn:", isLoggedIn);

  const publicPaths = useMemo(() => ['/login', '/register', '/already-logged-in'], []);

  const checkLogin = async () => {
    try {
      const res = await authFetch('/api/auth/profile');
      setIsLoggedIn(res?.ok || false);
    } catch {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    if (!publicPaths.includes(location.pathname)) {
      checkLogin(); // ✅ Only check login for non-public paths
    } else {
      setIsLoggedIn(false); // ✅ Explicitly set to false on public pages
    }

    setMenuOpen(false);

    window.addEventListener('auth-updated', checkLogin);
    return () => {
      window.removeEventListener('auth-updated', checkLogin);
    };
  }, [location.pathname, publicPaths]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!publicPaths.includes(location.pathname)) {
        checkLogin();
      }
    }, 1000 * 60 * 5);
    return () => clearInterval(interval);
  }, [location.pathname, publicPaths]);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    };

    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        handleCloseMenu();
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
    setMenuClosing(false);
  };

  const handleCloseMenu = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 300);
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await authFetch('http://localhost:5000/api/carts/me', {
          credentials: 'include'
        });

        if (res?.ok) {
          const data = await res.json();
          localStorage.setItem('cart', JSON.stringify(data));
          window.dispatchEvent(new Event('cart-updated'));
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    };

    fetchCart();
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart" className="cart-link">
          Cart <span className="cart-badge">{cartCount}</span>
        </Link>
        <Link to="/orders">Orders</Link>
        <Link to="/checkout">Checkout</Link>
      </div>

      <button className="burger" onClick={handleToggleMenu} aria-label="Toggle menu">☰</button>

      <div className="navbar-auth">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="auth-link">Login</Link>
            <Link to="/register" className="auth-link">Register</Link>
          </>
        ) : (
          <LogoutButton onLogout={() => setIsLoggedIn(false)} />
        )}
      </div>

      {menuOpen && (
        <div className="overlay">
          <div
            className={`side-menu ${menuClosing ? 'slide-out' : 'slide-in'}`}
            ref={menuRef}
          >
            <Link to="/" onClick={handleCloseMenu}>Home</Link>
            <Link to="/products" onClick={handleCloseMenu}>Products</Link>
            <Link to="/cart" onClick={handleCloseMenu} className="cart-link">
              Cart <span className="cart-badge">{cartCount}</span>
            </Link>
            <Link to="/orders" onClick={handleCloseMenu}>Orders</Link>
            <Link to="/checkout" onClick={handleCloseMenu}>Checkout</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
