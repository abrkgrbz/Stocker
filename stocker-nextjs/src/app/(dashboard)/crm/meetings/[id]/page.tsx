'use client';

/**
 * Meeting Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Spin, Empty, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BellOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useMeeting } from '@/lib/api/hooks/useCRM';
import {
  MeetingType,
  MeetingStatus,
  MeetingPriority,
  MeetingLocationType,
  AttendeeResponse,
} from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const meetingTypeLabels: Record<MeetingType, { label: string; color: string }> = {
  [MeetingType.General]: { label: 'Genel', color: 'default' },
  [MeetingType.Sales]: { label: 'Satış', color: 'blue' },
  [MeetingType.Demo]: { label: 'Demo', color: 'cyan' },
  [MeetingType.Presentation]: { label: 'Sunum', color: 'purple' },
  [MeetingType.Negotiation]: { label: 'Müzakere', color: 'orange' },
  [MeetingType.Contract]: { label: 'Sözleşme', color: 'green' },
  [MeetingType.Kickoff]: { label: 'Başlangıç', color: 'lime' },
  [MeetingType.Review]: { label: 'İnceleme', color: 'geekblue' },
  [MeetingType.Planning]: { label: 'Planlama', color: 'gold' },
  [MeetingType.Training]: { label: 'Eğitim', color: 'magenta' },
  [MeetingType.Workshop]: { label: 'Çalıştay', color: 'volcano' },
  [MeetingType.Webinar]: { label: 'Webinar', color: 'red' },
  [MeetingType.Conference]: { label: 'Konferans', color: 'purple' },
  [MeetingType.OneOnOne]: { label: 'Birebir', color: 'cyan' },
  [MeetingType.TeamMeeting]: { label: 'Takım Toplantısı', color: 'blue' },
  [MeetingType.BusinessLunch]: { label: 'İş Yemeği', color: 'orange' },
  [MeetingType.SiteVisit]: { label: 'Saha Ziyareti', color: 'green' },
};

const statusLabels: Record<MeetingStatus, { label: string; color: string }> = {
  [MeetingStatus.Scheduled]: { label: 'Planlandı', color: 'default' },
  [MeetingStatus.Confirmed]: { label: 'Onaylandı', color: 'blue' },
  [MeetingStatus.InProgress]: { label: 'Devam Ediyor', color: 'processing' },
  [MeetingStatus.Completed]: { label: 'Tamamlandı', color: 'success' },
  [MeetingStatus.Cancelled]: { label: 'İptal Edildi', color: 'error' },
  [MeetingStatus.Rescheduled]: { label: 'Yeniden Planlandı', color: 'warning' },
  [MeetingStatus.NoShow]: { label: 'Katılım Yok', color: 'error' },
};

const priorityLabels: Record<MeetingPriority, { label: string; color: string }> = {
  [MeetingPriority.Low]: { label: 'Düşük', color: 'default' },
  [MeetingPriority.Normal]: { label: 'Normal', color: 'blue' },
  [MeetingPriority.High]: { label: 'Yüksek', color: 'orange' },
  [MeetingPriority.Urgent]: { label: 'Acil', color: 'red' },
};

const locationTypeLabels: Record<MeetingLocationType, { label: string; icon: React.ReactNode }> = {
  [MeetingLocationType.InPerson]: { label: 'Yüz Yüze', icon: <EnvironmentOutlined /> },
  [MeetingLocationType.Online]: { label: 'Online', icon: <VideoCameraOutlined /> },
  [MeetingLocationType.Hybrid]: { label: 'Hibrit', icon: <TeamOutlined /> },
  [MeetingLocationType.Phone]: { label: 'Telefon', icon: <PhoneOutlined /> },
};

const attendeeResponseColors: Record<AttendeeResponse, string> = {
  [AttendeeResponse.NotResponded]: 'default',
  [AttendeeResponse.Accepted]: 'success',
  [AttendeeResponse.Declined]: 'error',
  [AttendeeResponse.Tentative]: 'warning',
};

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id as string;

  const { data: meeting, isLoading, error } = useMeeting(meetingId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Toplantı bulunamadı" />
      </div>
    );
  }

  const typeInfo = meetingTypeLabels[meeting.meetingType] || { label: meeting.meetingType, color: 'default' };
  const statusInfo = statusLabels[meeting.status] || { label: meeting.status, color: 'default' };
  const priorityInfo = priorityLabels[meeting.priority] || { label: meeting.priority, color: 'default' };
  const locationInfo = locationTypeLabels[meeting.locationType] || { label: meeting.locationType, icon: <EnvironmentOutlined /> };

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
              onClick={() => router.push('/crm/meetings')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftOutlined />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                <TeamOutlined className="text-lg text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{meeting.title}</h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{typeInfo.label}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/meetings/${meeting.id}/edit`)}
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
                Toplantı Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Başlık</p>
                  <p className="text-sm font-medium text-slate-900">{meeting.title}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tip</p>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Öncelik</p>
                  <Tag color={priorityInfo.color}>{priorityInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Başlangıç</p>
                  <div className="flex items-center gap-1">
                    <CalendarOutlined className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {meeting.startTime ? dayjs(meeting.startTime).format('DD/MM/YYYY HH:mm') : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bitiş</p>
                  <div className="flex items-center gap-1">
                    <ClockCircleOutlined className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {meeting.endTime ? dayjs(meeting.endTime).format('DD/MM/YYYY HH:mm') : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Konum Tipi</p>
                  <div className="flex items-center gap-1">
                    {locationInfo.icon}
                    <span className="text-sm font-medium text-slate-900">{locationInfo.label}</span>
                  </div>
                </div>
                {meeting.location && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Konum</p>
                    <p className="text-sm font-medium text-slate-900">{meeting.location}</p>
                  </div>
                )}
                {meeting.meetingRoom && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Toplantı Odası</p>
                    <p className="text-sm font-medium text-slate-900">{meeting.meetingRoom}</p>
                  </div>
                )}
              </div>

              {meeting.onlineMeetingLink && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Online Toplantı Linki</p>
                  <a
                    href={meeting.onlineMeetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <LinkOutlined />
                    {meeting.onlineMeetingPlatform || 'Toplantıya Katıl'}
                  </a>
                </div>
              )}

              {meeting.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{meeting.description}</p>
                </div>
              )}

              {meeting.agenda && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Gündem</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{meeting.agenda}</p>
                </div>
              )}

              {meeting.notes && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Notlar</p>
                  <p className="text-sm text-slate-700">{meeting.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Organizer & Reminder Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Organizatör
              </p>
              {meeting.organizerName && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <UserOutlined className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{meeting.organizerName}</p>
                    {meeting.organizerEmail && (
                      <p className="text-xs text-slate-500">{meeting.organizerEmail}</p>
                    )}
                  </div>
                </div>
              )}

              {meeting.hasReminder && (
                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BellOutlined className="text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">Hatırlatıcı Aktif</span>
                  </div>
                  {meeting.reminderMinutesBefore && (
                    <p className="text-xs text-amber-700">
                      {meeting.reminderMinutesBefore} dakika önce
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Attendees Card */}
          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TeamOutlined className="text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Katılımcılar ({meeting.attendees.length})
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {meeting.attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserOutlined className="text-indigo-600 text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {attendee.name || attendee.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Tag
                          color={attendeeResponseColors[attendee.response]}
                          className="text-xs"
                        >
                          {attendee.response === AttendeeResponse.Accepted && 'Kabul'}
                          {attendee.response === AttendeeResponse.Declined && 'Ret'}
                          {attendee.response === AttendeeResponse.Tentative && 'Belirsiz'}
                          {attendee.response === AttendeeResponse.NotResponded && 'Bekliyor'}
                        </Tag>
                        {attendee.isOrganizer && (
                          <Tag color="purple" className="text-xs">Organizatör</Tag>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Entities Card */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                İlişkili Kayıtlar
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {meeting.customerId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/customers/${meeting.customerId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Müşteri</p>
                    <p className="text-sm font-medium text-blue-600">
                      {meeting.customerName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {meeting.leadId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/leads/${meeting.leadId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Lead</p>
                    <p className="text-sm font-medium text-blue-600">
                      {meeting.leadName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {meeting.opportunityId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/opportunities/${meeting.opportunityId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Fırsat</p>
                    <p className="text-sm font-medium text-blue-600">
                      {meeting.opportunityName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {meeting.dealId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/deals/${meeting.dealId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Deal</p>
                    <p className="text-sm font-medium text-blue-600">
                      {meeting.dealTitle || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {meeting.campaignId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/campaigns/${meeting.campaignId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Kampanya</p>
                    <p className="text-sm font-medium text-blue-600">
                      {meeting.campaignName || 'Görüntüle'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Outcome Card */}
          {(meeting.outcome || meeting.actionItems) && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Toplantı Sonucu
                </p>
                {meeting.outcome && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 mb-2">Sonuç</p>
                    <p className="text-sm text-slate-700">{meeting.outcome}</p>
                  </div>
                )}
                {meeting.actionItems && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Aksiyon Maddeleri</p>
                    <p className="text-sm text-slate-700 whitespace-pre-line">{meeting.actionItems}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
