import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Rate, Popconfirm, message, Tag, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, TestimonialDto, CreateTestimonialDto } from '../../../../services/api/cmsService';

const TestimonialsTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['cms', 'testimonials'],
    queryFn: () => cmsService.getTestimonials(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTestimonialDto) => cmsService.createTestimonial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'testimonials'] });
      message.success('Referans oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Referans oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTestimonialDto }) => cmsService.updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'testimonials'] });
      message.success('Referans güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Referans güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'testimonials'] });
      message.success('Referans silindi');
    },
    onError: () => message.error('Referans silinemedi'),
  });

  const handleOpenModal = (record?: TestimonialDto) => {
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
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 50,
      render: (avatar: string) => <Avatar src={avatar} icon={<UserOutlined />} size="small" />,
    },
    {
      title: 'Ad Soyad',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string, record: TestimonialDto) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{name}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{record.role} - {record.company}</div>
        </div>
      ),
    },
    {
      title: 'Yorum',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'Puan',
      dataIndex: 'rating',
      key: 'rating',
      width: 130,
      render: (rating: number) => <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      render: (_: any, record: TestimonialDto) => (
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
      render: (_: any, record: TestimonialDto) => (
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
          <h3 style={{ margin: 0 }}>Müşteri Referansları</h3>
          <p style={{ margin: 0, color: '#888' }}>Müşteri yorumları ve değerlendirmeleri</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Referans
        </Button>
      </div>

      <Table
        dataSource={testimonials}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Referans Düzenle' : 'Yeni Referans'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Ad Soyad" rules={[{ required: true, message: 'Ad soyad gerekli' }]}>
            <Input placeholder="Müşteri adı" />
          </Form.Item>
          <Form.Item name="role" label="Pozisyon">
            <Input placeholder="CEO, CTO, vb." />
          </Form.Item>
          <Form.Item name="company" label="Şirket">
            <Input placeholder="Şirket adı" />
          </Form.Item>
          <Form.Item name="content" label="Yorum" rules={[{ required: true, message: 'Yorum gerekli' }]}>
            <Input.TextArea rows={4} placeholder="Müşteri yorumu" />
          </Form.Item>
          <Form.Item name="rating" label="Puan" initialValue={5}>
            <Rate />
          </Form.Item>
          <Form.Item name="avatar" label="Avatar URL">
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

export default TestimonialsTab;
