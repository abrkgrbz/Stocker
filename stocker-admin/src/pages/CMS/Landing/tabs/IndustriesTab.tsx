import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, IndustryDto, CreateIndustryDto } from '../../../../services/api/cmsService';

const IndustriesTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: industries = [], isLoading } = useQuery({
    queryKey: ['cms', 'industries'],
    queryFn: () => cmsService.getIndustries(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateIndustryDto) => cmsService.createIndustry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'industries'] });
      message.success('Sektör oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Sektör oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateIndustryDto }) => cmsService.updateIndustry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'industries'] });
      message.success('Sektör güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Sektör güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteIndustry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'industries'] });
      message.success('Sektör silindi');
    },
    onError: () => message.error('Sektör silinemedi'),
  });

  const handleOpenModal = (record?: IndustryDto) => {
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
      key: 'icon',
      width: 60,
      render: (_: any, record: IndustryDto) => (
        <Avatar
          style={{ backgroundColor: record.color || '#667eea' }}
          icon={record.icon ? <span dangerouslySetInnerHTML={{ __html: record.icon }} /> : <ShopOutlined />}
        />
      ),
    },
    {
      title: 'Sektör',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: IndustryDto) => (
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
      width: 300,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_: any, record: IndustryDto) => (
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
      render: (_: any, record: IndustryDto) => (
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
          <h3 style={{ margin: 0 }}>Sektörler</h3>
          <p style={{ margin: 0, color: '#888' }}>Hizmet verilen sektörler</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Sektör
        </Button>
      </div>

      <Table
        dataSource={industries}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Sektör Düzenle' : 'Yeni Sektör'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Sektör Adı" rules={[{ required: true, message: 'Sektör adı gerekli' }]}>
            <Input placeholder="Perakende, Üretim, vb." />
          </Form.Item>
          <Form.Item name="slug" label="Slug">
            <Input placeholder="perakende, uretim" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Sektör açıklaması" />
          </Form.Item>
          <Form.Item name="icon" label="İkon (emoji veya SVG)">
            <Input placeholder="🏪 veya <svg>...</svg>" />
          </Form.Item>
          <Form.Item name="color" label="Renk">
            <Input type="color" style={{ width: 100 }} />
          </Form.Item>
          <Form.Item name="image" label="Görsel URL">
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

export default IndustriesTab;
