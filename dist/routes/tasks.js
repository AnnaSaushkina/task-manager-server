"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// Нормализуем задачу — ticket_number → ticketNumber
const normalize = (task) => ({
    ...task,
    completed: task.completed === 1,
    ticketNumber: task.ticket_number ?? undefined,
    ticket_number: undefined,
    screenshots: task.screenshots ? JSON.parse(task.screenshots) : [],
});
// Получить все задачи
router.get("/", (req, res) => {
    const tasks = db_1.default.prepare("SELECT * FROM tasks").all();
    res.json(tasks.map(normalize));
});
// Создать задачу
router.post("/", (req, res) => {
    const { id, title, description, ticketNumber, deadline, priority, assignee, screenshots, } = req.body;
    db_1.default.prepare(`
    INSERT INTO tasks (id, title, description, ticket_number, deadline, priority, assignee, screenshots)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, description ?? null, ticketNumber ?? null, deadline ?? null, priority ?? null, assignee ?? null, screenshots ? JSON.stringify(screenshots) : null);
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
    });
});
// Удалить задачу
router.delete("/:id", (req, res) => {
    db_1.default.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
});
// Переключить статус
router.patch("/:id/toggle", (req, res) => {
    db_1.default.prepare("UPDATE tasks SET completed = NOT completed WHERE id = ?").run(req.params.id);
    const task = db_1.default
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(req.params.id);
    res.json(normalize(task));
});
// Обновить задачу
router.put("/:id", (req, res) => {
    const { title, description, ticketNumber, deadline, priority, assignee, screenshots, } = req.body;
    db_1.default.prepare(`
    UPDATE tasks SET
      title = ?,
      description = ?,
      ticket_number = ?,
      deadline = ?,
      priority = ?,
      assignee = ?,
      screenshots = ?
    WHERE id = ?
  `).run(title, description ?? null, ticketNumber ?? null, deadline ?? null, priority ?? null, assignee ?? null, screenshots ? JSON.stringify(screenshots) : null, req.params.id);
    const task = db_1.default
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(req.params.id);
    res.json(normalize(task));
});
exports.default = router;
