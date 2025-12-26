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
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  InboxIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  useGoodsReceipts,
  useDeleteGoodsReceipt,
  useCompleteGoodsReceipt,
  useCancelGoodsReceipt,
} from '@/lib/api/hooks/usePurchase';
import type { GoodsReceiptListDto, GoodsReceiptStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusColors: Record<GoodsReceiptStatus, string> = {
  Draft: 'default',
  Pending: 'blue',
  Confirmed: 'cyan',
  Completed: 'green',
  Cancelled: 'default',
};

const statusLabels: Record<GoodsReceiptStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Beklemede',
  Confirmed: 'Onaylandı',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

export default function GoodsReceiptsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<GoodsReceiptStatus | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const { data: receiptsData, isLoading, refetch } = useGoodsReceipts({
    searchTerm: searchText || undefined,
    status: statusFilter,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteReceipt = useDeleteGoodsReceipt();
  const completeReceipt = useCompleteGoodsReceipt();
  const cancelReceipt = useCancelGoodsReceipt();

  const receipts = receiptsData?.items || [];
  const totalCount = receiptsData?.totalCount || 0;

  const handleDelete = (record: GoodsReceiptListDto) => {
    confirm({
      title: 'Mal Alım Belgesini Sil',
      content: `"${record.receiptNumber}" belgesini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteReceipt.mutate(record.id),
    });
  };

  const columns: ColumnsType<GoodsReceiptListDto> = [
    {
      title: 'Belge No',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      fixed: 'left',
      width: 150,
      render: (num, record) => (
        <div>
          <div className="font-medium text-blue-600">{num}</div>
          <div className="text-xs text-gray-500">
            {dayjs(record.receiptDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Sipariş No',
      dataIndex: 'purchaseOrderNumber',
      key: 'purchaseOrderNumber',
      width: 130,
      render: (num) => num || '-',
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
      width: 160,
      render: (status: GoodsReceiptStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
    },
    {
      title: 'Toplam Miktar',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 120,
      align: 'center',
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (name) => name || '-',
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
                onClick: () => router.push(`/purchase/goods-receipts/${record.id}`),
              },
              record.status === 'Draft' && {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
              },
              { type: 'divider' },
              !['Completed', 'Cancelled'].includes(record.status) && {
                key: 'complete',
                icon: <CheckCircleIcon className="w-4 h-4" />,
                label: 'Tamamla',
                onClick: () => completeReceipt.mutate(record.id),
              },
              !['Completed', 'Cancelled'].includes(record.status) && {
                key: 'cancel',
                icon: <XCircleIcon className="w-4 h-4" />,
                label: 'İptal Et',
                danger: true,
                onClick: () => cancelReceipt.mutate({ id: record.id, reason: 'Manual cancellation' }),
              },
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
          <Button type="text" icon={<EllipsisVerticalIcon className="w-4 h-4" />} />
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
            <InboxIcon className="w-5 h-5 text-cyan-500" />
            Mal Alım Belgeleri
          </Title>
          <Text type="secondary">Tedarikçilerden gelen malları kaydedin</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          size="large"
          onClick={() => router.push('/purchase/goods-receipts/new')}
        >
          Yeni Mal Alımı
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
            style={{ width: 180 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
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
          dataSource={receipts}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} belge`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/purchase/goods-receipts/${record.id}`),
            className: 'cursor-pointer hover:bg-gray-50',
          })}
        />
      </Card>
    </div>
  );
}
