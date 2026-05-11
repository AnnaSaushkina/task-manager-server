import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { initDb } from "./db";
import { createTasksRouter } from "./routes/tasks";

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 3000;

export const io = new Server(httpServer, {
  cors: { origin: "*" },
});

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app.use("/tasks", createTasksRouter(io));

app.get("/", (_req, res) => {
  res.send("Сервер работает");
});

async function start() {
  await initDb();
  httpServer.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Ошибка запуска сервера:", err);
  process.exit(1);
});
