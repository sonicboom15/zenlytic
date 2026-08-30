import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineDb } from '../utils/offlineDb';
import { syncEngine, SyncResult } from '../utils/syncEngine';

interface NetworkContextType {
  isOnline: boolean;
  queuedCount: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  triggerSync: () => Promise<SyncResult>;
  refreshQueuedCount: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [queuedCount, setQueuedCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const refreshQueuedCount = useCallback(async () => {
    try {
      const orders = await offlineDb.getQueuedOrders();
      setQueuedCount(orders.length);
    } catch (e) {
      console.warn('Failed to inspect offline orders store', e);
    }
  }, []);

  const triggerSync = useCallback(async (): Promise<SyncResult> => {
    if (isSyncing || !navigator.onLine) {
      return { total: 0, synced: 0, failed: 0, errors: [] };
    }

    setIsSyncing(true);
    try {
      const res = await syncEngine.syncPendingOrders();
      setLastSyncTime(new Date());
      await refreshQueuedCount();
      return res;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshQueuedCount]);

  useEffect(() => {
    refreshQueuedCount();

    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync when reconnecting to network
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check on queued items
    const interval = setInterval(refreshQueuedCount, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [triggerSync, refreshQueuedCount]);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        queuedCount,
        isSyncing,
        lastSyncTime,
        triggerSync,
        refreshQueuedCount,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

