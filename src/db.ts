import Database from "better-sqlite3";

const db = new Database("tasks.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    ticket_number TEXT,
    deadline TEXT,
    priority TEXT,
    assignee TEXT,
    screenshots TEXT
  )
`);

export default db;
