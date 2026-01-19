'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Button, Input, Select, Dropdown, Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useShelfLifeRules,
  useDeleteShelfLife,
  useActivateShelfLife,
  useDeactivateShelfLife,
} from '@/lib/api/hooks/useInventory';
import type { ShelfLifeDto } from '@/lib/api/services/inventory.types';
import { ShelfLifeType, ShelfLifeRuleType, ExpiryAction } from '@/lib/api/services/inventory.types';

const shelfLifeTypeLabels: Record<number, string> = {
  [ShelfLifeType.ExpiryDate]: 'Son Kullanma Tarihi',
  [ShelfLifeType.BestBefore]: 'Tavsiye Edilen',
  [ShelfLifeType.ManufacturingDateBased]: 'Üretim Tarihli',
  [ShelfLifeType.AfterOpening]: 'Açıldıktan Sonra',
  [ShelfLifeType.AfterFirstUse]: 'İlk Kullanımdan Sonra',
};

const expiryActionLabels: Record<number, string> = {
  [ExpiryAction.None]: 'Yok',
  [ExpiryAction.AlertOnly]: 'Sadece Uyarı',
  [ExpiryAction.BlockSales]: 'Satışı Engelle',
  [ExpiryAction.Quarantine]: 'Karantinaya Al',
  [ExpiryAction.Scrap]: 'Hurda',
  [ExpiryAction.DiscountSale]: 'İndirimli Satış',
};

export default function ShelfLifeRulesPage() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: rules = [], isLoading, refetch } = useShelfLifeRules();
  const deleteRule = useDeleteShelfLife();
  const activateRule = useActivateShelfLife();
  const deactivateRule = useDeactivateShelfLife();

  // Filter data
  const filteredData = rules.filter((rule) => {
    const matchesSearch =
      !searchText ||
      rule.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
      rule.productCode?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'active' && rule.isActive) ||
      (statusFilter === 'inactive' && !rule.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Raf Ömrü Kuralını Sil',
      content: 'Bu kuralı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteRule.mutate(id),
    });
  };

  const handleToggleStatus = (rule: ShelfLifeDto) => {
    if (rule.isActive) {
      deactivateRule.mutate(rule.id);
    } else {
      activateRule.mutate(rule.id);
    }
  };

  const columns: ColumnsType<ShelfLifeDto> = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Raf Ömrü Tipi',
      dataIndex: 'shelfLifeType',
      key: 'shelfLifeType',
      width: 180,
      render: (type: number) => (
        <span className="text-sm text-slate-700">{shelfLifeTypeLabels[type] || '-'}</span>
      ),
    },
    {
      title: 'Toplam Süre (Gün)',
      dataIndex: 'totalShelfLifeDays',
      key: 'totalShelfLifeDays',
      width: 130,
      render: (days: number) => (
        <span className="text-sm font-medium text-slate-900">{days} gün</span>
      ),
    },
    {
      title: 'Min. Kabul',
      key: 'minReceiving',
      width: 120,
      render: (_, record) => {
        const days = record.minReceivingShelfLifeDays;
        const percent = record.minReceivingShelfLifePercent;
        const ruleType = record.receivingRuleType;

        if (ruleType === ShelfLifeRuleType.Days) {
          return <span className="text-sm text-slate-600">{days} gün</span>;
        } else if (ruleType === ShelfLifeRuleType.Percentage) {
          return <span className="text-sm text-slate-600">%{percent}</span>;
        } else if (ruleType === ShelfLifeRuleType.Both) {
          return (
            <span className="text-sm text-slate-600">
              {days} gün / %{percent}
            </span>
          );
        }
        return <span className="text-slate-400">-</span>;
      },
    },
    {
      title: 'Min. Satış',
      key: 'minSales',
      width: 120,
      render: (_, record) => {
        const days = record.minSalesShelfLifeDays;
        const percent = record.minSalesShelfLifePercent;
        const ruleType = record.salesRuleType;

        if (ruleType === ShelfLifeRuleType.Days) {
          return <span className="text-sm text-slate-600">{days} gün</span>;
        } else if (ruleType === ShelfLifeRuleType.Percentage) {
          return <span className="text-sm text-slate-600">%{percent}</span>;
        } else if (ruleType === ShelfLifeRuleType.Both) {
          return (
            <span className="text-sm text-slate-600">
              {days} gün / %{percent}
            </span>
          );
        }
        return <span className="text-slate-400">-</span>;
      },
    },
    {
      title: 'Süre Dolunca',
      dataIndex: 'expiryAction',
      key: 'expiryAction',
      width: 130,
      render: (action: number) => {
        const label = expiryActionLabels[action] || '-';
        return <span className="text-sm text-slate-600">{label}</span>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isActive ? (
            <>
              <CheckCircleIcon className="w-3 h-3" />
              Aktif
            </>
          ) : (
            <>
              <XCircleIcon className="w-3 h-3" />
              Pasif
            </>
          )}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: (
                  <Link href={`/inventory/shelf-life/rules/${record.id}`}>
                    <span className="flex items-center gap-2">
                      <EyeIcon className="w-4 h-4" />
                      Görüntüle
                    </span>
                  </Link>
                ),
              },
              {
                key: 'edit',
                label: (
                  <Link href={`/inventory/shelf-life/rules/${record.id}/edit`}>
                    <span className="flex items-center gap-2">
                      <PencilIcon className="w-4 h-4" />
                      Düzenle
                    </span>
                  </Link>
                ),
              },
              {
                key: 'toggle',
                label: (
                  <span
                    className="flex items-center gap-2"
                    onClick={() => handleToggleStatus(record)}
                  >
                    {record.isActive ? (
                      <>
                        <XCircleIcon className="w-4 h-4" />
                        Pasif Yap
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Aktif Yap
                      </>
                    )}
                  </span>
                ),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: (
                  <span
                    className="flex items-center gap-2 text-red-600"
                    onClick={() => handleDelete(record.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                    Sil
                  </span>
                ),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisVerticalIcon className="w-5 h-5 text-slate-400" />} />
        </Dropdown>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 m-0">Raf Ömrü Kuralları</h1>
              <p className="text-sm text-slate-500 m-0">Ürün bazlı raf ömrü ve son kullanma kuralları</p>
            </div>
          </div>
          <Link href="/inventory/shelf-life/rules/new">
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Yeni Kural
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-6 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            placeholder="Ürün ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-64 [&_.ant-input]:!bg-slate-50 [&_.ant-input]:!border-slate-300"
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={setStatusFilter}
            className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
            options={[
              { value: 'active', label: 'Aktif' },
              { value: 'inactive', label: 'Pasif' },
            ]}
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={isLoading}
            pagination={{
              total: filteredData.length,
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            }}
            scroll={{ x: 1200 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        </div>
      </div>
    </div>
  );
}
