import { NextResponse, NextRequest } from 'next/server';
import { getFullData } from '@/app/lib/getFullData';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  const expectedKey = process.env.API_SECRET_KEY;

  if (apiKey !== expectedKey) {
    return NextResponse.json({ error: 'You are not authorized to access this thing 🐰' }, { status: 401 });
  }

  const data = await getFullData();
  const collection = data.collection(process.env.MONGODB_COLLECTION!);

  // Get all distinct field names using aggregation
  const result = await collection.aggregate([
    { $project: { keys: { $objectToArray: "$$ROOT" } } },
    { $unwind: "$keys" },
    { $group: { _id: null, allKeys: { $addToSet: "$keys.k" } } }
  ]).toArray();

  const allFields = result[0]?.allKeys;
  if (!allFields || allFields.length === 0) {
    return NextResponse.json({ error: 'No fields found in the collection' }, { status: 404 });
  }

  // Fetch distinct values for each field
  const distinctData: Record<string, any[]> = {};
  for (const field of allFields) {
    try {
      distinctData[field] = await collection.distinct(field);
    } catch (err) {
      console.warn(`Error getting distinct values for field "${field}":`, err);
      distinctData[field] = [];
    }
  }

  return NextResponse.json({ success: true, distinctData });
}
