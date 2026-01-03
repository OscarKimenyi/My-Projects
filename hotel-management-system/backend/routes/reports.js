const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Revenue report
router.get("/revenue", (req, res) => {
  const { start_date, end_date } = req.query;

  let query = `
        SELECT 
            DATE(b.created_at) as date,
            COUNT(*) as bookings_count,
            SUM(b.total_amount) as total_revenue,
            AVG(b.total_amount) as average_booking_value
        FROM bookings b
        WHERE b.status IN ('confirmed', 'checked-in', 'checked-out')
    `;

  const params = [];

  if (start_date && end_date) {
    query += " AND DATE(b.created_at) BETWEEN ? AND ?";
    params.push(start_date, end_date);
  }

  query += " GROUP BY DATE(b.created_at) ORDER BY date DESC LIMIT 30";

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Occupancy report
router.get("/occupancy", (req, res) => {
  const query = `
        SELECT 
            r.room_type,
            COUNT(*) as total_rooms,
            SUM(CASE WHEN r.status = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms,
            ROUND((SUM(CASE WHEN r.status = 'occupied' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as occupancy_rate
        FROM rooms r
        GROUP BY r.room_type
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Guest statistics
router.get("/guests", (req, res) => {
  const query = `
        SELECT 
            COUNT(*) as total_guests,
            COUNT(DISTINCT email) as unique_emails,
            DATE(MIN(created_at)) as first_guest_date,
            DATE(MAX(created_at)) as latest_guest_date
        FROM guests
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

module.exports = router;
