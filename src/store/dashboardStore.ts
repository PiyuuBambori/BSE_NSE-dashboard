import { create } from 'zustand';
import type { Announcement, DashboardFilters, DashboardStats } from '../types/announcement';

interface DashboardState {
  announcements: Announcement[];
  hasMore: boolean;
  selectedAnnouncement: Announcement | null;
  filters: DashboardFilters;
  stats: DashboardStats;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastUpdated: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  setAnnouncements: (announcements: Announcement[], hasMore: boolean) => void;
  appendAnnouncements: (announcements: Announcement[], hasMore: boolean) => void;
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
  dateRange: '7d', // Default to 7 days to keep initial load fast but customizable
  startDate: null,
  endDate: null,
  selectedTags: [],
};

const initialStats: DashboardStats = {
  totalNse: 0,
  totalBse: 0,
  totalToday: 0,
  lastUpdate: null,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  announcements: [],
  hasMore: true,
  selectedAnnouncement: null,
  filters: initialFilters,
  stats: initialStats,
  connectionStatus: 'connecting',
  lastUpdated: null,
  loading: false,
  error: null,

  setAnnouncements: (announcements, hasMore) =>
    set({ announcements, hasMore, loading: false }),

  appendAnnouncements: (newAnnouncements, hasMore) =>
    set((state) => {
      // Filter duplicates by url or id just in case
      const existingIds = new Set(state.announcements.map((a) => a.id));
      const filteredNew = newAnnouncements.filter((a) => !existingIds.has(a.id));
      return {
        announcements: [...state.announcements, ...filteredNew],
        hasMore,
      };
    }),

  addRealtimeAnnouncement: (announcement) =>
    set((state) => {
      // Check if it already exists to prevent duplication
      if (state.announcements.some((a) => a.id === announcement.id)) {
        return {};
      }

      // Check if it matches current active filters
      const matchesSource =
        state.filters.source === 'All' || state.filters.source === announcement.source;

      const matchesSearch =
        !state.filters.search ||
        announcement.headline.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        (typeof announcement.tags === 'string' &&
          announcement.tags.toLowerCase().includes(state.filters.search.toLowerCase())) ||
        (Array.isArray(announcement.tags) &&
          announcement.tags.some((tag) =>
            tag.toLowerCase().includes(state.filters.search.toLowerCase())
          ));

      // Simple tag filter check
      const matchesTags =
        state.filters.selectedTags.length === 0 ||
        (Array.isArray(announcement.tags) &&
          state.filters.selectedTags.every((t) => announcement.tags?.includes(t))) ||
        (typeof announcement.tags === 'string' &&
          state.filters.selectedTags.every((t) =>
            (announcement.tags as string).split(',').map((x) => x.trim()).includes(t)
          ));

      // Calculate if it's within the selected date range
      let matchesDate = true;
      const pubDate = new Date(announcement.published_at);
      const now = new Date();

      if (state.filters.dateRange === 'Today') {
        const todayStr = now.toDateString();
        matchesDate = pubDate.toDateString() === todayStr;
      } else if (state.filters.dateRange === '7d') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = pubDate >= sevenDaysAgo;
      } else if (state.filters.dateRange === '30d') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = pubDate >= thirtyDaysAgo;
      } else if (state.filters.dateRange === 'custom') {
        if (state.filters.startDate) {
          matchesDate = matchesDate && pubDate >= new Date(state.filters.startDate);
        }
        if (state.filters.endDate) {
          matchesDate = matchesDate && pubDate <= new Date(state.filters.endDate);
        }
      }

      const shouldAddToFeed = matchesSource && matchesSearch && matchesTags && matchesDate;

      // Update total counts
      const isToday = pubDate.toDateString() === now.toDateString();
      const updatedStats = {
        ...state.stats,
        totalNse: announcement.source === 'NSE' ? state.stats.totalNse + 1 : state.stats.totalNse,
        totalBse: announcement.source === 'BSE' ? state.stats.totalBse + 1 : state.stats.totalBse,
        totalToday: isToday ? state.stats.totalToday + 1 : state.stats.totalToday,
        lastUpdate: new Date().toLocaleTimeString(),
      };

      return {
        announcements: shouldAddToFeed
          ? [announcement, ...state.announcements]
          : state.announcements,
        stats: updatedStats,
        lastUpdated: new Date().toISOString(),
      };
    }),

  setSelectedAnnouncement: (selectedAnnouncement) => set({ selectedAnnouncement }),

  setFilters: (updatedFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...updatedFilters },
    })),

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
