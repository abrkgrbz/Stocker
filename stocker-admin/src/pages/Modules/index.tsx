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
  Badge,
  InputNumber,
  TreeSelect,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleService, featureService, type Module, type CreateModuleDto, type UpdateModuleDto } from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ModulesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  // Queries
  const { data: modules, isLoading } = useQuery({
    queryKey: ['modules', selectedCategory],
    queryFn: () => selectedCategory ? moduleService.getByCategory(selectedCategory) : moduleService.getAll(),
  });

  const { data: categories } = useQuery({
    queryKey: ['module-categories'],
    queryFn: () => moduleService.getCategories(),
  });

  const { data: features } = useQuery({
    queryKey: ['features'],
    queryFn: () => featureService.getAll(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateModuleDto) => moduleService.create(data),
    onSuccess: () => {
      message.success('Modül başarıyla oluşturuldu');
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      handleCloseModal();
    },
    onError: () => {
      message.error('Modül oluşturulurken hata oluştu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModuleDto }) =>
      moduleService.update(id, data),
    onSuccess: () => {
      message.success('Modül başarıyla güncellendi');
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      handleCloseModal();
    },
    onError: () => {
      message.error('Modül güncellenirken hata oluştu');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => moduleService.delete(id),
    onSuccess: () => {
      message.success('Modül başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
    onError: () => {
      message.error('Modül silinirken hata oluştu');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => moduleService.toggleActive(id),
    onSuccess: () => {
      message.success('Modül durumu değiştirildi');
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
    onError: () => {
      message.error('Modül durumu değiştirilirken hata oluştu');
    },
  });

  // Handlers
  const handleOpenModal = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      form.setFieldsValue(module);
    } else {
      setEditingModule(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingModule(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingModule) {
        updateMutation.mutate({ id: editingModule.id, data: values });
      } else {
        createMutation.mutate(values);
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

  // Statistics
  const activeModules = modules?.filter(m => m.isActive).length || 0;
  const inactiveModules = modules?.filter(m => !m.isActive).length || 0;
  const defaultModules = modules?.filter(m => m.isDefault).length || 0;

  // Convert modules to tree data for parent selection
  const moduleTreeData = modules?.map(m => ({
    title: m.displayName,
    value: m.id,
    key: m.id,
  })) || [];

  // Table columns
  const columns = [
    {
      title: 'Modül Adı',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string, record: Module) => (
        <Space>
          {record.icon ? <span style={{ fontSize: 16 }}>{record.icon}</span> : <NodeIndexOutlined style={{ color: '#667eea' }} />}
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.name}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
      render: (route?: string) => (
        route ? <Tag color="cyan">{route}</Tag> : <Text type="secondary">-</Text>
      ),
    },
    {
      title: 'Sıra',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      sorter: (a: Module, b: Module) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Varsayılan',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) => (
        isDefault ? (
          <Tag color="gold">Varsayılan</Tag>
        ) : (
          <Tag color="default">Opsiyonel</Tag>
        )
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Module) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id)}
          checkedChildren="Aktif"
          unCheckedChildren="Pasif"
        />
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Module) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Bu modülü silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Modül Yönetimi</Title>
        <Text type="secondary">Sistem modüllerini yönetin ve paketlere atayın</Text>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Modül"
              value={modules?.length || 0}
              prefix={<NodeIndexOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aktif Modüller"
              value={activeModules}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pasif Modüller"
              value={inactiveModules}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Varsayılan Modüller"
              value={defaultModules}
              prefix={<Badge status="success" />}
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
              options={categories?.map(cat => ({ label: cat, value: cat }))}
            />
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Yeni Modül
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={modules}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} modül`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingModule ? 'Modül Düzenle' : 'Yeni Modül'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={700}
        okText={editingModule ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Modül Kodu"
                rules={[
                  { required: true, message: 'Modül kodu gereklidir' },
                  { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: 'Sadece harf, rakam ve alt çizgi kullanabilirsiniz' }
                ]}
              >
                <Input placeholder="örnek: inventory_module" disabled={!!editingModule} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="displayName"
                label="Görünen Ad"
                rules={[{ required: true, message: 'Görünen ad gereklidir' }]}
              >
                <Input placeholder="örnek: Envanter Modülü" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <TextArea rows={2} placeholder="Modül açıklaması..." />
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
                  options={[
                    { label: 'Envanter', value: 'inventory' },
                    { label: 'Satış', value: 'sales' },
                    { label: 'Raporlama', value: 'reporting' },
                    { label: 'Entegrasyonlar', value: 'integrations' },
                    { label: 'Güvenlik', value: 'security' },
                    { label: 'Diğer', value: 'other' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="icon"
                label="İkon (Emoji)"
              >
                <Input placeholder="📦" maxLength={2} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="route"
                label="Route"
              >
                <Input placeholder="/inventory" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sortOrder"
                label="Sıra"
                initialValue={0}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="parentModuleId"
            label="Üst Modül"
          >
            <TreeSelect
              placeholder="Üst modül seçin (opsiyonel)"
              treeData={moduleTreeData}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="requiredFeatures"
            label="Gerekli Özellikler"
          >
            <Select
              mode="multiple"
              placeholder="Gerekli özellikleri seçin"
              options={features?.map(f => ({ label: f.displayName, value: f.id }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Aktif"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isDefault"
                label="Varsayılan Modül"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ModulesPage;
