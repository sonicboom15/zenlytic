import api from './client';
import { Customer, CustomerCreateRequest, CustomerUpdateRequest, BatchRequest, BatchResponse } from '../types/customer';

export const customerApi = {
  list: async (params?: { search?: string; status?: string; tier?: string; page?: number; size?: number }) => {
    const res = await api.get<{
      success: boolean;
      data: {
        content: Customer[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
      };
    }>('/api/v1/customers', { params });
    return res.data.data;
  },

  getById: async (customerId: string) => {
    const res = await api.get<{ success: boolean; data: Customer }>('/api/v1/customers/' + customerId);
    return res.data.data;
  },

  create: async (payload: CustomerCreateRequest) => {
    const res = await api.post<{ success: boolean; data: Customer; message: string }>('/api/v1/customers', payload);
    return res.data.data;
  },

  update: async (customerId: string, payload: CustomerUpdateRequest) => {
    const res = await api.put<{ success: boolean; data: Customer; message: string }>('/api/v1/customers/' + customerId, payload);
    return res.data.data;
  },

  delete: async (customerId: string) => {
    const res = await api.delete('/api/v1/customers/' + customerId);
    return res.data;
  },

  batchCreate: async (request: BatchRequest<CustomerCreateRequest>) => {
    const res = await api.post<{ success: boolean; data: BatchResponse<Customer>; message: string }>('/api/v1/customers/batch', request);
    return res.data.data;
  }
};

