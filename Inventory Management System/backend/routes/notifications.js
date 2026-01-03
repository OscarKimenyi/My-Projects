const express = require("express");
const router = express.Router();
const notificationService = require("../services/notificationService");
const { authenticateToken } = require("../middleware/auth");

// Check low stock and send notifications
router.post("/check-low-stock", authenticateToken, async (req, res) => {
  try {
    const notifications = await notificationService.checkLowStock();
    res.json({
      message: "Low stock check completed",
      notificationsSent: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send monthly report via email
router.post("/send-monthly-report", authenticateToken, async (req, res) => {
  try {
    const { email, month, year } = req.body;

    // Generate report data (you can reuse your existing report logic)
    const pool = require("../config/database");
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const [sales] = await pool.execute(
      `
            SELECT s.*, p.name as product_name, p.cost as product_cost 
            FROM sales s 
            JOIN products p ON s.product_id = p.id 
            WHERE MONTH(s.sale_date) = ? AND YEAR(s.sale_date) = ?
        `,
      [targetMonth, targetYear]
    );

    const totalSales = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.total_price),
      0
    );
    const totalCost = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.product_cost) * sale.quantity,
      0
    );
    const totalProfit = totalSales - totalCost;

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

    const reportData = {
      period: `${targetMonth}/${targetYear}`,
      summary: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        profitMargin:
          totalSales > 0
            ? parseFloat(((totalProfit / totalSales) * 100).toFixed(2))
            : 0,
      },
      topProducts,
      lowStockCount: 0, // You can add this
    };

    const result = await emailService.sendMonthlyReport(email, reportData);

    res.json({
      message: "Monthly report sent successfully",
      emailResult: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
