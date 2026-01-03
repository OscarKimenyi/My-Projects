const Patient = require("../models/Patient");
const { generatePatientId } = require("../utils/generators");

const patientController = {
  getAllPatients: async (req, res) => {
    try {
      const patients = await Patient.getAll();
      res.json({ success: true, data: patients });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getPatientById: async (req, res) => {
    try {
      const patient = await Patient.getById(req.params.id);
      if (!patient) {
        return res
          .status(404)
          .json({ success: false, message: "Patient not found" });
      }
      res.json({ success: true, data: patient });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createPatient: async (req, res) => {
    try {
      console.log("Creating patient with data:", req.body);

      // Validate required fields
      const { first_name, last_name, phone } = req.body;

      if (!first_name || first_name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "First name is required",
        });
      }

      if (!last_name || last_name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Last name is required",
        });
      }

      if (!phone || phone.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Phone number is required",
        });
      }

      // Clean the data - trim strings and handle empty values
      const cleanedData = {};
      Object.keys(req.body).forEach((key) => {
        if (typeof req.body[key] === "string") {
          cleanedData[key] = req.body[key].trim();
        } else {
          cleanedData[key] = req.body[key];
        }
      });

      const patientData = {
        ...cleanedData,
        patient_id: generatePatientId(),
      };

      console.log("Cleaned patient data:", patientData);

      const patient = await Patient.create(patientData);

      console.log("Patient created successfully:", patient);
      res.status(201).json({ success: true, data: patient });
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create patient",
      });
    }
  },

  updatePatient: async (req, res) => {
    try {
      const patient = await Patient.update(req.params.id, req.body);
      res.json({ success: true, data: patient });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deletePatient: async (req, res) => {
    try {
      await Patient.delete(req.params.id);
      res.json({ success: true, message: "Patient deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  searchPatients: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res
          .status(400)
          .json({ success: false, message: "Search query is required" });
      }
      const patients = await Patient.search(q);
      res.json({ success: true, data: patients });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = patientController;
