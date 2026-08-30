import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { customerApi } from '../api/customerApi';
import { productApi } from '../api/productApi';
import { orderApi } from '../api/orderApi';
import { offlineDb } from '../utils/offlineDb';
import { Customer } from '../types/customer';
import { Product } from '../types/product';
import {
  ShoppingCart,
  Users,
  Percent,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Wifi,
  Loader2,
  Receipt,
  CreditCard
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export const NewOrderPOSPage: React.FC = () => {
  const { activeTenantId, userId } = useAuth();
  const { isOnline, refreshQueuedCount } = useNetwork();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Load Customers & Products (from API or IndexedDB offline cache)
  useEffect(() => {
    const loadMasterData = async () => {
      // Load Customers
      try {
        const res = await customerApi.list({ size: 100 });
        const list = res.content || [];
        setCustomers(list);
        await offlineDb.cacheCustomers(list);
      } catch (e) {
        console.log('Loading offline cached customers');
        const cached = await offlineDb.getCachedCustomers();
        setCustomers(cached);
      }

      // Load Products
      try {
        const res = await productApi.list(0, 100);
        const list = res.content || [];
        setProducts(list);
        await offlineDb.cacheProducts(list);
      } catch (e) {
        console.log('Loading offline cached products');
        const cached = await offlineDb.getCachedProducts();
        setProducts(cached);
      }
    };

    loadMasterData();
  }, [activeTenantId]);

  const selectedCustomer = customers.find((c) => c.customerId === selectedCustomerId);
  const maxAllowedDiscount = selectedCustomer ? Number(selectedCustomer.maxDiscountPercentage) : 0;

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const discountAmount = (subtotal * (discountPercentage || 0)) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Discount validation warning
  const isDiscountOverLimit = selectedCustomer && discountPercentage > maxAllowedDiscount;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Please add at least one product to the order cart.');
      return;
    }

    if (isDiscountOverLimit) {
      alert(`Cannot submit order: Discount (${discountPercentage}%) exceeds customer limit (${maxAllowedDiscount}%).`);
      return;
    }

    setSubmitting(true);
    setOrderSuccessMsg(null);

    const idempotencyKey = 'pos-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const orderItems = cart.map((item) => ({
      sku: item.product.sku,
      productName: item.product.name,
      unitPrice: Number(item.product.price),
      quantity: item.quantity,
    }));

    try {
      if (isOnline) {
        // Direct Online Distributed Saga Execution
        const placed = await orderApi.placeOrder({
          items: orderItems,
          idempotencyKey,
          customerId: selectedCustomer?.customerId,
          customerName: selectedCustomer?.name,
          discountPercentage,
        });

        setOrderSuccessMsg(`Order [${placed.orderId}] confirmed successfully via Saga Orchestrator! Total: $${placed.totalAmount}`);
      } else {
        // Offline Outbox Capture
        const localId = 'draft-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        await offlineDb.saveDraftOrder({
          localId,
          idempotencyKey,
          tenantId: activeTenantId,
          customerId: selectedCustomer?.customerId,
          customerName: selectedCustomer?.name,
          discountPercentage,
          items: orderItems,
          totalAmount: finalTotal,
          createdAt: Date.now(),
          syncStatus: 'QUEUED',
        });

        await refreshQueuedCount();
        setOrderSuccessMsg(`Offline Mode: Order saved to local outbox! It will automatically synchronize when network is restored.`);
      }

      // Reset cart
      setCart([]);
      setDiscountPercentage(0);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <span>Field Sales Point-of-Sale (POS)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Offline-first checkout terminal with corporate customer limits and Saga order placement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isOnline ? (
            <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1.5 rounded-xl font-bold">
              <WifiOff className="w-4 h-4" />
              <span>Offline POS Mode</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-3 py-1.5 rounded-xl font-bold">
              <Wifi className="w-4 h-4" />
              <span>Online (Connected)</span>
            </span>
          )}
        </div>
      </div>

      {orderSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1 font-semibold">{orderSuccessMsg}</div>
        </div>
      )}

      {/* Main Grid: Catalog on left, Cart & Checkout on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Catalog Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Customer Selector Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Select B2B Client Account</span>
              </span>
              {selectedCustomer && (
                <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-bold">
                  Max Auth Discount: {selectedCustomer.maxDiscountPercentage}%
                </span>
              )}
            </div>

            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setDiscountPercentage(0);
              }}
              aria-label="Select B2B Client Account"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="">-- Direct Retail / Guest Walk-in --</option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.name} ({c.code}) - {c.tier} Tier [Max {c.maxDiscountPercentage}% Disc]
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <div className="text-slate-400">Account Tier</div>
                  <div className="font-bold text-white uppercase">{selectedCustomer.tier}</div>
                </div>
                <div>
                  <div className="text-slate-400">Credit Limit</div>
                  <div className="font-bold text-white font-mono">${Number(selectedCustomer.creditLimit).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Available Credit</div>
                  <div className="font-bold text-emerald-400 font-mono">${Number(selectedCustomer.availableCredit || selectedCustomer.creditLimit).toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Product Items Quick Add Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
              Available Catalog Items ({products.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/40 p-3.5 rounded-xl transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-white truncate">{product.name}</div>
                    <div className="text-[11px] font-mono text-purple-300 mt-0.5">{product.sku}</div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60">
                    <div className="font-bold text-sm text-white font-mono">
                      ${Number(product.price).toFixed(2)}
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded font-semibold">
                      + Add
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart & Checkout Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-sm text-white">Current Order Cart</h3>
                </div>
                <span className="text-xs font-mono bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-300">
                  {cart.length} item(s)
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500">
                    Cart is empty. Select products on the left to build the order.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      <div className="truncate flex-1">
                        <div className="font-bold text-xs text-white truncate">{item.product.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          ${Number(item.product.price).toFixed(2)} ea
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-mono text-xs font-bold text-white min-w-[50px] text-right">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Discount & Totals Section */}
            <div className="pt-4 border-t border-slate-800 space-y-3 mt-4">
              {/* Discount Input */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Authorized B2B Discount (%)</span>
                  </span>
                  {selectedCustomer && (
                    <span className="text-[11px] text-slate-400">
                      Cap: <strong>{maxAllowedDiscount}%</strong>
                    </span>
                  )}
                </div>

                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                  className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-white font-mono outline-none ${
                    isDiscountOverLimit ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'
                  }`}
                  placeholder="0.0"
                />

                {isDiscountOverLimit && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold bg-rose-950/40 p-2 rounded-lg border border-rose-800/50">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Discount cannot exceed client limit of {maxAllowedDiscount}%.</span>
                  </div>
                )}
              </div>

              {/* Cost Summary */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountPercentage}%):</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Total Due:</span>
                  <span className="font-mono text-emerald-400">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout / Submit Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || cart.length === 0 || isDiscountOverLimit}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : !isOnline ? (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-300" />
                    <span>Queue Offline Order ({cart.length} items)</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Execute Saga Checkout (${finalTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

