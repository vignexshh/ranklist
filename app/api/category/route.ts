import { NextResponse } from "next/server"; 
import clientPromise from "@/lib/mongodb";

export async function GET(){
    try{

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB!);
        const collection = db.collection(process.env.MONGODB_COLLECTION!);
        const distinctCategories = await collection.distinct("listCategory", {})

        const validCategories = distinctCategories
        .filter(category => typeof category ==='string' && category !== null && category !== undefined)
        .map(category => category as string);

        return NextResponse.json(validCategories, {status:200});
    } catch (error) {
        console.error("Failed to fetch distinct categories:", error);
        return NextResponse.json(
            { messsage: "failed to fetch distinct categories", error: (error as Error). message},
        );
    }
}