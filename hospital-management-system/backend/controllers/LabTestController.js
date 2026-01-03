const LabTest = require("../models/LabTest");
const { generateLabTestId } = require("../utils/generators");

const labTestController = {
  getAllLabTests: async (req, res) => {
    try {
      const tests = await LabTest.getAll();
      res.json({ success: true, data: tests });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getLabTestById: async (req, res) => {
    try {
      const test = await LabTest.getById(req.params.id);
      if (!test) {
        return res
          .status(404)
          .json({ success: false, message: "Lab test not found" });
      }
      res.json({ success: true, data: test });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createLabTest: async (req, res) => {
    try {
      const testData = {
        ...req.body,
        test_id: generateLabTestId(),
      };
      const test = await LabTest.create(testData);
      res.status(201).json({ success: true, data: test });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateLabTest: async (req, res) => {
    try {
      const test = await LabTest.update(req.params.id, req.body);
      res.json({ success: true, data: test });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteLabTest: async (req, res) => {
    try {
      await LabTest.delete(req.params.id);
      res.json({ success: true, message: "Lab test deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  searchLabTests: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res
          .status(400)
          .json({ success: false, message: "Search query is required" });
      }
      const tests = await LabTest.search(q);
      res.json({ success: true, data: tests });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = labTestController;
