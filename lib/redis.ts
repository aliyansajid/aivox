import Redis from "ioredis";

const getRedisClient = () => {
  if (process.env.REDIS_URL) {
    const client = new Redis(process.env.REDIS_URL);
    client.on("error", (err) => console.error("Redis Client Error", err));
    return client;
  }
  return null;
};

// Global singleton to prevent multiple connections in dev
const globalForRedis = global as unknown as { redis: Redis | null };

export const redis = globalForRedis.redis || getRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
