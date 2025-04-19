// used for client side api testing 
import { NextResponse, NextRequest } from 'next/server';
import { getFullData } from '@/app/lib/getFullData';    

export async function GET(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = process.env.API_SECRET_KEY;

  if (apiKey !== expectedKey) {
    return NextResponse.json({ error: 'You are not authorized to access this thing 🐰' }, { status: 401 });
  }
  const data = await getFullData();
  return NextResponse.json({ success: true, data });
}
