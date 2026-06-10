import React from 'react';
import { Briefcase, ArrowUpRight, PieChart, Activity, ShoppingBag } from 'lucide-react';

export const PortfolioTab: React.FC = () => {
  const holdings = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', qty: 250, avg: 2420.0, cmp: 2950.4, value: 737600.0, gain: 132600.0, gainPct: '+21.9%', pos: true },
    { symbol: 'TCS', name: 'Tata Consultancy Services', qty: 100, avg: 3410.0, cmp: 3890.1, value: 389010.0, gain: 48010.0, gainPct: '+14.1%', pos: true },
    { symbol: 'INFY', name: 'Infosys Limited', qty: 300, avg: 1520.0, cmp: 1480.2, value: 444060.0, gain: -11940.0, gainPct: '-2.62%', pos: false },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', qty: 400, avg: 1490.0, cmp: 1542.1, value: 616840.0, gain: 20840.0, gainPct: '+3.49%', pos: true },
    { symbol: 'WIPRO', name: 'Wipro Limited', qty: 500, avg: 420.0, cmp: 472.5, value: 236250.0, gain: 26250.0, gainPct: '+12.5%', pos: true },
  ];

  const summary = {
    totalVal: '₹24,23,760.00',
    totalCost: '₹22,07,000.00',
    totalGain: '+₹2,16,760.00',
    totalGainPct: '+9.82%',
    todayGain: '+₹14,210.00',
    todayGainPct: '+0.59%',
  };

  const logs = [
    { type: 'BUY', symbol: 'TCS', qty: 20, price: '₹3,880.00', time: '10:45 AM', date: 'Jun 10, 2026' },
    { type: 'BUY', symbol: 'RELIANCE', qty: 50, price: '₹2,932.00', time: '09:55 AM', date: 'Jun 10, 2026' },
    { type: 'SELL', symbol: 'INFY', qty: 100, price: '₹1,495.00', time: '14:20 PM', date: 'Jun 09, 2026' },
    { type: 'BUY', symbol: 'HDFCBANK', qty: 100, price: '₹1,530.00', time: '11:15 AM', date: 'Jun 08, 2026' },
  ];

  const allocation = [
    { sector: 'Energy & Power', pct: '30.4%', color: 'bg-indigo-500' },
    { sector: 'IT Services', pct: '25.8%', color: 'bg-emerald-500' },
    { sector: 'Financials', pct: '25.4%', color: 'bg-blue-500' },
    { sector: 'Conglomerates', pct: '18.4%', color: 'bg-violet-500' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#F7F8FA] animate-fadeIn text-left">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="pb-3 border-b border-gray-200">
          <h2 className="text-xl font-bold text-slate-850 tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            Portfolio Terminal
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Surveillance of holdings valuation, net worth returns, and recent trades.</p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">PORTFOLIO VALUATION</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1.5">{summary.totalVal}</h3>
            <span className="text-[10px] text-gray-400 font-medium">Cost Basis: {summary.totalCost}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">TOTAL RETURNS</p>
            <h3 className="text-2xl font-bold text-emerald-500 mt-1.5">{summary.totalGain}</h3>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-500 font-mono mt-0.5">
              <ArrowUpRight size={12} />
              {summary.totalGainPct}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">TODAY'S CHANGE</p>
            <h3 className="text-2xl font-bold text-emerald-500 mt-1.5">{summary.todayGain}</h3>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-500 font-mono mt-0.5">
              <ArrowUpRight size={12} />
              {summary.todayGainPct}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ACCOUNTS STATUS</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-xs font-bold text-gray-700">Broker Linked: Zerodha</span>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 pb-3.5 border-b border-gray-100 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-4.5 w-4.5 text-indigo-500" />
            Asset Holdings Breakdown
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="text-gray-400 font-bold text-left uppercase border-b border-gray-100">
                  <th className="py-2.5">HOLDING</th>
                  <th className="py-2.5 text-right">QUANTITY</th>
                  <th className="py-2.5 text-right">AVG COST</th>
                  <th className="py-2.5 text-right">LAST PRICE</th>
                  <th className="py-2.5 text-right">VALUATION</th>
                  <th className="py-2.5 text-right">TOTAL GAIN</th>
                  <th className="py-2.5 text-right">GAIN %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {holdings.map((h) => (
                  <tr key={h.symbol} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5">
                      <span className="font-bold text-slate-850">{h.symbol}</span>
                      <p className="text-[10px] text-gray-400 truncate w-36 mt-0.5">{h.name}</p>
                    </td>
                    <td className="py-3.5 text-right font-semibold font-mono text-slate-800">{h.qty}</td>
                    <td className="py-3.5 text-right font-medium font-mono text-gray-600">₹{h.avg.toFixed(2)}</td>
                    <td className="py-3.5 text-right font-medium font-mono text-slate-800">₹{h.cmp.toFixed(2)}</td>
                    <td className="py-3.5 text-right font-bold font-mono text-slate-850">₹{h.value.toLocaleString()}</td>
                    <td className={`py-3.5 text-right font-semibold font-mono ${h.pos ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {h.pos ? '+' : ''}₹{h.gain.toLocaleString()}
                    </td>
                    <td className={`py-3.5 text-right font-bold font-mono ${h.pos ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {h.gainPct}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lower row: Allocation and Transaction log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Allocation */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-fit">
            <div>
              <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                <PieChart className="h-4.5 w-4.5 text-indigo-500" />
                Sector Allocation
              </h3>
              
              <div className="mt-4 space-y-4">
                {allocation.map((alloc) => (
                  <div key={alloc.sector}>
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-600 mb-1.5">
                      <span>{alloc.sector}</span>
                      <span className="font-mono text-slate-800">{alloc.pct}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${alloc.color}`} style={{ width: alloc.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction Logs */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-emerald-500" />
                Recent Orders execution
              </h3>
              
              <div className="divide-y divide-gray-100 mt-2">
                {logs.map((log, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.type === 'BUY' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {log.type}
                      </span>
                      <div>
                        <span className="font-bold text-slate-850">{log.symbol}</span>
                        <span className="text-gray-400 font-medium ml-1.5">Qty: {log.qty} @ {log.price}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-slate-800 font-semibold">{log.time}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{log.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PortfolioTab;
