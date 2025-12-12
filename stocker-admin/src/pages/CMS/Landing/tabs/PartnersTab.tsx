import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Avatar, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, LinkOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, PartnerDto, CreatePartnerDto } from '../../../../services/api/cmsService';

const PartnersTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['cms', 'partners'],
    queryFn: () => cmsService.getPartners(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePartnerDto) => cmsService.createPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'partners'] });
      message.success('Partner oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Partner oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreatePartnerDto }) => cmsService.updatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'partners'] });
      message.success('Partner güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Partner güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deletePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'partners'] });
      message.success('Partner silindi');
    },
    onError: () => message.error('Partner silinemedi'),
  });

  const handleOpenModal = (record?: PartnerDto) => {
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
      title: 'Logo',
      key: 'logo',
      width: 80,
      render: (_: any, record: PartnerDto) => (
        record.logo ? (
          <Image src={record.logo} width={60} height={40} style={{ objectFit: 'contain' }} preview={false} />
        ) : (
          <Avatar shape="square" size={40} icon={<TeamOutlined />} />
        )
      ),
    },
    {
      title: 'Partner',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: PartnerDto) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{name}</span>
          {record.url && (
            <a href={record.url} target="_blank" rel="noopener noreferrer">
              <LinkOutlined />
            </a>
          )}
        </Space>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      render: (_: any, record: PartnerDto) => (
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
      render: (_: any, record: PartnerDto) => (
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
          <h3 style={{ margin: 0 }}>Partnerler</h3>
          <p style={{ margin: 0, color: '#888' }}>İş ortakları ve markalar</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Partner
        </Button>
      </div>

      <Table
        dataSource={partners}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Partner Düzenle' : 'Yeni Partner'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Partner Adı" rules={[{ required: true, message: 'Ad gerekli' }]}>
            <Input placeholder="Şirket adı" />
          </Form.Item>
          <Form.Item name="logo" label="Logo URL (Açık tema)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="logoDark" label="Logo URL (Koyu tema)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="url" label="Website URL">
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

export default PartnersTab;
