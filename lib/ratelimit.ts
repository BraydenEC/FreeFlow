/*
  A zero-dependency, in-memory sliding-window rate limiter.

  HONEST LIMITATION — read this before trusting it.
  This limiter lives in the memory of a single serverless instance. On a
  platform like Vercel there can be many concurrent instances, and instances are
  recycled, so a determined attacker spreading requests across instances can
  exceed the nominal limit, and the counters reset on deploy. It is a genuine
  speed bump against casual abuse (a script hammering one warm instance, an
  accidental retry loop), not a hard guarantee.

  The real fix, when traffic justifies a new dependency and a backing service,
  is a shared store — @upstash/ratelimit + Upstash Redis. Documented as the
  upgrade path in docs/security/SECURITY_PLAN.md. Until then, per-call cost is
  already bounded (input length caps + max_tokens), so the worst case here is
  limited, and this limiter removes the easy abuse.

  The window is pure w.r.t. the injected `now`, so the logic is unit-testable
  without waiting on the clock.
*/

type Timestamps = number[];

const store = new Map<string, Timestamps>();

// Guards against unbounded growth of the key map on a long-lived instance.
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  /** Requests still allowed in the current window (0 when blocked). */
  remaining: number;
  /** Milliseconds until the oldest hit ages out (0 when allowed). */
  retryAfterMs: number;
};

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
  /** Injectable for tests; defaults to the wall clock. */
  now?: number;
};

/**
 * Record a hit for `key` and report whether it is within the limit.
 * Sliding window: a request is allowed when fewer than `limit` hits fall inside
 * the trailing `windowMs`.
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const { limit, windowMs } = opts;
  const now = opts.now ?? Date.now();

  const recent = (store.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    // Keep the pruned list so the map does not hold stale timestamps.
    store.set(key, recent);
    const oldest = recent[0];
    return { ok: false, remaining: 0, retryAfterMs: windowMs - (now - oldest) };
  }

  recent.push(now);
  store.set(key, recent);

  // Cheap sweep: if the map has grown large, drop keys whose windows are empty.
  if (store.size > MAX_KEYS) {
    for (const [k, ts] of store) {
      if (ts.length === 0 || now - ts[ts.length - 1] >= windowMs) store.delete(k);
    }
  }

  return { ok: true, remaining: limit - recent.length, retryAfterMs: 0 };
}

/** Test helper — clears all buckets. Not used in production paths. */
export function _resetRateLimit(): void {
  store.clear();
}

/**
 * A best-effort client identifier for rate limiting, from the proxy headers.
 * Falls back to a shared bucket when no IP is available, which fails safe: an
 * unknown client is throttled alongside every other unknown client rather than
 * getting its own unlimited bucket.
 */
export function clientKey(request: Request, scope: string): string {
  const fwd = request.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
