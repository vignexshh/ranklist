import { NextResponse, NextRequest } from 'next/server';
import { getFullData } from '@/app/lib/getFullData';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  const expectedKey = process.env.API_SECRET_KEY;

  if (apiKey !== expectedKey) {
    return NextResponse.json({ error: 'API Error : Failed to fetch data' }, { status: 401 });
  }

  const data = await getFullData();
  const collection = data.collection(process.env.MONGODB_COLLECTION!);

  // Fetch distinct values for specific fields
  const fieldsToFetch = ['listCategory', 'listSubCategory'];
  const distinctData: Record<string, any[]> = {};

  for (const field of fieldsToFetch) {
    try {
      distinctData[field] = await collection.distinct(field);
    } catch (err) {
      console.warn(`Error getting distinct values for field "${field}":`, err);
      distinctData[field] = [];
    }
  }

  return NextResponse.json({ success: true, distinctData });
}
