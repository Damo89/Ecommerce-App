import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RO25PQ6Z4y4DrYLNuX2DKEkKdap7Ft5k45nx8ugv7Z8AOJGDq4jwyVtwEhi5FaRedLffZIqlPZ7WaDBvVmCNYFM00HB2Fz91L'); // Replace with your actual Stripe public key

export default function PaymentButton({ cartItems }) {
  const handleClick = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });

      const text = await res.text(); // Read raw text
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text); // Try to parse manually
      } catch (err) {
        console.error('Failed to parse JSON:', err);
        alert('Server returned invalid JSON. See console for details.');
        return;
      }

      if (!res.ok) {
        console.error('Server error:', data.error || data);
        alert(`Checkout error: ${data.error || 'Unknown error'}`);
        return;
      }

      const stripe = await stripePromise;
      stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error('Network or unexpected error:', err);
      alert('Something went wrong. See console for details.');
    }
  };

  return (
    <button className="stripe-button" onClick={handleClick}>
      Pay with Stripe
    </button>
  );
}
