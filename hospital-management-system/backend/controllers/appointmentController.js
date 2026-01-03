const Appointment = require("../models/Appointment");
const { generateAppointmentId } = require("../utils/generators");

const appointmentController = {
  getAllAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.getAll();
      res.json({ success: true, data: appointments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAppointmentById: async (req, res) => {
    try {
      const appointment = await Appointment.getById(req.params.id);
      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }
      res.json({ success: true, data: appointment });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createAppointment: async (req, res) => {
    try {
      const appointmentData = {
        ...req.body,
        appointment_id: generateAppointmentId(),
      };
      const appointment = await Appointment.create(appointmentData);
      res.status(201).json({ success: true, data: appointment });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateAppointment: async (req, res) => {
    try {
      const appointment = await Appointment.update(req.params.id, req.body);
      res.json({ success: true, data: appointment });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteAppointment: async (req, res) => {
    try {
      await Appointment.delete(req.params.id);
      res.json({ success: true, message: "Appointment deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAppointmentsByDate: async (req, res) => {
    try {
      const { date } = req.params;
      const appointments = await Appointment.getByDate(date);
      res.json({ success: true, data: appointments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = appointmentController;
