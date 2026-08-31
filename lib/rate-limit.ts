/**
 * Rate Limiting Utility (Upstash Redis + In-Memory Dev Fallback)
 * Based on TechSpec Section 6.4 & PRD Section 13.3
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let redis: Redis | null = null;
if (hasUpstash) {
  try {
    redis = Redis.fromEnv();
  } catch (err) {
    console.warn("Upstash Redis initialization warning:", err);
  }
}

// In-memory sliding window fallback for local development without Redis
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
  }

  async limit(identifier: string): Promise<{ success: boolean; reset: number }> {
    const now = Date.now();
    const timestamps = (this.requests.get(identifier) || []).filter(
      (time) => now - time < this.windowMs
    );

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const resetSeconds = Math.ceil((oldest + this.windowMs - now) / 1000);
      return { success: false, reset: Math.max(1, resetSeconds) };
    }

    timestamps.push(now);
    this.requests.set(identifier, timestamps);
    return { success: true, reset: Math.ceil(this.windowMs / 1000) };
  }
}

interface RateLimiterInterface {
  limit: (identifier: string) => Promise<{ success: boolean; reset: number }>;
}

// 1. Create Link Rate Limiter: 20 req / 1 min
export const createLinkRateLimit: RateLimiterInterface =
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        prefix: "ratelimit:create-link",
      })
    : new InMemoryRateLimiter(20, 60);

// 2. Redirect Rate Limiter: 100 req / 1 min
export const redirectRateLimit: RateLimiterInterface =
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        prefix: "ratelimit:redirect",
      })
    : new InMemoryRateLimiter(100, 60);

// 3. Auth Rate Limiter: 5 req / 1 min
export const authRateLimit: RateLimiterInterface =
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "ratelimit:auth",
      })
    : new InMemoryRateLimiter(5, 60);
