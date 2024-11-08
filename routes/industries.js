const express = require('express');
const router = new express.Router();
const db = require('../db');

// Create an industry
router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const result = await db.query(
      "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
      [code, industry]
    );
    return res.json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// List all industries
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM industries");
    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;