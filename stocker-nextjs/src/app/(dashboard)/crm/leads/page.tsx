'use client';

/**
 * Leads List Page
 * Monochrome design system following inventory/HR patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Button, Dropdown, Tooltip, Spin } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserPlusIcon,
  CheckCircleIcon,
  FireIcon,
  StarIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ArrowRightCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useLeads,
  useUpdateLead,
  useDeleteLead,
  useConvertLead,
  useQualifyLead,
  useDisqualifyLead,
} from '@/lib/api/hooks/useCRM';
import type { Lead } from '@/lib/api/services/crm.service';
import { ConvertLeadModal } from '@/features/leads/components';
import {
  showUpdateSuccess,
  showDeleteSuccess,
  showError,
  confirmDelete,
  confirmAction,
  showInfo,
} from '@/lib/utils/sweetalert';
import type { ColumnsType } from 'antd/es/table';
import { ProtectedRoute } from '@/components/auth';

// Monochrome lead status configuration
const leadStatusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  New: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Yeni' },
  Contacted: { color: '#334155', bgColor: '#f1f5f9', label: 'Iletisime Gecildi' },
  Working: { color: '#475569', bgColor: '#e2e8f0', label: 'Calisiliyor' },
  Qualified: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Nitelikli' },
  Unqualified: { color: '#64748b', bgColor: '#f1f5f9', label: 'Niteliksiz' },
  Converted: { color: '#334155', bgColor: '#e2e8f0', label: 'Donusturuldu' },
  Lost: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Kayip' },
};

// Monochrome lead rating configuration
const leadRatingConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Unrated: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Derecelendirilmedi' },
  Cold: { color: '#64748b', bgColor: '#f1f5f9', label: 'Soguk' },
  Warm: { color: '#475569', bgColor: '#e2e8f0', label: 'Ilik' },
  Hot: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Sicak' },
};

function LeadsPageContent() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [selectedRating, setSelectedRating] = useState<string | undefined>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);

  // Row selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data, isLoading, refetch } = useLeads({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();
  const qualifyLead = useQualifyLead();
  const disqualifyLead = useDisqualifyLead();

  const leads = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = !selectedStatus || lead.status === selectedStatus;
      const matchesRating = !selectedRating || lead.rating === selectedRating;
      return matchesStatus && matchesRating;
    });
  }, [leads, selectedStatus, selectedRating]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter((l) => l.status === 'New').length;
    const qualified = leads.filter((l) => l.status === 'Qualified').length;
    const hot = leads.filter((l) => l.rating === 'Hot').length;
    return { total, newLeads, qualified, hot };
  }, [leads]);

  // CRUD Handlers
  const handleView = (lead: Lead) => {
    router.push(`/crm/leads/${lead.id}`);
  };

  const handleEdit = (lead: Lead) => {
    router.push(`/crm/leads/${lead.id}/edit`);
  };

  const handleDelete = async (id: string, lead: Lead) => {
    const confirmed = await confirmDelete('Potansiyel Musteri', `${lead.firstName} ${lead.lastName}`);
    if (confirmed) {
      try {
        await deleteLead.mutateAsync(id);
        showDeleteSuccess('potansiyel musteri');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const handleConvert = (lead: Lead) => {
    setLeadToConvert(lead);
    setConvertModalOpen(true);
  };

  const handleQualify = async (lead: Lead) => {
    const confirmed = await confirmAction(
      'Lead\'i Nitelikli Olarak Isaretle',
      `"${lead.firstName} ${lead.lastName}" lead'ini nitelikli olarak isaretlemek istediginizden emin misiniz?`,
      'Nitelikli Isaretle'
    );
    if (confirmed) {
      try {
        await qualifyLead.mutateAsync({ id: lead.id.toString() });
        showUpdateSuccess('Lead', 'nitelikli olarak isaretlendi');
      } catch (error: unknown) {
        const apiError = (error as { response?: { data?: { detail?: string; errors?: Array<{ message?: string }>; title?: string } } })?.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || (error instanceof Error ? error.message : 'Islem basarisiz');
        showError(errorMessage);
      }
    }
  };

  const handleDisqualify = async (lead: Lead) => {
    const confirmed = await confirmAction(
      'Lead\'i Niteliksiz Olarak Isaretle',
      `"${lead.firstName} ${lead.lastName}" lead'ini niteliksiz olarak isaretlemek istediginizden emin misiniz?`,
      'Niteliksiz Isaretle'
    );
    if (confirmed) {
      try {
        await disqualifyLead.mutateAsync({
          id: lead.id.toString(),
          reason: 'Kullanici tarafindan niteliksiz isaretlendi',
        });
        showInfo('Lead Isaretlendi', 'Lead niteliksiz olarak isaretlendi');
      } catch (error: unknown) {
        const apiError = (error as { response?: { data?: { detail?: string; errors?: Array<{ message?: string }>; title?: string } } })?.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || (error instanceof Error ? error.message : 'Islem basarisiz');
        showError(errorMessage);
      }
    }
  };

  const handleConvertSubmit = async (values: Record<string, unknown>) => {
    if (!leadToConvert) return;
    try {
      await convertLead.mutateAsync({
        leadId: leadToConvert.id,
        customerData: values,
      });
      showUpdateSuccess('potansiyel musteri', 'musteriye donusturuldu');
      setConvertModalOpen(false);
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { detail?: string; errors?: Array<{ message?: string }>; title?: string } } })?.response?.data;
      let errorMessage = 'Donusturme islemi basarisiz';
      if (apiError) {
        errorMessage = apiError.detail || apiError.errors?.[0]?.message || apiError.title || errorMessage;
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      showError(errorMessage);
    }
  };

  const handleCreate = () => {
    router.push('/crm/leads/new');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus(undefined);
    setSelectedRating(undefined);
  };

  // Table columns
  const columns: ColumnsType<Lead> = [
    {
      title: 'Lead',
      key: 'lead',
      width: 280,
      render: (_, record) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record)}
          >
            {record.firstName} {record.lastName}
          </span>
          <div className="text-xs text-slate-500">
            {record.company && `${record.company} - `}
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Sirket',
      dataIndex: 'company',
      key: 'company',
      width: 160,
      render: (company) => <span className="text-slate-600">{company || '-'}</span>,
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone) => <span className="text-slate-600">{phone || '-'}</span>,
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source) => <span className="text-slate-600">{source || '-'}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        const config = leadStatusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: status };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Derece',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating: string) => {
        const config = leadRatingConfig[rating] || { color: '#64748b', bgColor: '#f1f5f9', label: rating };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Puan',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      align: 'center',
      render: (score) => (
        <span className="font-semibold text-slate-900">{score || 0}</span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Goruntule',
            onClick: () => handleView(record),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Duzenle',
            onClick: () => handleEdit(record),
          },
          { type: 'divider' as const },
          ...(record.status !== 'Converted' && record.status !== 'Lost' ? [
            {
              key: 'qualify',
              icon: <CheckCircleIcon className="w-4 h-4" />,
              label: 'Nitelikli Isaretle',
              onClick: () => handleQualify(record),
            },
            {
              key: 'disqualify',
              icon: <XCircleIcon className="w-4 h-4" />,
              label: 'Niteliksiz Isaretle',
              onClick: () => handleDisqualify(record),
            },
            {
              key: 'convert',
              icon: <ArrowRightCircleIcon className="w-4 h-4" />,
              label: 'Musteriye Donustur',
              onClick: () => handleConvert(record),
            },
            { type: 'divider' as const },
          ] : []),
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record.id, record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600 hover:text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <UserPlusIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Potansiyel Musteriler</h1>
            <p className="text-sm text-slate-500">Lead'leri yonetin ve musteriye donusturun</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            Yeni Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UserPlusIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Lead</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <StarIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.newLeads}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Yeni Lead</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.qualified}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Nitelikli</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
                <FireIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.hot}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Sicak Lead</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Lead ara... (ad, soyad, e-posta, sirket)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 160 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={Object.entries(leadStatusConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Derece"
            allowClear
            style={{ width: 160 }}
            value={selectedRating}
            onChange={setSelectedRating}
            options={Object.entries(leadRatingConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Button onClick={clearFilters} className="!border-slate-300 !text-slate-600">
            Temizle
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Results count */}
        <div className="text-sm text-slate-500 mb-4">
          {filteredLeads.length} lead listeleniyor
          {selectedRowKeys.length > 0 && ` - ${selectedRowKeys.length} secili`}
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredLeads}
          rowKey="id"
          loading={isLoading || updateLead.isPending || deleteLead.isPending}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} lead`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>

      {/* Convert to Customer Modal */}
      <ConvertLeadModal
        open={convertModalOpen}
        loading={convertLead.isPending}
        initialValues={
          leadToConvert
            ? {
                companyName: leadToConvert.company,
                contactPerson: `${leadToConvert.firstName} ${leadToConvert.lastName}`,
                email: leadToConvert.email,
                phone: leadToConvert.phone,
              }
            : undefined
        }
        onCancel={() => setConvertModalOpen(false)}
        onSubmit={handleConvertSubmit}
      />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <ProtectedRoute permission="CRM.Leads:View">
      <LeadsPageContent />
    </ProtectedRoute>
  );
}
