const { pool } = require("../config/database");

class LabTest {
  static async getAll() {
    const [rows] = await pool.execute(`
            SELECT * FROM lab_tests ORDER BY test_name
        `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute("SELECT * FROM lab_tests WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  static async create(testData) {
    const {
      test_id,
      test_name,
      description,
      category,
      price,
      turnaround_time,
      normal_range,
    } = testData;

    const [result] = await pool.execute(
      `INSERT INTO lab_tests (
                test_id, test_name, description, category, price,
                turnaround_time, normal_range
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        test_id,
        test_name,
        description,
        category,
        price,
        turnaround_time,
        normal_range,
      ]
    );

    return this.getById(result.insertId);
  }

  static async update(id, testData) {
    const fields = [];
    const values = [];

    Object.keys(testData).forEach((key) => {
      if (testData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(testData[key]);
      }
    });

    values.push(id);

    await pool.execute(
      `UPDATE lab_tests SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.getById(id);
  }

  static async delete(id) {
    await pool.execute("DELETE FROM lab_tests WHERE id = ?", [id]);
    return true;
  }

  static async search(query) {
    const searchQuery = `%${query}%`;
    const [rows] = await pool.execute(
      `SELECT * FROM lab_tests 
             WHERE test_name LIKE ? OR test_id LIKE ? OR category LIKE ?
             ORDER BY test_name`,
      [searchQuery, searchQuery, searchQuery]
    );
    return rows;
  }
}

module.exports = LabTest;
