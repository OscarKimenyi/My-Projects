const { pool } = require("../config/database");

class Drug {
  static async getAll() {
    const [rows] = await pool.execute(`
            SELECT * FROM drugs ORDER BY name
        `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute("SELECT * FROM drugs WHERE id = ?", [id]);
    return rows[0];
  }

  static async create(drugData) {
    const {
      drug_id,
      name,
      brand,
      category,
      description,
      unit_price,
      stock_quantity,
      reorder_level,
      expiry_date,
      supplier,
    } = drugData;

    const [result] = await pool.execute(
      `INSERT INTO drugs (
                drug_id, name, brand, category, description, unit_price,
                stock_quantity, reorder_level, expiry_date, supplier
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        drug_id,
        name,
        brand,
        category,
        description,
        unit_price,
        stock_quantity,
        reorder_level,
        expiry_date,
        supplier,
      ]
    );

    return this.getById(result.insertId);
  }

  static async update(id, drugData) {
    const fields = [];
    const values = [];

    Object.keys(drugData).forEach((key) => {
      if (drugData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(drugData[key]);
      }
    });

    values.push(id);

    await pool.execute(
      `UPDATE drugs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.getById(id);
  }

  static async delete(id) {
    await pool.execute("DELETE FROM drugs WHERE id = ?", [id]);
    return true;
  }

  static async search(query) {
    const searchQuery = `%${query}%`;
    const [rows] = await pool.execute(
      `SELECT * FROM drugs 
             WHERE name LIKE ? OR brand LIKE ? OR drug_id LIKE ? OR category LIKE ?
             ORDER BY name`,
      [searchQuery, searchQuery, searchQuery, searchQuery]
    );
    return rows;
  }

  static async getLowStock() {
    const [rows] = await pool.execute(
      "SELECT * FROM drugs WHERE stock_quantity <= reorder_level ORDER BY stock_quantity ASC"
    );
    return rows;
  }

  static async updateStock(id, quantity) {
    await pool.execute(
      "UPDATE drugs SET stock_quantity = stock_quantity + ? WHERE id = ?",
      [quantity, id]
    );
    return this.getById(id);
  }
}

module.exports = Drug;
