'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Input,
  Tag,
  Dropdown,
  Card,
  Typography,
  Tooltip,
  Modal,
  Select,
  DatePicker,
} from 'antd';
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  usePurchaseReturns,
  useDeletePurchaseReturn,
  useApprovePurchaseReturn,
  useRejectPurchaseReturn,
  useShipPurchaseReturn,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseReturnListDto, PurchaseReturnStatus, PurchaseReturnReason } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusColors: Record<PurchaseReturnStatus, string> = {
  Draft: 'default',
  Pending: 'blue',
  Approved: 'cyan',
  Rejected: 'red',
  Shipped: 'geekblue',
  Received: 'purple',
  Completed: 'green',
  Cancelled: 'default',
};

const statusLabels: Record<PurchaseReturnStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Shipped: 'Gönderildi',
  Received: 'Teslim Alındı',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

const reasonLabels: Record<PurchaseReturnReason, string> = {
  Defective: 'Kusurlu',
  WrongItem: 'Yanlış Ürün',
  WrongQuantity: 'Yanlış Miktar',
  Damaged: 'Hasarlı',
  QualityIssue: 'Kalite Sorunu',
  Expired: 'Vadesi Geçmiş',
  NotAsDescribed: 'Tanımlandığı Gibi Değil',
  Other: 'Diğer',
};

const reasonColors: Record<PurchaseReturnReason, string> = {
  Defective: 'red',
  WrongItem: 'orange',
  WrongQuantity: 'gold',
  Damaged: 'volcano',
  QualityIssue: 'magenta',
  Expired: 'purple',
  NotAsDescribed: 'blue',
  Other: 'default',
};

export default function PurchaseReturnsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseReturnStatus | undefined>();
  const [reasonFilter, setReasonFilter] = useState<PurchaseReturnReason | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const { data: returnsData, isLoading, refetch } = usePurchaseReturns({
    searchTerm: searchText || undefined,
    status: statusFilter,
    reason: reasonFilter,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteReturn = useDeletePurchaseReturn();
  const approveReturn = useApprovePurchaseReturn();
  const rejectReturn = useRejectPurchaseReturn();
  const shipReturn = useShipPurchaseReturn();

  const returns = returnsData?.items || [];
  const totalCount = returnsData?.totalCount || 0;

  const handleDelete = (record: PurchaseReturnListDto) => {
    confirm({
      title: 'İade Belgesini Sil',
      content: `"${record.returnNumber}" belgesini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteReturn.mutate(record.id),
    });
  };

  const handleReject = (record: PurchaseReturnListDto) => {
    confirm({
      title: 'İade Talebini Reddet',
      content: `"${record.returnNumber}" iade talebini reddetmek istediğinizden emin misiniz?`,
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => rejectReturn.mutate({ id: record.id, reason: 'Manuel reddetme' }),
    });
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const columns: ColumnsType<PurchaseReturnListDto> = [
    {
      title: 'İade No',
      dataIndex: 'returnNumber',
      key: 'returnNumber',
      fixed: 'left',
      width: 150,
      render: (num, record) => (
        <div>
          <div className="font-medium text-blue-600">{num}</div>
          <div className="text-xs text-gray-500">
            {dayjs(record.returnDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'RMA No',
      dataIndex: 'rmaNumber',
      key: 'rmaNumber',
      width: 120,
      render: (rma) => rma || '-',
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 200,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: PurchaseReturnStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      width: 140,
      render: (reason: PurchaseReturnReason) => (
        <Tag color={reasonColors[reason]}>{reasonLabels[reason]}</Tag>
      ),
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 70,
      align: 'center',
    },
    {
      title: 'İade Tutarı',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <span className="font-medium text-red-600">
          {formatCurrency(amount, record.currency)}
        </span>
      ),
    },
    {
      title: 'İade Edilen',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <span className={amount > 0 ? 'font-medium text-green-600' : 'text-gray-400'}>
          {amount > 0 ? formatCurrency(amount, record.currency) : '-'}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => router.push(`/purchase/returns/${record.id}`),
              },
              record.status === 'Draft' && {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/purchase/returns/${record.id}/edit`),
              },
              { type: 'divider' },
              record.status === 'Pending' && {
                key: 'approve',
                icon: <CheckCircleIcon className="w-4 h-4" />,
                label: 'Onayla',
                onClick: () => approveReturn.mutate({ id: record.id }),
              },
              record.status === 'Pending' && {
                key: 'reject',
                icon: <XCircleIcon className="w-4 h-4" />,
                label: 'Reddet',
                danger: true,
                onClick: () => handleReject(record),
              },
              record.status === 'Approved' && {
                key: 'ship',
                icon: <PaperAirplaneIcon className="w-4 h-4" />,
                label: 'Gönder',
                onClick: () => shipReturn.mutate({
                  id: record.id,
                  trackingNumber: 'Manuel Gönderim',
                }),
              },
              ['Shipped', 'Received'].includes(record.status) && {
                key: 'refund',
                icon: <CurrencyDollarIcon className="w-4 h-4" />,
                label: 'İade İşle',
                onClick: () => router.push(`/purchase/returns/${record.id}?action=refund`),
              },
              { type: 'divider' },
              record.status === 'Draft' && {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ].filter(Boolean) as MenuProps['items'],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} className="!mb-1 flex items-center gap-2">
            <ArrowUturnLeftIcon className="w-5 h-5 text-orange-500" />
            Satın Alma İadeleri
          </Title>
          <Text type="secondary">Tedarikçilere yapılan iadeleri yönetin</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          size="large"
          onClick={() => router.push('/purchase/returns/new')}
        >
          Yeni İade
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4" size="small">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Belge ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 160 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            placeholder="Sebep"
            allowClear
            style={{ width: 160 }}
            value={reasonFilter}
            onChange={setReasonFilter}
            options={Object.entries(reasonLabels).map(([value, label]) => ({ value, label }))}
          />
          <RangePicker
            placeholder={['Başlangıç', 'Bitiş']}
            format="DD.MM.YYYY"
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
          <div className="flex-1" />
          <Tooltip title="Yenile">
            <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()} />
          </Tooltip>
          <Tooltip title="Dışa Aktar">
            <Button icon={<ArrowUpTrayIcon className="w-4 h-4" />} />
          </Tooltip>
        </div>
      </Card>

      {/* Table */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={returns}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1300 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} iade`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/purchase/returns/${record.id}`),
            className: 'cursor-pointer hover:bg-gray-50',
          })}
        />
      </Card>
    </div>
  );
}
