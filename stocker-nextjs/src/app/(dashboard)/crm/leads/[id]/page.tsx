'use client';

/**
 * Lead Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Empty, Tag, Progress, Tabs, Timeline, Modal, message } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  FireIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  UserGroupIcon,
  UserIcon,
  UserPlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useLead, useLeadActivities, useConvertLead, useQualifyLead, useDisqualifyLead } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  New: { label: 'Yeni', color: 'blue', bgColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  Contacted: { label: 'İletişime Geçildi', color: 'cyan', bgColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  Working: { label: 'Çalışılıyor', color: 'orange', bgColor: 'bg-orange-50 text-orange-700 border-orange-200' },
  Qualified: { label: 'Nitelikli', color: 'green', bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Unqualified: { label: 'Niteliksiz', color: 'red', bgColor: 'bg-red-50 text-red-700 border-red-200' },
  Converted: { label: 'Dönüştürüldü', color: 'purple', bgColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  Lost: { label: 'Kayıp', color: 'default', bgColor: 'bg-slate-50 text-slate-700 border-slate-200' },
};

const ratingConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  Hot: {
    label: 'Sıcak',
    icon: <FireIcon className="w-4 h-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200'
  },
  Warm: {
    label: 'Ilık',
    icon: <ChartBarIcon className="w-4 h-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200'
  },
  Cold: {
    label: 'Soğuk',
    icon: <ClockIcon className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  Unrated: {
    label: 'Değerlendirilmedi',
    icon: <ClockIcon className="w-4 h-4" />,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50 border-slate-200'
  },
};

const sourceLabels: Record<string, string> = {
  Website: 'Web Sitesi',
  Referral: 'Referans',
  SocialMedia: 'Sosyal Medya',
  Advertisement: 'Reklam',
  Email: 'E-posta',
  ColdCall: 'Soğuk Arama',
  Event: 'Etkinlik',
  Other: 'Diğer',
};

const industryLabels: Record<string, string> = {
  Technology: 'Teknoloji',
  Finance: 'Finans',
  Healthcare: 'Sağlık',
  Manufacturing: 'Üretim',
  Retail: 'Perakende',
  Education: 'Eğitim',
  RealEstate: 'Gayrimenkul',
  Transportation: 'Taşımacılık',
  Other: 'Diğer',
};

const activityTypeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  Call: { icon: <PhoneIcon className="w-4 h-4" />, color: 'text-blue-500' },
  Email: { icon: <EnvelopeIcon className="w-4 h-4" />, color: 'text-green-500' },
  Meeting: { icon: <UserGroupIcon className="w-4 h-4" />, color: 'text-purple-500' },
  Task: { icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-orange-500' },
  Note: { icon: <PencilIcon className="w-4 h-4" />, color: 'text-slate-500' },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [convertModalOpen, setConvertModalOpen] = useState(false);

  // Data fetching
  const { data: lead, isLoading, error, refetch } = useLead(leadId);
  const { data: activitiesData, isLoading: activitiesLoading } = useLeadActivities(leadId);

  // Mutations
  const convertToCustomer = useConvertLead();
  const qualifyLead = useQualifyLead();
  const disqualifyLead = useDisqualifyLead();

  // Handlers
  const handleConvertToCustomer = async () => {
    try {
      await convertToCustomer.mutateAsync({
        leadId,
        customerData: {
          createAccount: true,
        },
      });
      message.success('Lead başarıyla müşteriye dönüştürüldü');
      setConvertModalOpen(false);
      router.push('/crm/customers');
    } catch (error) {
      message.error('Dönüştürme sırasında bir hata oluştu');
    }
  };

  const handleQualify = async () => {
    try {
      await qualifyLead.mutateAsync({ id: leadId, notes: 'Qualified as Hot lead' });
      message.success('Lead nitelikli olarak işaretlendi');
      refetch();
    } catch (error) {
      message.error('İşlem sırasında bir hata oluştu');
    }
  };

  const handleDisqualify = async () => {
    try {
      await disqualifyLead.mutateAsync({ id: leadId, reason: 'Manual disqualification' });
      message.success('Lead niteliksiz olarak işaretlendi');
      refetch();
    } catch (error) {
      message.error('İşlem sırasında bir hata oluştu');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !lead) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Potansiyel müşteri bulunamadı" />
      </div>
    );
  }

  const statusInfo = statusConfig[lead.status] || statusConfig.New;
  const ratingInfo = ratingConfig[lead.rating] || ratingConfig.Unrated;
  const fullName = lead.fullName || `${lead.firstName} ${lead.lastName}`;
  const activities = activitiesData || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══════════════════════════════════════════════════════════════
          STICKY HEADER
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/crm/leads')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                {lead.firstName?.charAt(0)}{lead.lastName?.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{fullName}</h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                  {/* Rating Badge */}
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${ratingInfo.bgColor} ${ratingInfo.color}`}>
                    {ratingInfo.icon}
                    {ratingInfo.label}
                  </div>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {lead.companyName || lead.email}
                  {lead.jobTitle && <span className="text-slate-400"> · {lead.jobTitle}</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Qualify/Disqualify */}
            {lead.status !== 'Converted' && lead.status !== 'Qualified' && (
              <button
                onClick={handleQualify}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Nitelikli
              </button>
            )}
            {lead.status !== 'Converted' && lead.status !== 'Unqualified' && (
              <button
                onClick={handleDisqualify}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                Niteliksiz
              </button>
            )}
            {/* Convert to Customer */}
            {lead.status === 'Qualified' && !lead.isConverted && (
              <button
                onClick={() => setConvertModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <UserPlusIcon className="w-4 h-4" />
                Müşteriye Dönüştür
              </button>
            )}
            {/* Edit */}
            <button
              onClick={() => router.push(`/crm/leads/${lead.id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Düzenle
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="lead-detail-tabs"
          items={[
            {
              key: 'overview',
              label: 'Genel Bakış',
              children: (
                <div className="grid grid-cols-12 gap-6 mt-4">
                  {/* ─────────────── MAIN INFO CARDS ─────────────── */}
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Contact Information */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                        İletişim Bilgileri
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <InfoItem label="Ad Soyad" value={fullName} />
                        <InfoItem
                          label="E-posta"
                          value={lead.email}
                          href={`mailto:${lead.email}`}
                          isLink
                        />
                        <InfoItem
                          label="Telefon"
                          value={lead.phone}
                          href={`tel:${lead.phone}`}
                          isLink
                        />
                        <InfoItem
                          label="Cep Telefonu"
                          value={lead.mobilePhone}
                          href={`tel:${lead.mobilePhone}`}
                          isLink
                        />
                        <InfoItem
                          label="Web Sitesi"
                          value={lead.website}
                          href={lead.website?.startsWith('http') ? lead.website : `https://${lead.website}`}
                          isLink
                          external
                        />
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BuildingOffice2Icon className="w-5 h-5 text-slate-400" />
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                          Firma Bilgileri
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <InfoItem label="Firma Adı" value={lead.companyName} />
                        <InfoItem label="Pozisyon" value={lead.jobTitle} />
                        <InfoItem label="Sektör" value={industryLabels[lead.industry || ''] || lead.industry} />
                        <InfoItem
                          label="Yıllık Gelir"
                          value={lead.annualRevenue ? `₺${lead.annualRevenue.toLocaleString('tr-TR')}` : undefined}
                        />
                        <InfoItem
                          label="Çalışan Sayısı"
                          value={lead.numberOfEmployees?.toString()}
                        />
                      </div>
                    </div>

                    {/* Address Information */}
                    {(lead.address || lead.city || lead.country) && (
                      <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <MapPinIcon className="w-5 h-5 text-slate-400" />
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                            Adres Bilgileri
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <InfoItem label="Adres" value={lead.address} className="col-span-2" />
                          <InfoItem label="Şehir" value={lead.city} />
                          <InfoItem label="İlçe" value={lead.state} />
                          <InfoItem label="Ülke" value={lead.country} />
                          <InfoItem label="Posta Kodu" value={lead.postalCode} />
                        </div>
                      </div>
                    )}

                    {/* Description / Notes */}
                    {lead.description && (
                      <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                          Notlar
                        </h3>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.description}</p>
                      </div>
                    )}
                  </div>

                  {/* ─────────────── SIDEBAR ─────────────── */}
                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Score Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Lead Skoru
                      </h3>
                      <div className="flex flex-col items-center justify-center py-4">
                        <div
                          className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                            (lead.score || 0) >= 70
                              ? 'bg-emerald-100 text-emerald-600'
                              : (lead.score || 0) >= 40
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {lead.score || 0}
                        </div>
                        <p className="text-sm font-medium text-slate-700 mt-3">
                          {(lead.score || 0) >= 70 ? 'Yüksek Potansiyel' : (lead.score || 0) >= 40 ? 'Orta Potansiyel' : 'Düşük Potansiyel'}
                        </p>
                        <Progress
                          percent={lead.score || 0}
                          showInfo={false}
                          strokeColor={
                            (lead.score || 0) >= 70 ? '#10b981' : (lead.score || 0) >= 40 ? '#f59e0b' : '#ef4444'
                          }
                          className="w-full mt-4"
                        />
                      </div>
                    </div>

                    {/* Lead Info Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Lead Bilgileri
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Kaynak</span>
                          <Tag color="blue">{sourceLabels[lead.source || ''] || lead.source || '-'}</Tag>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Durum</span>
                          <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Değerlendirme</span>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${ratingInfo.bgColor} ${ratingInfo.color}`}>
                            {ratingInfo.icon}
                            {ratingInfo.label}
                          </div>
                        </div>
                        {lead.assignedToName && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Atanan Kişi</span>
                            <span className="text-sm font-medium text-slate-900">{lead.assignedToName}</span>
                          </div>
                        )}
                        <div className="pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Oluşturulma</span>
                            <span className="font-medium text-slate-900">
                              {dayjs(lead.createdAt).format('DD MMM YYYY')}
                            </span>
                          </div>
                          {lead.updatedAt && (
                            <div className="flex items-center justify-between text-sm mt-2">
                              <span className="text-slate-500">Güncelleme</span>
                              <span className="font-medium text-slate-900">
                                {dayjs(lead.updatedAt).fromNow()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Converted Info */}
                    {lead.isConverted && lead.convertedDate && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                          <h3 className="text-sm font-semibold text-purple-900 m-0">
                            Müşteriye Dönüştürüldü
                          </h3>
                        </div>
                        <p className="text-sm text-purple-700">
                          {dayjs(lead.convertedDate).format('DD MMMM YYYY')} tarihinde dönüştürüldü
                        </p>
                        {lead.convertedToCustomerId && (
                          <button
                            onClick={() => router.push(`/crm/customers/${lead.convertedToCustomerId}`)}
                            className="mt-3 text-sm font-medium text-purple-700 hover:text-purple-900 underline"
                          >
                            Müşteriyi Görüntüle →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'activities',
              label: 'Aktiviteler',
              children: (
                <div className="mt-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                      Aktivite Geçmişi
                    </h3>
                    {activitiesLoading ? (
                      <div className="flex justify-center py-8">
                        <Spinner size="md" />
                      </div>
                    ) : activities.length === 0 ? (
                      <Empty
                        description="Henüz aktivite bulunmuyor"
                        className="py-8"
                      />
                    ) : (
                      <Timeline
                        items={activities.map((activity: any) => {
                          const config = activityTypeConfig[activity.type] || activityTypeConfig.Note;
                          return {
                            dot: (
                              <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center ${config.color}`}>
                                {config.icon}
                              </div>
                            ),
                            children: (
                              <div className="pb-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-slate-900">{activity.subject}</span>
                                  <span className="text-xs text-slate-400">
                                    {dayjs(activity.activityDate || activity.createdAt).fromNow()}
                                  </span>
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-slate-600">{activity.description}</p>
                                )}
                              </div>
                            ),
                          };
                        })}
                      />
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CONVERT MODAL - Custom styled modal
      ═══════════════════════════════════════════════════════════════ */}
      <Modal
        open={convertModalOpen}
        onCancel={() => setConvertModalOpen(false)}
        footer={null}
        closable={false}
        centered
        width={480}
        className="convert-lead-modal"
        styles={{
          content: {
            padding: 0,
            borderRadius: '16px',
            overflow: 'hidden',
          },
          mask: {
            backdropFilter: 'blur(4px)',
            background: 'rgba(15, 23, 42, 0.4)',
          },
        }}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <UserPlusIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 m-0">
                Müşteriye Dönüştür
              </h3>
              <p className="text-sm text-slate-500 m-0 mt-0.5">
                Lead bilgileri yeni müşteri kaydına aktarılacak
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5">
          {/* Lead Preview Card */}
          <div className="bg-slate-50 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {lead.firstName?.charAt(0)}{lead.lastName?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 m-0">{fullName}</p>
                {lead.companyName && (
                  <p className="text-sm text-slate-500 m-0">{lead.companyName}</p>
                )}
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm">
                <EnvelopeIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <PhoneIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">{lead.phone}</span>
                </div>
              )}
              {lead.industry && (
                <div className="flex items-center gap-3 text-sm">
                  <BuildingOffice2Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">{industryLabels[lead.industry] || lead.industry}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircleIcon className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-sm text-blue-700">
              <p className="font-medium m-0">Dönüştürme sonrası:</p>
              <ul className="mt-1.5 space-y-1 list-disc list-inside text-blue-600">
                <li>Yeni müşteri kaydı oluşturulacak</li>
                <li>Lead bilgileri müşteriye aktarılacak</li>
                <li>Lead durumu "Dönüştürüldü" olarak güncellenecek</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={() => setConvertModalOpen(false)}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleConvertToCustomer}
            disabled={convertToCustomer.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {convertToCustomer.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Dönüştürülüyor...
              </>
            ) : (
              <>
                <UserPlusIcon className="w-4 h-4" />
                Müşteriye Dönüştür
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface InfoItemProps {
  label: string;
  value?: string | null;
  href?: string;
  isLink?: boolean;
  external?: boolean;
  className?: string;
}

function InfoItem({ label, value, href, isLink, external, className }: InfoItemProps) {
  return (
    <div className={className}>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {value ? (
        isLink && href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-slate-900">{value}</p>
        )
      ) : (
        <p className="text-sm text-slate-400">-</p>
      )}
    </div>
  );
}
