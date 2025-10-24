'use client';

import React, { useState } from 'react';
import { Card, Button, Table, Space, Tag, Typography, Row, Col, Modal, message, Statistic } from 'antd';
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Pipeline } from '@/lib/api/services/crm.service';
import { usePipelines, useDeletePipeline, useActivatePipeline, useDeactivatePipeline, useCreatePipeline, useUpdatePipeline } from '@/hooks/useCRM';
import { PipelineModal } from '@/components/crm/pipelines/PipelineModal';

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
      title: 'Pipeline Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          {record.description && <div className="text-xs text-gray-500">{record.description}</div>}
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleActive(record)}
            loading={activatePipeline.isPending || deactivatePipeline.isPending}
          >
            {record.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Düzenle
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            loading={deletePipeline.isPending}
          >
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    total: pipelines.length,
    active: pipelines.filter((p) => p.isActive).length,
    totalDeals: pipelines.reduce((sum, p) => sum + (p.dealCount || 0), 0),
    totalValue: pipelines.reduce((sum, p) => sum + (p.totalValue || 0), 0),
  };

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
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Pipeline"
              value={stats.total}
              prefix={<FunnelPlotOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Pipeline"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Fırsat"
              value={stats.totalDeals}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Değer"
              value={stats.totalValue}
              prefix={<DollarOutlined />}
              suffix="₺"
              precision={0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

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
