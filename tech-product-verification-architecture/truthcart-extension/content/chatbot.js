// TruthCart Standalone Chatbot
// Floating chat button + expandable chat panel
// Redesigned to match demo reference: blue/teal primary, dark gray bubbles,
// circular score ring, orange/yellow accent chips, glassmorphism aesthetic

const Chatbot = {
  _shadowRoot: null,
  _hostElement: null,
  _isOpen: false,
  _messages: [],
  _analysis: null,
  _product: null,
  _isSending: false,

  /**
   * Initialize the chatbot — inject floating button into page
   */
  init() {
    if (this._hostElement) return; // Already initialized

    // Create shadow host
    this._hostElement = document.createElement('div');
    this._hostElement.id = 'truthcart-chatbot-host';
    this._hostElement.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483646;
      pointer-events: none;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    document.body.appendChild(this._hostElement);

    // Create shadow DOM
    this._shadowRoot = this._hostElement.attachShadow({ mode: 'closed' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = this._getStyles();
    this._shadowRoot.appendChild(styleEl);

    // Build the floating button
    this._renderFloatingButton();

    console.log('[TruthCart] Chatbot initialized');
  },

  /**
   * Set the analysis context for chat responses
   */
  setContext(analysis, product) {
    this._analysis = analysis;
    this._product = product;

    // If chat is open, update the header score and add context message
    if (this._isOpen) {
      this._updateHeaderScore();
      if (this._messages.length <= 1) {
        this._addBotMessage(`I've analyzed **${product.title || 'this product'}**. Ask me anything about its truth score, claims, camera, battery, build quality, or community feedback.`);
      }
    }
  },

  /**
   * Get the truth score from analysis data
   */
  _getTruthScore() {
    if (!this._analysis) return null;
    // Try various score paths from the analysis object
    if (this._analysis.truthScore !== undefined) return this._analysis.truthScore;
    if (this._analysis.score !== undefined) return this._analysis.score;
    if (this._analysis.overallScore !== undefined) return this._analysis.overallScore;
    if (this._analysis.truth && this._analysis.truth.score !== undefined) return this._analysis.truth.score;
    if (this._analysis.scores && this._analysis.scores.overall !== undefined) return this._analysis.scores.overall;
    return null;
  },

  /**
   * Get score color based on value
   */
  _getScoreColor(score) {
    if (score === null) return '#6366F1'; // Indigo default
    if (score >= 75) return '#10B981'; // Emerald - good
    if (score >= 50) return '#F59E0B'; // Amber - moderate
    return '#EF4444'; // Red - poor
  },

  /**
   * Update the score ring in the header
   */
  _updateHeaderScore() {
    const score = this._getTruthScore();
    if (score === null) return;

    const scoreRing = this._shadowRoot.querySelector('.truthcart-chatbot-score-ring');
    const scoreNumber = this._shadowRoot.querySelector('.truthcart-chatbot-score-number');
    const scoreCircle = this._shadowRoot.querySelector('.truthcart-chatbot-score-progress');

    if (scoreNumber) scoreNumber.textContent = score;
    if (scoreCircle) {
      const circumference = 2 * Math.PI * 18; // radius = 18
      const offset = circumference - (score / 100) * circumference;
      scoreCircle.style.strokeDashoffset = offset;
      scoreCircle.style.stroke = this._getScoreColor(score);
    }
    if (scoreRing) {
      scoreRing.style.display = 'flex';
    }

    // Update status text
    const statusDot = this._shadowRoot.querySelector('.truthcart-chatbot-status-dot');
    const statusText = this._shadowRoot.querySelector('.truthcart-chatbot-header-status');
    if (statusDot) statusDot.style.background = '#10B981';
    if (statusText) {
      statusText.innerHTML = `<span class="truthcart-chatbot-status-dot" style="background:#10B981"></span> Analysis ready`;
    }

    // Re-render quick chips if analysis now available
    const existingChips = this._shadowRoot.querySelector('.truthcart-chatbot-chips');
    if (!existingChips) {
      const messagesArea = this._shadowRoot.querySelector('.truthcart-chatbot-messages');
      if (messagesArea) {
        const chips = this._buildQuickChips();
        messagesArea.parentNode.insertBefore(chips, messagesArea.nextSibling);
      }
    }
  },

  /**
   * Render the floating chat button
   */
  _renderFloatingButton() {
    // Remove existing button if any
    const existing = this._shadowRoot.querySelector('.truthcart-chatbot-fab');
    if (existing) existing.remove();

    const fab = document.createElement('button');
    fab.className = 'truthcart-chatbot-fab';
    fab.setAttribute('aria-label', 'Open TruthCart Chat');
    fab.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `;

    // Notification dot (shows when analysis is available)
    if (this._analysis) {
      const dot = document.createElement('span');
      dot.className = 'truthcart-chatbot-fab-dot';
      fab.appendChild(dot);
    }

    fab.addEventListener('click', () => this.toggle());

    this._shadowRoot.appendChild(fab);
  },

  /**
   * Toggle chat panel open/closed
   */
  toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  /**
   * Open the chat panel
   */
  open() {
    if (this._isOpen) return;
    this._isOpen = true;

    // Hide FAB
    const fab = this._shadowRoot.querySelector('.truthcart-chatbot-fab');
    if (fab) fab.classList.add('truthcart-chatbot-fab-hidden');

    // Build chat panel
    const panel = this._buildChatPanel();
    this._shadowRoot.appendChild(panel);

    // Focus input after animation
    setTimeout(() => {
      const input = this._shadowRoot.querySelector('.truthcart-chatbot-input');
      if (input) input.focus();
    }, 300);

    console.log('[TruthCart] Chatbot opened');
  },

  /**
   * Close the chat panel
   */
  close() {
    if (!this._isOpen) return;
    this._isOpen = false;

    const panel = this._shadowRoot.querySelector('.truthcart-chatbot-panel');
    if (panel) {
      panel.classList.add('truthcart-chatbot-panel-closing');
      setTimeout(() => {
        panel.remove();
      }, 250);
    }

    // Show FAB
    const fab = this._shadowRoot.querySelector('.truthcart-chatbot-fab');
    if (fab) fab.classList.remove('truthcart-chatbot-fab-hidden');

    console.log('[TruthCart] Chatbot closed');
  },

  /**
   * Build the complete chat panel
   */
  _buildChatPanel() {
    const panel = document.createElement('div');
    panel.className = 'truthcart-chatbot-panel';

    // Header
    panel.appendChild(this._buildChatHeader());

    // Messages area
    const messagesArea = document.createElement('div');
    messagesArea.className = 'truthcart-chatbot-messages';
    messagesArea.id = 'truthcart-chatbot-messages';

    // Add existing messages
    this._messages.forEach(msg => {
      messagesArea.appendChild(this._buildMessageBubble(msg.role, msg.text));
    });

    // If no messages, add welcome
    if (this._messages.length === 0) {
      const welcomeText = this._analysis
        ? `I've analyzed **${this._product?.title || 'this product'}**. Ask me anything about its truth score, claims, camera, battery, build quality, or community feedback.`
        : `Hi! I'm TruthCart AI. I can help you verify product claims and marketing honesty. Navigate to a product page and I'll analyze it for you.`;
      this._messages.push({ role: 'bot', text: welcomeText });
      messagesArea.appendChild(this._buildMessageBubble('bot', welcomeText));
    }

    panel.appendChild(messagesArea);

    // Quick action chips
    if (this._analysis) {
      panel.appendChild(this._buildQuickChips());
    }

    // Input area
    panel.appendChild(this._buildInputArea());

    return panel;
  },

  /**
   * Build chat header with score ring (Demo 1/2/3 style)
   */
  _buildChatHeader() {
    const header = document.createElement('div');
    header.className = 'truthcart-chatbot-header';

    const left = document.createElement('div');
    left.className = 'truthcart-chatbot-header-left';

    // Circular score ring (Demo 1 & 2 style)
    const score = this._getTruthScore();
    const scoreRing = document.createElement('div');
    scoreRing.className = 'truthcart-chatbot-score-ring';
    scoreRing.style.display = score !== null ? 'flex' : 'none';

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '42');
    svg.setAttribute('height', '42');
    svg.setAttribute('viewBox', '0 0 42 42');

    // Background circle
    const bgCircle = document.createElementNS(svgNS, 'circle');
    bgCircle.setAttribute('cx', '21');
    bgCircle.setAttribute('cy', '21');
    bgCircle.setAttribute('r', '18');
    bgCircle.setAttribute('fill', 'none');
    bgCircle.setAttribute('stroke', 'rgba(255,255,255,0.08)');
    bgCircle.setAttribute('stroke-width', '3');
    svg.appendChild(bgCircle);

    // Progress circle
    const circumference = 2 * Math.PI * 18;
    const progressCircle = document.createElementNS(svgNS, 'circle');
    progressCircle.setAttribute('cx', '21');
    progressCircle.setAttribute('cy', '21');
    progressCircle.setAttribute('r', '18');
    progressCircle.setAttribute('fill', 'none');
    progressCircle.setAttribute('stroke-width', '3');
    progressCircle.setAttribute('stroke-linecap', 'round');
    progressCircle.setAttribute('stroke-dasharray', circumference.toString());
    if (score !== null) {
      const offset = circumference - (score / 100) * circumference;
      progressCircle.setAttribute('stroke-dashoffset', offset.toString());
      progressCircle.setAttribute('stroke', this._getScoreColor(score));
    }
    progressCircle.classList.add('truthcart-chatbot-score-progress');
    // Rotate to start from top
    progressCircle.style.transform = 'rotate(-90deg)';
    progressCircle.style.transformOrigin = 'center';
    progressCircle.style.transition = 'stroke-dashoffset 0.8s ease, stroke 0.5s ease';
    svg.appendChild(progressCircle);

    scoreRing.appendChild(svg);

    // Score number overlay
    const scoreNumber = document.createElement('div');
    scoreNumber.className = 'truthcart-chatbot-score-number';
    scoreNumber.textContent = score !== null ? score : '--';
    scoreRing.appendChild(scoreNumber);

    left.appendChild(scoreRing);

    // Title area
    const titleArea = document.createElement('div');
    titleArea.className = 'truthcart-chatbot-header-title-area';

    const title = document.createElement('div');
    title.className = 'truthcart-chatbot-header-title';
    title.textContent = 'TRUTHCART AI';
    titleArea.appendChild(title);

    const status = document.createElement('div');
    status.className = 'truthcart-chatbot-header-status';
    status.innerHTML = `<span class="truthcart-chatbot-status-dot" style="background:${this._analysis ? '#10B981' : '#64748B'}"></span> ${this._analysis ? 'Analysis ready' : 'Waiting for analysis'}`;
    titleArea.appendChild(status);

    left.appendChild(titleArea);
    header.appendChild(left);

    const right = document.createElement('div');
    right.className = 'truthcart-chatbot-header-right';

    // Minimize button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'truthcart-chatbot-header-btn';
    minimizeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    minimizeBtn.setAttribute('aria-label', 'Minimize chat');
    minimizeBtn.addEventListener('click', () => this.close());
    right.appendChild(minimizeBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'truthcart-chatbot-header-btn truthcart-chatbot-close-btn';
    closeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.addEventListener('click', () => {
      this._messages = [];
      this.close();
    });
    right.appendChild(closeBtn);

    header.appendChild(right);

    return header;
  },

  /**
   * Build quick action chips with orange/yellow accent (Demo 1 style)
   */
  _buildQuickChips() {
    const container = document.createElement('div');
    container.className = 'truthcart-chatbot-chips';

    const chips = [
      { label: '⬤ TRUTH SCORE', question: 'What is the truth score?', variant: 'score' },
      { label: '⬤ CLAIMS', question: 'What claims are misleading?', variant: 'claims' },
      { label: '⬤ SHOULD I BUY?', question: 'Should I buy this product?', variant: 'buy' },
      { label: '⬤ REDDIT', question: 'What does Reddit say?', variant: 'reddit' },
    ];

    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = `truthcart-chatbot-chip truthcart-chatbot-chip-${chip.variant}`;
      btn.textContent = chip.label;
      btn.addEventListener('click', () => {
        this._sendMessage(chip.question);
      });
      container.appendChild(btn);
    });

    return container;
  },

  /**
   * Build input area with text field and blue send button (Demo 3 style)
   */
  _buildInputArea() {
    const inputArea = document.createElement('div');
    inputArea.className = 'truthcart-chatbot-input-area';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'truthcart-chatbot-input';
    input.placeholder = 'Ask about this product...';
    input.setAttribute('aria-label', 'Type your question');

    const sendBtn = document.createElement('button');
    sendBtn.className = 'truthcart-chatbot-send-btn';
    sendBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    sendBtn.setAttribute('aria-label', 'Send question');

    const handleSend = () => {
      const question = input.value.trim();
      if (!question || this._isSending) return;
      input.value = '';
      this._sendMessage(question);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);

    return inputArea;
  },

  /**
   * Build a single message bubble (Demo 3 dark gray style)
   */
  _buildMessageBubble(role, text) {
    const msg = document.createElement('div');
    msg.className = `truthcart-chatbot-msg truthcart-chatbot-msg-${role}`;

    if (role === 'bot') {
      const avatar = document.createElement('div');
      avatar.className = 'truthcart-chatbot-msg-avatar';
      avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      msg.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'truthcart-chatbot-bubble';
    // Parse markdown-style bold, newlines, and list items
    const formatted = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    bubble.innerHTML = formatted;
    msg.appendChild(bubble);

    return msg;
  },

  /**
   * Build typing indicator
   */
  _buildTypingIndicator() {
    const msg = document.createElement('div');
    msg.className = 'truthcart-chatbot-msg truthcart-chatbot-msg-bot';
    msg.id = 'truthcart-chatbot-typing';

    const avatar = document.createElement('div');
    avatar.className = 'truthcart-chatbot-msg-avatar';
    avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    msg.appendChild(avatar);

    const bubble = document.createElement('div');
    bubble.className = 'truthcart-chatbot-typing';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'truthcart-chatbot-typing-dot';
      bubble.appendChild(dot);
    }

    msg.appendChild(bubble);
    return msg;
  },

  /**
   * Send a message and get a response
   */
  async _sendMessage(question) {
    if (this._isSending) return;

    const messagesArea = this._shadowRoot.querySelector('.truthcart-chatbot-messages');
    if (!messagesArea) return;

    // Add user message
    this._messages.push({ role: 'user', text: question });
    const userBubble = this._buildMessageBubble('user', question);
    messagesArea.appendChild(userBubble);
    this._scrollToBottom();

    // Disable input
    this._isSending = true;
    const input = this._shadowRoot.querySelector('.truthcart-chatbot-input');
    const sendBtn = this._shadowRoot.querySelector('.truthcart-chatbot-send-btn');
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    // Add typing indicator
    const typing = this._buildTypingIndicator();
    messagesArea.appendChild(typing);
    this._scrollToBottom();

    try {
      // Try to get analysis context
      const analysis = this._analysis || (window.TruthCart && window.TruthCart.getCurrentAnalysis && window.TruthCart.getCurrentAnalysis());
      const product = this._product || (window.TruthCart && window.TruthCart.getCurrentProduct && window.TruthCart.getCurrentProduct());

      let answer;

      if (analysis && product) {
        // Use the backend chat API
        const { API, CONFIG } = window.TruthCart;
        const baseUrl = (CONFIG && CONFIG.API_BASE_URL) || 'http://localhost:3001';
        const response = await API.chat(baseUrl, question, analysis, product);
        answer = response.answer;
      } else {
        // No analysis available — provide fallback response
        answer = this._generateFallbackResponse(question);
      }

      // Remove typing indicator
      const typingEl = messagesArea.querySelector('#truthcart-chatbot-typing');
      if (typingEl) typingEl.remove();

      // Add bot response
      this._messages.push({ role: 'bot', text: answer });
      const botBubble = this._buildMessageBubble('bot', answer);
      messagesArea.appendChild(botBubble);

    } catch (err) {
      // Remove typing indicator
      const typingEl = messagesArea.querySelector('#truthcart-chatbot-typing');
      if (typingEl) typingEl.remove();

      // Error message
      const errorText = 'Sorry, I couldn\'t process your question. The backend may be offline. Make sure the TruthCart server is running at localhost:3001.';
      this._messages.push({ role: 'bot', text: errorText });
      const errBubble = this._buildMessageBubble('bot', errorText);
      messagesArea.appendChild(errBubble);
    }

    // Re-enable input
    this._isSending = false;
    if (input) { input.disabled = false; input.focus(); }
    if (sendBtn) sendBtn.disabled = false;
    this._scrollToBottom();
  },

  /**
   * Add a bot message (for external triggers)
   */
  _addBotMessage(text) {
    const messagesArea = this._shadowRoot.querySelector('.truthcart-chatbot-messages');
    if (!messagesArea) return;

    this._messages.push({ role: 'bot', text });
    const bubble = this._buildMessageBubble('bot', text);
    messagesArea.appendChild(bubble);
    this._scrollToBottom();
  },

  /**
   * Generate fallback response when no analysis is available
   */
  _generateFallbackResponse(question) {
    const q = question.toLowerCase();

    if (q.length < 5) {
      return 'Could you be more specific? I can help verify product claims once I have analysis data.';
    }

    if (/score|truth|reliable|honest/i.test(q)) {
      return 'I don\'t have analysis data for this page yet. Navigate to a supported product page (Amazon, Flipkart, Best Buy, Walmart) and I\'ll analyze it for you. The truth score will show how honest the marketing claims are.';
    }

    if (/camera|battery|build|material|price|buy|recommend/i.test(q)) {
      return 'I need to analyze a product first before I can answer specific questions. Please navigate to a product page on Amazon, Flipkart, Best Buy, or Walmart, and I\'ll provide detailed verification.';
    }

    return 'I\'m TruthCart AI, your product truth verification assistant. To get started, navigate to a product page on Amazon, Flipkart, Best Buy, or Walmart. I\'ll analyze the product and answer questions about its claims, score, and community feedback.';
  },

  /**
   * Scroll messages to bottom
   */
  _scrollToBottom() {
    const messagesArea = this._shadowRoot.querySelector('.truthcart-chatbot-messages');
    if (messagesArea) {
      requestAnimationFrame(() => {
        messagesArea.scrollTop = messagesArea.scrollHeight;
      });
    }
  },

  /**
   * Get all chatbot CSS styles — inlined for Shadow DOM
   * Redesigned to match demo references: blue/teal primary, dark gray bubbles,
   * circular score ring, orange/yellow accent chips, glassmorphism aesthetic
   */
  _getStyles() {
    return `
      :host {
        --cb-bg: #080B14;
        --cb-bg-secondary: #0C1021;
        --cb-bg-card: #111827;
        --cb-bg-bubble: #1A2236;
        --cb-bg-input: #131B2A;
        --cb-border: #1E293B;
        --cb-border-light: #2D3A4F;
        --cb-text: #F1F5F9;
        --cb-text-secondary: #CBD5E1;
        --cb-text-muted: #64748B;
        --cb-blue: #3B82F6;
        --cb-blue-dim: #2563EB;
        --cb-teal: #06B6D4;
        --cb-indigo: #6366F1;
        --cb-emerald: #10B981;
        --cb-red: #EF4444;
        --cb-amber: #F59E0B;
        --cb-orange: #F97316;
        --cb-gradient: linear-gradient(135deg, #3B82F6, #6366F1);
        --cb-gradient-teal: linear-gradient(135deg, #06B6D4, #3B82F6);
        --cb-radius: 16px;
        --cb-radius-sm: 10px;
        --cb-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
        --cb-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        --cb-ease: cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* ---- FLOATING ACTION BUTTON ---- */
      @keyframes cbFabEnter {
        0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
        60%  { transform: scale(1.15) rotate(10deg); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes cbFabPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        50%      { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); }
      }
      @keyframes cbDotPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50%      { transform: scale(1.5); opacity: 0.7; }
      }

      .truthcart-chatbot-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: var(--cb-gradient);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35), 0 0 0 1px rgba(255,255,255,0.05) inset;
        transition: all 0.3s var(--cb-ease);
        animation: cbFabEnter 0.5s var(--cb-ease) both;
        z-index: 1;
        position: relative;
      }
      .truthcart-chatbot-fab:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 28px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(255,255,255,0.08) inset;
      }
      .truthcart-chatbot-fab:active {
        transform: scale(0.95);
      }
      .truthcart-chatbot-fab-hidden {
        transform: scale(0) !important;
        opacity: 0 !important;
        pointer-events: none !important;
        transition: all 0.25s var(--cb-ease);
      }

      /* Notification dot */
      .truthcart-chatbot-fab-dot {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--cb-blue);
        border: 2px solid var(--cb-bg);
        animation: cbDotPulse 2s ease-in-out infinite;
      }

      /* ---- CHAT PANEL ---- */
      @keyframes cbPanelOpen {
        0%   { opacity: 0; transform: translateY(20px) scale(0.95); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes cbPanelClose {
        0%   { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(20px) scale(0.95); }
      }

      .truthcart-chatbot-panel {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 380px;
        height: 560px;
        background: var(--cb-bg);
        border: 1px solid var(--cb-border);
        border-radius: var(--cb-radius);
        box-shadow: var(--cb-shadow), 0 0 0 1px rgba(255,255,255,0.03) inset;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        pointer-events: auto;
        animation: cbPanelOpen 0.35s var(--cb-ease) both;
      }
      .truthcart-chatbot-panel-closing {
        animation: cbPanelClose 0.25s var(--cb-ease) both;
      }

      /* Glow border effect — blue/indigo gradient */
      .truthcart-chatbot-panel::before {
        content: '';
        position: absolute;
        top: -1px; left: -1px; right: -1px; bottom: -1px;
        border-radius: var(--cb-radius);
        background: linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.2), rgba(6,182,212,0.15));
        z-index: -1;
        opacity: 0.7;
        pointer-events: none;
      }

      /* ---- HEADER ---- */
      .truthcart-chatbot-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        background: linear-gradient(180deg, #0F1629, #0C1021);
        border-bottom: 1px solid var(--cb-border);
        flex-shrink: 0;
      }
      .truthcart-chatbot-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      /* ---- CIRCULAR SCORE RING (Demo 1/2 style) ---- */
      .truthcart-chatbot-score-ring {
        position: relative;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .truthcart-chatbot-score-ring svg {
        position: absolute;
        top: 0;
        left: 0;
      }
      .truthcart-chatbot-score-number {
        position: relative;
        z-index: 1;
        font-size: 12px;
        font-weight: 700;
        color: var(--cb-text);
        font-family: var(--cb-font);
      }

      .truthcart-chatbot-header-title-area {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .truthcart-chatbot-header-title {
        font-size: 13px;
        font-weight: 800;
        color: var(--cb-text);
        font-family: var(--cb-font);
        letter-spacing: 0.5px;
      }
      .truthcart-chatbot-header-status {
        font-size: 11px;
        color: var(--cb-text-muted);
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: var(--cb-font);
      }
      .truthcart-chatbot-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        display: inline-block;
      }
      .truthcart-chatbot-header-right {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .truthcart-chatbot-header-btn {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--cb-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .truthcart-chatbot-header-btn:hover {
        background: var(--cb-bg-card);
        color: var(--cb-text);
      }
      .truthcart-chatbot-close-btn:hover {
        background: rgba(239, 68, 68, 0.15);
        color: var(--cb-red);
      }

      /* ---- MESSAGES AREA ---- */
      @keyframes cbMsgIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .truthcart-chatbot-messages {
        flex: 1;
        padding: 16px 14px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        scrollbar-width: thin;
        scrollbar-color: var(--cb-border) transparent;
      }
      .truthcart-chatbot-messages::-webkit-scrollbar { width: 4px; }
      .truthcart-chatbot-messages::-webkit-scrollbar-thumb {
        background: var(--cb-border);
        border-radius: 2px;
      }

      .truthcart-chatbot-msg {
        display: flex;
        gap: 8px;
        animation: cbMsgIn 0.3s var(--cb-ease) both;
      }
      .truthcart-chatbot-msg-bot {
        align-items: flex-start;
      }
      .truthcart-chatbot-msg-user {
        justify-content: flex-end;
      }

      .truthcart-chatbot-msg-avatar {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(59, 130, 246, 0.15);
        color: var(--cb-blue);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      /* ---- MESSAGE BUBBLES (Demo 3 dark gray style) ---- */
      .truthcart-chatbot-bubble {
        max-width: 82%;
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 12.5px;
        line-height: 1.55;
        word-wrap: break-word;
        font-family: var(--cb-font);
      }
      /* Bot bubble: dark card with subtle border */
      .truthcart-chatbot-msg-bot .truthcart-chatbot-bubble {
        background: #1A2236;
        color: var(--cb-text-secondary);
        border: 1px solid var(--cb-border);
        border-top-left-radius: 4px;
      }
      /* User bubble: solid dark gray (#2D3748-like) matching Demo 3 */
      .truthcart-chatbot-msg-user .truthcart-chatbot-bubble {
        background: #2D3748;
        color: var(--cb-text);
        border: 1px solid #3D4A5C;
        border-top-right-radius: 4px;
      }
      .truthcart-chatbot-bubble strong {
        color: var(--cb-text);
        font-weight: 600;
      }

      /* Typing indicator */
      @keyframes cbTypingBounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40% { transform: translateY(-5px); opacity: 1; }
      }

      .truthcart-chatbot-typing {
        display: flex;
        gap: 4px;
        padding: 10px 16px;
        background: #1A2236;
        border: 1px solid var(--cb-border);
        border-radius: 14px;
        border-top-left-radius: 4px;
      }
      .truthcart-chatbot-typing-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--cb-blue);
        animation: cbTypingBounce 1.2s ease-in-out infinite;
      }
      .truthcart-chatbot-typing-dot:nth-child(2) { animation-delay: 0.15s; }
      .truthcart-chatbot-typing-dot:nth-child(3) { animation-delay: 0.3s; }

      /* ---- QUICK CHIPS (Demo 1 orange/yellow accent style) ---- */
      @keyframes cbChipIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .truthcart-chatbot-chips {
        display: flex;
        gap: 6px;
        padding: 8px 14px;
        overflow-x: auto;
        flex-shrink: 0;
        scrollbar-width: none;
      }
      .truthcart-chatbot-chips::-webkit-scrollbar { display: none; }

      .truthcart-chatbot-chip {
        padding: 6px 12px;
        border-radius: 100px;
        border: 1px solid var(--cb-border);
        background: var(--cb-bg-card);
        color: var(--cb-text-secondary);
        font-size: 10px;
        font-weight: 600;
        font-family: var(--cb-font);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
        animation: cbChipIn 0.3s var(--cb-ease) both;
        letter-spacing: 0.3px;
      }
      .truthcart-chatbot-chip:nth-child(1) { animation-delay: 0.05s; }
      .truthcart-chatbot-chip:nth-child(2) { animation-delay: 0.1s; }
      .truthcart-chatbot-chip:nth-child(3) { animation-delay: 0.15s; }
      .truthcart-chatbot-chip:nth-child(4) { animation-delay: 0.2s; }

      /* Chip variant colors — matching Demo 1 category tags */
      .truthcart-chatbot-chip-score {
        border-color: rgba(245, 158, 11, 0.3);
        color: #F59E0B;
      }
      .truthcart-chatbot-chip-score::before {
        color: #F59E0B;
      }
      .truthcart-chatbot-chip-claims {
        border-color: rgba(239, 68, 68, 0.3);
        color: #F87171;
      }
      .truthcart-chatbot-chip-buy {
        border-color: rgba(16, 185, 129, 0.3);
        color: #34D399;
      }
      .truthcart-chatbot-chip-reddit {
        border-color: rgba(249, 115, 22, 0.3);
        color: #FB923C;
      }

      .truthcart-chatbot-chip:hover {
        transform: translateY(-1px);
        background: rgba(255,255,255,0.05);
      }
      .truthcart-chatbot-chip-score:hover {
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.5);
      }
      .truthcart-chatbot-chip-claims:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.5);
      }
      .truthcart-chatbot-chip-buy:hover {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.5);
      }
      .truthcart-chatbot-chip-reddit:hover {
        background: rgba(249, 115, 22, 0.1);
        border-color: rgba(249, 115, 22, 0.5);
      }

      /* ---- INPUT AREA (Demo 3 style) ---- */
      .truthcart-chatbot-input-area {
        display: flex;
        gap: 8px;
        padding: 12px 14px;
        background: var(--cb-bg-secondary);
        border-top: 1px solid var(--cb-border);
        flex-shrink: 0;
      }
      .truthcart-chatbot-input {
        flex: 1;
        padding: 10px 16px;
        border-radius: 12px;
        border: 1px solid var(--cb-border);
        background: var(--cb-bg-bubble);
        color: var(--cb-text);
        font-size: 13px;
        font-family: var(--cb-font);
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .truthcart-chatbot-input:focus {
        border-color: var(--cb-blue);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
      }
      .truthcart-chatbot-input::placeholder {
        color: var(--cb-text-muted);
      }
      .truthcart-chatbot-input:disabled {
        opacity: 0.5;
      }

      /* Blue circular send button (Demo 3 style) */
      .truthcart-chatbot-send-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: none;
        background: var(--cb-gradient);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.25s var(--cb-ease);
        flex-shrink: 0;
      }
      .truthcart-chatbot-send-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 0 14px rgba(59, 130, 246, 0.4);
      }
      .truthcart-chatbot-send-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }
    `;
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.Chatbot = Chatbot;
}
