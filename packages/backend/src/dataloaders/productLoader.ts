import DataLoader from "dataloader";
import { PrismaClient, Product } from "@prisma/client";

/**
 * Creates a per-request DataLoader for batching and caching Product lookups.
 * Solves the GraphQL N+1 problem:
 * Instead of N individual `findUnique({ where: { id } })` queries,
 * it combines all requested IDs into a single `findMany({ where: { id: { in: ids } } })`.
 */
export function createProductLoader(prisma: PrismaClient) {
  return new DataLoader<string, Product | null>(async (productIds: readonly string[]) => {
    // 1. Single batch database query for all IDs
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: [...productIds],
        },
      },
    });

    // 2. Map results by product ID for constant time lookup
    const productMap = new Map<string, Product>();
    products.forEach((product) => {
      productMap.set(product.id, product);
    });

    // 3. Return products in the exact order of requested IDs
    return productIds.map((id) => productMap.get(id) || null);
  });
}
