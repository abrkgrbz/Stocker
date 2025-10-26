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
  Form,
  Input,
  DatePicker,
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
  CloseCircleOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import type { Activity } from '@/lib/api/services/crm.service';
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useCompleteActivity,
  useCancelActivity,
  useRescheduleActivity,
  useActivityStatistics,
} from '@/lib/api/hooks/useCRM';
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
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // API Hooks
  const { data, isLoading, refetch } = useActivities({});
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const completeActivity = useCompleteActivity();
  const cancelActivity = useCancelActivity();
  const rescheduleActivity = useRescheduleActivity();

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
      await completeActivity.mutateAsync({ id: id.toString() });
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

  const handleCancel = (activity: Activity) => {
    setCancelModalOpen(true);
  };

  const handleCancelSubmit = async (values: { reason?: string }) => {
    if (!drawerActivity) return;
    
    try {
      await cancelActivity.mutateAsync({ 
        id: drawerActivity.id.toString(), 
        reason: values.reason 
      });
      notification.success({
        message: 'Başarılı',
        description: 'Aktivite iptal edildi',
        placement: 'bottomRight',
      });
      setCancelModalOpen(false);
      setDrawerOpen(false);
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İptal işlemi başarısız';
      notification.error({
        message: 'Hata',
        description: errorMessage,
        placement: 'bottomRight',
      });
    }
  };

  const handleReschedule = (activity: Activity) => {
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (values: { startTime: Dayjs; endTime?: Dayjs; reason?: string }) => {
    if (!drawerActivity) return;
    
    try {
      await rescheduleActivity.mutateAsync({
        id: drawerActivity.id.toString(),
        newStartDate: values.startTime.toISOString(),
        newEndDate: values.endTime?.toISOString(),
        reason: values.reason,
      });
      notification.success({
        message: 'Başarılı',
        description: 'Aktivite yeniden planlandı',
        placement: 'bottomRight',
      });
      setRescheduleModalOpen(false);
      setDrawerOpen(false);
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Yeniden planlama başarısız';
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
    <div className="p-6">
      {/* Modern Minimalist Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-2 !text-gray-800">
              Aktiviteler
            </Title>
            <Text className="text-gray-500 text-base">
              Tüm aktivitelerinizi takvimde yönetin ve takip edin
            </Text>
          </div>
          <Space size="middle">
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
              className="border-gray-300 hover:border-blue-500 hover:text-blue-500"
            >
              Yenile
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => handleCreate()}
              className="shadow-sm"
            >
              Yeni Aktivite
            </Button>
          </Space>
        </div>
      </motion.div>

      {/* Professional Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-gray-500 text-sm block mb-1">Planlanmış</Text>
                  <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CalendarOutlined className="text-2xl text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-gray-500 text-sm block mb-1">Bugün</Text>
                  <div className="text-3xl font-bold text-gray-800">{stats.today}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <ThunderboltOutlined className="text-2xl text-orange-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-gray-500 text-sm block mb-1">Tamamlandı</Text>
                  <div className="text-3xl font-bold text-gray-800">{stats.completed}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircleOutlined className="text-2xl text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-gray-500 text-sm block mb-1">Gecikmiş</Text>
                  <div className="text-3xl font-bold text-gray-800">{stats.overdue}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <FireOutlined className="text-2xl text-red-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Calendar Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-sm border border-gray-200">
          <ActivityCalendar
            activities={activities}
            loading={isLoading}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
          />
        </Card>
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
        styles={{
          mask: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
          },
        }}
        extra={
          drawerActivity && (
            <Space wrap>
              {drawerActivity.status === 'Scheduled' && (
                <>
                  <Button
                    icon={<FieldTimeOutlined />}
                    onClick={() => handleReschedule(drawerActivity)}
                  >
                    Yeniden Planla
                  </Button>
                  <Button
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleCancel(drawerActivity)}
                  >
                    İptal Et
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleComplete(drawerActivity.id)}
                  >
                    Tamamla
                  </Button>
                </>
              )}
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(drawerActivity)}
              >
                Düzenle
              </Button>
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
              {drawerActivity.status === 'Scheduled' && (
                <>
                  <Button
                    block
                    size="large"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleComplete(drawerActivity.id)}
                  >
                    Tamamlandı Olarak İşaretle
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<FieldTimeOutlined />}
                    onClick={() => handleReschedule(drawerActivity)}
                  >
                    Aktiviteyi Yeniden Planla
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleCancel(drawerActivity)}
                  >
                    Aktiviteyi İptal Et
                  </Button>
                </>
              )}
              <Button
                block
                size="large"
                icon={<EditOutlined />}
                onClick={() => handleEdit(drawerActivity)}
              >
                Aktiviteyi Düzenle
              </Button>
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

      {/* Reschedule Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FieldTimeOutlined className="text-blue-600" />
            <span>Aktiviteyi Yeniden Planla</span>
          </div>
        }
        open={rescheduleModalOpen}
        onCancel={() => setRescheduleModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          onFinish={handleRescheduleSubmit}
          initialValues={{
            startTime: drawerActivity ? dayjs(drawerActivity.startTime) : undefined,
            endTime: drawerActivity?.endTime ? dayjs(drawerActivity.endTime) : undefined,
          }}
        >
          <Form.Item
            label="Yeni Başlangıç Zamanı"
            name="startTime"
            rules={[{ required: true, message: 'Başlangıç zamanı gerekli' }]}
          >
            <DatePicker
              showTime
              format="DD.MM.YYYY HH:mm"
              className="w-full"
              placeholder="Başlangıç zamanı seçin"
            />
          </Form.Item>
          <Form.Item
            label="Yeni Bitiş Zamanı (Opsiyonel)"
            name="endTime"
          >
            <DatePicker
              showTime
              format="DD.MM.YYYY HH:mm"
              className="w-full"
              placeholder="Bitiş zamanı seçin"
            />
          </Form.Item>
          <Form.Item
            label="Yeniden Planlama Nedeni (Opsiyonel)"
            name="reason"
          >
            <Input.TextArea
              rows={3}
              placeholder="Aktiviteyi neden yeniden planlıyorsunuz?"
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setRescheduleModalOpen(false)}>
                İptal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={rescheduleActivity.isPending}
                icon={<FieldTimeOutlined />}
              >
                Yeniden Planla
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CloseCircleOutlined className="text-red-600" />
            <span>Aktiviteyi İptal Et</span>
          </div>
        }
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          onFinish={handleCancelSubmit}
        >
          <Form.Item
            label="İptal Nedeni (Opsiyonel)"
            name="reason"
          >
            <Input.TextArea
              rows={4}
              placeholder="Aktiviteyi neden iptal ediyorsunuz?"
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setCancelModalOpen(false)}>
                Vazgeç
              </Button>
              <Button
                danger
                type="primary"
                htmlType="submit"
                loading={cancelActivity.isPending}
                icon={<CloseCircleOutlined />}
              >
                İptal Et
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
