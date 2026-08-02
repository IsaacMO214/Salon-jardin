import "dotenv/config";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

async function run() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error("ERROR: Define ADMIN_USERNAME y ADMIN_PASSWORD en tu archivo .env y vuelve a intentar.");
    process.exit(1);
  }

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "jardin_fantasy",
    charset: "utf8mb4",
  });

  const hash = await bcrypt.hash(password, 12);
  await pool.execute(
    "INSERT INTO usuarios (id, username, passwordHash) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE passwordHash = VALUES(passwordHash)",
    [`user-${username}`, username, hash]
  );
  console.log(`Usuario "${username}" creado o actualizado correctamente.`);
  await pool.end();
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
