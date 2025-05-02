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
    // Verify token
    jwt.verify(apiKey, secretKey);
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid or expired session' }, 
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { filters, page = 1, pageSize = 10 } = body;

    const data = await getFullData();
    const collection = data.collection(process.env.MONGODB_COLLECTION!);

    // Get total count for pagination
    const totalCount = await collection.countDocuments(filters);

    // Fetch paginated data
    const result = await collection
      .find(filters)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      success: true,
      data: result,
      totalCount,
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    return NextResponse.json(
      { error: 'Failed to fetch data' }, 
      { status: 500 }
    );
  }
}