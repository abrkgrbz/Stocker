'use client';

/**
 * Stock Adjustments Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Tabs,
  Dropdown,
  Spin,
  Button,
  Space,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
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
import type { StockAdjustmentDto, StockMovementDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
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

const adjustmentReasons = [
  { value: 'counting_difference', label: 'Sayim Farki' },
  { value: 'damage', label: 'Hasar/Kirik' },
  { value: 'expiry', label: 'Son Kullanma Tarihi Gecmis' },
  { value: 'theft_loss', label: 'Hirsizlik/Kayip' },
  { value: 'system_error', label: 'Sistem Hatasi Duzeltme' },
  { value: 'return', label: 'Iade Duzeltmesi' },
  { value: 'bonus', label: 'Promosyon/Bonus' },
  { value: 'other', label: 'Diger' },
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
        showError('Urun veya depo bulunamadi');
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
        createdBy: 'Kullanici',
      };

      setPendingAdjustments((prev) => [newAdjustment, ...prev]);
      setCreateModalOpen(false);
      showSuccess('Basarili', 'Stok duzeltme talebi olusturuldu ve onay bekliyor');
    } catch {
      showError('Form dogrulama hatasi');
    }
  };

  const handleDirectAdjustment = async () => {
    try {
      const values = await form.validateFields();
      const product = products.find((p) => p.id === values.productId);

      if (!product) {
        showError('Urun bulunamadi');
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
      showSuccess('Basarili', 'Stok duzeltmesi basariyla uygulandi');
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
      showSuccess('Basarili', 'Stok duzeltmesi onaylandi ve uygulandi');
    } catch {
      // Error handled by mutation
    }
  };

  const handleReject = () => {
    if (!selectedAdjustment) return;

    if (!reviewNotes.trim()) {
      showWarning('Uyari', 'Reddetme sebebi girmelisiniz');
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
    showInfo('Bilgi', 'Stok duzeltme talebi reddedildi');
  };

  const handleDeletePending = (id: string) => {
    setPendingAdjustments((prev) => prev.filter((adj) => adj.id !== id));
    showSuccess('Basarili', 'Talep silindi');
  };

  // Pending adjustments columns
  const pendingColumns: ColumnsType<PendingAdjustment> = [
    {
      title: 'Urun',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            {record.difference > 0 ? (
              <PlusCircleIcon className="w-4 h-4 text-slate-600" />
            ) : (
              <MinusCircleIcon className="w-4 h-4 text-slate-600" />
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
        <span className={`text-sm font-medium ${diff > 0 ? 'text-slate-900' : diff < 0 ? 'text-slate-700' : 'text-slate-500'}`}>
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
        const statusStyles: Record<AdjustmentStatus, { bg: string; text: string; label: string }> = {
          Pending: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Beklemede' },
          Approved: { bg: 'bg-slate-900', text: 'text-white', label: 'Onaylandi' },
          Rejected: { bg: 'bg-slate-400', text: 'text-white', label: 'Reddedildi' },
        };
        const style = statusStyles[status];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${style.bg} ${style.text}`}>
            {status === 'Pending' && <ClockIcon className="w-3 h-3" />}
            {status === 'Approved' && <CheckCircleIcon className="w-3 h-3" />}
            {status === 'Rejected' && <XMarkIcon className="w-3 h-3" />}
            {style.label}
          </span>
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
            label: 'Incele ve Onayla',
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
      title: 'Urun',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            {record.movementType === 'AdjustmentIncrease' ? (
              <PlusCircleIcon className="w-4 h-4 text-slate-600" />
            ) : (
              <MinusCircleIcon className="w-4 h-4 text-slate-600" />
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
      title: 'Tur',
      dataIndex: 'movementType',
      key: 'movementType',
      width: 100,
      render: (type) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
          type === 'AdjustmentIncrease' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {type === 'AdjustmentIncrease' ? 'Artis' : 'Azalis'}
        </span>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (qty, record) => (
        <span className="text-sm font-medium text-slate-900">
          {record.movementType === 'AdjustmentIncrease' ? '+' : '-'}{qty.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Aciklama',
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
          Gecmis
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Duzeltme</h1>
          <p className="text-slate-500 mt-1">Stok miktarlarini duzeltin ve onay sureclerini yonetin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetchProducts()}
            disabled={productsLoading}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={handleCreateAdjustment}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Duzeltme
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.pending}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bekleyen</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.approved}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onaylanan</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
              <XMarkIcon className="w-5 h-5 text-slate-800" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.rejected}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Reddedilen</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <PlusCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">+{stats.totalIncrease.toLocaleString('tr-TR')}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Artis</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <MinusCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">-{stats.totalDecrease.toLocaleString('tr-TR')}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Azalis</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            placeholder="Depo secin"
            allowClear
            style={{ width: 200 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            options={warehouses.map((w) => ({
              value: w.id,
              label: w.name,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Input
            placeholder="Urun ara... (ad, kod)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
            className="!rounded-lg !border-slate-300"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      {productsLoading || movementsLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="mb-6 [&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
          />

          {activeTab !== 'history' ? (
            <Table
              columns={pendingColumns}
              dataSource={filteredPendingAdjustments}
              rowKey="id"
              loading={productsLoading}
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayit`,
              }}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
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
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayit`,
              }}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            />
          )}
        </div>
      )}

      {/* Create Adjustment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <PlusIcon className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">Yeni Stok Duzeltme</div>
              <div className="text-sm text-slate-500">Stok miktarini duzeltin</div>
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
              Iptal
            </button>
            <button
              onClick={handleSubmitAdjustment}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Onaya Gonder
            </button>
            <button
              onClick={handleDirectAdjustment}
              disabled={adjustStock.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {adjustStock.isPending ? 'Uygulaniyor...' : 'Direkt Uygula'}
            </button>
          </div>
        }
        width={700}
      >
        <Form form={form} layout="vertical" className="pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="productId"
              label={<span className="text-slate-700 font-medium">Urun</span>}
              rules={[{ required: true, message: 'Urun seciniz' }]}
            >
              <Select
                showSearch
                placeholder="Urun ara ve sec"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={filteredProducts.map((p) => ({
                  value: p.id,
                  label: `${p.code} - ${p.name}`,
                }))}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="warehouseId"
              label={<span className="text-slate-700 font-medium">Depo</span>}
              rules={[{ required: true, message: 'Depo seciniz' }]}
            >
              <Select
                placeholder="Depo secin"
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
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
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Kullanilabilir</span>
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
              label={<span className="text-slate-700 font-medium">Yeni Miktar</span>}
              rules={[
                { required: true, message: 'Yeni miktar giriniz' },
                { type: 'number', min: 0, message: 'Miktar 0 veya daha buyuk olmali' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="Yeni stok miktari"
                className="!rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="reason"
              label={<span className="text-slate-700 font-medium">Duzeltme Sebebi</span>}
              rules={[{ required: true, message: 'Sebep seciniz' }]}
            >
              <Select
                placeholder="Sebep secin"
                options={adjustmentReasons}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label={<span className="text-slate-700 font-medium">Notlar</span>}
          >
            <TextArea
              rows={3}
              placeholder="Ek aciklamalar..."
              className="!rounded-lg !border-slate-300"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Review Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">Duzeltme Detayi</div>
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
                Kapat
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                Reddet
              </button>
              <button
                onClick={handleApprove}
                disabled={adjustStock.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                {adjustStock.isPending ? 'Onaylaniyor...' : 'Onayla'}
              </button>
            </div>
          ) : (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          )
        }
        width={600}
      >
        {selectedAdjustment && (
          <div className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Mevcut Miktar</span>
                <div className="text-xl font-semibold text-slate-900">{selectedAdjustment.currentQuantity}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Yeni Miktar</span>
                <div className="text-xl font-semibold text-slate-900">{selectedAdjustment.newQuantity}</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Fark</span>
              <div className={`text-xl font-semibold ${selectedAdjustment.difference > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                {selectedAdjustment.difference > 0 ? '+' : ''}{selectedAdjustment.difference}
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Depo</span>
                <div className="text-sm text-slate-900">{selectedAdjustment.warehouseName}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Sebep</span>
                <div className="text-sm text-slate-900">
                  {adjustmentReasons.find((r) => r.value === selectedAdjustment.reason)?.label || selectedAdjustment.reason}
                </div>
              </div>
              {selectedAdjustment.notes && (
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Notlar</span>
                  <div className="text-sm text-slate-900">{selectedAdjustment.notes}</div>
                </div>
              )}
            </div>

            {selectedAdjustment.status === 'Pending' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Inceleme Notu
                </label>
                <TextArea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  placeholder="Onay veya ret aciklamasi..."
                  className="!rounded-lg !border-slate-300"
                />
              </div>
            )}

            {selectedAdjustment.reviewNotes && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Inceleme Notu</span>
                <div className="text-sm text-slate-900 mt-1">{selectedAdjustment.reviewNotes}</div>
                <div className="text-xs text-slate-500 mt-2">
                  {selectedAdjustment.reviewedBy} - {dayjs(selectedAdjustment.reviewedAt).format('DD.MM.YYYY HH:mm')}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
