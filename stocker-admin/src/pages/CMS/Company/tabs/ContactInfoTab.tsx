import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, ContactInfoDto, CreateContactInfoDto } from '../../../../services/api/cmsService';

const ContactInfoTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['cms', 'contact-info'],
    queryFn: () => cmsService.getContactInfos(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateContactInfoDto) => cmsService.createContactInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'contact-info'] });
      message.success('İletişim bilgisi oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('İletişim bilgisi oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateContactInfoDto }) => cmsService.updateContactInfo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'contact-info'] });
      message.success('İletişim bilgisi güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('İletişim bilgisi güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteContactInfo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'contact-info'] });
      message.success('İletişim bilgisi silindi');
    },
    onError: () => message.error('İletişim bilgisi silinemedi'),
  });

  const handleOpenModal = (record?: ContactInfoDto) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <PhoneOutlined />;
      case 'email': return <MailOutlined />;
      case 'address': return <EnvironmentOutlined />;
      default: return <PhoneOutlined />;
    }
  };

  const columns = [
    {
      title: 'İkon',
      key: 'icon',
      width: 60,
      render: (_: any, record: ContactInfoDto) => (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: record.iconColor || '#667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          {record.icon || getTypeIcon(record.type)}
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag>{type === 'phone' ? 'Telefon' : type === 'email' ? 'E-posta' : type === 'address' ? 'Adres' : type}</Tag>
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
      render: (value: string, record: ContactInfoDto) => (
        <div>
          <div>{value}</div>
          {record.additionalInfo && <div style={{ fontSize: 12, color: '#888' }}>{record.additionalInfo}</div>}
        </div>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_: any, record: ContactInfoDto) => (
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
      render: (_: any, record: ContactInfoDto) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Silmek istediğinize emin misiniz?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const typeOptions = [
    { value: 'phone', label: 'Telefon' },
    { value: 'email', label: 'E-posta' },
    { value: 'address', label: 'Adres' },
    { value: 'fax', label: 'Faks' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>İletişim Bilgileri</h3>
          <p style={{ margin: 0, color: '#888' }}>Şirket iletişim bilgileri</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni İletişim
        </Button>
      </div>

      <Table
        dataSource={contacts}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'İletişim Düzenle' : 'Yeni İletişim'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="Tip" rules={[{ required: true, message: 'Tip gerekli' }]}>
            <Select options={typeOptions} placeholder="Tip seçin" />
          </Form.Item>
          <Form.Item name="title" label="Başlık" rules={[{ required: true, message: 'Başlık gerekli' }]}>
            <Input placeholder="Genel Müdürlük, Destek Hattı, vb." />
          </Form.Item>
          <Form.Item name="value" label="Değer" rules={[{ required: true, message: 'Değer gerekli' }]}>
            <Input placeholder="+90 212 xxx xx xx" />
          </Form.Item>
          <Form.Item name="href" label="Bağlantı (href)">
            <Input placeholder="tel:+902121234567, mailto:info@..." />
          </Form.Item>
          <Form.Item name="additionalInfo" label="Ek Bilgi">
            <Input placeholder="Pzt-Cuma 09:00-18:00" />
          </Form.Item>
          <Form.Item name="icon" label="İkon (emoji)">
            <Input placeholder="📞, 📧, 📍" />
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

export default ContactInfoTab;
