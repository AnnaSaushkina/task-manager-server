import { Router } from "express";
import { randomUUID } from "crypto";
import type { Server } from "socket.io";
import db from "../db";

const normalize = (task: any) => ({
  ...task,
  completed: task.completed,
  ticketNumber: task.ticket_number ?? undefined,
  ticket_number: undefined,
  status: task.status ?? undefined,
  screenshots: task.screenshots ?? [],
  history: task.history ?? [],
  completedAt: task.completed_at ?? undefined,
  completed_at: undefined,
});

export function createTasksRouter(io: Server) {
  const router = Router();

  const broadcast = () => io.emit("tasks:update");

  router.get("/", async (_req, res) => {
    const { rows } = await db.query("SELECT * FROM tasks ORDER BY id");
    res.json(rows.map(normalize));
  });

  router.post("/", async (req, res) => {
    const {
      id: rawId, title, description, ticketNumber, deadline,
      priority, assignee, screenshots, status, history, completedAt,
    } = req.body;
    const id = rawId || randomUUID();

    await db.query(
      `INSERT INTO tasks (id, title, description, ticket_number, deadline, priority, assignee, screenshots, status, history, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id, title, description ?? null, ticketNumber ?? null, deadline ?? null,
        priority ?? null, assignee ?? null,
        JSON.stringify(screenshots ?? []),
        status ?? null,
        JSON.stringify(history ?? []),
        completedAt ?? null,
      ],
    );

    broadcast();
    res.json({
      id, title, completed: false, description, ticketNumber,
      deadline, priority, assignee,
      screenshots: screenshots ?? [], status, history: history ?? [], completedAt,
    });
  });

  router.delete("/:id", async (req, res) => {
    await db.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    broadcast();
    res.json({ ok: true });
  });

  router.patch("/:id/toggle", async (req, res) => {
    const { rows } = await db.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
    const task = rows[0];
    if (!task) return res.status(404).json({ error: "Not found" });

    const completing = !task.completed;
    const completedAt = completing ? new Date().toISOString() : null;

    await db.query(
      "UPDATE tasks SET completed = $1, completed_at = $2 WHERE id = $3",
      [completing, completedAt, req.params.id],
    );

    broadcast();
    const { rows: updated } = await db.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
    res.json(normalize(updated[0]));
  });

  router.put("/:id", async (req, res) => {
    const {
      title, description, ticketNumber, deadline, priority,
      assignee, screenshots, status, history, completedAt, completed,
    } = req.body;

    await db.query(
      `UPDATE tasks SET
        title = $1, description = $2, ticket_number = $3, deadline = $4, priority = $5,
        assignee = $6, screenshots = $7, status = $8, history = $9, completed_at = $10, completed = $11
       WHERE id = $12`,
      [
        title, description ?? null, ticketNumber ?? null, deadline ?? null,
        priority ?? null, assignee ?? null,
        JSON.stringify(screenshots ?? []),
        status ?? null,
        JSON.stringify(history ?? []),
        completedAt ?? null, completed ?? false,
        req.params.id,
      ],
    );

    broadcast();
    const { rows } = await db.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
    res.json(normalize(rows[0]));
  });

  return router;
}
