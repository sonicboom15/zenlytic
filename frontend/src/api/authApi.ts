import api from './client';
import { AuthResponse, Tenant } from '../types/auth';

export const authApi = {
  login: async (email: string, password: string, tenantId?: string) => {
    const res = await api.post<{ success: boolean; data: AuthResponse; message: string }>('/api/v1/auth/login', {
      email,
      password,
      tenantId,
    }, {
      headers: tenantId ? { 'X-Tenant-ID': tenantId } : undefined
    });
    return res.data.data;
  },

  registerTenant: async (payload: { tenantId: string; name: string; adminEmail: string; adminPassword: string; tier: string }) => {
    const res = await api.post<{ success: boolean; data: AuthResponse; message: string }>('/api/v1/tenants/register', payload, {
      headers: payload.tenantId ? { 'X-Tenant-ID': payload.tenantId } : undefined
    });
    return res.data.data;
  },

  listTenants: async () => {
    const res = await api.get<{ success: boolean; data: Tenant[]; message: string }>('/api/v1/tenants');
    return res.data.data;
  },

  checkAppVersion: async (client: string = 'web', version: string = '1.0.0') => {
    const res = await api.get('/api/v1/app/version-check', {
      params: { client, version },
    });
    return res.data.data;
  }
};

