const Sale = require("../models/sale");

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.getAll();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const saleId = await Sale.create(req.body);
    res.status(201).json({ id: saleId, message: "Sale created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
