import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Card, List, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, PricingPlanDto, CreatePricingPlanDto, PricingFeatureDto, CreatePricingFeatureDto } from '../../../../services/api/cmsService';

const { Text } = Typography;

const PricingTab: React.FC = () => {
  const [form] = Form.useForm();
  const [featureForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanDto | null>(null);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['cms', 'pricing-plans'],
    queryFn: () => cmsService.getPricingPlans(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePricingPlanDto) => cmsService.createPricingPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pricing-plans'] });
      message.success('Plan oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Plan oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreatePricingPlanDto }) => cmsService.updatePricingPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pricing-plans'] });
      message.success('Plan güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Plan güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deletePricingPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pricing-plans'] });
      message.success('Plan silindi');
    },
    onError: () => message.error('Plan silinemedi'),
  });

  const createFeatureMutation = useMutation({
    mutationFn: (data: CreatePricingFeatureDto) => cmsService.createPricingFeature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pricing-plans'] });
      message.success('Özellik eklendi');
      setFeatureModalVisible(false);
      featureForm.resetFields();
    },
    onError: () => message.error('Özellik eklenemedi'),
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: (id: string) => cmsService.deletePricingFeature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'pricing-plans'] });
      message.success('Özellik silindi');
    },
    onError: () => message.error('Özellik silinemedi'),
  });

  const handleOpenModal = (record?: PricingPlanDto) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleAddFeature = () => {
    if (!selectedPlan) return;
    featureForm.setFieldsValue({ planId: selectedPlan.id });
    setFeatureModalVisible(true);
  };

  const handleFeatureSubmit = async () => {
    const values = await featureForm.validateFields();
    createFeatureMutation.mutate(values);
  };

  const columns = [
    {
      title: 'Plan Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: PricingPlanDto) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.badge && <Tag color="gold">{record.badge}</Tag>}
        </div>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      render: (_: any, record: PricingPlanDto) => (
        <div>
          <Text strong style={{ fontSize: 16 }}>{record.price} {record.currency}</Text>
          <div style={{ fontSize: 12, color: '#888' }}>/ {record.billingPeriod}</div>
          {record.originalPrice && (
            <Text delete type="secondary" style={{ fontSize: 12 }}>{record.originalPrice} {record.currency}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Özellikler',
      key: 'features',
      render: (_: any, record: PricingPlanDto) => (
        <Button type="link" onClick={() => setSelectedPlan(record)}>
          {record.features?.length || 0} özellik
        </Button>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      render: (_: any, record: PricingPlanDto) => (
        <Space direction="vertical" size={0}>
          <Tag color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'Aktif' : 'Pasif'}</Tag>
          {record.isPopular && <Tag color="blue">Popüler</Tag>}
        </Space>
      ),
    },
    {
      title: 'Sıra',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
    },
    {
      title: 'İşlem',
      key: 'action',
      width: 100,
      render: (_: any, record: PricingPlanDto) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Silmek istediğinize emin misiniz?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>Fiyatlandırma Planları</h3>
          <p style={{ margin: 0, color: '#888' }}>Ürün fiyat planlarını yönetin</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Plan
        </Button>
      </div>

      <Table
        dataSource={plans}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      {/* Plan Features Side Panel */}
      {selectedPlan && (
        <Card
          title={`${selectedPlan.name} - Özellikler`}
          extra={
            <Space>
              <Button icon={<PlusOutlined />} onClick={handleAddFeature}>Özellik Ekle</Button>
              <Button onClick={() => setSelectedPlan(null)}>Kapat</Button>
            </Space>
          }
          style={{ marginTop: 16 }}
        >
          <List
            dataSource={selectedPlan.features || []}
            renderItem={(feature: PricingFeatureDto) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="delete"
                    title="Silmek istediğinize emin misiniz?"
                    onConfirm={() => deleteFeatureMutation.mutate(feature.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={feature.isIncluded ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />}
                  title={feature.name}
                  description={feature.description}
                />
                {feature.value && <Tag>{feature.value}</Tag>}
              </List.Item>
            )}
            locale={{ emptyText: 'Henüz özellik eklenmemiş' }}
          />
        </Card>
      )}

      {/* Plan Modal */}
      <Modal
        title={editingId ? 'Plan Düzenle' : 'Yeni Plan'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Plan Adı" rules={[{ required: true, message: 'Plan adı gerekli' }]}>
            <Input placeholder="Starter, Pro, Enterprise" />
          </Form.Item>
          <Form.Item name="slug" label="Slug">
            <Input placeholder="starter, pro, enterprise" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={2} placeholder="Plan açıklaması" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="price" label="Fiyat" rules={[{ required: true, message: 'Fiyat gerekli' }]}>
              <InputNumber min={0} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="currency" label="Para Birimi" initialValue="TL">
              <Input style={{ width: 100 }} />
            </Form.Item>
            <Form.Item name="billingPeriod" label="Dönem" initialValue="ay">
              <Input style={{ width: 100 }} placeholder="ay, yıl" />
            </Form.Item>
          </Space>
          <Form.Item name="originalPrice" label="Eski Fiyat (İndirimli gösterim için)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="badge" label="Rozet">
            <Input placeholder="En Popüler, İndirimli, vb." />
          </Form.Item>
          <Form.Item name="buttonText" label="Buton Metni" initialValue="Başla">
            <Input />
          </Form.Item>
          <Form.Item name="buttonUrl" label="Buton URL">
            <Input placeholder="/kayit" />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sıra" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Space>
            <Form.Item name="isActive" label="Aktif" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item name="isPopular" label="Popüler" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* Feature Modal */}
      <Modal
        title="Yeni Özellik Ekle"
        open={featureModalVisible}
        onOk={handleFeatureSubmit}
        onCancel={() => { setFeatureModalVisible(false); featureForm.resetFields(); }}
        confirmLoading={createFeatureMutation.isPending}
      >
        <Form form={featureForm} layout="vertical">
          <Form.Item name="planId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Özellik Adı" rules={[{ required: true, message: 'Özellik adı gerekli' }]}>
            <Input placeholder="Sınırsız kullanıcı" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input placeholder="Özellik açıklaması" />
          </Form.Item>
          <Form.Item name="value" label="Değer">
            <Input placeholder="100 GB, Sınırsız, vb." />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sıra" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Space>
            <Form.Item name="isIncluded" label="Dahil" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item name="isActive" label="Aktif" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default PricingTab;
