import React, { useEffect, useState } from 'react';
import { useNetwork, useToast } from '../hooks';
import { offlineDb } from '../utils/offlineDb';
import { OfflineOrderDraft } from '../types/order';
import {
  Button,
  Card,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableLoadingState,
  TableEmptyState,
} from '../components/ui';
import {
  CloudUpload,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const OutboxPage: React.FC = () => {
  const { isOnline, isSyncing, triggerSync, refreshQueuedCount } = useNetwork();
  const { success, info } = useToast();

  const [drafts, setDrafts] = useState<OfflineOrderDraft[]>([]);
  const [loading, setLoading] = useState(true);

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
    const res = await triggerSync();
    if (res.total > 0) {
      success('Sync Complete', `${res.synced} order(s) submitted to Saga engine, ${res.failed} failed.`);
    } else {
      info('Outbox Empty', 'No pending orders in local outbox.');
    }
    loadDrafts();
  };

  const handleDeleteDraft = async (localId: string) => {
    await offlineDb.deleteDraftOrder(localId);
    await refreshQueuedCount();
    loadDrafts();
    info('Draft Discarded', `Offline order draft ${localId} removed.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-blue-600" />
            <span>Offline Outbox Queue</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Orders saved locally while offline. Syncs automatically upon reconnection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            loading={isSyncing}
            disabled={drafts.length === 0}
            onClick={handleSyncNow}
            icon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
          >
            {isSyncing ? 'Synchronizing...' : 'Sync All Pending'}
          </Button>
        </div>
      </div>

      {/* Network Status Card */}
      <Card className="p-5">
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-lg ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-900">
              Device Status: {isOnline ? 'Connected (Ready for sync)' : 'Offline (Buffering locally)'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Outbox Queue: {drafts.length} item(s) pending sync
            </div>
          </div>
        </div>
      </Card>

      {/* Outbox Items List */}
      <Card>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Local Draft ID</TableHead>
              <TableHead>Client Account</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Total Due</TableHead>
              <TableHead>Sync Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableLoadingState colSpan={7} message="Reading IndexedDB outbox..." />
            ) : drafts.length === 0 ? (
              <TableEmptyState
                colSpan={7}
                message="Outbox is clear! All orders are fully synchronized with the backend."
              />
            ) : (
              drafts.map((d) => (
                <TableRow key={d.localId}>
                  <TableCell>
                    <div className="font-mono text-slate-900 font-bold">{d.localId}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{d.idempotencyKey}</div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800">
                    {d.customerName || 'Direct Customer'}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {d.items.length} line item(s)
                  </TableCell>
                  <TableCell className="font-mono text-emerald-700 font-semibold">
                    {d.discountPercentage}%
                  </TableCell>
                  <TableCell className="font-mono font-bold text-slate-900">
                    ${Number(d.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        d.syncStatus === 'SYNCING'
                          ? 'info'
                          : d.syncStatus === 'FAILED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {d.syncStatus === 'SYNCING' && <RefreshCw className="w-3 h-3 animate-spin" />}
                      {d.syncStatus === 'FAILED' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      {d.syncStatus === 'QUEUED' && <Clock className="w-3 h-3 text-amber-600" />}
                      <span>{d.syncStatus}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleDeleteDraft(d.localId)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Discard Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
