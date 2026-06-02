/**
 * Publication abbreviation lookup.
 *
 * getPublicationAbbr(siteName, hostname) → short label for the email subject.
 *
 * Lookup order:
 *   1. Exact hostname match  (most reliable — Readability siteName varies)
 *   2. Normalised siteName match (lowercased, articles stripped)
 *   3. Fall back to the siteName as-is
 */

// ---------------------------------------------------------------------------
// Hostname → abbreviation
// ---------------------------------------------------------------------------
const BY_HOST = {
  // US national newspapers
  'nytimes.com':              'NYT',
  'wsj.com':                  'WSJ',
  'washingtonpost.com':       'WaPo',
  'latimes.com':              'LA Times',
  'chicagotribune.com':       'Chicago Tribune',
  'sfchronicle.com':          'SF Chronicle',
  'bostonglobe.com':          'Boston Globe',
  'nypost.com':               'NY Post',
  'usatoday.com':             'USA Today',
  'nydailynews.com':          'NY Daily News',
  'houstonchronicle.com':     'Houston Chronicle',
  'inquirer.com':             'Philadelphia Inquirer',
  'miamiherald.com':          'Miami Herald',
  'dallasnews.com':           'Dallas Morning News',
  'denverpost.com':           'Denver Post',
  'seattletimes.com':         'Seattle Times',
  'startribune.com':          'Star Tribune',
  'ajc.com':                  'AJC',
  'azcentral.com':            'AZ Republic',
  'freep.com':                'Detroit Free Press',
  'oregonlive.com':           'The Oregonian',
  'cleveland.com':            'Cleveland Plain Dealer',
  'post-gazette.com':         'Pittsburgh Post-Gazette',
  'stltoday.com':             'St. Louis Post-Dispatch',
  'sacbee.com':               'Sacramento Bee',
  'tampabay.com':             'Tampa Bay Times',
  'sun-sentinel.com':         'Sun Sentinel',
  'baltimoresun.com':         'Baltimore Sun',
  'courant.com':              'Hartford Courant',

  // US magazines & weeklies
  'newyorker.com':            'New Yorker',
  'theatlantic.com':          'The Atlantic',
  'time.com':                 'Time',
  'newsweek.com':             'Newsweek',
  'wired.com':                'Wired',
  'rollingstone.com':         'Rolling Stone',
  'vanityfair.com':           'Vanity Fair',
  'newyorkmag.com':           'NY Mag',
  'nymag.com':                'NY Mag',
  'harpers.org':              "Harper's",
  'newrepublic.com':          'New Republic',
  'nationalreview.com':       'National Review',
  'motherjones.com':          'Mother Jones',
  'slate.com':                'Slate',
  'salon.com':                'Salon',
  'vox.com':                  'Vox',
  'huffpost.com':             'HuffPost',
  'thedailybeast.com':        'Daily Beast',
  'theintercept.com':         'The Intercept',
  'propublica.org':           'ProPublica',
  'buzzfeednews.com':         'BuzzFeed News',

  // US business & finance
  'bloomberg.com':            'Bloomberg',
  'ft.com':                   'FT',
  'barrons.com':              "Barron's",
  'marketwatch.com':          'MarketWatch',
  'businessinsider.com':      'Business Insider',
  'theinformation.com':       'The Information',
  'axios.com':                'Axios',
  'politico.com':             'Politico',
  'thehill.com':              'The Hill',
  'fortune.com':              'Fortune',
  'forbes.com':               'Forbes',
  'inc.com':                  'Inc.',
  'fastcompany.com':          'Fast Company',
  'hbr.org':                  'HBR',
  'technologyreview.com':     'MIT Tech Review',
  'scientificamerican.com':   'Sci Am',

  // US tech & digital
  'techcrunch.com':           'TechCrunch',
  'theverge.com':             'The Verge',
  'arstechnica.com':          'Ars Technica',
  'gizmodo.com':              'Gizmodo',
  'engadget.com':             'Engadget',
  'cnet.com':                 'CNET',
  'zdnet.com':                'ZDNet',
  'mashable.com':             'Mashable',
  '9to5mac.com':              '9to5Mac',
  'macrumors.com':            'MacRumors',
  'appleinsider.com':         'AppleInsider',
  'venturebeat.com':          'VentureBeat',
  'recode.net':               'Recode',
  'protocol.com':             'Protocol',
  'wealthsimple.com':         'Wealthsimple',

  // Wire services
  'apnews.com':               'AP',
  'reuters.com':              'Reuters',

  // International English
  'theguardian.com':          'Guardian',
  'thetimes.co.uk':           'The Times',
  'telegraph.co.uk':          'Telegraph',
  'dailymail.co.uk':          'Daily Mail',
  'independent.co.uk':        'The Independent',
  'bbc.com':                  'BBC',
  'bbc.co.uk':                'BBC',
  'economist.com':            'Economist',
  'foreignaffairs.com':       'Foreign Affairs',
  'foreignpolicy.com':        'Foreign Policy',
  'scmp.com':                 'SCMP',
  'nikkei.com':               'Nikkei',
  'aljazeera.com':            'Al Jazeera',
  'dw.com':                   'DW',
  'spiegel.de':               'Der Spiegel',
  'lemonde.fr':               'Le Monde',
  'elpais.com':               'El País',
  'corriere.it':              'Corriere della Sera',
  'haaretz.com':              'Haaretz',
  'timesofisrael.com':        'Times of Israel',
  'thehindu.com':             'The Hindu',
  'hindustantimes.com':       'Hindustan Times',
  'smh.com.au':               'Sydney Morning Herald',
  'theaustralian.com.au':     'The Australian',
  'globeandmail.com':         'Globe and Mail',
  'nationalpost.com':         'National Post',

  // Substack & independent
  'substack.com':             'Substack',
};

// ---------------------------------------------------------------------------
// Normalised publication name → abbreviation  (fallback when hostname misses)
// ---------------------------------------------------------------------------
const BY_NAME = (() => {
  const map = {};
  const entries = [
    ['new york times',              'NYT'],
    ['the new york times',          'NYT'],
    ['wall street journal',         'WSJ'],
    ['the wall street journal',     'WSJ'],
    ['washington post',             'WaPo'],
    ['the washington post',         'WaPo'],
    ['los angeles times',           'LA Times'],
    ['chicago tribune',             'Chicago Tribune'],
    ['san francisco chronicle',     'SF Chronicle'],
    ['boston globe',                'Boston Globe'],
    ['the boston globe',            'Boston Globe'],
    ['new york post',               'NY Post'],
    ['usa today',                   'USA Today'],
    ['new york daily news',         'NY Daily News'],
    ['houston chronicle',           'Houston Chronicle'],
    ['philadelphia inquirer',       'Philadelphia Inquirer'],
    ['miami herald',                'Miami Herald'],
    ['dallas morning news',         'Dallas Morning News'],
    ['denver post',                 'Denver Post'],
    ['seattle times',               'Seattle Times'],
    ['the seattle times',           'Seattle Times'],
    ['star tribune',                'Star Tribune'],
    ['atlanta journal-constitution','AJC'],
    ['arizona republic',            'AZ Republic'],
    ['detroit free press',          'Detroit Free Press'],
    ['the new yorker',              'New Yorker'],
    ['the atlantic',                'The Atlantic'],
    ['time',                        'Time'],
    ['newsweek',                    'Newsweek'],
    ['wired',                       'Wired'],
    ['rolling stone',               'Rolling Stone'],
    ['vanity fair',                 'Vanity Fair'],
    ['new york magazine',           'NY Mag'],
    ["harper's",                    "Harper's"],
    ['the new republic',            'New Republic'],
    ['national review',             'National Review'],
    ['mother jones',                'Mother Jones'],
    ['slate',                       'Slate'],
    ['salon',                       'Salon'],
    ['vox',                         'Vox'],
    ['huffpost',                    'HuffPost'],
    ['the daily beast',             'Daily Beast'],
    ['the intercept',               'The Intercept'],
    ['propublica',                  'ProPublica'],
    ['buzzfeed news',               'BuzzFeed News'],
    ['bloomberg',                   'Bloomberg'],
    ['bloomberg businessweek',      'Businessweek'],
    ['financial times',             'FT'],
    ['the financial times',         'FT'],
    ["barron's",                    "Barron's"],
    ['marketwatch',                 'MarketWatch'],
    ['business insider',            'Business Insider'],
    ['the information',             'The Information'],
    ['axios',                       'Axios'],
    ['politico',                    'Politico'],
    ['the hill',                    'The Hill'],
    ['fortune',                     'Fortune'],
    ['forbes',                      'Forbes'],
    ['inc.',                        'Inc.'],
    ['fast company',                'Fast Company'],
    ['harvard business review',     'HBR'],
    ['mit technology review',       'MIT Tech Review'],
    ['scientific american',         'Sci Am'],
    ['techcrunch',                  'TechCrunch'],
    ['the verge',                   'The Verge'],
    ['ars technica',                'Ars Technica'],
    ['gizmodo',                     'Gizmodo'],
    ['engadget',                    'Engadget'],
    ['cnet',                        'CNET'],
    ['zdnet',                       'ZDNet'],
    ['mashable',                    'Mashable'],
    ['venturebeat',                 'VentureBeat'],
    ['associated press',            'AP'],
    ['reuters',                     'Reuters'],
    ['the guardian',                'Guardian'],
    ['the times',                   'The Times'],
    ['the telegraph',               'Telegraph'],
    ['daily mail',                  'Daily Mail'],
    ['the independent',             'The Independent'],
    ['bbc news',                    'BBC'],
    ['bbc',                         'BBC'],
    ['the economist',               'Economist'],
    ['foreign affairs',             'Foreign Affairs'],
    ['foreign policy',              'Foreign Policy'],
    ['south china morning post',    'SCMP'],
    ['nikkei asia',                 'Nikkei'],
    ['al jazeera',                  'Al Jazeera'],
    ['der spiegel',                 'Der Spiegel'],
    ['le monde',                    'Le Monde'],
    ['el país',                     'El País'],
    ['haaretz',                     'Haaretz'],
    ['times of israel',             'Times of Israel'],
    ['the hindu',                   'The Hindu'],
    ['sydney morning herald',       'SMH'],
    ['the australian',              'The Australian'],
    ['the globe and mail',          'Globe and Mail'],
    ['national post',               'National Post'],
  ];
  for (const [key, val] of entries) map[key.toLowerCase()] = val;
  return map;
})();

/**
 * Returns the short display name for a publication.
 * @param {string} siteName  - Readability's article.siteName (may be empty)
 * @param {string} hostname  - window.location.hostname of the article page
 * @returns {string}
 */
function getPublicationAbbr(siteName, hostname) {
  // 1. Hostname lookup (strip leading www.)
  const host = (hostname || '').replace(/^www\./, '');
  if (BY_HOST[host]) return BY_HOST[host];

  // 2. Also try the parent domain (e.g. "amp.wsj.com" → "wsj.com")
  const parts = host.split('.');
  if (parts.length > 2) {
    const apex = parts.slice(-2).join('.');
    if (BY_HOST[apex]) return BY_HOST[apex];
  }

  // 3. Normalised siteName lookup
  const name = (siteName || '').trim().toLowerCase();
  if (name && BY_NAME[name]) return BY_NAME[name];

  // 4. Fall back to siteName as provided (or hostname-derived label)
  return siteName || host;
}
