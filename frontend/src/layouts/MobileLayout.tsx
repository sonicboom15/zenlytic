import React from 'react';
import { useAuth, useTenant, useNetwork, useNavigation } from '../hooks';
import { OfflineBanner } from '../components/OfflineBanner';
import {
  ShoppingCart,
  Receipt,
  Users,
  Package,
  LayoutDashboard,
  CloudUpload,
  LogOut,
} from 'lucide-react';

interface MobileLayoutProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  currentTab: propTab,
  onSelectTab: propOnSelectTab,
  children,
}) => {
  const { userTenantId, logout } = useAuth();
  const { tenantName } = useTenant();
  const { queuedCount } = useNetwork();
  const navigationContext = useNavigation();

  const currentTab = propTab || navigationContext.currentTab;
  const onSelectTab = propOnSelectTab || navigationContext.navigateTo;

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'orders', label: 'Orders', icon: Receipt },
    { id: 'customers', label: 'Clients', icon: Users },
    { id: 'products', label: 'Catalog', icon: Package },
    { id: 'outbox', label: 'Outbox', icon: CloudUpload, badge: queuedCount > 0 ? queuedCount : undefined },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20">
      <OfflineBanner />

      {/* Top Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
            Z
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-tight text-slate-900 truncate max-w-[140px]">
              {tenantName || 'ZENLYTIC'}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">@{userTenantId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Sign Out"
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
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-2 z-40 shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-lg transition cursor-pointer ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 rounded-full">
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
