import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, DocCategoryDto, CreateDocCategoryDto } from '../../../../services/api/cmsService';

const DocCategoriesTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['cms', 'doc-categories'],
    queryFn: () => cmsService.getDocCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDocCategoryDto) => cmsService.createDocCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'doc-categories'] });
      message.success('Kategori oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Kategori oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDocCategoryDto }) => cmsService.updateDocCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'doc-categories'] });
      message.success('Kategori güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Kategori güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteDocCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'doc-categories'] });
      message.success('Kategori silindi');
    },
    onError: () => message.error('Kategori silinemedi'),
  });

  const handleOpenModal = (record?: DocCategoryDto) => {
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
      render: (_: any, record: DocCategoryDto) => (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: record.color || '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          {record.icon || <FolderOutlined style={{ color: '#fff' }} />}
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
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{slug}</code>,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Makale Sayısı',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 100,
      render: (count: number) => <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_: any, record: DocCategoryDto) => (
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
      render: (_: any, record: DocCategoryDto) => (
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
          <h3 style={{ margin: 0 }}>Dokümantasyon Kategorileri</h3>
          <p style={{ margin: 0, color: '#888' }}>Yardım merkezi kategorileri</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Kategori
        </Button>
      </div>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Kategori Düzenle' : 'Yeni Kategori'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Başlık" rules={[{ required: true, message: 'Başlık gerekli' }]}>
            <Input placeholder="Başlarken, API Referansı, vb." />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Slug gerekli' }]}>
            <Input placeholder="getting-started" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={2} placeholder="Kategori açıklaması" />
          </Form.Item>
          <Form.Item name="icon" label="İkon (emoji)">
            <Input placeholder="📚, 🚀, ⚙️" />
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
    </>
  );
};

export default DocCategoriesTab;
