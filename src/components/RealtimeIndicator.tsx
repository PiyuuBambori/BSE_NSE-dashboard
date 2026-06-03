import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const RealtimeIndicator: React.FC = () => {
  const connectionStatus = useDashboardStore((state) => state.connectionStatus);

  const statusConfig = {
    connected: {
      color: 'bg-emerald-500',
      glow: 'shadow-emerald-500/50',
      text: 'Live Feed Connected',
      icon: <Wifi className="h-4 w-4 text-emerald-400" />,
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    connecting: {
      color: 'bg-amber-500 animate-pulse',
      glow: 'shadow-amber-500/50',
      text: 'Connecting...',
      icon: <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />,
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    disconnected: {
      color: 'bg-rose-500',
      glow: 'shadow-rose-500/50',
      text: 'Disconnected',
      icon: <WifiOff className="h-4 w-4 text-rose-400" />,
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
  };

  const current = statusConfig[connectionStatus] || statusConfig.disconnected;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 ${current.badge} backdrop-blur-md`}
    >
      <div className="relative flex h-2 w-2">
        {connectionStatus === 'connected' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${current.color} shadow-sm ${current.glow}`}
        ></span>
      </div>
      <span className="flex items-center gap-1">
        {current.icon}
        {current.text}
      </span>
    </div>
  );
};
export default RealtimeIndicator;
