import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { OfflineBanner } from '../components/OfflineBanner';
import {
  ShoppingCart,
  Receipt,
  Users,
  Package,
  Menu,
  CloudUpload,
  LogOut,
  Building2
} from 'lucide-react';

interface MobileLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
}) => {
  const { userTenantId, logout } = useAuth();
  const { queuedCount } = useNetwork();

  const tabs = [
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'orders', label: 'Orders', icon: Receipt },
    { id: 'customers', label: 'Clients', icon: Users },
    { id: 'products', label: 'Catalog', icon: Package },
    { id: 'outbox', label: 'Outbox', icon: CloudUpload, badge: queuedCount > 0 ? queuedCount : undefined },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20">
      <OfflineBanner />

      {/* Top Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm">
            Z
          </div>
          <span className="font-bold text-sm tracking-tight text-white">ZENLYTIC</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-emerald-400">
            {userTenantId}
          </span>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-400 p-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-4">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around px-2 z-40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 py-1 rounded-xl transition ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

