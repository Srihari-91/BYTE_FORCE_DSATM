// TruthCart Content Script — Main Orchestrator
// Coordinates: detection → extraction → cache check → API call → overlay render

(async function () {
  'use strict';

  // Avoid double-injection
  if (window.__TruthCartInitialized) return;
  window.__TruthCartInitialized = true;

  const { ProductDetector, PageObserver, ProductExtractor, Normalizer, 
          Fingerprint, Confidence, Cache, API, Overlay } = window.TruthCart;
  const { logger } = window.TruthCartUtils;

  // Configuration
  const CONFIG = {
    API_BASE_URL: 'http://localhost:3001',
    DEBOUNCE_MS: 400,
    MAX_RETRIES: 2
  };

  let abortController = null;
  let currentAnalysis = null;
  let currentProduct = null;

  /**
   * Main pipeline: detect → extract → analyze → render
   */
  async function runPipeline() {
    logger.info('Pipeline started');

    // Step 1: Detect if product page
    const detection = ProductDetector.detect();
    logger.info('Detection result:', detection);

    if (!detection.isProduct) {
      logger.debug('Not a product page, skipping');
      return;
    }

    // Step 2: Extract product data
    const startExtraction = performance.now();
    const rawProduct = ProductExtractor.extract(detection.platform);
    logger.trackExtraction(!!rawProduct);

    // Store product name for Reddit redirect
    const productTitle = rawProduct?.title || document.querySelector("#productTitle")?.innerText || '';
    window.__TRUTHCART_PRODUCT__ = productTitle;

    if (!rawProduct || !rawProduct.title) {
      logger.warn('Extraction failed: no product data found');
      return;
    }

    // Step 3: Normalize
    const product = Normalizer.normalize(rawProduct, detection.platform);

    // Step 4: Calculate confidence
    const extractionConfidence = Confidence.calculate(product);
    logger.debug('Extraction confidence:', extractionConfidence);

    // Step 5: Generate fingerprint
    const fingerprint = Fingerprint.generate(product);
    logger.debug('Fingerprint:', fingerprint);

    // Step 6: Check cache
    const cached = Cache.get(fingerprint);
    if (cached) {
      logger.trackCache(true);
      logger.info('Cache hit, using cached analysis');
      Overlay.render(cached, product);
      return;
    }
    logger.trackCache(false);

    // Step 7: Call backend API
    // Cancel any in-flight request
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    const apiStart = performance.now();
    try {
      const analysis = await API.analyze(
        CONFIG.API_BASE_URL, 
        { product, confidence: extractionConfidence, fingerprint },
        abortController.signal
      );

      const apiLatency = Math.round(performance.now() - apiStart);
      logger.trackApiCall(apiLatency, true);
      logger.info('API response received in', apiLatency + 'ms');

      // Cache the result
      Cache.set(fingerprint, analysis);

      // Store for later use (chat, debugging, etc.)
      currentAnalysis = analysis;
      currentProduct = product;

      // Step 8: Render overlay
      Overlay.render(analysis, product);

    } catch (err) {
      const apiLatency = Math.round(performance.now() - apiStart);
      logger.trackApiCall(apiLatency, false);
      logger.error('API call failed:', err.message);

      // Retry logic
      if (err.name !== 'AbortError') {
        Overlay.showRetryMessage(err.message);
      }
    }
  }

  // Debounced version for SPA navigation
  let debounceTimer = null;
  function debouncedPipeline() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runPipeline, CONFIG.DEBOUNCE_MS);
  }

  /**
   * Handle SPA navigation / page changes
   */
  function onPageChange(newUrl) {
    logger.info('Page change detected:', newUrl);
    
    // Hide existing overlay
    Overlay.hide();
    
    // Re-run pipeline after a short delay for DOM to settle
    debouncedPipeline();
  }

  /**
   * Initialize
   */
  function init() {
    logger.info('TruthCart content script initializing...');

    // Run initial detection
    setTimeout(runPipeline, 800); // Wait for dynamic content to load

    // Start observing for SPA changes
    PageObserver.start(onPageChange);

    logger.info('TruthCart content script ready');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for debugging and chat access
  window.TruthCart.triggerAnalysis = runPipeline;
  window.TruthCart.getCurrentAnalysis = () => currentAnalysis;
  window.TruthCart.getCurrentProduct = () => currentProduct;
  window.TruthCart.getMetrics = () => logger.getMetrics();
  window.TruthCart.CONFIG = CONFIG;
  window.TruthCart.openRedditSearch = openRedditSearch;

})();

/**
 * Open Reddit search for a product in a new tab
 * @param {string} productName - Product name to search for
 */
function openRedditSearch(productName) {
  if (!productName) {
    window.open('https://www.reddit.com/r/technology/', '_blank');
    return;
  }

  const shortName = productName.split(' ').slice(0, 6).join(' ');
  const query = `${shortName} review OR issues OR experience`;
  const url = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&sort=relevance&t=year`;
  window.open(url, '_blank');
}
