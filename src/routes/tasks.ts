import { Router } from "express";
import db from "../db";

const router = Router();

// Нормализуем задачу — snake_case → camelCase
const normalize = (task: any) => ({
  ...task,
  completed: task.completed === 1,
  ticketNumber: task.ticket_number ?? undefined,
  ticket_number: undefined,
  status: task.status ?? undefined,
  screenshots: task.screenshots ? JSON.parse(task.screenshots) : [],
  history: task.history ? JSON.parse(task.history) : [],
  completedAt: task.completed_at ?? undefined,
  completed_at: undefined,
});

// Получить все задачи
router.get("/", (_req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();
  res.json(tasks.map(normalize));
});

// Создать задачу
router.post("/", (req, res) => {
  const {
    id,
    title,
    description,
    ticketNumber,
    deadline,
    priority,
    assignee,
    screenshots,
    status,
    history,
    completedAt,
  } = req.body;

  db.prepare(
    `INSERT INTO tasks (id, title, description, ticket_number, deadline, priority, assignee, screenshots, status, history, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    title,
    description ?? null,
    ticketNumber ?? null,
    deadline ?? null,
    priority ?? null,
    assignee ?? null,
    screenshots ? JSON.stringify(screenshots) : null,
    status ?? null,
    history ? JSON.stringify(history) : null,
    completedAt ?? null,
  );

  res.json({
    id,
    title,
    completed: false,
    description,
    ticketNumber,
    deadline,
    priority,
    assignee,
    screenshots,
    status,
    history: history ?? [],
    completedAt,
  });
});

// Удалить задачу
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// Переключить выполнение
router.patch("/:id/toggle", (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id) as any;
  if (!task) return res.status(404).json({ error: "Not found" });

  const completing = task.completed === 0;
  const completedAt = completing ? new Date().toISOString() : null;

  db.prepare(
    "UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?",
  ).run(completing ? 1 : 0, completedAt, req.params.id);

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  res.json(normalize(updated));
});

// Обновить задачу
router.put("/:id", (req, res) => {
  const {
    title,
    description,
    ticketNumber,
    deadline,
    priority,
    assignee,
    screenshots,
    status,
    history,
    completedAt,
    completed,
  } = req.body;

  db.prepare(
    `UPDATE tasks SET
      title = ?,
      description = ?,
      ticket_number = ?,
      deadline = ?,
      priority = ?,
      assignee = ?,
      screenshots = ?,
      status = ?,
      history = ?,
      completed_at = ?,
      completed = ?
    WHERE id = ?`,
  ).run(
    title,
    description ?? null,
    ticketNumber ?? null,
    deadline ?? null,
    priority ?? null,
    assignee ?? null,
    screenshots ? JSON.stringify(screenshots) : null,
    status ?? null,
    history ? JSON.stringify(history) : null,
    completedAt ?? null,
    completed ? 1 : 0,
    req.params.id,
  );

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  res.json(normalize(task));
});

export default router;
