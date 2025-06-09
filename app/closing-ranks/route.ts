import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

// We'll use 'any' for the document type here, as the schema is flexible
interface FlexibleDocument {
  _id: ObjectId;
  [key: string]: any; // Allows for any other properties
}

// Returned document type with string _id
interface FlexibleDocumentWithStringId extends Omit<FlexibleDocument, '_id'> {
  _id: string;
}

export async function getDocuments(collectionName: string): Promise<FlexibleDocumentWithStringId[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB!); // Replace 'your_database_name'

    const collection = db.collection<FlexibleDocument>(collectionName);
    const documents = await collection.find({}).toArray();

    // Serialize _id to string for DataGrid
    return documents.map(doc => ({
      ...doc,
      _id: doc._id.toString(), // Ensuring _id is a string
    }));

  } catch (error) {
    console.error('Error fetching documents:', error);
    throw new Error('Failed to fetch documents.');
  }
}