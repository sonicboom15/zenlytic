import React from 'react';
import { useAuth, useTenant } from '../hooks';
import { Building2, Shield } from 'lucide-react';

export const TenantSwitcher: React.FC = () => {
  const { isSuperAdmin, userTenantId } = useAuth();
  const { activeTenantId, tenantName, tenantTier, availableTenants, loadingTenants, switchTenant } = useTenant();

  const currentOrg = availableTenants.find((t) => t.tenantId === activeTenantId);
  const displayName = currentOrg?.name || tenantName || activeTenantId;
  const displayTier = currentOrg?.tier || tenantTier || 'ENTERPRISE';

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs shadow-sm">
        <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
          <Building2 className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 tracking-tight text-xs">{displayName}</span>
          <span className="text-[10px] font-mono text-slate-500">{userTenantId}</span>
        </div>
        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
          {displayTier}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs shadow-sm hover:border-slate-300 transition">
      <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
        <Building2 className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">{displayName}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            {displayTier}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
          <Shield className="w-3 h-3 text-emerald-600" />
          <select
            value={activeTenantId}
            onChange={(e) => {
              const selected = availableTenants.find((t) => t.tenantId === e.target.value);
              switchTenant(e.target.value, selected?.name);
            }}
            disabled={loadingTenants}
            aria-label="Active Tenant Workspace"
            className="bg-transparent border-none text-slate-600 font-medium focus:ring-0 p-0 text-[10px] cursor-pointer outline-none"
          >
            <option value="default">default (System Root)</option>
            {availableTenants.map((t) => (
              <option key={t.tenantId} value={t.tenantId}>
                {t.name} ({t.tenantId})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
