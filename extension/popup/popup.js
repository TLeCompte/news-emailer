const MAX_PLAIN_CHARS = 6000;

const $ = id => document.getElementById(id);

function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }

function setError(msg) {
  hide('loading');
  hide('form');
  $('error-msg').textContent = msg;
  show('error');
}

// Email clients strip <style> blocks on paste, so stamp spacing as inline styles instead.
function inlineParaSpacing(html) {
  // Add margin-bottom to <p> tags that don't already have a style attribute.
  // Also style tables inline so they survive the paste.
  return html
    .replace(/<p\b([^>]*)>/gi, (match, attrs) => {
      if (/style\s*=/i.test(attrs)) return match;
      return `<p${attrs} style="margin:0 0 1em 0">`;
    })
    .replace(/<table\b([^>]*)>/gi, (match, attrs) => {
      if (/style\s*=/i.test(attrs)) return match;
      return `<table${attrs} style="border-collapse:collapse;margin:1em 0;font-size:0.9em">`;
    })
    .replace(/<td\b([^>]*)>/gi, (match, attrs) => {
      if (/style\s*=/i.test(attrs)) return match;
      return `<td${attrs} style="border:1px solid #ccc;padding:4px 8px">`;
    })
    .replace(/<th\b([^>]*)>/gi, (match, attrs) => {
      if (/style\s*=/i.test(attrs)) return match;
      return `<th${attrs} style="border:1px solid #ccc;padding:4px 8px;background:#f5f5f5;font-weight:600">`;
    });
}

// Build the HTML body: linked headline, byline, then Readability's article HTML.
function buildHtmlBody(title, byline, giftLink, articleHtml) {
  const linkTarget = giftLink || '#';
  const bylineHtml = byline
    ? `<p style="color:#666;font-style:italic;margin:4px 0 16px">${escapeHtml(byline)}</p>`
    : '';

  return [
    `<h2 style="margin:0 0 4px"><a href="${escapeHtml(linkTarget)}">${escapeHtml(title)}</a></h2>`,
    bylineHtml,
    inlineParaSpacing(articleHtml),
  ].filter(Boolean).join('\n');
}

// Plain-text fallback: convert </p> boundaries to double newlines, strip remaining tags.
function htmlToPlainText(html) {
  return html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    setError('No active tab found.');
    return;
  }

  let results;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['lib/Readability.js'],
    });
    results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/content.js'],
    });
  } catch (e) {
    setError('Cannot access this page. Try a news article tab.');
    return;
  }

  const result = results?.[0]?.result;
  if (!result || !result.article) {
    setError('Could not parse article content on this page.');
    return;
  }

  const { article } = result;

  const pubLabel = getPublicationAbbr(article.publication, article.hostname);
  $('subject').value = `${pubLabel}: ${article.title}`;

  const giftInput = $('gift-link');

  hide('loading');
  show('form');

  $('open-draft').addEventListener('click', async () => {
    const subject = $('subject').value.trim();
    const finalGiftLink = giftInput.value.trim();

    if (!subject) {
      $('subject').focus();
      return;
    }

    // Build HTML body
    const htmlBody = buildHtmlBody(
      article.title,
      article.byline,
      finalGiftLink,
      article.content
    );

    // Build plain-text fallback (for mailto: body and non-HTML paste)
    const plainText = htmlToPlainText(article.content);
    const truncated = plainText.length > MAX_PLAIN_CHARS;
    const plainBody = (finalGiftLink ? finalGiftLink + '\n\n' : '') +
      (truncated ? plainText.slice(0, MAX_PLAIN_CHARS) + '\n\n… [article truncated]' : plainText);

    if (truncated) show('char-warning');

    // Copy HTML to clipboard so user can paste rich content into their email client
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlBody], { type: 'text/html' }),
          'text/plain': new Blob([plainBody], { type: 'text/plain' }),
        }),
      ]);
    } catch (e) {
      // Clipboard write failed — fall through, mailto body is the fallback
    }

    // Open mailto: with only subject — no body parameter so the email client opens
    // with an empty compose, and the clipboard paste (⌘V) inserts the HTML body.
    const mailtoUrl = 'mailto:?subject=' + encodeURIComponent(subject);

    chrome.tabs.create({ url: mailtoUrl });

    // Show confirmation in popup
    $('open-draft').textContent = 'Opened — paste body with ⌘V';
    $('open-draft').disabled = true;
    show('clipboard-notice');
  });
}

init();
