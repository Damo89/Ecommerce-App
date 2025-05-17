import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/authFetch';

export default function LogoutButton({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Step 1: Try saving cart only if it exists
      const cart = JSON.parse(localStorage.getItem('cart')) || [];

      const validCart = cart.filter(item =>
        Number.isInteger(item.product_id || item.id) &&
        Number.isInteger(item.quantity)
      );

      if (validCart.length > 0) {
        const saveRes = await authFetch('/api/carts/me/save', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cart: validCart })
        });

        if (!saveRes?.ok) {
          console.warn('Cart save failed — skipping logout');
          alert('Failed to save cart. Please try again.');
          return;
        }
      } else {
        console.log('No cart items — skipping save.');
      }


      // Step 2: Perform logout
      const res = await authFetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res?.ok) {
        // Step 3: Clear local storage only after successful logout
        localStorage.removeItem('cart');

        // Step 4: Update app state
        onLogout();
        window.dispatchEvent(new Event('auth-updated'));
        navigate('/login');
      } else {
        alert('Logout failed.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        border: 'none',
        background: 'none',
        color: '#007bff',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginLeft: '10px',
      }}
    >
      Logout
    </button>
  );
}
