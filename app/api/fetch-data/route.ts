import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/app/lib/mongodb'; 
// curl -H "x-api-key: mh-K55jxxYYojvnrk2Ng9UtBCRlhk02jAxVqLoAiRqY34jKHhTTLPpY2fuynaFsiScyoDTajW6dS9TuX6iSsbGkGZ5C8htPuRcoY9cSWh5fV70vdK7AUwC1SN9nSoeI6" http://localhost:3000/api/fetch-data


const env_db = process.env.MONGODB_DB; 
const env_collection = process.env.MONGODB_COLLECTION;

export async function GET(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = process.env.API_SECRET_KEY;

  if (apiKey !== expectedKey) {
    return NextResponse.json({ error: 'You are not authorized to access this thing 🐰' }, { status: 401 });
  }
  try {
    const client = await clientPromise;
    if (!env_db) {
        throw new Error('Environment variable Database is not defined');
      }
    const db = client.db(env_db); 
    if (!env_collection) {
      throw new Error('Environment variable Collection is not defined');
    }
    const collection = db.collection(env_collection); 

    const data = await collection.find({}).toArray();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}
