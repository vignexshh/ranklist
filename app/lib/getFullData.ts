import clientPromise from "@/app/lib/mongodb";

export async function getFullData() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB!);
  const collection = db.collection(process.env.MONGODB_COLLECTION!);
  return await collection.find({}).toArray();

}