import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, StatDto, CreateStatDto } from '../../../../services/api/cmsService';

const StatsTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['cms', 'stats'],
    queryFn: () => cmsService.getStats(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateStatDto) => cmsService.createStat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'stats'] });
      message.success('İstatistik oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('İstatistik oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateStatDto }) => cmsService.updateStat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'stats'] });
      message.success('İstatistik güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('İstatistik güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteStat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'stats'] });
      message.success('İstatistik silindi');
    },
    onError: () => message.error('İstatistik silinemedi'),
  });

  const handleOpenModal = (record?: StatDto) => {
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
      render: (icon: string) => (
        <div style={{ fontSize: 24 }}>
          {icon || '📊'}
        </div>
      ),
    },
    {
      title: 'Etiket',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Değer',
      key: 'value',
      render: (_: any, record: StatDto) => (
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          {record.prefix}{record.value}{record.suffix}
        </span>
      ),
    },
    {
      title: 'Bölüm',
      dataIndex: 'section',
      key: 'section',
      render: (section: string) => section && <Tag>{section}</Tag>,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_: any, record: StatDto) => (
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
      render: (_: any, record: StatDto) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Silmek istediğinize emin misiniz?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const sectionOptions = [
    { value: 'hero', label: 'Ana Banner' },
    { value: 'about', label: 'Hakkımızda' },
    { value: 'features', label: 'Özellikler' },
    { value: 'footer', label: 'Footer' },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>İstatistikler</h3>
          <p style={{ margin: 0, color: '#888' }}>Sayısal göstergeler ve metrikler</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni İstatistik
        </Button>
      </div>

      <Table
        dataSource={stats}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'İstatistik Düzenle' : 'Yeni İstatistik'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="label" label="Etiket" rules={[{ required: true, message: 'Etiket gerekli' }]}>
            <Input placeholder="Mutlu Müşteri" />
          </Form.Item>
          <Form.Item name="value" label="Değer" rules={[{ required: true, message: 'Değer gerekli' }]}>
            <Input placeholder="1000" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="prefix" label="Ön Ek">
              <Input placeholder="₺, $" style={{ width: 80 }} />
            </Form.Item>
            <Form.Item name="suffix" label="Son Ek">
              <Input placeholder="+, %, K" style={{ width: 80 }} />
            </Form.Item>
          </Space>
          <Form.Item name="icon" label="İkon (emoji)">
            <Input placeholder="👥, 📦, 💰" />
          </Form.Item>
          <Form.Item name="section" label="Bölüm">
            <Select options={sectionOptions} placeholder="Bölüm seçin" allowClear />
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

export default StatsTab;
