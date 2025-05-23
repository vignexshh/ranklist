import { gql } from "graphql-tag";
import { GraphQLJSON } from "graphql-scalars";
import clientPromise from "../mongodb";

export const typeDefs = gql`
  scalar JSON

  type Allotment {
    _id: ID!
    listCategory: String!
    listSubCategory: String!
    otherFields: JSON
  }

  type Query {
    allotments(limit: Int, skip: Int): [Allotment!]!
  }
`;

export const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    allotments: async (_: any, args: any) => {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB!);

      const { limit = 10, skip = 0 } = args;

      const docs = await db.collection(process.env.MONGODB_COLLECTION!)
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();

      return docs.map((doc: any) => {
        const { _id, listCategory, listSubCategory, ...others } = doc;
        return {
          _id,
          listCategory,
          listSubCategory,
          otherFields: others,
        };
      });
    },
  },
};
