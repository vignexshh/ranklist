import clientPromise from "@/app/lib/mongodb";
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
export async function GET(req: NextRequest) {
    console.debug("Starting getFullData function");
    const apiKey = req.headers.get('x-api-key');
      const secretKey = process.env.API_SECRET_KEY;
    
      if (!apiKey || !secretKey) {
        return NextResponse.json({ error: 'Missing client authentication credentials' }, { status: 400 });
      }
    
      try {
        // Verify token
        jwt.verify(apiKey, secretKey);
      } catch (err) {
        return NextResponse.json(
          { error: 'Invalid or expired session' }, 
          { status: 401 }
        );
      }

    try {
        const client = await clientPromise;
        let collection;
        try {
            const db = client.db(process.env.MONGODB_DB!);
            collection = db.collection(process.env.MONGODB_COLLECTION!);
        } catch (error) {
            console.error("An error occurred while accessing the database or collection:", error);
            throw error;
        }

        const categories = await collection.distinct(process.env.MONGODB_LISTCAT!);

        return NextResponse.json(categories);
    } catch (error) {
        console.error("An error occurred in getFullData:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
