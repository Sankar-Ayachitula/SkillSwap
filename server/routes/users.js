const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Helper: generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ──────────────────────────────────────────────
// POST /api/users/register — Create a new user
// ──────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password, bio });
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      hoursTeaught: user.hoursTeaught,
      hoursReceived: user.hoursReceived,
      overallRating: user.overallRating,
      token,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// POST /api/users/login — Authenticate user
// ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      hoursTeaught: user.hoursTeaught,
      hoursReceived: user.hoursReceived,
      overallRating: user.overallRating,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// GET /api/users/me — Get logged-in user profile
// ──────────────────────────────────────────────
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
    const users = await User.find().select("-__v");
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
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/users/me — Update logged-in user profile
// ──────────────────────────────────────────────
router.put("/me", auth, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(user);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/users/me — Delete logged-in user account
// ──────────────────────────────────────────────
router.delete("/me", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
