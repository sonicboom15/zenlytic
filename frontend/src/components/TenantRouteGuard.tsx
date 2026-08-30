import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface TenantRouteGuardProps {
  requiredTenantId?: string;
  children: React.ReactNode;
}

export const TenantRouteGuard: React.FC<TenantRouteGuardProps> = ({ requiredTenantId, children }) => {
  const { isSuperAdmin, userTenantId, activeTenantId } = useAuth();

  // If a specific tenant is required and user is not super-admin and doesn't belong to it
  if (requiredTenantId && !isSuperAdmin && requiredTenantId !== userTenantId) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 text-center shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-rose-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-700/50">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-rose-200 mb-2">Cross-Tenant Access Restricted</h2>
          <p className="text-sm text-rose-300/80 mb-4 leading-relaxed">
            Your user account is securely scoped to tenant <span className="font-mono font-semibold text-rose-100 bg-rose-900/60 px-2 py-0.5 rounded">[{userTenantId}]</span>.
            Access to tenant <span className="font-mono font-semibold text-rose-100 bg-rose-900/60 px-2 py-0.5 rounded">[{requiredTenantId}]</span> is denied by multi-tenant security isolation policies.
          </p>
          <div className="text-xs text-rose-400/60 font-mono">
            Error: 403_TENANT_SECURITY_ISOLATION_VIOLATION
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

