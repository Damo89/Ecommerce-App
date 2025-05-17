import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Cart.css';

export default function Cart() {
  const [editingItemId, setEditingItemId] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/carts/me', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (res.ok) {
          const data = await res.json();
          setCart(data.filter(Boolean));
        } else {
          const stored = localStorage.getItem('cart');
          if (stored) {
            const parsed = JSON.parse(stored);
            setCart(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
          } else {
            setCart([]);
          }
        }

        const saved = localStorage.getItem('savedItems');
        if (saved) setSavedItems(JSON.parse(saved).filter(Boolean));
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    };

    const clearCartHandler = () => {
      setCart([]);
      localStorage.setItem('cart', '[]');
      window.dispatchEvent(new Event('cart-updated'));
    };

    fetchCart();
    window.addEventListener('cart-updated', fetchCart);
    window.addEventListener('cart-cleared', clearCartHandler);

    return () => {
      window.removeEventListener('cart-updated', fetchCart);
      window.removeEventListener('cart-cleared', clearCartHandler);
    };
  }, [location.pathname]);

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const removeItem = async (cartId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/carts/remove/${cartId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const updated = cart.filter(item => (item?.cart_id || item?.id) !== cartId);
      setCart(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cart-updated'));

      if (!res.ok) {
        console.warn('Failed to remove item from backend');
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const saveEditedQuantity = async (cartId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/carts/${cartId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const updatedItem = res.ok ? await res.json() : { quantity: newQuantity };

      const updated = cart.map(item =>
        (item?.cart_id || item?.id) === cartId
          ? { ...item, quantity: updatedItem.quantity }
          : item
      );

      setCart(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }

    setEditingItemId(null);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const saveForLater = async (id) => {
    const itemToSave = cart.find(item => (item?.cart_id || item?.id) === id);
    if (!itemToSave) return;

    try {
      await fetch(`http://localhost:5000/api/carts/remove/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error removing item from backend while saving for later:', err);
    }

    const updatedCart = cart.filter(item => (item?.cart_id || item?.id) !== id);
    const updatedSaved = [...savedItems, itemToSave];

    setCart(updatedCart);
    setSavedItems(updatedSaved);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    localStorage.setItem('savedItems', JSON.stringify(updatedSaved));
    window.dispatchEvent(new Event('cart-updated'));
  };

const moveBackToCart = async (id) => {
  const itemToRestore = savedItems.find(item => item?.id === id);
  if (!itemToRestore) return;

  const updatedSaved = savedItems.filter(item => item?.id !== id);
  const product_id = itemToRestore.product_id || itemToRestore.id;

  try {
    const res = await fetch('http://localhost:5000/api/carts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        product_id,
        quantity: itemToRestore.quantity || 1,
      }),
    });

    if (!res.ok) throw new Error('Backend rejected item');

    const backendCartRes = await fetch('http://localhost:5000/api/carts/me', {
      credentials: 'include',
    });
    const backendCart = await backendCartRes.json();

    setCart(backendCart);
    localStorage.setItem('cart', JSON.stringify(backendCart));
  } catch (err) {
    console.error('Failed to move item to backend cart:', err);

    // Fallback to frontend update only
    const fallbackCart = [...cart, itemToRestore];
    setCart(fallbackCart);
    localStorage.setItem('cart', JSON.stringify(fallbackCart));
  }

  // ✅ Always update state and localStorage together
  setSavedItems(updatedSaved);
  localStorage.setItem('savedItems', JSON.stringify(updatedSaved));
  window.dispatchEvent(new Event('cart-updated'));
};

  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-items">
            {cart.filter(Boolean).map(item => (
              <li key={item.cart_id || item.id} className="cart-item">
                <img src={item.image_url} alt={item.name} className="cart-image" />
                <div className="cart-info">
                  <h4>{item.name}</h4>
                  {editingItemId === (item.cart_id || item.id) ? (
                    <div className="edit-controls">
                      <label className="edit-quantity">
                        Quantity:
                        <input
                          type="number"
                          min="1"
                          value={newQuantity}
                          onChange={(e) => setNewQuantity(Number(e.target.value))}
                        />
                      </label>
                      <div className="edit-action-buttons">
                        <button className="blue-invert-button" onClick={() => saveEditedQuantity(item.cart_id || item.id)}>Save</button>
                        <button className="blue-invert-button" onClick={() => setEditingItemId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p>Quantity: {item.quantity}</p>
                  )}
                  <p>Price: £{Number(item.price).toFixed(2)}</p>
                  <p>Subtotal: £{(item.price * item.quantity).toFixed(2)}</p>
                  <div className="cart-buttons">
                    <button className="edit-button" onClick={() => {
                      setEditingItemId(item.cart_id || item.id);
                      setNewQuantity(item.quantity);
                    }}>
                      Edit
                    </button>
                    <button className="blue-invert-button" onClick={() => saveForLater(item.cart_id || item.id)}>
                      Save for Later
                    </button>
                    <button className="remove-button" onClick={() => removeItem(item.cart_id || item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <h3>Total: £{getTotal()}</h3>
            <button className="checkout-button" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {savedItems.length > 0 && (
        <>
          <h3>Saved for Later</h3>
          <ul className="cart-items">
            {savedItems.filter(Boolean).map(item => (
              <li key={item.id} className="cart-item">
                <img src={item.image_url} alt={item.name} className="cart-image" />
                <div className="cart-info">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: £{Number(item.price).toFixed(2)}</p>
                  <p>Subtotal: £{(item.price * item.quantity).toFixed(2)}</p>
                  <div className="cart-buttons">
                    <button className="move-back-button" onClick={() => moveBackToCart(item.id)}>
                      Move Back to Cart
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
