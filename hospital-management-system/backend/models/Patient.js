const { pool } = require("../config/database");

class Patient {
  static async getAll() {
    const [rows] = await pool.execute(`
            SELECT * FROM patients ORDER BY created_at DESC
        `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute("SELECT * FROM patients WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  static async create(patientData) {
    const {
      patient_id,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      insurance_id,
    } = patientData;

    // Handle empty strings and convert to NULL for database
    const processedData = {
      patient_id,
      first_name: first_name || "",
      last_name: last_name || "",
      email: email || null,
      phone: phone || "",
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      address: address || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_phone: emergency_contact_phone || null,
      insurance_id: insurance_id || null,
    };

    console.log("Processed patient data:", processedData);

    const [result] = await pool.execute(
      `INSERT INTO patients (
                patient_id, first_name, last_name, email, phone, date_of_birth,
                gender, address, emergency_contact_name, emergency_contact_phone, insurance_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        processedData.patient_id,
        processedData.first_name,
        processedData.last_name,
        processedData.email,
        processedData.phone,
        processedData.date_of_birth,
        processedData.gender,
        processedData.address,
        processedData.emergency_contact_name,
        processedData.emergency_contact_phone,
        processedData.insurance_id,
      ]
    );

    return this.getById(result.insertId);
  }

  static async update(id, patientData) {
    const fields = [];
    const values = [];

    Object.keys(patientData).forEach((key) => {
      if (patientData[key] !== undefined && patientData[key] !== null) {
        fields.push(`${key} = ?`);
        // Convert empty strings to null for database
        values.push(patientData[key] === "" ? null : patientData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);

    await pool.execute(
      `UPDATE patients SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.getById(id);
  }

  static async delete(id) {
    await pool.execute("DELETE FROM patients WHERE id = ?", [id]);
    return true;
  }

  static async search(query) {
    const searchQuery = `%${query}%`;
    const [rows] = await pool.execute(
      `SELECT * FROM patients 
             WHERE first_name LIKE ? OR last_name LIKE ? OR patient_id LIKE ? OR email LIKE ? OR phone LIKE ?
             ORDER BY first_name, last_name`,
      [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]
    );
    return rows;
  }
}

module.exports = Patient;
