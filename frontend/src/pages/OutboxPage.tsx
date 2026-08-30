import React, { useEffect, useState } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { offlineDb } from '../utils/offlineDb';
import { OfflineOrderDraft } from '../types/order';
import {
  CloudUpload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  Receipt,
  Loader2
} from 'lucide-react';

export const OutboxPage: React.FC = () => {
  const { isOnline, isSyncing, triggerSync, refreshQueuedCount } = useNetwork();
  const [drafts, setDrafts] = useState<OfflineOrderDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const list = await offlineDb.getQueuedOrders();
      setDrafts(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleSyncNow = async () => {
    setSyncStatusMsg(null);
    const res = await triggerSync();
    if (res.total > 0) {
      setSyncStatusMsg(`Sync completed! ${res.synced} succeeded, ${res.failed} failed.`);
    } else {
      setSyncStatusMsg('No pending orders in local outbox.');
    }
    loadDrafts();
  };

  const handleDeleteDraft = async (localId: string) => {
    if (confirm('Are you sure you want to discard this offline order draft?')) {
      await offlineDb.deleteDraftOrder(localId);
      await refreshQueuedCount();
      loadDrafts();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-amber-400" />
            <span>Local Offline Outbox Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Encrypted client-side storage for orders placed in low network dead zones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing || drafts.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/30"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync All Pending'}</span>
          </button>
        </div>
      </div>

      {syncStatusMsg && (
        <div className="bg-slate-900 border border-slate-700 text-slate-200 text-xs p-4 rounded-2xl flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Network Status Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-bold text-xs text-white">
              Device Status: {isOnline ? 'Online (Ready for Background Sync)' : 'Offline (Buffering Locally)'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Outbox Queue: {drafts.length} item(s) stored in device IndexedDB
            </div>
          </div>
        </div>
      </div>

      {/* Outbox Items List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Local Draft ID</th>
                <th className="px-4 py-3">Client Account</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Total Due</th>
                <th className="px-4 py-3">Sync Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    Reading IndexedDB outbox...
                  </td>
                </tr>
              ) : drafts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    Outbox is clear! All orders are fully synchronized with the backend.
                  </td>
                </tr>
              ) : (
                drafts.map((d) => (
                  <tr key={d.localId} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-white font-bold">{d.localId}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{d.idempotencyKey}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200">
                      {d.customerName || 'Direct Customer'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {d.items.length} line item(s)
                    </td>
                    <td className="px-4 py-3.5 font-mono text-emerald-400 font-semibold">
                      {d.discountPercentage}%
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-white">
                      ${Number(d.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          d.syncStatus === 'SYNCING'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : d.syncStatus === 'FAILED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {d.syncStatus === 'SYNCING' && <RefreshCw className="w-3 h-3 animate-spin" />}
                        {d.syncStatus === 'FAILED' && <AlertTriangle className="w-3 h-3" />}
                        {d.syncStatus === 'QUEUED' && <Clock className="w-3 h-3" />}
                        <span>{d.syncStatus}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteDraft(d.localId)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

