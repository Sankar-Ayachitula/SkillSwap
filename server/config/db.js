import { MongoClient } from "mongodb";

let db;

const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log(`MongoDB connected: ${db.databaseName}`);

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db
      .collection("skills")
      .createIndex({ userId: 1, title: 1 }, { unique: true });
    await db.collection("sessions").createIndex({ requesterId: 1 });
    await db.collection("sessions").createIndex({ responderId: 1 });

    return db;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error("Database not connected. Call connectDB first.");
  return db;
};

export { connectDB, getDB };
