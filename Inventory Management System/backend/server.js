const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const notificationRoutes = require("./routes/notifications");
const enhancedReportsRoutes = require("./routes/enhanced-reports");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/enhanced-reports", enhancedReportsRoutes);

// Routes
app.use("/api/products", require("./routes/products"));
app.use("/api/suppliers", require("./routes/suppliers"));
app.use("/api/purchases", require("./routes/purchases"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/reports", require("./routes/reports"));

// Dashboard stats endpoint
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const pool = require("./config/database");

    const [totalProducts] = await pool.execute(
      "SELECT COUNT(*) as count FROM products"
    );
    const [totalSales] = await pool.execute(
      "SELECT SUM(total_price) as total FROM sales WHERE MONTH(sale_date) = MONTH(CURRENT_DATE())"
    );
    const [lowStockCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM products WHERE stock_quantity <= min_stock_level"
    );
    const [recentSales] = await pool.execute(`
      SELECT s.*, p.name as product_name 
      FROM sales s 
      JOIN products p ON s.product_id = p.id 
      ORDER BY s.sale_date DESC 
      LIMIT 5
    `);

    res.json({
      totalProducts: totalProducts[0].count,
      monthlySales: totalSales[0].total || 0,
      lowStockItems: lowStockCount[0].count,
      recentSales: recentSales,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
