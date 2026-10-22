import { MongoClient } from "mongodb";
import { OfficeLayout } from "../models/OfficeLayout.js";

let client = null;
let db = null;

let usersCollection = null;
let audiosCollection = null;
let positionsCollection = null;
let officeLayoutsCollection = null;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/proxispeak";
  if (db) return db;

  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
  } catch (err) {
    if (uri !== "mongodb://127.0.0.1:27017/proxispeak") {
      console.warn("Primary MongoDB connection failed, falling back to local MongoDB (127.0.0.1:27017):", err.message);
      client = new MongoClient("mongodb://127.0.0.1:27017/proxispeak");
      await client.connect();
    } else {
      throw err;
    }
  }

  db = client.db("proxispeak");
  usersCollection = db.collection("users");
  audiosCollection = db.collection("audios");
  positionsCollection = db.collection("user_positions");
  officeLayoutsCollection = db.collection("office_layouts");

  // Ensure database indexes & clean state
  await initIndexes();
  await seedAdminUser();
  await OfficeLayout.seedLayout();

  // Clean out any legacy recorded audio documents
  await audiosCollection.deleteMany({});

  console.log("MongoDB connected successfully to proxispeak database.");
  return db;
}

async function initIndexes() {
  try {
    // 1. Users collection: unique index on lowercase email
    try {
      const existingIndexes = await usersCollection.indexes();
      if (existingIndexes.some((idx) => idx.name === "username_1")) {
        await usersCollection.dropIndex("username_1");
      }
    } catch {}
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // 2. Audios collection: 2dsphere index on GeoJSON location
    await audiosCollection.createIndex({ location: "2dsphere" });
    await audiosCollection.createIndex({ createdAt: -1 });
    await audiosCollection.createIndex({ userId: 1 });

    // 3. User live positions: 2dsphere index for real-time proximity
    await positionsCollection.createIndex({ location: "2dsphere" });

    // Clean up stale ephemeral live positions on server restart
    await positionsCollection.deleteMany({});

    console.log("Database indexes and live collections initialized.");
  } catch (error) {
    console.error("Index initialization warning:", error.message);
  }
}

async function seedAdminUser() {
  try {
    // Purge any temporary auto-generated test accounts from past test executions
    await usersCollection.deleteMany({ email: { $regex: /@proxispeak\.local$/i } });

    const adminEmail = "admin@proxispeak.com";
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await usersCollection.insertOne({
        name: "ProxiSpeak Admin",
        email: adminEmail,
        password: hashedPassword,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ProxiSpeakAdmin",
        role: "admin",
        createdAt: new Date(),
        lastActive: new Date(),
      });
      console.log(`Seeded default admin credentials: ${adminEmail} (password: admin123)`);
    }
  } catch (error) {
    console.warn("Admin seeding notice:", error.message);
  }
}

export function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connectDatabase() first.");
  }
  return db;
}

export function getCollections() {
  if (!db) {
    throw new Error("Database not connected. Call connectDatabase() first.");
  }
  return {
    users: usersCollection,
    audios: audiosCollection,
    positions: positionsCollection,
    officeLayouts: officeLayoutsCollection,
  };
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
