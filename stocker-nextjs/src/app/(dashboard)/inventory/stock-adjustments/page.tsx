'use client';

/**
 * Stock Adjustments Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Tabs,
  Dropdown,
  Spin,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useProducts,
  useWarehouses,
  useAdjustStock,
  useStockMovements,
} from '@/lib/api/hooks/useInventory';
import type { ProductDto, StockAdjustmentDto, StockMovementDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
} from '@/lib/utils/sweetalert';

const { TextArea } = Input;

// Adjustment status for approval workflow (simulated in frontend for now)
type AdjustmentStatus = 'Pending' | 'Approved' | 'Rejected';

interface PendingAdjustment {
  id: string;
  productId: number;
  productCode: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  currentQuantity: number;
  newQuantity: number;
  difference: number;
  reason: string;
  notes?: string;
  status: AdjustmentStatus;
  createdAt: string;
  createdBy: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

const statusConfig: Record<AdjustmentStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: 'warning', label: 'Beklemede', icon: <ClockIcon className="w-4 h-4" /> },
  Approved: { color: 'success', label: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Rejected: { color: 'error', label: 'Reddedildi', icon: <XMarkIcon className="w-4 h-4" /> },
};

const adjustmentReasons = [
  { value: 'counting_difference', label: 'Sayım Farkı' },
  { value: 'damage', label: 'Hasar/Kırık' },
  { value: 'expiry', label: 'Son Kullanma Tarihi Geçmiş' },
  { value: 'theft_loss', label: 'Hırsızlık/Kayıp' },
  { value: 'system_error', label: 'Sistem Hatası Düzeltme' },
  { value: 'return', label: 'İade Düzeltmesi' },
  { value: 'bonus', label: 'Promosyon/Bonus' },
  { value: 'other', label: 'Diğer' },
];

export default function StockAdjustmentsPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  // State
  const [searchText, setSearchText] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<PendingAdjustment | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Simulated pending adjustments (in real app, these would come from backend)
  const [pendingAdjustments, setPendingAdjustments] = useState<PendingAdjustment[]>([]);

  // API Hooks
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts(true);
  const { data: warehouses = [] } = useWarehouses();
  const adjustStock = useAdjustStock();
  const { data: stockMovements = [], isLoading: movementsLoading } = useStockMovements();

  // Filter adjustment movements (AdjustmentIncrease and AdjustmentDecrease)
  const adjustmentMovements = useMemo(() => {
    return stockMovements.filter(
      (m: StockMovementDto) =>
        m.movementType === 'AdjustmentIncrease' || m.movementType === 'AdjustmentDecrease'
    );
  }, [stockMovements]);

  // Filter products for search
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !searchText ||
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.code.toLowerCase().includes(searchText.toLowerCase());
      return matchesSearch;
    });
  }, [products, searchText]);

  // Filter pending adjustments
  const filteredPendingAdjustments = useMemo(() => {
    return pendingAdjustments.filter((adj) => {
      const matchesSearch = !searchText ||
        adj.productName.toLowerCase().includes(searchText.toLowerCase()) ||
        adj.productCode.toLowerCase().includes(searchText.toLowerCase());
      const matchesWarehouse = !selectedWarehouse || adj.warehouseId === selectedWarehouse;
      const matchesTab = activeTab === 'all' ||
        (activeTab === 'pending' && adj.status === 'Pending') ||
        (activeTab === 'approved' && adj.status === 'Approved') ||
        (activeTab === 'rejected' && adj.status === 'Rejected');
      return matchesSearch && matchesWarehouse && matchesTab;
    });
  }, [pendingAdjustments, searchText, selectedWarehouse, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const pending = pendingAdjustments.filter((a) => a.status === 'Pending').length;
    const approved = pendingAdjustments.filter((a) => a.status === 'Approved').length;
    const rejected = pendingAdjustments.filter((a) => a.status === 'Rejected').length;
    const totalIncrease = pendingAdjustments
      .filter((a) => a.status === 'Approved' && a.difference > 0)
      .reduce((sum, a) => sum + a.difference, 0);
    const totalDecrease = pendingAdjustments
      .filter((a) => a.status === 'Approved' && a.difference < 0)
      .reduce((sum, a) => sum + Math.abs(a.difference), 0);

    return { pending, approved, rejected, totalIncrease, totalDecrease };
  }, [pendingAdjustments]);

  // Handlers
  const handleCreateAdjustment = () => {
    form.resetFields();
    setCreateModalOpen(true);
  };

  const handleSubmitAdjustment = async () => {
    try {
      const values = await form.validateFields();
      const product = products.find((p) => p.id === values.productId);
      const warehouse = warehouses.find((w) => w.id === values.warehouseId);

      if (!product || !warehouse) {
        showError('Ürün veya depo bulunamadı');
        return;
      }

      const currentQty = product.totalStockQuantity;
      const difference = values.newQuantity - currentQty;

      // Create pending adjustment
      const newAdjustment: PendingAdjustment = {
        id: `adj_${Date.now()}`,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        currentQuantity: currentQty,
        newQuantity: values.newQuantity,
        difference,
        reason: values.reason,
        notes: values.notes,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        createdBy: 'Kullanıcı',
      };

      setPendingAdjustments((prev) => [newAdjustment, ...prev]);
      setCreateModalOpen(false);
      showSuccess('Başarılı', 'Stok düzeltme talebi oluşturuldu ve onay bekliyor');
    } catch {
      showError('Form doğrulama hatası');
    }
  };

  const handleDirectAdjustment = async () => {
    try {
      const values = await form.validateFields();
      const product = products.find((p) => p.id === values.productId);

      if (!product) {
        showError('Ürün bulunamadı');
        return;
      }

      const adjustmentData: StockAdjustmentDto = {
        productId: values.productId,
        warehouseId: values.warehouseId,
        newQuantity: values.newQuantity,
        reason: values.reason,
        notes: values.notes,
      };

      await adjustStock.mutateAsync(adjustmentData);
      setCreateModalOpen(false);
      refetchProducts();
      showSuccess('Başarılı', 'Stok düzeltmesi başarıyla uygulandı');
    } catch {
      // Error handled by mutation
    }
  };

  const handleReviewClick = (adjustment: PendingAdjustment) => {
    setSelectedAdjustment(adjustment);
    setReviewNotes('');
    setReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedAdjustment) return;

    try {
      const adjustmentData: StockAdjustmentDto = {
        productId: selectedAdjustment.productId,
        warehouseId: selectedAdjustment.warehouseId,
        newQuantity: selectedAdjustment.newQuantity,
        reason: selectedAdjustment.reason,
        notes: `${selectedAdjustment.notes || ''}\n[Onay Notu: ${reviewNotes}]`,
      };

      await adjustStock.mutateAsync(adjustmentData);

      setPendingAdjustments((prev) =>
        prev.map((adj) =>
          adj.id === selectedAdjustment.id
            ? {
                ...adj,
                status: 'Approved' as AdjustmentStatus,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Onaylayan',
                reviewNotes,
              }
            : adj
        )
      );

      setReviewModalOpen(false);
      refetchProducts();
      showSuccess('Başarılı', 'Stok düzeltmesi onaylandı ve uygulandı');
    } catch {
      // Error handled by mutation
    }
  };

  const handleReject = () => {
    if (!selectedAdjustment) return;

    if (!reviewNotes.trim()) {
      showWarning('Uyarı', 'Reddetme sebebi girmelisiniz');
      return;
    }

    setPendingAdjustments((prev) =>
      prev.map((adj) =>
        adj.id === selectedAdjustment.id
          ? {
              ...adj,
              status: 'Rejected' as AdjustmentStatus,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Reddeden',
              reviewNotes,
            }
          : adj
      )
    );

    setReviewModalOpen(false);
    showInfo('Bilgi', 'Stok düzeltme talebi reddedildi');
  };

  const handleDeletePending = (id: string) => {
    setPendingAdjustments((prev) => prev.filter((adj) => adj.id !== id));
    showSuccess('Başarılı', 'Talep silindi');
  };

  // Pending adjustments columns
  const pendingColumns: ColumnsType<PendingAdjustment> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: record.difference > 0 ? '#10b98115' : '#ef444415' }}
          >
            {record.difference > 0 ? (
              <PlusCircleIcon className="w-4 h-4 text-emerald-500" />
            ) : (
              <MinusCircleIcon className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{record.productName}</div>
            <div className="text-xs text-slate-500">Kod: {record.productCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (name) => <span className="text-sm text-slate-600">{name}</span>,
    },
    {
      title: 'Mevcut',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      width: 100,
      align: 'right',
      render: (qty) => <span className="text-sm text-slate-600">{qty.toLocaleString('tr-TR')}</span>,
    },
    {
      title: 'Yeni',
      dataIndex: 'newQuantity',
      key: 'newQuantity',
      width: 100,
      align: 'right',
      render: (qty) => <span className="text-sm font-medium text-slate-900">{qty.toLocaleString('tr-TR')}</span>,
    },
    {
      title: 'Fark',
      dataIndex: 'difference',
      key: 'difference',
      width: 100,
      align: 'right',
      render: (diff) => (
        <span className={`text-sm font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-slate-500'}`}>
          {diff > 0 ? '+' : ''}{diff.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      width: 140,
      render: (reason) => {
        const reasonInfo = adjustmentReasons.find((r) => r.value === reason);
        return <span className="text-sm text-slate-600">{reasonInfo?.label || reason}</span>;
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date) => <span className="text-sm text-slate-500">{dayjs(date).format('DD.MM.YYYY HH:mm')}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: AdjustmentStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = record.status === 'Pending' ? [
          {
            key: 'review',
            icon: <CheckIcon className="w-4 h-4" />,
            label: 'İncele ve Onayla',
            onClick: () => handleReviewClick(record),
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDeletePending(record.id),
          },
        ] : [
          {
            key: 'detail',
            icon: <DocumentTextIcon className="w-4 h-4" />,
            label: 'Detay',
            onClick: () => handleReviewClick(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  // History columns (from stock movements)
  const historyColumns: ColumnsType<StockMovementDto> = [
    {
      title: 'Tarih',
      dataIndex: 'movementDate',
      key: 'movementDate',
      width: 140,
      render: (date) => <span className="text-sm text-slate-500">{dayjs(date).format('DD.MM.YYYY HH:mm')}</span>,
    },
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: record.movementType === 'AdjustmentIncrease' ? '#10b98115' : '#ef444415' }}
          >
            {record.movementType === 'AdjustmentIncrease' ? (
              <PlusCircleIcon className="w-4 h-4 text-emerald-500" />
            ) : (
              <MinusCircleIcon className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{record.productName}</div>
            <div className="text-xs text-slate-500">Kod: {record.productCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (name) => <span className="text-sm text-slate-600">{name}</span>,
    },
    {
      title: 'Tür',
      dataIndex: 'movementType',
      key: 'movementType',
      width: 100,
      render: (type) => (
        <Tag color={type === 'AdjustmentIncrease' ? 'success' : 'error'}>
          {type === 'AdjustmentIncrease' ? 'Artış' : 'Azalış'}
        </Tag>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (qty, record) => (
        <span className={`text-sm font-medium ${record.movementType === 'AdjustmentIncrease' ? 'text-green-600' : 'text-red-600'}`}>
          {record.movementType === 'AdjustmentIncrease' ? '+' : '-'}{qty.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc) => <span className="text-sm text-slate-600">{desc || '-'}</span>,
    },
    {
      title: 'Referans',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 120,
      render: (ref) => <span className="text-sm text-slate-500">{ref || '-'}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'detail',
                icon: <DocumentTextIcon className="w-4 h-4" />,
                label: 'Detay',
                onClick: () => router.push(`/inventory/stock-movements/${record.id}`),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'pending',
      label: (
        <span className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4" />
          Bekleyen ({stats.pending})
        </span>
      ),
    },
    {
      key: 'approved',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          Onaylanan ({stats.approved})
        </span>
      ),
    },
    {
      key: 'rejected',
      label: (
        <span className="flex items-center gap-2">
          <XMarkIcon className="w-4 h-4" />
          Reddedilen ({stats.rejected})
        </span>
      ),
    },
    {
      key: 'history',
      label: (
        <span className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4" />
          Geçmiş
        </span>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Bekleyen</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.pending}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stats.pending > 0 ? '#f59e0b15' : '#64748b15' }}>
              <ClockIcon className="w-4 h-4" style={{ color: stats.pending > 0 ? '#f59e0b' : '#64748b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Onaylanan</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.approved}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Reddedilen</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.rejected}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stats.rejected > 0 ? '#ef444415' : '#64748b15' }}>
              <XMarkIcon className="w-4 h-4" style={{ color: stats.rejected > 0 ? '#ef4444' : '#64748b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Artış</span>
              <div className="text-2xl font-semibold text-green-600">+{stats.totalIncrease.toLocaleString('tr-TR')}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <PlusCircleIcon className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Azalış</span>
              <div className="text-2xl font-semibold text-red-600">-{stats.totalDecrease.toLocaleString('tr-TR')}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10">
              <MinusCircleIcon className="w-4 h-4 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<PencilIcon className="w-4 h-4" />}
        iconColor="#8b5cf6"
        title="Stok Düzeltme"
        description="Stok miktarlarını düzeltin ve onay süreçlerini yönetin"
        itemCount={filteredPendingAdjustments.length}
        primaryAction={{
          label: 'Yeni Düzeltme',
          onClick: handleCreateAdjustment,
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetchProducts()}
            disabled={productsLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${productsLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            placeholder="Depo seçin"
            allowClear
            style={{ width: 200 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            options={warehouses.map((w) => ({
              value: w.id,
              label: w.name,
            }))}
          />
          <Input
            placeholder="Ürün ara... (ad, kod)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
            className="h-10"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      {productsLoading || movementsLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

          {activeTab !== 'history' ? (
            <Table
              columns={pendingColumns}
              dataSource={filteredPendingAdjustments}
              rowKey="id"
              loading={productsLoading}
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
              }}
            />
          ) : (
            <Table
              columns={historyColumns}
              dataSource={adjustmentMovements}
              rowKey="id"
              loading={movementsLoading}
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
              }}
            />
          )}
        </DataTableWrapper>
      )}

      {/* Create Adjustment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <PlusIcon className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">Yeni Stok Düzeltme</div>
              <div className="text-sm text-slate-500">Stok miktarını düzeltin</div>
            </div>
          </div>
        }
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSubmitAdjustment}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Onaya Gönder
            </button>
            <button
              onClick={handleDirectAdjustment}
              disabled={adjustStock.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {adjustStock.isPending ? 'Uygulanıyor...' : 'Direkt Uygula'}
            </button>
          </div>
        }
        width={700}
      >
        <Form form={form} layout="vertical" className="pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="productId"
              label="Ürün"
              rules={[{ required: true, message: 'Ürün seçiniz' }]}
            >
              <Select
                showSearch
                placeholder="Ürün ara ve seç"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={filteredProducts.map((p) => ({
                  value: p.id,
                  label: `${p.code} - ${p.name}`,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="warehouseId"
              label="Depo"
              rules={[{ required: true, message: 'Depo seçiniz' }]}
            >
              <Select
                placeholder="Depo seçin"
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              />
            </Form.Item>
          </div>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.productId !== cur.productId}>
            {({ getFieldValue }) => {
              const productId = getFieldValue('productId');
              const product = products.find((p) => p.id === productId);
              if (!product) return null;

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Mevcut Stok</span>
                      <div className="text-xl font-semibold text-slate-900">{product.totalStockQuantity}</div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Kullanılabilir</span>
                      <div className="text-xl font-semibold text-slate-900">{product.availableStockQuantity}</div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Min. Seviye</span>
                      <div className="text-xl font-semibold text-slate-900">{product.minStockLevel}</div>
                    </div>
                  </div>
                </div>
              );
            }}
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="newQuantity"
              label="Yeni Miktar"
              rules={[
                { required: true, message: 'Yeni miktar giriniz' },
                { type: 'number', min: 0, message: 'Miktar 0 veya daha büyük olmalı' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="Yeni stok miktarını girin"
              />
            </Form.Item>
            <Form.Item
              name="reason"
              label="Düzeltme Sebebi"
              rules={[{ required: true, message: 'Sebep seçiniz' }]}
            >
              <Select
                placeholder="Sebep seçin"
                options={adjustmentReasons}
              />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Notlar">
            <TextArea rows={3} placeholder="Ek açıklama veya not ekleyin..." />
          </Form.Item>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Onaya Gönder:</strong> Düzeltme talebi oluşturulur ve onay bekler.<br />
              <strong>Direkt Uygula:</strong> Düzeltme anında sisteme uygulanır.
            </div>
          </div>
        </Form>
      </Modal>

      {/* Review Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: selectedAdjustment?.status === 'Pending' ? '#f59e0b15' : '#8b5cf615' }}
            >
              {selectedAdjustment?.status === 'Pending' ? (
                <CheckIcon className="w-4 h-4" style={{ color: '#f59e0b' }} />
              ) : (
                <DocumentTextIcon className="w-4 h-4 text-violet-500" />
              )}
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">
                {selectedAdjustment?.status === 'Pending' ? 'Düzeltme Talebini İncele' : 'Düzeltme Detayı'}
              </div>
              <div className="text-sm text-slate-500">{selectedAdjustment?.productName}</div>
            </div>
          </div>
        }
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        footer={
          selectedAdjustment?.status === 'Pending' ? (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                Reddet
              </button>
              <button
                onClick={handleApprove}
                disabled={adjustStock.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {adjustStock.isPending ? 'Onaylanıyor...' : 'Onayla ve Uygula'}
              </button>
            </div>
          ) : (
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          )
        }
        width={600}
      >
        {selectedAdjustment && (
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Ürün</span>
                <div className="text-sm font-medium text-slate-900 mt-1">{selectedAdjustment.productName}</div>
                <div className="text-xs text-slate-500">{selectedAdjustment.productCode}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Depo</span>
                <div className="text-sm font-medium text-slate-900 mt-1">{selectedAdjustment.warehouseName}</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Mevcut Miktar</span>
                  <div className="text-xl font-semibold text-slate-900">{selectedAdjustment.currentQuantity}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Yeni Miktar</span>
                  <div className="text-xl font-semibold text-slate-900">{selectedAdjustment.newQuantity}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Fark</span>
                  <div
                    className={`text-xl font-semibold ${
                      selectedAdjustment.difference > 0
                        ? 'text-green-600'
                        : selectedAdjustment.difference < 0
                        ? 'text-red-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {selectedAdjustment.difference > 0 ? '+' : ''}
                    {selectedAdjustment.difference}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Sebep</span>
              <div className="text-sm font-medium text-slate-900 mt-1">
                {adjustmentReasons.find((r) => r.value === selectedAdjustment.reason)?.label ||
                  selectedAdjustment.reason}
              </div>
            </div>

            {selectedAdjustment.notes && (
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Notlar</span>
                <div className="text-sm text-slate-700 mt-1">{selectedAdjustment.notes}</div>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Oluşturulma</span>
              <div className="text-sm text-slate-700 mt-1">
                {dayjs(selectedAdjustment.createdAt).format('DD.MM.YYYY HH:mm')} - {selectedAdjustment.createdBy}
              </div>
            </div>

            {selectedAdjustment.reviewedAt && (
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  {selectedAdjustment.status === 'Approved' ? 'Onaylanma' : 'Reddedilme'}
                </span>
                <div className="text-sm text-slate-700 mt-1">
                  {dayjs(selectedAdjustment.reviewedAt).format('DD.MM.YYYY HH:mm')} - {selectedAdjustment.reviewedBy}
                </div>
                {selectedAdjustment.reviewNotes && (
                  <div className="text-sm text-slate-600 mt-1 bg-slate-50 p-3 rounded-lg">
                    {selectedAdjustment.reviewNotes}
                  </div>
                )}
              </div>
            )}

            {selectedAdjustment.status === 'Pending' && (
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">İnceleme Notu</span>
                <TextArea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Onay veya red sebebini yazın..."
                  className="mt-2"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
