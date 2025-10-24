'use client';

import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  message,
  Badge,
  Calendar,
  List,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { Activity } from '@/lib/api/services/crm.service';
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useCompleteActivity,
} from '@/hooks/useCRM';
import { ActivitiesStats } from '@/components/crm/activities/ActivitiesStats';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Activity type icons and colors
const activityConfig: Record<
  Activity['type'],
  { icon: React.ReactNode; color: string; label: string }
> = {
  Call: { icon: <PhoneOutlined />, color: 'blue', label: 'Arama' },
  Email: { icon: <MailOutlined />, color: 'cyan', label: 'E-posta' },
  Meeting: { icon: <TeamOutlined />, color: 'green', label: 'Toplantı' },
  Task: { icon: <FileTextOutlined />, color: 'orange', label: 'Görev' },
  Note: { icon: <FileTextOutlined />, color: 'default', label: 'Not' },
};

// Status colors
const statusColors: Record<Activity['status'], string> = {
  Scheduled: 'blue',
  Completed: 'green',
  Cancelled: 'red',
};

export default function ActivitiesPage() {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [form] = Form.useForm();

  // API Hooks
  const { data, isLoading, refetch } = useActivities({});
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const completeActivity = useCompleteActivity();

  const activities = data?.items || [];

  // Calculate statistics
  const today = dayjs().format('YYYY-MM-DD');
  const stats = {
    total: activities.filter((a) => a.status === 'Scheduled').length,
    today: activities.filter((a) => dayjs(a.startTime).format('YYYY-MM-DD') === today && a.status === 'Scheduled')
      .length,
    completed: activities.filter((a) => a.status === 'Completed').length,
    overdue: activities.filter(
      (a) => dayjs(a.startTime).isBefore(dayjs()) && a.status === 'Scheduled'
    ).length,
  };

  const handleCreate = (date?: Dayjs) => {
    setSelectedActivity(null);
    form.resetFields();
    if (date) {
      form.setFieldsValue({
        startTime: date,
      });
    }
    setModalOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    form.setFieldsValue({
      ...activity,
      startTime: dayjs(activity.startTime),
      endTime: activity.endTime ? dayjs(activity.endTime) : null,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Aktiviteyi Sil',
      content: 'Bu aktiviteyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteActivity.mutateAsync(id);
          message.success('Aktivite silindi');
        } catch (error) {
          message.error('Silme işlemi başarısız');
        }
      },
    });
  };

  const handleComplete = async (id: number) => {
    try {
      await completeActivity.mutateAsync(id);
      message.success('Aktivite tamamlandı');
    } catch (error) {
      message.error('İşlem başarısız');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const activityData = {
        ...values,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime ? values.endTime.toISOString() : null,
      };

      if (selectedActivity) {
        await updateActivity.mutateAsync({ id: selectedActivity.id, data: activityData });
        message.success('Aktivite güncellendi');
      } else {
        await createActivity.mutateAsync(activityData);
        message.success('Aktivite oluşturuldu');
      }
      setModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || 'İşlem başarısız');
    }
  };

  // Get activities for a specific date
  const getActivitiesForDate = (date: Dayjs) => {
    return activities.filter((a) => dayjs(a.startTime).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'));
  };

  // Calendar cell renderer
  const dateCellRender = (value: Dayjs) => {
    const dayActivities = getActivitiesForDate(value);
    if (dayActivities.length === 0) return null;

    return (
      <ul className="events">
        {dayActivities.slice(0, 2).map((activity) => (
          <li key={activity.id}>
            <Badge
              status={activity.status === 'Completed' ? 'success' : 'processing'}
              text={
                <span className="text-xs">
                  {activityConfig[activity.type].icon} {activity.title}
                </span>
              }
            />
          </li>
        ))}
        {dayActivities.length > 2 && <li className="text-xs text-gray-500">+{dayActivities.length - 2} daha</li>}
      </ul>
    );
  };

  // Calendar View
  const CalendarView = () => (
    <Card>
      <Calendar
        cellRender={dateCellRender}
        onSelect={(date) => {
          setSelectedDate(date);
          const dayActivities = getActivitiesForDate(date);
          if (dayActivities.length > 0) {
            Modal.info({
              title: `${date.format('DD MMMM YYYY')} - Aktiviteler`,
              width: 600,
              content: (
                <List
                  dataSource={dayActivities}
                  renderItem={(activity) => (
                    <List.Item
                      actions={[
                        <Button key="edit" type="link" onClick={() => handleEdit(activity)}>
                          Düzenle
                        </Button>,
                        activity.status === 'Scheduled' && (
                          <Button key="complete" type="link" onClick={() => handleComplete(activity.id)}>
                            Tamamla
                          </Button>
                        ),
                      ]}
                    >
                      <List.Item.Meta
                        avatar={activityConfig[activity.type].icon}
                        title={
                          <Space>
                            {activity.title}
                            <Tag color={statusColors[activity.status]}>{activity.status}</Tag>
                          </Space>
                        }
                        description={
                          <>
                            <div>
                              {dayjs(activity.startTime).format('HH:mm')}
                              {activity.endTime && ` - ${dayjs(activity.endTime).format('HH:mm')}`}
                            </div>
                            {activity.description && <div>{activity.description}</div>}
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            });
          } else {
            handleCreate(date);
          }
        }}
      />
    </Card>
  );

  // List View
  const ListView = () => {
    const filteredActivities = activities.filter((activity) => {
      const searchLower = searchText.toLowerCase();
      return (
        activity.title.toLowerCase().includes(searchLower) ||
        activity.description?.toLowerCase().includes(searchLower) ||
        ''
      );
    });

    // Group by date
    const groupedActivities = filteredActivities.reduce(
      (acc, activity) => {
        const date = dayjs(activity.startTime).format('YYYY-MM-DD');
        if (!acc[date]) acc[date] = [];
        acc[date].push(activity);
        return acc;
      },
      {} as Record<string, Activity[]>
    );

    return (
      <Card>
        <div className="space-y-6">
          {Object.entries(groupedActivities)
            .sort(([a], [b]) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1))
            .map(([date, dateActivities]) => (
              <div key={date}>
                <div className="font-semibold text-lg mb-3">{dayjs(date).format('DD MMMM YYYY')}</div>
                <List
                  dataSource={dateActivities}
                  renderItem={(activity) => (
                    <List.Item
                      actions={[
                        <Button key="edit" type="link" onClick={() => handleEdit(activity)}>
                          Düzenle
                        </Button>,
                        activity.status === 'Scheduled' && (
                          <Button key="complete" type="link" onClick={() => handleComplete(activity.id)}>
                            Tamamla
                          </Button>
                        ),
                        <Button key="delete" type="link" danger onClick={() => handleDelete(activity.id)}>
                          Sil
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="text-2xl" style={{ color: activityConfig[activity.type].color }}>
                            {activityConfig[activity.type].icon}
                          </div>
                        }
                        title={
                          <Space>
                            {activity.title}
                            <Tag color={activityConfig[activity.type].color}>{activityConfig[activity.type].label}</Tag>
                            <Tag color={statusColors[activity.status]}>{activity.status}</Tag>
                          </Space>
                        }
                        description={
                          <>
                            <div>
                              {dayjs(activity.startTime).format('HH:mm')}
                              {activity.endTime && ` - ${dayjs(activity.endTime).format('HH:mm')}`}
                            </div>
                            {activity.description && <div className="mt-1">{activity.description}</div>}
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            ))}
          {Object.keys(groupedActivities).length === 0 && (
            <div className="text-center text-gray-400 py-8">Aktivite bulunamadı</div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6">
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <div className="flex justify-between items-center">
            <Title level={2} className="!mb-0">
              Aktiviteler
            </Title>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
                Yenile
              </Button>
              <Button.Group>
                <Button
                  type={viewMode === 'calendar' ? 'primary' : 'default'}
                  icon={<CalendarOutlined />}
                  onClick={() => setViewMode('calendar')}
                >
                  Takvim
                </Button>
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode('list')}
                >
                  Liste
                </Button>
              </Button.Group>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate()}>
                Yeni Aktivite
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      <div className="mb-6">
        <ActivitiesStats
          scheduled={stats.total}
          today={stats.today}
          completed={stats.completed}
          overdue={stats.overdue}
          loading={isLoading}
        />
      </div>

      {viewMode === 'list' && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col flex="auto">
            <Input
              placeholder="Aktivite ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </Col>
        </Row>
      )}

      {viewMode === 'calendar' ? <CalendarView /> : <ListView />}

      {/* Create/Edit Modal */}
      <Modal
        title={selectedActivity ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createActivity.isPending || updateActivity.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Başlık" name="title" rules={[{ required: true, message: 'Başlık gerekli' }]}>
            <Input placeholder="Aktivite başlığı" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tip" name="type" rules={[{ required: true, message: 'Tip gerekli' }]}>
                <Select>
                  {Object.entries(activityConfig).map(([key, config]) => (
                    <Select.Option key={key} value={key}>
                      <Space>
                        {config.icon}
                        {config.label}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Durum"
                name="status"
                rules={[{ required: true, message: 'Durum gerekli' }]}
                initialValue="Scheduled"
              >
                <Select>
                  <Select.Option value="Scheduled">Zamanlanmış</Select.Option>
                  <Select.Option value="Completed">Tamamlandı</Select.Option>
                  <Select.Option value="Cancelled">İptal Edildi</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Başlangıç"
                name="startTime"
                rules={[{ required: true, message: 'Başlangıç zamanı gerekli' }]}
              >
                <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Bitiş" name="endTime">
                <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Müşteri ID" name="customerId">
                <Input type="number" placeholder="Müşteri" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Lead ID" name="leadId">
                <Input type="number" placeholder="Lead" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Fırsat ID" name="dealId">
                <Input type="number" placeholder="Fırsat" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Açıklama" name="description">
            <TextArea rows={4} placeholder="Aktivite detayları..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
