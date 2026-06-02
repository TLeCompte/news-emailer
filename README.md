# news-emailer

A Chrome extension that turns any news article into a clean, formatted email draft in one click.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

---

## What it does

When you're reading a news article and want to share it, click the extension icon. It will:

1. **Extract the article** — strips ads, navigation, comments, and other noise using [Mozilla Readability](https://github.com/mozilla/readability) (the same engine that powers Firefox Reader View)
2. **Copy a rich HTML body to your clipboard** — formatted with the headline as a hyperlink, italic byline, clean paragraphs, and any data tables or charts from the article
3. **Open a new draft** in your default mail client with the subject pre-filled as `Publication: Headline`
4. **Gift link field** — paste your gift link into the popup before opening the draft; it becomes the hyperlink target on the headline

Just paste (⌘V / Ctrl+V) into the email body and send.

---

## Email format

**Subject:** `The Wall Street Journal: SpaceX’s IPO Is the Final Frontier for Index Funds`

**Body (pasted as rich HTML):**
- Headline linked to the gift URL
- Italic byline
- Clean article text with proper paragraph spacing
- Data tables preserved with light formatting
- Charts and infographics included; photos stripped

---

## Gift links

Most publishers (NYT, WSJ, Bloomberg, The Atlantic, etc.) only generate a gift link after the user explicitly clicks "Share" or "Gift this article" — there's nothing to detect in the page until that happens. So the extension always shows a **paste field** in the popup. Copy the gift link from the site's share menu, paste it in, and it becomes the clickable headline link in the email.

The extension works on any article page regardless of publication.

---

## Setup

### 1. Load the extension in Chrome

1. Clone or download this repo
2. Open `chrome://extensions`
3. Enable **Developer mode** (toggle, top right)
4. Click **Load unpacked** → select the `extension/` folder

### 2. Set your preferred client as default mail handler

When you click "Open Draft", the extension opens a `mailto:` link. Any mail client that registers as a `mailto:` handler will work.

---

## How to use

1. Navigate to a news article
2. Click the **Article Emailer** icon in the Chrome toolbar
3. The popup shows the detected subject line and gift link field
   - Paste your gift link into the field
4. Click **Open Draft in Email**
5. Your mail client opens with the subject pre-filled
6. Click in the body area and paste with **⌘V** (Mac) or **Ctrl+V** (Windows/Linux)
7. Add your recipient and send

---

## Chart vs photo detection

The extension tries to include informational graphics (charts, maps, data visualizations) while stripping portrait photos and other decorative images. It uses a heuristic approach:

- **Kept:** images whose URL, alt text, caption, or aria-label contains keywords like `chart`, `graph`, `map`, `infographic`, `diagram`, `data`, `viz`
- **Kept:** images with a landscape aspect ratio (width ≥ 1.3× height) — typical of charts
- **Stripped:** everything else (photos, logos, decorative images)

This isn't perfect — some photos will sneak through and some charts will get stripped — but it works well in practice for data-heavy publications.

---

## Project structure

```
extension/
├── manifest.json          # Chrome Manifest V3
├── content/
│   └── content.js         # Injected into article pages: extracts content + detects gift links
├── popup/
│   ├── popup.html
│   ├── popup.js           # Drives the popup UI and builds the email
│   └── popup.css
├── lib/
│   └── Readability.js     # Mozilla Readability (bundled, MIT license)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Contributing

Issues and pull requests welcome. If you add gift link detection for a new publication, please include the site's hostname and a brief note on which DOM element or attribute contains the link.

---

## License

MIT
