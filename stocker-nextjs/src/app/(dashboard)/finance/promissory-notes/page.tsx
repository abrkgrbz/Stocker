'use client';

/**
 * Promissory Notes (Senetler) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { usePromissoryNotes, useDeletePromissoryNote } from '@/lib/api/hooks/useFinance';
import type { PromissoryNoteDto, PromissoryNoteFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Monochrome status configuration
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Active: { bg: 'bg-slate-300', text: 'text-slate-800', label: 'Aktif' },
  Endorsed: { bg: 'bg-slate-400', text: 'text-white', label: 'Ciro Edildi' },
  Collected: { bg: 'bg-slate-900', text: 'text-white', label: 'Tahsil Edildi' },
  Protested: { bg: 'bg-red-600', text: 'text-white', label: 'Protesto' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-400', label: 'İptal' },
};

// Note type configuration
const noteTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  Receivable: { label: 'Alacak Senedi', icon: <ArrowDownIcon className="w-4 h-4" />, color: 'text-green-600' },
  Payable: { label: 'Borç Senedi', icon: <ArrowUpIcon className="w-4 h-4" />, color: 'text-red-600' },
};

export default function PromissoryNotesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [noteType, setNoteType] = useState<string | undefined>(undefined);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Build filter
  const filters: PromissoryNoteFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    status: status as any,
    noteType: noteType as any,
  };

  // Fetch promissory notes from API
  const { data, isLoading, error, refetch } = usePromissoryNotes(filters);
  const deleteNote = useDeletePromissoryNote();

  const notes = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    active: notes.filter((n) => n.status === 'Active').length,
    collected: notes.filter((n) => n.status === 'Collected').length,
    protested: notes.filter((n) => n.status === 'Protested').length,
    totalAmount: notes.reduce((sum, n) => sum + (n.amount || 0), 0),
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async (noteId: number) => {
    try {
      await deleteNote.mutateAsync(noteId);
      showSuccess('Senet başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Senet silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleDeleteClick = (note: PromissoryNoteDto) => {
    Modal.confirm({
      title: 'Senedi Sil',
      content: `${note.noteNumber} numaralı senet silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleDelete(note.id);
      },
    });
  };

  const handleCreate = () => {
    router.push('/finance/promissory-notes/new');
  };

  const handleView = (noteId: number) => {
    router.push(`/finance/promissory-notes/${noteId}`);
  };

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'Active', label: 'Aktif' },
    { value: 'Endorsed', label: 'Ciro Edildi' },
    { value: 'Collected', label: 'Tahsil Edildi' },
    { value: 'Protested', label: 'Protesto' },
    { value: 'Cancelled', label: 'İptal' },
  ];

  const noteTypeOptions = [
    { value: '', label: 'Tüm Tipler' },
    { value: 'Receivable', label: 'Alacak Senetleri' },
    { value: 'Payable', label: 'Borç Senetleri' },
  ];

  const columns: ColumnsType<PromissoryNoteDto> = [
    {
      title: 'Senet No',
      dataIndex: 'noteNumber',
      key: 'noteNumber',
      render: (text, record) => {
        const typeConfig = noteTypeConfig[record.noteType] || noteTypeConfig.Receivable;
        return (
          <div className="flex items-center gap-2">
            <span className={typeConfig.color}>{typeConfig.icon}</span>
            <div>
              <div className="text-sm font-medium text-slate-900">{text}</div>
              <div className="text-xs text-slate-500">{typeConfig.label}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Borçlu/Alacaklı',
      dataIndex: 'currentAccountName',
      key: 'currentAccountName',
      render: (text) => (
        <span className="text-sm text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount, record) => {
        const typeConfig = noteTypeConfig[record.noteType] || noteTypeConfig.Receivable;
        return (
          <div className={`text-right text-sm font-semibold ${typeConfig.color}`}>
            {formatCurrency(amount || 0, record.currency || 'TRY')}
          </div>
        );
      },
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => {
        const isOverdue = date && dayjs(date).isBefore(dayjs(), 'day') && record.status === 'Active';
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
            {date ? dayjs(date).format('DD MMM YYYY') : '-'}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = statusConfig[status] || statusConfig.Active;
        return (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${config.bg} ${config.text}`}>
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
          <DocumentIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Senetler</h1>
              <p className="text-sm text-slate-500">Alacak ve borç senetlerini yönetin</p>
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
                Senet Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.collected}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tahsil/Ödendi</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.protested}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Protesto</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalAmount)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Tutar</div>
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
              <h3 className="text-sm font-medium text-slate-900">Senetler yüklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Senetler getirilirken bir hata oluştu.'}
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
              placeholder="Senet ara... (senet no, cari hesap)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            value={noteType || undefined}
            onChange={(value) => setNoteType(value || undefined)}
            options={noteTypeOptions}
            placeholder="Tip"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
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
            dataSource={notes}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} senet`,
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
