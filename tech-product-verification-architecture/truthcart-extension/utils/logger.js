// TruthCart Logging System
// Structured logging for extraction success rates, API latency, and error tracking

const LOG_PREFIX = '[TruthCart]';

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  constructor() {
    this.level = LogLevel.DEBUG;
    this.metrics = {
      extractionAttempts: 0,
      extractionSuccesses: 0,
      apiCalls: 0,
      apiFailures: 0,
      apiLatencies: [],
      cacheHits: 0,
      cacheMisses: 0,
      redditFetchTimes: [],
      errors: []
    };
    this.enabled = true;
  }

  setLevel(level) {
    this.level = level;
  }

  debug(...args) {
    if (this.enabled && this.level <= LogLevel.DEBUG) {
      console.debug(`${LOG_PREFIX}[DEBUG]`, ...args);
    }
  }

  info(...args) {
    if (this.enabled && this.level <= LogLevel.INFO) {
      console.info(`${LOG_PREFIX}[INFO]`, ...args);
    }
  }

  warn(...args) {
    if (this.enabled && this.level <= LogLevel.WARN) {
      console.warn(`${LOG_PREFIX}[WARN]`, ...args);
    }
  }

  error(...args) {
    if (this.enabled && this.level <= LogLevel.ERROR) {
      console.error(`${LOG_PREFIX}[ERROR]`, ...args);
      this.metrics.errors.push({
        timestamp: Date.now(),
        message: args.map(a => String(a)).join(' ')
      });
      // Keep only last 100 errors
      if (this.metrics.errors.length > 100) {
        this.metrics.errors.shift();
      }
    }
  }

  trackExtraction(success) {
    this.metrics.extractionAttempts++;
    if (success) {
      this.metrics.extractionSuccesses++;
    }
    this.debug(`Extraction success rate: ${(this.metrics.extractionSuccesses / this.metrics.extractionAttempts * 100).toFixed(1)}%`);
  }

  trackApiCall(latencyMs, success) {
    this.metrics.apiCalls++;
    if (!success) {
      this.metrics.apiFailures++;
    }
    this.metrics.apiLatencies.push(latencyMs);
    if (this.metrics.apiLatencies.length > 100) {
      this.metrics.apiLatencies.shift();
    }
  }

  trackCache(hit) {
    if (hit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  trackRedditFetch(latencyMs) {
    this.metrics.redditFetchTimes.push(latencyMs);
    if (this.metrics.redditFetchTimes.length > 50) {
      this.metrics.redditFetchTimes.shift();
    }
  }

  getAverageApiLatency() {
    if (this.metrics.apiLatencies.length === 0) return 0;
    const sum = this.metrics.apiLatencies.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.apiLatencies.length);
  }

  getMetrics() {
    return {
      ...this.metrics,
      extractionSuccessRate: this.metrics.extractionAttempts > 0
        ? (this.metrics.extractionSuccesses / this.metrics.extractionAttempts * 100).toFixed(1) + '%'
        : 'N/A',
      averageApiLatency: this.getAverageApiLatency() + 'ms',
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(1) + '%'
        : 'N/A'
    };
  }
}

// Singleton
const logger = new Logger();

if (typeof window !== 'undefined') {
  window.TruthCartUtils = window.TruthCartUtils || {};
  window.TruthCartUtils.logger = logger;
}
