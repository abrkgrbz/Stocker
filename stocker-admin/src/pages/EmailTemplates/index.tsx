import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Tabs,
  Tooltip,
  Drawer,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  CopyOutlined,
  CodeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  emailTemplateService,
  type EmailTemplate,
  type CreateEmailTemplateDto,
  type UpdateEmailTemplateDto,
  type EmailTemplatePreviewDto,
} from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const categoryLabels: Record<string, { label: string; color: string }> = {
  Authentication: { label: 'Kimlik Doğrulama', color: 'blue' },
  UserManagement: { label: 'Kullanıcı Yönetimi', color: 'green' },
  Notification: { label: 'Bildirim', color: 'orange' },
  Transaction: { label: 'İşlem', color: 'purple' },
  Marketing: { label: 'Pazarlama', color: 'magenta' },
  CRM: { label: 'CRM', color: 'cyan' },
  System: { label: 'Sistem', color: 'red' },
};

const EmailTemplatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewData, setPreviewData] = useState<EmailTemplatePreviewDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('editor');
  const [form] = Form.useForm();

  // Queries
  const { data: templateList, isLoading } = useQuery({
    queryKey: ['email-templates', selectedCategory],
    queryFn: () => emailTemplateService.getAll({
      category: selectedCategory,
      pageSize: 100
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ['email-template-categories'],
    queryFn: () => emailTemplateService.getCategories(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateEmailTemplateDto) => emailTemplateService.create(data),
    onSuccess: () => {
      message.success('Email şablonu başarıyla oluşturuldu');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      handleCloseModal();
    },
    onError: () => {
      message.error('Email şablonu oluşturulurken hata oluştu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmailTemplateDto }) =>
      emailTemplateService.update(id, data),
    onSuccess: () => {
      message.success('Email şablonu başarıyla güncellendi');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      handleCloseModal();
    },
    onError: () => {
      message.error('Email şablonu güncellenirken hata oluştu');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailTemplateService.delete(id),
    onSuccess: () => {
      message.success('Email şablonu başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: () => {
      message.error('Email şablonu silinirken hata oluştu');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => emailTemplateService.toggleActive(id),
    onSuccess: () => {
      message.success('Şablon durumu değiştirildi');
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error: any) => {
      message.error(error?.message || 'Şablon durumu değiştirilirken hata oluştu');
    },
  });

  const previewMutation = useMutation({
    mutationFn: ({ id, sampleData }: { id: string; sampleData?: string }) =>
      emailTemplateService.preview(id, sampleData),
    onSuccess: (data) => {
      setPreviewData(data);
      setIsPreviewOpen(true);
    },
    onError: () => {
      message.error('Önizleme oluşturulurken hata oluştu');
    },
  });

  // Handlers
  const handleOpenModal = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      form.setFieldsValue({
        ...template,
        variables: template.variables.join(', '),
      });
    } else {
      setEditingTemplate(null);
      form.resetFields();
      form.setFieldsValue({
        language: 'tr',
        category: 'Authentication',
      });
    }
    setActiveTab('editor');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Convert variables string to array
      const variables = values.variables
        ? values.variables.split(',').map((v: string) => v.trim()).filter(Boolean)
        : [];

      const data = {
        ...values,
        variables,
      };

      if (editingTemplate) {
        updateMutation.mutate({ id: editingTemplate.id, data });
      } else {
        createMutation.mutate(data);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleActive = (id: string) => {
    toggleActiveMutation.mutate(id);
  };

  const handlePreview = (template: EmailTemplate) => {
    previewMutation.mutate({ id: template.id, sampleData: template.sampleData });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    message.success('Şablon anahtarı kopyalandı');
  };

  // Statistics
  const templates = templateList?.items || [];
  const activeTemplates = templates.filter(t => t.isActive).length;
  const systemTemplates = templates.filter(t => t.isSystem).length;

  // Table columns
  const columns = [
    {
      title: 'Şablon',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: EmailTemplate) => (
        <Space direction="vertical" size={0}>
          <Space>
            <MailOutlined style={{ color: '#667eea' }} />
            <Text strong>{text}</Text>
            {record.isSystem && <Tag color="gold">Sistem</Tag>}
          </Space>
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.templateKey}</Text>
            <Tooltip title="Anahtarı Kopyala">
              <CopyOutlined
                style={{ cursor: 'pointer', color: '#999' }}
                onClick={() => handleCopyKey(record.templateKey)}
              />
            </Tooltip>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const cat = categoryLabels[category] || { label: category, color: 'default' };
        return <Tag color={cat.color}>{cat.label}</Tag>;
      },
    },
    {
      title: 'Dil',
      dataIndex: 'language',
      key: 'language',
      render: (lang: string) => (
        <Tag>{lang.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Konu',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Versiyon',
      dataIndex: 'version',
      key: 'version',
      render: (version: number) => (
        <Tag color="geekblue">v{version}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: EmailTemplate) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id)}
          checkedChildren="Aktif"
          unCheckedChildren="Pasif"
          disabled={record.isSystem}
        />
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: unknown, record: EmailTemplate) => (
        <Space>
          <Tooltip title="Önizle">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          {!record.isSystem && (
            <Popconfirm
              title="Bu şablonu silmek istediğinizden emin misiniz?"
              onConfirm={() => handleDelete(record.id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <MailOutlined style={{ marginRight: 12 }} />
          Email Şablonları
        </Title>
        <Text type="secondary">
          Sistem email şablonlarını yönetin. Liquid template sözdizimi desteklenir.
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Şablon"
              value={templates.length}
              prefix={<MailOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aktif Şablonlar"
              value={activeTemplates}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pasif Şablonlar"
              value={templates.length - activeTemplates}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sistem Şablonları"
              value={systemTemplates}
              prefix={<CodeOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Select
              placeholder="Kategori Filtrele"
              style={{ width: 200 }}
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categories?.map(cat => ({
                label: categoryLabels[cat]?.label || cat,
                value: cat
              }))}
            />
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Yeni Şablon
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} şablon`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTemplate ? 'Email Şablonu Düzenle' : 'Yeni Email Şablonu'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={1000}
        okText={editingTemplate ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><FileTextOutlined /> Temel Bilgiler</span>} key="info">
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="templateKey"
                    label="Şablon Anahtarı"
                    rules={[
                      { required: true, message: 'Şablon anahtarı gereklidir' },
                      { pattern: /^[a-z0-9-]+$/, message: 'Sadece küçük harf, rakam ve tire kullanabilirsiniz' }
                    ]}
                  >
                    <Input placeholder="ornek: user-invitation" disabled={!!editingTemplate} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Şablon Adı"
                    rules={[{ required: true, message: 'Şablon adı gereklidir' }]}
                  >
                    <Input placeholder="örnek: Kullanıcı Daveti" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Açıklama">
                <TextArea rows={2} placeholder="Şablon açıklaması..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="Kategori"
                    rules={[{ required: true, message: 'Kategori gereklidir' }]}
                  >
                    <Select
                      placeholder="Kategori seçin"
                      options={categories?.map(cat => ({
                        label: categoryLabels[cat]?.label || cat,
                        value: cat
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="language"
                    label="Dil"
                    rules={[{ required: true, message: 'Dil gereklidir' }]}
                  >
                    <Select
                      placeholder="Dil seçin"
                      options={[
                        { label: 'Türkçe', value: 'tr' },
                        { label: 'English', value: 'en' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="variables"
                label="Değişkenler"
                extra="Virgülle ayırarak yazın: userName, companyName, activationUrl"
              >
                <Input placeholder="userName, companyName, activationUrl" />
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab={<span><CodeOutlined /> İçerik Düzenleyici</span>} key="editor">
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item
                name="subject"
                label="Email Konusu"
                rules={[{ required: true, message: 'Email konusu gereklidir' }]}
                extra="Liquid değişkenler kullanabilirsiniz: {{ userName }}"
              >
                <Input placeholder="{{ appName }} - Hoşgeldiniz!" />
              </Form.Item>

              <Form.Item
                name="htmlBody"
                label="HTML İçeriği"
                rules={[{ required: true, message: 'HTML içeriği gereklidir' }]}
                extra="Liquid sözdizimi: {{ variable }}, {% if condition %}...{% endif %}, {% for item in collection %}...{% endfor %}"
              >
                <TextArea
                  rows={15}
                  placeholder="<!DOCTYPE html>..."
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>

              <Form.Item name="plainTextBody" label="Düz Metin İçeriği (Opsiyonel)">
                <TextArea
                  rows={5}
                  placeholder="HTML desteklemeyen email istemcileri için düz metin..."
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab={<span><EyeOutlined /> Örnek Veri</span>} key="sample">
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Alert
                message="Örnek Veri"
                description="Önizleme için kullanılacak JSON formatında örnek veri. Şablondaki değişkenlere karşılık gelen değerler içermelidir."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Form.Item name="sampleData" label="Örnek Veri (JSON)">
                <TextArea
                  rows={10}
                  placeholder='{"userName": "Ahmet Yılmaz", "companyName": "ABC Ltd.", "activationUrl": "https://example.com/activate"}'
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>

      {/* Preview Drawer */}
      <Drawer
        title="Email Önizleme"
        placement="right"
        width={700}
        onClose={() => setIsPreviewOpen(false)}
        open={isPreviewOpen}
      >
        {previewData && (
          <div>
            {!previewData.isSuccess ? (
              <Alert
                message="Önizleme Hatası"
                description={previewData.errorMessage}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            ) : (
              <>
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Text strong>Konu:</Text>
                  <Paragraph style={{ margin: '8px 0 0 0' }}>
                    {previewData.subject}
                  </Paragraph>
                </Card>
                <Card
                  title="HTML İçeriği"
                  size="small"
                  style={{ marginBottom: 16 }}
                >
                  <div
                    style={{
                      border: '1px solid #f0f0f0',
                      borderRadius: 4,
                      padding: 16,
                      backgroundColor: '#fff',
                    }}
                    dangerouslySetInnerHTML={{ __html: previewData.htmlBody }}
                  />
                </Card>
                {previewData.plainTextBody && (
                  <Card title="Düz Metin İçeriği" size="small">
                    <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                      {previewData.plainTextBody}
                    </pre>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default EmailTemplatesPage;
