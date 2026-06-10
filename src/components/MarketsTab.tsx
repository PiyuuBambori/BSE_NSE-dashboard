import React from 'react';
import { ArrowUpRight, ArrowDownRight, BarChart3, Award } from 'lucide-react';

export const MarketsTab: React.FC = () => {
  const indices = [
    { name: 'NIFTY 50', value: '22,322.40', change: '+26.80', pct: '+0.12%', isPositive: true },
    { name: 'SENSEX', value: '73,425.10', change: '+58.70', pct: '+0.08%', isPositive: true },
    { name: 'NIFTY BANK', value: '47,845.50', change: '-120.40', pct: '-0.25%', isPositive: false },
    { name: 'NIFTY IT', value: '34,920.10', change: '+412.30', pct: '+1.19%', isPositive: true },
    { name: 'NIFTY METAL', value: '8,122.40', change: '+142.10', pct: '+1.78%', isPositive: true },
    { name: 'NIFTY AUTO', value: '20,890.30', change: '-45.60', pct: '-0.22%', isPositive: false },
  ];

  const sectors = [
    { name: 'Information Tech', pct: '+1.19%', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    { name: 'Metals & Mining', pct: '+1.78%', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    { name: 'Private Banks', pct: '-0.25%', color: 'bg-rose-500/10 text-rose-600 border-rose-200' },
    { name: 'Automobile', pct: '-0.22%', color: 'bg-rose-500/10 text-rose-600 border-rose-200' },
    { name: 'FMCG Sector', pct: '+0.45%', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    { name: 'Oil & Gas / Energy', pct: '+1.45%', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  ];

  const gainers = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹2,950.40', pct: '+1.45%', change: '+₹42.30' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: '₹3,890.10', pct: '+1.20%', change: '+₹46.20' },
    { symbol: 'WIPRO', name: 'Wipro Limited', price: '₹472.50', pct: '+2.85%', change: '+₹13.10' },
    { symbol: 'COALINDIA', name: 'Coal India Limited', price: '₹441.20', pct: '+3.45%', change: '+₹14.70' },
    { symbol: 'HINDALCO', name: 'Hindalco Industries', price: '₹612.40', pct: '+2.10%', change: '+₹12.60' },
  ];

  const losers = [
    { symbol: 'INFY', name: 'Infosys Limited', price: '₹1,480.20', pct: '-1.05%', change: '-₹15.70' },
    { symbol: 'AXISBANK', name: 'Axis Bank Limited', price: '₹1,120.40', pct: '-0.88%', change: '-₹9.90' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: '₹1,542.10', pct: '-0.42%', change: '-₹6.50' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: '₹12,450.00', pct: '-1.15%', change: '-₹145.00' },
    { symbol: 'TATASTEEL', name: 'Tata Steel Limited', price: '₹162.30', pct: '-0.75%', change: '-₹1.20' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#F7F8FA] animate-fadeIn text-left">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="pb-3 border-b border-gray-200">
          <h2 className="text-xl font-bold text-slate-850 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Markets Monitor
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Live index movements, top listings, and sector performance indices.</p>
        </div>

        {/* Indices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {indices.map((idx) => (
            <div key={idx.name} className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-gray-500 tracking-wide uppercase">{idx.name}</span>
                <span className={`p-1 rounded-lg ${
                  idx.isPositive ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                }`}>
                  {idx.isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                </span>
              </div>
              <div className="mt-2.5">
                <h3 className="text-xl font-bold text-slate-800">{idx.value}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold ${idx.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {idx.change} ({idx.pct})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sectors Tracker */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-gray-100 mb-4 flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-indigo-500" />
            Sector heat map
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {sectors.map((sec) => (
              <div 
                key={sec.name} 
                className={`border rounded-xl p-3 text-center flex flex-col justify-center gap-1.5 ${sec.color} transition-all cursor-pointer hover:shadow-2xs`}
              >
                <span className="text-[11px] font-bold tracking-tight line-clamp-2 min-h-[32px] flex items-center justify-center">
                  {sec.name}
                </span>
                <span className="text-xs font-bold font-mono">
                  {sec.pct}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gainers and Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-emerald-600 pb-3.5 border-b border-gray-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Top Nifty 50 Gainers
            </h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="text-gray-400 font-bold text-left uppercase border-b border-gray-100/50">
                    <th className="py-2">SYMBOL</th>
                    <th className="py-2 text-right">PRICE</th>
                    <th className="py-2 text-right">CHANGE</th>
                    <th className="py-2 text-right">% CHANGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {gainers.map((g) => (
                    <tr key={g.symbol} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-slate-800">{g.symbol}</span>
                        <p className="text-[10px] text-gray-400 truncate w-36">{g.name}</p>
                      </td>
                      <td className="py-3 text-right font-medium font-mono text-slate-800">{g.price}</td>
                      <td className="py-3 text-right font-semibold text-emerald-500 font-mono">{g.change}</td>
                      <td className="py-3 text-right font-bold text-emerald-500 font-mono">{g.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-rose-600 pb-3.5 border-b border-gray-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Top Nifty 50 Losers
            </h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="text-gray-400 font-bold text-left uppercase border-b border-gray-100/50">
                    <th className="py-2">SYMBOL</th>
                    <th className="py-2 text-right">PRICE</th>
                    <th className="py-2 text-right">CHANGE</th>
                    <th className="py-2 text-right">% CHANGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {losers.map((l) => (
                    <tr key={l.symbol} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-slate-800">{l.symbol}</span>
                        <p className="text-[10px] text-gray-400 truncate w-36">{l.name}</p>
                      </td>
                      <td className="py-3 text-right font-medium font-mono text-slate-800">{l.price}</td>
                      <td className="py-3 text-right font-semibold text-rose-500 font-mono">{l.change}</td>
                      <td className="py-3 text-right font-bold text-rose-500 font-mono">{l.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarketsTab;
