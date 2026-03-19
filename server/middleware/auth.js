import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// Supports both Passport session auth AND JWT Bearer token
// - Local dev: Passport session cookies work fine
// - Production/Vercel: JWT token in Authorization header
const isAuthenticated = async (req, res, next) => {
  // 1. Check Passport session first
  if (req.isAuthenticated()) {
    return next();
  }

  // 2. Fall back to JWT Bearer token
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      const token = header.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SESSION_SECRET);
      const db = getDB();
      const user = await db
        .collection("users")
        .findOne(
          { _id: new ObjectId(decoded.id) },
          { projection: { password: 0 } },
        );

      if (user) {
        req.user = user;
        return next();
      }
    } catch (error) {
      // Token invalid, fall through to 401
    }
  }

  return res
    .status(401)
    .json({ error: "Not authenticated. Please log in." });
};

export default isAuthenticated;