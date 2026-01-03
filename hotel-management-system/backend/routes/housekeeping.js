const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all housekeeping tasks
router.get("/tasks", (req, res) => {
  const query = `
        SELECT 
            ht.*,
            r.room_number,
            r.room_type,
            hs.section as assigned_section,
            u.username as assigned_to_name,
            uc.username as created_by_name
        FROM housekeeping_tasks ht
        JOIN rooms r ON ht.room_id = r.id
        LEFT JOIN housekeeping_staff hs ON ht.assigned_to = hs.id
        LEFT JOIN users u ON hs.user_id = u.id
        LEFT JOIN users uc ON ht.created_by = uc.id
        ORDER BY 
            CASE ht.priority 
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                ELSE 4
            END,
            ht.created_at DESC
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get tasks by staff member
router.get("/tasks/staff/:staffId", (req, res) => {
  const staffId = req.params.staffId;

  const query = `
        SELECT 
            ht.*,
            r.room_number,
            r.room_type
        FROM housekeeping_tasks ht
        JOIN rooms r ON ht.room_id = r.id
        WHERE ht.assigned_to = ?
        ORDER BY 
            CASE ht.priority 
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                ELSE 4
            END,
            ht.created_at DESC
    `;

  db.query(query, [staffId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Create new housekeeping task
router.post("/tasks", (req, res) => {
  const { room_id, assigned_to, task_type, priority, notes, created_by } =
    req.body;

  const query = `
        INSERT INTO housekeeping_tasks (room_id, assigned_to, task_type, priority, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [room_id, assigned_to, task_type, priority, notes, created_by],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Update room status if it's a cleaning task
      if (task_type === "cleaning") {
        db.query('UPDATE rooms SET status = "maintenance" WHERE id = ?', [
          room_id,
        ]);
      }

      res.json({ id: results.insertId, message: "Task created successfully" });
    }
  );
});

// Update task status
router.put("/tasks/:id/status", (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  const updateData = { status };
  if (status === "completed") {
    updateData.completed_at = new Date();
  }

  const query = "UPDATE housekeeping_tasks SET ? WHERE id = ?";

  db.query(query, [updateData, taskId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    // If task is completed and it's a cleaning task, update room status
    if (status === "completed") {
      db.query(
        `
                UPDATE rooms r
                JOIN housekeeping_tasks ht ON r.id = ht.room_id
                SET r.status = 'available'
                WHERE ht.id = ? AND ht.task_type = 'cleaning'
            `,
        [taskId]
      );
    }

    res.json({ message: "Task status updated successfully" });
  });
});

// Get all maintenance requests
router.get("/maintenance", (req, res) => {
  const query = `
        SELECT 
            mr.*,
            r.room_number,
            r.room_type,
            u.username as reported_by_name,
            hs.section as assigned_section,
            staff_user.username as assigned_to_name
        FROM maintenance_requests mr
        JOIN rooms r ON mr.room_id = r.id
        JOIN users u ON mr.reported_by = u.id
        LEFT JOIN housekeeping_staff hs ON mr.assigned_to = hs.id
        LEFT JOIN users staff_user ON hs.user_id = staff_user.id
        ORDER BY 
            CASE mr.priority 
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                ELSE 4
            END,
            mr.created_at DESC
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Create maintenance request
router.post("/maintenance", (req, res) => {
  const { room_id, reported_by, issue_type, description, priority } = req.body;

  const query = `
        INSERT INTO maintenance_requests (room_id, reported_by, issue_type, description, priority)
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [room_id, reported_by, issue_type, description, priority],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Update room status to maintenance
      db.query('UPDATE rooms SET status = "maintenance" WHERE id = ?', [
        room_id,
      ]);

      res.json({
        id: results.insertId,
        message: "Maintenance request created successfully",
      });
    }
  );
});

// Assign maintenance request
router.put("/maintenance/:id/assign", (req, res) => {
  const requestId = req.params.id;
  const { assigned_to } = req.body;

  const query =
    'UPDATE maintenance_requests SET assigned_to = ?, status = "assigned" WHERE id = ?';

  db.query(query, [assigned_to, requestId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Maintenance request not found" });
    }

    res.json({ message: "Maintenance request assigned successfully" });
  });
});

// Update maintenance request status
router.put("/maintenance/:id/status", (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  const updateData = { status };
  if (status === "completed") {
    updateData.completed_at = new Date();

    // Update room status back to available if maintenance is completed
    db.query(
      `
            UPDATE rooms r
            JOIN maintenance_requests mr ON r.id = mr.room_id
            SET r.status = 'available'
            WHERE mr.id = ?
        `,
      [requestId]
    );
  }

  const query = "UPDATE maintenance_requests SET ? WHERE id = ?";

  db.query(query, [updateData, requestId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Maintenance request not found" });
    }

    res.json({ message: "Maintenance request status updated successfully" });
  });
});

// Get housekeeping staff
router.get("/staff", (req, res) => {
  const query = `
        SELECT 
            hs.*,
            u.username,
            u.email,
            u.role
        FROM housekeeping_staff hs
        JOIN users u ON hs.user_id = u.id
        WHERE hs.is_active = TRUE
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get housekeeping dashboard stats
router.get("/dashboard", (req, res) => {
  const query = `
        SELECT 
            (SELECT COUNT(*) FROM housekeeping_tasks WHERE status = 'pending') as pending_tasks,
            (SELECT COUNT(*) FROM housekeeping_tasks WHERE status = 'in-progress') as in_progress_tasks,
            (SELECT COUNT(*) FROM housekeeping_tasks WHERE status = 'completed' AND DATE(completed_at) = CURDATE()) as completed_today,
            (SELECT COUNT(*) FROM maintenance_requests WHERE status = 'reported') as pending_maintenance
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

module.exports = router;
