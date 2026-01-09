'use client';

import React, { useState } from 'react';
import { Table, Input, Select, Dropdown, Modal, Spin, Progress } from 'antd';
import {
  BuildingStorefrontIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  TrophyIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import { useSupplierEvaluations, useDeleteSupplierEvaluation } from '@/lib/api/hooks/usePurchase';
import type { SupplierEvaluationListDto, EvaluationStatus } from '@/lib/api/services/purchase.types';

const statusConfig: Record<EvaluationStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  Submitted: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Gönderildi' },
  Approved: { bg: 'bg-slate-800', text: 'text-white', label: 'Onaylandı' },
  Rejected: { bg: 'bg-slate-300', text: 'text-slate-800', label: 'Reddedildi' },
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#1e293b';
  if (score >= 60) return '#334155';
  if (score >= 40) return '#64748b';
  return '#94a3b8';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Mükemmel';
  if (score >= 60) return 'İyi';
  if (score >= 40) return 'Orta';
  return 'Düşük';
};

export default function SupplierEvaluationsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<EvaluationStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useSupplierEvaluations({
    page: currentPage,
    pageSize,
    search: searchText || undefined,
    status: statusFilter,
  });

  const deleteMutation = useDeleteSupplierEvaluation();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Değerlendirme Silinecek',
      content: 'Bu değerlendirmeyi silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const columns: ColumnsType<SupplierEvaluationListDto> = [
    {
      title: 'Değerlendirme No',
      dataIndex: 'evaluationNumber',
      key: 'evaluationNumber',
      width: 150,
      render: (text, record) => (
        <button
          onClick={() => router.push(`/purchase/evaluations/${record.id}`)}
          className="text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <BuildingStorefrontIcon className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{text}</div>
            <div className="text-xs text-slate-500">{record.supplierCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Dönem',
      dataIndex: 'evaluationPeriod',
      key: 'evaluationPeriod',
      width: 120,
      render: (text) => <span className="text-sm text-slate-600">{text || '-'}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: EvaluationStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Toplam Puan',
      dataIndex: 'overallScore',
      key: 'overallScore',
      width: 180,
      render: (score: number) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Progress
              percent={score}
              size="small"
              strokeColor={getScoreColor(score)}
              format={() => <span className="text-xs font-medium">{score.toFixed(0)}</span>}
              style={{ width: 100 }}
            />
          </div>
          <div className="text-xs" style={{ color: getScoreColor(score) }}>
            {getScoreLabel(score)}
          </div>
        </div>
      ),
    },
    {
      title: 'Sıralama',
      dataIndex: 'rank',
      key: 'rank',
      width: 100,
      align: 'center',
      render: (rank: number | null) =>
        rank ? (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${rank <= 3 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {rank <= 3 && <TrophyIcon className="w-3 h-3" />}
            #{rank}
          </span>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        ),
    },
    {
      title: 'Değerlendiren',
      dataIndex: 'evaluatorName',
      key: 'evaluatorName',
      width: 150,
      ellipsis: true,
      render: (text) => <span className="text-sm text-slate-600">{text || '-'}</span>,
    },
    {
      title: 'Tarih',
      dataIndex: 'evaluationDate',
      key: 'evaluationDate',
      width: 100,
      render: (date) => (
        <span className="text-sm text-slate-500">
          {new Date(date).toLocaleDateString('tr-TR')}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Görüntüle',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => router.push(`/purchase/evaluations/${record.id}`),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                disabled: record.status !== 'Draft',
                onClick: () => router.push(`/purchase/evaluations/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                disabled: record.status !== 'Draft',
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </Dropdown>
      ),
    },
  ];

  // Calculate stats
  const avgScore = data?.items?.length
    ? data.items.reduce((sum, item) => sum + item.overallScore, 0) / data.items.length
    : 0;
  const topPerformers = data?.items?.filter(i => i.overallScore >= 80).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tedarikçi Değerlendirmeleri</h1>
            <p className="text-sm text-slate-500">Tedarikçi performanslarını değerlendirin ve karşılaştırın</p>
          </div>
        </div>
        <Link href="/purchase/evaluations/new">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
            <PlusIcon className="w-4 h-4" />
            Yeni Değerlendirme
          </button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{data?.totalCount || 0}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Değerlendirme</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <TrophyIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{avgScore.toFixed(1)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Ortalama Puan</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{topPerformers}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Üst Performans (80+)</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data?.items?.filter(i => i.status === 'Submitted').length || 0}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onay Bekliyor</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Tedarikçi veya değerlendirme no ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-72"
            allowClear
          />
          <Select
            placeholder="Durum"
            className="w-40"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusConfig).map(([key, value]) => ({
              value: key,
              label: value.label,
            }))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1200 }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
