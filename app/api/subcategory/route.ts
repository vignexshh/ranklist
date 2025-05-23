import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const selectedCategory = body.selectedCategory;

    if (!selectedCategory) {
      return NextResponse.json(
        { message: "Missing selectedCategory in request" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB!);
    const collection = db.collection(process.env.MONGODB_COLLECTION!);

    // Fetch distinct listSubCategory values for matching listCategory
    const distinctSubCategories = await collection.distinct("listSubCategory", {
      listCategory: selectedCategory,
    });

    const validSubCategories = distinctSubCategories
      .filter(
        (subCategory) =>
          typeof subCategory === "string" &&
          subCategory !== null &&
          subCategory !== undefined
      )
      .map((subCategory) => subCategory as string);

    return NextResponse.json({ subCategories: validSubCategories }, { status: 200 });

  } catch (error) {
    console.error("Error in POST /api/sub-category:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
