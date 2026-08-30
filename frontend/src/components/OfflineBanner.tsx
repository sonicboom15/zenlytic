import React from 'react';
import { useNetwork } from '../context/NetworkContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, queuedCount, isSyncing, triggerSync } = useNetwork();

  if (isOnline && queuedCount === 0) {
    return null;
  }

  return (
    <div
      className={`w-full px-4 py-2.5 transition-all flex flex-wrap items-center justify-between text-xs font-medium border-b ${
        !isOnline
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>
              <strong>Offline Mode Active:</strong> Orders will be safely stored in your local encrypted outbox.
            </span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Online:</strong> Connection restored. {queuedCount} offline order(s) pending sync.
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {queuedCount > 0 && (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold">
            {queuedCount} queued
          </span>
        )}

        {isOnline && queuedCount > 0 && (
          <button
            onClick={() => triggerSync()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1 rounded-md font-semibold text-xs transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>
    </div>
  );
};
