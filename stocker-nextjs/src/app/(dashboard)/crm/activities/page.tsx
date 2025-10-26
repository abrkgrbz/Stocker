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
  notification,
  List,
  Avatar,
  Statistic,
  Progress,
  Badge,
  Dropdown,
  Select,
  DatePicker,
  Empty,
  Tooltip,
  Timeline,
  Divider,
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
  FilterOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  FireOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  RiseOutlined,
  FieldTimeOutlined,
  UserOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DashboardOutlined,
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
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Activity type configuration with enhanced styling
const activityConfig: Record<
  Activity['type'],
  { icon: React.ReactNode; color: string; label: string; gradient: string }
> = {
  Call: {
    icon: <PhoneOutlined />,
    color: 'blue',
    label: 'Arama',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  Email: {
    icon: <MailOutlined />,
    color: 'cyan',
    label: 'E-posta',
    gradient: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)'
  },
  Meeting: {
    icon: <TeamOutlined />,
    color: 'green',
    label: 'Toplantı',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  Task: {
    icon: <FileTextOutlined />,
    color: 'orange',
    label: 'Görev',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  Note: {
    icon: <FileTextOutlined />,
    color: 'default',
    label: 'Not',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
};

// Status colors
const statusColors: Record<Activity['status'], string> = {
  Scheduled: 'blue',
  Completed: 'green',
  Cancelled: 'red',
};

export default function ActivitiesPage() {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'timeline' | 'kanban'>('list');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

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

  // Type distribution
  const typeStats = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
          notification.success({
            message: 'Başarılı',
            description: 'Aktivite başarıyla silindi',
            placement: 'bottomRight',
          });
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Silme işlemi başarısız';
          notification.error({
            message: 'Hata',
            description: errorMessage,
            placement: 'bottomRight',
          });
        }
      },
    });
  };

  const handleComplete = async (id: number) => {
    try {
      await completeActivity.mutateAsync(id);
      notification.success({
        message: 'Başarılı',
        description: 'Aktivite tamamlandı olarak işaretlendi',
        placement: 'bottomRight',
      });
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
      notification.error({
        message: 'Hata',
        description: errorMessage,
        placement: 'bottomRight',
      });
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
        notification.success({
          message: 'Başarılı',
          description: 'Aktivite başarıyla güncellendi',
          placement: 'bottomRight',
        });
      } else {
        await createActivity.mutateAsync(activityData);
        notification.success({
          message: 'Başarılı',
          description: 'Yeni aktivite oluşturuldu',
          placement: 'bottomRight',
        });
      }
      setModalOpen(false);
    } catch (error: any) {
      const apiError = error.response?.data;
      let errorMessage = 'İşlem başarısız';

      if (apiError) {
        errorMessage = apiError.detail ||
                      apiError.errors?.[0]?.message ||
                      apiError.title ||
                      errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      notification.error({
        message: 'Hata',
        description: errorMessage,
        placement: 'bottomRight',
      });
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      activity.title.toLowerCase().includes(searchLower) ||
      activity.description?.toLowerCase().includes(searchLower) ||
      '';

    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;

    let matchesDate = true;
    if (dateRange) {
      const activityDate = dayjs(activity.startTime);
      matchesDate = activityDate.isAfter(dateRange[0].startOf('day')) &&
                   activityDate.isBefore(dateRange[1].endOf('day'));
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Calendar View
  const CalendarView = () => (
    <ActivityCalendar
      activities={filteredActivities}
      loading={isLoading}
      onEventClick={(activity) => handleEdit(activity)}
      onDateSelect={(start, end) => {
        setSelectedActivity(null);
        setModalOpen(true);
      }}
    />
  );

  // Timeline View
  const TimelineView = () => {
    const sortedActivities = [...filteredActivities].sort((a, b) =>
      dayjs(a.startTime).isAfter(dayjs(b.startTime)) ? 1 : -1
    );

    return (
      <Card className="shadow-xl">
        <Timeline mode="left">
          {sortedActivities.map((activity) => {
            const config = activityConfig[activity.type];
            const isPast = dayjs(activity.startTime).isBefore(dayjs());

            return (
              <Timeline.Item
                key={activity.id}
                color={config.color}
                dot={
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg"
                    style={{ background: config.gradient }}
                  >
                    {config.icon}
                  </div>
                }
                label={
                  <div className="font-semibold">
                    {dayjs(activity.startTime).format('DD MMM YYYY HH:mm')}
                  </div>
                }
              >
                <Card
                  size="small"
                  className="shadow-md hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handleEdit(activity)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Text strong className="text-base">{activity.title}</Text>
                        <Tag color={config.color}>{config.label}</Tag>
                        <Tag color={statusColors[activity.status]}>{activity.status}</Tag>
                      </div>
                      {activity.description && (
                        <Text type="secondary" className="text-sm">{activity.description}</Text>
                      )}
                    </div>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            icon: <EditOutlined />,
                            label: 'Düzenle',
                            onClick: () => handleEdit(activity),
                          },
                          activity.status === 'Scheduled' && {
                            key: 'complete',
                            icon: <CheckCircleOutlined />,
                            label: 'Tamamla',
                            onClick: () => handleComplete(activity.id),
                          },
                          {
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            label: 'Sil',
                            danger: true,
                            onClick: () => handleDelete(activity.id),
                          },
                        ].filter(Boolean),
                      }}
                      trigger={['click']}
                    >
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                  </div>
                </Card>
              </Timeline.Item>
            );
          })}
        </Timeline>
        {sortedActivities.length === 0 && (
          <Empty description="Aktivite bulunamadı" />
        )}
      </Card>
    );
  };

  // Kanban View
  const KanbanView = () => {
    const columns = {
      Scheduled: filteredActivities.filter(a => a.status === 'Scheduled'),
      Completed: filteredActivities.filter(a => a.status === 'Completed'),
      Cancelled: filteredActivities.filter(a => a.status === 'Cancelled'),
    };

    return (
      <Row gutter={16}>
        {Object.entries(columns).map(([status, items]) => (
          <Col span={8} key={status}>
            <Card
              title={
                <div className="flex items-center justify-between">
                  <Space>
                    <Badge
                      count={items.length}
                      style={{ backgroundColor: statusColors[status as Activity['status']] }}
                    />
                    <span>{status}</span>
                  </Space>
                </div>
              }
              className="shadow-xl"
              style={{ minHeight: '600px' }}
            >
              <div className="space-y-3">
                {items.map((activity) => {
                  const config = activityConfig[activity.type];
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card
                        size="small"
                        className="shadow-md hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => handleEdit(activity)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                              style={{ background: config.gradient }}
                            >
                              {config.icon}
                            </div>
                            <Text strong className="flex-1">{activity.title}</Text>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ClockCircleOutlined />
                            {dayjs(activity.startTime).format('DD MMM HH:mm')}
                          </div>
                          {activity.description && (
                            <Text type="secondary" className="text-xs line-clamp-2">
                              {activity.description}
                            </Text>
                          )}
                          <div className="flex justify-between items-center pt-2">
                            <Tag color={config.color} className="text-xs">{config.label}</Tag>
                            <Dropdown
                              menu={{
                                items: [
                                  {
                                    key: 'edit',
                                    icon: <EditOutlined />,
                                    label: 'Düzenle',
                                    onClick: () => handleEdit(activity),
                                  },
                                  activity.status === 'Scheduled' && {
                                    key: 'complete',
                                    icon: <CheckCircleOutlined />,
                                    label: 'Tamamla',
                                    onClick: () => handleComplete(activity.id),
                                  },
                                  {
                                    key: 'delete',
                                    icon: <DeleteOutlined />,
                                    label: 'Sil',
                                    danger: true,
                                    onClick: () => handleDelete(activity.id),
                                  },
                                ].filter(Boolean),
                              }}
                              trigger={['click']}
                            >
                              <Button type="text" size="small" icon={<MoreOutlined />} />
                            </Dropdown>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
                {items.length === 0 && (
                  <Empty description="Aktivite yok" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // List View
  const ListView = () => {
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
      <Card className="shadow-xl">
        <div className="space-y-6">
          {Object.entries(groupedActivities)
            .sort(([a], [b]) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1))
            .map(([date, dateActivities]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="font-bold text-lg text-gray-700">
                    {dayjs(date).format('DD MMMM YYYY')}
                  </div>
                  <div className="text-sm text-gray-400">
                    {dayjs(date).format('dddd')}
                  </div>
                  <Badge count={dateActivities.length} style={{ backgroundColor: '#52c41a' }} />
                </div>
                <List
                  dataSource={dateActivities}
                  renderItem={(activity) => {
                    const config = activityConfig[activity.type];
                    const isOverdue = dayjs(activity.startTime).isBefore(dayjs()) && activity.status === 'Scheduled';

                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <List.Item
                          className={`hover:bg-gray-50 transition-all rounded-lg px-4 ${isOverdue ? 'border-l-4 border-red-500' : ''}`}
                          actions={[
                            <Button
                              key="edit"
                              type="link"
                              icon={<EditOutlined />}
                              onClick={() => handleEdit(activity)}
                            >
                              Düzenle
                            </Button>,
                            activity.status === 'Scheduled' && (
                              <Button
                                key="complete"
                                type="link"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleComplete(activity.id)}
                                className="text-green-600"
                              >
                                Tamamla
                              </Button>
                            ),
                            <Button
                              key="delete"
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(activity.id)}
                            >
                              Sil
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg"
                                style={{ background: config.gradient }}
                              >
                                {config.icon}
                              </div>
                            }
                            title={
                              <div className="flex items-center gap-2">
                                <Text strong className="text-base">{activity.title}</Text>
                                <Tag color={config.color}>{config.label}</Tag>
                                <Tag color={statusColors[activity.status]}>{activity.status}</Tag>
                                {isOverdue && (
                                  <Tag icon={<FireOutlined />} color="error">
                                    Gecikmiş
                                  </Tag>
                                )}
                              </div>
                            }
                            description={
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <ClockCircleOutlined />
                                  {dayjs(activity.startTime).format('HH:mm')}
                                  {activity.endTime && ` - ${dayjs(activity.endTime).format('HH:mm')}`}
                                </div>
                                {activity.description && (
                                  <div className="text-gray-500">{activity.description}</div>
                                )}
                              </div>
                            }
                          />
                        </List.Item>
                      </motion.div>
                    );
                  }}
                />
              </div>
            ))}
          {Object.keys(groupedActivities).length === 0 && (
            <Empty
              description="Aktivite bulunamadı"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Premium Header with Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl mb-6 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Decorative Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 80%, white 2px, transparent 2px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative p-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl shadow-lg">
                  <CalendarOutlined />
                </div>
                <div>
                  <Title level={2} className="!mb-0 !text-white">
                    Aktiviteler
                  </Title>
                  <Text className="text-white/80">
                    Tüm aktivitelerinizi yönetin ve takip edin
                  </Text>
                </div>
              </div>
            </div>
            <Space size="large">
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isLoading}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                Yenile
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => handleCreate()}
                className="bg-white text-purple-600 border-0 shadow-lg hover:scale-105 transition-transform"
              >
                Yeni Aktivite
              </Button>
            </Space>
          </div>
        </div>
      </motion.div>

      {/* Premium Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className="shadow-xl border-0 h-full overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <Statistic
                title={<span className="text-white flex items-center gap-2 text-base font-semibold"><CalendarOutlined /> Planlanmış</span>}
                value={stats.total}
                valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '2rem' }}
                prefix={<Badge status="processing" />}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              className="shadow-xl border-0 h-full overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
            >
              <Statistic
                title={<span className="text-white flex items-center gap-2 text-base font-semibold"><ThunderboltOutlined /> Bugün</span>}
                value={stats.today}
                valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '2rem' }}
                prefix={<Badge status="warning" />}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="shadow-xl border-0 h-full overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}
            >
              <Statistic
                title={<span className="text-white flex items-center gap-2 text-base font-semibold"><TrophyOutlined /> Tamamlandı</span>}
                value={stats.completed}
                valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '2rem' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              className="shadow-xl border-0 h-full overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}
            >
              <Statistic
                title={<span className="text-white flex items-center gap-2 text-base font-semibold"><FireOutlined /> Gecikmiş</span>}
                value={stats.overdue}
                valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '2rem' }}
                prefix={<Badge status="error" />}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Filters and View Switcher */}
      <Card className="mb-6 shadow-xl">
        <Row gutter={16} align="middle">
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
          <Col>
            <Select
              placeholder="Tür"
              style={{ width: 140 }}
              size="large"
              value={filterType}
              onChange={setFilterType}
              options={[
                { label: 'Tümü', value: 'all' },
                ...Object.entries(activityConfig).map(([type, config]) => ({
                  label: config.label,
                  value: type,
                })),
              ]}
            />
          </Col>
          <Col>
            <Select
              placeholder="Durum"
              style={{ width: 140 }}
              size="large"
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { label: 'Tümü', value: 'all' },
                { label: 'Planlanmış', value: 'Scheduled' },
                { label: 'Tamamlandı', value: 'Completed' },
                { label: 'İptal', value: 'Cancelled' },
              ]}
            />
          </Col>
          <Col>
            <RangePicker
              size="large"
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col>
            <Button.Group size="large">
              <Tooltip title="Liste Görünümü">
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  icon={<BarsOutlined />}
                  onClick={() => setViewMode('list')}
                />
              </Tooltip>
              <Tooltip title="Takvim Görünümü">
                <Button
                  type={viewMode === 'calendar' ? 'primary' : 'default'}
                  icon={<CalendarOutlined />}
                  onClick={() => setViewMode('calendar')}
                />
              </Tooltip>
              <Tooltip title="Zaman Çizelgesi">
                <Button
                  type={viewMode === 'timeline' ? 'primary' : 'default'}
                  icon={<FieldTimeOutlined />}
                  onClick={() => setViewMode('timeline')}
                />
              </Tooltip>
              <Tooltip title="Kanban Panosu">
                <Button
                  type={viewMode === 'kanban' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('kanban')}
                />
              </Tooltip>
            </Button.Group>
          </Col>
        </Row>
      </Card>

      {/* View Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'calendar' && <CalendarView />}
          {viewMode === 'list' && <ListView />}
          {viewMode === 'timeline' && <TimelineView />}
          {viewMode === 'kanban' && <KanbanView />}
        </motion.div>
      </AnimatePresence>

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
