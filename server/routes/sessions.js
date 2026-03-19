const express = require("express");
const Session = require("../models/Session");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// ──────────────────────────────────────────────
// POST /api/sessions — Create a new session (propose a swap)
// ──────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
  try {
    const { responder, skillRequested, skillOffered, scheduledDate, duration, format } = req.body;

    if (req.user._id.toString() === responder) {
      return res.status(400).json({ error: "You cannot create a session with yourself" });
    }

    const session = await Session.create({
      requester: req.user._id,
      responder,
      skillRequested,
      skillOffered,
      scheduledDate,
      duration,
      format,
    });

    const populated = await session.populate([
      { path: "requester", select: "name email" },
      { path: "responder", select: "name email" },
      { path: "skillRequested", select: "title category" },
      { path: "skillOffered", select: "title category" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// GET /api/sessions — Get all sessions (for current user)
// Query params: status, role (requester|responder)
// ──────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};

    // Only show sessions the user is part of
    if (role === "requester") {
      filter.requester = req.user._id;
    } else if (role === "responder") {
      filter.responder = req.user._id;
    } else {
      filter.$or = [{ requester: req.user._id }, { responder: req.user._id }];
    }

    if (status) filter.status = status;

    const sessions = await Session.find(filter)
      .populate("requester", "name email")
      .populate("responder", "name email")
      .populate("skillRequested", "title category")
      .populate("skillOffered", "title category")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// GET /api/sessions/stats — Session statistics
// ──────────────────────────────────────────────
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userFilter = {
      $or: [{ requester: userId }, { responder: userId }],
    };

    const totalSessions = await Session.countDocuments(userFilter);
    const completedSessions = await Session.countDocuments({ ...userFilter, status: "Completed" });
    const completionRate = totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(1) : 0;

    // Average rating from feedback received
    const ratingPipeline = await Session.aggregate([
      {
        $match: {
          $or: [{ requester: userId }, { responder: userId }],
          status: "Completed",
        },
      },
      {
        $project: {
          rating: {
            $cond: {
              if: { $eq: ["$requester", userId] },
              then: "$feedback.responderFeedback.rating",
              else: "$feedback.requesterFeedback.rating",
            },
          },
        },
      },
      { $match: { rating: { $ne: null } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      ratingPipeline.length > 0 ? parseFloat(ratingPipeline[0].averageRating.toFixed(2)) : 0;

    // Hours exchanged over time (monthly)
    const hoursByMonth = await Session.aggregate([
      {
        $match: {
          $or: [{ requester: userId }, { responder: userId }],
          status: "Completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$scheduledDate" },
            month: { $month: "$scheduledDate" },
          },
          totalHours: { $sum: "$duration" },
          sessionCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Status breakdown
    const statusBreakdown = await Session.aggregate([
      { $match: { $or: [{ requester: userId }, { responder: userId }] } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalSessions,
      completedSessions,
      completionRate: parseFloat(completionRate),
      averageRating,
      hoursExchangedByMonth: hoursByMonth,
      statusBreakdown,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// GET /api/sessions/:id — Get a single session
// ──────────────────────────────────────────────
router.get("/:id", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("requester", "name email overallRating")
      .populate("responder", "name email overallRating")
      .populate("skillRequested", "title category experienceLevel")
      .populate("skillOffered", "title category experienceLevel");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Only participants can view session details
    const isParticipant =
      session.requester._id.toString() === req.user._id.toString() ||
      session.responder._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: "Not authorized to view this session" });
    }

    res.json(session);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid session ID" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/sessions/:id/status — Accept / Decline / Cancel
// ──────────────────────────────────────────────
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const isRequester = session.requester.toString() === req.user._id.toString();
    const isResponder = session.responder.toString() === req.user._id.toString();

    if (!isRequester && !isResponder) {
      return res.status(403).json({ error: "Not authorized to update this session" });
    }

    // Status transition rules
    const allowedTransitions = {
      Pending: {
        responder: ["Accepted", "Declined"],
        requester: ["Cancelled"],
      },
      Accepted: {
        requester: ["Cancelled"],
        responder: ["Cancelled"],
      },
    };

    const role = isRequester ? "requester" : "responder";
    const allowed = allowedTransitions[session.status]?.[role] || [];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Cannot change status from '${session.status}' to '${status}' as ${role}`,
      });
    }

    session.status = status;
    await session.save();

    const populated = await session.populate([
      { path: "requester", select: "name email" },
      { path: "responder", select: "name email" },
      { path: "skillRequested", select: "title category" },
      { path: "skillOffered", select: "title category" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/sessions/:id/complete — Mark as completed
// ──────────────────────────────────────────────
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const isParticipant =
      session.requester.toString() === req.user._id.toString() ||
      session.responder.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (session.status !== "Accepted") {
      return res.status(400).json({ error: "Only accepted sessions can be marked as completed" });
    }

    session.status = "Completed";
    await session.save();

    // Update hours for both participants
    await User.findByIdAndUpdate(session.requester, {
      $inc: { hoursReceived: session.duration, hoursTeaught: session.duration },
    });
    await User.findByIdAndUpdate(session.responder, {
      $inc: { hoursReceived: session.duration, hoursTeaught: session.duration },
    });

    const populated = await session.populate([
      { path: "requester", select: "name email" },
      { path: "responder", select: "name email" },
      { path: "skillRequested", select: "title category" },
      { path: "skillOffered", select: "title category" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/sessions/:id/feedback — Submit feedback + rating
// ──────────────────────────────────────────────
router.put("/:id/feedback", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status !== "Completed") {
      return res.status(400).json({ error: "Can only leave feedback on completed sessions" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const isRequester = session.requester.toString() === req.user._id.toString();
    const isResponder = session.responder.toString() === req.user._id.toString();

    if (!isRequester && !isResponder) {
      return res.status(403).json({ error: "Not authorized to leave feedback" });
    }

    // Determine which feedback slot to fill
    if (isRequester) {
      if (session.feedback?.requesterFeedback?.rating) {
        return res.status(400).json({ error: "You have already submitted feedback" });
      }
      session.feedback = session.feedback || {};
      session.feedback.requesterFeedback = { rating, comment };

      // Update responder's overall rating
      const responder = await User.findById(session.responder);
      const newTotal = responder.totalRatings + 1;
      const newRating = ((responder.overallRating * responder.totalRatings) + rating) / newTotal;
      responder.overallRating = parseFloat(newRating.toFixed(2));
      responder.totalRatings = newTotal;
      await responder.save();
    } else {
      if (session.feedback?.responderFeedback?.rating) {
        return res.status(400).json({ error: "You have already submitted feedback" });
      }
      session.feedback = session.feedback || {};
      session.feedback.responderFeedback = { rating, comment };

      // Update requester's overall rating
      const requester = await User.findById(session.requester);
      const newTotal = requester.totalRatings + 1;
      const newRating = ((requester.overallRating * requester.totalRatings) + rating) / newTotal;
      requester.overallRating = parseFloat(newRating.toFixed(2));
      requester.totalRatings = newTotal;
      await requester.save();
    }

    await session.save();

    const populated = await session.populate([
      { path: "requester", select: "name email overallRating" },
      { path: "responder", select: "name email overallRating" },
      { path: "skillRequested", select: "title category" },
      { path: "skillOffered", select: "title category" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/sessions/:id — Update session details (requester only, while pending)
// ──────────────────────────────────────────────
router.put("/:id", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the requester can update session details" });
    }

    if (session.status !== "Pending") {
      return res.status(400).json({ error: "Can only edit pending sessions" });
    }

    const { skillOffered, scheduledDate, duration, format } = req.body;
    if (skillOffered !== undefined) session.skillOffered = skillOffered;
    if (scheduledDate !== undefined) session.scheduledDate = scheduledDate;
    if (duration !== undefined) session.duration = duration;
    if (format !== undefined) session.format = format;

    const updated = await session.save();
    const populated = await updated.populate([
      { path: "requester", select: "name email" },
      { path: "responder", select: "name email" },
      { path: "skillRequested", select: "title category" },
      { path: "skillOffered", select: "title category" },
    ]);

    res.json(populated);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/sessions/:id — Delete a session (requester only, while pending)
// ──────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the requester can delete a session" });
    }

    if (!["Pending", "Declined", "Cancelled"].includes(session.status)) {
      return res.status(400).json({ error: "Cannot delete an active or completed session" });
    }

    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
