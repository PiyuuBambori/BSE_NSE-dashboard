import React, { useEffect } from 'react';
import type { Announcement } from '../types/announcement';
import { X, ExternalLink, Calendar, Landmark, Tag } from 'lucide-react';

interface AnnouncementDrawerProps {
  announcement: Announcement | null;
  onClose: () => void;
}

export const AnnouncementDrawer: React.FC<AnnouncementDrawerProps> = ({
  announcement,
  onClose,
}) => {
  useEffect(() => {
    if (announcement) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [announcement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!announcement) return null;

  const { source, headline, published_at, tags, article_cleaned, url } = announcement;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const getTags = (): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const parsedTags = getTags();

  const sourceConfig =
    source === 'NSE'
      ? {
          badge: 'bg-violet-50 text-violet-600 border-violet-200',
          accent: 'from-violet-500 to-purple-600',
        }
      : {
          badge: 'bg-blue-50 text-blue-600 border-blue-200',
          accent: 'from-blue-500 to-cyan-600',
        };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col z-10 animate-slideIn">
        {/* Accent line */}
        <div className={`h-1 bg-gradient-to-r ${sourceConfig.accent}`} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${sourceConfig.badge}`}
            >
              <Landmark className="h-3 w-3" />
              {source} Exchange
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <div className="space-y-5">
            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 w-fit">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-medium text-gray-600">Published:</span>
              <span className="font-mono text-gray-500">{formatDate(published_at)}</span>
            </div>

            {/* Headline */}
            <h1 className="text-xl font-bold text-gray-900 leading-snug">
              {headline}
            </h1>

            {/* Tags */}
            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {parsedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full"
                  >
                    <Tag className="h-2.5 w-2.5 text-indigo-400" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <hr className="border-gray-100" />

            {/* Article content */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Announcement Details
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-5 rounded-xl border border-gray-100 max-w-none">
                {article_cleaned || 'No details provided in this announcement.'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-mono">
            ID: {announcement.id}
          </span>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm shadow-indigo-500/20"
            >
              Open Source
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="text-xs text-gray-400 italic">
              No source link available
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default AnnouncementDrawer;
