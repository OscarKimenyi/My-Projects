const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// GET /api/reports/monthly - Generate monthly sales report
router.get("/monthly", async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    console.log(`Generating report for ${targetMonth}/${targetYear}`);

    // Get sales data for the month
    const [sales] = await pool.execute(
      `
            SELECT s.*, p.name as product_name, p.cost as product_cost 
            FROM sales s 
            JOIN products p ON s.product_id = p.id 
            WHERE MONTH(s.sale_date) = ? AND YEAR(s.sale_date) = ?
            ORDER BY s.sale_date
        `,
      [targetMonth, targetYear]
    );

    // Get purchases for the month
    const [purchases] = await pool.execute(
      `
            SELECT p.*, pr.name as product_name 
            FROM purchases p 
            JOIN products pr ON p.product_id = pr.id 
            WHERE MONTH(p.purchase_date) = ? AND YEAR(p.purchase_date) = ?
            ORDER BY p.purchase_date
        `,
      [targetMonth, targetYear]
    );

    // Calculate totals
    const totalSales = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.total_price),
      0
    );
    const totalCost = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.product_cost) * sale.quantity,
      0
    );
    const totalProfit = totalSales - totalCost;
    const totalPurchases = purchases.reduce(
      (sum, purchase) => sum + parseFloat(purchase.total_cost),
      0
    );

    // Get top selling products
    const [topProducts] = await pool.execute(
      `
            SELECT p.name, SUM(s.quantity) as total_sold, SUM(s.total_price) as total_revenue
            FROM sales s 
            JOIN products p ON s.product_id = p.id 
            WHERE MONTH(s.sale_date) = ? AND YEAR(s.sale_date) = ?
            GROUP BY p.id, p.name 
            ORDER BY total_sold DESC 
            LIMIT 5
        `,
      [targetMonth, targetYear]
    );

    const report = {
      period: `${targetMonth}/${targetYear}`,
      summary: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        totalPurchases: parseFloat(totalPurchases.toFixed(2)),
        profitMargin:
          totalSales > 0
            ? parseFloat(((totalProfit / totalSales) * 100).toFixed(2))
            : 0,
      },
      sales: sales.map((sale) => ({
        ...sale,
        total_price: parseFloat(sale.total_price),
        unit_price: parseFloat(sale.unit_price),
        profit: parseFloat(
          (sale.unit_price - sale.product_cost) * sale.quantity
        ),
      })),
      purchases: purchases.map((purchase) => ({
        ...purchase,
        total_cost: parseFloat(purchase.total_cost),
        unit_cost: parseFloat(purchase.unit_cost),
      })),
      topProducts,
    };

    console.log("Report generated successfully");
    res.json(report);
  } catch (error) {
    console.error("Error generating monthly report:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/low-stock - Get low stock report
router.get("/low-stock", async (req, res) => {
  try {
    const [products] = await pool.execute(`
            SELECT p.*, s.name as supplier_name 
            FROM products p 
            LEFT JOIN suppliers s ON p.supplier_id = s.id 
            WHERE p.stock_quantity <= p.min_stock_level
            ORDER BY p.stock_quantity ASC
        `);

    res.json(products);
  } catch (error) {
    console.error("Error generating low stock report:", error);
    res.status(500).json({ error: error.message });
  }
});

// Profit and loss report
router.get("/profit-loss", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

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
      categoryPerformance: categorySales,
    });
  } catch (error) {
    console.error("Error generating profit-loss report:", error);
    res.status(500).json({ error: error.message });
  }
});

// Inventory valuation report
router.get("/inventory-valuation", async (req, res) => {
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
      (sum, item) => sum + parseFloat(item.total_value || 0),
      0
    );
    const totalPotentialRevenue = inventory.reduce(
      (sum, item) => sum + parseFloat(item.potential_revenue || 0),
      0
    );
    const totalPotentialProfit = inventory.reduce(
      (sum, item) => sum + parseFloat(item.potential_profit || 0),
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
    console.error("Error generating inventory valuation:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
