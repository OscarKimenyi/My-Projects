const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all rooms
router.get("/", (req, res) => {
  const query = "SELECT * FROM rooms ORDER BY room_number";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get available rooms
router.get("/available", (req, res) => {
  const query = "SELECT * FROM rooms WHERE status = 'available'";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add new room
router.post("/", (req, res) => {
  const { room_number, room_type, price_per_night, description } = req.body;
  const query =
    "INSERT INTO rooms (room_number, room_type, price_per_night, description) VALUES (?, ?, ?, ?)";

  db.query(
    query,
    [room_number, room_type, price_per_night, description],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: results.insertId, message: "Room added successfully" });
    }
  );
});

module.exports = router;
