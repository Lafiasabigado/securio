type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const buckets = new Map<string, Bucket>();

function prune(now: number): void {
  if (buckets.size < 2_000) {
    return;
  }
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

/**
 * Best-effort per-isolate limiter. Serverless instances do not share memory;
 * pair with an edge firewall for a hard global cap.
 */
export function consumeRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
} {
  const now = Date.now();
  prune(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }

  if (bucket.count >= MAX_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt, limit: MAX_PER_WINDOW };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: MAX_PER_WINDOW - bucket.count,
    resetAt: bucket.resetAt,
    limit: MAX_PER_WINDOW,
  };
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimitHeaders(result: ReturnType<typeof consumeRateLimit>): Record<string, string> {
  const retryAfterSeconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed ? {} : { "Retry-After": String(retryAfterSeconds) }),
  };
}
