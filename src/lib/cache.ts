const CACHE_PREFIX = "tpi_cache_";
const DEFAULT_TTL = 2 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() + ttl };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch { /* quota exceeded, ignore */ }
}

export function isCacheStale(key: string): boolean {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return true;
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() > entry.timestamp;
  } catch {
    return true;
  }
}

export function clearCache(key: string): void {
  try { localStorage.removeItem(CACHE_PREFIX + key); } catch { /* ignore */ }
}

export function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: { ttl?: number; force?: boolean }
): Promise<T> {
  const ttl = opts?.ttl ?? DEFAULT_TTL;
  const force = opts?.force ?? false;

  if (!force) {
    const cached = getCached<T>(key);
    const stale = isCacheStale(key);

    if (cached && !stale) {
      return Promise.resolve(cached);
    }

    if (cached) {
      fetcher().then((fresh) => setCache(key, fresh, ttl)).catch(() => {});
      return Promise.resolve(cached);
    }
  }

  return fetcher().then((fresh) => {
    setCache(key, fresh, ttl);
    return fresh;
  });
}
