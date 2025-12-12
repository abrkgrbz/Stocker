import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Select } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  FacebookOutlined, TwitterOutlined, InstagramOutlined,
  LinkedinOutlined, YoutubeOutlined, GithubOutlined, GlobalOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, SocialLinkDto, CreateSocialLinkDto } from '../../../../services/api/cmsService';

const SocialLinksTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['cms', 'social-links'],
    queryFn: () => cmsService.getSocialLinks(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSocialLinkDto) => cmsService.createSocialLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'social-links'] });
      message.success('Sosyal medya bağlantısı oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Sosyal medya bağlantısı oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateSocialLinkDto }) => cmsService.updateSocialLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'social-links'] });
      message.success('Sosyal medya bağlantısı güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Sosyal medya bağlantısı güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteSocialLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'social-links'] });
      message.success('Sosyal medya bağlantısı silindi');
    },
    onError: () => message.error('Sosyal medya bağlantısı silinemedi'),
  });

  const handleOpenModal = (record?: SocialLinkDto) => {
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

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, React.ReactNode> = {
      facebook: <FacebookOutlined style={{ color: '#1877f2' }} />,
      twitter: <TwitterOutlined style={{ color: '#1da1f2' }} />,
      instagram: <InstagramOutlined style={{ color: '#e4405f' }} />,
      linkedin: <LinkedinOutlined style={{ color: '#0077b5' }} />,
      youtube: <YoutubeOutlined style={{ color: '#ff0000' }} />,
      github: <GithubOutlined style={{ color: '#333' }} />,
    };
    return icons[platform.toLowerCase()] || <GlobalOutlined />;
  };

  const columns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => (
        <Space>
          <span style={{ fontSize: 20 }}>{getPlatformIcon(platform)}</span>
          <span style={{ fontWeight: 500 }}>{platform}</span>
        </Space>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
      ),
    },
    {
      title: 'Etiket',
      dataIndex: 'label',
      key: 'label',
      render: (label: string) => label && <Tag>{label}</Tag>,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 80,
      render: (_: any, record: SocialLinkDto) => (
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
      render: (_: any, record: SocialLinkDto) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Silmek istediğinize emin misiniz?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const platformOptions = [
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Twitter', label: 'Twitter / X' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'YouTube', label: 'YouTube' },
    { value: 'GitHub', label: 'GitHub' },
    { value: 'TikTok', label: 'TikTok' },
    { value: 'Discord', label: 'Discord' },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>Sosyal Medya Bağlantıları</h3>
          <p style={{ margin: 0, color: '#888' }}>Şirket sosyal medya hesapları</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Bağlantı
        </Button>
      </div>

      <Table
        dataSource={links}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Bağlantı Düzenle' : 'Yeni Bağlantı'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="platform" label="Platform" rules={[{ required: true, message: 'Platform gerekli' }]}>
            <Select options={platformOptions} placeholder="Platform seçin" />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true, message: 'URL gerekli' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="label" label="Etiket">
            <Input placeholder="Bizi takip edin, vb." />
          </Form.Item>
          <Form.Item name="icon" label="Özel İkon (emoji)">
            <Input placeholder="Varsayılan platform ikonu kullanılır" />
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

export default SocialLinksTab;
