// src/utils/authFetch.js

export async function authFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    if (res.status === 401) {
      console.warn('Session expired — checking for redirect...');

      // Clean up local state
      localStorage.removeItem('authToken');
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('auth-updated'));

      // Normalize current path
      const currentPath = window.location.pathname.replace(/\/+$/, '');
      const publicPaths = ['/login', '/register', '/already-logged-in', '/oauth-callback'];

      // Only redirect if not already on a public route
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login';
      }

      return null;
    }

    return res;
  } catch (error) {
    console.error('authFetch failed:', error);
    return null;
  }
}

