import React, { useState, useEffect } from 'react';
import { TICKER_ITEMS } from '../lib/financialHelpers';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const TickerTape: React.FC = () => {
  const [items, setItems] = useState(TICKER_ITEMS);
  const [flashIndices, setFlashIndices] = useState<Record<number, 'up' | 'down'>>({});

  useEffect(() => {
    // Periodically update some ticker prices randomly to simulate live feed
    const interval = setInterval(() => {
      const indexToUpdate = Math.floor(Math.random() * items.length);
      const isUp = Math.random() > 0.4;
      const changeAmount = (Math.random() * 0.15).toFixed(2);
      
      setItems((prev) => {
        const next = [...prev];
        const item = next[indexToUpdate];
        const valNum = parseFloat(item.value.replace(/,/g, ''));
        const newVal = isUp 
          ? (valNum * (1 + parseFloat(changeAmount) / 100)).toFixed(2)
          : (valNum * (1 - parseFloat(changeAmount) / 100)).toFixed(2);
        
        // Format with commas if large
        const formattedVal = parseFloat(newVal).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        next[indexToUpdate] = {
          ...item,
          value: formattedVal,
          change: `${isUp ? '+' : '-'}${changeAmount}%`,
          isPositive: isUp,
        };
        return next;
      });

      // Set flash state
      setFlashIndices((prev) => ({
        ...prev,
        [indexToUpdate]: isUp ? 'up' : 'down',
      }));

      // Clear flash state after 1.5 seconds
      setTimeout(() => {
        setFlashIndices((prev) => {
          const next = { ...prev };
          delete next[indexToUpdate];
          return next;
        });
      }, 1500);

    }, 3000);

    return () => clearInterval(interval);
  }, [items.length]);

  // Double items array for infinite looping scroll
  const doubleItems = [...items, ...items];

  return (
    <div className="h-8 bg-black border-t border-zinc-800 text-zinc-400 font-mono text-[11px] flex items-center overflow-hidden shrink-0 z-30 select-none">
      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-ticker {
          display: flex;
          width: max-content;
          animation: ticker-scroll 35s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="animate-ticker">
        {doubleItems.map((item, idx) => {
          const itemIdx = idx % items.length;
          const flash = flashIndices[itemIdx];
          let flashClass = '';
          if (flash === 'up') flashClass = 'bg-emerald-950 text-emerald-400 font-bold transition-all';
          if (flash === 'down') flashClass = 'bg-rose-950 text-rose-400 font-bold transition-all';

          return (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-6 border-r border-zinc-900 py-1.5 whitespace-nowrap cursor-pointer hover:bg-zinc-900 transition-colors duration-150 ${flashClass}`}
            >
              <span className="text-zinc-350 font-semibold">{item.name}</span>
              <span className="text-white font-medium">{item.value}</span>
              <span className={`flex items-center gap-0.5 font-bold ${
                item.isPositive ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {item.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {item.change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TickerTape;
