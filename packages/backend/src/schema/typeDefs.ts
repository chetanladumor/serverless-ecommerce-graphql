import gql from "graphql-tag";

export const typeDefs = gql`
  # --- Types ---
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # --- Inputs ---
  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  # --- Queries ---
  type Query {
    health: String!
  }

  # --- Mutations ---
  type Mutation {
    register(input: RegisterInput!): AuthPayload!
  }
`;
