import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Settings, Trash2, ArrowLeft, ArrowRight, Edit, Cpu, Landmark, Globe, Newspaper, Factory, Building2, Zap, HeartPulse, Car, Pickaxe, FlaskConical, Wheat, Shirt, ShoppingBag, Radio } from 'lucide-react';
import type { Announcement } from '../types/announcement';
import { announcementsService } from '../services/announcements';
import AnnouncementCard from './AnnouncementCard';
import { getMarketCapCompanySet, isCompanyInMarketCapSet } from '../lib/financialHelpers';
import { getSectorNames, getSubsectorNames, getSectorCompanySet, isCompanyInSectorSet } from '../lib/sectorHelpers';
import financialsData from '../../company_financials.json';

interface StreamColumnProps {
  id: string;
  name: string;
  filter: {
    search: string;
    source: string;
    tags: string[];
  };
  globalSearch: string;
  onCardClick: (announcement: Announcement) => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  dropdownType?: 'sectors' | 'marketcap' | 'source';
  currentDropdownValue?: string;
  currentSubsectorValue?: string;
  onDropdownChange?: (val: string) => void;
  onSubsectorChange?: (val: string) => void;
}

// Sector icon mapping for visual variety
const SECTOR_ICONS: Record<string, React.ReactNode> = {
  'Automobile & Ancillaries': <Car className="h-4.5 w-4.5 text-blue-500" />,
  'Capital Goods': <Factory className="h-4.5 w-4.5 text-orange-500" />,
  'Construction Materials': <Building2 className="h-4.5 w-4.5 text-amber-600" />,
  'Power': <Zap className="h-4.5 w-4.5 text-yellow-500" />,
  'Healthcare': <HeartPulse className="h-4.5 w-4.5 text-rose-500" />,
  'Crude Oil': <FlaskConical className="h-4.5 w-4.5 text-gray-600" />,
  'Iron & Steel': <Pickaxe className="h-4.5 w-4.5 text-slate-500" />,
  'Agriculture': <Wheat className="h-4.5 w-4.5 text-green-600" />,
  'Textile': <Shirt className="h-4.5 w-4.5 text-purple-500" />,
  'Consumer Durables': <ShoppingBag className="h-4.5 w-4.5 text-pink-500" />,
  'Information Technology': <Cpu className="h-4.5 w-4.5 text-emerald-500" />,
  'Financial Services': <Landmark className="h-4.5 w-4.5 text-amber-500" />,
};

export const StreamColumn: React.FC<StreamColumnProps> = ({
  id,
  name,
  filter,
  globalSearch,
  onCardClick,
  onDelete,
  onRename,
  onMoveLeft,
  onMoveRight,
  dropdownType,
  currentDropdownValue,
  currentSubsectorValue,
  onDropdownChange,
  onSubsectorChange,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  // Get sector/subsector lists from the mapping JSON
  const sectorNames = useMemo(() => getSectorNames(), []);
  const subsectorNames = useMemo(
    () => (currentDropdownValue ? getSubsectorNames(currentDropdownValue) : []),
    [currentDropdownValue]
  );

  // Pick header icon based on sector or stream name
  const getHeaderIcon = () => {
    if (dropdownType === 'sectors' && currentDropdownValue) {
      const icon = SECTOR_ICONS[currentDropdownValue];
      if (icon) return icon;
    }
    if (dropdownType === 'source') {
      return <Radio className="h-4.5 w-4.5 text-violet-500" />;
    }
    
    const n = name.toLowerCase();
    const val = (currentDropdownValue || '').toLowerCase();
    
    if (n.includes('broadcast') || n.includes('source')) {
      return <Radio className="h-4.5 w-4.5 text-violet-500" />;
    }
    if (n.includes('tech') || n.includes('software') || n.includes('cloud') || val.includes('tech') || val.includes('information')) {
      return <Cpu className="h-4.5 w-4.5 text-emerald-500" />;
    }
    if (n.includes('finance') || n.includes('bank') || n.includes('rate') || val.includes('finance') || val.includes('banking')) {
      return <Landmark className="h-4.5 w-4.5 text-amber-500" />;
    }
    if (n.includes('large') || n.includes('cap') || n.includes('globe') || val.includes('large')) {
      return <Globe className="h-4.5 w-4.5 text-blue-500" />;
    }
    return <Newspaper className="h-4.5 w-4.5 text-indigo-500" />;
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (dropdownType === 'sectors' && currentDropdownValue && currentDropdownValue !== 'All') {
        // SECTOR STREAM: Fetch announcements from DB, then filter client-side by company set
        const companySet = getSectorCompanySet(
          currentDropdownValue,
          currentSubsectorValue && currentSubsectorValue !== 'All' ? currentSubsectorValue : undefined
        );

        // Fetch a large batch of recent announcements
        const result = await announcementsService.fetchAnnouncements({
          search: globalSearch.trim(),
          source: 'All' as any,
          dateRange: 'All' as const,
          startDate: null,
          endDate: null,
          selectedTags: [],
          page: 1,
          limit: 200,
          offset: 0,
        });

        // Client-side filter: keep only announcements whose company_name is in the sector set
        const filtered = result.data.filter(ann =>
          ann.company_name && isCompanyInSectorSet(ann.company_name, companySet)
        );

        setAnnouncements(filtered.slice(0, 30));
      } else if (dropdownType === 'marketcap' && currentDropdownValue) {
        // MARKET CAP STREAM: Fetch announcements from DB, then filter client-side
        let val = currentDropdownValue;
        if (val === 'large') val = 'gt_100k';
        else if (val === 'mid') val = '2k_5k';
        else if (val === 'small') val = 'lt_200';

        const companySet = getMarketCapCompanySet(financialsData as any, val);

        const result = await announcementsService.fetchAnnouncements({
          search: globalSearch.trim(),
          source: 'All' as any,
          dateRange: 'All' as const,
          startDate: null,
          endDate: null,
          selectedTags: [],
          page: 1,
          limit: 200,
          offset: 0,
        });

        const filtered = result.data.filter(ann =>
          ann.company_name && isCompanyInMarketCapSet(ann.company_name, companySet)
        );

        setAnnouncements(filtered.slice(0, 25));
      } else {
        // NORMAL & SOURCE STREAMS: Use search-based filtering at the Supabase level
        const searchTerms = [filter.search, globalSearch].filter(Boolean).join(' ').trim();
        // For 'source' dropdown, use the selected source value; otherwise use the filter's source
        const sourceValue = (dropdownType === 'source' && currentDropdownValue)
          ? currentDropdownValue
          : (filter.source || 'All');

        const result = await announcementsService.fetchAnnouncements({
          search: searchTerms,
          source: sourceValue as any,
          dateRange: 'All' as const,
          startDate: null,
          endDate: null,
          selectedTags: filter.tags || [],
          page: 1,
          limit: 25,
          offset: 0,
        });

        setAnnouncements(result.data);
      }
    } catch (err: any) {
      console.error(`Failed to load stream: ${name} (${id})`, err);
      setError('Failed to load data from database.');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter.search, filter.source, filter.tags, globalSearch, name, currentDropdownValue, currentSubsectorValue]);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      onRename(editName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 flex flex-col h-full bg-[#FAFBFD] border-r border-gray-200 relative">
      {/* Column Header Container */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 shrink-0 flex flex-col gap-2.5 select-none text-left">
        
        {/* Title and Settings row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
            {getHeaderIcon()}
            {isEditing ? (
              <form onSubmit={handleRenameSubmit} className="flex-1 min-w-0">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  autoFocus
                  className="w-full text-sm font-semibold text-slate-800 border border-indigo-400 bg-white rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </form>
            ) : (
              <h3 
                onDoubleClick={() => setIsEditing(true)}
                className="text-sm font-bold text-slate-850 tracking-tight truncate cursor-pointer hover:text-indigo-650 transition-colors"
                title="Double click to rename"
              >
                {name}
              </h3>
            )}
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => loadData()}
              className={`p-1.5 text-gray-400 hover:text-gray-650 hover:bg-gray-100 rounded-lg transition-colors ${loading ? 'animate-spin text-indigo-500' : ''}`}
              title="Refresh stream"
            >
              <RefreshCw size={14} />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-1.5 text-gray-400 hover:text-gray-650 hover:bg-gray-100 rounded-lg transition-colors ${showMenu ? 'bg-gray-100 text-gray-700' : ''}`}
                title="Stream options"
              >
                <Settings size={14} />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-30 animate-fadeIn text-left">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit size={13} className="text-gray-400" />
                      Rename Stream
                    </button>
                    {onMoveLeft && (
                      <button
                        onClick={() => {
                          onMoveLeft();
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <ArrowLeft size={13} className="text-gray-400" />
                        Move Left
                      </button>
                    )}
                    {onMoveRight && (
                      <button
                        onClick={() => {
                          onMoveRight();
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <ArrowRight size={13} className="text-gray-400" />
                        Move Right
                      </button>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-rose-650 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <Trash2 size={13} className="text-rose-450" />
                      Delete Stream
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dropdowns for Sectors filter — Sector + Subsector */}
        {dropdownType === 'sectors' && onDropdownChange && (
          <div className="flex flex-col gap-1.5">
            <select
              value={currentDropdownValue}
              onChange={(e) => onDropdownChange(e.target.value)}
              className="w-full bg-[#EFF2F5] border border-transparent rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200/60 focus:outline-none focus:bg-white focus:border-indigo-400 cursor-pointer transition-all"
            >
              <option value="All">All Sectors</option>
              {sectorNames.map((sector) => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            {currentDropdownValue !== 'All' && subsectorNames.length > 0 && onSubsectorChange && (
              <select
                value={currentSubsectorValue || 'All'}
                onChange={(e) => onSubsectorChange(e.target.value)}
                className="w-full bg-[#EFF2F5] border border-transparent rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-200/60 focus:outline-none focus:bg-white focus:border-indigo-400 cursor-pointer transition-all"
              >
                <option value="All">All Subsectors</option>
                {subsectorNames.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {dropdownType === 'marketcap' && onDropdownChange && (
          <select
            value={currentDropdownValue}
            onChange={(e) => onDropdownChange(e.target.value)}
            className="w-full bg-[#EFF2F5] border border-transparent rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200/60 focus:outline-none focus:bg-white focus:border-indigo-400 cursor-pointer transition-all"
          >
            <option value="gt_100k">Greater than ₹100,000 Cr</option>
            <option value="30k_100k">₹30,000 Cr - ₹100,000 Cr</option>
            <option value="15k_30k">₹15,000 Cr - ₹30,000 Cr</option>
            <option value="10k_15k">₹10,000 Cr - ₹15,000 Cr</option>
            <option value="5k_10k">₹5,000 Cr - ₹10,000 Cr</option>
            <option value="2k_5k">₹2,000 Cr - ₹5,000 Cr</option>
            <option value="200_2k">₹200 Cr - ₹2,000 Cr</option>
            <option value="lt_200">Less than ₹200 Cr</option>
          </select>
        )}

        {dropdownType === 'source' && onDropdownChange && (
          <select
            value={currentDropdownValue || 'All'}
            onChange={(e) => onDropdownChange(e.target.value)}
            className="w-full bg-[#EFF2F5] border border-transparent rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200/60 focus:outline-none focus:bg-white focus:border-indigo-400 cursor-pointer transition-all"
          >
            <option value="All">All Sources</option>
            <optgroup label="Exchange Filings">
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </optgroup>
            <optgroup label="News Channels">
              <option value="CNBC TV18">CNBC TV18</option>
              <option value="Livemint">Livemint</option>
              <option value="NDTV Profit">NDTV Profit</option>
              <option value="Financial Express">Financial Express</option>
              <option value="Business Today">Business Today</option>
              <option value="Business Standard">Business Standard</option>
              <option value="Economic Times">Economic Times</option>
              <option value="Hindu BusinessLine">Hindu BusinessLine</option>
            </optgroup>
          </select>
        )}

      </div>

      {/* Cards Scroll Container */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
        {loading && announcements.length === 0 ? (
          // Inner column skeletons
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-gray-150 rounded-xl p-4.5 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="w-16 h-3 bg-gray-100 rounded" />
                <div className="w-10 h-3 bg-gray-100 rounded" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="border-t border-gray-100 pt-2.5 flex justify-between">
                <div className="w-12 h-3 bg-gray-100 rounded" />
                <div className="w-10 h-3 bg-gray-100 rounded" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="text-center py-8 text-xs text-gray-455 font-medium">
            {error}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400 flex flex-col items-center gap-2">
            <Newspaper className="h-6 w-6 text-gray-300" />
            <span>No matching announcements</span>
          </div>
        ) : (
          announcements.map((ann, idx) => (
            <AnnouncementCard
              key={ann.id}
              announcement={ann}
              onClick={onCardClick}
              viewMode="stream"
              index={idx}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StreamColumn;
