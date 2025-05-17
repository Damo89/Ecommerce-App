import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/authFetch';
import '../styles/OrderHistory.css';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/orders/me', {
      credentials: 'include',
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.warn('Unexpected response:', data);
          setOrders([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch order history:', err);
        setOrders([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="order-history-container">
      <h2>Your Order History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order, index) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <h3>Order #{orders.length - index}</h3>
              <span className={`status ${order.status}`}>{order.status}</span>
            </div>
            <p><strong>Total:</strong> £{Number(order.total).toFixed(2)}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
            <h4>Items:</h4>
            <ul className="order-items">
              {order.items.map((item, idx) => (
                <li key={idx} className="order-item">
                  <img src={item.image_url} alt={item.name} />
                  <span>{item.name}</span>
                  <span>Qty: {item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
