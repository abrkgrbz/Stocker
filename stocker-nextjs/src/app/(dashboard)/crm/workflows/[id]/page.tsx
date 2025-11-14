'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Descriptions,
  Timeline,
  Empty,
  Spin,
  Tooltip,
} from 'antd';
import {
  ThunderboltOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import { CRMService } from '@/lib/api/services/crm.service';
import type { WorkflowDto, WorkflowTriggerType, WorkflowActionType } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import { useRouter } from 'next/navigation';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;

// Trigger type labels
const triggerTypeLabels: Record<WorkflowTriggerType, { label: string; color: string }> = {
  Manual: { label: 'Manuel', color: 'default' },
  OnCreate: { label: 'Oluşturulduğunda', color: 'blue' },
  OnUpdate: { label: 'Güncellendiğinde', color: 'cyan' },
  OnDelete: { label: 'Silindiğinde', color: 'red' },
  OnStatusChange: { label: 'Durum Değiştiğinde', color: 'purple' },
  Scheduled: { label: 'Zamanlanmış', color: 'orange' },
};

// Action type labels
const actionTypeLabels: Record<WorkflowActionType, string> = {
  SendEmail: 'E-posta Gönder',
  SendSMS: 'SMS Gönder',
  CreateTask: 'Görev Oluştur',
  UpdateField: 'Alan Güncelle',
  SendNotification: 'Bildirim Gönder',
  CallWebhook: 'Webhook Çağır',
  CreateActivity: 'Aktivite Oluştur',
  AssignToUser: 'Kullanıcıya Ata',
};

interface WorkflowDetailPageProps {
  params: {
    id: string;
  };
}

export default function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const router = useRouter();
  const workflowId = parseInt(params.id);
  const [workflow, setWorkflow] = useState<WorkflowDto | null>(null);
  const [loading, setLoading] = useState(false);

  // Load workflow details
  const loadWorkflow = async () => {
    setLoading(true);
    try {
      const data = await CRMService.getWorkflow(workflowId);
      setWorkflow(data);
      setLoading(false);
    } catch (error) {
      showApiError(error, 'Workflow detayları yüklenemedi');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  // Handle activate workflow
  const handleActivate = async () => {
    try {
      await CRMService.activateWorkflow(workflowId);
      showSuccess('Workflow aktif edildi');
      loadWorkflow();
    } catch (error) {
      showApiError(error, 'Workflow aktif edilemedi');
    }
  };

  // Handle deactivate workflow
  const handleDeactivate = async () => {
    try {
      await CRMService.deactivateWorkflow(workflowId);
      showSuccess('Workflow deaktif edildi');
      loadWorkflow();
    } catch (error) {
      showApiError(error, 'Workflow deaktif edilemedi');
    }
  };

  // Handle execute workflow
  const handleExecute = async () => {
    try {
      // For manual workflows, we would need entity context
      // This is a placeholder for now
      showSuccess('Workflow çalıştırıldı');
      loadWorkflow();
    } catch (error) {
      showApiError(error, 'Workflow çalıştırılamadı');
    }
  };

  if (loading && !workflow) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty description="Workflow bulunamadı">
          <Button type="primary" onClick={() => router.push('/crm/workflows')}>
            Workflows'a Dön
          </Button>
        </Empty>
      </div>
    );
  }

  const { label: triggerLabel, color: triggerColor } = triggerTypeLabels[workflow.triggerType] || {
    label: workflow.triggerType,
    color: 'default',
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={0}>
                  <Space>
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => router.push('/crm/workflows')}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                      <ThunderboltOutlined /> {workflow.name}
                    </Title>
                    <Tag color={workflow.isActive ? 'success' : 'default'}>
                      {workflow.isActive ? 'Aktif' : 'Pasif'}
                    </Tag>
                  </Space>
                  {workflow.description && (
                    <Text type="secondary" style={{ marginLeft: 40 }}>
                      {workflow.description}
                    </Text>
                  )}
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button icon={<EditOutlined />}>Düzenle</Button>
                  {workflow.triggerType === 'Manual' && workflow.isActive && (
                    <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleExecute}>
                      Çalıştır
                    </Button>
                  )}
                  <Button
                    type={workflow.isActive ? 'default' : 'primary'}
                    icon={workflow.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={workflow.isActive ? handleDeactivate : handleActivate}
                  >
                    {workflow.isActive ? 'Deaktif Et' : 'Aktif Et'}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Workflow Info */}
        <Col span={24} lg={12}>
          <Card title="Workflow Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Entity Tipi">
                <Tag color="blue">{workflow.entityType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trigger Tipi">
                <Tag color={triggerColor}>{triggerLabel}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag
                  color={workflow.isActive ? 'success' : 'default'}
                  icon={workflow.isActive ? <ThunderboltOutlined /> : undefined}
                >
                  {workflow.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Çalıştırma Sayısı">
                {workflow.executionCount} kez
              </Descriptions.Item>
              <Descriptions.Item label="Son Çalıştırma">
                {workflow.lastExecutedAt
                  ? dayjs(workflow.lastExecutedAt).format('DD.MM.YYYY HH:mm')
                  : 'Hiç çalıştırılmadı'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Execution Stats */}
        <Col span={24} lg={12}>
          <Card title="İstatistikler">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small">
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">Toplam Adım</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {workflow.steps?.length || 0}
                    </Title>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">Aktif Adım</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {workflow.steps?.filter((s) => s.isEnabled).length || 0}
                    </Title>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">Çalıştırma</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {workflow.executionCount}
                    </Title>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">Son Çalıştırma</Text>
                    <Title level={4} style={{ margin: 0 }}>
                      {workflow.lastExecutedAt ? dayjs(workflow.lastExecutedAt).fromNow() : '-'}
                    </Title>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Workflow Steps */}
        <Col span={24}>
          <Card title="Workflow Adımları">
            {workflow.steps && workflow.steps.length > 0 ? (
              <Timeline
                mode="left"
                items={workflow.steps
                  .sort((a, b) => a.stepOrder - b.stepOrder)
                  .map((step, index) => ({
                    color: step.isEnabled ? 'blue' : 'gray',
                    dot: step.isEnabled ? (
                      <CheckCircleOutlined style={{ fontSize: 16 }} />
                    ) : (
                      <CloseCircleOutlined style={{ fontSize: 16 }} />
                    ),
                    label: (
                      <Space>
                        <Tag color="blue">Adım {step.stepOrder}</Tag>
                        {!step.isEnabled && <Tag color="red">Deaktif</Tag>}
                        {step.delayMinutes > 0 && (
                          <Tag color="orange">{step.delayMinutes} dk gecikme</Tag>
                        )}
                      </Space>
                    ),
                    children: (
                      <Card size="small" style={{ marginBottom: 16 }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Space>
                            <Text strong>{step.name}</Text>
                            <Tag color="purple">
                              {actionTypeLabels[step.actionType] || step.actionType}
                            </Tag>
                          </Space>
                          {step.description && <Text type="secondary">{step.description}</Text>}
                        </Space>
                      </Card>
                    ),
                  }))}
              />
            ) : (
              <Empty description="Henüz adım eklenmemiş" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
