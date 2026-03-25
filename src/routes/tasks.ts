import { Router } from "express";
import db from "../db";

const router = Router();

// Нормализуем задачу — ticket_number → ticketNumber
const normalize = (task: any) => ({
  ...task,
  completed: task.completed === 1,
  ticketNumber: task.ticket_number ?? undefined,
  ticket_number: undefined,
  status: task.status ?? undefined,
  screenshots: task.screenshots ? JSON.parse(task.screenshots) : [],
});

// Получить все задачи
router.get("/", (req, res) => {
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
  } = req.body;

  db.prepare(
    `
    INSERT INTO tasks (id, title, description, ticket_number, deadline, priority, assignee, screenshots, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
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
  });
});

// Удалить задачу
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// Переключить статус
router.patch("/:id/toggle", (req, res) => {
  db.prepare("UPDATE tasks SET completed = NOT completed WHERE id = ?").run(
    req.params.id,
  );
  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id);
  res.json(normalize(task));
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
  } = req.body;

  db.prepare(
    `
    UPDATE tasks SET
      title = ?,
      description = ?,
      ticket_number = ?,
      deadline = ?,
      priority = ?,
      assignee = ?,
      screenshots = ?,
      status = ?
    WHERE id = ?
  `,
  ).run(
    title,
    description ?? null,
    ticketNumber ?? null,
    deadline ?? null,
    priority ?? null,
    assignee ?? null,
    screenshots ? JSON.stringify(screenshots) : null,
    status ?? null,
    req.params.id,
  );

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id);
  res.json(normalize(task));
});

export default router;
