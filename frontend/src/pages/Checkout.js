import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PaymentButton from '../components/PaymentButton';
import '../styles/Checkout.css';

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const syncCart = () => {
      const stored = localStorage.getItem('cart');
      setCart(stored ? JSON.parse(stored) : []);
    };

    syncCart();

    // 👇 Update cart on 'cart-updated' event
    window.addEventListener('cart-updated', syncCart);
    window.addEventListener('cart-cleared', () => {
      setCart([]);
      localStorage.setItem('cart', '[]');
    });

    return () => {
      window.removeEventListener('cart-updated', syncCart);
      window.removeEventListener('cart-cleared', () => {});
    };
  }, [location.pathname]);

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="checkout-cart">
            <ul>
              {cart.map(item => (
                <li key={item.id} className="checkout-item">
                  <img
                    src={item.image_url || 'https://via.placeholder.com/60'}
                    alt={item.name}
                    className="checkout-item-image"
                  />
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.name}</span>
                    <span className="checkout-item-quantity">Quantity: {item.quantity}</span>
                    <span className="checkout-item-price">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="checkout-total">Total: £{getTotal()}</p>
          </div>

          <div className="checkout-form">
            <PaymentButton cartItems={cart} />
          </div>
        </>
      )}
    </div>
  );
}
