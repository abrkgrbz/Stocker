'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Select,
  DatePicker,
  Progress,
  Form,
  Input,
  InputNumber,
  Tooltip,
  Alert,
  Tabs,
  Dropdown,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  InboxIcon,
  PlusIcon,
  ShieldCheckIcon,
  StopCircleIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useLotBatches,
  useLotBatch,
  useProducts,
  useSuppliers,
  useCreateLotBatch,
  useApproveLotBatch,
  useQuarantineLotBatch,
} from '@/lib/api/hooks/useInventory';
import type {
  LotBatchListDto,
  LotBatchDto,
  LotBatchStatus,
  LotBatchFilterDto,
  CreateLotBatchDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Monochrome color palette
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

// Lot batch status configuration with monochrome colors
const statusConfig: Record<LotBatchStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: '#64748b', bgColor: '#f1f5f9', label: 'Beklemede', icon: <ClockIcon className="w-4 h-4" /> },
  Received: { color: '#475569', bgColor: '#e2e8f0', label: 'Teslim Alındı', icon: <InboxIcon className="w-4 h-4" /> },
  Approved: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Quarantined: { color: '#334155', bgColor: '#f1f5f9', label: 'Karantinada', icon: <ExclamationCircleIcon className="w-4 h-4" /> },
  Rejected: { color: '#475569', bgColor: '#f1f5f9', label: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
  Exhausted: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Tükendi', icon: <TrashIcon className="w-4 h-4" /> },
  Expired: { color: '#64748b', bgColor: '#f1f5f9', label: 'Tarihi Geçti', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
  Recalled: { color: '#334155', bgColor: '#e2e8f0', label: 'Geri Çağrıldı', icon: <StopCircleIcon className="w-4 h-4" /> },
};

export default function LotBatchesPage() {
  const router = useRouter();

  // Filters
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<LotBatchStatus | undefined>();
  const [expiringWithinDays, setExpiringWithinDays] = useState<number | undefined>();
  const [expiredOnly, setExpiredOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [quarantineModalOpen, setQuarantineModalOpen] = useState(false);
  const [selectedLotBatchId, setSelectedLotBatchId] = useState<number | null>(null);

  // Forms
  const [createForm] = Form.useForm();
  const [quarantineForm] = Form.useForm();

  // Build filter based on active tab and filters
  const filter: LotBatchFilterDto = useMemo(() => {
    const baseFilter: LotBatchFilterDto = {
      productId: selectedProduct,
    };

    switch (activeTab) {
      case 'pending':
        return { ...baseFilter, status: 'Pending' as LotBatchStatus };
      case 'quarantine':
        return { ...baseFilter, status: 'Quarantined' as LotBatchStatus };
      case 'expiring':
        return { ...baseFilter, expiringWithinDays: expiringWithinDays || 30 };
      case 'expired':
        return { ...baseFilter, expiredOnly: true };
      default:
        return { ...baseFilter, status: selectedStatus };
    }
  }, [activeTab, selectedProduct, selectedStatus, expiringWithinDays]);

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  const { data: lotBatches = [], isLoading, refetch } = useLotBatches(filter);
  const { data: selectedLotBatch } = useLotBatch(selectedLotBatchId || 0);

  const createLotBatch = useCreateLotBatch();
  const approveLotBatch = useApproveLotBatch();
  const quarantineLotBatch = useQuarantineLotBatch();

  // Calculate stats
  const allBatches = useMemo(() => {
    return lotBatches;
  }, [lotBatches]);

  const stats = useMemo(() => {
    const total = allBatches.length;
    const pending = allBatches.filter(b => b.status === 'Pending').length;
    const quarantined = allBatches.filter(b => b.isQuarantined).length;
    const expired = allBatches.filter(b => b.isExpired).length;
    const expiringSoon = allBatches.filter(b => b.daysUntilExpiry !== undefined && b.daysUntilExpiry <= 30 && b.daysUntilExpiry > 0).length;
    const totalQuantity = allBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
    const availableQuantity = allBatches.reduce((sum, b) => sum + b.availableQuantity, 0);

    return { total, pending, quarantined, expired, expiringSoon, totalQuantity, availableQuantity };
  }, [allBatches]);

  // Handlers
  const handleViewDetail = (id: number) => {
    setSelectedLotBatchId(id);
    setDetailModalOpen(true);
  };

  const handleApprove = async (lotBatch: LotBatchListDto) => {
    Modal.confirm({
      title: 'Lot/Parti Onayla',
      content: `"${lotBatch.lotNumber}" lot/partisini onaylamak istediğinizden emin misiniz?`,
      okText: 'Onayla',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
      onOk: async () => {
        try {
          await approveLotBatch.mutateAsync(lotBatch.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleQuarantineClick = (lotBatch: LotBatchListDto) => {
    setSelectedLotBatchId(lotBatch.id);
    quarantineForm.resetFields();
    setQuarantineModalOpen(true);
  };

  const handleQuarantineConfirm = async () => {
    try {
      const values = await quarantineForm.validateFields();
      if (selectedLotBatchId) {
        await quarantineLotBatch.mutateAsync({
          id: selectedLotBatchId,
          request: { reason: values.reason },
        });
        setQuarantineModalOpen(false);
        quarantineForm.resetFields();
      }
    } catch (error) {
      // Validation error handled by form
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const data: CreateLotBatchDto = {
        lotNumber: values.lotNumber,
        productId: values.productId,
        initialQuantity: values.initialQuantity,
        supplierId: values.supplierId,
        supplierLotNumber: values.supplierLotNumber,
        manufacturedDate: values.manufacturedDate?.toISOString(),
        expiryDate: values.expiryDate?.toISOString(),
        certificateNumber: values.certificateNumber,
        notes: values.notes,
      };
      await createLotBatch.mutateAsync(data);
      setCreateModalOpen(false);
      createForm.resetFields();
    } catch (error) {
      // Error handled by hook or form validation
    }
  };

  // Table columns
  const columns: ColumnsType<LotBatchListDto> = [
    {
      title: 'Lot Numarası',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 150,
      render: (text: string, record) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleViewDetail(record.id)}
          >
            {text}
          </span>
          <div className="flex gap-1">
            {record.isExpired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                <ExclamationTriangleIcon className="w-4 h-4 text-xs" /> Süresi Doldu
              </span>
            )}
            {record.isQuarantined && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-300 text-slate-800">
                <ExclamationCircleIcon className="w-4 h-4 text-xs" /> Karantinada
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: LotBatchStatus) => {
        const config = statusConfig[status];
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-slate-900">Mevcut: <span className="font-semibold">{record.currentQuantity.toLocaleString('tr-TR')}</span></div>
          <div className="text-xs text-slate-500">
            Kullanılabilir: {record.availableQuantity.toLocaleString('tr-TR')}
          </div>
        </div>
      ),
    },
    {
      title: 'Son Kullanma Tarihi',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 160,
      render: (date: string | undefined, record) => {
        if (!date) return <span className="text-slate-400">-</span>;

        const expiryDate = dayjs(date);
        const daysLeft = record.daysUntilExpiry;

        let bgColor = '#f1f5f9';
        let textColor = '#64748b';
        if (record.isExpired) {
          bgColor = '#e2e8f0';
          textColor = '#334155';
        } else if (daysLeft !== undefined) {
          if (daysLeft <= 7) {
            bgColor = '#e2e8f0';
            textColor = '#1e293b';
          } else if (daysLeft <= 30) {
            bgColor = '#f1f5f9';
            textColor = '#475569';
          }
        }

        return (
          <div className="space-y-1">
            <div className="text-slate-900">{expiryDate.format('DD.MM.YYYY')}</div>
            {daysLeft !== undefined && !record.isExpired && (
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {daysLeft} gün kaldı
              </span>
            )}
            {record.isExpired && (
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: '#e2e8f0', color: '#1e293b' }}
              >
                Süresi Doldu
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Detay',
            onClick: () => handleViewDetail(record.id),
          },
        ];

        if (record.status === 'Pending' || record.status === 'Received') {
          menuItems.push({
            key: 'approve',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            label: 'Onayla',
            onClick: () => handleApprove(record),
          });
        }

        if (record.status !== 'Quarantined' && record.status !== 'Exhausted' && record.status !== 'Expired') {
          menuItems.push({
            key: 'quarantine',
            icon: <ExclamationCircleIcon className="w-4 h-4" />,
            label: 'Karantinaya Al',
            onClick: () => handleQuarantineClick(record),
          });
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
          >
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600 hover:text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  // Tab items
  const tabItems = [
    {
      key: 'all',
      label: (
        <span className="flex items-center gap-2">
          <InboxIcon className="w-4 h-4" />
          Tüm Lotlar
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.total}
          </span>
        </span>
      ),
    },
    {
      key: 'pending',
      label: (
        <span className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4" />
          Bekleyenler
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-300 text-slate-800">
            {stats.pending}
          </span>
        </span>
      ),
    },
    {
      key: 'quarantine',
      label: (
        <span className="flex items-center gap-2">
          <ExclamationCircleIcon className="w-4 h-4" />
          Karantina
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-400 text-white">
            {stats.quarantined}
          </span>
        </span>
      ),
    },
    {
      key: 'expiring',
      label: (
        <span className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4" />
          Süresi Yaklaşanlar
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-300 text-slate-800">
            {stats.expiringSoon}
          </span>
        </span>
      ),
    },
    {
      key: 'expired',
      label: (
        <span className="flex items-center gap-2">
          <StopCircleIcon className="w-4 h-4" />
          Süresi Dolanlar
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-500 text-white">
            {stats.expired}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lot/Parti Yönetimi</h1>
          <p className="text-slate-500 mt-1">Ürün lotlarını ve partilerini yönetin, son kullanma tarihlerini takip edin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setCreateModalOpen(true)}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Lot/Parti
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <InboxIcon className="w-4 h-4 text-lg text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Lot</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ClockIcon className="w-4 h-4 text-lg text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bekleyen</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <ExclamationCircleIcon className="w-4 h-4 text-lg text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.quarantined}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Karantina</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-4 h-4 text-lg text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.expiringSoon}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Süresi Yaklaşan</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
                <StopCircleIcon className="w-4 h-4 text-lg text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-500">{stats.expired}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Süresi Dolan</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ExperimentOutlined className="text-lg text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalQuantity.toLocaleString('tr-TR')}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Miktar</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.expired > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationTriangleIcon className="w-4 h-4" />}
          message={`${stats.expired} adet lot/partinin son kullanma tarihi geçmiş durumda!`}
          description="Bu lotları kontrol edin ve gerekli aksiyonları alın."
          className="mb-6 !border-slate-300 !bg-slate-100 [&_.ant-alert-message]:!text-slate-900 [&_.ant-alert-description]:!text-slate-600"
        />
      )}
      {stats.expiringSoon > 0 && stats.expired === 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<ClockIcon className="w-4 h-4" />}
          message={`${stats.expiringSoon} adet lot/partinin son kullanma tarihi yaklaşıyor!`}
          description="30 gün içinde süresi dolacak lotları kontrol edin."
          className="mb-6 !border-slate-300 !bg-slate-50 [&_.ant-alert-message]:!text-slate-900 [&_.ant-alert-description]:!text-slate-600"
        />
      )}

      {/* Tabs and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-6 [&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select
            placeholder="Ürün"
            allowClear
            style={{ width: 200 }}
            value={selectedProduct}
            onChange={setSelectedProduct}
            showSearch
            optionFilterProp="children"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          >
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </Select.Option>
            ))}
          </Select>

          {activeTab === 'all' && (
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: 150 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: config.bgColor, color: config.color }}
                  >
                    {config.label}
                  </span>
                </Select.Option>
              ))}
            </Select>
          )}

          {activeTab === 'expiring' && (
            <Select
              placeholder="Gün içinde"
              style={{ width: 130 }}
              value={expiringWithinDays || 30}
              onChange={setExpiringWithinDays}
              className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
            >
              <Select.Option value={7}>7 gün</Select.Option>
              <Select.Option value={14}>14 gün</Select.Option>
              <Select.Option value={30}>30 gün</Select.Option>
              <Select.Option value={60}>60 gün</Select.Option>
              <Select.Option value={90}>90 gün</Select.Option>
            </Select>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={lotBatches}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: lotBatches.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1000 }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>

      {/* Create Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Yeni Lot/Parti Oluştur</span>}
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Oluştur"
        cancelText="İptal"
        confirmLoading={createLotBatch.isPending}
        width={600}
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <Form
          form={createForm}
          layout="vertical"
          className="mt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="lotNumber"
              label={<span className="text-slate-700 font-medium">Lot Numarası</span>}
              rules={[{ required: true, message: 'Lot numarası gerekli' }]}
            >
              <Input placeholder="LOT-2024-001" className="!rounded-lg !border-slate-300" />
            </Form.Item>
            <Form.Item
              name="productId"
              label={<span className="text-slate-700 font-medium">Ürün</span>}
              rules={[{ required: true, message: 'Ürün seçimi gerekli' }]}
            >
              <Select
                placeholder="Ürün seçin"
                showSearch
                optionFilterProp="children"
                className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300"
              >
                {products.filter(p => p.trackLotNumbers).map((p) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="initialQuantity"
              label={<span className="text-slate-700 font-medium">Başlangıç Miktarı</span>}
              rules={[{ required: true, message: 'Miktar gerekli' }]}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="0"
                className="!rounded-lg [&_.ant-input-number-input]:!border-slate-300"
              />
            </Form.Item>
            <Form.Item
              name="supplierId"
              label={<span className="text-slate-700 font-medium">Tedarikçi</span>}
            >
              <Select
                placeholder="Tedarikçi seçin"
                allowClear
                showSearch
                optionFilterProp="children"
                className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300"
              >
                {suppliers.map((s) => (
                  <Select.Option key={s.id} value={s.id}>
                    {s.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="manufacturedDate"
              label={<span className="text-slate-700 font-medium">Üretim Tarihi</span>}
            >
              <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" className="!rounded-lg !border-slate-300" />
            </Form.Item>
            <Form.Item
              name="expiryDate"
              label={<span className="text-slate-700 font-medium">Son Kullanma Tarihi</span>}
            >
              <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" className="!rounded-lg !border-slate-300" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="supplierLotNumber"
              label={<span className="text-slate-700 font-medium">Tedarikçi Lot No</span>}
            >
              <Input placeholder="Tedarikçinin lot numarası" className="!rounded-lg !border-slate-300" />
            </Form.Item>
            <Form.Item
              name="certificateNumber"
              label={<span className="text-slate-700 font-medium">Sertifika No</span>}
            >
              <Input placeholder="Kalite sertifika numarası" className="!rounded-lg !border-slate-300" />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label={<span className="text-slate-700 font-medium">Notlar</span>}
          >
            <TextArea rows={3} placeholder="Lot hakkında ek bilgiler..." className="!rounded-lg !border-slate-300" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Lot Detayı: {selectedLotBatch?.lotNumber || ''}</span>}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedLotBatchId(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)} className="!border-slate-300 !text-slate-600">
            Kapat
          </Button>,
          selectedLotBatch?.status === 'Pending' || selectedLotBatch?.status === 'Received' ? (
            <Button
              key="approve"
              type="primary"
              icon={<CheckCircleIcon className="w-4 h-4" />}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              onClick={() => {
                if (selectedLotBatch) {
                  handleApprove(selectedLotBatch as unknown as LotBatchListDto);
                  setDetailModalOpen(false);
                }
              }}
            >
              Onayla
            </Button>
          ) : null,
        ]}
        width={700}
      >
        {selectedLotBatch && (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Lot Numarası</p>
                <p className="text-lg font-semibold text-slate-900">{selectedLotBatch.lotNumber}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Durum</p>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: statusConfig[selectedLotBatch.status].bgColor,
                    color: statusConfig[selectedLotBatch.status].color
                  }}
                >
                  {statusConfig[selectedLotBatch.status].icon}
                  {statusConfig[selectedLotBatch.status].label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ürün</p>
                <p className="font-semibold text-slate-900">{selectedLotBatch.productName}</p>
                <p className="text-sm text-slate-500">{selectedLotBatch.productCode}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Tedarikçi</p>
                <p className="text-slate-700">{selectedLotBatch.supplierName || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Başlangıç Miktarı</p>
                <p className="font-semibold text-slate-900">{selectedLotBatch.initialQuantity.toLocaleString('tr-TR')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Mevcut Miktar</p>
                <p className="font-semibold text-slate-900">{selectedLotBatch.currentQuantity.toLocaleString('tr-TR')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Kullanılabilir</p>
                <p className="font-semibold text-slate-900">{selectedLotBatch.availableQuantity.toLocaleString('tr-TR')}</p>
              </div>
            </div>

            {selectedLotBatch.reservedQuantity > 0 && (
              <Alert
                type="info"
                message={`${selectedLotBatch.reservedQuantity.toLocaleString('tr-TR')} adet rezerve edilmiş`}
                showIcon
                className="!border-slate-300 !bg-slate-50"
              />
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Üretim Tarihi</p>
                <p className="text-slate-700">
                  {selectedLotBatch.manufacturedDate
                    ? dayjs(selectedLotBatch.manufacturedDate).format('DD.MM.YYYY')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Son Kullanma Tarihi</p>
                <p className={selectedLotBatch.isExpired ? 'text-slate-900 font-semibold' : 'text-slate-700'}>
                  {selectedLotBatch.expiryDate
                    ? dayjs(selectedLotBatch.expiryDate).format('DD.MM.YYYY')
                    : '-'}
                </p>
                {selectedLotBatch.daysUntilExpiry !== undefined && !selectedLotBatch.isExpired && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    {selectedLotBatch.daysUntilExpiry} gün
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Teslim Tarihi</p>
                <p className="text-slate-700">
                  {selectedLotBatch.receivedDate
                    ? dayjs(selectedLotBatch.receivedDate).format('DD.MM.YYYY')
                    : '-'}
                </p>
              </div>
            </div>

            {selectedLotBatch.remainingShelfLifePercentage !== undefined && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Kalan Raf Ömrü</p>
                <Progress
                  percent={Math.round(selectedLotBatch.remainingShelfLifePercentage)}
                  status={selectedLotBatch.remainingShelfLifePercentage < 20 ? 'exception' : undefined}
                  strokeColor={selectedLotBatch.remainingShelfLifePercentage < 50 ? '#64748b' : '#334155'}
                  trailColor="#e2e8f0"
                />
              </div>
            )}

            {selectedLotBatch.isQuarantined && selectedLotBatch.quarantineReason && (
              <Alert
                type="warning"
                message="Karantina Sebebi"
                description={selectedLotBatch.quarantineReason}
                showIcon
                className="!border-slate-300 !bg-slate-50"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Tedarikçi Lot No</p>
                <p className="text-slate-700">{selectedLotBatch.supplierLotNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Sertifika No</p>
                <p className="text-slate-700">{selectedLotBatch.certificateNumber || '-'}</p>
              </div>
            </div>

            {selectedLotBatch.notes && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Notlar</p>
                <p className="text-slate-700">{selectedLotBatch.notes}</p>
              </div>
            )}

            {selectedLotBatch.inspectionNotes && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Denetim Notları</p>
                <p className="text-slate-700">{selectedLotBatch.inspectionNotes}</p>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4 mt-4">
              <p className="text-xs text-slate-400">
                Oluşturulma: {dayjs(selectedLotBatch.createdAt).format('DD.MM.YYYY HH:mm')}
                {selectedLotBatch.inspectedDate && (
                  <> | Denetim: {dayjs(selectedLotBatch.inspectedDate).format('DD.MM.YYYY HH:mm')}</>
                )}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Quarantine Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Karantinaya Al</span>}
        open={quarantineModalOpen}
        onCancel={() => {
          setQuarantineModalOpen(false);
          quarantineForm.resetFields();
        }}
        onOk={handleQuarantineConfirm}
        okText="Karantinaya Al"
        cancelText="İptal"
        confirmLoading={quarantineLotBatch.isPending}
        okButtonProps={{ danger: true }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <Alert
          type="warning"
          message="Bu işlem lot/partiyi karantinaya alacaktır"
          description="Karantinaya alınan lotlar satışa veya kullanıma kapalı olacaktır."
          className="mb-4 !border-slate-300 !bg-slate-50"
          showIcon
        />
        <Form form={quarantineForm} layout="vertical">
          <Form.Item
            name="reason"
            label={<span className="text-slate-700 font-medium">Karantina Sebebi</span>}
            rules={[{ required: true, message: 'Karantina sebebi gerekli' }]}
          >
            <TextArea
              rows={4}
              placeholder="Karantinaya alma sebebini açıklayın..."
              className="!rounded-lg !border-slate-300"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
