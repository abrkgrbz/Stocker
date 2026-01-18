'use client';

import React from 'react';
import { Modal } from 'antd';
import { useRouter } from 'next/navigation';
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  UserGroupIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { Activity } from '@/lib/api/services/crm.service';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Activity type configuration with slate palette
const activityTypeConfig: Record<
  string,
  { icon: React.ReactNode; label: string }
> = {
  Call: { icon: <PhoneIcon className="w-5 h-5" />, label: 'Arama' },
  Email: { icon: <EnvelopeIcon className="w-5 h-5" />, label: 'E-posta' },
  Meeting: { icon: <UserGroupIcon className="w-5 h-5" />, label: 'Toplantı' },
  Task: { icon: <DocumentTextIcon className="w-5 h-5" />, label: 'Görev' },
  Note: { icon: <DocumentTextIcon className="w-5 h-5" />, label: 'Not' },
  Demo: { icon: <UserGroupIcon className="w-5 h-5" />, label: 'Demo' },
  'Follow-up': { icon: <PhoneIcon className="w-5 h-5" />, label: 'Takip' },
};

// Status configuration
const activityStatusConfig: Record<
  string,
  { bgColor: string; textColor: string; label: string }
> = {
  Pending: { bgColor: 'bg-slate-100', textColor: 'text-slate-600', label: 'Bekliyor' },
  Scheduled: { bgColor: 'bg-slate-200', textColor: 'text-slate-700', label: 'Planlandı' },
  InProgress: { bgColor: 'bg-slate-400', textColor: 'text-white', label: 'Devam Ediyor' },
  Completed: { bgColor: 'bg-slate-700', textColor: 'text-white', label: 'Tamamlandı' },
  Cancelled: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'İptal Edildi' },
};

interface ActivityPreviewModalProps {
  open: boolean;
  activity: Activity | null;
  onClose: () => void;
  onComplete?: (id: string) => void;
  onEdit?: (activity: Activity) => void;
  completeLoading?: boolean;
}

export function ActivityPreviewModal({
  open,
  activity,
  onClose,
  onComplete,
  onEdit,
  completeLoading = false,
}: ActivityPreviewModalProps) {
  const router = useRouter();

  if (!activity) return null;

  const typeConfig = activityTypeConfig[activity.type] || activityTypeConfig.Note;
  const statusConfig = activityStatusConfig[activity.status] || activityStatusConfig.Pending;
  const isCompleted = activity.status === 'Completed';
  const isCancelled = activity.status === 'Cancelled';
  const isScheduled = activity.status === 'Scheduled';

  const handleViewDetails = () => {
    onClose();
    router.push(`/crm/activities/${activity.id}`);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(activity);
    } else {
      onClose();
      router.push(`/crm/activities/${activity.id}/edit`);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      styles={{
        mask: {
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
        },
        content: {
          borderRadius: '12px',
          overflow: 'hidden',
          padding: 0,
        },
        body: {
          padding: 0,
        },
      }}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            {typeConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 truncate">
              {activity.subject || activity.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                {typeConfig.label}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Time */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Tarih ve Saat</p>
            <p className="text-sm font-medium text-slate-900">
              {dayjs(activity.startTime).format('DD MMM YYYY, HH:mm')}
              {activity.endTime && ` - ${dayjs(activity.endTime).format('HH:mm')}`}
            </p>
          </div>
        </div>

        {/* Location */}
        {activity.location && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <MapPinIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Konum</p>
              <p className="text-sm font-medium text-slate-900">{activity.location}</p>
            </div>
          </div>
        )}

        {/* Related Entity */}
        {(activity.customerName || activity.leadName || activity.dealTitle) && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">İlişkili Kayıt</p>
              <p className="text-sm font-medium text-slate-900">
                {activity.customerName || activity.leadName || activity.dealTitle}
              </p>
            </div>
          </div>
        )}

        {/* Description (truncated) */}
        {activity.description && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 line-clamp-2">{activity.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-5 pt-0 space-y-3">
        {/* Primary Action - View Details */}
        <button
          onClick={handleViewDetails}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Detayları Görüntüle
          <ArrowRightIcon className="w-4 h-4" />
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          {isScheduled && onComplete && (
            <button
              onClick={() => onComplete(activity.id)}
              disabled={completeLoading}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Tamamla
            </button>
          )}

          {!isCompleted && !isCancelled && (
            <button
              onClick={handleEdit}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Düzenle
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
