import { Router } from "express";
import { randomUUID } from "crypto";
import type { Server } from "socket.io";
import { readTasks, writeTasks } from "../db";

export function createTasksRouter(io: Server) {
  const router = Router();
  const broadcast = () => io.emit("tasks:update");

  router.get("/", (_req, res) => {
    res.json(readTasks());
  });

  router.post("/", (req, res) => {
    const task = { ...req.body, id: req.body.id || randomUUID() };
    const tasks = readTasks();
    tasks.push(task);
    writeTasks(tasks);
    broadcast();
    res.json(task);
  });

  router.put("/:id", (req, res) => {
    const tasks = readTasks().map((t) =>
      t.id === req.params.id ? { ...t, ...req.body, id: t.id } : t
    );
    writeTasks(tasks);
    broadcast();
    res.json(tasks.find((t) => t.id === req.params.id));
  });

  router.patch("/:id/toggle", (req, res) => {
    const tasks = readTasks();
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: "Not found" });
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : undefined;
    writeTasks(tasks);
    broadcast();
    res.json(task);
  });

  router.delete("/:id", (req, res) => {
    writeTasks(readTasks().filter((t) => t.id !== req.params.id));
    broadcast();
    res.json({ ok: true });
  });

  return router;
}
