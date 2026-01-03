const pool = require("../config/database");

class Sale {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT s.*, p.name as product_name 
      FROM sales s 
      JOIN products p ON s.product_id = p.id
      ORDER BY s.sale_date DESC
    `);
    return rows;
  }

  static async create(saleData) {
    const {
      product_id,
      quantity,
      unit_price,
      total_price,
      sale_date,
      customer_name,
      notes,
    } = saleData;

    // Check stock availability
    const [product] = await pool.execute(
      "SELECT stock_quantity FROM products WHERE id = ?",
      [product_id]
    );

    if (product[0].stock_quantity < quantity) {
      throw new Error("Insufficient stock");
    }

    const [result] = await pool.execute(
      "INSERT INTO sales (product_id, quantity, unit_price, total_price, sale_date, customer_name, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        product_id,
        quantity,
        unit_price,
        total_price,
        sale_date,
        customer_name,
        notes,
      ]
    );

    // Update product stock
    await pool.execute(
      "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
      [quantity, product_id]
    );

    return result.insertId;
  }
}

module.exports = Sale;
