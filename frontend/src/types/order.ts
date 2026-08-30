export interface OrderItem {
  id?: number;
  sku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  orderId: string;
  userId: string;
  tenantId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED';
  totalAmount: number;
  paymentReference?: string;
  sagaId?: string;
  customerId?: string;
  customerName?: string;
  discountPercentage?: number;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderCreateRequest {
  items: {
    sku: string;
    productName: string;
    unitPrice: number;
    quantity: number;
  }[];
  idempotencyKey?: string;
  customerId?: string;
  customerName?: string;
  discountPercentage?: number;
}

export interface OfflineOrderDraft {
  localId: string;
  idempotencyKey: string;
  tenantId: string;
  customerId?: string;
  customerName?: string;
  discountPercentage: number;
  items: {
    sku: string;
    productName: string;
    unitPrice: number;
    quantity: number;
  }[];
  totalAmount: number;
  createdAt: number;
  syncStatus: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
}

export interface SagaStepLog {
  stepName: string;
  status: 'STARTED' | 'SUCCESS' | 'FAILED' | 'COMPENSATED';
  durationMs: number;
  timestamp: string;
  errorMessage?: string;
}

export interface SagaTimeline {
  sagaId: string;
  orderId: string;
  status: 'STARTED' | 'COMPLETED' | 'FAILED' | 'COMPENSATED';
  steps: SagaStepLog[];
  startedAt: string;
  completedAt?: string;
}

