import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Popconfirm, message, Tag, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LinkedinOutlined, TwitterOutlined, MailOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, TeamMemberDto, CreateTeamMemberDto } from '../../../../services/api/cmsService';

const TeamMembersTab: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['cms', 'team-members'],
    queryFn: () => cmsService.getTeamMembers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTeamMemberDto) => cmsService.createTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'team-members'] });
      message.success('Ekip üyesi oluşturuldu');
      handleCloseModal();
    },
    onError: () => message.error('Ekip üyesi oluşturulamadı'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTeamMemberDto }) => cmsService.updateTeamMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'team-members'] });
      message.success('Ekip üyesi güncellendi');
      handleCloseModal();
    },
    onError: () => message.error('Ekip üyesi güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deleteTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'team-members'] });
      message.success('Ekip üyesi silindi');
    },
    onError: () => message.error('Ekip üyesi silinemedi'),
  });

  const handleOpenModal = (record?: TeamMemberDto) => {
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
      width: 60,
      render: (avatar: string) => <Avatar src={avatar} icon={<UserOutlined />} size={48} />,
    },
    {
      title: 'Ad Soyad',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: TeamMemberDto) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.role}</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>{record.department}</div>
        </div>
      ),
    },
    {
      title: 'Bağlantılar',
      key: 'links',
      render: (_: any, record: TeamMemberDto) => (
        <Space>
          {record.email && <MailOutlined style={{ color: '#1890ff' }} />}
          {record.linkedIn && <LinkedinOutlined style={{ color: '#0077b5' }} />}
          {record.twitter && <TwitterOutlined style={{ color: '#1da1f2' }} />}
        </Space>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      render: (_: any, record: TeamMemberDto) => (
        <Space direction="vertical" size={0}>
          <Tag color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'Aktif' : 'Pasif'}</Tag>
          {record.isLeadership && <Tag color="gold">Yönetici</Tag>}
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
      render: (_: any, record: TeamMemberDto) => (
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
          <h3 style={{ margin: 0 }}>Ekip Üyeleri</h3>
          <p style={{ margin: 0, color: '#888' }}>Şirket ekip üyelerini yönetin</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Yeni Üye
        </Button>
      </div>

      <Table
        dataSource={members}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Ekip Üyesi Düzenle' : 'Yeni Ekip Üyesi'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Ad Soyad" rules={[{ required: true, message: 'Ad soyad gerekli' }]}>
            <Input placeholder="Ahmet Yılmaz" />
          </Form.Item>
          <Form.Item name="role" label="Pozisyon">
            <Input placeholder="CEO, CTO, Developer, vb." />
          </Form.Item>
          <Form.Item name="department" label="Departman">
            <Input placeholder="Yazılım, Pazarlama, vb." />
          </Form.Item>
          <Form.Item name="bio" label="Biyografi">
            <Input.TextArea rows={3} placeholder="Kısa biyografi" />
          </Form.Item>
          <Form.Item name="avatar" label="Avatar URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="email" label="E-posta">
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="linkedIn" label="LinkedIn URL">
            <Input placeholder="https://linkedin.com/in/..." />
          </Form.Item>
          <Form.Item name="twitter" label="Twitter URL">
            <Input placeholder="https://twitter.com/..." />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sıra" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Space>
            <Form.Item name="isActive" label="Aktif" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item name="isLeadership" label="Yönetici" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default TeamMembersTab;
