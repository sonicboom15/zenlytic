import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TenantSwitcher } from '../components/TenantSwitcher';
import { OfflineBanner } from '../components/OfflineBanner';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  CloudUpload,
  UserCheck,
  Building2,
  LogOut,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface DesktopLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
}) => {
  const { userId, userTenantId, isSuperAdmin, logout } = useAuth();

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS / New Order', icon: ShoppingCart, highlight: true },
    { id: 'customers', label: 'Customers (B2B)', icon: Users },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'orders', label: 'Orders & Sagas', icon: Receipt },
    { id: 'outbox', label: 'Offline Outbox', icon: CloudUpload },
    { id: 'users', label: 'Team & RBAC', icon: UserCheck },
    ...(isSuperAdmin ? [{ id: 'tenants', label: 'Tenants Manager', icon: Building2 }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <OfflineBanner />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between py-5 px-3">
          <div>
            {/* Brand Logo */}
            <div className="px-3 pb-6 border-b border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
                Z
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white">ZENLYTIC</h1>
                <p className="text-[10px] text-slate-400 font-mono">Enterprise Suite</p>
              </div>
            </div>

            {/* Nav links */}
            <nav className="mt-5 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : item.highlight
                        ? 'bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50 border border-indigo-800/40'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile & logout */}
          <div className="pt-4 border-t border-slate-800 px-2 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="truncate">
                <div className="font-semibold text-slate-200 truncate">{userId || 'User'}</div>
                <div className="text-[10px] font-mono text-slate-500 truncate">@{userTenantId}</div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-slate-950 overflow-x-hidden">
          {/* Top Bar */}
          <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between">
            <div className="text-sm font-bold text-white capitalize">
              {currentTab.replace('-', ' ')}
            </div>

            <div className="flex items-center gap-4">
              <TenantSwitcher />
            </div>
          </header>

          {/* Page Body */}
          <div className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

