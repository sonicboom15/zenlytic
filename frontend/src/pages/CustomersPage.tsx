import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerApi } from '../api/customerApi';
import { offlineDb } from '../utils/offlineDb';
import { Customer, CustomerCreateRequest } from '../types/customer';
import { BatchImportModal } from '../components/BatchImportModal';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Search,
  Percent,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { activeTenantId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CustomerCreateRequest>({
    name: '',
    code: '',
    companyName: '',
    email: '',
    phone: '',
    creditLimit: 10000,
    maxDiscountPercentage: 15,
    tier: 'STANDARD',
    status: 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerApi.list({ search, size: 50 });
      const list = res.content || [];
      setCustomers(list);
      // Cache customers in IndexedDB for offline POS access
      await offlineDb.cacheCustomers(list);
    } catch (e) {
      console.warn('Network fetch failed, loading cached customers from IndexedDB', e);
      const cached = await offlineDb.getCachedCustomers();
      setCustomers(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [activeTenantId, search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await customerApi.create(formData);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        code: '',
        companyName: '',
        email: '',
        phone: '',
        creditLimit: 10000,
        maxDiscountPercentage: 15,
        tier: 'STANDARD',
        status: 'ACTIVE',
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  const sampleBatchCustomers = JSON.stringify(
    [
      {
        name: "Northwest Electronics Corp",
        code: "NW-ELEC-01",
        companyName: "Northwest Tech Group",
        email: "purchasing@nwelec.com",
        phone: "555-0199",
        creditLimit: 75000,
        maxDiscountPercentage: 20,
        tier: "PLATINUM",
        status: "ACTIVE"
      },
      {
        name: "Summit Outdoor Retailers",
        code: "SUMMIT-02",
        companyName: "Summit Gear LLC",
        email: "orders@summitgear.com",
        phone: "555-0188",
        creditLimit: 30000,
        maxDiscountPercentage: 12.5,
        tier: "GOLD",
        status: "ACTIVE"
      }
    ],
    null,
    2
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>B2B Customer Master Data</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage corporate client accounts, credit boundaries, and maximum discount authorization limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <span>Batch Import</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 px-3.5">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client name, account code, or company..."
          className="bg-transparent text-xs text-white placeholder-slate-500 w-full outline-none"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Client / Company</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Max Discount</th>
                <th className="px-4 py-3">Credit Limit</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No customers found for this tenant.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.companyName || c.email || 'No email specified'}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300 font-medium">{c.code}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.tier === 'PLATINUM'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : c.tier === 'GOLD'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {c.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono">
                      {c.maxDiscountPercentage}% Max
                    </td>
                    <td className="px-4 py-3.5 font-mono text-white">
                      ${Number(c.creditLimit).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Create New B2B Customer Account</span>
            </h3>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Apex Global Industries"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="APEX-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company Entity</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Apex Corp LLC"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="orders@apex.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Max Discount Limit (%) *</span>
                    <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={formData.maxDiscountPercentage}
                    onChange={(e) => setFormData({ ...formData, maxDiscountPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Credit Limit ($)</span>
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl transition"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      <BatchImportModal<CustomerCreateRequest, Customer>
        title="Batch Import B2B Customers (Standard Chassis)"
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          fetchCustomers();
        }}
        sampleTemplate={sampleBatchCustomers}
        parseInput={(text) => JSON.parse(text)}
        onImport={(items) => customerApi.batchCreate({ items, continueOnError: true })}
        renderItemSummary={(c) => `${c.name} (${c.maxDiscountPercentage}% max disc)`}
      />
    </div>
  );
};

