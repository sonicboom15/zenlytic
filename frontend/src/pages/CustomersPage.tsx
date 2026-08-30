import React, { useState } from 'react';
import { useCommerce, useToast } from '../hooks';
import { Customer, CustomerCreateRequest } from '../types/customer';
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
  SearchInput,
} from '../components/ui';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Percent,
  CreditCard,
  Building2,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const {
    customers,
    loadingCustomers,
    fetchCustomers,
    createCustomer,
    batchCreateCustomers,
  } = useCommerce();
  const { success, error } = useToast();

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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCustomer(formData);
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
      success('Customer Created', 'B2B account added successfully.');
    } catch (err: any) {
      error('Creation Failed', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const sampleBatchCustomers = JSON.stringify(
    [
      {
        name: 'Northwest Electronics Corp',
        code: 'NW-ELEC-01',
        companyName: 'Northwest Tech Group',
        email: 'purchasing@nwelec.com',
        phone: '555-0199',
        creditLimit: 75000,
        maxDiscountPercentage: 20,
        tier: 'PLATINUM',
        status: 'ACTIVE',
      },
      {
        name: 'Summit Outdoor Retailers',
        code: 'SUMMIT-02',
        companyName: 'Summit Gear LLC',
        email: 'orders@summitgear.com',
        phone: '555-0188',
        creditLimit: 30000,
        maxDiscountPercentage: 12.5,
        tier: 'GOLD',
        status: 'ACTIVE',
      },
    ],
    null,
    2
  );

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>B2B Customer Master Data</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage corporate client accounts, credit boundaries, and maximum discount authorization limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<FileSpreadsheet className="w-4 h-4 text-slate-500" />}
            onClick={() => setIsBatchModalOpen(true)}
          >
            Batch Import
          </Button>

          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by client name, account code, or company..."
      />

      {/* Customer Table Card */}
      <Card>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Client / Company</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Max Discount</TableHead>
              <TableHead>Credit Limit</TableHead>
              <TableHead>Status</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {loadingCustomers ? (
              <TableLoadingState colSpan={6} message="Loading customers..." />
            ) : filtered.length === 0 ? (
              <TableEmptyState colSpan={6} message="No customers found for this tenant." />
            ) : (
              filtered.map((c) => (
                <TableRow key={c.customerId}>
                  <TableCell>
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.companyName || c.email || 'No company specified'}</div>
                  </TableCell>
                  <TableCell className="font-mono text-slate-600 font-medium">
                    {c.code || c.accountNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.tier === 'PLATINUM' ? 'purple' : c.tier === 'GOLD' ? 'warning' : 'neutral'}>
                      {c.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-700 font-mono">
                    {c.maxDiscountPercentage}% Max
                  </TableCell>
                  <TableCell className="font-mono text-slate-900 font-semibold">
                    ${Number(c.creditLimit).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New B2B Customer Account"
        icon={<Building2 className="w-5 h-5 text-blue-600" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleCreateCustomer}>
              Save Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Customer / Client Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Apex Global Industries"
            />
            <Input
              label="Account Code *"
              required
              mono
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="APEX-01"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company Entity"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Apex Corp LLC"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="orders@apex.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Max Discount Limit (%) *"
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              value={formData.maxDiscountPercentage}
              onChange={(e) =>
                setFormData({ ...formData, maxDiscountPercentage: parseFloat(e.target.value) || 0 })
              }
              rightIcon={<Percent className="w-3.5 h-3.5 text-blue-600" />}
            />
            <Input
              label="Credit Limit ($)"
              type="number"
              min="0"
              mono
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
              rightIcon={<CreditCard className="w-3.5 h-3.5 text-blue-600" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Account Tier"
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
              options={[
                { value: 'STANDARD', label: 'Standard' },
                { value: 'GOLD', label: 'Gold' },
                { value: 'PLATINUM', label: 'Platinum VIP' },
              ]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'SUSPENDED', label: 'Suspended' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Batch Import Modal */}
      <BatchImportModal<CustomerCreateRequest, Customer>
        title="Batch Import B2B Customers (Standard Chassis)"
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        sampleTemplate={sampleBatchCustomers}
        parseInput={(text) => JSON.parse(text)}
        onImport={(items) => batchCreateCustomers(items)}
        renderItemSummary={(c) => `${c.name} (${c.maxDiscountPercentage}% max disc)`}
      />
    </div>
  );
};
