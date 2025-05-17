const pool = require('../database/db');

// Fetch all products
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(
      result.rows.map(product => ({
        ...product,
        price: parseFloat(product.price),
        image_url: product.image_url || 'https://via.placeholder.com/300x200.png?text=No+Image',
        description: product.description || 'No description provided.'
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch one product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Product not found');
    const product = result.rows[0];
    res.json({
      ...product,
      price: parseFloat(product.price),
      image_url: product.image_url || 'https://via.placeholder.com/300x200.png?text=No+Image',
      description: product.description || 'No description provided.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  const { name, description, price, stock, image_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, price, stock, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update an existing product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, image_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, stock = $4, image_url = $5
       WHERE id = $6 RETURNING *`,
      [name, description, price, stock, image_url, id]
    );

    if (result.rows.length === 0) return res.status(404).send('Product not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Product not found');
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
