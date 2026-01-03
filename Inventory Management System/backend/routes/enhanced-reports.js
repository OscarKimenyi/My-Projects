const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

// Profit and loss report
router.get("/profit-loss", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [salesData] = await pool.execute(
      `
            SELECT 
                DATE(sale_date) as date,
                SUM(total_price) as daily_sales,
                SUM(quantity) as items_sold,
                COUNT(*) as transactions
            FROM sales 
            WHERE sale_date BETWEEN ? AND ?
            GROUP BY DATE(sale_date)
            ORDER BY date
        `,
      [startDate, endDate]
    );

    const [purchaseData] = await pool.execute(
      `
            SELECT 
                DATE(purchase_date) as date,
                SUM(total_cost) as daily_purchases,
                SUM(quantity) as items_purchased
            FROM purchases 
            WHERE purchase_date BETWEEN ? AND ?
            GROUP BY DATE(purchase_date)
            ORDER BY date
        `,
      [startDate, endDate]
    );

    const [categorySales] = await pool.execute(
      `
            SELECT 
                p.category,
                SUM(s.quantity) as quantity_sold,
                SUM(s.total_price) as revenue,
                SUM(s.quantity * p.cost) as cost,
                SUM(s.total_price - (s.quantity * p.cost)) as profit
            FROM sales s
            JOIN products p ON s.product_id = p.id
            WHERE s.sale_date BETWEEN ? AND ?
            GROUP BY p.category
            ORDER BY revenue DESC
        `,
      [startDate, endDate]
    );

    res.json({
      period: { startDate, endDate },
      dailySales: salesData,
      dailyPurchases: purchaseData,
      categoryPerformance: categorySales,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inventory valuation report
router.get("/inventory-valuation", authenticateToken, async (req, res) => {
  try {
    const [inventory] = await pool.execute(`
            SELECT 
                p.*,
                s.name as supplier_name,
                (p.stock_quantity * p.cost) as total_value,
                (p.stock_quantity * p.price) as potential_revenue,
                ((p.stock_quantity * p.price) - (p.stock_quantity * p.cost)) as potential_profit
            FROM products p
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            ORDER BY total_value DESC
        `);

    const totalValuation = inventory.reduce(
      (sum, item) => sum + parseFloat(item.total_value),
      0
    );
    const totalPotentialRevenue = inventory.reduce(
      (sum, item) => sum + parseFloat(item.potential_revenue),
      0
    );
    const totalPotentialProfit = inventory.reduce(
      (sum, item) => sum + parseFloat(item.potential_profit),
      0
    );

    res.json({
      summary: {
        totalValuation: parseFloat(totalValuation.toFixed(2)),
        totalPotentialRevenue: parseFloat(totalPotentialRevenue.toFixed(2)),
        totalPotentialProfit: parseFloat(totalPotentialProfit.toFixed(2)),
        totalItems: inventory.length,
      },
      inventory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supplier performance report
router.get("/supplier-performance", authenticateToken, async (req, res) => {
  try {
    const [suppliers] = await pool.execute(`
            SELECT 
                s.*,
                COUNT(p.id) as products_supplied,
                SUM(pr.quantity) as total_purchased_quantity,
                SUM(pr.total_cost) as total_purchase_value,
                AVG(pr.unit_cost) as avg_unit_cost
            FROM suppliers s
            LEFT JOIN products p ON s.id = p.supplier_id
            LEFT JOIN purchases pr ON s.id = pr.supplier_id
            GROUP BY s.id
            ORDER BY total_purchase_value DESC
        `);

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales trends report
router.get("/sales-trends", authenticateToken, async (req, res) => {
  try {
    const { period = "monthly" } = req.query;

    let groupBy, dateFormat;
    switch (period) {
      case "daily":
        groupBy = "DATE(sale_date)";
        dateFormat = "%Y-%m-%d";
        break;
      case "weekly":
        groupBy = "YEARWEEK(sale_date)";
        dateFormat = "%Y-%u";
        break;
      case "monthly":
      default:
        groupBy = "YEAR(sale_date), MONTH(sale_date)";
        dateFormat = "%Y-%m";
        break;
    }

    const [trends] = await pool.execute(`
            SELECT 
                ${groupBy} as period,
                DATE_FORMAT(MIN(sale_date), '${dateFormat}') as period_label,
                SUM(total_price) as revenue,
                SUM(quantity) as units_sold,
                COUNT(*) as transactions,
                AVG(total_price) as avg_transaction_value
            FROM sales 
            GROUP BY ${groupBy}
            ORDER BY period DESC
            LIMIT 12
        `);

    res.json({
      period,
      trends,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
