const pool = require('../database/db');

// GET /api/orders
const getAllOrders = async (req, res) => {
  console.log("📦 GET /api/orders called");

  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// GET /api/orders/me
// Fetch all orders for the logged-in user, including item details
const getOrdersForCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      `SELECT o.id AS order_id, o.total, o.status, o.created_at,
              oi.product_id, oi.quantity,
              p.name AS product_name, p.image_url
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Group the results by order ID
    const orders = result.rows.reduce((acc, row) => {
      const existingOrder = acc.find(o => o.id === row.order_id);

      const item = {
        product_id: row.product_id,
        name: row.product_name,
        image_url: row.image_url,
        quantity: row.quantity
      };

      if (existingOrder) {
        existingOrder.items.push(item);
      } else {
        acc.push({
          id: row.order_id,
          total: row.total,
          status: row.status,
          created_at: row.created_at,
          items: [item]
        });
      }

      return acc;
    }, []);

    res.set('Cache-Control', 'no-store');

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders for user:', err);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching order' });
    }
  };

// POST /api/orders
const createOrder = async (req, res) => {
    const { user_id, total, status } = req.body;
  
    if (!user_id || !total) {
      return res.status(400).json({ error: 'user_id and total are required' });
    }
  
    try {
      const result = await pool.query(
        `INSERT INTO orders (user_id, total, status)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [user_id, total, status || 'pending']
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create order' });
    }
  };

// PUT /api/orders/:id
const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { user_id, total, status } = req.body;
  
    try {
      const result = await pool.query(
        `UPDATE orders
         SET user_id = COALESCE($1, user_id),
             total = COALESCE($2, total),
             status = COALESCE($3, status)
         WHERE id = $4
         RETURNING *`,
        [user_id, total, status, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update order' });
    }
  };

// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.json({ message: 'Order deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete order' });
    }
  };
  
// GET /api/orders/user/:user_id
// View all orders for a user
const getOrdersByUser = async (req, res) => {
    const { user_id } = req.params;
  
    try {
      const result = await pool.query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
        [user_id]
      );
  
      res.json({
        user_id: user_id,
        order_count: result.rows.length,
        orders: result.rows
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve user orders' });
    }
  };

// GET /api/orders/user/:user_id/:order_id
// View details of a specific order that belongs to a user
const getOrderByUserAndOrderId = async (req, res) => {
    const { user_id, order_id } = req.params;
  
    try {
      const result = await pool.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [order_id, user_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found for this user' });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve the order details' });
    }
  };
  
module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  getOrderByUserAndOrderId,
  getOrdersForCurrentUser,
  createOrder,
  updateOrder,
  deleteOrder,
};
