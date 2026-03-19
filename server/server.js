import MongoStore from "connect-mongo";
import express from "express";
import session from "express-session";
import passport from "passport";
import "dotenv/config";

import { connectDB } from "./config/db.js";
import configurePassport from "./config/passport.js";
import corsMiddleware from "./middleware/cors.js";
import userRoutes from "./routes/users.js";
import skillRoutes from "./routes/skills.js";
import sessionRoutes from "./routes/sessions.js";

const app = express();

// ── Middleware ────────────────────────────────
app.use(corsMiddleware);
app.use(express.json());

// ── Session + Passport ───────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "app_sessions",
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ───────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/sessions", sessionRoutes);

// ── Health Check ─────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "SkillSwap API is running",
    version: "2.0.0",
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
  configurePassport();
  app.listen(PORT, () => {
    console.log(`SkillSwap server running on port ${PORT}`);
  });
});

export default app;
