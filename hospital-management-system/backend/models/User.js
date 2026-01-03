const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  static async getById(id) {
    const [rows] = await pool.execute(
      "SELECT id, username, email, role, first_name, last_name, department, phone, is_active, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0];
  }

  static async create(userData) {
    const {
      username,
      email,
      password,
      role,
      first_name,
      last_name,
      department,
      phone,
    } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password, role, first_name, last_name, department, phone) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        email,
        hashedPassword,
        role,
        first_name,
        last_name,
        department,
        phone,
      ]
    );
    return result.insertId;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(userId) {
    await pool.execute(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [userId]
    );
  }

  static async getAll() {
    const [rows] = await pool.execute(
      "SELECT id, username, email, role, first_name, last_name, department, phone, is_active, last_login, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  }

  static async update(userId, userData) {
    const fields = [];
    const values = [];

    Object.keys(userData).forEach((key) => {
      if (userData[key] !== undefined && key !== "password") {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(userId);

    await pool.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.getById(userId);
  }

  static async changePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);
  }
}

module.exports = User;
