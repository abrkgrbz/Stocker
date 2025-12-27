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
  Popconfirm,
  message,
  Tooltip,
  Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  StopCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  usePriceLists,
  useDeletePriceList,
  useActivatePriceList,
  useDeactivatePriceList,
  useSetDefaultPriceList,
} from '@/lib/api/hooks/useInventory';
import type { PriceListListDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function PriceListsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: priceLists = [], isLoading, refetch } = usePriceLists(!showInactive);
  const deletePriceList = useDeletePriceList();
  const activatePriceList = useActivatePriceList();
  const deactivatePriceList = useDeactivatePriceList();
  const setDefaultPriceList = useSetDefaultPriceList();

  const handleDelete = async (id: number) => {
    try {
      await deletePriceList.mutateAsync(id);
      message.success('Fiyat listesi silindi');
    } catch (error) {
      message.error('Silme islemi basarisiz');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await activatePriceList.mutateAsync(id);
      message.success('Fiyat listesi aktif edildi');
    } catch (error) {
      message.error('Islem basarisiz');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivatePriceList.mutateAsync(id);
      message.success('Fiyat listesi pasif edildi');
    } catch (error) {
      message.error('Islem basarisiz');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultPriceList.mutateAsync(id);
      message.success('Varsayilan fiyat listesi ayarlandi');
    } catch (error) {
      message.error('Islem basarisiz');
    }
  };

  const filteredPriceLists = priceLists.filter((priceList) =>
    priceList.name.toLowerCase().includes(searchText.toLowerCase()) ||
    priceList.code?.toLowerCase().includes(searchText.toLowerCase())
  );

  const getActionMenu = (record: PriceListListDto): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <PencilIcon className="w-4 h-4" />,
      label: 'Duzenle',
      onClick: () => router.push(`/inventory/price-lists/${record.id}/edit`),
    },
    {
      key: 'default',
      icon: record.isDefault ? <StarIcon className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />,
      label: record.isDefault ? 'Varsayilan' : 'Varsayilan Yap',
      disabled: record.isDefault,
      onClick: () => handleSetDefault(record.id),
    },
    {
      type: 'divider',
    },
    {
      key: 'toggle',
      icon: record.isActive ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
      label: record.isActive ? 'Pasif Yap' : 'Aktif Yap',
      onClick: () => record.isActive ? handleDeactivate(record.id) : handleActivate(record.id),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <TrashIcon className="w-4 h-4" />,
      label: 'Sil',
      danger: true,
      disabled: record.isDefault,
    },
  ];

  const columns: ColumnsType<PriceListListDto> = [
    {
      title: 'Fiyat Listesi',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: record.isDefault ? '#10b98115' : '#6366f115' }}
          >
            {record.isDefault ? (
              <StarIcon className="w-4 h-4" style={{ fontSize: 18, color: '#10b981' }} />
            ) : (
              <CurrencyDollarIcon className="w-4 h-4" style={{ fontSize: 18, color: '#6366f1' }} />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {name}
              {record.isDefault && (
                <Tag color="success" className="text-xs">Varsayilan</Tag>
              )}
            </div>
            <div className="text-xs text-gray-400">
              Kod: {record.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      align: 'center',
      render: (currency: string) => (
        <Tag color="blue">{currency}</Tag>
      ),
    },
    {
      title: 'Indirim/Markup',
      key: 'discount',
      align: 'center',
      render: (_, record) => (
        <div className="text-sm">
          {record.globalDiscountPercentage ? (
            <Tag color="green">-%{record.globalDiscountPercentage}</Tag>
          ) : record.globalMarkupPercentage ? (
            <Tag color="orange">+%{record.globalMarkupPercentage}</Tag>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Gecerlilik',
      key: 'validity',
      render: (_, record) => {
        if (!record.validFrom && !record.validTo) {
          return <Text type="secondary">Surekli</Text>;
        }
        return (
          <div className="text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              <CalendarIcon className="w-4 h-4" />
              {record.validFrom ? dayjs(record.validFrom).format('DD.MM.YYYY') : '-'}
              {' → '}
              {record.validTo ? dayjs(record.validTo).format('DD.MM.YYYY') : '-'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Urun Sayisi',
      dataIndex: 'itemCount',
      key: 'itemCount',
      align: 'center',
      render: (count: number) => (
        <Tag color="purple">{count || 0}</Tag>
      ),
    },
    {
      title: 'Oncelik',
      dataIndex: 'priority',
      key: 'priority',
      align: 'center',
      render: (priority: number) => (
        <Text type="secondary">{priority || 0}</Text>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      align: 'right',
      width: 100,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">Fiyat Listeleri</Title>
          <Text type="secondary">Urun fiyat listelerini yonetin</Text>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
          >
            Yenile
          </Button>
          <Button
            type={showInactive ? 'primary' : 'default'}
            ghost={showInactive}
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? 'Tumu' : 'Sadece Aktif'}
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/price-lists/new')}
            style={{ background: '#6366f1', borderColor: '#6366f1' }}
          >
            Yeni Fiyat Listesi
          </Button>
        </Space>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <Input
          placeholder="Fiyat listesi ara..."
          prefix={<MagnifyingGlassIcon className="w-4 h-4" className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
          allowClear
        />
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredPriceLists}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} fiyat listesi`,
          }}
        />
      </Card>
    </div>
  );
}
