import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

export default function AlreadyLoggedIn() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        localStorage.removeItem('authToken');
        window.dispatchEvent(new Event('auth-updated'));
        navigate('/login');
      }
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form" style={{ textAlign: 'center' }}>
        <h2>You are already logged in!</h2>
        <p>Click below to go to the home page or logout.</p>

        <div className="auth-links">
            <Link to="/" className="auth-link">Go to Homepage</Link>
            <button type="button" onClick={handleLogout} className="auth-link logout-button">
                Logout
            </button>
        </div>
      </div>
    </div>
  );
}

