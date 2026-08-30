import api from './client';
import { Product, ProductCreateRequest } from '../types/product';
import { BatchRequest, BatchResponse } from '../types/customer';

export const productApi = {
  list: async (page: number = 0, size: number = 50) => {
    const res = await api.get<{
      success: boolean;
      data: {
        content: Product[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
      };
    }>('/api/v1/products', { params: { page, size } });
    return res.data.data;
  },

  getById: async (id: number) => {
    const res = await api.get<{ success: boolean; data: Product }>('/api/v1/products/' + id);
    return res.data.data;
  },

  create: async (payload: ProductCreateRequest) => {
    const res = await api.post<{ success: boolean; data: Product; message: string }>('/api/v1/products', payload);
    return res.data.data;
  },

  update: async (id: number, payload: ProductCreateRequest) => {
    const res = await api.put<{ success: boolean; data: Product; message: string }>('/api/v1/products/' + id, payload);
    return res.data.data;
  },

  delete: async (id: number) => {
    const res = await api.delete('/api/v1/products/' + id);
    return res.data;
  },

  batchCreate: async (request: BatchRequest<ProductCreateRequest>) => {
    const res = await api.post<{ success: boolean; data: BatchResponse<Product>; message: string }>('/api/v1/products/batch', request);
    return res.data.data;
  }
};

