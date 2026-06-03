export interface Announcement {
  id: string;
  headline: string;
  article_cleaned: string;
  url: string;
  tags: string[] | string | null;
  published_at: string;
  source: 'NSE' | 'BSE';
}

export interface DashboardFilters {
  search: string;
  source: 'All' | 'NSE' | 'BSE';
  dateRange: 'Today' | '7d' | '30d' | 'custom';
  startDate: string | null;
  endDate: string | null;
  selectedTags: string[];
}

export interface DashboardStats {
  totalNse: number;
  totalBse: number;
  totalToday: number;
  lastUpdate: string | null;
}
