import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { Tenant } from '../types/auth';
import { TenantRouteGuard } from '../components/TenantRouteGuard';
import {
  Building2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock
} from 'lucide-react';

export const TenantsPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [planTier, setPlanTier] = useState('ENTERPRISE');
  const [saving, setSaving] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const list = await authApi.listTenants();
      setTenants(list || []);
    } catch (e) {
      console.warn('Failed to load tenants', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const generatedTenantId = 'tenant-' + orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
      await authApi.registerTenant({
        tenantId: generatedTenantId,
        name: orgName,
        adminEmail: `admin@${generatedTenantId}.com`,
        adminPassword: 'Password123!',
        tier: planTier
      });
      setIsAddModalOpen(false);
      setOrgName('');
      fetchTenants();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to onboard tenant');
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
          <Lock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">Super-Administrator Clearance Required</h3>
          <p className="text-xs text-slate-400 mt-2">
            Cross-tenant organization management is restricted to system administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Multi-Tenant Organizations Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global tenant provisioning, subscription tier boundaries, and database isolation keys.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Tenant</span>
        </button>
      </div>

      {/* Tenants Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Tenant Organization</th>
                <th className="px-4 py-3">Tenant ID</th>
                <th className="px-4 py-3">Subscription Tier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Provisioned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading tenants...
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.tenantId} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 font-bold text-white">{t.name}</td>
                    <td className="px-4 py-3.5 font-mono text-indigo-300 font-medium">{t.tenantId}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-300">
                        {t.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Tenant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Provision New Tenant Organization</span>
            </h3>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Global Freight Solutions"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subscription Plan Tier</label>
                <select
                  value={planTier}
                  onChange={(e) => setPlanTier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                >
                  <option value="STARTER">Starter Tier</option>
                  <option value="GROWTH">Growth Tier</option>
                  <option value="ENTERPRISE">Enterprise Tier</option>
                </select>
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
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl transition"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Provision Tenant</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

