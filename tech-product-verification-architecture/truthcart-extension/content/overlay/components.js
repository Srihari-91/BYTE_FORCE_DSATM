// TruthCart Extension Overlay Components
// Pure DOM-based UI components rendered inside Shadow DOM
// Matches the Truth Score Analysis design from screenshots

const OverlayComponents = {
  /**
   * Build the complete analysis overlay
   * @param {Object} analysis - Result from backend
   * @param {Object} product - Normalized product data
   * @returns {HTMLElement} Root overlay element
   */
  buildOverlay(analysis, product) {
    const root = document.createElement('div');
    root.className = 'truthcart-overlay-root';

    // Header: "Truth Score Analysis" + fingerprint + close
    root.appendChild(this._buildHeader(analysis, product));

    // Tab bar
    root.appendChild(this._buildTabBar());

    // Tab content container
    const tabContent = document.createElement('div');
    tabContent.className = 'truthcart-tab-content';

    // === ANALYSIS TAB (default) ===
    const analysisTab = document.createElement('div');
    analysisTab.className = 'truthcart-tab-panel truthcart-tab-active';
    analysisTab.dataset.tab = 'analysis';

    // Main section: Product info (left) + Score ring (right)
    analysisTab.appendChild(this._buildMainSection(analysis, product));

    // Score Breakdown: 5 horizontal bars
    analysisTab.appendChild(this._buildScoreBreakdown(analysis));

    // Claims list with icons
    if (analysis.flags && analysis.flags.length > 0) {
      analysisTab.appendChild(this._buildClaimsSection(analysis.flags));
    }

    // Pipeline stats — visible performance metrics
    analysisTab.appendChild(this._buildPipelineStats(analysis));

    // "More detail" expandable section
    analysisTab.appendChild(this._buildExpandSection(analysis));

    tabContent.appendChild(analysisTab);

    // === TRUST COPILOT TAB ===
    const copilotTab = document.createElement('div');
    copilotTab.className = 'truthcart-tab-panel';
    copilotTab.dataset.tab = 'copilot';
    copilotTab.appendChild(this._buildCopilotSection(analysis, product));
    tabContent.appendChild(copilotTab);

    // === INSIGHTS TAB ===
    const insightsTab = document.createElement('div');
    insightsTab.className = 'truthcart-tab-panel';
    insightsTab.dataset.tab = 'insights';
    insightsTab.appendChild(this._buildInsightsView(analysis, product));
    tabContent.appendChild(insightsTab);

    root.appendChild(tabContent);

    // Footer — shown on all tabs
    root.appendChild(this._buildFooter(analysis, product));

    // Wire up tab switching
    setTimeout(() => this._wireTabSwitching(root, tabContent), 0);

    return root;
  },

  /**
   * Build pill-style tab bar: Analysis | Copilot | Insights
   */
  _buildTabBar() {
    const bar = document.createElement('div');
    bar.className = 'truthcart-tab-bar';

    const tabs = [
      { id: 'analysis', label: 'Analysis', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>' },
      { id: 'copilot', label: 'Copilot', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
      { id: 'insights', label: 'Insights', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' }
    ];

    tabs.forEach(t => {
      const btn = document.createElement('button');
      btn.className = `truthcart-tab-btn ${t.id === 'analysis' ? 'active' : ''}`;
      btn.dataset.tab = t.id;
      btn.innerHTML = t.icon + '<span>' + t.label + '</span>';
      bar.appendChild(btn);
    });

    return bar;
  },

  /**
   * Wire up tab switching
   */
  _wireTabSwitching(root, tabContent) {
    const btns = root.querySelectorAll('.truthcart-tab-btn');
    const panels = tabContent.querySelectorAll('.truthcart-tab-panel');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        panels.forEach(p => {
          p.classList.toggle('truthcart-tab-active', p.dataset.tab === tabId);
        });
      });
    });
  },

  /**
   * Build header with "Truth Score Analysis" title, fingerprint, and close button
   */
  _buildHeader(analysis, product) {
    const header = document.createElement('div');
    header.className = 'truthcart-header';

    const left = document.createElement('div');
    left.className = 'truthcart-header-left';

    // Shield icon
    const shield = document.createElement('span');
    shield.className = 'truthcart-shield-icon';
    shield.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    left.appendChild(shield);

    const title = document.createElement('span');
    title.className = 'truthcart-header-title';
    title.textContent = 'Truth Score Analysis';
    left.appendChild(title);

    header.appendChild(left);

    const right = document.createElement('div');
    right.className = 'truthcart-header-right';

    // Fingerprint
    const fingerprint = document.createElement('span');
    fingerprint.className = 'truthcart-fingerprint';
    fingerprint.textContent = `fingerprint: ${(analysis.meta && analysis.meta.product_id) || product.fingerprint || '—'}`;
    right.appendChild(fingerprint);

    // Green dot
    const dot = document.createElement('span');
    dot.className = 'truthcart-online-dot';
    right.appendChild(dot);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'truthcart-close-btn';
    closeBtn.innerHTML = '&#x2715;';
    closeBtn.setAttribute('aria-label', 'Close overlay');
    closeBtn.addEventListener('click', () => {
      window.TruthCart.Overlay.hide();
    });
    right.appendChild(closeBtn);

    header.appendChild(right);

    return header;
  },

  /**
   * Build main two-column section: Product info (left) + Score ring (right)
   */
  _buildMainSection(analysis, product) {
    const section = document.createElement('div');
    section.className = 'truthcart-main-section';

    // Left: Product info
    section.appendChild(this._buildProductInfo(analysis, product));

    // Right: Score ring
    section.appendChild(this._buildScoreRing(analysis));

    return section;
  },

  /**
   * Build product info block (left column)
   */
  _buildProductInfo(analysis, product) {
    const info = document.createElement('div');
    info.className = 'truthcart-product-info';

    // Source badge row
    const sourceRow = document.createElement('div');
    sourceRow.className = 'truthcart-source-row';

    const sourceBadge = document.createElement('span');
    sourceBadge.className = 'truthcart-source-badge';
    const source = (analysis.meta && analysis.meta.source) || product.source || 'unknown';
    sourceBadge.textContent = source.includes('.') ? source : source + '.com';
    sourceRow.appendChild(sourceBadge);

    const confidence = document.createElement('span');
    confidence.className = 'truthcart-confidence-text';
    const confVal = (analysis.meta && analysis.meta.extraction_confidence) || 0.91;
    confidence.textContent = `Confidence: ${Math.round(confVal * 100)}%`;
    sourceRow.appendChild(confidence);

    info.appendChild(sourceRow);

    // Product name
    const name = document.createElement('div');
    name.className = 'truthcart-product-name';
    name.textContent = product.title || 'Product Analysis';
    info.appendChild(name);

    // Brand · Category
    const brandCat = document.createElement('div');
    brandCat.className = 'truthcart-brand-category';
    const brand = product.brand || '';
    const category = product.category || '';
    brandCat.textContent = brand && category ? `${brand} · ${category}` : brand || category;
    info.appendChild(brandCat);

    // Price + Rating row
    const priceRatingRow = document.createElement('div');
    priceRatingRow.className = 'truthcart-price-rating-row';

    if (product.price) {
      const price = document.createElement('span');
      price.className = 'truthcart-product-price';
      price.textContent = `${product.currency || '$'}${product.price}`;
      priceRatingRow.appendChild(price);
    }

    if (product.rating) {
      const rating = document.createElement('div');
      rating.className = 'truthcart-product-rating';
      rating.innerHTML = `<span class="truthcart-star">&#9733;</span> ${product.rating}${product.review_count ? ` (${product.review_count.toLocaleString()})` : ''}`;
      priceRatingRow.appendChild(rating);
    }

    info.appendChild(priceRatingRow);

    // Verdict badge
    const score = analysis.truth_score || 0;
    const verdictData = this._getVerdictData(score);

    const verdictBadge = document.createElement('div');
    verdictBadge.className = `truthcart-verdict-badge verdict-${verdictData.key}`;
    verdictBadge.innerHTML = `${verdictData.icon} ${verdictData.text}`;
    info.appendChild(verdictBadge);

    return info;
  },

  /**
   * Build score ring (right column) — SVG ring with count-up animation
   */
  _buildScoreRing(analysis) {
    const score = analysis.truth_score || 0;
    const container = document.createElement('div');
    container.className = 'truthcart-score-ring-container';

    // Gauge wrapper
    const gauge = document.createElement('div');
    gauge.className = 'truthcart-gauge';

    // Floating particles
    for (let i = 1; i <= 5; i++) {
      const particle = document.createElement('div');
      particle.className = `truthcart-particle p${i}`;
      gauge.appendChild(particle);
    }

    // SVG Ring Gauge
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', `truthcart-gauge-svg`);
    svg.setAttribute('viewBox', '0 0 120 120');

    // Gradient definitions
    const defs = document.createElementNS(svgNS, 'defs');

    const createGradient = (id, color1, color2) => {
      const grad = document.createElementNS(svgNS, 'linearGradient');
      grad.setAttribute('id', id);
      grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
      const stop1 = document.createElementNS(svgNS, 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', color1);
      const stop2 = document.createElementNS(svgNS, 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', color2);
      grad.appendChild(stop1);
      grad.appendChild(stop2);
      return grad;
    };

    const colors = this._getScoreColors(score);
    defs.appendChild(createGradient('gaugeGradient', colors.start, colors.end));

    // Glow filter
    const filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', 'gaugeGlow');
    const feGauss = document.createElementNS(svgNS, 'feGaussianBlur');
    feGauss.setAttribute('stdDeviation', '2.5');
    feGauss.setAttribute('result', 'blur');
    filter.appendChild(feGauss);
    const feMerge = document.createElementNS(svgNS, 'feMerge');
    const feMergeNode1 = document.createElementNS(svgNS, 'feMergeNode');
    feMergeNode1.setAttribute('in', 'blur');
    const feMergeNode2 = document.createElementNS(svgNS, 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feMerge);
    defs.appendChild(filter);

    svg.appendChild(defs);

    // Track ring (background)
    const track = document.createElementNS(svgNS, 'circle');
    track.setAttribute('class', 'truthcart-gauge-track');
    track.setAttribute('cx', '60');
    track.setAttribute('cy', '60');
    track.setAttribute('r', '50');
    svg.appendChild(track);

    // Progress ring
    const circumference = 2 * Math.PI * 50;
    const progress = document.createElementNS(svgNS, 'circle');
    progress.setAttribute('class', 'truthcart-gauge-progress animating');
    progress.setAttribute('cx', '60');
    progress.setAttribute('cy', '60');
    progress.setAttribute('r', '50');
    progress.setAttribute('stroke-dasharray', circumference);
    progress.setAttribute('stroke-dashoffset', circumference);
    progress.setAttribute('stroke-linecap', 'round');
    progress.style.setProperty('--gauge-circumference', circumference);
    progress.style.setProperty('--gauge-offset', circumference * (1 - score / 100));
    progress.style.filter = 'url(#gaugeGlow)';
    progress.style.stroke = 'url(#gaugeGradient)';
    svg.appendChild(progress);

    // Animate stroke-dashoffset after render
    setTimeout(() => {
      progress.setAttribute('stroke-dashoffset', circumference * (1 - score / 100));
    }, 100);

    gauge.appendChild(svg);

    // Score text in center
    const center = document.createElement('div');
    center.className = 'truthcart-gauge-center';

    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'truthcart-score-value';
    scoreSpan.textContent = '0';
    scoreSpan.setAttribute('data-target', score);
    scoreSpan.style.color = colors.main;
    center.appendChild(scoreSpan);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'truthcart-score-label-main';
    labelSpan.textContent = colors.label;
    labelSpan.style.color = colors.main;
    center.appendChild(labelSpan);

    const outOf = document.createElement('span');
    outOf.className = 'truthcart-score-outof';
    outOf.textContent = 'out of 100';
    center.appendChild(outOf);

    gauge.appendChild(center);

    // Count-up animation
    this._animateCountUp(scoreSpan, score, 800);

    container.appendChild(gauge);

    // Fusion note
    const fusion = document.createElement('div');
    fusion.className = 'truthcart-fusion-note';
    fusion.innerHTML = `<span class="truthcart-fusion-dot"></span> Fused: 70% analysis + 30% Reddit`;
    container.appendChild(fusion);

    return container;
  },

  /**
   * Build score breakdown section — 5 horizontal bars
   */
  _buildScoreBreakdown(analysis) {
    const section = document.createElement('div');
    section.className = 'truthcart-breakdown-section';

    const heading = document.createElement('div');
    heading.className = 'truthcart-breakdown-heading';
    heading.textContent = 'Score Breakdown';
    section.appendChild(heading);

    const breakdown = this._computeScoreBreakdown(analysis);

    breakdown.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'truthcart-breakdown-row';
      row.style.animationDelay = `${0.05 * idx}s`;

      const label = document.createElement('span');
      label.className = 'truthcart-breakdown-label';
      label.textContent = item.label;
      row.appendChild(label);

      const barWrapper = document.createElement('div');
      barWrapper.className = 'truthcart-breakdown-bar-wrapper';

      const bar = document.createElement('div');
      bar.className = `truthcart-breakdown-bar bar-${this._barColorClass(item.value)}`;
      bar.style.setProperty('--bar-target', `${item.value}%`);
      bar.style.width = '0%';
      barWrapper.appendChild(bar);

      // Animate bar fill after render
      setTimeout(() => {
        bar.style.width = `${item.value}%`;
      }, 200 + idx * 100);

      row.appendChild(barWrapper);

      const value = document.createElement('span');
      value.className = 'truthcart-breakdown-value';
      value.textContent = item.value;
      row.appendChild(value);

      section.appendChild(row);
    });

    return section;
  },

  /**
   * Build claims section — list with warning/cross icons
   */
  _buildClaimsSection(flags) {
    const section = document.createElement('div');
    section.className = 'truthcart-claims-section';

    // Warning summary
    const misleadingCount = flags.filter(f => f.severity === 'high' || f.severity === 'medium').length;
    const summaryRow = document.createElement('div');
    summaryRow.className = 'truthcart-claims-summary';

    const warningIcon = document.createElement('span');
    warningIcon.className = 'truthcart-warning-icon';
    warningIcon.textContent = '\u26A0\uFE0F';
    summaryRow.appendChild(warningIcon);

    const summaryText = document.createElement('span');
    summaryText.className = 'truthcart-claims-summary-text';
    summaryText.textContent = `${flags.length} misleading claim${flags.length !== 1 ? 's' : ''} detected`;
    summaryRow.appendChild(summaryText);

    section.appendChild(summaryRow);

    // Claim items
    const list = document.createElement('div');
    list.className = 'truthcart-claims-list';

    flags.slice(0, 6).forEach(flag => {
      const item = document.createElement('div');
      item.className = 'truthcart-claim-item';

      // Icon
      const icon = document.createElement('span');
      icon.className = 'truthcart-claim-icon';
      if (flag.severity === 'high') {
        icon.className += ' icon-critical';
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="9"/><line x1="7" y1="7" x2="13" y2="13" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="13" y1="7" x2="7" y2="13" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;
      } else if (flag.severity === 'medium') {
        icon.className += ' icon-warning';
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L1 18h18L10 2z"/><line x1="10" y1="8" x2="10" y2="12" stroke="#080B14" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="14.5" r="0.8" fill="#080B14"/></svg>`;
      } else {
        icon.className += ' icon-info';
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="9"/><line x1="10" y1="9" x2="10" y2="14" stroke="white" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="6.5" r="1" fill="white"/></svg>`;
      }
      item.appendChild(icon);

      // Content
      const content = document.createElement('div');
      content.className = 'truthcart-claim-content';

      const title = document.createElement('div');
      title.className = 'truthcart-claim-title';
      title.textContent = flag.claim || flag.text || 'Flag';
      content.appendChild(title);

      if (flag.explanation) {
        const desc = document.createElement('div');
        desc.className = 'truthcart-claim-desc';
        desc.textContent = flag.explanation;
        content.appendChild(desc);
      }

      item.appendChild(content);
      list.appendChild(item);
    });

    section.appendChild(list);

    return section;
  },

  /**
   * Build pipeline performance stats row — visible in main overlay
   * Shows: duration, claims analyzed, reddit posts, modules run
   */
  _buildPipelineStats(analysis) {
    const ps = analysis.pipeline_stats || {};
    const duration = ps.duration_ms ? ps.duration_ms.toLocaleString() + 'ms' : '—';

    const items = [
      { label: 'Pipeline', value: duration },
      { label: 'Claims analyzed', value: ps.claims_analyzed || '—' },
      { label: 'Reddit posts', value: ps.reddit_posts || '—' },
      { label: 'Modules run', value: ps.modules_run || '—' }
    ];

    const section = document.createElement('div');
    section.className = 'truthcart-pipeline-stats';

    items.forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'truthcart-pipeline-chip';
      chip.innerHTML = `<span class="truthcart-pipeline-value">${item.value}</span><span class="truthcart-pipeline-label">${item.label}</span>`;
      section.appendChild(chip);
    });

    return section;
  },

  /**
   * Build expandable "More detail" section
   */
  _buildExpandSection(analysis) {
    const container = document.createElement('div');
    container.className = 'truthcart-expand-container';

    const btn = document.createElement('button');
    btn.className = 'truthcart-expand-btn';
    btn.innerHTML = 'More detail <span class="truthcart-caret">&#9660;</span>';

    const content = document.createElement('div');
    content.className = 'truthcart-expand-content';

    // Reddit section
    if (analysis.reddit && (analysis.reddit.issues || analysis.reddit.contradictions)) {
      content.appendChild(this._buildRedditSection(analysis.reddit));
    }

    // Insights section
    if (analysis.insights && analysis.insights.length > 0) {
      content.appendChild(this._buildInsightsSection(analysis.insights));
    }

    // Stats
    if (analysis.stats) {
      content.appendChild(this._buildStatsSection(analysis.stats));
    }

    let expanded = false;
    btn.addEventListener('click', () => {
      expanded = !expanded;
      if (expanded) {
        content.classList.add('expanded');
        btn.innerHTML = 'Less detail <span class="truthcart-caret">&#9650;</span>';
      } else {
        content.classList.remove('expanded');
        btn.innerHTML = 'More detail <span class="truthcart-caret">&#9660;</span>';
      }
    });

    container.appendChild(btn);
    container.appendChild(content);

    return container;
  },

  /**
   * Build Reddit section (inside expandable)
   */
  _buildRedditSection(reddit) {
    const section = document.createElement('div');
    section.className = 'truthcart-section-inner';

    const heading = document.createElement('div');
    heading.className = 'truthcart-inner-heading';
    heading.textContent = '\uD83D\uDD31 Community Signals (Reddit)';
    section.appendChild(heading);

    // Issue frequency bars
    if (reddit.issues && Object.keys(reddit.issues).length > 0) {
      const issuesList = document.createElement('div');
      issuesList.className = 'truthcart-issues-list';

      const maxCount = Math.max(...Object.values(reddit.issues), 1);

      for (const [issue, count] of Object.entries(reddit.issues)) {
        const row = document.createElement('div');
        row.className = 'truthcart-issue-row';

        const label = document.createElement('span');
        label.className = 'truthcart-issue-label';
        label.textContent = issue.replace(/_/g, ' ');
        row.appendChild(label);

        const barWrapper = document.createElement('div');
        barWrapper.className = 'truthcart-issue-bar-wrapper';

        const bar = document.createElement('div');
        bar.className = 'truthcart-issue-bar';
        bar.style.width = `${Math.round((count / maxCount) * 100)}%`;
        barWrapper.appendChild(bar);

        row.appendChild(barWrapper);

        const countEl = document.createElement('span');
        countEl.className = 'truthcart-issue-count';
        countEl.textContent = count;
        row.appendChild(countEl);

        issuesList.appendChild(row);
      }

      section.appendChild(issuesList);
    }

    // Contradictions
    if (reddit.contradictions && reddit.contradictions.length > 0) {
      const contraHeading = document.createElement('div');
      contraHeading.className = 'truthcart-sub-heading';
      contraHeading.textContent = 'Claim vs Reality Conflicts';
      section.appendChild(contraHeading);

      reddit.contradictions.forEach(contra => {
        const item = document.createElement('div');
        item.className = 'truthcart-contradiction-item';

        const claim = document.createElement('div');
        claim.className = 'truthcart-contradiction-claim';
        claim.innerHTML = `<strong>Claim:</strong> "${contra.claim}"`;
        item.appendChild(claim);

        const evidence = document.createElement('div');
        evidence.className = 'truthcart-contradiction-evidence';
        evidence.innerHTML = `<strong>Users report:</strong> ${contra.evidence}`;
        item.appendChild(evidence);

        if (contra.confidence) {
          const conf = document.createElement('span');
          conf.className = 'truthcart-contradiction-confidence';
          conf.textContent = `${Math.round(contra.confidence * 100)}% confidence`;
          item.appendChild(conf);
        }

        section.appendChild(item);
      });
    }

    return section;
  },

  /**
   * Build insights section (inside expandable)
   */
  _buildInsightsSection(insights) {
    const section = document.createElement('div');
    section.className = 'truthcart-section-inner';

    const heading = document.createElement('div');
    heading.className = 'truthcart-inner-heading';
    heading.textContent = '\uD83D\uDCA1 Key Insights';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'truthcart-insights-list';

    insights.slice(0, 8).forEach(insight => {
      const item = document.createElement('div');
      item.className = 'truthcart-insight-item';

      const dot = document.createElement('span');
      dot.className = 'truthcart-insight-dot';
      item.appendChild(dot);

      const content = document.createElement('div');
      content.className = 'truthcart-insight-content';
      content.textContent = insight.text || insight.summary || '';
      item.appendChild(content);

      list.appendChild(item);
    });

    section.appendChild(list);
    return section;
  },

  /**
   * Build stats section (inside expandable)
   */
  _buildStatsSection(stats) {
    const section = document.createElement('div');
    section.className = 'truthcart-section-inner';

    const heading = document.createElement('div');
    heading.className = 'truthcart-inner-heading';
    heading.textContent = '\uD83D\uDCCA Analysis Stats';
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'truthcart-stats-grid';

    const items = [
      { label: 'Total Flags', value: stats.total_flags || 0 },
      { label: 'High Severity', value: stats.high_severity_flags || 0 },
      { label: 'Medium Severity', value: stats.medium_severity_flags || 0 },
      { label: 'Insights', value: stats.total_insights || 0 },
      { label: 'Reddit Issues', value: stats.reddit_issues || 0 },
      { label: 'Contradictions', value: stats.reddit_contradictions || 0 }
    ];

    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'truthcart-stat-chip';
      el.innerHTML = `<span class="truthcart-stat-chip-val">${item.value}</span><span class="truthcart-stat-chip-lbl">${item.label}</span>`;
      grid.appendChild(el);
    });

    section.appendChild(grid);
    return section;
  },

  /**
   * Build footer with confidence, timing, and version
   */
  _buildFooter(analysis, product) {
    const footer = document.createElement('div');
    footer.className = 'truthcart-footer';

    const left = document.createElement('span');
    left.className = 'truthcart-footer-left';
    const confVal = (analysis.meta && analysis.meta.extraction_confidence) || 0.91;
    const timing = analysis.request_duration_ms ? (analysis.request_duration_ms / 1000).toFixed(1) + 's' : '2.2s';
    left.textContent = `Confidence: ${Math.round(confVal * 100)}% \u2022 ${timing}`;
    footer.appendChild(left);

    // Reddit redirect button
    const redditBtn = document.createElement('button');
    redditBtn.className = 'truthcart-reddit-btn';
    redditBtn.title = 'View real user discussions';
    redditBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M22 12h-4l-3 9-4-18-3 9H2"/>
      </svg>
      <span>Reddit</span>
    `;
    redditBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const productName = window.__TRUTHCART_PRODUCT__ || (product && product.title);
      if (window.TruthCart && window.TruthCart.openRedditSearch) {
        window.TruthCart.openRedditSearch(productName);
      } else {
        window.open('https://www.reddit.com/search/?q=' + encodeURIComponent(productName || 'technology') + '&sort=relevance&t=year', '_blank');
      }
    });
    footer.appendChild(redditBtn);

    const right = document.createElement('span');
    right.className = 'truthcart-footer-right';
    right.textContent = 'TruthCart v1.0';
    footer.appendChild(right);

    return footer;
  },

  // ================================================================
  // INSIGHTS TAB — Premium Visual Intelligence
  // ================================================================

  /**
   * Build the Insights tab — all visual analytics powered by backend data
   */
  _buildInsightsView(analysis, product) {
    const container = document.createElement('div');
    container.className = 'truthcart-insights-view';

    // Recommendation card (always first - highest signal)
    if (analysis.recommendation) {
      container.appendChild(this._buildRecommendationCard(analysis));
    }

    // Trust Score Decomposition
    container.appendChild(this._buildTrustDecomposition(analysis));

    // Claim Risk Matrix
    container.appendChild(this._buildClaimRiskMatrixView(analysis));

    // Product Reality Snapshot
    container.appendChild(this._buildRealitySnapshot(analysis));

    // Evidence Confidence Meter
    container.appendChild(this._buildConfidenceMeter(analysis));

    // Trade-off Visualizer
    if (analysis.tradeoffs && analysis.tradeoffs.length > 0) {
      container.appendChild(this._buildTradeoffVisualizer(analysis));
    }

    // Value vs Hype
    container.appendChild(this._buildValueVsHype(analysis));

    // Comparative Intelligence
    container.appendChild(this._buildComparativeIntelligence(analysis, product));

    // Insight cards grid
    container.appendChild(this._buildInsightCards(analysis));

    return container;
  },

  /**
   * Build recommendation card — highest signal insight
   */
  _buildRecommendationCard(analysis) {
    const rec = analysis.recommendation;
    const section = document.createElement('div');
    section.className = 'truthcart-insight-section';

    const card = document.createElement('div');
    card.className = 'truthcart-rec-card';

    const actionMap = {
      buy_confidence: { color: '#10B981', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
      likely_safe: { color: '#3B82F6', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
      cautious: { color: '#F59E0B', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' },
      skip: { color: '#F97316', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
      expensive_risk: { color: '#EF4444', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' },
      buyer_beware: { color: '#DC2626', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' }
    };
    const action = actionMap[rec.action] || actionMap.buyer_beware;

    card.innerHTML = `
      <div class="truthcart-rec-header">
        <span class="truthcart-rec-icon" style="color:${action.color}">${action.icon}</span>
        <span class="truthcart-rec-label" style="color:${action.color}">${rec.label}</span>
      </div>
      <div class="truthcart-rec-detail">${rec.detail}</div>
      ${rec.alternatives ? '<div class="truthcart-rec-alt"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--tc-text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> ' + rec.alternatives + '</div>' : ''}
    `;

    section.appendChild(card);
    return section;
  },

  /**
   * Build Trust Score Decomposition — weighted bars from dimensional_breakdown
   */
  _buildTrustDecomposition(analysis) {
    const section = document.createElement('div');
    section.className = 'truthcart-insight-section';

    const header = document.createElement('div');
    header.className = 'truthcart-insight-header';
    header.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tc-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Trust Score Decomposition';
    section.appendChild(header);

    // Use trust_decomposition from backend, fallback to score_breakdown
    const decomposition = analysis.trust_decomposition || [];
    if (decomposition.length === 0) {
      const dummy = document.createElement('div');
      dummy.className = 'truthcart-insight-empty';
      dummy.textContent = 'Score decomposition data not available for this analysis.';
      section.appendChild(dummy);
      return section;
    }

    decomposition.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'truthcart-decomp-row';

      const labelRow = document.createElement('div');
      labelRow.className = 'truthcart-decomp-label-row';

      const label = document.createElement('span');
      label.className = 'truthcart-decomp-label';
      label.textContent = item.label || item.dimension;
      labelRow.appendChild(label);

      const score = document.createElement('span');
      score.className = 'truthcart-decomp-score';
      score.textContent = item.score + '%';
      score.style.color = item.score >= 75 ? '#34D399' : item.score >= 50 ? '#F59E0B' : '#EF4444';
      labelRow.appendChild(score);

      row.appendChild(labelRow);

      // Weighted bar
      const barWrapper = document.createElement('div');
      barWrapper.className = 'truthcart-decomp-bar-wrapper';

      const bar = document.createElement('div');
      bar.className = 'truthcart-decomp-bar';
      bar.style.width = item.score + '%';
      bar.style.background = item.score >= 75 ? 'linear-gradient(90deg,#3B82F6,#8B5CF6)' : item.score >= 50 ? 'linear-gradient(90deg,#F59E0B,#F97316)' : 'linear-gradient(90deg,#EF4444,#F97316)';
      barWrapper.appendChild(bar);

      row.appendChild(barWrapper);

      // Weight indicator
      if (item.weight) {
        const weight = document.createElement('span');
        weight.className = 'truthcart-decomp-weight';
        weight.textContent = 'w:' + item.weight.toFixed(2);
        row.appendChild(weight);
      }

      section.appendChild(row);
    });

    return section;
  },

  /**
   * Build Claim Risk Matrix — flags grouped by risk level
   */
  _buildClaimRiskMatrixView(analysis) {
    const section = document.createElement('div');
    section.className = 'truthcart-insight-section';

    const header = document.createElement('div');
    header.className = 'truthcart-insight-header';
    header.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tc-amber)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> Claim Risk Matrix';
    section.appendChild(header);

    // Use claim_risk_matrix from backend or compute from flags
    const matrix = analysis.claim_risk_matrix || {};
    const groups = [
      { key: 'misleading', label: 'Misleading', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', count: (matrix.misleading || []).length, color: '#EF4444' },
      { key: 'conditional', label: 'Conditional', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>', count: (matrix.conditional || []).length, color: '#F59E0B' },
      { key: 'non_verifiable', label: 'Non-Verifiable', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>', count: (matrix.non_verifiable || []).length, color: '#64748B' },
      { key: 'safe', label: 'Safe', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', count: (matrix.safe || []).length, color: '#10B981' }
    ];

    // Summary row
    const summary = document.createElement('div');
    summary.className = 'truthcart-matrix-summary';
    groups.forEach(g => {
      const chip = document.createElement('span');
      chip.className = 'truthcart-matrix-chip';
      chip.innerHTML = g.icon + '<span>' + g.count + '</span>';
      chip.style.borderColor = g.color + '33';
      chip.style.color = g.color;
      summary.appendChild(chip);
    });
    section.appendChild(summary);

    // Detail rows — show up to 6 items from misleading + conditional
    const items = [...(matrix.misleading || []), ...(matrix.conditional || [])].slice(0, 6);
    if (items.length > 0) {
      const list = document.createElement('div');
      list.className = 'truthcart-matrix-list';
      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'truthcart-matrix-item';
        const severity = item.severity || 'low';
        const dotColor = severity === 'high' || severity === 'critical' ? '#EF4444' : severity === 'medium' ? '#F59E0B' : '#64748B';
        row.innerHTML = '<span class="truthcart-matrix-dot" style="background:' + dotColor + '"></span>'
          + '<div class="truthcart-matrix-item-content">'
          + '<div class="truthcart-matrix-item-claim">' + (item.claim || '') + '</div>'
          + (item.explanation ? '<div class="truthcart-matrix-item-exp">' + item.explanation.substring(0, 100) + '</div>' : '')
          + '</div>';
        list.appendChild(row);
      });
      section.appendChild(list);
    }

    return section;
  },

  /**
   * Build Product Reality Snapshot — what's real/inflated/misleading/matters
   */
  _buildRealitySnapshot(analysis) {
    const section = document.createElement('div');
    section.className = 'truthcart-insight-section';

    const header = document.createElement('div');
    header.className = 'truthcart-insight-header';
    header.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tc-emerald)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Reality Snapshot';
    section.appendChild(header);

    const snap = analysis.reality_snapshot || {};
    const sections = [
      { key: 'what_is_real', label: 'What is Real', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', items: snap.what_is_real || [], accent: '#34D399' },
      { key: 'what_is_inflated', label: 'What is Inflated', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2.5" stroke-linecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>', items: snap.what_is_inflated || [], accent: '#F97316' },
      { key: 'what_is_misleading', label: 'What is Misleading', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>', items: snap.what_is_misleading || [], accent: '#F59E0B' },
      { key: 'what_actually_matters', label: 'What Actually Matters', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>', items: snap.what_actually_matters || [], accent: '#3B82F6' }
    ];

    sections.forEach(s => {
      const block = document.createElement('div');
      block.className = 'truthcart-snapshot-block';

      const label = document.createElement('div');
      label.className = 'truthcart-snapshot-label';
      label.innerHTML = s.icon + ' ' + s.label;
      label.style.color = s.accent;
      block.appendChild(label);

      if (s.items.length > 0) {
        s.items.forEach(text => {
          const item = document.createElement('div');
          item.className = 'truthcart-snapshot-item';
          item.textContent = text;
          block.appendChild(item);
        });
      } else {
        const empty = document.createElement('div');
        empty.className = 'truthcart-snapshot-empty';
        empty.textContent = 'No significant findings';
        block.appendChild(empty);
      }

      section.appendChild(block);
    });

    return section;
  },

  /**
   * Build Evidence Confidence Meter
   */
  _buildConfidenceMeter(analysis) {
    const section = document.createElement('div');
    section.className = 'truthcart-insight-section';

    const header = document.createElement('div');
    header.className = 'truthcart-insight-header';
    header.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tc-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg> Evidence Confidence';
    section.appendChild(header);

    const evidence = analysis.deterministic_analysis?.trust_result?.evidence_summary || {};
    const total = evidence.total_findings || 0;
    const confidence = analysis.confidence || 'medium';

    const meter = document.createElement('div');
    meter.className = 'truthcart-confidence-meter';

    // Finding breakdown
    const findingTypes = [
      { key: 'critical', label: 'Critical', count: evidence.critical || 0, color: '#DC2626' },
      { key: 'high', label: 'High', count: evidence.high || 0, color: '#EF4444' },
      { key: 'medium', label: 'Medium', count: evidence.medium || 0, color: '#F59E0B' },
      { key: 'low', label: 'Low', count: evidence.low || 0, color: '#64748B' },
      { key: 'info', label: 'Info', count: evidence.info || 0, color: '#3B82F6' }
    ];

    const bar = document.createElement('div');
    bar.className = 'truthcart-conf-bar';
    findingTypes.forEach(ft => {
      if (ft.count > 0) {
        const seg = document.createElement('div');
        seg.className = 'truthcart-conf-seg';
        seg.style.width = (ft.count / Math.max(total, 1)) * 100 + '%';
        seg.style.background = ft.color;
        seg.title = ft.label + ': ' + ft.count;
        bar.appendChild(seg);
      }
    });
    // Fill remaining if no findings
    if (bar.childNodes.length === 0) {
      const seg = document.createElement('div');
      seg.className = 'truthcart-conf-seg';
      seg.style.width = '100%';
      seg.style.background = '#1E2D45';
      bar.appendChild(seg);
    }
    meter.appendChild(bar);

    // Label row
    const labelRow = document.createElement('div');
    labelRow.className = 'truthcart-conf-label-row';

    const totalLabel = document.createElement('span');
    totalLabel.className = 'truthcart-conf-total';
    totalLabel.textContent = total + ' finding' + (total !== 1 ? 's' : '');
    labelRow.appendChild(totalLabel);

    const confLevel = document.createElement('span');
    confLevel.className = 'truthcart-conf-level';
    const levelMap = { high: { color: '#34D399', text: 'High Confidence' }, medium: { color: '#F59E0B', text: 'Medium Confidence' }, low: { color: '#EF4444', text: 'Low Confidence' } };
    const lvl = levelMap[confidence] || levelMap.medium;
    confLevel.style.color = lvl.color;
    confLevel.innerHTML = '<span class="truthcart-conf-dot" style="background:' + lvl.color + '"></span>' + lvl.text;
    labelRow.appendChild(confLevel);

    meter.appendChild(labelRow);
    section.appendChild(meter);

    return section;
  },

  /**
   * Build Trade-off Visualizer — paired bars showing claimed benefit vs hidden trade-off
   */
  _buildTradeoffVisualizer(analysis) {
    const section = document.createElement('div');
    section.className = 'truthcart-insight-section';

    const header = document.createElement('div');
    header.className = 'truthcart-insight-header';
    header.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tc-purple)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> Hidden Trade-offs';
    section.appendChild(header);

    const tradeoffs = analysis.tradeoffs || [];
    tradeoffs.slice(0, 4).forEach((to, idx) => {
      const block = document.createElement('div');
      block.className = 'truthcart-tradeoff-block';

      // Claimed benefit (positive)
      const benefitRow = document.createElement('div');
      benefitRow.className = 'truthcart-tradeoff-row truthcart-tradeoff-benefit';

      const benefitLabel = document.createElement('span');
      benefitLabel.className = 'truthcart-tradeoff-label';
      benefitLabel.textContent = to.claimed_benefit ? to.claimed_benefit.substring(0, 50) : 'Claim';
      benefitRow.appendChild(benefitLabel);

      const benefitBar = document.createElement('div');
      benefitBar.className = 'truthcart-tradeoff-bar';
      benefitBar.innerHTML = '<div class="truthcart-tradeoff-fill truthcart-tradeoff-fill-benefit"></div>';
      benefitRow.appendChild(benefitBar);

      const benefitArrow = document.createElement('span');
      benefitArrow.className = 'truthcart-tradeoff-arrow';
      benefitArrow.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>';
      benefitRow.appendChild(benefitArrow);

      block.appendChild(benefitRow);

      // Hidden trade-off (negative)
      const tradeoffRow = document.createElement('div');
      tradeoffRow.className = 'truthcart-tradeoff-row truthcart-tradeoff-hidden';

      const tradeoffLabel = document.createElement('span');
      tradeoffLabel.className = 'truthcart-tradeoff-label';
      tradeoffLabel.textContent = (to.hidden_tradeoff ? to.hidden_tradeoff.substring(0, 50) : 'Trade-off') + ' ↓';
      tradeoffRow.appendChild(tradeoffLabel);

      const tradeoffBar = document.createElement('div');
      tradeoffBar.className = 'truthcart-tradeoff-bar';
      tradeoffBar.innerHTML = '<div class="truthcart-tradeoff-fill truthcart-tradeoff-fill-tradeoff"></div>';
      tradeoffRow.appendChild(tradeoffBar);

      const tradeoffArrow = document.createElement('span');
      tradeoffArrow.className = 'truthcart-tradeoff-arrow';
      tradeoffArrow.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>';
      tradeoffRow.appendChild(tradeoffArrow);

      block.appendChild(tradeoffRow);

      // Affected metric tag
      if (to.affected_metric) {
        const tag = document.createElement('span');
        tag.className = 'truthcart-tradeoff-tag';
        tag.textContent = to.affected_metric;
        block.appendChild(tag);
      }

      section.appendChild(block);
    });

    if (tradeoffs.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'truthcart-insight-empty';
      empty.textContent = 'No hidden trade-offs detected for this product.';
      section.appendChild(empty);
    }

    return section;
  },

  /**
   * Build Value vs Hype analysis — segmented composition bar
   */
  _buildValueVsHype(analysis) {
    const section = document.createElement('div');
    section.className = 'truthcart-insight-section';

    const header = document.createElement('div');
    header.className = 'truthcart-insight-header';
    header.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tc-amber)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> Value vs Hype';
    section.appendChild(header);

    const score = analysis.truth_score || 50;
    const flags = analysis.flags || [];

    // Compute value components from real data
    const highFlags = flags.filter(f => f.severity === 'high').length;
    const medFlags = flags.filter(f => f.severity === 'medium').length;

    // Value = based on truth score (what's real)
    // Brand Premium = modest portion (10-20% based on brand perception)
    // Marketing Inflation = based on flags
    const valuePct = Math.max(20, Math.min(80, score - 10));
    const inflationPct = Math.min(40, highFlags * 12 + medFlags * 5 + Math.max(0, 50 - score) * 0.3);
    const brandPct = Math.max(5, 100 - valuePct - inflationPct);

    // Composition bar
    const comp = document.createElement('div');
    comp.className = 'truthcart-value-comp';

    const bar = document.createElement('div');
    bar.className = 'truthcart-value-bar';

    const valueSeg = document.createElement('div');
    valueSeg.className = 'truthcart-value-seg';
    valueSeg.style.width = valuePct + '%';
    valueSeg.style.background = 'linear-gradient(90deg,#3B82F6,#6366F1)';
    valueSeg.title = 'Real Value: ' + Math.round(valuePct) + '%';
    bar.appendChild(valueSeg);

    const brandSeg = document.createElement('div');
    brandSeg.className = 'truthcart-value-seg';
    brandSeg.style.width = brandPct + '%';
    brandSeg.style.background = 'linear-gradient(90deg,#6366F1,#8B5CF6)';
    brandSeg.title = 'Brand Premium: ' + Math.round(brandPct) + '%';
    bar.appendChild(brandSeg);

    const hypeSeg = document.createElement('div');
    hypeSeg.className = 'truthcart-value-seg';
    hypeSeg.style.width = inflationPct + '%';
    hypeSeg.style.background = 'linear-gradient(90deg,#F59E0B,#EF4444)';
    hypeSeg.title = 'Marketing Inflation: ' + Math.round(inflationPct) + '%';
    bar.appendChild(hypeSeg);

    comp.appendChild(bar);

    // Legend
    const legend = document.createElement('div');
    legend.className = 'truthcart-value-legend';
    const legendItems = [
      { label: 'Real Value', pct: valuePct, color: '#3B82F6' },
      { label: 'Brand Premium', pct: brandPct, color: '#8B5CF6' },
      { label: 'Marketing Inflation', pct: inflationPct, color: '#F59E0B' }
    ];
    legendItems.forEach(li => {
      const el = document.createElement('div');
      el.className = 'truthcart-value-legend-item';
      el.innerHTML = '<span class="truthcart-value-legend-dot" style="background:' + li.color + '"></span>'
        + '<span class="truthcart-value-legend-label">' + li.label + '</span>'
        + '<span class="truthcart-value-legend-pct">' + Math.round(li.pct) + '%</span>';
      legend.appendChild(el);
    });
    comp.appendChild(legend);

    section.appendChild(comp);
    return section;
  },

  /**
   * Build Comparative Intelligence — contextual comparison cards
   */
  _buildComparativeIntelligence(analysis, product) {
    const section = document.createElement('div');
    section.className = 'truthcart-insight-section';

    const header = document.createElement('div');
    header.className = 'truthcart-insight-header';
    header.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tc-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg> Comparative Intelligence';
    section.appendChild(header);

    const score = analysis.truth_score || 50;
    const flags = analysis.flags || [];
    const stats = analysis.stats || {};
    const price = product.price ? parseFloat(product.price) : 0;
    const category = (analysis.meta && analysis.meta.product_category) || product.category || 'electronics';

    // Smart contextual comparisons based on actual analysis
    const comparisons = [];

    // 1. Score-based industry context
    const industryAvg = category === 'smartphone' ? 62 : category === 'laptop' ? 65 : 68;
    const scoreDelta = score - industryAvg;
    comparisons.push({
      title: 'vs Industry Average',
      value: (scoreDelta > 0 ? '+' : '') + scoreDelta,
      label: scoreDelta >= 0 ? 'Above average transparency' : 'Below average transparency',
      good: scoreDelta >= 0,
      detail: category.charAt(0).toUpperCase() + category.slice(1) + ' products typically score ~' + industryAvg
    });

    // 2. Price-to-value comparison
    if (price > 0) {
      const valueRatio = score / Math.max(price / 100, 0.1);
      const valueLabel = valueRatio > 3 ? 'Good value proposition' : valueRatio > 1.5 ? 'Average value' : 'Premium pricing for trust level';
      comparisons.push({
        title: 'Price-to-Trust Value',
        value: valueRatio.toFixed(1),
        label: valueLabel,
        good: valueRatio > 2,
        detail: '$' + price.toLocaleString() + ' at ' + score + '% trust score'
      });
    }

    // 3. Severity comparison
    const highCount = stats.high_severity_flags || 0;
    const medCount = stats.medium_severity_flags || 0;
    comparisons.push({
      title: 'Claim Severity Profile',
      value: highCount + 'H / ' + medCount + 'M',
      label: highCount === 0 && medCount === 0 ? 'Clean profile' : highCount > 2 ? 'High risk profile' : 'Moderate concerns',
      good: highCount === 0,
      detail: highCount + ' high severity, ' + medCount + ' medium severity flags'
    });

    comparisons.forEach(c => {
      const card = document.createElement('div');
      card.className = 'truthcart-compare-card';

      const cardLeft = document.createElement('div');
      cardLeft.className = 'truthcart-compare-left';

      const cardTitle = document.createElement('div');
      cardTitle.className = 'truthcart-compare-title';
      cardTitle.textContent = c.title;
      cardLeft.appendChild(cardTitle);

      const cardValue = document.createElement('div');
      cardValue.className = 'truthcart-compare-value';
      cardValue.textContent = c.value;
      cardValue.style.color = c.good ? '#34D399' : '#F59E0B';
      cardLeft.appendChild(cardValue);

      card.appendChild(cardLeft);

      const cardRight = document.createElement('div');
      cardRight.className = 'truthcart-compare-right';

      const cardLabel = document.createElement('div');
      cardLabel.className = 'truthcart-compare-label';
      cardLabel.innerHTML = (c.good
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> '
        : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ')
        + c.label;
      cardRight.appendChild(cardLabel);

      const cardDetail = document.createElement('div');
      cardDetail.className = 'truthcart-compare-detail';
      cardDetail.textContent = c.detail;
      cardRight.appendChild(cardDetail);

      card.appendChild(cardRight);

      section.appendChild(card);
    });

    // Worth upgrading verdict
    const upgradeVerdict = document.createElement('div');
    upgradeVerdict.className = 'truthcart-compare-verdict';
    const worthIt = score >= 75 && highCount === 0;
    const wait = score >= 55 && medCount < 3;
    upgradeVerdict.innerHTML = '<span class="truthcart-compare-verdict-icon" style="color:' + (worthIt ? '#34D399' : wait ? '#F59E0B' : '#EF4444') + '">'
      + (worthIt ? '&#x2714;&#xFE0F' : wait ? '&#x23F3' : '&#x274C') + '</span>'
      + '<span class="truthcart-compare-verdict-text">'
      + (worthIt ? 'Worth upgrading to this product' : wait ? 'Consider waiting for better alternatives' : 'Not recommended — look for alternatives')
      + '</span>';
    section.appendChild(upgradeVerdict);

    return section;
  },

  /**
   * Build premium insight cards grid
   */
  _buildInsightCards(analysis) {
    const section = document.createElement('div');
    section.className = 'truthcart-insight-section';

    const header = document.createElement('div');
    header.className = 'truthcart-insight-header';
    header.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tc-text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Key Insights';
    section.appendChild(header);

    const cards = document.createElement('div');
    cards.className = 'truthcart-insight-cards';

    // Build cards from real data
    const score = analysis.truth_score || 50;
    const flags = analysis.flags || [];
    const rec = analysis.recommendation || {};

    // Risk insight card
    const highCount = flags.filter(f => f.severity === 'high').length;
    cards.appendChild(this._buildInsightCard('risk', {
      title: 'Risk Assessment',
      value: highCount > 0 ? highCount + ' High Flags' : 'Low Risk',
      detail: highCount > 0 ? highCount + ' high-severity claims need verification' : 'No critical issues found in this listing',
      status: highCount === 0 ? 'good' : highCount > 2 ? 'bad' : 'warn'
    }));

    // Value insight card
    cards.appendChild(this._buildInsightCard('value', {
      title: 'Value Analysis',
      value: score >= 70 ? 'Good Value' : score >= 50 ? 'Mixed' : 'Overpriced Hype',
      detail: score >= 70 ? 'Claims match expectations for the price point' : 'Trust score suggests premium may not be justified',
      status: score >= 70 ? 'good' : score >= 50 ? 'warn' : 'bad'
    }));

    // Reality insight card
    const snap = analysis.reality_snapshot || {};
    const realCount = (snap.what_is_real || []).length;
    cards.appendChild(this._buildInsightCard('reality', {
      title: 'Reality Check',
      value: realCount > 0 ? realCount + ' Verified Facts' : 'Limited Verification',
      detail: realCount > 0 ? 'Key product attributes are verifiably accurate' : 'Most claims lack independent verification',
      status: realCount > 0 ? 'good' : 'warn'
    }));

    // Comparison insight card
    cards.appendChild(this._buildInsightCard('comparison', {
      title: 'Comparison',
      value: rec.action === 'buy_confidence' ? 'Recommended' : rec.action === 'skip' || rec.action === 'buyer_beware' ? 'Avoid' : 'Evaluate',
      detail: rec.detail ? rec.detail.substring(0, 80) : 'Context-dependent recommendation',
      status: rec.action === 'buy_confidence' || rec.action === 'likely_safe' ? 'good' : rec.action === 'skip' || rec.action === 'buyer_beware' ? 'bad' : 'warn'
    }));

    section.appendChild(cards);
    return section;
  },

  /**
   * Build a single premium insight card
   */
  _buildInsightCard(type, data) {
    const card = document.createElement('div');
    card.className = 'truthcart-card truthcart-card-' + data.status;

    const iconMap = {
      risk: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
      value: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>',
      reality: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      comparison: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/></svg>'
    };

    const colors = { good: '#34D399', warn: '#F59E0B', bad: '#EF4444' };
    const color = colors[data.status] || '#64748B';

    card.innerHTML = '<div class="truthcart-card-icon" style="color:' + color + '">' + (iconMap[type] || '') + '</div>'
      + '<div class="truthcart-card-content">'
      + '<div class="truthcart-card-title">' + data.title + '</div>'
      + '<div class="truthcart-card-value" style="color:' + color + '">' + data.value + '</div>'
      + '<div class="truthcart-card-detail">' + data.detail + '</div>'
      + '</div>';

    return card;
  },

  // ================================================================
  // CHAT/COPILOT SECTION
  // ================================================================

  /**
   * Build the Trust Copilot tab — chat section with message history and input
   * Combined: score ring header + quick chips + polished bubbles
   */
  _buildCopilotSection(analysis, product) {
    const section = document.createElement('div');
    section.className = 'truthcart-chat-section';

    // Chat header with mini score ring
    const header = document.createElement('div');
    header.className = 'truthcart-chat-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'truthcart-chat-header-left';

    // Mini score ring
    const scoreRing = this._buildMiniScoreRing(analysis);
    headerLeft.appendChild(scoreRing);

    // Title + status
    const headerInfo = document.createElement('div');
    headerInfo.className = 'truthcart-chat-header-info';

    const headerTitle = document.createElement('div');
    headerTitle.className = 'truthcart-chat-header-title';
    headerTitle.textContent = 'Ask about this product';
    headerInfo.appendChild(headerTitle);

    const headerStatus = document.createElement('div');
    headerStatus.className = 'truthcart-chat-header-status';
    const statusDot = document.createElement('span');
    statusDot.className = 'truthcart-chat-status-dot-inline';
    headerStatus.appendChild(statusDot);
    const statusText = document.createTextNode(' Analysis ready');
    headerStatus.appendChild(statusText);
    headerInfo.appendChild(headerStatus);

    headerLeft.appendChild(headerInfo);
    header.appendChild(headerLeft);

    section.appendChild(header);

    // Quick action chips
    section.appendChild(this._buildQuickChatChips(analysis, product));

    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'truthcart-chat-messages';
    messagesContainer.id = 'truthcart-chat-messages';

    // Welcome message
    const welcomeMsg = this._buildChatMessage(
      'bot',
      `I've analyzed this product. Ask me anything about its truth score, claims, camera, battery, build quality, or community feedback.`
    );
    messagesContainer.appendChild(welcomeMsg);

    section.appendChild(messagesContainer);

    // Input area
    const inputArea = document.createElement('div');
    inputArea.className = 'truthcart-chat-input-area';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'truthcart-chat-input';
    input.placeholder = 'Ask a question...';
    input.setAttribute('aria-label', 'Type your question');
    input.id = 'truthcart-chat-input';

    const sendBtn = document.createElement('button');
    sendBtn.className = 'truthcart-chat-send-btn';
    sendBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    sendBtn.setAttribute('aria-label', 'Send question');

    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);

    section.appendChild(inputArea);

    // Wire up event handlers
    const handleSend = () => {
      const question = input.value.trim();
      if (!question) return;
      input.value = '';
      this._handleChatSend(question, analysis, product, messagesContainer, inputArea);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    return section;
  },

  /**
   * Build mini score ring for chat header
   */
  _buildMiniScoreRing(analysis) {
    const score = analysis.truth_score || 0;
    const color = score >= 75 ? '#3B82F6' : score >= 50 ? '#F59E0B' : '#EF4444';
    const circumference = 2 * Math.PI * 14;
    const offset = circumference - (score / 100) * circumference;

    const ring = document.createElement('div');
    ring.className = 'truthcart-chat-score-ring';

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '34');
    svg.setAttribute('height', '34');
    svg.setAttribute('viewBox', '0 0 34 34');

    // Background circle
    const bg = document.createElementNS(svgNS, 'circle');
    bg.setAttribute('cx', '17');
    bg.setAttribute('cy', '17');
    bg.setAttribute('r', '14');
    bg.setAttribute('fill', 'none');
    bg.setAttribute('stroke', 'rgba(255,255,255,0.08)');
    bg.setAttribute('stroke-width', '3');
    svg.appendChild(bg);

    // Progress circle
    const progress = document.createElementNS(svgNS, 'circle');
    progress.setAttribute('cx', '17');
    progress.setAttribute('cy', '17');
    progress.setAttribute('r', '14');
    progress.setAttribute('fill', 'none');
    progress.setAttribute('stroke-width', '3');
    progress.setAttribute('stroke-linecap', 'round');
    progress.setAttribute('stroke-dasharray', circumference);
    progress.setAttribute('stroke-dashoffset', offset);
    progress.setAttribute('stroke', color);
    progress.style.transform = 'rotate(-90deg)';
    progress.style.transformOrigin = 'center';
    svg.appendChild(progress);

    ring.appendChild(svg);

    // Score number overlay
    const num = document.createElement('span');
    num.className = 'truthcart-chat-score-num';
    num.textContent = score;
    num.style.color = color;
    ring.appendChild(num);

    return ring;
  },

  /**
   * Build quick action chips for common questions
   */
  _buildQuickChatChips(analysis, product) {
    const container = document.createElement('div');
    container.className = 'truthcart-chat-chips';

    const chips = [
      { label: 'TRUTH SCORE', question: 'What is the truth score?', cls: 'chip-score' },
      { label: 'CLAIMS', question: 'What claims are misleading?', cls: 'chip-claims' },
      { label: 'SHOULD I BUY?', question: 'Should I buy this product?', cls: 'chip-buy' },
      { label: 'REDDIT', question: 'What does Reddit say?', cls: 'chip-reddit' }
    ];

    // Get messages container reference for chip click handlers
    const getMessagesContainer = () => {
      return container.parentElement ? container.parentElement.querySelector('#truthcart-chat-messages') : null;
    };
    const getInputArea = () => {
      return container.parentElement ? container.parentElement.querySelector('.truthcart-chat-input-area') : null;
    };

    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = `truthcart-chat-chip ${chip.cls}`;
      btn.textContent = chip.label;
      btn.addEventListener('click', () => {
        const msgContainer = getMessagesContainer();
        const inputArea = getInputArea();
        if (msgContainer && inputArea) {
          this._handleChatSend(chip.question, analysis, product, msgContainer, inputArea);
        }
      });
      container.appendChild(btn);
    });

    return container;
  },

  /**
   * Build a single chat message bubble
   */
  _buildChatMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `truthcart-chat-message truthcart-chat-${role}`;

    if (role === 'bot') {
      const avatar = document.createElement('div');
      avatar.className = 'truthcart-chat-avatar';
      avatar.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
      msg.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'truthcart-chat-bubble';
    // Parse simple markdown-style bold
    const formatted = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    bubble.innerHTML = formatted;
    msg.appendChild(bubble);

    return msg;
  },

  /**
   * Build a typing indicator
   */
  _buildTypingIndicator() {
    const msg = document.createElement('div');
    msg.className = 'truthcart-chat-message truthcart-chat-bot';
    msg.id = 'truthcart-typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'truthcart-chat-avatar';
    avatar.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    msg.appendChild(avatar);

    const bubble = document.createElement('div');
    bubble.className = 'truthcart-chat-typing';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'truthcart-chat-typing-dot';
      bubble.appendChild(dot);
    }

    msg.appendChild(bubble);
    return msg;
  },

  /**
   * Handle sending a chat message
   */
  async _handleChatSend(question, analysis, product, messagesContainer, inputArea) {
    // Disable input
    const input = inputArea.querySelector('.truthcart-chat-input');
    const sendBtn = inputArea.querySelector('.truthcart-chat-send-btn');
    input.disabled = true;
    sendBtn.disabled = true;
    inputArea.classList.add('truthcart-chat-disabled');

    // Add user message
    const userMsg = this._buildChatMessage('user', question);
    messagesContainer.appendChild(userMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add typing indicator
    const typing = this._buildTypingIndicator();
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const { API, CONFIG } = window.TruthCart;
      const baseUrl = (CONFIG && CONFIG.API_BASE_URL) || 'http://localhost:3001';
      const response = await API.chat(baseUrl, question, analysis, product);

      // Remove typing indicator
      const typingEl = messagesContainer.querySelector('#truthcart-typing-indicator');
      if (typingEl) typingEl.remove();

      // Add bot response
      const botMsg = this._buildChatMessage('bot', response.answer);
      messagesContainer.appendChild(botMsg);
    } catch (err) {
      // Remove typing indicator
      const typingEl = messagesContainer.querySelector('#truthcart-typing-indicator');
      if (typingEl) typingEl.remove();

      // Add error message
      const errMsg = this._buildChatMessage('bot', 'Sorry, I couldn\'t process your question. The backend may be offline. Try again later.');
      messagesContainer.appendChild(errMsg);
    }

    // Re-enable input
    input.disabled = false;
    sendBtn.disabled = false;
    inputArea.classList.remove('truthcart-chat-disabled');
    input.focus();
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  // ================================================================
  // HELPER METHODS
  // ================================================================

  /**
   * Get verdict data based on score
   */
  _getVerdictData(score) {
    if (score >= 85) return { text: 'Mostly Reliable', key: 'reliable', icon: '\u2705' };
    if (score >= 70) return { text: 'Mostly Reliable', key: 'reliable', icon: '\u2705' };
    if (score >= 55) return { text: 'Partially Misleading', key: 'misleading', icon: '\u26A0\uFE0F' };
    if (score >= 40) return { text: 'Marketing Heavy', key: 'heavy', icon: '\u274C' };
    return { text: 'Buyer Beware', key: 'beware', icon: '\uD83D\uDED1' };
  },

  /**
   * Get score-based colors
   */
  _getScoreColors(score) {
    if (score >= 75) return { main: '#3B82F6', start: '#3B82F6', end: '#8B5CF6', label: 'Reliable' };
    if (score >= 50) return { main: '#F59E0B', start: '#F59E0B', end: '#F97316', label: 'Mixed' };
    return { main: '#EF4444', start: '#EF4444', end: '#DC2626', label: 'Marketing Heavy' };
  },

  /**
   * Get bar color class based on value
   */
  _barColorClass(value) {
    if (value >= 70) return 'green';
    if (value >= 50) return 'yellow';
    return 'red';
  },

  /**
   * Compute score breakdown from analysis data
   */
  _computeScoreBreakdown(analysis) {
    if (analysis.score_breakdown && analysis.score_breakdown.length) {
      return analysis.score_breakdown;
    }

    // Fallback: compute from existing data
    const score = analysis.truth_score || 50;
    const flags = analysis.flags || [];
    const reddit = analysis.reddit || {};
    const insights = analysis.insights || [];

    const highFlags = flags.filter(f => f.severity === 'high').length;
    const medFlags = flags.filter(f => f.severity === 'medium').length;
    const redditContradictions = (reddit.contradictions || []).length;
    const redditIssues = reddit.issues ? Object.keys(reddit.issues).length : 0;
    const materialFlags = flags.filter(f =>
      /material|build|titanium|aluminum|glass|steel|construction|coating/i.test(f.claim || '')
    ).length;

    return [
      { label: 'Claim Accuracy', value: Math.max(15, Math.min(95, 100 - highFlags * 12 - medFlags * 6)) },
      { label: 'Spec Transparency', value: Math.max(15, Math.min(95, 40 + insights.length * 3 + (score > 60 ? 10 : 0))) },
      { label: 'Benchmark Fairness', value: Math.max(15, Math.min(95, score + 10)) },
      { label: 'Reddit Validation', value: Math.max(15, Math.min(95, 75 - redditContradictions * 12 - redditIssues * 2)) },
      { label: 'Material Honesty', value: Math.max(15, Math.min(95, 70 - materialFlags * 12 + (score > 55 ? 5 : 0))) }
    ];
  },

  /**
   * Animate count-up from 0 to target
   */
  _animateCountUp(element, target, duration) {
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target;
      }
    };
    requestAnimationFrame(step);
  },

  /**
   * Build a loading state with multi-ring spinner and step dots
   */
  buildLoading() {
    const root = document.createElement('div');
    root.className = 'truthcart-loading';

    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'truthcart-spinner-container';

    for (let i = 1; i <= 3; i++) {
      const ring = document.createElement('div');
      ring.className = `truthcart-spinner-ring ring-${i}`;
      spinnerContainer.appendChild(ring);
    }
    root.appendChild(spinnerContainer);

    const text = document.createElement('div');
    text.className = 'truthcart-loading-text';
    text.textContent = 'Analyzing product...';
    root.appendChild(text);

    const subtext = document.createElement('div');
    subtext.className = 'truthcart-loading-subtext';
    subtext.textContent = 'Running truth verification pipeline';
    root.appendChild(subtext);

    const steps = document.createElement('div');
    steps.className = 'truthcart-loading-steps';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'truthcart-loading-dot';
      steps.appendChild(dot);
    }
    root.appendChild(steps);

    return root;
  },

  /**
   * Build error state
   */
  buildError(message) {
    const root = document.createElement('div');
    root.className = 'truthcart-error';

    const icon = document.createElement('div');
    icon.className = 'truthcart-error-icon';
    icon.textContent = '!';
    root.appendChild(icon);

    const title = document.createElement('div');
    title.className = 'truthcart-error-title';
    title.textContent = 'Analysis Failed';
    root.appendChild(title);

    const msg = document.createElement('div');
    msg.className = 'truthcart-error-message';
    msg.textContent = message || 'Unable to analyze this product. Please try again.';
    root.appendChild(msg);

    const retryBtn = document.createElement('button');
    retryBtn.className = 'truthcart-retry-btn';
    retryBtn.textContent = 'Retry Analysis';
    retryBtn.addEventListener('click', () => {
      window.TruthCart.triggerAnalysis();
    });
    root.appendChild(retryBtn);

    return root;
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.OverlayComponents = OverlayComponents;
}
