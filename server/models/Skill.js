import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const COLLECTION = "skills";

const VALID_CATEGORIES = [
  "Programming",
  "Music",
  "Languages",
  "Art & Design",
  "Cooking",
  "Fitness",
  "Photography",
  "Writing",
  "Math & Science",
  "Business",
  "Other",
];

const VALID_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const VALID_FORMATS = ["In-Person", "Video", "Async"];

// Validation
const validateSkill = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate) {
    if (!data.title || data.title.trim().length < 2)
      errors.push("Title must be at least 2 characters");
    if (!data.category || !VALID_CATEGORIES.includes(data.category))
      errors.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`);
    if (
      !data.experienceLevel ||
      !VALID_LEVELS.includes(data.experienceLevel)
    )
      errors.push(
        `Experience level must be one of: ${VALID_LEVELS.join(", ")}`,
      );
    if (!data.format || !VALID_FORMATS.includes(data.format))
      errors.push(`Format must be one of: ${VALID_FORMATS.join(", ")}`);
  } else {
    if (
      data.category !== undefined &&
      !VALID_CATEGORIES.includes(data.category)
    )
      errors.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`);
    if (
      data.experienceLevel !== undefined &&
      !VALID_LEVELS.includes(data.experienceLevel)
    )
      errors.push(
        `Experience level must be one of: ${VALID_LEVELS.join(", ")}`,
      );
    if (data.format !== undefined && !VALID_FORMATS.includes(data.format))
      errors.push(`Format must be one of: ${VALID_FORMATS.join(", ")}`);
  }

  return errors;
};

// Create skill
const createSkill = async (data, userId) => {
  const db = getDB();

  // Duplicate prevention
  const existing = await db
    .collection(COLLECTION)
    .findOne({ userId: new ObjectId(userId), title: data.title.trim() });
  if (existing) {
    throw new Error("You have already posted a skill with this title");
  }

  const skill = {
    userId: new ObjectId(userId),
    title: data.title.trim(),
    description: data.description || "",
    category: data.category,
    experienceLevel: data.experienceLevel,
    availability: data.availability || "Flexible",
    format: data.format,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection(COLLECTION).insertOne(skill);
  return { ...skill, _id: result.insertedId };
};

// Find all skills with optional filters
const findAll = async (filters = {}) => {
  const db = getDB();
  const query = {};

  if (filters.category) query.category = filters.category;
  if (filters.format) query.format = filters.format;
  if (filters.experienceLevel)
    query.experienceLevel = filters.experienceLevel;
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  const skills = await db
    .collection(COLLECTION)
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  // Populate user info
  const userIds = [...new Set(skills.map((s) => s.userId.toString()))];
  const users = await db
    .collection("users")
    .find(
      { _id: { $in: userIds.map((id) => new ObjectId(id)) } },
      {
        projection: { name: 1, email: 1, overallRating: 1 },
      },
    )
    .toArray();

  const userMap = {};
  users.forEach((u) => {
    userMap[u._id.toString()] = u;
  });

  return skills.map((skill) => ({
    ...skill,
    user: userMap[skill.userId.toString()] || null,
  }));
};

// Find by ID
const findById = async (id) => {
  const db = getDB();
  const skill = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) });

  if (!skill) return null;

  const user = await db
    .collection("users")
    .findOne(
      { _id: skill.userId },
      { projection: { name: 1, email: 1, overallRating: 1, bio: 1 } },
    );

  return { ...skill, user };
};

// Find by user ID
const findByUserId = async (userId) => {
  const db = getDB();
  return db
    .collection(COLLECTION)
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
};

// Update skill
const updateSkill = async (id, updates) => {
  const db = getDB();
  updates.updatedAt = new Date();
  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" },
    );
  return result;
};

// Delete skill
const deleteSkill = async (id) => {
  const db = getDB();
  return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
};

// Stats
const getStats = async () => {
  const db = getDB();
  const collection = db.collection(COLLECTION);

  const totalSkills = await collection.countDocuments();

  const categoryStats = await collection
    .aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  const experienceLevelStats = await collection
    .aggregate([
      { $group: { _id: "$experienceLevel", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  const formatStats = await collection
    .aggregate([
      { $group: { _id: "$format", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  return {
    totalSkills,
    mostPopularCategory:
      categoryStats.length > 0 ? categoryStats[0]._id : null,
    categoryBreakdown: categoryStats,
    experienceLevelBreakdown: experienceLevelStats,
    formatBreakdown: formatStats,
  };
};

export {
  VALID_CATEGORIES,
  VALID_LEVELS,
  VALID_FORMATS,
  validateSkill,
  createSkill,
  findAll,
  findById,
  findByUserId,
  updateSkill,
  deleteSkill,
  getStats,
};
