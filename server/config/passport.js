import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDB } from "./db.js";

const configurePassport = () => {
  // Local strategy: authenticate with email + password
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const db = getDB();
          const user = await db
            .collection("users")
            .findOne({ email: email.toLowerCase() });

          if (!user) {
            return done(null, false, { message: "Invalid credentials" });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid credentials" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  // Serialize: store user _id in session
  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  // Deserialize: retrieve user from DB by _id
  passport.deserializeUser(async (id, done) => {
    try {
      const db = getDB();
      const user = await db
        .collection("users")
        .findOne(
          { _id: new ObjectId(id) },
          { projection: { password: 0 } },
        );
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default configurePassport;
