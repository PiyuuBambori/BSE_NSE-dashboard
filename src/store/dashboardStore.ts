import { create } from 'zustand';
import type { Announcement, DashboardFilters, DashboardStats, SourceFilter } from '../types/announcement';
import { SOURCE_DB_MAP, getDisplaySource } from '../types/announcement';

interface DashboardState {
  announcements: Announcement[];
  hasMore: boolean;
  totalCount: number;
  selectedAnnouncement: Announcement | null;
  filters: DashboardFilters;
  stats: DashboardStats;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastUpdated: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  setAnnouncements: (announcements: Announcement[], hasMore: boolean, totalCount?: number) => void;
  appendAnnouncements: (announcements: Announcement[], hasMore: boolean, totalCount?: number) => void;
  addRealtimeAnnouncement: (announcement: Announcement) => void;
  setSelectedAnnouncement: (announcement: Announcement | null) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  setStats: (stats: Partial<DashboardStats>) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
  setLastUpdated: (timestamp: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFilters: DashboardFilters = {
  search: '',
  source: 'All',
  dateRange: 'All',
  startDate: null,
  endDate: null,
  selectedTags: [],
  page: 1,
};

const initialStats: DashboardStats = {
  totalNse: 0,
  totalBse: 0,
  totalNews: 0,
  totalToday: 0,
  lastUpdate: null,
};

/**
 * Checks if a raw DB source value matches the current source filter.
 */
function matchesSourceFilter(dbSource: string, filterSource: SourceFilter): boolean {
  if (filterSource === 'All') return true;
  const dbValues = SOURCE_DB_MAP[filterSource];
  if (!dbValues) return false;
  return dbValues.includes(dbSource as any);
}

export const useDashboardStore = create<DashboardState>((set) => ({
  announcements: [],
  hasMore: true,
  totalCount: 0,
  selectedAnnouncement: null,
  filters: initialFilters,
  stats: initialStats,
  connectionStatus: 'connecting',
  lastUpdated: null,
  loading: false,
  error: null,

  setAnnouncements: (announcements, hasMore, totalCount = 0) =>
    set({ announcements, hasMore, totalCount, loading: false }),

  appendAnnouncements: (newAnnouncements, hasMore, totalCount = 0) =>
    set((state) => {
      const existingIds = new Set(state.announcements.map((a) => a.id));
      const filteredNew = newAnnouncements.filter((a) => !existingIds.has(a.id));
      return {
        announcements: [...state.announcements, ...filteredNew],
        hasMore,
        totalCount: totalCount || state.totalCount,
      };
    }),

  addRealtimeAnnouncement: (announcement) =>
    set((state) => {
      // Duplicate check
      if (state.announcements.some((a) => a.id === announcement.id)) {
        return {};
      }

      // Check if it matches current filters
      const matchesSource = matchesSourceFilter(announcement.source, state.filters.source);

      const matchesSearch =
        !state.filters.search ||
        announcement.headline.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        (announcement.company_name &&
          announcement.company_name.toLowerCase().includes(state.filters.search.toLowerCase())) ||
        (typeof announcement.tags === 'string' &&
          announcement.tags.toLowerCase().includes(state.filters.search.toLowerCase())) ||
        (Array.isArray(announcement.tags) &&
          announcement.tags.some((tag) =>
            tag.toLowerCase().includes(state.filters.search.toLowerCase())
          ));

      const matchesTags =
        state.filters.selectedTags.length === 0 ||
        (Array.isArray(announcement.tags) &&
          state.filters.selectedTags.every((t) => announcement.tags?.includes(t))) ||
        (typeof announcement.tags === 'string' &&
          state.filters.selectedTags.every((t) =>
            (announcement.tags as string).split(',').map((x) => x.trim()).includes(t)
          ));

      let matchesDate = true;
      const pubDate = new Date(announcement.published_at);
      const now = new Date();

      if (state.filters.dateRange === 'Today') {
        matchesDate = pubDate.toDateString() === now.toDateString();
      } else if (state.filters.dateRange === '7d') {
        matchesDate = pubDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (state.filters.dateRange === '30d') {
        matchesDate = pubDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (state.filters.dateRange === 'custom') {
        if (state.filters.startDate) matchesDate = pubDate >= new Date(state.filters.startDate);
        if (state.filters.endDate) matchesDate = matchesDate && pubDate <= new Date(state.filters.endDate);
      }

      const shouldAddToFeed = state.filters.page === 1 && matchesSource && matchesSearch && matchesTags && matchesDate;

      const isToday = pubDate.toDateString() === now.toDateString();
      const displaySource = getDisplaySource(announcement.source);
      const isExchange = displaySource === 'NSE' || displaySource === 'BSE';

      const updatedStats: DashboardStats = {
        ...state.stats,
        totalNse: displaySource === 'NSE' ? state.stats.totalNse + 1 : state.stats.totalNse,
        totalBse: displaySource === 'BSE' ? state.stats.totalBse + 1 : state.stats.totalBse,
        totalNews: !isExchange ? state.stats.totalNews + 1 : state.stats.totalNews,
        totalToday: isToday ? state.stats.totalToday + 1 : state.stats.totalToday,
        lastUpdate: new Date().toLocaleTimeString(),
      };

      return {
        announcements: shouldAddToFeed
          ? [announcement, ...state.announcements]
          : state.announcements,
        totalCount: shouldAddToFeed ? state.totalCount + 1 : state.totalCount,
        stats: updatedStats,
        lastUpdated: new Date().toISOString(),
      };
    }),

  setSelectedAnnouncement: (selectedAnnouncement) => set({ selectedAnnouncement }),

  setFilters: (updatedFilters) =>
    set((state) => {
      const hasFilterChange = Object.keys(updatedFilters).some(
        (k) => k !== 'page' && updatedFilters[k as keyof DashboardFilters] !== state.filters[k as keyof DashboardFilters]
      );
      const newFilters = {
        ...state.filters,
        ...updatedFilters,
        page: hasFilterChange ? 1 : (updatedFilters.page ?? state.filters.page),
      };
      return { filters: newFilters };
    }),

  resetFilters: () => set({ filters: initialFilters }),

  setStats: (updatedStats) =>
    set((state) => ({
      stats: { ...state.stats, ...updatedStats },
    })),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setLastUpdated: (lastUpdated) => set({ lastUpdated }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));
