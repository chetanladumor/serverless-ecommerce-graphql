import { GraphQLError } from "graphql";
import { GraphQLContext } from "../context";
import { hashPassword, comparePassword, generateToken } from "../services/authService";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

export const resolvers = {
  Query: {
    health: (_parent: unknown, _args: unknown, _context: GraphQLContext): string => {
      return "GraphQL Server is healthy & running 🚀";
    },

    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.currentUser) {
        throw new GraphQLError("Authentication required. Please log in.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const user = await context.prisma.user.findUnique({
        where: { id: context.currentUser.id },
      });

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      };
    },

    products: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const prods = await context.prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      });

      return prods.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
        stock: p.stock,
        rating: p.rating,
        createdAt: p.createdAt.toISOString(),
      }));
    },
  },

  Mutation: {
    register: async (
      _parent: unknown,
      { input }: { input: RegisterInput },
      context: GraphQLContext
    ) => {
      const { name, email, password } = input;

      if (!name || name.trim().length === 0) {
        throw new GraphQLError("Name is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!email || !email.includes("@")) {
        throw new GraphQLError("Please provide a valid email address", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!password || password.length < 6) {
        throw new GraphQLError("Password must be at least 6 characters long", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await context.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new GraphQLError("An account with this email already exists", {
          extensions: { code: "ALREADY_EXISTS" },
        });
      }

      const hashedPassword = await hashPassword(password);

      const user = await context.prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "CUSTOMER",
        },
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
      };
    },

    login: async (
      _parent: unknown,
      { input }: { input: LoginInput },
      context: GraphQLContext
    ) => {
      const { email, password } = input;

      if (!email || !password) {
        throw new GraphQLError("Please provide both email and password", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const user = await context.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
      };
    },

    createProduct: async (
      _parent: unknown,
      { input }: { input: CreateProductInput },
      context: GraphQLContext
    ) => {
      // 1. Role-Based Access Control (RBAC) Guard
      if (!context.currentUser) {
        throw new GraphQLError("Authentication required. Please sign in.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (context.currentUser.role !== "ADMIN") {
        throw new GraphQLError("Forbidden. Admin access is required to create products.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const { title, description, price, category, imageUrl, stock } = input;

      // 2. Input validation
      if (!title || title.trim().length === 0) {
        throw new GraphQLError("Product title is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (price <= 0) {
        throw new GraphQLError("Product price must be greater than 0", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (stock < 0) {
        throw new GraphQLError("Stock cannot be negative", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // 3. Persist product to database
      const product = await context.prisma.product.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category: category.trim(),
          imageUrl: imageUrl.trim(),
          stock: Number(stock),
          rating: 5.0,
        },
      });

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        stock: product.stock,
        rating: product.rating,
        createdAt: product.createdAt.toISOString(),
      };
    },
  },
};
