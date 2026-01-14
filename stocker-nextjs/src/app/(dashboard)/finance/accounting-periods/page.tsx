'use client';

/**
 * Accounting Periods (Muhasebe Dönemleri) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  EllipsisHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import {
  useAccountingPeriods,
  useSoftCloseAccountingPeriod,
  useHardCloseAccountingPeriod,
  useReopenAccountingPeriod,
  useLockAccountingPeriod,
  useUnlockAccountingPeriod
} from '@/lib/api/hooks/useFinance';
import type { AccountingPeriodDto, AccountingPeriodFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Monochrome status configuration
const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  Open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Açık', icon: <PlayIcon className="w-3 h-3" /> },
  SoftClosed: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Geçici Kapalı', icon: <StopIcon className="w-3 h-3" /> },
  HardClosed: { bg: 'bg-slate-900', text: 'text-white', label: 'Kesin Kapalı', icon: <LockClosedIcon className="w-3 h-3" /> },
  Locked: { bg: 'bg-red-100', text: 'text-red-700', label: 'Kilitli', icon: <LockClosedIcon className="w-3 h-3" /> },
};

// Period type configuration
const periodTypeConfig: Record<string, { label: string }> = {
  Monthly: { label: 'Aylık' },
  Quarterly: { label: 'Çeyreklik' },
  Annual: { label: 'Yıllık' },
  Custom: { label: 'Özel' },
};

export default function AccountingPeriodsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);

  // Mutations
  const softClose = useSoftCloseAccountingPeriod();
  const hardClose = useHardCloseAccountingPeriod();
  const reopen = useReopenAccountingPeriod();
  const lock = useLockAccountingPeriod();
  const unlock = useUnlockAccountingPeriod();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Build filter
  const filters: AccountingPeriodFilterDto = {
    pageNumber: currentPage,
    pageSize,
    status: status as any,
  };

  // Fetch accounting periods from API
  const { data, isLoading, error, refetch } = useAccountingPeriods(filters);

  const periods = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    open: periods.filter((p) => p.status === 'Open').length,
    softClosed: periods.filter((p) => p.status === 'SoftClosed').length,
    hardClosed: periods.filter((p) => p.status === 'HardClosed').length,
  };

  const handleSoftClose = async (period: AccountingPeriodDto) => {
    Modal.confirm({
      title: 'Dönemi Geçici Kapat',
      content: `${period.periodName} dönemi geçici olarak kapatılacak. Gerekirse yeniden açabilirsiniz.`,
      okText: 'Geçici Kapat',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await softClose.mutateAsync(period.id);
          showSuccess('Dönem geçici olarak kapatıldı!');
        } catch (err) {
          showApiError(err, 'Dönem kapatılırken bir hata oluştu');
        }
      },
    });
  };

  const handleHardClose = async (period: AccountingPeriodDto) => {
    Modal.confirm({
      title: 'Dönemi Kesin Kapat',
      content: `${period.periodName} dönemi kesin olarak kapatılacak. Bu işlem GERİ ALINAMAZ! Dönem kalıcı olarak kilitlenecektir.`,
      okText: 'Kesin Kapat',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await hardClose.mutateAsync(period.id);
          showSuccess('Dönem kesin olarak kapatıldı!');
        } catch (err) {
          showApiError(err, 'Dönem kapatılırken bir hata oluştu');
        }
      },
    });
  };

  const handleReopen = async (period: AccountingPeriodDto) => {
    Modal.confirm({
      title: 'Dönemi Yeniden Aç',
      content: `${period.periodName} dönemi yeniden açılacak.`,
      okText: 'Yeniden Aç',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await reopen.mutateAsync(period.id);
          showSuccess('Dönem yeniden açıldı!');
        } catch (err) {
          showApiError(err, 'Dönem açılırken bir hata oluştu');
        }
      },
    });
  };

  const handleLock = async (period: AccountingPeriodDto) => {
    try {
      await lock.mutateAsync(period.id);
      showSuccess('Dönem kilitlendi!');
    } catch (err) {
      showApiError(err, 'Dönem kilitlenirken bir hata oluştu');
    }
  };

  const handleUnlock = async (period: AccountingPeriodDto) => {
    try {
      await unlock.mutateAsync(period.id);
      showSuccess('Dönem kilidi açıldı!');
    } catch (err) {
      showApiError(err, 'Dönem kilidi açılırken bir hata oluştu');
    }
  };

  const handleCreate = () => {
    router.push('/finance/accounting-periods/new');
  };

  const handleView = (periodId: number) => {
    router.push(`/finance/accounting-periods/${periodId}`);
  };

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'Open', label: 'Açık' },
    { value: 'SoftClosed', label: 'Geçici Kapalı' },
    { value: 'HardClosed', label: 'Kesin Kapalı' },
    { value: 'Locked', label: 'Kilitli' },
  ];

  const getActionItems = (record: AccountingPeriodDto) => {
    const items: any[] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => handleView(record.id),
      },
    ];

    if (record.status === 'Open') {
      items.push(
        { type: 'divider' },
        {
          key: 'softClose',
          icon: <StopIcon className="w-4 h-4" />,
          label: 'Geçici Kapat',
          onClick: () => handleSoftClose(record),
        },
        {
          key: 'hardClose',
          icon: <LockClosedIcon className="w-4 h-4" />,
          label: 'Kesin Kapat',
          danger: true,
          onClick: () => handleHardClose(record),
        }
      );
    }

    if (record.status === 'SoftClosed') {
      items.push(
        { type: 'divider' },
        {
          key: 'reopen',
          icon: <PlayIcon className="w-4 h-4" />,
          label: 'Yeniden Aç',
          onClick: () => handleReopen(record),
        },
        {
          key: 'hardClose',
          icon: <LockClosedIcon className="w-4 h-4" />,
          label: 'Kesin Kapat',
          danger: true,
          onClick: () => handleHardClose(record),
        }
      );
    }

    if (record.status === 'Open' || record.status === 'SoftClosed') {
      items.push({
        key: 'lock',
        icon: <LockClosedIcon className="w-4 h-4" />,
        label: 'Kilitle',
        onClick: () => handleLock(record),
      });
    }

    if (record.status === 'Locked') {
      items.push({
        key: 'unlock',
        icon: <LockOpenIcon className="w-4 h-4" />,
        label: 'Kilidi Aç',
        onClick: () => handleUnlock(record),
      });
    }

    return items;
  };

  const columns: ColumnsType<AccountingPeriodDto> = [
    {
      title: 'Dönem Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text}</div>
          <div className="text-xs text-slate-500">
            {periodTypeConfig[record.periodType]?.label || record.periodType}
          </div>
        </div>
      ),
    },
    {
      title: 'Yıl',
      dataIndex: 'year',
      key: 'year',
      width: 80,
      render: (year) => (
        <span className="text-sm font-medium text-slate-700">{year}</span>
      ),
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD MMM YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD MMM YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = statusConfig[status] || statusConfig.Open;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md ${config.bg} ${config.text}`}>
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
        >
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CalendarIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hesap Dönemleri</h1>
              <p className="text-sm text-slate-500">Muhasebe dönemlerini yönetin</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                onClick={() => refetch()}
                loading={isLoading}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Yenile
              </Button>
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleCreate}
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Dönem Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <PlayIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.open}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Açık</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <StopIcon className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.softClosed}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Geçici Kapalı</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <LockClosedIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.hardClosed}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kesin Kapalı</div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-slate-300 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900">Dönemler yüklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Dönemler getirilirken bir hata oluştu.'}
              </p>
            </div>
            <Button
              size="small"
              onClick={() => refetch()}
              className="!border-slate-300 !text-slate-600"
            >
              Tekrar Dene
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Dönem ara... (ad, yıl)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            value={status || undefined}
            onChange={(value) => setStatus(value || undefined)}
            options={statusOptions}
            placeholder="Durum"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={periods}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} dönem`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onRow={(record) => ({
              onClick: () => handleView(record.id),
              className: 'cursor-pointer',
            })}
            className={tableClassName}
          />
        )}
      </div>
    </div>
  );
}
