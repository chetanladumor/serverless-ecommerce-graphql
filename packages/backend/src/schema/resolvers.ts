import { GraphQLContext } from "../context";

export const resolvers = {
  Query: {
    health: (_parent: unknown, _args: unknown, _context: GraphQLContext): string => {
      return "GraphQL Server is healthy & running 🚀";
    },
  },
};
