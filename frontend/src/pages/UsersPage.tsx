import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userTenantApi } from '../api/userTenantApi';
import { User } from '../types/auth';
import { BatchImportModal } from '../components/BatchImportModal';
import {
  UserCheck,
  Plus,
  FileSpreadsheet,
  Shield,
  Mail,
  Phone,
  Loader2
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { activeTenantId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'ROLE_SALES_REP',
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await userTenantApi.listUsers();
      setUsers(list || []);
    } catch (e) {
      console.warn('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTenantId]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userTenantApi.createUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        roles: [formData.role],
        status: 'ACTIVE',
      });
      setIsAddModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'ROLE_SALES_REP',
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const sampleBatchUsers = JSON.stringify(
    [
      {
        fullName: "Sarah Jenkins",
        email: "sarah.j@company.com",
        password: "TempPassword123!",
        phoneNumber: "555-0301",
        roles: ["ROLE_SALES_REP"]
      },
      {
        fullName: "David Chen",
        email: "david.c@company.com",
        password: "TempPassword123!",
        phoneNumber: "555-0302",
        roles: ["ROLE_MANAGER"]
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
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>Team & RBAC User Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage tenant organization members, credentials, and role permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <span>Batch Onboard</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Member Name / Email</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Encrypted Phone</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                    Loading members...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No users registered in this tenant.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">{u.userId}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r, i) => (
                          <span
                            key={i}
                            className="bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-mono"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">
                      {u.phoneNumber || 'Not provided'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Add Tenant Team Member</span>
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane.doe@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone (AES-256 Encrypted)</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="555-0123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Assignment</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                >
                  <option value="ROLE_SALES_REP">Sales Representative (Field POS)</option>
                  <option value="ROLE_MANAGER">Operations Manager</option>
                  <option value="ROLE_ADMIN">Tenant Administrator</option>
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
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl transition"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      <BatchImportModal<any, User>
        title="Batch Onboard Users (Standard Chassis)"
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          fetchUsers();
        }}
        sampleTemplate={sampleBatchUsers}
        parseInput={(text) => JSON.parse(text)}
        onImport={(items) => userTenantApi.batchCreateUsers({ items, continueOnError: true })}
        renderItemSummary={(u) => `${u.fullName} (${u.email})`}
      />
    </div>
  );
};

