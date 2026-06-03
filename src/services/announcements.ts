import { supabase } from '../lib/supabase';
import type { Announcement, DashboardFilters, DashboardStats, SourceFilter } from '../types/announcement';
import { SOURCE_DB_MAP } from '../types/announcement';

export interface FetchAnnouncementsParams extends DashboardFilters {
  limit: number;
  offset: number;
}

/**
 * Resolves a SourceFilter into an array of raw DB source values for the query.
 * Returns null when no filtering is needed (i.e. "All").
 */
function resolveSourceValues(filter: SourceFilter): string[] | null {
  if (filter === 'All') return null; // no filter needed
  const dbValues = SOURCE_DB_MAP[filter];
  return dbValues || [filter]; // fallback to using the filter value directly
}

export const announcementsService = {
  /**
   * Fetches announcements from Supabase with server-side filtering, sorting, and pagination
   */
  async fetchAnnouncements(params: FetchAnnouncementsParams): Promise<{
    data: Announcement[];
    hasMore: boolean;
    totalCount: number;
  }> {
    try {
      let query = supabase
        .from('corporate_announcements')
        .select('*', { count: 'exact' });

      // 1. Source filter
      const sourceValues = resolveSourceValues(params.source);
      if (sourceValues) {
        if (sourceValues.length === 1) {
          query = query.eq('source', sourceValues[0]);
        } else {
          query = query.in('source', sourceValues);
        }
      }

      // 2. Date filtering
      const now = new Date();
      if (params.dateRange === 'Today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query = query.gte('published_at', startOfDay.toISOString());
      } else if (params.dateRange === '7d') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('published_at', sevenDaysAgo.toISOString());
      } else if (params.dateRange === '30d') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte('published_at', thirtyDaysAgo.toISOString());
      } else if (params.dateRange === 'custom') {
        if (params.startDate) {
          query = query.gte('published_at', new Date(params.startDate).toISOString());
        }
        if (params.endDate) {
          const end = new Date(params.endDate);
          end.setHours(23, 59, 59, 999);
          query = query.lte('published_at', end.toISOString());
        }
      }
      // If params.dateRange === 'All', we don't apply any published_at constraint

      // 3. Search filter
      if (params.search && params.search.trim() !== '') {
        const searchTerm = params.search.trim();
        query = query.or(`headline.ilike.%${searchTerm}%,article_cleaned.ilike.%${searchTerm}%`);
      }

      // 4. Tags filter
      if (params.selectedTags && params.selectedTags.length > 0) {
        try {
          query = query.contains('tags', params.selectedTags);
        } catch (e) {
          console.warn('Tags contains query failed, falling back to text-based matching', e);
          params.selectedTags.forEach((tag) => {
            query = query.ilike('tags', `%${tag}%`);
          });
        }
      }

      // 5. Pagination and sorting
      query = query
        .order('published_at', { ascending: false })
        .range(params.offset, params.offset + params.limit - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      const announcements = (data || []) as Announcement[];
      const totalCount = count || 0;
      const hasMore = params.offset + announcements.length < totalCount;

      return { data: announcements, hasMore, totalCount };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  /**
   * Fetches database counters for NSE, BSE, News, and Today's totals
   */
  async fetchStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      // Query total NSE
      const nsePromise = supabase
        .from('corporate_announcements')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'NSE');

      // Query total BSE
      const bsePromise = supabase
        .from('corporate_announcements')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'BSE');

      // Query total news (everything that is NOT NSE or BSE)
      const newsPromise = supabase
        .from('corporate_announcements')
        .select('*', { count: 'exact', head: true })
        .not('source', 'in', '("NSE","BSE")');

      // Query total today (all sources)
      const todayPromise = supabase
        .from('corporate_announcements')
        .select('*', { count: 'exact', head: true })
        .gte('published_at', startOfDay);

      const [nseRes, bseRes, newsRes, todayRes] = await Promise.all([
        nsePromise,
        bsePromise,
        newsPromise,
        todayPromise,
      ]);

      if (nseRes.error) throw nseRes.error;
      if (bseRes.error) throw bseRes.error;
      if (newsRes.error) throw newsRes.error;
      if (todayRes.error) throw todayRes.error;

      return {
        totalNse: nseRes.count || 0,
        totalBse: bseRes.count || 0,
        totalNews: newsRes.count || 0,
        totalToday: todayRes.count || 0,
        lastUpdate: new Date().toLocaleTimeString(),
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalNse: 0,
        totalBse: 0,
        totalNews: 0,
        totalToday: 0,
        lastUpdate: new Date().toLocaleTimeString() + ' (Error loading counts)',
      };
    }
  },
};
