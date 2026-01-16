'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Table, Input, Select, Tooltip, Spin, Empty, Progress } from 'antd';
import {
  ArrowPathIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { SurveyResponseDto } from '@/lib/api/services/crm.types';
import { SurveyType, SurveyResponseStatus } from '@/lib/api/services/crm.types';
import { useSurveyResponses, useDeleteSurveyResponse } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';

const surveyTypeLabels: Record<SurveyType, { label: string; icon: string }> = {
  [SurveyType.NPS]: { label: 'NPS', icon: '📊' },
  [SurveyType.CSAT]: { label: 'CSAT', icon: '😊' },
  [SurveyType.CES]: { label: 'CES', icon: '⚡' },
  [SurveyType.ProductFeedback]: { label: 'Urun Geribildirim', icon: '📦' },
  [SurveyType.ServiceFeedback]: { label: 'Hizmet Geribildirim', icon: '⭐' },
  [SurveyType.General]: { label: 'Genel', icon: '📝' },
  [SurveyType.Custom]: { label: 'Ozel', icon: '🔧' },
};

const statusLabels: Record<SurveyResponseStatus, { label: string; color: string }> = {
  [SurveyResponseStatus.Pending]: { label: 'Beklemede', color: 'bg-amber-100 text-amber-700' },
  [SurveyResponseStatus.Completed]: { label: 'Tamamlandi', color: 'bg-emerald-100 text-emerald-700' },
  [SurveyResponseStatus.Partial]: { label: 'Kismi', color: 'bg-blue-100 text-blue-700' },
  [SurveyResponseStatus.Expired]: { label: 'Suresi Doldu', color: 'bg-slate-100 text-slate-600' },
};

export default function SurveyResponsesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<SurveyType | undefined>();
  const [statusFilter, setStatusFilter] = useState<SurveyResponseStatus | undefined>();

  // API Hooks
  const { data, isLoading, refetch } = useSurveyResponses({
    type: typeFilter,
    status: statusFilter,
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });
  const deleteResponse = useDeleteSurveyResponse();

  const responses = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Stats calculations
  const totalResponses = responses.length;
  const completedResponses = responses.filter((r) => r.status === SurveyResponseStatus.Completed).length;
  const avgScore = responses.length > 0
    ? responses.reduce((sum, r) => sum + (r.overallScore || 0), 0) / responses.filter(r => r.overallScore).length || 0
    : 0;
  const avgNPS = responses.length > 0
    ? responses.reduce((sum, r) => sum + (r.npsScore || 0), 0) / responses.filter(r => r.npsScore !== undefined).length || 0
    : 0;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/survey-responses/new');
  };

  const handleView = (response: SurveyResponseDto) => {
    router.push(`/crm/survey-responses/${response.id}`);
  };

  const handleEdit = (response: SurveyResponseDto) => {
    router.push(`/crm/survey-responses/${response.id}/edit`);
  };

  const handleDelete = async (id: string, response: SurveyResponseDto) => {
    const confirmed = await confirmDelete(
      'Anket Yaniti',
      response.surveyName
    );

    if (confirmed) {
      try {
        await deleteResponse.mutateAsync(id);
        showDeleteSuccess('anket yaniti');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const columns: ColumnsType<SurveyResponseDto> = [
    {
      title: 'Anket',
      dataIndex: 'surveyName',
      key: 'surveyName',
      render: (text: string, record) => (
        <div>
          <span className="font-medium text-slate-900">{text}</span>
          <div className="flex items-center gap-1 mt-1">
            <span>{surveyTypeLabels[record.surveyType]?.icon}</span>
            <span className="text-xs text-slate-500">{surveyTypeLabels[record.surveyType]?.label}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Katilimci',
      key: 'participant',
      render: (_: unknown, record: SurveyResponseDto) => (
        <span className="text-slate-700">
          {record.isAnonymous ? (
            <span className="italic text-slate-400">Anonim</span>
          ) : (
            record.customerName || record.contactName || record.respondentName || '-'
          )}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: SurveyResponseStatus) => {
        const info = statusLabels[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info?.color || 'bg-slate-100 text-slate-600'}`}>
            {info?.label || status}
          </span>
        );
      },
    },
    {
      title: 'Genel Puan',
      dataIndex: 'overallScore',
      key: 'overallScore',
      width: 120,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <StarIcon className="w-4 h-4 text-amber-500" />
          <span className="text-slate-700 font-medium">{value ? value.toFixed(1) : '-'}</span>
        </div>
      ),
    },
    {
      title: 'NPS',
      dataIndex: 'npsScore',
      key: 'npsScore',
      width: 80,
      render: (value: number) => (
        <span className={`font-medium ${
          value >= 9 ? 'text-emerald-600' :
          value >= 7 ? 'text-amber-600' :
          value !== undefined ? 'text-red-600' : 'text-slate-400'
        }`}>
          {value !== undefined ? value : '-'}
        </span>
      ),
    },
    {
      title: 'Tamamlanma',
      dataIndex: 'completionPercentage',
      key: 'completionPercentage',
      width: 140,
      render: (value: number) => (
        <Progress
          percent={value || 0}
          size="small"
          strokeColor={value === 100 ? '#10b981' : '#3b82f6'}
          className="mb-0"
        />
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 100,
      render: (date: string) => (
        <span className="text-slate-500 text-sm">{formatDate(date)}</span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: SurveyResponseDto) => (
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
                <ClipboardDocumentListIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Anket Yanitlari</h1>
            </div>
            <p className="text-sm text-slate-500 ml-13">
              Musteri ve lead anket yanitlarini yonetin
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
              Yeni Yanit
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Yanit</p>
              <p className="text-2xl font-bold text-slate-900">{totalResponses}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Tamamlanan</p>
              <p className="text-2xl font-bold text-slate-900">{completedResponses}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ort. Puan</p>
              <p className="text-2xl font-bold text-slate-900">{avgScore.toFixed(1)}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ort. NPS</p>
              <p className="text-2xl font-bold text-slate-900">{avgNPS.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="Anket ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
              allowClear
            />
            <Select
              placeholder="Anket Tipi"
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-48"
              allowClear
              options={Object.entries(surveyTypeLabels).map(([key, val]) => ({
                value: key,
                label: (
                  <span className="flex items-center gap-2">
                    <span>{val.icon}</span>
                    <span>{val.label}</span>
                  </span>
                ),
              }))}
            />
            <Select
              placeholder="Durum"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
              allowClear
              options={Object.entries(statusLabels).map(([key, val]) => ({
                value: key,
                label: val.label,
              }))}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={responses}
            rowKey="id"
            loading={deleteResponse.isPending}
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
                      <ClipboardDocumentListIcon className="w-10 h-10 text-slate-400" />
                    </div>
                  }
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-lg font-semibold text-slate-800 mb-2">
                        Henuz anket yaniti bulunmuyor
                      </div>
                      <div className="text-sm text-slate-500 mb-4">
                        Musteri ve lead anket yanitlarini kaydedin
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusIcon className="w-4 h-4" />}
                        onClick={handleCreate}
                        className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                      >
                        Ilk Yaniti Olustur
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
