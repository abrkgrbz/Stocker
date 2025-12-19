'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Table,
  Space,
  Tag,
  Input,
  Dropdown,
  Select,
  Progress,
  Modal,
  DatePicker,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  LockOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  useStockReservations,
  useFulfillStockReservation,
  useCancelStockReservation,
  useExtendStockReservation,
  useWarehouses,
} from '@/lib/api/hooks/useInventory';
import type { StockReservationListDto, ReservationStatus } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

// Monochrome status configuration
const statusConfig: Record<ReservationStatus, { color: string; bgColor: string; label: string }> = {
  Active: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Aktif' },
  PartiallyFulfilled: { color: '#475569', bgColor: '#f1f5f9', label: 'Kısmen Karşılandı' },
  Fulfilled: { color: '#334155', bgColor: '#e2e8f0', label: 'Karşılandı' },
  Cancelled: { color: '#94a3b8', bgColor: '#f8fafc', label: 'İptal Edildi' },
  Expired: { color: '#64748b', bgColor: '#f1f5f9', label: 'Süresi Doldu' },
};

export default function StockReservationsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | undefined>();
  const [fulfillModalVisible, setFulfillModalVisible] = useState(false);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<StockReservationListDto | null>(null);
  const [fulfillQuantity, setFulfillQuantity] = useState<number>(0);
  const [extendDate, setExtendDate] = useState<dayjs.Dayjs | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: warehouses = [] } = useWarehouses();
  const { data: reservations = [], isLoading, refetch } = useStockReservations(
    undefined,
    selectedWarehouse,
    selectedStatus,
    false
  );
  const fulfillReservation = useFulfillStockReservation();
  const cancelReservation = useCancelStockReservation();
  const extendReservation = useExtendStockReservation();

  const filteredReservations = reservations.filter((res) =>
    res.reservationNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    res.productCode?.toLowerCase().includes(searchText.toLowerCase()) ||
    res.productName?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: reservations.length,
    active: reservations.filter(r => r.status === 'Active').length,
    partial: reservations.filter(r => r.status === 'PartiallyFulfilled').length,
    fulfilled: reservations.filter(r => r.status === 'Fulfilled').length,
    cancelled: reservations.filter(r => r.status === 'Cancelled').length,
    expired: reservations.filter(r => r.status === 'Expired').length,
  };

  const handleFulfill = async () => {
    if (!selectedReservation) return;
    try {
      await fulfillReservation.mutateAsync({
        id: selectedReservation.id,
        quantity: fulfillQuantity || undefined,
      });
      setFulfillModalVisible(false);
      setSelectedReservation(null);
      setFulfillQuantity(0);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    if (!selectedReservation) return;
    try {
      await cancelReservation.mutateAsync({
        id: selectedReservation.id,
        reason: cancelReason || undefined,
      });
      setCancelModalVisible(false);
      setSelectedReservation(null);
      setCancelReason('');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleExtend = async () => {
    if (!selectedReservation || !extendDate) return;
    try {
      await extendReservation.mutateAsync({
        id: selectedReservation.id,
        newExpirationDate: extendDate.toISOString(),
      });
      setExtendModalVisible(false);
      setSelectedReservation(null);
      setExtendDate(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const getActionMenuItems = (record: StockReservationListDto): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        label: 'Detayları Gör',
        icon: <EyeOutlined />,
        onClick: () => router.push(`/inventory/stock-reservations/${record.id}`),
      },
    ];

    if (record.status === 'Active' || record.status === 'PartiallyFulfilled') {
      items.push(
        { type: 'divider' },
        {
          key: 'fulfill',
          label: 'Karşıla',
          icon: <CheckOutlined />,
          onClick: () => {
            setSelectedReservation(record);
            setFulfillQuantity(record.quantity - record.fulfilledQuantity);
            setFulfillModalVisible(true);
          },
        },
        {
          key: 'extend',
          label: 'Süre Uzat',
          icon: <ClockCircleOutlined />,
          onClick: () => {
            setSelectedReservation(record);
            setExtendDate(record.expirationDate ? dayjs(record.expirationDate).add(7, 'day') : dayjs().add(7, 'day'));
            setExtendModalVisible(true);
          },
        },
        { type: 'divider' },
        {
          key: 'cancel',
          label: 'İptal Et',
          icon: <CloseOutlined />,
          danger: true,
          onClick: () => {
            setSelectedReservation(record);
            setCancelModalVisible(true);
          },
        }
      );
    }

    return items;
  };

  const columns: ColumnsType<StockReservationListDto> = [
    {
      title: 'Rezervasyon',
      dataIndex: 'reservationNumber',
      key: 'reservationNumber',
      sorter: (a, b) => a.reservationNumber.localeCompare(b.reservationNumber),
      render: (number: string) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <LockOutlined className="text-lg text-slate-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{number}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      render: (name: string) => <span className="text-slate-700">{name}</span>,
    },
    {
      title: 'Miktar',
      key: 'quantity',
      align: 'center',
      render: (_, record) => {
        const percent = record.quantity > 0
          ? Math.round((record.fulfilledQuantity / record.quantity) * 100)
          : 0;
        return (
          <div style={{ width: 100 }}>
            <Progress
              percent={percent}
              size="small"
              format={() => `${record.fulfilledQuantity}/${record.quantity}`}
              strokeColor="#334155"
              trailColor="#e2e8f0"
            />
          </div>
        );
      },
    },
    {
      title: 'Tarih',
      key: 'dates',
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-slate-700">
            {dayjs(record.reservationDate).format('DD.MM.YYYY')}
          </div>
          {record.expirationDate && (
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <ClockCircleOutlined />
              {dayjs(record.expirationDate).format('DD.MM.YYYY')}
              {dayjs(record.expirationDate).isBefore(dayjs()) && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-slate-200 text-slate-700">Süresi Doldu</span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      filters: [
        { text: 'Aktif', value: 'Active' },
        { text: 'Kısmen Karşılandı', value: 'PartiallyFulfilled' },
        { text: 'Karşılandı', value: 'Fulfilled' },
        { text: 'İptal Edildi', value: 'Cancelled' },
        { text: 'Süresi Doldu', value: 'Expired' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: ReservationStatus) => {
        const config = statusConfig[status];
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 50,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} className="text-slate-600 hover:text-slate-900" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Rezervasyonları</h1>
          <p className="text-slate-500 mt-1">Stok rezervasyonlarını yönetin</p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/inventory/stock-reservations/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Rezervasyon
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <LockOutlined className="text-lg text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ClockCircleOutlined className="text-lg text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <ExclamationCircleOutlined className="text-lg text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.partial}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kısmen</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CheckOutlined className="text-lg text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.fulfilled}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Karşılandı</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CloseOutlined className="text-lg text-slate-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-500">{stats.cancelled}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">İptal</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
                <ClockCircleOutlined className="text-lg text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-500">{stats.expired}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Süresi Doldu</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-3">
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
          <Select
            placeholder="Durum seçin"
            allowClear
            style={{ width: 180 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: 'Active', label: 'Aktif' },
              { value: 'PartiallyFulfilled', label: 'Kısmen Karşılandı' },
              { value: 'Fulfilled', label: 'Karşılandı' },
              { value: 'Cancelled', label: 'İptal Edildi' },
              { value: 'Expired', label: 'Süresi Doldu' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Input
            placeholder="Rezervasyon ara..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
            className="!rounded-lg !border-slate-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={filteredReservations}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} rezervasyon`,
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>

      {/* Fulfill Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Rezervasyonu Karşıla</span>}
        open={fulfillModalVisible}
        onOk={handleFulfill}
        onCancel={() => {
          setFulfillModalVisible(false);
          setSelectedReservation(null);
        }}
        confirmLoading={fulfillReservation.isPending}
        okText="Karşıla"
        cancelText="İptal"
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <div className="py-4">
          <p className="text-sm text-slate-700 mb-2">Karşılanacak miktar:</p>
          <InputNumber
            value={fulfillQuantity}
            onChange={(val) => setFulfillQuantity(val || 0)}
            min={1}
            max={selectedReservation ? selectedReservation.quantity - selectedReservation.fulfilledQuantity : 1}
            style={{ width: '100%' }}
            className="!rounded-lg"
          />
          <p className="text-xs text-slate-500 mt-2">
            Kalan miktar: {selectedReservation ? selectedReservation.quantity - selectedReservation.fulfilledQuantity : 0}
          </p>
        </div>
      </Modal>

      {/* Extend Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Rezervasyon Süresini Uzat</span>}
        open={extendModalVisible}
        onOk={handleExtend}
        onCancel={() => {
          setExtendModalVisible(false);
          setSelectedReservation(null);
        }}
        confirmLoading={extendReservation.isPending}
        okText="Uzat"
        cancelText="İptal"
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <div className="py-4">
          <p className="text-sm text-slate-700 mb-2">Yeni bitiş tarihi:</p>
          <DatePicker
            value={extendDate}
            onChange={setExtendDate}
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().endOf('day')}
            className="!rounded-lg !border-slate-300"
          />
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900">
            <ExclamationCircleOutlined className="text-slate-600" />
            <span className="font-semibold">Rezervasyonu İptal Et</span>
          </div>
        }
        open={cancelModalVisible}
        onOk={handleCancel}
        onCancel={() => {
          setCancelModalVisible(false);
          setSelectedReservation(null);
          setCancelReason('');
        }}
        confirmLoading={cancelReservation.isPending}
        okText="İptal Et"
        okButtonProps={{ danger: true }}
        cancelText="Vazgeç"
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <div className="py-4">
          <p className="text-sm text-slate-700 mb-2">İptal nedeni (opsiyonel):</p>
          <Input.TextArea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="İptal nedenini belirtin..."
            className="!rounded-lg !border-slate-300"
          />
        </div>
      </Modal>
    </div>
  );
}
