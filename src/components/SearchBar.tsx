import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { Search, X } from 'lucide-react';

export const SearchBar: React.FC = () => {
  const searchFilter = useDashboardStore((state) => state.filters.search);
  const setFilters = useDashboardStore((state) => state.setFilters);
  const [localSearch, setLocalSearch] = useState(searchFilter);

  // Keep local search value in sync if store value is reset/changed externally
  useEffect(() => {
    setLocalSearch(searchFilter);
  }, [searchFilter]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchFilter) {
        setFilters({ search: localSearch });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [localSearch, searchFilter, setFilters]);

  const handleClear = () => {
    setLocalSearch('');
    setFilters({ search: '' });
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-500" />
      </div>
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search by headline, tags, keywords..."
        className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
      />
      {localSearch && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
export default SearchBar;
