const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all guests
router.get("/", (req, res) => {
  const query = "SELECT * FROM guests ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add new guest
router.post("/", (req, res) => {
  const { first_name, last_name, email, phone, address } = req.body;
  const query =
    "INSERT INTO guests (first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [first_name, last_name, email, phone, address],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: results.insertId, message: "Guest added successfully" });
    }
  );
});

module.exports = router;
