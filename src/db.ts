import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/taskdb",
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      description TEXT,
      ticket_number TEXT,
      deadline TEXT,
      priority TEXT,
      assignee TEXT,
      screenshots JSONB NOT NULL DEFAULT '[]',
      status TEXT,
      history JSONB NOT NULL DEFAULT '[]',
      completed_at TEXT
    )
  `);
}

export default pool;
