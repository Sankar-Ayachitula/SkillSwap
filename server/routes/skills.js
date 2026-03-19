import { Router } from "express";
import {
  validateSkill,
  createSkill,
  findAll,
  findById,
  findByUserId,
  updateSkill,
  deleteSkill,
  getStats,
} from "../models/Skill.js";
import isAuthenticated from "../middleware/auth.js";

const router = Router();

// POST /api/skills — Create a new skill listing

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const errors = validateSkill(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const skill = await createSkill(req.body, req.user._id);
    res.status(201).json(skill);
  } catch (error) {
    if (error.message.includes("already posted")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/skills — Get all skills (with search & filter)

router.get("/", async (req, res) => {
  try {
    const { category, format, experienceLevel, search } = req.query;
    const skills = await findAll({ category, format, experienceLevel, search });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/skills/stats — Skill statistics

router.get("/stats", async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/skills/my — Get logged-in user's skills

router.get("/my", isAuthenticated, async (req, res) => {
  try {
    const skills = await findByUserId(req.user._id);
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/skills/:id — Get a single skill

router.get("/:id", async (req, res) => {
  try {
    const skill = await findById(req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    res.json(skill);
  } catch (error) {
    res.status(400).json({ error: "Invalid skill ID" });
  }
});

// PUT /api/skills/:id — Update a skill (owner only)

router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const skill = await findById(req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    if (skill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this skill" });
    }

    const errors = validateSkill(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const updates = {};
    const allowed = [
      "title",
      "description",
      "category",
      "experienceLevel",
      "availability",
      "format",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await updateSkill(req.params.id, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/skills/:id — Delete a skill (owner only)

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const skill = await findById(req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    if (skill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this skill" });
    }

    await deleteSkill(req.params.id);
    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
