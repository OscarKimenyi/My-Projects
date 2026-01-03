const Purchase = require("../models/purchase");

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.getAll();
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const purchaseId = await Purchase.create(req.body);
    res
      .status(201)
      .json({ id: purchaseId, message: "Purchase created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
