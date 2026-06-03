import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useRealtimeAnnouncements } from '../hooks/useRealtimeAnnouncements';
import type { Announcement } from '../types/announcement';

// Component imports
import StatsCards from '../components/StatsCards';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementDrawer from '../components/AnnouncementDrawer';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

import {
  RefreshCw, X, ChevronUp, Search,
  Download, LayoutGrid, List as ListIcon,
  ArrowUpDown, Zap
} from 'lucide-react';

interface ToastNotification {
  id: string;
  announcement: Announcement;
}

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
  } = useDashboardStore();

  const { refresh, fetchNextPage } = useAnnouncements();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState('All');

  const addToast = (announcement: Announcement) => {
    const toastId = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id: toastId, announcement }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 6000);
  };

  useRealtimeAnnouncements(addToast);

  // Virtualization (only used in list mode)
  const CARD_HEIGHT = 72;
  const ITEM_HEIGHT = CARD_HEIGHT;
  const OVERSCAN = 10;

  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [parentHeight, setParentHeight] = useState(800);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setParentHeight(entry.contentRect.height);
      }
    });
    observer.observe(parent);
    setParentHeight(parent.clientHeight);
    return () => observer.disconnect();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
    setShowScrollToTop(target.scrollTop > 800);
    const threshold = 400;
    const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (remainingScroll < threshold && !loading) {
      fetchNextPage();
    }
  };

  const handleScrollToTop = () => {
    parentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { offset, totalHeight, visibleAnnouncements } = useMemo(() => {
    const count = announcements.length;
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const end = Math.min(count - 1, Math.ceil((scrollTop + parentHeight) / ITEM_HEIGHT) + OVERSCAN);
    return {
      offset: start * ITEM_HEIGHT,
      totalHeight: count * ITEM_HEIGHT,
      visibleAnnouncements: announcements.slice(start, end + 1),
    };
  }, [announcements, scrollTop, parentHeight, ITEM_HEIGHT]);

  const handleToastClick = (announcement: Announcement, toastId: string) => {
    setSelectedAnnouncement(announcement);
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleSourceFilter = (source: string) => {
    setActiveTab(source);
    setFilters({ source: source as 'All' | 'NSE' | 'BSE' });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-900 overflow-hidden">

      {/* Main Content Area — full width, no sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">BSE / NSE Announcements</h1>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {announcements.length.toLocaleString()} records
            </span>
            {/* Connection status dot */}
            <div title={`Realtime: ${connectionStatus}`} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
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

            {/* Statistics Widgets */}
            <StatsCards onRefresh={refresh} isRefreshing={loading} />

            {/* Toolbar Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Source Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                {['All', 'NSE', 'BSE'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleSourceFilter(tab)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      activeTab === tab
                        ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
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

            {/* Data Container */}
            <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm flex flex-col min-h-[420px] relative overflow-hidden">

              {/* Table Header — only in list mode */}
              {viewMode === 'list' && (
                <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider items-center select-none">
                  <div className="col-span-6 flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                    Headline <ArrowUpDown size={10} />
                  </div>
                  <div className="col-span-2">Exchange</div>
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
              ) : viewMode === 'list' ? (
                /* List View — virtualized */
                <div
                  ref={parentRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar"
                >
                  <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
                    <div
                      style={{
                        transform: `translateY(${offset}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                      }}
                    >
                      {visibleAnnouncements.map((ann) => (
                        <div key={ann.id}>
                          <AnnouncementCard
                            announcement={ann}
                            onClick={setSelectedAnnouncement}
                            viewMode="list"
                          />
                        </div>
                      ))}

                      {loading && announcements.length > 0 && (
                        <div className="py-5 flex justify-center items-center gap-2.5">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" />
                          <span className="text-sm text-gray-400 font-medium">
                            Loading more...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Grid View — scrollable grid */
                <div
                  ref={parentRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar p-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {announcements.map((ann) => (
                      <AnnouncementCard
                        key={ann.id}
                        announcement={ann}
                        onClick={setSelectedAnnouncement}
                        viewMode="grid"
                      />
                    ))}
                  </div>

                  {loading && announcements.length > 0 && (
                    <div className="py-5 flex justify-center items-center gap-2.5">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" />
                      <span className="text-sm text-gray-400 font-medium">
                        Loading more...
                      </span>
                    </div>
                  )}
                </div>
              )}

              {loading && announcements.length === 0 && (
                <div className="flex-1 p-5 overflow-y-hidden">
                  <LoadingSkeleton />
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

      {showScrollToTop && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 p-2.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 z-30"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
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
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  toast.announcement.source === 'NSE'
                    ? 'bg-violet-100 text-violet-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {toast.announcement.source}
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
        ))}
      </div>
    </div>
  );
};

export default Dashboard;