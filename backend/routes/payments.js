const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Process payment
router.post("/process", (req, res) => {
  const { booking_id, amount, payment_method, transaction_id, full_amount } =
    req.body;

  const paymentQuery = `
        INSERT INTO payments (booking_id, amount, payment_method, transaction_id, payment_status, payment_date) 
        VALUES (?, ?, ?, ?, 'completed', NOW())
    `;

  const updateBookingQuery =
    "UPDATE bookings SET payment_status = ? WHERE id = ?";

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Create payment record
    db.query(
      paymentQuery,
      [booking_id, amount, payment_method, transaction_id],
      (err, results) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        // Update booking payment status
        const paymentStatus =
          parseFloat(amount) === parseFloat(full_amount) ? "paid" : "partial";
        db.query(updateBookingQuery, [paymentStatus, booking_id], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: err.message });
              });
            }
            res.json({
              id: results.insertId,
              message: "Payment processed successfully",
              payment_status: paymentStatus,
            });
          });
        });
      }
    );
  });
});

// Get payments by booking
router.get("/booking/:bookingId", (req, res) => {
  const bookingId = req.params.bookingId;

  const query = `
        SELECT * FROM payments 
        WHERE booking_id = ? 
        ORDER BY created_at DESC
    `;

  db.query(query, [bookingId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
