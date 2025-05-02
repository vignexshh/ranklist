// api/fetch-distinct-subcategory
import { NextResponse, NextRequest } from 'next/server';
import { getFullData } from '@/app/lib/getFullData';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
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

  try {
    // Parse the request body to get the selected category
    const body = await req.json();
    const { category } = body;

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const data = await getFullData();
    const collection = data.collection(process.env.MONGODB_COLLECTION!);

    // Fetch distinct subcategories for the selected category
    const distinctSubCategories = await collection.distinct('listSubCategory', { listCategory: category });

    return NextResponse.json({ success: true, distinctSubCategories });
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}