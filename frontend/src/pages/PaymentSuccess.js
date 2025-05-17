import React, { useEffect } from 'react';

export default function PaymentSuccess() {
  useEffect(() => {
    console.log('PaymentSuccess mounted');

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Send order to backend
    const recordOrder = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/payment/success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ items: cart, total }),
        });

        if (!res.ok) {
          console.warn('Order not saved to DB');
        } else {
          console.log('Order recorded in DB');
        }
      } catch (err) {
        console.error('Error recording order:', err);
      }
    };

    // Clear localStorage cart and notify frontend
    const clearLocalCart = () => {
      localStorage.removeItem('cart');
      //localStorage.removeItem('savedItems');
      window.dispatchEvent(new Event('cart-cleared'));
      console.log('Local cart cleared');
    };

    // Clear backend cart
    const clearBackendCart = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/carts/me/clear', {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!res.ok) {
          console.warn('Failed to clear backend cart');
        } else {
          console.log('Backend cart cleared');
        }
      } catch (err) {
        console.error('Error clearing backend cart:', err);
      }
    };

    recordOrder();
    clearLocalCart();
    clearBackendCart();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Payment Successful</h1>
      <p>Thank you for your order!</p>
    </div>
  );
}
