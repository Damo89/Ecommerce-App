const pool = require('../database/db');
const { hashPassword } = require('../middleware/hash');

//Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, created_at FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Fetch a user by ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'SELECT id, email, created_at FROM users WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) return res.status(404).send('User not found');
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

//Create a new user
const createUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    try {
      const hashedPassword = await hashPassword(password);
      const result = await pool.query(
        `INSERT INTO users (email, password)
         VALUES ($1, $2)
         RETURNING id, email, created_at`,
        [email, hashedPassword]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

//Update an existing user
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    try {
      const result = await pool.query(
        `UPDATE users
         SET email = $1, password = $2
         WHERE id = $3
         RETURNING id, email, created_at`,
        [email, password, id]
      );
      if (result.rowCount === 0) return res.status(404).send('User not found');
      res.json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  
//Delete an existing user
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      if (result.rowCount === 0) return res.status(404).send('User not found');
      res.send('User deleted successfully');
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
