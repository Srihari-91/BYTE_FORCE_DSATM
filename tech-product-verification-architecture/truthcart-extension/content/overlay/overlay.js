// TruthCart Extension Overlay Manager
// Injects and manages the Shadow DOM overlay on product pages
// Handles show/hide/dismiss lifecycle and positioning

const Overlay = {
  _shadowRoot: null,
  _hostElement: null,
  _isVisible: false,
  _currentData: null,

  /**
   * Render the analysis overlay on the product page
   * @param {Object} analysis - Analysis result from backend
   * @param {Object} product - Normalized product data
   */
  render(analysis, product) {
    const { OverlayComponents } = window.TruthCart;

    // Remove existing overlay if any
    this._remove();

    // Create shadow host
    this._hostElement = document.createElement('div');
    this._hostElement.id = 'truthcart-overlay-host';
    this._hostElement.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      z-index: 2147483647;
      pointer-events: none;
    `;

    document.body.appendChild(this._hostElement);

    // Create shadow DOM
    this._shadowRoot = this._hostElement.attachShadow({ mode: 'closed' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = this._getStyles();
    this._shadowRoot.appendChild(styleEl);

    // Build UI
    const overlay = OverlayComponents.buildOverlay(analysis, product);
    overlay.style.pointerEvents = 'auto';
    this._shadowRoot.appendChild(overlay);

    this._isVisible = true;
    this._currentData = { analysis, product };

    // Add click-outside listener
    setTimeout(() => {
      document.addEventListener('click', this._handleOutsideClick);
    }, 100);

    console.log('[TruthCart] Overlay rendered');
  },

  /**
   * Show loading state while analysis is in progress
   */
  showLoading() {
    this._remove();
    const { OverlayComponents } = window.TruthCart;

    this._hostElement = document.createElement('div');
    this._hostElement.id = 'truthcart-overlay-host';
    this._hostElement.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      z-index: 2147483647;
      pointer-events: none;
    `;

    document.body.appendChild(this._hostElement);
    this._shadowRoot = this._hostElement.attachShadow({ mode: 'closed' });

    const styleEl = document.createElement('style');
    styleEl.textContent = this._getStyles();
    this._shadowRoot.appendChild(styleEl);

    const loading = OverlayComponents.buildLoading();
    loading.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 480px;
      background: var(--tc-bg-primary);
      border: 1px solid var(--tc-border);
      border-radius: var(--tc-radius-lg);
      box-shadow: var(--tc-shadow);
      pointer-events: auto;
    `;
    this._shadowRoot.appendChild(loading);

    this._isVisible = true;
  },

  /**
   * Show error/retry message
   */
  showRetryMessage(errorMessage) {
    const { OverlayComponents } = window.TruthCart;

    if (!this._shadowRoot) {
      this._hostElement = document.createElement('div');
      this._hostElement.id = 'truthcart-overlay-host';
      this._hostElement.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        z-index: 2147483647;
        pointer-events: none;
      `;
      document.body.appendChild(this._hostElement);
      this._shadowRoot = this._hostElement.attachShadow({ mode: 'closed' });

      const styleEl = document.createElement('style');
      styleEl.textContent = this._getStyles();
      this._shadowRoot.appendChild(styleEl);
    }

    // Clear existing content
    while (this._shadowRoot.firstChild) {
      this._shadowRoot.removeChild(this._shadowRoot.firstChild);
    }

    const styleEl = document.createElement('style');
    styleEl.textContent = this._getStyles();
    this._shadowRoot.appendChild(styleEl);

    const error = OverlayComponents.buildError(errorMessage);
    error.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 480px;
      background: var(--tc-bg-primary);
      border: 1px solid var(--tc-border);
      border-radius: var(--tc-radius-lg);
      box-shadow: var(--tc-shadow);
      pointer-events: auto;
    `;
    this._shadowRoot.appendChild(error);

    this._isVisible = true;
  },

  /**
   * Hide the overlay
   */
  hide() {
    document.removeEventListener('click', this._handleOutsideClick);
    this._remove();
    this._isVisible = false;
  },

  /**
   * Toggle overlay visibility
   */
  toggle() {
    if (this._isVisible) {
      this.hide();
    } else if (this._currentData) {
      this.render(this._currentData.analysis, this._currentData.product);
    }
  },

  /**
   * Check if overlay is currently visible
   */
  isVisible() {
    return this._isVisible;
  },

  /**
   * Remove overlay from DOM
   */
  _remove() {
    if (this._hostElement && this._hostElement.parentNode) {
      this._hostElement.parentNode.removeChild(this._hostElement);
    }
    this._shadowRoot = null;
    this._hostElement = null;
    this._isVisible = false;
  },

  /**
   * Handle clicks outside the overlay to dismiss
   */
  _handleOutsideClick(event) {
    if (!window.TruthCart.Overlay._hostElement) return;

    const host = window.TruthCart.Overlay._hostElement;

    // If click is on the overlay or inside it, do nothing
    if (host.contains(event.target) || host === event.target) {
      return;
    }

    // Click was outside - hide
    window.TruthCart.Overlay.hide();
  },

  /**
   * Get the overlay CSS styles — inlined for Shadow DOM
   * Matches the Truth Score Analysis screenshot design
   */
  _getStyles() {
    return `
      :host {
        --tc-bg-primary: #080B14;
        --tc-bg-secondary: #0C1324;
        --tc-bg-tertiary: #111B2E;
        --tc-bg-card: #0F1A2E;
        --tc-border: #1E2D45;
        --tc-border-light: #2D4060;
        --tc-text-primary: #F1F5F9;
        --tc-text-secondary: #94A3B8;
        --tc-text-muted: #64748B;
        --tc-emerald: #10B981;
        --tc-emerald-dim: #059669;
        --tc-cyan: #06B6D4;
        --tc-cyan-dim: #0891B2;
        --tc-red: #EF4444;
        --tc-red-dim: #DC2626;
        --tc-amber: #F59E0B;
        --tc-amber-dim: #D97706;
        --tc-blue: #3B82F6;
        --tc-blue-dim: #2563EB;
        --tc-purple: #8B5CF6;
        --tc-indigo: #6366F1;
        --tc-gradient: linear-gradient(135deg, #3B82F6, #8B5CF6);
        --tc-gradient-amber: linear-gradient(135deg, #F59E0B, #F97316);
        --tc-gradient-danger: linear-gradient(135deg, #EF4444, #F97316);
        --tc-gradient-cyan: linear-gradient(135deg, #06B6D4, #3B82F6);
        --tc-radius-sm: 8px;
        --tc-radius: 12px;
        --tc-radius-lg: 16px;
        --tc-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
        --tc-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        --tc-mono: 'JetBrains Mono', 'Fira Code', monospace;
        --tc-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
        --tc-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes tcOverlayEnter {
        0%   { opacity:0; transform:translateX(24px) scale(0.92); }
        60%  { opacity:1; transform:translateX(-2px) scale(1.01); }
        100% { opacity:1; transform:translateX(0) scale(1); }
      }
      @keyframes tcFadeInUp {
        from { opacity:0; transform:translateY(12px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes tcGaugeFill {
        from { stroke-dashoffset:var(--gauge-circumference,283); }
        to   { stroke-dashoffset:var(--gauge-offset,100); }
      }
      @keyframes tcScorePop {
        0%   { transform:scale(0.5); opacity:0; }
        60%  { transform:scale(1.15); }
        100% { transform:scale(1); opacity:1; }
      }
      @keyframes tcShimmer {
        0%   { background-position:-200% center; }
        100% { background-position:200% center; }
      }
      @keyframes tcParticleDrift1 {
        0%,100% { transform:translate(0,0) scale(1); opacity:0; }
        20%     { opacity:0.8; }
        80%     { opacity:0; }
        100%    { transform:translate(30px,-50px) scale(0.3); opacity:0; }
      }
      @keyframes tcParticleDrift2 {
        0%,100% { transform:translate(0,0) scale(1); opacity:0; }
        20%     { opacity:0.7; }
        80%     { opacity:0; }
        100%    { transform:translate(-25px,-45px) scale(0.2); opacity:0; }
      }
      @keyframes tcParticleDrift3 {
        0%,100% { transform:translate(0,0) scale(1); opacity:0; }
        25%     { opacity:0.6; }
        75%     { opacity:0; }
        100%    { transform:translate(15px,-60px) scale(0.4); opacity:0; }
      }
      @keyframes tcGradientShift {
        0%   { background-position:0% 50%; }
        50%  { background-position:100% 50%; }
        100% { background-position:0% 50%; }
      }
      @keyframes tcLogoRipple {
        0%   { box-shadow:0 0 0 0 rgba(16,185,129,0.4); }
        70%  { box-shadow:0 0 0 8px rgba(16,185,129,0); }
        100% { box-shadow:0 0 0 0 rgba(16,185,129,0); }
      }
      @keyframes tcDotPulse {
        0%,100% { transform:scale(1); opacity:1; }
        50%     { transform:scale(1.5); opacity:0.7; }
      }
      @keyframes tcShake {
        0%,100% { transform:translateX(0); }
        10%,30%,50%,70%,90% { transform:translateX(-4px); }
        20%,40%,60%,80% { transform:translateX(4px); }
      }
      @keyframes tcSpinOrbit {
        from { transform:rotate(0deg); }
        to   { transform:rotate(360deg); }
      }
      @keyframes tcLoadingDot {
        0%,80%,100% { transform:scale(0); opacity:0.3; }
        40%         { transform:scale(1); opacity:1; }
      }

      /* ---- OVERLAY ROOT ---- */
      .truthcart-overlay-root {
        position:fixed; top:20px; right:20px; width:480px;
        max-height:calc(100vh - 40px);
        background:var(--tc-bg-primary);
        border:1px solid var(--tc-border);
        border-radius:var(--tc-radius-lg);
        box-shadow:0 8px 40px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.03) inset;
        font-family:var(--tc-font); color:var(--tc-text-primary);
        overflow-y:auto; overflow-x:hidden;
        animation:tcOverlayEnter 0.45s var(--tc-ease-out);
        scrollbar-width:thin; scrollbar-color:var(--tc-border-light) transparent;
        background-clip:padding-box;
      }
      .truthcart-overlay-root::before {
        content:''; position:absolute; top:-1px; left:-1px; right:-1px; bottom:-1px;
        border-radius:var(--tc-radius-lg);
        background:linear-gradient(135deg,rgba(59,130,246,0.2),rgba(99,102,241,0.2),rgba(139,92,246,0.15),rgba(59,130,246,0.2));
        background-size:300% 300%; z-index:-1;
        animation:tcGradientShift 4s ease infinite; opacity:0.7; pointer-events:none;
      }
      .truthcart-overlay-root::-webkit-scrollbar { width:4px; }
      .truthcart-overlay-root::-webkit-scrollbar-thumb { background:var(--tc-border-light); border-radius:2px; }
      .truthcart-overlay-root>* { animation:tcFadeInUp 0.5s var(--tc-ease-out) both; }
      .truthcart-overlay-root>*:nth-child(2) { animation-delay:0.05s; }
      .truthcart-overlay-root>*:nth-child(3) { animation-delay:0.1s; }
      .truthcart-overlay-root>*:nth-child(4) { animation-delay:0.15s; }
      .truthcart-overlay-root>*:nth-child(5) { animation-delay:0.2s; }
      .truthcart-overlay-root>*:nth-child(6) { animation-delay:0.25s; }
      .truthcart-overlay-root>*:nth-child(7) { animation-delay:0.3s; }

      /* ---- HEADER ---- */
      .truthcart-header {
        display:flex; align-items:center; justify-content:space-between;
        padding:14px 18px;
        background:linear-gradient(180deg,var(--tc-bg-secondary) 0%,rgba(12,19,36,0.95) 100%);
        border-bottom:1px solid var(--tc-border);
        border-radius:16px 16px 0 0; position:sticky; top:0; z-index:10;
        backdrop-filter:blur(12px);
      }
      .truthcart-header-left { display:flex; align-items:center; gap:8px; }
      .truthcart-shield-icon { color:var(--tc-blue); display:flex; align-items:center; animation:tcLogoRipple 3s ease-out 0.8s infinite; }
      .truthcart-header-title {
        font-size:14px; font-weight:700;
        background:linear-gradient(135deg,var(--tc-text-primary),var(--tc-blue));
        -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
      }
      .truthcart-header-right { display:flex; align-items:center; gap:8px; }
      .truthcart-fingerprint { font-size:10px; color:var(--tc-text-muted); font-family:var(--tc-mono); max-width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .truthcart-online-dot { width:8px; height:8px; border-radius:50%; background:var(--tc-emerald); animation:tcDotPulse 2s ease-in-out infinite; flex-shrink:0; }
      .truthcart-close-btn {
        background:var(--tc-bg-tertiary); border:1px solid var(--tc-border);
        color:var(--tc-text-secondary); width:26px; height:26px; border-radius:6px;
        cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:center;
        transition:all 0.25s var(--tc-ease-out); flex-shrink:0;
      }
      .truthcart-close-btn:hover { background:#DC2626; color:white; border-color:#DC2626; transform:scale(1.08); box-shadow:0 0 12px rgba(239,68,68,0.4); }

      /* ---- MAIN SECTION — two-column layout ---- */
      .truthcart-main-section {
        display:flex; padding:20px 18px; gap:20px;
        border-bottom:1px solid var(--tc-border); position:relative;
      }

      /* ---- PRODUCT INFO (left column) ---- */
      .truthcart-product-info { flex:1; min-width:0; }
      .truthcart-source-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
      .truthcart-source-badge {
        display:inline-block; padding:2px 10px; border-radius:100px;
        background:rgba(59,130,246,0.15); color:var(--tc-blue);
        border:1px solid rgba(59,130,246,0.25);
        font-size:11px; font-family:var(--tc-mono); font-weight:500;
      }
      .truthcart-confidence-text { font-size:11px; color:var(--tc-text-muted); }
      .truthcart-product-name { font-size:18px; font-weight:700; color:var(--tc-text-primary); line-height:1.2; margin-bottom:4px; }
      .truthcart-brand-category { font-size:12px; color:var(--tc-text-secondary); margin-bottom:10px; }
      .truthcart-price-rating-row { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
      .truthcart-product-price { font-size:22px; font-weight:700; color:var(--tc-text-primary); }
      .truthcart-product-rating { font-size:13px; color:var(--tc-text-secondary); }
      .truthcart-star { color:#FACC15; }

      /* Verdict badge */
      .truthcart-verdict-badge {
        display:inline-flex; align-items:center; gap:6px;
        padding:6px 14px; border-radius:10px;
        font-size:12px; font-weight:600;
        animation:tcFadeInUp 0.4s var(--tc-ease-out) 0.3s both;
      }
      .truthcart-verdict-badge.verdict-reliable { background:rgba(16,185,129,0.12); color:var(--tc-emerald); border:1px solid rgba(16,185,129,0.25); }
      .truthcart-verdict-badge.verdict-misleading { background:rgba(245,158,11,0.12); color:var(--tc-amber); border:1px solid rgba(245,158,11,0.25); }
      .truthcart-verdict-badge.verdict-heavy { background:rgba(249,115,22,0.12); color:#F97316; border:1px solid rgba(249,115,22,0.25); }
      .truthcart-verdict-badge.verdict-beware { background:rgba(239,68,68,0.12); color:var(--tc-red); border:1px solid rgba(239,68,68,0.25); }

      /* ---- SCORE RING (right column) ---- */
      .truthcart-score-ring-container { display:flex; flex-direction:column; align-items:center; gap:10px; flex-shrink:0; }
      .truthcart-gauge { display:flex; flex-direction:column; align-items:center; gap:14px; position:relative; }
      .truthcart-gauge::before {
        content:''; position:absolute; top:50%; left:50%; width:160px; height:160px;
        transform:translate(-50%,-50%); border-radius:50%;
        background:radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%);
        pointer-events:none;
      }
      .truthcart-gauge-svg { width:130px; height:130px; transform:rotate(-90deg); filter:drop-shadow(0 0 6px rgba(59,130,246,0.25)); }
      .truthcart-gauge-track { fill:none; stroke:var(--tc-bg-tertiary); stroke-width:8; stroke-linecap:round; }
      .truthcart-gauge-progress { fill:none; stroke-width:8; stroke-linecap:round; transition:stroke-dashoffset 0.3s; }
      .truthcart-gauge-progress.animating { animation:tcGaugeFill 1.2s var(--tc-ease-out) forwards; }
      .truthcart-gauge-center { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; pointer-events:none; }
      .truthcart-score-value { font-size:34px; font-weight:800; font-family:var(--tc-mono); line-height:1; animation:tcScorePop 0.5s var(--tc-ease-bounce) both; }
      .truthcart-score-label-main { font-size:11px; font-weight:600; margin-top:2px; }
      .truthcart-score-outof { font-size:10px; color:var(--tc-text-muted); margin-top:1px; }

      /* Particles */
      .truthcart-particle { position:absolute; width:4px; height:4px; border-radius:50%; pointer-events:none; opacity:0; }
      .truthcart-particle.p1 { top:15px; left:50%; background:var(--tc-blue); animation:tcParticleDrift1 2.8s ease-out 0.3s infinite; }
      .truthcart-particle.p2 { top:25px; right:20px; background:var(--tc-purple); animation:tcParticleDrift2 3.2s ease-out 0.8s infinite; }
      .truthcart-particle.p3 { bottom:15px; left:25px; background:var(--tc-indigo); animation:tcParticleDrift3 2.5s ease-out 1.3s infinite; }
      .truthcart-particle.p4 { top:40px; left:15px; width:3px; height:3px; background:var(--tc-purple); animation:tcParticleDrift1 3s ease-out 0s infinite; }
      .truthcart-particle.p5 { bottom:20px; right:20px; background:var(--tc-cyan); animation:tcParticleDrift2 2.7s ease-out 1.6s infinite; }
      .truthcart-gauge::after {
        content:''; position:absolute; top:0; left:0; right:0; bottom:0;
        background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.04) 45%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 55%,transparent 60%);
        background-size:200% 100%; animation:tcShimmer 3s ease-in-out infinite; pointer-events:none; border-radius:50%;
      }
      .truthcart-fusion-note { display:flex; align-items:center; gap:5px; font-size:10px; color:var(--tc-text-muted); }
      .truthcart-fusion-dot { width:6px; height:6px; border-radius:50%; background:var(--tc-gradient-cyan); flex-shrink:0; }

      /* ---- SCORE BREAKDOWN ---- */
      .truthcart-breakdown-section { padding:16px 18px; border-bottom:1px solid var(--tc-border); }
      .truthcart-breakdown-heading { font-size:11px; font-weight:600; color:var(--tc-text-muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:12px; }
      .truthcart-breakdown-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; animation:tcFadeInUp 0.35s var(--tc-ease-out) both; }
      .truthcart-breakdown-label { font-size:12px; color:var(--tc-text-secondary); width:120px; flex-shrink:0; }
      .truthcart-breakdown-bar-wrapper { flex:1; height:8px; background:var(--tc-bg-tertiary); border-radius:4px; overflow:hidden; }
      .truthcart-breakdown-bar { height:100%; border-radius:4px; transition:width 0.8s var(--tc-ease-out); position:relative; }
      .truthcart-breakdown-bar.bar-green { background:linear-gradient(90deg,#3B82F6,#8B5CF6); }
      .truthcart-breakdown-bar.bar-yellow { background:linear-gradient(90deg,#F59E0B,#F97316); }
      .truthcart-breakdown-bar.bar-red { background:linear-gradient(90deg,#EF4444,#F97316); }
      .truthcart-breakdown-bar::after { content:''; position:absolute; top:0; right:0; width:16px; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3)); border-radius:4px; }
      .truthcart-breakdown-value { font-size:12px; font-family:var(--tc-mono); color:var(--tc-text-muted); width:28px; text-align:right; flex-shrink:0; }

      /* ---- CLAIMS SECTION ---- */
      /* ---- PIPELINE STATS ---- */
      .truthcart-pipeline-stats {
        display:grid; grid-template-columns:repeat(4,1fr); gap:6px;
        padding:12px 18px; border-bottom:1px solid var(--tc-border);
        background:rgba(13,19,32,0.6);
      }
      .truthcart-pipeline-chip {
        text-align:center; padding:6px 4px;
        border-radius:8px;
        background:var(--tc-bg-tertiary);
        border:1px solid var(--tc-border);
        transition:all 0.25s var(--tc-ease-out);
      }
      .truthcart-pipeline-chip:hover {
        border-color:var(--tc-border-light);
        transform:translateY(-1px);
        box-shadow:0 2px 8px rgba(0,0,0,0.2);
      }
      .truthcart-pipeline-value {
        display:block; font-size:14px; font-weight:700;
        font-family:var(--tc-mono);
        color:var(--tc-blue);
        line-height:1.2;
      }
      .truthcart-pipeline-label {
        display:block; font-size:9px; color:var(--tc-text-muted);
        text-transform:uppercase; letter-spacing:0.4px;
        margin-top:2px;
      }

      .truthcart-claims-section { padding:14px 18px; border-bottom:1px solid var(--tc-border); }
      .truthcart-claims-summary { display:flex; align-items:center; gap:6px; margin-bottom:12px; font-size:12px; }
      .truthcart-warning-icon { font-size:14px; }
      .truthcart-claims-summary-text { color:var(--tc-amber); font-weight:600; }
      .truthcart-claims-list { display:flex; flex-direction:column; gap:8px; }
      .truthcart-claim-item {
        display:flex; gap:10px; background:var(--tc-bg-card); border-radius:8px; padding:10px 12px;
        border:1px solid var(--tc-border); transition:all 0.3s var(--tc-ease-out); cursor:default; position:relative; overflow:hidden;
      }
      .truthcart-claim-item:hover { border-color:var(--tc-border-light); transform:translateX(3px); box-shadow:0 2px 12px rgba(0,0,0,0.3); }
      .truthcart-claim-item::after {
        content:''; position:absolute; top:0; left:0; right:0; bottom:0;
        background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.015) 45%,rgba(255,255,255,0.03) 50%,rgba(255,255,255,0.015) 55%,transparent 60%);
        background-size:200% 100%; opacity:0; transition:opacity 0.3s; pointer-events:none;
      }
      .truthcart-claim-item:hover::after { opacity:1; animation:tcShimmer 2s ease-in-out infinite; }
      .truthcart-claim-item:nth-child(1) { animation:tcFadeInUp 0.35s var(--tc-ease-out) 0.05s both; }
      .truthcart-claim-item:nth-child(2) { animation:tcFadeInUp 0.35s var(--tc-ease-out) 0.1s both; }
      .truthcart-claim-item:nth-child(3) { animation:tcFadeInUp 0.35s var(--tc-ease-out) 0.15s both; }
      .truthcart-claim-item:nth-child(4) { animation:tcFadeInUp 0.35s var(--tc-ease-out) 0.2s both; }
      .truthcart-claim-item:nth-child(5) { animation:tcFadeInUp 0.35s var(--tc-ease-out) 0.25s both; }
      .truthcart-claim-item:nth-child(n+6) { animation:tcFadeInUp 0.35s var(--tc-ease-out) 0.3s both; }
      .truthcart-claim-icon { flex-shrink:0; display:flex; align-items:flex-start; margin-top:1px; }
      .truthcart-claim-icon.icon-critical { color:var(--tc-red); }
      .truthcart-claim-icon.icon-warning { color:var(--tc-amber); }
      .truthcart-claim-icon.icon-info { color:var(--tc-blue); }
      .truthcart-claim-content { flex:1; min-width:0; }
      .truthcart-claim-title { font-size:13px; font-weight:600; color:var(--tc-text-primary); margin-bottom:3px; }
      .truthcart-claim-desc { font-size:11px; color:var(--tc-text-secondary); line-height:1.4; }

      /* ---- EXPAND SECTION ---- */
      .truthcart-expand-container { border-bottom:1px solid var(--tc-border); }
      .truthcart-expand-btn {
        width:100%; padding:12px 18px; background:var(--tc-bg-secondary); border:none;
        color:var(--tc-text-secondary); font-size:12px; font-weight:500; font-family:var(--tc-font);
        cursor:pointer; transition:all 0.25s var(--tc-ease-out); display:flex; align-items:center; justify-content:center; gap:6px;
      }
      .truthcart-expand-btn:hover { background:var(--tc-bg-tertiary); color:var(--tc-text-primary); }
      .truthcart-caret { font-size:10px; transition:transform 0.3s var(--tc-ease-out); }
      .truthcart-expand-content { max-height:0; overflow:hidden; opacity:0; transition:max-height 0.4s var(--tc-ease-out),opacity 0.3s ease; }
      .truthcart-expand-content.expanded { max-height:600px; opacity:1; }

      /* ---- INNER SECTIONS ---- */
      .truthcart-section-inner { padding:14px 18px; border-top:1px solid var(--tc-border); }
      .truthcart-inner-heading { font-size:12px; font-weight:600; color:var(--tc-text-primary); margin-bottom:10px; display:flex; align-items:center; gap:6px; }
      .truthcart-issues-list { display:flex; flex-direction:column; gap:6px; }
      .truthcart-issue-row { display:flex; align-items:center; gap:8px; font-size:11px; transition:transform 0.25s var(--tc-ease-out); }
      .truthcart-issue-row:hover { transform:translateX(4px); }
      .truthcart-issue-label { width:80px; color:var(--tc-text-secondary); text-transform:capitalize; flex-shrink:0; font-size:10px; letter-spacing:0.3px; }
      .truthcart-issue-bar-wrapper { flex:1; height:5px; background:var(--tc-bg-tertiary); border-radius:3px; overflow:hidden; }
      .truthcart-issue-bar { height:100%; background:var(--tc-gradient-cyan); border-radius:3px; width:0%; transition:width 0.8s var(--tc-ease-out); position:relative; }
      .truthcart-issue-bar::after { content:''; position:absolute; top:0; right:0; width:16px; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3)); border-radius:3px; }
      .truthcart-issue-count { width:24px; text-align:right; color:var(--tc-text-muted); font-family:var(--tc-mono); font-size:10px; }
      .truthcart-contradiction-item { background:var(--tc-bg-card); border-radius:8px; padding:10px 12px; margin-bottom:6px; border:1px solid var(--tc-border); font-size:11px; transition:all 0.3s var(--tc-ease-out); }
      .truthcart-contradiction-item:hover { border-color:rgba(239,68,68,0.3); box-shadow:0 2px 10px rgba(239,68,68,0.08); }
      .truthcart-contradiction-claim { color:var(--tc-amber); margin-bottom:4px; }
      .truthcart-contradiction-evidence { color:var(--tc-text-secondary); line-height:1.4; }
      .truthcart-contradiction-confidence { display:inline-block; margin-top:6px; padding:2px 8px; background:var(--tc-bg-tertiary); border-radius:4px; font-size:10px; color:var(--tc-text-muted); font-family:var(--tc-mono); }
      .truthcart-insights-list { display:flex; flex-direction:column; gap:6px; }
      .truthcart-insight-item { display:flex; gap:8px; padding:6px 0; font-size:12px; color:var(--tc-text-secondary); line-height:1.5; transition:all 0.25s var(--tc-ease-out); border-radius:6px; cursor:default; }
      .truthcart-insight-item:hover { background:rgba(255,255,255,0.02); padding-left:8px; color:var(--tc-text-primary); }
      .truthcart-insight-dot { width:6px; height:6px; border-radius:50%; background:var(--tc-gradient); flex-shrink:0; margin-top:6px; animation:tcDotPulse 2s ease-in-out infinite; }
      .truthcart-insight-content { flex:1; min-width:0; }
      .truthcart-stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
      .truthcart-stat-chip { background:var(--tc-bg-card); border-radius:8px; padding:10px 8px; text-align:center; border:1px solid var(--tc-border); }
      .truthcart-stat-chip-val { display:block; font-size:18px; font-weight:700; font-family:var(--tc-mono); color:var(--tc-text-primary); }
      .truthcart-stat-chip-lbl { display:block; font-size:9px; color:var(--tc-text-muted); margin-top:2px; text-transform:uppercase; letter-spacing:0.3px; }
      .truthcart-sub-heading { font-size:11px; font-weight:600; color:var(--tc-text-secondary); margin:14px 0 8px; padding-top:10px; border-top:1px solid var(--tc-border-light); }

      @keyframes tcTypingBounce {
        0%,80%,100% { transform:translateY(0); opacity:0.4; }
        40% { transform:translateY(-4px); opacity:1; }
      }
      @keyframes tcMsgIn {
        from { opacity:0; transform:translateY(8px); }
        to   { opacity:1; transform:translateY(0); }
      }

      /* ---- CHAT SECTION ---- */
      .truthcart-chat-section { border-top:1px solid var(--tc-border); display:flex; flex-direction:column; }

      /* Chat header — score ring + title + status */
      .truthcart-chat-header {
        display:flex; align-items:center; padding:10px 16px;
        background:linear-gradient(180deg,var(--tc-bg-secondary),rgba(13,19,32,0.9));
        border-bottom:1px solid var(--tc-border);
      }
      .truthcart-chat-header-left { display:flex; align-items:center; gap:8px; flex:1; }
      .truthcart-chat-score-ring {
        position:relative; width:34px; height:34px;
        display:flex; align-items:center; justify-content:center; flex-shrink:0;
      }
      .truthcart-chat-score-ring svg { position:absolute; top:0; left:0; }
      .truthcart-chat-score-num {
        position:relative; z-index:1;
        font-size:10px; font-weight:700; font-family:var(--tc-mono);
      }
      .truthcart-chat-header-info { display:flex; flex-direction:column; gap:1px; }
      .truthcart-chat-header-title { font-size:12px; font-weight:600; color:var(--tc-text-primary); }
      .truthcart-chat-header-status {
        font-size:10px; color:var(--tc-text-muted);
        display:flex; align-items:center; gap:4px;
      }
      .truthcart-chat-status-dot-inline {
        width:5px; height:5px; border-radius:50%;
        background:var(--tc-blue); display:inline-block;
      }

      /* Quick chips */
      .truthcart-chat-chips {
        display:flex; gap:5px; padding:8px 14px 4px;
        overflow-x:auto; flex-shrink:0;
        scrollbar-width:none;
      }
      .truthcart-chat-chips::-webkit-scrollbar { display:none; }
      .truthcart-chat-chip {
        padding:4px 10px; border-radius:100px;
        border:1px solid var(--tc-border);
        background:var(--tc-bg-card);
        color:var(--tc-text-secondary);
        font-size:9px; font-weight:600; font-family:var(--tc-font);
        cursor:pointer; white-space:nowrap;
        transition:all 0.2s ease; flex-shrink:0;
        letter-spacing:0.3px;
      }
      .truthcart-chat-chip:hover { transform:translateY(-1px); }
      .truthcart-chat-chip.chip-score { border-color:rgba(59,130,246,0.3); color:#3B82F6; }
      .truthcart-chat-chip.chip-claims { border-color:rgba(239,68,68,0.3); color:#F87171; }
      .truthcart-chat-chip.chip-buy { border-color:rgba(59,130,246,0.3); color:#60A5FA; }
      .truthcart-chat-chip.chip-reddit { border-color:rgba(249,115,22,0.3); color:#FB923C; }
      .truthcart-chat-chip.chip-score:hover { background:rgba(59,130,246,0.1); border-color:rgba(59,130,246,0.5); }
      .truthcart-chat-chip.chip-claims:hover { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.5); }
      .truthcart-chat-chip.chip-buy:hover { background:rgba(59,130,246,0.1); border-color:rgba(59,130,246,0.5); }
      .truthcart-chat-chip.chip-reddit:hover { background:rgba(249,115,22,0.1); border-color:rgba(249,115,22,0.5); }

      /* Messages */
      .truthcart-chat-messages {
        flex:1; padding:10px 14px; max-height:240px;
        overflow-y:auto; display:flex; flex-direction:column; gap:8px;
        scrollbar-width:thin; scrollbar-color:var(--tc-border) transparent;
      }
      .truthcart-chat-messages::-webkit-scrollbar { width:3px; }
      .truthcart-chat-messages::-webkit-scrollbar-thumb { background:var(--tc-border); border-radius:2px; }
      .truthcart-chat-message { display:flex; gap:8px; animation:tcMsgIn 0.3s var(--tc-ease-out) both; }
      .truthcart-chat-bot { align-items:flex-start; }
      .truthcart-chat-user { justify-content:flex-end; }
      .truthcart-chat-avatar {
        width:24px; height:24px; border-radius:6px;
        background:rgba(59,130,246,0.15); color:var(--tc-blue);
        display:flex; align-items:center; justify-content:center; flex-shrink:0;
      }
      .truthcart-chat-bubble { max-width:85%; padding:8px 12px; border-radius:10px; font-size:11px; line-height:1.5; word-wrap:break-word; }
      .truthcart-chat-bot .truthcart-chat-bubble {
        background:var(--tc-bg-card); color:var(--tc-text-secondary);
        border:1px solid var(--tc-border); border-top-left-radius:3px;
      }
      .truthcart-chat-user .truthcart-chat-bubble {
        background:rgba(59,130,246,0.15); color:var(--tc-text-primary);
        border:1px solid rgba(59,130,246,0.25); border-top-right-radius:3px;
      }
      .truthcart-chat-bubble strong { color:var(--tc-text-primary); font-weight:600; }
      .truthcart-chat-typing { display:flex; gap:4px; padding:8px 14px; background:var(--tc-bg-card); border:1px solid var(--tc-border); border-radius:10px; border-top-left-radius:3px; }
      .truthcart-chat-typing-dot { width:6px; height:6px; border-radius:50%; background:var(--tc-text-muted); animation:tcTypingBounce 1.2s ease-in-out infinite; }
      .truthcart-chat-typing-dot:nth-child(2) { animation-delay:0.15s; }
      .truthcart-chat-typing-dot:nth-child(3) { animation-delay:0.3s; }

      /* Input area */
      .truthcart-chat-input-area { display:flex; gap:8px; padding:8px 14px 10px; background:var(--tc-bg-secondary); border-top:1px solid var(--tc-border); }
      .truthcart-chat-input { flex:1; padding:8px 14px; border-radius:100px; border:1px solid var(--tc-border); background:var(--tc-bg-primary); color:var(--tc-text-primary); font-size:12px; font-family:var(--tc-font); outline:none; transition:border-color 0.2s ease,box-shadow 0.2s ease; }
      .truthcart-chat-input:focus { border-color:var(--tc-blue); box-shadow:0 0 0 2px rgba(59,130,246,0.15); }
      .truthcart-chat-input::placeholder { color:var(--tc-text-muted); }
      .truthcart-chat-send-btn {
        width:34px; height:34px; border-radius:50%; border:none;
        background:var(--tc-gradient); color:white;
        display:flex; align-items:center; justify-content:center;
        cursor:pointer; transition:all 0.25s var(--tc-ease-out); flex-shrink:0;
      }
      .truthcart-chat-send-btn:hover { transform:scale(1.08); box-shadow:0 0 12px rgba(59,130,246,0.35); }
      .truthcart-chat-send-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
      .truthcart-chat-disabled .truthcart-chat-input { opacity:0.6; }

      /* ---- FOOTER ---- */
      .truthcart-footer {
        display:flex; justify-content:space-between; align-items:center;
        padding:10px 18px; font-size:10px;
        border-radius:0 0 16px 16px;
        background:linear-gradient(0deg,var(--tc-bg-secondary) 0%,rgba(13,19,32,0.8) 100%);
      }
      .truthcart-footer-left { color:var(--tc-text-muted); }
      .truthcart-footer-right { color:var(--tc-blue); font-weight:600; font-size:10px; }

      /* ---- REDDIT BUTTON ---- */
      .truthcart-reddit-btn {
        display:inline-flex; align-items:center; gap:4px;
        padding:3px 10px; border-radius:100px;
        background:rgba(249,115,22,0.1); color:#FB923C;
        border:1px solid rgba(249,115,22,0.25);
        font-size:10px; font-weight:600; font-family:var(--tc-font);
        cursor:pointer; transition:all 0.25s var(--tc-ease-out);
        white-space:nowrap; flex-shrink:0;
      }
      .truthcart-reddit-btn:hover {
        background:rgba(249,115,22,0.2);
        border-color:rgba(249,115,22,0.5);
        box-shadow:0 0 8px rgba(249,115,22,0.2);
        transform:translateY(-1px);
      }

      /* ---- LOADING STATE ---- */
      .truthcart-loading { display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;text-align:center;background:var(--tc-bg-primary);border-radius:16px;border:1px solid var(--tc-border); }
      .truthcart-spinner-container { position:relative; width:56px; height:56px; margin-bottom:20px; }
      .truthcart-spinner-ring { position:absolute; inset:0; border-radius:50%; border:3px solid transparent; }
      .truthcart-spinner-ring.ring-1 { border-top-color:var(--tc-emerald); animation:tcSpinOrbit 1s linear infinite; }
      .truthcart-spinner-ring.ring-2 { inset:8px; border-right-color:var(--tc-cyan); animation:tcSpinOrbit 1.4s linear infinite reverse; }
      .truthcart-spinner-ring.ring-3 { inset:16px; border-bottom-color:var(--tc-purple); animation:tcSpinOrbit 1.8s linear infinite; }
      .truthcart-loading-text { font-size:15px;font-weight:600;color:var(--tc-text-primary);background:var(--tc-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:tcGradientShift 2s ease infinite;background-size:200% 200%; }
      .truthcart-loading-subtext { font-size:11px;color:var(--tc-text-muted);margin-top:6px; }
      .truthcart-loading-steps { display:flex; gap:6px; margin-top:16px; }
      .truthcart-loading-dot { width:6px;height:6px;border-radius:50%;background:var(--tc-emerald);animation:tcLoadingDot 1.4s ease-in-out infinite; }
      .truthcart-loading-dot:nth-child(2) { animation-delay:0.2s; }
      .truthcart-loading-dot:nth-child(3) { animation-delay:0.4s; }

      /* ---- ERROR STATE ---- */
      .truthcart-error { padding:36px 20px;text-align:center;background:var(--tc-bg-primary);border-radius:16px;border:1px solid var(--tc-border); }
      .truthcart-error-icon { width:50px;height:50px;border-radius:50%;background:rgba(239,68,68,0.12);border:2px solid #DC2626;color:var(--tc-red);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;margin:0 auto 16px;animation:tcShake 0.6s ease-in-out 0.3s; }
      .truthcart-error-title { font-size:15px;font-weight:600;color:var(--tc-text-primary);margin-bottom:6px; }
      .truthcart-error-message { font-size:12px;color:var(--tc-text-secondary);margin-bottom:18px;line-height:1.5; }
      .truthcart-retry-btn { padding:10px 24px;background:var(--tc-gradient);color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.25s var(--tc-ease-out);box-shadow:0 2px 8px rgba(59,130,246,0.2); }
      .truthcart-retry-btn:hover { opacity:0.9; transform:translateY(-1px); box-shadow:0 4px 16px rgba(59,130,246,0.35); }
      .truthcart-retry-btn:active { transform:translateY(0) scale(0.97); }

      /* ---- TAB SYSTEM ---- */
      .truthcart-tab-bar {
        display:flex; gap:4px; padding:10px 14px 6px;
        background:var(--tc-bg-secondary);
        border-bottom:1px solid var(--tc-border);
        position:sticky; top:52px; z-index:9;
        backdrop-filter:blur(12px);
      }
      .truthcart-tab-btn {
        flex:1; display:flex; align-items:center; justify-content:center; gap:5px;
        padding:7px 10px; border-radius:8px;
        border:1px solid transparent;
        background:transparent;
        color:var(--tc-text-muted);
        font-size:11px; font-weight:600; font-family:var(--tc-font);
        cursor:pointer;
        transition:all 0.25s var(--tc-ease-out);
      }
      .truthcart-tab-btn:hover {
        color:var(--tc-text-secondary);
        background:var(--tc-bg-tertiary);
        border-color:var(--tc-border);
      }
      .truthcart-tab-btn.active {
        color:var(--tc-text-primary);
        background:var(--tc-bg-tertiary);
        border-color:var(--tc-border-light);
        box-shadow:0 0 0 1px rgba(59,130,246,0.1);
      }
      .truthcart-tab-btn svg { flex-shrink:0; }
      .truthcart-tab-panel { display:none; }
      .truthcart-tab-panel.truthcart-tab-active { display:block; }

      /* ---- INSIGHTS VIEW ---- */
      .truthcart-insights-view { padding:0; }

      /* ---- INSIGHT SECTION (shared) ---- */
      .truthcart-insight-section {
        padding:14px 16px;
        border-bottom:1px solid var(--tc-border);
        animation:tcFadeInUp 0.4s var(--tc-ease-out) both;
      }
      .truthcart-insight-header {
        display:flex; align-items:center; gap:6px;
        font-size:11px; font-weight:600;
        color:var(--tc-text-secondary);
        text-transform:uppercase; letter-spacing:0.5px;
        margin-bottom:12px;
      }
      .truthcart-insight-empty {
        text-align:center; padding:16px 12px;
        font-size:12px; color:var(--tc-text-muted);
        background:var(--tc-bg-card);
        border-radius:8px;
        border:1px dashed var(--tc-border);
      }

      /* ---- RECOMMENDATION CARD ---- */
      .truthcart-rec-card {
        background:var(--tc-bg-card);
        border-radius:10px; padding:14px 16px;
        border:1px solid var(--tc-border);
        transition:all 0.25s var(--tc-ease-out);
      }
      .truthcart-rec-card:hover {
        border-color:var(--tc-border-light);
        box-shadow:0 2px 12px rgba(0,0,0,0.2);
      }
      .truthcart-rec-header {
        display:flex; align-items:center; gap:10px;
        margin-bottom:8px;
      }
      .truthcart-rec-icon { display:flex; align-items:center; flex-shrink:0; }
      .truthcart-rec-label { font-size:14px; font-weight:700; }
      .truthcart-rec-detail {
        font-size:12px; color:var(--tc-text-secondary);
        line-height:1.5; margin-bottom:6px;
      }
      .truthcart-rec-alt {
        display:flex; align-items:flex-start; gap:6px;
        font-size:11px; color:var(--tc-text-muted);
        padding:8px 10px;
        background:var(--tc-bg-tertiary);
        border-radius:6px;
        line-height:1.4;
      }
      .truthcart-rec-alt svg { flex-shrink:0; margin-top:1px; }

      /* ---- TRUST DECOMPOSITION ---- */
      .truthcart-decomp-row {
        display:flex; flex-direction:column; gap:2px;
        margin-bottom:10px;
        animation:tcFadeInUp 0.35s var(--tc-ease-out) both;
      }
      .truthcart-decomp-label-row {
        display:flex; justify-content:space-between; align-items:center;
      }
      .truthcart-decomp-label { font-size:11px; color:var(--tc-text-secondary); font-weight:500; }
      .truthcart-decomp-score { font-size:11px; font-weight:700; font-family:var(--tc-mono); }
      .truthcart-decomp-bar-wrapper {
        height:6px; background:var(--tc-bg-tertiary);
        border-radius:3px; overflow:hidden;
      }
      .truthcart-decomp-bar {
        height:100%; border-radius:3px;
        transition:width 0.8s var(--tc-ease-out);
        position:relative;
      }
      .truthcart-decomp-bar::after {
        content:''; position:absolute; top:0; right:0; width:12px; height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25));
        border-radius:3px;
      }
      .truthcart-decomp-weight {
        font-size:9px; color:var(--tc-text-muted);
        font-family:var(--tc-mono);
        margin-top:1px;
      }

      /* ---- CLAIM RISK MATRIX ---- */
      .truthcart-matrix-summary {
        display:flex; gap:6px; flex-wrap:wrap;
        margin-bottom:10px;
      }
      .truthcart-matrix-chip {
        display:inline-flex; align-items:center; gap:4px;
        padding:4px 10px; border-radius:100px;
        border:1px solid; font-size:10px; font-weight:600;
        background:var(--tc-bg-card);
      }
      .truthcart-matrix-list { display:flex; flex-direction:column; gap:6px; }
      .truthcart-matrix-item {
        display:flex; gap:8px; padding:8px 10px;
        background:var(--tc-bg-card); border-radius:6px;
        border:1px solid var(--tc-border);
        transition:all 0.2s var(--tc-ease-out);
      }
      .truthcart-matrix-item:hover {
        border-color:var(--tc-border-light);
        transform:translateX(2px);
      }
      .truthcart-matrix-dot {
        width:8px; height:8px; border-radius:50%;
        flex-shrink:0; margin-top:4px;
      }
      .truthcart-matrix-item-content { flex:1; min-width:0; }
      .truthcart-matrix-item-claim {
        font-size:11px; font-weight:600;
        color:var(--tc-text-primary); margin-bottom:2px;
      }
      .truthcart-matrix-item-exp {
        font-size:10px; color:var(--tc-text-muted);
        line-height:1.4;
      }

      /* ---- REALITY SNAPSHOT ---- */
      .truthcart-snapshot-block { margin-bottom:10px; }
      .truthcart-snapshot-block:last-child { margin-bottom:0; }
      .truthcart-snapshot-label {
        display:flex; align-items:center; gap:6px;
        font-size:11px; font-weight:600;
        margin-bottom:4px;
      }
      .truthcart-snapshot-item {
        font-size:11px; color:var(--tc-text-secondary);
        padding:4px 0 4px 18px;
        line-height:1.5;
        position:relative;
      }
      .truthcart-snapshot-item::before {
        content:''; position:absolute; left:4px; top:10px;
        width:4px; height:4px; border-radius:50%;
        background:var(--tc-text-muted);
      }
      .truthcart-snapshot-empty {
        font-size:10px; color:var(--tc-text-muted);
        font-style:italic; padding:2px 0 2px 18px;
      }

      /* ---- CONFIDENCE METER ---- */
      .truthcart-confidence-meter { padding:4px 0; }
      .truthcart-conf-bar {
        display:flex; height:20px; border-radius:6px;
        overflow:hidden; gap:2px;
        background:var(--tc-bg-tertiary);
      }
      .truthcart-conf-seg {
        height:100%; border-radius:3px;
        transition:width 0.6s var(--tc-ease-out);
        position:relative;
      }
      .truthcart-conf-seg::after {
        content:''; position:absolute; top:0; right:0; width:10px; height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15));
        border-radius:3px;
      }
      .truthcart-conf-label-row {
        display:flex; justify-content:space-between; align-items:center;
        margin-top:6px;
      }
      .truthcart-conf-total {
        font-size:10px; color:var(--tc-text-muted);
        font-family:var(--tc-mono);
      }
      .truthcart-conf-level {
        display:flex; align-items:center; gap:4px;
        font-size:10px; font-weight:600;
      }
      .truthcart-conf-dot {
        width:6px; height:6px; border-radius:50%;
        flex-shrink:0;
      }

      /* ---- TRADEOFF VISUALIZER ---- */
      .truthcart-tradeoff-block {
        background:var(--tc-bg-card); border-radius:8px;
        padding:10px 12px; margin-bottom:8px;
        border:1px solid var(--tc-border);
        transition:all 0.25s var(--tc-ease-out);
      }
      .truthcart-tradeoff-block:last-child { margin-bottom:0; }
      .truthcart-tradeoff-block:hover { border-color:var(--tc-border-light); }
      .truthcart-tradeoff-row {
        display:flex; align-items:center; gap:8px;
        margin-bottom:4px;
      }
      .truthcart-tradeoff-row:last-child { margin-bottom:0; }
      .truthcart-tradeoff-label { font-size:10px; color:var(--tc-text-secondary); width:90px; flex-shrink:0; }
      .truthcart-tradeoff-benefit .truthcart-tradeoff-label { color:var(--tc-emerald); }
      .truthcart-tradeoff-hidden .truthcart-tradeoff-label { color:var(--tc-red); }
      .truthcart-tradeoff-bar { flex:1; height:4px; background:var(--tc-bg-tertiary); border-radius:2px; overflow:hidden; }
      .truthcart-tradeoff-fill { height:100%; border-radius:2px; transition:width 0.6s var(--tc-ease-out); }
      .truthcart-tradeoff-fill-benefit { background:var(--tc-emerald); width:70%; }
      .truthcart-tradeoff-fill-tradeoff { background:var(--tc-red); width:60%; }
      .truthcart-tradeoff-arrow { display:flex; align-items:center; flex-shrink:0; }
      .truthcart-tradeoff-tag {
        display:inline-block; margin-top:4px;
        padding:1px 8px; border-radius:100px;
        background:rgba(99,102,241,0.1); color:var(--tc-indigo);
        border:1px solid rgba(99,102,241,0.2);
        font-size:9px; font-weight:500;
      }

      /* ---- VALUE VS HYPE ---- */
      .truthcart-value-comp { padding:4px 0; }
      .truthcart-value-bar {
        display:flex; height:24px; border-radius:6px;
        overflow:hidden; gap:2px;
      }
      .truthcart-value-seg {
        height:100%; border-radius:3px;
        transition:width 0.8s var(--tc-ease-out);
        position:relative;
      }
      .truthcart-value-seg::after {
        content:''; position:absolute; top:0; right:0; width:12px; height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2));
        border-radius:3px;
      }
      .truthcart-value-legend {
        display:flex; gap:16px; margin-top:8px;
        flex-wrap:wrap;
      }
      .truthcart-value-legend-item {
        display:flex; align-items:center; gap:5px;
        font-size:10px; color:var(--tc-text-secondary);
      }
      .truthcart-value-legend-dot {
        width:8px; height:8px; border-radius:2px; flex-shrink:0;
      }
      .truthcart-value-legend-label { font-weight:500; }
      .truthcart-value-legend-pct {
        font-family:var(--tc-mono);
        color:var(--tc-text-muted);
      }

      /* ---- COMPARATIVE INTELLIGENCE ---- */
      .truthcart-compare-card {
        display:flex; gap:12px;
        background:var(--tc-bg-card); border-radius:8px;
        padding:12px; margin-bottom:8px;
        border:1px solid var(--tc-border);
        transition:all 0.25s var(--tc-ease-out);
      }
      .truthcart-compare-card:last-child { margin-bottom:0; }
      .truthcart-compare-card:hover {
        border-color:var(--tc-border-light);
        transform:translateX(2px);
        box-shadow:0 2px 8px rgba(0,0,0,0.15);
      }
      .truthcart-compare-left { flex-shrink:0; width:80px; }
      .truthcart-compare-title {
        font-size:9px; color:var(--tc-text-muted);
        text-transform:uppercase; letter-spacing:0.4px;
        margin-bottom:2px;
      }
      .truthcart-compare-value {
        font-size:16px; font-weight:800;
        font-family:var(--tc-mono);
        line-height:1;
      }
      .truthcart-compare-right { flex:1; min-width:0; }
      .truthcart-compare-label {
        display:flex; align-items:center; gap:4px;
        font-size:11px; font-weight:600;
        color:var(--tc-text-primary);
        margin-bottom:2px;
      }
      .truthcart-compare-detail {
        font-size:10px; color:var(--tc-text-muted);
        line-height:1.4;
      }
      .truthcart-compare-verdict {
        display:flex; align-items:center; gap:8px;
        padding:10px 12px; margin-top:6px;
        background:var(--tc-bg-tertiary);
        border-radius:8px;
        border:1px solid var(--tc-border);
      }
      .truthcart-compare-verdict-icon { font-size:16px; flex-shrink:0; }
      .truthcart-compare-verdict-text {
        font-size:11px; color:var(--tc-text-secondary);
        font-weight:500; line-height:1.4;
      }

      /* ---- INSIGHT CARDS ---- */
      .truthcart-insight-cards {
        display:grid; grid-template-columns:1fr 1fr;
        gap:8px;
      }
      .truthcart-card {
        border-radius:10px; padding:12px;
        border:1px solid var(--tc-border);
        background:var(--tc-bg-card);
        transition:all 0.25s var(--tc-ease-out);
      }
      .truthcart-card:hover {
        transform:translateY(-1px);
        box-shadow:0 4px 12px rgba(0,0,0,0.2);
      }
      .truthcart-card-good { border-color:rgba(52,211,153,0.2); }
      .truthcart-card-good:hover { border-color:rgba(52,211,153,0.4); }
      .truthcart-card-warn { border-color:rgba(245,158,11,0.2); }
      .truthcart-card-warn:hover { border-color:rgba(245,158,11,0.4); }
      .truthcart-card-bad { border-color:rgba(239,68,68,0.2); }
      .truthcart-card-bad:hover { border-color:rgba(239,68,68,0.4); }
      .truthcart-card-icon { margin-bottom:6px; display:flex; align-items:center; }
      .truthcart-card-content { }
      .truthcart-card-title {
        font-size:9px; color:var(--tc-text-muted);
        text-transform:uppercase; letter-spacing:0.4px;
        margin-bottom:3px;
      }
      .truthcart-card-value {
        font-size:13px; font-weight:700;
        margin-bottom:3px;
      }
      .truthcart-card-detail {
        font-size:10px; color:var(--tc-text-secondary);
        line-height:1.4;
      }
    `;
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.Overlay = Overlay;
}
