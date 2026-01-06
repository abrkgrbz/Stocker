'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Tag, Empty, Modal, message } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  XCircleIcon,
  ClockIcon,
  PhoneIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  useLeave,
  useDeleteLeave,
  useApproveLeave,
  useRejectLeave,
} from '@/lib/api/hooks/useHR';
import { LeaveStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const getStatusConfig = (status?: LeaveStatus) => {
  const statusMap: Record<number, { color: string; bgColor: string; textColor: string; text: string }> = {
    [LeaveStatus.Pending]: { color: 'orange', bgColor: 'bg-amber-50', textColor: 'text-amber-700', text: 'Beklemede' },
    [LeaveStatus.Approved]: { color: 'green', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', text: 'Onaylandı' },
    [LeaveStatus.Rejected]: { color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', text: 'Reddedildi' },
    [LeaveStatus.Cancelled]: { color: 'default', bgColor: 'bg-slate-100', textColor: 'text-slate-500', text: 'İptal Edildi' },
    [LeaveStatus.Taken]: { color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', text: 'Kullanıldı' },
    [LeaveStatus.PartiallyTaken]: { color: 'cyan', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', text: 'Kısmen Kullanıldı' },
  };
  const defaultConfig = { color: 'default', bgColor: 'bg-slate-100', textColor: 'text-slate-500', text: '-' };
  if (status === undefined || status === null) return defaultConfig;
  return statusMap[status] || defaultConfig;
};

export default function LeaveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: leave, isLoading, error } = useLeave(id);
  const deleteLeave = useDeleteLeave();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const handleDelete = () => {
    if (!leave) return;
    Modal.confirm({
      title: 'İzin Talebini Sil',
      content: 'Bu izin talebini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteLeave.mutateAsync(id);
          router.push('/hr/leaves');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async () => {
    try {
      await approveLeave.mutateAsync({ id });
      message.success('İzin talebi onaylandı');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'İzin Talebini Reddet',
      content: 'Bu izin talebini reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await rejectLeave.mutateAsync({ id, data: { reason: 'Reddedildi' } });
          message.success('İzin talebi reddedildi');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !leave) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">İzin Talebi Bulunamadı</h3>
          <p className="text-red-600 mb-4">İstenen izin talebi bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/hr/leaves')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(leave.status);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/hr/leaves')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${statusConfig.color === 'green' ? 'bg-emerald-600' : statusConfig.color === 'orange' ? 'bg-amber-500' : statusConfig.color === 'red' ? 'bg-red-500' : 'bg-slate-400'}`}>
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">İzin Talebi</h1>
                  <Tag
                    icon={leave.status === LeaveStatus.Approved ? <CheckCircleIcon className="w-4 h-4" /> : null}
                    className={`border-0 ${statusConfig.bgColor} ${statusConfig.textColor}`}
                  >
                    {statusConfig.text}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{leave.employeeName || `Çalışan #${leave.employeeId}`}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {leave.status === LeaveStatus.Pending && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleIcon className="w-4 h-4" />}
                  onClick={handleApprove}
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                >
                  Onayla
                </Button>
                <Button
                  danger
                  icon={<XCircleIcon className="w-4 h-4" />}
                  onClick={handleReject}
                >
                  Reddet
                </Button>
              </>
            )}
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/leaves/${id}/edit`)}
              disabled={leave.status !== LeaveStatus.Pending}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
            <Button
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Sil
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Leave Info Section - Main Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                İzin Talebi Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Çalışan</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {leave.employeeName || `Çalışan #${leave.employeeId}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">İzin Türü</p>
                  <p className="text-sm font-medium text-slate-900">{leave.leaveTypeName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Başlangıç Tarihi</p>
                  <p className="text-sm font-medium text-emerald-600">{dayjs(leave.startDate).format('DD.MM.YYYY')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bitiş Tarihi</p>
                  <p className="text-sm font-medium text-blue-600">{dayjs(leave.endDate).format('DD.MM.YYYY')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Toplam Gün</p>
                  <p className="text-sm font-medium text-slate-900">{leave.totalDays || 0} gün</p>
                </div>
                {leave.isHalfDay && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Yarım Gün</p>
                    <p className="text-sm font-medium text-slate-900">{leave.isHalfDayMorning ? 'Sabah' : 'Öğleden Sonra'}</p>
                  </div>
                )}
                {leave.approvedById && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Onaylayan</p>
                    <p className="text-sm font-medium text-slate-900">{leave.approvedByName || `Kullanıcı #${leave.approvedById}`}</p>
                  </div>
                )}
                {leave.approvedDate && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Onay Tarihi</p>
                    <p className="text-sm font-medium text-slate-900">{dayjs(leave.approvedDate).format('DD.MM.YYYY HH:mm')}</p>
                  </div>
                )}
              </div>

              {/* Reason */}
              {leave.reason && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <DocumentTextIcon className="w-4 h-4" />
                    İzin Nedeni
                  </p>
                  <p className="text-sm text-slate-700">{leave.reason}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {leave.rejectionReason && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-red-400 mb-2">Ret Nedeni</p>
                  <p className="text-sm text-red-600">{leave.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                İzin Özeti
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                  {leave.totalDays || 0}
                </div>
                <p className="text-sm font-medium text-slate-700 mt-3">Gün</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Başlangıç
                  </span>
                  <span className="font-medium text-slate-900">{dayjs(leave.startDate).format('DD MMM')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Bitiş
                  </span>
                  <span className="font-medium text-slate-900">{dayjs(leave.endDate).format('DD MMM')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    İzin Türü
                  </span>
                  <span className="font-medium text-slate-900">{leave.leaveTypeName || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-12 gap-6">
          {/* Contact During Leave */}
          {leave.contactDuringLeave && (
            <div className="col-span-12 md:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PhoneIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    İzin Süresince İletişim
                  </p>
                </div>
                <p className="text-sm text-slate-700">{leave.contactDuringLeave}</p>
              </div>
            </div>
          )}

          {/* Handover Notes */}
          {leave.handoverNotes && (
            <div className="col-span-12 md:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Devir Notları
                  </p>
                </div>
                <p className="text-sm text-slate-700">{leave.handoverNotes}</p>
              </div>
            </div>
          )}

          {/* Substitute Employee */}
          {leave.substituteEmployeeName && (
            <div className="col-span-12 md:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Vekil Çalışan
                  </p>
                </div>
                <p className="text-sm text-slate-700">{leave.substituteEmployeeName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
