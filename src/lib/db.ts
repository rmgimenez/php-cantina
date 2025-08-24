import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";

// Ensure a single pool instance across module reloads (HMR) in development
declare global {
  // eslint-disable-next-line no-var
  var __CANTINA_DB_POOL: Pool | undefined;
}

const pool: Pool =
  globalThis.__CANTINA_DB_POOL ??
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "sant31br",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (!globalThis.__CANTINA_DB_POOL) {
  globalThis.__CANTINA_DB_POOL = pool;
}

export default pool;
