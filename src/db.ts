import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../tasks.db"));

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
    screenshots TEXT,
    status TEXT
  )
`);

// Миграция: добавить колонку status если её нет (для существующих БД)
const columns = db.pragma("table_info(tasks)") as { name: string }[];
if (!columns.some((c) => c.name === "status")) {
  db.exec("ALTER TABLE tasks ADD COLUMN status TEXT");
}

export default db;
