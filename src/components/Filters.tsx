import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { Calendar, Filter, X } from 'lucide-react';

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

export const Filters: React.FC = () => {
  const { filters, setFilters, resetFilters } = useDashboardStore();

  const handleSourceChange = (source: 'All' | 'NSE' | 'BSE') => {
    setFilters({ source });
  };

  const handleDateRangeChange = (dateRange: 'Today' | '7d' | '30d' | 'custom') => {
    setFilters({ dateRange });
  };

  const handleCustomDateChange = (type: 'startDate' | 'endDate', value: string) => {
    setFilters({ [type]: value || null });
  };

  const handleTagToggle = (tag: string) => {
    const isSelected = filters.selectedTags.includes(tag);
    const newTags = isSelected
      ? filters.selectedTags.filter((t) => t !== tag)
      : [...filters.selectedTags, tag];
    setFilters({ selectedTags: newTags });
  };

  const hasActiveFilters =
    filters.source !== 'All' ||
    filters.dateRange !== '7d' ||
    filters.search !== '' ||
    filters.selectedTags.length > 0;

  return (
    <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Filter className="h-4 w-4 text-indigo-400" />
          Filter Announcements
        </h4>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-all duration-200"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Source and Date Filters */}
        <div className="space-y-4">
          {/* Source Select */}
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Exchange Source
            </span>
            <div className="flex gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800 max-w-sm">
              {(['All', 'NSE', 'BSE'] as const).map((src) => {
                const isActive = filters.source === src;
                let activeStyle = 'bg-slate-800 text-slate-200';
                if (isActive) {
                  if (src === 'NSE') activeStyle = 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5';
                  else if (src === 'BSE') activeStyle = 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/5';
                  else activeStyle = 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/5';
                }
                return (
                  <button
                    key={src}
                    onClick={() => handleSourceChange(src)}
                    className={`flex-1 text-center py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-200 border border-transparent ${
                      isActive ? activeStyle : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {src === 'All' ? 'All Exchanges' : src}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Time Period
            </span>
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800 max-w-md">
              {[
                { key: 'Today', label: 'Today' },
                { key: '7d', label: 'Last 7 Days' },
                { key: '30d', label: 'Last 30 Days' },
                { key: 'custom', label: 'Custom Range' },
              ].map((item) => {
                const isActive = filters.dateRange === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleDateRangeChange(item.key as any)}
                    className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-200 border border-transparent ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Picker Fields */}
            {filters.dateRange === 'custom' && (
              <div className="mt-3 flex flex-wrap items-center gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-850 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">From</span>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">To</span>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <Calendar className="h-4 w-4 text-indigo-400/80 ml-auto hidden sm:block" />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-select tags */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Filter by Corporate Event Tags
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-[148px] overflow-y-auto pr-1 custom-scrollbar">
            {COMMON_TAGS.map((tag) => {
              const isSelected = filters.selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-200 font-medium ${
                    isSelected
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-350 hover:border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Filters;
