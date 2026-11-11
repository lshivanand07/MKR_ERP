import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT || 3306);
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

if (!dbUser) throw new Error("Missing DB_USER");
if (!dbPassword) throw new Error("Missing DB_PASSWORD");
if (!dbName) throw new Error("Missing DB_NAME");

const db: Pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  connectionLimit: 10,
  waitForConnections: true,
});

(async () => {
  try {
    const connection = await db.getConnection();

    console.log(
      `✅ MySQL Database connected successfully to ${dbName} on ${dbHost}:${dbPort}`
    );

    connection.release();
  } catch (error) {
    console.error(
      `❌ MySQL Database connection failed on ${dbHost}:${dbPort}:`,
      error
    );
  }
})();

export { db };