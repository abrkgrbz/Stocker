'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Dropdown,
  Spin,
  Alert,
  Select,
  Modal,
  InputNumber,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableEmptyState } from '@/components/primitives';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useConsignmentStocks,
  useDeleteConsignmentStock,
  useSuspendConsignmentStock,
  useReactivateConsignmentStock,
  useCloseConsignmentStock,
  useRecordConsignmentSale,
} from '@/lib/api/hooks/useInventory';
import type { ConsignmentStockDto } from '@/lib/api/services/inventory.types';
import { ConsignmentStatus } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const statusConfig: Record<string, { color: string; label: string }> = {
  Active: { color: 'success', label: 'Aktif' },
  Suspended: { color: 'warning', label: 'Askıda' },
  Depleted: { color: 'default', label: 'Tükenmiş' },
  Returned: { color: 'processing', label: 'İade Edildi' },
  Closed: { color: 'default', label: 'Kapalı' },
};

export default function ConsignmentStocksPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConsignmentStatus | undefined>(undefined);

  const { data: consignmentStocks, isLoading, error } = useConsignmentStocks({
    status: statusFilter,
  });
  const deleteConsignment = useDeleteConsignmentStock();
  const suspendConsignment = useSuspendConsignmentStock();
  const reactivateConsignment = useReactivateConsignmentStock();
  const closeConsignment = useCloseConsignmentStock();
  const recordSale = useRecordConsignmentSale();

  // Sale modal state
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState<ConsignmentStockDto | null>(null);
  const [saleQuantity, setSaleQuantity] = useState<number>(1);
  const [saleNotes, setSaleNotes] = useState('');

  const filteredData = useMemo(() => {
    if (!consignmentStocks) return [];
    return consignmentStocks.filter((item) => {
      const searchLower = searchText.toLowerCase();
      return (
        item.consignmentNumber?.toLowerCase().includes(searchLower) ||
        item.supplierName?.toLowerCase().includes(searchLower) ||
        item.productName?.toLowerCase().includes(searchLower) ||
        item.warehouseName?.toLowerCase().includes(searchLower)
      );
    });
  }, [consignmentStocks, searchText]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu konsinye stok kaydını silmek istediğinizden emin misiniz?')) {
      deleteConsignment.mutate(id);
    }
  };

  const handleSuspend = (id: number) => {
    suspendConsignment.mutate(id);
  };

  const handleReactivate = (id: number) => {
    reactivateConsignment.mutate(id);
  };

  const handleClose = (id: number) => {
    if (window.confirm('Bu konsinye anlaşmasını kapatmak istediğinizden emin misiniz?')) {
      closeConsignment.mutate(id);
    }
  };

  const openSaleModal = (record: ConsignmentStockDto) => {
    setSelectedConsignment(record);
    setSaleQuantity(1);
    setSaleNotes('');
    setSaleModalOpen(true);
  };

  const handleRecordSale = async () => {
    if (!selectedConsignment) return;
    try {
      await recordSale.mutateAsync({
        id: selectedConsignment.id,
        quantity: saleQuantity,
        notes: saleNotes || undefined,
      });
      setSaleModalOpen(false);
      setSelectedConsignment(null);
    } catch {
      // Error handled by hook
    }
  };

  const columns: ColumnsType<ConsignmentStockDto> = [
    {
      title: 'Konsinye No',
      dataIndex: 'consignmentNumber',
      key: 'consignmentNumber',
      sorter: (a, b) => (a.consignmentNumber || '').localeCompare(b.consignmentNumber || ''),
      render: (text, record) => (
        <div>
          <a
            onClick={() => router.push(`/inventory/consignment-stocks/${record.id}`)}
            className="text-sm font-medium text-slate-900 hover:text-blue-600 cursor-pointer"
          >
            {text}
          </a>
        </div>
      ),
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      sorter: (a, b) => (a.supplierName || '').localeCompare(b.supplierName || ''),
      render: (text) => <span className="text-sm text-slate-600">{text}</span>,
    },
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a, b) => (a.productName || '').localeCompare(b.productName || ''),
      render: (text) => (
        <div className="text-sm font-medium text-slate-900">{text}</div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      render: (text) => <span className="text-sm text-slate-600">{text}</span>,
    },
    {
      title: 'Miktar',
      key: 'quantity',
      align: 'right',
      render: (_, record) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">
            {record.currentQuantity?.toLocaleString('tr-TR')}
          </div>
          <div className="text-xs text-slate-500">
            Başlangıç: {record.initialQuantity?.toLocaleString('tr-TR')}
          </div>
        </div>
      ),
    },
    {
      title: 'Birim Maliyet',
      dataIndex: 'unitCost',
      key: 'unitCost',
      align: 'right',
      render: (value, record) => (
        <span className="text-sm text-slate-600">
          {value?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Toplam Değer',
      key: 'totalValue',
      align: 'right',
      render: (_, record) => {
        const total = (record.currentQuantity || 0) * (record.unitCost || 0);
        return (
          <span className="text-sm font-semibold text-slate-900">
            {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.Active;
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Anlaşma Tarihi',
      dataIndex: 'agreementDate',
      key: 'agreementDate',
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD/MM/YYYY') : '-'}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => router.push(`/inventory/consignment-stocks/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/inventory/consignment-stocks/${record.id}/edit`),
                disabled: record.status === 'Closed',
              },
              { type: 'divider' },
              ...(record.status === 'Active' && (record.currentQuantity || 0) > 0
                ? [
                    {
                      key: 'recordSale',
                      label: 'Satış Kaydet',
                      onClick: () => openSaleModal(record),
                    },
                  ]
                : []),
              ...(record.status === 'Active'
                ? [
                    {
                      key: 'suspend',
                      label: 'Askıya Al',
                      onClick: () => handleSuspend(record.id),
                    },
                  ]
                : []),
              ...(record.status === 'Suspended'
                ? [
                    {
                      key: 'reactivate',
                      label: 'Yeniden Aktif Et',
                      onClick: () => handleReactivate(record.id),
                    },
                  ]
                : []),
              ...(record.status !== 'Closed'
                ? [
                    {
                      key: 'close',
                      label: 'Anlaşmayı Kapat',
                      onClick: () => handleClose(record.id),
                      danger: true,
                    },
                  ]
                : []),
              { type: 'divider' },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record.id),
                disabled: record.status !== 'Active' && record.status !== 'Suspended',
              },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<EllipsisHorizontalIcon className="w-5 h-5" />}
            className="text-slate-400 hover:text-slate-600"
          />
        </Dropdown>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-8">
        <Alert
          message="Hata"
          description="Konsinye stoklar yüklenirken bir hata oluştu."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BuildingStorefrontIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 m-0">Konsinye Stoklar</h1>
              <p className="text-sm text-slate-500 m-0">
                Tedarikçiye ait stok takibi ve yönetimi
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/inventory/consignment-stocks/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Konsinye
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-6 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="Ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64 !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              allowClear
            />
            <Select
              placeholder="Durum"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              allowClear
              className="w-40 [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              options={[
                { value: ConsignmentStatus.Active, label: 'Aktif' },
                { value: ConsignmentStatus.Suspended, label: 'Askıda' },
                { value: ConsignmentStatus.Depleted, label: 'Tükenmiş' },
                { value: ConsignmentStatus.Returned, label: 'İade Edildi' },
                { value: ConsignmentStatus.Closed, label: 'Kapalı' },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
              }}
              locale={{
                emptyText: <TableEmptyState
                  icon={BuildingStorefrontIcon}
                  title="Konsinye stok bulunamadi"
                  description="Henuz konsinye stok eklenmemis veya filtrelere uygun kayit yok."
                />
              }}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
            />
          )}
        </div>
      </div>

      {/* Sale Record Modal */}
      <Modal
        title={
          <span className="text-slate-900 font-semibold">Satış Kaydet: {selectedConsignment?.productName}</span>
        }
        open={saleModalOpen}
        onOk={handleRecordSale}
        onCancel={() => {
          setSaleModalOpen(false);
          setSelectedConsignment(null);
        }}
        confirmLoading={recordSale.isPending}
        okText="Kaydet"
        cancelText="İptal"
        okButtonProps={{ style: { background: '#1e293b', borderColor: '#1e293b' } }}
      >
        {selectedConsignment && (
          <div className="py-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-slate-500">Konsinye No:</span>
                <span className="font-medium text-slate-900">{selectedConsignment.consignmentNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500">Tedarikçi:</span>
                <span className="font-medium text-slate-900">{selectedConsignment.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mevcut Miktar:</span>
                <span className="font-medium text-slate-900">{selectedConsignment.currentQuantity}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-2">Satış Miktarı:</p>
              <InputNumber
                value={saleQuantity}
                onChange={(val) => setSaleQuantity(val || 1)}
                min={1}
                max={selectedConsignment.currentQuantity || 1}
                style={{ width: '100%' }}
                size="large"
              />
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-2">Not (opsiyonel):</p>
              <Input.TextArea
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                rows={2}
                placeholder="Satış notu..."
              />
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
              <div className="flex justify-between">
                <span>Satış Tutarı:</span>
                <span className="font-semibold">
                  {(saleQuantity * (selectedConsignment.unitCost || 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {selectedConsignment.currency}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
