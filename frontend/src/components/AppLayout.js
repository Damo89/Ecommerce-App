import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  const location = useLocation();

  // Only hide navbar on internal redirect-like pages
  const hideNavbar = ['/already-logged-in', '/oauth-callback'].includes(
    location.pathname.replace(/\/+$/, '')
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>
        <Outlet />
      </main>
    </>
  );
}


