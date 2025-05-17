import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/authFetch';
import '../styles/Loading.css';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndRestoreCart = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));

        const res = await authFetch('/api/auth/profile');
        if (!res) {
          navigate('/login');
          return;
        }

        if (res.ok) {
          // fetch and restore cart
          const cartRes = await authFetch('/api/carts/me');
          if (cartRes?.ok) {
            const cartData = await cartRes.json();
            localStorage.setItem('cart', JSON.stringify(cartData));
            window.dispatchEvent(new Event('cart-updated'));
          }

          window.dispatchEvent(new Event('auth-updated'));
          navigate('/');
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('OAuth login failed:', err);
        navigate('/login');
      }
    };

    checkSessionAndRestoreCart();
  }, [navigate]);


  return (
    <div className="loading-container">
      <div className="spinner" />
        <p>Logging you in…</p>
    </div>
  );
}
