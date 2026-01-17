'use client';

import { ProtectedRoute } from '@/components/auth';

/**
 * Pipelines List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Modal, message, Avatar, Dropdown, Empty, Spin, Button, Space } from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { ColumnsType } from 'antd/es/table';
import type { Pipeline } from '@/lib/api/services/crm.service';
import { usePipelines, useDeletePipeline, useActivatePipeline, useDeactivatePipeline, useCreatePipeline, useSetDefaultPipeline } from '@/lib/api/hooks/useCRM';

const pipelineTypeLabels: Record<string, string> = {
  Sales: 'Satis',
  Lead: 'Potansiyel Musteri',
  Deal: 'Firsat',
  Custom: 'Ozel',
};

function PipelinesPageContent() {
  const router = useRouter();
  const [stagesModalOpen, setStagesModalOpen] = useState(false);
  const [viewingPipeline, setViewingPipeline] = useState<Pipeline | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // API Hooks
  const { data: pipelines = [], isLoading, refetch } = usePipelines();
  const deletePipeline = useDeletePipeline();
  const activatePipeline = useActivatePipeline();
  const deactivatePipeline = useDeactivatePipeline();
  const createPipeline = useCreatePipeline();
  const setDefaultPipeline = useSetDefaultPipeline();

  // Stats calculation
  const stats = useMemo(() => ({
    total: pipelines.length,
    active: pipelines.filter(p => p.isActive).length,
    totalDeals: pipelines.reduce((sum, p) => sum + (p.dealCount || 0), 0),
    totalValue: pipelines.reduce((sum, p) => sum + (p.totalValue || 0), 0),
  }), [pipelines]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Pipeline Sil',
      content: 'Bu pipeline\'i silmek istediginizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
      onOk: async () => {
        try {
          await deletePipeline.mutateAsync(id);
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Silme islemi basarisiz';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleToggleActive = async (pipeline: Pipeline) => {
    try {
      if (pipeline.isActive) {
        await deactivatePipeline.mutateAsync(pipeline.id);
      } else {
        await activatePipeline.mutateAsync(pipeline.id);
      }
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Islem basarisiz';
      message.error(errorMessage);
    }
  };

  const handleEdit = (pipeline: Pipeline) => {
    router.push(`/crm/pipelines/${pipeline.id}/edit`);
  };

  const handleCreate = () => {
    router.push('/crm/pipelines/new');
  };

  const handleView = (pipeline: Pipeline) => {
    router.push(`/crm/pipelines/${pipeline.id}`);
  };

  const handleViewStages = (pipeline: Pipeline) => {
    setViewingPipeline(pipeline);
    setStagesModalOpen(true);
  };

  const handleClone = async (pipeline: Pipeline) => {
    try {
      const clonedData = {
        name: `${pipeline.name} (Kopya)`,
        description: pipeline.description,
        type: pipeline.type,
        isActive: false,
        isDefault: false,
        stages: pipeline.stages?.map((stage) => ({
          name: stage.name,
          order: stage.order,
          probability: stage.probability,
        })) || [],
      };
      await createPipeline.mutateAsync(clonedData);
      message.success('Pipeline basariyla kopyalandi');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Kopyalama islemi basarisiz';
      message.error(errorMessage);
    }
  };

  const handleSetDefault = async (pipeline: Pipeline) => {
    try {
      await setDefaultPipeline.mutateAsync(pipeline.id);
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Islem basarisiz';
      message.error(errorMessage);
    }
  };

  // Filter pipelines based on search query
  const filteredPipelines = pipelines.filter((pipeline) =>
    pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pipeline.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pipelineTypeLabels[pipeline.type]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnsType<Pipeline> = [
    {
      title: 'Pipeline',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <FunnelIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-slate-900 truncate">{text}</div>
              {(record as any).isDefault && (
                <StarIconSolid className="w-4 h-4 text-slate-600 flex-shrink-0" title="Varsayilan Pipeline" />
              )}
            </div>
            {record.description && (
              <div className="text-xs text-slate-500 truncate">{record.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
          {pipelineTypeLabels[type] || type}
        </span>
      ),
    },
    {
      title: 'Asamalar',
      dataIndex: 'stages',
      key: 'stages',
      width: 120,
      align: 'center',
      render: (stages, record) => (
        <button
          onClick={() => handleViewStages(record)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <EyeIcon className="w-3.5 h-3.5" />
          {stages?.length || 0} Asama
        </button>
      ),
    },
    {
      title: 'Firsatlar',
      dataIndex: 'dealCount',
      key: 'dealCount',
      width: 100,
      align: 'center',
      render: (count) => (
        <span className="text-sm text-slate-600 font-medium">{count || 0}</span>
      ),
    },
    {
      title: 'Toplam Deger',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 150,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-slate-900 font-semibold">
          {(value || 0).toLocaleString('tr-TR')} TL
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Goruntule',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => handleView(record),
              },
              {
                key: 'toggle',
                label: record.isActive ? 'Pasiflestir' : 'Aktiflestir',
                icon: record.isActive ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
                onClick: () => handleToggleActive(record),
                disabled: activatePipeline.isPending || deactivatePipeline.isPending,
              },
              {
                key: 'setDefault',
                label: 'Varsayilan Yap',
                icon: <StarIcon className="w-4 h-4" />,
                onClick: () => handleSetDefault(record),
                disabled: (record as any).isDefault,
              },
              { type: 'divider' as const },
              {
                key: 'edit',
                label: 'Duzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                onClick: () => handleEdit(record),
              },
              {
                key: 'clone',
                label: 'Kopyala',
                icon: <DocumentDuplicateIcon className="w-4 h-4" />,
                onClick: () => handleClone(record),
                disabled: createPipeline.isPending,
              },
              { type: 'divider' as const },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: () => handleDelete(record.id),
                disabled: deletePipeline.isPending,
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

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <FunnelIcon className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Satis Surecleri (Pipelines)</h1>
            <p className="text-sm text-slate-500">Pipeline\'larinizi yonetin ve yapilandirin</p>
          </div>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
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
            Yeni Pipeline
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <FunnelIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Pipeline</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <StarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.totalDeals}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Firsat</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.totalValue.toLocaleString('tr-TR')} TL</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Deger</div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Pipeline ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ maxWidth: 400 }}
            className="!rounded-lg !border-slate-300"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredPipelines}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} pipeline`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={<FunnelIcon className="w-20 h-20 text-slate-300 mx-auto" />}
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-xl font-bold text-slate-800 mb-4">
                        Satis Surecinizi Yapilandirin
                      </div>
                      <div className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">
                        Pipeline\'lar, firsatlarinizin hangi asamalardan gececegini tanimlar.
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusIcon className="w-4 h-4" />}
                        onClick={handleCreate}
                        className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                      >
                        Ilk Pipeline\'inizi Olusturun
                      </Button>
                    </div>
                  }
                />
              ),
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>

      {/* Stages Quick View Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-slate-600" />
            <span className="text-slate-900">{viewingPipeline?.name} - Asamalar</span>
          </div>
        }
        open={stagesModalOpen}
        onCancel={() => {
          setStagesModalOpen(false);
          setViewingPipeline(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => setStagesModalOpen(false)}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Kapat
          </Button>,
        ]}
        width={600}
      >
        {viewingPipeline?.stages && viewingPipeline.stages.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-slate-600 mb-4">
              Bu pipeline <strong className="text-slate-900">{viewingPipeline.stages.length} asamadan</strong> olusmaktadir:
            </div>
            {viewingPipeline.stages
              .sort((a, b) => a.order - b.order)
              .map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{stage.name}</div>
                    {stage.probability !== undefined && (
                      <div className="text-xs text-slate-500 mt-1">
                        Kazanma Olasiligi: <span className="font-medium text-slate-700">{stage.probability}%</span>
                      </div>
                    )}
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-600">
                    {stage.order || index + 1}. Sira
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <Empty
            description={
              <span className="text-slate-500">Bu pipeline icin henuz asama tanimlanmamis</span>
            }
          />
        )}
      </Modal>
    </div>
  );
}


export default function PipelinesPage() {
  return (
    <ProtectedRoute permission="CRM.Pipelines:View">
      <PipelinesPageContent />
    </ProtectedRoute>
  );
}
