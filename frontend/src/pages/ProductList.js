import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authFetch } from '../utils/authFetch';
import '../styles/ProductList.css';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    authFetch('http://localhost:5000/api/products', {
      credentials: 'include'
    })
      .then(res => {
        if (!res?.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.warn('Unexpected product format:', data);
          setProducts([]);
        }
      })
      .catch(err => {
        console.error('Error fetching product list:', err);
        setProducts([]);
      });
  }, []);

  return (
    <div className="product-list-container">
      <h2 className="product-heading">Browse Our Products</h2>
      <div className="product-grid">
        {(products || []).map(p => (
          <Link to={`/products/${p.id}`} className="product-card" key={p.id}>
            <img
              src={p.image_url || 'https://via.placeholder.com/300x200.png?text=No+Image'}
              alt={p.name}
              className="product-image"
            />
            <div className="product-info">
              <h3 className="product-name">{p.name}</h3>
              <p className="product-description">{p.description}</p>
              <p className="product-price">
                £{isNaN(Number(p.price)) ? 'N/A' : Number(p.price).toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
