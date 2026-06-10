import React from 'react';
import type { Announcement } from '../types/announcement';
import { getSourceColors, getDisplaySource } from '../types/announcement';
import { Landmark, ArrowUpRight, Calendar, Newspaper, TrendingUp, TrendingDown } from 'lucide-react';
import { getEnrichedFinancialData, formatRelativeTime } from '../lib/financialHelpers';

interface AnnouncementCardProps {
  announcement: Announcement;
  onClick: (announcement: Announcement) => void;
  viewMode?: 'list' | 'grid' | 'stream';
  style?: React.CSSProperties;
  index?: number;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onClick,
  viewMode = 'list',
  style,
  index = 0,
}) => {
  const { id, source, headline, published_at, company_name, article_cleaned } = announcement;
  const displaySource = getDisplaySource(source);
  const colors = getSourceColors(source);
  const isExchange = displaySource === 'NSE' || displaySource === 'BSE';

  // Get enriched financial terminal data
  const fin = getEnrichedFinancialData(company_name, headline, id);
  const relativeTime = formatRelativeTime(published_at, index);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Recent';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Recent';
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return String(dateStr).substring(0, 10);
    }
  };

  // Stream column card layout
  if (viewMode === 'stream') {
    return (
      <div
        style={style}
        className="bg-white border border-gray-150 rounded-xl p-4.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[160px] relative overflow-hidden text-left"
        onClick={() => onClick(announcement)}
      >
        {/* Top Tag & Time */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {company_name ? (
            // Always show the actual company name from the database when available
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate max-w-[175px] text-indigo-600`} title={company_name}>
              {company_name}
            </span>
          ) : fin.publisher ? (
            // Publisher Badge fallback (like J.P. Morgan, Reuters) for news items without company_name
            <div className="flex items-center gap-1.5">
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${fin.publisher.bgColor} ${fin.publisher.textColor} border border-gray-200/50 shadow-2xs`}>
                {fin.publisher.logo}
              </span>
              <span className="text-[11px] font-semibold text-gray-500 line-clamp-1">
                {fin.publisher.name}
              </span>
            </div>
          ) : (
            // Tag Badge fallback (like TECHNOLOGY, CLOUD, SOFTWARE)
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate max-w-[175px] ${
              fin.tag === 'TECHNOLOGY' ? 'text-cyan-600' :
              fin.tag === 'CLOUD' ? 'text-blue-600' :
              fin.tag === 'SOFTWARE' ? 'text-emerald-600' :
              fin.tag === 'FINANCE' ? 'text-amber-600' :
              fin.tag === 'CAP > $50B' ? 'text-indigo-650' : 'text-slate-500'
            }`} title={fin.tag}>
              {fin.tag}
            </span>
          )}
          
          <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap shrink-0">
            {relativeTime}
          </span>
        </div>

        {/* Headline */}
        <div className="flex-1 mb-3">
          <p className="text-[13px] font-semibold text-slate-850 leading-relaxed line-clamp-3 group-hover:text-indigo-600 transition-colors">
            {headline}
          </p>
          
          {/* Excerpt if present and tag is CLOUD */}
          {fin.tag === 'CLOUD' && article_cleaned && (
            <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
              {article_cleaned.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 100)}...
            </p>
          )}
        </div>

        {/* Card Footer (Financial details, tickers, percentages) */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-auto">
          {/* Ticker & Price / Source */}
          <div className="flex items-center gap-1">
            {fin.ticker ? (
              <span className="text-[11.5px] font-bold text-gray-800">
                {fin.ticker} <span className="font-medium text-gray-500 ml-0.5">{fin.price}</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                Source: <span className="font-semibold text-gray-500">{displaySource}</span>
              </span>
            )}
          </div>

          {/* Change Indicator / Volume */}
          <div className="flex items-center gap-2">
            {fin.change && (
              <span className={`inline-flex items-center gap-0.5 text-[11.5px] font-bold ${
                fin.isPositive ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {fin.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {fin.change}
              </span>
            )}
            {fin.volume && fin.tag === 'FINANCE' && (
              <span className="text-[11px] text-gray-400 font-medium">
                Vol: {fin.volume}
              </span>
            )}
          </div>
        </div>

        {/* Custom Progress Bar for SaaS/Software card */}
        {fin.hasBottomBar && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
            <div className="h-full bg-emerald-600 w-3/5 rounded-r" />
          </div>
        )}
      </div>
    );
  }

  // Grid card layout
  if (viewMode === 'grid') {
    return (
      <div
        style={style}
        className="bg-white border border-gray-150 rounded-xl p-4 hover:shadow-md hover:border-gray-250 transition-all duration-200 cursor-pointer group text-left"
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
          <div className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider mb-1 line-clamp-1">
            {company_name}
          </div>
        )}
        <p className="text-[13px] font-semibold text-slate-850 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-relaxed mb-3">
          {headline}
        </p>
        <div className="flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(announcement);
            }}
            className="text-[12px] font-semibold text-gray-400 group-hover:text-indigo-500 flex items-center gap-1 transition-colors"
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
      className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center bg-white hover:bg-gray-50/60 transition-colors border-b border-gray-100 cursor-pointer w-full group text-left"
      onClick={() => onClick(announcement)}
    >
      {/* Headline */}
      <div className="col-span-6 flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors.letter} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm`}>
          {displaySource.charAt(0)}
        </div>
        <div className="flex flex-col min-w-0">
          {company_name && (
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider mb-0.5 line-clamp-1">
              {company_name}
            </span>
          )}
          <span className="text-[13px] font-semibold text-slate-850 line-clamp-1 group-hover:text-indigo-600 transition-colors">
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
          className="text-[12px] font-semibold text-gray-400 group-hover:text-indigo-500 flex items-center gap-1 transition-colors"
        >
          View <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementCard;
