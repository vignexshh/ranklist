import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { selectedCategory, selectedSubCategory, filters } = body;
    // Build MongoDB query object
    const query = {
      listCategory: selectedCategory,
      listSubCategory: selectedSubCategory,
      ...Object.fromEntries(
        Object.entries(filters || {}).map(([key, value]) => [key, value])
      ),
    };

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB!);
    const collection = db.collection(process.env.MONGODB_COLLECTION!);

    // Fetch only the first 30 documents matching the dynamic query
    const docs = await collection.find(query).limit(30).toArray();
    console.log("MongoDB query:", query);
    console.log("Fetched docs count:", docs.length);
    return NextResponse.json({ data: docs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents", details: (error as Error).message }, { status: 500 });
  }
}
