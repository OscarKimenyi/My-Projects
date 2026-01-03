const Drug = require("../models/Drug");
const { generateDrugId } = require("../utils/generators");

const drugController = {
  getAllDrugs: async (req, res) => {
    try {
      const drugs = await Drug.getAll();
      res.json({ success: true, data: drugs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getDrugById: async (req, res) => {
    try {
      const drug = await Drug.getById(req.params.id);
      if (!drug) {
        return res
          .status(404)
          .json({ success: false, message: "Drug not found" });
      }
      res.json({ success: true, data: drug });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createDrug: async (req, res) => {
    try {
      const drugData = {
        ...req.body,
        drug_id: generateDrugId(),
      };
      const drug = await Drug.create(drugData);
      res.status(201).json({ success: true, data: drug });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateDrug: async (req, res) => {
    try {
      const drug = await Drug.update(req.params.id, req.body);
      res.json({ success: true, data: drug });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteDrug: async (req, res) => {
    try {
      await Drug.delete(req.params.id);
      res.json({ success: true, message: "Drug deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  searchDrugs: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res
          .status(400)
          .json({ success: false, message: "Search query is required" });
      }
      const drugs = await Drug.search(q);
      res.json({ success: true, data: drugs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getLowStock: async (req, res) => {
    try {
      const drugs = await Drug.getLowStock();
      res.json({ success: true, data: drugs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { quantity } = req.body;
      const drug = await Drug.updateStock(req.params.id, quantity);
      res.json({ success: true, data: drug });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = drugController;
