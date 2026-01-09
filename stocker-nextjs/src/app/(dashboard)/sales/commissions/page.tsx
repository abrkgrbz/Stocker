'use client';

import React, { useState } from 'react';
import {
  Table,
  Input,
  Select,
  DatePicker,
  Dropdown,
  Modal,
  message,
  Tabs,
} from 'antd';
import {
  ArrowPathIcon,
  CheckIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  BanknotesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import {
  useSalesCommissions,
  useCommissionPlans,
  useApproveCommission,
  useRejectCommission,
  useMarkCommissionAsPaid,
  useCommissionSummary,
} from '@/lib/api/hooks/useSales';
import type {
  SalesCommissionListItem,
  SalesCommissionStatus,
  CommissionPlanListItem,
  GetSalesCommissionsParams,
} from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const statusConfig: Record<SalesCommissionStatus, { label: string; bgColor: string; textColor: string }> = {
  Pending: { label: 'Beklemede', bgColor: 'bg-slate-200', textColor: 'text-slate-800' },
  Approved: { label: 'Onaylandı', bgColor: 'bg-slate-700', textColor: 'text-white' },
  Rejected: { label: 'Reddedildi', bgColor: 'bg-slate-900', textColor: 'text-white' },
  Paid: { label: 'Ödendi', bgColor: 'bg-slate-800', textColor: 'text-white' },
  Cancelled: { label: 'İptal', bgColor: 'bg-slate-300', textColor: 'text-slate-700' },
};

const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

export default function CommissionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('commissions');
  const [filters, setFilters] = useState<GetSalesCommissionsParams>({
    page: 1,
    pageSize: 10,
  });
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'reject' | 'pay' | null>(null);
  const [actionValue, setActionValue] = useState('');
  const [selectedCommission, setSelectedCommission] = useState<SalesCommissionListItem | null>(null);

  const { data: commissionsData, isLoading: commissionsLoading, refetch } = useSalesCommissions(filters);
  const { data: plansData, isLoading: plansLoading } = useCommissionPlans({ pageSize: 100 });
  const { data: summaryData } = useCommissionSummary();

  const approveMutation = useApproveCommission();
  const rejectMutation = useRejectCommission();
  const markPaidMutation = useMarkCommissionAsPaid();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('Komisyon onaylandı');
    } catch {
      message.error('Komisyon onaylanamadı');
    }
  };

  const handleRejectClick = (commission: SalesCommissionListItem) => {
    setSelectedCommission(commission);
    setActionType('reject');
    setActionValue('');
    setActionModalOpen(true);
  };

  const handlePayClick = (commission: SalesCommissionListItem) => {
    setSelectedCommission(commission);
    setActionType('pay');
    setActionValue('');
    setActionModalOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedCommission) return;

    if (actionType === 'reject' && !actionValue.trim()) {
      message.error('Red sebebi girilmelidir');
      return;
    }

    try {
      if (actionType === 'reject') {
        await rejectMutation.mutateAsync({ id: selectedCommission.id, reason: actionValue });
        message.success('Komisyon reddedildi');
      } else if (actionType === 'pay') {
        await markPaidMutation.mutateAsync({ id: selectedCommission.id, paymentReference: actionValue });
        message.success('Komisyon ödendi olarak işaretlendi');
      }
      setActionModalOpen(false);
      setSelectedCommission(null);
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  const commissions = commissionsData?.items ?? [];
  const plans = plansData?.items ?? [];

  const getActionMenu = (record: SalesCommissionListItem): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/commissions/${record.id}`),
      },
    ];

    if (record.status === 'Pending') {
      items.push(
        {
          key: 'approve',
          icon: <CheckIcon className="w-4 h-4" />,
          label: 'Onayla',
          onClick: () => handleApprove(record.id),
        },
        {
          key: 'reject',
          icon: <XMarkIcon className="w-4 h-4" />,
          label: 'Reddet',
          danger: true,
          onClick: () => handleRejectClick(record),
        }
      );
    }

    if (record.status === 'Approved') {
      items.push({
        key: 'pay',
        icon: <CurrencyDollarIcon className="w-4 h-4" />,
        label: 'Ödendi İşaretle',
        onClick: () => handlePayClick(record),
      });
    }

    return items;
  };

  const commissionColumns: ColumnsType<SalesCommissionListItem> = [
    {
      title: 'Referans',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      render: (text: string, record) => (
        <button
          onClick={() => router.push(`/sales/commissions/${record.id}`)}
          className="text-slate-900 hover:text-slate-600 font-medium"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Satış Temsilcisi',
      dataIndex: 'salesPersonName',
      key: 'salesPersonName',
    },
    {
      title: 'Sipariş',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string, record) => (
        <button
          onClick={() => router.push(`/sales/orders/${record.orderId}`)}
          className="text-slate-600 hover:text-slate-900"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Sipariş Tutarı',
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      render: (amount: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount),
      align: 'right',
    },
    {
      title: 'Komisyon',
      dataIndex: 'commissionAmount',
      key: 'commissionAmount',
      render: (amount: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount),
      align: 'right',
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: true,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: SalesCommissionStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisVerticalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  const planColumns: ColumnsType<CommissionPlanListItem> = [
    {
      title: 'Plan Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <button
          onClick={() => router.push(`/sales/commissions/plans/${record.id}`)}
          className="text-slate-900 hover:text-slate-600 font-medium"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeLabels: Record<string, string> = {
          Percentage: 'Yüzde',
          FixedAmount: 'Sabit Tutar',
          Tiered: 'Kademeli',
          Target: 'Hedef Bazlı',
        };
        return typeLabels[type] || type;
      },
    },
    {
      title: 'Temel Oran',
      dataIndex: 'baseRate',
      key: 'baseRate',
      render: (rate: number) => `%${rate}`,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
  ];

  const handleTableChange = (pagination: any, tableFilters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: tableFilters.status?.[0],
      sortBy: sorter.field,
      sortDescending: sorter.order === 'descend',
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Komisyonlar</h1>
            <p className="text-sm text-slate-500">Satış komisyonlarını yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={commissionsLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${commissionsLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => router.push('/sales/commissions/plans/new')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:border-slate-400 transition-colors"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Yeni Plan
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam Komisyon</p>
              <p className="text-xl font-semibold text-slate-900">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(summaryData?.totalCommission || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bekleyen</p>
              <p className="text-xl font-semibold text-slate-900">{summaryData?.pendingCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Onaylanan</p>
              <p className="text-xl font-semibold text-slate-900">{summaryData?.approvedCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ödenen</p>
              <p className="text-xl font-semibold text-slate-900">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(summaryData?.paidAmount || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="[&_.ant-tabs-nav]:!mb-0"
        items={[
          {
            key: 'commissions',
            label: 'Komisyonlar',
            children: (
              <>
                {/* Filters */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Ara..."
                      prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
                      allowClear
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))
                      }
                      className="h-10"
                    />
                    <Select
                      placeholder="Durum"
                      allowClear
                      style={{ width: '100%' }}
                      options={statusOptions}
                      onChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}
                      className="h-10"
                    />
                    <RangePicker
                      style={{ width: '100%' }}
                      placeholder={['Başlangıç', 'Bitiş']}
                      onChange={(dates) =>
                        setFilters((prev) => ({
                          ...prev,
                          fromDate: dates?.[0]?.toISOString(),
                          toDate: dates?.[1]?.toISOString(),
                          page: 1,
                        }))
                      }
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Commissions Table */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <Table
                    columns={commissionColumns}
                    dataSource={commissions}
                    rowKey="id"
                    loading={commissionsLoading}
                    onChange={handleTableChange}
                    pagination={{
                      current: filters.page,
                      pageSize: filters.pageSize,
                      total: commissionsData?.totalCount ?? 0,
                      showSizeChanger: true,
                      showTotal: (total) => `Toplam ${total} komisyon`,
                    }}
                    className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
                  />
                </div>
              </>
            ),
          },
          {
            key: 'plans',
            label: 'Komisyon Planları',
            children: (
              <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900">Komisyon Planları</h3>
                  <button
                    onClick={() => router.push('/sales/commissions/plans/new')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Yeni Plan
                  </button>
                </div>
                <Table
                  columns={planColumns}
                  dataSource={plans}
                  rowKey="id"
                  loading={plansLoading}
                  pagination={false}
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
                />
              </div>
            ),
          },
        ]}
      />

      {/* Action Modal */}
      <Modal
        title={actionType === 'reject' ? 'Komisyonu Reddet' : 'Ödeme Bilgisi'}
        open={actionModalOpen}
        onOk={handleActionConfirm}
        onCancel={() => setActionModalOpen(false)}
        okText={actionType === 'reject' ? 'Reddet' : 'Onayla'}
        okType={actionType === 'reject' ? 'danger' : 'primary'}
        cancelText="Vazgeç"
        confirmLoading={rejectMutation.isPending || markPaidMutation.isPending}
      >
        <div className="mb-4">
          <p className="text-slate-600">
            <strong>{selectedCommission?.salesPersonName}</strong> için{' '}
            <strong>
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
                selectedCommission?.commissionAmount || 0
              )}
            </strong>{' '}
            komisyon
          </p>
        </div>
        <Input.TextArea
          placeholder={actionType === 'reject' ? 'Red sebebini giriniz...' : 'Ödeme referansı (opsiyonel)...'}
          rows={3}
          value={actionValue}
          onChange={(e) => setActionValue(e.target.value)}
        />
      </Modal>
    </div>
  );
}
