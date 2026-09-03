import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import dotenv from "dotenv";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./schema/resolvers";
import { buildContext, GraphQLContext } from "./context";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

async function startServer() {
  await server.start();

  // Express middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint for standard HTTP monitoring
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", message: "Express server is running 🚀" });
  });

  // Mount Apollo GraphQL middleware on /graphql (and / for convenience)
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => buildContext(req),
    })
  );

  app.use(
    "/",
    expressMiddleware(server, {
      context: async ({ req }) => buildContext(req),
    })
  );

  const port = Number(process.env.PORT) || 4000;
  httpServer.listen(port, () => {
    console.log(`🚀 Express Server running at: http://localhost:${port}`);
    console.log(`🎮 GraphQL Endpoint: http://localhost:${port}/graphql`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Express GraphQL server:", err);
});
