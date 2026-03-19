import { Router } from "express";
import {
  validateSession,
  createSession,
  findByUser,
  findById,
  updateSession,
  updateStatus,
  completeSession,
  submitFeedback,
  deleteSession,
  getStats,
} from "../models/Session.js";
import isAuthenticated from "../middleware/auth.js";

const router = Router();

// ──────────────────────────────────────────────
// POST /api/sessions — Propose a new swap session
// ──────────────────────────────────────────────
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const errors = validateSession(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const session = await createSession(req.body, req.user._id.toString());
    res.status(201).json(session);
  } catch (error) {
    if (error.message.includes("yourself")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// GET /api/sessions — Get your sessions
// ──────────────────────────────────────────────
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const { status, role } = req.query;
    const sessions = await findByUser(req.user._id, { status, role });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// GET /api/sessions/stats — Session statistics
// ──────────────────────────────────────────────
router.get("/stats", isAuthenticated, async (req, res) => {
  try {
    const stats = await getStats(req.user._id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// GET /api/sessions/:id — Get session details
// ──────────────────────────────────────────────
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const session = await findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const userId = req.user._id.toString();
    const isParticipant =
      session.requesterId.toString() === userId ||
      session.responderId.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ error: "Not authorized to view this session" });
    }

    res.json(session);
  } catch (error) {
    res.status(400).json({ error: "Invalid session ID" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/sessions/:id — Update session (pending only)
// ──────────────────────────────────────────────
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const session = await findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (session.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the requester can update session details" });
    }
    if (session.status !== "Pending") {
      return res.status(400).json({ error: "Can only edit pending sessions" });
    }

    const errors = validateSession(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const updates = {};
    if (req.body.skillOfferedId !== undefined)
      updates.skillOfferedId = req.body.skillOfferedId;
    if (req.body.scheduledDate !== undefined)
      updates.scheduledDate = new Date(req.body.scheduledDate);
    if (req.body.duration !== undefined) updates.duration = req.body.duration;
    if (req.body.format !== undefined) updates.format = req.body.format;

    const updated = await updateSession(req.params.id, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/sessions/:id/status — Accept / Decline / Cancel
// ──────────────────────────────────────────────
router.put("/:id/status", isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await updateStatus(
      req.params.id,
      status,
      req.user._id.toString(),
    );
    res.json(updated);
  } catch (error) {
    if (
      error.message.includes("Cannot change") ||
      error.message.includes("Not authorized") ||
      error.message.includes("not found")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/sessions/:id/complete — Mark as completed
// ──────────────────────────────────────────────
router.put("/:id/complete", isAuthenticated, async (req, res) => {
  try {
    const updated = await completeSession(
      req.params.id,
      req.user._id.toString(),
    );
    res.json(updated);
  } catch (error) {
    if (
      error.message.includes("Not authorized") ||
      error.message.includes("Only accepted") ||
      error.message.includes("not found")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/sessions/:id/feedback — Submit feedback
// ──────────────────────────────────────────────
router.put("/:id/feedback", isAuthenticated, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const updated = await submitFeedback(
      req.params.id,
      req.user._id.toString(),
      rating,
      comment,
    );
    res.json(updated);
  } catch (error) {
    if (
      error.message.includes("already submitted") ||
      error.message.includes("Rating must") ||
      error.message.includes("Not authorized") ||
      error.message.includes("only leave") ||
      error.message.includes("not found")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/sessions/:id — Delete a session
// ──────────────────────────────────────────────
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const session = await findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (session.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the requester can delete a session" });
    }

    if (!["Pending", "Declined", "Cancelled"].includes(session.status)) {
      return res.status(400).json({ error: "Cannot delete an active or completed session" });
    }

    await deleteSession(req.params.id);
    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
