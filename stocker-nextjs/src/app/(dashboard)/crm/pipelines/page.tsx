'use client';

import React, { useState } from 'react';
import { Card, Button, Table, Space, Tag, Typography, Row, Col, Modal, message, Statistic, Avatar, Dropdown } from 'antd';
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Pipeline } from '@/lib/api/services/crm.service';
import { usePipelines, useDeletePipeline, useActivatePipeline, useDeactivatePipeline, useCreatePipeline, useUpdatePipeline } from '@/hooks/useCRM';
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

  // API Hooks
  const { data: pipelines = [], isLoading, refetch } = usePipelines();
  const deletePipeline = useDeletePipeline();
  const activatePipeline = useActivatePipeline();
  const deactivatePipeline = useDeactivatePipeline();
  const createPipeline = useCreatePipeline();
  const updatePipeline = useUpdatePipeline();

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
        } catch (error) {
          message.error('Silme işlemi başarısız');
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
    } catch (error) {
      message.error('İşlem başarısız');
    }
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      if (selectedPipeline) {
        await updatePipeline.mutateAsync({ id: selectedPipeline.id, ...values });
      } else {
        await createPipeline.mutateAsync(values);
      }
      setIsModalOpen(false);
      setSelectedPipeline(null);
    } catch (error) {
      message.error('İşlem başarısız');
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
            <div className="font-semibold text-gray-900 truncate">{text}</div>
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
      width: 100,
      align: 'center',
      render: (stages) => <Tag color="purple">{stages?.length || 0} Aşama</Tag>,
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
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
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
    </div>
  );
}
