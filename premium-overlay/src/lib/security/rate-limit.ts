/**
 * Re-export for modular path: `@/lib/security/rate-limit`
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "~/env";

export type RateLimitInput = Readonly<{
  action: string;
  identifier: string;
  ip: string;
  limit?: number;
  windowSeconds?: number;
}>;

export type RateLimitResult = Readonly<{
  ok: boolean;
  remaining: number;
  reset: number;
}>;

const DEFAULT_LIMIT: number = 5;
const DEFAULT_WINDOW_SECONDS: number = 60;

let redis: Redis | null = null;
let limiter: Ratelimit | null = null;
if (env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN) {
  redis = new Redis({ url: env.UPSTASH_REDIS_URL, token: env.UPSTASH_REDIS_TOKEN });
  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(DEFAULT_LIMIT, `${DEFAULT_WINDOW_SECONDS} s`),
  });
}

// Simple in-memory fallback limiter (process-scoped; fine for dev)
const memory = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limit helper using Upstash sliding window.
 */
export async function rateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const limit: number = input.limit ?? DEFAULT_LIMIT;
  const windowSeconds: number = input.windowSeconds ?? DEFAULT_WINDOW_SECONDS;
  const key: string = `rl:${input.action}:${input.identifier}:${input.ip}`;

  // Upstash path
  if (limiter && redis) {
    if (limit !== DEFAULT_LIMIT || windowSeconds !== DEFAULT_WINDOW_SECONDS) {
      const temp = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      });
      const res = await temp.limit(key);
      return { ok: res.success, remaining: res.remaining, reset: res.reset };
    }
    const res = await limiter.limit(key);
    return { ok: res.success, remaining: res.remaining, reset: res.reset };
  }

  // In-memory fallback
  const now = Date.now();
  const winMs = windowSeconds * 1000;
  const item = memory.get(key);
  if (!item || now >= item.resetAt) {
    memory.set(key, { count: 1, resetAt: now + winMs });
    return { ok: true, remaining: limit - 1, reset: Math.floor((now + winMs) / 1000) };
  }
  if (item.count < limit) {
    item.count += 1;
    return { ok: true, remaining: limit - item.count, reset: Math.floor(item.resetAt / 1000) };
  }
  return { ok: false, remaining: 0, reset: Math.floor(item.resetAt / 1000) };
}
