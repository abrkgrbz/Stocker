'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Select, Button, Dropdown } from 'antd';
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
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
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
import type { MenuProps } from 'antd';
import { TableEmptyState } from '@/components/primitives';
import dayjs from 'dayjs';
import { confirmAction } from '@/lib/utils/sweetalert';

interface StatusConfig {
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactNode;
}

const statusConfig: Record<ReorderRuleStatus, StatusConfig> = {
  Active: {
    color: '#ffffff',
    bgColor: '#475569',
    label: 'Aktif',
    icon: <CheckCircleIcon className="w-3.5 h-3.5" />,
  },
  Paused: {
    color: '#1e293b',
    bgColor: '#e2e8f0',
    label: 'Duraklatildi',
    icon: <PauseIcon className="w-3.5 h-3.5" />,
  },
  Disabled: {
    color: '#64748b',
    bgColor: '#f1f5f9',
    label: 'Devre Disi',
    icon: <XCircleIcon className="w-3.5 h-3.5" />,
  },
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
      'Kurali Sil',
      `"${rule.name}" kuralini silmek istediginizden emin misiniz?`,
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
      'Kurali Calistir',
      `"${rule.name}" kuralini simdi calistirmak istediginizden emin misiniz?`,
      'Calistir'
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
      title: 'Kural Adi',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/inventory/reorder-rules/${record.id}`);
          }}
          className="font-medium text-slate-900 hover:text-slate-600 transition-colors text-left"
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
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              {record.productName}
            </span>
          )}
          {record.categoryName && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-800">
              {record.categoryName}
            </span>
          )}
          {record.warehouseName && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-600">
              {record.warehouseName}
            </span>
          )}
          {!record.productName && !record.categoryName && !record.warehouseName && (
            <span className="text-slate-400">Tumu</span>
          )}
        </div>
      ),
    },
    {
      title: 'Tetikleyici',
      key: 'trigger',
      width: 180,
      render: (_, record) => (
        <div className="text-sm text-slate-600">
          {record.triggerBelowQuantity && (
            <div>Miktar &lt; {record.triggerBelowQuantity}</div>
          )}
          {record.triggerBelowDaysOfStock && (
            <div>Stok &lt; {record.triggerBelowDaysOfStock} gun</div>
          )}
          {record.triggerOnForecast && (
            <div className="text-slate-800 font-medium">Tahmine gore</div>
          )}
        </div>
      ),
    },
    {
      title: 'Siparis Miktari',
      key: 'reorderQuantity',
      width: 150,
      render: (_, record) => (
        <div className="text-sm">
          {record.useEconomicOrderQuantity ? (
            <div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
                Dinamik
              </span>
              <div className="text-xs text-slate-500 mt-1">
                {record.minimumOrderQuantity} - {record.maximumOrderQuantity}
              </div>
            </div>
          ) : (
            <div>
              {record.fixedReorderQuantity && <div className="text-slate-900">{record.fixedReorderQuantity} adet</div>}
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
      width: 140,
      render: (status: ReorderRuleStatus) => {
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
      title: 'Son Calisma',
      dataIndex: 'lastExecutedAt',
      key: 'lastExecutedAt',
      width: 140,
      render: (date: string | undefined, record) => (
        <div>
          {date ? (
            <div>
              <div className="text-sm text-slate-900">{dayjs(date).format('DD.MM.YYYY')}</div>
              <div className="text-xs text-slate-500">{dayjs(date).format('HH:mm')}</div>
            </div>
          ) : (
            <span className="text-slate-400">Hic calismadi</span>
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
            Gerekli
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const items: MenuProps['items'] = [
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
            label: 'Aktiflestir',
            onClick: () => handleActivate(record),
          });
        }

        if (record.status !== 'Disabled') {
          items.push({
            key: 'disable',
            icon: <StopIcon className="w-4 h-4" />,
            label: 'Devre Disi Birak',
            onClick: () => handleDisable(record),
          });
        }

        if (record.status === 'Disabled') {
          items.push({
            key: 'activate2',
            icon: <PlayIcon className="w-4 h-4" />,
            label: 'Aktiflestir',
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
              className="text-slate-600 hover:text-slate-900"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Yeniden Siparis Kurallari</h1>
              <p className="text-slate-500 mt-1">Otomatik stok yenileme kurallarini tanimlayin ve yonetin</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/reorder-rules/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Kural
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Kural
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Aktif
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <PauseIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.paused}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Duraklatildi
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-500">{stats.disabled}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Devre Disi
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select
            placeholder="Depoya gore filtrele"
            allowClear
            style={{ width: 250 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            showSearch
            optionFilterProp="children"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          >
            {warehouses.map((w) => (
              <Select.Option key={w.id} value={w.id}>
                {w.code} - {w.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Duruma gore filtrele"
            allowClear
            style={{ width: 180 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <Select.Option key={key} value={key}>
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: config.bgColor, color: config.color }}
                >
                  {config.label}
                </span>
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Table */}
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
            onClick: (e) => {
              const target = e.target as HTMLElement;
              if (target.closest('.ant-dropdown-trigger') || target.closest('.ant-dropdown')) {
                return;
              }
              router.push(`/inventory/reorder-rules/${record.id}`);
            },
            className: 'cursor-pointer hover:bg-slate-50',
          })}
          locale={{
            emptyText: <TableEmptyState
              icon={ArrowsRightLeftIcon}
              title="Yeniden siparis kurali bulunamadi"
              description="Henuz yeniden siparis kurali eklenmemis veya filtrelere uygun kayit yok."
            />
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
