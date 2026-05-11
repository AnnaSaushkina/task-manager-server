import fs from "fs";

const dbPath = process.env.DB_PATH || "./tasks.json";

export function readTasks(): any[] {
  try {
    return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  } catch {
    return [];
  }
}

export function writeTasks(tasks: any[]): void {
  fs.writeFileSync(dbPath, JSON.stringify(tasks));
}

export async function initDb(): Promise<void> {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "[]");
  }
}
