import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { announcementsService } from '../services/announcements';

const LIMIT = 100; // 100 records per page

export const useAnnouncements = () => {
  const {
    filters,
    setAnnouncements,
    setStats,
    setLoading,
    setError,
    loading,
  } = useDashboardStore();

  /**
   * Fetches statistics from the database
   */
  const loadStats = useCallback(async () => {
    try {
      const stats = await announcementsService.fetchStats();
      setStats(stats);
    } catch (err) {
      console.error('Failed to load counters:', err);
    }
  }, [setStats]);

  /**
   * Fetches the specific page of announcements
   */
  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    const offset = (filters.page - 1) * LIMIT;

    try {
      const statsPromise = loadStats();
      const dataPromise = announcementsService.fetchAnnouncements({
        ...filters,
        limit: LIMIT,
        offset,
      });

      const [, result] = await Promise.all([statsPromise, dataPromise]);
      setAnnouncements(result.data, result.hasMore, result.totalCount);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching announcements.');
    } finally {
      setLoading(false);
    }
  }, [filters, setAnnouncements, setLoading, setError, loadStats]);

  // Load feed automatically when filters (including page) change
  useEffect(() => {
    loadFeed();
  }, [
    filters.source,
    filters.search,
    filters.dateRange,
    filters.startDate,
    filters.endDate,
    filters.selectedTags,
    filters.page,
    loadFeed,
  ]);

  return {
    refresh: loadFeed,
    loadStats,
  };
};
