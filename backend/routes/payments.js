const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { 
        createCheckoutSession,
        handleStripeSuccess,
    } = require('../controllers/paymentController');

// POST /api/payment/create-checkout-session
/**
 * @swagger
 * /api/payment/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Stripe session created successfully
 *       500:
 *         description: Failed to create Stripe checkout session
 */
router.post('/create-checkout-session', createCheckoutSession);

/**
 * @swagger
 * /api/orders/success:
 *   post:
 *     summary: Record a successful Stripe order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - items
 *               - total
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user placing the order
 *               total:
 *                 type: number
 *                 format: float
 *                 description: Total amount paid
 *               items:
 *                 type: array
 *                 description: Items in the order
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       description: ID of the product
 *                     quantity:
 *                       type: integer
 *                       description: Quantity ordered
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: (Optional) Price of the product
 *                     name:
 *                       type: string
 *                       description: (Optional) Name of the product
 *     responses:
 *       201:
 *         description: Order recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order_id:
 *                   type: integer
 *       400:
 *         description: Missing or invalid input
 *       500:
 *         description: Failed to record order
 */
router.post('/success', ensureAuthenticated, handleStripeSuccess);

module.exports = router;
