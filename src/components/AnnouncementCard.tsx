import React from 'react';
import type { Announcement } from '../types/announcement';
import { getSourceColors, getDisplaySource } from '../types/announcement';
import { Landmark, ArrowUpRight, Calendar, Newspaper } from 'lucide-react';

interface AnnouncementCardProps {
  announcement: Announcement;
  onClick: (announcement: Announcement) => void;
  viewMode?: 'list' | 'grid';
  style?: React.CSSProperties;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onClick,
  viewMode = 'list',
  style,
}) => {
  const { source, headline, published_at, company_name } = announcement;
  const displaySource = getDisplaySource(source);
  const colors = getSourceColors(source);
  const isExchange = displaySource === 'NSE' || displaySource === 'BSE';

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return dateStr.substring(0, 10);
    }
  };

  // Grid card layout
  if (viewMode === 'grid') {
    return (
      <div
        style={style}
        className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer group"
        onClick={() => onClick(announcement)}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colors.badge}`}>
            {isExchange ? <Landmark className="h-2.5 w-2.5" /> : <Newspaper className="h-2.5 w-2.5" />}
            {displaySource}
          </span>
          <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5" />
            {formatDate(published_at)}
          </span>
        </div>
        {company_name && (
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 line-clamp-1">
            {company_name}
          </div>
        )}
        <p className="text-[13px] font-medium text-gray-700 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-relaxed mb-3">
          {headline}
        </p>
        <div className="flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(announcement);
            }}
            className="text-[12px] font-medium text-gray-400 group-hover:text-indigo-500 flex items-center gap-1 transition-colors"
          >
            View <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  // List row layout
  return (
    <div
      style={style}
      className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center bg-white hover:bg-gray-50/80 transition-colors border-b border-gray-100/80 cursor-pointer w-full group"
      onClick={() => onClick(announcement)}
    >
      {/* Headline */}
      <div className="col-span-6 flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors.letter} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm`}>
          {displaySource.charAt(0)}
        </div>
        <div className="flex flex-col min-w-0">
          {company_name && (
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5 line-clamp-1">
              {company_name}
            </span>
          )}
          <span className="text-[13px] font-medium text-gray-700 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {headline}
          </span>
        </div>
      </div>

      {/* Source */}
      <div className="col-span-2 flex items-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colors.badge}`}>
          {isExchange ? <Landmark className="h-2.5 w-2.5" /> : <Newspaper className="h-2.5 w-2.5" />}
          {displaySource}
        </span>
      </div>

      {/* Date */}
      <div className="col-span-2 flex items-center text-[13px] text-gray-400 font-mono">
        {formatDate(published_at)}
      </div>

      {/* Action */}
      <div className="col-span-2 flex items-center justify-end pr-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(announcement);
          }}
          className="text-[12px] font-medium text-gray-400 group-hover:text-indigo-500 flex items-center gap-1 transition-colors"
        >
          View <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
export default AnnouncementCard;
