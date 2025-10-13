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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureService, type Feature, type CreateFeatureDto, type UpdateFeatureDto } from '../../services/api/index';

const { Title, Text } = Typography;
const { TextArea } = Input;

const FeaturesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  // Queries
  const { data: features, isLoading } = useQuery({
    queryKey: ['features', selectedCategory],
    queryFn: () => selectedCategory ? featureService.getByCategory(selectedCategory) : featureService.getAll(),
  });

  const { data: categories } = useQuery({
    queryKey: ['feature-categories'],
    queryFn: () => featureService.getCategories(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateFeatureDto) => featureService.create(data),
    onSuccess: () => {
      message.success('Özellik başarıyla oluşturuldu');
      queryClient.invalidateQueries({ queryKey: ['features'] });
      handleCloseModal();
    },
    onError: () => {
      message.error('Özellik oluşturulurken hata oluştu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeatureDto }) =>
      featureService.update(id, data),
    onSuccess: () => {
      message.success('Özellik başarıyla güncellendi');
      queryClient.invalidateQueries({ queryKey: ['features'] });
      handleCloseModal();
    },
    onError: () => {
      message.error('Özellik güncellenirken hata oluştu');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => featureService.delete(id),
    onSuccess: () => {
      message.success('Özellik başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
    onError: () => {
      message.error('Özellik silinirken hata oluştu');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => featureService.toggleActive(id),
    onSuccess: () => {
      message.success('Özellik durumu değiştirildi');
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
    onError: () => {
      message.error('Özellik durumu değiştirilirken hata oluştu');
    },
  });

  // Handlers
  const handleOpenModal = (feature?: Feature) => {
    if (feature) {
      setEditingFeature(feature);
      form.setFieldsValue(feature);
    } else {
      setEditingFeature(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFeature(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingFeature) {
        updateMutation.mutate({ id: editingFeature.id, data: values });
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
  const activeFeatures = features?.filter(f => f.isActive).length || 0;
  const inactiveFeatures = features?.filter(f => !f.isActive).length || 0;
  const defaultFeatures = features?.filter(f => f.isDefault).length || 0;

  // Table columns
  const columns = [
    {
      title: 'Özellik Adı',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string, record: Feature) => (
        <Space>
          <AppstoreOutlined style={{ color: '#667eea' }} />
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
      render: (isActive: boolean, record: Feature) => (
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
      render: (_: any, record: Feature) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Bu özelliği silmek istediğinizden emin misiniz?"
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
        <Title level={2}>Özellik Yönetimi</Title>
        <Text type="secondary">Sistem özelliklerini yönetin ve paketlere atayın</Text>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Özellik"
              value={features?.length || 0}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aktif Özellikler"
              value={activeFeatures}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pasif Özellikler"
              value={inactiveFeatures}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Varsayılan Özellikler"
              value={defaultFeatures}
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
            Yeni Özellik
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={features}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} özellik`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingFeature ? 'Özellik Düzenle' : 'Yeni Özellik'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
        okText={editingFeature ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="Özellik Kodu"
            rules={[
              { required: true, message: 'Özellik kodu gereklidir' },
              { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: 'Sadece harf, rakam ve alt çizgi kullanabilirsiniz' }
            ]}
          >
            <Input placeholder="ornek: inventory_management" disabled={!!editingFeature} />
          </Form.Item>

          <Form.Item
            name="displayName"
            label="Görünen Ad"
            rules={[{ required: true, message: 'Görünen ad gereklidir' }]}
          >
            <Input placeholder="örnek: Envanter Yönetimi" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <TextArea rows={3} placeholder="Özellik açıklaması..." />
          </Form.Item>

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

          <Form.Item
            name="isActive"
            label="Aktif"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
          </Form.Item>

          <Form.Item
            name="isDefault"
            label="Varsayılan Özellik"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch
              checkedChildren="Evet"
              unCheckedChildren="Hayır"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeaturesPage;
