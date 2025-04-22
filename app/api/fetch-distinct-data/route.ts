// /api/fetch-distinct-data/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getFullData } from '@/app/lib/getFullData';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  const secretKey = process.env.API_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  try {
    // ✅ Verify token
    const decoded = jwt.verify(apiKey, secretKey);
    console.log('Decoded token:', decoded);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired session, Try reloading the application. If problem persists, contact support' }, { status: 401 });
  }

  const data = await getFullData();
  const collection = data.collection(process.env.MONGODB_COLLECTION!);

  // Fetch distinct values
  const fieldsToFetch = ['listCategory'];
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
