const { pool } = require("../config/database");

class AuditLog {
  static async create(logData) {
    const {
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      ip_address,
      user_agent,
    } = logData;

    // Convert undefined values to null for database
    const [result] = await pool.execute(
      `INSERT INTO audit_logs (
                user_id, action, table_name, record_id, 
                old_values, new_values, ip_address, user_agent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id || null,
        action,
        table_name || null,
        record_id || null,
        old_values ? JSON.stringify(old_values) : null,
        new_values ? JSON.stringify(new_values) : null,
        ip_address || null,
        user_agent || null,
      ]
    );

    return result.insertId;
  }

  static async getAll(filters = {}) {
    let query = `
            SELECT al.*, u.username, u.first_name, u.last_name 
            FROM audit_logs al 
            LEFT JOIN users u ON al.user_id = u.id 
            WHERE 1=1
        `;
    const values = [];

    if (filters.user_id) {
      query += " AND al.user_id = ?";
      values.push(filters.user_id);
    }

    if (filters.action) {
      query += " AND al.action = ?";
      values.push(filters.action);
    }

    if (filters.start_date) {
      query += " AND al.timestamp >= ?";
      values.push(filters.start_date);
    }

    if (filters.end_date) {
      query += " AND al.timestamp <= ?";
      values.push(filters.end_date);
    }

    query += " ORDER BY al.timestamp DESC LIMIT 1000";

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  static async getByUser(userId, limit = 50) {
    const [rows] = await pool.execute(
      `SELECT al.*, u.username 
             FROM audit_logs al 
             LEFT JOIN users u ON al.user_id = u.id 
             WHERE al.user_id = ? 
             ORDER BY al.timestamp DESC 
             LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }
}

module.exports = AuditLog;
