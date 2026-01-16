'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Table, Input, Select, Tooltip, Spin, Empty } from 'antd';
import {
  ArrowPathIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  UserGroupIcon,
  GiftIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { LoyaltyMembershipDto } from '@/lib/api/services/crm.types';
import { useLoyaltyMemberships, useDeleteLoyaltyMembership, useLoyaltyPrograms } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';

export default function LoyaltyMembershipsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [programFilter, setProgramFilter] = useState<string | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);

  // API Hooks
  const { data, isLoading, refetch } = useLoyaltyMemberships({
    programId: programFilter,
    isActive: activeFilter,
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });
  const deleteMembership = useDeleteLoyaltyMembership();

  // Get programs for filter
  const { data: programs } = useLoyaltyPrograms({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const memberships = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Stats calculations
  const totalMemberships = memberships.length;
  const activeMemberships = memberships.filter((m: LoyaltyMembershipDto) => m.isActive).length;
  const totalPoints = memberships.reduce((sum: number, m: LoyaltyMembershipDto) => sum + (m.currentPoints || 0), 0);
  const totalLifetimePoints = memberships.reduce((sum: number, m: LoyaltyMembershipDto) => sum + (m.lifetimePoints || 0), 0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/loyalty-memberships/new');
  };

  const handleView = (membership: LoyaltyMembershipDto) => {
    router.push(`/crm/loyalty-memberships/${membership.id}`);
  };

  const handleEdit = (membership: LoyaltyMembershipDto) => {
    router.push(`/crm/loyalty-memberships/${membership.id}/edit`);
  };

  const handleDelete = async (id: string, membership: LoyaltyMembershipDto) => {
    const confirmed = await confirmDelete(
      'Sadakat Uyeligi',
      membership.membershipNumber
    );

    if (confirmed) {
      try {
        await deleteMembership.mutateAsync(id);
        showDeleteSuccess('sadakat uyeligi');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const programOptions = (programs || []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const columns: ColumnsType<LoyaltyMembershipDto> = [
    {
      title: 'Uyelik No',
      dataIndex: 'membershipNumber',
      key: 'membershipNumber',
      width: 140,
      render: (text: string) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{text}</span>
      ),
    },
    {
      title: 'Musteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => (
        <span className="font-medium text-slate-900">{text || '-'}</span>
      ),
    },
    {
      title: 'Program',
      dataIndex: 'loyaltyProgramName',
      key: 'loyaltyProgramName',
      render: (text: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'Kademe',
      dataIndex: 'currentTierName',
      key: 'currentTierName',
      width: 120,
      render: (text: string) => (
        <span className="text-slate-700">{text || 'Baslangic'}</span>
      ),
    },
    {
      title: 'Mevcut Puan',
      dataIndex: 'currentPoints',
      key: 'currentPoints',
      width: 120,
      render: (value: number) => (
        <span className="text-slate-700 font-medium">{(value || 0).toLocaleString('tr-TR')}</span>
      ),
    },
    {
      title: 'Omur Boyu',
      dataIndex: 'lifetimePoints',
      key: 'lifetimePoints',
      width: 120,
      render: (value: number) => (
        <span className="text-slate-700">{(value || 0).toLocaleString('tr-TR')}</span>
      ),
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
      render: (_: unknown, record: LoyaltyMembershipDto) => (
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
                <UserGroupIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Sadakat Uyelikleri</h1>
            </div>
            <p className="text-sm text-slate-500 ml-13">
              Musteri sadakat programi uyeliklerini yonetin
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
              Yeni Uyelik
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Uyelik</p>
              <p className="text-2xl font-bold text-slate-900">{totalMemberships}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <GiftIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Aktif</p>
              <p className="text-2xl font-bold text-slate-900">{activeMemberships}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Mevcut Puan</p>
              <p className="text-2xl font-bold text-slate-900">{totalPoints.toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Omur Boyu Puan</p>
              <p className="text-2xl font-bold text-slate-900">{totalLifetimePoints.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="Uyelik ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
              allowClear
            />
            <Select
              placeholder="Program"
              value={programFilter}
              onChange={setProgramFilter}
              className="w-48"
              allowClear
              options={programOptions}
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
            dataSource={memberships}
            rowKey="id"
            loading={deleteMembership.isPending}
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
                      <UserGroupIcon className="w-10 h-10 text-slate-400" />
                    </div>
                  }
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-lg font-semibold text-slate-800 mb-2">
                        Henuz sadakat uyeligi bulunmuyor
                      </div>
                      <div className="text-sm text-slate-500 mb-4">
                        Musterilerinizi sadakat programlarina dahil edin
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusIcon className="w-4 h-4" />}
                        onClick={handleCreate}
                        className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                      >
                        Ilk Uyeligi Olustur
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
