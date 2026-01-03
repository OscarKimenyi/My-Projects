const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { body, validationResult } = require("express-validator");

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAll();

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: "VIEW_USERS",
        table_name: "users",
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  createUser: [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn([
        "admin",
        "doctor",
        "nurse",
        "receptionist",
        "pharmacist",
        "lab_technician",
      ])
      .withMessage("Invalid role"),
    body("first_name").notEmpty().withMessage("First name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),

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

        const userData = req.body;
        const userId = await User.create(userData);

        // Log the action
        await AuditLog.create({
          user_id: req.user.id,
          action: "USER_CREATED",
          table_name: "users",
          record_id: userId,
          new_values: JSON.stringify({
            username: userData.username,
            email: userData.email,
            role: userData.role,
            first_name: userData.first_name,
            last_name: userData.last_name,
          }),
          ip_address: req.ip,
          user_agent: req.get("User-Agent"),
        });

        res.status(201).json({
          success: true,
          message: "User created successfully",
          data: { id: userId },
        });
      } catch (error) {
        console.error("Create user error:", error);

        if (error.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            success: false,
            message: "Username or email already exists",
          });
        }

        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    },
  ],

  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;

      const oldUser = await User.getById(userId);
      const updatedUser = await User.update(userId, userData);

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: "USER_UPDATED",
        table_name: "users",
        record_id: userId,
        old_values: JSON.stringify(oldUser),
        new_values: JSON.stringify(updatedUser),
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
      });

      res.json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // Add this method to userController
  updateProfile: async (req, res) => {
    try {
      const { first_name, last_name, email, phone, department } = req.body;

      const updatedUser = await User.update(req.user.id, {
        first_name,
        last_name,
        email,
        phone,
        department,
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = userController;
