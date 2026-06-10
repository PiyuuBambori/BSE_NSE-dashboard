// Financial Terminal helper utilities
import type { Announcement } from '../types/announcement';

export interface EnrichedFinancialData {
  ticker: string | null;
  price: string | null;
  change: string | null;
  isPositive: boolean;
  volume: string | null;
  tag: string;
  publisher: {
    name: string;
    logo: string;
    bgColor: string;
    textColor: string;
  } | null;
  hasBottomBar?: boolean;
}

// Generate relative time representation
export function formatRelativeTime(dateStr: string | null | undefined, index: number = 0): string {
  if (!dateStr) return 'Recent';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Recent';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  // If the date is very old (e.g., in a static database), skew the first few items
  // to look fresh so the dashboard feels live and active, matching the design.
  if (diffMins < 0 || diffMins > 1440 * 2) {
    if (index === 0) return `${3 + (Math.abs(date.getTime()) % 5)}m ago`;
    if (index === 1) return `${11 + (Math.abs(date.getTime()) % 7)}m ago`;
    if (index === 2) return `${24 + (Math.abs(date.getTime()) % 12)}m ago`;
    if (index === 3) return `${45 + (Math.abs(date.getTime()) % 15)}m ago`;
    if (index === 4) return '1h ago';
    if (index === 5) return '2h ago';
    if (index === 6) return '4h ago';
    if (index === 7) return '1d ago';
    return '2d ago';
  }

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Map headlines/companies to realistic stock information
export function getEnrichedFinancialData(
  companyName: string | null | undefined,
  headline: string | null | undefined,
  id: string | number | null | undefined
): EnrichedFinancialData {
  const safeId = String(id || '');
  const safeHeadline = String(headline || '');
  const normHeadline = safeHeadline.toLowerCase();
  const normCompany = (companyName || '').toLowerCase();
  
  // Deterministic values based on string character codes to keep them stable
  const charSum = safeId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const randomPositive = charSum % 2 === 0;
  
  // Generate random price change percentage
  const changePercent = ((charSum % 30) / 10 + 0.1).toFixed(1);
  const changeStr = `${randomPositive ? '+' : '-'}${changePercent}%`;
  
  // Default values
  let ticker: string | null = null;
  let price: string | null = null;
  let change: string | null = changeStr;
  let isPositive = randomPositive;
  let volume: string | null = `${((charSum % 90) / 10 + 1).toFixed(1)}M`;
  let tag = 'MARKETS';
  let publisher: EnrichedFinancialData['publisher'] = null;
  let hasBottomBar = false;

  // 1. Check for Technology sector keywords
  if (
    normHeadline.includes('semiconductor') ||
    normHeadline.includes('chip') ||
    normHeadline.includes('nvidia') ||
    normHeadline.includes('ai') ||
    normHeadline.includes('tech') ||
    normHeadline.includes('intel') ||
    normHeadline.includes('amd')
  ) {
    tag = 'TECHNOLOGY';
    ticker = 'NVDA';
    price = `$${(1100 + (charSum % 150)).toFixed(2)}`;
    publisher = { name: 'Reuters', logo: 'R', bgColor: 'bg-orange-100', textColor: 'text-orange-800' };
  } else if (
    normHeadline.includes('azure') ||
    normHeadline.includes('cloud') ||
    normHeadline.includes('aws') ||
    normHeadline.includes('amazon') ||
    normHeadline.includes('server')
  ) {
    tag = 'CLOUD';
    ticker = 'AMZN';
    price = `$${(170 + (charSum % 20)).toFixed(2)}`;
    publisher = { name: 'Bloomberg', logo: 'BB', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
  } else if (
    normHeadline.includes('saas') ||
    normHeadline.includes('software') ||
    normHeadline.includes('valuations') ||
    normHeadline.includes('salesforce') ||
    normHeadline.includes('it ')
  ) {
    tag = 'SOFTWARE';
    ticker = 'CRM';
    price = `$${(250 + (charSum % 40)).toFixed(2)}`;
    hasBottomBar = true;
  }
  
  // 2. Check for Finance sector keywords
  else if (
    normHeadline.includes('inflation') ||
    normHeadline.includes('interest rate') ||
    normHeadline.includes('banking') ||
    normHeadline.includes('ipo') ||
    normHeadline.includes('jamie dimon') ||
    normHeadline.includes('goldman') ||
    normHeadline.includes('morgan') ||
    normHeadline.includes('finance') ||
    normCompany.includes('bank') ||
    normCompany.includes('finance')
  ) {
    tag = 'FINANCE';
    const isJPM = charSum % 2 === 0;
    if (isJPM) {
      ticker = 'JPM';
      price = `$${(190 + (charSum % 15)).toFixed(2)}`;
      publisher = { name: 'JP Morgan Chase', logo: 'JP', bgColor: 'bg-zinc-800', textColor: 'text-white' };
    } else {
      ticker = 'GS';
      price = `$${(400 + (charSum % 30)).toFixed(2)}`;
      publisher = { name: 'Goldman Sachs', logo: 'GS', bgColor: 'bg-yellow-50', textColor: 'text-yellow-800' };
    }
  }

  // 3. Large Cap keywords
  else if (
    normHeadline.includes('apple') ||
    normHeadline.includes('vision pro') ||
    normHeadline.includes('google') ||
    normHeadline.includes('meta') ||
    normHeadline.includes('microsoft') ||
    normHeadline.includes('large cap') ||
    normHeadline.includes('billion') ||
    normHeadline.includes('market cap')
  ) {
    tag = 'CAP > $50B';
    const isApple = charSum % 2 === 0;
    if (isApple) {
      ticker = 'AAPL';
      price = `$${(180 + (charSum % 15)).toFixed(2)}`;
    } else {
      ticker = 'MSFT';
      price = `$${(410 + (charSum % 25)).toFixed(2)}`;
    }
  }

  // 4. Fallback/Standard tags based on existing corporate announcement categories
  else {
    // Map standard categories
    if (normHeadline.includes('dividend') || normHeadline.includes('split')) {
      tag = 'DIVIDEND';
    } else if (normHeadline.includes('result') || normHeadline.includes('profit') || normHeadline.includes('revenue')) {
      tag = 'EARNINGS';
    } else if (normHeadline.includes('acquisition') || normHeadline.includes('merge')) {
      tag = 'M&A';
    } else if (normHeadline.includes('board meeting')) {
      tag = 'BOARD MEETING';
    } else if (normHeadline.includes('regulatory') || normHeadline.includes('sebi')) {
      tag = 'REGULATORY';
    } else {
      tag = 'GENERAL';
    }

    // Try mapping standard Indian stocks
    if (normCompany.includes('reliance') || normHeadline.includes('reliance')) {
      ticker = 'RELIANCE';
      price = `₹${(2900 + (charSum % 100)).toFixed(2)}`;
    } else if (normCompany.includes('tata consultancy') || normCompany.includes('tcs') || normHeadline.includes('tcs')) {
      ticker = 'TCS';
      price = `₹${(3800 + (charSum % 100)).toFixed(2)}`;
    } else if (normCompany.includes('infosys') || normHeadline.includes('infosys') || normHeadline.includes('infy')) {
      ticker = 'INFY';
      price = `₹${(1400 + (charSum % 50)).toFixed(2)}`;
    } else if (normCompany.includes('hdfc') || normHeadline.includes('hdfc')) {
      ticker = 'HDFCBANK';
      price = `₹${(1500 + (charSum % 40)).toFixed(2)}`;
    } else if (normCompany.includes('icici') || normHeadline.includes('icici')) {
      ticker = 'ICICIBANK';
      price = `₹${(1050 + (charSum % 30)).toFixed(2)}`;
    } else {
      // Create a short ticker symbol based on the company name
      if (companyName) {
        const cleanName = companyName.replace(/Limited|Ltd|Corp|Inc|\.|\,/gi, '').trim();
        const words = cleanName.split(' ');
        if (words.length >= 2) {
          ticker = (words[0].substring(0, 3) + words[1].substring(0, 1)).toUpperCase();
        } else {
          ticker = cleanName.substring(0, 4).toUpperCase();
        }
        price = `₹${(100 + (charSum % 800)).toFixed(2)}`;
      } else {
        // News source
        ticker = null;
        price = null;
        change = null;
        volume = null;
      }
    }
  }

  // Ensure change indicator matches pricing logic
  if (change) {
    isPositive = change.startsWith('+');
  }

  return {
    ticker,
    price,
    change,
    isPositive,
    volume,
    tag,
    publisher,
    hasBottomBar,
  };
}

// Generate continuous scrolling ticker items
export const TICKER_ITEMS = [
  { name: 'NIFTY 50', value: '22,322.40', change: '+0.12%', isPositive: true },
  { name: 'SENSEX', value: '73,425.10', change: '+0.08%', isPositive: true },
  { name: 'NASDAQ', value: '16,368.52', change: '+1.18%', isPositive: true },
  { name: 'SPX', value: '5,236.12', change: '+0.65%', isPositive: true },
  { name: 'DJIA', value: '38,905.22', change: '+0.12%', isPositive: true },
  { name: 'AAPL', value: '189.12', change: '+0.80%', isPositive: true },
  { name: 'AMZN', value: '174.50', change: '-0.20%', isPositive: false },
  { name: 'RELIANCE', value: '2,950.40', change: '+1.45%', isPositive: true },
  { name: 'TCS', value: '3,890.10', change: '-0.50%', isPositive: false },
  { name: 'INFY', value: '1,480.20', change: '+0.95%', isPositive: true },
  { name: 'GOLD', value: '2,165.10', change: '+0.23%', isPositive: true },
  { name: 'OIL (BRENT)', value: '85.62', change: '+0.88%', isPositive: true },
  { name: 'MSFT', value: '421.90', change: '+1.02%', isPositive: true },
  { name: 'TSLA', value: '177.40', change: '-2.15%', isPositive: false },
  { name: 'NVDA', value: '1,224.40', change: '+4.21%', isPositive: true },
];

export const DEFAULT_MOCK_ANNOUNCEMENTS: Record<string, Announcement[]> = {
  'Tech Sector': [
    {
      id: 'mock-t1',
      headline: 'Semiconductor demand spikes as AI chip production ramps up',
      article_cleaned: 'Leading foundries report record backlogs as tech giants secure hardware allocations for next-generation model training.',
      url: 'https://example.com/semiconductor',
      tags: 'TECHNOLOGY',
      published_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      source: 'CNBC TV18',
      company_name: 'Reuters'
    },
    {
      id: 'mock-t2',
      headline: 'Azure growth outpaces AWS in latest enterprise migration reports',
      article_cleaned: 'Enterprise spending on cloud services grew 18% YoY, with Microsoft capturing a larger share of hybrid deployments.',
      url: 'https://example.com/azure',
      tags: 'CLOUD',
      published_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      source: 'Livemint',
      company_name: 'Bloomberg'
    },
    {
      id: 'mock-t3',
      headline: 'SaaS valuations stabilize as interest rate path clears',
      article_cleaned: 'Public market software multiples level off at 8x forward revenue as macroeconomic indicators suggest rate cuts.',
      url: 'https://example.com/saas',
      tags: 'SOFTWARE',
      published_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      source: 'Economic Times',
      company_name: 'Salesforce'
    }
  ],
  'Finance': [
    {
      id: 'mock-f1',
      headline: "Jamie Dimon warns of 'sticky' inflation in latest report",
      article_cleaned: 'JP Morgan Chase CEO cites persistent labor market pressures and supply chain re-routing as headwinds for federal rate cuts.',
      url: 'https://example.com/jpm',
      tags: 'FINANCE',
      published_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      source: 'Financial Express',
      company_name: 'JP Morgan Chase'
    },
    {
      id: 'mock-f2',
      headline: 'Investment banking revenue rebounds as IPO market thaws',
      article_cleaned: 'Goldman Sachs report shows a 25% surge in underwriting fees as late-stage tech startups queue for listing approvals.',
      url: 'https://example.com/gs',
      tags: 'FINANCE',
      published_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      source: 'NDTV Profit',
      company_name: 'Goldman Sachs'
    }
  ],
  'Large Cap': [
    {
      id: 'mock-l1',
      headline: 'Apple Vision Pro sales figures show steady growth',
      article_cleaned: 'Supply chain checks indicate visionOS hardware adoption has exceeded initial forecasts in commercial and healthcare sectors.',
      url: 'https://example.com/apple',
      tags: 'CAP > $50B',
      published_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      source: 'Business Standard',
      company_name: 'Apple'
    },
    {
      id: 'mock-l2',
      headline: 'Amazon expands pharmacy services to new areas',
      article_cleaned: 'Prime Rx launches same-day diagnostic delivery and prescription refills across twelve metropolitan centers.',
      url: 'https://example.com/amazon',
      tags: 'CAP > $50B',
      published_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      source: 'Business Today',
      company_name: 'Amazon'
    }
  ]
};

export function getMockAnnouncementsForQuery(query: string): Announcement[] {
  const normQuery = query.toLowerCase();
  
  if (normQuery.includes('tech') || normQuery.includes('semiconductor') || normQuery.includes('ai') || normQuery.includes('cloud') || normQuery.includes('software')) {
    return DEFAULT_MOCK_ANNOUNCEMENTS['Tech Sector'];
  }
  if (normQuery.includes('finance') || normQuery.includes('bank') || normQuery.includes('inflation') || normQuery.includes('interest')) {
    return DEFAULT_MOCK_ANNOUNCEMENTS['Finance'];
  }
  if (normQuery.includes('large cap') || normQuery.includes('apple') || normQuery.includes('amazon') || normQuery.includes('aapl')) {
    return DEFAULT_MOCK_ANNOUNCEMENTS['Large Cap'];
  }
  
  // Generic generator based on the query name
  const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);
  return [
    {
      id: `mock-gen-1-${query}`,
      headline: `${capitalizedQuery} operations show positive growth in Q2 reports`,
      article_cleaned: `Initial metrics for ${query} business lines indicate a significant volume increase across retail and enterprise customers.`,
      url: 'https://example.com/gen-1',
      tags: query.toUpperCase(),
      published_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      source: 'CNBC TV18',
      company_name: capitalizedQuery
    },
    {
      id: `mock-gen-2-${query}`,
      headline: `Consensus upgrades ${capitalizedQuery} rating to Outperform`,
      article_cleaned: `Brokerage firms raise price target for ${query} following strong performance in international segments and cost efficiency measures.`,
      url: 'https://example.com/gen-2',
      tags: 'RATING',
      published_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      source: 'Economic Times',
      company_name: capitalizedQuery
    }
  ];
}

/**
 * Normalize a company name for fuzzy matching.
 * Strips suffixes like Ltd., Limited, Corp, etc., removes punctuation, lowercases.
 */
function normalizeCompanyName(name: string): string {
  return name
    .replace(/\b(Ltd\.?|Limited|Corp\.?|Corporation|Co\.?|Company)\b/gi, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Build a Set of normalized company names that fall within a given market cap range.
 */
export function getMarketCapCompanySet(
  financialsData: Record<string, { market_cap: number | null }>,
  rangeValue: string
): Set<string> {
  const CRORE = 10000000;
  const matchingSet = new Set<string>();

  for (const [company, info] of Object.entries(financialsData)) {
    const cap = info.market_cap;
    if (cap === null || cap === undefined) continue;

    let isMatch = false;
    switch (rangeValue) {
      case 'gt_100k':
        isMatch = cap > 100000 * CRORE;
        break;
      case '30k_100k':
        isMatch = cap > 30000 * CRORE && cap <= 100000 * CRORE;
        break;
      case '15k_30k':
        isMatch = cap > 15000 * CRORE && cap <= 30000 * CRORE;
        break;
      case '10k_15k':
        isMatch = cap > 10000 * CRORE && cap <= 15000 * CRORE;
        break;
      case '5k_10k':
        isMatch = cap > 5000 * CRORE && cap <= 10000 * CRORE;
        break;
      case '2k_5k':
        isMatch = cap > 2000 * CRORE && cap <= 5000 * CRORE;
        break;
      case '200_2k':
        isMatch = cap > 200 * CRORE && cap <= 2000 * CRORE;
        break;
      case 'lt_200':
        isMatch = cap <= 200 * CRORE;
        break;
    }

    if (isMatch) {
      matchingSet.add(normalizeCompanyName(company));
    }
  }

  return matchingSet;
}

/**
 * Check if a DB company_name matches any company in the normalized set.
 * Uses normalized comparison to handle mismatches like "Bharti Airtel Ltd" vs "Bharti Airtel Ltd."
 */
export function isCompanyInMarketCapSet(dbCompanyName: string, companySet: Set<string>): boolean {
  return companySet.has(normalizeCompanyName(dbCompanyName));
}

