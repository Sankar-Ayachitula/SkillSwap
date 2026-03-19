const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/users");
const skillRoutes = require("./routes/skills");
const sessionRoutes = require("./routes/sessions");

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/sessions", sessionRoutes);

// ── Health Check ─────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "SkillSwap API is running",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      skills: "/api/skills",
      sessions: "/api/sessions",
    },
  });
});

// ── 404 Handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start Server ─────────────────────────────
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SkillSwap server running on port ${PORT}`);
  });
});
