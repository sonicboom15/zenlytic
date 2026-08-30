import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Product } from '../types/product';
import { Customer } from '../types/customer';
import { Order, OrderCreateRequest } from '../types/order';
import { useCommerce } from './CommerceContext';
import { useNetwork } from './NetworkContext';
import { useTenant } from './TenantContext';
import { useToast } from './ToastContext';
import { offlineDb } from '../utils/offlineDb';

export interface CartItem {
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  product: Product;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;

  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  selectedCustomer: Customer | undefined;

  discountPercentage: number;
  setDiscountPercentage: (discount: number) => void;
  discountError: string | null;

  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  itemCount: number;

  isCheckingOut: boolean;
  executeCheckout: () => Promise<{ success: boolean; orderId?: string; isOffline?: boolean }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customers, createOrder, fetchOrders } = useCommerce();
  const { isOnline, refreshQueuedCount } = useNetwork();
  const { activeTenantId } = useTenant();
  const { success, error } = useToast();

  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discountPercentage, setDiscountPercentageState] = useState<number>(0);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // Selected Customer reference
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.customerId === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Discount validation against customer's maximum discount boundary
  const discountError = useMemo(() => {
    if (selectedCustomer && discountPercentage > selectedCustomer.maxDiscountPercentage) {
      return `Discount cannot exceed client limit of ${selectedCustomer.maxDiscountPercentage}%.`;
    }
    return null;
  }, [selectedCustomer, discountPercentage]);

  const setDiscountPercentage = useCallback((val: number) => {
    setDiscountPercentageState(Math.max(0, Math.min(100, val)));
  }, []);

  // Cart operations
  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.sku === product.sku ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          sku: product.sku,
          name: product.name,
          unitPrice: Number(product.price),
          quantity,
          product,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((prev) => prev.filter((item) => item.sku !== sku));
  }, []);

  const updateQuantity = useCallback((sku: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.sku !== sku));
    } else {
      setItems((prev) =>
        prev.map((item) => (item.sku === sku ? { ...item, quantity } : item))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountPercentageState(0);
    setSelectedCustomerId('');
  }, []);

  // Financial calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercentage) / 100;
  }, [subtotal, discountPercentage]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Checkout execution
  const executeCheckout = async (): Promise<{ success: boolean; orderId?: string; isOffline?: boolean }> => {
    if (items.length === 0) {
      error('Cart is empty', 'Please add products before checking out.');
      return { success: false };
    }

    if (discountError) {
      error('Discount Violation', discountError);
      return { success: false };
    }

    setIsCheckingOut(true);
    const orderItems = items.map((i) => ({
      sku: i.sku,
      productName: i.name,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    }));

    try {
      if (isOnline) {
        // Online: Execute 4-step Distributed Saga Order Fulfillment Orchestrator
        const order = await createOrder({
          customerId: selectedCustomerId || undefined,
          customerName: selectedCustomer ? selectedCustomer.name : 'Direct Customer',
          discountPercentage,
          items: orderItems,
        });

        success(
          'Saga Order Confirmed!',
          `Order ${order.orderId} was fulfilled via 4-step Distributed Saga.`
        );
        clearCart();
        return { success: true, orderId: order.orderId, isOffline: false };
      } else {
        // Offline: Store order locally in IndexedDB Outbox
        const localId = 'draft-' + Math.random().toString(36).substring(2, 9);
        const idempotencyKey = 'idemp-' + Math.random().toString(36).substring(2, 11);

        await offlineDb.saveDraftOrder({
          localId,
          tenantId: activeTenantId,
          customerId: selectedCustomerId || undefined,
          customerName: selectedCustomer ? selectedCustomer.name : 'Direct Customer',
          discountPercentage,
          totalAmount,
          items: orderItems,
          createdAt: Date.now(),
          syncStatus: 'QUEUED',
          idempotencyKey,
        });

        await refreshQueuedCount();
        success(
          'Order Queued Offline',
          `Stored locally in IndexedDB. Will auto-sync when network is restored.`
        );
        clearCart();
        return { success: true, orderId: localId, isOffline: true };
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed';
      error('Checkout Failed', msg);
      return { success: false };
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedCustomer,
        discountPercentage,
        setDiscountPercentage,
        discountError,
        subtotal,
        discountAmount,
        totalAmount,
        itemCount,
        isCheckingOut,
        executeCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const usePOS = useCart;
