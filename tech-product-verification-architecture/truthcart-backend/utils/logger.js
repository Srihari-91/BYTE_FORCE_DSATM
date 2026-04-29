// TruthCart Backend Logger
// Structured logging with timestamps, levels, and metrics tracking

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  constructor() {
    this.level = LOG_LEVELS.DEBUG;
    this.metrics = {
      totalRequests: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      averagePipelineTime: 0,
      totalPipelineTime: 0,
      redditFailures: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  _format(level, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    return [prefix, ...args];
  }

  debug(...args) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      console.debug(...this._format('DEBUG', ...args));
    }
  }

  info(...args) {
    if (this.level <= LOG_LEVELS.INFO) {
      console.info(...this._format('INFO', ...args));
    }
  }

  warn(...args) {
    if (this.level <= LOG_LEVELS.WARN) {
      console.warn(...this._format('WARN', ...args));
    }
  }

  error(...args) {
    if (this.level <= LOG_LEVELS.ERROR) {
      console.error(...this._format('ERROR', ...args));
    }
  }

  trackRequest() {
    this.metrics.totalRequests++;
  }

  trackAnalysis(success, durationMs) {
    if (success) {
      this.metrics.successfulAnalyses++;
    } else {
      this.metrics.failedAnalyses++;
    }
    this.metrics.totalPipelineTime += durationMs;
    this.metrics.averagePipelineTime = Math.round(
      this.metrics.totalPipelineTime / 
      (this.metrics.successfulAnalyses + this.metrics.failedAnalyses)
    );
  }

  trackReddit(success) {
    if (!success) this.metrics.redditFailures++;
  }

  trackCache(hit) {
    if (hit) this.metrics.cacheHits++;
    else this.metrics.cacheMisses++;
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0
        ? ((this.metrics.successfulAnalyses / this.metrics.totalRequests) * 100).toFixed(1) + '%'
        : 'N/A',
      averagePipelineTimeMs: this.metrics.averagePipelineTime,
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
        ? ((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100).toFixed(1) + '%'
        : 'N/A'
    };
  }

  // --- Audit Logging Methods ---

  logAudit(eventType, payload) {
    const timestamp = new Date().toISOString();
    const event = {
      audit: true,
      timestamp,
      event_type: eventType,
      payload
    };
    console.log(JSON.stringify(event));
  }

  logEngineDecision(engineName, dimension, findingsCount, durationMs, requestId, errorMessage = null) {
    this.logAudit('engine_decision', {
      request_id: requestId,
      engine: engineName,
      dimension,
      findings_count: findingsCount,
      duration_ms: durationMs,
      success: errorMessage === null,
      error: errorMessage
    });
  }

  logScoring(dimensionalBreakdown, finalScore, trace) {
    this.logAudit('scoring_decision', {
      dimensional_breakdown: dimensionalBreakdown,
      final_score: finalScore,
      trace: trace.slice(0, 20) // Limit trace length
    });
  }
}

export const logger = new Logger();
