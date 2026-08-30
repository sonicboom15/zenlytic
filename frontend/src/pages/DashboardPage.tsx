import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { orderApi } from '../api/orderApi';
import { customerApi } from '../api/customerApi';
import { productApi } from '../api/productApi';
import {
  TrendingUp,
  Users,
  Package,
  Receipt,
  ShoppingCart,
  Wifi,
  WifiOff,
  CloudUpload,
  Server,
  Database,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { activeTenantId } = useAuth();
  const { isOnline, queuedCount } = useNetwork();

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [ordersRes, customersRes, productsRes] = await Promise.allSettled([
          orderApi.list({ size: 100 }),
          customerApi.list({ size: 100 }),
          productApi.list(0, 100),
        ]);

        let ordersCount = 0;
        let revenue = 0;
        if (ordersRes.status === 'fulfilled' && ordersRes.value) {
          const orders = ordersRes.value.content || [];
          ordersCount = ordersRes.value.totalElements || orders.length;
          revenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        }

        let customersCount = 0;
        if (customersRes.status === 'fulfilled' && customersRes.value) {
          customersCount = customersRes.value.totalElements || (customersRes.value.content || []).length;
        }

        let productsCount = 0;
        if (productsRes.status === 'fulfilled' && productsRes.value) {
          productsCount = productsRes.value.totalElements || (productsRes.value.content || []).length;
        }

        setStats({
          totalOrders: ordersCount,
          totalRevenue: revenue,
          totalCustomers: customersCount,
          totalProducts: productsCount,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activeTenantId]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Tenant Overview: <span className="font-mono text-emerald-400">[{activeTenantId}]</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant operations, B2B order orchestration, and offline sales sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/30"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Launch POS (Offline)</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Fulfillment Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
            <span>Orchestrated via Distributed Sagas</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Orders</span>
            <Receipt className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{stats.totalOrders}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Row-level tenant isolation</span>
          </div>
        </div>

        {/* B2B Customers */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>B2B Accounts</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{stats.totalCustomers}</div>
          <div className="text-[11px] text-sky-400/90 mt-1 flex items-center gap-1">
            <span>With Max Discount Boundaries</span>
          </div>
        </div>

        {/* Catalog SKU */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Active Products</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{stats.totalProducts}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Stock reservation enabled</span>
          </div>
        </div>
      </div>

      {/* Offline POS & Sync Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-xl ${!isOnline ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {!isOnline ? <WifiOff className="w-6 h-6" /> : <Wifi className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Offline Order Engine & Local Outbox</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sales representatives can capture orders in dead zones. Orders are queued locally with UUID idempotency and auto-synced upon reconnect.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300">
              {queuedCount} draft(s) in outbox
            </span>
            <button
              onClick={() => onNavigate('outbox')}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 px-3.5 py-1.5 rounded-xl transition"
            >
              <span>Inspect Outbox</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Architecture Infrastructure Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
          <Database className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold text-white">PostgreSQL Multi-Database</div>
            <div className="text-[11px] text-slate-400">auth_db, customer_db, product_db, order_db</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
          <Layers className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-xs font-bold text-white">Saga Orchestrator</div>
            <div className="text-[11px] text-slate-400">4-Step LIFO rollback & timeline audit</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
          <Server className="w-5 h-5 text-sky-400" />
          <div>
            <div className="text-xs font-bold text-white">Java 21 Virtual Threads</div>
            <div className="text-[11px] text-slate-400">Parallel Work Executor & Chunking</div>
          </div>
        </div>
      </div>
    </div>
  );
};

