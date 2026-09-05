import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not defined. Copy .env.example to .env and set DATABASE_URL."
  );
}

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    maxUses: 7_500, // recycle connections to avoid long-lived pg sockets
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

// Cache the singleton in production too (prevents a fresh Pool + PrismaClient
// on every cold start, which exhausts Postgres connections). Only skip caching
// in development so HMR/fast-refresh can re-instantiate cleanly.
if (process.env.NODE_ENV !== "development") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
