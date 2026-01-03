const pool = require("../config/database");

class Supplier {
  static async getAll() {
    const [rows] = await pool.execute("SELECT * FROM suppliers ORDER BY name");
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute("SELECT * FROM suppliers WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  static async create(supplierData) {
    const { name, contact_person, email, phone, address } = supplierData;
    const [result] = await pool.execute(
      "INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)",
      [name, contact_person, email, phone, address]
    );
    return result.insertId;
  }

  static async update(id, supplierData) {
    const { name, contact_person, email, phone, address } = supplierData;
    await pool.execute(
      "UPDATE suppliers SET name=?, contact_person=?, email=?, phone=?, address=? WHERE id=?",
      [name, contact_person, email, phone, address, id]
    );
  }

  static async delete(id) {
    await pool.execute("DELETE FROM suppliers WHERE id = ?", [id]);
  }
}

module.exports = Supplier;
