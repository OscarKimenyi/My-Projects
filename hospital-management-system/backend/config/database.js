// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const dbConfig = {
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || undefined, // Use undefined for no password
//   database: process.env.DB_NAME || "hospital_db",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// };

// // Remove password entirely if it's empty
// if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD.trim() === "") {
//   delete dbConfig.password;
// }

// console.log("Database configuration:", {
//   host: dbConfig.host,
//   user: dbConfig.user,
//   database: dbConfig.database,
//   hasPassword: !!dbConfig.password,
// });

// const pool = mysql.createPool(dbConfig);

// const connectDB = async () => {
//   try {
//     const connection = await pool.getConnection();
//     console.log("✅ Connected to MySQL database");

//     // Test a simple query
//     const [rows] = await connection.execute("SELECT 1 + 1 AS result");
//     console.log("✅ Database test query successful:", rows);

//     connection.release();
//     return true;
//   } catch (error) {
//     console.error("❌ Database connection failed:", error.message);
//     console.error("❌ Error details:", error);
//     return false;
//   }
// };

// // Test database queries
// const testDatabaseQuery = async () => {
//   try {
//     const [databases] = await pool.execute("SHOW DATABASES");
//     console.log(
//       "📊 Available databases:",
//       databases.map((db) => db.Database)
//     );

//     const [tables] = await pool.execute("SHOW TABLES");
//     console.log(
//       "📋 Tables in hospital_db:",
//       tables.map((table) => Object.values(table)[0])
//     );
//   } catch (error) {
//     console.error("❌ Database query test failed:", error.message);
//   }
// };

// module.exports = { pool, connectDB, testDatabaseQuery };

const mysql = require("mysql2/promise");
require("dotenv").config();

let pool;

const connectDB = async () => {
  try {
    console.log("Database configuration:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      hasPassword: !!process.env.DB_PASSWORD,
    });

    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT, // 🔴 VERY IMPORTANT
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    await pool.query("SELECT 1");

    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

const testDatabaseQuery = async () => {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    console.log("📋 Database tables:", rows);
  } catch (error) {
    console.error("❌ Database test query failed:", error.message);
  }
};

const getPool = () => pool;

module.exports = {
  connectDB,
  testDatabaseQuery,
  getPool,
};
