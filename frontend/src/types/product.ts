export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  availableStock: number;
  category?: string;
  tenantId: string;
  status: string;
  createdAt: string;
}

export interface ProductCreateRequest {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category?: string;
}

