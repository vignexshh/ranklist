import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI || '';
const client = new MongoClient(uri);

export async function POST(req: NextRequest) {
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
        const { category } = await req.json();

        if (!category) {
            return NextResponse.json({ error: 'Category is required' }, { status: 400 });
        }

        await client.connect();
        const database = client.db(process.env.MONGODB_DB!); // Replace with your database name
        const collection = database.collection(process.env.MONGODB_COLLECTION!); // Replace with your collection name

        // Query to find distinct subcategories where listCategory includes the provided category
        const distinctSubCategories = await collection.distinct('listSubCategory', { listCategory: category });

        return NextResponse.json({ subCategories: distinctSubCategories });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await client.close();
    }
}
