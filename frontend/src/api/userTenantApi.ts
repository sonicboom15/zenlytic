import api from './client';
import { User } from '../types/auth';
import { BatchRequest, BatchResponse } from '../types/customer';

export const userTenantApi = {
  listUsers: async () => {
    const res = await api.get<{ success: boolean; data: User[] }>('/api/v1/users');
    return res.data.data;
  },

  createUser: async (payload: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    roles?: string[];
    permissions?: string[];
    status?: string;
  }) => {
    const res = await api.post<{ success: boolean; data: User; message: string }>('/api/v1/users', payload);
    return res.data.data;
  },

  batchCreateUsers: async (request: BatchRequest<{
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    roles?: string[];
    permissions?: string[];
  }>) => {
    const res = await api.post<{ success: boolean; data: BatchResponse<User>; message: string }>('/api/v1/users/batch', request);
    return res.data.data;
  }
};

