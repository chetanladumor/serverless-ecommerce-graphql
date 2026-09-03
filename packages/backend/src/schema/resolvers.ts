import { GraphQLError } from "graphql";
import { GraphQLContext } from "../context";
import { hashPassword, generateToken } from "../services/authService";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const resolvers = {
  Query: {
    health: (_parent: unknown, _args: unknown, _context: GraphQLContext): string => {
      return "GraphQL Server is healthy & running 🚀";
    },
  },

  Mutation: {
    register: async (
      _parent: unknown,
      { input }: { input: RegisterInput },
      context: GraphQLContext
    ) => {
      const { name, email, password } = input;

      // 1. Validation
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

      // 2. Check if user already exists
      const existingUser = await context.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new GraphQLError("An account with this email already exists", {
          extensions: { code: "ALREADY_EXISTS" },
        });
      }

      // 3. Hash the password with bcrypt
      const hashedPassword = await hashPassword(password);

      // 4. Create user in PostgreSQL database via Prisma
      const user = await context.prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "CUSTOMER",
        },
      });

      // 5. Generate signed JWT token
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
  },
};
