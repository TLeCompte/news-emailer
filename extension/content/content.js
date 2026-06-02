(() => {
  // --- Gift link detection (site-specific) ---

  function detectGiftLink() {
    const host = window.location.hostname;

    if (host.includes('nytimes.com')) {
      const giftAnchor = document.querySelector('a[href*="/gift/"]');
      if (giftAnchor) return giftAnchor.href;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical && canonical.href.includes('/gift/')) return canonical.href;
      return null;
    }

    if (host.includes('washingtonpost.com')) {
      const giftEl = document.querySelector('[data-gift-link], [href*="gift="], a[href*="&gift="], a[href*="?gift="]');
      if (giftEl) return giftEl.href || giftEl.dataset.giftLink;
      return null;
    }

    if (host.includes('theatlantic.com')) {
      const giftEl = document.querySelector('a[href*="gift"], [data-gift]');
      if (giftEl) return giftEl.href || giftEl.dataset.gift;
      return null;
    }

    return null;
  }

  // --- Chart vs photo heuristics (run against the live DOM where naturalWidth is available) ---

  const CHART_KEYWORDS = /chart|graph|map|infographic|graphic|figure|plot|diagram|data|viz/i;

  function looksLikeChart(img) {
    // Keyword match in src URL
    try {
      const path = new URL(img.src).pathname;
      if (CHART_KEYWORDS.test(path)) return true;
    } catch (_) {}

    // Keyword match in alt text, title, or aria-label
    if (CHART_KEYWORDS.test(img.alt || '')) return true;
    if (CHART_KEYWORDS.test(img.title || '')) return true;
    if (CHART_KEYWORDS.test(img.getAttribute('aria-label') || '')) return true;

    // Keyword match in the nearest figcaption
    const figure = img.closest('figure');
    if (figure) {
      const caption = figure.querySelector('figcaption');
      if (caption && CHART_KEYWORDS.test(caption.textContent)) return true;
    }

    // Landscape aspect ratio — charts are almost always wider than tall.
    // Photos can be landscape too, but combined with the above this catches most charts.
    const w = img.naturalWidth || img.getAttribute('width');
    const h = img.naturalHeight || img.getAttribute('height');
    if (w && h && Number(w) > Number(h) * 1.3) return true;

    return false;
  }

  // Build a set of src URLs to keep (charts) before we clone the document.
  function buildKeepSet() {
    const keep = new Set();
    document.querySelectorAll('img').forEach(img => {
      if (img.src && looksLikeChart(img)) keep.add(img.src);
    });
    return keep;
  }

  // --- Article extraction via Readability ---

  function extractArticle() {
    const keepSrcs = buildKeepSet();

    const docClone = document.cloneNode(true);

    // Remove all media that isn't a kept chart image
    docClone.querySelectorAll('img').forEach(img => {
      if (!keepSrcs.has(img.src)) img.remove();
    });
    docClone.querySelectorAll('picture, video, canvas, audio, svg').forEach(el => el.remove());

    // Remove figures that are now empty (had only stripped images) or never had a table/chart
    docClone.querySelectorAll('figure').forEach(fig => {
      const hasContent = fig.querySelector('img, table');
      if (!hasContent) fig.remove();
    });

    const reader = new Readability(docClone);
    const article = reader.parse();

    if (!article) return null;

    let publication = article.siteName;
    if (!publication) {
      publication = window.location.hostname
        .replace(/^www\./, '')
        .split('.')
        .slice(0, -1)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
    }

    return {
      title: article.title || document.title,
      byline: article.byline || '',
      textContent: article.textContent || '',
      content: article.content || '',
      publication,
      url: window.location.href,
    };
  }

  // --- Main ---

  const giftLink = detectGiftLink();
  const article = extractArticle();

  return { giftLink, article };
})();
