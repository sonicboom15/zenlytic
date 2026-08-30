import React, { useEffect, useState } from 'react';
import { useTenant, useToast } from '../hooks';
import { userTenantApi } from '../api/userTenantApi';
import { User } from '../types/auth';
import { BatchImportModal } from '../components/BatchImportModal';
import {
  Button,
  Card,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableLoadingState,
  TableEmptyState,
  Modal,
  Input,
  Select,
} from '../components/ui';
import {
  UserCheck,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { activeTenantId } = useTenant();
  const { success, error } = useToast();

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
      success('Member Added', `User account for ${formData.fullName} created.`);
      fetchUsers();
    } catch (err: any) {
      error('Creation Failed', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const sampleBatchUsers = JSON.stringify(
    [
      {
        fullName: 'Sarah Jenkins',
        email: 'sarah.j@company.com',
        password: 'TempPassword123!',
        phoneNumber: '555-0301',
        roles: ['ROLE_SALES_REP'],
      },
      {
        fullName: 'David Chen',
        email: 'david.c@company.com',
        password: 'TempPassword123!',
        phoneNumber: '555-0302',
        roles: ['ROLE_MANAGER'],
      },
    ],
    null,
    2
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>Team & Role Permissions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage organization team members, credentials, and access roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<FileSpreadsheet className="w-4 h-4 text-slate-500" />}
            onClick={() => setIsBatchModalOpen(true)}
          >
            Batch Onboard
          </Button>

          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Member
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Member Name / Email</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Status</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableLoadingState colSpan={5} message="Loading members..." />
            ) : users.length === 0 ? (
              <TableEmptyState colSpan={5} message="No users registered in this tenant." />
            ) : (
              users.map((u) => (
                <TableRow key={u.userId}>
                  <TableCell>
                    <div className="font-bold text-slate-900">{u.fullName}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-slate-500">{u.userId}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.roles?.map((r, i) => (
                        <span
                          key={i}
                          className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-[10px] font-mono font-medium"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-mono">
                    {u.phoneNumber || 'Not provided'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">
                      {u.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Tenant Team Member"
        icon={<UserCheck className="w-5 h-5 text-blue-600" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleCreateUser}>
              Create Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
          <Input
            label="Full Name *"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Jane Doe"
          />

          <Input
            label="Email Address *"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jane.doe@company.com"
          />

          <Input
            label="Temporary Password *"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />

          <Input
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="555-0123"
          />

          <Select
            label="Role Assignment"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'ROLE_SALES_REP', label: 'Sales Representative (Field POS)' },
              { value: 'ROLE_MANAGER', label: 'Operations Manager' },
              { value: 'ROLE_ADMIN', label: 'Tenant Administrator' },
            ]}
          />
        </form>
      </Modal>

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
