const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/guests", require("./routes/guests"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/housekeeping", require("./routes/housekeeping"));
app.use("/api/auth", require("./routes/auth")); // Add this line

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Hotel Management System API" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
