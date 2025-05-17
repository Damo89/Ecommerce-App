const pool = require('../database/db');

const getCartByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(`
      SELECT c.id AS cart_id, c.quantity, c.created_at,
             p.id AS product_id, p.name, p.description, p.price, p.image_url
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to retrieve cart' });
  }
};

// ✅ Secure: Fetch cart for logged-in user (req.user.id)
const getCartForCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(`
      SELECT c.id AS cart_id, c.quantity, c.created_at,
             p.id AS product_id, p.name, p.price, p.description, p.image_url
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [req.user.id]);

    res.json(
      result.rows.map(item => ({
        ...item,
        price: parseFloat(item.price) // convert price from string to number
      }))
    );
    
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to retrieve cart' });
  }
};

// ✅ Keep the rest of your functions (add, update, delete)
const addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!product_id || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Missing product_id or quantity' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO carts (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [user_id, product_id, quantity]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
};

const updateCartItem = async (req, res) => {
  const { cartId } = req.params;
  const { quantity } = req.body;

  try {
    const result = await pool.query(`
      UPDATE carts
      SET quantity = $1
      WHERE id = $2
      RETURNING *
    `, [quantity, cartId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

const deleteCartItem = async (req, res) => {
  const { cartId } = req.params;

  try {
    const result = await pool.query(`
      DELETE FROM carts
      WHERE id = $1
      RETURNING *
    `, [cartId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart', deletedItem: result.rows[0] });
  } catch (err) {
    console.error('Error deleting cart item:', err);
    res.status(500).json({ error: 'Failed to delete cart item' });
  }
};

const saveCartForCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.user.id;
  const cart = req.body.cart;

  if (!Array.isArray(cart)) {
    return res.status(400).json({ error: 'Invalid cart format' });
  }

  const validItems = cart.filter(item =>
    Number.isInteger(item.product_id || item.id) &&
    Number.isInteger(item.quantity)
  );

  try {
    await pool.query('BEGIN');

    // ✅ Always clear the cart first
    await pool.query(`DELETE FROM carts WHERE user_id = $1`, [userId]);

    // ✅ If there's anything to re-add, do it
    if (validItems.length > 0) {
      for (const item of validItems) {
        const product_id = item.product_id || item.id;
        const quantity = item.quantity;

        await pool.query(
          `INSERT INTO carts (user_id, product_id, quantity)
           VALUES ($1, $2, $3)`,
          [userId, product_id, quantity]
        );
      }
    }

    await pool.query('COMMIT');
    res.status(200).json({ message: 'Cart saved (or cleared) successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error saving cart:', err);
    res.status(500).json({ error: 'Failed to save cart' });
  }
};


const removeCartItem = async (req, res) => {
  const { cartId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM carts WHERE id = $1 AND user_id = $2 RETURNING *`,
      [cartId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cart item not found or not owned by user' });
    }

    res.json({ message: 'Item removed from cart', deletedItem: result.rows[0] });
  } catch (err) {
    console.error('Error removing cart item:', err);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
};

const mergeCart = async (req, res) => {
  const userId = req.user?.id;
  const items = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Cart data must be an array' });
  }

  try {
    for (const item of items) {
      const { product_id, quantity } = item;

      if (!Number.isInteger(product_id) || !Number.isInteger(quantity)) {
        continue; // skip invalid items
      }

      const exists = await pool.query(
        `SELECT id FROM carts WHERE user_id = $1 AND product_id = $2`,
        [userId, product_id]
      );

      if (exists.rowCount === 0) {
        await pool.query(
          `INSERT INTO carts (user_id, product_id, quantity)
           VALUES ($1, $2, $3)`,
          [userId, product_id, quantity]
        );
      }
    }

    res.status(200).json({ message: 'Cart merged successfully' });
  } catch (err) {
    console.error('Error merging cart:', err);
    res.status(500).json({ error: 'Failed to merge cart' });
  }
};

// Clear all cart items for the logged-in user
const clearCartForCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await pool.query('DELETE FROM carts WHERE user_id = $1', [req.user.id]);
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Failed to clear cart:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

module.exports = {
  getCartForCurrentUser,
  getCartByUserId,
  addToCart,
  updateCartItem,
  deleteCartItem,
  saveCartForCurrentUser,
  removeCartItem,
  mergeCart,
  clearCartForCurrentUser
};