'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Table, Space, Tag, Modal, message, Avatar, Dropdown, Empty, Input, Spin } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FunnelPlotOutlined,
  ReloadOutlined,
  MoreOutlined,
  EyeOutlined,
  CopyOutlined,
  StarOutlined,
  StarFilled,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Pipeline } from '@/lib/api/services/crm.service';
import { usePipelines, useDeletePipeline, useActivatePipeline, useDeactivatePipeline, useCreatePipeline, useSetDefaultPipeline } from '@/lib/api/hooks/useCRM';
import { PipelinesStats } from '@/components/crm/pipelines/PipelinesStats';
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/ui/enterprise-page';

const pipelineTypeLabels: Record<string, string> = {
  Sales: 'Satış',
  Lead: 'Potansiyel Müşteri',
  Deal: 'Fırsat',
  Custom: 'Özel',
};

export default function PipelinesPage() {
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

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Pipeline Sil',
      content: 'Bu pipeline\'ı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deletePipeline.mutateAsync(id);
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Silme işlemi başarısız';
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
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
      message.error(errorMessage);
    }
  };

  const handleEdit = (pipeline: Pipeline) => {
    router.push(`/crm/pipelines/${pipeline.id}/edit`);
  };

  const handleCreate = () => {
    router.push('/crm/pipelines/new');
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
        isActive: false, // Cloned pipelines start as inactive
        isDefault: false, // Cloned pipelines are not default
        stages: pipeline.stages?.map((stage) => ({
          name: stage.name,
          order: stage.order,
          probability: stage.probability,
        })) || [],
      };
      await createPipeline.mutateAsync(clonedData);
      message.success('Pipeline başarıyla kopyalandı');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Kopyalama işlemi başarısız';
      message.error(errorMessage);
    }
  };

  const handleSetDefault = async (pipeline: Pipeline) => {
    try {
      await setDefaultPipeline.mutateAsync(pipeline.id);
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
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
          <Avatar
            size={40}
            className="bg-gradient-to-br from-slate-500 to-slate-600 flex-shrink-0"
            icon={<FunnelPlotOutlined />}
          >
            {text.charAt(0)}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-slate-900 truncate">{text}</div>
              {(record as any).isDefault && (
                <StarFilled className="text-yellow-500 text-sm flex-shrink-0" title="Varsayılan Pipeline" />
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
        <Tag color="blue" className="border-slate-200">
          {pipelineTypeLabels[type] || type}
        </Tag>
      ),
    },
    {
      title: 'Aşamalar',
      dataIndex: 'stages',
      key: 'stages',
      width: 120,
      align: 'center',
      render: (stages, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewStages(record)}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-800"
        >
          <Tag color="purple" className="m-0 border-purple-200">
            {stages?.length || 0} Aşama
          </Tag>
        </Button>
      ),
    },
    {
      title: 'Fırsatlar',
      dataIndex: 'dealCount',
      key: 'dealCount',
      width: 100,
      align: 'center',
      render: (count) => (
        <span className="text-slate-600 font-medium">{count || 0}</span>
      ),
    },
    {
      title: 'Toplam Değer',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 150,
      align: 'right',
      render: (value) => (
        <span className="text-slate-900 font-semibold">
          ₺{(value || 0).toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success" className="border-green-200">
            Aktif
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default" className="border-slate-200 text-slate-500">
            Pasif
          </Tag>
        ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'toggle',
                label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
                icon: record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
                onClick: () => handleToggleActive(record),
                disabled: activatePipeline.isPending || deactivatePipeline.isPending,
              },
              {
                key: 'setDefault',
                label: 'Varsayılan Yap',
                icon: <StarOutlined />,
                onClick: () => handleSetDefault(record),
                disabled: (record as any).isDefault,
              },
              { type: 'divider' as const },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                key: 'clone',
                label: 'Kopyala',
                icon: <CopyOutlined />,
                onClick: () => handleClone(record),
                disabled: createPipeline.isPending,
              },
              { type: 'divider' as const },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record.id),
                disabled: deletePipeline.isPending,
              },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="text-slate-400 hover:text-slate-600"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <PipelinesStats pipelines={pipelines} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<FunnelPlotOutlined />}
        iconColor="#0f172a"
        title="Satış Süreçleri (Pipelines)"
        description="Pipeline'larınızı yönetin ve yapılandırın"
        itemCount={filteredPipelines.length}
        primaryAction={{
          label: 'Yeni Pipeline',
          onClick: handleCreate,
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Pipeline ara..."
          prefix={<SearchOutlined className="text-slate-400" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="max-w-md"
          size="large"
        />
      </div>

      {/* Pipelines Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={filteredPipelines}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} pipeline`,
              className: 'px-4',
            }}
            locale={{
              emptyText: (
                <Empty
                  image={<FunnelPlotOutlined style={{ fontSize: 80, color: '#cbd5e1' }} />}
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-2xl font-bold text-slate-800 mb-4">
                        Satış Sürecinizi Yapılandırın
                      </div>
                      <div className="text-base text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                        Pipeline&apos;lar, fırsatlarınızın hangi aşamalardan geçeceğini tanımlar.
                        &apos;Kurumsal Satış Süreci&apos; veya &apos;E-Ticaret Hunisi&apos; gibi
                        özelleştirilmiş satış süreçleri oluşturun.
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        className="h-12 px-8 text-base font-semibold bg-slate-900 hover:bg-slate-800 border-slate-900"
                      >
                        İlk Pipeline&apos;ınızı Oluşturun
                      </Button>
                    </div>
                  }
                />
              ),
            }}
          />
        </DataTableWrapper>
      )}

      {/* Stages Quick View Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FunnelPlotOutlined className="text-slate-600" />
            <span className="text-slate-900">{viewingPipeline?.name} - Aşamalar</span>
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
            className="border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-800"
          >
            Kapat
          </Button>,
        ]}
        width={600}
      >
        {viewingPipeline?.stages && viewingPipeline.stages.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-slate-600 mb-4">
              Bu pipeline <strong className="text-slate-900">{viewingPipeline.stages.length} aşamadan</strong> oluşmaktadır:
            </div>
            {viewingPipeline.stages
              .sort((a, b) => a.order - b.order)
              .map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{stage.name}</div>
                    {stage.probability !== undefined && (
                      <div className="text-xs text-slate-500 mt-1">
                        Kazanma Olasılığı: <span className="font-medium text-slate-700">{stage.probability}%</span>
                      </div>
                    )}
                  </div>
                  <Tag color="blue" className="border-slate-200">
                    {stage.order}. Sıra
                  </Tag>
                </div>
              ))}
          </div>
        ) : (
          <Empty
            description={
              <span className="text-slate-500">Bu pipeline için henüz aşama tanımlanmamış</span>
            }
          />
        )}
      </Modal>
    </PageContainer>
  );
}
