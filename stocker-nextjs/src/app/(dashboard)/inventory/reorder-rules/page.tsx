'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Tag, Select, Button, Dropdown } from 'antd';
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  EllipsisHorizontalIcon,
  BoltIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  useReorderRules,
  useWarehouses,
  useDeleteReorderRule,
  useActivateReorderRule,
  usePauseReorderRule,
  useDisableReorderRule,
  useExecuteReorderRule,
} from '@/lib/api/hooks/useInventory';
import type { ReorderRuleDto, ReorderRuleStatus } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PageContainer, ListPageHeader, Card } from '@/components/patterns';
import { confirmAction } from '@/lib/utils/sweetalert';

const statusConfig: Record<ReorderRuleStatus, { color: string; label: string }> = {
  Active: { color: 'green', label: 'Aktif' },
  Paused: { color: 'orange', label: 'Duraklatıldı' },
  Disabled: { color: 'default', label: 'Devre Dışı' },
};

export default function ReorderRulesPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<ReorderRuleStatus | undefined>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();

  // API Hooks
  const { data: warehouses = [] } = useWarehouses();
  const { data: rules = [], isLoading, refetch } = useReorderRules(undefined, undefined, selectedWarehouse, selectedStatus);
  const deleteRule = useDeleteReorderRule();
  const activateRule = useActivateReorderRule();
  const pauseRule = usePauseReorderRule();
  const disableRule = useDisableReorderRule();
  const executeRule = useExecuteReorderRule();

  // Stats
  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter(r => r.status === 'Active').length;
    const paused = rules.filter(r => r.status === 'Paused').length;
    const disabled = rules.filter(r => r.status === 'Disabled').length;
    return { total, active, paused, disabled };
  }, [rules]);

  // Handlers
  const handleDelete = async (rule: ReorderRuleDto) => {
    const confirmed = await confirmAction(
      'Kuralı Sil',
      `"${rule.name}" kuralını silmek istediğinizden emin misiniz?`,
      'Sil'
    );

    if (confirmed) {
      try {
        await deleteRule.mutateAsync(rule.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleActivate = async (rule: ReorderRuleDto) => {
    try {
      await activateRule.mutateAsync(rule.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handlePause = async (rule: ReorderRuleDto) => {
    try {
      await pauseRule.mutateAsync(rule.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDisable = async (rule: ReorderRuleDto) => {
    try {
      await disableRule.mutateAsync(rule.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleExecute = async (rule: ReorderRuleDto) => {
    const confirmed = await confirmAction(
      'Kuralı Çalıştır',
      `"${rule.name}" kuralını şimdi çalıştırmak istediğinizden emin misiniz?`,
      'Çalıştır'
    );

    if (confirmed) {
      try {
        await executeRule.mutateAsync(rule.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  // Table columns
  const columns: ColumnsType<ReorderRuleDto> = [
    {
      title: 'Kural Adı',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/inventory/reorder-rules/${record.id}`);
          }}
          className="font-medium text-slate-900 hover:text-blue-600 transition-colors text-left"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Kapsam',
      key: 'scope',
      width: 180,
      render: (_, record) => (
        <div className="space-y-1">
          {record.productName && (
            <Tag color="blue">{record.productName}</Tag>
          )}
          {record.categoryName && (
            <Tag color="purple">{record.categoryName}</Tag>
          )}
          {record.warehouseName && (
            <Tag color="cyan">{record.warehouseName}</Tag>
          )}
          {!record.productName && !record.categoryName && !record.warehouseName && (
            <span className="text-slate-400">Tümü</span>
          )}
        </div>
      ),
    },
    {
      title: 'Tetikleyici',
      key: 'trigger',
      width: 180,
      render: (_, record) => (
        <div className="text-sm">
          {record.triggerBelowQuantity && (
            <div>Miktar &lt; {record.triggerBelowQuantity}</div>
          )}
          {record.triggerBelowDaysOfStock && (
            <div>Stok &lt; {record.triggerBelowDaysOfStock} gün</div>
          )}
          {record.triggerOnForecast && (
            <div className="text-orange-600">Tahmine göre</div>
          )}
        </div>
      ),
    },
    {
      title: 'Sipariş Miktarı',
      key: 'reorderQuantity',
      width: 150,
      render: (_, record) => (
        <div className="text-sm">
          {record.useEconomicOrderQuantity ? (
            <div>
              <Tag color="purple">Dinamik</Tag>
              <div className="text-xs text-slate-500 mt-1">
                {record.minimumOrderQuantity} - {record.maximumOrderQuantity}
              </div>
            </div>
          ) : (
            <div>
              {record.fixedReorderQuantity && <div>{record.fixedReorderQuantity} adet</div>}
              {record.reorderUpToQuantity && (
                <div className="text-xs text-slate-500">
                  Hedef: {record.reorderUpToQuantity}
                </div>
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
      width: 120,
      render: (status: ReorderRuleStatus) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Son Çalışma',
      dataIndex: 'lastExecutedAt',
      key: 'lastExecutedAt',
      width: 140,
      render: (date: string | undefined, record) => (
        <div>
          {date ? (
            <div>
              <div className="text-sm">{dayjs(date).format('DD.MM.YYYY')}</div>
              <div className="text-xs text-slate-500">{dayjs(date).format('HH:mm')}</div>
            </div>
          ) : (
            <span className="text-slate-400">Hiç çalışmadı</span>
          )}
          {record.executionCount > 0 && (
            <div className="text-xs text-slate-500 mt-1">
              {record.executionCount} kez
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Onay',
      dataIndex: 'requiresApproval',
      key: 'requiresApproval',
      width: 80,
      render: (requiresApproval: boolean) => (
        requiresApproval ? (
          <Tag color="orange">Gerekli</Tag>
        ) : (
          <span className="text-slate-400">-</span>
        )
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const items: any[] = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => router.push(`/inventory/reorder-rules/${record.id}`),
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => router.push(`/inventory/reorder-rules/${record.id}/edit`),
          },
          {
            key: 'execute',
            icon: <BoltIcon className="w-4 h-4" />,
            label: 'Şimdi Çalıştır',
            onClick: () => handleExecute(record),
            disabled: record.status !== 'Active',
          },
        ];

        if (record.status === 'Active') {
          items.push({
            key: 'pause',
            icon: <PauseIcon className="w-4 h-4" />,
            label: 'Duraklat',
            onClick: () => handlePause(record),
          });
        }

        if (record.status === 'Paused') {
          items.push({
            key: 'activate',
            icon: <PlayIcon className="w-4 h-4" />,
            label: 'Aktifleştir',
            onClick: () => handleActivate(record),
          });
        }

        if (record.status !== 'Disabled') {
          items.push({
            key: 'disable',
            icon: <StopIcon className="w-4 h-4" />,
            label: 'Devre Dışı Bırak',
            onClick: () => handleDisable(record),
          });
        }

        if (record.status === 'Disabled') {
          items.push({
            key: 'activate2',
            icon: <PlayIcon className="w-4 h-4" />,
            label: 'Aktifleştir',
            onClick: () => handleActivate(record),
          });
        }

        items.push({
          type: 'divider',
        });

        items.push({
          key: 'delete',
          icon: <TrashIcon className="w-4 h-4" />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record),
        });

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button
              type="text"
              icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <ListPageHeader
        icon={<ArrowsRightLeftIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Yeniden Sipariş Kuralları"
        description="Otomatik stok yenileme kurallarını tanımlayın ve yönetin"
        itemCount={stats.total}
        primaryAction={{
          label: 'Yeni Kural',
          onClick: () => router.push('/inventory/reorder-rules/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-500">Toplam Kural</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs text-slate-500">Aktif</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.paused}</div>
          <div className="text-xs text-slate-500">Duraklatıldı</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-400">{stats.disabled}</div>
          <div className="text-xs text-slate-500">Devre Dışı</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 p-4">
          <Select
            placeholder="Depoya göre filtrele"
            allowClear
            style={{ width: 250 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            showSearch
            optionFilterProp="children"
          >
            {warehouses.map((w) => (
              <Select.Option key={w.id} value={w.id}>
                {w.code} - {w.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Duruma göre filtrele"
            allowClear
            style={{ width: 180 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <Select.Option key={key} value={key}>
                <Tag color={config.color}>{config.label}</Tag>
              </Select.Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: rules.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1400 }}
          onRow={(record) => ({
            onClick: () => router.push(`/inventory/reorder-rules/${record.id}`),
            className: 'cursor-pointer hover:bg-slate-50',
          })}
        />
      </Card>
    </PageContainer>
  );
}
