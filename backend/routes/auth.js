const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "hotel-management-secret-key-2024";

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log("🔐 Login attempt:", { username, password });

  const query = "SELECT * FROM users WHERE username = ? AND is_active = TRUE";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      console.log("❌ User not found:", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    console.log("✅ Found user:", user.username);

    // Simple password comparison for demo
    if (user.password_hash !== password) {
      console.log("❌ Password mismatch for user:", user.username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("🎉 Login successful for:", user.username);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  });
});

// Get all users (for admin)
router.get("/users", (req, res) => {
  const query =
    "SELECT id, username, email, role, is_active, created_at FROM users";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Register new user (admin only)
router.post("/register", (req, res) => {
  const { username, email, password, role } = req.body;

  const query =
    "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
  db.query(query, [username, email, password, role], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "User created successfully",
      userId: results.insertId,
    });
  });
});

module.exports = router;
