'use client';

/**
 * Call Log Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Spin, Empty, Tag, Progress } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AudioOutlined,
  StarOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useCallLog } from '@/lib/api/hooks/useCRM';
import { CallDirection, CallType, CallStatus, CallOutcome } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const directionLabels: Record<CallDirection, { label: string; color: string }> = {
  [CallDirection.Inbound]: { label: 'Gelen', color: 'green' },
  [CallDirection.Outbound]: { label: 'Giden', color: 'blue' },
  [CallDirection.Internal]: { label: 'Dahili', color: 'default' },
};

const typeLabels: Record<CallType, { label: string; color: string }> = {
  [CallType.Standard]: { label: 'Standart', color: 'default' },
  [CallType.Sales]: { label: 'Satış', color: 'blue' },
  [CallType.Support]: { label: 'Destek', color: 'cyan' },
  [CallType.FollowUp]: { label: 'Takip', color: 'orange' },
  [CallType.Campaign]: { label: 'Kampanya', color: 'purple' },
  [CallType.Conference]: { label: 'Konferans', color: 'magenta' },
  [CallType.Callback]: { label: 'Geri Arama', color: 'gold' },
};

const statusLabels: Record<CallStatus, { label: string; color: string }> = {
  [CallStatus.Ringing]: { label: 'Çalıyor', color: 'processing' },
  [CallStatus.InProgress]: { label: 'Devam Ediyor', color: 'blue' },
  [CallStatus.OnHold]: { label: 'Beklemede', color: 'orange' },
  [CallStatus.Transferred]: { label: 'Transfer Edildi', color: 'purple' },
  [CallStatus.Completed]: { label: 'Tamamlandı', color: 'success' },
  [CallStatus.Missed]: { label: 'Cevapsız', color: 'error' },
  [CallStatus.Abandoned]: { label: 'Terk Edildi', color: 'warning' },
  [CallStatus.Busy]: { label: 'Meşgul', color: 'default' },
  [CallStatus.Failed]: { label: 'Başarısız', color: 'error' },
};

const outcomeLabels: Record<CallOutcome, string> = {
  [CallOutcome.Successful]: 'Başarılı',
  [CallOutcome.LeftVoicemail]: 'Sesli Mesaj Bırakıldı',
  [CallOutcome.NoAnswer]: 'Cevap Yok',
  [CallOutcome.Busy]: 'Meşgul',
  [CallOutcome.WrongNumber]: 'Yanlış Numara',
  [CallOutcome.CallbackRequested]: 'Geri Arama İstendi',
  [CallOutcome.NotInterested]: 'İlgilenmiyor',
  [CallOutcome.InformationProvided]: 'Bilgi Verildi',
  [CallOutcome.AppointmentScheduled]: 'Randevu Oluşturuldu',
  [CallOutcome.SaleMade]: 'Satış Yapıldı',
  [CallOutcome.ComplaintReceived]: 'Şikayet Alındı',
  [CallOutcome.IssueResolved]: 'Sorun Çözüldü',
  [CallOutcome.Abandoned]: 'Terk Edildi',
  [CallOutcome.Transferred]: 'Transfer Edildi',
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function CallLogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const callLogId = params.id as string;

  const { data: callLog, isLoading, error } = useCallLog(callLogId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !callLog) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Arama kaydı bulunamadı" />
      </div>
    );
  }

  const directionInfo = directionLabels[callLog.direction] || { label: callLog.direction, color: 'default' };
  const typeInfo = typeLabels[callLog.callType] || { label: callLog.callType, color: 'default' };
  const statusInfo = statusLabels[callLog.status] || { label: callLog.status, color: 'default' };

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
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/crm/call-logs')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftOutlined />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  callLog.status === CallStatus.Completed ? 'bg-emerald-100' : 'bg-blue-100'
                }`}
              >
                <PhoneOutlined
                  className={`text-lg ${
                    callLog.status === CallStatus.Completed ? 'text-emerald-600' : 'text-blue-600'
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {callLog.callNumber || 'Arama Kaydı'}
                  </h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {directionInfo.label} • {typeInfo.label}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/call-logs/${callLog.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <EditOutlined />
            Düzenle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Info Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Arama Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Arama Numarası</p>
                  <p className="text-sm font-medium text-slate-900">{callLog.callNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Yön</p>
                  <Tag color={directionInfo.color} icon={<SwapOutlined />}>
                    {directionInfo.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tip</p>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Arayan</p>
                  <p className="text-sm font-medium text-slate-900">{callLog.callerNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Aranan</p>
                  <p className="text-sm font-medium text-slate-900">{callLog.calledNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Başlangıç</p>
                  <div className="flex items-center gap-1">
                    <CalendarOutlined className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {callLog.startTime ? dayjs(callLog.startTime).format('DD/MM/YYYY HH:mm') : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bitiş</p>
                  <div className="flex items-center gap-1">
                    <ClockCircleOutlined className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {callLog.endTime ? dayjs(callLog.endTime).format('DD/MM/YYYY HH:mm') : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Süre</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDuration(callLog.durationSeconds || 0)}
                  </p>
                </div>
                {callLog.outcome && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Sonuç</p>
                    <Tag color="blue">{outcomeLabels[callLog.outcome] || callLog.outcome}</Tag>
                  </div>
                )}
              </div>

              {callLog.notes && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Notlar</p>
                  <p className="text-sm text-slate-700">{callLog.notes}</p>
                </div>
              )}

              {callLog.summary && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Özet</p>
                  <p className="text-sm text-slate-700">{callLog.summary}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quality & Recording Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kalite & Kayıt
              </p>
              <div className="space-y-4">
                {callLog.qualityScore !== undefined && (
                  <div className="flex flex-col items-center py-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                        callLog.qualityScore >= 80
                          ? 'bg-emerald-100 text-emerald-600'
                          : callLog.qualityScore >= 60
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {callLog.qualityScore}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Kalite Puanı</p>
                  </div>
                )}

                {callLog.customerSatisfaction !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-500">Müşteri Memnuniyeti</span>
                    <div className="flex items-center gap-1">
                      <StarOutlined className="text-amber-500" />
                      <span className="font-medium">{callLog.customerSatisfaction}/5</span>
                    </div>
                  </div>
                )}

                {callLog.hasRecording && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AudioOutlined className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Kayıt Mevcut</span>
                    </div>
                    {callLog.recordingUrl && (
                      <a
                        href={callLog.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Kaydı Dinle
                      </a>
                    )}
                  </div>
                )}

                {callLog.agentName && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserOutlined className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{callLog.agentName}</p>
                      <p className="text-xs text-slate-500">Temsilci</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Follow-up Card */}
          {callLog.followUpRequired && (
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarOutlined className="text-orange-500" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Takip Bilgileri
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Takip Gerekli</span>
                    <Tag color="orange">Evet</Tag>
                  </div>
                  {callLog.followUpDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Takip Tarihi</span>
                      <span className="text-sm font-medium">
                        {dayjs(callLog.followUpDate).format('DD/MM/YYYY')}
                      </span>
                    </div>
                  )}
                  {callLog.followUpNote && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">Takip Notu</p>
                      <p className="text-sm text-slate-700">{callLog.followUpNote}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Related Entities Card */}
          <div className={`col-span-12 ${callLog.followUpRequired ? 'lg:col-span-6' : ''}`}>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                İlişkili Kayıtlar
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {callLog.customerId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/customers/${callLog.customerId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Müşteri</p>
                    <p className="text-sm font-medium text-blue-600">
                      {callLog.customerName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {callLog.contactId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/contacts/${callLog.contactId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Kişi</p>
                    <p className="text-sm font-medium text-blue-600">
                      {callLog.contactName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {callLog.leadId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/leads/${callLog.leadId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Lead</p>
                    <p className="text-sm font-medium text-blue-600">
                      {callLog.leadName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {callLog.campaignId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/campaigns/${callLog.campaignId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Kampanya</p>
                    <p className="text-sm font-medium text-blue-600">
                      {callLog.campaignName || 'Görüntüle'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
