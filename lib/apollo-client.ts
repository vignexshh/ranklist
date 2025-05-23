import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "/api/graphql", // Make sure this matches your API route
  cache: new InMemoryCache(),
});

export default client;
