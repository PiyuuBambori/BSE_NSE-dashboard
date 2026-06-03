import { supabase } from '../lib/supabase';
import type { Announcement, DashboardFilters, DashboardStats } from '../types/announcement';

export interface FetchAnnouncementsParams extends DashboardFilters {
  limit: number;
  offset: number;
}

export const announcementsService = {
  /**
   * Fetches announcements from Supabase with server-side filtering, sorting, and pagination
   */
  async fetchAnnouncements(params: FetchAnnouncementsParams): Promise<{
    data: Announcement[];
    hasMore: boolean;
  }> {
    try {
      let query = supabase
        .from('corporate_announcements')
        .select('*', { count: 'exact' });

      // 1. Source filter: source IN ('NSE', 'BSE')
      if (params.source === 'All') {
        query = query.in('source', ['NSE', 'BSE']);
      } else {
        query = query.eq('source', params.source);
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

      // 3. Search filter (Headline matching)
      if (params.search && params.search.trim() !== '') {
        const searchTerm = params.search.trim();
        // Search inside headline or tags
        // To be safe against tag type (text[] vs text) we check for ilike in headline or tags
        query = query.or(`headline.ilike.%${searchTerm}%,article_cleaned.ilike.%${searchTerm}%`);
      }

      // 4. Tags Multi-select filtering
      if (params.selectedTags && params.selectedTags.length > 0) {
        // Try filtering tags. We handle it as a containment filter
        // If your tags column in Supabase is text[], containments works via .contains()
        // If it fails because of database structure, we'll log it.
        try {
          query = query.contains('tags', params.selectedTags);
        } catch (e) {
          console.warn('Tags contains query failed, falling back to text-based matching', e);
          // Fallback if tags is not an array
          params.selectedTags.forEach((tag) => {
            query = query.ilike('tags', `%${tag}%`);
          });
        }
      }

      // 5. Pagination and sorting (newest first)
      query = query
        .order('published_at', { ascending: false })
        .range(params.offset, params.offset + params.limit - 1);

      const { data, count, error } = await query;

      if (error) {
        throw error;
      }

      const announcements = (data || []) as Announcement[];
      const totalCount = count || 0;
      const hasMore = params.offset + announcements.length < totalCount;

      return {
        data: announcements,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  /**
   * Fetches database counters for NSE/BSE and Today's totals using optimized head queries
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

      // Query total today (NSE + BSE)
      const todayPromise = supabase
        .from('corporate_announcements')
        .select('*', { count: 'exact', head: true })
        .in('source', ['NSE', 'BSE'])
        .gte('published_at', startOfDay);

      const [nseRes, bseRes, todayRes] = await Promise.all([
        nsePromise,
        bsePromise,
        todayPromise,
      ]);

      if (nseRes.error) throw nseRes.error;
      if (bseRes.error) throw bseRes.error;
      if (todayRes.error) throw todayRes.error;

      return {
        totalNse: nseRes.count || 0,
        totalBse: bseRes.count || 0,
        totalToday: todayRes.count || 0,
        lastUpdate: new Date().toLocaleTimeString(),
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Return zeroed stats if table does not exist yet to prevent crash
      return {
        totalNse: 0,
        totalBse: 0,
        totalToday: 0,
        lastUpdate: new Date().toLocaleTimeString() + ' (Error loading counts)',
      };
    }
  },
};
