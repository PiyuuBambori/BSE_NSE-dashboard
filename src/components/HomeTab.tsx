import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { Landmark, Newspaper, Zap, Calendar, Compass, ArrowRight } from 'lucide-react';

interface HomeTabProps {
  onSwitchTab: (tab: 'news' | 'markets' | 'portfolio') => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onSwitchTab }) => {
  const { stats } = useDashboardStore();

  const mockEvents = [
    { type: 'Dividend', company: 'RELIANCE INDUSTRIES', detail: '₹10.00 Final Dividend', date: 'Jun 12, 2026' },
    { type: 'Board Meeting', company: 'TATA CONSULTANCY SERVICES', detail: 'Q1 Financial Results Audits', date: 'Jun 15, 2026' },
    { type: 'Earnings', company: 'INFOSYS LTD', detail: 'Earnings Call 17:00 IST', date: 'Jun 16, 2026' },
    { type: 'Acquisition', company: 'HDFC BANK LTD', detail: 'Merger Integration updates', date: 'Jun 18, 2026' },
    { type: 'Bonus/Split', company: 'ICICI BANK LTD', detail: '1:1 Share Bonus approval', date: 'Jun 22, 2026' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#F7F8FA] animate-fadeIn">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 text-left">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-2xl shadow-2xs">
          <div>
            <h2 className="text-xl font-bold text-slate-850 tracking-tight">Financial Terminal Workspace</h2>
            <p className="text-xs text-gray-500 mt-1">Real-time surveillance of corporate actions, exchanges data, and global sentiment feeds.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-xl border border-emerald-100 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Market Monitoring: Active
          </div>
        </div>

        {/* Analytics Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">NSE FILINGS TODAY</p>
              <h3 className="text-2xl font-bold text-slate-850 mt-1">{(stats.nseToday || 12).toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">BSE FILINGS TODAY</p>
              <h3 className="text-2xl font-bold text-slate-850 mt-1">{(stats.bseToday || 8).toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
              <Newspaper className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">NEWS DIGEST TODAY</p>
              <h3 className="text-2xl font-bold text-slate-850 mt-1">{(stats.newsToday || 24).toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Index Highlights cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { name: 'NIFTY 50', val: '22,322.40', chg: '+0.12%', pos: true, color: 'border-emerald-500' },
            { name: 'SENSEX', val: '73,425.10', chg: '+0.08%', pos: true, color: 'border-emerald-500' },
            { name: 'NASDAQ', val: '16,368.52', chg: '+1.18%', pos: true, color: 'border-emerald-500' },
            { name: 'BRENT CRUDE', val: '$85.62', chg: '+0.88%', pos: true, color: 'border-emerald-500' }
          ].map((idx) => (
            <div key={idx.name} className={`bg-white border-l-4 ${idx.color} border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between h-24`}>
              <span className="text-[11px] text-gray-400 font-bold tracking-wider">{idx.name}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-bold text-slate-800">{idx.val}</span>
                <span className="text-xs font-bold text-emerald-500">{idx.chg}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events Column */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                  Upcoming Corporate Events
                </h3>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">SURVEILLANCE</span>
              </div>

              <div className="divide-y divide-gray-100 mt-2">
                {mockEvents.map((evt, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-indigo-650 tracking-wider text-[10px] uppercase">{evt.type}</p>
                      <h4 className="font-semibold text-slate-800 truncate mt-0.5">{evt.company}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{evt.detail}</p>
                    </div>
                    <span className="text-gray-400 font-medium font-mono whitespace-nowrap">{evt.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-gray-100 flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-emerald-500" />
              Terminal Navigation
            </h3>
            
            <div className="flex flex-col gap-2 flex-1">
              <button 
                onClick={() => onSwitchTab('news')}
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl hover:bg-slate-100 hover:border-gray-300 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-850">Monitor Live Streams</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Customize columns to watch sectors</p>
                </div>
                <ArrowRight size={14} className="text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => onSwitchTab('markets')}
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl hover:bg-slate-100 hover:border-gray-300 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-850">Market Intelligence</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">View sector trackers & index analysis</p>
                </div>
                <ArrowRight size={14} className="text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => onSwitchTab('portfolio')}
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl hover:bg-slate-100 hover:border-gray-300 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-850">Sleek Portfolio Tracker</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Mock trades logs and valuation charts</p>
                </div>
                <ArrowRight size={14} className="text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
            
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-750 flex items-start gap-2.5">
              <Zap size={15} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Pro Tip:</span> You can add customized news streams in the <b>News</b> tab to track specific tags or keywords in real-time.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeTab;
