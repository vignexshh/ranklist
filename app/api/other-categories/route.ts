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
            jwt.verify(apiKey, secretKey);
        } catch (err) {
            return NextResponse.json(
                { error: 'Invalid or expired session' },
                { status: 401 }
            );
        }
    try {
        const { subCategory } = await req.json();

        if (!subCategory) {
            return NextResponse.json({ error: 'SubCategory is required' }, { status: 400 });
        }

        await client.connect();
        const database = client.db(process.env.MONGODB_DB!);
        const collection = database.collection(process.env.MONGODB_COLLECTION!);

        const pipeline = [
            { $match: { listSubCategory: subCategory } },
            {
            $group: {
                _id: null,
                distinctFields: {
                $mergeObjects: {
                    $arrayToObject: {
                    $map: {
                        input: { $objectToArray: "$$ROOT" },
                        as: "field",
                        in: {
                        k: "$$field.k",
                        v: { $addToSet: "$$field.v" }
                        }
                    }
                    }
                }
                }
            }
            },
            {
            $project: {
                _id: 0,
                distinctFields: 1
            }
            }
        ];

        const aggregationResult = await collection.aggregate(pipeline).toArray();
        const result = aggregationResult.length > 0 ? aggregationResult[0].distinctFields : {};

        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await client.close();
    }
}