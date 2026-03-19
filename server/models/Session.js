import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const COLLECTION = "sessions";
const VALID_FORMATS = ["In-Person", "Video", "Async"];
const VALID_STATUSES = [
  "Pending",
  "Accepted",
  "Declined",
  "Cancelled",
  "Completed",
];

// Validation
const validateSession = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate) {
    if (!data.responderId) errors.push("Responder is required");
    if (!data.skillRequestedId) errors.push("Requested skill is required");
    if (!data.skillOfferedId) errors.push("Offered skill is required");
    if (!data.scheduledDate) errors.push("Scheduled date is required");
    if (!data.duration || data.duration < 0.5 || data.duration > 8)
      errors.push("Duration must be between 0.5 and 8 hours");
    if (!data.format || !VALID_FORMATS.includes(data.format))
      errors.push(`Format must be one of: ${VALID_FORMATS.join(", ")}`);
  } else {
    if (
      data.duration !== undefined &&
      (data.duration < 0.5 || data.duration > 8)
    )
      errors.push("Duration must be between 0.5 and 8 hours");
    if (data.format !== undefined && !VALID_FORMATS.includes(data.format))
      errors.push(`Format must be one of: ${VALID_FORMATS.join(", ")}`);
  }

  return errors;
};

// Populate session with user and skill details
const populateSession = async (session) => {
  const db = getDB();

  const [requester, responder, skillRequested, skillOffered] =
    await Promise.all([
      db
        .collection("users")
        .findOne(
          { _id: session.requesterId },
          { projection: { name: 1, email: 1, overallRating: 1 } },
        ),
      db
        .collection("users")
        .findOne(
          { _id: session.responderId },
          { projection: { name: 1, email: 1, overallRating: 1 } },
        ),
      db
        .collection("skills")
        .findOne(
          { _id: session.skillRequestedId },
          { projection: { title: 1, category: 1, experienceLevel: 1 } },
        ),
      db
        .collection("skills")
        .findOne(
          { _id: session.skillOfferedId },
          { projection: { title: 1, category: 1, experienceLevel: 1 } },
        ),
    ]);

  return {
    ...session,
    requester,
    responder,
    skillRequested,
    skillOffered,
  };
};

// Create session
const createSession = async (data, requesterId) => {
  const db = getDB();

  if (requesterId === data.responderId) {
    throw new Error("You cannot create a session with yourself");
  }

  const session = {
    requesterId: new ObjectId(requesterId),
    responderId: new ObjectId(data.responderId),
    skillRequestedId: new ObjectId(data.skillRequestedId),
    skillOfferedId: new ObjectId(data.skillOfferedId),
    scheduledDate: new Date(data.scheduledDate),
    duration: data.duration,
    format: data.format,
    status: "Pending",
    feedback: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection(COLLECTION).insertOne(session);
  const created = { ...session, _id: result.insertedId };
  return populateSession(created);
};

// Find sessions for a user with optional filters
const findByUser = async (userId, filters = {}) => {
  const db = getDB();
  const userObjId = new ObjectId(userId);
  const query = {};

  if (filters.role === "requester") {
    query.requesterId = userObjId;
  } else if (filters.role === "responder") {
    query.responderId = userObjId;
  } else {
    query.$or = [{ requesterId: userObjId }, { responderId: userObjId }];
  }

  if (filters.status) query.status = filters.status;

  const sessions = await db
    .collection(COLLECTION)
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return Promise.all(sessions.map(populateSession));
};

// Find by ID
const findById = async (id) => {
  const db = getDB();
  const session = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) });

  if (!session) return null;
  return populateSession(session);
};

// Update session fields
const updateSession = async (id, updates) => {
  const db = getDB();
  updates.updatedAt = new Date();
  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" },
    );
  if (!result) return null;
  return populateSession(result);
};

// Update status with transition rules
const updateStatus = async (id, newStatus, userId) => {
  const db = getDB();
  const session = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) });

  if (!session) throw new Error("Session not found");

  const isRequester = session.requesterId.toString() === userId;
  const isResponder = session.responderId.toString() === userId;

  if (!isRequester && !isResponder)
    throw new Error("Not authorized to update this session");

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

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Cannot change status from '${session.status}' to '${newStatus}' as ${role}`,
    );
  }

  return updateSession(id, { status: newStatus });
};

// Mark as completed and update hours
const completeSession = async (id, userId) => {
  const db = getDB();
  const session = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) });

  if (!session) throw new Error("Session not found");

  const isParticipant =
    session.requesterId.toString() === userId ||
    session.responderId.toString() === userId;

  if (!isParticipant) throw new Error("Not authorized");
  if (session.status !== "Accepted")
    throw new Error("Only accepted sessions can be marked as completed");

  // Update session status
  const updated = await updateSession(id, { status: "Completed" });

  // Update hours for both participants
  await db
    .collection("users")
    .updateOne(
      { _id: session.requesterId },
      {
        $inc: {
          hoursReceived: session.duration,
          hoursTeaught: session.duration,
        },
        $set: { updatedAt: new Date() },
      },
    );
  await db
    .collection("users")
    .updateOne(
      { _id: session.responderId },
      {
        $inc: {
          hoursReceived: session.duration,
          hoursTeaught: session.duration,
        },
        $set: { updatedAt: new Date() },
      },
    );

  return updated;
};

// Submit feedback and update rating
const submitFeedback = async (id, userId, rating, comment) => {
  const db = getDB();
  const session = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) });

  if (!session) throw new Error("Session not found");
  if (session.status !== "Completed")
    throw new Error("Can only leave feedback on completed sessions");

  if (!rating || rating < 1 || rating > 5)
    throw new Error("Rating must be between 1 and 5");

  const isRequester = session.requesterId.toString() === userId;
  const isResponder = session.responderId.toString() === userId;

  if (!isRequester && !isResponder)
    throw new Error("Not authorized to leave feedback");

  if (isRequester) {
    if (session.feedback?.requesterFeedback?.rating)
      throw new Error("You have already submitted feedback");

    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "feedback.requesterFeedback": { rating, comment },
          updatedAt: new Date(),
        },
      },
    );

    // Update responder's rating
    const responder = await db
      .collection("users")
      .findOne({ _id: session.responderId });
    const newTotal = responder.totalRatings + 1;
    const newRating =
      (responder.overallRating * responder.totalRatings + rating) / newTotal;

    await db.collection("users").updateOne(
      { _id: session.responderId },
      {
        $set: {
          overallRating: parseFloat(newRating.toFixed(2)),
          totalRatings: newTotal,
          updatedAt: new Date(),
        },
      },
    );
  } else {
    if (session.feedback?.responderFeedback?.rating)
      throw new Error("You have already submitted feedback");

    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "feedback.responderFeedback": { rating, comment },
          updatedAt: new Date(),
        },
      },
    );

    // Update requester's rating
    const requester = await db
      .collection("users")
      .findOne({ _id: session.requesterId });
    const newTotal = requester.totalRatings + 1;
    const newRating =
      (requester.overallRating * requester.totalRatings + rating) / newTotal;

    await db.collection("users").updateOne(
      { _id: session.requesterId },
      {
        $set: {
          overallRating: parseFloat(newRating.toFixed(2)),
          totalRatings: newTotal,
          updatedAt: new Date(),
        },
      },
    );
  }

  // Return updated session
  const updated = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) });
  return populateSession(updated);
};

// Delete session
const deleteSession = async (id) => {
  const db = getDB();
  return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
};

// Stats for a user
const getStats = async (userId) => {
  const db = getDB();
  const userObjId = new ObjectId(userId);
  const userFilter = {
    $or: [{ requesterId: userObjId }, { responderId: userObjId }],
  };

  const totalSessions = await db
    .collection(COLLECTION)
    .countDocuments(userFilter);
  const completedSessions = await db
    .collection(COLLECTION)
    .countDocuments({ ...userFilter, status: "Completed" });
  const completionRate =
    totalSessions > 0
      ? parseFloat(((completedSessions / totalSessions) * 100).toFixed(1))
      : 0;

  const ratingPipeline = await db
    .collection(COLLECTION)
    .aggregate([
      {
        $match: {
          $or: [{ requesterId: userObjId }, { responderId: userObjId }],
          status: "Completed",
        },
      },
      {
        $project: {
          rating: {
            $cond: {
              if: { $eq: ["$requesterId", userObjId] },
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
    ])
    .toArray();

  const averageRating =
    ratingPipeline.length > 0
      ? parseFloat(ratingPipeline[0].averageRating.toFixed(2))
      : 0;

  const hoursByMonth = await db
    .collection(COLLECTION)
    .aggregate([
      {
        $match: {
          $or: [{ requesterId: userObjId }, { responderId: userObjId }],
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
    ])
    .toArray();

  const statusBreakdown = await db
    .collection(COLLECTION)
    .aggregate([
      {
        $match: {
          $or: [{ requesterId: userObjId }, { responderId: userObjId }],
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  return {
    totalSessions,
    completedSessions,
    completionRate,
    averageRating,
    hoursExchangedByMonth: hoursByMonth,
    statusBreakdown,
  };
};

export {
  VALID_FORMATS,
  VALID_STATUSES,
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
};
