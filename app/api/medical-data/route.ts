// app/api/medical-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("MHneetData2024");
    const collection = db.collection("unifiedCollection");

    // Build filter query based on selected category and subcategory
    let filter: any = {};
    if (category) filter.listCategory = category;
    if (subcategory) filter.listSubCategory = subcategory;
    
    // Handle any additional filters
    for (const [key, value] of searchParams.entries()) {
      if (!["page", "pageSize", "category", "subcategory"].includes(key) && value) {
        filter[key] = value;
      }
    }

    // Get total count for pagination
    const total = await collection.countDocuments(filter);
    
    // Fetch paginated data
    const data = await collection
      .find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .toArray();
      
    // Get distinct categories and subcategories for filters
    const categories = await collection.distinct("listCategory");
    let subcategories: string[] = [];
    if (category) {
      subcategories = await collection.distinct("listSubCategory", { listCategory: category });
    }
    
    return NextResponse.json({
      data,
      metadata: {
        total,
        page,
        pageSize,
        categories,
        subcategories
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}