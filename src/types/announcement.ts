// All possible source values in the database
export type AnnouncementSource =
  | 'NSE'
  | 'BSE'
  | 'CNBC TV18'
  | 'Livemint'
  | 'NDTV Profit'
  | 'Financial Express'
  | 'Business Today'
  | 'Business Standard'
  | 'Economic Times'
  | 'Economic Times Mobile'
  | 'Hindu BusinessLine';

// Display source — merges "Economic Times Mobile" into "Economic Times"
export type DisplaySource =
  | 'NSE'
  | 'BSE'
  | 'CNBC TV18'
  | 'Livemint'
  | 'NDTV Profit'
  | 'Financial Express'
  | 'Business Today'
  | 'Business Standard'
  | 'Economic Times'
  | 'Hindu BusinessLine';

// Filter value — "All" or any individual display source
export type SourceFilter = 'All' | DisplaySource;

// All filter buttons in order
export const SOURCE_FILTERS: SourceFilter[] = [
  'All',
  'NSE',
  'BSE',
  'CNBC TV18',
  'Livemint',
  'NDTV Profit',
  'Financial Express',
  'Business Today',
  'Business Standard',
  'Economic Times',
  'Hindu BusinessLine',
];

// Maps a display source to the actual DB source values it covers
export const SOURCE_DB_MAP: Record<DisplaySource, AnnouncementSource[]> = {
  'NSE': ['NSE'],
  'BSE': ['BSE'],
  'CNBC TV18': ['CNBC TV18'],
  'Livemint': ['Livemint'],
  'NDTV Profit': ['NDTV Profit'],
  'Financial Express': ['Financial Express'],
  'Business Today': ['Business Today'],
  'Business Standard': ['Business Standard'],
  'Economic Times': ['Economic Times', 'Economic Times Mobile'],
  'Hindu BusinessLine': ['Hindu BusinessLine'],
};

// Short labels for badges/pills when space is tight
export const SOURCE_SHORT_LABELS: Record<DisplaySource, string> = {
  'NSE': 'NSE',
  'BSE': 'BSE',
  'CNBC TV18': 'CNBC TV18',
  'Livemint': 'Livemint',
  'NDTV Profit': 'NDTV Profit',
  'Financial Express': 'Fin Express',
  'Business Today': 'Biz Today',
  'Business Standard': 'Biz Standard',
  'Economic Times': 'Eco Times',
  'Hindu BusinessLine': 'BusinessLine',
};

// Color themes for each source
export const SOURCE_COLORS: Record<DisplaySource, { badge: string; letter: string; accent: string }> = {
  'NSE': { badge: 'bg-violet-50 text-violet-600 border-violet-100', letter: 'from-violet-400 to-purple-500', accent: 'from-violet-500 to-purple-600' },
  'BSE': { badge: 'bg-blue-50 text-blue-600 border-blue-100', letter: 'from-blue-400 to-cyan-500', accent: 'from-blue-500 to-cyan-600' },
  'CNBC TV18': { badge: 'bg-sky-50 text-sky-600 border-sky-100', letter: 'from-sky-400 to-blue-500', accent: 'from-sky-500 to-blue-600' },
  'Livemint': { badge: 'bg-emerald-50 text-emerald-600 border-emerald-100', letter: 'from-emerald-400 to-green-500', accent: 'from-emerald-500 to-green-600' },
  'NDTV Profit': { badge: 'bg-red-50 text-red-600 border-red-100', letter: 'from-red-400 to-rose-500', accent: 'from-red-500 to-rose-600' },
  'Financial Express': { badge: 'bg-amber-50 text-amber-600 border-amber-100', letter: 'from-amber-400 to-orange-500', accent: 'from-amber-500 to-orange-600' },
  'Business Today': { badge: 'bg-teal-50 text-teal-600 border-teal-100', letter: 'from-teal-400 to-cyan-500', accent: 'from-teal-500 to-cyan-600' },
  'Business Standard': { badge: 'bg-indigo-50 text-indigo-600 border-indigo-100', letter: 'from-indigo-400 to-blue-500', accent: 'from-indigo-500 to-blue-600' },
  'Economic Times': { badge: 'bg-orange-50 text-orange-600 border-orange-100', letter: 'from-orange-400 to-red-500', accent: 'from-orange-500 to-red-600' },
  'Hindu BusinessLine': { badge: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100', letter: 'from-fuchsia-400 to-pink-500', accent: 'from-fuchsia-500 to-pink-600' },
};

// Helper: get display source from raw DB source
export function getDisplaySource(dbSource: string): DisplaySource {
  if (dbSource === 'Economic Times Mobile') return 'Economic Times';
  return dbSource as DisplaySource;
}

// Helper: get colors for any DB source
export function getSourceColors(dbSource: string) {
  const display = getDisplaySource(dbSource);
  return SOURCE_COLORS[display] || SOURCE_COLORS['NSE']; // fallback
}

export interface Announcement {
  id: string;
  headline: string;
  article_cleaned: string;
  url: string;
  tags: string[] | string | null;
  published_at: string;
  source: AnnouncementSource;
  company_name?: string | null;
}

export interface DashboardFilters {
  search: string;
  source: SourceFilter;
  dateRange: 'All' | 'Today' | '7d' | '30d' | 'custom';
  startDate: string | null;
  endDate: string | null;
  selectedTags: string[];
  page: number;
}

export interface DashboardStats {
  totalNse: number;
  totalBse: number;
  totalNews: number;
  totalToday: number;
  lastUpdate: string | null;
}
