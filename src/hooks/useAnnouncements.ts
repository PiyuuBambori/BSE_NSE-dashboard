import { useEffect, useCallback, useRef } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { announcementsService } from '../services/announcements';

const LIMIT = 30; // Load 30 announcements per chunk

export const useAnnouncements = () => {
  const {
    filters,
    setAnnouncements,
    appendAnnouncements,
    setStats,
    setLoading,
    setError,
    loading,
  } = useDashboardStore();

  // Ref to track offset across calls to avoid race conditions
  const offsetRef = useRef(0);
  const filtersRef = useRef(filters);

  // Keep filters ref in sync
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

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
   * Refreshes the feed completely (resets offset to 0 and queries new data)
   */
  const refreshFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    offsetRef.current = 0;

    try {
      const statsPromise = loadStats();
      const dataPromise = announcementsService.fetchAnnouncements({
        ...filtersRef.current,
        limit: LIMIT,
        offset: 0,
      });

      const [, result] = await Promise.all([statsPromise, dataPromise]);
      setAnnouncements(result.data, result.hasMore);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching announcements.');
    } finally {
      setLoading(false);
    }
  }, [setAnnouncements, setLoading, setError, loadStats]);

  /**
   * Load the next page of announcements
   */
  const fetchNextPage = useCallback(async () => {
    const { announcements, hasMore } = useDashboardStore.getState();
    if (loading || !hasMore) return;

    setLoading(true);
    const currentOffset = announcements.length;
    offsetRef.current = currentOffset;

    try {
      const result = await announcementsService.fetchAnnouncements({
        ...filtersRef.current,
        limit: LIMIT,
        offset: currentOffset,
      });

      appendAnnouncements(result.data, result.hasMore);
    } catch (err: any) {
      setError(err.message || 'Failed to load more announcements.');
    } finally {
      setLoading(false);
    }
  }, [loading, appendAnnouncements, setLoading, setError]);

  // Load feed automatically when filters change
  useEffect(() => {
    refreshFeed();
  }, [
    filters.source,
    filters.search,
    filters.dateRange,
    filters.startDate,
    filters.endDate,
    filters.selectedTags,
    refreshFeed,
  ]);

  return {
    refresh: refreshFeed,
    fetchNextPage,
    loadStats,
  };
};
