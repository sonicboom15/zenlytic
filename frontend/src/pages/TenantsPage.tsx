import React, { useState } from 'react';
import { useAuth, useTenant, useToast } from '../hooks';
import { authApi } from '../api/authApi';
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
  Building2,
  Plus,
  Lock,
} from 'lucide-react';

export const TenantsPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const { availableTenants, loadingTenants, refreshTenants } = useTenant();
  const { success, error } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [planTier, setPlanTier] = useState('ENTERPRISE');
  const [saving, setSaving] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const generatedTenantId =
        'tenant-' +
        orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') +
        '-' +
        Math.floor(1000 + Math.random() * 9000);

      await authApi.registerTenant({
        tenantId: generatedTenantId,
        name: orgName,
        adminEmail: `admin@${generatedTenantId}.com`,
        adminPassword: 'Password123!',
        tier: planTier,
      });

      setIsAddModalOpen(false);
      setOrgName('');
      success('Tenant Provisioned', `Organization ${orgName} registered under ID [${generatedTenantId}].`);
      await refreshTenants();
    } catch (err: any) {
      error('Provisioning Failed', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-6 text-center shadow-sm">
          <Lock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">Super-Administrator Clearance Required</h3>
          <p className="text-xs text-slate-500 mt-2">
            Cross-tenant organization management is restricted to system administrators.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Organizations & Tenants</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Provision customer tenant workspaces, subscription tiers, and administrator credentials.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Provision Tenant
        </Button>
      </div>

      {/* Tenants Table */}
      <Card>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Tenant Organization</TableHead>
              <TableHead>Tenant ID</TableHead>
              <TableHead>Subscription Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Provisioned Date</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {loadingTenants ? (
              <TableLoadingState colSpan={5} message="Loading tenants..." />
            ) : availableTenants.length === 0 ? (
              <TableEmptyState colSpan={5} message="No tenants found." />
            ) : (
              availableTenants.map((t) => (
                <TableRow key={t.tenantId}>
                  <TableCell className="font-bold text-slate-900">{t.name}</TableCell>
                  <TableCell className="font-mono text-blue-700 font-medium">{t.tenantId}</TableCell>
                  <TableCell>
                    <Badge variant={t.tier === 'ENTERPRISE' ? 'info' : 'neutral'} size="sm">
                      {t.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Provision Tenant Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New Tenant Organization"
        icon={<Building2 className="w-5 h-5 text-blue-600" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleRegister}>
              Provision Tenant
            </Button>
          </>
        }
      >
        <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
          <Input
            label="Organization Name *"
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Global Freight Solutions"
          />

          <Select
            label="Subscription Plan Tier"
            value={planTier}
            onChange={(e) => setPlanTier(e.target.value)}
            options={[
              { value: 'STARTER', label: 'Starter Tier' },
              { value: 'GROWTH', label: 'Growth Tier' },
              { value: 'ENTERPRISE', label: 'Enterprise Tier' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
};
