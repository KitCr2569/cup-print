type RateLimitRecord = { count: number; resetAt: number };
const records = new Map<string, RateLimitRecord>();
export interface RateLimitResult { isAllowed: boolean; retryAfterSeconds: number }
export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const record = records.get(key);
  if (!record || record.resetAt <= now) {
    records.set(key, { count: 1, resetAt: now + windowMs });
    return { isAllowed: true, retryAfterSeconds: 0 };
  }
  if (record.count >= limit) return { isAllowed: false, retryAfterSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)) };
  record.count += 1;
  return { isAllowed: true, retryAfterSeconds: 0 };
}
export function clearRateLimit(key: string) { records.delete(key); }
