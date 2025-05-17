const pool = require('../database/db');

// Simulated payment processor
const processPayment = (paymentDetails, amount) => {
    if (!paymentDetails || !paymentDetails.cardNumber || paymentDetails.cardNumber.length < 12) {
      throw new Error('Invalid payment details');
    }
    // Assume payment is always successful for development
    return {
      success: true,
      transactionId: 'txn_' + Math.random().toString(36).substring(2),
    };
  };

// POST /api/carts/:userId/checkout
const checkoutUserCart = async (req, res) => {
  const { userId } = req.params;
  const { paymentDetails } = req.body;

  console.log('userId:', userId);
  console.log('paymentDetails:', paymentDetails);

  try {
    // 1. Get cart items
    const cartResult = await pool.query(
      `SELECT c.*, p.name, p.stock, p.id AS product_id, p.description
       FROM carts c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    const cartItems = cartResult.rows;

    if (cartItems.length === 0) {
      return res.status(404).json({ error: 'Cart is empty or does not exist' });
    }

    // 2. Calculate total
    let totalAmount = 0;
    for (let item of cartItems) {
      totalAmount += (item.price || 10) * item.quantity; // fallback price
    }

    // 3. Process payment (simulated)
    let payment;
    try {
      payment = processPayment(paymentDetails, totalAmount);
    } catch (err) {
      return res.status(400).json({ error: 'Payment failed: ' + err.message });
    }

    // 4. Create order
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, totalAmount, 'paid']
    );

    const order = orderResult.rows[0];

    // 5. Clear cart
    await pool.query(`DELETE FROM carts WHERE user_id = $1`, [userId]);

    res.status(201).json({
      message: 'Checkout successful',
      order,
      transaction: payment.transactionId,
    });

  } catch (err) {
    console.error('Checkout error:', err); // log full error
    res.status(500).json({ error: 'Checkout failed. ' + err.message });
  }  
};

module.exports = {
  checkoutUserCart
};
