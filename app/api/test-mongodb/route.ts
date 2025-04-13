import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Perform a simple query to test connection
    const collection = db.collection('unifiedCollection');
    const count = await collection.countDocuments();
    
    return NextResponse.json({ 
      status: 'connected', 
      documentCount: count
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 }
    );
  }
}