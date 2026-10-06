/**
 * @file reviewCache.js
 * In-memory cache layer for normalized Google Reviews with TTL,
 * stale-while-revalidate readiness, and future Redis drop-in compatibility.
 */

class MemoryReviewCache {
  constructor(options = {}) {
    this.ttlMs = Number(options.ttlMs || process.env.REVIEWS_CACHE_TTL_MS) || 15 * 60 * 1000; // 15 mins default
    this.maxEntries = Number(options.maxEntries) || 100;
    this.store = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      lastInvalidatedAt: null,
      lastSetAt: null,
    };
  }

  /**
   * Internal garbage collection of expired entries
   */
  _evictExpired() {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now - item.timestamp > item.ttlMs * 2) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Check if an entry exists and is fresh
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    const item = this.store.get(key);
    if (!item) return false;
    return Date.now() - item.timestamp <= item.ttlMs;
  }

  /**
   * Check if entry is stale (ready for background refresh)
   * @param {string} key
   * @returns {boolean}
   */
  isStale(key) {
    const item = this.store.get(key);
    if (!item) return true;
    return Date.now() - item.timestamp > item.ttlMs;
  }

  /**
   * Retrieve cached value (Redis-compatible async contract)
   * @param {string} key
   * @param {boolean} [allowStale=false]
   * @returns {Promise<any|null>}
   */
  async get(key, allowStale = false) {
    const item = this.store.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    const isExpired = Date.now() - item.timestamp > item.ttlMs;
    if (isExpired && !allowStale) {
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  /**
   * Save value to cache with TTL
   * @param {string} key
   * @param {any} value
   * @param {number} [customTtlMs]
   * @returns {Promise<boolean>}
   */
  async set(key, value, customTtlMs) {
    this._evictExpired();

    // Capacity eviction: remove oldest if exceeding max entries
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    const ttl = customTtlMs && customTtlMs > 0 ? customTtlMs : this.ttlMs;
    this.store.set(key, {
      value,
      timestamp: Date.now(),
      ttlMs: ttl,
    });

    this.stats.lastSetAt = new Date().toISOString();
    return true;
  }

  /**
   * Delete specific key (manual refresh support)
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async del(key) {
    const existed = this.store.delete(key);
    if (existed) {
      this.stats.lastInvalidatedAt = new Date().toISOString();
    }
    return existed;
  }

  /**
   * Invalidate key (alias for del)
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async invalidate(key) {
    return this.del(key);
  }

  /**
   * Clear all cached reviews
   * @returns {Promise<void>}
   */
  async clear() {
    this.store.clear();
    this.stats.lastInvalidatedAt = new Date().toISOString();
  }

  /**
   * Get diagnostic statistics
   * @returns {{ hits: number, misses: number, size: number, lastInvalidatedAt: string|null, lastSetAt: string|null }}
   */
  getStats() {
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.store.size,
      lastInvalidatedAt: this.stats.lastInvalidatedAt,
      lastSetAt: this.stats.lastSetAt,
      ttlMs: this.ttlMs,
    };
  }
}

// Global singleton to prevent duplicate cache across hot-reloads
const globalForCache = globalThis;
if (!globalForCache.__googleReviewCache) {
  globalForCache.__googleReviewCache = new MemoryReviewCache();
}

/** @type {MemoryReviewCache} */
export const reviewCache = globalForCache.__googleReviewCache;
export default reviewCache;
