'use client';

/**
 * Exchange Rates (Döviz Kurları) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  XCircleIcon,
  GlobeAltIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useExchangeRates, useDeleteExchangeRate, useFetchTcmbRates } from '@/lib/api/hooks/useFinance';
import type { ExchangeRateSummaryDto, ExchangeRateFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Source configuration
const sourceConfig: Record<string, { label: string; color: string }> = {
  TCMB: { label: 'TCMB', color: 'bg-blue-100 text-blue-700' },
  Manual: { label: 'Manuel', color: 'bg-slate-100 text-slate-700' },
  Api: { label: 'API', color: 'bg-green-100 text-green-700' },
};

export default function ExchangeRatesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sourceCurrency, setSourceCurrency] = useState<string | undefined>(undefined);
  const [rateDate, setRateDate] = useState<dayjs.Dayjs | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Build filter
  const filters: ExchangeRateFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    sourceCurrency: sourceCurrency as any,
    startDate: rateDate?.toISOString(),
    endDate: rateDate?.toISOString(),
  };

  // Fetch exchange rates from API
  const { data, isLoading, error, refetch } = useExchangeRates(filters);
  const deleteRate = useDeleteExchangeRate();
  const fetchTcmb = useFetchTcmbRates();

  const rates = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const formatRate = (rate: number) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(rate);
  };

  const handleDelete = async (rateId: number) => {
    try {
      await deleteRate.mutateAsync(rateId);
      showSuccess('Kur başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Kur silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleFetchTcmb = async () => {
    try {
      await fetchTcmb.mutateAsync(rateDate?.toISOString());
      showSuccess('TCMB kurları başarıyla güncellendi!');
    } catch (err) {
      showApiError(err, 'TCMB kurları alınırken bir hata oluştu');
    }
  };

  const handleDeleteClick = (rate: ExchangeRateSummaryDto) => {
    Modal.confirm({
      title: 'Kuru Sil',
      content: `${rate.sourceCurrency}/${rate.targetCurrency} kuru silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleDelete(rate.id);
      },
    });
  };

  const handleCreate = () => {
    router.push('/finance/exchange-rates/new');
  };

  const handleView = (rateId: number) => {
    router.push(`/finance/exchange-rates/${rateId}`);
  };

  const currencyOptions = [
    { value: '', label: 'Tüm Para Birimleri' },
    { value: 'USD', label: 'USD - Amerikan Doları' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - İngiliz Sterlini' },
    { value: 'CHF', label: 'CHF - İsviçre Frangı' },
    { value: 'JPY', label: 'JPY - Japon Yeni' },
    { value: 'SAR', label: 'SAR - Suudi Riyali' },
    { value: 'AED', label: 'AED - BAE Dirhemi' },
  ];

  const columns: ColumnsType<ExchangeRateSummaryDto> = [
    {
      title: 'Para Birimi',
      key: 'currency',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-700">{record.sourceCurrency}</span>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">
              {record.sourceCurrency} / {record.targetCurrency}
            </div>
            <div className="text-xs text-slate-500">{record.rateTypeName || ''}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Alış',
      dataIndex: 'forexBuying',
      key: 'forexBuying',
      align: 'right',
      render: (rate) => (
        <span className="text-sm font-medium text-slate-900">{rate ? formatRate(rate) : '-'}</span>
      ),
    },
    {
      title: 'Satış',
      dataIndex: 'forexSelling',
      key: 'forexSelling',
      align: 'right',
      render: (rate) => (
        <span className="text-sm font-medium text-slate-900">{rate ? formatRate(rate) : '-'}</span>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'rateDate',
      key: 'rateDate',
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD MMM YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
      render: (source) => {
        const config = sourceConfig[source] || sourceConfig.Manual;
        return (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${config.color}`}>
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
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => handleView(record.id),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDeleteClick(record),
              },
            ],
          }}
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
          <ArrowsRightLeftIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Döviz Kurları</h1>
              <p className="text-sm text-slate-500">Güncel döviz kurlarını yönetin</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={<GlobeAltIcon className="w-4 h-4" />}
                onClick={handleFetchTcmb}
                loading={fetchTcmb.isPending}
                className="!border-blue-300 !text-blue-700 hover:!border-blue-400 !bg-blue-50"
              >
                TCMB Kurlarını Güncelle
              </Button>
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
                Kur Ekle
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
              <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Kur</div>
        </div>
        {rates.slice(0, 3).map((rate) => (
          <div key={rate.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700">{rate.sourceCurrency}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{formatRate(rate.forexSelling || rate.averageRate || 0)}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              {rate.sourceCurrency}/TRY
            </div>
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-slate-300 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900">Kurlar yüklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Kurlar getirilirken bir hata oluştu.'}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Kur ara... (para birimi)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            value={sourceCurrency || undefined}
            onChange={(value) => setSourceCurrency(value || undefined)}
            options={currencyOptions}
            placeholder="Para Birimi"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <DatePicker
            value={rateDate}
            onChange={(date) => setRateDate(date)}
            placeholder="Tarih"
            size="large"
            format="DD.MM.YYYY"
            className="w-full [&_.ant-picker]:!border-slate-300 [&_.ant-picker]:!rounded-lg"
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
            dataSource={rates}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kur`,
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
