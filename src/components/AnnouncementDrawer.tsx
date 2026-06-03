import React, { useEffect, useState, useMemo } from 'react';
import type { Announcement } from '../types/announcement';
import { getSourceColors, getDisplaySource } from '../types/announcement';
import { X, ExternalLink, Calendar, Landmark, Tag, Newspaper, Sparkles, FileText, ChevronDown, ChevronUp, Mail, Phone, TrendingUp } from 'lucide-react';
import { parseAnnouncementText } from '../lib/textCleaner';

interface AnnouncementDrawerProps {
  announcement: Announcement | null;
  onClose: () => void;
}

export const AnnouncementDrawer: React.FC<AnnouncementDrawerProps> = ({
  announcement,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'reader' | 'raw'>('reader');
  const [coverLetterOpen, setCoverLetterOpen] = useState<boolean>(false);

  const parsed = useMemo(() => {
    return parseAnnouncementText(announcement?.article_cleaned);
  }, [announcement?.article_cleaned]);

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
  const displaySource = getDisplaySource(source);
  const colors = getSourceColors(source);
  const isExchange = displaySource === 'NSE' || displaySource === 'BSE';

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
        <div className={`h-1 bg-gradient-to-r ${colors.accent}`} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${colors.badge}`}
            >
              {isExchange ? <Landmark className="h-3 w-3" /> : <Newspaper className="h-3 w-3" />}
              {displaySource}
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

            {/* View Mode Toggle */}
            <div className="flex justify-between items-center bg-gray-50/80 p-1.5 rounded-xl border border-gray-100/80">
              <span className="text-xs font-semibold text-gray-500 pl-1.5">
                {isExchange ? 'Filing Content' : 'Article Content'}
              </span>
              <div className="flex bg-white p-0.5 rounded-lg text-[11px] font-semibold border border-gray-100 shadow-sm">
                <button
                  onClick={() => setViewMode('reader')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                    viewMode === 'reader'
                      ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  Reader Mode
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                    viewMode === 'raw'
                      ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  Raw Text
                </button>
              </div>
            </div>

            {/* Reader Mode: Highlights Block */}
            {viewMode === 'reader' && (parsed.highlights.metrics.length > 0 || parsed.highlights.contacts.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {parsed.highlights.metrics.length > 0 && (
                  <div className="bg-gradient-to-br from-violet-50/50 to-indigo-50/50 border border-indigo-100/50 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-indigo-600 font-semibold text-[10px] uppercase tracking-wider mb-2">
                      <TrendingUp className="h-3 w-3" />
                      Key Highlights
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {parsed.highlights.metrics.map((metric, idx) => (
                        <span key={idx} className="bg-white/85 backdrop-blur-xs text-indigo-700 border border-indigo-100/60 text-xs font-semibold px-2 py-0.5 rounded-md shadow-xs">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {parsed.highlights.contacts.length > 0 && (
                  <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-100/50 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[10px] uppercase tracking-wider mb-2">
                      <Mail className="h-3 w-3" />
                      Filing Contacts
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {parsed.highlights.contacts.map((contact, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                          {contact.includes('@') ? (
                            <Mail className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Phone className="h-3 w-3 text-emerald-500" />
                          )}
                          <span className="font-mono">{contact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reader Mode: Collapsible Cover Letter Accordion */}
            {viewMode === 'reader' && parsed.coverLetter && (
              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setCoverLetterOpen(!coverLetterOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-gray-50 text-left transition-all cursor-pointer border-b border-gray-50"
                >
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    Exchange Cover Letter
                  </span>
                  {coverLetterOpen ? (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <span>Collapse</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <span>Expand</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
                {coverLetterOpen && (
                  <div className="p-4 bg-white text-xs text-gray-600 leading-relaxed font-mono whitespace-pre-wrap">
                    {parsed.coverLetter}
                  </div>
                )}
              </div>
            )}

            {/* Main Content Area */}
            <div>
              {viewMode === 'reader' ? (
                <div className="space-y-4">
                  {parsed.blocks.length > 0 ? (
                    parsed.blocks.map((block, idx) => {
                      if (block.type === 'heading') {
                        return (
                          <h3
                            key={idx}
                            className="text-sm font-bold text-gray-800 mt-6 mb-2 leading-snug border-l-2 border-indigo-500 pl-2 uppercase tracking-wide"
                          >
                            {block.content as string}
                          </h3>
                        );
                      }
                      if (block.type === 'list') {
                        return (
                          <ul key={idx} className="list-disc pl-5 my-3 space-y-1.5">
                            {(block.content as string[]).map((item, itemIdx) => (
                              <li key={itemIdx} className="text-sm text-gray-600 leading-relaxed pl-0.5">
                                {item}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (block.type === 'table') {
                        const rows = block.content as string[][];
                        return (
                          <div key={idx} className="overflow-x-auto border border-gray-150 rounded-xl my-4 shadow-xs max-w-full">
                            <table className="min-w-full divide-y divide-gray-100 text-xs font-mono">
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {rows.map((row, rowIdx) => (
                                  <tr
                                    key={rowIdx}
                                    className={rowIdx === 0 ? 'bg-gray-50/70 font-semibold border-b border-gray-100' : rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                                  >
                                    {row.map((cell, cellIdx) => (
                                      <td
                                        key={cellIdx}
                                        className="px-4 py-2.5 text-gray-700 border-r border-gray-100 last:border-r-0 whitespace-nowrap"
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      // Paragraph
                      return (
                        <p
                          key={idx}
                          className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-w-none"
                        >
                          {block.content as string}
                        </p>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-400 italic">No detailed content to display.</p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-600 leading-relaxed font-mono whitespace-pre-wrap bg-gray-50 p-5 rounded-xl border border-gray-100 max-w-none">
                  {article_cleaned || 'No details provided.'}
                </div>
              )}
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
              {isExchange ? 'Open Filing' : 'Read Full Article'}
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
