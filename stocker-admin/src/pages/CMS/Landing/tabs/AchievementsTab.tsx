import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, AchievementDto, CreateAchievementDto } from '../../../../services/api/cmsService';

const AchievementsTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['cms', 'achievements'],
    queryFn: () => cmsService.getAchievements(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAchievementDto) => cmsService.createAchievement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'achievements'] });
      message.success('Başarı oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Başarı oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAchievementDto }) => cmsService.updateAchievement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'achievements'] });
      message.success('Başarı güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Başarı güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteAchievement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'achievements'] });
      message.success('Başarı silindi');
    },
    onError: () => message.error('Başarı silinemedi'),
  });

  const handleOpenModal = (record?: AchievementDto) => {
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
      render: (_: any, record: AchievementDto) => (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: record.iconColor || '#f5a623',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          {record.icon || <TrophyOutlined style={{ color: '#fff' }} />}
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
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      render: (value: string) => <span style={{ fontWeight: 600, fontSize: 16 }}>{value}</span>,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_: any, record: AchievementDto) => (
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
      render: (_: any, record: AchievementDto) => (
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
          <h3 style={{ margin: 0 }}>Başarılar</h3>
          <p style={{ margin: 0, color: '#888' }}>Şirket başarıları ve ödüller</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Başarı
        </Button>
      </div>

      <Table
        dataSource={achievements}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Başarı Düzenle' : 'Yeni Başarı'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Başlık" rules={[{ required: true, message: 'Başlık gerekli' }]}>
            <Input placeholder="Yılın Girişimi" />
          </Form.Item>
          <Form.Item name="value" label="Değer" rules={[{ required: true, message: 'Değer gerekli' }]}>
            <Input placeholder="2024, #1, 100+" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={2} placeholder="Başarı açıklaması" />
          </Form.Item>
          <Form.Item name="icon" label="İkon (emoji)">
            <Input placeholder="🏆, 🎖️, ⭐" />
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

export default AchievementsTab;
