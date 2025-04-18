// app/api/field-values/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const field = searchParams.get("field");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    
    if (!field) {
      return NextResponse.json({ error: "Field parameter is required" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("medical_hunt");
    const collection = db.collection("yourCollectionName");
    
    // Build filter query for the distinct operation
    let filter: any = {};
    if (category) filter.listCategory = category;
    if (subcategory) filter.listSubCategory = subcategory;
    
    // Get distinct values for the requested field
    const values = await collection.distinct(field, filter);
    
    return NextResponse.json({ values });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch field values" }, { status: 500 });
  }
}