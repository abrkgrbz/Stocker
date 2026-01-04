'use client';

import React, { useState } from 'react';
import {
  Button,
  Space,
  Modal,
  Badge,
  Drawer,
  Descriptions,
  Tag,
  Divider,
  Form,
  Input,
  DatePicker,
  Spin,
} from 'antd';
import { showSuccess, showError, showApiError } from '@/lib/utils/notifications';
import {
  ArrowPathIcon,
  BoltIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  FireIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  TrashIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
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
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/patterns';
import { Spinner } from '@/components/primitives';

// Activity type configuration
const activityConfig: Record<
  Activity['type'],
  { icon: React.ReactNode; color: string; label: string; gradient: string }
> = {
  Call: {
    icon: <PhoneIcon className="w-4 h-4" />,
    color: 'blue',
    label: 'Arama',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  Email: {
    icon: <EnvelopeIcon className="w-4 h-4" />,
    color: 'cyan',
    label: 'E-posta',
    gradient: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)'
  },
  Meeting: {
    icon: <UsersIcon className="w-4 h-4" />,
    color: 'green',
    label: 'Toplantı',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  Task: {
    icon: <DocumentTextIcon className="w-4 h-4" />,
    color: 'orange',
    label: 'Görev',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  Note: {
    icon: <DocumentTextIcon className="w-4 h-4" />,
    color: 'default',
    label: 'Not',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  Demo: {
    icon: <DocumentTextIcon className="w-4 h-4" />,
    color: 'geekblue',
    label: 'Demo',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
  },
  'Follow-up': {
    icon: <PhoneIcon className="w-4 h-4" />,
    color: 'volcano',
    label: 'Takip',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%)'
  },
};

// Status colors
const statusColors: Record<Activity['status'], string> = {
  Pending: 'orange',
  Scheduled: 'blue',
  InProgress: 'processing',
  Completed: 'green',
  Cancelled: 'red',
};

// Inline ActivitiesStats Component
interface ActivitiesStatsProps {
  activities: Activity[];
  loading: boolean;
}

const ActivitiesStats: React.FC<ActivitiesStatsProps> = ({ activities, loading }) => {
  const today = dayjs().format('YYYY-MM-DD');

  const stats = {
    total: activities.length,
    today: activities.filter((a) => dayjs(a.startTime).format('YYYY-MM-DD') === today && a.status === 'Scheduled').length,
    completed: activities.filter((a) => a.status === 'Completed').length,
    pending: activities.filter((a) => a.status === 'Scheduled').length,
  };

  const statCards = [
    {
      title: 'Toplam Aktivite',
      value: stats.total,
      icon: <BoltIcon className="w-6 h-6" />,
      color: 'slate',
    },
    {
      title: 'Bugünün Aktiviteleri',
      value: stats.today,
      icon: <CalendarIcon className="w-6 h-6" />,
      color: 'slate',
    },
    {
      title: 'Tamamlanan',
      value: stats.completed,
      icon: <CheckCircleIcon className="w-6 h-6" />,
      color: 'emerald',
    },
    {
      title: 'Bekleyen',
      value: stats.pending,
      icon: <ClockIcon className="w-6 h-6" />,
      color: 'amber',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'slate' ? 'bg-slate-100 text-slate-600' :
                stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-600'
              }`}
            >
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default function ActivitiesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [quickActionType, setQuickActionType] = useState<number | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerActivity, setDrawerActivity] = useState<Activity | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<'my' | 'team' | 'all'>('my');

  // API Hooks
  // Note: For 'my' we would need the current user's ID, for 'team' we'd need team member IDs
  // For now, passing null for 'my' and 'all' to get all activities
  // TODO: Implement proper user context and team member lookup
  const filterParams = ownerFilter === 'all' ? {} : {};
  const { data, isLoading, refetch } = useActivities(filterParams);
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const completeActivity = useCompleteActivity();
  const cancelActivity = useCancelActivity();
  const rescheduleActivity = useRescheduleActivity();

  const activities = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleCreate = (date?: Dayjs) => {
    setSelectedActivity(null);
    setQuickActionType(undefined);
    setModalOpen(true);
  };

  const handleQuickAction = (activityTypeName: 'Call' | 'Email' | 'Meeting') => {
    // Map activity type names to numeric enum values
    const typeMap = {
      'Call': 1, // Telefon Görüşmesi
      'Email': 2, // E-posta
      'Meeting': 3, // Toplantı
    };

    setSelectedActivity(null);
    setQuickActionType(typeMap[activityTypeName]);
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

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Aktiviteyi Sil',
      content: 'Bu aktiviteyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteActivity.mutateAsync(id);
          showSuccess('Aktivite başarıyla silindi');
          setDrawerOpen(false);
        } catch (error: any) {
          showApiError(error, 'Silme işlemi başarısız');
        }
      },
    });
  };

  const handleComplete = async (id: string) => {
    try {
      await completeActivity.mutateAsync({ id });
      showSuccess('Aktivite tamamlandı olarak işaretlendi');
      setDrawerOpen(false);
    } catch (error: any) {
      showApiError(error, 'İşlem başarısız');
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
      showSuccess('Aktivite iptal edildi');
      setCancelModalOpen(false);
      setDrawerOpen(false);
    } catch (error: any) {
      showApiError(error, 'İptal işlemi başarısız');
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
      showSuccess('Aktivite yeniden planlandı');
      setRescheduleModalOpen(false);
      setDrawerOpen(false);
    } catch (error: any) {
      showApiError(error, 'Yeniden planlama başarısız');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // ActivityModal already maps frontend fields to backend format:
      // - title -> subject
      // - startTime -> dueDate (as ISO string)
      // - endTime -> duration (calculated in minutes)
      // So we just pass the values directly
      if (selectedActivity) {
        await updateActivity.mutateAsync({ id: selectedActivity.id, data: values });
        showSuccess('Aktivite başarıyla güncellendi');
      } else {
        await createActivity.mutateAsync(values);
        showSuccess('Yeni aktivite oluşturuldu');
      }
      setModalOpen(false);
    } catch (error: any) {
      showApiError(error, 'İşlem başarısız');
    }
  };

  const handleDateSelect = (start: Date, end: Date) => {
    setSelectedActivity(null);
    setModalOpen(true);
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <ActivitiesStats activities={activities} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<BoltIcon className="w-5 h-5" />}
        iconColor="#0f172a"
        title="Aktiviteler"
        description="Tüm aktivitelerinizi takvimde yönetin ve takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Aktivite',
          onClick: handleCreate,
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Filters and Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Owner Filter */}
          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-slate-600" />
            <span className="text-slate-600 font-medium">Aktivite Sahibi:</span>
            <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setOwnerFilter('my')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  ownerFilter === 'my'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Benim Aktivitelerim
              </button>
              <button
                onClick={() => setOwnerFilter('team')}
                className={`px-4 py-2 text-sm font-medium border-l border-slate-200 transition-colors ${
                  ownerFilter === 'team'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Satış Ekibi
              </button>
              <button
                onClick={() => setOwnerFilter('all')}
                className={`px-4 py-2 text-sm font-medium border-l border-slate-200 transition-colors ${
                  ownerFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tüm Aktiviteler
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">Hızlı Ekle:</span>
            <Space>
              <button
                onClick={() => handleQuickAction('Call')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg shadow-sm transition-all text-sm font-medium"
              >
                <PhoneIcon className="w-4 h-4" />
                Görüşme
              </button>
              <button
                onClick={() => handleQuickAction('Email')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg shadow-sm transition-all text-sm font-medium"
              >
                <EnvelopeIcon className="w-4 h-4" />
                E-posta
              </button>
              <button
                onClick={() => handleQuickAction('Meeting')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg shadow-sm transition-all text-sm font-medium"
              >
                <UsersIcon className="w-4 h-4" />
                Toplantı
              </button>
            </Space>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <Card>
          <ActivityCalendar
            activities={activities}
            loading={isLoading}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
          />
        </Card>
      )}

      {/* Activity Details Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            {drawerActivity && (() => {
              const config = activityConfig[drawerActivity.type] || activityConfig.Note;
              return (
                <>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg"
                    style={{ background: config.gradient }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-base">{drawerActivity.title}</div>
                    <Space size="small">
                      <Tag color={config.color}>
                        {config.label}
                      </Tag>
                      <Tag color={statusColors[drawerActivity.status]}>
                        {drawerActivity.status}
                      </Tag>
                    </Space>
                  </div>
                </>
              );
            })()}
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
                    icon={<ClockIcon className="w-4 h-4" />}
                    onClick={() => handleReschedule(drawerActivity)}
                  >
                    Yeniden Planla
                  </Button>
                  <Button
                    icon={<XCircleIcon className="w-4 h-4" />}
                    onClick={() => handleCancel(drawerActivity)}
                  >
                    İptal Et
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleIcon className="w-4 h-4" />}
                    onClick={() => handleComplete(drawerActivity.id)}
                  >
                    Tamamla
                  </Button>
                </>
              )}
              <Button
                icon={<PencilIcon className="w-4 h-4" />}
                onClick={() => handleEdit(drawerActivity)}
              >
                Düzenle
              </Button>
              <Button
                danger
                icon={<TrashIcon className="w-4 h-4" />}
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
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <ClockIcon className="w-4 h-4" />
                <span className="font-semibold">Zaman</span>
              </div>
              <div className="text-base text-slate-900">
                {dayjs(drawerActivity.startTime).format('DD MMMM YYYY, HH:mm')}
                {drawerActivity.endTime && (
                  <span> - {dayjs(drawerActivity.endTime).format('HH:mm')}</span>
                )}
              </div>
              {dayjs(drawerActivity.startTime).isBefore(dayjs()) && drawerActivity.status === 'Scheduled' && (
                <Tag icon={<FireIcon className="w-3 h-3" />} color="error" className="mt-2">
                  Gecikmiş
                </Tag>
              )}
            </div>

            {/* Description */}
            {drawerActivity.description && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  <span className="font-semibold">Açıklama</span>
                </div>
                <p className="text-slate-900">{drawerActivity.description}</p>
              </div>
            )}

            {/* Customer Information */}
            {drawerActivity.customerId && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <UserIcon className="w-4 h-4" />
                  <span className="font-semibold">Müşteri</span>
                </div>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Müşteri ID">
                    {drawerActivity.customerId}
                  </Descriptions.Item>
                </Descriptions>
              </div>
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
                    icon={<CheckCircleIcon className="w-4 h-4" />}
                    onClick={() => handleComplete(drawerActivity.id)}
                  >
                    Tamamlandı Olarak İşaretle
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<ClockIcon className="w-4 h-4" />}
                    onClick={() => handleReschedule(drawerActivity)}
                  >
                    Aktiviteyi Yeniden Planla
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<XCircleIcon className="w-4 h-4" />}
                    onClick={() => handleCancel(drawerActivity)}
                  >
                    Aktiviteyi İptal Et
                  </Button>
                </>
              )}
              <Button
                block
                size="large"
                icon={<PencilIcon className="w-4 h-4" />}
                onClick={() => handleEdit(drawerActivity)}
              >
                Aktiviteyi Düzenle
              </Button>
              <Button
                block
                size="large"
                danger
                icon={<TrashIcon className="w-4 h-4" />}
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
        onCancel={() => {
          setModalOpen(false);
          setQuickActionType(undefined);
        }}
        onSubmit={handleSubmit}
        initialType={quickActionType}
      />

      {/* Reschedule Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-blue-600" />
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
                icon={<ClockIcon className="w-4 h-4" />}
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
            <XCircleIcon className="w-4 h-4 text-red-600" />
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
                icon={<XCircleIcon className="w-4 h-4" />}
              >
                İptal Et
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
