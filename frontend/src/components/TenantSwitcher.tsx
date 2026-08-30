import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { Tenant } from '../types/auth';
import { Building2, ShieldCheck, Lock } from 'lucide-react';

export const TenantSwitcher: React.FC = () => {
  const { isSuperAdmin, activeTenantId, switchTenant, userTenantId } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      setLoading(true);
      authApi.listTenants()
        .then((data) => setTenants(data || []))
        .catch((e) => console.warn('Failed to load tenants list', e))
        .finally(() => setLoading(false));
    }
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300">
        <Lock className="w-3.5 h-3.5 text-emerald-400" />
        <span>Tenant: <strong className="text-white font-mono">{userTenantId}</strong></span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-slate-800/90 border border-indigo-500/40 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 shadow-sm">
      <ShieldCheck className="w-4 h-4 text-indigo-400" />
      <span className="text-indigo-300 font-semibold">Tenant:</span>
      <select
        value={activeTenantId}
        onChange={(e) => switchTenant(e.target.value)}
        disabled={loading}
        aria-label="Active Tenant"
        className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-0.5 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
      >
        <option value="default">default (Primary)</option>
        {tenants.map((t) => (
          <option key={t.tenantId} value={t.tenantId}>
            {t.name} ({t.tenantId})
          </option>
        ))}
      </select>
    </div>
  );
};

