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
  Modal,
  message,
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
import { ActivityCalendar } from '@/components/crm/activities/ActivityCalendar';
import { ActivityModal } from '@/features/activities/components';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

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
    setModalOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
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
    } catch (error: any) {
      message.error(error?.message || 'İşlem başarısız');
    }
  };


  // Calendar View with modern FullCalendar
  const CalendarView = () => (
    <ActivityCalendar
      activities={activities}
      loading={isLoading}
      onEventClick={(activity) => handleEdit(activity)}
      onDateSelect={(start, end) => {
        // When user selects a date range, create new activity
        setSelectedActivity(null);
        setModalOpen(true);
      }}
    />
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
      <ActivityModal
        open={modalOpen}
        activity={selectedActivity}
        loading={createActivity.isPending || updateActivity.isPending}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
