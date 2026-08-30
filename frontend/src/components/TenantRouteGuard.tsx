import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface TenantRouteGuardProps {
  requiredTenantId?: string;
  children: React.ReactNode;
}

export const TenantRouteGuard: React.FC<TenantRouteGuardProps> = ({ requiredTenantId, children }) => {
  const { isSuperAdmin, userTenantId } = useAuth();

  // If a specific tenant is required and user is not super-admin and doesn't belong to it
  if (requiredTenantId && !isSuperAdmin && requiredTenantId !== userTenantId) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-lg">
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3.5 border border-rose-200">
            <ShieldAlert className="w-7 h-7 text-rose-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Cross-Tenant Access Restricted</h2>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Your user account is securely scoped to tenant <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">[{userTenantId}]</span>.
            Access to tenant <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">[{requiredTenantId}]</span> is denied by multi-tenant security isolation policies.
          </p>
          <div className="text-[11px] text-rose-700 font-mono">
            Error: 403_TENANT_SECURITY_ISOLATION_VIOLATION
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
