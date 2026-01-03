const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { body, validationResult } = require("express-validator");
const AuditLog = require("../models/AuditLog");

const authController = {
  login: [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),

    async (req, res) => {
      try {
        console.log("Login attempt:", { username: req.body.username });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
          });
        }

        const { username, password } = req.body;

        // Find user
        const user = await User.findByUsername(username);
        if (!user) {
          console.log("User not found:", username);

          // Safe audit log - handle potential errors
          try {
            await AuditLog.create({
              action: "LOGIN_FAILED",
              table_name: "users",
              new_values: JSON.stringify({
                username,
                reason: "User not found",
              }),
              ip_address: req.ip || "unknown",
              user_agent: req.get("User-Agent") || "unknown",
            });
          } catch (auditError) {
            console.log("Audit log failed (non-critical):", auditError.message);
          }

          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        // Check if user is active
        if (!user.is_active) {
          console.log("User inactive:", username);

          try {
            await AuditLog.create({
              user_id: user.id,
              action: "LOGIN_FAILED",
              table_name: "users",
              record_id: user.id,
              new_values: JSON.stringify({
                username,
                reason: "Account inactive",
              }),
              ip_address: req.ip || "unknown",
              user_agent: req.get("User-Agent") || "unknown",
            });
          } catch (auditError) {
            console.log("Audit log failed (non-critical):", auditError.message);
          }

          return res.status(401).json({
            success: false,
            message: "Account is deactivated",
          });
        }

        // Verify password
        console.log("Verifying password for user:", username);
        const isPasswordValid = await User.verifyPassword(
          password,
          user.password
        );
        console.log("Password valid:", isPasswordValid);

        if (!isPasswordValid) {
          try {
            await AuditLog.create({
              user_id: user.id,
              action: "LOGIN_FAILED",
              table_name: "users",
              record_id: user.id,
              new_values: JSON.stringify({
                username,
                reason: "Invalid password",
              }),
              ip_address: req.ip || "unknown",
              user_agent: req.get("User-Agent") || "unknown",
            });
          } catch (auditError) {
            console.log("Audit log failed (non-critical):", auditError.message);
          }

          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        // Update last login
        await User.updateLastLogin(user.id);

        // Generate token
        const token = generateToken(user.id, user.role);
        console.log("Login successful, token generated for user:", username);

        // Log successful login
        try {
          await AuditLog.create({
            user_id: user.id,
            action: "LOGIN_SUCCESS",
            table_name: "users",
            record_id: user.id,
            ip_address: req.ip || "unknown",
            user_agent: req.get("User-Agent") || "unknown",
          });
        } catch (auditError) {
          console.log("Audit log failed (non-critical):", auditError.message);
        }

        res.json({
          success: true,
          message: "Login successful",
          data: {
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              first_name: user.first_name,
              last_name: user.last_name,
              department: user.department,
            },
          },
        });
      } catch (error) {
        console.error("Login error details:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    },
  ],

  getProfile: async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            department: req.user.department,
            phone: req.user.phone,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),

    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
          });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findByUsername(req.user.username);

        // Verify current password
        const isCurrentPasswordValid = await User.verifyPassword(
          currentPassword,
          user.password
        );
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            success: false,
            message: "Current password is incorrect",
          });
        }

        // Change password
        await User.changePassword(req.user.id, newPassword);

        res.json({
          success: true,
          message: "Password changed successfully",
        });
      } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    },
  ],

  logout: async (req, res) => {
    try {
      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = authController;
