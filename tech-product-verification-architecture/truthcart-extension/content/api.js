// API Communication Layer
// Handles all communication with the TruthCart backend
// Includes AbortController support for cancellation and retry logic

const API = {
  _pendingRequest: null,
  _abortController: null,

  /**
   * Send product data to backend for analysis
   * @param {string} baseUrl - Backend API base URL
   * @param {Object} payload - { product, confidence, fingerprint }
   * @param {AbortSignal} signal - AbortController signal
   * @returns {Promise<Object>} Analysis result
   */
  async analyze(baseUrl, payload, signal) {
    // Cancel any pending request
    this.cancelPending();

    this._abortController = new AbortController();
    
    // Merge external signal with internal
    const combinedSignal = signal 
      ? this._combineSignals(signal, this._abortController.signal)
      : this._abortController.signal;

    const url = `${baseUrl}/analyze`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TruthCart-Version': '1.0.0',
          'X-TruthCart-Client': 'chrome-extension'
        },
        body: JSON.stringify({
          product: payload.product,
          confidence: payload.confidence,
          fingerprint: payload.fingerprint,
          metadata: {
            url: window.location.href,
            platform: payload.product.source,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        }),
        signal: combinedSignal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw err; // Re-throw abort errors
      }
      
      // Network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('Cannot connect to TruthCart backend. Is the server running?');
      }

      throw err;
    } finally {
      this._abortController = null;
    }
  },

  /**
   * Cancel any in-flight request
   */
  cancelPending() {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
  },

  /**
   * Send a chat question about the product analysis
   * @param {string} baseUrl - Backend API base URL
   * @param {string} question - User's question
   * @param {Object} analysis - Current analysis context
   * @param {Object} product - Current product data
   * @returns {Promise<Object>} Chat response with answer
   */
  async chat(baseUrl, question, analysis, product) {
    const url = `${baseUrl}/chat`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TruthCart-Version': '1.0.0',
          'X-TruthCart-Client': 'chrome-extension'
        },
        body: JSON.stringify({
          question,
          analysis,
          product
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Chat API returned ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('Cannot connect to TruthCart backend for chat.');
      }
      throw err;
    }
  },

  /**
   * Check backend health
   * @param {string} baseUrl
   * @returns {Promise<boolean>}
   */
  async healthCheck(baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3s timeout
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Combine multiple AbortSignals
   */
  _combineSignals(signal1, signal2) {
    const controller = new AbortController();
    
    const onAbort = () => {
      controller.abort();
      signal1.removeEventListener('abort', onAbort);
      signal2.removeEventListener('abort', onAbort);
    };

    if (signal1.aborted || signal2.aborted) {
      controller.abort();
    } else {
      signal1.addEventListener('abort', onAbort);
      signal2.addEventListener('abort', onAbort);
    }

    return controller.signal;
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.API = API;
}
