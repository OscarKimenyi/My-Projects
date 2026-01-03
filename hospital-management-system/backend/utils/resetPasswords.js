const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

async function resetPasswords() {
  try {
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Generated hash:", hashedPassword);

    const users = [
      "superadmin",
      "admin",
      "dr_smith",
      "nurse_mary",
      "reception1",
    ];

    for (const username of users) {
      const [result] = await pool.execute(
        "UPDATE users SET password = ? WHERE username = ?",
        [hashedPassword, username]
      );
      console.log(
        `Updated ${username}:`,
        result.affectedRows ? "Success" : "Failed"
      );
    }

    console.log("Password reset completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting passwords:", error);
    process.exit(1);
  }
}

resetPasswords();
