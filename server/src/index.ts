import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Taskify API is running" });
});

app.get("/", (_req, res) => {
  res.json({
    message: "Taskify API — use the frontend at http://localhost:5173",
    health: "/api/health",
    auth: "/api/auth/signup, /api/auth/login, /api/auth/me",
  });
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
