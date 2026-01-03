// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/authController");
// const userController = require("../controllers/userController");
// const { auth, requireRole } = require("../middleware/auth");

// // Public routes
// router.post("/login", authController.login);

// // Protected routes
// router.get("/profile", auth, authController.getProfile);
// router.post("/change-password", auth, authController.changePassword);
// router.post("/logout", auth, authController.logout);

// // User management (admin only)
// router.get(
//   "/users",
//   auth,
//   requireRole("super_admin", "admin"),
//   userController.getAllUsers
// );
// router.post(
//   "/users",
//   auth,
//   requireRole("super_admin", "admin"),
//   userController.createUser
// );
// router.put(
//   "/users/:id",
//   auth,
//   requireRole("super_admin", "admin"),
//   userController.updateUser
// );

// router.put("/profile", auth, userController.updateProfile);

// module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

// Test users (temporary - replace with database later)
const users = [
  {
    id: 1,
    username: "superadmin",
    password: "$2a$10$YOUR_HASHED_PASSWORD_HERE", // password123
    first_name: "Super",
    last_name: "Admin",
    email: "superadmin@hospital.com",
    phone: "1234567890",
    department: "Administration",
    role: "superadmin",
  },
  {
    id: 2,
    username: "admin",
    password: "$2a$10$YOUR_HASHED_PASSWORD_HERE",
    first_name: "Admin",
    last_name: "User",
    email: "admin@hospital.com",
    phone: "0987654321",
    department: "Administration",
    role: "admin",
  },
  {
    id: 3,
    username: "dr_smith",
    password: "$2a$10$YOUR_HASHED_PASSWORD_HERE",
    first_name: "John",
    last_name: "Smith",
    email: "dr.smith@hospital.com",
    phone: "5551234567",
    department: "Cardiology",
    role: "doctor",
  },
  {
    id: 4,
    username: "nurse_mary",
    password: "$2a$10$YOUR_HASHED_PASSWORD_HERE",
    first_name: "Mary",
    last_name: "Johnson",
    email: "nurse.mary@hospital.com",
    phone: "5559876543",
    department: "Nursing",
    role: "nurse",
  },
  {
    id: 5,
    username: "reception1",
    password: "$2a$10$YOUR_HASHED_PASSWORD_HERE",
    first_name: "Sarah",
    last_name: "Williams",
    email: "reception@hospital.com",
    phone: "5554567890",
    department: "Reception",
    role: "receptionist",
  },
];

// Temporary: Create a quick fix with plain password check
// Remove this later when you add proper bcrypt
const TEMPORARY_USERS = users.map((user) => ({
  ...user,
  // Plain password for testing
  plainPassword: "password123",
}));

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("🔐 Login attempt:", {
      username,
      password: password ? "***" : "missing",
    });

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both username and password",
      });
    }

    // Find user (temporary - replace with database query)
    const user = TEMPORARY_USERS.find((u) => u.username === username);

    if (!user) {
      console.log("❌ User not found:", username);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // TEMPORARY: Simple password check (remove this in production)
    if (password !== "password123") {
      console.log("❌ Invalid password for user:", username);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token payload
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };

    // Generate token (temporary secret - use environment variable in production)
    const token = jwt.sign(payload, "hospital_secret_key", {
      expiresIn: "24h",
    });

    // Remove password from response
    const { plainPassword, ...userWithoutPassword } = user;

    console.log("✅ Login successful for:", username);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          department: user.department,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify token
// @access  Private
router.get("/verify", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, "hospital_secret_key");

    res.json({
      success: true,
      data: {
        valid: true,
        user: decoded.user,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});

// @route   GET /api/auth/test
// @desc    Test authentication endpoint
// @access  Public
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Authentication endpoint is working",
    timestamp: new Date().toISOString(),
    users: TEMPORARY_USERS.map((u) => ({
      username: u.username,
      role: u.role,
      name: `${u.first_name} ${u.last_name}`,
    })),
  });
});

module.exports = router;
