import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Card, List, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined, LinkOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, IntegrationDto, CreateIntegrationDto, IntegrationItemDto, CreateIntegrationItemDto } from '../../../../services/api/cmsService';

const IntegrationsTab: React.FC = () => {
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDto | null>(null);
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['cms', 'integrations'],
    queryFn: () => cmsService.getIntegrations(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateIntegrationDto) => cmsService.createIntegration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'integrations'] });
      message.success('Entegrasyon oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Entegrasyon oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateIntegrationDto }) => cmsService.updateIntegration(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'integrations'] });
      message.success('Entegrasyon güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Entegrasyon güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'integrations'] });
      message.success('Entegrasyon silindi');
    },
    onError: () => message.error('Entegrasyon silinemedi'),
  });

  const createItemMutation = useMutation({
    mutationFn: (data: CreateIntegrationItemDto) => cmsService.createIntegrationItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'integrations'] });
      message.success('Öğe eklendi');
      setItemModalVisible(false);
      itemForm.resetFields();
    },
    onError: () => message.error('Öğe eklenemedi'),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteIntegrationItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'integrations'] });
      message.success('Öğe silindi');
    },
    onError: () => message.error('Öğe silinemedi'),
  });

  const handleOpenModal = (record?: IntegrationDto) => {
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

  const handleAddItem = () => {
    if (!selectedIntegration) return;
    itemForm.setFieldsValue({ integrationId: selectedIntegration.id });
    setItemModalVisible(true);
  };

  const handleItemSubmit = async () => {
    const values = await itemForm.validateFields();
    createItemMutation.mutate(values);
  };

  const columns = [
    {
      title: 'İkon',
      key: 'icon',
      width: 60,
      render: (_: any, record: IntegrationDto) => (
        <Avatar
          style={{ backgroundColor: record.color || '#667eea' }}
          icon={record.icon ? <span dangerouslySetInnerHTML={{ __html: record.icon }} /> : <ApiOutlined />}
        />
      ),
    },
    {
      title: 'Entegrasyon',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: IntegrationDto) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.slug}</div>
        </div>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Öğeler',
      key: 'items',
      render: (_: any, record: IntegrationDto) => (
        <Button type="link" onClick={() => setSelectedIntegration(record)}>
          {record.items?.length || 0} öğe
        </Button>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_: any, record: IntegrationDto) => (
        <Tag color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'Aktif' : 'Pasif'}</Tag>
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
      render: (_: any, record: IntegrationDto) => (
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
          <h3 style={{ margin: 0 }}>Entegrasyonlar</h3>
          <p style={{ margin: 0, color: '#888' }}>Desteklenen entegrasyonlar ve bağlantılar</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Entegrasyon
        </Button>
      </div>

      <Table
        dataSource={integrations}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      {/* Integration Items Panel */}
      {selectedIntegration && (
        <Card
          title={`${selectedIntegration.name} - Öğeler`}
          extra={
            <Space>
              <Button icon={<PlusOutlined />} onClick={handleAddItem}>Öğe Ekle</Button>
              <Button onClick={() => setSelectedIntegration(null)}>Kapat</Button>
            </Space>
          }
          style={{ marginTop: 16 }}
        >
          <List
            dataSource={selectedIntegration.items || []}
            renderItem={(item: IntegrationItemDto) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="delete"
                    title="Silmek istediğinize emin misiniz?"
                    onConfirm={() => deleteItemMutation.mutate(item.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={item.logo ? <Avatar src={item.logo} /> : <Avatar icon={<LinkOutlined />} />}
                  title={
                    <Space>
                      {item.name}
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><LinkOutlined /></a>}
                    </Space>
                  }
                  description={item.description}
                />
              </List.Item>
            )}
            locale={{ emptyText: 'Henüz öğe eklenmemiş' }}
          />
        </Card>
      )}

      {/* Integration Modal */}
      <Modal
        title={editingId ? 'Entegrasyon Düzenle' : 'Yeni Entegrasyon'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Entegrasyon Adı" rules={[{ required: true, message: 'Ad gerekli' }]}>
            <Input placeholder="E-Ticaret, Muhasebe, vb." />
          </Form.Item>
          <Form.Item name="slug" label="Slug">
            <Input placeholder="e-ticaret, muhasebe" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Entegrasyon açıklaması" />
          </Form.Item>
          <Form.Item name="icon" label="İkon (emoji veya SVG)">
            <Input placeholder="🔗 veya <svg>...</svg>" />
          </Form.Item>
          <Form.Item name="color" label="Renk">
            <Input type="color" style={{ width: 100 }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sıra" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Aktif" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Integration Item Modal */}
      <Modal
        title="Yeni Öğe Ekle"
        open={itemModalVisible}
        onOk={handleItemSubmit}
        onCancel={() => { setItemModalVisible(false); itemForm.resetFields(); }}
        confirmLoading={createItemMutation.isPending}
      >
        <Form form={itemForm} layout="vertical">
          <Form.Item name="integrationId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Öğe Adı" rules={[{ required: true, message: 'Ad gerekli' }]}>
            <Input placeholder="Trendyol, Hepsiburada, vb." />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input placeholder="Öğe açıklaması" />
          </Form.Item>
          <Form.Item name="logo" label="Logo URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="url" label="Link URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sıra" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Aktif" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default IntegrationsTab;
