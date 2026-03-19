import { Router } from "express";
import passport from "passport";
import {
  validateUser,
  createUser,
  findById,
  findAll,
  updateUser,
  deleteUser,
} from "../models/User.js";
import isAuthenticated from "../middleware/auth.js";

const router = Router();

// ──────────────────────────────────────────────
// POST /api/users/register — Create a new user
// ──────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const errors = validateUser(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const user = await createUser(req.body);

    // Auto-login after registration
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Login after registration failed" });
      return res.status(201).json(user);
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// POST /api/users/login — Authenticate with Passport
// ──────────────────────────────────────────────
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });

    req.login(user, (loginErr) => {
      if (loginErr) return res.status(500).json({ error: "Login failed" });

      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    });
  })(req, res, next);
});

// ──────────────────────────────────────────────
// POST /api/users/logout — End session
// ──────────────────────────────────────────────
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.json({ message: "Logged out successfully" });
  });
});

// ──────────────────────────────────────────────
// GET /api/users/me — Get logged-in user profile
// ──────────────────────────────────────────────
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// GET /api/users — Get all users (public profiles)
// ──────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const users = await findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// GET /api/users/:id — Get a single user profile
// ──────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const user = await findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "Invalid user ID" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/users/me — Update logged-in user profile
// ──────────────────────────────────────────────
router.put("/me", isAuthenticated, async (req, res) => {
  try {
    const errors = validateUser(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.bio !== undefined) updates.bio = req.body.bio;

    const user = await updateUser(req.user._id, updates);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/users/me — Delete logged-in user account
// ──────────────────────────────────────────────
router.delete("/me", isAuthenticated, async (req, res) => {
  try {
    await deleteUser(req.user._id);
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Error during logout" });
      res.json({ message: "Account deleted successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
