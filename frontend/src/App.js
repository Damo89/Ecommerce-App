import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OAuthCallback from './pages/OAuthCallback';
import AlreadyLoggedIn from './pages/AlreadyLoggedIn';
import ProductDetails from './pages/ProductDetails';
import AppLayout from './components/AppLayout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/already-logged-in" element={<AlreadyLoggedIn />} />

        {/* Routes with layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/cancel" element={<PaymentCancel />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

