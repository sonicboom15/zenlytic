export interface Tenant {
  tenantId: string;
  name: string;
  tier: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  token?: string;
  createdAt: string;
}

export interface User {
  userId: string;
  tenantId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  status: string;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  tenantId: string;
  tenantName?: string;
  email?: string;
  tier?: string;
  roles: string[];
}
