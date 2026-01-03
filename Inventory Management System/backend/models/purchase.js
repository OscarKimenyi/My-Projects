const pool = require("../config/database");

class Purchase {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT p.*, pr.name as product_name, s.name as supplier_name 
      FROM purchases p 
      JOIN products pr ON p.product_id = pr.id 
      JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.purchase_date DESC
    `);
    return rows;
  }

  static async create(purchaseData) {
    const {
      product_id,
      supplier_id,
      quantity,
      unit_cost,
      total_cost,
      purchase_date,
      notes,
    } = purchaseData;
    const [result] = await pool.execute(
      "INSERT INTO purchases (product_id, supplier_id, quantity, unit_cost, total_cost, purchase_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        product_id,
        supplier_id,
        quantity,
        unit_cost,
        total_cost,
        purchase_date,
        notes,
      ]
    );

    // Update product stock
    await pool.execute(
      "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
      [quantity, product_id]
    );

    return result.insertId;
  }
}

module.exports = Purchase;
