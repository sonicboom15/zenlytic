import React, { useState } from 'react';
import { useCommerce, useToast } from '../hooks';
import { Product, ProductCreateRequest } from '../types/product';
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
  Textarea,
  SearchInput,
} from '../components/ui';
import {
  Package,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const {
    products,
    loadingProducts,
    createProduct,
    batchCreateProducts,
  } = useCommerce();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ProductCreateRequest>({
    sku: '',
    name: '',
    description: '',
    price: 99.99,
    stockQuantity: 100,
    category: 'Hardware',
  });
  const [saving, setSaving] = useState(false);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProduct(formData);
      setIsAddModalOpen(false);
      setFormData({
        sku: '',
        name: '',
        description: '',
        price: 99.99,
        stockQuantity: 100,
        category: 'Hardware',
      });
      success('Product Created', `SKU ${formData.sku} added to catalog.`);
    } catch (err: any) {
      error('Creation Failed', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const sampleBatchProducts = JSON.stringify(
    [
      {
        sku: 'PROD-KB-RGB',
        name: 'Mechanical Keyboard RGB',
        description: 'Mechanical keyboard with hot-swappable switches',
        price: 129.99,
        stockQuantity: 150,
        category: 'Peripherals',
      },
      {
        sku: 'PROD-HEADSET-PRO',
        name: 'Wireless ANC Headset Pro',
        description: 'Noise cancelling studio quality headset',
        price: 249.50,
        stockQuantity: 80,
        category: 'Audio',
      },
      {
        sku: 'PROD-MONITOR-4K',
        name: 'Ultra-Wide 34-inch 4K Monitor',
        description: 'Curved 144Hz HDR IPS panel',
        price: 649.00,
        stockQuantity: 35,
        category: 'Displays',
      },
    ],
    null,
    2
  );

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Product Catalog & Stock Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage commercial SKUs, inventory availability, and pricing.
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
            Add Product
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search products by SKU, name, or category..."
      />

      {/* Product Table */}
      <Card>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Product Name / Description</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Stock Available</TableHead>
              <TableHead>Status</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {loadingProducts ? (
              <TableLoadingState colSpan={6} message="Loading product catalog..." />
            ) : filtered.length === 0 ? (
              <TableEmptyState colSpan={6} message="No products found in catalog." />
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">
                      {p.description || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-purple-700 font-semibold">{p.sku}</TableCell>
                  <TableCell>
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700 font-medium">
                      {p.category || 'General'}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 font-mono">
                    ${Number(p.price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-mono font-bold ${
                        p.stockQuantity > 20
                          ? 'text-emerald-700'
                          : p.stockQuantity > 0
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {p.stockQuantity} units
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Catalog Item"
        icon={<Package className="w-5 h-5 text-blue-600" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleCreateProduct}>
              Save Product
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
          <Input
            label="Product SKU *"
            required
            mono
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="PROD-SAMPLE-01"
          />

          <Input
            label="Product Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enterprise Wireless Access Point"
          />

          <Textarea
            label="Description"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="High density multi-band WiFi 6 gateway"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unit Price ($) *"
              type="number"
              step="0.01"
              min="0.01"
              required
              mono
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Initial Stock *"
              type="number"
              min="0"
              required
              mono
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
            />
          </div>

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Hardware"
          />
        </form>
      </Modal>

      {/* Batch Import Modal */}
      <BatchImportModal<ProductCreateRequest, Product>
        title="Batch Import Products (Standard Chassis)"
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        sampleTemplate={sampleBatchProducts}
        parseInput={(text) => JSON.parse(text)}
        onImport={(items) => batchCreateProducts(items)}
        renderItemSummary={(p) => `${p.name} ($${p.price})`}
      />
    </div>
  );
};
