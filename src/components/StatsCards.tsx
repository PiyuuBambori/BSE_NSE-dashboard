import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { Landmark, Clock, RefreshCw, ArrowUpRight, Activity, Newspaper } from 'lucide-react';

interface StatsCardsProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ onRefresh, isRefreshing }) => {
  const stats = useDashboardStore((state) => state.stats);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const cards = [
    {
      label: "Today's NSE Filings",
      value: formatNumber(stats.nseToday),
      icon: <Landmark className="h-4 w-4" />,
      change: 'Daily',
      subtitle: 'NSE filings today',
      accent: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-50 text-violet-500',
      changeBg: 'bg-violet-50 text-violet-600',
    },
    {
      label: "Today's BSE Filings",
      value: formatNumber(stats.bseToday),
      icon: <Landmark className="h-4 w-4" />,
      change: 'Daily',
      subtitle: 'BSE filings today',
      accent: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-50 text-blue-500',
      changeBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: "Today's News Articles",
      value: formatNumber(stats.newsToday),
      icon: <Newspaper className="h-4 w-4" />,
      change: 'Live',
      subtitle: 'News articles today',
      accent: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-50 text-emerald-500',
      changeBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Grand Total',
      value: formatNumber(stats.totalNse + stats.totalBse + stats.totalNews),
      icon: <Newspaper className="h-4 w-4" />,
      change: 'All-time',
      subtitle: `${formatNumber(stats.totalNse + stats.totalBse)} filings • ${formatNumber(stats.totalNews)} news`,
      accent: 'from-indigo-500 to-purple-600',
      iconBg: 'bg-indigo-50 text-indigo-500',
      changeBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Last Synced',
      value: stats.lastUpdate || '—',
      icon: <Clock className="h-4 w-4" />,
      isTime: true,
      accent: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-50 text-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="group bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-200 relative overflow-hidden"
        >
          {/* Accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

          <div className="flex justify-between items-start mb-2">
            <p className="text-[12px] text-gray-500 font-medium">{card.label}</p>
            <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>

          {card.isTime ? (
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800 truncate">{card.value}</p>
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-1 rounded-md text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-40"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{card.value}</h3>
          )}

          {card.change && !card.isTime && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${card.changeBg}`}>
                {card.change === 'Live' ? (
                  <Activity className="w-2.5 h-2.5" />
                ) : (
                  <ArrowUpRight className="w-2.5 h-2.5" />
                )}
                {card.change}
              </span>
              <span className="text-[10px] text-gray-400">{card.subtitle}</span>
            </div>
          )}

          {card.isTime && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                <Activity className="w-2.5 h-2.5" />
                Active
              </span>
              <span className="text-[10px] text-gray-400">Realtime</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default StatsCards;
