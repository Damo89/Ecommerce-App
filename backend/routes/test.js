const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// GET /api/test-db - basic DB health check
router.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "users" LIMIT 5');
    res.json(result.rows);
  } catch (err) {
    console.error("🔥 DB Error:", err.message);
    res.status(500).send("Database error: " + err.message);
  }
});

module.exports = router;