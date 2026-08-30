import React from 'react';
import { useAuth, useNavigation } from '../hooks';
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
  ChevronRight,
} from 'lucide-react';

interface DesktopLayoutProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  children: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  currentTab: propTab,
  onSelectTab: propOnSelectTab,
  children,
}) => {
  const { userId, userEmail, userTenantId, roles, isSuperAdmin, logout } = useAuth();
  const navigationContext = useNavigation();

  const currentTab = propTab || navigationContext.currentTab;
  const onSelectTab = propOnSelectTab || navigationContext.navigateTo;

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

  // Derive user display name & initials
  const displayName = (userEmail && userEmail !== 'undefined')
    ? userEmail.split('@')[0]
    : (userId && userId !== 'undefined' ? userId : 'Administrator');
  const initials = displayName.substring(0, 2).toUpperCase();
  const primaryRole = roles.includes('ROLE_SUPER_ADMIN')
    ? 'SUPER ADMIN'
    : roles.includes('ROLE_ADMIN')
    ? 'ADMIN'
    : 'OPERATOR';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <OfflineBanner />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-5 px-3 select-none">
          <div>
            {/* Brand Header */}
            <div className="px-3 pb-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
                Z
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-slate-900">ZENLYTIC</h1>
                <p className="text-[10px] text-slate-500 font-medium">B2B Commerce & ERP</p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="mt-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-xs'
                        : item.highlight
                        ? 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="pt-4 border-t border-slate-100 px-2">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-slate-800 text-xs truncate capitalize">
                    {displayName}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-mono text-slate-500 truncate">
                      @{userTenantId || 'default'}
                    </span>
                    <span className="text-[8px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded uppercase">
                      {primaryRole}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-slate-50 overflow-x-hidden">
          {/* Top Bar */}
          <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Workspace</span>
              <span>/</span>
              <span className="font-semibold text-slate-800 capitalize text-sm">
                {currentTab.replace('-', ' ')}
              </span>
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
