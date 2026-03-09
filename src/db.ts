import Database from "better-sqlite3";

// Создаём или открываем файл базы данных
const db = new Database("tasks.db");

// Создаём таблицу задач если её ещё нет
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  )
`);

export default db;
