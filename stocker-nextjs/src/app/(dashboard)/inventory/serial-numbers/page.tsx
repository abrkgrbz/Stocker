'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Dropdown,
  Select,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Tooltip,
  Alert,
  Tabs,
  Badge,
  message,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  BarcodeOutlined,
  ShoppingOutlined,
  ToolOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  RollbackOutlined,
  ShoppingCartOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import {
  useSerialNumbers,
  useSerialNumber,
  useProducts,
  useWarehouses,
  useCreateSerialNumber,
  useReceiveSerialNumber,
  useReserveSerialNumber,
  useReleaseSerialNumber,
  useSellSerialNumber,
  useMarkSerialNumberDefective,
  useScrapSerialNumber,
} from '@/lib/api/hooks/useInventory';
import type {
  SerialNumberListDto,
  SerialNumberDto,
  SerialNumberStatus,
  SerialNumberFilterDto,
  CreateSerialNumberDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Monochrome color palette
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

// Serial number status configuration - monochrome
const statusConfig: Record<SerialNumberStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Available: { color: '#1e293b', label: 'Mevcut', icon: <CheckCircleOutlined /> },
  InStock: { color: '#334155', label: 'Stokta', icon: <BarcodeOutlined /> },
  Reserved: { color: '#475569', label: 'Rezerve', icon: <LockOutlined /> },
  Sold: { color: '#64748b', label: 'Satıldı', icon: <ShoppingOutlined /> },
  Returned: { color: '#94a3b8', label: 'İade', icon: <RollbackOutlined /> },
  Defective: { color: '#cbd5e1', label: 'Arızalı', icon: <ExclamationCircleOutlined /> },
  InRepair: { color: '#475569', label: 'Tamirde', icon: <ToolOutlined /> },
  Scrapped: { color: '#1e293b', label: 'Hurda', icon: <DeleteOutlined /> },
  Lost: { color: '#94a3b8', label: 'Kayıp', icon: <WarningOutlined /> },
  OnLoan: { color: '#64748b', label: 'Ödünç', icon: <ShoppingCartOutlined /> },
  InTransit: { color: '#334155', label: 'Taşımada', icon: <ClockCircleOutlined /> },
};

export default function SerialNumbersPage() {
  const router = useRouter();

  // Filters
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<SerialNumberStatus | undefined>();
  const [underWarrantyOnly, setUnderWarrantyOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchSerial, setSearchSerial] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [defectiveModalOpen, setDefectiveModalOpen] = useState(false);
  const [selectedSerialId, setSelectedSerialId] = useState<number | null>(null);

  // Forms
  const [createForm] = Form.useForm();
  const [sellForm] = Form.useForm();
  const [reserveForm] = Form.useForm();
  const [defectiveForm] = Form.useForm();

  // Build filter based on active tab and filters
  const filter: SerialNumberFilterDto = useMemo(() => {
    const baseFilter: SerialNumberFilterDto = {
      productId: selectedProduct,
      warehouseId: selectedWarehouse,
    };

    switch (activeTab) {
      case 'available':
        return { ...baseFilter, status: 'Available' as SerialNumberStatus };
      case 'reserved':
        return { ...baseFilter, status: 'Reserved' as SerialNumberStatus };
      case 'sold':
        return { ...baseFilter, status: 'Sold' as SerialNumberStatus };
      case 'warranty':
        return { ...baseFilter, underWarrantyOnly: true };
      case 'defective':
        return { ...baseFilter, status: 'Defective' as SerialNumberStatus };
      default:
        return { ...baseFilter, status: selectedStatus, underWarrantyOnly };
    }
  }, [activeTab, selectedProduct, selectedWarehouse, selectedStatus, underWarrantyOnly]);

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: serialNumbers = [], isLoading, refetch } = useSerialNumbers(filter);
  const { data: selectedSerial } = useSerialNumber(selectedSerialId || 0);

  const createSerialNumber = useCreateSerialNumber();
  const receiveSerialNumber = useReceiveSerialNumber();
  const reserveSerialNumber = useReserveSerialNumber();
  const releaseSerialNumber = useReleaseSerialNumber();
  const sellSerialNumber = useSellSerialNumber();
  const markDefective = useMarkSerialNumberDefective();
  const scrapSerialNumber = useScrapSerialNumber();

  // Filter by search
  const filteredSerialNumbers = useMemo(() => {
    if (!searchSerial) return serialNumbers;
    const searchLower = searchSerial.toLowerCase();
    return serialNumbers.filter(
      (s) =>
        s.serial.toLowerCase().includes(searchLower) ||
        s.productCode.toLowerCase().includes(searchLower) ||
        s.productName.toLowerCase().includes(searchLower)
    );
  }, [serialNumbers, searchSerial]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = serialNumbers.length;
    const available = serialNumbers.filter(s => s.status === 'Available' || s.status === 'InStock').length;
    const reserved = serialNumbers.filter(s => s.status === 'Reserved').length;
    const sold = serialNumbers.filter(s => s.status === 'Sold').length;
    const defective = serialNumbers.filter(s => s.status === 'Defective' || s.status === 'InRepair').length;
    const underWarranty = serialNumbers.filter(s => s.isUnderWarranty).length;

    return { total, available, reserved, sold, defective, underWarranty };
  }, [serialNumbers]);

  // Handlers
  const handleViewDetail = (id: number) => {
    setSelectedSerialId(id);
    setDetailModalOpen(true);
  };

  const handleReceive = async (serial: SerialNumberListDto) => {
    Modal.confirm({
      title: 'Seri Numarasını Teslim Al',
      content: `"${serial.serial}" seri numarasını teslim almak istediğinizden emin misiniz?`,
      okText: 'Teslim Al',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-slate-900 !border-slate-900' },
      onOk: async () => {
        try {
          await receiveSerialNumber.mutateAsync({ id: serial.id });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleReserveClick = (serial: SerialNumberListDto) => {
    setSelectedSerialId(serial.id);
    reserveForm.resetFields();
    setReserveModalOpen(true);
  };

  const handleReserveConfirm = async () => {
    try {
      const values = await reserveForm.validateFields();
      if (selectedSerialId) {
        await reserveSerialNumber.mutateAsync({
          id: selectedSerialId,
          request: { salesOrderId: values.salesOrderId },
        });
        setReserveModalOpen(false);
        reserveForm.resetFields();
      }
    } catch (error) {
      // Validation error handled by form
    }
  };

  const handleRelease = async (serial: SerialNumberListDto) => {
    Modal.confirm({
      title: 'Rezervasyonu Kaldır',
      content: `"${serial.serial}" seri numarasının rezervasyonunu kaldırmak istediğinizden emin misiniz?`,
      okText: 'Kaldır',
      cancelText: 'İptal',
      okButtonProps: { className: '!bg-slate-900 !border-slate-900' },
      onOk: async () => {
        try {
          await releaseSerialNumber.mutateAsync(serial.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleSellClick = (serial: SerialNumberListDto) => {
    setSelectedSerialId(serial.id);
    sellForm.resetFields();
    setSellModalOpen(true);
  };

  const handleSellConfirm = async () => {
    try {
      const values = await sellForm.validateFields();
      if (selectedSerialId) {
        await sellSerialNumber.mutateAsync({
          id: selectedSerialId,
          request: {
            customerId: values.customerId,
            salesOrderId: values.salesOrderId,
            warrantyMonths: values.warrantyMonths,
          },
        });
        setSellModalOpen(false);
        sellForm.resetFields();
      }
    } catch (error) {
      // Validation error handled by form
    }
  };

  const handleDefectiveClick = (serial: SerialNumberListDto) => {
    setSelectedSerialId(serial.id);
    defectiveForm.resetFields();
    setDefectiveModalOpen(true);
  };

  const handleDefectiveConfirm = async () => {
    try {
      const values = await defectiveForm.validateFields();
      if (selectedSerialId) {
        await markDefective.mutateAsync({
          id: selectedSerialId,
          request: { reason: values.reason },
        });
        setDefectiveModalOpen(false);
        defectiveForm.resetFields();
      }
    } catch (error) {
      // Validation error handled by form
    }
  };

  const handleScrap = async (serial: SerialNumberListDto) => {
    Modal.confirm({
      title: 'Hurda Olarak İşaretle',
      content: `"${serial.serial}" seri numarasını hurda olarak işaretlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Hurda İşaretle',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await scrapSerialNumber.mutateAsync({ id: serial.id });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const data: CreateSerialNumberDto = {
        serial: values.serial,
        productId: values.productId,
        warehouseId: values.warehouseId,
        locationId: values.locationId,
        manufacturedDate: values.manufacturedDate?.toISOString(),
        batchNumber: values.batchNumber,
        supplierSerial: values.supplierSerial,
        notes: values.notes,
      };
      await createSerialNumber.mutateAsync(data);
      setCreateModalOpen(false);
      createForm.resetFields();
    } catch (error) {
      // Error handled by hook or form validation
    }
  };

  // Table columns
  const columns: ColumnsType<SerialNumberListDto> = [
    {
      title: 'Seri Numarası',
      dataIndex: 'serial',
      key: 'serial',
      width: 180,
      render: (text: string, record) => (
        <div>
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleViewDetail(record.id)}
          >
            {text}
          </span>
          {record.isUnderWarranty && (
            <div className="mt-1">
              <Tag className="text-xs bg-slate-900 text-white border-none">
                <SafetyCertificateOutlined className="mr-1" />
                Garanti: {record.remainingWarrantyDays} gün
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <span className="font-semibold text-slate-900">{record.productName}</span>
          <br />
          <span className="text-xs text-slate-500">{record.productCode}</span>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: SerialNumberStatus) => {
        const config = statusConfig[status];
        return (
          <Tag style={{ backgroundColor: config.color, color: '#fff', border: 'none', fontWeight: 500 }}>
            {config.icon} {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (text: string | undefined) => text || <span className="text-slate-400">-</span>,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: any[] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Detay',
            onClick: () => handleViewDetail(record.id),
          },
        ];

        // Status-based actions
        if (record.status === 'Available') {
          menuItems.push({
            key: 'receive',
            icon: <CheckCircleOutlined />,
            label: 'Teslim Al',
            onClick: () => handleReceive(record),
          });
        }

        if (record.status === 'InStock' || record.status === 'Available') {
          menuItems.push({
            key: 'reserve',
            icon: <LockOutlined />,
            label: 'Rezerve Et',
            onClick: () => handleReserveClick(record),
          });
          menuItems.push({
            key: 'sell',
            icon: <ShoppingOutlined />,
            label: 'Sat',
            onClick: () => handleSellClick(record),
          });
        }

        if (record.status === 'Reserved') {
          menuItems.push({
            key: 'release',
            icon: <UnlockOutlined />,
            label: 'Rezervasyonu Kaldır',
            onClick: () => handleRelease(record),
          });
          menuItems.push({
            key: 'sell',
            icon: <ShoppingOutlined />,
            label: 'Sat',
            onClick: () => handleSellClick(record),
          });
        }

        if (record.status !== 'Defective' && record.status !== 'Scrapped' && record.status !== 'Sold') {
          menuItems.push({
            key: 'defective',
            icon: <ExclamationCircleOutlined />,
            label: 'Arızalı İşaretle',
            onClick: () => handleDefectiveClick(record),
          });
        }

        if (record.status === 'Defective') {
          menuItems.push({
            key: 'scrap',
            icon: <DeleteOutlined />,
            label: 'Hurda İşaretle',
            danger: true,
            onClick: () => handleScrap(record),
          });
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
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
          <BarcodeOutlined />
          Tümü
          <Badge count={stats.total} showZero style={{ backgroundColor: '#1e293b' }} />
        </span>
      ),
    },
    {
      key: 'available',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Mevcut
          <Badge count={stats.available} showZero style={{ backgroundColor: '#334155' }} />
        </span>
      ),
    },
    {
      key: 'reserved',
      label: (
        <span className="flex items-center gap-2">
          <LockOutlined />
          Rezerve
          <Badge count={stats.reserved} showZero style={{ backgroundColor: '#475569' }} />
        </span>
      ),
    },
    {
      key: 'sold',
      label: (
        <span className="flex items-center gap-2">
          <ShoppingOutlined />
          Satılan
          <Badge count={stats.sold} showZero style={{ backgroundColor: '#64748b' }} />
        </span>
      ),
    },
    {
      key: 'warranty',
      label: (
        <span className="flex items-center gap-2">
          <SafetyCertificateOutlined />
          Garantili
          <Badge count={stats.underWarranty} showZero style={{ backgroundColor: '#1e293b' }} />
        </span>
      ),
    },
    {
      key: 'defective',
      label: (
        <span className="flex items-center gap-2">
          <ExclamationCircleOutlined />
          Arızalı
          <Badge count={stats.defective} showZero style={{ backgroundColor: '#94a3b8' }} />
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <BarcodeOutlined className="text-white text-lg" />
            </div>
            Seri Numarası Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Ürün seri numaralarını takip edin ve yönetin</p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            className="!border-slate-200 !text-slate-600 hover:!text-slate-900 hover:!border-slate-300"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Seri Numarası
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BarcodeOutlined className="text-slate-600 text-lg" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-500 mt-1">Toplam</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <CheckCircleOutlined className="text-white text-lg" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.available}</div>
            <div className="text-xs text-slate-500 mt-1">Mevcut</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <LockOutlined className="text-slate-600 text-lg" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.reserved}</div>
            <div className="text-xs text-slate-500 mt-1">Rezerve</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ShoppingOutlined className="text-slate-600 text-lg" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.sold}</div>
            <div className="text-xs text-slate-500 mt-1">Satılan</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <SafetyCertificateOutlined className="text-slate-600 text-lg" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.underWarranty}</div>
            <div className="text-xs text-slate-500 mt-1">Garantili</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ExclamationCircleOutlined className="text-slate-600 text-lg" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.defective}</div>
            <div className="text-xs text-slate-500 mt-1">Arızalı</div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-4 [&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />

        {/* Filters */}
        <Space wrap className="mb-4">
          <Input
            placeholder="Seri numarası ara..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchSerial}
            onChange={(e) => setSearchSerial(e.target.value)}
            className="w-52 [&_.ant-input]:!border-slate-200"
            allowClear
          />

          <Select
            placeholder="Ürün"
            allowClear
            className="w-52 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
            value={selectedProduct}
            onChange={setSelectedProduct}
            showSearch
            optionFilterProp="children"
          >
            {products.filter(p => p.trackSerialNumbers).map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Depo"
            allowClear
            className="w-40 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
          >
            {warehouses.map((w) => (
              <Select.Option key={w.id} value={w.id}>
                {w.name}
              </Select.Option>
            ))}
          </Select>

          {activeTab === 'all' && (
            <Select
              placeholder="Durum"
              allowClear
              className="w-36 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  <Tag style={{ backgroundColor: config.color, color: '#fff', border: 'none' }}>{config.label}</Tag>
                </Select.Option>
              ))}
            </Select>
          )}
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredSerialNumbers}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: filteredSerialNumbers.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 900 }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
        />
      </div>

      {/* Create Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Yeni Seri Numarası Ekle</span>}
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Ekle"
        cancelText="İptal"
        confirmLoading={createSerialNumber.isPending}
        width={600}
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
      >
        <Form
          form={createForm}
          layout="vertical"
          className="mt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="serial"
              label={<span className="text-slate-700">Seri Numarası</span>}
              rules={[{ required: true, message: 'Seri numarası gerekli' }]}
            >
              <Input placeholder="SN-2024-00001" className="!border-slate-200 !rounded-lg" />
            </Form.Item>
            <Form.Item
              name="productId"
              label={<span className="text-slate-700">Ürün</span>}
              rules={[{ required: true, message: 'Ürün seçimi gerekli' }]}
            >
              <Select
                placeholder="Ürün seçin"
                showSearch
                optionFilterProp="children"
                className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
              >
                {products.filter(p => p.trackSerialNumbers).map((p) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="warehouseId"
              label={<span className="text-slate-700">Depo</span>}
            >
              <Select placeholder="Depo seçin" allowClear className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg">
                {warehouses.map((w) => (
                  <Select.Option key={w.id} value={w.id}>
                    {w.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="manufacturedDate"
              label={<span className="text-slate-700">Üretim Tarihi</span>}
            >
              <DatePicker className="w-full !border-slate-200 !rounded-lg" format="DD.MM.YYYY" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="batchNumber"
              label={<span className="text-slate-700">Parti/Lot Numarası</span>}
            >
              <Input placeholder="LOT-2024-001" className="!border-slate-200 !rounded-lg" />
            </Form.Item>
            <Form.Item
              name="supplierSerial"
              label={<span className="text-slate-700">Tedarikçi Seri No</span>}
            >
              <Input placeholder="Tedarikçinin seri numarası" className="!border-slate-200 !rounded-lg" />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label={<span className="text-slate-700">Notlar</span>}
          >
            <TextArea rows={3} placeholder="Seri numarası hakkında ek bilgiler..." className="!border-slate-200 !rounded-lg" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Seri Numarası Detayı: {selectedSerial?.serial || ''}</span>}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedSerialId(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)} className="!border-slate-200">
            Kapat
          </Button>,
        ]}
        width={700}
      >
        {selectedSerial && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500">Seri Numarası</span>
                <div className="text-lg font-semibold text-slate-900">{selectedSerial.serial}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Durum</span>
                <div>
                  <Tag style={{ backgroundColor: statusConfig[selectedSerial.status].color, color: '#fff', border: 'none', fontWeight: 500 }}>
                    {statusConfig[selectedSerial.status].icon} {statusConfig[selectedSerial.status].label}
                  </Tag>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500">Ürün</span>
                <div>
                  <span className="font-semibold text-slate-900">{selectedSerial.productName}</span>
                  <br />
                  <span className="text-slate-500 text-sm">{selectedSerial.productCode}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Depo / Konum</span>
                <div>
                  <span className="text-slate-900">{selectedSerial.warehouseName || '-'}</span>
                  {selectedSerial.locationName && (
                    <>
                      <br />
                      <span className="text-slate-500 text-sm">{selectedSerial.locationName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedSerial.isUnderWarranty && (
              <Alert
                type="success"
                message="Garanti Kapsamında"
                description={`${selectedSerial.remainingWarrantyDays} gün garanti süresi kaldı`}
                icon={<SafetyCertificateOutlined />}
                showIcon
                className="!bg-slate-50 !border-slate-200"
              />
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-slate-500">Üretim Tarihi</span>
                <div className="text-slate-900">
                  {selectedSerial.manufacturedDate
                    ? dayjs(selectedSerial.manufacturedDate).format('DD.MM.YYYY')
                    : '-'}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Teslim Tarihi</span>
                <div className="text-slate-900">
                  {selectedSerial.receivedDate
                    ? dayjs(selectedSerial.receivedDate).format('DD.MM.YYYY')
                    : '-'}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Satış Tarihi</span>
                <div className="text-slate-900">
                  {selectedSerial.soldDate
                    ? dayjs(selectedSerial.soldDate).format('DD.MM.YYYY')
                    : '-'}
                </div>
              </div>
            </div>

            {(selectedSerial.warrantyStartDate || selectedSerial.warrantyEndDate) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500">Garanti Başlangıç</span>
                  <div className="text-slate-900">
                    {selectedSerial.warrantyStartDate
                      ? dayjs(selectedSerial.warrantyStartDate).format('DD.MM.YYYY')
                      : '-'}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Garanti Bitiş</span>
                  <div className="text-slate-900">
                    {selectedSerial.warrantyEndDate
                      ? dayjs(selectedSerial.warrantyEndDate).format('DD.MM.YYYY')
                      : '-'}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-slate-500">Parti/Lot No</span>
                <div className="text-slate-900">{selectedSerial.batchNumber || '-'}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Tedarikçi Seri No</span>
                <div className="text-slate-900">{selectedSerial.supplierSerial || '-'}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Müşteri ID</span>
                <div className="text-slate-900">{selectedSerial.customerId || '-'}</div>
              </div>
            </div>

            {(selectedSerial.salesOrderId || selectedSerial.purchaseOrderId) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500">Satış Siparişi</span>
                  <div className="text-slate-900">{selectedSerial.salesOrderId || '-'}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Satınalma Siparişi</span>
                  <div className="text-slate-900">{selectedSerial.purchaseOrderId || '-'}</div>
                </div>
              </div>
            )}

            {selectedSerial.notes && (
              <div>
                <span className="text-xs text-slate-500">Notlar</span>
                <div className="text-slate-900">{selectedSerial.notes}</div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4 mt-4">
              <span className="text-xs text-slate-400">
                Oluşturulma: {dayjs(selectedSerial.createdAt).format('DD.MM.YYYY HH:mm')}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Sell Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Seri Numarasını Sat</span>}
        open={sellModalOpen}
        onCancel={() => {
          setSellModalOpen(false);
          sellForm.resetFields();
        }}
        onOk={handleSellConfirm}
        okText="Sat"
        cancelText="İptal"
        confirmLoading={sellSerialNumber.isPending}
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
      >
        <Form form={sellForm} layout="vertical" className="mt-4">
          <Form.Item
            name="customerId"
            label={<span className="text-slate-700">Müşteri ID</span>}
            rules={[{ required: true, message: 'Müşteri ID gerekli' }]}
          >
            <Input placeholder="Müşteri ID girin" className="!border-slate-200 !rounded-lg" />
          </Form.Item>
          <Form.Item
            name="salesOrderId"
            label={<span className="text-slate-700">Satış Siparişi No</span>}
            rules={[{ required: true, message: 'Satış siparişi numarası gerekli' }]}
          >
            <Input placeholder="Satış siparişi numarası" className="!border-slate-200 !rounded-lg" />
          </Form.Item>
          <Form.Item
            name="warrantyMonths"
            label={<span className="text-slate-700">Garanti Süresi (Ay)</span>}
          >
            <InputNumber min={0} max={120} className="w-full !border-slate-200 !rounded-lg" placeholder="12" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reserve Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Seri Numarasını Rezerve Et</span>}
        open={reserveModalOpen}
        onCancel={() => {
          setReserveModalOpen(false);
          reserveForm.resetFields();
        }}
        onOk={handleReserveConfirm}
        okText="Rezerve Et"
        cancelText="İptal"
        confirmLoading={reserveSerialNumber.isPending}
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
      >
        <Form form={reserveForm} layout="vertical" className="mt-4">
          <Form.Item
            name="salesOrderId"
            label={<span className="text-slate-700">Satış Siparişi No</span>}
            rules={[{ required: true, message: 'Satış siparişi numarası gerekli' }]}
          >
            <Input placeholder="Satış siparişi numarası" className="!border-slate-200 !rounded-lg" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Defective Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Arızalı Olarak İşaretle</span>}
        open={defectiveModalOpen}
        onCancel={() => {
          setDefectiveModalOpen(false);
          defectiveForm.resetFields();
        }}
        onOk={handleDefectiveConfirm}
        okText="Arızalı İşaretle"
        cancelText="İptal"
        confirmLoading={markDefective.isPending}
        okButtonProps={{ danger: true }}
      >
        <Alert
          type="warning"
          message="Bu işlem seri numarasını arızalı olarak işaretleyecektir"
          description="Arızalı seri numaraları satışa kapalı olacaktır."
          className="mb-4 !bg-slate-50 !border-slate-300"
          showIcon
        />
        <Form form={defectiveForm} layout="vertical">
          <Form.Item
            name="reason"
            label={<span className="text-slate-700">Arıza Sebebi</span>}
          >
            <TextArea
              rows={4}
              placeholder="Arıza sebebini açıklayın..."
              className="!border-slate-200 !rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
