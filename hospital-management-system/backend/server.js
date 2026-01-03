const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectDB, testDatabaseQuery } = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes (without auth for now - we'll add it gradually)
app.use("/api/auth", require("./routes/auth"));

// Existing routes without authentication temporarily
app.use("/api/patients", require("./routes/patients"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/drugs", require("./routes/drugs"));
app.use("/api/lab-tests", require("./routes/labTests"));

// Health check route (public)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Hospital Management System API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Start server
const startServer = async () => {
  try {
    console.log("🚀 Starting Hospital Management System...");

    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error("❌ Database connection failed. Exiting...");
      process.exit(1);
    }

    // Test database queries
    await testDatabaseQuery();

    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `🗄️  Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`
      );
      console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
