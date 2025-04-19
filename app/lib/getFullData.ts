import clientPromise from "@/app/lib/mongodb";

export async function getFullData() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB!);
  const collection = db.collection(process.env.MONGODB_COLLECTION!);

  //aggregation pipeline
  const pipeline = [
    {
      $project: {
        _id: 0, // Exclude the _id field
        allFields: { $objectToArray: "$$ROOT" }, // Convert document fields to key-value pairs
      },
    },
    { $unwind: "$allFields" }, // Flatten the key-value pairs
    {
      $group: {
        _id: "$allFields.k", // Group by field name (key)
        distinctValues: { $addToSet: "$allFields.v" }, // Collect distinct values for each field
      },
    },
  ];

  const result = await collection.aggregate(pipeline).toArray();

  // Convert the aggregation result into a key-value object
  const distinctValues: Record<string, any[]> = {};
  result.forEach((field) => {
    distinctValues[field._id] = field.distinctValues;
  });

  return distinctValues;
}
// return await collection.find({}).toArray();
// return await collection.distinct("listCategory");
