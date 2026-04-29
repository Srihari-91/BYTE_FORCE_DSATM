// DOM Utility helpers for content scripts
// Safe DOM queries, element creation, and Shadow DOM management

const DOMUtils = {
  /**
   * Safely query a single element
   */
  query(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (e) {
      return null;
    }
  },

  /**
   * Safely query all elements
   */
  queryAll(selector, parent = document) {
    try {
      return Array.from(parent.querySelectorAll(selector));
    } catch (e) {
      return [];
    }
  },

  /**
   * Get text content safely
   */
  getText(el, fallback = '') {
    if (!el) return fallback;
    return (el.textContent || '').trim();
  },

  /**
   * Get attribute safely
   */
  getAttr(el, attr, fallback = '') {
    if (!el) return fallback;
    return el.getAttribute(attr) || fallback;
  },

  /**
   * Check if element exists and is visible
   */
  isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  },

  /**
   * Wait for an element to appear in the DOM
   */
  waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(selector);
      if (existing) {
        resolve(existing);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }, timeout);
    });
  },

  /**
   * Create element with attributes and children
   */
  createElement(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'dataset') {
        Object.assign(el.dataset, value);
      } else {
        el.setAttribute(key, value);
      }
    }
    for (const child of children) {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    }
    return el;
  },

  /**
   * Inject a stylesheet into a Shadow Root
   */
  injectStyles(shadowRoot, cssText) {
    const style = document.createElement('style');
    style.textContent = cssText;
    shadowRoot.appendChild(style);
  }
};

if (typeof window !== 'undefined') {
  window.TruthCartUtils = window.TruthCartUtils || {};
  window.TruthCartUtils.DOM = DOMUtils;
}
