import Database from "better-sqlite3";

const dbPath = process.env.DB_PATH || "./tasks.db";
const sqlite = new Database(dbPath);

// Конвертируем PostgreSQL-плейсхолдеры $1,$2 → SQLite ?
function toSqlite(sql: string): string {
  return sql.replace(/\$\d+/g, "?");
}

const db = {
  query: (sql: string, params?: unknown[]) => {
    const stmt = sqlite.prepare(toSqlite(sql));
    const upper = sql.trim().toUpperCase();
    if (upper.startsWith("SELECT")) {
      const rows = stmt.all(params ?? []) as Record<string, unknown>[];
      return Promise.resolve({ rows });
    }
    stmt.run(params ?? []);
    return Promise.resolve({ rows: [] as Record<string, unknown>[] });
  },
};

export async function initDb() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      ticket_number TEXT,
      deadline TEXT,
      priority TEXT,
      assignee TEXT,
      screenshots TEXT NOT NULL DEFAULT '[]',
      status TEXT,
      history TEXT NOT NULL DEFAULT '[]',
      completed_at TEXT
    )
  `);
}

export default db;
