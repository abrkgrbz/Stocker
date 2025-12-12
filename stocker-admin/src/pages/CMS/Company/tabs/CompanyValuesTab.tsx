import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HeartOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, CompanyValueDto, CreateCompanyValueDto } from '../../../../services/api/cmsService';

const CompanyValuesTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: values = [], isLoading } = useQuery({
    queryKey: ['cms', 'company-values'],
    queryFn: () => cmsService.getCompanyValues(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCompanyValueDto) => cmsService.createCompanyValue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'company-values'] });
      message.success('Değer oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Değer oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCompanyValueDto }) => cmsService.updateCompanyValue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'company-values'] });
      message.success('Değer güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Değer güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteCompanyValue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'company-values'] });
      message.success('Değer silindi');
    },
    onError: () => message.error('Değer silinemedi'),
  });

  const handleOpenModal = (record?: CompanyValueDto) => {
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
      render: (_: any, record: CompanyValueDto) => (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: record.iconColor || '#667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          {record.icon || <HeartOutlined style={{ color: '#fff' }} />}
        </div>
      ),
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <span style={{ fontWeight: 500 }}>{title}</span>,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 350,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_: any, record: CompanyValueDto) => (
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
      render: (_: any, record: CompanyValueDto) => (
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
          <h3 style={{ margin: 0 }}>Şirket Değerleri</h3>
          <p style={{ margin: 0, color: '#888' }}>Temel değerler ve prensipler</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Değer
        </Button>
      </div>

      <Table
        dataSource={values}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Değer Düzenle' : 'Yeni Değer'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Başlık" rules={[{ required: true, message: 'Başlık gerekli' }]}>
            <Input placeholder="İnovasyon, Güven, vb." />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Değer açıklaması" />
          </Form.Item>
          <Form.Item name="icon" label="İkon (emoji)">
            <Input placeholder="💡, 🤝, ⭐" />
          </Form.Item>
          <Form.Item name="iconColor" label="İkon Arkaplan Rengi">
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
    </>
  );
};

export default CompanyValuesTab;
