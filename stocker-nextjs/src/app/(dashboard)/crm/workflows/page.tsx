'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Empty,
  Tooltip,
  Modal,
} from 'antd';
import {
  ThunderboltOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { showSuccess, showError, showApiError } from '@/lib/utils/notifications';
import { CRMService } from '@/lib/api/services/crm.service';
import type {
  WorkflowDto,
  WorkflowTriggerType,
  CreateWorkflowCommand,
} from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import { useRouter } from 'next/navigation';
import CreateWorkflowDrawer, { type Step1FormData } from '@/components/crm/workflows/CreateWorkflowDrawer';
import ConfigureTriggerDrawer, { type TriggerConfiguration } from '@/components/crm/workflows/ConfigureTriggerDrawer';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;
const { Option } = Select;

// Entity types from backend - only entities that exist in the system
const entityTypes = [
  { value: 'Account', label: 'Hesap' },
  { value: 'Contact', label: 'İletişim' },
  { value: 'Customer', label: 'Müşteri' },
  { value: 'Lead', label: 'Potansiyel Müşteri' },
  { value: 'Opportunity', label: 'Fırsat' },
  { value: 'Deal', label: 'Anlaşma' },
  { value: 'Quote', label: 'Teklif' },
  { value: 'Contract', label: 'Sözleşme' },
  { value: 'Ticket', label: 'Destek Talebi' },
  { value: 'Campaign', label: 'Kampanya' },
];

// Common fields for entities with Turkish labels
const entityFields: Record<string, Array<{ value: string; label: string }>> = {
  Account: [
    { value: 'Status', label: 'Durum' },
    { value: 'Type', label: 'Tip' },
    { value: 'Rating', label: 'Değerlendirme' },
    { value: 'Industry', label: 'Sektör' },
    { value: 'Revenue', label: 'Gelir' },
  ],
  Contact: [
    { value: 'FirstName', label: 'Ad' },
    { value: 'LastName', label: 'Soyad' },
    { value: 'Email', label: 'E-posta' },
    { value: 'Phone', label: 'Telefon' },
    { value: 'Title', label: 'Ünvan' },
    { value: 'Department', label: 'Departman' },
  ],
  Lead: [
    { value: 'Status', label: 'Durum' },
    { value: 'Source', label: 'Kaynak' },
    { value: 'Score', label: 'Puan' },
    { value: 'Industry', label: 'Sektör' },
    { value: 'Budget', label: 'Bütçe' },
  ],
  Opportunity: [
    { value: 'Stage', label: 'Aşama' },
    { value: 'Amount', label: 'Tutar' },
    { value: 'Probability', label: 'Olasılık' },
    { value: 'CloseDate', label: 'Kapanış Tarihi' },
    { value: 'Source', label: 'Kaynak' },
  ],
  Deal: [
    { value: 'Status', label: 'Durum' },
    { value: 'Value', label: 'Değer' },
    { value: 'Stage', label: 'Aşama' },
    { value: 'CloseDate', label: 'Kapanış Tarihi' },
    { value: 'Priority', label: 'Öncelik' },
  ],
  Customer: [
    { value: 'Status', label: 'Durum' },
    { value: 'Type', label: 'Tip' },
    { value: 'Email', label: 'E-posta' },
    { value: 'Phone', label: 'Telefon' },
    { value: 'CompanyName', label: 'Şirket Adı' },
  ],
  Quote: [
    { value: 'Status', label: 'Durum' },
    { value: 'TotalAmount', label: 'Toplam Tutar' },
    { value: 'ValidUntil', label: 'Geçerlilik Tarihi' },
    { value: 'ApprovalStatus', label: 'Onay Durumu' },
  ],
  Contract: [
    { value: 'Status', label: 'Durum' },
    { value: 'StartDate', label: 'Başlangıç Tarihi' },
    { value: 'EndDate', label: 'Bitiş Tarihi' },
    { value: 'Value', label: 'Değer' },
  ],
  Ticket: [
    { value: 'Status', label: 'Durum' },
    { value: 'Priority', label: 'Öncelik' },
    { value: 'Type', label: 'Tip' },
    { value: 'Category', label: 'Kategori' },
    { value: 'AssignedTo', label: 'Atanan Kişi' },
  ],
  Campaign: [
    { value: 'Status', label: 'Durum' },
    { value: 'Type', label: 'Tip' },
    { value: 'Budget', label: 'Bütçe' },
    { value: 'StartDate', label: 'Başlangıç Tarihi' },
    { value: 'EndDate', label: 'Bitiş Tarihi' },
  ],
};

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

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Wizard state
  const [step1DrawerOpen, setStep1DrawerOpen] = useState(false);
  const [step2DrawerOpen, setStep2DrawerOpen] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null);
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfiguration | null>(null);

  // Load all workflows
  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const data = await CRMService.getWorkflows();
      setWorkflows(data);
      setLoading(false);
    } catch (error) {
      showApiError(error, 'Workflows yüklenemedi');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadWorkflows();
  }, []);

  // Handle activate workflow
  const handleActivate = async (id: number) => {
    try {
      await CRMService.activateWorkflow(id);
      showSuccess('Workflow aktif edildi');
      loadWorkflows();
    } catch (error) {
      showApiError(error, 'Workflow aktif edilemedi');
    }
  };

  // Handle deactivate workflow
  const handleDeactivate = async (id: number) => {
    try {
      await CRMService.deactivateWorkflow(id);
      showSuccess('Workflow deaktif edildi');
      loadWorkflows();
    } catch (error) {
      showApiError(error, 'Workflow deaktif edilemedi');
    }
  };

  // Handle delete workflow
  const handleDelete = (id: number) => {
    confirm({
      title: 'Workflow Sil',
      content: 'Bu workflow\'u silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      async onOk() {
        try {
          await CRMService.deleteWorkflow(id);
          showSuccess('Workflow silindi');
          loadWorkflows();
        } catch (error) {
          showApiError(error, 'Workflow silinemedi');
        }
      },
    });
  };

  // Handle view workflow details
  const handleView = (id: number) => {
    router.push(`/crm/workflows/${id}`);
  };

  // Wizard navigation handlers
  const handleOpenStep1 = () => {
    setStep1DrawerOpen(true);
  };

  const handleStep1Next = (data: Step1FormData) => {
    setStep1Data(data);
    setStep1DrawerOpen(false);
    setStep2DrawerOpen(true);
  };

  const handleStep2Back = () => {
    setStep2DrawerOpen(false);
    setStep1DrawerOpen(true);
  };

  const handleStep2Next = (config: TriggerConfiguration) => {
    setTriggerConfig(config);
    setStep2DrawerOpen(false);

    // Navigate to builder page (Adım 3)
    // For now, we'll create a draft workflow and redirect to builder
    handleCreateDraftWorkflow(config);
  };

  const handleCloseAllDrawers = () => {
    setStep1DrawerOpen(false);
    setStep2DrawerOpen(false);
    setStep1Data(null);
    setTriggerConfig(null);
  };

  // Create draft workflow and redirect to builder
  const handleCreateDraftWorkflow = async (config: TriggerConfiguration) => {
    if (!step1Data) return;

    setLoading(true);
    try {
      // Build trigger conditions JSON with new structure
      const triggerConditions = JSON.stringify(config.config);

      // Create workflow without actions (will be added in builder)
      const command: CreateWorkflowCommand = {
        name: step1Data.name,
        description: step1Data.description,
        triggerType: step1Data.triggerType,
        entityType: step1Data.entityType || 'Lead',
        triggerConditions: triggerConditions,
        steps: [], // Empty for now, will be added in builder
      };

      const workflowId = await CRMService.createWorkflow(command);
      showSuccess('Workflow taslak olarak oluşturuldu. Şimdi aksiyonları ekleyebilirsiniz.');
      handleCloseAllDrawers();
      loadWorkflows();

      // Navigate to workflow detail page where user can add actions
      router.push(`/crm/workflows/${workflowId}`);
    } catch (error) {
      showApiError(error, 'Workflow oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns: ColumnsType<WorkflowDto> = [
    {
      title: 'Workflow Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: WorkflowDto) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Entity Tipi',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 120,
      render: (entityType: string) => <Tag color="blue">{entityType}</Tag>,
    },
    {
      title: 'Trigger',
      dataIndex: 'triggerType',
      key: 'triggerType',
      width: 160,
      render: (triggerType: WorkflowTriggerType) => {
        const { label, color } = triggerTypeLabels[triggerType] || { label: triggerType, color: 'default' };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'} icon={isActive ? <ThunderboltOutlined /> : undefined}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'Adımlar',
      dataIndex: 'steps',
      key: 'steps',
      width: 100,
      render: (steps: any[]) => (
        <Text>{steps?.length || 0} adım</Text>
      ),
    },
    {
      title: 'Çalıştırma',
      dataIndex: 'executionCount',
      key: 'executionCount',
      width: 120,
      render: (count: number, record: WorkflowDto) => (
        <Space direction="vertical" size={0}>
          <Text>{count} kez</Text>
          {record.lastExecutedAt && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {dayjs(record.lastExecutedAt).fromNow()}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_: any, record: WorkflowDto) => (
        <Space size="small">
          <Tooltip title="Detayları Görüntüle">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Deaktif Et' : 'Aktif Et'}>
            <Button
              type="text"
              size="small"
              icon={record.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => record.isActive ? handleDeactivate(record.id) : handleActivate(record.id)}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={4} style={{ margin: 0 }}>
                  <ThunderboltOutlined /> Workflows
                </Title>
              </Col>
              <Col>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={loadWorkflows}>
                    Yenile
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenStep1}>
                    Yeni Workflow
                  </Button>
                </Space>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={workflows}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} workflow`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Henüz workflow bulunmuyor"
                  >
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenStep1}>
                      İlk Workflow'u Oluştur
                    </Button>
                  </Empty>
                ),
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Wizard Drawers */}
      <CreateWorkflowDrawer
        open={step1DrawerOpen}
        onClose={handleCloseAllDrawers}
        onNext={handleStep1Next}
      />

      {step1Data && (
        <ConfigureTriggerDrawer
          open={step2DrawerOpen}
          step1Data={step1Data}
          onClose={handleCloseAllDrawers}
          onBack={handleStep2Back}
          onNext={handleStep2Next}
        />
      )}
    </div>
  );
}
