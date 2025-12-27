'use client';

/**
 * Sales Team Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Empty, Tag, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PencilIcon,
  StarIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useSalesTeam } from '@/lib/api/hooks/useCRM';
import { SalesTeamRole } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const roleLabels: Record<SalesTeamRole, { label: string; color: string }> = {
  [SalesTeamRole.Member]: { label: 'Üye', color: 'default' },
  [SalesTeamRole.Senior]: { label: 'Kıdemli', color: 'blue' },
  [SalesTeamRole.Leader]: { label: 'Lider', color: 'cyan' },
  [SalesTeamRole.Manager]: { label: 'Yönetici', color: 'purple' },
  [SalesTeamRole.Director]: { label: 'Direktör', color: 'gold' },
};

export default function SalesTeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;

  const { data: team, isLoading, error } = useSalesTeam(teamId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Satış ekibi bulunamadı" />
      </div>
    );
  }

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
              onClick={() => router.push('/crm/sales-teams')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  team.isActive ? 'bg-indigo-100' : 'bg-slate-100'
                }`}
              >
                <UsersIcon
                  className={`w-5 h-5 ${team.isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{team.name}</h1>
                  <Tag
                    icon={team.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                    color={team.isActive ? 'success' : 'default'}
                  >
                    {team.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {team.code || 'Kod belirtilmemiş'} • {team.activeMemberCount || 0} Aktif Üye
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/sales-teams/${team.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
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
                Ekip Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ekip Adı</p>
                  <p className="text-sm font-medium text-slate-900">{team.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ekip Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{team.code || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={team.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                    color={team.isActive ? 'success' : 'default'}
                  >
                    {team.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Aktif Üye</p>
                  <p className="text-sm font-medium text-slate-900">{team.activeMemberCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Toplam Üye</p>
                  <p className="text-sm font-medium text-slate-900">{team.totalMemberCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturma Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {team.createdAt ? dayjs(team.createdAt).format('DD/MM/YYYY') : '-'}
                    </span>
                  </div>
                </div>
                {team.teamEmail && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Ekip E-postası</p>
                    <a
                      href={`mailto:${team.teamEmail}`}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <EnvelopeIcon className="w-3 h-3" />
                      {team.teamEmail}
                    </a>
                  </div>
                )}
                {team.communicationChannel && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">İletişim Kanalı</p>
                    <p className="text-sm font-medium text-slate-900">{team.communicationChannel}</p>
                  </div>
                )}
              </div>

              {team.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{team.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Target & Leader Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Hedef & Liderlik
              </p>

              {team.teamLeaderName && (
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <StarIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{team.teamLeaderName}</p>
                    <p className="text-xs text-slate-500">Ekip Lideri</p>
                  </div>
                </div>
              )}

              {team.salesTarget !== undefined && team.salesTarget > 0 && (
                <div className="p-4 bg-emerald-50 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Satış Hedefi</span>
                    {team.targetPeriod && (
                      <Tag color="green">{team.targetPeriod}</Tag>
                    )}
                  </div>
                  <p className="text-xl font-semibold text-emerald-600">
                    {team.salesTarget.toLocaleString('tr-TR')} {team.currency || 'TRY'}
                  </p>
                </div>
              )}

              {team.territoryNames && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GlobeAltIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">Atanan Bölgeler</span>
                  </div>
                  <p className="text-sm text-slate-700">{team.territoryNames}</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Members Card */}
          {team.members && team.members.length > 0 && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                      Ekip Üyeleri ({team.members.length})
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.members.map((member) => {
                    const roleInfo = roleLabels[member.role] || { label: member.role, color: 'default' };
                    return (
                      <div
                        key={member.id}
                        className={`p-4 rounded-lg border ${
                          member.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              member.isActive ? 'bg-indigo-100' : 'bg-slate-200'
                            }`}
                          >
                            <UserIcon
                              className={`w-5 h-5 ${member.isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {member.userName || 'İsimsiz'}
                            </p>
                            <Tag color={roleInfo.color} className="text-xs">
                              {roleInfo.label}
                            </Tag>
                          </div>
                          {!member.isActive && (
                            <Tag color="default" className="text-xs">Pasif</Tag>
                          )}
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Katılım Tarihi</span>
                            <span className="font-medium">
                              {member.joinedDate ? dayjs(member.joinedDate).format('DD/MM/YYYY') : '-'}
                            </span>
                          </div>
                          {member.individualTarget !== undefined && member.individualTarget > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Bireysel Hedef</span>
                              <span className="font-medium text-emerald-600">
                                {member.individualTarget.toLocaleString('tr-TR')}
                              </span>
                            </div>
                          )}
                          {member.commissionRate !== undefined && member.commissionRate > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Komisyon Oranı</span>
                              <span className="font-medium">%{member.commissionRate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Parent Team Card */}
          {team.parentTeamId && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Üst Ekip
                </p>
                <div
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => router.push(`/crm/sales-teams/${team.parentTeamId}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {team.parentTeamName || 'Üst Ekip'}
                    </p>
                    <p className="text-xs text-slate-500">Üst ekip bağlantısı</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
