const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { 
  registerUser, 
  loginUser,
  logoutUser,
  getProfile
} = require('../controllers/authController');

// Register user
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [email, password]
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/register', registerUser);

// Login user
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [email, password]
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginUser);

// Get user profile
/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', ensureAuthenticated, getProfile);

// Logout user
/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logoutUser);

// Google OAuth Login
/**
 * @swagger
 * /api/google:
 *   get:
 *     summary: Start Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google login
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /api/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect after successful or failed Google login
 */
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    res.redirect('http://localhost:3000/oauth-callback');
  }
);

// GitHub OAuth Login
/**
 * @swagger
 * /api/github:
 *   get:
 *     summary: Start GitHub OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to GitHub login
 */
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

/**
 * @swagger
 * /api/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect after successful or failed GitHub login
 */
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    res.redirect('http://localhost:3000/oauth-callback');
  }
);

module.exports = router;
