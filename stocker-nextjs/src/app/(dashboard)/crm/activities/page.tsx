'use client';

import { ProtectedRoute } from '@/components/auth';

import React, { useState, useMemo } from 'react';
import {
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Spin,
} from 'antd';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  ArrowPathIcon,
  BoltIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  PlusIcon,
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
} from '@/lib/api/hooks/useCRM';
import { ActivityCalendar } from '@/components/crm/activities/ActivityCalendar';
import { ActivityModal, ActivityPreviewModal } from '@/features/activities/components';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

function ActivitiesPageContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [quickActionType, setQuickActionType] = useState<number | undefined>(undefined);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<'my' | 'team' | 'all'>('my');

  // API Hooks
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

  // Calculate stats
  const stats = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return {
      total: activities.length,
      today: activities.filter(
        (a) => dayjs(a.startTime).format('YYYY-MM-DD') === today && a.status === 'Scheduled'
      ).length,
      completed: activities.filter((a) => a.status === 'Completed').length,
      pending: activities.filter((a) => a.status === 'Scheduled').length,
    };
  }, [activities]);

  const handleCreate = () => {
    setSelectedActivity(null);
    setQuickActionType(undefined);
    setModalOpen(true);
  };

  const handleQuickAction = (activityTypeName: 'Call' | 'Email' | 'Meeting') => {
    const typeMap = {
      Call: 1,
      Email: 2,
      Meeting: 3,
    };

    setSelectedActivity(null);
    setQuickActionType(typeMap[activityTypeName]);
    setModalOpen(true);
  };

  const handleEventClick = (activity: Activity) => {
    setPreviewActivity(activity);
    setPreviewModalOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setPreviewModalOpen(false);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Aktiviteyi Sil',
      content: 'Bu aktiviteyi silmek istediginizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await deleteActivity.mutateAsync(id);
          showSuccess('Aktivite basariyla silindi');
          setPreviewModalOpen(false);
        } catch (error: any) {
          showApiError(error, 'Silme islemi basarisiz');
        }
      },
    });
  };

  const handleComplete = async (id: string) => {
    try {
      await completeActivity.mutateAsync({ id });
      showSuccess('Aktivite tamamlandi olarak isaretlendi');
      setPreviewModalOpen(false);
    } catch (error: any) {
      showApiError(error, 'Islem basarisiz');
    }
  };

  const handleCancel = () => {
    setCancelModalOpen(true);
  };

  const handleCancelSubmit = async (values: { reason?: string }) => {
    if (!previewActivity) return;

    try {
      await cancelActivity.mutateAsync({
        id: previewActivity.id.toString(),
        reason: values.reason,
      });
      showSuccess('Aktivite iptal edildi');
      setCancelModalOpen(false);
      setPreviewModalOpen(false);
    } catch (error: any) {
      showApiError(error, 'Iptal islemi basarisiz');
    }
  };

  const handleReschedule = () => {
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (values: {
    startTime: Dayjs;
    endTime?: Dayjs;
    reason?: string;
  }) => {
    if (!previewActivity) return;

    try {
      await rescheduleActivity.mutateAsync({
        id: previewActivity.id.toString(),
        newStartDate: values.startTime.toISOString(),
        newEndDate: values.endTime?.toISOString(),
        reason: values.reason,
      });
      showSuccess('Aktivite yeniden planlandi');
      setRescheduleModalOpen(false);
      setPreviewModalOpen(false);
    } catch (error: any) {
      showApiError(error, 'Yeniden planlama basarisiz');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedActivity) {
        await updateActivity.mutateAsync({ id: selectedActivity.id, data: values });
        showSuccess('Aktivite basariyla guncellendi');
      } else {
        await createActivity.mutateAsync(values);
        showSuccess('Yeni aktivite olusturuldu');
      }
      setModalOpen(false);
    } catch (error: any) {
      showApiError(error, 'Islem basarisiz');
    }
  };

  const handleDateSelect = () => {
    setSelectedActivity(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <BoltIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Aktiviteler</h1>
            <p className="text-sm text-slate-500">
              Tum aktivitelerinizi takvimde yonetin ve takip edin ({totalCount} aktivite)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={handleCreate}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Aktivite
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Toplam Aktivite</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? '-' : stats.total}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Bugunun Aktiviteleri</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? '-' : stats.today}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tamamlanan</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? '-' : stats.completed}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Bekleyen</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? '-' : stats.pending}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
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
                Satis Ekibi
              </button>
              <button
                onClick={() => setOwnerFilter('all')}
                className={`px-4 py-2 text-sm font-medium border-l border-slate-200 transition-colors ${
                  ownerFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tum Aktiviteler
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">Hizli Ekle:</span>
            <Space>
              <button
                onClick={() => handleQuickAction('Call')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg shadow-sm transition-all text-sm font-medium"
              >
                <PhoneIcon className="w-4 h-4" />
                Gorusme
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
                Toplanti
              </button>
            </Space>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <ActivityCalendar
            activities={activities}
            loading={isLoading}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
          />
        )}
      </div>

      {/* Activity Preview Modal */}
      <ActivityPreviewModal
        open={previewModalOpen}
        activity={previewActivity}
        onClose={() => setPreviewModalOpen(false)}
        onComplete={handleComplete}
        onEdit={handleEdit}
        completeLoading={completeActivity.isPending}
      />

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
            <ClockIcon className="w-4 h-4 text-slate-600" />
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
            startTime: previewActivity ? dayjs(previewActivity.startTime) : undefined,
            endTime: previewActivity?.endTime ? dayjs(previewActivity.endTime) : undefined,
          }}
        >
          <Form.Item
            label="Yeni Baslangic Zamani"
            name="startTime"
            rules={[{ required: true, message: 'Baslangic zamani gerekli' }]}
          >
            <DatePicker
              showTime
              format="DD.MM.YYYY HH:mm"
              className="w-full"
              placeholder="Baslangic zamani secin"
            />
          </Form.Item>
          <Form.Item label="Yeni Bitis Zamani (Opsiyonel)" name="endTime">
            <DatePicker
              showTime
              format="DD.MM.YYYY HH:mm"
              className="w-full"
              placeholder="Bitis zamani secin"
            />
          </Form.Item>
          <Form.Item label="Yeniden Planlama Nedeni (Opsiyonel)" name="reason">
            <Input.TextArea rows={3} placeholder="Aktiviteyi neden yeniden planliyorsunuz?" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => setRescheduleModalOpen(false)}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
              >
                Iptal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={rescheduleActivity.isPending}
                icon={<ClockIcon className="w-4 h-4" />}
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
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
            <XCircleIcon className="w-4 h-4 text-slate-600" />
            <span>Aktiviteyi Iptal Et</span>
          </div>
        }
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form layout="vertical" onFinish={handleCancelSubmit}>
          <Form.Item label="Iptal Nedeni (Opsiyonel)" name="reason">
            <Input.TextArea rows={4} placeholder="Aktiviteyi neden iptal ediyorsunuz?" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => setCancelModalOpen(false)}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
              >
                Vazgec
              </Button>
              <Button
                danger
                type="primary"
                htmlType="submit"
                loading={cancelActivity.isPending}
                icon={<XCircleIcon className="w-4 h-4" />}
              >
                Iptal Et
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


export default function ActivitiesPage() {
  return (
    <ProtectedRoute permission="CRM.Activities:View">
      <ActivitiesPageContent />
    </ProtectedRoute>
  );
}
