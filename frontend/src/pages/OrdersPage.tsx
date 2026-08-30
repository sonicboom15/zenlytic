import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/orderApi';
import { Order, SagaTimeline } from '../types/order';
import { SagaTimelineVisualizer } from '../components/SagaTimelineVisualizer';
import {
  Receipt,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Loader2,
  ChevronRight,
  RotateCcw,
  X
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { activeTenantId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sagaTimeline, setSagaTimeline] = useState<SagaTimeline | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.list({
        search,
        status: statusFilter || undefined,
        size: 50,
      });
      setOrders(res.content || []);
    } catch (e) {
      console.warn('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTenantId, search, statusFilter]);

  const handleInspectSaga = async (order: Order) => {
    setSelectedOrder(order);
    setSagaTimeline(null);

    // If order has sagaId or orderId, try to load saga timeline
    const lookupId = order.sagaId || order.orderId;
    if (lookupId) {
      setLoadingTimeline(true);
      try {
        const timeline = await orderApi.getSagaTimeline(lookupId);
        setSagaTimeline(timeline);
      } catch (e) {
        console.warn('Saga timeline lookup failed for', lookupId, e);
      } finally {
        setLoadingTimeline(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <span>Orders & Distributed Saga Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track multi-tenant order fulfillment and inspect 4-step distributed transaction lifecycles.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 px-3.5">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer name..."
            className="bg-transparent text-xs text-white placeholder-slate-500 w-full outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter orders by status"
          className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-4 py-3">Customer / B2B Client</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isConfirmed = o.status === 'CONFIRMED';
                  const isFailed = o.status === 'FAILED' || o.status === 'CANCELLED';

                  return (
                    <tr key={o.orderId} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white font-mono">{o.orderId}</div>
                        <div className="text-[10px] text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-200">{o.customerName || 'Direct Customer'}</div>
                        {o.customerId && <div className="text-[10px] text-slate-500 font-mono">{o.customerId}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {o.items ? o.items.length : 0} line(s)
                      </td>
                      <td className="px-4 py-3.5 font-mono text-emerald-400 font-semibold">
                        {o.discountPercentage ? `${o.discountPercentage}%` : '0%'}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        ${Number(o.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isConfirmed
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : isFailed
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          }`}
                        >
                          {isConfirmed && <CheckCircle2 className="w-3 h-3" />}
                          {isFailed && <XCircle className="w-3 h-3" />}
                          {!isConfirmed && !isFailed && <Clock className="w-3 h-3 animate-spin" />}
                          <span>{o.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleInspectSaga(o)}
                          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg text-xs font-semibold ml-auto transition"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Timeline</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saga Timeline Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">Order Details & Saga Orchestrator</h3>
                <div className="text-xs font-mono text-slate-400">Order: {selectedOrder.orderId}</div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items summary */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-2 text-xs">
              <div className="font-bold text-slate-300 mb-2">Order Line Items:</div>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-300 font-mono">
                  <span>{item.quantity}x {item.productName} ({item.sku})</span>
                  <span>${(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                <span>Total Amount:</span>
                <span className="text-emerald-400 font-mono">${Number(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Saga Timeline */}
            {loadingTimeline ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                Querying Saga Execution Audit Log...
              </div>
            ) : sagaTimeline ? (
              <SagaTimelineVisualizer timeline={sagaTimeline} />
            ) : (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
                <div className="font-bold text-slate-300">4-Step Distributed Saga Execution Pipeline:</div>
                <div className="text-slate-400 space-y-1 font-mono text-[11px]">
                  <div>1. CreatePendingOrderStep (status: SUCCESS)</div>
                  <div>2. ReserveInventoryStep (status: SUCCESS)</div>
                  <div>3. ProcessPaymentStep (status: SUCCESS)</div>
                  <div>4. ConfirmOrderStep (status: SUCCESS)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

