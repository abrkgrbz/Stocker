import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Select, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, DocArticleDto, CreateDocArticleDto } from '../../../../services/api/cmsService';

const DocArticlesTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['cms', 'doc-categories'],
    queryFn: () => cmsService.getDocCategories(),
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['cms', 'doc-articles', selectedCategory],
    queryFn: () => cmsService.getDocArticles(selectedCategory),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDocArticleDto) => cmsService.createDocArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'doc-articles'] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'doc-categories'] });
      message.success('Makale oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Makale oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDocArticleDto }) => cmsService.updateDocArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'doc-articles'] });
      message.success('Makale güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Makale güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteDocArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'doc-articles'] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'doc-categories'] });
      message.success('Makale silindi');
    },
    onError: () => message.error('Makale silinemedi'),
  });

  const handleOpenModal = (record?: DocArticleDto) => {
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
      width: 50,
      render: (_: any, record: DocArticleDto) => (
        <span style={{ fontSize: 20 }}>
          {record.icon || <FileTextOutlined />}
        </span>
      ),
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: DocArticleDto) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{title}</span>
          {record.isPopular && <StarOutlined style={{ color: '#faad14' }} />}
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{slug}</code>,
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryTitle',
      key: 'categoryTitle',
      render: (title: string) => title && <Tag>{title}</Tag>,
    },
    {
      title: 'Görüntülenme',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      render: (count: number) => (
        <Space>
          <EyeOutlined style={{ color: '#888' }} />
          <span>{count?.toLocaleString() || 0}</span>
        </Space>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_: any, record: DocArticleDto) => (
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
      render: (_: any, record: DocArticleDto) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Silmek istediğinize emin misiniz?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.title,
  }));

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>Dokümantasyon Makaleleri</h3>
          <p style={{ margin: 0, color: '#888' }}>Yardım merkezi içerikleri</p>
        </div>
        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="Kategoriye göre filtrele"
            allowClear
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Yeni Makale
          </Button>
        </Space>
      </div>

      <Table
        dataSource={articles}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Makale Düzenle' : 'Yeni Makale'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="categoryId" label="Kategori" rules={[{ required: true, message: 'Kategori gerekli' }]}>
            <Select options={categoryOptions} placeholder="Kategori seçin" />
          </Form.Item>
          <Form.Item name="title" label="Başlık" rules={[{ required: true, message: 'Başlık gerekli' }]}>
            <Input placeholder="Makale başlığı" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Slug gerekli' }]}>
            <Input placeholder="makale-basligi" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={2} placeholder="Kısa açıklama" />
          </Form.Item>
          <Form.Item name="content" label="İçerik">
            <Input.TextArea rows={8} placeholder="Makale içeriği (Markdown desteklenir)" />
          </Form.Item>
          <Form.Item name="icon" label="İkon (emoji)">
            <Input placeholder="📝, 🔧, 💡" />
          </Form.Item>
          <Form.Item name="metaTitle" label="Meta Başlık">
            <Input placeholder="SEO başlık" />
          </Form.Item>
          <Form.Item name="metaDescription" label="Meta Açıklama">
            <Input.TextArea rows={2} placeholder="SEO açıklaması" />
          </Form.Item>
          <Space size="large">
            <Form.Item name="sortOrder" label="Sıra" initialValue={0}>
              <InputNumber min={0} style={{ width: 100 }} />
            </Form.Item>
            <Form.Item name="isActive" label="Aktif" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item name="isPopular" label="Popüler" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default DocArticlesTab;
