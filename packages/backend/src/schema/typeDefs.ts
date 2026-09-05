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

  type Product {
    id: ID!
    title: String!
    description: String!
    price: Float!
    category: String!
    imageUrl: String!
    stock: Int!
    rating: Float!
    createdAt: String!
  }

  # --- Inputs ---
  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateProductInput {
    title: String!
    description: String!
    price: Float!
    category: String!
    imageUrl: String!
    stock: Int!
  }

  # --- Queries ---
  type Query {
    health: String!
    me: User
    products: [Product!]!
  }

  # --- Mutations ---
  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createProduct(input: CreateProductInput!): Product!
  }
`;
