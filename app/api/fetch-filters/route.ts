//api/fetch-filters
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
    // Parse the request body to get the selected subcategory
    const body = await req.json();
    const { subCategory } = body;

    if (!subCategory) {
      return NextResponse.json({ error: 'Subcategory is required' }, { status: 400 });
    }

    const data = await getFullData();
    const collection = data.collection(process.env.MONGODB_COLLECTION!);

    // Fetch distinct values of all fields that contain the selected subcategory
    const fields = await collection.aggregate([
      { $match: { listSubCategory: subCategory } },
      { $project: { _id: 0 } },
      { $limit: 1 }
    ]).toArray();

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields found for the selected subcategory' }, { status: 404 });
    }

    const fieldNames = Object.keys(fields[0]);
    const distinctfieldValues: Record<string, any[]> = {};
    
    const ignoredFields = ['listCategory', 'listSubCategory', 'option No.']; // Add fields to ignore here

    for (const field of fieldNames) {
      if (ignoredFields.includes(field)) {
      continue; // Skip ignored fields
      }
      try {
      distinctfieldValues[field] = await collection.distinct(field, { listSubCategory: subCategory });
      } catch (err) {
      console.warn(`Error getting distinct values for field "${field}":`, err);
      distinctfieldValues[field] = [];
      }
    }
    
    return NextResponse.json({ success: true, distinctfieldValues });
    
    } catch (err) {
    console.error('Error fetching filters:', err);
    return NextResponse.json({ error: 'Failed to fetch filters' }, { status: 500 });
  }
}