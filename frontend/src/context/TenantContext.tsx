import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Tenant } from '../types/auth';
import { authApi } from '../api/authApi';
import { useAuth } from './AuthContext';

interface TenantContextType {
  activeTenantId: string;
  tenantName: string;
  tenantTier: string;
  availableTenants: Tenant[];
  loadingTenants: boolean;
  switchTenant: (newTenantId: string, newTenantName?: string) => void;
  refreshTenants: () => Promise<void>;
  updateTenantInfo: (name: string, tier?: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    token,
    userTenantId,
    activeTenantId: authActiveTenantId,
    tenantName: authTenantName,
    tenantTier: authTenantTier,
    isSuperAdmin,
  } = useAuth();

  const [activeTenantId, setActiveTenantId] = useState<string>(
    () => authActiveTenantId || localStorage.getItem('active_tenant_id') || localStorage.getItem('auth_user_tenant_id') || 'default'
  );
  const [tenantName, setTenantName] = useState<string>(
    () => authTenantName || localStorage.getItem('auth_tenant_name') || 'Zenlytic Enterprise'
  );
  const [tenantTier, setTenantTier] = useState<string>(
    () => authTenantTier || localStorage.getItem('auth_tenant_tier') || 'ENTERPRISE'
  );
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);

  // Synchronize state whenever AuthContext changes (e.g. Login, Logout, Tenant Switch)
  useEffect(() => {
    if (authActiveTenantId) {
      setActiveTenantId(authActiveTenantId);
    }
    if (authTenantName) {
      setTenantName(authTenantName);
    }
    if (authTenantTier) {
      setTenantTier(authTenantTier);
    }
  }, [authActiveTenantId, authTenantName, authTenantTier]);

  const refreshTenants = useCallback(async () => {
    if (!token || !isSuperAdmin) return;
    setLoadingTenants(true);
    try {
      const list = await authApi.listTenants();
      setAvailableTenants(list || []);

      // Auto-sync organization name and tier if matched
      const current = list.find((t) => t.tenantId === activeTenantId);
      if (current) {
        setTenantName(current.name);
        setTenantTier(current.tier);
        localStorage.setItem('auth_tenant_name', current.name);
        localStorage.setItem('auth_tenant_tier', current.tier);
      }
    } catch (e) {
      console.warn('Tenant metadata background fetch failed', e);
    } finally {
      setLoadingTenants(false);
    }
  }, [token, isSuperAdmin, activeTenantId]);

  useEffect(() => {
    refreshTenants();
  }, [refreshTenants]);

  const switchTenant = useCallback(
    (newTenantId: string, newTenantName?: string) => {
      if (!isSuperAdmin && newTenantId !== userTenantId) {
        console.error('Security Guard: Cross-tenant switching forbidden for non-super-admin');
        return;
      }

      setActiveTenantId(newTenantId);
      localStorage.setItem('active_tenant_id', newTenantId);

      if (newTenantName) {
        setTenantName(newTenantName);
        localStorage.setItem('auth_tenant_name', newTenantName);
      } else {
        const found = availableTenants.find((t) => t.tenantId === newTenantId);
        if (found) {
          setTenantName(found.name);
          setTenantTier(found.tier);
          localStorage.setItem('auth_tenant_name', found.name);
          localStorage.setItem('auth_tenant_tier', found.tier);
        }
      }
    },
    [isSuperAdmin, userTenantId, availableTenants]
  );

  const updateTenantInfo = useCallback((name: string, tier?: string) => {
    setTenantName(name);
    localStorage.setItem('auth_tenant_name', name);
    if (tier) {
      setTenantTier(tier);
      localStorage.setItem('auth_tenant_tier', tier);
    }
  }, []);

  return (
    <TenantContext.Provider
      value={{
        activeTenantId,
        tenantName,
        tenantTier,
        availableTenants,
        loadingTenants,
        switchTenant,
        refreshTenants,
        updateTenantInfo,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
