// TruthCart Backend Cache
// In-memory Map-based cache with TTL support

class Cache {
  constructor() {
    this._store = new Map();
    this._cleanupInterval = null;
  }

  /**
   * Start periodic cleanup of expired entries
   * @param {number} intervalMs - Cleanup interval in ms
   */
  startCleanup(intervalMs = 60000) {
    if (this._cleanupInterval) return;
    this._cleanupInterval = setInterval(() => this.cleanup(), intervalMs);
  }

  /**
   * Stop cleanup timer
   */
  stopCleanup() {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }
  }

  /**
   * Get a cached value
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a cached value
   * @param {string} key
   * @param {*} value
   * @param {number} ttlMs - Time to live in milliseconds
   */
  set(key, value, ttlMs = 86400000) {
    this._store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now()
    });

    // Prune if too large
    if (this._store.size > 1000) {
      this._pruneOldest();
    }
  }

  /**
   * Check if key exists and is valid
   */
  has(key) {
    const entry = this._store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete a key
   */
  delete(key) {
    return this._store.delete(key);
  }

  /**
   * Clear all entries
   */
  clear() {
    this._store.clear();
  }

  /**
   * Get cache size
   */
  get size() {
    return this._store.size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let expired = 0;
    let valid = 0;
    const now = Date.now();

    for (const [, entry] of this._store) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      totalEntries: this._store.size,
      validEntries: valid,
      expiredEntries: expired
    };
  }

  /**
   * Remove all expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this._store) {
      if (now > entry.expiresAt) {
        this._store.delete(key);
      }
    }
  }

  /**
   * Remove oldest entries when cache is too large
   */
  _pruneOldest(count = 100) {
    const entries = Array.from(this._store.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt);

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this._store.delete(entries[i][0]);
    }
  }
}

export const analysisCache = new Cache();
analysisCache.startCleanup();
