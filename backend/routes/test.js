const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// GET /api/test-db - basic DB health check
router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
