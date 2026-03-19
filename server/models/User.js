import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { getDB } from "../config/db.js";

const COLLECTION = "users";

// Validation schema
const validateUser = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate) {
    if (!data.name || data.name.trim().length < 2)
      errors.push("Name must be at least 2 characters");
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email))
      errors.push("Valid email is required");
    if (!data.password || data.password.length < 6)
      errors.push("Password must be at least 6 characters");
  } else {
    if (data.name !== undefined && data.name.trim().length < 2)
      errors.push("Name must be at least 2 characters");
    if (data.bio !== undefined && data.bio.length > 500)
      errors.push("Bio cannot exceed 500 characters");
  }

  return errors;
};

// Create a new user document
const createUser = async (data) => {
  const db = getDB();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  const user = {
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: hashedPassword,
    bio: data.bio || "",
    hoursTeaught: 0,
    hoursReceived: 0,
    overallRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection(COLLECTION).insertOne(user);
  const { password, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, _id: result.insertedId };
};

// Find user by email (includes password for auth)
const findByEmail = async (email) => {
  const db = getDB();
  return db.collection(COLLECTION).findOne({ email: email.toLowerCase() });
};

// Find user by ID (excludes password)
const findById = async (id) => {
  const db = getDB();
  return db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
};

// Get all users (excludes password)
const findAll = async () => {
  const db = getDB();
  return db
    .collection(COLLECTION)
    .find({}, { projection: { password: 0 } })
    .toArray();
};

// Update user
const updateUser = async (id, updates) => {
  const db = getDB();
  updates.updatedAt = new Date();
  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after", projection: { password: 0 } },
    );
  return result;
};

// Delete user
const deleteUser = async (id) => {
  const db = getDB();
  return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
};

export {
  validateUser,
  createUser,
  findByEmail,
  findById,
  findAll,
  updateUser,
  deleteUser,
};
