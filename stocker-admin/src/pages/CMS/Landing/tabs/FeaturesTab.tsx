import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, FeatureDto, CreateFeatureDto } from '../../../../services/api/cmsService';

const FeaturesTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: features = [], isLoading } = useQuery({
    queryKey: ['cms', 'features'],
    queryFn: () => cmsService.getFeatures(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateFeatureDto) => cmsService.createFeature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'features'] });
      message.success('Özellik oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Özellik oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateFeatureDto }) => cmsService.updateFeature(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'features'] });
      message.success('Özellik güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Özellik güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteFeature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'features'] });
      message.success('Özellik silindi');
    },
    onError: () => message.error('Özellik silinemedi'),
  });

  const handleOpenModal = (record?: FeatureDto) => {
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

  const columns = [
    {
      title: 'İkon',
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (icon: string, record: FeatureDto) => (
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: record.iconColor || '#667eea',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}>
          {icon ? <span dangerouslySetInnerHTML={{ __html: icon }} /> : '?'}
        </div>
      ),
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: FeatureDto) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.category}</div>
        </div>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      render: (_: any, record: FeatureDto) => (
        <Space direction="vertical" size={0}>
          <Tag color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'Aktif' : 'Pasif'}</Tag>
          {record.isFeatured && <Tag color="gold">Öne Çıkan</Tag>}
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
      render: (_: any, record: FeatureDto) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Silmek istediğinize emin misiniz?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categoryOptions = [
    { value: 'inventory', label: 'Stok Yönetimi' },
    { value: 'sales', label: 'Satış' },
    { value: 'purchase', label: 'Satın Alma' },
    { value: 'finance', label: 'Finans' },
    { value: 'reporting', label: 'Raporlama' },
    { value: 'integration', label: 'Entegrasyon' },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>Ürün Özellikleri</h3>
          <p style={{ margin: 0, color: '#888' }}>Ana sayfada gösterilecek ürün özellikleri</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Özellik
        </Button>
      </div>

      <Table
        dataSource={features}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Özellik Düzenle' : 'Yeni Özellik'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Başlık" rules={[{ required: true, message: 'Başlık gerekli' }]}>
            <Input placeholder="Stok Takibi" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Özellik açıklaması" />
          </Form.Item>
          <Form.Item name="category" label="Kategori">
            <Select options={categoryOptions} placeholder="Kategori seçin" allowClear />
          </Form.Item>
          <Form.Item name="icon" label="İkon (SVG veya emoji)">
            <Input placeholder="📦 veya <svg>...</svg>" />
          </Form.Item>
          <Form.Item name="iconColor" label="İkon Rengi">
            <Input type="color" style={{ width: 100 }} />
          </Form.Item>
          <Form.Item name="image" label="Görsel URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sıra" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Space>
            <Form.Item name="isActive" label="Aktif" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item name="isFeatured" label="Öne Çıkan" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default FeaturesTab;
