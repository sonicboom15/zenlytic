import React, { useState } from 'react';
import { useCommerce } from '../hooks';
import { SagaTimelineVisualizer } from '../components/SagaTimelineVisualizer';
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
  Modal,
  Select,
  SearchInput,
} from '../components/ui';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Loader2,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const {
    orders,
    loadingOrders,
    selectedOrder,
    sagaTimeline,
    loadingTimeline,
    inspectSagaTimeline,
    clearSelectedOrder,
  } = useCommerce();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span>Orders & Distributed Saga Timeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track sales order fulfillment status, line items, and audit history.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by order ID or customer name..."
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter orders by status"
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'CONFIRMED', label: 'CONFIRMED' },
              { value: 'PENDING', label: 'PENDING' },
              { value: 'FAILED', label: 'FAILED' },
              { value: 'CANCELLED', label: 'CANCELLED' },
            ]}
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer / B2B Client</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {loadingOrders ? (
              <TableLoadingState colSpan={7} message="Loading orders..." />
            ) : filteredOrders.length === 0 ? (
              <TableEmptyState colSpan={7} message="No orders found." />
            ) : (
              filteredOrders.map((o) => {
                const isConfirmed = o.status === 'CONFIRMED';
                const isFailed = o.status === 'FAILED' || o.status === 'CANCELLED';

                return (
                  <TableRow key={o.orderId}>
                    <TableCell>
                      <div className="font-bold text-slate-900 font-mono">{o.orderId}</div>
                      <div className="text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{o.customerName || 'Direct Customer'}</div>
                      {o.customerId && <div className="text-[10px] text-slate-400 font-mono">{o.customerId}</div>}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {o.items ? o.items.length : 0} line(s)
                    </TableCell>
                    <TableCell className="font-mono text-emerald-700 font-semibold">
                      {o.discountPercentage ? `${o.discountPercentage}%` : '0%'}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-slate-900">
                      ${Number(o.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isConfirmed ? 'success' : isFailed ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {isConfirmed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {isFailed && <XCircle className="w-3 h-3 text-rose-600" />}
                        {!isConfirmed && !isFailed && <Clock className="w-3 h-3 text-amber-600 animate-spin" />}
                        <span>{o.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => inspectSagaTimeline(o)}
                      >
                        Timeline
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Saga Timeline Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={clearSelectedOrder}
          title="Order Details & Saga Orchestrator"
          description={`Order: ${selectedOrder.orderId}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-700 mb-2">Order Line Items:</div>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-700 font-mono">
                  <span>
                    {item.quantity}x {item.productName} ({item.sku})
                  </span>
                  <span className="font-semibold">${(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-blue-700 font-mono">${Number(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {loadingTimeline ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                Querying Saga Execution Audit Log...
              </div>
            ) : sagaTimeline ? (
              <SagaTimelineVisualizer timeline={sagaTimeline} />
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800">4-Step Distributed Saga Execution Pipeline:</div>
                <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                  <div className="text-emerald-700">1. CreatePendingOrderStep (status: SUCCESS)</div>
                  <div className="text-emerald-700">2. ReserveInventoryStep (status: SUCCESS)</div>
                  <div className="text-emerald-700">3. ProcessPaymentStep (status: SUCCESS)</div>
                  <div className="text-emerald-700">4. ConfirmOrderStep (status: SUCCESS)</div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
