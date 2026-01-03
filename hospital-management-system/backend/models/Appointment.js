const { pool } = require("../config/database");

class Appointment {
  static async getAll() {
    const [rows] = await pool.execute(`
            SELECT 
                a.*, 
                p.first_name, 
                p.last_name, 
                p.patient_id, 
                p.phone, 
                p.email,
                DATE(a.appointment_date) as appointment_date_formatted
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `);

    // Use the formatted date (without time)
    return rows.map((row) => ({
      ...row,
      appointment_date: row.appointment_date_formatted,
    }));
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, p.first_name, p.last_name, p.patient_id, p.phone, p.email 
             FROM appointments a 
             JOIN patients p ON a.patient_id = p.id 
             WHERE a.id = ?`,
      [id]
    );

    if (rows[0]) {
      // Format the date to remove time part
      return {
        ...rows[0],
        appointment_date: new Date(rows[0].appointment_date)
          .toISOString()
          .split("T")[0],
      };
    }
    return null;
  }

  static async create(appointmentData) {
    const {
      appointment_id,
      patient_id,
      doctor_name,
      appointment_date,
      appointment_time,
      appointment_type,
      status,
      reason,
      notes,
    } = appointmentData;

    const [result] = await pool.execute(
      `INSERT INTO appointments (
                appointment_id, patient_id, doctor_name, appointment_date,
                appointment_time, appointment_type, status, reason, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointment_id,
        patient_id,
        doctor_name,
        appointment_date,
        appointment_time,
        appointment_type,
        status,
        reason,
        notes,
      ]
    );

    return this.getById(result.insertId);
  }

  static async update(id, appointmentData) {
    const fields = [];
    const values = [];

    Object.keys(appointmentData).forEach((key) => {
      if (appointmentData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(appointmentData[key]);
      }
    });

    values.push(id);

    await pool.execute(
      `UPDATE appointments SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.getById(id);
  }

  static async delete(id) {
    await pool.execute("DELETE FROM appointments WHERE id = ?", [id]);
    return true;
  }

  static async getByDate(date) {
    const [rows] = await pool.execute(
      `SELECT a.*, p.first_name, p.last_name, p.patient_id 
             FROM appointments a 
             JOIN patients p ON a.patient_id = p.id 
             WHERE a.appointment_date = ? 
             ORDER BY a.appointment_time`,
      [date]
    );

    return rows.map((row) => ({
      ...row,
      appointment_date: new Date(row.appointment_date)
        .toISOString()
        .split("T")[0],
    }));
  }
}

module.exports = Appointment;
