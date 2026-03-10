import express from "express";
import cors from "cors";
import tasksRouter from "./routes/tasks";

const app = express();
const PORT = 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/tasks", tasksRouter);

app.get("/", (req, res) => {
  res.send("Сервер работает");
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
