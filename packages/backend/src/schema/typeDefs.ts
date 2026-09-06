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

  type CartItem {
    id: ID!
    userId: ID!
    productId: ID!
    quantity: Int!
    product: Product!
    createdAt: String!
    updatedAt: String!
  }

  type CartPayload {
    items: [CartItem!]!
    totalItems: Int!
    subtotal: Float!
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

  input ProductFilterInput {
    search: String
    category: String
    minPrice: Float
    maxPrice: Float
    sortBy: String # "price_asc" | "price_desc" | "rating_desc" | "newest"
  }

  input AddToCartInput {
    productId: ID!
    quantity: Int
  }

  input UpdateCartItemInput {
    cartItemId: ID!
    quantity: Int!
  }

  # --- Queries ---
  type Query {
    health: String!
    me: User
    products(filter: ProductFilterInput): [Product!]!
    categories: [String!]!
    product(id: ID!): Product
    cart: CartPayload!
  }

  # --- Mutations ---
  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createProduct(input: CreateProductInput!): Product!
    addToCart(input: AddToCartInput!): CartPayload!
    updateCartItem(input: UpdateCartItemInput!): CartPayload!
    removeFromCart(cartItemId: ID!): CartPayload!
    clearCart: Boolean!
  }
`;
