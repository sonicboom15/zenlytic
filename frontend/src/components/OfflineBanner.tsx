import React from 'react';
import { useNetwork } from '../context/NetworkContext';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, queuedCount, isSyncing, triggerSync } = useNetwork();

  if (isOnline && queuedCount === 0) {
    return null;
  }

  return (
    <div
      className={`w-full px-4 py-2.5 transition-all flex flex-wrap items-center justify-between text-xs font-medium ${
        !isOnline
          ? 'bg-amber-500/15 border-b border-amber-500/30 text-amber-200'
          : 'bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              <strong>Offline Mode Active:</strong> Orders will be safely stored in your local encrypted outbox.
            </span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Online:</strong> Connection restored. {queuedCount} offline order(s) pending sync.
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {queuedCount > 0 && (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
            {queuedCount} queued
          </span>
        )}

        {isOnline && queuedCount > 0 && (
          <button
            onClick={() => triggerSync()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1 rounded-md font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>
    </div>
  );
};

