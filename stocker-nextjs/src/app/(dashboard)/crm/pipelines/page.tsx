'use client';

import React, { useState } from 'react';
import { Card, Button, Table, Space, Tag, Typography, Row, Col, Modal, message, Statistic, Avatar, Dropdown, Empty } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FunnelPlotOutlined,
  DollarOutlined,
  LineChartOutlined,
  ReloadOutlined,
  MoreOutlined,
  EyeOutlined,
  CopyOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Pipeline } from '@/lib/api/services/crm.service';
import { usePipelines, useDeletePipeline, useActivatePipeline, useDeactivatePipeline, useCreatePipeline, useUpdatePipeline, useSetDefaultPipeline } from '@/lib/api/hooks/useCRM';
import { PipelineModal } from '@/components/crm/pipelines/PipelineModal';
import { PipelinesStats } from '@/components/crm/pipelines/PipelinesStats';

const { Title } = Typography;

const pipelineTypeLabels: Record<string, string> = {
  Sales: 'Satış',
  Lead: 'Potansiyel Müşteri',
  Deal: 'Fırsat',
  Custom: 'Özel',
};

export default function PipelinesPage() {
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stagesModalOpen, setStagesModalOpen] = useState(false);
  const [viewingPipeline, setViewingPipeline] = useState<Pipeline | null>(null);

  // API Hooks
  const { data: pipelines = [], isLoading, refetch } = usePipelines();
  const deletePipeline = useDeletePipeline();
  const activatePipeline = useActivatePipeline();
  const deactivatePipeline = useDeactivatePipeline();
  const createPipeline = useCreatePipeline();
  const updatePipeline = useUpdatePipeline();
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

  const handleCreateOrUpdate = async (values: any) => {
    console.log('🟢 handleCreateOrUpdate called with:', values);
    console.log('🔍 selectedPipeline:', selectedPipeline);

    try {
      if (selectedPipeline) {
        console.log('🔄 Updating pipeline...');
        await updatePipeline.mutateAsync({ id: selectedPipeline.id, ...values });
      } else {
        console.log('➕ Creating new pipeline...');
        await createPipeline.mutateAsync(values);
      }
      setIsModalOpen(false);
      setSelectedPipeline(null);
    } catch (error: any) {
      console.error('❌ Pipeline operation failed:', error);
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
      message.error(errorMessage);
    }
  };

  const handleEdit = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPipeline(null);
    setIsModalOpen(true);
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

  const columns: ColumnsType<Pipeline> = [
    {
      title: 'Pipeline',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0"
            icon={<FunnelPlotOutlined />}
          >
            {text.charAt(0)}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-900 truncate">{text}</div>
              {(record as any).isDefault && (
                <StarFilled className="text-yellow-500 text-sm flex-shrink-0" title="Varsayılan Pipeline" />
              )}
            </div>
            {record.description && (
              <div className="text-xs text-gray-500 truncate">{record.description}</div>
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
      render: (type) => <Tag color="blue">{pipelineTypeLabels[type] || type}</Tag>,
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
          className="flex items-center gap-1"
        >
          <Tag color="purple" className="m-0">
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
      render: (count) => count || 0,
    },
    {
      title: 'Toplam Değer',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 150,
      align: 'right',
      render: (value) => `₺${(value || 0).toLocaleString('tr-TR')}`,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Aktif
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
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
                disabled: (record as any).isDefault, // Can't set as default if already default
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
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];


  return (
    <div className="p-6">
      {/* Header */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <div className="flex justify-between items-center">
            <Title level={2} className="!mb-0">
              <FunnelPlotOutlined className="mr-2" />
              Satış Süreçleri (Pipelines)
            </Title>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
                Yenile
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Yeni Pipeline
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      {/* Statistics */}
      <div className="mb-6">
        <PipelinesStats pipelines={pipelines} loading={isLoading} />
      </div>

      {/* Pipelines Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={pipelines}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} pipeline`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={<FunnelPlotOutlined style={{ fontSize: 80, color: '#d9d9d9' }} />}
                imageStyle={{ height: 100 }}
                description={
                  <div className="py-8">
                    <div className="text-2xl font-bold text-gray-800 mb-4">
                      Satış Sürecinizi Yapılandırın
                    </div>
                    <div className="text-base text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                      Pipeline&apos;lar, fırsatlarınızın hangi aşamalardan geçeceğini tanımlar.
                      &apos;Kurumsal Satış Süreci&apos; veya &apos;E-Ticaret Hunisi&apos; gibi
                      özelleştirilmiş satış süreçleri oluşturun.
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={handleCreate}
                      className="h-12 px-8 text-base font-semibold"
                    >
                      İlk Pipeline&apos;ınızı Oluşturun
                    </Button>
                  </div>
                }
              />
            ),
          }}
        />
      </Card>

      {/* Pipeline Modal */}
      <PipelineModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedPipeline(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedPipeline}
        loading={createPipeline.isPending || updatePipeline.isPending}
      />

      {/* Stages Quick View Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FunnelPlotOutlined className="text-blue-500" />
            <span>{viewingPipeline?.name} - Aşamalar</span>
          </div>
        }
        open={stagesModalOpen}
        onCancel={() => {
          setStagesModalOpen(false);
          setViewingPipeline(null);
        }}
        footer={[
          <Button key="close" onClick={() => setStagesModalOpen(false)}>
            Kapat
          </Button>,
        ]}
        width={600}
      >
        {viewingPipeline?.stages && viewingPipeline.stages.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-4">
              Bu pipeline <strong>{viewingPipeline.stages.length} aşamadan</strong> oluşmaktadır:
            </div>
            {viewingPipeline.stages
              .sort((a, b) => a.order - b.order)
              .map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{stage.name}</div>
                    {stage.probability !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        Kazanma Olasılığı: <span className="font-medium">{stage.probability}%</span>
                      </div>
                    )}
                  </div>
                  <Tag color="blue">{stage.order}. Sıra</Tag>
                </div>
              ))}
          </div>
        ) : (
          <Empty description="Bu pipeline için henüz aşama tanımlanmamış" />
        )}
      </Modal>
    </div>
  );
}
