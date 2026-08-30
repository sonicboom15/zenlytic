import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse } from '../types/auth';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  userTenantId: string | null;
  activeTenantId: string;
  roles: string[];
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  switchTenant: (newTenantId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('auth_user_id'));
  const [userTenantId, setUserTenantId] = useState<string | null>(localStorage.getItem('auth_user_tenant_id'));
  const [activeTenantId, setActiveTenantId] = useState<string>(
    localStorage.getItem('active_tenant_id') || localStorage.getItem('auth_user_tenant_id') || 'default'
  );
  const [roles, setRoles] = useState<string[]>(() => {
    const saved = localStorage.getItem('auth_roles');
    return saved ? JSON.parse(saved) : ['ROLE_USER'];
  });

  const isSuperAdmin = roles.includes('ROLE_SUPER_ADMIN') || roles.includes('ROLE_ADMIN');

  const login = (authData: AuthResponse) => {
    setToken(authData.token);
    setUserId(authData.userId);
    setUserTenantId(authData.tenantId);
    setActiveTenantId(authData.tenantId); // Auto-navigates user directly to their own tenant
    setRoles(authData.roles || ['ROLE_USER']);

    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user_id', authData.userId);
    localStorage.setItem('auth_user_tenant_id', authData.tenantId);
    localStorage.setItem('active_tenant_id', authData.tenantId);
    localStorage.setItem('auth_roles', JSON.stringify(authData.roles || ['ROLE_USER']));
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserTenantId(null);
    setActiveTenantId('default');
    setRoles([]);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_id');
    localStorage.removeItem('auth_user_tenant_id');
    localStorage.removeItem('active_tenant_id');
    localStorage.removeItem('auth_roles');
  };

  const switchTenant = (newTenantId: string) => {
    if (!isSuperAdmin && newTenantId !== userTenantId) {
      console.error('Tenant Guard: Cross-tenant switching forbidden for non-super-admin');
      alert('Security Guard: You do not have permission to access other tenant workspaces.');
      return;
    }
    setActiveTenantId(newTenantId);
    localStorage.setItem('active_tenant_id', newTenantId);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        userTenantId,
        activeTenantId,
        roles,
        isAuthenticated: !!token,
        isSuperAdmin,
        login,
        logout,
        switchTenant,
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

