import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Select, DatePicker, message, Drawer, Form, TimePicker, Row, Col, Calendar, Badge, Avatar, Timeline, Tabs, List } from 'antd';
import { PlusOutlined, SearchOutlined, PhoneOutlined, MailOutlined, TeamOutlined, CalendarOutlined, ClockCircleOutlined, UserOutlined, CheckCircleOutlined, VideoCameraOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { BadgeProps } from 'antd';
import dayjs from 'dayjs';

interface Activity {
  id: number;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  subject: string;
  description: string;
  status: 'planned' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  startTime: string;
  duration: number;
  relatedTo: string;
  relatedType: 'lead' | 'customer' | 'opportunity' | 'deal';
  assignedTo: string;
  createdBy: string;
  createdDate: string;
  completedDate?: string;
  outcome?: string;
}

const mockActivities: Activity[] = [
  {
    id: 1,
    type: 'call',
    subject: 'Ürün Demo Görüşmesi',
    description: 'CRM modülü demo sunumu yapılacak',
    status: 'planned',
    priority: 'high',
    startDate: '2024-01-29',
    startTime: '14:00',
    duration: 60,
    relatedTo: 'ABC Teknoloji',
    relatedType: 'customer',
    assignedTo: 'Ahmet Yılmaz',
    createdBy: 'Admin',
    createdDate: '2024-01-25',
  },
  {
    id: 2,
    type: 'email',
    subject: 'Teklif Gönderimi',
    description: 'Revize edilmiş teklif gönderilecek',
    status: 'completed',
    priority: 'medium',
    startDate: '2024-01-28',
    startTime: '10:00',
    duration: 30,
    relatedTo: 'XYZ Holding',
    relatedType: 'opportunity',
    assignedTo: 'Mehmet Demir',
    createdBy: 'Admin',
    createdDate: '2024-01-24',
    completedDate: '2024-01-28',
    outcome: 'Teklif başarıyla gönderildi',
  },
  {
    id: 3,
    type: 'meeting',
    subject: 'Sözleşme Müzakeresi',
    description: 'Final sözleşme şartlarının görüşülmesi',
    status: 'planned',
    priority: 'high',
    startDate: '2024-01-30',
    startTime: '15:30',
    duration: 90,
    relatedTo: 'Mega AŞ',
    relatedType: 'deal',
    assignedTo: 'Ayşe Kaya',
    createdBy: 'Admin',
    createdDate: '2024-01-26',
  },
];

const activityTypes = [
  { value: 'call', label: 'Arama', icon: <PhoneOutlined />, color: 'blue' },
  { value: 'email', label: 'E-posta', icon: <MailOutlined />, color: 'green' },
  { value: 'meeting', label: 'Toplantı', icon: <TeamOutlined />, color: 'purple' },
  { value: 'task', label: 'Görev', icon: <CheckCircleOutlined />, color: 'orange' },
  { value: 'note', label: 'Not', icon: <FileTextOutlined />, color: 'gray' },
];

const priorityOptions = [
  { value: 'low', label: 'Düşük', color: 'default' },
  { value: 'medium', label: 'Orta', color: 'warning' },
  { value: 'high', label: 'Yüksek', color: 'error' },
];

const statusOptions = [
  { value: 'planned', label: 'Planlandı', color: 'blue' },
  { value: 'completed', label: 'Tamamlandı', color: 'green' },
  { value: 'cancelled', label: 'İptal Edildi', color: 'red' },
];

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'timeline'>('table');
  const [form] = Form.useForm();

  const columns: ColumnsType<Activity> = [
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => {
        const activityType = activityTypes.find(t => t.value === type);
        return (
          <Tag icon={activityType?.icon} color={activityType?.color}>
            {activityType?.label}
          </Tag>
        );
      },
    },
    {
      title: 'Konu',
      dataIndex: 'subject',
      key: 'subject',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <strong>{text}</strong>
          <small style={{ color: '#8c8c8c' }}>{record.relatedTo}</small>
        </Space>
      ),
    },
    {
      title: 'Tarih & Saat',
      key: 'datetime',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{dayjs(record.startDate).format('DD.MM.YYYY')}</span>
          <small style={{ color: '#8c8c8c' }}>{record.startTime}</small>
        </Space>
      ),
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => {
        const priorityOption = priorityOptions.find(p => p.value === priority);
        return <Tag color={priorityOption?.color}>{priorityOption?.label}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusOption = statusOptions.find(s => s.value === status);
        return <Tag color={statusOption?.color}>{statusOption?.label}</Tag>;
      },
    },
    {
      title: 'Atanan',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (name) => (
        <Space size={4}>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {name?.[0]}
          </Avatar>
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            onClick={() => handleEdit(record)}
          >
            Düzenle
          </Button>
          <Button
            type="text"
            danger
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    form.setFieldsValue({
      ...activity,
      startDate: dayjs(activity.startDate),
      startTime: dayjs(activity.startTime, 'HH:mm'),
    });
    setDrawerVisible(true);
  };

  const handleDelete = (id: number) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    message.success('Aktivite silindi');
  };

  const handleSubmit = (values: any) => {
    const formData = {
      ...values,
      startDate: values.startDate.format('YYYY-MM-DD'),
      startTime: values.startTime.format('HH:mm'),
    };

    if (editingActivity) {
      setActivities(prev => 
        prev.map(a => a.id === editingActivity.id ? { ...a, ...formData } : a)
      );
      message.success('Aktivite güncellendi');
    } else {
      const newActivity = {
        ...formData,
        id: activities.length + 1,
        createdDate: dayjs().format('YYYY-MM-DD'),
        createdBy: 'Current User',
      };
      setActivities(prev => [...prev, newActivity]);
      message.success('Yeni aktivite eklendi');
    }

    setDrawerVisible(false);
    form.resetFields();
    setEditingActivity(null);
  };

  const filteredData = activities.filter(a => {
    const matchesSearch = a.subject.toLowerCase().includes(searchText.toLowerCase()) ||
                         a.relatedTo.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = !filterType || a.type === filterType;
    const matchesStatus = !filterStatus || a.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const todayActivities = filteredData.filter(a => 
    dayjs(a.startDate).isSame(dayjs(), 'day')
  );

  const upcomingActivities = filteredData.filter(a => 
    dayjs(a.startDate).isAfter(dayjs(), 'day')
  );

  const getListData = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayActivities = activities.filter(a => a.startDate === dateStr);
    
    return dayActivities.map(activity => {
      const type = activityTypes.find(t => t.value === activity.type);
      return {
        type: type?.color as BadgeProps['status'],
        content: `${activity.startTime} - ${activity.subject}`,
      };
    });
  };

  const dateCellRender = (value: dayjs.Dayjs) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Aktiviteler"
        extra={
          <Space>
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 120 }}
            >
              <Select.Option value="table">Tablo</Select.Option>
              <Select.Option value="calendar">Takvim</Select.Option>
              <Select.Option value="timeline">Zaman Çizelgesi</Select.Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingActivity(null);
                form.resetFields();
                setDrawerVisible(true);
              }}
            >
              Yeni Aktivite
            </Button>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bugünkü Aktiviteler</span>
                    <Tag color="blue">{todayActivities.length}</Tag>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Yaklaşan Aktiviteler</span>
                    <Tag color="orange">{upcomingActivities.length}</Tag>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tamamlanan (Bu Hafta)</span>
                    <Tag color="green">
                      {activities.filter(a => a.status === 'completed').length}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {viewMode === 'table' && (
            <>
              <Space>
                <Input
                  placeholder="Ara..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Select
                  placeholder="Tür"
                  allowClear
                  style={{ width: 150 }}
                  value={filterType}
                  onChange={setFilterType}
                >
                  {activityTypes.map(type => (
                    <Select.Option key={type.value} value={type.value}>
                      <Space>
                        {type.icon}
                        {type.label}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  placeholder="Durum"
                  allowClear
                  style={{ width: 150 }}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={statusOptions}
                />
              </Space>
            </>
          )}
        </Space>

        {viewMode === 'table' && (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Toplam ${total} aktivite`,
            }}
          />
        )}

        {viewMode === 'calendar' && (
          <Calendar cellRender={dateCellRender} />
        )}

        {viewMode === 'timeline' && (
          <Timeline mode="left" style={{ marginTop: 24 }}>
            {filteredData.map(activity => {
              const type = activityTypes.find(t => t.value === activity.type);
              const status = statusOptions.find(s => s.value === activity.status);
              return (
                <Timeline.Item
                  key={activity.id}
                  label={`${dayjs(activity.startDate).format('DD MMM')} ${activity.startTime}`}
                  color={status?.color}
                  dot={type?.icon}
                >
                  <Card size="small">
                    <Space direction="vertical">
                      <strong>{activity.subject}</strong>
                      <span>{activity.description}</span>
                      <Space>
                        <Tag>{activity.relatedTo}</Tag>
                        <Tag icon={<UserOutlined />}>{activity.assignedTo}</Tag>
                      </Space>
                    </Space>
                  </Card>
                </Timeline.Item>
              );
            })}
          </Timeline>
        )}
      </Card>

      <Drawer
        title={editingActivity ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite'}
        width={600}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setEditingActivity(null);
        }}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setDrawerVisible(false)}>İptal</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingActivity ? 'Güncelle' : 'Ekle'}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="type"
            label="Aktivite Türü"
            rules={[{ required: true, message: 'Aktivite türü gerekli' }]}
          >
            <Select>
              {activityTypes.map(type => (
                <Select.Option key={type.value} value={type.value}>
                  <Space>
                    {type.icon}
                    {type.label}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Konu"
            rules={[{ required: true, message: 'Konu gerekli' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Tarih"
                rules={[{ required: true, message: 'Tarih gerekli' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Saat"
                rules={[{ required: true, message: 'Saat gerekli' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Süre (dakika)"
                rules={[{ required: true, message: 'Süre gerekli' }]}
              >
                <Select>
                  <Select.Option value={15}>15 dakika</Select.Option>
                  <Select.Option value={30}>30 dakika</Select.Option>
                  <Select.Option value={45}>45 dakika</Select.Option>
                  <Select.Option value={60}>1 saat</Select.Option>
                  <Select.Option value={90}>1.5 saat</Select.Option>
                  <Select.Option value={120}>2 saat</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Öncelik"
                rules={[{ required: true, message: 'Öncelik gerekli' }]}
              >
                <Select options={priorityOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="relatedTo"
                label="İlişkili"
                rules={[{ required: true, message: 'İlişkili kayıt gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="relatedType"
                label="İlişki Türü"
                rules={[{ required: true, message: 'İlişki türü gerekli' }]}
              >
                <Select>
                  <Select.Option value="lead">Potansiyel</Select.Option>
                  <Select.Option value="customer">Müşteri</Select.Option>
                  <Select.Option value="opportunity">Fırsat</Select.Option>
                  <Select.Option value="deal">Anlaşma</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignedTo"
                label="Atanan Kişi"
                rules={[{ required: true, message: 'Atanan kişi gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Durum"
                rules={[{ required: true, message: 'Durum gerekli' }]}
              >
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>

          {editingActivity?.status === 'completed' && (
            <Form.Item
              name="outcome"
              label="Sonuç"
            >
              <Input.TextArea rows={3} placeholder="Aktivite sonucu hakkında notlar..." />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </div>
  );
};