import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { useRealtimeAnnouncements } from '../hooks/useRealtimeAnnouncements';
import type { Announcement } from '../types/announcement';
import { SOURCE_COLORS, getDisplaySource } from '../types/announcement';

// Component imports
import AnnouncementDrawer from '../components/AnnouncementDrawer';
import StreamColumn from '../components/StreamColumn';
import TickerTape from '../components/TickerTape';


import {
  X, Search, Bell, Settings, Plus, Newspaper, Zap
} from 'lucide-react';

interface ToastNotification {
  id: string;
  announcement: Announcement;
}

interface StreamConfig {
  id: string;
  name: string;
  filter: {
    search: string;
    source: string;
    tags: string[];
  };
  dropdownType?: 'sectors' | 'marketcap';
  currentDropdownValue?: string;
}

const DEFAULT_STREAMS: StreamConfig[] = [
  {
    id: 'stream-sectors',
    name: 'Sectors',
    filter: {
      search: 'tech software IT digital computer TCS Infosys Wipro HCL TechM LTIMindtree semiconductor',
      source: 'All',
      tags: [],
    },
    dropdownType: 'sectors',
    currentDropdownValue: 'tech',
  },
  {
    id: 'stream-marketcap',
    name: 'Market Cap',
    filter: {
      search: '',
      source: 'All',
      tags: [],
    },
    dropdownType: 'marketcap',
    currentDropdownValue: 'gt_100k',
  },
  {
    id: 'stream-news',
    name: 'News',
    filter: {
      search: '',
      source: 'All',
      tags: [],
    },
  },
  {
    id: 'stream-broadcast',
    name: 'Broadcast',
    filter: {
      search: 'broadcast transcript investor call audio call press release conference call announcement',
      source: 'All',
      tags: [],
    },
  },
];

export const Dashboard: React.FC = () => {
  const {
    selectedAnnouncement,
    setSelectedAnnouncement,
    connectionStatus,
  } = useDashboardStore();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');

  const handleDropdownChange = (streamId: string, val: string) => {
    setStreams((prev) =>
      prev.map((s) => {
        if (s.id !== streamId) return s;
        
        let newSearch = '';
        if (s.dropdownType === 'sectors') {
          if (val === 'tech') newSearch = 'tech software IT digital computer TCS Infosys Wipro HCL TechM LTIMindtree semiconductor';
          if (val === 'finance') newSearch = 'finance banking bank credit interest rate loan debt HDFC ICICI SBI Axis Kotak';
          if (val === 'energy') newSearch = 'energy power oil gas petrol solar wind Reliance NTPC ONGC IOC Coal';
          if (val === 'healthcare') newSearch = 'healthcare pharma drug medicine hospital Sun Pharma Reddy Cipla Lupin Apollo';
          if (val === 'automobile') newSearch = 'automobile auto car bike vehicle Tata Motors Maruti Mahindra Eicher Bajaj';
        } else if (s.dropdownType === 'marketcap') {
          newSearch = '';
        }

        return {
          ...s,
          currentDropdownValue: val,
          filter: {
            ...s.filter,
            search: newSearch,
          },
        };
      })
    );
  };
  
  // Custom streams state with localStorage persistence
  // Using versioned key to force reset when stream config schema changes
  const STREAMS_STORAGE_KEY = 'financial_terminal_streams_v3';
  const [streams, setStreams] = useState<StreamConfig[]>(() => {
    const saved = localStorage.getItem(STREAMS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse streams from localStorage', e);
      }
    }
    // Clear any old versioned keys
    localStorage.removeItem('financial_terminal_streams');
    return DEFAULT_STREAMS;
  });

  useEffect(() => {
    localStorage.setItem(STREAMS_STORAGE_KEY, JSON.stringify(streams));
  }, [streams]);

  // Stream Creation Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamSearch, setNewStreamSearch] = useState('');
  const [newStreamSource, setNewStreamSource] = useState('All');

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

  // Stream Management Actions
  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamName.trim()) return;

    const newStream: StreamConfig = {
      id: `stream-custom-${Date.now()}`,
      name: newStreamName.trim(),
      filter: {
        search: newStreamSearch.trim(),
        source: newStreamSource,
        tags: [],
      },
    };

    setStreams((prev) => [...prev, newStream]);
    setShowAddModal(false);
    setNewStreamName('');
    setNewStreamSearch('');
    setNewStreamSource('All');
  };

  const handleDeleteStream = (id: string) => {
    setStreams((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRenameStream = (id: string, newName: string) => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  const handleMoveStream = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === streams.length - 1) return;

    const newIndex = direction === 'left' ? index - 1 : index + 1;
    setStreams((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = temp;
      return next;
    });
  };

  const handleResetStreams = () => {
    if (window.confirm('Reset streams back to default configuration?')) {
      setStreams(DEFAULT_STREAMS);
    }
  };

  // Dynamic placeholders for Add Stream (keeps maximum 6 columns in total)
  const emptyStreamSlotsCount = Math.max(0, 6 - streams.length);

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] font-sans text-gray-900 overflow-hidden select-none">
      
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-200 shrink-0 flex items-center justify-between px-6 z-10">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <h1 className="text-base font-extrabold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
            <span className="bg-indigo-600 text-white w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black tracking-normal">F</span>
            Financial Terminal
          </h1>
          <div title={`Realtime: ${connectionStatus}`} className="flex items-center gap-1.5 ml-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
              connectionStatus === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
            }`} />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider hidden sm:inline">
              {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Center: Search input capsule */}
        <div className="relative w-72 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search markets, news, or tickers..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-[#EFF2F5] border border-transparent rounded-full pl-9 pr-8 py-2 text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-400 text-gray-700 placeholder-gray-400 transition-all shadow-2xs"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-6">

          {/* Icons & Avatar */}
          <div className="flex items-center gap-3">
            <button className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>
            <button 
              onClick={handleResetStreams}
              className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset workspace layout"
            >
              <Settings size={15} />
            </button>
            <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden flex items-center justify-center font-bold text-xs text-indigo-700 cursor-pointer shadow-2xs">
              U
            </div>
          </div>
        </div>

      </header>

      {/* Main App Workspace */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        
        {/* Core Multi-Column News streams view */}
        <div className="flex-1 flex overflow-x-auto overflow-y-hidden bg-[#FAFBFD] custom-scrollbar">
          
          {/* Active configured streams list */}
          {streams.map((stream, idx) => (
            <StreamColumn
              key={stream.id}
              id={stream.id}
              name={stream.name}
              filter={stream.filter}
              globalSearch={globalSearch}
              onCardClick={setSelectedAnnouncement}
              onDelete={() => handleDeleteStream(stream.id)}
              onRename={(newName) => handleRenameStream(stream.id, newName)}
              onMoveLeft={idx > 0 ? () => handleMoveStream(idx, 'left') : undefined}
              onMoveRight={idx < streams.length - 1 ? () => handleMoveStream(idx, 'right') : undefined}
              dropdownType={stream.dropdownType}
              currentDropdownValue={stream.currentDropdownValue}
              onDropdownChange={(val) => handleDropdownChange(stream.id, val)}
            />
          ))}

          {/* Dotted 'Add Stream' placeholders */}
          {Array.from({ length: emptyStreamSlotsCount }).map((_, idx) => (
            <div
              key={`empty-slot-${idx}`}
              onClick={() => setShowAddModal(true)}
              className="w-80 flex-shrink-0 flex flex-col h-full bg-[#FAFBFD]/50 border-r border-gray-250/50 select-none cursor-pointer group text-left"
            >
              {/* Header */}
              <div className="px-4 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4.5 w-4.5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  <h3 className="text-sm font-bold text-gray-400 group-hover:text-slate-700 transition-colors">Add Stream</h3>
                </div>
                <Plus size={14} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </div>
              {/* Body */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-gray-300/80 rounded-2xl m-4.5 bg-white/40 hover:bg-white hover:border-indigo-400 transition-all duration-200">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-indigo-400 group-hover:text-indigo-500 text-gray-400 transition-all">
                  <Plus size={18} />
                </div>
                <span className="text-xs text-gray-400 font-bold mt-2.5 group-hover:text-slate-700 transition-colors">Select a segment to monitor</span>
              </div>
            </div>
          ))}

        </div>

      </main>

      {/* Infinite Scrolling ticker tape */}
      <TickerTape />

      {/* Details drawer backdrop and card panel */}
      <AnnouncementDrawer
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />

      {/* Real-time Notifications Popups */}
      <div className="fixed bottom-12 left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
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
              <div className="flex-1 min-w-0 pt-0.5 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colors?.badge || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {displaySrc}
                  </span>
                  <span className="text-[10px] text-indigo-500 font-bold">LIVE FILINGS</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 line-clamp-1 leading-snug">
                  {toast.announcement.headline}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }}
                className="text-gray-300 hover:text-gray-500 transition-colors self-start p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Stream Custom Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-xs animate-fadeIn"
            onClick={() => setShowAddModal(false)}
          />
          {/* Modal Panel */}
          <div className="relative w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 z-10 animate-slideUp text-left">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-slate-800">Create custom stream</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleAddStream} className="space-y-4 mt-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-wider">Stream Name</label>
                <input
                  type="text"
                  placeholder="e.g. Energy sector, Reliance feed"
                  value={newStreamName}
                  onChange={(e) => setNewStreamName(e.target.value)}
                  required
                  className="w-full bg-[#EFF2F5] border border-transparent rounded-lg px-3.5 py-2.5 font-medium focus:outline-none focus:bg-white focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-wider">Search Keyword filters</label>
                <input
                  type="text"
                  placeholder="e.g. reliance, gas, power, solar"
                  value={newStreamSearch}
                  onChange={(e) => setNewStreamSearch(e.target.value)}
                  className="w-full bg-[#EFF2F5] border border-transparent rounded-lg px-3.5 py-2.5 font-medium focus:outline-none focus:bg-white focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-wider">Source Channel Filter</label>
                <select
                  value={newStreamSource}
                  onChange={(e) => setNewStreamSource(e.target.value)}
                  className="w-full bg-[#EFF2F5] border border-transparent rounded-lg px-3.5 py-2.5 font-medium focus:outline-none focus:bg-white focus:border-indigo-400 cursor-pointer"
                >
                  <option value="All">All Sources</option>
                  <option value="NSE">NSE Filings</option>
                  <option value="BSE">BSE Filings</option>
                  <option value="CNBC TV18">CNBC TV18</option>
                  <option value="Livemint">Livemint</option>
                  <option value="NDTV Profit">NDTV Profit</option>
                  <option value="Economic Times">Economic Times</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm shadow-indigo-500/20"
                >
                  Create Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;