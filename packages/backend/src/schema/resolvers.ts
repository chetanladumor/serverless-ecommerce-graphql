import { GraphQLError } from "graphql";
import { GraphQLContext } from "../context";
import { hashPassword, comparePassword, generateToken } from "../services/authService";
import { getCache, setCache, invalidateCachePattern } from "../config/redis";
import type { Prisma } from "@prisma/client";

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

interface ProductFilterInput {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "rating_desc" | "newest";
}

interface AddToCartInput {
  productId: string;
  quantity?: number;
}

interface UpdateCartItemInput {
  cartItemId: string;
  quantity: number;
}

interface FormattedProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  rating: number;
  createdAt: string;
}

async function getCartPayload(userId: string, context: GraphQLContext) {
  const items = await context.prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Calculate totals by loading all products through DataLoader concurrently (batched in 1 query)
  let totalItems = 0;
  let subtotal = 0;

  const formattedItems = await Promise.all(
    items.map(async (item) => {
      totalItems += item.quantity;
      // All items call loader.load() in the same tick -> Batched in 1 SQL query!
      const product = await context.dataloaders.productLoader.load(item.productId);
      if (product) {
        subtotal += product.price * item.quantity;
      }

      return {
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        quantity: item.quantity,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      };
    })
  );

  return {
    items: formattedItems,
    totalItems,
    subtotal: Math.round(subtotal * 100) / 100,
  };
}

export const resolvers = {
  // --- Field Resolvers ---
  CartItem: {
    // Solves N+1 Problem: DataLoader batches product lookups into a single SQL query
    product: async (parent: { productId: string }, _args: unknown, context: GraphQLContext) => {
      const product = await context.dataloaders.productLoader.load(parent.productId);
      if (!product) {
        throw new GraphQLError("Associated product not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
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

  Query: {
    health: (_parent: unknown, _args: unknown, _context: GraphQLContext): string => {
      return "GraphQL Server is healthy & running 🚀";
    },

    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // 1. Check if user is authenticated from context
      if (!context.currentUser) {
        throw new GraphQLError("Authentication required. Please log in.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // 2. Fetch fresh user record from PostgreSQL
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

    products: async (
      _parent: unknown,
      { filter }: { filter?: ProductFilterInput },
      context: GraphQLContext
    ): Promise<FormattedProduct[]> => {
      const search = filter?.search?.trim() || "";
      const category = filter?.category?.trim() || "";
      const minPrice = filter?.minPrice ?? 0;
      const maxPrice = filter?.maxPrice ?? 999999;
      const sortBy = filter?.sortBy || "newest";

      // 1. Generate deterministic Redis Cache Key
      const cacheKey = `products:c_${category || "all"}:q_${search || "none"}:min_${minPrice}:max_${maxPrice}:s_${sortBy}`;

      // 2. Check Redis Cache
      const cached = await getCache<FormattedProduct[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // 3. Build Prisma Where Clause for dynamic filtering
      const where: Prisma.ProductWhereInput = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (category && category !== "All") {
        where.category = { equals: category, mode: "insensitive" };
      }

      if (filter?.minPrice !== undefined || filter?.maxPrice !== undefined) {
        where.price = {
          gte: minPrice,
          lte: maxPrice,
        };
      }

      // 4. Build Prisma OrderBy Clause
      let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
      if (sortBy === "price_asc") {
        orderBy = { price: "asc" };
      } else if (sortBy === "price_desc") {
        orderBy = { price: "desc" };
      } else if (sortBy === "rating_desc") {
        orderBy = { rating: "desc" };
      }

      // 5. Query PostgreSQL Database via Prisma
      const prods = await context.prisma.product.findMany({
        where,
        orderBy,
      });

      const formatted: FormattedProduct[] = prods.map((p) => ({
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

      // 6. Cache result in Redis for 60 seconds (TTL)
      await setCache(cacheKey, formatted, 60);

      return formatted;
    },

    categories: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<string[]> => {
      const cacheKey = "categories:distinct";
      const cached = await getCache<string[]>(cacheKey);
      if (cached) return cached;

      const prods = await context.prisma.product.findMany({
        select: { category: true },
        distinct: ["category"],
      });

      const cats = prods.map((p) => p.category).filter(Boolean);
      await setCache(cacheKey, cats, 300); // 5 minutes TTL
      return cats;
    },

    product: async (
      _parent: unknown,
      { id }: { id: string },
      context: GraphQLContext
    ): Promise<FormattedProduct | null> => {
      const cacheKey = `product:${id}`;
      const cached = await getCache<FormattedProduct>(cacheKey);
      if (cached) return cached;

      const p = await context.prisma.product.findUnique({
        where: { id },
      });

      if (!p) return null;

      const formatted: FormattedProduct = {
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
        stock: p.stock,
        rating: p.rating,
        createdAt: p.createdAt.toISOString(),
      };

      await setCache(cacheKey, formatted, 120);
      return formatted;
    },

    cart: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.currentUser) {
        throw new GraphQLError("Authentication required. Please sign in to view your cart.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      return getCartPayload(context.currentUser.id, context);
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

    login: async (
      _parent: unknown,
      { input }: { input: LoginInput },
      context: GraphQLContext
    ) => {
      const { email, password } = input;

      // 1. Validation
      if (!email || !password) {
        throw new GraphQLError("Please provide both email and password", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // 2. Find user in database
      const user = await context.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // 3. Verify bcrypt password hash
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // 4. Generate signed JWT token
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

      // 4. Invalidate Redis caches so search and category queries get fresh data
      await invalidateCachePattern("products:*");
      await invalidateCachePattern("categories:*");

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

    addToCart: async (
      _parent: unknown,
      { input }: { input: AddToCartInput },
      context: GraphQLContext
    ) => {
      if (!context.currentUser) {
        throw new GraphQLError("Please sign in to add items to your cart", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const { productId } = input;
      const addQty = input.quantity && input.quantity > 0 ? input.quantity : 1;

      // Check product stock via DataLoader
      const product = await context.dataloaders.productLoader.load(productId);
      if (!product) {
        throw new GraphQLError("Product not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (product.stock < addQty) {
        throw new GraphQLError(`Insufficient stock. Only ${product.stock} units available.`, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Upsert cart item (increment quantity if already exists)
      const existing = await context.prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: context.currentUser.id,
            productId,
          },
        },
      });

      if (existing) {
        const newQty = existing.quantity + addQty;
        if (newQty > product.stock) {
          throw new GraphQLError(`Cannot add more. Reached maximum available stock (${product.stock}).`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        await context.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQty },
        });
      } else {
        await context.prisma.cartItem.create({
          data: {
            userId: context.currentUser.id,
            productId,
            quantity: addQty,
          },
        });
      }

      return getCartPayload(context.currentUser.id, context);
    },

    updateCartItem: async (
      _parent: unknown,
      { input }: { input: UpdateCartItemInput },
      context: GraphQLContext
    ) => {
      if (!context.currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const { cartItemId, quantity } = input;

      const item = await context.prisma.cartItem.findUnique({
        where: { id: cartItemId },
      });

      if (!item || item.userId !== context.currentUser.id) {
        throw new GraphQLError("Cart item not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // If quantity is 0 or negative, remove the item
      if (quantity <= 0) {
        await context.prisma.cartItem.delete({
          where: { id: cartItemId },
        });
      } else {
        const product = await context.dataloaders.productLoader.load(item.productId);
        if (product && quantity > product.stock) {
          throw new GraphQLError(`Requested quantity exceeds available stock (${product.stock}).`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        await context.prisma.cartItem.update({
          where: { id: cartItemId },
          data: { quantity },
        });
      }

      return getCartPayload(context.currentUser.id, context);
    },

    removeFromCart: async (
      _parent: unknown,
      { cartItemId }: { cartItemId: string },
      context: GraphQLContext
    ) => {
      if (!context.currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const item = await context.prisma.cartItem.findUnique({
        where: { id: cartItemId },
      });

      if (item && item.userId === context.currentUser.id) {
        await context.prisma.cartItem.delete({
          where: { id: cartItemId },
        });
      }

      return getCartPayload(context.currentUser.id, context);
    },

    clearCart: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<boolean> => {
      if (!context.currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      await context.prisma.cartItem.deleteMany({
        where: { userId: context.currentUser.id },
      });

      return true;
    },
  },
};
