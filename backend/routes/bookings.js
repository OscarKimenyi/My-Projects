const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all bookings with guest and room details
router.get("/", (req, res) => {
  const query = `
        SELECT 
            b.*, 
            g.first_name, 
            g.last_name, 
            g.email as guest_email,
            g.phone, 
            r.room_number, 
            r.room_type, 
            r.price_per_night,
            (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.booking_id = b.id AND p.payment_status = 'completed') as paid_amount
        FROM bookings b
        JOIN guests g ON b.guest_id = g.id
        JOIN rooms r ON b.room_id = r.id
        ORDER BY b.created_at DESC
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get booking by ID
router.get("/:id", (req, res) => {
  const bookingId = req.params.id;

  const query = `
        SELECT 
            b.*, 
            g.first_name, 
            g.last_name, 
            g.email as guest_email,
            g.phone, 
            g.address,
            r.room_number, 
            r.room_type, 
            r.price_per_night,
            r.description as room_description,
            (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.booking_id = b.id AND p.payment_status = 'completed') as paid_amount
        FROM bookings b
        JOIN guests g ON b.guest_id = g.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ?
    `;

  db.query(query, [bookingId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(results[0]);
  });
});

// Search bookings
router.get("/search/:query", (req, res) => {
  const searchQuery = `%${req.params.query}%`;

  const query = `
        SELECT 
            b.*, 
            g.first_name, 
            g.last_name, 
            g.email as guest_email,
            g.phone, 
            r.room_number, 
            r.room_type, 
            r.price_per_night
        FROM bookings b
        JOIN guests g ON b.guest_id = g.id
        JOIN rooms r ON b.room_id = r.id
        WHERE 
            g.first_name LIKE ? OR 
            g.last_name LIKE ? OR 
            g.email LIKE ? OR 
            g.phone LIKE ? OR
            r.room_number LIKE ? OR
            r.room_type LIKE ?
        ORDER BY b.created_at DESC
    `;

  db.query(
    query,
    [
      searchQuery,
      searchQuery,
      searchQuery,
      searchQuery,
      searchQuery,
      searchQuery,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// Filter bookings by status
router.get("/filter/:status", (req, res) => {
  const status = req.params.status;

  const query = `
        SELECT 
            b.*, 
            g.first_name, 
            g.last_name, 
            g.email as guest_email,
            g.phone, 
            r.room_number, 
            r.room_type, 
            r.price_per_night
        FROM bookings b
        JOIN guests g ON b.guest_id = g.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.status = ?
        ORDER BY b.created_at DESC
    `;

  db.query(query, [status], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Create new booking
router.post("/", (req, res) => {
  const {
    guest_id,
    room_id,
    check_in,
    check_out,
    total_amount,
    guest_email,
    guest_name,
  } = req.body;

  const bookingQuery = `
        INSERT INTO bookings (guest_id, room_id, check_in, check_out, total_amount) 
        VALUES (?, ?, ?, ?, ?)
    `;

  const updateRoomQuery = 'UPDATE rooms SET status = "occupied" WHERE id = ?';

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Create booking
    db.query(
      bookingQuery,
      [guest_id, room_id, check_in, check_out, total_amount],
      (err, results) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        const bookingId = results.insertId;

        // Update room status
        db.query(updateRoomQuery, [room_id], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }

          // Get room details for email
          const roomQuery =
            "SELECT room_number, room_type FROM rooms WHERE id = ?";
          db.query(roomQuery, [room_id], (err, roomResults) => {
            if (err) {
              console.error("Error fetching room details for email:", err);
              // Don't rollback if email fails, just log error
            }

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: err.message });
                });
              }

              res.json({
                id: bookingId,
                message: "Booking created successfully",
                email_sent: !!guest_email,
              });
            });
          });
        });
      }
    );
  });
});

// Check-in booking
router.put("/:id/checkin", (req, res) => {
  const bookingId = req.params.id;

  const updateBookingQuery =
    'UPDATE bookings SET status = "checked-in" WHERE id = ?';

  db.query(updateBookingQuery, [bookingId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ message: "Guest checked in successfully" });
  });
});

// Check-out booking
router.put("/:id/checkout", (req, res) => {
  const bookingId = req.params.id;

  const getRoomIdQuery = "SELECT room_id FROM bookings WHERE id = ?";

  db.query(getRoomIdQuery, [bookingId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const roomId = results[0].room_id;

    db.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Update booking status
      db.query(
        'UPDATE bookings SET status = "checked-out" WHERE id = ?',
        [bookingId],
        (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }

          // Update room status to available
          db.query(
            'UPDATE rooms SET status = "available" WHERE id = ?',
            [roomId],
            (err) => {
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
                res.json({ message: "Guest checked out successfully" });
              });
            }
          );
        }
      );
    });
  });
});

// Cancel booking
router.put("/:id/cancel", (req, res) => {
  const bookingId = req.params.id;

  const getRoomIdQuery = "SELECT room_id FROM bookings WHERE id = ?";

  db.query(getRoomIdQuery, [bookingId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const roomId = results[0].room_id;

    db.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Update booking status to cancelled
      db.query(
        'UPDATE bookings SET status = "cancelled" WHERE id = ?',
        [bookingId],
        (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }

          // Update room status to available
          db.query(
            'UPDATE rooms SET status = "available" WHERE id = ?',
            [roomId],
            (err) => {
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
                res.json({ message: "Booking cancelled successfully" });
              });
            }
          );
        }
      );
    });
  });
});

// Update booking
router.put("/:id", (req, res) => {
  const bookingId = req.params.id;
  const { check_in, check_out, total_amount } = req.body;

  const query = `
        UPDATE bookings 
        SET check_in = ?, check_out = ?, total_amount = ?
        WHERE id = ?
    `;

  db.query(
    query,
    [check_in, check_out, total_amount, bookingId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json({ message: "Booking updated successfully" });
    }
  );
});

// Get booking statistics for dashboard
router.get("/stats/dashboard", (req, res) => {
  const query = `
        SELECT 
            COUNT(*) as total_bookings,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
            SUM(CASE WHEN status = 'checked-in' THEN 1 ELSE 0 END) as checked_in_bookings,
            SUM(CASE WHEN status = 'checked-out' THEN 1 ELSE 0 END) as checked_out_bookings,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COALESCE(AVG(total_amount), 0) as average_booking_value
        FROM bookings
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

// Get today's arrivals and departures
router.get("/today/movements", (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const arrivalsQuery = `
        SELECT 
            b.id, b.check_in, b.check_out, b.status,
            g.first_name, g.last_name, g.phone,
            r.room_number, r.room_type
        FROM bookings b
        JOIN guests g ON b.guest_id = g.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.check_in = ? AND b.status IN ('confirmed', 'checked-in')
        ORDER BY b.check_in
    `;

  const departuresQuery = `
        SELECT 
            b.id, b.check_in, b.check_out, b.status,
            g.first_name, g.last_name, g.phone,
            r.room_number, r.room_type
        FROM bookings b
        JOIN guests g ON b.guest_id = g.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.check_out = ? AND b.status IN ('confirmed', 'checked-in')
        ORDER BY b.check_out
    `;

  db.query(arrivalsQuery, [today], (err, arrivals) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.query(departuresQuery, [today], (err, departures) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        arrivals,
        departures,
        today: today,
      });
    });
  });
});

module.exports = router;
