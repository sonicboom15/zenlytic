import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, ProductCreateRequest } from '../types/product';
import { Customer, CustomerCreateRequest } from '../types/customer';
import { Order, OrderCreateRequest, SagaTimeline } from '../types/order';
import { productApi } from '../api/productApi';
import { customerApi } from '../api/customerApi';
import { orderApi } from '../api/orderApi';
import { offlineDb } from '../utils/offlineDb';
import { useTenant } from './TenantContext';
import { useAuth } from './AuthContext';

export interface CommerceKPIs {
  revenue: number;
  totalOrders: number;
  b2bAccounts: number;
  activeProducts: number;
}

interface CommerceContextType {
  // Products
  products: Product[];
  loadingProducts: boolean;
  fetchProducts: () => Promise<void>;
  createProduct: (req: ProductCreateRequest) => Promise<Product>;
  batchCreateProducts: (items: ProductCreateRequest[]) => Promise<any>;

  // Customers
  customers: Customer[];
  loadingCustomers: boolean;
  fetchCustomers: (searchQuery?: string) => Promise<void>;
  createCustomer: (req: CustomerCreateRequest) => Promise<Customer>;
  batchCreateCustomers: (items: CustomerCreateRequest[]) => Promise<any>;
  findCustomerById: (id: string) => Customer | undefined;

  // Orders
  orders: Order[];
  loadingOrders: boolean;
  fetchOrders: (filter?: { search?: string; status?: string }) => Promise<void>;
  createOrder: (req: OrderCreateRequest) => Promise<Order>;
  selectedOrder: Order | null;
  sagaTimeline: SagaTimeline | null;
  loadingTimeline: boolean;
  inspectSagaTimeline: (order: Order) => Promise<void>;
  clearSelectedOrder: () => void;

  // KPIs
  kpis: CommerceKPIs;
  refreshAll: () => Promise<void>;
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTenantId } = useTenant();
  const { isAuthenticated } = useAuth();

  // Product State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  // Customer State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(false);

  // Order State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sagaTimeline, setSagaTimeline] = useState<SagaTimeline | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState<boolean>(false);

  // KPIs State
  const [kpis, setKpis] = useState<CommerceKPIs>({
    revenue: 0,
    totalOrders: 0,
    b2bAccounts: 0,
    activeProducts: 0,
  });

  // Fetch Products with IndexedDB Cache
  const fetchProducts = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingProducts(true);
    try {
      const res = await productApi.list(0, 100);
      const list = res.content || [];
      setProducts(list);
      await offlineDb.cacheProducts(list);
    } catch (e) {
      console.warn('Online product fetch failed, falling back to IndexedDB cache', e);
      const cached = await offlineDb.getCachedProducts();
      setProducts(cached);
    } finally {
      setLoadingProducts(false);
    }
  }, [isAuthenticated]);

  // Fetch Customers with IndexedDB Cache
  const fetchCustomers = useCallback(
    async (searchQuery = '') => {
      if (!isAuthenticated) return;
      setLoadingCustomers(true);
      try {
        const res = await customerApi.list({ search: searchQuery, size: 50 });
        const list = res.content || [];
        setCustomers(list);
        await offlineDb.cacheCustomers(list);
      } catch (e) {
        console.warn('Online customer fetch failed, falling back to IndexedDB cache', e);
        const cached = await offlineDb.getCachedCustomers();
        setCustomers(cached);
      } finally {
        setLoadingCustomers(false);
      }
    },
    [isAuthenticated]
  );

  // Fetch Orders
  const fetchOrders = useCallback(
    async (filter?: { search?: string; status?: string }) => {
      if (!isAuthenticated) return;
      setLoadingOrders(true);
      try {
        const res = await orderApi.list({
          search: filter?.search,
          status: filter?.status,
          size: 50,
        });
        setOrders(res.content || []);
      } catch (e) {
        console.warn('Orders fetch failed', e);
      } finally {
        setLoadingOrders(false);
      }
    },
    [isAuthenticated]
  );

  // Refresh All Data and compute KPIs
  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    await Promise.allSettled([fetchProducts(), fetchCustomers(), fetchOrders()]);
  }, [isAuthenticated, fetchProducts, fetchCustomers, fetchOrders]);

  // Trigger initial fetch when activeTenantId changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [activeTenantId, isAuthenticated, refreshAll]);

  // Recalculate KPIs when orders, customers, or products change
  useEffect(() => {
    const totalRev = orders.reduce((sum, o) => (o.status === 'CONFIRMED' ? sum + Number(o.totalAmount || 0) : sum), 0);
    setKpis({
      revenue: totalRev,
      totalOrders: orders.length,
      b2bAccounts: customers.length,
      activeProducts: products.length,
    });
  }, [orders, customers, products]);

  // Create Product
  const createProduct = async (req: ProductCreateRequest): Promise<Product> => {
    const created = await productApi.create(req);
    await fetchProducts();
    return created;
  };

  // Batch Create Products
  const batchCreateProducts = async (items: ProductCreateRequest[]) => {
    const res = await productApi.batchCreate({ items, continueOnError: true });
    await fetchProducts();
    return res;
  };

  // Create Customer
  const createCustomer = async (req: CustomerCreateRequest): Promise<Customer> => {
    const created = await customerApi.create(req);
    await fetchCustomers();
    return created;
  };

  // Batch Create Customers
  const batchCreateCustomers = async (items: CustomerCreateRequest[]) => {
    const res = await customerApi.batchCreate({ items, continueOnError: true });
    await fetchCustomers();
    return res;
  };

  // Find Customer by ID
  const findCustomerById = (id: string): Customer | undefined => {
    return customers.find((c) => c.customerId === id);
  };

  // Create Order
  const createOrder = async (req: OrderCreateRequest): Promise<Order> => {
    const created = await orderApi.placeOrder(req);
    await fetchOrders();
    return created;
  };

  // Inspect Saga Timeline
  const inspectSagaTimeline = async (order: Order) => {
    setSelectedOrder(order);
    setSagaTimeline(null);
    const lookupId = order.sagaId || order.orderId;
    if (lookupId) {
      setLoadingTimeline(true);
      try {
        const timeline = await orderApi.getSagaTimeline(lookupId);
        setSagaTimeline(timeline);
      } catch (e) {
        console.warn('Saga timeline lookup failed for', lookupId, e);
      } finally {
        setLoadingTimeline(false);
      }
    }
  };

  const clearSelectedOrder = () => {
    setSelectedOrder(null);
    setSagaTimeline(null);
  };

  return (
    <CommerceContext.Provider
      value={{
        products,
        loadingProducts,
        fetchProducts,
        createProduct,
        batchCreateProducts,
        customers,
        loadingCustomers,
        fetchCustomers,
        createCustomer,
        batchCreateCustomers,
        findCustomerById,
        orders,
        loadingOrders,
        fetchOrders,
        createOrder,
        selectedOrder,
        sagaTimeline,
        loadingTimeline,
        inspectSagaTimeline,
        clearSelectedOrder,
        kpis,
        refreshAll,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
};
