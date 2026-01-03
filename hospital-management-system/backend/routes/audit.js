const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");
const { auth, requireRole } = require("../middleware/auth");

// Get audit logs (admin only)
router.get("/", auth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const { user_id, action, start_date, end_date } = req.query;

    const filters = {};
    if (user_id) filters.user_id = user_id;
    if (action) filters.action = action;
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;

    const logs = await AuditLog.getAll(filters);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user's own activity
router.get("/my-activity", auth, async (req, res) => {
  try {
    const logs = await AuditLog.getByUser(req.user.id);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
