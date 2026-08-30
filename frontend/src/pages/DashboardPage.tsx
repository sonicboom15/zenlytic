import React, { useState } from 'react';
import { useCommerce, useTenant, useNavigation, useNetwork, useToast } from '../hooks';
import { CustomerCreateRequest, Customer } from '../types/customer';
import { SagaTimelineVisualizer } from '../components/SagaTimelineVisualizer';
import { BatchImportModal } from '../components/BatchImportModal';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  TableLoadingState,
  KpiStatCard,
  Modal,
  Input,
  Select,
} from '../components/ui';
import {
  TrendingUp,
  Receipt,
  Users,
  Package,
  ShoppingCart,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Wifi,
  WifiOff,
  AlertCircle,
  Building2,
  Percent,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate?: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate: propOnNavigate }) => {
  const { navigateTo } = useNavigation();
  const onNavigate = propOnNavigate || navigateTo;

  const { tenantName, activeTenantId, tenantTier } = useTenant();
  const { isOnline, queuedCount, isSyncing, triggerSync } = useNetwork();
  const { success, error, info } = useToast();

  const {
    products,
    customers,
    orders,
    loadingOrders,
    kpis,
    createCustomer,
    batchCreateCustomers,
    selectedOrder,
    inspectSagaTimeline,
    clearSelectedOrder,
  } = useCommerce();

  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Form State
  const [customerForm, setCustomerForm] = useState<CustomerCreateRequest>({
    name: '',
    code: '',
    companyName: '',
    email: '',
    creditLimit: 10000,
    maxDiscountPercentage: 15,
    tier: 'STANDARD',
    status: 'ACTIVE',
  });

  // Computed Business Metrics
  const avgOrderValue = orders.length > 0 ? kpis.revenue / orders.length : 0;
  const confirmedOrdersCount = orders.filter((o) => o.status === 'CONFIRMED').length;
  const fulfillmentRate = orders.length > 0 ? Math.round((confirmedOrdersCount / orders.length) * 100) : 100;
  const totalCreditAllocated = customers.reduce((sum, c) => sum + (Number(c.creditLimit) || 0), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity < 10).length;

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCustomer(true);
    try {
      await createCustomer(customerForm);
      setIsAddCustomerModalOpen(false);
      setCustomerForm({
        name: '',
        code: '',
        companyName: '',
        email: '',
        creditLimit: 10000,
        maxDiscountPercentage: 15,
        tier: 'STANDARD',
        status: 'ACTIVE',
      });
      success('Customer Created', 'B2B account added successfully.');
    } catch (err: any) {
      error('Failed to create customer', err.response?.data?.message || err.message);
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleSyncOutbox = async () => {
    const res = await triggerSync();
    if (res.total > 0) {
      success('Sync Complete', `${res.synced} offline order(s) processed.`);
    } else {
      info('Outbox Empty', 'All orders are synchronized.');
    }
  };

  const sampleBatchCustomers = JSON.stringify(
    [
      {
        name: 'Apex Global Industries',
        code: 'APEX-01',
        companyName: 'Apex Corp LLC',
        email: 'orders@apex.com',
        creditLimit: 25000,
        maxDiscountPercentage: 20,
        tier: 'PLATINUM',
        status: 'ACTIVE',
      },
    ],
    null,
    2
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{tenantName}</h2>
            <Badge variant="info" size="sm">
              {tenantTier} TIER
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tenant Overview: <span className="font-mono text-slate-700 font-semibold">[{activeTenantId}]</span> • Executive sales summary, B2B account governance, and operations stream.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            icon={<ShoppingCart className="w-4 h-4" />}
            onClick={() => onNavigate('pos')}
          >
            Launch POS (Offline)
          </Button>

          <Button
            variant="secondary"
            icon={<Plus className="w-4 h-4 text-slate-500" />}
            onClick={() => setIsAddCustomerModalOpen(true)}
          >
            Add Client
          </Button>

          <Button
            variant="secondary"
            icon={<FileSpreadsheet className="w-4 h-4 text-slate-500" />}
            onClick={() => setIsBatchModalOpen(true)}
          >
            Batch Import
          </Button>
        </div>
      </div>

      {/* 4 High-Signal Business KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          label="Total Revenue"
          value={`$${kpis.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext={`Avg Order: $${avgOrderValue.toFixed(2)}`}
          icon={<TrendingUp className="w-4 h-4" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-700"
          trend={{ value: '+14.2%', isPositive: true }}
        />

        <KpiStatCard
          label="Orders Fulfilled"
          value={kpis.totalOrders}
          subtext={`${fulfillmentRate}% fulfillment success rate`}
          icon={<Receipt className="w-4 h-4" />}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-700"
        />

        <KpiStatCard
          label="B2B Client Accounts"
          value={kpis.b2bAccounts}
          subtext={`$${totalCreditAllocated.toLocaleString()} credit line active`}
          icon={<Users className="w-4 h-4" />}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-700"
        />

        <KpiStatCard
          label="Catalog Products"
          value={kpis.activeProducts}
          subtext={lowStockCount > 0 ? `${lowStockCount} low stock alerts` : 'All items in stock'}
          icon={<Package className="w-4 h-4" />}
          iconBgColor={lowStockCount > 0 ? 'bg-amber-50' : 'bg-indigo-50'}
          iconColor={lowStockCount > 0 ? 'text-amber-700' : 'text-indigo-700'}
        />
      </div>

      {/* Operations & Clients Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Live Order Ledger */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>Recent Transactions & Fulfillments</span>
              </CardTitle>
              <Button variant="ghost" size="xs" onClick={() => onNavigate('orders')}>
                View All Orders ↗
              </Button>
            </CardHeader>

            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Audit</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {loadingOrders ? (
                  <TableLoadingState colSpan={5} message="Loading transactions..." />
                ) : orders.length === 0 ? (
                  <TableEmptyState colSpan={5} message="No transactions recorded yet." />
                ) : (
                  orders.slice(0, 5).map((order) => {
                    const isConfirmed = order.status === 'CONFIRMED';
                    const isFailed = order.status === 'FAILED' || order.status === 'CANCELLED';

                    return (
                      <TableRow key={order.orderId}>
                        <TableCell>
                          <div className="font-bold text-slate-900 font-mono">{order.orderId}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-800">{order.customerName || 'Direct Customer'}</div>
                          <div className="text-[10px] text-slate-500">
                            {order.items ? order.items.length : 1} line item(s)
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold font-mono text-slate-900">
                            ${Number(order.totalAmount).toFixed(2)}
                          </div>
                          {Boolean(order.discountPercentage && order.discountPercentage > 0) && (
                            <div className="text-[10px] text-emerald-700 font-mono">
                              (-{order.discountPercentage}%)
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isConfirmed ? 'success' : isFailed ? 'danger' : 'warning'}
                            size="sm"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => inspectSagaTimeline(order)}
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

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Showing latest {Math.min(orders.length, 5)} transactions</span>
              <button
                onClick={() => onNavigate('pos')}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                + New Order
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column (1/3): Corporate Client Accounts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>B2B Client Accounts</span>
              </CardTitle>
              <Button variant="ghost" size="xs" onClick={() => onNavigate('customers')}>
                Directory ↗
              </Button>
            </CardHeader>

            <div className="p-4 space-y-3">
              {customers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No B2B accounts registered yet.
                </div>
              ) : (
                customers.slice(0, 4).map((c) => (
                  <div
                    key={c.customerId}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-xs truncate max-w-[140px]">{c.name}</div>
                      <Badge variant={c.tier === 'PLATINUM' ? 'purple' : c.tier === 'GOLD' ? 'warning' : 'neutral'}>
                        {c.tier}
                      </Badge>
                    </div>
                    {c.companyName && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">• {c.companyName}</div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-600">
                        Credit Line: <strong className="text-slate-900 font-mono">${Number(c.creditLimit).toLocaleString()}</strong>
                      </span>
                      <span className="text-emerald-700 font-semibold font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Max Disc: {c.maxDiscountPercentage}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
              <span className="text-slate-500">Tier-based discount rules</span>
              <button
                onClick={() => onNavigate('customers')}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Manage Accounts
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Operational Pulse Row (Crisp & High-Signal) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Terminal Connectivity & Outbox Sync */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-slate-900">Terminal Connectivity</h4>
                  <Badge variant={isOnline ? 'success' : 'warning'} size="sm">
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {queuedCount > 0
                    ? `${queuedCount} order draft(s) buffered in outbox`
                    : 'All offline drafts synced to server'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {queuedCount > 0 && (
                <Button
                  variant="secondary"
                  size="xs"
                  loading={isSyncing}
                  onClick={handleSyncOutbox}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Sync Now
                </Button>
              )}
              <Button variant="ghost" size="xs" onClick={() => onNavigate('outbox')}>
                Outbox ↗
              </Button>
            </div>
          </div>
        </Card>

        {/* Inventory Summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-slate-900">Inventory Status</h4>
                  <Badge variant="neutral" size="sm">
                    {products.length} SKUs Active
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lowStockCount > 0
                    ? `${lowStockCount} item(s) below threshold`
                    : 'Stock levels healthy across catalog'}
                </p>
              </div>
            </div>

            <Button variant="ghost" size="xs" onClick={() => onNavigate('products')}>
              Catalog ↗
            </Button>
          </div>
        </Card>
      </div>

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

            <SagaTimelineVisualizer orderId={selectedOrder.sagaId || selectedOrder.orderId} />
          </div>
        </Modal>
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        title="Create New B2B Customer Account"
        icon={<Building2 className="w-5 h-5" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={savingCustomer} onClick={handleCreateCustomer}>
              Save Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Customer / Client Name *"
              required
              value={customerForm.name}
              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              placeholder="Apex Global Industries"
            />
            <Input
              label="Account Code *"
              required
              mono
              value={customerForm.code}
              onChange={(e) => setCustomerForm({ ...customerForm, code: e.target.value })}
              placeholder="APEX-01"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company Entity"
              value={customerForm.companyName}
              onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
              placeholder="Apex Corp LLC"
            />
            <Input
              label="Email"
              type="email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              placeholder="orders@apex.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Max Discount Limit (%) *"
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              value={customerForm.maxDiscountPercentage}
              onChange={(e) =>
                setCustomerForm({ ...customerForm, maxDiscountPercentage: parseFloat(e.target.value) || 0 })
              }
              rightIcon={<Percent className="w-3.5 h-3.5 text-blue-600" />}
            />
            <Input
              label="Credit Limit ($)"
              type="number"
              min="0"
              mono
              value={customerForm.creditLimit}
              onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: parseFloat(e.target.value) || 0 })}
              rightIcon={<CreditCard className="w-3.5 h-3.5 text-blue-600" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Account Tier"
              value={customerForm.tier}
              onChange={(e) => setCustomerForm({ ...customerForm, tier: e.target.value })}
              options={[
                { value: 'STANDARD', label: 'Standard' },
                { value: 'GOLD', label: 'Gold' },
                { value: 'PLATINUM', label: 'Platinum VIP' },
              ]}
            />
            <Select
              label="Status"
              value={customerForm.status}
              onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'SUSPENDED', label: 'Suspended' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Batch Import Modal */}
      <BatchImportModal<CustomerCreateRequest, Customer>
        title="Batch Import B2B Customers (Standard Chassis)"
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        sampleTemplate={sampleBatchCustomers}
        parseInput={(text) => JSON.parse(text)}
        onImport={(items) => batchCreateCustomers(items)}
        renderItemSummary={(c) => `${c.name} (${c.maxDiscountPercentage}% max disc)`}
      />
    </div>
  );
};
