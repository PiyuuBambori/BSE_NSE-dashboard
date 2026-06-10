import { supabase } from '../lib/supabase';
import type { Announcement, DashboardFilters, DashboardStats, SourceFilter } from '../types/announcement';
import { SOURCE_DB_MAP } from '../types/announcement';

export interface FetchAnnouncementsParams extends DashboardFilters {
  limit: number;
  offset: number;
  companyNames?: string[] | null;
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

/**
 * Helper to apply shared filters to a query for a specific table
 */
function applyFilters(query: any, tableName: 'bse_nse' | 'news_channels', params: FetchAnnouncementsParams) {
  // 1. Source filter
  const sourceValues = resolveSourceValues(params.source);
  if (sourceValues) {
    const validSources = tableName === 'bse_nse'
      ? ['NSE', 'BSE']
      : ['CNBC TV18', 'Livemint', 'NDTV Profit', 'Financial Express', 'Business Today', 'Business Standard', 'Economic Times', 'Economic Times Mobile', 'Hindu BusinessLine'];
    const tableSourceValues = sourceValues.filter(v => validSources.includes(v));
    
    if (tableSourceValues.length === 0) {
      query = query.eq('source', 'NON_EXISTENT_SOURCE_PLACEHOLDER');
    } else if (tableSourceValues.length === 1) {
      query = query.eq('source', tableSourceValues[0]);
    } else {
      query = query.in('source', tableSourceValues);
    }
  }

  // Note: Company names filtering for market cap is now handled client-side
  // in StreamColumn.tsx using normalized name matching against company_financials.json

  // 2. Date filtering
  const now = new Date();
  if (params.dateRange === 'Today') {
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
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
      end.setUTCHours(23, 59, 59, 999);
      query = query.lte('published_at', end.toISOString());
    }
  }

  // 3. Search filter
  if (params.search && params.search.trim() !== '') {
    const searchTerms = params.search.trim().split(/\s+/).filter(Boolean);
    if (searchTerms.length > 0) {
      const clauses: string[] = [];
      searchTerms.forEach(term => {
        const cleanTerm = term.replace(/[,()]/g, '').trim();
        if (cleanTerm) {
          if (tableName === 'bse_nse') {
            clauses.push(`headline.ilike.%${cleanTerm}%,article_cleaned.ilike.%${cleanTerm}%,company_name.ilike.%${cleanTerm}%`);
          } else {
            clauses.push(`headline.ilike.%${cleanTerm}%,article.ilike.%${cleanTerm}%`);
          }
        }
      });
      if (clauses.length > 0) {
        query = query.or(clauses.join(','));
      }
    }
  }

  return query;
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
      const isExchange = params.source === 'NSE' || params.source === 'BSE';
      const isNews = params.source !== 'All' && !isExchange;

      if (isExchange) {
        // Query only bse_nse table
        let countQuery = supabase.from('bse_nse').select('*', { count: 'exact', head: true });
        countQuery = applyFilters(countQuery, 'bse_nse', params);

        let dataQuery = supabase.from('bse_nse').select('*');
        dataQuery = applyFilters(dataQuery, 'bse_nse', params)
          .order('published_at', { ascending: false })
          .range(params.offset, params.offset + params.limit - 1);

        const [countRes, dataRes] = await Promise.all([countQuery, dataQuery]);
        if (countRes.error) throw countRes.error;
        if (dataRes.error) throw dataRes.error;

        const announcements = (dataRes.data || []) as Announcement[];
        const totalCount = countRes.count || 0;
        const hasMore = params.offset + announcements.length < totalCount;

        return { data: announcements, hasMore, totalCount };
      }

      if (isNews) {
        // Query only news_channels table
        let countQuery = supabase.from('news_channels').select('*', { count: 'exact', head: true });
        countQuery = applyFilters(countQuery, 'news_channels', params);

        let dataQuery = supabase.from('news_channels').select('*');
        dataQuery = applyFilters(dataQuery, 'news_channels', params)
          .order('published_at', { ascending: false })
          .range(params.offset, params.offset + params.limit - 1);

        const [countRes, dataRes] = await Promise.all([countQuery, dataQuery]);
        if (countRes.error) throw countRes.error;
        if (dataRes.error) throw dataRes.error;

        const announcements = (dataRes.data || []).map(row => ({
          id: row.id,
          headline: row.headline,
          article_cleaned: row.article || '',
          url: row.url,
          tags: null,
          published_at: row.published_at,
          source: row.source
        })) as Announcement[];
        const totalCount = countRes.count || 0;
        const hasMore = params.offset + announcements.length < totalCount;

        return { data: announcements, hasMore, totalCount };
      }

      // If source filter is 'All'
      let bseNseCountQuery = supabase.from('bse_nse').select('*', { count: 'exact', head: true });
      bseNseCountQuery = applyFilters(bseNseCountQuery, 'bse_nse', params);

      let newsCountQuery = supabase.from('news_channels').select('*', { count: 'exact', head: true });
      newsCountQuery = applyFilters(newsCountQuery, 'news_channels', params);

      const [bseNseCountRes, newsCountRes] = await Promise.all([
        bseNseCountQuery,
        newsCountQuery
      ]);

      if (bseNseCountRes.error) throw bseNseCountRes.error;
      if (newsCountRes.error) throw newsCountRes.error;

      const totalCount = (bseNseCountRes.count || 0) + (newsCountRes.count || 0);

      // Fetch offset + limit from both tables, merge, sort, and slice
      const fetchLimit = params.offset + params.limit;

      let bseNseDataQuery = supabase.from('bse_nse').select('*');
      bseNseDataQuery = applyFilters(bseNseDataQuery, 'bse_nse', params)
        .order('published_at', { ascending: false })
        .range(0, fetchLimit - 1);

      let newsDataQuery = supabase.from('news_channels').select('*');
      newsDataQuery = applyFilters(newsDataQuery, 'news_channels', params)
        .order('published_at', { ascending: false })
        .range(0, fetchLimit - 1);

      const [bseNseDataRes, newsDataRes] = await Promise.all([
        bseNseDataQuery,
        newsDataQuery
      ]);

      if (bseNseDataRes.error) throw bseNseDataRes.error;
      if (newsDataRes.error) throw newsDataRes.error;

      const bseNseItems = (bseNseDataRes.data || []) as Announcement[];
      const newsItems = (newsDataRes.data || []).map(row => ({
        id: row.id,
        headline: row.headline,
        article_cleaned: row.article || '',
        url: row.url,
        tags: null,
        published_at: row.published_at,
        source: row.source
      })) as Announcement[];

      const combined = [...bseNseItems, ...newsItems]
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(params.offset, params.offset + params.limit);

      const hasMore = params.offset + combined.length < totalCount;

      return { data: combined, hasMore, totalCount };
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
      const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();

      // Query total NSE
      const nseTotalPromise = supabase
        .from('bse_nse')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'NSE');

      // Query total BSE
      const bseTotalPromise = supabase
        .from('bse_nse')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'BSE');

      // Query total news (all of news_channels)
      const newsTotalPromise = supabase
        .from('news_channels')
        .select('*', { count: 'exact', head: true });

      // Query daily NSE filings
      const nseTodayPromise = supabase
        .from('bse_nse')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'NSE')
        .gte('published_at', startOfDay);

      // Query daily BSE filings
      const bseTodayPromise = supabase
        .from('bse_nse')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'BSE')
        .gte('published_at', startOfDay);

      // Query daily news
      const newsTodayPromise = supabase
        .from('news_channels')
        .select('*', { count: 'exact', head: true })
        .gte('published_at', startOfDay);

      const [nseTotalRes, bseTotalRes, newsTotalRes, nseTodayRes, bseTodayRes, newsTodayRes] = await Promise.all([
        nseTotalPromise,
        bseTotalPromise,
        newsTotalPromise,
        nseTodayPromise,
        bseTodayPromise,
        newsTodayPromise,
      ]);

      if (nseTotalRes.error) throw nseTotalRes.error;
      if (bseTotalRes.error) throw bseTotalRes.error;
      if (newsTotalRes.error) throw newsTotalRes.error;
      if (nseTodayRes.error) throw nseTodayRes.error;
      if (bseTodayRes.error) throw bseTodayRes.error;
      if (newsTodayRes.error) throw newsTodayRes.error;

      return {
        nseToday: nseTodayRes.count || 0,
        bseToday: bseTodayRes.count || 0,
        newsToday: newsTodayRes.count || 0,
        totalNse: nseTotalRes.count || 0,
        totalBse: bseTotalRes.count || 0,
        totalNews: newsTotalRes.count || 0,
        lastUpdate: new Date().toLocaleTimeString(),
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        nseToday: 0,
        bseToday: 0,
        newsToday: 0,
        totalNse: 0,
        totalBse: 0,
        totalNews: 0,
        lastUpdate: new Date().toLocaleTimeString() + ' (Error loading counts)',
      };
    }
  },
};
