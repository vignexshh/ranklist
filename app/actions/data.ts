"use server";
import clientPromise from '@/lib/mongodb';
import { ObjectId, MongoClient } from 'mongodb';
import { cache } from 'react';

// Interfaces
interface FlexibleDocument {
  _id: ObjectId;
  [key: string]: any;
}

interface FlexibleDocumentWithStringId extends Omit<FlexibleDocument, '_id'> {
  _id: string;
}

// Validation helper
function isValidCollectionName(name: string): boolean {
  // MongoDB collection name validation
  const invalidChars = /[\/\\. "$<>:|?*]/;
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    name.length <= 120 &&
    !invalidChars.test(name) &&
    !name.startsWith('system.')
  );
}

// Connection helper with timeout
async function getMongoClient(): Promise<MongoClient> {
  try {
    const client = await Promise.race([
      clientPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000)
      )
    ]);
    
    // Test the connection
    await client.db().admin().ping();
    return client;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw new Error('Failed to connect to MongoDB. Please check your connection configuration.');
  }
}

// Cache the function for better performance with React's built-in cache
export const getDocuments = cache(async function getDocuments(
  collectionName: string,
  options: {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    filter?: Record<string, any>;
  } = {}
): Promise<FlexibleDocumentWithStringId[]> {
  // Input validation
  if (!collectionName || typeof collectionName !== 'string') {
    throw new Error('Collection name is required and must be a string.');
  }

  if (!isValidCollectionName(collectionName)) {
    throw new Error('Invalid collection name. Collection names cannot contain special characters or be empty.');
  }

  const {
    limit = 1000,      // Default limit to prevent memory issues
    skip = 0,
    sort = { _id: 1 }, // Default sort
    filter = {}
  } = options;

  // Validate numeric options
  if (typeof limit !== 'number' || limit < 0 || limit > 10000) {
    throw new Error('Limit must be a number between 0 and 10000.');
  }

  if (typeof skip !== 'number' || skip < 0) {
    throw new Error('Skip must be a non-negative number.');
  }

  let client: MongoClient;
  
  try {
    // Get MongoDB client with connection validation
    client = await getMongoClient();
    
    // Validate database name
    const dbName = process.env.MONGODB_DB;
    if (!dbName) {
      throw new Error('MONGODB_DB environment variable is not set.');
    }

    const db = client.db(dbName);
    
    // Check if collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.warn(`Collection '${collectionName}' does not exist in database '${dbName}'`);
      return []; // Return empty array instead of throwing error
    }

    const collection = db.collection<FlexibleDocument>(collectionName);
    
    // Get total count for logging/debugging
    const totalCount = await collection.countDocuments(filter);
    console.log(`Fetching ${Math.min(limit, totalCount)} documents from collection '${collectionName}' (total: ${totalCount})`);

    // Fetch documents with proper error handling
    const documents = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Validate and serialize documents
    const serializedDocs = documents
      .filter(doc => {
        // Filter out invalid documents
        if (!doc || !doc._id) {
          console.warn('Skipping document without valid _id:', doc);
          return false;
        }
        return true;
      })
      .map(doc => {
        try {
          // Safely serialize the document
          return {
            ...doc,
            _id: doc._id.toString(),
            // Handle potentially problematic fields
            ...Object.fromEntries(
              Object.entries(doc).map(([key, value]) => [
                key,
                // Handle special MongoDB types
                value instanceof ObjectId ? value.toString() :
                value instanceof Date ? value.toISOString() :
                value
              ])
            )
          };
        } catch (serializationError) {
          console.error('Error serializing document:', doc._id, serializationError);
          // Return a minimal document if serialization fails
          return {
            _id: doc._id.toString(),
            error: 'Serialization failed',
            originalId: doc._id.toString()
          };
        }
      });

    console.log(`Successfully fetched and serialized ${serializedDocs.length} documents`);
    return serializedDocs;

  } catch (error) {
    // Comprehensive error handling
    console.error('Error in getDocuments:', {
      collectionName,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Re-throw with more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Database request timed out. Please try again.');
      } else if (error.message.includes('auth')) {
        throw new Error('Database authentication failed. Please check your credentials.');
      } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
        throw new Error('Unable to connect to database. Please check your network connection.');
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }
    
    throw new Error('An unexpected error occurred while fetching documents.');
  }
});

// Additional helper function for getting collection statistics
export const getCollectionStats = cache(async function getCollectionStats(
  collectionName: string
): Promise<{
  count: number;
  size: number;
  avgObjSize: number;
  indexCount: number;
}> {
  if (!isValidCollectionName(collectionName)) {
    throw new Error('Invalid collection name.');
  }

  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB!);
    
    const stats = await db.command({ collStats: collectionName });
    
    return {
      count: stats.count || 0,
      size: stats.size || 0,
      avgObjSize: stats.avgObjSize || 0,
      indexCount: stats.nindexes || 0
    };
  } catch (error) {
    console.error('Error getting collection stats:', error);
    throw new Error('Failed to get collection statistics.');
  }
});

// Helper function for paginated queries
export const getDocumentsPaginated = cache(async function getDocumentsPaginated(
  collectionName: string,
  page: number = 1,
  pageSize: number = 25,
  sortField: string = '_id',
  sortDirection: 'asc' | 'desc' = 'asc',
  filter: Record<string, any> = {}
): Promise<{
  documents: FlexibleDocumentWithStringId[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}> {
  const skip = (page - 1) * pageSize;
  const sort = { [sortField]: sortDirection === 'asc' ? 1 : -1 };

  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB!);
    const collection = db.collection<FlexibleDocument>(collectionName);

    // Get total count and documents in parallel
    const [documents, totalCount] = await Promise.all([
      getDocuments(collectionName, { limit: pageSize, skip, sort: sort as Record<string, 1 | -1>, filter }),
      collection.countDocuments(filter)
    ]);

    return {
      documents,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageSize
    };
  } catch (error) {
    console.error('Error in getDocumentsPaginated:', error);
    throw error;
  }
});