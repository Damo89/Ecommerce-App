const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { checkoutUserCart } = require('../controllers/checkoutController');

// POST /api/carts/:userId/checkout
/**
 * @swagger
 * /api/carts/{userId}/checkout:
 *   post:
 *     summary: Checkout cart and create order
 *     tags: [Checkout]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               paymentDetails:
 *                 type: object
 *                 properties:
 *                   cardNumber:
 *                     type: string
 *     responses:
 *       201:
 *         description: Checkout successful
 */
router.post('/:userId/checkout', checkoutUserCart);

module.exports = router;