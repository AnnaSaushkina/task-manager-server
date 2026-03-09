import express from "express";
import cors from "cors";
import tasksRouter from "./routes/tasks";

const app = express();
const PORT = 3000;

// Явно разрешаем все источники и заголовки
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "bypass-tunnel-reminder"],
  }),
);

// Отвечаем на preflight запросы
app.options("*", cors());

app.use(express.json());
app.use("/tasks", tasksRouter);

app.get("/", (req, res) => {
  res.send("Сервер работает");
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
