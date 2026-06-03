import React, { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useRealtimeAnnouncements } from '../hooks/useRealtimeAnnouncements';
import type { Announcement } from '../types/announcement';
import { SOURCE_FILTERS, SOURCE_COLORS, getDisplaySource } from '../types/announcement';
import type { SourceFilter } from '../types/announcement';

// Component imports
import StatsCards from '../components/StatsCards';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementDrawer from '../components/AnnouncementDrawer';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

import {
  RefreshCw, X, Search,
  Download, LayoutGrid, List as ListIcon,
  ArrowUpDown, Zap, Filter, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';

interface ToastNotification {
  id: string;
  announcement: Announcement;
}

const COMMON_TAGS = [
  'Result',
  'Dividend',
  'Board Meeting',
  'Acquisition',
  'Expansion',
  'Regulatory',
  'Credit Rating',
  'Pledge',
  'Trading Window',
  'Appointment',
  'Press Release',
  'Allotment',
  'Bonus/Split',
  'Auditors',
];

export const Dashboard: React.FC = () => {
  const {
    announcements,
    loading,
    error,
    selectedAnnouncement,
    setSelectedAnnouncement,
    filters,
    setFilters,
    connectionStatus,
    totalCount,
    hasMore,
  } = useDashboardStore();

  const { refresh } = useAnnouncements();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const addToast = (announcement: Announcement) => {
    const toastId = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id: toastId, announcement }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 6000);
  };

  useRealtimeAnnouncements(addToast);

  const handleToastClick = (announcement: Announcement, toastId: string) => {
    setSelectedAnnouncement(announcement);
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleSourceFilter = (source: SourceFilter) => {
    setFilters({ source });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleTagToggle = (tag: string) => {
    const isSelected = filters.selectedTags.includes(tag);
    const newTags = isSelected
      ? filters.selectedTags.filter((t) => t !== tag)
      : [...filters.selectedTags, tag];
    setFilters({ selectedTags: newTags });
  };

  const handleDateRangeChange = (dateRange: 'All' | 'Today' | '7d' | '30d' | 'custom') => {
    setFilters({ dateRange });
  };

  const handleCustomDateChange = (type: 'startDate' | 'endDate', value: string) => {
    setFilters({ [type]: value || null });
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: 'All',
      startDate: null,
      endDate: null,
      selectedTags: [],
    });
  };

  const hasActiveFilters =
    filters.dateRange !== 'All' ||
    filters.startDate !== null ||
    filters.endDate !== null ||
    filters.selectedTags.length > 0;

  // Pagination helper calculations
  const totalPages = Math.max(1, Math.ceil(totalCount / 100));

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters({ page: newPage });
      // Scroll announcements container to top
      const scrollContainer = document.getElementById('announcements-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const current = filters.page;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (current >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Pill color for source filter buttons
  const getPillStyle = (source: SourceFilter, isActive: boolean) => {
    if (source === 'All') {
      return isActive
        ? 'bg-gray-800 text-white shadow-sm'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100';
    }
    const colors = SOURCE_COLORS[source];
    if (isActive) {
      return `bg-gradient-to-r ${colors.accent} text-white shadow-sm`;
    }
    return `${colors.badge} hover:shadow-sm`;
  };

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-900 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Corporate News Dashboard</h1>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {totalCount.toLocaleString()} records
            </span>
            <div title={`Realtime: ${connectionStatus}`} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
                  connectionStatus === 'connecting' ? 'bg-amber-400 animate-pulse' :
                    'bg-red-400'
                }`} />
              <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={filters.search}
                onChange={handleSearch}
                className="bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-gray-700 placeholder-gray-400 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto bg-[#F7F8FA]">
          <div className="p-6 max-w-[1440px] mx-auto flex flex-col gap-5">

            {/* Stats */}
            <StatsCards onRefresh={refresh} isRefreshing={loading} />

            {/* Source Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {SOURCE_FILTERS.map((source) => (
                <button
                  key={source}
                  onClick={() => handleSourceFilter(source)}
                  className={`px-3.5 py-1.5 text-[13px] font-medium rounded-full border border-transparent whitespace-nowrap transition-all duration-200 ${getPillStyle(source, filters.source === source)}`}
                >
                  {source}
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{filters.source}</span> announcements — Page {filters.page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border rounded-lg transition-all shadow-sm ${showFilters || hasActiveFilters
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-650'
                        : 'text-gray-600 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                      }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                    {hasActiveFilters && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </button>
                  <button
                    onClick={refresh}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                  <div className="w-px h-6 bg-gray-200 mx-1" />
                  <div className="flex items-center bg-white p-0.5 rounded-lg border border-gray-200 shadow-sm">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                      title="List view"
                    >
                      <ListIcon size={15} />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Grid view"
                    >
                      <LayoutGrid size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Filters Card */}
              {showFilters && (
                <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm flex flex-col md:flex-row gap-6 animate-fadeIn">
                  {/* Date range filters */}
                  <div className="flex-1 min-w-[240px] space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date Period</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: 'All', label: 'All Time' },
                        { key: 'Today', label: 'Today' },
                        { key: '7d', label: '7 Days' },
                        { key: '30d', label: '30 Days' },
                        { key: 'custom', label: 'Custom Range' }
                      ].map((d) => (
                        <button
                          key={d.key}
                          onClick={() => handleDateRangeChange(d.key as any)}
                          className={`text-xs px-2.5 py-1.5 rounded-md border font-semibold transition-all ${filters.dateRange === d.key
                              ? 'bg-indigo-50 text-indigo-650 border-indigo-200 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    {filters.dateRange === 'custom' && (
                      <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                        <div className="relative flex items-center">
                          <Calendar size={12} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                          <input
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded pl-8 pr-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-indigo-400 w-32"
                          />
                        </div>
                        <span className="text-xs text-gray-450">—</span>
                        <div className="relative flex items-center">
                          <Calendar size={12} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                          <input
                            type="date"
                            value={filters.endDate || ''}
                            onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded pl-8 pr-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-indigo-400 w-32"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vertical separator */}
                  <div className="hidden md:block w-px bg-gray-100 self-stretch" />

                  {/* Tag filters */}
                  <div className="flex-[2] space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Tags</h4>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="text-xs text-rose-500 hover:text-rose-600 font-semibold transition-colors"
                        >
                          Clear Extra Filters
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                      {COMMON_TAGS.map((tag) => {
                        const isSelected = filters.selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition-all ${isSelected
                                ? 'bg-indigo-500 text-white border-transparent shadow-sm'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Data Container */}
            <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm flex flex-col min-h-[420px] relative overflow-hidden">

              {/* Table Header — list mode only */}
              {viewMode === 'list' && announcements.length > 0 && (
                <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider items-center select-none">
                  <div className="col-span-6 flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                    Headline <ArrowUpDown size={10} />
                  </div>
                  <div className="col-span-2">Source</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2 text-right pr-2">Action</div>
                </div>
              )}

              {error ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <EmptyState type="error" message={error} onAction={refresh} />
                </div>
              ) : announcements.length === 0 && !loading ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <EmptyState type="no-results" />
                </div>
              ) : loading ? (
                <div className="flex-1 p-5 overflow-y-hidden">
                  <LoadingSkeleton />
                </div>
              ) : viewMode === 'list' ? (
                <div
                  id="announcements-scroll-container"
                  className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar divide-y divide-gray-100/60"
                >
                  {announcements.map((ann) => (
                    <AnnouncementCard
                      key={ann.id}
                      announcement={ann}
                      onClick={setSelectedAnnouncement}
                      viewMode="list"
                    />
                  ))}
                </div>
              ) : (
                <div
                  id="announcements-scroll-container"
                  className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar p-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {announcements.map((ann) => (
                      <AnnouncementCard
                        key={ann.id}
                        announcement={ann}
                        onClick={setSelectedAnnouncement}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination Row */}
              {totalCount > 100 && !loading && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-150 px-6 py-4 bg-gray-50/50 gap-3">
                  <div className="text-[13px] text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{((filters.page - 1) * 100) + 1}</span> to{' '}
                    <span className="font-semibold text-gray-700">
                      {Math.min(filters.page * 100, totalCount)}
                    </span>{' '}
                    of <span className="font-semibold text-gray-700">{totalCount.toLocaleString()}</span> entries
                  </div>
                  <div className="flex items-center gap-1.5 select-none">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {getPageNumbers().map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => typeof p === 'number' && handlePageChange(p)}
                        disabled={p === '...'}
                        className={`min-w-[32px] h-8 flex items-center justify-center text-xs font-semibold rounded-lg transition-all border ${p === filters.page
                            ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                            : p === '...'
                              ? 'text-gray-400 border-transparent hover:bg-transparent'
                              : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
                          }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === totalPages || !hasMore}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AnnouncementDrawer
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const displaySrc = getDisplaySource(toast.announcement.source);
          const colors = SOURCE_COLORS[displaySrc];
          return (
            <div
              key={toast.id}
              onClick={() => handleToastClick(toast.announcement, toast.id)}
              className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-xl shadow-black/5 pointer-events-auto cursor-pointer hover:border-indigo-300 hover:shadow-2xl transition-all duration-200 flex gap-3 animate-slideUp"
            >
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-500 h-max flex-shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colors?.badge || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {displaySrc}
                  </span>
                  <span className="text-[11px] text-indigo-500 font-semibold">New</span>
                </div>
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {toast.announcement.headline}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;