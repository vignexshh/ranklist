  import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs, resolvers } from '@/lib/graphql/schema';
import { NextRequest } from 'next/server';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    // Parse JSON body if not automatically parsed
    let body;
    try {
      body = await req.json(); // ✅ This parses the request body
    } catch {
      body = null;
    }

    return { req, body }; // add anything else you want into context
  }
});

export const POST = handler;
export const GET = handler;
