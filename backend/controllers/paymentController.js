const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const pool = require('../database/db');

const createCheckoutSession = async (req, res) => {
  const { items } = req.body;

  try {
    const line_items = items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert £ to pence
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create Stripe checkout session.' });
  }
};

const handleStripeSuccess = async (req, res) => {
 const user_id = req.user?.id;
  const { items, total } = req.body;

  if (!user_id || !Array.isArray(items) || !total) {
    return res.status(400).json({ error: 'Missing order data' });
  }

  try {
    await pool.query('BEGIN');

    // Step 1: Insert order
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total, status)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [user_id, total, 'completed']
    );

    const order_id = orderResult.rows[0].id;

    // Step 2: Insert all items into order_items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [order_id, item.product_id || item.id, item.quantity]
      );
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'Order recorded successfully', order_id });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Failed to insert order:', err);
    res.status(500).json({ error: 'Failed to record order' });
  }
};

module.exports = {
  createCheckoutSession,
  handleStripeSuccess,
};

