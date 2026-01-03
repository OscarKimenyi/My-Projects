const { pool } = require("../config/database");

class Prescription {
  static async getAll() {
    const [rows] = await pool.execute(`
            SELECT p.*, pt.first_name, pt.last_name, pt.patient_id
            FROM prescriptions p
            JOIN patients pt ON p.patient_id = pt.id
            ORDER BY p.prescription_date DESC
        `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, pt.first_name, pt.last_name, pt.patient_id
             FROM prescriptions p
             JOIN patients pt ON p.patient_id = pt.id
             WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(prescriptionData) {
    const {
      prescription_id,
      patient_id,
      doctor_name,
      diagnosis,
      prescription_date,
      status,
      notes,
    } = prescriptionData;

    const [result] = await pool.execute(
      `INSERT INTO prescriptions (
                prescription_id, patient_id, doctor_name, diagnosis,
                prescription_date, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        prescription_id,
        patient_id,
        doctor_name,
        diagnosis,
        prescription_date,
        status,
        notes,
      ]
    );

    return this.getById(result.insertId);
  }

  static async getItems(prescriptionId) {
    const [rows] = await pool.execute(
      `SELECT pi.*, d.name as drug_name, d.drug_id, d.unit_price
             FROM prescription_items pi
             JOIN drugs d ON pi.drug_id = d.id
             WHERE pi.prescription_id = ?`,
      [prescriptionId]
    );
    return rows;
  }

  static async addItem(prescriptionId, itemData) {
    const {
      drug_id,
      quantity,
      dosage,
      frequency,
      duration,
      instructions,
      unit_price,
    } = itemData;

    const total_price = quantity * unit_price;

    const [result] = await pool.execute(
      `INSERT INTO prescription_items (
                prescription_id, drug_id, quantity, dosage, frequency, duration,
                instructions, unit_price, total_price
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prescriptionId,
        drug_id,
        quantity,
        dosage,
        frequency,
        duration,
        instructions,
        unit_price,
        total_price,
      ]
    );

    return result.insertId;
  }

  static async updateStatus(id, status) {
    await pool.execute("UPDATE prescriptions SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    return this.getById(id);
  }
}

module.exports = Prescription;
