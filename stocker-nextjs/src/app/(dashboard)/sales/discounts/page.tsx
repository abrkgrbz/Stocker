'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  DatePicker,
  Dropdown,
  Modal,
  message,
  Row,
  Col,
  Switch,
} from 'antd';
import {
  ArrowPathIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StopIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import {
  useDiscounts,
  useActivateDiscount,
  useDeactivateDiscount,
  useDeleteDiscount,
} from '@/lib/api/hooks/useSales';
import type { DiscountListItem, DiscountType, GetDiscountsParams } from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const typeColors: Record<DiscountType, string> = {
  Percentage: 'blue',
  FixedAmount: 'green',
  BuyXGetY: 'purple',
  Tiered: 'orange',
};

const typeLabels: Record<DiscountType, string> = {
  Percentage: 'Yüzde',
  FixedAmount: 'Sabit Tutar',
  BuyXGetY: 'X Al Y Öde',
  Tiered: 'Kademeli',
};

const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({
  value,
  label,
}));

export default function DiscountsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetDiscountsParams>({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, refetch } = useDiscounts(filters);
  const activateMutation = useActivateDiscount();
  const deactivateMutation = useDeactivateDiscount();
  const deleteMutation = useDeleteDiscount();

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      if (currentActive) {
        await deactivateMutation.mutateAsync(id);
        message.success('İndirim pasifleştirildi');
      } else {
        await activateMutation.mutateAsync(id);
        message.success('İndirim aktifleştirildi');
      }
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'İndirimi Sil',
      content: 'Bu indirimi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('İndirim silindi');
        } catch {
          message.error('İndirim silinemedi');
        }
      },
    });
  };

  const discounts = data?.items ?? [];

  const getActionMenu = (record: DiscountListItem): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeIcon className="w-4 h-4" />,
      label: 'Görüntüle',
      onClick: () => router.push(`/sales/discounts/${record.id}`),
    },
    {
      key: 'edit',
      icon: <PencilIcon className="w-4 h-4" />,
      label: 'Düzenle',
      onClick: () => router.push(`/sales/discounts/${record.id}/edit`),
    },
    {
      key: 'toggle',
      icon: record.isActive ? <StopIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />,
      label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
      onClick: () => handleToggleActive(record.id, record.isActive),
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <TrashIcon className="w-4 h-4" />,
      label: 'Sil',
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns: ColumnsType<DiscountListItem> = [
    {
      title: 'İndirim Kodu',
      dataIndex: 'code',
      key: 'code',
      render: (text: string, record) => (
        <a onClick={() => router.push(`/sales/discounts/${record.id}`)}>{text}</a>
      ),
      sorter: true,
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: DiscountType) => (
        <Tag color={typeColors[type]}>{typeLabels[type]}</Tag>
      ),
      filters: typeOptions.map((t) => ({ text: t.label, value: t.value })),
    },
    {
      title: 'Değer',
      key: 'value',
      render: (_, record) => {
        if (record.type === 'Percentage') {
          return `%${record.percentage}`;
        }
        if (record.type === 'FixedAmount') {
          return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(record.amount || 0);
        }
        return '-';
      },
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: true,
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string | null) => (date ? dayjs(date).format('DD.MM.YYYY') : 'Süresiz'),
    },
    {
      title: 'Kullanım',
      key: 'usage',
      render: (_, record) => {
        if (record.maxUsageCount) {
          return `${record.usageCount || 0} / ${record.maxUsageCount}`;
        }
        return record.usageCount || 0;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
      ),
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button type="text" icon={<EllipsisVerticalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  const handleTableChange = (pagination: any, tableFilters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      type: tableFilters.type?.[0],
      isActive: tableFilters.isActive?.[0],
      sortBy: sorter.field,
      sortDescending: sorter.order === 'descend',
    }));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>İndirimler</Title>
          <Text type="secondary">İndirim kampanyalarını yönetin</Text>
        </div>
        <Space>
          <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/sales/discounts/new')}
          >
            Yeni İndirim
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Kod veya ad ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
              allowClear
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))
              }
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Tür"
              allowClear
              style={{ width: '100%' }}
              options={typeOptions}
              onChange={(value) => setFilters((prev) => ({ ...prev, type: value, page: 1 }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: true, label: 'Aktif' },
                { value: false, label: 'Pasif' },
              ]}
              onChange={(value) => setFilters((prev) => ({ ...prev, isActive: value, page: 1 }))}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={discounts}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.totalCount ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} indirim`,
          }}
        />
      </Card>
    </div>
  );
}
