/**
 * 単一プロセス用の超簡易 token bucket。
 * 複数 instance や持続性が要るなら upstash 等に差し替える前提。
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_KEYS = 10_000;

function gc(now: number) {
  if (buckets.size <= MAX_KEYS) return;
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): boolean {
  const now = Date.now();
  gc(now);
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return true;
  }
  if (b.count >= options.limit) {
    return false;
  }
  b.count += 1;
  return true;
}
