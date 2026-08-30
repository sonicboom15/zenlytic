import { offlineDb } from './offlineDb';
import { orderApi } from '../api/orderApi';
import { OfflineOrderDraft } from '../types/order';

export interface SyncResult {
  total: number;
  synced: number;
  failed: number;
  errors: { localId: string; error: string }[];
}

export const syncEngine = {
  syncPendingOrders: async (onProgress?: (synced: number, total: number) => void): Promise<SyncResult> => {
    const queued = await offlineDb.getQueuedOrders();
    const pending = queued.filter((o) => o.syncStatus === 'QUEUED' || o.syncStatus === 'FAILED');

    if (pending.length === 0) {
      return { total: 0, synced: 0, failed: 0, errors: [] };
    }

    let syncedCount = 0;
    let failedCount = 0;
    const errors: { localId: string; error: string }[] = [];

    for (let i = 0; i < pending.length; i++) {
      const order = pending[i];
      try {
        order.syncStatus = 'SYNCING';
        await offlineDb.saveDraftOrder(order);

        // Submit to Distributed Order Saga via API Gateway
        await orderApi.placeOrder({
          items: order.items,
          idempotencyKey: order.idempotencyKey,
          customerId: order.customerId,
          customerName: order.customerName,
          discountPercentage: order.discountPercentage,
        });

        // Mark as synced or remove from local outbox
        await offlineDb.deleteDraftOrder(order.localId);
        syncedCount++;
      } catch (err: any) {
        failedCount++;
        const errMsg = err.response?.data?.message || err.message || 'Unknown network error';
        order.syncStatus = 'FAILED';
        order.errorMessage = errMsg;
        await offlineDb.saveDraftOrder(order);
        errors.push({ localId: order.localId, error: errMsg });
      }

      if (onProgress) {
        onProgress(i + 1, pending.length);
      }
    }

    return {
      total: pending.length,
      synced: syncedCount,
      failed: failedCount,
      errors,
    };
  }
};

