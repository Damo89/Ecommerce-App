import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => {
        console.error('Failed to fetch product:', err);
        navigate('/products'); // fallback if product not found
      });
  }, [id, navigate]);

const handleAddToCart = async () => {
  try {
    const res = await fetch('/api/auth/profile', { credentials: 'include' });
    const isLoggedIn = res.ok;

    if (isLoggedIn) {
      // ✅ Add item to backend cart
      const response = await fetch('/api/carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ product_id: product.id, quantity }),
      });

      if (!response.ok) throw new Error('Backend cart update failed');

      // Fetch the updated cart and update localStorage
      const cartRes = await fetch('/api/carts/me', {
        credentials: 'include',
      });

      if (cartRes.ok) {
        const updatedCart = await cartRes.json();
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cart-updated'));
      }
    } else {
      // Guest user — localStorage only
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existing = cart.find(item => item.id === product.id);

      let updatedCart;

      if (existing) {
        updatedCart = cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedCart = [...cart, { ...product, quantity }];
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cart-updated'));
    }

    alert('Added to cart!');
  } catch (err) {
    console.error('Add to cart failed:', err);
    alert('Could not add to cart');
  }
};


  if (!product) return <p>Loading product...</p>;

  return (
    <div className="product-details-container">
      <div className="product-details-card">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x200'}
          alt={product.name}
          className="product-details-image"
        />
        <div className="product-details-info">
          <h2>{product.name}</h2>
          <p className="price">£{Number(product.price).toFixed(2)}</p>
          <p className="description">{product.description}</p>

          <div className="quantity-control">
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <button className="add-to-cart" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
