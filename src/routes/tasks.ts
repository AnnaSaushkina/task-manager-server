import { Router } from "express";
import db from "../db";

const router = Router();

// Получить все задачи
router.get("/", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();
  res.json(tasks);
});

// Создать задачу
router.post("/", (req, res) => {
  const { id, title } = req.body;
  db.prepare("INSERT INTO tasks (id, title) VALUES (?, ?)").run(id, title);
  res.json({ id, title, completed: false });
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
  res.json(task);
});

export default router;
