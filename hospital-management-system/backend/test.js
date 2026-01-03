const { connectDB } = require("./config/database");

async function testConnection() {
  console.log("Testing database connection...");
  const connected = await connectDB();
  if (connected) {
    console.log("✅ Database connection successful!");
    process.exit(0);
  } else {
    console.log("❌ Database connection failed!");
    process.exit(1);
  }
}

testConnection();
