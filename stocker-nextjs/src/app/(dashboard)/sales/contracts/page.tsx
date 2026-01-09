'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Table, Select, Modal, Dropdown, Spin } from 'antd';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import {
  useCustomerContracts,
  useActivateCustomerContract,
  useSuspendCustomerContract,
  useDeleteCustomerContract,
} from '@/lib/api/hooks/useSales';
import type { CustomerContractQueryParams, ContractStatus, ContractType, CustomerContractListDto } from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const statusConfig: Record<ContractStatus, { label: string; bgColor: string; textColor: string }> = {
  Draft: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
  Active: { label: 'Aktif', bgColor: 'bg-slate-800', textColor: 'text-white' },
  Suspended: { label: 'Askıda', bgColor: 'bg-slate-400', textColor: 'text-slate-800' },
  Terminated: { label: 'Feshedildi', bgColor: 'bg-slate-900', textColor: 'text-white' },
  Expired: { label: 'Süresi Doldu', bgColor: 'bg-slate-300', textColor: 'text-slate-700' },
  PendingApproval: { label: 'Onay Bekliyor', bgColor: 'bg-slate-500', textColor: 'text-white' },
};

const typeLabels: Record<ContractType, string> = {
  Standard: 'Standart',
  Premium: 'Premium',
  Enterprise: 'Kurumsal',
  Custom: 'Özel',
  Framework: 'Çerçeve',
  ServiceLevel: 'SLA',
};

const statusOptions: { value: ContractStatus; label: string }[] = Object.entries(statusConfig).map(
  ([value, config]) => ({ value: value as ContractStatus, label: config.label })
);

const typeOptions: { value: ContractType; label: string }[] = Object.entries(typeLabels).map(
  ([value, label]) => ({ value: value as ContractType, label })
);

export default function ContractsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<CustomerContractQueryParams>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch contracts
  const { data, isLoading, error, refetch } = useCustomerContracts({
    page: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    ...filters,
  });

  const activateMutation = useActivateCustomerContract();
  const suspendMutation = useSuspendCustomerContract();
  const deleteMutation = useDeleteCustomerContract();

  const contracts = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleCreate = () => {
    router.push('/sales/contracts/new');
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleSuspend = (id: string) => {
    Modal.confirm({
      title: 'Sözleşmeyi Askıya Al',
      content: 'Bu sözleşmeyi askıya almak istediğinizden emin misiniz?',
      okText: 'Askıya Al',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await suspendMutation.mutateAsync({ id, reason: 'Kullanıcı tarafından askıya alındı' });
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  const handleTerminate = (id: string) => {
    Modal.confirm({
      title: 'Sözleşmeyi Feshet',
      content: 'Bu sözleşmeyi feshetmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Feshet',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => {
        router.push(`/sales/contracts/${id}/edit?action=terminate`);
      },
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Sözleşmeyi Sil',
      content: 'Bu sözleşmeyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  const getActionMenu = (record: CustomerContractListDto): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/contracts/${record.id}`),
      },
      {
        key: 'edit',
        icon: <PencilIcon className="w-4 h-4" />,
        label: 'Düzenle',
        onClick: () => router.push(`/sales/contracts/${record.id}/edit`),
      },
    ];

    if (record.status === 'Draft' || record.status === 'Suspended') {
      items.push({
        key: 'activate',
        icon: <CheckIcon className="w-4 h-4" />,
        label: 'Aktifleştir',
        onClick: () => handleActivate(record.id),
      });
    }

    if (record.status === 'Active') {
      items.push({
        key: 'suspend',
        icon: <PauseIcon className="w-4 h-4" />,
        label: 'Askıya Al',
        onClick: () => handleSuspend(record.id),
      });
    }

    if (['Active', 'Suspended'].includes(record.status)) {
      items.push({
        key: 'terminate',
        icon: <XMarkIcon className="w-4 h-4" />,
        label: 'Feshet',
        danger: true,
        onClick: () => handleTerminate(record.id),
      });
    }

    if (record.status === 'Draft') {
      items.push({
        key: 'delete',
        icon: <TrashIcon className="w-4 h-4" />,
        label: 'Sil',
        danger: true,
        onClick: () => handleDelete(record.id),
      });
    }

    return items;
  };

  const columns: ColumnsType<CustomerContractListDto> = [
    {
      title: 'Sözleşme No',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      render: (text: string, record) => (
        <button
          onClick={() => router.push(`/sales/contracts/${record.id}`)}
          className="text-slate-900 hover:text-slate-600 font-medium"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tür',
      dataIndex: 'contractType',
      key: 'contractType',
      render: (type: ContractType) => typeLabels[type],
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Değer',
      dataIndex: 'contractValue',
      key: 'contractValue',
      render: (value: { amount: number; currency: string } | undefined) =>
        value ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: value.currency || 'TRY' }).format(value.amount || 0) : '-',
      align: 'right',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: ContractStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
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

  // Calculate stats
  const activeCount = contracts.filter(c => c.status === 'Active').length;
  const pendingCount = contracts.filter(c => c.status === 'PendingApproval').length;
  const expiredCount = contracts.filter(c => c.status === 'Expired').length;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Müşteri Sözleşmeleri</h1>
            <p className="text-sm text-slate-500">Müşteri sözleşmelerini yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Sözleşme
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam Sözleşme</p>
              <p className="text-xl font-semibold text-slate-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Aktif</p>
              <p className="text-xl font-semibold text-slate-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <PauseIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Onay Bekleyen</p>
              <p className="text-xl font-semibold text-slate-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <XMarkIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Süresi Dolan</p>
              <p className="text-xl font-semibold text-slate-900">{expiredCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-red-600">
              <XMarkIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Sözleşmeler yüklenemedi</p>
              <p className="text-sm text-red-600">
                {error instanceof Error ? error.message : 'Sözleşmeler getirilirken bir hata oluştu.'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Sözleşme ara... (no, müşteri adı)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-10"
          />
          <Select
            placeholder="Durum"
            allowClear
            options={statusOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            className="h-10"
            style={{ width: '100%' }}
          />
          <Select
            placeholder="Tür"
            allowClear
            options={typeOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, contractType: value }))}
            className="h-10"
            style={{ width: '100%' }}
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
            dataSource={contracts}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} sözleşme`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}
