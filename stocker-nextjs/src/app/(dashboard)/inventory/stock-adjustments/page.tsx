'use client';

/**
 * Stock Adjustments Page
 * Inventory adjustments with real approval workflow
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Select,
  Modal,
  Tabs,
  Dropdown,
  Spin,
  Button,
  Space,
  Tag,
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
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useWarehouses,
  useInventoryAdjustments,
  useApproveInventoryAdjustment,
  useRejectInventoryAdjustment,
  useDeleteInventoryAdjustment,
  useStockMovements,
} from '@/lib/api/hooks/useInventory';
import type {
  InventoryAdjustmentDto,
  StockMovementDto,
  InventoryAdjustmentFilterDto
} from '@/lib/api/services/inventory.types';
import { AdjustmentStatus } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  showSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';

const { TextArea } = Input;

// Adjustment reason labels
const adjustmentReasonLabels: Record<string, string> = {
  StockCountVariance: 'Sayım Farkı',
  Damage: 'Hasar',
  Loss: 'Kayıp',
  Theft: 'Hırsızlık',
  ProductionScrap: 'Üretim Fire',
  Expired: 'Son Kullanma Tarihi',
  QualityRejection: 'Kalite Reddi',
  CustomerReturn: 'Müşteri İadesi',
  SupplierReturn: 'Tedarikçi İadesi',
  SystemCorrection: 'Sistem Düzeltmesi',
  OpeningStock: 'Açılış Stoğu',
  Other: 'Diğer',
};

// Adjustment type labels
const adjustmentTypeLabels: Record<string, string> = {
  Increase: 'Artış',
  Decrease: 'Azalış',
  Correction: 'Düzeltme',
  Scrap: 'Fire',
  InternalTransfer: 'Dahili Transfer',
};

// Status labels and colors
const statusConfig: Record<number, { label: string; color: string; bgColor: string }> = {
  [AdjustmentStatus.Draft]: { label: 'Taslak', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  [AdjustmentStatus.PendingApproval]: { label: 'Onay Bekliyor', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  [AdjustmentStatus.Approved]: { label: 'Onaylandı', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  [AdjustmentStatus.Rejected]: { label: 'Reddedildi', color: 'text-red-700', bgColor: 'bg-red-100' },
  [AdjustmentStatus.Processed]: { label: 'İşlendi', color: 'text-slate-900', bgColor: 'bg-slate-200' },
  [AdjustmentStatus.Cancelled]: { label: 'İptal', color: 'text-slate-500', bgColor: 'bg-slate-100' },
};

export default function StockAdjustmentsPage() {
  const router = useRouter();

  // State
  const [searchText, setSearchText] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<AdjustmentStatus | undefined>();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<InventoryAdjustmentDto | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Build filter
  const filter: InventoryAdjustmentFilterDto = useMemo(() => ({
    warehouseId: selectedWarehouse,
    status: selectedStatus,
  }), [selectedWarehouse, selectedStatus]);

  // API Hooks
  const { data: warehouses = [] } = useWarehouses();
  const { data: adjustments = [], isLoading: adjustmentsLoading, refetch } = useInventoryAdjustments(filter);
  const { data: stockMovements = [], isLoading: movementsLoading } = useStockMovements();
  const approveAdjustment = useApproveInventoryAdjustment();
  const rejectAdjustment = useRejectInventoryAdjustment();
  const deleteAdjustment = useDeleteInventoryAdjustment();

  // Filter adjustment movements (AdjustmentIncrease and AdjustmentDecrease)
  const adjustmentMovements = useMemo(() => {
    return stockMovements.filter(
      (m: StockMovementDto) =>
        m.movementType === 'AdjustmentIncrease' || m.movementType === 'AdjustmentDecrease'
    );
  }, [stockMovements]);

  // Filter adjustments by tab and search
  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((adj) => {
      // Search filter
      const matchesSearch = !searchText ||
        adj.adjustmentNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        adj.warehouseName?.toLowerCase().includes(searchText.toLowerCase());

      // Tab filter
      let matchesTab = true;
      if (activeTab === 'pending') {
        matchesTab = adj.status === AdjustmentStatus.PendingApproval;
      } else if (activeTab === 'approved') {
        matchesTab = adj.status === AdjustmentStatus.Approved || adj.status === AdjustmentStatus.Processed;
      } else if (activeTab === 'rejected') {
        matchesTab = adj.status === AdjustmentStatus.Rejected;
      } else if (activeTab === 'draft') {
        matchesTab = adj.status === AdjustmentStatus.Draft;
      }

      return matchesSearch && matchesTab;
    });
  }, [adjustments, searchText, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const draft = adjustments.filter((a) => a.status === AdjustmentStatus.Draft).length;
    const pending = adjustments.filter((a) => a.status === AdjustmentStatus.PendingApproval).length;
    const approved = adjustments.filter((a) => a.status === AdjustmentStatus.Approved || a.status === AdjustmentStatus.Processed).length;
    const rejected = adjustments.filter((a) => a.status === AdjustmentStatus.Rejected).length;
    const totalCostImpact = adjustments
      .filter((a) => a.status === AdjustmentStatus.Processed)
      .reduce((sum, a) => sum + a.totalCostImpact, 0);

    return { draft, pending, approved, rejected, totalCostImpact };
  }, [adjustments]);

  // Handlers
  const handleCreateAdjustment = () => {
    router.push('/inventory/stock-adjustments/new');
  };

  const handleReviewClick = (adjustment: InventoryAdjustmentDto) => {
    setSelectedAdjustment(adjustment);
    setReviewNotes('');
    setReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedAdjustment) return;

    try {
      await approveAdjustment.mutateAsync({
        id: selectedAdjustment.id,
        data: { approvedBy: 'Kullanıcı' }, // TODO: Get from auth context
      });
      setReviewModalOpen(false);
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleReject = async () => {
    if (!selectedAdjustment) return;

    if (!reviewNotes.trim()) {
      showError('Ret nedeni belirtmelisiniz');
      return;
    }

    try {
      await rejectAdjustment.mutateAsync({
        id: selectedAdjustment.id,
        data: {
          rejectedBy: 'Kullanıcı', // TODO: Get from auth context
          reason: reviewNotes
        },
      });
      setReviewModalOpen(false);
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async (adjustment: InventoryAdjustmentDto) => {
    const confirmed = await confirmDelete('Stok Düzeltme', adjustment.adjustmentNumber);
    if (confirmed) {
      try {
        await deleteAdjustment.mutateAsync(adjustment.id);
        refetch();
      } catch {
        // Error handled by mutation
      }
    }
  };

  // Tab items
  const tabItems = [
    {
      key: 'pending',
      label: (
        <span className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4" />
          Onay Bekleyen ({stats.pending})
        </span>
      ),
    },
    {
      key: 'draft',
      label: (
        <span className="flex items-center gap-2">
          <DocumentTextIcon className="w-4 h-4" />
          Taslak ({stats.draft})
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
          <DocumentTextIcon className="w-4 h-4" />
          Hareket Geçmişi
        </span>
      ),
    },
  ];

  // Adjustments table columns
  const adjustmentColumns: ColumnsType<InventoryAdjustmentDto> = [
    {
      title: 'Düzeltme No',
      dataIndex: 'adjustmentNumber',
      key: 'adjustmentNumber',
      width: 150,
      render: (number: string) => (
        <span className="font-mono text-sm font-medium text-slate-900">{number}</span>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'adjustmentDate',
      key: 'adjustmentDate',
      width: 120,
      render: (date: string) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (name: string) => (
        <span className="text-sm text-slate-600">{name || '-'}</span>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'adjustmentType',
      key: 'adjustmentType',
      width: 120,
      render: (type: string) => (
        <span className="text-sm text-slate-600">
          {adjustmentTypeLabels[type] || type}
        </span>
      ),
    },
    {
      title: 'Neden',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (reason: string) => (
        <span className="text-sm text-slate-600">
          {adjustmentReasonLabels[reason] || reason}
        </span>
      ),
    },
    {
      title: 'Kalem Sayısı',
      key: 'itemCount',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          {record.items?.length || 0}
        </span>
      ),
    },
    {
      title: 'Maliyet Etkisi',
      dataIndex: 'totalCostImpact',
      key: 'totalCostImpact',
      width: 130,
      align: 'right',
      render: (cost: number, record) => (
        <span className={`text-sm font-medium ${cost >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {cost >= 0 ? '+' : ''}{cost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: AdjustmentStatus) => {
        const config = statusConfig[status] || statusConfig[AdjustmentStatus.Draft];
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.color}`}>
            {config.label}
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
        const menuItems = [
          {
            key: 'view',
            icon: <DocumentTextIcon className="w-4 h-4" />,
            label: 'Detay',
            onClick: () => handleReviewClick(record),
          },
        ];

        // Add approve/reject for pending
        if (record.status === AdjustmentStatus.PendingApproval) {
          menuItems.push(
            {
              key: 'approve',
              icon: <CheckIcon className="w-4 h-4" />,
              label: 'Onayla',
              onClick: () => handleReviewClick(record),
            },
          );
        }

        // Add delete for draft
        if (record.status === AdjustmentStatus.Draft) {
          menuItems.push({
            key: 'delete',
            icon: <XMarkIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          } as typeof menuItems[0]);
        }

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

  // History table columns
  const historyColumns: ColumnsType<StockMovementDto> = [
    {
      title: 'Belge No',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      width: 150,
      render: (number: string) => (
        <span className="font-mono text-sm font-medium text-slate-900">{number}</span>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'movementDate',
      key: 'movementDate',
      width: 120,
      render: (date: string) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY HH:mm')}</span>
      ),
    },
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string) => (
        <span className="text-sm text-slate-900">{name || '-'}</span>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (name: string) => (
        <span className="text-sm text-slate-600">{name || '-'}</span>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'movementType',
      key: 'movementType',
      width: 150,
      render: (type: string) => (
        <Tag color={type === 'AdjustmentIncrease' ? 'green' : 'red'}>
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
      render: (qty: number, record) => (
        <span className={`font-medium ${record.movementType === 'AdjustmentIncrease' ? 'text-emerald-600' : 'text-red-600'}`}>
          {record.movementType === 'AdjustmentIncrease' ? '+' : '-'}{Math.abs(qty)}
        </span>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => (
        <span className="text-sm text-slate-500">{desc || '-'}</span>
      ),
    },
  ];

  const isLoading = adjustmentsLoading || movementsLoading;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Düzeltme</h1>
          <p className="text-slate-500 mt-1">Stok düzeltmelerini yönetin ve onay süreçlerini takip edin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
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
            Yeni Düzeltme
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.draft}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Taslak</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.pending}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onay Bekleyen</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.approved}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onaylanan</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XMarkIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.rejected}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Reddedilen</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              {stats.totalCostImpact >= 0 ? (
                <PlusCircleIcon className="w-5 h-5 text-emerald-600" />
              ) : (
                <MinusCircleIcon className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
          <div className={`text-2xl font-bold ${stats.totalCostImpact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {stats.totalCostImpact >= 0 ? '+' : ''}{stats.totalCostImpact.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Maliyet Etkisi</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
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
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Input
            placeholder="Düzeltme no, depo ara..."
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
      {isLoading ? (
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
              columns={adjustmentColumns}
              dataSource={filteredAdjustments}
              rowKey="id"
              loading={adjustmentsLoading}
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
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
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
              }}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            />
          )}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">Düzeltme Detayı</div>
              <div className="text-sm text-slate-500">{selectedAdjustment?.adjustmentNumber}</div>
            </div>
          </div>
        }
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        footer={
          selectedAdjustment?.status === AdjustmentStatus.PendingApproval ? (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Kapat
              </button>
              <button
                onClick={handleReject}
                disabled={rejectAdjustment.isPending}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
              >
                {rejectAdjustment.isPending ? 'İşleniyor...' : 'Reddet'}
              </button>
              <button
                onClick={handleApprove}
                disabled={approveAdjustment.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                {approveAdjustment.isPending ? 'Onaylanıyor...' : 'Onayla'}
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
        width={700}
      >
        {selectedAdjustment && (
          <div className="pt-4 space-y-4">
            {/* Adjustment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Depo</span>
                <div className="text-lg font-semibold text-slate-900">{selectedAdjustment.warehouseName || '-'}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Tarih</span>
                <div className="text-lg font-semibold text-slate-900">
                  {dayjs(selectedAdjustment.adjustmentDate).format('DD.MM.YYYY')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Düzeltme Türü</span>
                <div className="text-lg font-semibold text-slate-900">
                  {adjustmentTypeLabels[selectedAdjustment.adjustmentType] || selectedAdjustment.adjustmentType}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Neden</span>
                <div className="text-lg font-semibold text-slate-900">
                  {adjustmentReasonLabels[selectedAdjustment.reason] || selectedAdjustment.reason}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Maliyet Etkisi</span>
              <div className={`text-2xl font-bold ${selectedAdjustment.totalCostImpact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {selectedAdjustment.totalCostImpact >= 0 ? '+' : ''}
                {selectedAdjustment.totalCostImpact.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {selectedAdjustment.currency}
              </div>
            </div>

            {/* Items */}
            {selectedAdjustment.items && selectedAdjustment.items.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Düzeltme Kalemleri</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Ürün</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-slate-500 uppercase">Sistem</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-slate-500 uppercase">Gerçek</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-slate-500 uppercase">Fark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAdjustment.items.map((item) => (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="px-3 py-2">{item.productName || `Ürün #${item.productId}`}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{item.systemQuantity}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{item.actualQuantity}</td>
                          <td className={`px-3 py-2 text-right font-medium ${item.varianceQuantity >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {item.varianceQuantity >= 0 ? '+' : ''}{item.varianceQuantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Description */}
            {selectedAdjustment.description && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Açıklama</span>
                <div className="text-sm text-slate-700 mt-1">{selectedAdjustment.description}</div>
              </div>
            )}

            {/* Approval status info */}
            {selectedAdjustment.approvedBy && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  {selectedAdjustment.status === AdjustmentStatus.Rejected ? 'Reddeden' : 'Onaylayan'}
                </span>
                <div className="text-sm text-slate-700 mt-1">
                  {selectedAdjustment.approvedBy} - {dayjs(selectedAdjustment.approvedDate).format('DD.MM.YYYY HH:mm')}
                </div>
                {selectedAdjustment.rejectionReason && (
                  <div className="text-sm text-red-600 mt-2">
                    Ret Nedeni: {selectedAdjustment.rejectionReason}
                  </div>
                )}
              </div>
            )}

            {/* Review notes for rejection */}
            {selectedAdjustment.status === AdjustmentStatus.PendingApproval && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Değerlendirme Notu (Ret için zorunlu)
                </label>
                <TextArea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  placeholder="Değerlendirme notunuz..."
                  className="!rounded-lg !border-slate-300"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
