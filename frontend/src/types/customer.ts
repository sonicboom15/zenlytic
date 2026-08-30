export interface Customer {
  customerId: string;
  tenantId: string;
  name: string;
  code: string;
  companyName?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  maxDiscountPercentage: number;
  tier: 'STANDARD' | 'GOLD' | 'PLATINUM';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreateRequest {
  name: string;
  code: string;
  companyName?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditLimit?: number;
  maxDiscountPercentage?: number;
  tier?: string;
  status?: string;
  notes?: string;
}

export interface CustomerUpdateRequest {
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditLimit?: number;
  currentBalance?: number;
  maxDiscountPercentage?: number;
  tier?: string;
  status?: string;
  notes?: string;
}

export interface BatchItemResult<T> {
  index: number;
  keyIdentifier: string;
  success: boolean;
  data?: T;
  errorMessage?: string;
  errorCode?: string;
}

export interface BatchResponse<T> {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: BatchItemResult<T>[];
}

export interface BatchRequest<T> {
  items: T[];
  continueOnError?: boolean;
  chunkSize?: number;
}

