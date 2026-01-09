'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Table,
  Modal,
  Dropdown,
  Select,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Alert,
  Tabs,
} from 'antd';
import {
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TrashIcon,
  WrenchIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
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
  SerialNumberStatus,
  SerialNumberFilterDto,
  CreateSerialNumberDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Serial number status configuration - monochrome
const statusConfig: Record<SerialNumberStatus, { bgColor: string; textColor: string; label: string; icon: React.ReactNode }> = {
  Available: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'Mevcut', icon: <CheckCircleIcon className="w-3 h-3" /> },
  InStock: { bgColor: 'bg-slate-800', textColor: 'text-white', label: 'Stokta', icon: <QrCodeIcon className="w-3 h-3" /> },
  Reserved: { bgColor: 'bg-slate-700', textColor: 'text-white', label: 'Rezerve', icon: <LockClosedIcon className="w-3 h-3" /> },
  Sold: { bgColor: 'bg-slate-600', textColor: 'text-white', label: 'Satildi', icon: <ShoppingBagIcon className="w-3 h-3" /> },
  Returned: { bgColor: 'bg-slate-400', textColor: 'text-white', label: 'Iade', icon: <ArrowUturnLeftIcon className="w-3 h-3" /> },
  Defective: { bgColor: 'bg-slate-300', textColor: 'text-slate-800', label: 'Arizali', icon: <ExclamationCircleIcon className="w-3 h-3" /> },
  InRepair: { bgColor: 'bg-slate-500', textColor: 'text-white', label: 'Tamirde', icon: <WrenchIcon className="w-3 h-3" /> },
  Scrapped: { bgColor: 'bg-slate-200', textColor: 'text-slate-700', label: 'Hurda', icon: <TrashIcon className="w-3 h-3" /> },
  Lost: { bgColor: 'bg-slate-300', textColor: 'text-slate-800', label: 'Kayip', icon: <ExclamationTriangleIcon className="w-3 h-3" /> },
  OnLoan: { bgColor: 'bg-slate-500', textColor: 'text-white', label: 'Odunc', icon: <ShoppingCartIcon className="w-3 h-3" /> },
  InTransit: { bgColor: 'bg-slate-600', textColor: 'text-white', label: 'Tasimada', icon: <ClockIcon className="w-3 h-3" /> },
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
      title: 'Seri Numarasini Teslim Al',
      content: `"${serial.serial}" seri numarasini teslim almak istediginizden emin misiniz?`,
      okText: 'Teslim Al',
      cancelText: 'Iptal',
      okButtonProps: { className: '!bg-slate-900 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await receiveSerialNumber.mutateAsync({ id: serial.id });
        } catch {
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
    } catch {
      // Validation error handled by form
    }
  };

  const handleRelease = async (serial: SerialNumberListDto) => {
    Modal.confirm({
      title: 'Rezervasyonu Kaldir',
      content: `"${serial.serial}" seri numarasinin rezervasyonunu kaldirmak istediginizden emin misiniz?`,
      okText: 'Kaldir',
      cancelText: 'Iptal',
      okButtonProps: { className: '!bg-slate-900 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await releaseSerialNumber.mutateAsync(serial.id);
        } catch {
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
    } catch {
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
    } catch {
      // Validation error handled by form
    }
  };

  const handleScrap = async (serial: SerialNumberListDto) => {
    Modal.confirm({
      title: 'Hurda Olarak Isaretle',
      content: `"${serial.serial}" seri numarasini hurda olarak isaretlemek istediginizden emin misiniz? Bu islem geri alinamaz.`,
      okText: 'Hurda Isaretle',
      cancelText: 'Iptal',
      okButtonProps: { danger: true },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await scrapSerialNumber.mutateAsync({ id: serial.id });
        } catch {
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
    } catch {
      // Error handled by hook or form validation
    }
  };

  // Table columns
  const columns: ColumnsType<SerialNumberListDto> = [
    {
      title: 'Seri Numarasi',
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-900 text-white">
                <ShieldCheckIcon className="w-3 h-3" />
                Garanti: {record.remainingWarrantyDays} gun
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Urun',
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
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.icon} {config.label}
          </span>
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
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: any[] = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Detay',
            onClick: () => handleViewDetail(record.id),
          },
        ];

        // Status-based actions
        if (record.status === 'Available') {
          menuItems.push({
            key: 'receive',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            label: 'Teslim Al',
            onClick: () => handleReceive(record),
          });
        }

        if (record.status === 'InStock' || record.status === 'Available') {
          menuItems.push({
            key: 'reserve',
            icon: <LockClosedIcon className="w-4 h-4" />,
            label: 'Rezerve Et',
            onClick: () => handleReserveClick(record),
          });
          menuItems.push({
            key: 'sell',
            icon: <ShoppingBagIcon className="w-4 h-4" />,
            label: 'Sat',
            onClick: () => handleSellClick(record),
          });
        }

        if (record.status === 'Reserved') {
          menuItems.push({
            key: 'release',
            icon: <LockOpenIcon className="w-4 h-4" />,
            label: 'Rezervasyonu Kaldir',
            onClick: () => handleRelease(record),
          });
          menuItems.push({
            key: 'sell',
            icon: <ShoppingBagIcon className="w-4 h-4" />,
            label: 'Sat',
            onClick: () => handleSellClick(record),
          });
        }

        if (record.status !== 'Defective' && record.status !== 'Scrapped' && record.status !== 'Sold') {
          menuItems.push({
            key: 'defective',
            icon: <ExclamationCircleIcon className="w-4 h-4" />,
            label: 'Arizali Isaretle',
            onClick: () => handleDefectiveClick(record),
          });
        }

        if (record.status === 'Defective') {
          menuItems.push({
            key: 'scrap',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Hurda Isaretle',
            danger: true,
            onClick: () => handleScrap(record),
          });
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
          >
            <Button
              type="text"
              icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
              className="text-slate-600 hover:text-slate-900"
            />
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
          <QrCodeIcon className="w-4 h-4" />
          Tumu
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.total}
          </span>
        </span>
      ),
    },
    {
      key: 'available',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          Mevcut
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.available}
          </span>
        </span>
      ),
    },
    {
      key: 'reserved',
      label: (
        <span className="flex items-center gap-2">
          <LockClosedIcon className="w-4 h-4" />
          Rezerve
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.reserved}
          </span>
        </span>
      ),
    },
    {
      key: 'sold',
      label: (
        <span className="flex items-center gap-2">
          <ShoppingBagIcon className="w-4 h-4" />
          Satilan
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.sold}
          </span>
        </span>
      ),
    },
    {
      key: 'warranty',
      label: (
        <span className="flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4" />
          Garantili
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.underWarranty}
          </span>
        </span>
      ),
    },
    {
      key: 'defective',
      label: (
        <span className="flex items-center gap-2">
          <ExclamationCircleIcon className="w-4 h-4" />
          Arizali
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.defective}
          </span>
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
              <QrCodeIcon className="w-5 h-5 text-white" />
            </div>
            Seri Numarasi Yonetimi
          </h1>
          <p className="text-slate-500 mt-1">Urun seri numaralarini takip edin ve yonetin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setCreateModalOpen(true)}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Seri Numarasi
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <QrCodeIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.available}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Mevcut
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <LockClosedIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.reserved}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Rezerve
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ShoppingBagIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.sold}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Satilan
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.underWarranty}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Garantili
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ExclamationCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.defective}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Arizali
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-6 [&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            placeholder="Seri numarasi ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchSerial}
            onChange={(e) => setSearchSerial(e.target.value)}
            style={{ width: 220 }}
            allowClear
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />

          <Select
            placeholder="Urun"
            allowClear
            style={{ width: 220 }}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
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
            style={{ width: 160 }}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
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
              style={{ width: 150 }}
              className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                    {config.label}
                  </span>
                </Select.Option>
              ))}
            </Select>
          )}
        </div>

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
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayit`,
          }}
          scroll={{ x: 900 }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>

      {/* Create Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Yeni Seri Numarasi Ekle</span>}
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Ekle"
        cancelText="Iptal"
        confirmLoading={createSerialNumber.isPending}
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
              name="serial"
              label={<span className="text-slate-700 font-medium">Seri Numarasi</span>}
              rules={[{ required: true, message: 'Seri numarasi gerekli' }]}
            >
              <Input placeholder="SN-2024-00001" className="!border-slate-300 !rounded-lg" />
            </Form.Item>
            <Form.Item
              name="productId"
              label={<span className="text-slate-700 font-medium">Urun</span>}
              rules={[{ required: true, message: 'Urun secimi gerekli' }]}
            >
              <Select
                placeholder="Urun secin"
                showSearch
                optionFilterProp="children"
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
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
              label={<span className="text-slate-700 font-medium">Depo</span>}
            >
              <Select placeholder="Depo secin" allowClear className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg">
                {warehouses.map((w) => (
                  <Select.Option key={w.id} value={w.id}>
                    {w.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="manufacturedDate"
              label={<span className="text-slate-700 font-medium">Uretim Tarihi</span>}
            >
              <DatePicker className="w-full !border-slate-300 !rounded-lg" format="DD.MM.YYYY" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="batchNumber"
              label={<span className="text-slate-700 font-medium">Parti/Lot Numarasi</span>}
            >
              <Input placeholder="LOT-2024-001" className="!border-slate-300 !rounded-lg" />
            </Form.Item>
            <Form.Item
              name="supplierSerial"
              label={<span className="text-slate-700 font-medium">Tedarikci Seri No</span>}
            >
              <Input placeholder="Tedarikcinin seri numarasi" className="!border-slate-300 !rounded-lg" />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label={<span className="text-slate-700 font-medium">Notlar</span>}
          >
            <TextArea rows={3} placeholder="Seri numarasi hakkinda ek bilgiler..." className="!border-slate-300 !rounded-lg" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Seri Numarasi Detayi: {selectedSerial?.serial || ''}</span>}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedSerialId(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)} className="!border-slate-300 !text-slate-600">
            Kapat
          </Button>,
        ]}
        width={700}
      >
        {selectedSerial && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Seri Numarasi</p>
                <p className="text-lg font-semibold text-slate-900">{selectedSerial.serial}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Durum</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${statusConfig[selectedSerial.status].bgColor} ${statusConfig[selectedSerial.status].textColor}`}>
                  {statusConfig[selectedSerial.status].icon} {statusConfig[selectedSerial.status].label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Urun</p>
                <p className="font-semibold text-slate-900">{selectedSerial.productName}</p>
                <p className="text-sm text-slate-500">{selectedSerial.productCode}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Depo / Konum</p>
                <p className="text-slate-900">{selectedSerial.warehouseName || '-'}</p>
                {selectedSerial.locationName && (
                  <p className="text-sm text-slate-500">{selectedSerial.locationName}</p>
                )}
              </div>
            </div>

            {selectedSerial.isUnderWarranty && (
              <Alert
                type="info"
                message="Garanti Kapsaminda"
                description={`${selectedSerial.remainingWarrantyDays} gun garanti suresi kaldi`}
                icon={<ShieldCheckIcon className="w-4 h-4" />}
                showIcon
                className="!bg-slate-50 !border-slate-200 [&_.ant-alert-message]:!text-slate-900 [&_.ant-alert-description]:!text-slate-600"
              />
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Uretim Tarihi</p>
                <p className="text-slate-900">
                  {selectedSerial.manufacturedDate
                    ? dayjs(selectedSerial.manufacturedDate).format('DD.MM.YYYY')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Teslim Tarihi</p>
                <p className="text-slate-900">
                  {selectedSerial.receivedDate
                    ? dayjs(selectedSerial.receivedDate).format('DD.MM.YYYY')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Satis Tarihi</p>
                <p className="text-slate-900">
                  {selectedSerial.soldDate
                    ? dayjs(selectedSerial.soldDate).format('DD.MM.YYYY')
                    : '-'}
                </p>
              </div>
            </div>

            {(selectedSerial.warrantyStartDate || selectedSerial.warrantyEndDate) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Garanti Baslangic</p>
                  <p className="text-slate-900">
                    {selectedSerial.warrantyStartDate
                      ? dayjs(selectedSerial.warrantyStartDate).format('DD.MM.YYYY')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Garanti Bitis</p>
                  <p className="text-slate-900">
                    {selectedSerial.warrantyEndDate
                      ? dayjs(selectedSerial.warrantyEndDate).format('DD.MM.YYYY')
                      : '-'}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Parti/Lot No</p>
                <p className="text-slate-900">{selectedSerial.batchNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Tedarikci Seri No</p>
                <p className="text-slate-900">{selectedSerial.supplierSerial || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Musteri ID</p>
                <p className="text-slate-900">{selectedSerial.customerId || '-'}</p>
              </div>
            </div>

            {(selectedSerial.salesOrderId || selectedSerial.purchaseOrderId) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Satis Siparisi</p>
                  <p className="text-slate-900">{selectedSerial.salesOrderId || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Satinalma Siparisi</p>
                  <p className="text-slate-900">{selectedSerial.purchaseOrderId || '-'}</p>
                </div>
              </div>
            )}

            {selectedSerial.notes && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Notlar</p>
                <p className="text-slate-900">{selectedSerial.notes}</p>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4 mt-4">
              <p className="text-xs text-slate-400">
                Olusturulma: {dayjs(selectedSerial.createdAt).format('DD.MM.YYYY HH:mm')}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Sell Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Seri Numarasini Sat</span>}
        open={sellModalOpen}
        onCancel={() => {
          setSellModalOpen(false);
          sellForm.resetFields();
        }}
        onOk={handleSellConfirm}
        okText="Sat"
        cancelText="Iptal"
        confirmLoading={sellSerialNumber.isPending}
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <Form form={sellForm} layout="vertical" className="mt-4">
          <Form.Item
            name="customerId"
            label={<span className="text-slate-700 font-medium">Musteri ID</span>}
            rules={[{ required: true, message: 'Musteri ID gerekli' }]}
          >
            <Input placeholder="Musteri ID girin" className="!border-slate-300 !rounded-lg" />
          </Form.Item>
          <Form.Item
            name="salesOrderId"
            label={<span className="text-slate-700 font-medium">Satis Siparisi No</span>}
            rules={[{ required: true, message: 'Satis siparisi numarasi gerekli' }]}
          >
            <Input placeholder="Satis siparisi numarasi" className="!border-slate-300 !rounded-lg" />
          </Form.Item>
          <Form.Item
            name="warrantyMonths"
            label={<span className="text-slate-700 font-medium">Garanti Suresi (Ay)</span>}
          >
            <InputNumber min={0} max={120} className="w-full !border-slate-300 !rounded-lg" placeholder="12" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reserve Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Seri Numarasini Rezerve Et</span>}
        open={reserveModalOpen}
        onCancel={() => {
          setReserveModalOpen(false);
          reserveForm.resetFields();
        }}
        onOk={handleReserveConfirm}
        okText="Rezerve Et"
        cancelText="Iptal"
        confirmLoading={reserveSerialNumber.isPending}
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <Form form={reserveForm} layout="vertical" className="mt-4">
          <Form.Item
            name="salesOrderId"
            label={<span className="text-slate-700 font-medium">Satis Siparisi No</span>}
            rules={[{ required: true, message: 'Satis siparisi numarasi gerekli' }]}
          >
            <Input placeholder="Satis siparisi numarasi" className="!border-slate-300 !rounded-lg" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Defective Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Arizali Olarak Isaretle</span>}
        open={defectiveModalOpen}
        onCancel={() => {
          setDefectiveModalOpen(false);
          defectiveForm.resetFields();
        }}
        onOk={handleDefectiveConfirm}
        okText="Arizali Isaretle"
        cancelText="Iptal"
        confirmLoading={markDefective.isPending}
        okButtonProps={{ danger: true }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <Alert
          type="warning"
          message="Bu islem seri numarasini arizali olarak isaretleyecektir"
          description="Arizali seri numaralari satisa kapali olacaktir."
          className="mb-4 !bg-slate-50 !border-slate-300 [&_.ant-alert-message]:!text-slate-900 [&_.ant-alert-description]:!text-slate-600"
          showIcon
        />
        <Form form={defectiveForm} layout="vertical">
          <Form.Item
            name="reason"
            label={<span className="text-slate-700 font-medium">Ariza Sebebi</span>}
          >
            <TextArea
              rows={4}
              placeholder="Ariza sebebini aciklayin..."
              className="!border-slate-300 !rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
