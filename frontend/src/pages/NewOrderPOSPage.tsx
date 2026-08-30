import React, { useState } from 'react';
import { useCommerce, useCart, useNetwork } from '../hooks';
import { Product } from '../types/product';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Input,
  Select,
  SearchInput,
} from '../components/ui';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Percent,
  CreditCard,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Users,
  Receipt,
} from 'lucide-react';

export const NewOrderPOSPage: React.FC = () => {
  const { products, customers } = useCommerce();
  const { isOnline } = useNetwork();
  const {
    items: cart,
    addItem,
    removeItem,
    updateQuantity,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedCustomer,
    discountPercentage,
    setDiscountPercentage,
    discountError,
    subtotal,
    discountAmount,
    totalAmount,
    isCheckingOut,
    executeCheckout,
  } = useCart();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  const maxAllowedDiscount = selectedCustomer ? Number(selectedCustomer.maxDiscountPercentage) : 0;
  const isDiscountOverLimit = !!discountError;

  // Filtered products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaceOrder = async () => {
    setOrderSuccessMsg(null);
    const result = await executeCheckout();
    if (result.success) {
      if (result.isOffline) {
        setOrderSuccessMsg(
          `Offline Mode: Order saved to local outbox! It will automatically synchronize when network is restored.`
        );
      } else {
        setOrderSuccessMsg(
          `Order [${result.orderId}] confirmed successfully via Saga Orchestrator! Total: $${totalAmount.toFixed(2)}`
        );
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span>Field Sales Point-of-Sale (POS)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create sales orders with customer credit limits and real-time stock allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isOnline ? (
            <Badge variant="warning" size="md">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline POS Mode</span>
            </Badge>
          ) : (
            <Badge variant="success" size="md">
              <Wifi className="w-3.5 h-3.5" />
              <span>Online (Connected)</span>
            </Badge>
          )}
        </div>
      </div>

      {orderSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-4 rounded-xl flex items-center gap-3 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 font-semibold">{orderSuccessMsg}</div>
        </div>
      )}

      {/* Main Grid: Catalog on left, Cart & Checkout on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Catalog Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Customer Selector Card */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Select B2B Client Account</span>
              </span>
              {selectedCustomer && (
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold text-xs">
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
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="">-- Direct Retail / Guest Walk-in --</option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.name} ({c.accountNumber || c.code || 'B2B'}) - {c.tier} Tier [Max {c.maxDiscountPercentage}% Disc]
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <div className="text-slate-500 font-medium">Account Tier</div>
                  <div className="font-bold text-slate-900 uppercase">{selectedCustomer.tier}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Credit Limit</div>
                  <div className="font-bold text-slate-900 font-mono">
                    ${Number(selectedCustomer.creditLimit).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Available Credit</div>
                  <div className="font-bold text-emerald-700 font-mono">
                    ${Number(selectedCustomer.availableCredit || selectedCustomer.creditLimit).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Product Items Quick Add Grid */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Available Catalog Items ({filteredProducts.length})
              </h3>
              <div className="w-48">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter items..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addItem(product)}
                  className="bg-slate-50/60 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 p-3.5 rounded-xl transition cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                      {product.name}
                    </div>
                    <div className="text-[11px] font-mono text-purple-700 mt-0.5">{product.sku}</div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200">
                    <div className="font-bold text-sm text-slate-900 font-mono">
                      ${Number(product.price).toFixed(2)}
                    </div>
                    <span className="text-[11px] text-blue-700 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2 py-0.5 rounded font-semibold transition border border-blue-200">
                      + Add
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Cart & Checkout Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">Current Order Cart</h3>
                </div>
                <span className="text-xs font-mono bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700 font-semibold">
                  {cart.length} item(s)
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    Cart is empty. Select products on the left to build the order.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.sku}
                      className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="truncate flex-1">
                        <div className="font-semibold text-xs text-slate-900 truncate">{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          ${item.unitPrice.toFixed(2)} ea
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-900 w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-mono text-xs font-bold text-slate-900 min-w-[55px] text-right">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </div>

                      <button
                        onClick={() => removeItem(item.sku)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Discount & Totals Section */}
            <div className="pt-4 border-t border-slate-200 space-y-3 mt-4">
              {/* Discount Input */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-blue-600" />
                    <span>Authorized B2B Discount (%)</span>
                  </span>
                  {selectedCustomer && (
                    <span className="text-[11px] text-slate-500">
                      Cap: <strong className="text-slate-800 font-bold">{maxAllowedDiscount}%</strong>
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
                  className={`w-full bg-slate-50 border rounded-lg p-2.5 text-xs text-slate-900 font-mono outline-none transition ${
                    isDiscountOverLimit
                      ? 'border-rose-500 bg-rose-50 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-300 focus:border-blue-500 focus:bg-white'
                  }`}
                  placeholder="0.0"
                />

                {isDiscountOverLimit && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-rose-800 text-[11px] font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Discount cannot exceed client limit of {maxAllowedDiscount}%.</span>
                  </div>
                )}
              </div>

              {/* Cost Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-800 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({discountPercentage}%):</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due:</span>
                  <span className="font-mono text-blue-700">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                loading={isCheckingOut}
                disabled={cart.length === 0 || isDiscountOverLimit}
                onClick={handlePlaceOrder}
                className="w-full py-3"
                icon={!isOnline ? <WifiOff className="w-4 h-4 text-amber-200" /> : <CreditCard className="w-4 h-4" />}
              >
                {!isOnline
                  ? `Queue Offline Order (${cart.length} items)`
                  : `Execute Saga Checkout ($${totalAmount.toFixed(2)})`}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
