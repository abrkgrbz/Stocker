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
  Drawer,
  Form,
  Input,
  Select,
  Switch,
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
  SaveOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { showSuccess, showError, showApiError } from '@/lib/utils/notifications';
import { CRMService } from '@/lib/api/services/crm.service';
import type {
  WorkflowDto,
  WorkflowTriggerType,
  WorkflowActionType,
  CreateWorkflowCommand,
  WorkflowAction,
} from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import { useRouter } from 'next/navigation';
import WorkflowActionBuilder from '@/components/crm/workflows/WorkflowActionBuilder';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [selectedTriggerType, setSelectedTriggerType] = useState<string>('Manual');

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

  // Handle open drawer
  const handleOpenDrawer = () => {
    form.resetFields();
    setActions([]);
    setDrawerOpen(true);
  };

  // Handle close drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    form.resetFields();
    setActions([]);
    setSelectedEntityType('');
    setSelectedTriggerType('Manual');
  };

  // Handle trigger type change
  const handleTriggerTypeChange = (value: string) => {
    setSelectedTriggerType(value);
    // Reset entity fields when trigger type changes
    if (value === 'Manual') {
      form.setFieldsValue({ entityType: undefined, field: undefined, value: undefined });
      setSelectedEntityType('');
    }
  };

  // Handle entity type change
  const handleEntityTypeChange = (value: string) => {
    setSelectedEntityType(value);
    // Reset field when entity type changes
    form.setFieldsValue({ field: undefined, value: undefined });
  };

  // Handle add action
  const handleAddAction = () => {
    setActions([
      ...actions,
      {
        type: 'SendEmail',
        parameters: { to: '', subject: '', body: '' },
      },
    ]);
  };

  // Handle remove action
  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  // Handle action change
  const handleActionChange = (index: number, action: WorkflowAction) => {
    const newActions = [...actions];
    newActions[index] = action;
    setActions(newActions);
  };

  // Handle submit workflow
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const command: CreateWorkflowCommand = {
        name: values.name,
        description: values.description,
        trigger: {
          type: values.triggerType,
          entityType: values.entityType,
          field: values.field,
          value: values.value,
        },
        actions: actions,
        isActive: values.isActive ?? false,
      };

      const workflowId = await CRMService.createWorkflow(command);
      showSuccess('Workflow başarıyla oluşturuldu');
      handleCloseDrawer();
      loadWorkflows();
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
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenDrawer}>
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenDrawer}>
                      İlk Workflow'u Oluştur
                    </Button>
                  </Empty>
                ),
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Workflow Creation Drawer */}
      <Drawer
        title={
          <Space>
            <ThunderboltOutlined />
            <span>Yeni Workflow Oluştur</span>
          </Space>
        }
        width={720}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        styles={{
          body: { paddingBottom: 80 },
        }}
        footer={
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
              background: '#fff',
              borderTop: '1px solid #f0f0f0',
              textAlign: 'right',
            }}
          >
            <Space>
              <Button onClick={handleCloseDrawer}>İptal</Button>
              <Button type="primary" onClick={() => form.submit()} loading={loading} icon={<SaveOutlined />}>
                Workflow Oluştur
              </Button>
            </Space>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            triggerType: 'Manual',
            isActive: false,
          }}
        >
          {/* Basic Info */}
          <Card size="small" title="Temel Bilgiler" style={{ marginBottom: 16 }}>
            <Form.Item
              name="name"
              label="Workflow Adı"
              rules={[{ required: true, message: 'Workflow adı zorunludur' }]}
            >
              <Input placeholder="Örn: Müşteri hoş geldin e-postası" />
            </Form.Item>

            <Form.Item name="description" label="Açıklama">
              <TextArea rows={3} placeholder="Workflow'un ne yaptığını açıklayın" />
            </Form.Item>

            <Form.Item name="isActive" label="Durum" valuePropName="checked">
              <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
            </Form.Item>
          </Card>

          {/* Trigger Configuration */}
          <Card size="small" title="Tetikleyici (Trigger)" style={{ marginBottom: 16 }}>
            <Form.Item
              name="triggerType"
              label="Tetikleyici Tipi"
              rules={[{ required: true, message: 'Tetikleyici tipi zorunludur' }]}
            >
              <Select placeholder="Trigger tipini seçin" onChange={handleTriggerTypeChange}>
                <Option value="Manual">🖱️ Manuel (Elle Başlatılır)</Option>
                <Option value="Scheduled">⏰ Zamanlanmış</Option>
                <Option value="EntityCreated">➕ Kayıt Oluşturulduğunda</Option>
                <Option value="EntityUpdated">✏️ Kayıt Güncellendiğinde</Option>
                <Option value="FieldChanged">🔄 Alan Değiştiğinde</Option>
              </Select>
            </Form.Item>

            {selectedTriggerType !== 'Manual' && (
              <>
                <Form.Item
                  name="entityType"
                  label="Entity Tipi"
                  rules={[{ required: true, message: 'Entity tipi zorunludur' }]}
                >
                  <Select
                    placeholder="Entity tipi seçin"
                    onChange={handleEntityTypeChange}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {entityTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedTriggerType === 'FieldChanged' && (
                  <>
                    <Form.Item
                      name="field"
                      label="Değişecek Alan"
                      rules={[{ required: true, message: 'Alan adı zorunludur' }]}
                    >
                      <Select
                        placeholder="Alan seçin"
                        disabled={!selectedEntityType}
                        allowClear
                        showSearch
                        optionFilterProp="children"
                      >
                        {selectedEntityType &&
                          entityFields[selectedEntityType]?.map((field) => (
                            <Option key={field.value} value={field.value}>
                              {field.label}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>

                    <Form.Item name="value" label="Yeni Değer (Opsiyonel)">
                      <Input placeholder="Belirli bir değere değişirse (opsiyonel)" />
                    </Form.Item>
                  </>
                )}
              </>
            )}

            {selectedTriggerType === 'Manual' && (
              <div
                style={{
                  padding: '12px',
                  background: '#f0f5ff',
                  border: '1px solid #adc6ff',
                  borderRadius: '4px',
                }}
              >
                <Text type="secondary">
                  💡 Manuel workflow'lar otomatik çalışmaz. Kullanıcı tarafından manuel olarak başlatılır.
                </Text>
              </div>
            )}
          </Card>

          {/* Actions */}
          <Card
            size="small"
            title="Aksiyonlar"
            extra={
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddAction} size="small">
                Aksiyon Ekle
              </Button>
            }
            style={{ marginBottom: 16 }}
          >
            {actions.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  background: '#fafafa',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '4px',
                }}
              >
                <Text type="secondary">
                  Henüz aksiyon eklenmedi. Workflow çalıştığında yapılacak işlemleri eklemek için yukarıdaki
                  butonu kullanın.
                </Text>
              </div>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {actions.map((action, index) => (
                  <WorkflowActionBuilder
                    key={index}
                    action={action}
                    index={index}
                    onChange={handleActionChange}
                    onRemove={handleRemoveAction}
                  />
                ))}
              </Space>
            )}
          </Card>
        </Form>
      </Drawer>
    </div>
  );
}
