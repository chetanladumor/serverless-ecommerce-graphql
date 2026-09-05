import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined;
}

export const redis =
  globalThis.redisClient ||
  new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) return null; // stop retrying after 3 failed attempts
      return Math.min(times * 200, 1000);
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.redisClient = redis;
}

// Connect gracefully
redis.connect().catch((err) => {
  console.warn("⚠️ Redis connection note:", err.message);
});

redis.on("connect", () => {
  console.log("⚡ Redis Cache Connected successfully");
});

redis.on("error", (err) => {
  console.warn("⚠️ Redis Client Error:", err.message);
});

/**
 * Gets cached data by key.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Sets data in cache with a TTL in seconds.
 */
export async function setCache(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await redis.set(key, serialized, "EX", ttlSeconds);
  } catch (err) {
    console.warn(`Failed to set Redis cache for key ${key}:`, err);
  }
}

/**
 * Invalidates cache by pattern or prefix (e.g. "products:*").
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🧹 Cleared ${keys.length} cached keys matching "${pattern}"`);
    }
  } catch (err) {
    console.warn(`Failed to invalidate cache pattern ${pattern}:`, err);
  }
}
