import React from 'react';
import { Database, WifiOff, FileSearch, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-results' | 'no-connection' | 'error';
  message?: string;
  onAction?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  message,
  onAction,
  actionText = 'Try Again',
}) => {
  const configs = {
    'no-results': {
      icon: <FileSearch className="h-8 w-8 text-gray-400" />,
      title: 'No announcements found',
      description:
        message || "We couldn't find any announcements matching your filters. Try adjusting your search or date range.",
    },
    'no-connection': {
      icon: <WifiOff className="h-8 w-8 text-amber-500" />,
      title: 'Connection lost',
      description:
        message || 'Unable to connect to the live feed. Check your internet connection.',
    },
    error: {
      icon: <Database className="h-8 w-8 text-red-400" />,
      title: 'Something went wrong',
      description:
        message || 'Failed to load announcements. Please check your database credentials and try again.',
    },
  };

  const current = configs[type];

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fadeIn">
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-4">
        {current.icon}
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">{current.title}</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-5 leading-relaxed">{current.description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm shadow-indigo-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {actionText}
        </button>
      )}
    </div>
  );
};
export default EmptyState;
