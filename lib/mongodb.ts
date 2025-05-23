import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

if (process.env.NODE_ENV === "development") {
  // Use a global variable in development to prevent multiple instances
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
    console.log("MongoDB client connected in development mode.");
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  console.log("MongoDB client connected in production mode.");
}

export default clientPromise;