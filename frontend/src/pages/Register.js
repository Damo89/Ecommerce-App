import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Title from '../components/Title';
import '../styles/Register.css';


export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Registration successful!');
        navigate('/login');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <Title />
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Register</h2>
          {error && <p className="error-message">{error}</p>}

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit">Register</button>
          <p>Already have an account? <Link to="/login">Login here</Link>.</p>
        </form>
      </div>
    </div>
  );
}
