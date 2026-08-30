import api from './client';
import { Order, OrderCreateRequest, SagaTimeline } from '../types/order';
import { BatchRequest, BatchResponse } from '../types/customer';

export const orderApi = {
  list: async (params?: { status?: string; customerId?: string; search?: string; page?: number; size?: number }) => {
    const res = await api.get<{
      success: boolean;
      data: {
        content: Order[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
      };
    }>('/api/v1/orders', { params });
    return res.data.data;
  },

  getById: async (orderId: string) => {
    const res = await api.get<{ success: boolean; data: Order }>('/api/v1/orders/' + orderId);
    return res.data.data;
  },

  placeOrder: async (payload: OrderCreateRequest) => {
    const res = await api.post<{ success: boolean; data: Order; message: string }>('/api/v1/orders', payload);
    return res.data.data;
  },

  batchPlaceOrders: async (request: BatchRequest<OrderCreateRequest>) => {
    const res = await api.post<{ success: boolean; data: BatchResponse<Order>; message: string }>('/api/v1/orders/batch', request);
    return res.data.data;
  },

  getSagaTimeline: async (sagaId: string) => {
    const res = await api.get<{ success: boolean; data: SagaTimeline }>('/api/v1/orders/sagas/' + sagaId + '/timeline');
    return res.data.data;
  }
};

