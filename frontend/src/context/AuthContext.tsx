import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, Tenant } from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  userEmail: string | null;
  userTenantId: string | null;
  activeTenantId: string;
  tenantName: string;
  tenantTier: string;
  roles: string[];
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (authData: AuthResponse, organizationName?: string) => void;
  logout: () => void;
  switchTenant: (newTenantId: string, newTenantName?: string) => void;
  updateTenantInfo: (name: string, tier?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('auth_user_id'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('auth_user_email'));
  const [userTenantId, setUserTenantId] = useState<string | null>(localStorage.getItem('auth_user_tenant_id'));
  const [activeTenantId, setActiveTenantId] = useState<string>(
    localStorage.getItem('active_tenant_id') || localStorage.getItem('auth_user_tenant_id') || 'default'
  );
  const [tenantName, setTenantName] = useState<string>(() => {
    return localStorage.getItem('auth_tenant_name') || 'Zenlytic Enterprise';
  });
  const [tenantTier, setTenantTier] = useState<string>(() => {
    return localStorage.getItem('auth_tenant_tier') || 'ENTERPRISE';
  });
  const [roles, setRoles] = useState<string[]>(() => {
    const saved = localStorage.getItem('auth_roles');
    return saved ? JSON.parse(saved) : ['ROLE_USER'];
  });

  const isSuperAdmin = roles.includes('ROLE_SUPER_ADMIN') || roles.includes('ROLE_ADMIN');

  // Attempt to resolve organization name if default/missing
  useEffect(() => {
    if (token && isSuperAdmin) {
      authApi.listTenants()
        .then((tenants: Tenant[]) => {
          const current = tenants.find((t) => t.tenantId === activeTenantId);
          if (current) {
            setTenantName(current.name);
            setTenantTier(current.tier);
            localStorage.setItem('auth_tenant_name', current.name);
            localStorage.setItem('auth_tenant_tier', current.tier);
          }
        })
        .catch(() => {
          // ignore background lookup error
        });
    }
  }, [token, activeTenantId, isSuperAdmin]);

  const login = (authData: AuthResponse, organizationName?: string) => {
    const resolvedName = organizationName || authData.tenantName || authData.tenantId;
    const resolvedTier = authData.tier || 'ENTERPRISE';
    const email = authData.email || authData.userId;

    setToken(authData.token);
    setUserId(authData.userId);
    setUserEmail(email);
    setUserTenantId(authData.tenantId);
    setActiveTenantId(authData.tenantId);
    setTenantName(resolvedName);
    setTenantTier(resolvedTier);
    setRoles(authData.roles || ['ROLE_USER']);

    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user_id', authData.userId);
    localStorage.setItem('auth_user_email', email);
    localStorage.setItem('auth_user_tenant_id', authData.tenantId);
    localStorage.setItem('active_tenant_id', authData.tenantId);
    localStorage.setItem('auth_tenant_name', resolvedName);
    localStorage.setItem('auth_tenant_tier', resolvedTier);
    localStorage.setItem('auth_roles', JSON.stringify(authData.roles || ['ROLE_USER']));
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserEmail(null);
    setUserTenantId(null);
    setActiveTenantId('default');
    setTenantName('Zenlytic Enterprise');
    setTenantTier('ENTERPRISE');
    setRoles([]);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_id');
    localStorage.removeItem('auth_user_email');
    localStorage.removeItem('auth_user_tenant_id');
    localStorage.removeItem('active_tenant_id');
    localStorage.removeItem('auth_tenant_name');
    localStorage.removeItem('auth_tenant_tier');
    localStorage.removeItem('auth_roles');
  };

  const switchTenant = (newTenantId: string, newTenantName?: string) => {
    if (!isSuperAdmin && newTenantId !== userTenantId) {
      console.error('Tenant Guard: Cross-tenant switching forbidden for non-super-admin');
      alert('Security Guard: You do not have permission to access other tenant workspaces.');
      return;
    }
    setActiveTenantId(newTenantId);
    localStorage.setItem('active_tenant_id', newTenantId);

    if (newTenantName) {
      setTenantName(newTenantName);
      localStorage.setItem('auth_tenant_name', newTenantName);
    }
  };

  const updateTenantInfo = (name: string, tier?: string) => {
    setTenantName(name);
    localStorage.setItem('auth_tenant_name', name);
    if (tier) {
      setTenantTier(tier);
      localStorage.setItem('auth_tenant_tier', tier);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        userEmail,
        userTenantId,
        activeTenantId,
        tenantName,
        tenantTier,
        roles,
        isAuthenticated: !!token,
        isSuperAdmin,
        login,
        logout,
        switchTenant,
        updateTenantInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
