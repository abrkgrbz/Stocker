'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Table, Input, Select, Tooltip, Spin, Empty } from 'antd';
import {
  ArrowPathIcon,
  EyeIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { LoyaltyProgramDto } from '@/lib/api/services/crm.types';
import { LoyaltyProgramType } from '@/lib/api/services/crm.types';
import { useLoyaltyPrograms, useDeleteLoyaltyProgram } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';

const programTypeLabels: Record<LoyaltyProgramType, { label: string }> = {
  [LoyaltyProgramType.PointsBased]: { label: 'Puan Tabanli' },
  [LoyaltyProgramType.TierBased]: { label: 'Kademe Tabanli' },
  [LoyaltyProgramType.SpendBased]: { label: 'Harcama Tabanli' },
  [LoyaltyProgramType.Subscription]: { label: 'Abonelik' },
  [LoyaltyProgramType.Hybrid]: { label: 'Hibrit' },
};

export default function LoyaltyProgramsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<LoyaltyProgramType | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);

  // API Hooks
  const { data, isLoading, refetch } = useLoyaltyPrograms({
    page: currentPage,
    pageSize,
    programType: typeFilter,
    isActive: activeFilter,
  });
  const deleteLoyaltyProgram = useDeleteLoyaltyProgram();

  const programs = data || [];
  const totalCount = programs.length;

  // Stats calculations
  const totalPrograms = programs.length;
  const activePrograms = programs.filter((p) => p.isActive).length;
  const totalMembers = programs.reduce((sum, p) => sum + ((p as any).memberCount || 0), 0);
  const totalPoints = programs.reduce((sum, p) => sum + ((p as any).totalPointsDistributed || 0), 0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/loyalty-programs/new');
  };

  const handleView = (program: LoyaltyProgramDto) => {
    router.push(`/crm/loyalty-programs/${program.id}`);
  };

  const handleEdit = (program: LoyaltyProgramDto) => {
    router.push(`/crm/loyalty-programs/${program.id}/edit`);
  };

  const handleDelete = async (id: string, program: LoyaltyProgramDto) => {
    const confirmed = await confirmDelete(
      'Sadakat Programi',
      program.name
    );

    if (confirmed) {
      try {
        await deleteLoyaltyProgram.mutateAsync(id);
        showDeleteSuccess('sadakat programi');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const formatCurrency = (value?: number): string => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const columns: ColumnsType<LoyaltyProgramDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (text: string) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{text}</span>
      ),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-slate-900">{text}</span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'programType',
      key: 'programType',
      width: 140,
      render: (type: LoyaltyProgramType) => {
        const info = programTypeLabels[type];
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {info?.label || type}
          </span>
        );
      },
    },
    {
      title: 'Puan/Harcama',
      key: 'pointsPerSpend',
      width: 140,
      render: (_: unknown, record: LoyaltyProgramDto) => (
        <span className="text-slate-700">
          {record.pointsPerSpend} puan / {formatCurrency(record.spendUnit)}
        </span>
      ),
    },
    {
      title: 'Puan Degeri',
      dataIndex: 'pointValue',
      key: 'pointValue',
      width: 120,
      render: (value: number) => <span className="text-slate-700 font-medium">{formatCurrency(value)}</span>,
    },
    {
      title: 'Min. Kullanim',
      dataIndex: 'minimumRedemptionPoints',
      key: 'minimumRedemptionPoints',
      width: 120,
      render: (value: number) => <span className="text-slate-700">{value} puan</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {isActive ? (
            <CheckCircleIcon className="w-3.5 h-3.5" />
          ) : (
            <XCircleIcon className="w-3.5 h-3.5" />
          )}
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: LoyaltyProgramDto) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Goruntule">
            <Button
              type="text"
              size="small"
              icon={<EyeIcon className="w-4 h-4" />}
              onClick={() => handleView(record)}
              className="!text-slate-600 hover:!text-slate-900"
            />
          </Tooltip>
          <Tooltip title="Duzenle">
            <Button
              type="text"
              size="small"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => handleEdit(record)}
              className="!text-slate-600 hover:!text-slate-900"
            />
          </Tooltip>
          <Button
            type="text"
            danger
            size="small"
            onClick={() => handleDelete(record.id, record)}
            className="!text-red-500 hover:!text-red-600"
          >
            Sil
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <GiftIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Sadakat Programlari</h1>
            </div>
            <p className="text-sm text-slate-500 ml-13">
              Musteri sadakat programlarini yonetin ve oduller olusturun
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
              disabled={isLoading}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            >
              Yenile
            </Button>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={handleCreate}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Yeni Program
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <GiftIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Program</p>
              <p className="text-2xl font-bold text-slate-900">{totalPrograms}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <TrophyIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Aktif</p>
              <p className="text-2xl font-bold text-slate-900">{activePrograms}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Uye</p>
              <p className="text-2xl font-bold text-slate-900">{totalMembers.toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Dagitilan Puan</p>
              <p className="text-2xl font-bold text-slate-900">{totalPoints.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="Program ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
              allowClear
            />
            <Select
              placeholder="Tip"
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-40"
              allowClear
              options={Object.entries(programTypeLabels).map(([key, val]) => ({
                value: key,
                label: val.label,
              }))}
            />
            <Select
              placeholder="Durum"
              value={activeFilter}
              onChange={setActiveFilter}
              className="w-32"
              allowClear
              options={[
                { value: true, label: 'Aktif' },
                { value: false, label: 'Pasif' },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={programs}
            rowKey="id"
            loading={deleteLoyaltyProgram.isPending}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayit`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                      <GiftIcon className="w-10 h-10 text-slate-400" />
                    </div>
                  }
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-lg font-semibold text-slate-800 mb-2">
                        Henuz sadakat programi bulunmuyor
                      </div>
                      <div className="text-sm text-slate-500 mb-4">
                        Musterilerinizi odullendirmek icin program olusturun
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusIcon className="w-4 h-4" />}
                        onClick={handleCreate}
                        className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                      >
                        Ilk Programi Olustur
                      </Button>
                    </div>
                  }
                />
              ),
            }}
          />
        </div>
      </Spin>
    </div>
  );
}
