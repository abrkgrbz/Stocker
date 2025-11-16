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
  Empty,
  Spin,
  Divider,
  message,
  Modal,
  Statistic,
} from 'antd';
import {
  ThunderboltOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import { CRMService } from '@/lib/api/services/crm.service';
import type { WorkflowDto, WorkflowActionType } from '@/lib/api/services/crm.types';
import type { TriggerConfiguration } from '@/components/crm/workflows/ConfigureTriggerDrawer';
import type { WorkflowActionConfig } from '@/components/crm/workflows/ActionBlock';
import TriggerBlock from '@/components/crm/workflows/TriggerBlock';
import ActionBlock from '@/components/crm/workflows/ActionBlock';
import ActionSelectorDrawer from '@/components/crm/workflows/ActionSelectorDrawer';
import ActionConfigDrawer from '@/components/crm/workflows/ActionConfigDrawer';
import ConfigureTriggerDrawer from '@/components/crm/workflows/ConfigureTriggerDrawer';
import { type Step1FormData } from '@/components/crm/workflows/CreateWorkflowDrawer';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import { useRouter } from 'next/navigation';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text } = Typography;
const { confirm } = Modal;

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
  const [saving, setSaving] = useState(false);

  // Builder state
  const [actions, setActions] = useState<WorkflowActionConfig[]>([]);
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfiguration | null>(null);

  // Drawer states
  const [actionSelectorOpen, setActionSelectorOpen] = useState(false);
  const [actionConfigOpen, setActionConfigOpen] = useState(false);
  const [triggerConfigOpen, setTriggerConfigOpen] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState<WorkflowActionType | null>(null);
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);

  // Load workflow details
  const loadWorkflow = async () => {
    setLoading(true);
    try {
      const data = await CRMService.getWorkflow(workflowId);
      setWorkflow(data);

      // Parse trigger configuration
      if (data.triggerConditions) {
        try {
          const config = JSON.parse(data.triggerConditions);
          setTriggerConfig({
            type: data.triggerType,
            entityType: data.entityType,
            config: config,
          });
        } catch (e) {
          console.error('Failed to parse trigger config', e);
        }
      }

      // Convert steps to actions
      if (data.steps && data.steps.length > 0) {
        const convertedActions: WorkflowActionConfig[] = data.steps.map((step) => ({
          id: step.id?.toString(),
          type: step.actionType,
          name: step.name,
          description: step.description,
          parameters: step.actionData ? JSON.parse(step.actionData) : {},
          delayMinutes: step.delayMinutes,
          isEnabled: step.isEnabled,
          stepOrder: step.stepOrder,
        }));
        setActions(convertedActions);
      }

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

  // Handle activate/deactivate
  const handleToggleActive = async () => {
    if (!workflow) return;

    try {
      if (workflow.isActive) {
        await CRMService.deactivateWorkflow(workflowId);
        showSuccess('Workflow deaktif edildi');
      } else {
        await CRMService.activateWorkflow(workflowId);
        showSuccess('Workflow aktif edildi');
      }
      loadWorkflow();
    } catch (error) {
      showApiError(error, 'Workflow durumu değiştirilemedi');
    }
  };

  // Handle save workflow
  const handleSave = async () => {
    if (!workflow) return;

    setSaving(true);
    try {
      // Convert actions to steps
      const steps = actions.map((action, index) => ({
        id: action.id ? parseInt(action.id) : undefined,
        name: action.name,
        description: action.description || '',
        actionType: action.type,
        actionData: JSON.stringify(action.parameters),
        stepOrder: index + 1,
        delayMinutes: action.delayMinutes || 0,
        isEnabled: action.isEnabled !== false,
      }));

      await CRMService.updateWorkflow(workflowId, {
        name: workflow.name,
        description: workflow.description,
        triggerType: workflow.triggerType,
        entityType: workflow.entityType,
        triggerConditions: triggerConfig ? JSON.stringify(triggerConfig.config) : workflow.triggerConditions,
        steps: steps,
      });

      showSuccess('Workflow kaydedildi');
      loadWorkflow();
    } catch (error) {
      showApiError(error, 'Workflow kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  // Action handlers
  const handleSelectActionType = (actionType: WorkflowActionType) => {
    setSelectedActionType(actionType);
    setActionConfigOpen(true);
  };

  const handleSaveAction = (actionData: Partial<WorkflowActionConfig>) => {
    if (editingActionIndex !== null) {
      // Update existing action
      const updatedActions = [...actions];
      updatedActions[editingActionIndex] = {
        ...updatedActions[editingActionIndex],
        ...actionData,
      };
      setActions(updatedActions);
      message.success('Aksiyon güncellendi');
    } else {
      // Add new action
      const newAction: WorkflowActionConfig = {
        ...actionData,
        type: actionData.type!,
        name: actionData.name!,
        stepOrder: actions.length + 1,
        parameters: actionData.parameters || {},
      };
      setActions([...actions, newAction]);
      message.success('Aksiyon eklendi');
    }

    setActionConfigOpen(false);
    setSelectedActionType(null);
    setEditingActionIndex(null);
  };

  const handleEditAction = (index: number) => {
    setEditingActionIndex(index);
    setSelectedActionType(actions[index].type);
    setActionConfigOpen(true);
  };

  const handleDeleteAction = (index: number) => {
    confirm({
      title: 'Aksiyonu Sil',
      content: 'Bu aksiyonu silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk() {
        const updatedActions = actions.filter((_, i) => i !== index);
        // Reorder
        updatedActions.forEach((action, i) => {
          action.stepOrder = i + 1;
        });
        setActions(updatedActions);
        message.success('Aksiyon silindi');
      },
    });
  };

  const handleDuplicateAction = (index: number) => {
    const actionToDuplicate = actions[index];
    const newAction: WorkflowActionConfig = {
      ...actionToDuplicate,
      id: undefined,
      name: `${actionToDuplicate.name} (Kopya)`,
      stepOrder: actions.length + 1,
    };
    setActions([...actions, newAction]);
    message.success('Aksiyon kopyalandı');
  };

  const handleEditTrigger = () => {
    setTriggerConfigOpen(true);
  };

  const handleSaveTriggerConfig = (config: TriggerConfiguration) => {
    setTriggerConfig(config);
    setTriggerConfigOpen(false);
    message.success('Tetikleyici güncellendi');
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

  // Dummy step1Data for trigger config drawer
  const step1Data: Step1FormData = {
    name: workflow.name,
    description: workflow.description,
    status: workflow.isActive ? 'active' : 'inactive',
    triggerType: workflow.triggerType,
    entityType: workflow.entityType,
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
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
                  <Button icon={<SaveOutlined />} onClick={handleSave} loading={saving} type="primary">
                    Kaydet
                  </Button>
                  <Button
                    icon={workflow.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={handleToggleActive}
                  >
                    {workflow.isActive ? 'Deaktif Et' : 'Aktif Et'}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Workflow Builder */}
        <Col span={18}>
          <Card title="Workflow Builder" style={{ minHeight: 600 }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              {/* Trigger Block */}
              {triggerConfig && <TriggerBlock trigger={triggerConfig} onEdit={handleEditTrigger} />}

              <Divider style={{ margin: '24px 0' }}>
                <Text type="secondary">↓</Text>
              </Divider>

              {/* Action Blocks */}
              {actions.map((action, index) => (
                <React.Fragment key={index}>
                  <ActionBlock
                    action={action}
                    index={index}
                    onEdit={() => handleEditAction(index)}
                    onDelete={() => handleDeleteAction(index)}
                    onDuplicate={() => handleDuplicateAction(index)}
                  />

                  <Divider style={{ margin: '24px 0' }}>
                    <Text type="secondary">↓</Text>
                  </Divider>
                </React.Fragment>
              ))}

              {/* Add Action Button */}
              <Button
                type="dashed"
                block
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setActionSelectorOpen(true)}
                style={{ height: 80 }}
              >
                Aksiyon Ekle
              </Button>

              {actions.length === 0 && (
                <Empty
                  description="Henüz aksiyon eklenmedi"
                  style={{ marginTop: 40 }}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </Card>
        </Col>

        {/* Sidebar: Stats */}
        <Col span={6}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="İstatistikler" size="small">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Statistic title="Toplam Adım" value={actions.length} />
                <Statistic
                  title="Aktif Adım"
                  value={actions.filter((a) => a.isEnabled !== false).length}
                />
                <Statistic title="Çalıştırma" value={workflow.executionCount} />
              </Space>
            </Card>

            <Card title="Son Çalıştırma" size="small">
              <Text type="secondary">
                {workflow.lastExecutedAt
                  ? dayjs(workflow.lastExecutedAt).format('DD.MM.YYYY HH:mm')
                  : 'Hiç çalıştırılmadı'}
              </Text>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Drawers */}
      <ActionSelectorDrawer
        open={actionSelectorOpen}
        onClose={() => setActionSelectorOpen(false)}
        onSelect={handleSelectActionType}
      />

      <ActionConfigDrawer
        open={actionConfigOpen}
        actionType={selectedActionType}
        initialData={editingActionIndex !== null ? actions[editingActionIndex] : undefined}
        onClose={() => {
          setActionConfigOpen(false);
          setSelectedActionType(null);
          setEditingActionIndex(null);
        }}
        onSave={handleSaveAction}
      />

      <ConfigureTriggerDrawer
        open={triggerConfigOpen}
        step1Data={step1Data}
        onClose={() => setTriggerConfigOpen(false)}
        onBack={() => setTriggerConfigOpen(false)}
        onNext={handleSaveTriggerConfig}
      />
    </div>
  );
}
