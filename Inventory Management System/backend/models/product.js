const pool = require("../config/database");

class Product {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT p.*, s.name as supplier_name 
      FROM products p 
      LEFT JOIN suppliers s ON p.supplier_id = s.id
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      "SELECT p.*, s.name as supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?",
      [id]
    );
    return rows[0];
  }

  static async create(productData) {
    const {
      name,
      description,
      sku,
      category,
      price,
      cost,
      stock_quantity,
      min_stock_level,
      supplier_id,
    } = productData;
    const [result] = await pool.execute(
      "INSERT INTO products (name, description, sku, category, price, cost, stock_quantity, min_stock_level, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        description,
        sku,
        category,
        price,
        cost,
        stock_quantity,
        min_stock_level,
        supplier_id,
      ]
    );
    return result.insertId;
  }

  static async update(id, productData) {
    const {
      name,
      description,
      sku,
      category,
      price,
      cost,
      stock_quantity,
      min_stock_level,
      supplier_id,
    } = productData;
    await pool.execute(
      "UPDATE products SET name=?, description=?, sku=?, category=?, price=?, cost=?, stock_quantity=?, min_stock_level=?, supplier_id=? WHERE id=?",
      [
        name,
        description,
        sku,
        category,
        price,
        cost,
        stock_quantity,
        min_stock_level,
        supplier_id,
        id,
      ]
    );
  }

  static async delete(id) {
    await pool.execute("DELETE FROM products WHERE id = ?", [id]);
  }

  static async getLowStock() {
    const [rows] = await pool.execute(
      "SELECT p.*, s.name as supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.stock_quantity <= p.min_stock_level"
    );
    return rows;
  }

  static async search(query) {
    const [rows] = await pool.execute(
      `SELECT p.*, s.name as supplier_name 
       FROM products p 
       LEFT JOIN suppliers s ON p.supplier_id = s.id 
       WHERE p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows;
  }
}

module.exports = Product;
