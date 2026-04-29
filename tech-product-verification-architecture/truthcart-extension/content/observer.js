// SPA Navigation Observer
// Watches for DOM changes that signal page navigation in single-page apps
// Triggers re-detection when content changes significantly

const PageObserver = {
  _observer: null,
  _onChangeCallback: null,
  _debounceTimer: null,
  _lastUrl: null,

  /**
   * Start observing the page for content changes
   * @param {Function} onChange - Callback when significant content change is detected
   */
  start(onChange) {
    this._onChangeCallback = onChange;
    this._lastUrl = window.location.href;

    // Watch for URL changes via History API
    this._patchHistoryApi();

    // Watch for DOM mutations that indicate page content change
    this._observer = new MutationObserver((mutations) => {
      // Debounce: wait for mutations to settle
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
      }

      this._debounceTimer = setTimeout(() => {
        const currentUrl = window.location.href;
        
        // Check if significant content change occurred
        const hasSignificantChange = mutations.some(mutation => {
          // Ignore minor text changes
          if (mutation.type === 'characterData') return false;
          
          // Check for added nodes that indicate content replacement
          if (mutation.type === 'childList') {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Significant: large elements added
                if (node.nodeName === 'DIV' || 
                    node.nodeName === 'SECTION' ||
                    node.nodeName === 'MAIN' ||
                    node.nodeName === 'ARTICLE') {
                  return true;
                }
                // Check if element has product-related classes
                if (node.className && typeof node.className === 'string') {
                  const cls = node.className.toLowerCase();
                  if (cls.includes('product') || 
                      cls.includes('pdp') || 
                      cls.includes('item')) {
                    return true;
                  }
                }
              }
            }
          }
          return false;
        });

        // Also trigger if URL changed
        const urlChanged = currentUrl !== this._lastUrl;

        if (hasSignificantChange || urlChanged) {
          this._lastUrl = currentUrl;
          if (this._onChangeCallback) {
            this._onChangeCallback(currentUrl);
          }
        }
      }, 500); // 500ms debounce
    });

    // Observe entire body for changes
    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });

    console.log('[TruthCart] Page observer started');
  },

  /**
   * Patch History API to detect programmatic navigation
   */
  _patchHistoryApi() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const self = this;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      self._onHistoryChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      self._onHistoryChange();
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', () => {
      self._onHistoryChange();
    });
  },

  _onHistoryChange() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }

    this._debounceTimer = setTimeout(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== this._lastUrl) {
        this._lastUrl = currentUrl;
        if (this._onChangeCallback) {
          this._onChangeCallback(currentUrl);
        }
      }
    }, 300);
  },

  /**
   * Stop observing
   */
  stop() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._onChangeCallback = null;
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.PageObserver = PageObserver;
}
