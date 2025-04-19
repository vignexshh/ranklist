import clientPromise from "@/app/lib/mongodb";


export async function getFullData() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB!);
  const collection = db.collection(process.env.MONGODB_COLLECTION!);
  const cursor = collection.find({}); // No .toArray()

for await (const doc of cursor) {
  // Handle each document one by one
  console.log(doc); // Or process/store/send it
}
// return await collection.find({}).toArray();
// return await collection.distinct("listCategory");
}