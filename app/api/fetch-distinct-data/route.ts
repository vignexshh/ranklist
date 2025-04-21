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
  const fields = await collection.findOne();
  if (!fields) {
    return NextResponse.json({ error: 'No data found in the collection' }, { status: 404 });
  }

  const distinctData: Record<string, any[]> = {};
  for (const field in fields) {
    if (fields.hasOwnProperty(field)) {
      distinctData[field] = await collection.distinct(field);
    }
  }
  return NextResponse.json({ success: true, distinctData });
}