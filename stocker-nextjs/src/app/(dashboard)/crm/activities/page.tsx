'use client';

import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Modal,
  notification,
  Statistic,
  Badge,
  Drawer,
  Descriptions,
  Tag,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  FireOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Activity } from '@/lib/api/services/crm.service';
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useCompleteActivity,
} from '@/hooks/useCRM';
import { ActivityCalendar } from '@/components/crm/activities/ActivityCalendar';
import { ActivityModal } from '@/features/activities/components';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

// Activity type configuration
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerActivity, setDrawerActivity] = useState<Activity | null>(null);

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

  const handleEventClick = (activity: Activity) => {
    setDrawerActivity(activity);
    setDrawerOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setDrawerOpen(false);
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
          setDrawerOpen(false);
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
      setDrawerOpen(false);
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

  const handleDateSelect = (start: Date, end: Date) => {
    setSelectedActivity(null);
    setModalOpen(true);
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
                    Tüm aktivitelerinizi takvimde yönetin ve takip edin
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

      {/* Main Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ActivityCalendar
          activities={activities}
          loading={isLoading}
          onEventClick={handleEventClick}
          onDateSelect={handleDateSelect}
        />
      </motion.div>

      {/* Activity Details Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            {drawerActivity && (
              <>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg"
                  style={{ background: activityConfig[drawerActivity.type].gradient }}
                >
                  {activityConfig[drawerActivity.type].icon}
                </div>
                <div>
                  <div className="font-semibold text-base">{drawerActivity.title}</div>
                  <Space size="small">
                    <Tag color={activityConfig[drawerActivity.type].color}>
                      {activityConfig[drawerActivity.type].label}
                    </Tag>
                    <Tag color={statusColors[drawerActivity.status]}>
                      {drawerActivity.status}
                    </Tag>
                  </Space>
                </div>
              </>
            )}
          </div>
        }
        placement="right"
        width={480}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        extra={
          drawerActivity && (
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(drawerActivity)}
              >
                Düzenle
              </Button>
              {drawerActivity.status === 'Scheduled' && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleComplete(drawerActivity.id)}
                >
                  Tamamla
                </Button>
              )}
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(drawerActivity.id)}
              >
                Sil
              </Button>
            </Space>
          )
        }
      >
        {drawerActivity && (
          <div className="space-y-6">
            {/* Time Information */}
            <Card size="small" className="shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <ClockCircleOutlined />
                <span className="font-semibold">Zaman</span>
              </div>
              <div className="text-base">
                {dayjs(drawerActivity.startTime).format('DD MMMM YYYY, HH:mm')}
                {drawerActivity.endTime && (
                  <span> - {dayjs(drawerActivity.endTime).format('HH:mm')}</span>
                )}
              </div>
              {dayjs(drawerActivity.startTime).isBefore(dayjs()) && drawerActivity.status === 'Scheduled' && (
                <Tag icon={<FireOutlined />} color="error" className="mt-2">
                  Gecikmiş
                </Tag>
              )}
            </Card>

            {/* Description */}
            {drawerActivity.description && (
              <Card size="small" className="shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FileTextOutlined />
                  <span className="font-semibold">Açıklama</span>
                </div>
                <Text>{drawerActivity.description}</Text>
              </Card>
            )}

            {/* Customer Information */}
            {drawerActivity.customerId && (
              <Card size="small" className="shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <UserOutlined />
                  <span className="font-semibold">Müşteri</span>
                </div>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Müşteri ID">
                    {drawerActivity.customerId}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <Divider />

            {/* Action Buttons */}
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                block
                size="large"
                icon={<EditOutlined />}
                onClick={() => handleEdit(drawerActivity)}
              >
                Aktiviteyi Düzenle
              </Button>
              {drawerActivity.status === 'Scheduled' && (
                <Button
                  block
                  size="large"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleComplete(drawerActivity.id)}
                >
                  Tamamlandı Olarak İşaretle
                </Button>
              )}
              <Button
                block
                size="large"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(drawerActivity.id)}
              >
                Aktiviteyi Sil
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

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
