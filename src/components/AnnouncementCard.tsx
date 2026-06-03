import React from 'react';
import type { Announcement } from '../types/announcement';
import { Landmark, ArrowUpRight, Calendar } from 'lucide-react';

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
  const { source, headline, published_at } = announcement;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr.substring(0, 10);
    }
  };

  const sourceStyles =
    source === 'NSE'
      ? { badge: 'bg-violet-50 text-violet-600 border-violet-100', letter: 'from-violet-400 to-purple-500' }
      : { badge: 'bg-blue-50 text-blue-600 border-blue-100', letter: 'from-blue-400 to-cyan-500' };

  // Grid card layout
  if (viewMode === 'grid') {
    return (
      <div
        style={style}
        className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer group"
        onClick={() => onClick(announcement)}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${sourceStyles.badge}`}>
            <Landmark className="h-2.5 w-2.5" />
            {source}
          </span>
          <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5" />
            {formatDate(published_at)}
          </span>
        </div>
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

  // List row layout (default)
  return (
    <div
      style={style}
      className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center bg-white hover:bg-gray-50/80 transition-colors border-b border-gray-100/80 cursor-pointer w-full group"
      onClick={() => onClick(announcement)}
    >
      {/* Headline */}
      <div className="col-span-6 flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${sourceStyles.letter} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm`}>
          {source.charAt(0)}
        </div>
        <span className="text-[13px] font-medium text-gray-700 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {headline}
        </span>
      </div>

      {/* Exchange */}
      <div className="col-span-2 flex items-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${sourceStyles.badge}`}>
          <Landmark className="h-2.5 w-2.5" />
          {source}
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
