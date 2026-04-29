// Debounce utility for extension
// Prevents rapid-fire execution of expensive operations (extraction, API calls)

/**
 * Creates a debounced version of a function
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds (default 300ms)
 * @returns {Function} Debounced function with cancel method
 */
function debounce(fn, delay = 300) {
  let timerId = null;

  const debounced = function (...args) {
    const context = this;

    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      timerId = null;
      fn.apply(context, args);
    }, delay);
  };

  debounced.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  debounced.isPending = function () {
    return timerId !== null;
  };

  return debounced;
}

// Export for module-like usage in content script context
if (typeof window !== 'undefined') {
  window.TruthCartUtils = window.TruthCartUtils || {};
  window.TruthCartUtils.debounce = debounce;
}
