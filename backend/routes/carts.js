const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { 
        getCartForCurrentUser,
        getCartByUserId,
        addToCart, 
        updateCartItem,
        deleteCartItem,
        saveCartForCurrentUser,
        removeCartItem,
        mergeCart,
        clearCartForCurrentUser
      } = require('../controllers/cartsController');

/**
 * @swagger
 * /api/carts/me:
 *   get:
 *     summary: Get cart items for the logged-in user
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: List of cart items
 *       401:
 *         description: Unauthorized
 */
router.get('/me', getCartForCurrentUser);

/**
 * @swagger
 * /api/carts:
 *   post:
 *     summary: Add a product to the cart (for logged-in user)
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [product_id, quantity]
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product added to cart
 *       401:
 *         description: Unauthorized
 */
router.post('/', addToCart);

//Fetch all cart items for a user
/**
 * @swagger
 * /api/carts/{userId}:
 *   get:
 *     summary: Get all cart items for a user
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cart items
 */
router.get('/:userId', getCartByUserId);

//Add product to cart
/**
 * @swagger
 * /api/carts:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             required: [user_id, product_id, quantity]
 *             properties:
 *               user_id:
 *                 type: integer
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product added to cart
 */
router.post('/', addToCart);

//Update quantity of a cart item
/**
 * @swagger
 * /api/carts/{cartId}:
 *   put:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.put('/:cartId', updateCartItem);

/**
 * @swagger
 * /api/carts/remove/{cartId}:
 *   delete:
 *     summary: Securely remove a cart item owned by the logged-in user
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found or not owned by user
 */
router.delete('/remove/:cartId', removeCartItem);

//Remove item from cart
/**
 * @swagger
 * /api/carts/{cartId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item to delete
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.delete('/:cartId', deleteCartItem);

/**
 * @swagger
 * /api/carts/me/save:
 *   post:
 *     summary: Save cart for the current user
 *     tags: [Cart]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cart:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Cart saved
 *       401:
 *         description: Unauthorized
 */
router.post('/me/save', saveCartForCurrentUser);

/**
 * @swagger
 * /api/carts/merge:
 *   post:
 *     summary: Merge local cart with the current user's cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 product_id:
 *                   type: integer
 *                 quantity:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Cart merged successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/merge', mergeCart);

/**
 * @swagger
 * /api/carts/me/clear:
 *   delete:
 *     summary: Clear the cart for the current logged-in user
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/me/clear', clearCartForCurrentUser);

module.exports = router;
