'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Input,
  Typography,
  message,
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

const { Title, Text } = Typography;

const statusColors: Record<ReservationStatus, string> = {
  Active: 'processing',
  PartiallyFulfilled: 'warning',
  Fulfilled: 'success',
  Cancelled: 'default',
  Expired: 'error',
};

const statusLabels: Record<ReservationStatus, string> = {
  Active: 'Aktif',
  PartiallyFulfilled: 'Kısmen Karşılandı',
  Fulfilled: 'Karşılandı',
  Cancelled: 'İptal Edildi',
  Expired: 'Süresi Doldu',
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
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: '#f9731615' }}
          >
            <LockOutlined style={{ fontSize: 18, color: '#f97316' }} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{number}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-700">{record.productName}</div>
          <div className="text-xs text-gray-400">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
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
          <div className="text-gray-600">
            {dayjs(record.reservationDate).format('DD.MM.YYYY')}
          </div>
          {record.expirationDate && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <ClockCircleOutlined />
              {dayjs(record.expirationDate).format('DD.MM.YYYY')}
              {dayjs(record.expirationDate).isBefore(dayjs()) && (
                <Tag color="error" className="ml-1">Süresi Doldu</Tag>
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
      render: (status: ReservationStatus) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      ),
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
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">Stok Rezervasyonları</Title>
          <Text type="secondary">Stok rezervasyonlarını yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/inventory/stock-reservations/new')}
            style={{ background: '#f97316', borderColor: '#f97316' }}
          >
            Yeni Rezervasyon
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Space wrap>
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
          />
          <Input
            placeholder="Rezervasyon ara..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
        </Space>
      </Card>

      {/* Table */}
      <Card>
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
        />
      </Card>

      {/* Fulfill Modal */}
      <Modal
        title="Rezervasyonu Karşıla"
        open={fulfillModalVisible}
        onOk={handleFulfill}
        onCancel={() => {
          setFulfillModalVisible(false);
          setSelectedReservation(null);
        }}
        confirmLoading={fulfillReservation.isPending}
        okText="Karşıla"
        cancelText="İptal"
      >
        <div className="py-4">
          <Text className="block mb-2">Karşılanacak miktar:</Text>
          <InputNumber
            value={fulfillQuantity}
            onChange={(val) => setFulfillQuantity(val || 0)}
            min={1}
            max={selectedReservation ? selectedReservation.quantity - selectedReservation.fulfilledQuantity : 1}
            style={{ width: '100%' }}
          />
          <Text type="secondary" className="block mt-2 text-xs">
            Kalan miktar: {selectedReservation ? selectedReservation.quantity - selectedReservation.fulfilledQuantity : 0}
          </Text>
        </div>
      </Modal>

      {/* Extend Modal */}
      <Modal
        title="Rezervasyon Süresini Uzat"
        open={extendModalVisible}
        onOk={handleExtend}
        onCancel={() => {
          setExtendModalVisible(false);
          setSelectedReservation(null);
        }}
        confirmLoading={extendReservation.isPending}
        okText="Uzat"
        cancelText="İptal"
      >
        <div className="py-4">
          <Text className="block mb-2">Yeni bitiş tarihi:</Text>
          <DatePicker
            value={extendDate}
            onChange={setExtendDate}
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().endOf('day')}
          />
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-500">
            <ExclamationCircleOutlined />
            Rezervasyonu İptal Et
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
      >
        <div className="py-4">
          <Text className="block mb-2">İptal nedeni (opsiyonel):</Text>
          <Input.TextArea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="İptal nedenini belirtin..."
          />
        </div>
      </Modal>
    </div>
  );
}
