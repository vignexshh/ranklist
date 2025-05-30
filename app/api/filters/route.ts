import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const selectedCategory = data.selectedCategory;
    const selectedSubCategory = data.selectedSubCategory;

    // You can send these values to app/rank/page.tsx by including them in the response
    // For example, add them to the response JSON:
    // return NextResponse.json({ distinctFields: result, selectedCategory, selectedSubCategory }, { status: 200 });

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB!);
    const collection = db.collection(process.env.MONGODB_COLLECTION!);

    // Find documents matching the filters
    const filter = {
      listCategory: selectedCategory,
      listSubCategory: selectedSubCategory,
    };
    const docs = await collection.find(filter).toArray();

    // Collect all field names
    const allFields = new Set<string>();
    docs.forEach((doc) => {
      Object.keys(doc).forEach((key) => {
        if (key !== "_id") allFields.add(key);
      });
    });

    // For each field, get distinct values among the filtered docs
    const result: Record<string, any[]> = {};
    for (const field of allFields) {
      const values = await collection.distinct(field, filter);
      result[field] = values;
    }
    console.log(`Number of distinct fields found: ${Object.keys(result).length}`);
    console.log(result)
    return NextResponse.json({ distinctFields: result }, { status: 200 });
  } catch (error) {
    console.error("Error fetching distinct field values:", error);
    return NextResponse.json(
      { message: "Failed to fetch distinct field values", error: (error as Error).message },
      { status: 500 }
    );
  }
}
