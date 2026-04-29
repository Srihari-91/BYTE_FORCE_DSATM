// Analysis Cache Layer
// localStorage-backed cache for analysis results
// Uses fingerprint as key, includes TTL-based expiration

const Cache = {
  STORAGE_KEY: 'truthcart_analysis_cache',
  DEFAULT_TTL: 24 * 60 * 60 * 1000, // 24 hours in ms
  MAX_ENTRIES: 50,

  /**
   * Get cached analysis by fingerprint
   * @param {string} fingerprint - Product fingerprint
   * @returns {Object|null} Cached analysis or null
   */
  get(fingerprint) {
    if (!fingerprint) return null;

    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;

      const cache = JSON.parse(raw);
      const entry = cache[fingerprint];

      if (!entry) return null;

      // Check TTL
      if (Date.now() - entry.timestamp > (entry.ttl || this.DEFAULT_TTL)) {
        // Expired - remove it
        delete cache[fingerprint];
        this._save(cache);
        return null;
      }

      return entry.data;
    } catch (e) {
      return null;
    }
  },

  /**
   * Store analysis result in cache
   * @param {string} fingerprint - Product fingerprint
   * @param {Object} data - Analysis result
   * @param {number} ttl - Time to live in ms (optional)
   */
  set(fingerprint, data, ttl) {
    if (!fingerprint || !data) return;

    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const cache = raw ? JSON.parse(raw) : {};

      // Add new entry
      cache[fingerprint] = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.DEFAULT_TTL
      };

      // Prune old entries if exceeding max
      const keys = Object.keys(cache);
      if (keys.length > this.MAX_ENTRIES) {
        // Remove oldest entries
        const sorted = keys.sort((a, b) => 
          (cache[a].timestamp || 0) - (cache[b].timestamp || 0)
        );
        const toRemove = sorted.slice(0, keys.length - this.MAX_ENTRIES);
        toRemove.forEach(k => delete cache[k]);
      }

      this._save(cache);
    } catch (e) {
      // localStorage might be full, try to clear and retry
      try {
        localStorage.removeItem(this.STORAGE_KEY);
        this.set(fingerprint, data, ttl);
      } catch (e2) {
        console.warn('[TruthCart] Cache write failed, storage may be full');
      }
    }
  },

  /**
   * Check if fingerprint exists and is valid
   */
  has(fingerprint) {
    return this.get(fingerprint) !== null;
  },

  /**
   * Clear all cached analyses
   */
  clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  },

  /**
   * Get cache statistics
   */
  getStats() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return { entries: 0, size: 0 };

      const cache = JSON.parse(raw);
      const entries = Object.keys(cache).length;
      const size = new Blob([raw]).size;

      return { entries, size };
    } catch (e) {
      return { entries: 0, size: 0 };
    }
  },

  /**
   * Remove expired entries
   */
  cleanup() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;

      const cache = JSON.parse(raw);
      let modified = false;

      for (const [key, entry] of Object.entries(cache)) {
        if (Date.now() - entry.timestamp > (entry.ttl || this.DEFAULT_TTL)) {
          delete cache[key];
          modified = true;
        }
      }

      if (modified) {
        this._save(cache);
      }
    } catch (e) {
      // Ignore
    }
  },

  /**
   * Save cache to localStorage
   */
  _save(cache) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
    } catch (e) {
      // Storage full
      console.warn('[TruthCart] Failed to save cache:', e.message);
    }
  }
};

// Run cleanup periodically
if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.Cache = Cache;

  // Cleanup on load
  setTimeout(() => Cache.cleanup(), 5000);
}
